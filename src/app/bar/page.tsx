'use client'
import { Beer, CheckCircle2, GlassWater, Timer, Zap, ArrowLeft, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

import { BRAND, MOCK_PRODUCTS } from '@/lib/constants'

// Sobrescritura local para el Bar (Identidad visual azulada)
const BAR_THEME = {
  blue: '#3B82F6',
  cyan: '#06B6D4'
}

export default function BarPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionStarted, setSessionStarted] = useState(false)
  const sessionStartedRef = useRef(false)
  const [flashScreen, setFlashScreen] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const BELL_URL_BAR = 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3'

  const playAlertSound = () => {
    if (!sessionStartedRef.current) return;

    let count = 0;
    const ringInterval = setInterval(() => {
       // 1. Efecto Visual: Parpadeo Azul de Pantalla (Sincronizado)
       setFlashScreen(true)
       setTimeout(() => setFlashScreen(false), 700)

       // 2. Vibrador
       if (typeof navigator !== 'undefined' && navigator.vibrate) {
         navigator.vibrate([300]); 
       }

       // 3. Voz Robótica (Solo la primera vez)
       if (count === 0) {
          try {
            const msg = new SpeechSynthesisUtterance('Nueva bebida');
            window.speechSynthesis.speak(msg);
          } catch(e) {}
       }

       // 4. Campana Real (MP3)
       if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.error("Audio Bar Error:", e));
       }

       count++;
       if (count >= 4) clearInterval(ringInterval); 
    }, 1400); 
  }

  const startShift = () => {
    setSessionStarted(true)
    sessionStartedRef.current = true
    const audio = new Audio(BELL_URL_BAR)
    audio.load()
    audioRef.current = audio
    audio.play().then(() => {
       audio.pause()
    }).catch(e => console.error("Init Bar Audio Error:", e))
  }

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('pedido_items')
        .select(`
          *,
          pedidos (mesa_id)
        `)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching bar orders:', error)
      } else {
        const isBarItem = (notas: string) => {
          if (!notas) return false;
          const lower = notas.toLowerCase();
          return lower.includes('cerveza') || lower.includes('jugo') || lower.includes('limonada') || lower.includes('mandarina') || lower.includes('bebida');
        }
        setOrders((data || []).filter(o => isBarItem(o.notas)))
      }
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('bar_changes')
      // @ts-ignore
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedido_items' }, (payload) => {
        const isBarItem = (notas: string) => {
          if (!notas) return false;
          const lower = notas.toLowerCase();
          return lower.includes('cerveza') || lower.includes('jugo') || lower.includes('limonada') || lower.includes('mandarina') || lower.includes('bebida') || lower.includes('tinto') || lower.includes('agua') || lower.includes('gaseosa');
        }
        
        if (isBarItem(payload.new.notas)) {
           playAlertSound()
        }
        fetchOrders()
      })
      // @ts-ignore
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedido_items' }, fetchOrders)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleDespachar = async (id: string) => {
    await supabase.from('pedido_items').update({ estado: 'listo' }).eq('id', id)
  }

  if (!sessionStarted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.white, padding: '20px' }}>
         <div style={{ textAlign: 'center', backgroundColor: BRAND.darkGray, padding: '50px 30px', borderRadius: '30px', border: `1px solid ${BAR_THEME.blue}40`, maxWidth: '400px' }}>
            <Beer size={60} color={BAR_THEME.blue} style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '10px' }}>BAR DARPAPAYA</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px', lineHeight: 1.5 }}>
              Para que la campana de pedidos suene correctamente, debes iniciar el turno.
            </p>
            <button 
              onClick={startShift}
              style={{ backgroundColor: BAR_THEME.blue, color: BRAND.white, border: 'none', padding: '15px 40px', borderRadius: '20px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', width: '100%', boxShadow: `0 10px 20px ${BAR_THEME.blue}40` }}
            >
              Empezar Turno
            </button>
         </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color={BAR_THEME.blue} className="animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: flashScreen ? '#1E3A8A' : BRAND.black, transition: 'background-color 0.3s ease', minHeight: '100vh', color: BRAND.white, fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .order-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 20px;
        }
        @media (min-width: 768px) { .order-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .order-grid { grid-template-columns: repeat(3, 1fr); } }
        .btn-hover:hover { transform: scale(1.02); opacity: 0.9; }
        .btn-active:active { transform: scale(0.98); }
        .card-glow:hover { border-color: ${BAR_THEME.blue}60; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        @keyframes pulse-blue { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}} />

      {/* HEADER PREMIUM BAR */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(15, 15, 15, 0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BRAND.lightGray}`, padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/" style={{ color: BRAND.white, textDecoration: 'none' }} className="btn-hover">
            <ArrowLeft size={24} />
          </Link>
          <div style={{ backgroundColor: BAR_THEME.blue, padding: '12px', borderRadius: '18px', boxShadow: `0 10px 25px ${BAR_THEME.blue}40` }}>
            <Beer size={28} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
              CENTRAL <span style={{ color: BAR_THEME.blue }}>BAR</span>
            </h1>
            <p style={{ margin: 0, fontSize: '10px', color: BRAND.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Darpapaya Legacy OS</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={playAlertSound}
            style={{ padding: '10px 15px', borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${BRAND.lightGray}`, color: BRAND.white, fontSize: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Timer size={14} color={BAR_THEME.cyan} /> PROBAR SONIDO
          </button>
          <div style={{ backgroundColor: BRAND.darkGray, padding: '10px 20px', borderRadius: '15px', border: `1px solid ${BRAND.lightGray}`, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: '900', textTransform: 'uppercase' }}>Pendientes</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: BAR_THEME.blue }}>{orders.length}</p>
          </div>
          <div style={{ backgroundColor: BRAND.darkGray, width: '60px', borderRadius: '15px', border: `1px solid ${BRAND.lightGray}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <Zap size={18} color={BAR_THEME.blue} style={{ animation: 'pulse-blue 2s infinite' }} />
             <p style={{ margin: '3px 0 0', fontSize: '8px', color: BAR_THEME.blue, fontWeight: '900' }}>READY</p>
          </div>
        </div>
      </header>

      <main className="order-grid">
        {orders.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', color: 'rgba(255,255,255,0.2)' }}>
             <GlassWater size={60} style={{ marginBottom: '20px', opacity: 0.1 }} />
             <h2 style={{ fontSize: '24px', fontWeight: '900' }}>BAR DESPEJADO</h2>
             <p>No hay bebidas por preparar.</p>
          </div>
        )}
        {orders.map((order) => (
          <div key={order.id} className="card-glow" style={{ backgroundColor: BRAND.darkGray, borderRadius: '32px', border: `1px solid ${BRAND.lightGray}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            
            <div style={{ padding: '25px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${BRAND.lightGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BAR_THEME.blue}40`, boxShadow: `inset 0 0 15px ${BAR_THEME.blue}20` }}>
                  <span style={{ fontSize: '28px', fontWeight: '900', color: BRAND.white }}>{order.pedidos?.mesa_id || '?'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: BRAND.gold, textTransform: 'uppercase', letterSpacing: '1px' }}>Mesa {order.pedidos?.mesa_id || '?'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <Clock size={10} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: `${BAR_THEME.blue}15`, padding: '8px 16px', borderRadius: '12px', border: `1px solid ${BAR_THEME.blue}30` }}>
                <span style={{ color: BAR_THEME.blue, fontWeight: '900', fontSize: '16px' }}>#{order.id.slice(0, 4)}</span>
              </div>
            </div>
            
            <div style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1, letterSpacing: '-0.5px' }}>{order.notas}</h3>
                    <div style={{ backgroundColor: BRAND.white, color: BRAND.black, width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', flexShrink: 0 }}>
                      x{order.cantidad}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: BRAND.black, borderRadius: '12px', border: `1px solid ${BAR_THEME.blue}60` }}>
                    <GlassWater size={14} color={BAR_THEME.blue} />
                    <span style={{ fontSize: '11px', fontWeight: '900', color: BRAND.white, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bebida Fría</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                <button 
                  onClick={() => handleDespachar(order.id)}
                  style={{ width: '100%', padding: '22px', backgroundColor: BAR_THEME.blue, color: BRAND.white, borderRadius: '22px', border: 'none', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s', boxShadow: `0 10px 25px ${BAR_THEME.blue}40` }}
                  className="btn-hover btn-active"
                >
                  <CheckCircle2 size={24} strokeWidth={3} /> DESPACHAR BEBIDA
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
