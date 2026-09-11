"use strict"

const test = require("node:test")
const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const calendar = require("../calendar.js")
const root = path.join(__dirname, "..")
const source = readFileSync(path.join(root, "friday.js"), "utf8")

function decode(text) {
  return text.replaceAll("&quot;", '"').replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&")
}

// Exercise the real browser script with generated HTML data and browser API doubles.
function setup(locale = "pt-BR", navigator = {}, start = new Date(2026, 8, 10, 12)) {
  const html = readFileSync(path.join(root, locale === "en" ? "en/index.html" : "index.html"), "utf8")
  assert.match(html, /<script src="\/friday.js" defer><\/script>/)
  let now = start.getTime()
  const events = {}
  const timers = new Map()
  let nextTimer = 0
  const elements = new Map()
  for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
    const attributes = match[0]
    const classes = new Set()
    elements.set(match[1], {
      dataset: Object.fromEntries([...attributes.matchAll(/data-([\w-]+)="([^"]*)"/g)]
        .map(([, key, value]) => [key.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), decode(value)])),
      hidden: /\bhidden\b/.test(attributes),
      textContent: "", value: "", disabled: false,
      classList: { toggle: (name, on) => on ? classes.add(name) : classes.delete(name), contains: name => classes.has(name) },
      addEventListener(type, fn) { this[type] = fn },
      focus() { this.focused = true },
      select() { this.selected = true },
    })
  }
  elements.get("fridayTitle").textContent = decode(html.match(/id="fridayTitle">([^<]+)</)[1])
  const messages = JSON.parse(readFileSync(path.join(root, "locales", `${locale}.json`), "utf8"))
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])) }
    static now() { return now }
  }
  const document = {
    hidden: false,
    documentElement: { lang: locale },
    body: { dataset: messages },
    getElementById(id) {
      assert.ok(elements.has(id), `Missing ${id} in generated HTML`)
      return elements.get(id)
    },
    addEventListener: (name, fn) => { events[name] = fn },
  }
  vm.runInNewContext(source, {
    MiaulendarioCalendar: calendar, document, navigator, Intl, Date: Clock, URL, URLSearchParams,
    window: { addEventListener: (name, fn) => { events[name] = fn } },
    setTimeout: fn => { const id = ++nextTimer; timers.set(id, fn); return id },
    clearTimeout: id => timers.delete(id),
  })
  return {
    get: id => elements.get(id), messages, events, timers, document,
    setDate: date => { now = date.getTime() },
    click: () => elements.get("fridayShare").click(),
    tick() {
      const [id, fn] = timers.entries().next().value
      timers.delete(id)
      fn()
    },
  }
}

test("open tab enters and leaves Friday; resume refreshes without duplicate timers", () => {
  const app = setup()
  assert.equal(app.get("fridayCelebration").hidden, true)
  app.setDate(new Date(2026, 8, 11, 0))
  app.tick()
  assert.equal(app.get("fridayCelebration").hidden, false)
  assert.equal(app.get("fridayWidget").classList.contains("is-friday"), true)
  app.document.hidden = true
  app.events.visibilitychange()
  assert.equal(app.timers.size, 0)
  app.setDate(new Date(2026, 8, 12, 0))
  app.document.hidden = false
  app.events.visibilitychange()
  app.events.pageshow()
  assert.equal(app.get("fridayCelebration").hidden, true)
  assert.equal(app.get("fridayWidget").classList.contains("is-friday"), false)
  assert.equal(app.timers.size, 1)
})

for (const locale of ["pt-BR", "en"]) {
  test(`${locale}: share recalculates time, singular and language-specific URL`, async () => {
    let payload
    const app = setup(locale, { share: async value => { payload = value } })
    app.setDate(new Date(2026, 8, 10, 23, 59, 30))
    await app.click()
    const url = new URL(payload.url)
    assert.equal(url.origin, "https://www.miaulendario.online")
    assert.equal(url.pathname, "/share")
    assert.equal(url.searchParams.get("lang"), locale)
    assert.equal(url.searchParams.get("t"), String(new Date(2026, 8, 10, 23, 59).getTime() / 60000))
    assert.equal(url.searchParams.get("tz"), Intl.DateTimeFormat().resolvedOptions().timeZone)
    assert.equal(url.searchParams.get("v"), app.get("fridayWidget").dataset.jokeVersion)
    const snapshot = require("../lib/share.js").getSnapshot(payload.url)
    assert.equal(snapshot.minutes, 1)
    assert.equal(payload.title, "Miaulendário")
    assert.equal(payload.text, `${app.messages.remainingDaysPrefixOne} 1 ${app.messages.minuteOne} ${app.messages.fridayShareTail}`)
    assert.equal(app.get("fridayShareStatus").textContent, "")
    assert.equal(app.get("fridayShare").disabled, false)
  })

  test(`${locale}: Friday share contains the displayed celebration and phrase`, async () => {
    let payload
    const app = setup(locale, { share: async value => { payload = value } }, new Date(2026, 8, 11, 12))
    const jokes = JSON.parse(readFileSync(path.join(root, "data/jokes.json"), "utf8"))
    const phrases = jokes.map(joke => joke[locale])
    assert.deepEqual(JSON.parse(app.get("fridayWidget").dataset.phrases), phrases)
    const state = calendar.getFridayState(new Date(2026, 8, 11, 12), jokes.length)
    assert.equal(app.get("fridayPhrase").textContent, phrases[state.phraseIndex])
    await app.click()
    assert.equal(payload.text, `${app.messages.fridayTitle} ${app.get("fridayPhrase").textContent}`)
    const snapshot = require("../lib/share.js").getSnapshot(payload.url)
    assert.equal(snapshot.description, app.get("fridayPhrase").textContent)
    assert.equal(app.get("fridayCelebration").hidden, false)
  })

  test(`${locale}: missing native share copies localized plural text and snapshot link`, async () => {
    let content
    const app = setup(locale, { clipboard: { writeText: async value => { content = value } } })
    await app.click()
    const [text, url] = content.split("\n")
    assert.equal(text, `${app.messages.remainingDaysPrefixOther} 720 ${app.messages.minuteOther} ${app.messages.fridayShareTail}`)
    assert.equal(new URL(url).pathname, "/share")
    assert.equal(new URL(url).searchParams.get("lang"), locale)
    assert.equal(app.get("fridayShareStatus").textContent, app.messages.fridayCopied)
  })
}

test("cancelling native sharing does not copy or report failure", async () => {
  let copied = false
  const app = setup("pt-BR", {
    share: async () => { throw Object.assign(new Error("Cancelled"), { name: "AbortError" }) },
    clipboard: { writeText: async () => { copied = true } },
  })
  await app.click()
  assert.equal(copied, false)
  assert.equal(app.get("fridayShareStatus").textContent, "")
  assert.equal(app.get("fridayManual").hidden, true)
  assert.equal(app.get("fridayShare").disabled, false)
})

test("failed native sharing falls back to clipboard", async () => {
  let copied = false
  const app = setup("pt-BR", {
    share: async () => { throw new Error("Unavailable") },
    clipboard: { writeText: async () => { copied = true } },
  })
  await app.click()
  assert.equal(copied, true)
  assert.equal(app.get("fridayShareStatus").textContent, app.messages.fridayCopied)
})

test("missing or denied clipboard offers selectable text without false success", async () => {
  for (const navigator of [{}, { clipboard: { writeText: async () => { throw new Error("Denied") } } }]) {
    const app = setup("pt-BR", navigator)
    await app.click()
    assert.equal(app.get("fridayManual").hidden, false)
    assert.equal(app.get("fridayShareText").focused, true)
    assert.equal(app.get("fridayShareText").selected, true)
    assert.ok(app.get("fridayShareText").value.includes("https://www.miaulendario.online/share?"))
    assert.equal(app.get("fridayShareStatus").textContent, "")
  }
})
