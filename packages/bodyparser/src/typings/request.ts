import {
  MultipartContract,
  FileValidationOptions,
  MultipartFileContract,
} from "./bodyparser"

export interface RequestMultipart {
  file(
    key: string,
    options?: Partial<FileValidationOptions>
  ): MultipartFileContract | null
  files(
    key: string,
    options?: Partial<FileValidationOptions>
  ): MultipartFileContract[]
  allFiles(): {
    [field: string]: MultipartFileContract | MultipartFileContract[]
  }
  multipart: MultipartContract
}
