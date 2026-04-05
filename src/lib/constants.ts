export const BRAND = {
  orange: '#D97706',
  gold: '#FDE047',
  black: '#0F0F0F',
  darkGray: '#1A1A1A',
  lightGray: '#2A2A2A',
  red: '#991B1B',
  white: '#FFFFFF',
  success: '#10B981'
}

export const MOCK_PRODUCTS = [
  // ENTRANTES
  { id: 'e1', nombre: 'Empanadas', precio: 2.50, categoria: 'entrantes', destino: 'cocina', desc: 'Masa de maíz rellena de carne, patata y salsa de la casa.', img_url: 'https://images.unsplash.com/photo-1628515684234-706786c55985?w=800' },
  { id: 'e2', nombre: 'Maduro con Queso', precio: 7.00, categoria: 'entrantes', destino: 'cocina', desc: 'Plátano macho maduro con queso fundido.', img_url: 'https://images.unsplash.com/photo-1621235122176-a0528e1882d9?w=800' },
  { id: 'e3', nombre: 'Maduro Relleno', precio: 10.00, categoria: 'entrantes', destino: 'cocina', desc: 'Relleno de Pollo, carne mechada, queso, chorizo y chicharrón.', img_url: 'https://images.unsplash.com/photo-1621235122176-a0528e1882d9?w=800' },
  { id: 'e4', nombre: 'Patacón con Todo', precio: 11.00, categoria: 'entrantes', destino: 'cocina', desc: 'Pollo, carne mechada, queso, chorizo y chicharrón sobre patacón crujiente.', img_url: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=800' },
  { id: 'e5', nombre: 'Arepa de lo que Quieras', precio: 8.50, categoria: 'entrantes', destino: 'cocina', desc: 'Elegir: Pollo, carne mechada, queso, chorizo o chicharrón.', img_url: 'https://images.unsplash.com/photo-1622325381812-70b54e7f607a?w=800' },

  // PARA ENTRAR EN CALOR (SOPAS)
  { id: 's1', nombre: 'Sancocho de Gallina', precio: 16.00, categoria: 'sopas', destino: 'cocina', desc: 'Caldo a base de patata, plátano, yuca y mazorca con arroz y aguacate.', img_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800' },
  { id: 's2', nombre: 'Sancocho de Costilla', precio: 16.00, categoria: 'sopas', destino: 'cocina', desc: 'Delicioso caldo de costilla con acompañamientos tradicionales.', img_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800' },
  { id: 's3', nombre: 'Sancocho de Pescado', precio: 16.00, categoria: 'sopas', destino: 'cocina', desc: 'Fresco sancocho de pescado con el sabor del mar.', img_url: 'https://images.unsplash.com/photo-1616431688941-fee43c566442?w=800' },
  { id: 's4', nombre: 'Mondongo', precio: 15.00, categoria: 'sopas', destino: 'cocina', desc: 'Sopa de callos y cerdo con patatas, zanahoria y guisantes con arroz y aguacate.', img_url: 'https://plus.unsplash.com/premium_photo-1661771530363-b2ca3620546b?w=800' },
  { id: 's5', nombre: 'Ajiaco', precio: 16.00, categoria: 'sopas', destino: 'cocina', desc: 'Sopa a base de pollo y patatas con guasca, mazorca, arroz, aguacate, nata y alcaparras.', img_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800' },

  // PLATOS TÍPICOS
  { id: 't1', nombre: 'Bandeja Paisa', precio: 17.50, categoria: 'tipicos', destino: 'cocina', desc: 'Frijoles, arroz, chorizo, chicharrón, carne molida, huevo frito, aguacate, plátano y patacón.', img_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800' },
  { id: 't2', nombre: 'Sobrebarriga', precio: 16.50, categoria: 'tipicos', destino: 'cocina', desc: 'Carne de res en salsa acompañada de arroz y yuca guisada.', img_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800' },
  { id: 't3', nombre: 'Tamal Valluno', precio: 14.50, categoria: 'tipicos', destino: 'cocina', desc: 'Masa de maíz rellena de carne de cerdo, pollo, zanahoria y patatas.', img_url: 'https://plus.unsplash.com/premium_photo-1669261881860-4a9bb0f240a6?w=800' },
  { id: 't4', nombre: 'Chuleta Valluna', precio: 17.00, categoria: 'tipicos', destino: 'cocina', desc: 'Cerdo apanado acompañado de arroz, ensalada y patatas fritas.', img_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800' },
  { id: 't5', nombre: 'Tilapia Frita', precio: 16.50, categoria: 'tipicos', destino: 'cocina', desc: 'Pescado frito acompañado de arroz y patacones.', img_url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800' },
  { id: 't6', nombre: 'Hamburguesa DarPapaya', precio: 10.50, categoria: 'tipicos', destino: 'cocina', desc: 'Ternera, bacon, jamón, queso, cebolla caramelizada, ripio y piña con patatas.', img_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800' },

  // A LA PARRILLA
  { id: 'p1', nombre: 'Punta de Anca', precio: 15.50, categoria: 'parrilla', destino: 'cocina', desc: 'Corte de ternera con ensalada, patata asada y chimichurri.', img_url: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?w=800' },
  { id: 'p2', nombre: 'Tira de Asado', precio: 15.00, categoria: 'parrilla', destino: 'cocina', desc: 'Tira de costilla de ternera con ensalada, patata asada y chimichurri.', img_url: 'https://plus.unsplash.com/premium_photo-1669261881145-9aeee34aaaf9?w=800' },
  { id: 'p3', nombre: 'Pechuga a la Parrilla', precio: 15.00, categoria: 'parrilla', destino: 'cocina', desc: 'Filete de pollo con ensalada, arroz, patatas fritas y chimichurri.', img_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800' },
  { id: 'p4', nombre: 'Entraña', precio: 16.00, categoria: 'parrilla', destino: 'cocina', desc: 'Corte de ternera de primera con ensalada y maduro.', img_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800' },
  { id: 'p5', nombre: 'Parrillada Mixta', precio: 33.00, categoria: 'parrilla', destino: 'cocina', desc: 'Cortes de carne, entraña, costilla, pollo, chorizo, morcilla, chicharrón y 3 guarniciones.', img_url: 'https://plus.unsplash.com/premium_photo-1669261881860-4a9bb0f240a6?w=800' },

  // POSTRES
  { id: 'po1', nombre: 'Tarta de Tres Leches', precio: 5.00, categoria: 'postres', destino: 'cocina', desc: 'Tradicional postre cremoso bañado en tres leches.', img_url: 'https://images.unsplash.com/photo-1512149673953-1e251807ec7c?w=800' },
  { id: 'po2', nombre: 'Obleas con Todo', precio: 5.00, categoria: 'postres', destino: 'cocina', desc: 'Mermelada, leche condensada, dulce de leche y queso rayado.', img_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800' },
  { id: 'po3', nombre: 'Crepe de Dulce', precio: 5.50, categoria: 'postres', destino: 'cocina', desc: 'Dulce de leche, sirope de chocolate o mermelada.', img_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800' },
  { id: 'po4', nombre: 'Brevas con Queso', precio: 5.50, categoria: 'postres', destino: 'cocina', desc: 'Brevas en dulce acompañadas de queso fresco.', img_url: 'https://images.unsplash.com/photo-1621235122176-a0528e1882d9?w=800' },
  { id: 'po5', nombre: 'Arroz con Leche', precio: 4.00, categoria: 'postres', destino: 'cocina', desc: 'Clásico arroz con leche casero con canela.', img_url: 'https://images.unsplash.com/photo-1512149673953-1e251807ec7c?w=800' },
  { id: 'po6', nombre: 'Mazamorra', precio: 4.50, categoria: 'postres', destino: 'cocina', desc: 'Maíz y leche con panela y dulce de guayaba.', img_url: 'https://images.unsplash.com/photo-1512149673953-1e251807ec7c?w=800' },

  // BEBIDAS
  { id: 'b1', nombre: 'Zumo Natural', precio: 4.00, categoria: 'bebidas', destino: 'bar', desc: 'Fruta fresca: Mango, Mora, Lulo, Maracuyá, Guayaba o Papaya.', img_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800' },
  { id: 'b2', nombre: 'Refresco Colombiano', precio: 2.80, categoria: 'bebidas', destino: 'bar', desc: 'Postobón (Uva, Manzana), Colombiana o Pony Malta.', img_url: 'https://images.unsplash.com/photo-1610873167013-2dd676d00e85?w=800' },
  { id: 'b3', nombre: 'Limonada de Coco', precio: 4.00, categoria: 'bebidas', destino: 'bar', desc: 'Refrescante y cremosa limonada con coco.', img_url: 'https://images.unsplash.com/photo-1546173159-315124a59895?w=800' },
  { id: 'b4', nombre: 'Cerveza Colombiana', precio: 4.00, categoria: 'bebidas', destino: 'bar', desc: 'Cerveza típica de nuestra tierra.', img_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },
  { id: 'b5', nombre: 'Refajo Premium', precio: 3.20, categoria: 'bebidas', destino: 'bar', desc: 'Mezcla tradicional de cerveza y Colombiana.', img_url: 'https://images.unsplash.com/photo-1560505191-be71e22709e4?w=800' },
  { id: 'b6', nombre: 'Café solo / Cortado', precio: 2.00, categoria: 'bebidas', destino: 'bar', desc: 'Expresso de alta calidad.', img_url: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=800' },
]
