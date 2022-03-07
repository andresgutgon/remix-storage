import fs from "fs-extra"

import { FileShape } from "../lib/fileShape"
import { Schema } from "../index"

// Expected Data
type Data =
  | string
  | number
  | FileShape
  | string[]
  | number[]
  | boolean
  | null
  | undefined

export type ResultData = Record<string, Data>
type FieldErrors = Record<string, string[]>
type FormErrors = string[]
export interface ParseResult {
  success: boolean
  data: ResultData
  fieldErrors: FieldErrors
  formErrors: FormErrors
}

function completeMissingData<T>(
  result: ParseResult,
  schema: Schema<T> | undefined
): ParseResult {
  if (!schema) return result

  const empty = Object.keys(schema.shape).reduce(
    (memo: ParseResult, key: string) => {
      memo.data[key] = result.data[key] || null
      memo.fieldErrors[key] = result.fieldErrors[key] || []
      return memo
    },
    {
      success: true,
      data: {},
      fieldErrors: {},
      formErrors: []
    }
  )
  return {
    success: result.success,
    data: {
      ...empty.data,
      ...result.data
    },
    fieldErrors: {
      ...empty.fieldErrors,
      ...result.fieldErrors
    },
    formErrors: result.formErrors
  }
}

function removeFile(value: unknown, isFile: boolean) {
  if (!isFile) return

  const filepath = (value as FileShape).filepath as string
  // Ignore not existing files
  fs.removeSync(filepath)
}
const NO_ERRORS = { fieldErrors: {}, formErrors: [] }
type Props<T> = {
  fields: ResultData
  files: ResultData
  schema?: Schema<T> | null
}
async function combineFieldsAndFiles<T>({
  fields,
  files,
  schema
}: Props<T>): Promise<ParseResult> {
  const unsafeData = { ...fields, ...files }

  if (!schema) {
    return {
      success: true,
      data: unsafeData,
      ...NO_ERRORS
    }
  }

  const result = await schema.safeParseAsync(unsafeData)

  const errors = !result.success ? result.error.flatten?.() : NO_ERRORS

  let resultData = {}
  if (!result.success) {
    // Remove files when there is an error
    resultData = Object.keys(unsafeData).reduce(
      (memo: ResultData, key: string) => {
        const value = unsafeData[key]
        const isFile = value instanceof FileShape

        if (!errors.fieldErrors[key]) {
          memo[key] = isFile ? null : value
        } else {
          memo[key] = null
        }

        removeFile(value, isFile)

        return memo
      },
      {}
    )
  } else {
    resultData = result.data
  }
  return {
    success: result.success,
    data: resultData,
    fieldErrors: errors.fieldErrors || {},
    formErrors: errors.formErrors || []
  }
}

export async function processResult<T>(props: Props<T>): Promise<ParseResult> {
  const schema = props.schema

  const result = await combineFieldsAndFiles(props)

  return completeMissingData(result, schema)
}
