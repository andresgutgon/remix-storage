import z from "zod"

// FIXME: Internal has to be removed
// When this PR is merged:
// https://github.com/colinhacks/zod/pull/1017
import { file as zodFile, ZodFile as ZodFileInternal } from "./internal/file"

import { FileShape } from "../lib/fileShape"
export type RawCreateParams =
  | {
      errorMap?: z.ZodErrorMap
      invalid_type_error?: string
      required_error?: string
      description?: string
    }
  | undefined

export type ZodFile = ZodFileInternal<typeof FileShape>
export function file(params?: RawCreateParams) {
  return zodFile(params, FileShape)
}
