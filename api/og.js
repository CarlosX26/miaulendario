"use strict"

const { getSnapshot } = require("../lib/share.js")
const { renderCard } = require("../lib/og.js")

module.exports = async function og(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD")
    return response.status(405).send("Method Not Allowed")
  }
  let card
  try {
    card = getSnapshot(request.url)
  } catch {
    response.setHeader("Cache-Control", "no-store")
    return response.status(400).send("Invalid sharing link")
  }
  response.setHeader("Content-Type", "image/png")
  response.setHeader("Cache-Control", "public, max-age=31536000, immutable")
  if (request.method === "HEAD") return response.status(200).end()
  try {
    return response.status(200).send(await renderCard(card))
  } catch (error) {
    console.error("OG image generation failed", error)
    response.setHeader("Cache-Control", "no-store")
    response.setHeader("Content-Type", "text/plain; charset=utf-8")
    return response.status(500).send("Unable to generate image")
  }
}
