'use client'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Search, CheckCircle2, QrCode, CreditCard, Users, Settings, LogOut, MapPin, ArrowLeft, Star, TrendingUp, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import { BRAND, MOCK_PRODUCTS } from '@/lib/constants'

export default function AdminPage() {
  const [activeTable, setActiveTable] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'mapa' | 'ventas' | 'qr'>('mapa')
  const [occupiedTables, setOccupiedTables] = useState<Set<number>>(new Set())
  const [tableOrders, setTableOrders] = useState<Record<number, any[]>>({})
  const [tableTotals, setTableTotals] = useState<Record<number, number>>({})
  const [includeTip, setIncludeTip] = useState(false)
  const [showNequi, setShowNequi] = useState(false)
  const [baseUrl, setBaseUrl] = useState('https://darpapaya.netlify.app')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [realSalesToday, setRealSalesToday] = useState(0)
  const [pinError, setPinError] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualQty, setManualQty] = useState(1)
  const [selectedManualProd, setSelectedManualProd] = useState<any>(null)
  const [nequiPhone, setNequiPhone] = useState('3210000000') 
  const tables = Array.from({ length: 20 }, (_, i) => i + 1)

  // Cargar mesas ocupadas en tiempo real
  useEffect(() => {
    // Cargar número de Nequi persistido
    const savedPhone = localStorage.getItem('darpapaya_nequi_phone')
    if (savedPhone) setNequiPhone(savedPhone)

    const fetchOccupiedTables = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          mesa_id,
          total,
          pedido_items (*)
        `)
        .eq('estado_pago', 'pendiente')

      if (!error && data) {
        const occupied = new Set(data.map(p => p.mesa_id))
        setOccupiedTables(occupied)
        
        const ordersMap: Record<number, any[]> = {}
        const totalsMap: Record<number, number> = {}
        data.forEach(p => {
          ordersMap[p.mesa_id] = p.pedido_items
          totalsMap[p.mesa_id] = Number(p.total)
        })
        setTableOrders(ordersMap)
        setTableTotals(totalsMap)
      }
    }

    const fetchSales = async () => {
      const now = new Date()
      if (now.getHours() < 5) now.setDate(now.getDate() - 1)
      now.setHours(5, 0, 0, 0) // El corte es a las 5:00 AM
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('total')
        .eq('estado_pago', 'pagado')
        .gte('creado_at', now.toISOString())
        
      if (!error && data) {
        const sum = data.reduce((acc, curr) => acc + Number(curr.total), 0)
        setRealSalesToday(sum)
      }
    }

    fetchOccupiedTables()
    fetchSales()

    const channel = supabase
      .channel('admin_tables')
      // @ts-ignore
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
         fetchOccupiedTables()
         fetchSales()
      })
      // @ts-ignore
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedido_items' }, fetchOccupiedTables)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const stats = {
    ventasHoy: realSalesToday,
    pedidosActivos: occupiedTables.size,
    mesasDisponibles: tables.length - occupiedTables.size
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === '2026') {
      setIsAuthenticated(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPinInput('')
    }
  }

  const handleAddManualItem = async () => {
    if (!selectedManualProd || !activeTable) return

    try {
      // 1. Buscar o Crear el Pedido
      let pedidoId: number;
      const { data: existingPedido } = await supabase
        .from('pedidos')
        .select('id, total')
        .eq('mesa_id', activeTable)
        .eq('estado_pago', 'pendiente')
        .single()

      if (existingPedido) {
        pedidoId = existingPedido.id
      } else {
        const { data: newPedido, error: pError } = await supabase
          .from('pedidos')
          .insert([{ mesa_id: activeTable, total: 0, estado_pago: 'pendiente' }])
          .select().single()
        if (pError) throw pError
        pedidoId = newPedido.id
      }

      // 2. Insertar el Item
      const { error: iError } = await supabase
        .from('pedido_items')
        .insert([{
          pedido_id: pedidoId,
          cantidad: manualQty,
          notas: selectedManualProd.nombre,
          estado: 'pendiente'
        }])
      if (iError) throw iError

      // 3. Actualizar el Total
      const nuevoTotal = (existingPedido?.total || 0) + (selectedManualProd.precio * manualQty)
      await supabase.from('pedidos').update({ total: nuevoTotal }).eq('id', pedidoId)

      // 4. Reset
      setShowManualModal(false)
      setSelectedManualProd(null)
      setManualQty(1)
    } catch (err) {
      console.error("Error manual order:", err)
      alert("Error al agregar pedido manual")
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: BRAND.darkGray, padding: '40px', borderRadius: '30px', border: `1px solid ${BRAND.lightGray}`, textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: `0 20px 50px rgba(0,0,0,0.5)` }}>
           <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.gold})`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Settings size={30} color={BRAND.black} />
           </div>
           <h2 style={{ color: BRAND.white, fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>Acceso Protegido</h2>
           <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px', fontSize: '14px', lineHeight: '1.5' }}>Por favor, ingresa el PIN de administrador para acceder a Darpapaya.</p>
           <form onSubmit={handlePinSubmit}>
             <input 
               type="password" 
               value={pinInput}
               onChange={(e) => setPinInput(e.target.value)}
               placeholder="****"
               style={{ width: '100%', padding: '15px', borderRadius: '15px', backgroundColor: BRAND.black, border: `1px solid ${pinError ? BRAND.red : BRAND.lightGray}`, color: BRAND.white, fontSize: '24px', textAlign: 'center', letterSpacing: '8px', marginBottom: '15px', outline: 'none', transition: 'all 0.3s' }}
               autoFocus
             />
             {pinError && <p style={{ color: BRAND.red, fontSize: '12px', marginTop: '-5px', marginBottom: '15px', fontWeight: 'bold' }}>PIN incorrecto</p>}
             <button type="submit" style={{ width: '100%', backgroundColor: BRAND.orange, color: BRAND.white, border: 'none', padding: '16px', borderRadius: '15px', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', boxShadow: `0 10px 20px ${BRAND.orange}40` }}>Ingresar al Sistema</button>
           </form>
           
           <Link href="/" style={{ display: 'block', marginTop: '20px', fontSize: '12px', color: BRAND.orange, textDecoration: 'none', fontWeight: '700' }}>
             Volver al Inicio
           </Link>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'mapa':
        return (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: BRAND.orange, boxShadow: `0 0 15px ${BRAND.orange}` }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', color: BRAND.white, letterSpacing: '3px' }}>Mapa de Mesas</h3>
              </div>
              <div style={{ display: 'flex', gap: '30px', backgroundColor: BRAND.darkGray, padding: '12px 25px', borderRadius: '15px', border: `1px solid ${BRAND.lightGray}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '800' }}>DISPONIBLES ({stats.mesasDisponibles})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: BRAND.orange }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '800' }}>OCUPADAS ({stats.pedidosActivos})</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '25px' }}>
              {tables.map(table => {
                const isOccupied = occupiedTables.has(table)
                return (
                  <button
                    key={table}
                    onClick={() => setActiveTable(table)}
                    className="table-btn"
                    style={{ 
                      padding: '40px 20px', 
                      borderRadius: '35px', 
                      border: `2px solid ${activeTable === table ? BRAND.orange : (isOccupied ? BRAND.orange + '40' : BRAND.lightGray)}`, 
                      backgroundColor: activeTable === table ? `${BRAND.orange}15` : (isOccupied ? `${BRAND.orange}05` : BRAND.darkGray), 
                      color: BRAND.white, 
                      cursor: 'pointer', 
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '12px',
                      boxShadow: activeTable === table ? `0 20px 40px ${BRAND.orange}25` : '0 10px 20px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontSize: '42px', fontWeight: '900', color: isOccupied ? BRAND.orange : BRAND.white, letterSpacing: '-2px' }}>{table}</span>
                    <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', opacity: isOccupied ? 1 : 0.4, color: isOccupied ? BRAND.orange : 'white' }}>
                      {isOccupied ? 'OCUPADA' : 'MESA'}
                    </span>
                    {isOccupied && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: BRAND.orange, boxShadow: `0 0 10px ${BRAND.orange}` }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )
      case 'ventas':
        return (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {[
                { label: 'Ventas del Día', value: `$${stats.ventasHoy.toLocaleString()}`, color: BRAND.orange },
                { label: 'Pedidos Activos', value: stats.pedidosActivos, color: BRAND.gold },
                { label: 'Mesas Libres', value: stats.mesasDisponibles, color: '#10B981' },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: BRAND.darkGray, padding: '30px', borderRadius: '30px', border: `1px solid ${BRAND.lightGray}` }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px' }}>{s.label}</p>
                  <p style={{ margin: '10px 0 0', fontSize: '32px', fontWeight: '900', color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: BRAND.darkGray, padding: '30px', borderRadius: '30px', border: `1px solid ${BRAND.lightGray}`, marginTop: '30px', maxWidth: '600px' }}>
               <h3 style={{ margin: '0 0 15px', fontSize: '18px', fontWeight: '900', color: BRAND.gold, textTransform: 'uppercase' }}>Configuración Nequi</h3>
               <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>Número oficial para los cobros QR por mesa.</p>
               <div style={{ backgroundColor: BRAND.black, padding: '20px', borderRadius: '15px', border: `1px solid ${BRAND.lightGray}` }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Celular Nequi</label>
                  <input 
                    type="text" 
                    value={nequiPhone} 
                    onChange={(e) => {
                      setNequiPhone(e.target.value)
                      localStorage.setItem('darpapaya_nequi_phone', e.target.value)
                    }}
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '18px', fontWeight: '800', outline: 'none' }}
                    placeholder="3210000000"
                  />
               </div>
            </div>
          </section>
        )
      case 'qr':
        return (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ backgroundColor: BRAND.darkGray, padding: '40px', borderRadius: '40px', border: `1px solid ${BRAND.lightGray}`, maxWidth: '900px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                {/* QR RECcomended (Uno solo para todo el local) */}
                <div style={{ backgroundColor: BRAND.black, padding: '25px', borderRadius: '30px', border: `2px solid ${BRAND.orange}60`, display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden' }}>
                   <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: BRAND.orange, padding: '4px 12px', borderRadius: '0 0 0 15px' }}>
                      <span style={{ fontSize: '9px', fontWeight: '900', color: BRAND.white }}>RECOMENDADO</span>
                   </div>
                   <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '15px', width: '100px', height: '100px', flexShrink: 0 }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(baseUrl + '/menu')}`} 
                        alt="QR Único"
                        style={{ width: '100%', height: '100%' }}
                      />
                   </div>
                   <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: BRAND.white }}>QR ÚNICO (PARA TODO EL LOCAL)</h4>
                      <p style={{ margin: '4px 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.3 }}>Los clientes eligen su mesa al entrar desde su celular.</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${baseUrl}/menu`);
                          alert('¡Enlace único copiado!');
                        }}
                        style={{ backgroundColor: BRAND.orange, border: 'none', padding: '8px 15px', borderRadius: '8px', color: BRAND.white, fontSize: '10px', fontWeight: '900', cursor: 'pointer' }}
                      >COPIAR LINK</button>
                   </div>
                </div>

                {/* QR Resumen de Uso */}
                <div style={{ backgroundColor: BRAND.black, padding: '25px', borderRadius: '30px', border: `1px solid ${BRAND.lightGray}`, display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ backgroundColor: BRAND.orange + '10', padding: '15px', borderRadius: '15px' }}>
                      <Users size={24} color={BRAND.orange} />
                   </div>
                   <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: BRAND.white }}>O usa QRs por mesa</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Imprime los códigos de abajo si prefieres que cada cliente tenga su mesa pre-asignada.</p>
                   </div>
                </div>
              </div>

              <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${BRAND.lightGray}`, marginBottom: '40px' }}>
                 <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: BRAND.orange }}>Lista de QRs Específicos</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {tables.map(t => (
                  <div key={t} style={{ backgroundColor: BRAND.black, padding: '20px', borderRadius: '25px', border: `1px solid ${BRAND.lightGray}`, textAlign: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', marginBottom: '15px' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl + '/menu/' + t)}`} 
                        alt={`QR Mesa ${t}`}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '900', color: BRAND.gold }}>MESA {t}</p>
                    <button 
                      onClick={() => {
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.write(`
                            <div style="text-align:center; padding: 50px; font-family: sans-serif;">
                              <h1 style="font-size: 40px;">MESA ${t}</h1>
                              <p>Escanea para ver el menú digital</p>
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(baseUrl + '/menu/' + t)}" style="width:300px; height:300px;" />
                              <p style="margin-top:20px; color: #666;">DarPapaya Restaurant System</p>
                            </div>
                          `);
                          win.print();
                        }
                      }}
                      style={{ width: '100%', backgroundColor: BRAND.darkGray, border: `1px solid ${BRAND.lightGray}`, padding: '10px', borderRadius: '10px', color: 'white', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                    >IMPRIMIR</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
    }
  }

  return (
    <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', color: BRAND.white, fontFamily: 'sans-serif', display: 'flex', margin: 0, padding: 0 }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-item:hover { background: rgba(255,255,255,0.05); color: ${BRAND.orange}; }
        .table-btn:hover { transform: translateY(-5px); border-color: ${BRAND.orange}60; }
        .table-btn:active { transform: scale(0.95); }
        .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
        .btn-active:active { transform: scale(0.98); }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${BRAND.black}; }
        ::-webkit-scrollbar-thumb { background: ${BRAND.lightGray}; borderRadius: 10px; }
      `}} />

      <aside style={{ width: '300px', borderRight: `1px solid ${BRAND.lightGray}`, backgroundColor: BRAND.darkGray, padding: '40px 25px', display: 'flex', flexDirection: 'column', gap: '50px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '18px', background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.orange}, ${BRAND.gold})`, padding: '3px' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '15px', background: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: '900', color: BRAND.gold }}>DP</span>
            </div>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', fontStyle: 'italic' }}>DAR<span style={{ color: BRAND.orange }}>PAPAYA</span></h1>
            <p style={{ margin: 0, fontSize: '10px', color: BRAND.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Admin Panel</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'mapa', icon: <LayoutDashboard size={22} />, label: 'Mapa de Mesas' },
            { id: 'ventas', icon: <TrendingUp size={22} />, label: 'Ventas Hoy' },
            { id: 'qr', icon: <QrCode size={22} />, label: 'Enlaces QR' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)}
              className="sidebar-item" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', padding: '18px 25px', borderRadius: '20px', border: 'none', background: activeTab === item.id ? `linear-gradient(to right, ${BRAND.orange}20, transparent)` : 'transparent', color: activeTab === item.id ? BRAND.orange : 'rgba(255,255,255,0.4)', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left', borderLeft: activeTab === item.id ? `4px solid ${BRAND.orange}` : '4px solid transparent' }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 25px', borderRadius: '20px', border: `1px solid ${BRAND.lightGray}`, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
              <LogOut size={22} /> Salir al Inicio
            </button>
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '50px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '38px', fontWeight: '900', color: BRAND.white, letterSpacing: '-1px' }}>
              {activeTab === 'mapa' && 'Mapa de Mesas'}
              {activeTab === 'ventas' && 'Análisis de Ventas'}
              {activeTab === 'qr' && 'Gestión de QRs'}
              <span style={{ color: BRAND.gold, fontSize: '20px', verticalAlign: 'middle', marginLeft: '10px' }}>• Live</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <MapPin size={16} color={BRAND.orange} />
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Av. Centenario, Armenia, Quindío</p>
            </div>
          </div>
        </header>

        {renderContent()}

        {activeTable && (
          <div style={{ position: 'fixed', right: '30px', top: '30px', bottom: '30px', width: '450px', backgroundColor: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(30px)', borderRadius: '40px', border: `1px solid ${BRAND.lightGray}`, boxShadow: '0 50px 100px rgba(0,0,0,0.9)', padding: '40px', display: 'flex', flexDirection: 'column', zIndex: 1000, animation: 'slideIn 0.4s ease-out' }}>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>Mesa {activeTable}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: occupiedTables.has(activeTable) ? BRAND.orange : BRAND.success }} />
                  <p style={{ margin: 0, fontSize: '12px', color: BRAND.gold, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {occupiedTables.has(activeTable) ? 'Cuenta Activa' : 'Mesa Libre'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setActiveTable(null); setShowNequi(false); setIncludeTip(false); }} style={{ background: BRAND.black, border: `1px solid ${BRAND.lightGray}`, color: 'white', cursor: 'pointer', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>&times;</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '900', color: BRAND.white, textTransform: 'uppercase' }}>Items de la Mesa</p>
                <button 
                  onClick={() => setShowManualModal(true)}
                  style={{ backgroundColor: BRAND.orange + '20', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', cursor: 'pointer' }}
                >
                  + AGREGAR CUENTA FISICA
                </button>
              </div>

              {occupiedTables.has(activeTable) ? (
                tableOrders[activeTable]?.map((item: any, i: number) => (
                  <div key={i} style={{ backgroundColor: BRAND.black, padding: '15px 20px', borderRadius: '20px', border: `1px solid ${BRAND.lightGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>{item.notas} <span style={{ color: BRAND.gold }}>x{item.cantidad}</span></p>
                      {item.termino && <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{item.termino}</p>}
                    </div>
                    <div style={{ backgroundColor: item.estado === 'listo' ? BRAND.success + '20' : BRAND.orange + '20', padding: '5px 10px', borderRadius: '8px', border: `1px solid ${item.estado === 'listo' ? BRAND.success : BRAND.orange}40` }}>
                      <span style={{ fontSize: '10px', fontWeight: '900', color: item.estado === 'listo' ? BRAND.success : BRAND.orange }}>{item.estado.toUpperCase()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: BRAND.black, borderRadius: '30px', border: `1px solid ${BRAND.lightGray}`, borderStyle: 'dashed' }}>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.2)', fontSize: '15px', fontWeight: '600' }}>Mesa lista para nuevos clientes</p>
                </div>
              )}
            </div>

            {/* MODAL MANUAL DE PEDIDO */}
            {showManualModal && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,15,15,0.98)', backdropFilter: 'blur(10px)', borderRadius: '40px', zIndex: 1100, padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: BRAND.orange }}>Agregar Ítem Manual</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Selecciona el producto que el cliente pidió mediante la carta física.</p>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {MOCK_PRODUCTS.map(p => (
                     <button 
                      key={p.id}
                      onClick={() => setSelectedManualProd(p)}
                      style={{ 
                        width: '100%', textAlign: 'left', padding: '15px', borderRadius: '15px', 
                        backgroundColor: selectedManualProd?.id === p.id ? BRAND.orange + '20' : BRAND.black, 
                        border: `1px solid ${selectedManualProd?.id === p.id ? BRAND.orange : BRAND.lightGray}`,
                        color: BRAND.white, cursor: 'pointer'
                      }}
                     >
                        <p style={{ margin: 0, fontWeight: '900', fontSize: '14px' }}>{p.nombre}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: BRAND.gold }}>${p.precio.toLocaleString()}</p>
                     </button>
                   ))}
                </div>

                {selectedManualProd && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: BRAND.black, borderRadius: '15px', border: `1px solid ${BRAND.lightGray}` }}>
                    <span style={{ fontSize: '12px', fontWeight: '900' }}>CANTIDAD:</span>
                    <button onClick={() => setManualQty(Math.max(1, manualQty-1))} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: BRAND.lightGray, color: 'white', border: 'none' }}>-</button>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: BRAND.orange }}>{manualQty}</span>
                    <button onClick={() => setManualQty(manualQty+1)} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: BRAND.lightGray, color: 'white', border: 'none' }}>+</button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setShowManualModal(false); setSelectedManualProd(null); }} style={{ flex: 1, padding: '15px', borderRadius: '15px', backgroundColor: 'transparent', border: `1px solid ${BRAND.lightGray}`, color: 'white', fontWeight: '900', cursor: 'pointer' }}>CANCELAR</button>
                  <button 
                    onClick={handleAddManualItem}
                    disabled={!selectedManualProd}
                    style={{ flex: 1, padding: '15px', borderRadius: '15px', backgroundColor: BRAND.success, border: 'none', color: 'white', fontWeight: '900', cursor: 'pointer', opacity: selectedManualProd ? 1 : 0.5 }}
                  >CONFIRMAR</button>
                </div>
              </div>
            )}

            {occupiedTables.has(activeTable) && (
              <div style={{ borderTop: `1px solid ${BRAND.lightGray}`, paddingTop: '35px', marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Subtotal</p>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: BRAND.white }}>
                      ${(tableTotals[activeTable] || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '11px', color: BRAND.gold, fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}>Propina (10%)</label>
                    <input type="checkbox" checked={includeTip} onChange={(e) => setIncludeTip(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: BRAND.orange, cursor: 'pointer' }} />
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: `1px solid ${BRAND.lightGray}` }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '1px' }}>Total a pagar</p>
                  <span style={{ fontSize: '40px', fontWeight: '900', color: BRAND.white, letterSpacing: '-1.5px' }}>
                    ${(includeTip ? (tableTotals[activeTable] || 0) * 1.1 : (tableTotals[activeTable] || 0)).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px' }}>
                  <button onClick={() => setShowNequi(true)} className="btn-hover btn-active" style={{ backgroundColor: BRAND.darkGray, color: BRAND.gold, border: `1px solid ${BRAND.gold}40`, padding: '22px', borderRadius: '22px', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <QrCode size={20} /> Nequi
                  </button>
                  <button 
                    onClick={async () => {
                      const finalTotal = includeTip ? (tableTotals[activeTable] || 0) * 1.1 : (tableTotals[activeTable] || 0);
                      const { error } = await supabase.from('pedidos').update({ estado_pago: 'pagado', total: finalTotal }).eq('mesa_id', activeTable).eq('estado_pago', 'pendiente')
                      if (!error) { setActiveTable(null); setShowNequi(false); setIncludeTip(false); }
                    }}
                    className="btn-hover btn-active" 
                    style={{ background: `linear-gradient(to right, ${BRAND.orange}, ${BRAND.red})`, color: BRAND.white, border: 'none', padding: '22px', borderRadius: '22px', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: `0 15px 30px ${BRAND.orange}40` }}>
                    <CreditCard size={20} /> Pagado
                  </button>
                </div>
                    {showNequi && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: BRAND.black, borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', zIndex: 2000, animation: 'slideIn 0.3s ease-out', border: `2px solid ${BRAND.gold}` }}>
                       
                       {/* BOTÓN CERRAR X */}
                       <button 
                         onClick={() => setShowNequi(false)}
                         style={{ position: 'absolute', top: '30px', right: '30px', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${BRAND.gold}40`, color: BRAND.gold, padding: '10px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                       >
                         <X size={24} />
                       </button>

                       {/* LOGO NEQUI PREMIUM */}
                       <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                         <img src="https://static.nequi.com/v1/images/logo_nequi.svg" style={{ width: '120px' }} alt="Nequi Logo" />
                         <div style={{ height: '2px', width: '100px', backgroundColor: BRAND.gold, margin: '15px auto 0', borderRadius: '2px' }} />
                       </div>

                       <h2 style={{ color: BRAND.white, fontSize: '32px', fontWeight: '900', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Escanea y Paga</h2>
                       <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', textAlign: 'center', fontSize: '16px', fontWeight: '600' }}>
                         Abre tu **App Nequi** y usa el escáner QR
                       </p>
                       
                       {/* QR GIGANTE Y LIMPIO */}
                       <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '45px', marginBottom: '40px', boxShadow: `0 0 70px ${BRAND.gold}20`, border: `8px solid ${BRAND.darkGray}` }}>
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${nequiPhone}`} 
                           alt="Nequi QR" 
                           style={{ width: '280px', height: '280px' }} 
                         />
                       </div>

                       {/* INFORMACIÓN DE LA CUENTA (SOLO LECTURA PARA EL CLIENTE) */}
                       <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                          <p style={{ margin: 0, fontSize: '12px', color: BRAND.gold, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Total a Transferir</p>
                          <p style={{ margin: '5px 0 0', fontSize: '56px', fontWeight: '900', color: BRAND.white, letterSpacing: '-2px' }}>
                            ${(includeTip ? (tableTotals[activeTable] || 0) * 1.1 : (tableTotals[activeTable] || 0)).toLocaleString()}
                          </p>
                          <p style={{ margin: '10px 0 0', fontSize: '18px', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>A nombre de: <strong>DARPAPAYA</strong></p>
                          <p style={{ margin: '5px 0 0', fontSize: '16px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>Cel: {nequiPhone}</p>
                       </div>
                       
                       <button 
                         onClick={() => setShowNequi(false)} 
                         style={{ backgroundColor: BRAND.darkGray, border: `1px solid ${BRAND.lightGray}`, padding: '18px 50px', borderRadius: '25px', color: 'white', fontWeight: '900', cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase' }}
                       >Volver al Mapa</button>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
