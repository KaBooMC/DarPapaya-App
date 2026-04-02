'use client'
import { ChefHat, CheckCircle2, AlertTriangle, Timer, Clock, Utensils, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const BRAND = {
  orange: '#D97706',
  gold: '#FDE047',
  black: '#0F0F0F',
  darkGray: '#1A1A1A',
  lightGray: '#2A2A2A',
  red: '#991B1B',
  white: '#FFFFFF',
  success: '#10B981'
}

export default function CocinaPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar pedidos iniciales y escuchar Realtime
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
        console.error('Error fetching orders:', error)
      } else {
        // Filtrar solo los que van a cocina
        const BAR_ITEMS = ['Cerveza Club Colombia', 'Jugo Natural']
        setOrders((data || []).filter(o => !BAR_ITEMS.includes(o.notas)))
      }
      setLoading(false)
    }

    fetchOrders()

    // Suscripción Realtime
    const channel = supabase
      .channel('cocina_changes')
      // @ts-ignore
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedido_items' }, (payload: any) => {
        fetchOrders() // Recargar al recibir nuevo item
      })
      // @ts-ignore
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedido_items' }, (payload: any) => {
        fetchOrders() // Recargar al actualizar (despachar)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDespachar = async (id: string) => {
    const { error } = await supabase
      .from('pedido_items')
      .update({ estado: 'listo' })
      .eq('id', id)

    if (error) {
      console.error('Error despachando:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color={BRAND.orange} className="animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', color: BRAND.white, fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      
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
        .card-glow:hover { border-color: ${BRAND.orange}60; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        @keyframes pulse-gold { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}} />

      {/* HEADER PREMIUM COCINA */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(15, 15, 15, 0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BRAND.lightGray}`, padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/" style={{ color: BRAND.white, textDecoration: 'none' }} className="btn-hover">
            <ArrowLeft size={24} />
          </Link>
          <div style={{ backgroundColor: BRAND.orange, padding: '12px', borderRadius: '18px', boxShadow: `0 10px 25px ${BRAND.orange}40` }}>
            <ChefHat size={28} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
              CENTRAL <span style={{ color: BRAND.orange }}>COCINA</span>
            </h1>
            <p style={{ margin: 0, fontSize: '10px', color: BRAND.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Darpapaya Legacy OS</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ backgroundColor: BRAND.darkGray, padding: '10px 20px', borderRadius: '15px', border: `1px solid ${BRAND.lightGray}`, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: '900', textTransform: 'uppercase' }}>Pendientes</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: BRAND.orange }}>{orders.length}</p>
          </div>
          <div style={{ backgroundColor: BRAND.darkGray, width: '60px', borderRadius: '15px', border: `1px solid ${BRAND.lightGray}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <Timer size={18} color={BRAND.gold} style={{ animation: 'pulse-gold 2s infinite' }} />
             <p style={{ margin: '3px 0 0', fontSize: '8px', color: BRAND.gold, fontWeight: '900' }}>LIVE</p>
          </div>
        </div>
      </header>

      <main className="order-grid">
        {orders.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', color: 'rgba(255,255,255,0.2)' }}>
             <Utensils size={60} style={{ marginBottom: '20px', opacity: 0.1 }} />
             <h2 style={{ fontSize: '24px', fontWeight: '900' }}>SIN PEDIDOS PENDIENTES</h2>
             <p>Relájate, la cocina está al día.</p>
          </div>
        )}
        {orders.map((order) => (
          <div key={order.id} className="card-glow" style={{ backgroundColor: BRAND.darkGray, borderRadius: '32px', border: `1px solid ${BRAND.lightGray}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            
            {/* BARRA SUPERIOR DE LA ORDEN */}
            <div style={{ padding: '25px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${BRAND.lightGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BRAND.orange}40`, boxShadow: `inset 0 0 15px ${BRAND.orange}20` }}>
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
              <div style={{ backgroundColor: `${BRAND.orange}15`, padding: '8px 16px', borderRadius: '12px', border: `1px solid ${BRAND.orange}30` }}>
                <span style={{ color: BRAND.orange, fontWeight: '900', fontSize: '16px' }}>#{order.id.slice(0, 4)}</span>
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
                  
                  {order.termino && (
                    <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: BRAND.black, borderRadius: '12px', border: `1px solid ${BRAND.red}60` }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: BRAND.red, boxShadow: `0 0 10px ${BRAND.red}` }} />
                      <span style={{ fontSize: '11px', fontWeight: '900', color: BRAND.white, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Término: {order.termino}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                <button 
                  onClick={() => handleDespachar(order.id)}
                  style={{ width: '100%', padding: '22px', backgroundColor: BRAND.white, color: BRAND.black, borderRadius: '22px', border: 'none', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s', boxShadow: '0 10px 25px rgba(255,255,255,0.1)' }}
                  className="btn-hover btn-active"
                >
                  <CheckCircle2 size={24} strokeWidth={3} /> DESPACHAR AHORA
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
