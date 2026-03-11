const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    // Create database directory if it doesn't exist
    const dbDir = path.join(__dirname);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Connect to SQLite database
    this.db = new sqlite3.Database(path.join(dbDir, 'essence.db'), (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    this.db.exec(schema, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
      } else {
        console.log('Database tables created successfully');
      }
    });
  }

  // Global Settings
  getGlobalSettings() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM global_settings WHERE id = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  updateGlobalSettings(settings) {
    return new Promise((resolve, reject) => {
      const { brandName, newsletterTitle, newsletterSubtitle, footerDescription } = settings;
      this.db.run(
        `UPDATE global_settings SET 
         brand_name = ?, newsletter_title = ?, newsletter_subtitle = ?, 
         footer_description = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = 1`,
        [brandName, newsletterTitle, newsletterSubtitle, footerDescription],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Hero Sections
  getHeroSection(mode) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM hero_sections WHERE mode = ?', [mode], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  updateHeroSection(mode, data) {
    return new Promise((resolve, reject) => {
      const { title, subtitle, ctaText, heroImage } = data;
      this.db.run(
        `UPDATE hero_sections SET 
         title = ?, subtitle = ?, cta_text = ?, hero_image = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE mode = ?`,
        [title, subtitle, ctaText, heroImage, mode],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Features
  getFeatures(mode) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM features WHERE mode = ? ORDER BY sort_order',
        [mode],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  addFeature(mode, data) {
    return new Promise((resolve, reject) => {
      const { title, description } = data;
      this.db.run(
        'INSERT INTO features (mode, title, description, sort_order) VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM features WHERE mode = ?))',
        [mode, title, description, mode],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  updateFeature(id, data) {
    return new Promise((resolve, reject) => {
      const { title, description } = data;
      this.db.run(
        'UPDATE features SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  deleteFeature(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM features WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Products
  getProducts(mode) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM products WHERE mode = ? ORDER BY sort_order',
        [mode],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getFeaturedProducts(mode) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM products WHERE mode = ? AND is_featured = 1 ORDER BY sort_order LIMIT 6',
        [mode],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getFeaturedProductsCount(mode) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM products WHERE mode = ? AND is_featured = 1',
        [mode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }

  addProduct(mode, data) {
    return new Promise((resolve, reject) => {
      const { name, price, notes, productImage, isFeatured } = data;
      this.db.run(
        'INSERT INTO products (mode, name, price, notes, product_image, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM products WHERE mode = ?))',
        [mode, name, price, notes, productImage, isFeatured ? 1 : 0, mode],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  updateProduct(id, data) {
    return new Promise((resolve, reject) => {
      const { name, price, notes, productImage, isFeatured } = data;
      this.db.run(
        'UPDATE products SET name = ?, price = ?, notes = ?, product_image = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, price, notes, productImage, isFeatured ? 1 : 0, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  deleteProduct(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // About Sections
  getAboutSection(mode) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM about_sections WHERE mode = ?', [mode], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  updateAboutSection(mode, data) {
    return new Promise((resolve, reject) => {
      const { title, description } = data;
      this.db.run(
        'UPDATE about_sections SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE mode = ?',
        [title, description, mode],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Footer Links
  getFooterLinks() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM footer_links ORDER BY category, sort_order',
        (err, rows) => {
          if (err) reject(err);
          else {
            const grouped = rows.reduce((acc, link) => {
              if (!acc[link.category]) acc[link.category] = [];
              acc[link.category].push(link);
              return acc;
            }, {});
            resolve(grouped);
          }
        }
      );
    });
  }

  // Get all content for a specific mode
  async getAllContent() {
    try {
      const [globalSettings, menHero, womenHero, unisexHero, menFeatures, womenFeatures, unisexFeatures,
             menProducts, womenProducts, unisexProducts, menFeaturedProducts, womenFeaturedProducts, unisexFeaturedProducts,
             menAbout, womenAbout, unisexAbout, footerLinks] = await Promise.all([
        this.getGlobalSettings(),
        this.getHeroSection('men'),
        this.getHeroSection('women'),
        this.getHeroSection('unisex'),
        this.getFeatures('men'),
        this.getFeatures('women'),
        this.getFeatures('unisex'),
        this.getProducts('men'),
        this.getProducts('women'),
        this.getProducts('unisex'),
        this.getFeaturedProducts('men'),
        this.getFeaturedProducts('women'),
        this.getFeaturedProducts('unisex'),
        this.getAboutSection('men'),
        this.getAboutSection('women'),
        this.getAboutSection('unisex'),
        this.getFooterLinks()
      ]);

      return {
        global: {
          brandName: globalSettings?.brand_name || 'ESSENCE',
          newsletter: {
            title: globalSettings?.newsletter_title || 'STAY IN THE SCENT',
            subtitle: globalSettings?.newsletter_subtitle || 'Be the first to discover new fragrances and exclusive offers'
          },
          footer: {
            description: globalSettings?.footer_description || 'Crafting premium fragrances for the discerning individual since 2009.',
            quickLinks: footerLinks.quick_links?.map(link => link.link_text) || [],
            customerCare: footerLinks.customer_care?.map(link => link.link_text) || [],
            socialLinks: footerLinks.social_links?.map(link => link.link_text) || []
          }
        },
        men: {
          hero: {
            title: menHero?.title || 'SOPHISTICATED MASCULINITY',
            subtitle: menHero?.subtitle || 'Discover fragrances that define your presence',
            cta: menHero?.cta_text || 'EXPLORE MEN\'S COLLECTION'
          },
          heroImage: menHero?.hero_image || '',
          features: menFeatures.map(f => ({ title: f.title, desc: f.description, id: f.id })),
          products: menProducts.map(p => ({ 
            name: p.name, 
            price: p.price, 
            notes: p.notes, 
            image: p.product_image || '', 
            id: p.id,
            isFeatured: p.is_featured === 1
          })),
          featuredProducts: menFeaturedProducts.map(p => ({ 
            name: p.name, 
            price: p.price, 
            notes: p.notes, 
            image: p.product_image || '', 
            id: p.id,
            isFeatured: p.is_featured === 1
          })),
          about: {
            title: menAbout?.title || 'CRAFTED FOR THE MODERN GENTLEMAN',
            description: menAbout?.description || 'Our men\'s collection embodies strength, sophistication, and timeless appeal.'
          }
        },
        women: {
          hero: {
            title: womenHero?.title || 'DIVINE FEMININITY',
            subtitle: womenHero?.subtitle || 'Embrace your enchanting essence with luxurious fragrances',
            cta: womenHero?.cta_text || 'DISCOVER WOMEN\'S COLLECTION'
          },
          heroImage: womenHero?.hero_image || '',
          features: womenFeatures.map(f => ({ title: f.title, desc: f.description, id: f.id })),
          products: womenProducts.map(p => ({ 
            name: p.name, 
            price: p.price, 
            notes: p.notes, 
            image: p.product_image || '', 
            id: p.id,
            isFeatured: p.is_featured === 1
          })),
          featuredProducts: womenFeaturedProducts.map(p => ({ 
            name: p.name, 
            price: p.price, 
            notes: p.notes, 
            image: p.product_image || '', 
            id: p.id,
            isFeatured: p.is_featured === 1
          })),
          about: {
            title: womenAbout?.title || 'DESIGNED FOR THE ELEGANT WOMAN',
            description: womenAbout?.description || 'Our women\'s collection celebrates femininity, grace, and inner beauty.'
          }
        },
        unisex: {
          hero: {
            title: unisexHero?.title || 'UNIVERSAL ELEGANCE',
            subtitle: unisexHero?.subtitle || 'Timeless fragrances that transcend boundaries',
            cta: unisexHero?.cta_text || 'EXPLORE UNISEX COLLECTION'
          },
          heroImage: unisexHero?.hero_image || '',
          features: unisexFeatures.map(f => ({ title: f.title, desc: f.description, id: f.id })),
          products: unisexProducts.map(p => ({ 
            name: p.name, 
            price: p.price, 
            notes: p.notes, 
            image: p.product_image || '', 
            id: p.id,
            isFeatured: p.is_featured === 1
          })),
          featuredProducts: unisexFeaturedProducts.map(p => ({ 
            name: p.name, 
            price: p.price, 
            notes: p.notes, 
            image: p.product_image || '', 
            id: p.id,
            isFeatured: p.is_featured === 1
          })),
          about: {
            title: unisexAbout?.title || 'CREATED FOR EVERYONE',
            description: unisexAbout?.description || 'Our unisex collection breaks traditional boundaries, offering sophisticated fragrances that celebrate individuality.'
          }
        }
      };
    } catch (error) {
      console.error('Error getting all content:', error);
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;