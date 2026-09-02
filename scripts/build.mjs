import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const templatePath = path.join(projectRoot, "templates", "index.html")
const template = await readFile(templatePath, "utf8")

const jsonLd = template.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
)?.[1]

if (!jsonLd) throw new Error("The JSON-LD block is missing from the template")

const cspHash = `sha256-${createHash("sha256").update(jsonLd).digest("base64")}`

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

const pages = [
  { localeFile: "pt-BR.json", output: "index.html" },
  { localeFile: "en.json", output: path.join("en", "index.html") },
]

for (const page of pages) {
  const localePath = path.join(projectRoot, "locales", page.localeFile)
  const messages = JSON.parse(await readFile(localePath, "utf8"))
  const replacements = { ...messages, cspHash }

  const html = template.replace(/\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g, (_, key) => {
    if (!(key in replacements)) {
      throw new Error(`Missing translation key "${key}" in ${page.localeFile}`)
    }
    return escapeHtml(replacements[key])
  })

  const unresolved = html.match(/\{\{[^}]+\}\}/)
  if (unresolved) throw new Error(`Unresolved template value: ${unresolved[0]}`)

  const outputPath = path.join(projectRoot, page.output)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html)
}

const vercelPath = path.join(projectRoot, "vercel.json")
const vercelConfig = JSON.parse(await readFile(vercelPath, "utf8"))
const cspHeader = vercelConfig.headers
  .flatMap((rule) => rule.headers)
  .find((header) => header.key.toLowerCase() === "content-security-policy")

if (!cspHeader) throw new Error("Content-Security-Policy header is missing")

cspHeader.value = cspHeader.value.replace(/sha256-[^']+/, cspHash)
await writeFile(vercelPath, `${JSON.stringify(vercelConfig, null, 2)}\n`)

console.log(`Generated ${pages.length} localized pages with CSP hash ${cspHash}`)
