import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '700']
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'Darpapaya Legacy OS',
  description: 'Sistema de Gestión Gastronómica para Darpapaya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} ${inter.variable} font-inter bg-darpapaya-black text-white`}>
        {children}
      </body>
    </html>
  )
}
