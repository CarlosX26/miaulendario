"use strict"

;(function () {
  const wrapper = document.getElementById("catWrapper")
  const body = document.getElementById("catBody")
  const bubble = document.getElementById("catBubble")
  const img = wrapper.querySelector(".cat-img")
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches

  let x = window.innerWidth * 0.12
  let y = window.innerHeight * 0.2
  let vx = 62,
    vy = 40 // Pixels per second
  let last = null
  let w = 100,
    h = 100

  function updateSize() {
    const r = img.getBoundingClientRect()
    if (r.width) {
      w = r.width
      h = r.height
    }
  }

  function frame(ts) {
    if (last === null) last = ts
    const dt = Math.min((ts - last) / 1000, 0.05)
    last = ts

    x += vx * dt
    y += vy * dt

    const maxX = window.innerWidth - w
    const maxY = window.innerHeight - h

    if (x <= 0) {
      x = 0
      vx = Math.abs(vx)
      wrapper.classList.remove("flip")
    }
    if (x >= maxX) {
      x = maxX
      vx = -Math.abs(vx)
      wrapper.classList.add("flip")
    }
    if (y <= 0) {
      y = 0
      vy = Math.abs(vy)
    }
    if (y >= maxY) {
      y = maxY
      vy = -Math.abs(vy)
    }

    wrapper.style.transform = `translate(${x}px, ${y}px)`
    requestAnimationFrame(frame)
  }

  if (img.complete) updateSize()
  else img.addEventListener("load", updateSize)
  window.addEventListener("resize", updateSize)

  if (reduceMotion) {
    updateSize()
    wrapper.style.transform = `translate(${x}px, ${y}px)`
  } else {
    requestAnimationFrame(frame)
  }

  let audioContext

  function playMeow() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return

      const ctx = audioContext || (audioContext = new Ctx())
      if (ctx.state === "suspended") void ctx.resume()

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      osc.type = "sawtooth"
      filter.type = "bandpass"
      filter.frequency.value = 1100
      filter.Q.value = 0.9
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(560, now)
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.09)
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.36)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)
      osc.start(now)
      osc.stop(now + 0.45)
      osc.addEventListener(
        "ended",
        () => {
          osc.disconnect()
          filter.disconnect()
          gain.disconnect()
        },
        { once: true },
      )
    } catch (e) {
      /* Web Audio is unavailable; fail silently. */
    }
  }

  let bubbleTimeout
  function meowNow() {
    playMeow()
    body.classList.remove("bounce")
    void body.offsetWidth
    body.classList.add("bounce")
    bubble.classList.add("show")
    clearTimeout(bubbleTimeout)
    bubbleTimeout = setTimeout(() => bubble.classList.remove("show"), 850)
  }

  wrapper.addEventListener("click", meowNow)
  wrapper.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      meowNow()
    }
  })
})()

const locale = document.documentElement.lang || "pt-BR"
const pageData = document.body.dataset
const {
  getCalendarMetrics,
  getDatePartsInTimeZone,
  getISOWeekRange,
  getISOYearStart,
  getMinutesUntilNextFriday,
  msPerDay,
  selectPluralForm,
  utcDate,
} = globalThis.MiaulendarioCalendar

const today = new Date()
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const dateParts = getDatePartsInTimeZone(today, timeZone)
const { civil, iso } = getCalendarMetrics(dateParts)
const {
  year,
  dayOfYear,
  totalDays,
  remainingDays,
  remainingWeeks,
  yearPercentage,
} = civil
const { year: weekYear, week: currentWeek, totalWeeks } = iso
const firstWeekStart = getISOYearStart(weekYear)

document.getElementById("currentYear").textContent = year
document.getElementById("stampYear").textContent = weekYear
document.getElementById("currentWeek").textContent = currentWeek
document.getElementById("totalWeeks").textContent = totalWeeks
document.getElementById("remainingDays").textContent = remainingDays
document.getElementById("remainingWeeks").textContent = remainingWeeks
document.getElementById("yearPercentage").textContent = yearPercentage + "%"
document.getElementById("dayOfYearValue").textContent =
  dayOfYear + "/" + totalDays
document.getElementById("summaryCurrentWeek").textContent = currentWeek
document.getElementById("summaryWeekYear").textContent = weekYear
document.getElementById("summaryRemainingDays").textContent = remainingDays

const pluralForm = (value, one, other) =>
  selectPluralForm(value, locale, { one, other })
const remainingDaysPrefix = pluralForm(
  remainingDays,
  pageData.remainingDaysPrefixOne,
  pageData.remainingDaysPrefixOther,
)
const remainingDaysUnit = pluralForm(
  remainingDays,
  pageData.remainingDaysUnitOne,
  pageData.remainingDaysUnitOther,
)

document.getElementById("remainingDaysPrefix").textContent = remainingDaysPrefix
document.getElementById("remainingDaysUnit").textContent = remainingDaysUnit
document.getElementById("summaryRemainingDaysPrefix").textContent =
  remainingDaysPrefix
document.getElementById("summaryRemainingDaysUnit").textContent =
  remainingDaysUnit
document.getElementById("remainingWeeksLabel").textContent = pluralForm(
  remainingWeeks,
  pageData.remainingWeeksOne,
  pageData.remainingWeeksOther,
)

const localizedToday = today.toLocaleDateString(locale, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone,
})
document.getElementById("todayDateValue").textContent = localizedToday
document.getElementById("summaryTodayDate").textContent = localizedToday

const numberFormatter = new Intl.NumberFormat(locale)
let renderedFridayMinutes

function renderFridayCountdown(now = new Date()) {
  const { minutes } = getMinutesUntilNextFriday(now)
  if (minutes === renderedFridayMinutes) return

  renderedFridayMinutes = minutes
  document.getElementById("fridayCountdownPrefix").textContent = pluralForm(
    minutes,
    pageData.remainingDaysPrefixOne,
    pageData.remainingDaysPrefixOther,
  )
  document.getElementById("minutesUntilFriday").textContent =
    numberFormatter.format(minutes)
  document.getElementById("fridayCountdownUnit").textContent = pluralForm(
    minutes,
    pageData.minuteOne,
    pageData.minuteOther,
  )
}

renderFridayCountdown(today)
function scheduleFridayCountdownUpdate() {
  const delayUntilNextMinute = 60000 - (Date.now() % 60000) + 25
  setTimeout(() => {
    renderFridayCountdown()
    scheduleFridayCountdownUpdate()
  }, delayUntilNextMinute)
}
scheduleFridayCountdownUpdate()

const currentLanguageLink = document.querySelector(
  `.language-switcher a[hreflang="${locale}"]`,
)
if (currentLanguageLink) currentLanguageLink.setAttribute("aria-current", "page")

// Mark the week in which each month starts for the grid labels.
const monthFormatter = new Intl.DateTimeFormat(locale, {
  month: "short",
  timeZone: "UTC",
})
const monthLabels = Array.from({ length: 12 }, (_, monthIndex) =>
  monthFormatter
    .format(new Date(utcDate(2020, monthIndex, 1)))
    .replace(".", "")
    .toUpperCase(),
)
const monthStartByWeek = {}
for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
  const firstDay = utcDate(weekYear, monthIndex, 1)
  const weekIndex = Math.floor((firstDay - firstWeekStart) / (7 * msPerDay)) + 1
  if (!monthStartByWeek[weekIndex]) {
    monthStartByWeek[weekIndex] = monthLabels[monthIndex]
  }
}

const circleSVG = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 14 52 C 10 24, 40 6, 68 10 C 94 14, 96 46, 78 66 C 60 88, 22 86, 12 62 C 9 56, 12 54, 14 52 Z" />
    </svg>`

const weekRangeFormatter = new Intl.DateTimeFormat(locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function getWeekRange(week) {
  return getISOWeekRange(weekYear, week)
}

function formatWeekRange(week) {
  const [start, end] = getWeekRange(week)
  if (typeof weekRangeFormatter.formatRange === "function") {
    return weekRangeFormatter.formatRange(start, end)
  }
  return `${weekRangeFormatter.format(start)} – ${weekRangeFormatter.format(end)}`
}

document.getElementById("currentWeekRange").textContent =
  formatWeekRange(currentWeek)

const grid = document.getElementById("weeksGrid")
const gridFragment = document.createDocumentFragment()
for (let i = 1; i <= totalWeeks; i++) {
  let stateClass = "future"
  if (i < currentWeek) stateClass = "past"
  if (i === currentWeek) stateClass = "current"

  const isMonthStart = !!monthStartByWeek[i]
  const dateRange = formatWeekRange(i)
  const stateLabel = pageData[`state${stateClass[0].toUpperCase()}${stateClass.slice(1)}`]
  const accessibleLabel = `${pageData.weekLabel} ${i}: ${dateRange}, ${stateLabel}`

  const weekElement = document.createElement("div")
  weekElement.className = `week ${stateClass}${isMonthStart ? " month-start" : ""}`
  weekElement.setAttribute("role", "listitem")
  weekElement.setAttribute("aria-label", accessibleLabel)
  weekElement.title = accessibleLabel

  if (isMonthStart) {
    const monthTag = document.createElement("span")
    monthTag.className = "month-tag"
    monthTag.setAttribute("aria-hidden", "true")
    monthTag.textContent = monthStartByWeek[i]
    weekElement.append(monthTag)
  }

  const weekNumber = document.createElement("span")
  weekNumber.className = "week-number"
  weekNumber.setAttribute("aria-hidden", "true")
  weekNumber.textContent = i
  weekElement.append(weekNumber)

  const weekDates = document.createElement("span")
  weekDates.className = "visually-hidden week-dates"
  weekDates.textContent = dateRange
  weekElement.append(weekDates)

  if (stateClass === "current") {
    weekElement.insertAdjacentHTML("beforeend", circleSVG)
  }

  gridFragment.append(weekElement)
}
grid.replaceChildren(gridFragment)

// Start the stamp animation after the page is ready.
requestAnimationFrame(() =>
  document.getElementById("stamp").classList.add("animate"),
)
