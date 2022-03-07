import os from "os"
import z from "zod"
import PQueue from "p-queue"
import { Request as NodeRequest } from "@remix-run/node"
import { buildStream, Body } from "./lib/buildStream"
import {
  buildBusboy,
  BusboyConfig,
  DEFAULT_BUSBOY_CONFIG
} from "./lib/buildBusboy"
import { ParseResult, ResultData, processResult } from "./lib/processResult"
import { parseFile } from "./lib/parseFile"
import { FileShape } from "./lib/fileShape"

export type Extends<T, U> = T extends U ? T : never
export type Schema<T> = z.ZodObject<Extends<T, z.ZodRawShape>>
export type ZodFile = z.ZodFile<typeof FileShape>

// We want to enqueu one by one the file and fields to be processed.
// If one of them fails we stop processing the rest
const PROCESS_CONCURRENCY = 1

/**
 * Parse a Remix request but validating body with a Zod schema
 *
 * TODO: Set busboy.BusboyConfig.limits with defaults
 */
export type Options = { directory?: string; busboyConfig?: BusboyConfig }
export interface ParseParams<T> {
  request: NodeRequest
  schema?: Schema<T>
}

export class BodyParser {
  private directory: string
  private busboyConfig: BusboyConfig

  constructor({ directory, busboyConfig }: Options = {}) {
    this.directory = directory || os.tmpdir()
    this.busboyConfig = busboyConfig || DEFAULT_BUSBOY_CONFIG
  }

  async parse<T>({ request, schema }: ParseParams<T>): Promise<ParseResult> {
    const stream = buildStream(request.body as unknown as Body)
    const queue = new PQueue({ concurrency: PROCESS_CONCURRENCY })
    const busboy = buildBusboy({
      headers: { contentType: request.headers.get("Content-Type") },
      config: this.busboyConfig
    })
    return new Promise<ParseResult>((resolve) => {
      let result: ParseResult
      let aborted = false
      const files: ResultData = {}
      const fields: ResultData = {}

      async function abort(error: Error | FileShape) {
        if (aborted) return
        aborted = true

        // FIXME: This has to be extracted
        // Here we're throwing a FileShape when the size of
        // the file is bigger than validation
        // This will be re-done when implementing @remix-storage/drive
        // Here is where we plug Disk, S3, Digital Ocean, GCC,...
        const fileError = error as FileShape
        files[fileError.fieldName as string] = fileError

        result = await processResult({
          fields,
          files,
          schema
        })
        resolve(result)

        stream.unpipe(busboy)
        stream.removeAllListeners()
        busboy.removeAllListeners()
        queue.pause()
      }

      async function enqueuFn(fn: () => Promise<void>) {
        queue.add(async () => {
          try {
            await fn()
          } catch (e) {
            abort(e as Error)
          }
        })
      }

      busboy.on("field", (name, value) => {
        enqueuFn(async () => {
          fields[name] = value
        })
      })

      busboy.on(
        "file",
        (name, filestream, { filename, encoding, mimeType }) => {
          enqueuFn(async () => {
            const validator = schema ? (schema.shape[name] as ZodFile) : null
            const maxSize = validator ? validator?.maxSize : undefined
            try {
              const file = await parseFile({
                maxSize,
                directory: this.directory,
                name,
                filestream,
                filename,
                encoding,
                mimeType
              })
              files[name] = file
            } finally {
              filestream.resume()
            }
          })
        }
      )

      stream.on("error", abort)
      busboy.on("error", abort)
      busboy.on("close", async () => {
        enqueuFn(async () => {
          result = await processResult({
            fields,
            files,
            schema
          })
          resolve(result)
        })
      })

      // Start the parsing
      stream.pipe(busboy)
    })
  }
}
