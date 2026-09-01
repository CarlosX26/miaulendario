"use strict"

const { readFile } = require("node:fs/promises")
const path = require("node:path")

module.exports = async function envEasterEgg(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD")
    return response.status(405).send("Method Not Allowed\n")
  }

  const envPath = path.join(process.cwd(), ".env")
  const recipe = await readFile(envPath, "utf8")

  response.setHeader("Content-Type", "text/plain; charset=utf-8")
  response.setHeader("Content-Disposition", 'inline; filename=".env"')
  response.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600")
  response.setHeader("X-Robots-Tag", "noindex, nofollow")

  if (request.method === "HEAD") return response.status(200).end()
  return response.status(200).send(recipe)
}
