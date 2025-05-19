'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { ContentItem } from '@/payload-types'

// Helper functions for week calculations
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

export async function loadContentItems(page: number = 1) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const contentItems = await payload.find({
    collection: 'contentItem',
    where: {
      isProcessed: { equals: true },
    },
    limit: 20,
    page: page,
    sort: '-publishDate',
  })

  // filter out icons where all indexes at the same time are 0 ( philosophyIndex, personalIndex, historyIndex, scienceIndex, aiIndex)
  const filteredItems = contentItems.docs.filter((item: ContentItem) => {
    return (
      (item.philosophyIndex && item.philosophyIndex > 0) ||
      (item.personalIndex && item.personalIndex > 0) ||
      (item.historyIndex && item.historyIndex > 0) ||
      (item.scienceIndex && item.scienceIndex > 0) ||
      (item.aiIndex && item.aiIndex > 0)
    )
  })

  return {
    items: filteredItems,
    hasMore: contentItems.hasNextPage,
    totalPages: contentItems.totalPages,
  }
}
