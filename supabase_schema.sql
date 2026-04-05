-- ************************************************************
-- GUÍA DE ACTUALIZACIÓN DARPAPAYA MADRID (ARGANZUELA)
-- ************************************************************
-- 1. Ve a tu panel de Supabase -> SQL Editor.
-- 2. Crea un "New Query".
-- 3. Pega TODO el contenido de debajo y presiona "RUN".
-- 4. Esto limpiará los pedidos viejos de Armenia y pondrá la carta de Madrid.
-- ************************************************************

-- LIMPIEZA DE TABLAS (RESET TOTAL PARA MADRID)
DELETE FROM pedido_items;
DELETE FROM pedidos;
DELETE FROM productos;
DELETE FROM meseros;

-- Asegurar que los IDs sean UUIDs y que los totales acepten decimales (Euros)
-- El esquema ya está preparado, pero aquí reafirmamos la estructura:

-- Productos
-- CREATE TABLE IF NOT EXISTS productos ( ... );

-- Insertar los productos reales de Madrid (Arganzuela) - Precios en EUROS
INSERT INTO productos (nombre, descripcion, precio, categoria, destino, img_url) VALUES
-- ENTRANTES
('Empanadas de Carne', 'Masa de maíz rellena de carne, patata y salsa de la casa.', 2.50, 'entrantes', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqCxdpfblN0T2GWCfMU5NLiVrg7uj7E9y-RlsAH39fBmcprDzgdcKhdsf5yvvB5uV3RmbTxyo8htRUsFJJA9gMcBfr0D4UEd4OgRGuzof4U_i1oz6FY6WW8ltrxJCueO0ooTtg=w640-h640-n-k-no'),
('Patacón con Todo', 'Pollo, carne mechada, queso, chorizo y chicharrón sobre patacón crujiente.', 11.00, 'entrantes', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoguPqWPO-EP3LhKQRzHTH8vp6o-UHvl6xJrsVvJyVeZdmZPoqrAGr-tch9S9wlo0Ec_c_JUzeZtl-ZGbZuKAEqtX73bIAuAVHjE20U7rOKzww5cXJydM2d1omb0INGn5T4A0fh=w640-h640-n-k-no'),
('Ensalada Tropical', 'Lechuga, tomate, cebolla, atún, remolacha, aguacate, maicitos y frutas.', 7.00, 'entrantes', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqGp2AwzvkWVU8SQkNKUUG6nMnozYSg05BbAUHUqesNStQLP5cab959YXFLpVWsbH1SZsGlR-jnOyBIRamsOEqimbcvKg6a5FxfTkTfUpOtqAgdd-Qsx-SrZmkc6tJO9HQMiXvY=w640-h640-n-k-no'),

-- SOPAS
('Sancocho de Costilla', 'Delicioso caldo de costilla con acompañamientos tradicionales.', 16.00, 'sopas', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqmlZkuQNjYVCi8hu8YVJQftvD5AAyscelWrnnN6A9G0YgWfRdMsMd81s0Y6P-8o84dhNRDjXU2dhGamB_fH3diA8AjkTmlsbn5enfHw5IgCdd2BP5sdyjab1I4cKjH1_IJzUdz=w243-h406-n-k-no-nu'),
('Sancocho de Pescado', 'Fresco sancocho de pescado con el sabor del mar.', 16.00, 'sopas', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweptFeNMgaq66uLOCUJElXz0WkpMmtM2MGFBS3fvyCzAD8-nJlFgCFE9skJRw56XHI6eXBLW2CQZwhFyMsBiSB4erNarKXz3xbywLub7UvkI1ssbsZoglMLLI_jY9HzLdgLQC3qo=w640-h640-n-k-no'),
('Ajiaco Santafereño', 'Sopa a base de pollo y patatas con mazorca, arroz y aguacate.', 16.00, 'sopas', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepA6dwRTslDdZMUM0ERy-IbtatAY3PoWkN2gxpwxOKQTrq3rdsZvc4CcoVnGUhbtoXOR5l2j495Nl1OEhkXchgPjQC_mN_dr5UvudItFL0IhCXj63tjwcNXVMSaEhGm2_iYiCDU=w640-h640-n-k-no'),

-- TÍPICOS
('Bandeja Paisa', 'Frijoles, arroz, chorizo, chicharrón, carne molida, huevo frito y aguacate.', 17.50, 'tipicos', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepryuupML3e57Y_AtKAkBPubymLDLRXYHmr_CXw23w_ujLf_59XzEVALIVEFoKfzRCVfF4wbU4NYFEzJcv6fAtlV6DyK6f2tBUMRlS-7DY7D3yN8HvskyfPBAUTU700OUhO00-C=w640-h640-n-k-no'),
('Tamal Valluno', 'Masa de maíz rellena de carne de cerdo, pollo, zanahoria y patatas.', 14.50, 'tipicos', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqrz6XTkGoktKtlwgRH38GX0WvUxK0dyOdkRt8nnoedfDhJfELNPIJx8hGMyuaHE1onHMPOfkGf1N8p0sw2QR_arBBsjD7ZJsS5TmGkqDqBXNtlmSvBO_0DIaRjW916_xB6BWXV=w243-h203-n-k-no-nu'),
('Chuleta Valluna', 'Cerdo apanado acompañado de arroz, ensalada y patatas fritas.', 17.00, 'tipicos', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweol0HhpKxdX1sPvfAj35G1M9ZAdM5fe1n3925PEO3tlCSNcCnxB390W7--K6AC6PLWaY-XUXlLIyWLSjeU5QF__m0El6zDk0_5d3MMO3iZM1gTDGhi1KmLe_A4OluluBcPLC4_R=w243-h406-n-k-no-nu'),
('Hamburguesa DarPapaya', 'Ternera, bacon, jamón, queso, cebolla caramelizada y piña.', 10.50, 'tipicos', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqPeun_GjGJlCvmM7HVeDtP5GilJ_B4tMcZ8EOv8WQlxpLtoMOLUGwuRn74CWdNzKgzS2UQR6HKmoiQxDrz2CP6ZQGoqkePCc7tOMXbWfhNYSeszk2r_byrAJiGGiMR4J8u9FE_h6uOG-o=w243-h174-n-k-no-nu'),

-- PARRILLA
('Churrasco a la Parrilla', 'Corte de carne tierno con guarnición.', 16.50, 'parrilla', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepEZYza82mHOn9r0bn5QR3dCy7raA_-7AD9dmIFEwbW9xbBl7wBXdn-AJRoY8bJQWv4KFOKOZW7M0zkzkP_0V9fqANb6Z_TOmY7BNd-zLOQUGNALsRmFG2-p7NwZkCQDss-L5c=w640-h640-n-k-no'),

-- POSTRES
('Mazamorra con Panela', 'Maíz y leche con panela y dulce de guayaba.', 4.50, 'postres', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoNN3tkAN8FGLxVkNCipy_7MujBoyAte86nn25b6ohxfU_ZH3BxHppRCq8qWxTl1SRFZDCFGrj-23d58KAENReO8Igqb2AVTy298XBSL3_fj7xkwM9zQcbWcZ0Z_5KWh9KI4S-isw=s1360-w1360-h1020-rw'),
('Obleas con Todo', 'Mermelada, leche condensada, dulce de leche y queso rayado.', 5.00, 'postres', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqO6uIr15cgLjesfhPYfWYNtAXe5ieZb12xQmW90r_UsddJy_9rb2qfNl6Ou5b7kE9eOsmEEYUXnFApUSO8BIGZFO_ZJErXGDr9tLJlJbHo3GiTAxkeK6O8e1W-74_tWGTktbUVYA=w243-h304-n-k-no-nu'),
('Tarta Tres Leches', 'Postre cremoso bañado en tres leches.', 5.00, 'postres', 'cocina', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwerwCW8Jjc1bVephb-H1GL67M9VU6iOY9h_DD_o25-CQx9-VEhznnVaLn3L0yAba_dR9gv_Qs-Up2-UoH4Da6MWwqwi2pLY2YjtPSbmsTGzpF_-BtONu_FbdlOp5fj-_e5VY0UBQ=w640-h640-n-k-no'),

-- BEBIDAS
('Cerveza Colombiana', 'Club Colombia o Águila bien fría.', 4.50, 'bebidas', 'bar', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweo8y9JP8mJPYDTjhhQ9vIUVN40kOZ0SZ3jvuaMcTXRe6JmVFm1Eyr-IlfZpBDi6_bBGN5qfc5Ehfb3clC1pOyc-UeOv48U1_CSDF5h-4jIK10qmNDuQC7VpSo_K1EEAd-YUbzJWfdY28dnl=s1360-w1360-h1020-rw'),
('Salpicón de Frutas', 'Coctel de frutas tropicales picadas en zumo.', 4.50, 'bebidas', 'bar', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwerPSGgm-e8COSNnUoNVK0N7uV4VZSNEoS1x851ee8iIp5dVhq0eDdu7EKzFgPYRK-zVjdxSTQc9AeTgj4dtoI1fgxcxk-TiHVQEGnww3BfaIARbX1h2bEkeXUCcGbpPWppVaOy2=w640-h640-n-k-no'),
('Chupitos Especiales', 'Variedad de chupitos colombianos y clásicos.', 3.00, 'bebidas', 'bar', 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepBu0uE6ugtP4nalrHRciI5W5K6ZmUJneP5sT_4Tj-geiY2ead1DDA7uAsehwWDW_XY2MaMOHlmv6ophrctUvV-aiprN9o4WTsWXp2NvMYmHPva4PbTowCG5QVMXXEu6S-xoA7XUg=w640-h640-n-k-no');

-- PRO: SISTEMA DE MESEROS Y SEGUIMIENTO
CREATE TABLE IF NOT EXISTS meseros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  pin TEXT DEFAULT '0000',
  activo BOOLEAN DEFAULT true,
  creado_at TIMESTAMPTZ DEFAULT now()
);

-- Vincular pedidos a meseros
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mesero_nombre TEXT DEFAULT 'General';

-- Insertar mesero inicial para pruebas
INSERT INTO meseros (nombre, pin) VALUES ('Admin', '2026') ON CONFLICT DO NOTHING;
