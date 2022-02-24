const fs = require("fs")
const path = require("path")

const tsConfig = fs.existsSync("tsconfig.json")
  ? path.resolve("tsconfig.json")
  : undefined

module.exports = {
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2017,
    sourceType: "commonjs",
    ecmaFeatures: {jsx: true},
  },
  env: {
    es6: true,
    jest: true,
    browser: true,
  },
  globals: {
    globals: true,
    shallow: true,
    render: true,
    mount: true,
  },
  overrides: [
    {
      files: ["src"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "commonjs",
        ecmaVersion: 2017,
        project: tsConfig,
        ecmaFeatures: {jsx: true},
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
  ],
}
