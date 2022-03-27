import zod from "zod"

export * from "./parser"
export { FileShape } from "./lib/fileShape"
export { file, ZodFile } from "./zod-addons"

export const z = zod
