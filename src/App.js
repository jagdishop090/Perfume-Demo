import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ContentProvider, useContent } from './context/ContentContext';
import AdminPanel from './components/AdminPanel';
import ProductModal from './components/ProductModal';
import './App.css';

const MainSite = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const { content, loading } = useContent();

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Combine all products for the new unified design
  const allProducts = [
    ...(content.men?.products || []).map(p => ({ ...p, category: 'men' })),
    ...(content.women?.products || []).map(p => ({ ...p, category: 'women' })),
    ...(content.unisex?.products || []).map(p => ({ ...p, category: 'unisex' }))
  ];

  const filteredProducts = activeCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <h2>Loading Essence...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">
              <h1>{content.global?.brandName || 'ESSENCE'}</h1>
            </Link>
          </div>
          
          <nav className="nav">
            <a href="#home" className="nav-link">Home</a>
            <a href="#collections" className="nav-link">Collections</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <div className="header-actions">
            <button className="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <button className="cart-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section id="home" className="hero-banner">
        <div className="hero-slide active">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-subtitle">Discover Luxury</span>
              <h1 className="hero-title">Premium Fragrances</h1>
              <p className="hero-description">
                Indulge in our exquisite collection of handcrafted perfumes, 
                where each scent tells a unique story of elegance and sophistication.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary">Shop Now</button>
                <button className="btn-secondary">Explore Collection</button>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-product">
                <div className="product-showcase">
                  <div className="product-bottle-hero"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Discover our curated collections for every personality</p>
          </div>
          
          <div className="category-grid">
            <div className="category-card men">
              <div className="category-image">
                <div className="category-overlay">
                  <h3>Men's Collection</h3>
                  <p>Bold & Sophisticated</p>
                  <button className="category-btn">Explore</button>
                </div>
              </div>
            </div>
            
            <div className="category-card women">
              <div className="category-image">
                <div className="category-overlay">
                  <h3>Women's Collection</h3>
                  <p>Elegant & Enchanting</p>
                  <button className="category-btn">Explore</button>
                </div>
              </div>
            </div>
            
            <div className="category-card unisex">
              <div className="category-image">
                <div className="category-overlay">
                  <h3>Unisex Collection</h3>
                  <p>Universal Appeal</p>
                  <button className="category-btn">Explore</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="collections" className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Handpicked fragrances from our premium collection</p>
          </div>

          <div className="product-filters">
            <button 
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Products
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'men' ? 'active' : ''}`}
              onClick={() => setActiveCategory('men')}
            >
              Men
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'women' ? 'active' : ''}`}
              onClick={() => setActiveCategory('women')}
            >
              Women
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'unisex' ? 'active' : ''}`}
              onClick={() => setActiveCategory('unisex')}
            >
              Unisex
            </button>
          </div>

          <div className="products-grid">
            {filteredProducts.slice(0, 8).map((product, index) => (
              <div key={product.id || index} className="product-card" onClick={() => openProductModal(product)}>
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className={`product-bottle ${product.category}`}></div>
                  )}
                  <div className="product-overlay">
                    <button className="quick-view-btn">Quick View</button>
                  </div>
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-notes">{product.notes}</p>
                  <div className="product-price">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <span className="section-subtitle">Our Story</span>
              <h2>Crafting Memories Through Scent</h2>
              <p>
                For over a decade, we have been dedicated to creating exceptional fragrances 
                that capture the essence of luxury and sophistication. Each perfume in our 
                collection is meticulously crafted using the finest ingredients sourced from 
                around the world.
              </p>
              <div className="about-stats">
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Unique Fragrances</span>
                </div>
                <div className="stat">
                  <span className="stat-number">15</span>
                  <span className="stat-label">Years of Excellence</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100K+</span>
                  <span className="stat-label">Happy Customers</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="about-visual">
                <div className="perfume-bottles">
                  <div className="bottle bottle-1"></div>
                  <div className="bottle bottle-2"></div>
                  <div className="bottle bottle-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h2>Stay in the Scent</h2>
              <p>Be the first to discover new fragrances and exclusive offers</p>
            </div>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button type="submit">Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>{content.global?.brandName || 'ESSENCE'}</h3>
              <p>Crafting premium fragrances for the discerning individual since 2009.</p>
              <div className="social-links">
                <button type="button" className="social-btn" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </button>
                <button type="button" className="social-btn" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </button>
                <button type="button" className="social-btn" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#collections">Collections</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Customer Care</h4>
              <ul>
                <li><button type="button" className="footer-link">Size Guide</button></li>
                <li><button type="button" className="footer-link">Returns</button></li>
                <li><button type="button" className="footer-link">FAQ</button></li>
                <li><button type="button" className="footer-link">Support</button></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact Info</h4>
              <div className="contact-info">
                <p>📧 info@essence.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 123 Fragrance Street, Perfume City</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 {content.global?.brandName || 'ESSENCE'}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        mode="unified"
      />
    </div>
  );
};

const App = () => {
  return (
    <ContentProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </ContentProvider>
  );
};

export default App;