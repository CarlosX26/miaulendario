"use strict"

;(function () {
  const { getFridayState, selectPluralForm } = globalThis.MiaulendarioCalendar
  const locale = document.documentElement.lang || "pt-BR"
  const pageData = document.body.dataset
  const widget = document.getElementById("fridayWidget")
  const messages = widget.dataset
  const phrases = JSON.parse(messages.phrases)
  const celebration = document.getElementById("fridayCelebration")
  const title = document.getElementById("fridayTitle").textContent
  const phrase = document.getElementById("fridayPhrase")
  const prefix = document.getElementById("fridayCountdownPrefix")
  const count = document.getElementById("minutesUntilFriday")
  const unit = document.getElementById("fridayCountdownUnit")
  const share = document.getElementById("fridayShare")
  const status = document.getElementById("fridayShareStatus")
  const manual = document.getElementById("fridayManual")
  const shareText = document.getElementById("fridayShareText")
  const numbers = new Intl.NumberFormat(locale)
  let timer

  function render(now = new Date()) {
    const state = getFridayState(now, phrases.length)
    celebration.hidden = !state.isFriday
    widget.classList.toggle("is-friday", state.isFriday)
    phrase.textContent = phrases[state.phraseIndex]
    prefix.textContent = selectPluralForm(state.minutes, locale, {
      one: pageData.remainingDaysPrefixOne,
      other: pageData.remainingDaysPrefixOther,
    })
    count.textContent = numbers.format(state.minutes)
    unit.textContent = selectPluralForm(state.minutes, locale, {
      one: pageData.minuteOne,
      other: pageData.minuteOther,
    })
    return state
  }

  function refresh() {
    clearTimeout(timer)
    render()
    if (!document.hidden) {
      timer = setTimeout(refresh, 60000 - (Date.now() % 60000) + 25)
    }
  }

  share.addEventListener("click", async () => {
    // Build the payload in the user gesture, before awaiting a browser API.
    const now = new Date()
    const state = render(now)
    const text = state.isFriday
      ? `${title} ${phrases[state.phraseIndex]}`
      : `${prefix.textContent} ${count.textContent} ${unit.textContent} ${messages.shareTail}`
    const snapshotUrl = new URL("/share", messages.shareUrl)
    snapshotUrl.search = new URLSearchParams({
      t: String(Math.floor(now.getTime() / 60000)),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lang: locale,
      v: messages.jokeVersion,
    }).toString()
    const payload = { title: "Miaulendário", text, url: snapshotUrl.href }
    status.textContent = ""
    manual.hidden = true
    share.disabled = true

    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share(payload)
          return
        } catch (error) {
          if (error.name === "AbortError") return
        }
      }

      const content = `${text}\n${payload.url}`
      try {
        await navigator.clipboard.writeText(content)
        status.textContent = messages.copied
      } catch {
        shareText.value = content
        manual.hidden = false
        shareText.focus()
        shareText.select()
      }
    } finally {
      share.disabled = false
    }
  })

  share.hidden = false
  document.addEventListener("visibilitychange", refresh)
  window.addEventListener("pageshow", refresh)
  refresh()
})()
