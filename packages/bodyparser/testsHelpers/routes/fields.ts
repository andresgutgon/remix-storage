import express from "express"
import path from "path"

import { BodyParser } from "../../src/parser/index"
import {
  ParseParams,
  Schema,
  BodyParserOptions as Options
} from "../../src/parser/types"

import { createRemixRequest } from "../createRemixRequest"
import { getSchema, MAX_SIZE_FILE } from "../schemas"
import { defaultBodyConfig } from "../utils"

export const fieldsHandler = express.Router()
export enum fieldsRoutes {
  default = "/fields-default"
}

export const fixturesFolder = path.resolve(__dirname, "../../fixtures/uploads")
export const defaultParserConfig: Options = { directory: fixturesFolder }
function getParser(request: express.Request): BodyParser {
  const query = request.query
  const configKey = query.parserConfig || "default"
  let config: Options
  switch (configKey) {
    case "default":
      config = defaultParserConfig
      break
    case "none":
      config = {}
      break
    case "busboyFileSize":
      config = {
        ...defaultBodyConfig,
        busboyConfig: {
          limits: { fileSize: MAX_SIZE_FILE }
        }
      }
      break
    default:
      config = {}
      break
  }

  return new BodyParser(config)
}

function getParseParams<T>(req: express.Request): ParseParams<T> {
  const request = createRemixRequest(req)
  const schema = getSchema(req)
  const query = req.query
  const params = {
    request: request as unknown as Request,
    schema: schema as unknown as Schema<T>
  }
  const maxServerFileSize = query.maxServerFileSize

  if (!maxServerFileSize) return params

  return {
    ...params,
    maxServerFileSize: Number(maxServerFileSize)
  }
}

fieldsHandler.post(fieldsRoutes.default, async (req, response) => {
  const parser = getParser(req)
  const params = getParseParams(req)
  const result = await parser.parse(params)

  response.status(200).json(result)
})
