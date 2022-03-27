import z from "zod"

import { FileShape } from "../lib/fileShape"
import type { BusboyConfig } from "../lib/buildBusboy"

// Expected Data
type SingleValue = null | string | number | undefined | FileShape
type ArrayValue = string[] | number[] | FileShape[]

export type Value = SingleValue | ArrayValue
export type ParsedData<T> = { [Key in keyof T]?: Value }

type SchemaOutput<
  T,
  TK extends { [K in keyof T]: z.ZodType<T[K]> } = {
    [K in keyof T]: z.ZodType<T[K]>
  }
> = {
  [k_1 in keyof z.objectUtil.addQuestionMarks<{
    [k in keyof TK]: TK[k]["_output"]
  }>]: z.objectUtil.addQuestionMarks<{
    [k in keyof TK]: TK[k]["_output"]
  }>[k_1]
}

type SchemaInput<
  T,
  TK extends { [K in keyof T]: z.ZodType<T[K]> } = {
    [K in keyof T]: z.ZodType<T[K]>
  }
> = {
  [k_3 in keyof z.objectUtil.addQuestionMarks<{
    [k_2 in keyof TK]: TK[k_2]["_input"]
  }>]: z.objectUtil.addQuestionMarks<{
    [k_2 in keyof TK]: TK[k_2]["_input"]
  }>[k_3]
}

export type ObjectSchema<
  T,
  TK extends { [K in keyof T]: z.ZodType<T[K]> } = {
    [K in keyof T]: z.ZodType<T[K]>
  }
> = z.ZodObject<TK, "strip", z.ZodTypeAny, SchemaOutput<T>, SchemaInput<T>>

export type EffectSchema<T> = z.ZodEffects<ObjectSchema<T>>
export type Schema<T> = ObjectSchema<T> | EffectSchema<T>

export type FlattenedErrors = {
  formErrors: string[]
  fieldErrors: {
    [k: string]: string[]
  }
}

export type ResultOK<T> = {
  success: true
  data: Schema<T>["_output"]
}
export type ResultError<T> = {
  success: false
  data: ParsedData<T>
  fieldErrors: { [key: string]: string[] }
  formErrors: string[]
}

export type ParseResult<T> = ResultOK<T> | ResultError<T>

export interface ParseParams<T> {
  request: Request
  schema: Schema<T>
  maxServerFileSize?: number
}

/**
 * Parse a Remix request but validating body with a Zod schema
 *
 * TODO: Set busboy.BusboyConfig.limits with defaults
 */
export type BodyParserOptions = {
  directory?: string
  busboyConfig?: BusboyConfig
}
