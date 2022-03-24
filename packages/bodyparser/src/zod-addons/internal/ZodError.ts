import { ZodIssueCode, ZodIssueOptionalMessage, defaultErrorMap } from "zod"

// eslint-disable-next-line
type ErrorMapCtx = { defaultError: string; data: any }

export const customErrorMap = (
  issue: ZodIssueOptionalMessage,
  ctx: ErrorMapCtx
): { message: string } => {
  // eslint-disable-next-line
  // @ts-ignore
  if (issue.code === "invalid_file_type") {
    return {
      // eslint-disable-next-line
      // @ts-ignore
      message: `The file type should be ${issue.expected.join(
        " or "
        // eslint-disable-next-line
        // @ts-ignore
      )}. Received: ${issue.received}`
    }
  }
  // eslint-disable-next-line
  // @ts-ignore
  if (issue.code === ZodIssueCode.too_small && issue.type === "file") {
    return {
      message: `The file is too small, minimum size required is: ${issue.minimum} bytes`
    }
  }

  // eslint-disable-next-line
  // @ts-ignore
  if (issue.code === ZodIssueCode.too_big && issue.type === "file") {
    return {
      message: `The file is too big, maximum size allowed is: ${issue.maximum} bytes`
    }
  }

  return defaultErrorMap(issue, ctx)
}
