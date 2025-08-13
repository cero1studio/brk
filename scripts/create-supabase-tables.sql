-- Create products table with all the specific fields
CREATE TABLE IF NOT EXISTS products (
    -- Primary key (UUID - único e irrepetible)
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic product info
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT NOT NULL, -- This is codigo_brk, can be duplicated
    category TEXT NOT NULL,
    vendor TEXT NOT NULL DEFAULT 'BRK',
    price DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ALL the specific Excel fields mapped exactly
    subgrupo TEXT NOT NULL,
    codigo_brk TEXT NOT NULL, -- Can be duplicated
    ref_brk TEXT,
    posicion TEXT,
    ref_fmsi_oem TEXT,
    marca TEXT,
    linea TEXT, -- Differentiator
    modelo TEXT, -- Differentiator  
    version TEXT, -- Differentiator
    largo_mm DECIMAL(10,2),
    ancho_mm DECIMAL(10,2),
    espesor_mm DECIMAL(10,2),
    diametro_a_mm DECIMAL(10,2),
    alto_b_mm DECIMAL(10,2),
    espesor_c_mm DECIMAL(10,2),
    espesor_min_mm DECIMAL(10,2),
    agujeros TEXT,
    diametro_interno_a_mm DECIMAL(10,2),
    diametro_orificio_central_c_mm DECIMAL(10,2),
    altura_total_d_mm DECIMAL(10,2),
    agujeros4 TEXT,
    diametro_interno_maximo DECIMAL(10,2),
    diametro DECIMAL(10,2),
    largo DECIMAL(10,2),
    x_juego_pastilla TEXT,
    largo_mm10 DECIMAL(10,2),
    
    -- Additional specifications as JSONB
    specifications JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_codigo_brk ON products(codigo_brk);
CREATE INDEX IF NOT EXISTS idx_products_subgrupo ON products(subgrupo);
CREATE INDEX IF NOT EXISTS idx_products_marca ON products(marca);
CREATE INDEX IF NOT EXISTS idx_products_modelo ON products(modelo);
CREATE INDEX IF NOT EXISTS idx_products_linea ON products(linea);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Composite index for finding unique combinations
CREATE INDEX IF NOT EXISTS idx_products_unique_combo ON products(codigo_brk, modelo, linea, version);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('spanish', name || ' ' || description || ' ' || COALESCE(marca, '') || ' ' || COALESCE(modelo, '')));

-- Create upload_history table
CREATE TABLE IF NOT EXISTS upload_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    upload_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed', 'partial', 'rolled_back')),
    total_products INTEGER NOT NULL DEFAULT 0,
    successful_products INTEGER NOT NULL DEFAULT 0,
    failed_products INTEGER NOT NULL DEFAULT 0,
    has_images BOOLEAN DEFAULT FALSE,
    errors TEXT[] DEFAULT '{}',
    uploaded_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for upload_history
CREATE INDEX IF NOT EXISTS idx_upload_history_upload_id ON upload_history(upload_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_status ON upload_history(status);
CREATE INDEX IF NOT EXISTS idx_upload_history_created_at ON upload_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
CREATE POLICY "Allow all operations for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for anonymous users" ON products
    FOR SELECT USING (true);

-- Create policies for upload_history table  
CREATE POLICY "Allow all operations for authenticated users" ON upload_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_history_updated_at BEFORE UPDATE ON upload_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Insert sample data showing how same codigo_brk can have different models/lines
INSERT INTO products (
    name, description, sku, category, vendor, 
    subgrupo, codigo_brk, ref_brk, posicion, ref_fmsi_oem, 
    marca, linea, modelo, version,
    largo_mm, ancho_mm, espesor_mm
) VALUES 
(
    'BRK CIVIC PREMIUM 2020 REF001', 
    'PASTILLAS - DELANTERO - FMSI001 - CIVIC - 2020', 
    'BRK001', 'PASTILLAS', 'BRK',
    'PASTILLAS', 'BRK001', 'REF001', 'DELANTERO', 'FMSI001',
    'BRK', 'PREMIUM', 'CIVIC', '2020',
    120.0, 80.0, 15.0
),
(
    'BRK ACCORD STANDARD 2019 REF002', 
    'PASTILLAS - DELANTERO - FMSI001 - ACCORD - 2019', 
    'BRK001', 'PASTILLAS', 'BRK',
    'PASTILLAS', 'BRK001', 'REF002', 'DELANTERO', 'FMSI001',
    'BRK', 'STANDARD', 'ACCORD', '2019',
    125.0, 85.0, 16.0
),
(
    'BRK CIVIC STANDARD 2021 REF003', 
    'DISCOS - TRASERO - FMSI002 - CIVIC - 2021', 
    'BRK002', 'DISCOS', 'BRK',
    'DISCOS', 'BRK002', 'REF003', 'TRASERO', 'FMSI002',
    'BRK', 'STANDARD', 'CIVIC', '2021',
    NULL, NULL, NULL
)
ON CONFLICT (id) DO NOTHING;

-- Show summary
SELECT 
    'Database setup completed successfully!' as message,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(DISTINCT codigo_brk) FROM products) as unique_codigo_brk,
    (SELECT COUNT(*) FROM upload_history) as upload_records;
