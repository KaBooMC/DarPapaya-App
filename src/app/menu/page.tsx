'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, ChevronRight, Utensils } from 'lucide-react'

const BRAND = {
  orange: '#D97706',
  gold: '#FDE047',
  black: '#0F0F0F',
  darkGray: '#1A1A1A',
  lightGray: '#2A2A2A',
  white: '#FFFFFF'
}

export default function TableSelectorPage() {
  const router = useRouter()
  const tables = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', color: BRAND.white, fontFamily: 'sans-serif', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '25px', background: `linear-gradient(135deg, #991B1B, ${BRAND.orange}, ${BRAND.gold})`, padding: '3px', margin: '0 auto 20px' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '22px', background: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '32px', fontWeight: '900', color: BRAND.gold }}>DP</span>
          </div>
        </div>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>BIENVENIDO A <span style={{ color: BRAND.orange }}>DAR</span>PAPAYA</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
          <MapPin size={16} color={BRAND.orange} />
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Armenia, Quindío</p>
        </div>
      </header>

      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: BRAND.darkGray, padding: '40px', borderRadius: '40px', border: `1px solid ${BRAND.lightGray}`, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        <Utensils size={40} color={BRAND.orange} style={{ marginBottom: '20px' }} />
        <h2 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: '900' }}>¿En qué mesa te encuentras?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', marginBottom: '40px' }}>Selecciona tu número de mesa para comenzar a pedir.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '15px' }}>
          {tables.map(t => (
            <button
              key={t}
              onClick={() => router.push(`/menu/${t}`)}
              style={{
                backgroundColor: BRAND.black,
                border: `1px solid ${BRAND.lightGray}`,
                padding: '20px 0',
                borderRadius: '20px',
                color: BRAND.white,
                fontSize: '20px',
                fontWeight: '900',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = BRAND.orange; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = BRAND.lightGray; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p style={{ marginTop: 'auto', paddingTop: '40px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Darpapaya Legacy OS • v1.0</p>
    </div>
  )
}
