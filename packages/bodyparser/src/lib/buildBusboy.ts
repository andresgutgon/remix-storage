import invariant from "tiny-invariant"
import Busboy from "busboy"

const DEFAULT_HIGH_WATER_MARK = 2 * 1024 * 1024

export const DEFAULT_BUSBOY_CONFIG = {
  highWaterMark: DEFAULT_HIGH_WATER_MARK
}
export type BusboyConfig = Pick<Busboy.BusboyConfig, "highWaterMark">
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
    headers: {
      "content-type": contentType
    }
  })
}
