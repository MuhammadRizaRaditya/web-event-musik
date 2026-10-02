'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, YouTube, Spotify, Mail, MapPin, Phone, Heart, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

const footerLinks = {
  event: [
    { name: 'Lineup', href: '/lineup' },
    { name: 'Jadwal', href: '/schedule' },
    { name: 'Tiket', href: '/tickets' },
    { name: 'Venue', href: '/venue' },
    { name: 'FAQ', href: '/faq' }
  ],
  company: [
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Karir', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Partner', href: '/partners' },
    { name: 'Hubungi Kami', href: '/contact' }
  ],
  legal: [
    { name: 'Syarat & Ketentuan', href: '/terms' },
    { name: 'Kebijakan Privasi', href: '/privacy' },
    { name: 'Kebijakan Refund', href: '/refund-policy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Aksesibilitas', href: '/accessibility' }
  ],
  support: [
    { name: 'Bantuan', href: '/help' },
    { name: 'Cara Pembelian', href: '/how-to-buy' },
    { name: 'Cara Check-in', href: '/how-to-checkin' },
    { name: 'Transfer Tiket', href: '/transfer-ticket' },
    { name: 'Refund', href: '/refund-request' }
  ]
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/soundwavefest', icon: Instagram, color: 'text-pink-500' },
  { name: 'Twitter', href: 'https://twitter.com/soundwavefest', icon: Twitter, color: 'text-blue-400' },
  { name: 'Facebook', href: 'https://facebook.com/soundwavefest', icon: Facebook, color: 'text-blue-600' },
  { name: 'YouTube', href: 'https://youtube.com/soundwavefest', icon: YouTube, color: 'text-red-500' },
  { name: 'Spotify', href: 'https://spotify.com/soundwavefest', icon: Spotify, color: 'text-green-500' }
]

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6" aria-label="Soundwave Fest Home">
              <svg className="h-12 w-12 text-primary" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26C10.5 28 6 23.5 6 16S10.5 4 16 4s14 4.5 14 10-4.5 14-14 14zm-1-10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm0 6c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
              </svg>
              <span className="font-display text-2xl font-bold text-white">Soundwave Fest</span>
            </Link>
            <p className="text-gray-400 text-lg mb-6 max-w-xs">
              Festival musik terbesar Indonesia. Merasakan irama, hidupkan semangat, ciptakan kenangan.
            </p>
            <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Istora Senayan, Jakarta</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-primary" />
                <span>+62 21-xxxx-xxxx</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-10 h-10 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center transition-all duration-200',
                    'hover:bg-primary hover:border-primary hover:text-white'
                  )}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" style={{ color: social.color }} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Event</h4>
            <nav aria-label="Event links">
              <ul className="space-y-3">
                {footerLinks.event.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Perusahaan</h4>
            <nav aria-label="Company links">
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <nav aria-label="Legal links">
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Dukungan</h4>
            <nav aria-label="Support links">
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Soundwave Fest. All rights reserved.
              <span className="flex items-center gap-1 mx-2">
                <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                Dibuat dengan cinta di Indonesia
              </span>
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Made with Next.js 14 + NestJS + PostgreSQL</span>
              <a href="/changelog" className="hover:text-primary transition-colors">Changelog v1.0.0</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}