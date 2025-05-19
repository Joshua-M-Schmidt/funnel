'use client'

import React, { useState } from 'react'
import ContentPopup from './ContentPopup'
import { ContentItem, Source } from '@/payload-types'

interface ContentItemCardProps {
  item: ContentItem
  index: number
}

export default function ContentItemCard({ item, index }: ContentItemCardProps) {
  return (
    <div className={`flex flex-row gap-4 w-full relative pl-[18px] ${index === 0 && 'pt-8'}`}>
      <div className="w-[1px] bg-slate-700 absolute top-0 left-0 h-full ml-[5px]">
        <div
          className={`rounded-full w-[11px] h-[11px] bg-slate-700 absolute ${
            index === 0 ? 'top-10' : 'top-2'
          } left-[-5px]`}
        ></div>
      </div>
      <article
        className={`
         pb-5 break-inside-avoid w-full px-6
      `}
      >
        {/* Article Header */}
        <header className="mb-4">
          {item.publishDate && (
            <div className="text-xs text-sky-500 uppercase tracking-wider font-bold">
              {new Date(item.publishDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
          <h2
            className={`
            font-bold leading-tight mb-2 text-gray-100
            text-xl md:text-2xl mt-2
          `}
          >
            {item.title}{' '}
            <span className="text-xs text-sky-600">({(item?.source as Source)?.name || ''})</span>
          </h2>

          {item.category && (
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
              {item.category.toUpperCase()}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="text-sm leading-relaxed text-gray-300">
          {item.summary && <p className="mb-3 text-gray-100 italic text-justify">{item.summary}</p>}

          {item.bulletPoints && item.bulletPoints.length > 0 && (
            <div className="flex mb-2 flex-wrap gap-1.5 mb-2.5 p-2 rounded-md text-slate-200 border border-slate-700 ">
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
                  className="bg-sky-900 text-white px-1.5 py-0.5 rounded text-xs uppercase tracking-wider"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Article Meta */}
          <div className="flex justify-between items-center mt-2.5 text-xs text-gray-50 pt-2 ">
            <span className="font-bold">Priority: {item.priority}</span>
          </div>

          {/* View Full Content Button */}
          <div className="flex ">
            <a
              href={item.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
              text-sky-500 border-none py-1 px-2 text-sm cursor-pointer 
              mt-2  tracking-wider transition-colors duration-300
              hover:bg-gray-700 bg-sky-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            "
              type="button"
            >
              {item.estimatedReadTime && (
                <span className="italic font-bold">{item.estimatedReadTime} min read </span>
              )}
              Read Full Article →
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
