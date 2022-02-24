import { Transform } from "stream"
import type { TransformCallback } from "stream"
import { File } from "@web-std/file"

import { UploadHandlerArgs } from "../types"

class BufferStream extends Transform {
  public data: any[]
  constructor() {
    super()
    this.data = []
  }
  _transform(chunk: any, _: BufferEncoding, callback: TransformCallback) {
    this.data.push(chunk)
    callback()
  }
}

export async function fileParser({
  stream,
  filename,
  mimetype,
}: UploadHandlerArgs): Promise<File> {
  const bufferStream = new BufferStream()
  await new Promise<void>((resolve, reject) => {
    let aborted = false
    async function abort(error: Error) {
      if (aborted) return
      aborted = true

      stream.unpipe()
      stream.removeAllListeners()
      bufferStream.removeAllListeners()

      reject(error)
    }

    stream.on("error", abort)
    bufferStream.on("error", abort)
    bufferStream.on("finish", resolve)

    stream.pipe(bufferStream)
  })

  return new File(bufferStream.data, filename, { type: mimetype })
}
