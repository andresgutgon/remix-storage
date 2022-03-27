import { Readable } from "stream"

export type Body = string | Buffer | Readable
export function buildStream(body: Body): Readable {
  if (typeof body !== "string" && !Buffer.isBuffer(body)) {
    return body
  }

  return Readable.from(body.toString())
}
