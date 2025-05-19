'use client'

import React from 'react'

interface IndexIndicatorProps {
  label: string
  value: number
  gradient: {
    from: string
    to: string
  }
}

export default function IndexIndicator({ label, value, gradient }: IndexIndicatorProps) {
  // Calculate color strength based on value (0-10)
  const getColorStrength = (value: number) => {
    if (value >= 0 && value < 2) return '800/30'
    if (value >= 2 && value < 4) return '700/40'
    if (value >= 4 && value < 6) return '600/50'
    if (value >= 6 && value < 8) return '500/80'
    if (value >= 8 && value <= 10) return '500/100'
  }

  const fromColor = `${gradient.from}-${getColorStrength(value)}`
  const toColor = `${gradient.to}-${getColorStrength(value)}`

  return (
    <div
      className={`text-xs bg-gradient-to-r from-${fromColor} to-${toColor} rounded-full pl-1 font-bold flex items-center`}
    >
      {label}{' '}
      <div className="bg-black/20 rounded-full px-1 h-4 flex items-center justify-center ml-1">
        {value}
      </div>
    </div>
  )
}
