import express from "express"
import { defaults } from "lodash"
import path from "path"

import { BodyParser } from "../../src/parser/index"
import { BodyParserOptions as Options } from "../../src/parser/types"

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

fieldsHandler.post(fieldsRoutes.default, async (req, response) => {
  const request = createRemixRequest(req)
  const parser = getParser(req)
  const schema = getSchema(req)
  const result = await parser.parse({
    request: request as unknown as Request,
    schema
  })

  response.status(200).json(result)
})
