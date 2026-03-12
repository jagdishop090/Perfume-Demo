-- Supabase Database Schema for Essence Perfume Store
-- Run this in your Supabase SQL Editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT UNIQUE NOT NULL,
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create global_settings table
CREATE TABLE IF NOT EXISTS global_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT NOT NULL DEFAULT 'ESSENCE',
    newsletter_title TEXT NOT NULL DEFAULT 'STAY IN THE SCENT',
    newsletter_subtitle TEXT NOT NULL DEFAULT 'Be the first to discover new fragrances and exclusive offers',
    footer_description TEXT NOT NULL DEFAULT 'Crafting premium fragrances for the discerning individual since 2009.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hero_sections table
CREATE TABLE IF NOT EXISTS hero_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    hero_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mode)
);

-- Create features table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    notes TEXT NOT NULL,
    product_image TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create about_sections table
CREATE TABLE IF NOT EXISTS about_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mode)
);

-- Create footer_links table
CREATE TABLE IF NOT EXISTS footer_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('quick_links', 'customer_care', 'social_links')),
    link_text TEXT NOT NULL,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for images (if not exists)
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('perfume-images', 'perfume-images', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin users can manage all data" ON admin_users FOR ALL USING (true);
CREATE POLICY "Admin sessions can be managed" ON admin_sessions FOR ALL USING (true);
CREATE POLICY "Global settings can be read by anyone" ON global_settings FOR SELECT USING (true);
CREATE POLICY "Global settings can be updated by admins" ON global_settings FOR UPDATE USING (true);
CREATE POLICY "Hero sections can be read by anyone" ON hero_sections FOR SELECT USING (true);
CREATE POLICY "Hero sections can be managed by admins" ON hero_sections FOR ALL USING (true);
CREATE POLICY "Features can be read by anyone" ON features FOR SELECT USING (true);
CREATE POLICY "Features can be managed by admins" ON features FOR ALL USING (true);
CREATE POLICY "Products can be read by anyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products can be managed by admins" ON products FOR ALL USING (true);
CREATE POLICY "About sections can be read by anyone" ON about_sections FOR SELECT USING (true);
CREATE POLICY "About sections can be managed by admins" ON about_sections FOR ALL USING (true);
CREATE POLICY "Footer links can be read by anyone" ON footer_links FOR SELECT USING (true);
CREATE POLICY "Footer links can be managed by admins" ON footer_links FOR ALL USING (true);

-- Create storage policy for images
CREATE POLICY "Images can be uploaded by anyone" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'perfume-images');
CREATE POLICY "Images can be viewed by anyone" ON storage.objects FOR SELECT USING (bucket_id = 'perfume-images');
CREATE POLICY "Images can be updated by anyone" ON storage.objects FOR UPDATE USING (bucket_id = 'perfume-images');
CREATE POLICY "Images can be deleted by anyone" ON storage.objects FOR DELETE USING (bucket_id = 'perfume-images');

-- Insert default data
INSERT INTO global_settings (brand_name, newsletter_title, newsletter_subtitle, footer_description) 
VALUES ('ESSENCE', 'STAY IN THE SCENT', 'Be the first to discover new fragrances and exclusive offers', 'Crafting premium fragrances for the discerning individual since 2009.')
ON CONFLICT DO NOTHING;

-- Insert default hero sections
INSERT INTO hero_sections (mode, title, subtitle, cta_text) VALUES
('men', 'SOPHISTICATED MASCULINITY', 'Discover fragrances that define your presence', 'EXPLORE MEN''S COLLECTION'),
('women', 'DIVINE FEMININITY', 'Embrace your enchanting essence with luxurious fragrances', 'DISCOVER WOMEN''S COLLECTION'),
('unisex', 'UNIVERSAL ELEGANCE', 'Timeless fragrances that transcend boundaries', 'EXPLORE UNISEX COLLECTION')
ON CONFLICT (mode) DO NOTHING;

-- Insert default features
INSERT INTO features (mode, title, description, sort_order) VALUES
('men', 'BOLD & CONFIDENT', 'Powerful scents for the modern man', 1),
('men', 'WOODY & SPICY', 'Rich compositions with depth', 2),
('men', 'DAY TO NIGHT', 'Versatile fragrances for every occasion', 3),
('women', 'FLORAL ROMANCE', 'Delicate petals and romantic blooms', 1),
('women', 'ELEGANT GRACE', 'Sophisticated scents for refined women', 2),
('women', 'ENCHANTING AURA', 'Captivating fragrances that inspire', 3),
('unisex', 'GENDER-FREE LUXURY', 'Sophisticated scents for everyone', 1),
('unisex', 'BALANCED HARMONY', 'Perfect blend of masculine and feminine notes', 2),
('unisex', 'TIMELESS APPEAL', 'Classic fragrances that never go out of style', 3);

-- Insert default products
INSERT INTO products (mode, name, price, notes, is_featured, sort_order) VALUES
('men', 'NOIR INTENSE', '$120', 'Bergamot, Cedar, Amber', true, 1),
('men', 'ROYAL OUD', '$180', 'Oud, Rose, Saffron', true, 2),
('men', 'MIDNIGHT', '$95', 'Lavender, Vetiver, Musk', true, 3),
('women', 'ROSE GARDEN', '$135', 'Rose Petals, Peony, White Musk', true, 1),
('women', 'CHERRY BLOSSOM', '$110', 'Sakura, Jasmine, Vanilla', true, 2),
('women', 'PINK DIAMOND', '$165', 'Pink Pepper, Magnolia, Amber', true, 3),
('unisex', 'PURE ESSENCE', '$145', 'Bergamot, White Tea, Cedar', true, 1),
('unisex', 'HARMONY', '$125', 'Citrus, Lavender, Sandalwood', true, 2),
('unisex', 'ETERNAL', '$155', 'Neroli, Jasmine, Amber', true, 3);

-- Insert default about sections
INSERT INTO about_sections (mode, title, description) VALUES
('men', 'CRAFTED FOR THE MODERN GENTLEMAN', 'Our men''s collection embodies strength, sophistication, and timeless appeal. Each fragrance is meticulously crafted to complement the confident, ambitious man who values quality and distinction.'),
('women', 'DESIGNED FOR THE ELEGANT WOMAN', 'Our women''s collection celebrates femininity, grace, and inner beauty. Each fragrance tells a story of elegance, capturing the essence of the sophisticated woman who embraces her unique charm.'),
('unisex', 'CREATED FOR EVERYONE', 'Our unisex collection breaks traditional boundaries, offering sophisticated fragrances that celebrate individuality. These timeless scents are crafted for those who appreciate quality and elegance beyond gender conventions.')
ON CONFLICT (mode) DO NOTHING;

-- Insert default footer links
INSERT INTO footer_links (category, link_text, link_url, sort_order) VALUES
('quick_links', 'Collection', '#collection', 1),
('quick_links', 'About Us', '#about', 2),
('quick_links', 'Contact', '#contact', 3),
('quick_links', 'Shipping', '#shipping', 4),
('customer_care', 'Size Guide', '#size-guide', 1),
('customer_care', 'Returns', '#returns', 2),
('customer_care', 'FAQ', '#faq', 3),
('customer_care', 'Support', '#support', 4),
('social_links', 'Instagram', 'https://instagram.com', 1),
('social_links', 'Facebook', 'https://facebook.com', 2),
('social_links', 'Twitter', 'https://twitter.com', 3);

-- Create default admin user (password: admin123)
-- You should change this password after first login
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('admin', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'admin@essence.com')
ON CONFLICT DO NOTHING;

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_settings_updated_at BEFORE UPDATE ON global_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_sections_updated_at BEFORE UPDATE ON hero_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_sections_updated_at BEFORE UPDATE ON about_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_footer_links_updated_at BEFORE UPDATE ON footer_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();