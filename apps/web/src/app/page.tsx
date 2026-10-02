import { Suspense } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { EventInfoSection } from '@/components/EventInfoSection'
import { LineupSection } from '@/components/LineupSection'
import { ScheduleSection } from '@/components/ScheduleSection'
import { PlaylistSection } from '@/components/PlaylistSection'
import { GallerySection } from '@/components/GallerySection'
import { FAQSection } from '@/components/FAQSection'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { CountdownTimer } from '@/components/CountdownTimer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <CountdownTimer eventDate="2026-12-31T19:00:00+07:00" />
        <EventInfoSection />
        <LineupSection />
        <ScheduleSection />
        <PlaylistSection />
        <GallerySection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="skeleton h-16 w-3/4 mx-auto mb-8 rounded-lg" />
        <div className="skeleton h-8 w-1/2 mx-auto mb-12 rounded" />
        <div className="skeleton h-12 w-48 mx-auto mb-8 rounded" />
        <div className="flex gap-4 justify-center">
          <div className="skeleton h-12 w-40 rounded-lg" />
          <div className="skeleton h-12 w-40 rounded-lg" />
        </div>
      </div>
    </section>
  )
}