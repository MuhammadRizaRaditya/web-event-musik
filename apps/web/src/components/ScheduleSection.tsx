'use client'

import { useState } from 'react'
import { Clock, Music, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type ScheduleItem = {
  time: string
  endTime: string
  stage: 'Main Stage' | 'Hip Hop Stage' | 'Indie Stage'
  artist: string
  genre: string
  headliner?: boolean
}

const scheduleData: Record<string, ScheduleItem[]> = {
  'Hari 1 - 31 Des 2026': [
    { time: '14:00', endTime: '15:00', stage: 'Main Stage', artist: 'Opening DJ Set', genre: 'EDM' },
    { time: '15:00', endTime: '16:00', stage: 'Main Stage', artist: 'Bassface', genre: 'EDM' },
    { time: '16:00', endTime: '17:00', stage: 'Main Stage', artist: 'Dipha Barus', genre: 'EDM' },
    { time: '17:00', endTime: '18:30', stage: 'Main Stage', artist: 'White Shoes & The Couples Company', genre: 'Jazz/Pop' },
    { time: '18:30', endTime: '19:30', stage: 'Main Stage', artist: 'Yura Yunita', genre: 'Pop' },
    { time: '19:30', endTime: '20:30', stage: 'Main Stage', artist: 'Reality Club', genre: 'Indie Pop' },
    { time: '20:30', endTime: '22:00', stage: 'Main Stage', artist: 'NIKI', genre: 'Pop/R&B', headliner: true },
    { time: '22:00', endTime: '23:30', stage: 'Main Stage', artist: 'Martin Garrix', genre: 'EDM', headliner: true },

    { time: '14:30', endTime: '15:30', stage: 'Hip Hop Stage', artist: 'DJ Jizzy', genre: 'EDM' },
    { time: '15:30', endTime: '16:30', stage: 'Hip Hop Stage', artist: 'Matter Mos', genre: 'Hip Hop' },
    { time: '16:30', endTime: '17:30', stage: 'Hip Hop Stage', artist: 'Ramengvrl', genre: 'Hip Hop' },
    { time: '17:30', endTime: '19:00', stage: 'Hip Hop Stage', artist: 'Rich Brian', genre: 'Hip Hop', headliner: true },

    { time: '15:00', endTime: '16:00', stage: 'Indie Stage', artist: 'Local Band Showcase', genre: 'Rock/Indie' },
    { time: '16:00', endTime: '17:00', stage: 'Indie Stage', artist: 'The Adams', genre: 'Rock' },
    { time: '17:00', endTime: '18:30', stage: 'Indie Stage', artist: 'Indie Stage Headliner', genre: 'Indie', headliner: true }
  ]
}

const stages = ['Main Stage', 'Hip Hop Stage', 'Indie Stage']

export function ScheduleSection() {
  const [activeDay, setActiveDay] = useState(0)
  const days = Object.keys(scheduleData)

  return (
    <section className="py-20 px-4 bg-dark-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Jadwal Pertunjukan
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Rencanakan hari festival Anda dengan jadwal lengkap di 3 stage
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setActiveDay(index)}
              className={cn(
                'px-6 py-3 rounded-xl font-medium transition-all duration-200',
                activeDay === index
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-dark-900 text-gray-300 hover:bg-dark-800 border border-dark-700'
              )}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 font-medium text-gray-400 w-24">Waktu</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Main Stage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Hip Hop Stage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Indie Stage</th>
              </tr>
            </thead>
            <tbody>
              {(scheduleData[days[activeDay]] ?? [])
                .filter((item: ScheduleItem) => item.stage === 'Main Stage')
                .map((mainItem: ScheduleItem) => {
                  const currentDayItems = scheduleData[days[activeDay]] ?? []
                  const hiphopItem = currentDayItems.find(
                    (item: ScheduleItem) => item.stage === 'Hip Hop Stage' && item.time === mainItem.time
                  )
                  const indieItem = currentDayItems.find(
                    (item: ScheduleItem) => item.stage === 'Indie Stage' && item.time === mainItem.time
                  )

                  return (
                    <tr key={`${mainItem.time}-${mainItem.stage}`} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                      <td className="py-4 px-4 font-mono text-primary font-medium">
                        {mainItem.time} - {mainItem.endTime}
                      </td>
                      <td className="py-4 px-4">
                        <ScheduleCell item={mainItem} />
                      </td>
                      <td className="py-4 px-4">
                        {hiphopItem ? <ScheduleCell item={hiphopItem} /> : <span className="text-gray-500 italic">—</span>}
                      </td>
                      <td className="py-4 px-4">
                        {indieItem ? <ScheduleCell item={indieItem} /> : <span className="text-gray-500 italic">—</span>}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-8">
          <a href="/schedule" className="btn btn-outline btn-lg border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600">
            Lihat Jadwal Lengkap
            <Clock className="h-5 w-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  )
}

function ScheduleCell({ item }: { item: any }) {
  return (
    <div className={cn(
      'p-3 rounded-lg transition-colors',
      item.headliner ? 'bg-primary/10 border border-primary/30' : 'bg-dark-800/50'
    )}>
      <p className="font-semibold text-white">{item.artist}</p>
      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
        <Music className="h-3 w-3" />
        {item.genre}
      </p>
      {item.headliner && (
        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </span>
          HEADLINER
        </span>
      )}
    </div>
  )
}