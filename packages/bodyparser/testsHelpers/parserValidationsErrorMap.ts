import z from "zod"

export const errorMap: z.ZodErrorMap = (error, ctx) => {
  // eslint-disable-next-line
  switch (error.code as any) {
    case z.ZodIssueCode.invalid_type:
      // eslint-disable-next-line
      // @ts-ignore
      if (error.expected === "file") {
        return { message: "NOT A FILE" }
      }
      break
    // eslint-disable-next-line
    case "invalid_file_type":
      return {
        message: `Wrong mimeType, you passed: ${
          // eslint-disable-next-line
          // @ts-ignore
          error.received
          // eslint-disable-next-line
          // @ts-ignore
        } and the valid were: ${error.expected.join(", ")}`
      }
  }

  return { message: ctx.defaultError }
}
