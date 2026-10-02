'use client'

import { Info, AlertCircle, CheckCircle, XCircle, Music, Users, Shield, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'

const infoItems = [
  {
    icon: Music,
    title: 'Lineup Luar Biasa',
    description: 'Artis lokal & internasional terbaik di 3 stage dengan genre EDM, Hip Hop, Rock, dan Pop.'
  },
  {
    icon: Users,
    title: 'Pengalaman Bersama',
    description: 'Area makanan, merchandise, photo spot, dan zona chill untuk pengalaman festival lengkap.'
  },
  {
    icon: Shield,
    title: 'Keamanan Terjamin',
    description: 'Tim keamanan profesional, medis siaga, dan protokol kesehatan ketat untuk kenyamanan Anda.'
  },
  {
    icon: Ticket,
    title: 'E-Ticket Digital',
    description: 'Pembelian online aman, e-ticket QR Code instan, dan check-in cepat di gerbang venue.'
  }
]

const importantInfo = [
  { type: 'warning', title: 'Bawa KTP/Identitas', desc: 'Wajib menunjukkan KTP asli yang sesuai dengan nama pemilik tiket saat check-in.' },
  { type: 'info', title: 'Gerbang Buka', desc: 'Gerbang venue dibuka pukul 14:00 WIB. Datang lebih awal untuk menghindari antrian panjang.' },
  { type: 'info', title: 'Barang Terlarang', desc: 'Minuman keras, senjata tajam, narkotika, drone, dan barang berbahaya lainnya dilarang dibawa masuk.' },
  { type: 'success', title: 'Re-entry Diperbolehkan', desc: 'Anda boleh keluar & masuk kembali venue dengan menunjukkan wristband yang tetap terpasang di pergelangan tangan.' }
]

export function EventInfoSection() {
  return (
    <section className="py-20 px-4 bg-dark-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Informasi Event
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Segala yang perlu Anda ketahui sebelum datang ke Soundwave Fest 2026
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {infoItems.map((item, index) => (
            <div key={index} className="group bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8">
          <h3 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Info className="h-6 w-6 text-primary" />
            Informasi Penting
          </h3>
          <div className="space-y-4">
            {importantInfo.map((item, index) => (
              <div key={index} className={cn(
                'flex gap-4 p-4 rounded-xl border transition-colors',
                item.type === 'warning' && 'bg-amber-500/10 border-amber-500/20',
                item.type === 'info' && 'bg-blue-500/10 border-blue-500/20',
                item.type === 'success' && 'bg-green-500/10 border-green-500/20'
              )}>
                <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
                  item.type === 'warning' && 'bg-amber-500/20 text-amber-400',
                  item.type === 'info' && 'bg-blue-500/20 text-blue-400',
                  item.type === 'success' && 'bg-green-500/20 text-green-400'
                )}>
                  {item.type === 'warning' && <AlertCircle className="h-5 w-5" />}
                  {item.type === 'info' && <Info className="h-5 w-5" />}
                  {item.type === 'success' && <CheckCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}