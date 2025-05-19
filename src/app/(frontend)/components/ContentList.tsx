'use client'

import { ContentItem } from '@/payload-types'
import ContentItemCard from './ContentCard'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams } from 'next/navigation'

interface ContentListProps {
  initialItems: ContentItem[]
  loadMore: (
    page: number,
  ) => Promise<{ items: ContentItem[]; hasMore: boolean; totalPages: number }>
}

export default function ContentList({ initialItems, loadMore }: ContentListProps) {
  const [items, setItems] = useState<ContentItem[]>(initialItems)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView({
    threshold: 0,
  })

  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadMoreContent()
    }
  }, [inView])

  const loadMoreContent = async () => {
    if (loading) return
    setLoading(true)
    try {
      const nextPage = currentPage + 1
      const result = await loadMore(nextPage)

      if (result.items.length > 0) {
        // Filter out any potential duplicates by ID
        const existingIds = new Set(items.map((item) => item.id))
        const uniqueNewItems = result.items.filter((item) => !existingIds.has(item.id))

        setItems((prev) => [...prev, ...uniqueNewItems])
        setCurrentPage(nextPage)
        setHasMore(result.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more content:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:h-screen overflow-y-auto">
      <div className="flex w-full flex-col">
        {items.map((item, index) => (
          <ContentItemCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && <div ref={ref} className="h-10" />}

      {/* No more content message */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-4 text-gray-500">No more articles to load</div>
      )}
    </div>
  )
}
