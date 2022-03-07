/* eslint-disable  @typescript-eslint/no-explicit-any */
import z from "zod"
import { FormData, Request as NodeRequest, RequestInit } from "@remix-run/node"

import { FileShape } from "../src/lib/fileShape"

import { fileFromDisk } from "./webFileFromDisk"

type MockRequestData = {
  form: (data?: unknown) => FormData | URLSearchParams
  schema?: z.input<z.ZodAny>
}
export function buildRequest(form?: FormData | URLSearchParams): Request {
  return new NodeRequest("http://test.com/upload", {
    method: "post",
    body: form as any
  } as RequestInit) as unknown as Request
}

// Fixtures
const FieldsSchema = z.object({
  field_one: z.string().max(20),
  field_two: z.string().min(3)
})
type FieldsType = z.infer<typeof FieldsSchema>
type FieldsKey = keyof FieldsType
export const fields: MockRequestData = {
  schema: FieldsSchema,
  form: (data?: unknown) => {
    const defaultData: FieldsType = {
      field_one: "field one content",
      field_two: "field two content"
    }
    const fields = {
      ...defaultData,
      ...(data ? (data as FieldsType) : null)
    }
    const params: string[][] = []
    Object.keys(fields).map((key: string) => {
      return params.push([key, fields[key as FieldsKey]])
    })
    return new URLSearchParams(params)
  }
}

const FieldsWithSmallFileSchema = FieldsSchema.extend({
  mouse_file: z.file({}, FileShape)
})

export const fieldsAndSmallFile: MockRequestData = {
  schema: FieldsWithSmallFileSchema,
  form: () => {
    const form = new FormData()
    form.append("field_one", "field one content")
    form.append("field_two", "field two content")
    const mouseFile = fileFromDisk("Ratón pequeño.jpeg")
    form.append("mouse_file", mouseFile)
    return form
  }
}

export const fieldsAndSmallFileWithoutExtension: MockRequestData = {
  schema: FieldsWithSmallFileSchema,
  form: () => {
    const form = new FormData()
    form.append("field_one", "field one content")
    form.append("field_two", "field two content")
    const mouseFile = fileFromDisk("Ratón pequeño", "image/jpeg")
    form.append("mouse_file", mouseFile)
    return form
  }
}

const elephantSchema = z.object({
  elephant_file: z.file({}, FileShape)
})
export const elephant: MockRequestData = {
  schema: elephantSchema,
  form: () => {
    const form = new FormData()
    const file = fileFromDisk("elephant.jpg")
    form.set("elephant_file", file)
    return form
  }
}

const animalsSchema = z.object({
  mouse: z.file({}, FileShape),
  elephant_file: z.file({}, FileShape).max(327922 / 2)
})
export const animals: MockRequestData = {
  schema: animalsSchema,
  form: () => {
    const form = new FormData()
    const mouse = fileFromDisk("Ratón pequeño.jpeg")
    const file = fileFromDisk("elephant.jpg")
    form.set("elephant_file", file)
    form.set("mouse", mouse)
    return form
  }
}

export const fixtures: Record<string, MockRequestData> = {
  fields,
  fieldsAndSmallFile,
  fieldsAndSmallFileWithoutExtension,
  animals,
  elephant
}
