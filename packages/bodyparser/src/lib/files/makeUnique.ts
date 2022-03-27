import mime, { extension } from "mime-types"
import { extname } from "path"
import { stat } from "fs/promises"
import { functions, functionsIn } from "lodash"

type Parts = {
  path: string
  name: string
  extension: string
}
function filePathParts(
  filepath: string,
  fileName: string,
  mimeType: string
): Parts {
  const hasExtension = !!extname(fileName)
  let extension = ""
  if (hasExtension) {
    extension = extname(fileName)
  } else {
    extension = mime.extension(mimeType) ? `.${mime.extension(mimeType)}` : ""
  }
  const pathNoExt = hasExtension
    ? filepath.slice(0, -extension.length)
    : filepath
  const name = hasExtension ? fileName.slice(0, -extension.length) : fileName
  const path = pathNoExt.slice(0, -name.length)

  return {
    path,
    name,
    extension
  }
}

function buildFileParts({ path, name, extension }: Parts): string {
  return `${path}${name}${extension}`
}

type ReturnType = {
  filepath: string
  fileName: string
}
type Props = {
  filepath: string
  fileName: string
  mimeType: string
}
export async function makeUniqueFilePath({
  filepath,
  fileName,
  mimeType
}: Props): Promise<ReturnType> {
  const parts = filePathParts(filepath, fileName, mimeType)
  let uniqueFilepath = buildFileParts(parts)
  let name = parts.name
  for (
    let i = 1;
    await stat(uniqueFilepath)
      .then(() => true)
      .catch(() => false);
    i++
  ) {
    const time = new Date().getTime().toString()
    name = `${time}-${parts.name}`
    uniqueFilepath = buildFileParts({ ...parts, name })
  }

  return {
    filepath: uniqueFilepath,
    fileName: `${name}${parts.extension}`
  }
}
