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

const msPerDay = 86400000

function utcDate(year, month, day) {
  return Date.UTC(year, month, day)
}

// Return the ISO week and year without relying on daylight saving time.
function getISOWeekInfo(date) {
  const thursday = new Date(
    utcDate(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const weekday = thursday.getUTCDay() || 7
  thursday.setUTCDate(thursday.getUTCDate() + 4 - weekday)

  const isoYear = thursday.getUTCFullYear()
  const isoYearFirstDay = utcDate(isoYear, 0, 1)
  const week = Math.ceil(
    ((thursday.getTime() - isoYearFirstDay) / msPerDay + 1) / 7,
  )

  return { year: isoYear, week }
}

// Monday of ISO week 1, the week containing January 4.
function getISOYearStart(year) {
  const januaryFourth = new Date(utcDate(year, 0, 4))
  const weekday = (januaryFourth.getUTCDay() + 6) % 7
  januaryFourth.setUTCDate(januaryFourth.getUTCDate() - weekday)
  return januaryFourth.getTime()
}

const today = new Date()
const year = today.getFullYear()
const todayUTC = utcDate(year, today.getMonth(), today.getDate())

const yearStart = utcDate(year, 0, 1)
const nextYearStart = utcDate(year + 1, 0, 1)
const dayOfYear = Math.floor((todayUTC - yearStart) / msPerDay) + 1
const totalDays = Math.round((nextYearStart - yearStart) / msPerDay)
const remainingDays = totalDays - dayOfYear
const remainingWeeks = Math.ceil(remainingDays / 7)
const yearPercentage = Math.round((dayOfYear / totalDays) * 100)

const isoWeekInfo = getISOWeekInfo(today)
const weekYear = isoWeekInfo.year
const firstWeekStart = getISOYearStart(weekYear)
const nextFirstWeekStart = getISOYearStart(weekYear + 1)
const totalWeeks = Math.round(
  (nextFirstWeekStart - firstWeekStart) / (7 * msPerDay),
)
const currentWeek = isoWeekInfo.week

document.getElementById("currentYear").textContent = year
document.getElementById("stampYear").textContent = weekYear
document.getElementById("currentWeek").textContent = currentWeek
document.getElementById("totalWeeks").textContent = totalWeeks
document.getElementById("remainingDays").textContent = remainingDays
document.getElementById("remainingWeeks").textContent = remainingWeeks
document.getElementById("yearPercentage").textContent = yearPercentage + "%"
document.getElementById("dayOfYearValue").textContent =
  dayOfYear + "/" + totalDays
document.getElementById("todayDateValue").textContent =
  today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

// Mark the week in which each month starts for the grid labels.
const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
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

const grid = document.getElementById("weeksGrid")
let gridMarkup = ""
for (let i = 1; i <= totalWeeks; i++) {
  let stateClass = "future"
  if (i < currentWeek) stateClass = "past"
  if (i === currentWeek) stateClass = "current"
  const isMonthStart = !!monthStartByWeek[i]
  gridMarkup += `<div class="week ${stateClass}${isMonthStart ? " month-start" : ""}">`
  if (isMonthStart)
    gridMarkup += `<span class="month-tag">${monthStartByWeek[i]}</span>`
  gridMarkup += `${i}${stateClass === "current" ? circleSVG : ""}</div>`
}
grid.innerHTML = gridMarkup

// Start the stamp animation after the page is ready.
requestAnimationFrame(() =>
  document.getElementById("stamp").classList.add("animate"),
)
