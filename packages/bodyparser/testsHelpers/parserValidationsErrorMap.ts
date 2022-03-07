import z from "zod"

export const errorMap: z.ZodErrorMap = (error, ctx) => {
  switch (error.code) {
    case z.ZodIssueCode.invalid_type:
      if (error.expected === "file") {
        return { message: "NOT A FILE" }
      }
      break
    case z.ZodIssueCode.invalid_file_type:
      return {
        message: `Wrong mimeType, you passed: ${
          error.received
        } and the valid were: ${error.expected.join(", ")}`
      }
  }

  return { message: ctx.defaultError }
}
