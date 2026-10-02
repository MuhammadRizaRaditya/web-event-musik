'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  eventDate: string
  className?: string
}

export function CountdownTimer({ eventDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(eventDate).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [eventDate])

  const { days, hours, minutes, seconds } = timeLeft
  const isEventStarted = days === 0 && hours === 0 && minutes === 0 && seconds === 0

  if (isEventStarted) {
    return (
      <div className={cn('py-6 px-4 bg-primary/10 border-y border-primary/20', className)}>
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Event Sedang Berlangsung!
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('py-6 px-4 bg-dark-900/50 border-y border-dark-800', className)}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-4 md:gap-8">
          <CountdownCard value={days} label="Hari" />
          <CountdownCard value={hours} label="Jam" />
          <CountdownCard value={minutes} label="Menit" />
          <CountdownCard value={seconds} label="Detik" />
        </div>
      </div>
    </div>
  )
}

function CountdownCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="relative">
        <div className="font-display text-4xl md:text-6xl font-bold text-white tabular-nums">
          {value.toString().padStart(2, '0')}
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  )
}