'use client'

import Image from 'next/image'
import { Star, Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const artists = [
  { name: 'Martin Garrix', genre: 'EDM', headliner: true, image: '/artists/martin-garrix.jpg' },
  { name: 'Rich Brian', genre: 'Hip Hop', headliner: true, image: '/artists/rich-brian.jpg' },
  { name: 'The Adams', genre: 'Rock', headliner: false, image: '/artists/the-adams.jpg' },
  { name: 'NIKI', genre: 'Pop/R&B', headliner: true, image: '/artists/niki.jpg' },
  { name: 'Dipha Barus', genre: 'EDM', headliner: false, image: '/artists/dipha-barus.jpg' },
  { name: 'Matter Mos', genre: 'Hip Hop', headliner: false, image: '/artists/matter-mos.jpg' },
  { name: 'Reality Club', genre: 'Indie Pop', headliner: false, image: '/artists/reality-club.jpg' },
  { name: 'Bassface', genre: 'EDM', headliner: false, image: '/artists/bassface.jpg' },
  { name: 'Yura Yunita', genre: 'Pop', headliner: false, image: '/artists/yura-yunita.jpg' },
  { name: 'Ramengvrl', genre: 'Hip Hop', headliner: false, image: '/artists/ramengvrl.jpg' },
  { name: 'White Shoes & The Couples Company', genre: 'Jazz/Pop', headliner: false, image: '/artists/white-shoes.jpg' },
  { name: 'DJ Jizzy', genre: 'EDM', headliner: false, image: '/artists/dj-jizzy.jpg' }
]

export function LineupSection() {
  return (
    <section className="py-20 px-4 bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Lineup 2026
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            3 Stage, 30+ Artis, 12 Jam Non-Stop Musik
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artists.map((artist, index) => (
            <article key={artist.name} className="group relative bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div className="absolute inset-0 bg-[url('/artist-placeholder.svg')] bg-cover bg-center" />
                {artist.headliner && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2 py-1 bg-primary/90 text-white text-xs font-bold rounded-full">
                    <Star className="h-3 w-3" fill="currentColor" />
                    HEADLINER
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-primary transition-colors">
                  {artist.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Music2 className="h-4 w-4" />
                  <span>{artist.genre}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/lineup" className="btn btn-outline btn-lg border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600">
            Lihat Lineup Lengkap
            <Music2 className="h-5 w-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  )
}