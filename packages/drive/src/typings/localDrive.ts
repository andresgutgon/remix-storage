import * as fsExtra from "fs-extra"

import type { Visibility, DriverContract } from "./drive"

/**
 * Config accepted by the local disk driver
 */
export type LocalDriverConfig = {
  driver: "local"
  visibility: Visibility
  root: string

  /**
   * `basePath` is always required
   * when "serveFiles = true"
   */
  serveFiles?: boolean
  basePath?: string
}

/**
 * Shape of the local disk driver
 */
export interface LocalDriverContract extends DriverContract {
  name: "local"
  adapter: typeof fsExtra

  /**
   * Make path to a given file location
   */
  makePath(location: string): string
}
