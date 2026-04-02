-- Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12, 2) NOT NULL,
  categoria TEXT NOT NULL, -- 'comida', 'bebida'
  destino TEXT NOT NULL, -- 'cocina', 'bar'
  img_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id INTEGER NOT NULL,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  estado_pago TEXT DEFAULT 'pendiente', -- 'pendiente', 'pagado'
  metodo_pago TEXT,
  creado_at TIMESTAMPTZ DEFAULT now()
);

-- Pedido Items
CREATE TABLE pedido_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  notas TEXT,
  termino TEXT, -- 'Azul', 'Medio', '3/4', 'Bien asada'
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'listo'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE pedido_items;

-- Datos iniciales
INSERT INTO productos (nombre, descripcion, precio, categoria, destino, img_url) VALUES
('Carne a la Llanera (Libra)', 'Tradicional carne a la llanera servida con papa y yuca.', 58000, 'comida', 'cocina', 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop'),
('Costilla de Cerdo Ahumada', 'Costillas de cerdo ahumadas con leña de café.', 45000, 'comida', 'cocina', 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop'),
('Picada Darpapaya (Familiar)', 'Picada variada con carnes, arepa, papa y hogao.', 85000, 'comida', 'cocina', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop'),
('Chicharrón con Arepa', 'Chicharrón carnudo y crocante con arepa de la casa.', 22000, 'comida', 'cocina', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=2014&auto=format&fit=crop'),
('Cerveza Club Colombia', 'Cerveza nacional premium.', 8500.00, 'bebida', 'bar', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070&auto=format&fit=crop'),
('Jugo Natural', 'Limonada o Mandarina fresca.', 9000.00, 'bebida', 'bar', 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=2072&auto=format&fit=crop');
