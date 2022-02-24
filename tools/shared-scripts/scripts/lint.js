const spawn = require("cross-spawn")
const yargsParser = require("yargs-parser")
const {resolveBin, fromRoot, packageDirectory} = require("./utils")

let args = process.argv.slice(2)
const parsedArgs = yargsParser(args)
const cache = args.includes("--no-cache")
  ? []
  : [
      "--cache",
      "--cache-location",
      fromRoot("node_modules/.cache/.eslintcache"),
    ]

const files = parsedArgs._
const relativeEslintNodeModules = "node_modules/@tools/eslint-config"
const pluginsDirectory = `${packageDirectory}/${relativeEslintNodeModules}`
const resolvePluginsRelativeTo = [
  "--resolve-plugins-relative-to",
  pluginsDirectory,
]
const result = spawn.sync(
  resolveBin("eslint"),
  [
    ...cache,
    ...files,
    ...resolvePluginsRelativeTo,
    "--no-error-on-unmatched-pattern",
  ],
  {stdio: "inherit"}
)

if (result.status === 0) {
  console.log("✅ Linter all good!")
  process.exit(result.status)
}
