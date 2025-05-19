'use client'

import React, { useState } from 'react'
import ContentPopup from './ContentPopup'
import { ContentItem, Source } from '@/payload-types'
import IndexIndicator from './IndexIndicator'

interface ContentItemCardProps {
  item: ContentItem
  index: number
}

type ExpansionState = 'collapsed' | 'summary' | 'bullets' | 'full'

export default function ContentItemCard({ item, index }: ContentItemCardProps) {
  const [expansionState, setExpansionState] = useState<ExpansionState>('collapsed')

  const handleClick = () => {
    switch (expansionState) {
      case 'collapsed':
        setExpansionState('summary')
        break
      case 'summary':
        setExpansionState('bullets')
        break
      case 'bullets':
        setExpansionState('full')
        break
      case 'full':
        window.open(item.originalUrl, '_blank')
        break
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        flex flex-row gap-4 w-full relative pl-[18px] 
        pt-4
      `}
    >
      <div className="w-[1px] bg-slate-700 absolute top-0 left-0 h-full ml-[5px]">
        <div
          className={`rounded-full w-[11px] h-[11px] bg-slate-700 absolute top-8 left-[-5px]`}
        ></div>
      </div>
      <article
        className={`break-inside-avoid w-full px-4  cursor-pointer
        transition-all duration-200 ${expansionState !== 'collapsed' ? 'border border-slate-700 rounded-lg p-4 hover:border-sky-500' : 'hover:bg-slate-800/50 rounded-lg p-4'}`}
      >
        {/* Article Header */}
        <header className="">
          <div className="flex flex-row gap-2">
            {item.publishDate && (
              <div className="text-xs text-sky-500 uppercase tracking-wider font-bold">
                {new Date(item.publishDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            )}
            <IndexIndicator
              label="Philosophy"
              value={item.philosophyIndex || 0}
              gradient={{ from: 'sky', to: 'indigo' }}
            />
            <IndexIndicator
              label="History"
              value={item.historyIndex || 0}
              gradient={{ from: 'red', to: 'orange' }}
            />
            <IndexIndicator
              label="Science"
              value={item.scienceIndex || 0}
              gradient={{ from: 'orange', to: 'yellow' }}
            />
            <IndexIndicator
              label="AI"
              value={item.aiIndex || 0}
              gradient={{ from: 'indigo', to: 'purple' }}
            />
            <IndexIndicator
              label="Personal"
              value={item.personalIndex || 0}
              gradient={{ from: 'green', to: 'lime' }}
            />
          </div>
          <h2
            className={`
            font-bold leading-tight text-gray-100
            text-xl md:text-2xl mt-2
            flex items-center gap-2
          `}
          >
            {item.title.startsWith('Email')
              ? item.title.replace(/^Email\s*/i, '')
              : item.title}{' '}
          </h2>

          <span className="text-xs text-sky-600">({(item?.source as Source)?.name || ''})</span>
          <span className="text-sky-500 text-sm">
            {expansionState === 'collapsed' && ' +'}
            {expansionState === 'summary' && ' +'}
            {expansionState === 'bullets' && ' +'}
            {expansionState === 'full' && ' ↗'}
          </span>

          {item.category && (
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
              {item.category.toUpperCase()}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="text-sm leading-relaxed text-gray-300">
          {/* Summary - shown when expanded to summary or further */}
          {expansionState !== 'collapsed' && item.summary && (
            <p className="mb-3 text-gray-100 italic text-justify">{item.summary}</p>
          )}

          {/* Bullet Points - shown when expanded to bullets or full */}
          {expansionState !== 'collapsed' &&
            expansionState !== 'summary' &&
            item.bulletPoints &&
            item.bulletPoints.length > 0 && (
              <div className="flex mb-2 flex-wrap gap-1.5 mb-2.5 p-2 rounded-md text-slate-200 border border-slate-700">
                <ul className="list-disc pl-5">
                  {item.bulletPoints.map((bulletPoint, idx) => (
                    <li key={idx}>{bulletPoint}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Keywords - shown when expanded to full */}
          {expansionState === 'full' && item.keywords && item.keywords.length > 0 && (
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

          {/* Article Meta - shown when expanded to full */}
          {expansionState === 'full' && (
            <div className="flex justify-between items-center mt-2.5 text-xs text-gray-50 pt-2">
              <span className="font-bold">Priority: {item.priority}</span>
            </div>
          )}

          {/* Reading Time - shown when expanded to full */}
          {expansionState === 'full' && item.estimatedReadTime && (
            <div className="text-sky-500 text-sm mt-2 italic">
              {item.estimatedReadTime} min read
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
