'use client'

import Image from 'next/image'
import { Image as ImageIcon, Video, Expand, Instagram, Share2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const galleryImages = [
  { id: 1, src: '/gallery/1.jpg', alt: 'Crowd at Main Stage', type: 'image' },
  { id: 2, src: '/gallery/2.jpg', alt: 'Martin Garrix performing', type: 'image' },
  { id: 3, src: '/gallery/3.jpg', alt: 'Crowd singing along', type: 'image' },
  { id: 4, src: '/gallery/4.jpg', alt: 'Stage lighting', type: 'image' },
  { id: 5, src: '/gallery/5.jpg', alt: 'Food court area', type: 'image' },
  { id: 6, src: '/gallery/6.jpg', alt: 'Merchandise booth', type: 'image' },
  { id: 7, src: '/gallery/7.jpg', alt: 'Sunset at venue', type: 'image' },
  { id: 8, src: '/gallery/8.jpg', alt: 'Aftermovie teaser', type: 'video', videoUrl: 'https://www.youtube.com/embed/xxx' }
]

const memories = [
  { id: 1, author: 'Sarah W.', avatar: '/avatars/1.jpg', content: 'Best festival experience ever! Martin Garrix closing set gave me goosebumps 😭', image: '/memories/1.jpg', likes: 234 },
  { id: 2, author: 'Andi P.', avatar: '/avatars/2.jpg', content: 'Rich Brian brought the energy! Crowd was insane. See you next year!', likes: 189 },
  { id: 3, author: 'Maya S.', avatar: '/avatars/3.jpg', content: 'The venue setup was amazing. Food options were great too. 10/10', likes: 156 }
]

export function GallerySection() {
  return (
    <section className="py-20 px-4 bg-dark-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Gallery & Memories
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Kenangan indah dari Soundwave Fest tahun lalu dan momen yang dibagikan pengunjung
            </p>
          </div>
          <a href="/gallery" className="btn btn-outline border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600">
            Lihat Semua
            <ImageIcon className="h-5 w-5 ml-2" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {galleryImages.slice(0, 8).map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-dark-800">
              {item.type === 'video' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </button>
                </div>
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex items-center justify-between w-full">
                  <span className="text-white text-sm font-medium">{item.alt}</span>
                  <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Expand className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h3 className="font-display text-2xl font-bold text-white mb-6">Memories dari Pengunjung</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <article key={memory.id} className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                {memory.image && (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={memory.image}
                      alt={`Memory by ${memory.author}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={memory.avatar} alt={memory.author} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-white">{memory.author}</p>
                      <p className="text-xs text-gray-400">@instagram</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{memory.content}</p>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                      <Heart className="h-4 w-4" />
                      {memory.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Share2 className="h-4 w-4" />
                      Bagikan
                    </button>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a href="/memories" className="btn btn-primary">
            Bagikan Kenangan Anda
            <ImageIcon className="h-5 w-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  )
}