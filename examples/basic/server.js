const path = require("path")
const express = require("express")
const compression = require("compression")
const morgan = require("morgan")
const { createRequestHandler } = require("@remix-run/express")
const app = express()

// Middlewares
app.use(compression())
app.use(express.static("public", { immutable: true, maxAge: "1y" }))
app.use(morgan("tiny"))

app.all(
  "*",
  createRequestHandler({
    build: require("./build"),
    mode: "development"
  })
)

let port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Express server started on http://localhost:${port}`)
})

