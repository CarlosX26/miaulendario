"use strict"

const test = require("node:test")
const assert = require("node:assert/strict")
const {
  getCalendarMetrics,
  getDatePartsInTimeZone,
  getISOWeekRange,
  getISOWeeksInYear,
  selectPluralForm,
} = require("../calendar.js")

test("December 31 can belong to the following ISO year", () => {
  const result = getCalendarMetrics({ year: 2018, month: 12, day: 31 })

  assert.deepEqual(result.civil, {
    year: 2018,
    dayOfYear: 365,
    totalDays: 365,
    remainingDays: 0,
    remainingWeeks: 0,
    yearPercentage: 100,
  })
  assert.deepEqual(result.iso, { year: 2019, week: 1, totalWeeks: 52 })
})

test("January 1 can belong to the previous ISO year", () => {
  const result = getCalendarMetrics({ year: 2021, month: 1, day: 1 })

  assert.equal(result.civil.year, 2021)
  assert.equal(result.civil.dayOfYear, 1)
  assert.equal(result.civil.remainingDays, 364)
  assert.deepEqual(result.iso, { year: 2020, week: 53, totalWeeks: 53 })
})

test("leap years contain 366 days and include February 29", () => {
  const result = getCalendarMetrics({ year: 2024, month: 2, day: 29 })

  assert.equal(result.civil.dayOfYear, 60)
  assert.equal(result.civil.totalDays, 366)
  assert.equal(result.civil.remainingDays, 306)
})

test("ISO years can contain 52 or 53 weeks", () => {
  assert.equal(getISOWeeksInYear(2020), 53)
  assert.equal(getISOWeeksInYear(2021), 52)
  assert.equal(getISOWeeksInYear(2026), 53)
})

test("ISO week ranges cross calendar-year boundaries correctly", () => {
  const [start, end] = getISOWeekRange(2020, 53)

  assert.equal(start.toISOString().slice(0, 10), "2020-12-28")
  assert.equal(end.toISOString().slice(0, 10), "2021-01-03")
})

test("the same instant uses the viewer's local calendar date", () => {
  const instant = new Date("2021-01-04T01:00:00.000Z")
  const fortalezaDate = getDatePartsInTimeZone(instant, "America/Fortaleza")
  const tokyoDate = getDatePartsInTimeZone(instant, "Asia/Tokyo")

  assert.deepEqual(fortalezaDate, { year: 2021, month: 1, day: 3 })
  assert.deepEqual(tokyoDate, { year: 2021, month: 1, day: 4 })
  assert.deepEqual(getCalendarMetrics(fortalezaDate).iso, {
    year: 2020,
    week: 53,
    totalWeeks: 53,
  })
  assert.deepEqual(getCalendarMetrics(tokyoDate).iso, {
    year: 2021,
    week: 1,
    totalWeeks: 52,
  })
})

test("Portuguese and English choose singular only for one", () => {
  const forms = { one: "singular", other: "plural" }

  for (const locale of ["pt-BR", "en"]) {
    assert.equal(selectPluralForm(0, locale, forms), "plural")
    assert.equal(selectPluralForm(1, locale, forms), "singular")
    assert.equal(selectPluralForm(2, locale, forms), "plural")
  }
})

test("invalid Gregorian dates are rejected", () => {
  assert.throws(
    () => getCalendarMetrics({ year: 2025, month: 2, day: 29 }),
    /invalid Gregorian calendar date/,
  )
})
