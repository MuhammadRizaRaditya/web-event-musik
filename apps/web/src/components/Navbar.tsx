'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Beranda', href: '/' },
  { name: 'Event', href: '/events' },
  { name: 'Lineup', href: '/lineup' },
  { name: 'Galeri', href: '/gallery' },
  { name: 'FAQ', href: '/faq' }
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const userRole = (session?.user as { role?: string } | undefined)?.role

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950/95 backdrop-blur-sm border-b border-dark-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" aria-label="Soundwave Fest Home">
              <svg className="h-10 w-10 text-primary" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26C10.5 28 6 23.5 6 16S10.5 4 16 4s14 4.5 14 10-4.5 14-14 14zm-1-10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm0 6c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
              </svg>
              <span className="font-display text-2xl font-bold text-white hidden sm:block">Soundwave Fest</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-primary transition-colors font-medium text-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {status === 'loading' ? (
              <div className="h-10 w-24 skeleton rounded-lg" />
            ) : session ? (
              <>
                <Link
                  href="/my-account"
                  className="btn btn-secondary btn-sm hidden sm:flex"
                >
                  <User className="h-4 w-4 mr-2" />
                  Akun Saya
                </Link>
                {userRole === 'admin' || userRole === 'organizer' ? (
                  <Link href="/admin" className="btn btn-primary btn-sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/checkout" className="btn btn-primary btn-sm">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Beli Tiket
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn btn-ghost btn-sm"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm hidden sm:flex">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Daftar
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-dark-800 animate-slide-down">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-2 py-2 text-gray-300 hover:text-primary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <hr className="border-dark-800 my-2" />
              {session ? (
                <>
                  <Link
                    href="/my-account"
                    className="block px-2 py-2 text-gray-300 hover:text-primary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Akun Saya
                  </Link>
                  {userRole === 'admin' || userRole === 'organizer' ? (
                    <Link
                      href="/admin"
                      className="block px-2 py-2 text-primary font-medium rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/checkout"
                      className="block px-2 py-2 text-primary font-medium rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Beli Tiket
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-2 py-2 text-gray-300 hover:text-red-400 rounded-lg"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    href="/login"
                    className="block px-2 py-2 text-gray-300 hover:text-primary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary w-full text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}