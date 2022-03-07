import { PassThrough } from "stream"
import express from "express"
import {
  AbortController,
  Headers as NodeHeaders,
  Request as NodeRequest
} from "@remix-run/node"
import type { RequestInit as NodeRequestInit } from "@remix-run/node"

function createRemixHeaders(
  requestHeaders: express.Request["headers"]
): NodeHeaders {
  const headers = new NodeHeaders()

  for (const [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value)
        }
      } else {
        headers.set(key, values)
      }
    }
  }

  return headers
}

export function createRemixRequest(
  req: express.Request,
  abortController?: AbortController
): NodeRequest {
  const origin = `${req.protocol}://${req.get("host")}`
  const url = new URL(req.url, origin)

  const init: NodeRequestInit = {
    method: req.method,
    headers: createRemixHeaders(req.headers),
    signal: abortController?.signal,
    abortController
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.pipe(new PassThrough({ highWaterMark: 16384 }))
  }

  return new NodeRequest(url.href, init)
}
