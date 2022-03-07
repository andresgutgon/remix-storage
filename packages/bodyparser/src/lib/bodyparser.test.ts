import { describe, expect, test } from "vitest"
import { bodyparser } from "./bodyparser"

describe("bodyparser", () => {
  test("it works", () => {
    expect(bodyparser("hello")).toEqual("hello")
  })
})
