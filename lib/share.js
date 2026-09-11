"use strict"

const { getDatePartsInTimeZone, msPerDay, utcDate, selectPluralForm } = require("../calendar.js")
const catalogs = require("../data/share-catalogs.json")
const origin = "https://www.miaulendario.online"
const copy = {
  "pt-BR": {
    title: "SEXTOU!",
    one: "Falta", other: "Faltam", minuteOne: "minuto", minuteOther: "minutos",
    until: "para sexta-feira", encouragement: "Força, guerreiro!",
    snapshot: "No momento do compartilhamento", open: "Abrir calendário atualizado",
  },
  en: {
    title: "IT’S FRIDAY!",
    one: "There is", other: "There are", minuteOne: "minute", minuteOther: "minutes",
    until: "until Friday", encouragement: "Hang in there, warrior!",
    snapshot: "At the time of sharing", open: "Open the live calendar",
  },
}

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;")

// Find the first minute of a civil date in the supplied timezone. Comparing
// dates instead of offsets also handles midnight skipped by a DST transition.
function startOfDayInZone(targetDay, timeZone) {
  let low = (targetDay - 36 * 3600000) / 60000
  let high = (targetDay + 36 * 3600000) / 60000
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    const { year, month, day } = getDatePartsInTimeZone(new Date(middle * 60000), timeZone)
    if (utcDate(year, month - 1, day) < targetDay) low = middle + 1
    else high = middle
  }
  return low * 60000
}

function getSnapshot(requestUrl) {
  const params = new URL(requestUrl, origin).searchParams
  const keys = ["t", "tz", "lang", "v"]
  if ([...params.keys()].some(key => !keys.includes(key)) ||
      keys.some(key => params.getAll(key).length !== 1)) {
    throw new RangeError("Invalid snapshot parameters")
  }
  const t = params.get("t")
  const tz = params.get("tz")
  const lang = params.get("lang")
  const v = params.get("v")
  if (!/^\d{8,9}$/.test(t) || Number(t) < Date.UTC(2000, 0, 1) / 60000 ||
      Number(t) >= Date.UTC(2100, 0, 1) / 60000 || !["pt-BR", "en"].includes(lang) ||
      !/^[a-f0-9]{16}$/.test(v) || !Object.hasOwn(catalogs, v) ||
      tz.length > 80 || !/^[A-Za-z0-9_+\-/]+$/.test(tz)) {
    throw new RangeError("Invalid snapshot parameters")
  }
  const date = new Date(Number(t) * 60000)
  const { year, month, day } = getDatePartsInTimeZone(date, tz)
  const civilDay = utcDate(year, month - 1, day)
  const weekday = new Date(civilDay).getUTCDay()
  const isFriday = weekday === 5
  const fridayDay = civilDay + ((5 - weekday + 7) % 7) * msPerDay
  const jokes = catalogs[v]
  const weekIndex = Math.round((fridayDay - utcDate(1970, 0, 2)) / (7 * msPerDay))
  const joke = jokes[((weekIndex % jokes.length) + jokes.length) % jokes.length]
  const minutes = isFriday ? null : Math.ceil((startOfDayInZone(fridayDay, tz) - date.getTime()) / 60000)
  const words = copy[lang]
  const number = isFriday ? null : new Intl.NumberFormat(lang).format(minutes)
  const prefix = isFriday ? "" : selectPluralForm(minutes, lang, words)
  const unit = isFriday ? "" : selectPluralForm(minutes, lang, { one: words.minuteOne, other: words.minuteOther })
  const title = isFriday ? words.title : `${prefix} ${number} ${unit} ${words.until}`
  const description = isFriday ? joke[lang] : words.encouragement
  const query = new URLSearchParams({ t, tz, lang, v }).toString()
  const url = `${origin}/share?${query}`
  const imageUrl = `${origin}/api/og?${query}`
  const when = new Intl.DateTimeFormat(lang, {
    dateStyle: "medium", timeStyle: "short", timeZone: tz,
  }).format(date)
  return {
    isFriday, minutes, number, prefix, unit, title, description, words, lang,
    when, tz, url, imageUrl, calendarUrl: `${origin}${lang === "en" ? "/en/" : "/"}`,
  }
}

function renderShareHtml(card) {
  const e = escapeHtml
  return `<!doctype html>
<html lang="${card.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(card.title)} | Miaulendário</title>
  <meta name="description" content="${e(card.description)}">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${e(card.url)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/index.css">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Miaulendário">
  <meta property="og:locale" content="${card.lang === "en" ? "en_US" : "pt_BR"}">
  <meta property="og:url" content="${e(card.url)}">
  <meta property="og:title" content="${e(card.title)}">
  <meta property="og:description" content="${e(card.description)}">
  <meta property="og:image" content="${e(card.imageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${e(`${card.title}. ${card.description}`)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(card.title)}">
  <meta name="twitter:description" content="${e(card.description)}">
  <meta name="twitter:image" content="${e(card.imageUrl)}">
  <meta name="twitter:image:alt" content="${e(`${card.title}. ${card.description}`)}">
</head>
<body>
  <main class="page share-page">
    <p class="eyebrow">Miaulendário</p>
    <h1 class="page-title">${e(card.title)}</h1>
    <p class="intro">${e(card.description)}</p>
    <img class="share-card" src="${e(card.imageUrl)}" width="1200" height="630" alt="${e(`${card.title}. ${card.description}`)}">
    <p class="share-caption">${e(card.words.snapshot)} · ${e(card.when)} · ${e(card.tz)}</p>
    <a class="friday-share share-open" href="${card.calendarUrl}">${e(card.words.open)}</a>
  </main>
</body>
</html>`
}

module.exports = { getSnapshot, renderShareHtml }
