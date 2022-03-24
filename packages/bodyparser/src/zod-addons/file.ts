import z from "zod"

// FIXME: Internal has to be removed
// When this PR is merged:
// https://github.com/colinhacks/zod/pull/1017
import { file as zodFile, ZodFile as ZodFileInternal } from "./internal/file"

export type RawCreateParams =
  | {
      errorMap?: z.ZodErrorMap
      invalid_type_error?: string
      required_error?: string
      description?: string
    }
  | undefined

export type ZodFile = ZodFileInternal
export const file = zodFile
