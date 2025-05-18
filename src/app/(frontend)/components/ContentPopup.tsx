'use client'

import { ContentItem } from '@/payload-types'
import React, { useEffect, useRef } from 'react'

interface ContentPopupProps {
  item: ContentItem
  onClose: () => void
}

export default function ContentPopup({ item, onClose }: ContentPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleOutsideClick)

    // Prevent body scrolling when popup is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-5">
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] w-full max-w-4xl h-full max-h-3xl flex flex-col overflow-hidden"
      >
        {/* Popup Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="m-0 text-2xl text-gray-900 font-serif flex-1 pr-5">{item.title}</h2>
          <button
            onClick={onClose}
            className="
              bg-transparent border-none text-2xl cursor-pointer p-2 text-gray-600 
              transition-colors duration-300 rounded hover:text-gray-900 hover:bg-gray-200
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            "
            type="button"
            aria-label="Close popup"
          >
            ✕
          </button>
        </header>

        {/* Popup Content */}
        <div className="flex-1 overflow-hidden relative">
          <iframe
            ref={iframeRef}
            src={item.originalUrl}
            className="w-full h-full border-none bg-white"
            title={`Content for ${item.title}`}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            loading="lazy"
          />
        </div>

        {/* Popup Footer */}
        <footer className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="
              bg-black text-white border-none py-2.5 px-5 text-sm cursor-pointer 
              rounded font-serif transition-colors duration-300
              hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            "
            type="button"
          >
            Close Article
          </button>
        </footer>
      </div>
    </div>
  )
}
