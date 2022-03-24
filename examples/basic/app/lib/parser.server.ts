import z from "zod"
import path from "path"

import { file, BodyParser } from "~remix-storage/bodyparser"

export const parser = new BodyParser({
  directory: path.resolve(__dirname, "./public/uploads")
})
export const schema = z.object({
  name: z.string().max(20),
  avatar: file()
})
