import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import ContentItemCard from './components/ContentCard'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const contentItems = await payload.find({
    collection: 'contentItem',
    where: {
      and: [
        {
          isProcessed: { equals: true },
        },
        {
          hidden: { equals: false },
        },
      ],
    },
    limit: 50,
    sort: '-publishDate',
  })

  // Get current date for newspaper header
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-7xl mx-auto p-5 font-serif relative">
      {/* Newspaper Header */}
      <header className="text-center border-b-4 border-black mb-8 pb-5 mt-16">
        <h1 className="text-6xl font-bold tracking-widest mb-0 text-gray-900 uppercase font-serif">
          DIGEST
        </h1>
        <div className="text-sm text-gray-600 mt-2.5 tracking-wider uppercase">
          {currentDate.toUpperCase()} - {contentItems.docs.length} ARTICLES
        </div>
      </header>

      {/* Newspaper Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-5">
        {contentItems.docs.map((item, index) => (
          <ContentItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}
