'use client'

/**
 * Access Indicator Component
 * 
 * Displays visual security indicator based on classification level
 */

import { useState } from 'react'

type Classification = 'public' | 'internal' | 'confidential' | 'restricted'

interface AccessIndicatorProps {
  classification: Classification
  sensitive?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function AccessIndicator({ 
  classification, 
  sensitive = false,
  size = 'md' 
}: AccessIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Configuration for each classification level
  const config = {
    public: {
      icon: '🟢',
      label: 'PUBLIC',
      description: 'Accessible to everyone',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      lockIcon: null,
    },
    internal: {
      icon: '🟡',
      label: 'INTERNAL',
      description: 'Internal team access only',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      lockIcon: null,
    },
    confidential: {
      icon: '🔴',
      label: 'CONFIDENTIAL',
      description: 'Restricted to authorized personnel',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      lockIcon: '🔒',
    },
    restricted: {
      icon: '🔴',
      label: 'RESTRICTED',
      description: 'Highest security level - Admin only',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      lockIcon: '🔒🔒',
    },
  }

  const settings = config[classification]

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${settings.bgColor} ${settings.textColor} ${settings.borderColor} ${sizeClasses[size]} cursor-help`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span>{settings.icon}</span>
        <span>{settings.label}</span>
        {settings.lockIcon && <span className="ml-0.5">{settings.lockIcon}</span>}
        {sensitive && <span className="ml-0.5" title="Sensitive Content">⚠️</span>}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          <div className="font-medium">{settings.description}</div>
          {settings.lockIcon && (
            <div className="text-slate-300 mt-1">
              {settings.lockIcon} Encrypted at rest
            </div>
          )}
          {sensitive && (
            <div className="text-yellow-300 mt-1">
              ⚠️ Contains sensitive information
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}
