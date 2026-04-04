'use client'
import Link from 'next/link'
import { Utensils, LayoutDashboard, ChefHat, Beer, MapPin, ShieldCheck, Zap, ChevronRight, Star } from 'lucide-react'

const BRAND = {
  orange: '#D97706',
  gold: '#FDE047',
  black: '#0F0F0F',
  darkGray: '#1A1A1A',
  lightGray: '#2A2A2A',
  red: '#991B1B',
  white: '#FFFFFF'
}

export default function Home() {
  const routes = [
    { 
      name: 'Menú Cliente', 
      href: '/menu/1', 
      icon: <Utensils size={32} />, 
      desc: 'Experiencia de autoservicio para comensales.',
      color: BRAND.orange,
      badge: 'Live'
    },
    { 
      name: 'Admin / Caja', 
      href: '/admin', 
      icon: <LayoutDashboard size={32} />, 
      desc: 'Gestión de mesas, pagos y reportes.',
      color: BRAND.gold,
      badge: 'Secure'
    },
    { 
      name: 'Cocina', 
      href: '/cocina', 
      icon: <ChefHat size={32} />, 
      desc: 'Monitor de despacho y términos de parrilla.',
      color: BRAND.red,
      badge: 'KDS'
    },
    { 
      name: 'Bar', 
      href: '/bar', 
      icon: <Beer size={32} />, 
      desc: 'Control de bebidas y preparación de bar.',
      color: '#3B82F6',
      badge: 'Bar'
    },
  ]

  return (
    <main style={{ backgroundColor: BRAND.black, minHeight: '100vh', color: BRAND.white, fontFamily: 'sans-serif', padding: '40px 20px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .grid-routes {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          width: 100%;
          max-width: 1000px;
        }
        @media (min-width: 768px) { .grid-routes { grid-template-columns: repeat(2, 1fr); } }
        .btn-hover:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
        .btn-active:active { transform: scale(0.98); }
        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, ${BRAND.orange}10 0%, transparent 70%);
          filter: blur(80px);
          z-index: 0;
        }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
      `}} />

      {/* ELEMENTOS DE FONDO */}
      <div className="glow-bg" style={{ top: '-10%', left: '-10%' }} />
      <div className="glow-bg" style={{ bottom: '-10%', right: '-10%', background: `radial-gradient(circle, ${BRAND.gold}05 0%, transparent 70%)` }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px' }}>
        
        {/* LOGO Y TÍTULO CENTRAL */}
        <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.orange}, ${BRAND.gold})`, padding: '4px', boxShadow: `0 20px 50px ${BRAND.orange}30`, animation: 'float 4s ease-in-out infinite' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '40px', fontWeight: '900', color: BRAND.gold }}>DP</span>
            </div>
          </div>
          
          <div>
            <h1 style={{ margin: 0, fontSize: '60px', fontWeight: '900', letterSpacing: '-3px', fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 0.9, textShadow: '0px 4px 20px rgba(0,0,0,0.8), 0px 0px 10px rgba(0,0,0,0.5)' }}>
              DAR<span style={{ color: BRAND.orange }}>PAPAYA</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
              <div style={{ height: '1px', width: '40px', background: `linear-gradient(to right, transparent, ${BRAND.gold})` }} />
              <p style={{ margin: 0, fontSize: '12px', color: BRAND.gold, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '5px', textShadow: '0 2px 5px rgba(0,0,0,1)' }}>LEGACY OS</p>
              <div style={{ height: '1px', width: '40px', background: `linear-gradient(to left, transparent, ${BRAND.gold})` }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <MapPin size={12} color={BRAND.orange} />
            <span style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Armenia, Quindío</span>
          </div>
        </header>

        {/* REJILLA DE ACCESO DIRECTO */}
        <div className="grid-routes">
          {routes.map((route) => (
            <Link 
              key={route.href} 
              href={route.href} 
              style={{ textDecoration: 'none', color: 'inherit' }}
              className="btn-hover btn-active"
            >
              <div style={{ backgroundColor: BRAND.darkGray, borderRadius: '35px', padding: '35px', border: `1px solid ${BRAND.lightGray}`, position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* DECORACIÓN INTERNA */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: `${route.color}10`, borderRadius: '50%', filter: 'blur(30px)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: BRAND.black, padding: '20px', borderRadius: '22px', border: `1px solid ${route.color}40`, color: route.color, boxShadow: `0 10px 20px ${route.color}15` }}>
                    {route.icon}
                  </div>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', color: BRAND.gold, textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {route.badge}
                  </span>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.5px' }}>{route.name}</h3>
                    <ChevronRight size={24} color={route.color} />
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '500', lineHeight: 1.4 }}>{route.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <footer style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Desarrollado para el Éxito Gastronómico
          </p>
        </footer>
      </div>
    </main>
  )
}
