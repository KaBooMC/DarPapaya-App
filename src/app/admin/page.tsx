'use client'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Search, CheckCircle2, QrCode, CreditCard, Users, Settings, LogOut, MapPin, ArrowLeft, Star, TrendingUp, X, Plus, Trash2, Clock, Utensils, Award } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import { BRAND, MOCK_PRODUCTS } from '@/lib/constants'

export default function AdminPage() {
  const [activeTable, setActiveTable] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'mapa' | 'ventas' | 'qr' | 'personal'>('mapa')
  const [occupiedTables, setOccupiedTables] = useState<Set<number>>(new Set())
  const [tableOrders, setTableOrders] = useState<Record<number, any[]>>({})
  const [tableTotals, setTableTotals] = useState<Record<number, number>>({})
  const [tableEntryTimes, setTableEntryTimes] = useState<Record<number, string>>({})
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
  const [manualNote, setManualNote] = useState('')
  const [manualTermino, setManualTermino] = useState('')
  const [nequiQRImage, setNequiQRImage] = useState('') 
  
  // LOGIN DE MESEROS
  const [waiters, setWaiters] = useState<any[]>([])
  const [currentWaiter, setCurrentWaiter] = useState<any>(null)
  const [showWaiterLogin, setShowWaiterLogin] = useState(true)
  const [waiterPinInput, setWaiterPinInput] = useState('')
  const [waiterPinError, setWaiterPinError] = useState(false)
  const [selectedWaiterForLogin, setSelectedWaiterForLogin] = useState<any>(null)

  const [topWaiters, setTopWaiters] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // ESTADOS FORMULARIO PERSONAL
  const [showAddWaiterForm, setShowAddWaiterForm] = useState(false)
  const [newWaiterName, setNewWaiterName] = useState('')
  const [newWaiterPin, setNewWaiterPin] = useState('')

  const tables = Array.from({ length: 20 }, (_, i) => i + 1)

  // Cargar mesas ocupadas en tiempo real
  useEffect(() => {
    // Cargar número de Nequi persistido
    // Cargar QR de Nequi persistido
    const savedQR = localStorage.getItem('darpapaya_nequi_qr_url')
    if (savedQR) setNequiQRImage(savedQR)

    const fetchWaiters = async () => {
      const { data } = await supabase.from('meseros').select('*').eq('activo', true)
      if (data) setWaiters(data)
    }

    const fetchOccupiedTables = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          mesa_id,
          total,
          creado_at,
          mesero_nombre,
          pedido_items (*)
        `)
        .eq('estado_pago', 'pendiente')

      if (!error && data) {
        const occupied = new Set(data.map(p => p.mesa_id))
        setOccupiedTables(occupied)
        
        const ordersMap: Record<number, any[]> = {}
        const totalsMap: Record<number, number> = {}
        const timesMap: Record<number, string> = {}
        data.forEach(p => {
          ordersMap[p.mesa_id] = p.pedido_items
          totalsMap[p.mesa_id] = Number(p.total)
          timesMap[p.mesa_id] = p.creado_at
        })
        setTableOrders(ordersMap)
        setTableTotals(totalsMap)
        setTableEntryTimes(timesMap)
      }
    }

    const fetchSalesAnalytics = async () => {
      const now = new Date()
      if (now.getHours() < 5) now.setDate(now.getDate() - 1)
      now.setHours(5, 0, 0, 0)
      
      const { data: salesData } = await supabase
        .from('pedidos')
        .select('total, mesero_nombre, creado_at')
        .eq('estado_pago', 'pagado')
        .gte('creado_at', now.toISOString())
        
      if (salesData) {
        setRealSalesToday(salesData.reduce((acc, curr) => acc + Number(curr.total), 0))
        
        // Calcular Top Meseros
        const waiterVentas: Record<string, number> = {}
        salesData.forEach(p => {
          waiterVentas[p.mesero_nombre] = (waiterVentas[p.mesero_nombre] || 0) + Number(p.total)
        })
        setTopWaiters(Object.entries(waiterVentas).map(([name, total]) => ({ name, total })).sort((a,b) => b.total - a.total))
      }

      // Top Productos hoy
      const { data: itemData } = await supabase
        .from('pedido_items')
        .select('notas, cantidad')
        .gte('created_at', now.toISOString())
      
      if (itemData) {
          const productStats: Record<string, number> = {}
          itemData.forEach(i => {
              productStats[i.notas] = (productStats[i.notas] || 0) + i.cantidad
          })
          setTopProducts(Object.entries(productStats).map(([name, qty]) => ({ name, qty })).sort((a,b) => b.qty - a.qty).slice(0, 5))
      }
    }

    fetchWaiters()
    fetchOccupiedTables()
    fetchSalesAnalytics()

    const channel = supabase
      .channel('admin_tables')
      // @ts-ignore
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
         fetchOccupiedTables()
         fetchSalesAnalytics()
      })
      // @ts-ignore
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedido_items' }, fetchOccupiedTables)
      .subscribe()

    // Timer Interval
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => { 
      supabase.removeChannel(channel) 
      clearInterval(timer)
    }
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
      // Cargar mesero de localStorage si existe
      const savedWaiter = localStorage.getItem('darpapaya_waiter')
      if (savedWaiter) {
          setCurrentWaiter(JSON.parse(savedWaiter))
          setShowWaiterLogin(false)
      }
    } else {
      setPinError(true)
      setPinInput('')
    }
  }

  const handleWaiterLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWaiterForLogin) return
    
    if (waiterPinInput === selectedWaiterForLogin.pin) {
        setCurrentWaiter(selectedWaiterForLogin)
        setShowWaiterLogin(false)
        setWaiterPinError(false)
        localStorage.setItem('darpapaya_waiter', JSON.stringify(selectedWaiterForLogin))
    } else {
        setWaiterPinError(true)
        setWaiterPinInput('')
    }
  }

  const formatElapsedTime = (entryTime: string) => {
    const start = new Date(entryTime).getTime()
    const now = currentTime.getTime()
    const diff = Math.max(0, now - start)
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleAddManualItem = async () => {
    if (!selectedManualProd || !activeTable || !currentWaiter) return

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
          .insert([{ 
              mesa_id: activeTable, 
              total: 0, 
              estado_pago: 'pendiente',
              mesero_nombre: currentWaiter.nombre
          }])
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
          notas: manualNote ? `${selectedManualProd.nombre} (${manualNote})` : selectedManualProd.nombre,
          termino: manualTermino || null,
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
      setManualNote('')
      setManualTermino('')
    } catch (err) {
      console.error("Error manual order:", err)
      alert("Error al agregar pedido manual")
    }
  }

  const handleAddWaiter = async (nombre: string, pin: string) => {
    const { error } = await supabase.from('meseros').insert([{ nombre, pin }])
    if (!error) {
        const { data } = await supabase.from('meseros').select('*').eq('activo', true)
        if (data) setWaiters(data)
    }
  }

  const handleDeleteWaiter = async (id: string) => {
      const { error } = await supabase.from('meseros').update({ activo: false }).eq('id', id)
      if (!error) {
          setWaiters(prev => prev.filter(w => w.id !== id))
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

  // LOGIN DE MESERO (SaaS PRO)
  if (showWaiterLogin) {
      return (
          <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', color: BRAND.white, marginBottom: '40px', letterSpacing: '-1px' }}>¿QUIÉN ESTÁ <span style={{ color: BRAND.orange }}>ATENDIENDO?</span></h2>
                  
                  {!selectedWaiterForLogin ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                          {waiters.map(w => (
                              <button 
                                  key={w.id}
                                  onClick={() => setSelectedWaiterForLogin(w)}
                                  className="card-glow"
                                  style={{ padding: '40px 20px', backgroundColor: BRAND.darkGray, borderRadius: '30px', border: `1px solid ${BRAND.lightGray}`, color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: 'all 0.3s' }}
                              >
                                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: BRAND.orange + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Users size={30} color={BRAND.orange} />
                                  </div>
                                  <span style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '16px' }}>{w.nombre}</span>
                              </button>
                          ))}
                          <button 
                             onClick={() => setActiveTab('personal')}
                             style={{ padding: '40px 20px', backgroundColor: 'transparent', borderRadius: '30px', border: `2px dashed ${BRAND.lightGray}`, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
                          >
                              <Plus size={30} />
                              <span style={{ fontWeight: '900', fontSize: '13px' }}>NUEVO MESERO</span>
                          </button>
                      </div>
                  ) : (
                      <div style={{ maxWidth: '350px', margin: '0 auto', backgroundColor: BRAND.darkGray, padding: '40px', borderRadius: '40px', border: `1px solid ${BRAND.orange}60` }}>
                          <button onClick={() => setSelectedWaiterForLogin(null)} style={{ background: 'none', border: 'none', color: BRAND.gold, cursor: 'pointer', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}><ArrowLeft size={16}/> VOLVER</button>
                          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>Hola, {selectedWaiterForLogin.nombre}</h3>
                          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '30px', fontSize: '12px' }}>Ingresa tu PIN de seguridad</p>
                          <form onSubmit={handleWaiterLogin}>
                              <input 
                                  type="password" 
                                  value={waiterPinInput}
                                  onChange={(e) => setWaiterPinInput(e.target.value)}
                                  placeholder="****"
                                  style={{ width: '100%', padding: '15px', borderRadius: '15px', backgroundColor: BRAND.black, border: `1px solid ${waiterPinError ? BRAND.red : BRAND.lightGray}`, color: BRAND.white, fontSize: '24px', textAlign: 'center', letterSpacing: '8px', marginBottom: '15px', outline: 'none' }}
                                  autoFocus
                              />
                              <button style={{ width: '100%', backgroundColor: BRAND.orange, color: 'white', padding: '16px', borderRadius: '15px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>CONFIRMAR</button>
                          </form>
                      </div>
                  )}
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', opacity: isOccupied ? 1 : 0.4, color: isOccupied ? BRAND.orange : 'white' }}>
                        {isOccupied ? 'OCUPADA' : 'MESA'}
                      </span>
                      {isOccupied && tableEntryTimes[table] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                          <Clock size={10} color={BRAND.gold} />
                          <span style={{ fontSize: '12px', fontWeight: '900', color: BRAND.gold }}>{formatElapsedTime(tableEntryTimes[table])}</span>
                        </div>
                      )}
                    </div>
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
          <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* KPI PRINCIPALES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { label: 'Ventas del Día', value: `€${stats.ventasHoy.toLocaleString()}`, color: BRAND.orange, icon: <TrendingUp /> },
                { label: 'Pedidos Activos', value: stats.pedidosActivos, color: BRAND.gold, icon: <LayoutDashboard /> },
                { label: 'Mesas Libres', value: stats.mesasDisponibles, color: '#10B981', icon: <MapPin /> },
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: BRAND.darkGray, padding: '30px', borderRadius: '35px', border: `1px solid ${BRAND.lightGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px' }}>{s.label}</p>
                    <p style={{ margin: '10px 0 0', fontSize: '36px', fontWeight: '900', color: s.color, letterSpacing: '-1px' }}>{s.value}</p>
                  </div>
                  <div style={{ color: s.color, opacity: 0.2 }}>{s.icon}</div>
                </div>
              ))}
            </div>

            {/* ANALÍTICA PRO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
               {/* TOP PLATOS */}
               <div style={{ backgroundColor: BRAND.darkGray, padding: '35px', borderRadius: '40px', border: `1px solid ${BRAND.lightGray}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                     <Star size={20} color={BRAND.gold} />
                     <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>Top 5 Platos Hoy</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     {topProducts.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: BRAND.black, borderRadius: '20px' }}>
                           <span style={{ fontWeight: '700', fontSize: '14px' }}>{p.name}</span>
                           <span style={{ color: BRAND.orange, fontWeight: '900' }}>{p.qty} vendidos</span>
                        </div>
                     ))}
                     {topProducts.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Aún no hay ventas registradas.</p>}
                  </div>
               </div>

               {/* TOP MESEROS */}
               <div style={{ backgroundColor: BRAND.darkGray, padding: '35px', borderRadius: '40px', border: `1px solid ${BRAND.lightGray}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                     <Award size={20} color={BRAND.orange} />
                     <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>Ventas por Mesero</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     {topWaiters.map((w, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: BRAND.black, borderRadius: '20px' }}>
                           <span style={{ fontWeight: '700', fontSize: '14px' }}>{w.name}</span>
                           <span style={{ color: BRAND.success, fontWeight: '900' }}>€{w.total.toLocaleString()}</span>
                        </div>
                     ))}
                     {topWaiters.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>No hay ventas tagueadas hoy.</p>}
                  </div>
               </div>
            </div>

            {/* CONFIGURACIÓN QR PAGO */}
            <div style={{ backgroundColor: BRAND.darkGray, padding: '35px', borderRadius: '40px', border: `1px solid ${BRAND.lightGray}`, maxWidth: '600px' }}>
               <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '900', color: BRAND.gold, textTransform: 'uppercase' }}>Billetera Digital / QR Pago</h3>
               <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '25px', lineHeight: 1.5 }}>Configura la imagen que verán los clientes al pagar por Bizum o transferencia.</p>
               <div style={{ backgroundColor: BRAND.black, padding: '20px', borderRadius: '15px', border: `1px solid ${BRAND.lightGray}` }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>Imagen del QR Oficial (URL)</label>
                  <input 
                    type="text" 
                    value={nequiQRImage} 
                    onChange={(e) => {
                      setNequiQRImage(e.target.value)
                      localStorage.setItem('darpapaya_nequi_qr_url', e.target.value)
                    }}
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '14px', fontWeight: '600', outline: 'none' }}
                    placeholder="https://ejemplo.com/mi-qr-bizum.png"
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
      case 'personal':
        return (
          <section style={{ maxWidth: '900px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                   <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>GESTIÓN DE <span style={{ color: BRAND.orange }}>PERSONAL</span></h3>
                   <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '5px' }}>Administra el equipo de meseros de DarPapaya Madrid.</p>
                </div>
                {!showAddWaiterForm && (
                  <button 
                     onClick={() => setShowAddWaiterForm(true)}
                     style={{ backgroundColor: BRAND.success, color: 'white', border: 'none', padding: '15px 30px', borderRadius: '20px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: `0 10px 20px ${BRAND.success}30` }}
                  >
                     <Plus size={18} /> NUEVO MESERO
                  </button>
                )}
             </div>

             {showAddWaiterForm && (
                <div style={{ backgroundColor: BRAND.darkGray, padding: '35px', borderRadius: '40px', border: `1px solid ${BRAND.orange}60`, marginBottom: '40px', animation: 'slideDown 0.3s ease-out' }}>
                   <style dangerouslySetInnerHTML={{ __html: `@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }` }} />
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>Registrar Nuevo Personal</h4>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: BRAND.orange + '10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Users size={20} color={BRAND.orange} />
                      </div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                         <label style={{ fontSize: '10px', fontWeight: '900', color: BRAND.gold, textTransform: 'uppercase', letterSpacing: '2px' }}>Nombre del Mesero</label>
                         <input 
                            type="text" 
                            value={newWaiterName}
                            onChange={(e) => setNewWaiterName(e.target.value)}
                            placeholder="Nombre y Apellido"
                            style={{ width: '100%', padding: '16px', borderRadius: '15px', backgroundColor: BRAND.black, border: `1px solid ${BRAND.lightGray}`, color: 'white', outline: 'none', fontSize: '15px' }}
                         />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                         <label style={{ fontSize: '10px', fontWeight: '900', color: BRAND.gold, textTransform: 'uppercase', letterSpacing: '2px' }}>PIN de 4 Dígitos</label>
                         <input 
                            type="password" 
                            maxLength={4}
                            value={newWaiterPin}
                            onChange={(e) => setNewWaiterPin(e.target.value)}
                            placeholder="****"
                            style={{ width: '100%', padding: '16px', borderRadius: '15px', backgroundColor: BRAND.black, border: `1px solid ${BRAND.lightGray}`, color: 'white', outline: 'none', textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }}
                         />
                      </div>
                   </div>
                   <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                         onClick={() => {
                            if (newWaiterName && newWaiterPin.length === 4) {
                               handleAddWaiter(newWaiterName, newWaiterPin)
                               setNewWaiterName('')
                               setNewWaiterPin('')
                               setShowAddWaiterForm(false)
                            } else {
                               alert('Por favor completa el nombre y el PIN de 4 dígitos.')
                            }
                         }}
                         style={{ flex: 2, backgroundColor: BRAND.orange, color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s' }}
                         className="btn-hover btn-active"
                      >GUARDAR MESERO</button>
                      <button 
                         onClick={() => setShowAddWaiterForm(false)}
                         style={{ flex: 1, backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', border: `1px solid ${BRAND.lightGray}`, padding: '18px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}
                      >CANCELAR</button>
                   </div>
                </div>
             )}

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {waiters.map(w => (
                   <div key={w.id} style={{ backgroundColor: BRAND.darkGray, padding: '30px', borderRadius: '35px', border: `1px solid ${BRAND.lightGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }} className="card-glow">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${w.nombre === 'Admin' ? BRAND.gold : BRAND.orange}40` }}>
                            <Users size={24} color={w.nombre === 'Admin' ? BRAND.gold : BRAND.orange} />
                         </div>
                         <div>
                            <p style={{ margin: 0, fontWeight: '900', fontSize: '17px', letterSpacing: '-0.5px' }}>{w.nombre}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: BRAND.gold, fontWeight: '800', textTransform: 'uppercase' }}>{w.nombre === 'Admin' ? 'ACCESO TOTAL' : 'ACCESO COMANDAS'}</p>
                         </div>
                      </div>
                      {w.nombre !== 'Admin' && (
                         <button 
                           onClick={() => { if(confirm(`¿Eliminar a ${w.nombre}?`)) handleDeleteWaiter(w.id) }}
                           style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: BRAND.red, cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}
                           className="btn-hover"
                         >
                            <Trash2 size={18} />
                         </button>
                      )}
                   </div>
                ))}
             </div>
          </section>
        )
    }
  }

  return (
    <div className="admin-layout" style={{ backgroundColor: BRAND.black, minHeight: '100vh', color: BRAND.white, fontFamily: 'sans-serif', display: 'flex', margin: 0, padding: 0 }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-item:hover { background: rgba(255,255,255,0.05); color: ${BRAND.orange}; }
        .table-btn:hover { transform: translateY(-5px); border-color: ${BRAND.orange}60; }
        .table-btn:active { transform: scale(0.95); }
        .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
        .btn-active:active { transform: scale(0.98); }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${BRAND.black}; }
        ::-webkit-scrollbar-thumb { background: ${BRAND.lightGray}; borderRadius: 10px; }

        @media (max-width: 1024px) {
          .admin-layout { flex-direction: column !important; }
          .admin-sidebar { 
             width: 100% !important; 
             height: auto !important; 
             position: relative !important; 
             padding: 20px !important;
             border-right: none !important;
             border-bottom: 1px solid ${BRAND.lightGray} !important;
             gap: 20px !important;
          }
          .admin-sidebar nav {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding-bottom: 10px !important;
          }
          .admin-sidebar .sidebar-item {
            padding: 10px 15px !important;
            white-space: nowrap !important;
            border-left: none !important;
            border-bottom: 3px solid transparent !important;
          }
          .admin-sidebar .sidebar-item.active {
            border-bottom-color: ${BRAND.orange} !important;
            background: transparent !important;
          }
          .admin-main { padding: 20px !important; }
          .admin-header h2 { fontSize: 28px !important; }
          .active-table-modal { 
            position: fixed !important; 
            inset: 0 !important; 
            width: 100% !important; 
            height: 100% !important; 
            border-radius: 0 !important;
            z-index: 2000 !important;
          }
        }
        }
      `}} />

      <aside className="admin-sidebar" style={{ width: '300px', borderRight: `1px solid ${BRAND.lightGray}`, backgroundColor: BRAND.darkGray, padding: '40px 25px', display: 'flex', flexDirection: 'column', gap: '50px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
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
            { id: 'mapa', icon: <LayoutDashboard size={22} />, label: 'Mapa de Mesas', role: 'all' },
            { id: 'ventas', icon: <TrendingUp size={22} />, label: 'Análisis Pro', role: 'admin' },
            { id: 'personal', icon: <Users size={22} />, label: 'Personal', role: 'admin' },
            { id: 'qr', icon: <QrCode size={22} />, label: 'Enlaces QR', role: 'admin' },
          ].map((item) => {
            // Solo el usuario 'Admin' puede ver las pestañas administrativas
            const isAdmin = currentWaiter?.nombre === 'Admin'
            if (!isAdmin && item.role === 'admin') return null

            return (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as any)}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', padding: '18px 25px', borderRadius: '20px', border: 'none', background: activeTab === item.id ? `linear-gradient(to right, ${BRAND.orange}20, transparent)` : 'transparent', color: activeTab === item.id ? BRAND.orange : 'rgba(255,255,255,0.4)', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left', borderLeft: activeTab === item.id ? `4px solid ${BRAND.orange}` : '4px solid transparent' }}
              >
                {item.icon} {item.label}
              </button>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 25px', borderRadius: '20px', border: `1px solid ${BRAND.lightGray}`, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
              <LogOut size={22} /> Salir al Inicio
            </button>
          </Link>
        </div>
      </aside>

      <main className="admin-main" style={{ flex: 1, padding: '50px', overflowY: 'auto' }}>
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '38px', fontWeight: '900', color: BRAND.white, letterSpacing: '-1px' }}>
              {activeTab === 'mapa' && 'Mapa de Mesas'}
              {activeTab === 'ventas' && 'Análisis de Ventas'}
              {activeTab === 'personal' && 'Gestión de Personal'}
              {activeTab === 'qr' && 'Gestión de QRs'}
              <span style={{ color: BRAND.gold, fontSize: '20px', verticalAlign: 'middle', marginLeft: '10px' }}>• Live</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color={BRAND.orange} />
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Arganzuela, Madrid</p>
              </div>
              {currentWaiter && (
                <div style={{ borderLeft: `1px solid ${BRAND.lightGray}`, paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: BRAND.orange + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={14} color={BRAND.orange} />
                   </div>
                   <span style={{ fontSize: '14px', fontWeight: '900', color: BRAND.white }}>{currentWaiter.nombre}</span>
                   <button onClick={() => { localStorage.removeItem('darpapaya_waiter'); setCurrentWaiter(null); setShowWaiterLogin(true); }} style={{ background: 'none', border: 'none', color: BRAND.red, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', marginLeft: '10px', opacity: 0.6 }}>Cambiar</button>
                </div>
              )}
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
                  style={{ backgroundColor: BRAND.success, color: 'white', padding: '10px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={16} /> AGREGAR COMANDA
                </button>
              </div>
              {occupiedTables.has(activeTable) && tableEntryTimes[activeTable] && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: BRAND.black, padding: '12px 20px', borderRadius: '15px', border: `1px solid ${BRAND.gold}30` }}>
                    <Clock size={16} color={BRAND.gold} />
                    <span style={{ fontSize: '14px', fontWeight: '900', color: BRAND.gold }}>TIEMPO TRANSCURRIDO: {formatElapsedTime(tableEntryTimes[activeTable])}</span>
                 </div>
              )}

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

            {/* MODAL COMANDERA PRO (OPTIMIZADO MÓVIL) */}
            {showManualModal && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: BRAND.black, zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
                
                {/* Header Modal */}
                <header style={{ padding: '20px 30px', borderBottom: `1px solid ${BRAND.lightGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>COMANDERA <span style={{ color: BRAND.orange }}>PRO</span></h3>
                    <button onClick={() => { setShowManualModal(false); setSelectedManualProd(null); }} style={{ background: BRAND.darkGray, border: 'none', color: 'white', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <X size={24} />
                    </button>
                </header>

                <div style={{ flex: 1, display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column', overflow: 'hidden' }}>
                    {/* Lista de Productos */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '30px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                           {MOCK_PRODUCTS.map(p => (
                               <button 
                                  key={p.id}
                                  onClick={() => setSelectedManualProd(p)}
                                  style={{ 
                                      padding: '20px 10px', borderRadius: '25px', border: `2px solid ${selectedManualProd?.id === p.id ? BRAND.orange : BRAND.lightGray}`, 
                                      backgroundColor: selectedManualProd?.id === p.id ? BRAND.orange + '10' : BRAND.darkGray,
                                      color: 'white', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative'
                                  }}
                               >
                                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.3)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Utensils size={18} color={selectedManualProd?.id === p.id ? BRAND.orange : 'white'} />
                                   </div>
                                   <span style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1.2 }}>{p.nombre}</span>
                                   <span style={{ fontSize: '14px', fontWeight: '900', color: BRAND.gold }}>€{p.precio}</span>
                               </button>
                           ))}
                        </div>
                    </div>

                    {/* Panel de Configuración Ítem */}
                    <div style={{ width: window.innerWidth > 768 ? '400px' : '100%', backgroundColor: BRAND.darkGray, borderLeft: `1px solid ${BRAND.lightGray}`, padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {selectedManualProd ? (
                           <>
                             <div>
                                <h4 style={{ margin: 0, fontSize: '10px', color: BRAND.orange, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Producto Seleccionado</h4>
                                <p style={{ margin: '5px 0 0', fontSize: '28px', fontWeight: '900' }}>{selectedManualProd.nombre}</p>
                             </div>

                             <div>
                                <h4 style={{ margin: '0 0 10px', fontSize: '10px', color: BRAND.orange, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Cantidad</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                   <button onClick={() => setManualQty(Math.max(1, manualQty-1))} style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: BRAND.black, color: 'white', border: `1px solid ${BRAND.lightGray}`, fontSize: '24px', fontWeight: '900' }}>-</button>
                                   <span style={{ fontSize: '32px', fontWeight: '900', color: BRAND.white, width: '40px', textAlign: 'center' }}>{manualQty}</span>
                                   <button onClick={() => setManualQty(manualQty+1)} style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: BRAND.black, color: 'white', border: `1px solid ${BRAND.lightGray}`, fontSize: '24px', fontWeight: '900' }}>+</button>
                                </div>
                             </div>

                             <div>
                                <h4 style={{ margin: '0 0 10px', fontSize: '10px', color: BRAND.orange, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Término (Opcional)</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                   {['Azul', 'Medio', '3/4', 'Bien Asada'].map(t => (
                                      <button 
                                        key={t} 
                                        onClick={() => setManualTermino(t)}
                                        style={{ padding: '8px 15px', borderRadius: '10px', border: `1px solid ${manualTermino === t ? BRAND.orange : BRAND.lightGray}`, backgroundColor: manualTermino === t ? BRAND.orange + '20' : 'transparent', color: manualTermino === t ? BRAND.orange : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '900' }}
                                      >{t}</button>
                                   ))}
                                </div>
                             </div>

                             <div>
                                <h4 style={{ margin: '0 0 10px', fontSize: '10px', color: BRAND.orange, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Observaciones</h4>
                                <textarea 
                                  value={manualNote}
                                  onChange={(e) => setManualNote(e.target.value)}
                                  placeholder="Ej: Sin cebolla, extra salsas..."
                                  style={{ width: '100%', height: '80px', backgroundColor: BRAND.black, borderRadius: '15px', border: `1px solid ${BRAND.lightGray}`, color: 'white', padding: '15px', outline: 'none', resize: 'none', fontSize: '14px' }}
                                />
                             </div>

                             <button 
                                onClick={handleAddManualItem}
                                style={{ width: '100%', padding: '25px', backgroundColor: BRAND.success, color: 'white', borderRadius: '25px', border: 'none', fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 10px 30px ${BRAND.success}40` }}
                             >ENVIAR A PREPARACIÓN</button>
                           </>
                        ) : (
                           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                              <Utensils size={60} />
                              <p style={{ fontWeight: '900' }}>SELECCIONA UN PRODUCTO</p>
                           </div>
                        )}
                    </div>
                </div>
              </div>
            )}

            {occupiedTables.has(activeTable) && (
              <div style={{ borderTop: `1px solid ${BRAND.lightGray}`, paddingTop: '35px', marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Subtotal</p>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: BRAND.white }}>
                      €{(tableTotals[activeTable] || 0).toLocaleString()}
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
                    €{(includeTip ? (tableTotals[activeTable] || 0) * 1.1 : (tableTotals[activeTable] || 0)).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px' }}>
                  <button onClick={() => setShowNequi(true)} className="btn-hover btn-active" style={{ backgroundColor: BRAND.darkGray, color: BRAND.gold, border: `1px solid ${BRAND.gold}40`, padding: '22px', borderRadius: '22px', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <QrCode size={20} /> Pago Digital
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

                       {/* ESPACIO PARA QR OFICIAL (PENDIENTE) */}
                       <div style={{ backgroundColor: BRAND.darkGray, padding: '40px', borderRadius: '45px', marginBottom: '40px', boxShadow: `0 0 50px rgba(0,0,0,0.5)`, border: `2px dashed ${BRAND.lightGray}`, width: '280px', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '15px' }}>
                         {nequiQRImage ? (
                           <img 
                             src={nequiQRImage} 
                             alt="Nequi QR Oficial" 
                             style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                           />
                         ) : (
                           <>
                             <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${BRAND.orange}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <QrCode size={30} color={BRAND.orange} style={{ opacity: 0.5 }} />
                             </div>
                             <div>
                               <p style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: BRAND.white, textTransform: 'uppercase' }}>QR en Mantenimiento</p>
                               <p style={{ margin: '5px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>Solicita el código físico al mesero o configura la imagen en el panel.</p>
                             </div>
                           </>
                         )}
                       </div>

                       {/* INFORMACIÓN DE LA CUENTA */}
                       <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                          <p style={{ margin: 0, fontSize: '12px', color: BRAND.orange, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Total a Cobrar</p>
                          <p style={{ margin: '5px 0 0', fontSize: '56px', fontWeight: '900', color: BRAND.white, letterSpacing: '-2px' }}>
                            €{(includeTip ? (tableTotals[activeTable] || 0) * 1.1 : (tableTotals[activeTable] || 0)).toLocaleString()}
                          </p>
                          <p style={{ margin: '10px 0 0', fontSize: '16px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>DarPapaya Restaurant System</p>
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
