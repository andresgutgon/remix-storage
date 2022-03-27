import {
  ZodType,
  ZodIssueCode,
  ZodTypeDef,
  ParseInput,
  ParseReturnType,
  ZodErrorMap,
  ZodFirstPartyTypeKind,
  ZodIssue,
  IssueData,
  INVALID
} from "zod"

import { errorUtil } from "./helpers/errorUtil"
import { RawCreateParams } from "../file"

enum MyTypes {
  ZodFile = "ZodFile"
}
const Types = { ...ZodFirstPartyTypeKind, ...MyTypes }
type ITypes = ZodFirstPartyTypeKind | MyTypes
type ProcessedCreateParams = { errorMap?: ZodErrorMap; description?: string }

export const makeIssue = (params: {
  // eslint-disable-next-line
  data: any
  path: (string | number)[]
  errorMaps: ZodErrorMap[]
  issueData: IssueData
}): ZodIssue => {
  const { data, path, errorMaps, issueData } = params
  const fullPath = [...path, ...(issueData.path || [])]
  const fullIssue = {
    ...issueData,
    path: fullPath
  }

  let errorMessage = ""
  const maps = errorMaps
    .filter((m) => !!m)
    .slice()
    .reverse() as ZodErrorMap[]
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message
  }

  return {
    ...issueData,
    path: fullPath,
    message: issueData.message || errorMessage
  }
}
function processCreateParams(params: RawCreateParams): ProcessedCreateParams {
  if (!params) return {}
  const { errorMap, invalid_type_error, required_error, description } = params
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      "Can't use 'invalid' or 'required' in conjunction with custom error map."
    )
  }
  if (errorMap) return { errorMap: errorMap, description }
  const customMap: ZodErrorMap = (iss, ctx) => {
    if (iss.code !== "invalid_type") return { message: ctx.defaultError }
    if (typeof ctx.data === "undefined" && required_error)
      return { message: required_error }
    if (params.invalid_type_error) return { message: params.invalid_type_error }
    return { message: ctx.defaultError }
  }
  return { errorMap: customMap, description }
}

/////////////////////////////////////////
/////////////////////////////////////////
//////////                     //////////
//////////      ZodFile         //////////
//////////                     //////////
/////////////////////////////////////////
/////////////////////////////////////////

type ZodFileCheck =
  | { kind: "max"; value: number; message?: string }
  | { kind: "min"; value: number; message?: string }
  | { kind: "type"; value: string | string[]; message?: string }

export interface ZodFileDef extends ZodTypeDef {
  typeName: ITypes
  checks: ZodFileCheck[]
}

export interface IFile {
  get lastModified(): number
  get lastModifiedDate(): Date
  get name(): string
  get size(): number
  get type(): string
}

export class ZodFile extends ZodType<IFile, ZodFileDef> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { status, ctx } = this._processInputParams(input)

    const hasSize = !!input.data?.size
    const hasType = !!input.data?.type
    if (!hasSize || !hasType) {
      const issue = makeIssue({
        issueData: {
          code: ZodIssueCode.invalid_type,
          // eslint-disable-next-line
          expected: "file" as any,
          received: ctx.parsedType
        },
        data: ctx.data,
        path: ctx.path,
        errorMaps: [ctx.schemaErrorMap, ctx.common.contextualErrorMap].filter(
          (x) => !!x
        ) as ZodErrorMap[]
      })

      // eslint-disable-next-line
      // @ts-disable
      ctx.common.issues.push(issue as ZodIssue)

      return INVALID
    }

    for (const check of this._def.checks) {
      if (check.kind === "max") {
        if (ctx.data.size > check.value) {
          const issue = makeIssue({
            issueData: {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              // eslint-disable-next-line
              type: "file" as any,
              inclusive: true,
              message: check.message
            },
            data: ctx.data,
            path: ctx.path,
            errorMaps: [
              ctx.schemaErrorMap,
              ctx.common.contextualErrorMap
            ].filter((x) => !!x) as ZodErrorMap[]
          })

          // eslint-disable-next-line
          // @ts-disable
          ctx.common.issues.push(issue as ZodIssue)

          status.dirty()
        }
      } else if (check.kind === "min") {
        if (ctx.data.size < check.value) {
          const issue = makeIssue({
            issueData: {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              // eslint-disable-next-line
              type: "file" as any,
              inclusive: true,
              message: check.message
            },
            data: ctx.data,
            path: ctx.path,
            errorMaps: [
              ctx.schemaErrorMap,
              ctx.common.contextualErrorMap
            ].filter((x) => !!x) as ZodErrorMap[]
          })

          // eslint-disable-next-line
          // @ts-disable
          ctx.common.issues.push(issue as ZodIssue)
          status.dirty()
        }
      } else if (check.kind === "type") {
        const types = Array.isArray(check.value) ? check.value : [check.value]

        if (!types.includes(ctx.data.type)) {
          const issue = makeIssue({
            issueData: {
              // eslint-disable-next-line
              code: "invalid_file_type" as any,
              // eslint-disable-next-line
              expected: types as any,
              received: ctx.data.type,
              path: ctx.path,
              message: check.message
            },
            data: ctx.data,
            path: ctx.path,
            errorMaps: [
              ctx.schemaErrorMap,
              ctx.common.contextualErrorMap
            ].filter((x) => !!x) as ZodErrorMap[]
          })

          // eslint-disable-next-line
          // @ts-disable
          ctx.common.issues.push(issue as ZodIssue)

          status.dirty()
        }
      }
    }

    return {
      status: status.value,
      value: ctx.data
    }
  }

  _addCheck(check: ZodFileCheck) {
    return new ZodFile({
      ...this._def,
      checks: [...this._def.checks, check]
    })
  }

  max(maxSize: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "max",
      value: maxSize,
      ...errorUtil.errToObj(message)
    })
  }

  min(minSize: number, message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "min",
      value: minSize,
      ...errorUtil.errToObj(message)
    })
  }

  type(accept: string | string[], message?: errorUtil.ErrMessage) {
    return this._addCheck({
      kind: "type",
      value: accept,
      ...errorUtil.errToObj(message)
    })
  }

  get minSize() {
    let min: number | null = null
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value
      }
    }
    return min
  }

  get maxSize() {
    let max: number | null = null
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value
      }
    }
    return max
  }

  get allowedTypes() {
    const types: string[] = []
    for (const ch of this._def.checks) {
      if (ch.kind === "type") {
        const checkTypes = Array.isArray(ch.value) ? ch.value : [ch.value]

        checkTypes.forEach(
          (value) => !types.find((type) => type === value) && types.push(value)
        )
      }
    }
    return types
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static create = (params?: RawCreateParams): ZodFile => {
    return new ZodFile({
      typeName: Types.ZodFile,
      checks: [],
      ...processCreateParams(params)
    })
  }
}

const fileType = ZodFile.create

export { fileType as file }
