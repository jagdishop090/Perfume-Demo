import React, { useState, useCallback, useMemo, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ContentProvider, useContent } from './context/SupabaseContentContext';
import ProductModal from './components/ProductModal';
import { getBannerWithFallbacks } from './utils/bannerFallbacks';
import './App.css';

// Lazy load the admin panel for better performance
const AdminPanel = lazy(() => import('./components/ModernAdminPanel'));

const ProductsPage = () => {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showBogoBanner, setShowBogoBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { content } = useContent();

  // Scroll to top when products page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Combine all products with memoization for performance
  const allProducts = useMemo(() => [
    ...(content.men?.products || []).map(p => ({ ...p, category: 'men' })),
    ...(content.women?.products || []).map(p => ({ ...p, category: 'women' })),
    ...(content.unisex?.products || []).map(p => ({ ...p, category: 'unisex' }))
  ], [content.men?.products, content.women?.products, content.unisex?.products]);

  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === 'all' 
      ? allProducts 
      : allProducts.filter(p => p.category === activeCategory);
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [allProducts, activeCategory, searchQuery]);

  const openProductModal = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already filtered in filteredProducts
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    // Prevent body scroll when menu is open
    if (!showMobileMenu) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    // Restore body scroll when menu is closed
    document.body.classList.remove('menu-open');
  };

  // Remove loading screen - directly show content
  // if (loading) {
  //   return (
  //     <div className="loading-container">
  //       <div className="loading-spinner">
  //         <div className="spinner"></div>
  //         <h2>Loading Products...</h2>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="app">
      {/* BOGO Offer Banner */}
      {showBogoBanner && (
        <div className="bogo-banner">
          <div className="bogo-content">
            <div className="bogo-scroll-container">
              <div className="bogo-scroll-wrapper">
                <div className="bogo-scroll-text bogo-text-1">
                  🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances
                </div>
                <div className="bogo-scroll-text bogo-text-2">
                  • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances
                </div>
              </div>
            </div>
            <button 
              className="bogo-close" 
              onClick={() => setShowBogoBanner(false)}
              aria-label="Close offer banner"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`header products-header ${!showBogoBanner ? 'header-no-bogo' : ''}`}>
        <div className="header-container">
          {/* Hamburger Menu - Mobile Only */}
          <button className="hamburger-menu" onClick={toggleMobileMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="logo">
            <Link to="/">
              <h1>{content.global?.brandName || 'ESSENCE'}</h1>
            </Link>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="header-search-bar">
            <form onSubmit={handleSearchSubmit} className="search-form-desktop">
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-desktop"
              />
              <button type="submit" className="search-submit-desktop">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </form>
          </div>
          
          <nav className="nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>Products</Link>
            <a href="/#collections" className="nav-link">Collections</a>
            <a href="/#about" className="nav-link">About</a>
            <a href="/#contact" className="nav-link">Contact</a>
          </nav>

          <div className="header-actions">
            <button className="search-btn" onClick={toggleSearchBar}>
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

        {/* Mobile Search Bar */}
        {showSearchBar && (
          <div className="mobile-search-bar">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
              <button type="button" onClick={toggleSearchBar} className="search-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
            <div 
              className={`mobile-menu ${!showBogoBanner ? 'menu-no-bogo' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-header">
                <h3>Menu</h3>
                <button className="mobile-menu-close" onClick={closeMobileMenu}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <nav className="mobile-menu-nav">
                <Link to="/" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9,22 9,12 15,12 15,22"></polyline>
                  </svg>
                  Home
                </Link>
                <Link to="/products" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Products
                </Link>
                <a href="/#collections" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Collections
                </a>
                <a href="/#about" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  About
                </a>
                <a href="/#contact" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Contact
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>

      <div className="products-page">
        <section className={`products-page-section ${!showBogoBanner ? 'products-no-bogo' : ''}`}>
          <div className="container">
            <div className="section-header">
              <h2>All Products</h2>
              <p>Explore our complete collection of premium fragrances</p>
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
              {filteredProducts.map((product, index) => (
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
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        mode="unified"
      />

      {/* Mobile Footer Navigation */}
      <nav className="mobile-footer-nav">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
          </svg>
          <span>Home</span>
        </Link>
        <Link to="/products" className={`mobile-nav-item ${location.pathname === '/products' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>Products</span>
        </Link>
        <a href="/#about" className="mobile-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>About</span>
        </a>
        <a href="/#contact" className="mobile-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>Contact</span>
        </a>
      </nav>
    </div>
  );
};
const MainSite = () => {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [prevBanner, setPrevBanner] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [showBogoBanner, setShowBogoBanner] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { content } = useContent();

  // Banner images - using Supabase CDN URLs for reliable delivery
  // These URLs are served from Supabase CDN and will work on all platforms
  const supabaseBannerUrls = [
    "https://tqrztmpxiagerohadtfl.supabase.co/storage/v1/object/public/perfume-images/banners/banner-1.jpg",
    "https://tqrztmpxiagerohadtfl.supabase.co/storage/v1/object/public/perfume-images/banners/banner-2.jpg",
    "https://tqrztmpxiagerohadtfl.supabase.co/storage/v1/object/public/perfume-images/banners/banner-3.jpg"
  ];

  // Banner configuration with Supabase URLs as primary source
  const defaultBanners = [
    {
      id: 1,
      primary: supabaseBannerUrls[0], // Supabase CDN (most reliable)
      fallback: '/banner-1.jpg', // Local fallback
      fallback2: '/Banners/banner-1.jpg', // Secondary local fallback
      placeholder: getBannerWithFallbacks('/banner-1.jpg', '/Banners/banner-1.jpg', 'banner1').placeholder,
      title: 'Introducing',
      subtitle: 'SIGNATURE COLLECTION',
      description: 'Discover the art of luxury fragrance',
      alt: 'Premium Fragrance Collection'
    },
    {
      id: 2,
      primary: supabaseBannerUrls[1], // Supabase CDN (most reliable)
      fallback: '/banner-2.jpg', // Local fallback
      fallback2: '/Banners/banner-2.jpg', // Secondary local fallback
      placeholder: getBannerWithFallbacks('/banner-2.jpg', '/Banners/banner-2.jpg', 'banner2').placeholder,
      title: 'Experience',
      subtitle: 'TIMELESS ELEGANCE',
      description: 'Crafted with the finest ingredients',
      alt: 'Luxury Perfume Experience'
    },
    {
      id: 3,
      primary: supabaseBannerUrls[2], // Supabase CDN (most reliable)
      fallback: '/banner-3.jpg', // Local fallback
      fallback2: '/Banners/banner-3.jpg', // Secondary local fallback
      placeholder: getBannerWithFallbacks('/banner-3.jpg', '/Banners/banner-3.jpg', 'banner3').placeholder,
      title: 'Explore',
      subtitle: 'EXCLUSIVE SCENTS',
      description: 'Where sophistication meets passion',
      alt: 'Exclusive Scent Collection'
    }
  ];

  // Use default banners with Supabase CDN URLs
  const banners = defaultBanners;

  // Auto-rotate banners every 5 seconds (pause when dragging or mobile menu is open)
  React.useEffect(() => {
    if (isDragging || showMobileMenu) return; // Don't auto-rotate while dragging or menu is open
    
    const interval = setInterval(() => {
      setPrevBanner(currentBanner);
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentBanner, banners.length, isDragging, showMobileMenu]);

  // Cleanup body scroll on component unmount
  React.useEffect(() => {
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, []);

  const handleBannerChange = (index) => {
    // Prevent banner changes when mobile menu is open
    if (showMobileMenu) return;
    
    setPrevBanner(currentBanner);
    setCurrentBanner(index);
  };

  // Touch and drag handlers
  const handleDragStart = (e) => {
    // Prevent banner interactions when mobile menu is open
    if (showMobileMenu) return;
    
    setIsDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (e) => {
    // Prevent banner interactions when mobile menu is open
    if (!isDragging || showMobileMenu) return;
    
    e.preventDefault();
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const offset = clientX - startX;
    
    // Limit drag distance to prevent excessive movement
    const maxDrag = 100;
    const limitedOffset = Math.max(-maxDrag, Math.min(maxDrag, offset));
    setDragOffset(limitedOffset);
  };

  const handleDragEnd = () => {
    // Prevent banner interactions when mobile menu is open
    if (!isDragging || showMobileMenu) return;
    
    setIsDragging(false);
    const threshold = 30; // Reduced threshold for better responsiveness
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Dragged right - go to previous banner
        const newIndex = currentBanner === 0 ? banners.length - 1 : currentBanner - 1;
        handleBannerChange(newIndex);
      } else {
        // Dragged left - go to next banner
        const newIndex = (currentBanner + 1) % banners.length;
        handleBannerChange(newIndex);
      }
    }
    
    // Smooth return to position
    setTimeout(() => {
      setDragOffset(0);
    }, 50);
    setStartX(0);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    // Scroll to products section
    const productsSection = document.getElementById('collections');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Mobile menu handlers
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    // Prevent body scroll when menu is open
    if (!showMobileMenu) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    // Restore body scroll when menu is closed
    document.body.classList.remove('menu-open');
  };

  // Function to scroll to top of products page
  const scrollToProductsTop = () => {
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Close mobile menu if open
    if (showMobileMenu) {
      closeMobileMenu();
    }
  };

  // Search handlers
  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
      // You can add navigation to products page with search query
      // navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Combine all products for the featured section
  const allProducts = [
    ...(content.men?.products || []).map(p => ({ ...p, category: 'men' })),
    ...(content.women?.products || []).map(p => ({ ...p, category: 'women' })),
    ...(content.unisex?.products || []).map(p => ({ ...p, category: 'unisex' }))
  ];

  // Remove loading screen - directly show content
  // if (loading) {
  //   return (
  //     <div className="loading-container">
  //       <div className="loading-spinner">
  //         <div className="spinner"></div>
  //         <h2>Loading Essence...</h2>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="app">
      {/* BOGO Offer Banner */}
      {showBogoBanner && (
        <div className="bogo-banner">
          <div className="bogo-content">
            <div className="bogo-scroll-container">
              <div className="bogo-scroll-wrapper">
                <div className="bogo-scroll-text bogo-text-1">
                  🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances
                </div>
                <div className="bogo-scroll-text bogo-text-2">
                  • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances • 🎉 BOGO 1+1 Free For All Fragrances
                </div>
              </div>
            </div>
            <button 
              className="bogo-close" 
              onClick={() => setShowBogoBanner(false)}
              aria-label="Close offer banner"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`header ${!showBogoBanner ? 'header-no-bogo' : ''}`}>
        <div className="header-container">
          {/* Hamburger Menu - Mobile Only */}
          <button className="hamburger-menu" onClick={toggleMobileMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="logo">
            <Link to="/" onClick={closeMobileMenu}>
              <h1>{content.global?.brandName || 'ESSENCE'}</h1>
            </Link>
          </div>
          
          <nav className="nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>Products</Link>
            <a href="#collections" className="nav-link">Collections</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <div className="header-actions">
            <button className="search-btn" onClick={toggleSearchBar}>
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

        {/* Mobile Search Bar */}
        {showSearchBar && (
          <div className="mobile-search-bar">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
              <button type="button" onClick={toggleSearchBar} className="search-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
            <div 
              className={`mobile-menu ${!showBogoBanner ? 'menu-no-bogo' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-header">
                <h3>Menu</h3>
                <button className="mobile-menu-close" onClick={closeMobileMenu}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <nav className="mobile-menu-nav">
                <Link to="/" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9,22 9,12 15,12 15,22"></polyline>
                  </svg>
                  Home
                </Link>
                <Link to="/products" className="mobile-menu-link" onClick={scrollToProductsTop}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Products
                </Link>
                <a href="#collections" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Collections
                </a>
                <a href="#about" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  About
                </a>
                <a href="#contact" className="mobile-menu-link" onClick={closeMobileMenu}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Contact
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner Slider */}
      <section id="home" className={`hero-banner ${!showBogoBanner ? 'hero-no-bogo' : ''}`}>
        <div 
          className="banner-slider"
          style={{
            transform: isDragging ? `translateX(${dragOffset}px)` : 'none',
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`banner-slide ${
                index === currentBanner ? 'active' : 
                index === prevBanner ? 'prev' : ''
              }`}
            >
              <div className="banner-content-wrapper">
                <div 
                  className="banner-image-section"
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                  style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none'
                  }}
                >
                  <img 
                    src={banner.primary} 
                    alt={banner.alt}
                    className="banner-image"
                    draggable={false}
                    onError={(e) => {
                      console.log('Banner image failed to load:', e.target.src);
                      
                      // Try fallback sequence: Supabase → Local root → Local Banners → SVG placeholder
                      if (banner.fallback && e.target.src !== banner.fallback) {
                        console.log('Trying local fallback:', banner.fallback);
                        e.target.src = banner.fallback;
                      } else if (banner.fallback2 && e.target.src !== banner.fallback2) {
                        console.log('Trying secondary fallback:', banner.fallback2);
                        e.target.src = banner.fallback2;
                      } else if (banner.placeholder && e.target.src !== banner.placeholder) {
                        console.log('Using SVG placeholder');
                        e.target.src = banner.placeholder;
                      } else {
                        // Hide the image if all fallbacks fail - CSS gradient will show
                        e.target.style.display = 'none';
                        console.log('All banner image fallbacks failed, showing CSS gradient');
                      }
                    }}
                  />
                </div>
                <div className="banner-text-section">
                  <div className="banner-text-content">
                    <span className="banner-intro">{banner.title}</span>
                    <h1 className="banner-title">{banner.subtitle}</h1>
                    <p className="banner-description">{banner.description}</p>
                    <button className="banner-cta">Shop Now</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Banner Navigation Dots */}
          <div className="banner-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`banner-dot ${index === currentBanner ? 'active' : ''}`}
                onClick={() => handleBannerChange(index)}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="collections" className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured</h2>
            <p>Products</p>
          </div>

          <div className="products-scroll-container">
            <div className="products-scroll-wrapper">
              {allProducts.slice(0, 6).map((product, index) => (
                <div key={product.id || index} className="product-card-scroll" onClick={() => openProductModal(product)}>
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

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>
          
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Email Us</h3>
                  <p>info@essence.com</p>
                  <p>support@essence.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Call Us</h3>
                  <p>+1 (555) 123-4567</p>
                  <p>Mon - Fri: 9AM - 6PM</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Visit Us</h3>
                  <p>123 Fragrance Street</p>
                  <p>Perfume City, PC 12345</p>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <form>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" name="subject" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                
                <button type="submit" className="contact-submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
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

      {/* Mobile Footer Navigation */}
      <nav className="mobile-footer-nav">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
          </svg>
          <span>Home</span>
        </Link>
        <Link to="/products" className={`mobile-nav-item ${location.pathname === '/products' ? 'active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>Products</span>
        </Link>
        <a href="#about" className="mobile-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>About</span>
        </a>
        <a href="#contact" className="mobile-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>Contact</span>
        </a>
      </nav>
    </div>
  );
};

const App = () => {
  return (
    <ContentProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/admin" element={
            <Suspense fallback={
              <div className="loading-container">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <h2>Loading Admin Panel...</h2>
                </div>
              </div>
            }>
              <AdminPanel />
            </Suspense>
          } />
        </Routes>
      </Router>
    </ContentProvider>
  );
};

export default App;