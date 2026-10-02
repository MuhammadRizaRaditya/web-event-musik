'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Bagaimana cara membeli tiket Soundwave Fest 2026?',
    a: 'Anda bisa membeli tiket langsung melalui website kami. Pilih kategori tiket yang diinginkan, isi data pembeli dan pemilik tiket, lalu lanjutkan ke pembayaran via Midtrans (Virtual Account, QRIS, E-Wallet, Kartu Kredit). Setelah pembayaran terverifikasi, e-ticket QR Code akan dikirim ke email Anda.'
  },
  {
    q: 'Apa yang termasuk dalam kategori tiket VIP dan VVIP?',
    a: 'VIP: Akses area VIP dengan view panggung terbaik, toilet premium, food court eksklusif, merchandise bundle, dan fast-track entry. VVIP: Semua fasilitas VIP ditambah meet & greet session dengan headliner, akses backstage tour, dedicated lounge, dan premium dining experience.'
  },
  {
    q: 'Apakah tiket bisa ditransfer ke orang lain?',
    a: 'Ya, tiket bisa ditransfer maksimal 1 kali melalui fitur "Transfer Tiket" di akun Anda. Penerima harus membuat akun Soundwave Fest. Transfer tidak bisa dilakukan pada hari event (H-0). Tiket yang sudah di-scan/check-in tidak bisa ditransfer.'
  },
  {
    q: 'Bagaimana cara check-in di venue menggunakan e-ticket?',
    a: 'Buka email konfirmasi atau aplikasi Soundwave Fest, tampilkan QR Code e-ticket di layar HP (brightness maksimal). Di gerbang, staf akan memindai QR Code menggunakan scanner. Pastikan HP Anda ausreichend battery. Bisa juga cetak QR Code jika HP bermasalah.'
  },
  {
    q: 'Apa kebijakan refund jika event dibatalkan?',
    a: 'Jika event dibatalkan oleh penyelenggara: refund 100% otomatis ke rekening pembayaran asli dalam 14 hari kerja. Jika event ditunda: tiket tetap berlaku untuk tanggal baru, atau bisa request refund penuh dalam 7 hari setelah pengumuman tanggal baru.'
  },
  {
    q: 'Apakah boleh membawa makanan/minuman dari luar?',
    a: 'Dilarang membawa makanan & minuman dari luar (kecuali bayi/balita & kebutuhan medis khusus). Di venue tersedia food court lengkap dengan berbagai pilihan makanan & minuman (halal, vegetarian, dll) dengan harga reasonable.'
  },
  {
    q: 'Apakah tersedia fasilitas untuk penyandang disabilitas?',
    a: 'Ya, kami menyediakan: akses ramp wheelchair di semua area, viewing platform khusus di setiap stage, toilet aksesibel, area parkir prioritas, dan staf bantuan dedicated. Hubungi customer service minimal H-7 untuk arrangemen khusus.'
  },
  {
    q: 'Bagaimana jika HP kehabisan baterai saat check-in?',
    a: 'Disarankan bawa power bank. Jika HP mati, tunjukkan bukti pembayaran (screenshot email/struk) + KTP asli di booth "Bantuan Check-in" di dekat gerbang utama. Staf akan verifikasi manual dan print ulang QR Code.'
  },
  {
    q: 'Apakah ada batas usia untuk masuk festival?',
    a: 'Festival bertahap 17+ (remaja 17-18 thn wajib disertai orang tua/wali dengan surat persetujuan). Anak di bawah 12 thn gratis jika disertai orang tua (maks 1 anak per dewasa) dan duduk di area family zone. Wajib bawa KTP/Kartu Keluarga untuk verifikasi usia.'
  },
  {
    q: 'Bagaimana cara menghubungi customer service?',
    a: 'Live chat di website (09:00-21:00 WIB), email: support@soundwavefest.com, WhatsApp: +62 812-XXXX-XXXX, Instagram DM: @soundwavefest. Untuk urgen hari event: datang ke booth "Information Center" di venue.'
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 px-4 bg-dark-950">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            Pertanyaan Umum
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Jawaban untuk pertanyaan yang sering ditanyakan tentang Soundwave Fest 2026
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-dark-900 border border-dark-700 rounded-xl overflow-hidden transition-all duration-300"
              open={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-semibold text-white text-lg pr-10">{faq.q}</h3>
                <div className={cn(
                  'w-6 h-6 flex items-center justify-center text-gray-400 transition-transform duration-300',
                  openIndex === index && 'rotate-180'
                )}>
                  {openIndex === index ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </summary>
              <div className="px-6 pb-6 text-gray-400 leading-relaxed animate-slide-down">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="text-center mt-12 p-8 bg-dark-900 border border-dark-700 rounded-2xl">
          <h3 className="font-display text-2xl font-bold text-white mb-3">Masih punya pertanyaan?</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Tim support kami siap membantu Anda kapan saja
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:support@soundwavefest.com" className="btn btn-primary">
              Email Support
            </a>
            <a href="https://wa.me/62812XXXXXXX" target="_blank" rel="noopener noreferrer" className="btn btn-outline border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}