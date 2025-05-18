'use client'

import React, { useState } from 'react'
import ContentPopup from './ContentPopup'
import { ContentItem, Source } from '@/payload-types'

interface ContentItemCardProps {
  item: ContentItem
  index: number
}

export default function ContentItemCard({ item, index }: ContentItemCardProps) {
  // Determine if this is a main headline (first few items)
  const isMainHeadline = index < 2

  return (
    <>
      <article
        className={`
        border-b border-gray-300 pb-5 break-inside-avoid
        ${isMainHeadline ? 'md:col-span-2 border-b-2 border-black pb-6' : ''}
      `}
      >
        {/* Article Header */}
        <header className="mb-4">
          <h2
            className={`
            font-bold leading-tight mb-2 text-gray-900 font-serif
            ${isMainHeadline ? 'text-4xl leading-none mb-4' : 'text-xl'}
          `}
          >
            {item.title}{' '}
            <span className="text-xs text-blue-600">({(item?.source as Source)?.name || ''})</span>
          </h2>
          {item.publishDate && (
            <div className="text-xs text-gray-600 uppercase tracking-wider font-bold">
              {new Date(item.publishDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
          {item.category && (
            <div className="text-xs text-gray-600 uppercase tracking-wider font-bold">
              {item.category.toUpperCase()}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="text-sm leading-relaxed text-gray-700">
          {item.summary && <p className="mb-3 text-gray-600 italic text-justify">{item.summary}</p>}

          {item.bulletPoints && item.bulletPoints.length > 0 && (
            <div className="flex mb-2 flex-wrap gap-1.5 mb-2.5 bg-green-100 p-2 rounded-md text-green-700">
              <ul className="list-disc pl-5">
                {item.bulletPoints.map((bulletPoint, idx) => (
                  <li key={idx}>{bulletPoint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords as tags */}
          {item.keywords && item.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {item.keywords.slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="bg-blue-900 text-white px-1.5 py-0.5 rounded text-xs uppercase tracking-wider"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Article Meta */}
          <div className="flex justify-between items-center mt-2.5 text-xs text-gray-500 pt-2 border-t border-dotted border-gray-400">
            {item.estimatedReadTime && (
              <span className="italic">{item.estimatedReadTime} min read</span>
            )}
            <span className="font-bold">Priority: {item.priority}</span>
          </div>

          {/* View Full Content Button */}
          <div className="flex ">
            <a
              href={item.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
              bg-black text-white border-none py-2 px-4 text-sm cursor-pointer 
              mt-2 font-serif tracking-wider transition-colors duration-300
              hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            "
              type="button"
            >
              Read Full Article →
            </a>
          </div>
        </div>
      </article>
    </>
  )
}
