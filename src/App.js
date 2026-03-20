import React, { useState, useCallback, useMemo, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ContentProvider, useContent } from './context/SupabaseContentContext';
import ProductModal from './components/ProductModal';
import { getBannerWithFallbacks } from './utils/bannerFallbacks';
import './App.css';

// Lazy load the admin panel for better performance
const AdminPanel = lazy(() => import('./components/ModernAdminPanel'));

const ProductsPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [showBogoBanner, setShowBogoBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showSearchBar, setShowSearchBar] = useState(!!searchParams.get('search'));
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
                autoFocus={!!searchParams.get('search') || searchParams.get('search') === ''}
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
            <div className="nav-dropdown">
              <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
                Products
                <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </Link>
              <div className="nav-dropdown-menu">
                <a href="/products?category=men" className="nav-dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="14" r="5"/><line x1="14.5" y1="9.5" x2="20" y2="4"/><polyline points="16 4 20 4 20 8"/></svg>
                  Men
                </a>
                <a href="/products?category=women" className="nav-dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="9" r="5"/><line x1="12" y1="14" x2="12" y2="20"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                  Women
                </a>
                <a href="/products?category=unisex" className="nav-dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="4.5"/><line x1="14.5" y1="7.5" x2="19" y2="3"/><polyline points="16 3 19 3 19 6"/><line x1="11" y1="15.5" x2="11" y2="21"/><line x1="8.5" y1="19" x2="13.5" y2="19"/></svg>
                  Unisex
                </a>
              </div>
            </div>
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
            </div>

            <div className="product-filters">
              <span
                className={`filter-text ${activeCategory === 'men' ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === 'men' ? 'all' : 'men')}
              >Men</span>
              <span
                className={`filter-text ${activeCategory === 'women' ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === 'women' ? 'all' : 'women')}
              >Women</span>
              <span
                className={`filter-text ${activeCategory === 'unisex' ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === 'unisex' ? 'all' : 'unisex')}
              >Unisex</span>
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
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [prevBanner, setPrevBanner] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [showBogoBanner, setShowBogoBanner] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { content } = useContent();

  // Banner images - using Supabase CDN URLs for reliable delivery
  // These URLs are served from Supabase CDN and will work on all platforms
  const cacheBust = `?t=${Math.floor(Date.now() / 300000)}`; // busts every 5 minutes
  const supabaseBannerUrls = [
    `https://tqrztmpxiagerohadtfl.supabase.co/storage/v1/object/public/perfume-images/banners/banner-1.jpg${cacheBust}`,
    `https://tqrztmpxiagerohadtfl.supabase.co/storage/v1/object/public/perfume-images/banners/banner-2.jpg${cacheBust}`,
    `https://tqrztmpxiagerohadtfl.supabase.co/storage/v1/object/public/perfume-images/banners/banner-3.jpg${cacheBust}`
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

  // Search handlers - clicking search icon navigates to products with search open
  const toggleSearchBar = () => {
    navigate('/products?search=');
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
            <div className="nav-dropdown">
              <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
                Products
                <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </Link>
              <div className="nav-dropdown-menu">
                <a href="/products?category=men" className="nav-dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="14" r="5"/><line x1="14.5" y1="9.5" x2="20" y2="4"/><polyline points="16 4 20 4 20 8"/></svg>
                  Men
                </a>
                <a href="/products?category=women" className="nav-dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="9" r="5"/><line x1="12" y1="14" x2="12" y2="20"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                  Women
                </a>
                <a href="/products?category=unisex" className="nav-dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="4.5"/><line x1="14.5" y1="7.5" x2="19" y2="3"/><polyline points="16 3 19 3 19 6"/><line x1="11" y1="15.5" x2="11" y2="21"/><line x1="8.5" y1="19" x2="13.5" y2="19"/></svg>
                  Unisex
                </a>
              </div>
            </div>
            <a href="#collections" className="nav-link">Collections</a>
            <a href="/#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <div className="header-actions">
            <button className="search-btn" onClick={toggleSearchBar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>

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
                <a href="/#about" className="mobile-menu-link" onClick={closeMobileMenu}>
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
                      
                      // Try fallback sequence: Supabase â†’ Local root â†’ Local Banners â†’ SVG placeholder
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

          <div className="products-scroll-outer">
            <button
              className="scroll-arrow scroll-arrow-left"
              onClick={() => {
                const el = document.getElementById('featured-scroll');
                if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
              }}
              aria-label="Scroll left"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <div className="products-scroll-container" id="featured-scroll">
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

            <button
              className="scroll-arrow scroll-arrow-right"
              onClick={() => {
                const el = document.getElementById('featured-scroll');
                if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
              }}
              aria-label="Scroll right"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
          </div>

          <div className="category-list">
            <div className="category-row cat-men" onClick={() => window.location.href='/products?category=men'}>
              <div className="cat-bg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80')"}}></div>
              <span className="cat-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="10" cy="14" r="5"/>
                  <line x1="14.5" y1="9.5" x2="20" y2="4"/>
                  <polyline points="16 4 20 4 20 8"/>
                </svg>
              </span>
              <div className="cat-info">
                <h3 className="cat-title">Men</h3>
                <p className="cat-desc">Bold &amp; Sophisticated</p>
              </div>
              <span className="cat-tag">Woody · Spicy · Fresh</span>
              <svg className="cat-arrow" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>

            <div className="category-row cat-women" onClick={() => window.location.href='/products?category=women'}>
              <div className="cat-bg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80')"}}></div>
              <span className="cat-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="12" cy="9" r="5"/>
                  <line x1="12" y1="14" x2="12" y2="20"/>
                  <line x1="9" y1="18" x2="15" y2="18"/>
                </svg>
              </span>
              <div className="cat-info">
                <h3 className="cat-title">Women</h3>
                <p className="cat-desc">Elegant &amp; Enchanting</p>
              </div>
              <span className="cat-tag">Floral · Sweet · Musky</span>
              <svg className="cat-arrow" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>

            <div className="category-row cat-unisex" onClick={() => window.location.href='/products?category=unisex'}>
              <div className="cat-bg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80')"}}></div>
              <span className="cat-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="11" cy="11" r="4.5"/>
                  <line x1="14.5" y1="7.5" x2="19" y2="3"/>
                  <polyline points="16 3 19 3 19 6"/>
                  <line x1="11" y1="15.5" x2="11" y2="21"/>
                  <line x1="8.5" y1="19" x2="13.5" y2="19"/>
                </svg>
              </span>
              <div className="cat-info">
                <h3 className="cat-title">Unisex</h3>
                <p className="cat-desc">Universal Appeal</p>
              </div>
              <span className="cat-tag">Citrus · Amber · Oud</span>
              <svg className="cat-arrow" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="brand-video"
        >
          <source src="/brand-video.mp4" type="video/mp4" />
        </video>
      </section>

      {/* Fragrance Notes Section */}
      <section className="notes-section">
        <div className="container">
          <div className="notes-header">
            <span className="notes-eyebrow">The Art of Scent</span>
            <h2 className="notes-title">Fragrance Notes</h2>
            <p className="notes-subtitle">Every great perfume tells a story in three acts</p>
          </div>

          <div className="notes-pyramid">
            {/* Top Notes */}
            <div className="notes-tier notes-top">
              <div className="notes-tier-label">
                <span className="tier-tag">Top Notes</span>
                <p className="tier-desc">First impression · fades in 15–30 min</p>
              </div>
              <div className="notes-cards">
                <div className="note-card">
                  <div className="note-icon">
                    {/* Bergamot */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="42" r="22" fill="#FFF3C4" stroke="#E8C84A" strokeWidth="1.5"/>
                      <circle cx="40" cy="42" r="14" fill="#FFE566" opacity="0.5"/>
                      <path d="M40 20 C40 20 36 10 40 6 C44 10 40 20 40 20Z" fill="#7CB87A" stroke="#5A9A58" strokeWidth="1"/>
                      <path d="M40 20 C40 20 30 14 28 8 C34 8 40 20 40 20Z" fill="#7CB87A" stroke="#5A9A58" strokeWidth="1"/>
                      <circle cx="33" cy="38" r="2" fill="#E8C84A" opacity="0.6"/>
                      <circle cx="47" cy="44" r="1.5" fill="#E8C84A" opacity="0.6"/>
                      <circle cx="38" cy="50" r="1.5" fill="#E8C84A" opacity="0.6"/>
                    </svg>
                  </div>
                  <span className="note-name">Bergamot</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Lemon */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="40" cy="42" rx="20" ry="24" fill="#FFF9C4" stroke="#F5D020" strokeWidth="1.5"/>
                      <ellipse cx="40" cy="42" rx="13" ry="16" fill="#FFF176" opacity="0.5"/>
                      <path d="M40 18 C40 18 37 10 40 6 C43 10 40 18 40 18Z" fill="#7CB87A" stroke="#5A9A58" strokeWidth="1"/>
                      <line x1="40" y1="28" x2="40" y2="56" stroke="#F5D020" strokeWidth="0.8" opacity="0.5"/>
                      <line x1="26" y1="42" x2="54" y2="42" stroke="#F5D020" strokeWidth="0.8" opacity="0.5"/>
                    </svg>
                  </div>
                  <span className="note-name">Lemon</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Pink Pepper */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="44" r="16" fill="#FFD6D6" stroke="#E8A0A0" strokeWidth="1.5"/>
                      <circle cx="32" cy="36" r="8" fill="#FFBCBC" stroke="#E8A0A0" strokeWidth="1.2"/>
                      <circle cx="50" cy="38" r="6" fill="#FFCECE" stroke="#E8A0A0" strokeWidth="1.2"/>
                      <circle cx="38" cy="52" r="7" fill="#FFD0D0" stroke="#E8A0A0" strokeWidth="1.2"/>
                      <path d="M36 20 C36 20 34 12 38 8 C42 12 40 20 40 20Z" fill="#7CB87A" stroke="#5A9A58" strokeWidth="1"/>
                    </svg>
                  </div>
                  <span className="note-name">Pink Pepper</span>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div className="notes-divider">
              <div className="divider-line"></div>
              <span className="divider-dot"></span>
              <div className="divider-line"></div>
            </div>

            {/* Heart Notes */}
            <div className="notes-tier notes-heart">
              <div className="notes-tier-label">
                <span className="tier-tag tier-heart">Heart Notes</span>
                <p className="tier-desc">The soul of the fragrance · lasts 2–4 hrs</p>
              </div>
              <div className="notes-cards">
                <div className="note-card">
                  <div className="note-icon">
                    {/* Rose */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 58 C40 58 20 46 20 32 C20 24 28 18 36 22 C38 23 40 25 40 25 C40 25 42 23 44 22 C52 18 60 24 60 32 C60 46 40 58 40 58Z" fill="#FFB3C6" stroke="#E8829A" strokeWidth="1.5"/>
                      <path d="M40 50 C40 50 26 40 26 30 C26 25 32 22 37 25 C38.5 26 40 28 40 28 C40 28 41.5 26 43 25 C48 22 54 25 54 30 C54 40 40 50 40 50Z" fill="#FF8FAB" opacity="0.6"/>
                      <path d="M40 20 C40 20 37 12 40 8 C43 12 40 20 40 20Z" fill="#7CB87A" stroke="#5A9A58" strokeWidth="1"/>
                      <path d="M34 22 C34 22 26 18 24 12 C30 12 34 22 34 22Z" fill="#7CB87A" stroke="#5A9A58" strokeWidth="1"/>
                    </svg>
                  </div>
                  <span className="note-name">Rose</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Jasmine */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="40" r="6" fill="#FFF9E6" stroke="#F0D060" strokeWidth="1.2"/>
                      <ellipse cx="40" cy="24" rx="5" ry="9" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2"/>
                      <ellipse cx="40" cy="56" rx="5" ry="9" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2"/>
                      <ellipse cx="24" cy="40" rx="9" ry="5" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2"/>
                      <ellipse cx="56" cy="40" rx="9" ry="5" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2"/>
                      <ellipse cx="28.7" cy="28.7" rx="5" ry="9" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2" transform="rotate(-45 28.7 28.7)"/>
                      <ellipse cx="51.3" cy="51.3" rx="5" ry="9" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2" transform="rotate(-45 51.3 51.3)"/>
                      <ellipse cx="51.3" cy="28.7" rx="5" ry="9" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2" transform="rotate(45 51.3 28.7)"/>
                      <ellipse cx="28.7" cy="51.3" rx="5" ry="9" fill="#FFFDE0" stroke="#E8D080" strokeWidth="1.2" transform="rotate(45 28.7 51.3)"/>
                    </svg>
                  </div>
                  <span className="note-name">Jasmine</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Peony */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="40" r="8" fill="#FFD6E8" stroke="#E8A0C0" strokeWidth="1"/>
                      <path d="M40 14 C36 14 30 20 32 28 C34 22 38 20 40 20 C42 20 46 22 48 28 C50 20 44 14 40 14Z" fill="#FFB3D1" stroke="#E8A0C0" strokeWidth="1.2"/>
                      <path d="M40 66 C36 66 30 60 32 52 C34 58 38 60 40 60 C42 60 46 58 48 52 C50 60 44 66 40 66Z" fill="#FFB3D1" stroke="#E8A0C0" strokeWidth="1.2"/>
                      <path d="M14 40 C14 36 20 30 28 32 C22 34 20 38 20 40 C20 42 22 46 28 48 C20 50 14 44 14 40Z" fill="#FFB3D1" stroke="#E8A0C0" strokeWidth="1.2"/>
                      <path d="M66 40 C66 36 60 30 52 32 C58 34 60 38 60 40 C60 42 58 46 52 48 C60 50 66 44 66 40Z" fill="#FFB3D1" stroke="#E8A0C0" strokeWidth="1.2"/>
                    </svg>
                  </div>
                  <span className="note-name">Peony</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Lavender */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="40" y1="70" x2="40" y2="30" stroke="#7CB87A" strokeWidth="2"/>
                      <ellipse cx="40" cy="26" rx="4" ry="6" fill="#C9B1E8" stroke="#A080C8" strokeWidth="1.2"/>
                      <ellipse cx="33" cy="34" rx="3.5" ry="5.5" fill="#C9B1E8" stroke="#A080C8" strokeWidth="1.2"/>
                      <ellipse cx="47" cy="34" rx="3.5" ry="5.5" fill="#C9B1E8" stroke="#A080C8" strokeWidth="1.2"/>
                      <ellipse cx="36" cy="42" rx="3" ry="5" fill="#B89FD8" stroke="#A080C8" strokeWidth="1.2"/>
                      <ellipse cx="44" cy="42" rx="3" ry="5" fill="#B89FD8" stroke="#A080C8" strokeWidth="1.2"/>
                      <path d="M34 62 C34 62 28 56 30 50" stroke="#7CB87A" strokeWidth="1.5" fill="none"/>
                      <path d="M46 62 C46 62 52 56 50 50" stroke="#7CB87A" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <span className="note-name">Lavender</span>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div className="notes-divider">
              <div className="divider-line"></div>
              <span className="divider-dot"></span>
              <div className="divider-line"></div>
            </div>

            {/* Base Notes */}
            <div className="notes-tier notes-base">
              <div className="notes-tier-label">
                <span className="tier-tag tier-base">Base Notes</span>
                <p className="tier-desc">The lasting memory · stays 6–8+ hrs</p>
              </div>
              <div className="notes-cards">
                <div className="note-card">
                  <div className="note-icon">
                    {/* Oud / Wood */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="34" y="18" width="12" height="48" rx="4" fill="#C8956C" stroke="#A0704A" strokeWidth="1.5"/>
                      <path d="M28 30 C28 30 18 28 16 22 C22 20 28 30 28 30Z" fill="#8B6340" stroke="#6B4A28" strokeWidth="1"/>
                      <path d="M52 30 C52 30 62 28 64 22 C58 20 52 30 52 30Z" fill="#8B6340" stroke="#6B4A28" strokeWidth="1"/>
                      <path d="M28 44 C28 44 18 42 16 36 C22 34 28 44 28 44Z" fill="#8B6340" stroke="#6B4A28" strokeWidth="1"/>
                      <path d="M52 44 C52 44 62 42 64 36 C58 34 52 44 52 44Z" fill="#8B6340" stroke="#6B4A28" strokeWidth="1"/>
                      <ellipse cx="40" cy="18" rx="6" ry="4" fill="#A0704A" opacity="0.5"/>
                    </svg>
                  </div>
                  <span className="note-name">Oud</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Amber */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="40,12 62,30 54,56 26,56 18,30" fill="#FFD08A" stroke="#E8A840" strokeWidth="1.5"/>
                      <polygon points="40,22 54,34 48,50 32,50 26,34" fill="#FFB84A" opacity="0.6"/>
                      <circle cx="40" cy="38" r="6" fill="#FFA020" opacity="0.4"/>
                      <line x1="40" y1="12" x2="40" y2="22" stroke="#E8A840" strokeWidth="1" opacity="0.6"/>
                    </svg>
                  </div>
                  <span className="note-name">Amber</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Musk */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="40" r="20" fill="#EDE0D4" stroke="#C8B0A0" strokeWidth="1.5"/>
                      <circle cx="40" cy="40" r="13" fill="#E0D0C4" stroke="#C8B0A0" strokeWidth="1"/>
                      <circle cx="40" cy="40" r="7" fill="#D4C0B0" stroke="#C8B0A0" strokeWidth="1"/>
                      <path d="M40 20 Q50 30 40 40 Q30 30 40 20Z" fill="white" opacity="0.3"/>
                    </svg>
                  </div>
                  <span className="note-name">Musk</span>
                </div>
                <div className="note-card">
                  <div className="note-icon">
                    {/* Sandalwood */}
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 68 C40 68 24 54 24 38 C24 28 32 20 40 20 C48 20 56 28 56 38 C56 54 40 68 40 68Z" fill="#D4A574" stroke="#A07848" strokeWidth="1.5"/>
                      <path d="M40 58 C40 58 30 48 30 38 C30 32 34 26 40 26 C46 26 50 32 50 38 C50 48 40 58 40 58Z" fill="#C49060" opacity="0.5"/>
                      <path d="M40 20 C40 20 37 12 40 8 C43 12 40 20 40 20Z" fill="#7CB87A" stroke="#5A9A58" strokeWidth="1"/>
                    </svg>
                  </div>
                  <span className="note-name">Sandalwood</span>
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
                <div className="about-single-img">
                  <img 
                    src={require('./assets/images/about-perfume.png')} 
                    alt="Luxury perfume collection"
                  />
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
            <p>We'd love to hear from you</p>
          </div>

          <div className="contact-wrapper">
            {/* Quick contact links */}
            <div className="contact-links">
              <a href="mailto:info@essence.com" className="contact-link-item">
                <div className="contact-link-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <span>info@essence.com</span>
              </a>
              <a href="tel:+15551234567" className="contact-link-item">
                <div className="contact-link-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <span>+1 (555) 123-4567</span>
              </a>
            </div>

            {/* Simple form */}
            <form className="contact-form-simple">
              <input type="text" placeholder="Your name" required />
              <input type="email" placeholder="Your email" required />
              <textarea placeholder="Your message" rows="4" required></textarea>
              <button type="submit" className="contact-submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Dark spacer below contact */}
      <div className="contact-spacer"></div>

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
                <li><a href="/#home">Home</a></li>
                <li><a href="/#collections">Collections</a></li>
                <li><a href="/#about">About Us</a></li>
                <li><a href="/#contact">Contact</a></li>
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
        <a href="/#about" className="mobile-nav-item">
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
