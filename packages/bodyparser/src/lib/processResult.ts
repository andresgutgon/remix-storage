import fs from "fs-extra"

import { FileShape } from "../lib/fileShape"
import { customErrorMap as errorMap } from "../zod-addons/internal/ZodError"
import {
  Schema,
  FlattenedErrors,
  ParsedData,
  ParseResult,
  ObjectSchema,
  EffectSchema
} from "../parser/types"

function valueIsFile(value: unknown): boolean {
  if (!value) return false
  if (value instanceof FileShape) return true
  if (!Array.isArray(value)) return false
  return !!value.find((item) => item instanceof FileShape)
}

function removeFile(file: FileShape | undefined) {
  const filepath = file?.filepath as string
  if (!filepath) return

  // Ignore not existing files
  fs.removeSync(filepath)
}

function removeFiles(value: unknown | unknown[], isFile: boolean) {
  if (!isFile) return
  const files = Array.isArray(value) ? value : [value]

  files.forEach((file) => removeFile(file))
}

/**
 * Fields and Files can be a unique element or an
 * array of elements. A list of files or strings
 * this method takes care of handling this duality
 */
export function processValue<Thing>(
  prevValue: Thing | Thing[],
  newValue: Thing
): Thing | Thing[] {
  if (Array.isArray(prevValue)) {
    prevValue.push(newValue)
    return prevValue
  }

  if (prevValue) return [prevValue, newValue]

  return newValue
}

/**
 * By default `shape` is in `schema.shape` when the
 * schema passed is of type `z.object({})`. But when you refine
 * the result like this `z.object({}).refined(...)` is and ZodEffect. In this case the shape is inside `schema._def`
 */
export function getShape<T>(schema: Schema<T>) {
  const objectSchema = schema as ObjectSchema<T>
  const effectsSchema = schema as EffectSchema<T>

  return objectSchema.shape || effectsSchema._def.schema.shape
}

type Props<T> = {
  schema: Schema<T>
  fields: ParsedData<T>
  files: ParsedData<T>
  formErrors: string[]
}
export async function processResult<T>({
  schema,
  fields,
  files,
  formErrors
}: Props<T>): Promise<ParseResult<T>> {
  const allData = { ...fields, ...files }

  const result = await schema.safeParseAsync(allData, { errorMap })

  if (result.success && !formErrors.length) {
    // All good
    return {
      success: result.success,
      data: result.data
    }
  }

  const shape = getShape(schema)
  const schemaKeys = Object.entries(shape)
  const nullData = schemaKeys.reduce((acc, [key]) => {
    acc[key] = null
    return acc
  }, {} as { [key: string]: null })
  const emptyFieldErrors = schemaKeys.reduce((acc, [key]) => {
    acc[key] = []
    return acc
  }, {} as { [key: string]: [] })

  const errors: FlattenedErrors = !result.success
    ? result.error.flatten()
    : { formErrors: [], fieldErrors: {} }

  const dataKeys = Object.entries(allData)

  const data = dataKeys.reduce<ParsedData<T>>((memo, [key]) => {
    const safeKey = key as keyof T
    const value = allData[safeKey]
    const isFile = valueIsFile(value)

    if (!errors?.fieldErrors[key]) {
      memo[safeKey] = isFile ? null : value
    } else {
      memo[safeKey] = null
    }

    removeFiles(value, isFile)

    return memo
  }, {})

  return {
    success: false,
    data: {
      ...nullData,
      ...data
    },
    fieldErrors: {
      ...emptyFieldErrors,
      ...(errors?.fieldErrors || {})
    },
    formErrors: [...formErrors, ...(errors?.formErrors || [])]
  }
}
