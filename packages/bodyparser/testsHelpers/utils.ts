import fs from "fs"
import { resolve } from "path"
import { afterEach, beforeEach } from "vitest"

import { BodyParser, Options } from "../src/index"
export const resolvePath = resolve

export const fixturesFolder = resolvePath(__dirname, "../fixtures/uploads")
export const defaultBodyConfig: Options = { directory: fixturesFolder }

export function configParser(config?: Options) {
  return new BodyParser(config)
}

export function readFile(name: string): Buffer | null {
  let file = null
  try {
    file = fs.readFileSync(`${fixturesFolder}/${name}`)
    // eslint-disable-next-line no-empty
  } catch {}

  return file
}

export function copyFile(name: string, destName: string) {
  const path = resolvePath(__dirname, `../fixtures/files/${name}`)
  const destPath = resolvePath(__dirname, `../fixtures/uploads/${destName}`)
  fs.copyFile(path, destPath, (error) => {
    // eslint-disable-next-line
    if (error) console.log(error)
  })
}

export function syncDeleteFile(filepath: string | null) {
  if (!filepath) return
  fs.unlinkSync(filepath)
}

async function cleanUploads() {
  const cleaning = new Promise((resolve, reject) => {
    fs.readdir(fixturesFolder, (error, data) => {
      if (error) {
        reject(error)
      }
      const files = data.filter((f) => f !== ".gitkeep")

      Promise.all(
        files.map((name) => {
          const path = resolvePath(fixturesFolder, name)
          return new Promise((resolveUnlink, rejectUnlink) => {
            fs.unlink(path, (unlinkError) => {
              if (unlinkError) rejectUnlink(unlinkError)
              resolveUnlink(true)
            })
          })
        })
      ).then(() => resolve(true))
    })
  })
  return cleaning
}

export function cleanUploadsBeforeAndAfter() {
  beforeEach(async () => {
    await cleanUploads()
  })
  afterEach(async () => {
    await cleanUploads()
  })
}
