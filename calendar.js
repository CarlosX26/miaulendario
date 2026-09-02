"use strict"

;(function (global) {
  const msPerDay = 86400000

  function utcDate(year, month, day) {
    return Date.UTC(year, month, day)
  }

  function assertDateParts({ year, month, day }) {
    if (![year, month, day].every(Number.isInteger)) {
      throw new TypeError("year, month, and day must be integers")
    }

    const date = new Date(utcDate(year, month - 1, day))
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new RangeError("invalid Gregorian calendar date")
    }
  }

  // ISO weeks begin on Monday. Week 1 is the week containing January 4.
  function getISOWeekInfo(dateParts) {
    assertDateParts(dateParts)
    const { year, month, day } = dateParts
    const thursday = new Date(utcDate(year, month - 1, day))
    const weekday = thursday.getUTCDay() || 7
    thursday.setUTCDate(thursday.getUTCDate() + 4 - weekday)

    const isoYear = thursday.getUTCFullYear()
    const isoYearFirstDay = utcDate(isoYear, 0, 1)
    const week = Math.ceil(
      ((thursday.getTime() - isoYearFirstDay) / msPerDay + 1) / 7,
    )

    return { year: isoYear, week }
  }

  function getISOYearStart(year) {
    const januaryFourth = new Date(utcDate(year, 0, 4))
    const weekday = (januaryFourth.getUTCDay() + 6) % 7
    januaryFourth.setUTCDate(januaryFourth.getUTCDate() - weekday)
    return januaryFourth.getTime()
  }

  function getISOWeeksInYear(year) {
    return Math.round(
      (getISOYearStart(year + 1) - getISOYearStart(year)) /
        (7 * msPerDay),
    )
  }

  function getISOWeekRange(isoYear, week) {
    const totalWeeks = getISOWeeksInYear(isoYear)
    if (!Number.isInteger(week) || week < 1 || week > totalWeeks) {
      throw new RangeError(`week must be between 1 and ${totalWeeks}`)
    }

    const start = getISOYearStart(isoYear) + (week - 1) * 7 * msPerDay
    return [new Date(start), new Date(start + 6 * msPerDay)]
  }

  function getCivilYearMetrics(dateParts) {
    assertDateParts(dateParts)
    const { year, month, day } = dateParts
    const todayUTC = utcDate(year, month - 1, day)
    const yearStart = utcDate(year, 0, 1)
    const nextYearStart = utcDate(year + 1, 0, 1)
    const dayOfYear = Math.floor((todayUTC - yearStart) / msPerDay) + 1
    const totalDays = Math.round((nextYearStart - yearStart) / msPerDay)
    const remainingDays = totalDays - dayOfYear

    return {
      year,
      dayOfYear,
      totalDays,
      remainingDays,
      remainingWeeks: Math.ceil(remainingDays / 7),
      yearPercentage: Math.round((dayOfYear / totalDays) * 100),
    }
  }

  function getCalendarMetrics(dateParts) {
    const civil = getCivilYearMetrics(dateParts)
    const iso = getISOWeekInfo(dateParts)

    return {
      civil,
      iso: {
        year: iso.year,
        week: iso.week,
        totalWeeks: getISOWeeksInYear(iso.year),
      },
    }
  }

  function getDatePartsInTimeZone(date, timeZone) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError("date must be a valid Date")
    }

    const parts = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      calendar: "gregory",
      numberingSystem: "latn",
      timeZone,
    }).formatToParts(date)

    const values = Object.fromEntries(
      parts
        .filter(({ type }) => ["year", "month", "day"].includes(type))
        .map(({ type, value }) => [type, Number(value)]),
    )

    assertDateParts(values)
    return values
  }

  function selectPluralForm(value, locale, forms) {
    const category = new Intl.PluralRules(locale).select(value)
    return value === 1 && category === "one" ? forms.one : forms.other
  }

  function getMinutesUntilNextFriday(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError("date must be a valid Date")
    }

    const friday = 5
    const daysUntilFriday = (friday - date.getDay() + 7) % 7 || 7
    const nextFriday = new Date(date)
    nextFriday.setHours(0, 0, 0, 0)
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday)

    return {
      minutes: Math.ceil((nextFriday.getTime() - date.getTime()) / 60000),
      target: nextFriday,
    }
  }

  const calendar = Object.freeze({
    getCalendarMetrics,
    getCivilYearMetrics,
    getDatePartsInTimeZone,
    getISOWeekInfo,
    getISOWeekRange,
    getISOWeeksInYear,
    getISOYearStart,
    getMinutesUntilNextFriday,
    msPerDay,
    selectPluralForm,
    utcDate,
  })

  global.MiaulendarioCalendar = calendar

  if (typeof module !== "undefined" && module.exports) {
    module.exports = calendar
  }
})(globalThis)
