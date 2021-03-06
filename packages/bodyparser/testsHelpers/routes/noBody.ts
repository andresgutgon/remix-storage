import z from "zod"
import express from "express"

import { configParser } from "../../testsHelpers/utils"
import { createRemixRequest } from "../createRemixRequest"

export const noBodyHandler = express.Router()
export enum noBodyRoutes {
  default = "/default"
}
noBodyHandler.get(noBodyRoutes.default, async (req, response) => {
  const request = createRemixRequest(req)

  const schema = z.object({ lol: z.string() })
  const parser = configParser()
  let error = null
  try {
    await parser.parse({
      request: request as unknown as Request,
      schema
    })
  } catch (e: unknown) {
    error = (e as Error).message
  }
  response.status(400).json({ error })
})
