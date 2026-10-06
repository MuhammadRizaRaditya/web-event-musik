import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Tambahan warna standard Shadcn UI agar tidak eror compile
        border: 'hsl(var(--border, 240 5.9% 90%))',
        input: 'hsl(var(--input, 240 5.9% 90%))',
        ring: 'hsl(var(--ring, 240 5.9% 10%))',
        background: 'hsl(var(--background, 0 0% 100%))',
        foreground: 'hsl(var(--foreground, 240 10% 3.9%))',
        
        primary: {
          DEFAULT: '#FF6B00', // Warna utama jika dipanggil bg-primary
          50: '#fff4ed',
          100: '#ffe8d1',
          200: '#ffd1a3',
          300: '#ffad66',
          400: '#ff8c33',
          500: '#FF6B00',
          600: '#e65a00',
          700: '#cc4d00',
          800: '#b34000',
          900: '#993300',
          950: '#4d1a00'
        },
        dark: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c8c8c8',
          400: '#a8a8a8',
          500: '#888888',
          600: '#686868',
          700: '#505050',
          800: '#383838',
          900: '#1A1A1A',
          950: '#0A0A0A'
        }
      },
      fontFamily: {
        display: ['Oswald', 'Bebas Neue', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'url("/hero-pattern.svg")'
      }
    }
  },
  plugins: []
}

export default config
