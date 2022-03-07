import express from "express"
import path from "path"

import { Options, BodyParser } from "../../src/index"
import { createRemixRequest } from "../createRemixRequest"
import { getSchema } from "../schemas"

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
  const result = await parser.parse({ request, schema })

  response.status(200).json(result)
})
