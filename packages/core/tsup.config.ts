import {defineConfig} from "tsup"

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  minify: !options.watch,
  platform: "node",
  splitting: false,
  sourcemap: true,
  clean: true,
}))
