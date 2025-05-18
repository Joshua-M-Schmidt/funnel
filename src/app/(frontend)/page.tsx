import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { ContentItem } from '@/payload-types'
import React from 'react'
import config from '@/payload.config'
import ContentItemCard from './components/ContentCard'
import Link from 'next/link'
import WeekNavigation from './components/WeekNavigation'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Helper functions for week calculations
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

export default async function HomePage({ searchParams }: PageProps) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Get current week as default
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentWeek = getWeekNumber(currentDate)

  const { year, week } = await searchParams

  // Parse URL parameters or use current week
  const selectedYear = year ? parseInt(year as string) : currentYear
  const selectedWeek = week ? parseInt(week as string) : currentWeek

  // Calculate date range for the selected week
  const { start: weekStart, end: weekEnd } = getDateFromWeek(selectedYear, selectedWeek)

  // Fetch articles for the specific week
  const contentItems = await payload.find({
    collection: 'contentItem',
    where: {
      isProcessed: { equals: true },
      publishDate: {
        greater_than_equal: weekStart.toISOString(),
        less_than_equal: weekEnd.toISOString(),
      },
    },
    limit: 100,
    sort: '-publishDate',
  })

  // Get available years and weeks from database
  // Start from February 2025 as requested
  const startDate = new Date(2025, 1, 1) // February 1, 2025
  const endDate = new Date()

  // Get weeks with content for navigation
  const availableWeeks = await getAvailableWeeks(payload, selectedYear)
  const availableYears = await getAvailableYears(payload)

  return (
    <div className="max-w-7xl mx-auto p-5 font-serif relative">
      {/* Week Navigation */}
      <WeekNavigation
        selectedYear={selectedYear}
        selectedWeek={selectedWeek}
        availableYears={availableYears}
        availableWeeks={availableWeeks}
        currentYear={currentYear}
        currentWeek={currentWeek}
      />

      {/* Newspaper Header */}
      <header className="text-center border-b-4 border-black mb-8 pb-5">
        <h1 className="text-6xl font-bold tracking-widest mb-0 text-gray-900 uppercase font-serif">
          WEEKLY DIGEST
        </h1>
        <div className="text-sm text-gray-600 mt-2.5 tracking-wider uppercase">
          {formatWeekRange(weekStart, weekEnd)} {selectedYear} - {contentItems.docs.length} ARTICLES
        </div>
      </header>

      {/* Content Display */}
      {contentItems.docs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-5">
          {contentItems.docs.map((item: ContentItem, index: number) => (
            <ContentItemCard key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No Articles Found</h3>
          <p className="text-gray-600">
            No articles were published during the week of {formatWeekRange(weekStart, weekEnd)},{' '}
            {selectedYear}.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-700 transition-colors font-serif"
          >
            Go to Current Week
          </Link>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-center">Week Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded border">
            <div className="text-2xl font-bold text-blue-600">{contentItems.docs.length}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          <div className="bg-white p-4 rounded border">
            <div className="text-2xl font-bold text-green-600">
              {contentItems.docs.filter((item: ContentItem) => item.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-white p-4 rounded border">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                contentItems.docs.reduce(
                  (sum: number, item: ContentItem) => sum + (item.estimatedReadTime || 0),
                  0,
                ),
              )}
            </div>
            <div className="text-sm text-gray-600">Total Read Time (min)</div>
          </div>
          <div className="bg-white p-4 rounded border">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(contentItems.docs.map((item: ContentItem) => item.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get available years with content
async function getAvailableYears(payload: any): Promise<number[]> {
  try {
    // Start from February 2025 as requested
    const startYear = 2025
    const currentYear = new Date().getFullYear()

    const years: number[] = []

    for (let year = startYear; year <= currentYear; year++) {
      const yearStart = new Date(year, 0, 1)
      const yearEnd = new Date(year, 11, 31)

      const count = await payload.count({
        collection: 'contentItem',
        where: {
          isProcessed: { equals: true },
          publishDate: {
            greater_than_equal: yearStart.toISOString(),
            less_than_equal: yearEnd.toISOString(),
          },
        },
      })

      if (count.totalDocs > 0) {
        years.push(year)
      }
    }

    return years.sort((a, b) => b - a) // Most recent first
  } catch (error) {
    console.error('Error fetching available years:', error)
    return [new Date().getFullYear()]
  }
}

// Helper function to get available weeks with content for a year
async function getAvailableWeeks(payload: any, year: number): Promise<number[]> {
  try {
    const weeks: number[] = []

    // Check each week of the year
    for (let week = 1; week <= 53; week++) {
      const { start, end } = getDateFromWeek(year, week)

      // Skip weeks outside the year
      if (start.getFullYear() !== year && end.getFullYear() !== year) {
        continue
      }

      const count = await payload.count({
        collection: 'contentItem',
        where: {
          isProcessed: { equals: true },
          publishDate: {
            greater_than_equal: start.toISOString(),
            less_than_equal: end.toISOString(),
          },
        },
      })

      if (count.totalDocs > 0) {
        weeks.push(week)
      }
    }

    return weeks.sort((a, b) => b - a) // Most recent first
  } catch (error) {
    console.error('Error fetching available weeks:', error)
    return [getWeekNumber(new Date())]
  }
}
