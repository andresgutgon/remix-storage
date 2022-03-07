import { readFileSync } from "fs"
import mime from "mime-types"
import { resolve, basename, extname } from "path"
import { File } from "@web-std/file"

class LocalFileData {
  private path: string

  constructor(path: string) {
    this.path = path as string
  }
  get arrayBuffer() {
    const arrayBuffer = this.buffer.slice(
      this.buffer.byteOffset,
      this.buffer.byteOffset + this.buffer.byteLength
    )
    return [arrayBuffer]
  }

  private get buffer() {
    return readFileSync(this.path)
  }

  public get name() {
    return basename(this.path)
  }
  public get type() {
    const ext = extname(this.path)
    const type = mime.lookup(ext)
    return type || undefined
  }
}

// `forcedType` is the way of telling the mimeType of a file without extension. This way then in tests the extension is present
export function fileFromDisk(name: string, forcedType?: string) {
  const path = resolve(`./fixtures/files/${name}`)
  const local = new LocalFileData(path)
  const type = forcedType || local.type

  return new File(local.arrayBuffer, local.name, { type })
}
