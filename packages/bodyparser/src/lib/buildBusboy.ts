import invariant from "tiny-invariant"
import Busboy from "busboy"

const DEFAULT_HIGH_WATER_MARK_SIZE = 2 * 1024 * 1024
const MAX_FILE_SIZE = 1e7 // 10MB in bytes

export const DEFAULT_BUSBOY_CONFIG = {
  highWaterMark: DEFAULT_HIGH_WATER_MARK_SIZE,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}
export type BusboyConfig = Pick<Busboy.BusboyConfig, "highWaterMark" | "limits">
type Props = {
  headers: {
    contentType: string | null | undefined
  }
  config: BusboyConfig
}
export function buildBusboy({
  headers: { contentType },
  config
}: Props): Busboy.Busboy {
  invariant(contentType, "MIME type not provided in request")
  return Busboy({
    defParamCharset: "utf8",
    highWaterMark: config.highWaterMark,
    limits: {
      ...config.limits,
      fileSize: config.limits?.fileSize || DEFAULT_BUSBOY_CONFIG.limits.fileSize
    },
    headers: {
      "content-type": contentType
    }
  })
}
