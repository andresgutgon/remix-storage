import type {
  UploadHandler as UploadHandlerType,
  UploadHandlerArgs as RemixUploadHandlerArgs,
  FormData as RemixNodeFormData,
} from "@remix-run/node/formData"
import {
  FileUploadHandlerOptions as RemixFileUploadHandlerOptions,
  FileUploadHandlerFilterArgs as RemixFileUploadHandlerFilterArgs,
} from "@remix-run/node/upload/fileUploadHandler"

export type UploadHandler = UploadHandlerType
export type UploadHandlerArgs = RemixUploadHandlerArgs
export type FileUploadHandlerOptions = RemixFileUploadHandlerOptions
export type FileUploadHandlerFilterArgs = RemixFileUploadHandlerFilterArgs
export type NodeFormData = RemixNodeFormData
