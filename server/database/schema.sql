-- Create database schema for Essence Perfume Store

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    admin_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users (id) ON DELETE CASCADE
);

-- Global settings table
CREATE TABLE IF NOT EXISTS global_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_name TEXT NOT NULL DEFAULT 'ESSENCE',
    newsletter_title TEXT NOT NULL DEFAULT 'STAY IN THE SCENT',
    newsletter_subtitle TEXT NOT NULL DEFAULT 'Be the first to discover new fragrances and exclusive offers',
    footer_description TEXT NOT NULL DEFAULT 'Crafting premium fragrances for the discerning individual since 2009.',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hero sections table
CREATE TABLE IF NOT EXISTS hero_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    hero_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Features table
CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    notes TEXT NOT NULL,
    product_image TEXT,
    is_featured INTEGER DEFAULT 0 CHECK (is_featured IN (0, 1)),
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- About sections table
CREATE TABLE IF NOT EXISTS about_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK (mode IN ('men', 'women', 'unisex')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Footer links table
CREATE TABLE IF NOT EXISTS footer_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK (category IN ('quick_links', 'customer_care', 'social_links')),
    link_text TEXT NOT NULL,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, link_text, sort_order)
);

-- Insert default data
INSERT OR IGNORE INTO global_settings (id, brand_name, newsletter_title, newsletter_subtitle, footer_description) 
VALUES (1, 'ESSENCE', 'STAY IN THE SCENT', 'Be the first to discover new fragrances and exclusive offers', 'Crafting premium fragrances for the discerning individual since 2009.');

-- Insert default hero sections
INSERT OR IGNORE INTO hero_sections (mode, title, subtitle, cta_text) VALUES
('men', 'SOPHISTICATED MASCULINITY', 'Discover fragrances that define your presence', 'EXPLORE MEN''S COLLECTION'),
('women', 'DIVINE FEMININITY', 'Embrace your enchanting essence with luxurious fragrances', 'DISCOVER WOMEN''S COLLECTION'),
('unisex', 'UNIVERSAL ELEGANCE', 'Timeless fragrances that transcend boundaries', 'EXPLORE UNISEX COLLECTION');

-- Insert default features
INSERT OR IGNORE INTO features (mode, title, description, sort_order) VALUES
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
INSERT OR IGNORE INTO products (mode, name, price, notes, is_featured, sort_order) VALUES
('men', 'NOIR INTENSE', '$120', 'Bergamot, Cedar, Amber', 1, 1),
('men', 'ROYAL OUD', '$180', 'Oud, Rose, Saffron', 1, 2),
('men', 'MIDNIGHT', '$95', 'Lavender, Vetiver, Musk', 1, 3),
('women', 'ROSE GARDEN', '$135', 'Rose Petals, Peony, White Musk', 1, 1),
('women', 'CHERRY BLOSSOM', '$110', 'Sakura, Jasmine, Vanilla', 1, 2),
('women', 'PINK DIAMOND', '$165', 'Pink Pepper, Magnolia, Amber', 1, 3),
('unisex', 'PURE ESSENCE', '$145', 'Bergamot, White Tea, Cedar', 1, 1),
('unisex', 'HARMONY', '$125', 'Citrus, Lavender, Sandalwood', 1, 2),
('unisex', 'ETERNAL', '$155', 'Neroli, Jasmine, Amber', 1, 3);

-- Insert default about sections
INSERT OR IGNORE INTO about_sections (mode, title, description) VALUES
('men', 'CRAFTED FOR THE MODERN GENTLEMAN', 'Our men''s collection embodies strength, sophistication, and timeless appeal. Each fragrance is meticulously crafted to complement the confident, ambitious man who values quality and distinction.'),
('women', 'DESIGNED FOR THE ELEGANT WOMAN', 'Our women''s collection celebrates femininity, grace, and inner beauty. Each fragrance tells a story of elegance, capturing the essence of the sophisticated woman who embraces her unique charm.'),
('unisex', 'CREATED FOR EVERYONE', 'Our unisex collection breaks traditional boundaries, offering sophisticated fragrances that celebrate individuality. These timeless scents are crafted for those who appreciate quality and elegance beyond gender conventions.');

-- Insert default footer links
INSERT OR IGNORE INTO footer_links (category, link_text, link_url, sort_order) VALUES
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