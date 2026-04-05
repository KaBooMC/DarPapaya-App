'use client'
import { useState, useMemo, useEffect } from 'react'
import { ShoppingBag, ChevronRight, Plus, Star, CheckCircle2, X, MapPin, UtensilsCrossed, Beer, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { BRAND, MOCK_PRODUCTS } from '@/lib/constants'

// Imagen de seguridad (Lomo/Carne genérica que sabemos que carga perfecto)
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'

export default function MenuPage({ params }: { params: { mesa_id: string } }) {
  const { addItem, items, total, clearCart } = useCartStore()
  const [activeTab, setActiveTab] = useState<string>('tipicos')
  const [selectedTerm, setSelectedTerm] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState<string | null>(null)
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderSent, setOrderSent] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [customNote, setCustomNote] = useState<string>('')
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
  const [isHalfPortion, setIsHalfPortion] = useState(false)
  const [pendingTotal, setPendingTotal] = useState(0)

  const filteredProducts = useMemo(() => 
    MOCK_PRODUCTS.filter(p => p.categoria === activeTab),
  [activeTab])

  // 0. Sincronización del total pendiente (Cuenta real de la mesa)
  useEffect(() => {
    const fetchPendingTotal = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('total')
        .eq('mesa_id', parseInt(params.mesa_id))
        .eq('estado_pago', 'pendiente')

      if (!error && data) {
        const sum = data.reduce((acc, curr) => acc + Number(curr.total), 0)
        setPendingTotal(sum)
      } else {
        setPendingTotal(0)
      }
    }

    fetchPendingTotal()

    const channel = supabase
      .channel(`table_account_${params.mesa_id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos', filter: `mesa_id=eq.${params.mesa_id}` }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new.estado_pago === 'pagado') {
          setPendingTotal(0)
        } else {
          fetchPendingTotal()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.mesa_id])

  const handleAddToCart = (product: any) => {
    setSelectedProduct(product)
    setCustomNote('')
    setIsHalfPortion(false)
  }

  const handleQtyChange = (productId: string, delta: number) => {
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }))
  }

  const confirmAddToCart = () => {
    if (!selectedProduct) return
    const term = ['carnes', 'pescados'].includes(selectedProduct.categoria) ? (selectedTerm[selectedProduct.id] || '3/4') : undefined
    
    let nombreFinal = selectedProduct.nombre
    let precioFinal = selectedProduct.precio
    const qty = localQuantities[selectedProduct.id] || 1

    if (isHalfPortion) {
      nombreFinal = `${selectedProduct.nombre} (1/2 Porción)`
      precioFinal = selectedProduct.nombre.toLowerCase().includes('mariscos') ? 15900 : 8900
    }

    if (customNote && customNote.trim() !== '') {
      nombreFinal = `${nombreFinal} - ${customNote.trim()}`
    }
    
    addItem({ ...selectedProduct, nombre: nombreFinal, precio: precioFinal, cantidad: qty, termino: term })
    setShowSuccess(`${qty}x ${nombreFinal}`)
    setTimeout(() => setShowSuccess(null), 3000)
    setSelectedProduct(null)
    setLocalQuantities(prev => ({ ...prev, [selectedProduct.id]: 1 }))
  }

  const handleSendOrder = async () => {
    if (items.length === 0 || isOrdering) return
    setIsOrdering(true)

    try {
      const { data: existingPedido } = await supabase
        .from('pedidos')
        .select('id, total')
        .eq('mesa_id', parseInt(params.mesa_id))
        .eq('estado_pago', 'pendiente')
        .single()

      let pedidoId: number;
      if (existingPedido) {
        pedidoId = existingPedido.id
        await supabase
          .from('pedidos')
          .update({ total: Number(existingPedido.total) + total() })
          .eq('id', pedidoId)
      } else {
        const { data: newPedido, error: pError } = await supabase
          .from('pedidos')
          .insert([{ mesa_id: parseInt(params.mesa_id), total: total(), estado_pago: 'pendiente' }])
          .select().single()
        if (pError) throw pError
        pedidoId = newPedido.id
      }

      const pedidoItems = items.map(item => ({
        pedido_id: pedidoId,
        producto_id: null,
        cantidad: item.cantidad,
        notas: item.nombre,
        termino: item.termino,
        estado: 'pendiente'
      }))

      const { error: itemsError } = await supabase
        .from('pedido_items')
        .insert(pedidoItems)

      if (itemsError) throw itemsError

      setOrderSent(true)
      clearCart()
      setTimeout(() => setOrderSent(false), 5000)
    } catch (err) {
      console.error('Error al enviar pedido:', err)
      alert('Hubo un error al enviar el pedido. Por favor intenta de nuevo.')
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div style={{ backgroundColor: BRAND.black, minHeight: '100vh', color: BRAND.white, fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      
      {/* ESTILOS DINÁMICOS PARA RESPONSIVE Y ANIMACIONES */}
      <style dangerouslySetInnerHTML={{ __html: `
        .grid-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          padding: 15px;
        }
        @media (min-width: 640px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 20px;
          }
        }
        @media (min-width: 1024px) {
          .grid-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1536px) {
          .grid-container {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
        .btn-active:active { transform: scale(0.95); }
        .premium-shadow { box-shadow: 0 10px 30px -5px rgba(0,0,0,0.5); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(26, 26, 26, 0.8); border: 1px solid rgba(255,255,255,0.05); }
        @keyframes slideIn { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes popUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}} />

      {/* MODAL DE OPCIONES Y NOTAS (NUEVO) */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(15px)' }}>
          <div style={{ backgroundColor: BRAND.darkGray, width: '100%', maxWidth: '400px', borderRadius: '35px', padding: '30px', border: `1px solid ${BRAND.orange}40`, animation: 'popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 5px 0', color: BRAND.white }}>{selectedProduct.nombre}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 25px 0', fontSize: '13px' }}>¿Deseas personalizar tu pedido?</p>
            
            {selectedProduct.allowsHalf && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '5px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '20px' }}>
                <button 
                  onClick={() => setIsHalfPortion(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '15px', border: 'none', backgroundColor: !isHalfPortion ? BRAND.orange : 'transparent', color: !isHalfPortion ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}
                >
                  Porción Completa
                </button>
                <button 
                  onClick={() => setIsHalfPortion(true)}
                  style={{ flex: 1, padding: '10px', borderRadius: '15px', border: 'none', backgroundColor: isHalfPortion ? BRAND.orange : 'transparent', color: isHalfPortion ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}
                >
                  Media Porción
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {(selectedProduct.categoria === 'bebidas' 
                ? ['Sin azúcar', 'Sin hielo', 'Poco hielo', 'Vaso aparte']
                : ['Sin sal', 'Salsas aparte', 'Sin picante', 'Bien frito']
              ).map(opt => (
                <button 
                  key={opt}
                  onClick={() => setCustomNote(prev => prev.includes(opt) ? prev.replace(opt, '').trim() : `${prev} ${opt}`.trim())}
                  style={{
                    backgroundColor: customNote.includes(opt) ? BRAND.orange : 'rgba(255,255,255,0.05)',
                    color: customNote.includes(opt) ? 'white' : 'rgba(255,255,255,0.7)',
                    border: `1px solid ${customNote.includes(opt) ? BRAND.orange : 'rgba(255,255,255,0.1)'}`,
                    padding: '12px',
                    borderRadius: '15px',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="btn-active"
                >
                  {opt}
                </button>
              ))}
            </div>

            <input 
              placeholder="Otras instrucciones (ej. bien frito)..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '16px', borderRadius: '15px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '25px', outline: 'none', fontSize: '14px' }}
            />

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setSelectedProduct(null)} 
                style={{ flex: 1, padding: '15px', borderRadius: '20px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: '900', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => confirmAddToCart()} 
                style={{ flex: 1, padding: '15px', borderRadius: '20px', backgroundColor: BRAND.success, border: 'none', color: 'white', fontWeight: '900', cursor: 'pointer', boxShadow: `0 4px 15px ${BRAND.success}40` }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJE DE ÉXITO AL AGREGAR AL CARRITO */}
      {showSuccess && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, width: '90%', maxWidth: '400px', animation: 'slideIn 0.3s ease-out' }}>
          <div style={{ backgroundColor: BRAND.success, color: 'white', padding: '16px 24px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
              <CheckCircle2 size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>¡Agregado!</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{showSuccess} listo para pedir</p>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJE DE PEDIDO ENVIADO CON ÉXITO */}
      {orderSent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
          <div style={{ backgroundColor: BRAND.darkGray, padding: '40px 30px', borderRadius: '40px', border: `1px solid ${BRAND.orange}40`, maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: BRAND.success, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${BRAND.success}40` }}>
                <CheckCircle2 size={40} color="white" />
             </div>
             <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>¡PEDIDO RECIBIDO!</h2>
             <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>Tu pedido ha sido enviado a la cocina. En un momento te lo llevaremos a la <strong>Mesa {params.mesa_id}</strong>.</p>
             <button onClick={() => setOrderSent(false)} style={{ backgroundColor: BRAND.orange, color: 'white', border: 'none', padding: '15px 40px', borderRadius: '20px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', marginTop: '10px' }}>Entendido</button>
          </div>
        </div>
      )}

      {/* HEADER PREMIUM */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(15, 15, 15, 0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BRAND.lightGray}`, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '50%', background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.orange}, ${BRAND.gold})`, padding: '2px' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: BRAND.gold }}>DP</span>
            </div>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', color: BRAND.white }}>
              DAR<span style={{ color: BRAND.orange }}>PAPAYA</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <p style={{ margin: 0, fontSize: '10px', color: BRAND.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Mesa {params.mesa_id}
              </p>
              <div style={{ backgroundColor: BRAND.success + '20', padding: '2px 6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px', border: `1px solid ${BRAND.success}40` }}>
                <CheckCircle2 size={8} color={BRAND.success} />
                <span style={{ fontSize: '7px', fontWeight: '900', color: BRAND.success, textTransform: 'uppercase' }}>Verificada</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: `linear-gradient(to right, ${BRAND.darkGray}, ${BRAND.black})`, padding: '8px 15px', borderRadius: '12px', border: `1px solid ${BRAND.lightGray}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} color={BRAND.orange} />
          <span style={{ fontWeight: '900', fontSize: '15px', color: BRAND.white }}>{(total() + pendingTotal).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
        </div>
      </header>

      {/* CATEGORÍAS - ESTILO PREMIUM (NUEVA BARRA SCROLLABLE) */}
      <div style={{ position: 'sticky', top: '67px', zIndex: 90, backgroundColor: BRAND.black, padding: '15px 20px', display: 'flex', gap: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `
           div::-webkit-scrollbar { display: none; }
        `}} />
        {[
          { id: 'tipicos', label: 'Típicos', icon: <UtensilsCrossed size={16} /> },
          { id: 'entrantes', label: 'Entrantes', icon: <UtensilsCrossed size={16} /> },
          { id: 'sopas', label: 'Sopas', icon: <UtensilsCrossed size={16} /> },
          { id: 'parrilla', label: 'Parrilla', icon: <UtensilsCrossed size={16} /> },
          { id: 'postres', label: 'Postres', icon: <UtensilsCrossed size={16} /> },
          { id: 'bebidas', label: 'Bebidas', icon: <Beer size={16} /> }
        ].map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            style={{ flexShrink: 0, padding: '12px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s', backgroundColor: activeTab === cat.id ? BRAND.orange : BRAND.darkGray, color: activeTab === cat.id ? BRAND.white : 'rgba(255,255,255,0.6)', boxShadow: activeTab === cat.id ? `0 8px 20px ${BRAND.orange}40` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            className="btn-active"
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <main style={{ paddingBottom: '120px' }}>
        <div className="grid-container">
          {filteredProducts.map((product) => (
            <div key={product.id} className="premium-shadow" style={{ backgroundColor: BRAND.darkGray, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${BRAND.lightGray}`, display: 'flex', flexDirection: 'column' }}>
              
              {/* IMAGEN OPTIMIZADA Y RESPONSIVE */}
              <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative', background: '#000' }}>
                <img 
                  src={product.img_url} 
                  alt={product.nombre} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== FALLBACK_IMAGE) {
                      target.src = FALLBACK_IMAGE;
                    }
                  }}
                />
                <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '6px 12px', borderRadius: '10px', backdropFilter: 'blur(5px)', border: `1px solid ${BRAND.orange}40` }}>
                  <span style={{ color: BRAND.gold, fontWeight: '900', fontSize: '16px' }}>{product.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                {product.id.startsWith('c6') && (
                  <div style={{ position: 'absolute', top: '15px', left: '15px', background: `linear-gradient(45deg, ${BRAND.orange}, ${BRAND.gold})`, padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    <Star size={12} fill="white" color="white" />
                    <span style={{ fontSize: '10px', fontWeight: '900', color: BRAND.white, textTransform: 'uppercase' }}>Popular</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', color: BRAND.white, marginBottom: '4px' }}>{product.nombre}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>{product.desc}</p>
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {['parrilla', 'tipicos'].includes(product.categoria) && !product.nombre.toLowerCase().includes('hamburguesa') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: BRAND.gold, letterSpacing: '1px' }}>Término Sugerido</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {['Azul', 'Medio', '3/4', 'Asada'].map(term => (
                          <button
                            key={term}
                            onClick={() => setSelectedTerm(prev => ({ ...prev, [product.id]: term }))}
                            style={{ 
                              padding: '8px 0', 
                              fontSize: '9px', 
                              fontWeight: '900', 
                              borderRadius: '8px', 
                              border: '1px solid',
                              borderColor: (selectedTerm[product.id] || '3/4') === term ? BRAND.orange : 'rgba(255,255,255,0.1)',
                              cursor: 'pointer', 
                              backgroundColor: (selectedTerm[product.id] || '3/4') === term ? `${BRAND.orange}20` : 'transparent', 
                              color: (selectedTerm[product.id] || '3/4') === term ? BRAND.orange : 'rgba(255,255,255,0.4)',
                              transition: 'all 0.2s' 
                            }}
                          >
                            {term === 'Asada' ? 'Bien Asada' : term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: BRAND.lightGray, borderRadius: '12px', padding: '4px' }}>
                      <button 
                        onClick={() => handleQtyChange(product.id, -1)}
                        style={{ width: '36px', height: '36px', border: 'none', background: 'none', color: BRAND.white, fontWeight: '900', fontSize: '20px', cursor: 'pointer' }}
                      >-</button>
                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '900', color: BRAND.gold }}>{localQuantities[product.id] || 1}</span>
                      <button 
                        onClick={() => handleQtyChange(product.id, 1)}
                        style={{ width: '36px', height: '36px', border: 'none', background: 'none', color: BRAND.white, fontWeight: '900', fontSize: '20px', cursor: 'pointer' }}
                      >+</button>
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(product)}
                      style={{ 
                        flex: 1, 
                        padding: '14px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontWeight: '900', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px', 
                        fontSize: '12px', 
                        background: `linear-gradient(to right, ${BRAND.orange}, #B45309)`, 
                        color: BRAND.white, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        boxShadow: `0 8px 20px ${BRAND.orange}40` 
                      }}
                      className="btn-hover btn-active"
                    >
                      <Plus size={18} strokeWidth={3} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER FLOTANTE */}
      <footer style={{ position: 'fixed', bottom: '20px', left: '0', right: '0', zIndex: 200, padding: '0 20px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(20px)', padding: '15px 20px', borderRadius: '24px', border: `1px solid ${BRAND.lightGray}`, boxShadow: '0 20px 50px rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: BRAND.gold, letterSpacing: '1px' }}>Subtotal</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: BRAND.white }}>${total().toLocaleString()}</p>
          </div>
          <button 
            onClick={handleSendOrder}
            disabled={items.length === 0 || isOrdering}
            style={{ 
              background: items.length === 0 ? BRAND.lightGray : `linear-gradient(to right, ${BRAND.orange}, ${BRAND.red})`, 
              color: BRAND.white, 
              border: 'none', 
              padding: '14px 25px', 
              borderRadius: '15px', 
              fontWeight: '900', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              fontSize: '12px', 
              cursor: items.length === 0 ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              boxShadow: items.length === 0 ? 'none' : `0 8px 20px ${BRAND.orange}40`,
              opacity: isOrdering ? 0.7 : 1
            }} 
            className={items.length > 0 ? "btn-hover btn-active" : ""}
          >
            {isOrdering ? <Loader2 className="animate-spin" size={18} /> : 'Pedir'} <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      </footer>
    </div>
  )
}
