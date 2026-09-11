"use strict"

const test = require("node:test")
const assert = require("node:assert/strict")
const { createHash } = require("node:crypto")
const { getSnapshot, renderShareHtml } = require("../lib/share.js")
const { renderCard } = require("../lib/og.js")
const shareHandler = require("../api/share.js")
const ogHandler = require("../api/og.js")
const jokes = require("../data/jokes.json")
const version = createHash("sha256").update(JSON.stringify(jokes)).digest("hex").slice(0, 16)

function snapshotUrl(instant = "2026-09-11T03:00:00Z", tz = "America/Fortaleza", lang = "pt-BR") {
  return `/share?${new URLSearchParams({ t: String(Date.parse(instant) / 60000), tz, lang, v: version })}`
}

function response() {
  return {
    headers: {}, code: null, body: null,
    setHeader(name, value) { this.headers[name] = value },
    status(value) { this.code = value; return this },
    send(body) { this.body = body; return this },
    end() { return this },
  }
}

test("snapshot uses the sender timezone, including Friday boundaries", () => {
  const thursday = getSnapshot(snapshotUrl("2026-09-11T02:59:00Z"))
  assert.equal(thursday.isFriday, false)
  assert.equal(thursday.minutes, 1)
  assert.equal(thursday.title, "Falta 1 minuto para sexta-feira")
  const friday = getSnapshot(snapshotUrl())
  assert.equal(friday.isFriday, true)
  assert.equal(friday.title, "SEXTOU!")
  assert.ok(jokes.some(joke => joke["pt-BR"] === friday.description))
  const saturday = getSnapshot(snapshotUrl("2026-09-12T03:00:00Z"))
  assert.equal(saturday.isFriday, false)
  assert.equal(saturday.minutes, 6 * 24 * 60)
  assert.equal(getSnapshot(snapshotUrl("2026-09-11T02:59:00Z", "Asia/Tokyo", "en")).isFriday, true)
})

test("countdown handles DST, fractional offsets, and year rollover", () => {
  assert.equal(getSnapshot(snapshotUrl("2026-03-07T05:00:00Z", "America/New_York")).minutes, 6 * 24 * 60 - 60)
  assert.equal(getSnapshot(snapshotUrl("2026-09-10T18:14:00Z", "Asia/Kathmandu")).minutes, 1)
  assert.equal(getSnapshot(snapshotUrl("2027-01-01T02:59:00Z")).minutes, 1)
  assert.equal(getSnapshot(snapshotUrl("2027-01-01T03:00:00Z")).isFriday, true)
})

test("snapshot stays frozen and English content matches its displayed joke", () => {
  const url = snapshotUrl("2026-09-11T15:00:00Z", "America/Fortaleza", "en")
  const card = getSnapshot(url)
  assert.deepEqual(getSnapshot(url), card)
  assert.equal(card.title, "IT’S FRIDAY!")
  const pt = getSnapshot(url.replace("lang=en", "lang=pt-BR"))
  assert.equal(jokes.find(joke => joke.en === card.description)["pt-BR"], pt.description)
  assert.equal(card.calendarUrl, "https://www.miaulendario.online/en/")
})

test("invalid snapshots are rejected before rendering", () => {
  for (const url of ["/share", snapshotUrl() + "&t=123", snapshotUrl() + "&text=<script>",
    snapshotUrl().replace("lang=pt-BR", "lang=es"),
    snapshotUrl().replace(version, "0000000000000000"),
    snapshotUrl().replace(/t=\d+/, "t=-1"),
    snapshotUrl().replace(/tz=[^&]+/, "tz=Invalid%2FZone")]) {
    assert.throws(() => getSnapshot(url))
  }
})

test("share HTML provides snapshot-specific OG tags and a live-calendar link without JS", () => {
  const card = getSnapshot(snapshotUrl())
  const html = renderShareHtml(card)
  assert.match(html, /property="og:title" content="SEXTOU!"/)
  assert.match(html, /property="og:image" content="https:\/\/www.miaulendario.online\/api\/og\?/)
  assert.match(html, /name="twitter:card" content="summary_large_image"/)
  assert.match(html, /name="robots" content="noindex, follow"/)
  assert.match(html, /No momento do compartilhamento/)
  assert.ok(html.includes('href="https://www.miaulendario.online/"'))
  assert.doesNotMatch(html, /<script/)
  assert.match(renderShareHtml({ ...card, title: '<img src=x onerror="bad">' }), /&lt;img src=x onerror=&quot;bad&quot;&gt;/)
})

test("share and image handlers support GET/HEAD and reject invalid requests", async () => {
  for (const handler of [shareHandler, ogHandler]) {
    const head = response()
    await handler({ method: "HEAD", url: snapshotUrl() }, head)
    assert.equal(head.code, 200)
    assert.equal(head.body, null)
    assert.match(head.headers["Cache-Control"], /public/)
    const invalid = response()
    await handler({ method: "GET", url: "/share" }, invalid)
    assert.equal(invalid.code, 400)
    assert.equal(invalid.headers["Cache-Control"], "no-store")
    const post = response()
    await handler({ method: "POST", url: snapshotUrl() }, post)
    assert.equal(post.code, 405)
    assert.equal(post.headers.Allow, "GET, HEAD")
  }
  const result = response()
  shareHandler({ method: "GET", url: snapshotUrl() }, result)
  assert.equal(result.code, 200)
  assert.equal(result.headers["Content-Type"], "text/html; charset=utf-8")
  assert.match(result.body, /og:image/)
  const pngResponse = response()
  await ogHandler({ method: "GET", url: snapshotUrl() }, pngResponse)
  assert.equal(pngResponse.code, 200)
  assert.equal(pngResponse.headers["Content-Type"], "image/png")
  assert.equal(pngResponse.body.subarray(0, 8).toString("hex"), "89504e470d0a1a0a")
})

test("real OG renderer produces 1200x630 PNGs in both languages and states", async () => {
  for (const lang of ["pt-BR", "en"]) {
    for (const instant of ["2026-09-11T03:00:00Z", "2026-09-12T03:00:00Z"]) {
      const png = await renderCard(getSnapshot(snapshotUrl(instant, "America/Fortaleza", lang)))
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a")
      assert.equal(png.readUInt32BE(16), 1200)
      assert.equal(png.readUInt32BE(20), 630)
    }
  }
})
