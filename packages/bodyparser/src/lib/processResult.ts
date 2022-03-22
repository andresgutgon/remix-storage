import fs from "fs-extra"

import { FileShape } from "../lib/fileShape"
import { Schema } from "../index"

// Expected Data
type SingleData = null | string | number | undefined | FileShape
type ArrayData = string[] | number[] | FileShape[]

export type Data = SingleData | ArrayData

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
  schema: Schema<T> | undefined | null
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
    data: { ...empty.data, ...result.data },
    fieldErrors: { ...empty.fieldErrors, ...result.fieldErrors },
    formErrors: result.formErrors
  }
}

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
        const isFile = valueIsFile(value)

        if (!errors.fieldErrors[key]) {
          memo[key] = isFile ? null : value
        } else {
          memo[key] = null
        }

        removeFiles(value, isFile)

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
