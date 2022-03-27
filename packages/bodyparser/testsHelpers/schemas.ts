import express from "express"
import z from "zod"

import { file } from "../src/zod-addons/file"
import { Schema } from "../src/parser/types"

import { errorMap } from "./parserValidationsErrorMap"

export const MIN_SIZE_FILE = 1807
export const MAX_SIZE_FILE = 163961

const defaultSchema = z.object({
  field_one: z.string().max(20),
  field_two: z.string().min(3)
})
export const schemas = {
  default: defaultSchema,
  passwordConfirmation: z
    .object({
      password: z.string().min(8),
      confirm: z.string().min(8)
    })
    .refine((data) => data.password === data.confirm, {
      message: "Passwords don't match"
    }),
  fieldAsArray: defaultSchema.extend({
    field_one: z.array(z.string())
  }),
  fieldAsArrayMinThreeElements: defaultSchema.extend({
    field_one: z
      .array(z.preprocess((v: unknown) => Number(v), z.number()))
      .min(3)
  }),
  fieldAsFile: defaultSchema.extend({
    field_two: file()
  }),
  customError: defaultSchema.extend({
    field_two: file({ errorMap })
  }),
  simpleFile: defaultSchema.extend({
    field_one: file()
  }),
  multiplesFiles: defaultSchema.extend({
    field_one: z.array(file())
  }),
  multiplesFilesMinSize: defaultSchema.extend({
    field_one: z.array(file().min(MIN_SIZE_FILE))
  }),
  simpleFieldOptional: defaultSchema.extend({
    field_one: z.string().optional()
  }),
  simpleFileOptional: defaultSchema.extend({
    field_one: file().optional()
  }),
  mimeTypeValidation: defaultSchema.extend({
    field_one: file().type(["image/png", "application/pdf"])
  }),
  mimeTypeCustomValidation: defaultSchema.extend({
    field_one: file({ errorMap }).type(["image/png", "application/pdf"])
  }),
  maxSizeValidation: defaultSchema.extend({
    field_one: file().max(MAX_SIZE_FILE)
  }),
  maxSizeValidationTwoFiles: defaultSchema.extend({
    field_one: file().max(MAX_SIZE_FILE),
    field_two: file().max(MAX_SIZE_FILE),
    field_tree: z.preprocess((val) => Number(val), z.number())
  }),
  minSizeValidation: defaultSchema.extend({
    field_one: file().min(MIN_SIZE_FILE)
  })
}

type SchemaKey = keyof typeof schemas
const rawKeys = Object.keys(schemas)
export const schemaKeys = rawKeys.reduce(
  (memo: Record<SchemaKey, SchemaKey> | null, key: string) => {
    const data = memo || ({} as Record<SchemaKey, SchemaKey>)
    data[key as SchemaKey] = key as SchemaKey
    return data
  },
  null
) as Record<SchemaKey, SchemaKey>

type DefaultSchema = z.TypeOf<typeof schemas.default>
type SchemaType = Schema<DefaultSchema>
export function getSchema(request: express.Request) {
  const query = request.query
  const schemaKey = (query.schema?.toString() || "default") as SchemaKey
  return schemas[schemaKey] as SchemaType
}
