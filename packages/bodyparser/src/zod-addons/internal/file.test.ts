import { describe, expect, test } from "vitest"

import { FileShape } from "../../lib/fileShape"
import { customErrorMap as errorMap } from "./ZodError"
import * as z from "./file"
const DEFAULT_PARAMS = {
  filename: "file.png",
  type: "image/png",
  size: 10
}
type Params = {
  filename?: string
  type?: string
  size?: number
}
function createFile(params?: Params) {
  const args = {
    ...DEFAULT_PARAMS,
    ...(params || {})
  }
  const file = new FileShape("fieldName", args.type, args.size)
  file.name = args.filename
  return file
}
const file = z.file()
const max = z.file().max(4)
const min = z.file().min(2)
const type = z.file().types(["image/png"])
const multipleTypes = z.file().types(["image/png", "image/jpeg"])

const defaultFile = createFile()
test("passing validations", () => {
  file.parse(defaultFile)
  max.parse(createFile({ size: 3 }))
  min.parse(defaultFile)
  type.parse(defaultFile)
  multipleTypes.parse(defaultFile)
})

test("failing validations", () => {
  expect(() => file.parse(null)).toThrow()
  expect(() => max.parse(defaultFile)).toThrow()
  expect(() => min.parse(createFile({ size: 1 }))).toThrow()
  expect(() => type.parse(createFile({ type: "image/jpg" }))).toThrow()
  expect(() => multipleTypes.parse(createFile({ type: "image/jpg" }))).toThrow()
})

test("min max getters", () => {
  expect(z.file().min(5).minSize).toEqual(5)
  expect(z.file().min(5).min(10).minSize).toEqual(10)
  expect(z.file().max(5).maxSize).toEqual(5)
  expect(z.file().max(5).max(1).maxSize).toEqual(1)
})

test("type getter", () => {
  expect(z.file().types(["image/png"]).allowedTypes).toEqual(["image/png"])
  expect(
    z.file().types(["image/jpeg"]).types(["image/png"]).allowedTypes
  ).toEqual(["image/png"])
  expect(
    z.file().types(["image/png"]).types(["image/gif", "image/png"]).allowedTypes
  ).toEqual(["image/gif", "image/png"])
})

describe("error messages", () => {
  test("max error message", () => {
    const result = max.safeParse(defaultFile, { errorMap })
    const errors = !result.success ? result.error.flatten() : {}
    expect(errors).toEqual({
      fieldErrors: {},
      formErrors: ["The file is too big, maximum size allowed is: 4 bytes"]
    })
  })

  test("min error message", () => {
    const result = min.safeParse(createFile({ size: 1 }), { errorMap })
    const errors = !result.success ? result.error.flatten() : {}
    expect(errors).toEqual({
      fieldErrors: {},
      formErrors: ["The file is too small, minimum size required is: 2 bytes"]
    })
  })

  test("type error message", () => {
    const result = multipleTypes.safeParse(createFile({ type: "image/jpg" }), {
      errorMap
    })
    const errors = !result.success ? result.error.flatten() : {}
    expect(errors).toEqual({
      fieldErrors: {},
      formErrors: [
        "The file type should be image/png or image/jpeg. Received: image/jpg"
      ]
    })
  })
})
