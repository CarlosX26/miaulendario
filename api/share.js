"use strict"

const { getSnapshot, renderShareHtml } = require("../lib/share.js")

module.exports = function share(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD")
    return response.status(405).send("Method Not Allowed")
  }
  let card
  try {
    card = getSnapshot(request.url)
  } catch {
    response.setHeader("Cache-Control", "no-store")
    return response.status(400).send("Invalid sharing link / Link de compartilhamento inválido")
  }
  response.setHeader("Content-Type", "text/html; charset=utf-8")
  response.setHeader("X-Robots-Tag", "noindex, follow")
  response.setHeader("Cache-Control", "public, max-age=3600, s-maxage=31536000")
  if (request.method === "HEAD") return response.status(200).end()
  return response.status(200).send(renderShareHtml(card))
}
