const spawn = require("cross-spawn")
const yargsParser = require("yargs-parser")
const {resolveBin} = require("./utils")

let args = process.argv.slice(2)
const parsedArgs = yargsParser(args)
const files = parsedArgs._
const result = spawn.sync(
  resolveBin("tsup"),
  [...files, "--dts", "--format=cjs", "--watch"],
  {stdio: "inherit"}
)

process.exit(result.status)
