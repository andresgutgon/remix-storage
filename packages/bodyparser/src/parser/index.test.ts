import { describe, expect, test } from "vitest"
import path from "path"
import os from "os"

import {
  syncDeleteFile,
  readFile,
  copyFile,
  cleanUploadsBeforeAndAfter
} from "../../testsHelpers/utils"

import { server } from "../../testsHelpers/server"
import { routes } from "../../testsHelpers/routes"
import {
  MIN_SIZE_FILE,
  MAX_SIZE_FILE,
  schemaKeys
} from "../../testsHelpers/schemas"

function filePath(filename: string): string {
  return path.resolve(__dirname, `../../fixtures/files/${filename}`)
}

describe("no body", () => {
  test("throw error when content is undefined", async () => {
    const response = await server.get(routes.noBodyRoutes.default)

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({
      error: "Invariant failed: MIME type not provided in request"
    })
  })
})

describe("fields", () => {
  test("happy path all good", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .field("field_one", "field_one_content")
      .field("field_two", "field_two_content")

    expect(response.body).toEqual({
      success: true,
      data: {
        field_one: "field_one_content",
        field_two: "field_two_content"
      }
    })
  })

  test("parser ignore fields not present in schema", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .field("field_one", "field_one_content")
      .field("field_two", "field_two_content")
      .field("i_m_not_in_the_schema", "should_not_appear_neither_fail")

    expect(response.body).toEqual({
      success: true,
      data: {
        field_one: "field_one_content",
        field_two: "field_two_content"
      }
    })
  })

  test("fails validations", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .field("field_one", "field_one_content")
      .field("field_two", "no")

    expect(response.body).toEqual({
      success: false,
      data: { field_one: "field_one_content", field_two: null },
      fieldErrors: {
        field_one: [],
        field_two: ["String must contain at least 3 character(s)"]
      },
      formErrors: []
    })
  })

  test("field with file validation", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({ schema: schemaKeys.fieldAsFile })
      .field("field_one", "field_one_content")
      .field("field_two", "not-a-file")

    expect(response.body).toEqual({
      success: false,
      data: {
        field_one: "field_one_content",
        field_two: null
      },
      fieldErrors: {
        field_one: [],
        field_two: ["Expected file, received string"]
      },
      formErrors: []
    })
  })

  test("A file type validated as string", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .attach("field_one", filePath("Ratón pequeño.jpeg"))
      .field("field_two", "field_two_content")

    expect(response.body).toEqual({
      success: false,
      data: {
        field_one: null,
        field_two: "field_two_content"
      },
      fieldErrors: {
        field_one: ["Expected string, received object"],
        field_two: []
      },
      formErrors: []
    })
  })

  test("display custom error", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({ schema: schemaKeys.customError })
      .field("field_one", "field_one_content")
      .field("field_two", "not-a-file")

    expect(response.body).toEqual({
      success: false,
      data: { field_one: "field_one_content", field_two: null },
      fieldErrors: {
        field_one: [],
        field_two: ["NOT A FILE"]
      },
      formErrors: []
    })
  })
})

describe("files", () => {
  describe("os.tmpdir()", () => {
    test("without directory option uses tmpdir folder", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({
          schema: schemaKeys.simpleFile,
          parserConfig: "none"
        })
        .attach("field_one", filePath("Ratón pequeño.jpeg"))
        .field("field_two", "field_two_content")

      const { filename, filepath } = response.body.data.field_one
      expect(filepath.slice(0, -filename.length)).toMatch(os.tmpdir())

      // Remove the file in tmp dir
      syncDeleteFile(filepath)
    })
  })

  describe("filename parsing", () => {
    cleanUploadsBeforeAndAfter()

    test("Upload a simple file", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: schemaKeys.simpleFile })
        .attach("field_one", filePath("Ratón pequeño.jpeg"))
        .field("field_two", "field_two_content")

      expect(response.body.data.field_one.filename).toBe("raton-pequeno.jpeg")
    })

    test("Upload a file without extension check content-type", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: schemaKeys.simpleFile })
        .attach("field_one", filePath("Ratón pequeño"), {
          contentType: "image/jpeg"
        })
        .field("field_two", "field_two_content")

      expect(response.body.data.field_one.filename).toBe("raton-pequeno.jpeg")
    })

    test("Upload a file with an existing filename in server", async () => {
      // Copy file to simulate the file is already there:
      copyFile("Ratón pequeño.jpeg", "raton-pequeno.jpeg")
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: "simpleFile" })
        .attach("field_one", filePath("Ratón pequeño.jpeg"))
        .field("field_two", "field_two_content")

      expect(response.body.data.field_one.filename).toMatch(
        /\d+-raton-pequeno.jpeg/
      )
    })
  })

  describe("validate mimeType", () => {
    test("display error", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: schemaKeys.mimeTypeValidation })
        .attach("field_one", filePath("Ratón pequeño.jpeg"))
        .field("field_two", "field_two_content")

      expect(response.body).toEqual({
        success: false,
        data: { field_one: null, field_two: "field_two_content" },
        fieldErrors: {
          field_one: [
            "The file type should be image/png or application/pdf. Received: image/jpeg"
          ],
          field_two: []
        },
        formErrors: []
      })
      expect(readFile("raton-pequeno.jpeg")).toBeNull()
    })

    test("display custom error", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: schemaKeys.mimeTypeCustomValidation })
        .attach("field_one", filePath("Ratón pequeño.jpeg"))
        .field("field_two", "field_two_content")

      expect(response.body).toEqual({
        success: false,
        data: { field_one: null, field_two: "field_two_content" },
        fieldErrors: {
          field_one: [
            "Wrong mimeType, you passed: image/jpeg and the valid were: image/png, application/pdf"
          ],
          field_two: []
        },
        formErrors: []
      })
      expect(readFile("raton-pequeno.jpeg")).toBeNull()
    })
  })

  describe("required field and files", () => {
    test("Ensure required fields are present", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .field("field_one", "Data in field one")

      expect(response.body).toEqual({
        success: false,
        data: { field_one: "Data in field one", field_two: null },
        fieldErrors: {
          field_one: [],
          field_two: ["Required"]
        },
        formErrors: []
      })
    })

    test("Ensure required files are present", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: schemaKeys.maxSizeValidation })
        .field("field_two", "This is field two content")

      expect(response.body).toEqual({
        success: false,
        data: { field_one: null, field_two: "This is field two content" },
        fieldErrors: {
          field_one: ["Required"],
          field_two: []
        },
        formErrors: []
      })
    })

    test("optional field does not raise error", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: schemaKeys.simpleFieldOptional })
        .field("field_two", "This is field two content")

      expect(response.body).toEqual({
        success: true,
        data: {
          field_two: "This is field two content"
        }
      })
    })

    test("optional file does not raise error", async () => {
      const response = await server
        .post(routes.fieldsRoutes.default)
        .query({ schema: schemaKeys.simpleFileOptional })
        .field("field_two", "This is field two content")

      expect(response.body).toEqual({
        success: true,
        data: {
          field_two: "This is field two content"
        }
      })
    })
  })

  describe("validate size", () => {
    describe("minSize", () => {
      test("display error", async () => {
        const response = await server
          .post(routes.fieldsRoutes.default)
          .query({ schema: schemaKeys.minSizeValidation })
          .attach("field_one", filePath("Ratón pequeño.jpeg"))
          .field("field_two", "field_two_content")

        expect(response.body).toEqual({
          success: false,
          data: { field_one: null, field_two: "field_two_content" },
          fieldErrors: {
            field_one: [
              `The file is too small, minimum size required is: ${MIN_SIZE_FILE} bytes`
            ],
            field_two: []
          },
          formErrors: []
        })
        expect(readFile("raton-pequeno.jpeg")).toBeNull()
      })
    })

    describe("maxSize", () => {
      test("display error", async () => {
        const response = await server
          .post(routes.fieldsRoutes.default)
          .query({ schema: schemaKeys.maxSizeValidation })
          .field("field_two", "This is field two content")
          .attach("field_one", filePath("elephant.jpg"))

        expect(response.body).toEqual({
          success: false,
          data: { field_one: null, field_two: "This is field two content" },
          fieldErrors: {
            field_one: [
              `The file is too big, maximum size allowed is: ${MAX_SIZE_FILE} bytes`
            ],
            field_two: []
          },
          formErrors: []
        })
      })

      test("on error unlink file", async () => {
        const response = await server
          .post(routes.fieldsRoutes.default)
          .query({ schema: schemaKeys.simpleFile })
          .attach("field_one", filePath("Ratón pequeño.jpeg"))
          .field("field_two", "no")

        expect(response.body).toEqual({
          success: false,
          data: { field_one: null, field_two: null },
          fieldErrors: {
            field_one: [],
            field_two: ["String must contain at least 3 character(s)"]
          },
          formErrors: []
        })
        expect(readFile("raton-pequeno.jpeg")).toBeNull()
      })

      test("when error on 1 file the rest are unlink", async () => {
        const response = await server
          .post(routes.fieldsRoutes.default)
          .query({ schema: schemaKeys.maxSizeValidationTwoFiles })
          .field("field_tree", "33")
          .attach("field_one", filePath("elephant.jpg"))
          .attach("field_two", filePath("Ratón pequeño.jpeg"))

        expect(response.body).toEqual({
          success: false,
          data: {
            field_one: null,
            field_two: null,
            field_tree: "33"
          },
          fieldErrors: {
            field_one: [
              `The file is too big, maximum size allowed is: ${MAX_SIZE_FILE} bytes`
            ],
            field_two: ["Required"],
            field_tree: []
          },
          formErrors: []
        })
        expect(readFile("raton-pequeno.jpeg")).toBeNull()
        expect(readFile("elephant.jpg")).toBeNull()
      })

      test("when error on 1 field the rest are unlink", async () => {
        const response = await server
          .post(routes.fieldsRoutes.default)
          .query({ schema: schemaKeys.maxSizeValidationTwoFiles })
          .attach("field_one", filePath("Ratón pequeño.jpeg"))
          .attach("field_two", filePath("Ratón pequeño.jpeg"))
          .field("field_tree", "NOT_A_NUMBER")

        expect(response.body).toEqual({
          success: false,
          data: {
            field_one: null,
            field_two: null,
            field_tree: null
          },
          fieldErrors: {
            field_one: [],
            field_two: [],
            field_tree: ["Expected number, received nan"]
          },
          formErrors: []
        })
        expect(readFile("raton-pequeno.jpeg")).toBeNull()
        expect(readFile("elephant.jpg")).toBeNull()
      })
    })
  })
})

describe("Hanlde file field with a list of files", () => {
  cleanUploadsBeforeAndAfter()

  test("Upload multiple files", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({ schema: schemaKeys.multiplesFiles })
      .field("field_two", "field_two_content")
      .attach("field_one", filePath("Ratón pequeño.jpeg"))
      .attach("field_one", filePath("elephant.jpg"))
    const files = response.body.data.field_one

    expect(files[0].filename).toBe("raton-pequeno.jpeg")
    expect(files[1].filename).toBe("elephant.jpg")
  })
})

describe("Handle a list of files with errors", () => {
  test("display validation error", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({ schema: schemaKeys.multiplesFilesMinSize })
      .field("field_two", "field_two_content")
      .attach("field_one", filePath("Ratón pequeño.jpeg"))
      .attach("field_one", filePath("elephant.jpg"))

    expect(response.body).toEqual({
      success: false,
      data: { field_one: null, field_two: "field_two_content" },
      fieldErrors: {
        field_one: [
          `The file is too small, minimum size required is: ${MIN_SIZE_FILE} bytes`
        ],
        field_two: []
      },
      formErrors: []
    })
    expect(readFile("raton-pequeno.jpeg")).toBeNull()
    expect(readFile("elephant.jpg")).toBeNull()
  })
})

describe("Array of values in a field[]", () => {
  test("Parse a list of strings", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({ schema: schemaKeys.fieldAsArray })
      .field("field_one", "1")
      .field("field_one", "2")
      .field("field_one", "3")
      .field("field_two", "field_two_content")
    expect(response.body).toEqual({
      success: true,
      data: {
        field_one: ["1", "2", "3"],
        field_two: "field_two_content"
      }
    })
  })

  test("display error when the array is missing", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({ schema: schemaKeys.fieldAsArray })
      .field("field_one", "")
      .field("field_two", "field_two_content")
    expect(response.body).toEqual({
      success: false,
      data: {
        field_one: null,
        field_two: "field_two_content"
      },
      fieldErrors: {
        field_one: ["Expected array, received string"],
        field_two: []
      },
      formErrors: []
    })
  })

  test("display error if array < 3", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({ schema: schemaKeys.fieldAsArrayMinThreeElements })
      .field("field_one", "0")
      .field("field_one", "2")
      .field("field_two", "field_two_content")

    expect(response.body).toEqual({
      success: false,
      data: {
        field_one: null,
        field_two: "field_two_content"
      },
      fieldErrors: {
        field_one: ["Array must contain at least 3 element(s)"],
        field_two: []
      },
      formErrors: []
    })
  })
})

describe("Busboy limits", () => {
  test("display busboy fileSize limit error", async () => {
    const response = await server
      .post(routes.fieldsRoutes.default)
      .query({
        schema: schemaKeys.simpleFile,
        parserConfig: "busboyFileSize"
      })
      .attach("field_one", filePath("elephant.jpg"))
      .field("field_two", "field_two_content")

    expect(response.body).toEqual({
      success: false,
      data: { field_one: null, field_two: null },
      fieldErrors: { field_one: ["Required"], field_two: ["Required"] },
      formErrors: [`Uploaded file exceeds max size limit of ${MAX_SIZE_FILE}`]
    })
    expect(readFile("elephant.jpg")).toBeNull()
  })
})

describe.todo("test formErrors")
