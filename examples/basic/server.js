const path = require("path")
const express = require("express")
const compression = require("compression")
const morgan = require("morgan")
const { createRequestHandler } = require("@remix-run/express")

const MODE = process.env.NODE_ENV
const NODE_MODULES_DIR = path.join(
  process.cwd(),
  'node_modules'
)
const app = express()

// Middlewares
app.use(compression())
app.use(express.static("public", { immutable: true, maxAge: "1y" }))
app.use(morgan("tiny"))

app.all(
  "*",
  createRequestHandler({
    build: require("./build"),
    mode: "development",
    getLoadContext() {
      // Whatever you return here will be passed as `context` to your loaders
      // and actions.
    }
  })
)

app.all(
  '*',
  MODE === 'production'
    ? createRequestHandler({
      build: require('../build')
    }) : (req, res, next) => {
      purgeRequireCache()
      return createRequestHandler({
        build: require('../build'),
        mode: MODE
      })( req, res, next)
    },
)
let port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Express server started on http://localhost:${port}`)
})

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't const
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(NODE_MODULES_DIR)) {
      console.log("HOLLLLLLLLLLLLA")
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[key]
    }
  }
}
