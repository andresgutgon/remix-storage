import os from "os"
import PQueue from "p-queue"
import { buildStream, Body } from "../lib/buildStream"
import {
  buildBusboy,
  BusboyConfig,
  DEFAULT_BUSBOY_CONFIG
} from "../lib/buildBusboy"
import { processValue, processResult } from "../lib/processResult"
import { parseFile } from "../lib/parseFile"
import { FileShape } from "../lib/fileShape"
import { AbortError, handleAbortError } from "../lib/handleAbortError"

import type {
  BodyParserOptions,
  ParsedData,
  ParseResult,
  ParseParams
} from "./types"

// We want to enqueu one by one the file and fields to be processed.
// If one of them fails we stop processing the rest
const PROCESS_CONCURRENCY = 1

export class BodyParser {
  private directory: string
  private busboyConfig: BusboyConfig

  constructor({ directory, busboyConfig }: BodyParserOptions = {}) {
    this.directory = directory || os.tmpdir()
    this.busboyConfig = busboyConfig || DEFAULT_BUSBOY_CONFIG
  }

  async parse<T>({ request, schema }: ParseParams<T>): Promise<ParseResult<T>> {
    const stream = buildStream(request.body as unknown as Body)
    // Prevent already piped data in busboy's internal buffer from firing more events
    // We need to prevent the previously piped data from causing any more 'field' or 'file'
    // event handlers to be fired
    // More info: https://bytearcher.com/articles/terminate-busboy/
    const queue = new PQueue({ concurrency: PROCESS_CONCURRENCY })
    const busboy = buildBusboy({
      headers: { contentType: request.headers.get("Content-Type") },
      config: this.busboyConfig
    })
    return new Promise<ParseResult<T>>((resolve) => {
      let result: ParseResult<T>
      let aborted = false
      const files: ParsedData<T> = {}
      const fields: ParsedData<T> = {}

      async function abort(error: AbortError) {
        if (aborted) return
        aborted = true

        const abortError = handleAbortError({
          fields,
          files,
          error
        })

        result = await processResult({
          fields: abortError.fields,
          files: abortError.files,
          formErrors: abortError.formErrors,
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
          const safeName = name as keyof T
          const prevValue = fields[safeName] as string | string[]
          fields[safeName] = processValue(prevValue, value)
        })
      })

      busboy.on(
        "file",
        (name, filestream, { filename, encoding, mimeType }) => {
          enqueuFn(async () => {
            // Server fileSize limit configured by Busboy
            const safeName = name as keyof T
            const validator = schema.shape[safeName]
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const maxSize = validator?.maxSize
            try {
              const file = await parseFile({
                maxSize,
                serverMaxSize: this.busboyConfig.limits?.fileSize,
                directory: this.directory,
                name,
                filestream,
                filename,
                encoding,
                mimeType
              })
              const prevValue = files[safeName] as FileShape | FileShape[]
              files[safeName] = processValue(prevValue, file)
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
            schema,
            fields,
            files,
            formErrors: []
          })
          resolve(result)
        })
      })

      // Start the parsing
      stream.pipe(busboy)
    })
  }
}
