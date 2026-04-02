'use client'
import { useState, useMemo, useEffect } from 'react'
import { ShoppingBag, ChevronRight, Plus, Star, CheckCircle2, X, MapPin, UtensilsCrossed, Beer, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'

const MOCK_PRODUCTS = [
  // CARNES
  { id: 'c1', nombre: 'Lomo Salteado', precio: 22900, categoria: 'comida', sub: 'Carnes', destino: 'cocina', desc: 'Tiras de lomo salteadas al wok con cebollas, tomates y papas criollas, acompañado de arroz chaufa.', img_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop' },
  { id: 'c2', nombre: 'Bondiola de Cerdo', precio: 22900, categoria: 'comida', sub: 'Carnes', destino: 'cocina', desc: 'Con salsa de jengibre, panela y naranja. Acompañada de puré de papa sellado y vegetales salteados.', img_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop' },
  { id: 'c3', nombre: 'Lomo Tamarindo', precio: 25900, categoria: 'comida', sub: 'Carnes', destino: 'cocina', desc: 'Medallones bañados en salsa de tamarindo, acompañados de papas criollas crujientes.', img_url: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000' },
  { id: 'c4', nombre: 'Pollo Ajonjolí', precio: 19900, categoria: 'comida', sub: 'Carnes', destino: 'cocina', desc: 'Pechuga apanada en Panko bañada en miel de soya y servida con papas criollas tempura.', img_url: 'https://images.unsplash.com/photo-1606728035253-49e1961b980d?q=80&w=2000' },
  { id: 'c5', nombre: 'Arroz Nikkei', precio: 22900, categoria: 'comida', sub: 'Carnes', destino: 'cocina', desc: 'Lomo salteado al wok con cebollas, tomates y papas criollas tempura sobre arroz chaufa.', img_url: 'https://images.unsplash.com/photo-1512058560366-cd242959b4fe?q=80&w=2000' },
  { id: 'c6', nombre: 'Punta de Anca', precio: 29900, categoria: 'comida', sub: 'A la Parrilla', destino: 'cocina', desc: '300gr de Punta de Anca premium servida con papas rústicas y ensalada de la casa.', img_url: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?q=80&w=2000' },
  
  // PESCADOS Y MARISCOS
  { id: 'p1', nombre: 'Salmón a la Parrilla', precio: 25900, categoria: 'comida', sub: 'Pescados', destino: 'cocina', desc: 'Filete de salmón al término de su elección con aderezo asiático de limón y jengibre.', img_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=2000' },
  { id: 'p2', nombre: 'Pescado Frito', precio: 25900, categoria: 'comida', sub: 'Pescados', destino: 'cocina', desc: 'Acompañado de arroz con coco, patacones de guineo, ensalada de aguacate y suero costeño.', img_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2000' },
  { id: 'p3', nombre: 'Arroz Caldoso', precio: 29900, categoria: 'comida', sub: 'Pescados', destino: 'cocina', desc: 'Mezcla de pescado, muelitas de cangrejo, calamar y camarón flameados en ron.', img_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000' },
  { id: 'p4', nombre: 'Encocado de Mariscos', precio: 29900, categoria: 'comida', sub: 'Pescados', destino: 'cocina', desc: 'Nuestra versión de una cazuela, acompañado de arroz con coco y patacones de guineo.', img_url: 'https://images.unsplash.com/photo-1534080564607-c987d6666f00?q=80&w=2000' },
  
  // AL WOK Y OTROS
  { id: 'w1', nombre: 'Pad Thai', precio: 24900, categoria: 'comida', sub: 'Wok', destino: 'cocina', desc: 'Pasta de arroz con pollo, camarones, calamares y nueces salteados al wok.', img_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000' },
  { id: 'w2', nombre: 'Aborrajado Darpapaya', precio: 24900, categoria: 'comida', sub: 'Especiales', destino: 'cocina', desc: 'Cubos de lomo salteado al wok, con miel de soya, sobre aborrajado relleno de queso crema.', img_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=2000' },
  
  // ENTRADAS
  { id: 'e1', nombre: 'Carpaccio de Chorizo', precio: 9900, categoria: 'comida', sub: 'Entradas', destino: 'cocina', desc: 'Acompañado de chimichurri de tomates secos y pico de gallo con mango.', img_url: 'https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=2000' },
  { id: 'e2', nombre: 'Costillas de Cerdo', precio: 12900, categoria: 'comida', sub: 'Entradas', destino: 'cocina', desc: 'Cocinadas y salteadas al wok bañadas en salsa dulce y sus propios jugos.', img_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069' },
  { id: 'e3', nombre: 'Chicharrón Enroscado', precio: 12900, categoria: 'comida', sub: 'Entradas', destino: 'cocina', desc: 'Acompañado de piña salteada y salsa de jengibre, miso y cilantro.', img_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=2014' },
  
  // BEBIDAS
  { id: 'b1', nombre: 'Cerveza Club Colombia', precio: 8500, categoria: 'bebida', destino: 'bar', desc: 'Rubia, Roja o Negra.', img_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070' },
  { id: 'b2', nombre: 'Jugo Natural', precio: 9000, categoria: 'bebida', destino: 'bar', desc: 'Limonada o Mandarina fresca.', img_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=2072' },
]

export default function MenuPage({ params }: { params: { mesa_id: string } }) {
  const { addItem, items, total, clearCart } = useCartStore()
  const [activeTab, setActiveTab] = useState<'comida' | 'bebida'>('comida')
  const [selectedTerm, setSelectedTerm] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState<string | null>(null)
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  // Colores de la Marca Darpapaya (Extraídos del Logo)
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

  const filteredProducts = useMemo(() => 
    MOCK_PRODUCTS.filter(p => p.categoria === activeTab),
  [activeTab])

  const handleAddToCart = (product: any) => {
    const term = product.categoria === 'comida' ? (selectedTerm[product.id] || '3/4') : undefined
    const extraNotes = window.prompt(`¿Alguna nota especial para ${product.nombre}? (Ej: sin sal, sin salsa)`, '')
    
    let nombreFinal = product.nombre
    if (extraNotes && extraNotes.trim() !== '') {
      nombreFinal = `${product.nombre} (${extraNotes.trim()})`
    }
    
    addItem({ ...product, nombre: nombreFinal, cantidad: 1, termino: term })
    setShowSuccess(product.nombre)
    setTimeout(() => setShowSuccess(null), 3000)
  }

  const handleSendOrder = async () => {
    if (items.length === 0 || isOrdering) return
    setIsOrdering(true)

    try {
      // 1. Crear el Pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          mesa_id: parseInt(params.mesa_id),
          total: total(),
          estado_pago: 'pendiente'
        }])
        .select()
        .single()

      if (pedidoError) throw pedidoError

      // 2. Insertar los Items del Pedido
      const pedidoItems = items.map(item => ({
        pedido_id: pedido.id,
        producto_id: null, // En un sistema real usaríamos el ID de Supabase, aquí usamos el nombre como referencia
        cantidad: item.cantidad,
        notas: item.nombre, // Guardamos el nombre aquí por ahora para simplificar el mock
        termino: item.termino,
        estado: 'pendiente'
      }))

      const { error: itemsError } = await supabase
        .from('pedido_items')
        .insert(pedidoItems)

      if (itemsError) throw itemsError

      // 3. Éxito
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
      `}} />

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
          <span style={{ fontWeight: '900', fontSize: '15px', color: BRAND.white }}>${total().toLocaleString()}</span>
        </div>
      </header>

      {/* CATEGORÍAS - ESTILO PREMIUM */}
      <div style={{ position: 'sticky', top: '67px', zIndex: 90, backgroundColor: BRAND.black, padding: '15px 20px', display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setActiveTab('comida')}
          style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s', backgroundColor: activeTab === 'comida' ? BRAND.orange : BRAND.darkGray, color: BRAND.white, boxShadow: activeTab === 'comida' ? `0 8px 20px ${BRAND.orange}40` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          className="btn-active"
        >
          <UtensilsCrossed size={16} /> Parrilla
        </button>
        <button 
          onClick={() => setActiveTab('bebida')}
          style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s', backgroundColor: activeTab === 'bebida' ? BRAND.gold : BRAND.darkGray, color: activeTab === 'bebida' ? BRAND.black : BRAND.white, boxShadow: activeTab === 'bebida' ? `0 8px 20px ${BRAND.gold}40` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          className="btn-active"
        >
          <Beer size={16} /> Bebidas
        </button>
      </div>

      <main style={{ paddingBottom: '120px' }}>
        <div className="grid-container">
          {filteredProducts.map((product) => (
            <div key={product.id} className="premium-shadow" style={{ backgroundColor: BRAND.darkGray, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${BRAND.lightGray}`, display: 'flex', flexDirection: 'column' }}>
              
              {/* IMAGEN OPTIMIZADA */}
              <div style={{ width: '100%', height: '180px', position: 'relative', background: '#000' }}>
                <img 
                  src={product.img_url} 
                  alt={product.nombre} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '6px 12px', borderRadius: '10px', backdropFilter: 'blur(5px)', border: `1px solid ${BRAND.orange}40` }}>
                  <span style={{ color: BRAND.gold, fontWeight: '900', fontSize: '16px' }}>${product.precio.toLocaleString()}</span>
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
                  {product.categoria === 'comida' && (
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
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    style={{ 
                      width: '100%', 
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
