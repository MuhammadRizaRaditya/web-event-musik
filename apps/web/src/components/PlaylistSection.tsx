'use client'

import { Spotify, Play, Music, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const playlists = [
  {
    title: 'Soundwave Fest 2026 - Official Playlist',
    description: 'Semua lagu dari artis yang tampil di festival tahun ini',
    cover: '/playlists/official-cover.jpg',
    platform: 'Spotify',
    url: 'https://open.spotify.com/playlist/xxx',
    tracks: 45,
    duration: '3 jam 20 menit'
  },
  {
    title: 'Soundwave Fest 2026 - Main Stage Anthems',
    description: 'Banganger dari headliner Main Stage: Martin Garrix, NIKI, Rich Brian',
    cover: '/playlists/main-stage-cover.jpg',
    platform: 'Spotify',
    url: 'https://open.spotify.com/playlist/xxx',
    tracks: 20,
    duration: '1 jam 45 menit'
  },
  {
    title: 'Soundwave Fest 2026 - Hip Hop Vibes',
    description: 'Flow terbaik dari Rich Brian, Ramengvrl, Matter Mos',
    cover: '/playlists/hiphop-cover.jpg',
    platform: 'Spotify',
    url: 'https://open.spotify.com/playlist/xxx',
    tracks: 18,
    duration: '1 jam 15 menit'
  },
  {
    title: 'Soundwave Fest 2026 - Indie Gems',
    description: 'Lagu-lagu indie dari Reality Club, The Adams, White Shoes',
    cover: '/playlists/indie-cover.jpg',
    platform: 'Spotify',
    url: 'https://open.spotify.com/playlist/xxx',
    tracks: 15,
    duration: '1 jam'
  }
]

export function PlaylistSection() {
  return (
    <section className="py-20 px-4 bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Official Playlist
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Dengarkan sekarang, hafalkan liriknya, dan siap bernyanyi bersama di festival!
            </p>
          </div>
          <a href="/playlist" className="btn btn-primary">
            <Spotify className="h-5 w-5 mr-2 text-green-500" />
            Buka di Spotify
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {playlists.map((playlist, index) => (
            <article key={playlist.title} className="group relative bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
              <div className="flex">
                <div className="relative w-48 h-48 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-dark-900" />
                  <div className="absolute inset-0 bg-[url('/playlist-placeholder.svg')] bg-cover bg-center opacity-30" />
                  <button className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600 shadow-lg shadow-green-500/25">
                    <Play className="h-6 w-6 text-white ml-1" />
                  </button>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full mb-3">
                      <Spotify className="h-3 w-3" />
                      {playlist.platform}
                    </span>
                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-primary transition-colors">
                      {playlist.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{playlist.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Music className="h-3 w-3" /> {playlist.tracks} lagu</span>
                      <span className="flex items-center gap-1"><Volume2 className="h-3 w-3" /> {playlist.duration}</span>
                    </div>
                  </div>
                  <a href={playlist.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 w-full text-center mt-4">
                    Buka Playlist
                    <Spotify className="h-4 w-4 ml-2 text-green-500" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/playlist" className="btn btn-outline btn-lg border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600">
            Lihat Semua Playlist
            <Spotify className="h-5 w-5 ml-2 text-green-500" />
          </a>
        </div>
      </div>
    </section>
  )
}