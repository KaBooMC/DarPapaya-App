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
  // CARNES Y PARRILLA
  { id: 'c1', nombre: 'Lomo Salteado', precio: 22900, categoria: 'carnes', destino: 'cocina', desc: 'Tiras de lomo salteadas al wok con cebollas, tomates y papas criollas, acompañado de arroz chaufa.', img_url: 'https://plus.unsplash.com/premium_photo-1669261881145-9aeee34aaaf9?q=80&w=1170&auto=format&fit=crop' },
  { id: 'c2', nombre: 'Bondiola de Cerdo', precio: 22900, categoria: 'carnes', destino: 'cocina', desc: 'Con salsa de jengibre, panela y naranja. Acompañada de puré de papa sellado y vegetales salteados.', img_url: 'https://images.unsplash.com/photo-1615852735201-2ce54ffa6afa?q=80&w=1193&auto=format&fit=crop' },
  { id: 'c3', nombre: 'Lomo Tamarindo', precio: 25900, categoria: 'carnes', destino: 'cocina', desc: 'Medallones bañados en salsa de tamarindo, acompañados de papas criollas crujientes y picadillo de mazorca.', img_url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80' },
  { id: 'c4', nombre: 'Pollo Ajonjolí', precio: 19900, categoria: 'carnes', destino: 'cocina', desc: 'Pechuga apanada en Panko bañada en miel de soya y servida con papas criollas tempura.', img_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80' },
  { id: 'c5', nombre: 'Arroz Nikkei', precio: 22900, categoria: 'carnes', destino: 'cocina', desc: 'Lomo salteado al wok con cebollas, tomates y papas criollas tempura sobre arroz chaufa.', img_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80' },
  { id: 'c6', nombre: 'Punta de Anca', precio: 29900, categoria: 'carnes', destino: 'cocina', desc: 'A la parrilla 300gr. Acompañado de papas rústicas y ensalada.', img_url: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=800&q=80' },
  { id: 'c7', nombre: 'Tapa de Cuadril', precio: 41900, categoria: 'carnes', destino: 'cocina', desc: 'Corte de Angus uruguayo a la parrilla 300gr.', img_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
  { id: 'c8', nombre: 'Asado de tira', precio: 39900, categoria: 'carnes', destino: 'cocina', desc: 'Corte de Angus uruguayo a la parrilla 300gr.', img_url: 'https://plus.unsplash.com/premium_photo-1669261881860-4a9bb0f240a6?q=80&w=687&auto=format&fit=crop' },

  // PESCADOS Y MARISCOS
  { id: 'p1', nombre: 'Salmón a la Parrilla', precio: 25900, categoria: 'pescados', destino: 'cocina', desc: 'Filete de salmón asado al término de su elección. Acompañado de papa rústica cajún y ensalada.', img_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80' },
  { id: 'p2', nombre: 'Pescado Frito', precio: 25900, categoria: 'pescados', destino: 'cocina', desc: 'Acompañado de arroz con coco, patacones de guineo, ensalada de aguacate y suero costeño.', img_url: 'https://images.unsplash.com/photo-1752367799020-48160b694eb9?q=80&w=1170&auto=format&fit=crop' },
  { id: 'p3', nombre: 'Langostinos', precio: 29900, categoria: 'pescados', destino: 'cocina', desc: 'Bañados en salsa de coco y curry. Acompañados de arroz verde, espinaca salteada y crocantes de arroz.', img_url: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=800&q=80' },
  { id: 'p4', nombre: 'Encocado de Mariscos', precio: 29900, categoria: 'pescados', destino: 'cocina', desc: 'Nuestra versión de una cazuela, acompañado de arroz con coco y patacones de guineo.', img_url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80' },
  { id: 'p5', nombre: 'Arroz Caldoso', precio: 29900, categoria: 'pescados', destino: 'cocina', desc: 'Mezcla de pescado, muelitas de cangrejo, calamar y camarón, flameados en ron.', img_url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80' },
  { id: 'p6', nombre: 'Pesto-Thai', precio: 29900, categoria: 'pescados', destino: 'cocina', desc: 'Filete de pescado blanco con salsa de pesto, chile y lulo, yucas fritas, camarones y naranja.', img_url: 'https://images.unsplash.com/photo-1691199870081-c55001ae1846?w=600&auto=format&fit=crop&q=60' },
  { id: 'p7', nombre: 'Pescado Costra Yuca', precio: 26900, categoria: 'pescados', destino: 'cocina', desc: 'Servido sobre torta de plátano maduro, queso costeño y aguacate. Acompañado de pico de gallo.', img_url: 'https://plus.unsplash.com/premium_photo-1661771530363-b2ca3620546b?w=600&auto=format&fit=crop&q=60' },
  { id: 'p8', nombre: 'Salmón Suero', precio: 28900, categoria: 'pescados', destino: 'cocina', desc: 'Con suero y chimichurri de eneldo, servido sobre una arepa de chocolo y stew de chorizo.', img_url: 'https://images.unsplash.com/photo-1619734490039-a68d5c82cf30?w=600&auto=format&fit=crop&q=60' },

  // AL WOK Y OTROS
  { id: 'w1', nombre: 'Pad Thai', precio: 24900, categoria: 'wok', destino: 'cocina', desc: 'Pasta de arroz con pollo, camarones, calamares y nueces salteados al wok con salsa de tamarindo.', img_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80' },
  { id: 'w2', nombre: 'Menú de Niños', precio: 13900, categoria: 'wok', destino: 'cocina', desc: 'Dedos de pechuga apanados en panko, miel y papas criollas tempura.', img_url: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?auto=format&fit=crop&w=800&q=80' },
  { id: 'w3', nombre: 'Aborrajado Darpapaya', precio: 24900, categoria: 'wok', destino: 'cocina', desc: 'Cubos de lomo salteado al wok, con miel de soya, sobre aborrajado relleno de queso crema.', img_url: 'https://images.unsplash.com/photo-1710811891369-861113f8422b?w=600&auto=format&fit=crop&q=60' },
  { id: 'w4', nombre: 'Cazuela Darpapaya', precio: 24900, categoria: 'wok', destino: 'cocina', desc: 'Cazuela de frijoles con chorizo, mazorca y hogao. Resguardada de arroz blanco, maduros, aguacate y chicharrón.', img_url: 'https://media.istockphoto.com/id/1154632879/es/foto/delicioso-estofado-vaquero-de-frijoles-con-carne-picada-tocino-en-una-salsa-picante-en-un.webp?a=1&b=1&s=612x612&w=0&k=20&c=BO21evC-uHRMIwLxzZVy1B2zsjaLEOS89F0YYPM0ZbY=' },

  // ENTRADAS
  { id: 'e1', nombre: 'Carpaccio Chorizo', precio: 9900, categoria: 'entradas', destino: 'cocina', desc: 'Acompañado de chimichurri de tomates secos y pico de gallo con mango.', img_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
  { id: 'e2', nombre: 'Costillas de Cerdo', precio: 12900, categoria: 'entradas', destino: 'cocina', desc: 'Cocinadas y salteadas al wok bañadas en salsa dulce y sus propios jugos.', img_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { id: 'e3', nombre: 'Albóndigas Pescado', precio: 12900, categoria: 'entradas', destino: 'cocina', desc: 'Bolitas de pescado y curry apanadas en panko con salsa de maní picante.', img_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80' },
  { id: 'e4', nombre: 'Bombones Pollo', precio: 10500, categoria: 'entradas', destino: 'cocina', desc: 'Apanados en panko, con salsa de chile y lulo, suero costeño y chipotle.', img_url: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?auto=format&fit=crop&w=800&q=80' },
  { id: 'e5', nombre: 'Chicharrón Enroscado', precio: 12900, categoria: 'entradas', destino: 'cocina', desc: 'Acompañado de piña salteada y salsa de jengibre, miso y cilantro.', img_url: 'https://images.unsplash.com/photo-1712189726339-a304fd330cc7?auto=format&fit=crop&w=800&q=80' },
  { id: 'e6', nombre: 'Mazorcas Dulces', precio: 8900, categoria: 'entradas', destino: 'cocina', desc: 'Con salsa de suero con chipotle y queso costeño rayado.', img_url: 'https://images.unsplash.com/photo-1619221881992-78381378c20c?auto=format&fit=crop&w=800&q=80' },
  { id: 'e7', nombre: 'Camarones Glaceados', precio: 14900, categoria: 'entradas', destino: 'cocina', desc: 'Con salsa dulce de azafrán, servidos en corona de plátano y lechuga con misso y jengibre.', img_url: 'https://images.unsplash.com/photo-1673238110633-876516a993c9?w=600&auto=format&fit=crop&q=60' },
  
  // CEVICHES & TIRADITOS
  { id: 'v1', nombre: 'Ceviche Del Chef', precio: 13900, categoria: 'ceviches', destino: 'cocina', desc: 'Cebollas dulce curada, aguacate, limón, mango pintón, aceite de oliva y cilantro.', img_url: 'https://images.unsplash.com/photo-1679600436973-94ae622ddced?w=600&auto=format&fit=crop&q=60' },
  { id: 'v2', nombre: 'Ceviche Mexicano', precio: 13900, categoria: 'ceviches', destino: 'cocina', desc: 'Puré de tomates asados, cebolla blanca, aguacate, limón, cilantro y chipotle.', img_url: 'https://images.unsplash.com/photo-1656853834420-51980b12a920?w=600&auto=format&fit=crop&q=60' },
  { id: 'v3', nombre: 'Ceviche Nikkei', precio: 13900, categoria: 'ceviches', destino: 'cocina', desc: 'Cebolla roja, jengibre, salsa nikkei, limón, cilantro y ajonjolí.', img_url: 'https://media.istockphoto.com/id/1192167217/es/foto/ceviche.webp?a=1&b=1&s=612x612&w=0&k=20&c=jxkv4TjDPlm_uEl1BAmNwXo6IebC3uDZUN6Kw2BDRCY=' },
  { id: 'v4', nombre: 'Ceviche Caribeño', precio: 13900, categoria: 'ceviches', destino: 'cocina', desc: 'Suero costeño, platanitos maduros, chorizo frito, cebolla curada y limón.', img_url: 'https://images.unsplash.com/photo-1609722719705-11f7c7472b5c?w=600&auto=format&fit=crop&q=60' },
  { id: 'v5', nombre: 'Ceviche Ají Amarillo', precio: 13900, categoria: 'ceviches', destino: 'cocina', desc: 'Cebolla roja, salsa de ají amarillo, maiz tostado y cilantro.', img_url: 'https://plus.unsplash.com/premium_photo-1769871699080-4c19b21790c2?w=600&auto=format&fit=crop&q=60' },
  { id: 'v6', nombre: 'Ceviche Tamarindo', precio: 13900, categoria: 'ceviches', destino: 'cocina', desc: 'Leche de tigre al tamarindo, aceite de ajonjolí, cebolla roja curada y maiz.', img_url: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?auto=format&fit=crop&w=800&q=80' },
  { id: 't1', nombre: 'Tiradito Ají Amarillo', precio: 10900, categoria: 'ceviches', destino: 'cocina', desc: 'Tiras de pescado bañadas en salsa suave de ají amarillo y cilantro.', img_url: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=800&q=80' },
  { id: 't3', nombre: 'Tiradito Limonaria', precio: 10900, categoria: 'ceviches', destino: 'cocina', desc: 'Salsa de limonaria y aceite de oliva.', img_url: 'https://images.unsplash.com/photo-1582234396794-7fdfcf06b83c?w=600&auto=format&fit=crop&q=60' },
  { id: 't2', nombre: 'Tiradito Wasabi', precio: 10900, categoria: 'ceviches', destino: 'cocina', desc: 'Tiras de pescado o salmón con mayonesa y crocantes de wasabi.', img_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },

  // ENSALADAS Y SOPAS
  { id: 's1', nombre: 'Ensalada Quínua', precio: 22900, categoria: 'sopas', destino: 'cocina', desc: 'Limón, hierbabuena, manzana, tomate y aceite de oliva. Pídalo con pollo a la parrilla.', img_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
  { id: 's2', nombre: 'Ensalada Langostinos', precio: 18500, categoria: 'sopas', destino: 'cocina', desc: 'Apanados en coco con lechuga, mango y vinagreta de limonaria.', img_url: 'https://images.unsplash.com/photo-1673238110633-876516a993c9?w=600&auto=format&fit=crop&q=60' },
  { id: 's5', nombre: 'Ensalada Pollo Mexicana', precio: 16900, categoria: 'sopas', destino: 'cocina', desc: 'Lechugas, maíz dulce, tomate, queso, aguacate, jalapeños y pollo.', img_url: 'https://images.unsplash.com/photo-1666599028424-e316d4e34aa6?w=600&auto=format&fit=crop&q=60' },
  { id: 's6', nombre: 'Sandia y Queso Frito', precio: 16900, categoria: 'sopas', destino: 'cocina', desc: 'Lechugas con sandía, queso frito, cebollas caramelizadas y vinagre balsámico.', img_url: 'https://media.istockphoto.com/id/844431200/es/foto/queso-en-lonchas-y-sand%C3%ADa.webp?a=1&b=1&s=612x612&w=0&k=20&c=2IGq99G3CRlK-f6Fp3ZsEdW6kb0D5VfPvRct-0RJE5o=' },
  { id: 's3', nombre: 'Sopa Mexicana', precio: 16900, categoria: 'sopas', destino: 'cocina', desc: 'Hecha con tomates rostizados, servida con aguacate, queso y pollo.', img_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', allowsHalf: true },
  { id: 's4', nombre: 'Sopa de Mariscos', precio: 27900, categoria: 'sopas', destino: 'cocina', desc: 'Mezcla de pescado, camarón, calamar y muelitas de cangrejo.', img_url: 'https://images.unsplash.com/photo-1616431688941-fee43c566442?w=600&auto=format&fit=crop&q=60', allowsHalf: true },

  // BEBIDAS
  { id: 'b1', nombre: 'Club Colombia', precio: 8500, categoria: 'bebidas', destino: 'bar', desc: 'Cerveza Club Colombia Dorada.', img_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80' },
  { id: 'b2', nombre: 'Jugo Natural', precio: 9000, categoria: 'bebidas', destino: 'bar', desc: 'Elegir sabor: Limonada, Mandarina o Mango.', img_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80' },
  { id: 'b5', nombre: 'Limonada de Coco', precio: 12000, categoria: 'bebidas', destino: 'bar', desc: 'Cremosa limonada con leche de coco.', img_url: 'https://images.unsplash.com/photo-1738986589122-c06ea8dbab85?w=600&auto=format&fit=crop&q=60' },
  { id: 'b6', nombre: 'Limonada Cerezada', precio: 11000, categoria: 'bebidas', destino: 'bar', desc: 'Limonada fresca con cerezas dulces.', img_url: 'https://images.unsplash.com/photo-1668533889350-21a05111310b?w=600&auto=format&fit=crop&q=60' },
]
