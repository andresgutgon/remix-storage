import path from "path"

import { plugins, distDir } from "../../configurations/rollup.config"

const configuration = () => [
  {
    input: path.join(__dirname, "src/index.ts"),
    output: [
      {
        file: path.join(distDir(__dirname), "index.js"),
        format: "commonjs",
        exports: "auto"
      }
    ],
    plugins: plugins(__dirname)
  }
]

export default configuration
