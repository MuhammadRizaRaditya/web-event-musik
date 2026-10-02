'use client'

import Link from 'next/link'
import { ArrowRight, Music, MapPin, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  event?: {
    name: string
    tagline: string
    date: string
    venue: string
    bannerUrl?: string
  }
}

export function HeroSection({ event }: HeroSectionProps) {
  const eventData = event || {
    name: 'SOUNDWAVE FEST 2026',
    tagline: 'Feel The Rhythm',
    date: '31 Desember 2026',
    venue: 'Istora Senayan, Jakarta'
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20 animate-pulse"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Music className="h-4 w-4" />
            Festival Musik Terbesar 2026
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {eventData.name}
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
          &ldquo;{eventData.tagline}&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 text-gray-400">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-lg">{eventData.date}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-lg">{eventData.venue}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <Link
            href="/events/soundwave-fest-2026/tickets"
            className="btn btn-primary btn-lg group"
          >
            Beli Tiket Sekarang
            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/events/soundwave-fest-2026/lineup"
            className="btn btn-outline btn-lg border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
          >
            Lihat Lineup
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}