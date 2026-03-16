'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface TeamLogoProps {
  name: string
  logo?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
}

export function TeamLogo({ name, logo, size = 'md', className }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false)
  
  // Get initials from team name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (!logo || imageError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground',
          sizeClasses[size],
          textSizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-full bg-muted', sizeClasses[size], className)}>
      <Image
        src={logo}
        alt={`${name} logo`}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
