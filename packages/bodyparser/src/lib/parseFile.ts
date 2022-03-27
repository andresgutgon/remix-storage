import type { Readable } from "stream"
import { createWriteStream } from "fs"

import { rm, mkdir } from "fs/promises"
import { dirname } from "path"

import { makeFile } from "./files/makeFile"
import { Meter, MeterError } from "./files/meter"
import { FileShape } from "../lib/fileShape"
import { ServerFileSizeError } from "../lib/handleAbortError"

export class UnknownFileError extends Error {
  constructor(public field: string) {
    super()
  }
}

export type FileResult = {
  name: string
  success: boolean
  data: FileShape | null
  errors: string[]
}

export type Props = {
  maxSize: number | null | undefined
  serverMaxSize: number | undefined
  directory: string
  name: string
  filestream: Readable
  filename: string
  encoding: string
  mimeType: string
}
export async function parseFile({
  maxSize,
  serverMaxSize,
  directory,
  name,
  filestream,
  filename,
  mimeType
}: Props): Promise<FileShape> {
  const { filepath, fileName } = await makeFile(directory, filename, mimeType)
  const file = new FileShape(name, mimeType, 0)
  file.name = fileName
  file.filepath = filepath

  // Make the dir
  await mkdir(dirname(filepath), { recursive: true }).catch(() => null)

  const meter = new Meter(name, maxSize)
  try {
    await new Promise<void>((resolve, reject) => {
      const writeFileStream = createWriteStream(filepath)

      let aborted = false
      async function abort(error: Error) {
        if (aborted) return
        aborted = true

        filestream.unpipe()
        meter.unpipe()
        filestream.removeAllListeners()
        meter.removeAllListeners()
        writeFileStream.removeAllListeners()

        await rm(filepath, { force: true }).catch(() => null)
        reject(error)
      }

      filestream.on("error", abort)
      meter.on("error", abort)
      writeFileStream.on("error", abort)
      writeFileStream.on("finish", resolve)

      filestream.on("limit", async () => {
        await rm(filepath, { force: true }).catch(() => null)
        reject(new ServerFileSizeError(name, serverMaxSize as number))
      })

      filestream.pipe(meter).pipe(writeFileStream)
    })
  } catch (error: unknown) {
    if (error instanceof MeterError) {
      file.setSize(error.currentSize)
      throw file
    }

    if (error instanceof ServerFileSizeError) {
      throw new ServerFileSizeError(name, serverMaxSize as number)
    }

    // Better error Handling
    throw new UnknownFileError(name)
  }

  file.setSize(meter.bytes)

  return file
}
