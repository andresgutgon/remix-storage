import { UnknownFileError } from "./parseFile"
import { FileShape } from "./fileShape"
import type { ParsedData } from "../parser/types"

export type AbortError = Error | UnknownFileError | FileShape

export class ServerFileSizeError extends Error {
  constructor(public field: string, public size: number) {
    super()
  }
}

type Props<T> = {
  files: ParsedData<T>
  fields: ParsedData<T>
  error: AbortError
}
type ReturnType<T> = {
  files: ParsedData<T>
  fields: ParsedData<T>
  formErrors: string[]
}
export function handleAbortError<T>({
  files,
  fields,
  error
}: Props<T>): ReturnType<T> {
  const defaultData = { formErrors: [] }

  if (error instanceof ServerFileSizeError) {
    const serverFileError = error as ServerFileSizeError
    return {
      fields,
      files,
      formErrors: [
        `Uploaded file exceeds max size limit of ${serverFileError.size}`
      ]
    }
  }

  if (error instanceof FileShape) {
    const fileError = error as FileShape
    const fileName = fileError.fieldName as keyof T
    files[fileName] = fileError
    return {
      ...defaultData,
      fields,
      files
    }
  }

  // No error
  return {
    ...defaultData,
    fields,
    files
  }
}
