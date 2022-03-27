import deburr from "lodash/deburr"
import slugify from "slugify"
import { resolve as resolvePath } from "path"
import { makeUniqueFilePath } from "./makeUnique"

// Input: "Ratón Pequeño.jpeg"
// Clean: "raton-pequeno.jpeg"
export function cleanName(filename = ""): string {
  const slug = slugify(filename)
  const noAccent = deburr(slug)
  return noAccent.toLowerCase()
}

type ReturnType = {
  filepath: string
  fileName: string
}
export async function makeFile(
  tmpdir: string,
  filename: string,
  mimeType: string
): Promise<ReturnType> {
  const fileName = cleanName(filename)

  const filepath = resolvePath(tmpdir, fileName)
  return makeUniqueFilePath({ filepath, fileName, mimeType })
}
