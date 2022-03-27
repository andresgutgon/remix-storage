import esbuild from "rollup-plugin-esbuild"
import ts from "rollup-plugin-ts"
import resolve from "@rollup/plugin-node-resolve"
import json from "@rollup/plugin-json"
import path from "path"
import stripShebang from "rollup-plugin-strip-shebang"
import commonjs from "@rollup/plugin-commonjs"

export const distDir = (packageDir) => {
  return path.join(packageDir, "dist")
}

export const plugins = (packageDir) => {
  return [
    stripShebang(),
    resolve({ preferBuiltins: true }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true
    }),
    ts({}), // Generate type definitions files `*.dt.ts`
    esbuild({
      sourceMap: true,
      target: "node16",
      tsconfig: path.join(packageDir, "tsconfig.json")
    }),
    json()
  ]
}
