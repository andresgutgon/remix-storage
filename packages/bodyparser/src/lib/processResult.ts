import fs from "fs-extra"

import { FileShape } from "../lib/fileShape"
import { customErrorMap as errorMap } from "../zod-addons/internal/ZodError"
import {
  Schema,
  FlattenedErrors,
  ParsedData,
  ParseResult
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

  const result = await schema.safeParseAsync(allData, {
    errorMap
  })

  if (result.success && !formErrors.length) {
    // All good
    return {
      success: result.success,
      data: result.data
    }
  }

  const schemaKeys = Object.entries(schema.shape)
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
  console.log("Data keys", dataKeys)

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
