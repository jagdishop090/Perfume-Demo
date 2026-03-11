import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ContentProvider, useContent } from './context/ContentContext';
import AdminPanel from './components/AdminPanel';
import ProductModal from './components/ProductModal';
import './App.css';
import mensPerfume from './assets/images/mens-perfume.png';
import womensPerfume from './assets/images/womens-perfume.png';
import unisexHeroBanner from './assets/images/unisex-hero-banner..png';

// Transition wrapper component
const TransitionWrapper = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      // Start transition
      setTimeout(() => {
        setDisplayLocation(location);
        
        // End transition after content changes
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
    }
  }, [location, displayLocation]);

  return (
    <div className={isTransitioning ? 'page-transitioning' : ''}>
      {React.cloneElement(children, { 
        location: displayLocation, 
        isTransitioning 
      })}
    </div>
  );
};

const MainSite = ({ isTransitioning: pageTransitioning }) => {
  const [isMenMode, setIsMenMode] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content, loading } = useContent();

  const toggleMode = () => {
    setIsTransitioning(true);

    // Start transition
    setTimeout(() => {
      setIsMenMode(!isMenMode);
      setShowAllProducts(false); // Reset to featured when switching modes

      // End transition after content changes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const currentContent = isMenMode ? content.men : content.women;
  const productsToShow = showAllProducts ? currentContent.products : currentContent.featuredProducts;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <h2>Loading Essence...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isMenMode ? 'men-mode' : 'women-mode'} ${isTransitioning || pageTransitioning ? 'transitioning' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>{content.global.brandName}</h1>
          </Link>
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <span className={`mode-label ${isMenMode ? 'active' : ''}`}>MEN</span>
          <div className="toggle-switch" onClick={toggleMode}>
            <div className={`toggle-slider ${!isMenMode ? 'women' : ''}`}></div>
          </div>
          <span className={`mode-label ${!isMenMode ? 'active' : ''}`}>WOMEN</span>
        </div>

        <nav className="nav">
          <a href="#collection" className="nav-link">COLLECTION</a>
          <Link to="/unisex" className="nav-link">UNISEX</Link>
          <a href="#about" className="nav-link">ABOUT</a>
          <a href="#contact" className="nav-link">CONTACT</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h2 className="hero-title">{currentContent.hero.title}</h2>
            <p className="hero-subtitle">{currentContent.hero.subtitle}</p>
            <button className="cta-button">{currentContent.hero.cta}</button>
          </div>

          <div className="hero-image">
            <img
              src={currentContent.heroImage || (isMenMode ? mensPerfume : womensPerfume)}
              alt={isMenMode ? "Men's Perfume" : "Women's Perfume"}
              className="perfume-image"
            />
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="features">
        {currentContent.features.map((feature, index) => (
          <div key={index} className="feature-item">
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section id="collection" className="products">
        <div className="section-header">
          <div className="section-title-container">
            <h2>{showAllProducts ? 'ALL PRODUCTS' : 'FEATURED COLLECTION'}</h2>
            <p>{showAllProducts ? 'Discover our complete fragrance collection' : 'Discover our most coveted fragrances'}</p>
          </div>
          <button
            className="view-all-btn"
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? 'View Featured' : 'View All Products'}
          </button>
        </div>
        <div className="products-grid">
          {productsToShow?.map((product, index) => (
            <div key={product.id || index} className="product-card" onClick={() => openProductModal(product)}>
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-img" />
                ) : (
                  <div className="product-bottle"></div>
                )}
                {product.isFeatured && !showAllProducts && (
                  <div className="featured-badge">Featured</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-notes">{product.notes}</p>
                <div className="product-price">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="about-content">
          <div className="about-text">
            <h2>{currentContent.about.title}</h2>
            <p>{currentContent.about.description}</p>
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
            <div className="about-visual"></div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h2>{content.global.newsletter.title}</h2>
          <p>{content.global.newsletter.subtitle}</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button type="submit">SUBSCRIBE</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{content.global.brandName}</h3>
            <p>{content.global.footer.description}</p>
          </div>
          <div className="footer-section">
            <h4>QUICK LINKS</h4>
            <ul>
              {content.global.footer.quickLinks.map((link, index) => (
                <li key={index}><a href={`#${link.toLowerCase().replace(' ', '')}`}>{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>CUSTOMER CARE</h4>
            <ul>
              {content.global.footer.customerCare.map((link, index) => (
                <li key={index}><button type="button" className="footer-link">{link}</button></li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>CONNECT</h4>
            <div className="social-links">
              {content.global.footer.socialLinks.map((social, index) => (
                <button key={index} type="button" className="footer-link">{social}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 {content.global.brandName}. All rights reserved.</p>
        </div>
      </footer>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        mode={isMenMode ? 'men' : 'women'}
      />
    </div>
  );
};

const UnisexPage = ({ isTransitioning: pageTransitioning }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content, loading } = useContent();

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <h2>Loading Essence...</h2>
        </div>
      </div>
    );
  }

  // Handle case where unisex content is not yet available
  const unisexContent = content.unisex || {
    hero: {
      title: 'UNIVERSAL ELEGANCE',
      subtitle: 'Timeless fragrances that transcend boundaries',
      cta: 'EXPLORE UNISEX COLLECTION'
    },
    heroImage: '',
    features: [],
    products: [],
    featuredProducts: [],
    about: {
      title: 'CREATED FOR EVERYONE',
      description: 'Our unisex collection breaks traditional boundaries, offering sophisticated fragrances that celebrate individuality.'
    }
  };

  const productsToShow = showAllProducts ? unisexContent.products : unisexContent.featuredProducts;

  return (
    <div className={`app unisex-mode ${pageTransitioning ? 'transitioning' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>{content.global.brandName}</h1>
          </Link>
        </div>
        
        <nav className="nav">
          <Link to="/" className="nav-link">HOME</Link>
          <a href="#collection" className="nav-link">COLLECTION</a>
          <a href="#about" className="nav-link">ABOUT</a>
          <a href="#contact" className="nav-link">CONTACT</a>
        </nav>
      </header>

      {/* Hero Banner Section */}
      <main className="hero hero-banner">
        <div className="hero-banner-image">
          <img src={unisexHeroBanner} alt="Unisex Collection Banner" />
        </div>
      </main>

      {/* Features */}
      <section className="features">
        {unisexContent.features.map((feature, index) => (
          <div key={index} className="feature-item">
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section id="collection" className="products">
        <div className="section-header">
          <div className="section-title-container">
            <h2>{showAllProducts ? 'ALL PRODUCTS' : 'FEATURED COLLECTION'}</h2>
            <p>{showAllProducts ? 'Discover our complete unisex fragrance collection' : 'Discover our most coveted unisex fragrances'}</p>
          </div>
          <button 
            className="view-all-btn"
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? 'View Featured' : 'View All Products'}
          </button>
        </div>
        <div className="products-grid">
          {productsToShow?.map((product, index) => (
            <div key={product.id || index} className="product-card" onClick={() => openProductModal(product)}>
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-img" />
                ) : (
                  <div className="product-bottle"></div>
                )}
                {product.isFeatured && !showAllProducts && (
                  <div className="featured-badge">Featured</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-notes">{product.notes}</p>
                <div className="product-price">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="about-content">
          <div className="about-text">
            <h2>{unisexContent.about.title}</h2>
            <p>{unisexContent.about.description}</p>
            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">25+</span>
                <span className="stat-label">Unisex Fragrances</span>
              </div>
              <div className="stat">
                <span className="stat-number">15</span>
                <span className="stat-label">Years of Excellence</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
          <div className="about-image">
            <div className="about-visual"></div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h2>{content.global.newsletter.title}</h2>
          <p>{content.global.newsletter.subtitle}</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button type="submit">SUBSCRIBE</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{content.global.brandName}</h3>
            <p>{content.global.footer.description}</p>
          </div>
          <div className="footer-section">
            <h4>QUICK LINKS</h4>
            <ul>
              {content.global.footer.quickLinks.map((link, index) => (
                <li key={index}><a href={`#${link.toLowerCase().replace(' ', '')}`}>{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>CUSTOMER CARE</h4>
            <ul>
              {content.global.footer.customerCare.map((link, index) => (
                <li key={index}><button type="button" className="footer-link">{link}</button></li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>CONNECT</h4>
            <div className="social-links">
              {content.global.footer.socialLinks.map((social, index) => (
                <button key={index} type="button" className="footer-link">{social}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 {content.global.brandName}. All rights reserved.</p>
        </div>
      </footer>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        mode="unisex"
      />
    </div>
  );
};

const App = () => {
  return (
    <ContentProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <TransitionWrapper>
          <Routes>
            <Route path="/" element={<MainSite />} />
            <Route path="/unisex" element={<UnisexPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </TransitionWrapper>
      </Router>
    </ContentProvider>
  );
};

export default App;