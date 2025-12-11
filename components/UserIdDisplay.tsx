'use client'

/**
 * User ID Display Component
 * 
 * Displays user ID with toggle to show/hide (mask/unmask)
 */

import { useState } from 'react'

interface UserIdDisplayProps {
  userId: string
}

export default function UserIdDisplay({ userId }: UserIdDisplayProps) {
  const [isVisible, setIsVisible] = useState(false)

  const maskUserId = (id: string): string => {
    if (id.length <= 8) {
      return '•'.repeat(id.length)
    }
    // Show first 4 and last 4 characters, mask the rest
    const firstPart = id.slice(0, 4)
    const lastPart = id.slice(-4)
    const maskedPart = '•'.repeat(id.length - 8)
    return `${firstPart}${maskedPart}${lastPart}`
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-slate-900 font-mono text-xs select-all">
        {isVisible ? userId : maskUserId(userId)}
      </span>
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="p-1 hover:bg-slate-100 rounded transition-colors"
        aria-label={isVisible ? 'Hide User ID' : 'Show User ID'}
      >
        {isVisible ? (
          <svg 
            className="w-4 h-4 text-slate-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
            />
          </svg>
        ) : (
          <svg 
            className="w-4 h-4 text-slate-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
            />
          </svg>
        )}
      </button>
    </div>
  )
}
