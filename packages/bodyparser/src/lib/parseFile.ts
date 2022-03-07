import type { Readable } from "stream"
import { createWriteStream } from "fs"

import { rm, mkdir } from "fs/promises"
import { dirname } from "path"

import { makeFile } from "./files/makeFile"
import { Meter, MeterError } from "./files/meter"
import { FileShape } from "../lib/fileShape"

class UnknownFileError extends Error {
  constructor(public field: string) {
    super()
  }
}
enum FileErrorType {
  size = "size",
  mimeType = "mimeType"
}
type FileErrorParams = {
  field: string
  errorType: FileErrorType
  size?: number
  mimeType?: string
}
export class FileError extends Error {
  public field: string
  public errorType: FileErrorType
  public size?: number | undefined
  public mimeType?: string | undefined
  constructor({ field, errorType, size, mimeType }: FileErrorParams) {
    super()
    this.field = field
    this.errorType = errorType
    this.size = size
    this.mimeType = mimeType
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
  directory: string
  name: string
  filestream: Readable
  filename: string
  encoding: string
  mimeType: string
}
export async function parseFile({
  maxSize,
  directory,
  name,
  filestream,
  filename,
  mimeType
}: Props): Promise<FileShape | undefined> {
  const { filepath, fileName } = await makeFile(directory, filename, mimeType)
  const file = new FileShape(name, mimeType, 0)
  file.name = fileName

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

      filestream.pipe(meter).pipe(writeFileStream)
    })
  } catch (error: unknown) {
    if (error instanceof MeterError) {
      file.setSize(error.currentSize)
      throw file
    }

    // Better error Handling
    throw new UnknownFileError(name)
  }

  file.filepath = filepath
  file.setSize(meter.bytes)

  return file
}
