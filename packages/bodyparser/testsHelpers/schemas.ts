import express from "express"
import z from "zod"

import { FileShape } from "../src/lib/fileShape"
import { errorMap } from "./parserValidationsErrorMap"
import { Schema } from "../src/index"

export const MIN_SIZE_FILE = 1807
export const MAX_SIZE_FILE = 163961

const defaultSchema = z.object({
  field_one: z.string().max(20),
  field_two: z.string().min(3)
})
export const schemas = {
  noSchema: "noSchema",
  default: defaultSchema,
  fieldAsFile: defaultSchema.extend({
    field_two: z.file({}, FileShape)
  }),
  customError: defaultSchema.extend({
    field_two: z.file({ errorMap }, FileShape)
  }),
  simpleFile: defaultSchema.extend({
    field_one: z.file({}, FileShape)
  }),
  simpleFieldOptional: defaultSchema.extend({
    field_one: z.string().optional()
  }),
  simpleFileOptional: defaultSchema.extend({
    field_one: z.file({}, FileShape).optional()
  }),
  mimeTypeValidation: defaultSchema.extend({
    field_one: z.file({}, FileShape).type(["image/png", "application/pdf"])
  }),
  mimeTypeCustomValidation: defaultSchema.extend({
    field_one: z
      .file({ errorMap }, FileShape)
      .type(["image/png", "application/pdf"])
  }),
  maxSizeValidation: defaultSchema.extend({
    field_one: z.file({}, FileShape).max(MAX_SIZE_FILE)
  }),
  maxSizeValidationTwoFiles: defaultSchema.extend({
    field_one: z.file({}, FileShape).max(MAX_SIZE_FILE),
    field_two: z.file({}, FileShape).max(MAX_SIZE_FILE),
    field_tree: z.preprocess((val) => Number(val), z.number())
  }),
  minSizeValidation: defaultSchema.extend({
    field_one: z.file({}, FileShape).min(MIN_SIZE_FILE)
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
  if (schemaKey === "noSchema") return undefined

  return schemas[schemaKey] as unknown as SchemaType
}
