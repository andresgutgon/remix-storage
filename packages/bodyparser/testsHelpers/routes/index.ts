// export * as fields from "./fields"
import { noBodyRoutes, noBodyHandler } from "./noBody"
import { fieldsRoutes, fieldsHandler } from "./fields"

export const routes = {
  noBodyRoutes,
  fieldsRoutes
}
export const handlers = {
  noBodyHandler,
  fieldsHandler
}
