'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface WeekNavigationProps {
  selectedYear: number
  selectedWeek: number
  availableYears: number[]
  availableWeeks: number[]
  currentYear: number
  currentWeek: number
}

// Helper functions for week calculations (duplicate from server)
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getDateFromWeek(year: number, week: number): { start: Date; end: Date } {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  }
  const ISOweekEnd = new Date(ISOweekStart)
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6)

  return { start: ISOweekStart, end: ISOweekEnd }
}

function formatWeekRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', options)
  const endStr = end.toLocaleDateString('en-US', options)
  return `${startStr} - ${endStr}`
}

export default function WeekNavigation({
  selectedYear,
  selectedWeek,
  availableYears,
  availableWeeks,
  currentYear,
  currentWeek,
}: WeekNavigationProps) {
  const router = useRouter()

  const handleYearChange = (year: number) => {
    // When year changes, navigate to the most recent week with content in that year
    const mostRecentWeek = availableWeeks.length > 0 ? availableWeeks[0] : 1
    router.push(`/?year=${year}&week=${mostRecentWeek}`)
  }

  const handleWeekChange = (week: number) => {
    router.push(`/?year=${selectedYear}&week=${week}`)
  }

  const goToCurrentWeek = () => {
    router.push('/')
  }

  const goToPreviousWeek = () => {
    let newWeek = selectedWeek - 1
    let newYear = selectedYear

    if (newWeek < 1) {
      newYear = selectedYear - 1
      newWeek = 52 // Approximate, will be adjusted by server
    }

    router.push(`/?year=${newYear}&week=${newWeek}`)
  }

  const goToNextWeek = () => {
    let newWeek = selectedWeek + 1
    let newYear = selectedYear

    if (newWeek > 52) {
      newYear = selectedYear + 1
      newWeek = 1
    }

    // Don't go beyond current week
    if (newYear > currentYear || (newYear === currentYear && newWeek > currentWeek)) {
      return
    }

    router.push(`/?year=${newYear}&week=${newWeek}`)
  }

  const { start: weekStart, end: weekEnd } = getDateFromWeek(selectedYear, selectedWeek)

  return (
    <div className="mb-8 bg-gray-100 p-6 rounded-lg border border-gray-300">
      <h2 className="text-xl font-bold mb-4 text-center">Week Navigation</h2>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Year Selection */}
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="font-semibold text-gray-700">
            Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="cursor-pointer px-3 py-2 border border-gray-300 rounded bg-white font-serif text-lg"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Week Selection */}
        <div className="flex items-center gap-2">
          <label htmlFor="week-select" className="font-semibold text-gray-700">
            Week:
          </label>
          <select
            id="week-select"
            value={selectedWeek}
            onChange={(e) => handleWeekChange(parseInt(e.target.value))}
            className="cursor-pointer px-3 py-2 border border-gray-300 rounded bg-white font-serif text-lg"
          >
            {availableWeeks.map((week) => {
              const { start, end } = getDateFromWeek(selectedYear, week)
              return (
                <option key={week} value={week}>
                  Week {week} ({formatWeekRange(start, end)})
                </option>
              )
            })}
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={goToPreviousWeek}
            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-serif"
            title="Previous Week"
          >
            ← Prev
          </button>

          <button
            onClick={goToNextWeek}
            disabled={
              selectedYear > currentYear ||
              (selectedYear === currentYear && selectedWeek >= currentWeek)
            }
            className="cursor-pointer px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Week"
          >
            Next →
          </button>
        </div>

        {/* Current Week Button */}
        <button
          onClick={goToCurrentWeek}
          className="cursor-pointer px-4 py-2 bg-black text-white rounded hover:bg-gray-700 transition-colors font-serif"
        >
          Current Week
        </button>
      </div>

      {/* Selected Week Display */}
      <div className="mt-4 text-center text-gray-600">
        <span className="font-semibold">Selected Week:</span> {formatWeekRange(weekStart, weekEnd)},{' '}
        {selectedYear}
        <span className="ml-4 text-sm">(Week {selectedWeek})</span>
      </div>

      {/* Quick Navigation */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {availableWeeks.slice(0, 5).map((week) => {
          const { start, end } = getDateFromWeek(selectedYear, week)
          const isSelected = week === selectedWeek

          return (
            <button
              key={week}
              onClick={() => handleWeekChange(week)}
              className={`cursor-pointer px-3 py-1 text-sm rounded transition-colors font-serif ${
                isSelected
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              title={formatWeekRange(start, end)}
            >
              Week {week}
            </button>
          )
        })}
        {availableWeeks.length > 5 && (
          <span className="px-3 py-1 text-sm text-gray-500 cursor-pointer">
            +{availableWeeks.length - 5} more
          </span>
        )}
      </div>
    </div>
  )
}
