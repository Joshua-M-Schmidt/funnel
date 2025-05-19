import React from 'react'
import Link from 'next/link'
import ContentList from './components/ContentList'
import { loadContentItems } from './actions'

export default async function HomePage({ searchParams }: any) {
  // Fetch initial articles for the specific week
  const initialItems = await loadContentItems()
  const initialContent = initialItems.items

  return (
    <div className="flex flex-col md:flex-row  relative">
      {/* Newspaper Header */}
      <header className="text-center  mb-8 p-5">
        <h1 className="text-6xl font-bold tracking-widest mb-0 text-white uppercase ">Funnel</h1>
      </header>

      {/* Content Display */}
      {initialContent.length > 0 && (
        <ContentList initialItems={initialContent} loadMore={loadContentItems} />
      )}
    </div>
  )
}
