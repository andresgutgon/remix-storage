/* eslint-disable  @typescript-eslint/no-explicit-any */
import express from "express"
import supertest from "supertest"

import { handlers } from "./routes"

const app = express()
app.use(handlers.noBodyHandler)
app.use(handlers.fieldsHandler)

export const server = supertest(app)
