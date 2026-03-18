import React, { useState, useEffect } from 'react';
import { useContent } from '../context/SupabaseContentContext';
import { adminAuth, supabase } from '../lib/supabase';
import AdminLogin from './SupabaseAdminLogin';
import './ModernAdminPanel.css';

const ModernAdminPanel = () => {
  const { 
    content, 
    loading,
    connectionError,
    updateGlobalSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    refreshContent
  } = useContent();
  
  const [activeSection, setActiveSection] = useState('dashboard');
  const [tempContent, setTempContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingData, setEditingData] = useState({});

  useEffect(() => {
    console.log('Content updated:', content);
    setTempContent(content);
  }, [content]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const session = await adminAuth.verifySession();
        console.log('Session check result:', session);
        if (session) {
          setIsAuthenticated(true);
          setAdmin(session.user);
          console.log('User authenticated:', session.user);
        } else {
          console.log('No valid session found');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (adminData) => {
    console.log('Login successful, setting admin data:', adminData);
    setIsAuthenticated(true);
    setAdmin(adminData);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    try {
      await adminAuth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setAdmin(null);
    }
  };

  const handleInputChange = (path, value) => {
    const newContent = { ...tempContent };
    const keys = path.split('.');
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setTempContent(newContent);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setSaving(true);
        console.log('Uploading banner image:', file.name, file.size);
        
        const imageUrl = await uploadImage(file, 'banners');
        console.log('Banner image upload result:', imageUrl);
        alert('Banner image uploaded successfully to Supabase Storage!\n\nURL: ' + imageUrl);
        setSaving(false);
      } catch (error) {
        console.error('Error uploading banner image:', error);
        
        let errorMessage = 'Error uploading banner image: ' + error.message;
        if (error.message.includes('bucket not configured')) {
          errorMessage += '\n\nPlease check SUPABASE_STORAGE_SETUP.md for setup instructions.';
        }
        
        alert(errorMessage);
        setSaving(false);
      }
    }
  };

  const handleProductImageUpload = async (event, product) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setSaving(true);
        console.log('Uploading product image for:', product.name, file.name);
        
        const imageUrl = await uploadImage(file, 'products');
        console.log('Product image upload result:', imageUrl);
        
        // Update the product with the new main image
        await updateProduct(product.id, {
          name: product.name,
          price: product.price,
          notes: product.notes,
          productImage: imageUrl,
          productImages: product.images || [],
          isFeatured: product.isFeatured || false
        });
        
        alert('Main image uploaded successfully!');
        setSaving(false);
      } catch (error) {
        console.error('Error uploading product image:', error);
        alert('Error uploading product image: ' + error.message);
        setSaving(false);
      }
    }
  };

  const handleProductExtraImageUpload = async (event, product) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setSaving(true);
        const imageUrl = await uploadImage(file, 'products');
        const updatedImages = [...(product.images || []), imageUrl];
        await updateProduct(product.id, {
          name: product.name,
          price: product.price,
          notes: product.notes,
          productImage: product.image || '',
          productImages: updatedImages,
          isFeatured: product.isFeatured || false
        });
        alert('Extra image added successfully!');
        setSaving(false);
      } catch (error) {
        console.error('Error uploading extra image:', error);
        alert('Error: ' + error.message);
        setSaving(false);
      }
    }
  };

  const handleRemoveExtraImage = async (product, imgUrl) => {
    try {
      setSaving(true);
      const updatedImages = (product.images || []).filter(u => u !== imgUrl);
      await updateProduct(product.id, {
        name: product.name,
        price: product.price,
        notes: product.notes,
        productImage: product.image || '',
        productImages: updatedImages,
        isFeatured: product.isFeatured || false
      });
      setSaving(false);
    } catch (error) {
      console.error('Error removing image:', error);
      setSaving(false);
    }
  };

  const handleBannerReplace = async (event, bannerName) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setSaving(true);
        console.log('Replacing banner:', bannerName, 'with:', file.name);

        // Upload directly with the exact banner filename so the site picks it up
        const fileExt = file.name.split('.').pop();
        const exactFileName = `banners/${bannerName.replace(/\.[^.]+$/, '')}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('perfume-images')
          .upload(exactFileName, file, { cacheControl: '3600', upsert: true });

        if (error) throw new Error(error.message);

        const { data: { publicUrl } } = supabase.storage
          .from('perfume-images')
          .getPublicUrl(exactFileName);

        console.log('Banner replaced at:', publicUrl);
        alert(`Banner replaced successfully!\n\nThe new image is now live on the site.\n\nURL: ${publicUrl}`);
        setSaving(false);
      } catch (error) {
        console.error('Error replacing banner:', error);
        alert('Error replacing banner: ' + error.message);
        setSaving(false);
      }
    }
  };

  const saveGlobalSettings = async () => {
    try {
      setSaving(true);
      console.log('Saving global settings:', tempContent.global);
      
      const result = await updateGlobalSettings({
        brandName: tempContent.global?.brandName || 'ESSENCE',
        newsletterTitle: tempContent.global?.newsletter?.title || 'STAY IN THE SCENT',
        newsletterSubtitle: tempContent.global?.newsletter?.subtitle || 'Be the first to discover new fragrances',
        footerDescription: tempContent.global?.footer?.description || 'Crafting premium fragrances'
      });
      
      console.log('Save global settings result:', result);
      alert('Global settings saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error saving global settings:', error);
      alert('Error saving global settings: ' + error.message);
      setSaving(false);
    }
  };

  const handleAddProduct = async (category = 'men') => {
    try {
      setSaving(true);
      console.log('Adding product to category:', category);
      
      const result = await addProduct(category, {
        name: "New Product",
        price: "$100",
        notes: "Fragrance notes",
        productImage: "",
        isFeatured: false
      });
      
      console.log('Add product result:', result);
      alert('Product added successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + error.message);
      setSaving(false);
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product.id);
    setEditingData({
      name: product.name,
      price: product.price,
      notes: product.notes
    });
  };

  const handleUpdateProduct = async (product) => {
    try {
      setSaving(true);
      console.log('Updating product:', product.id, editingData);
      
      const result = await updateProduct(product.id, {
        name: editingData.name,
        price: editingData.price,
        notes: editingData.notes,
        productImage: product.image || '',
        isFeatured: product.isFeatured || false
      });
      
      console.log('Update product result:', result);
      alert('Product updated successfully!');
      setEditingProduct(null);
      setEditingData({});
      setSaving(false);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + error.message);
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        setSaving(true);
        console.log('Deleting product:', product.id);
        
        const result = await deleteProduct(product.id);
        console.log('Delete product result:', result);
        alert('Product deleted successfully!');
        setSaving(false);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
        setSaving(false);
      }
    }
  };

  const toggleFeatured = async (product) => {
    try {
      setSaving(true);
      console.log('Toggling featured status for product:', product.id, 'Current:', product.isFeatured);
      
      const result = await updateProduct(product.id, {
        name: product.name,
        price: product.price,
        notes: product.notes,
        productImage: product.image || '',
        isFeatured: !product.isFeatured
      });
      
      console.log('Toggle featured result:', result);
      alert(`Product ${!product.isFeatured ? 'added to' : 'removed from'} featured!`);
      setSaving(false);
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Error updating featured status: ' + error.message);
      setSaving(false);
    }
  };

  const handleRefreshContent = async () => {
    try {
      setSaving(true);
      console.log('Refreshing content...');
      
      await refreshContent();
      console.log('Content refreshed successfully');
      alert('Content refreshed successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error refreshing content:', error);
      alert('Error refreshing content: ' + error.message);
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="modern-admin-panel">
        <div className="loading">
          <h2>Checking Authentication...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="modern-admin-panel">
        <div className="loading">
          <h2>Loading Admin Panel...</h2>
        </div>
      </div>
    );
  }

  // Get all products for unified management
  const allProducts = [
    ...(content.men?.products || []).map(p => ({ ...p, category: 'men' })),
    ...(content.women?.products || []).map(p => ({ ...p, category: 'women' })),
    ...(content.unisex?.products || []).map(p => ({ ...p, category: 'unisex' }))
  ];

  const featuredProducts = allProducts.filter(p => p.isFeatured);
  
  const filteredProducts = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="modern-admin-panel">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🛠️ ESSENCE</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'hero' ? 'active' : ''}`}
            onClick={() => setActiveSection('hero')}
          >
            <span className="nav-icon">🎯</span>
            Hero Banners
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSection('products')}
          >
            <span className="nav-icon">🛍️</span>
            Products
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveSection('featured')}
          >
            <span className="nav-icon">⭐</span>
            Featured Products
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'newsletter' ? 'active' : ''}`}
            onClick={() => setActiveSection('newsletter')}
          >
            <span className="nav-icon">📧</span>
            Newsletter
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <p>Welcome, {admin?.username}</p>
            <small>Powered by Supabase</small>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>
            {activeSection === 'dashboard' && 'Dashboard'}
            {activeSection === 'hero' && 'Hero Banners Management'}
            {activeSection === 'products' && 'Products Management'}
            {activeSection === 'featured' && 'Featured Products'}
            {activeSection === 'newsletter' && 'Newsletter Settings'}
            {activeSection === 'settings' && 'Global Settings'}
          </h1>
          
          {connectionError && (
            <div className="connection-error">
              ⚠️ Database Connection Error - Check your Supabase configuration
            </div>
          )}
        </div>

        <div className="admin-content">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Products</h3>
                  <div className="stat-number">{allProducts.length}</div>
                </div>
                <div className="stat-card">
                  <h3>Featured Products</h3>
                  <div className="stat-number">{featuredProducts.length}</div>
                </div>
                <div className="stat-card">
                  <h3>Men's Products</h3>
                  <div className="stat-number">{content.men?.products?.length || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Women's Products</h3>
                  <div className="stat-number">{content.women?.products?.length || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Unisex Products</h3>
                  <div className="stat-number">{content.unisex?.products?.length || 0}</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button onClick={() => setActiveSection('products')} className="action-btn">
                    Add New Product
                  </button>
                  <button onClick={() => setActiveSection('hero')} className="action-btn">
                    Update Hero Banner
                  </button>
                  <button onClick={() => setActiveSection('featured')} className="action-btn">
                    Manage Featured
                  </button>
                  <button onClick={handleRefreshContent} className="action-btn" disabled={saving}>
                    {saving ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Debug - Current content:', content);
                      console.log('Debug - Connection error:', connectionError);
                      console.log('Debug - Loading:', loading);
                      console.log('Debug - Admin:', admin);
                      alert('Check console for debug info');
                    }} 
                    className="action-btn"
                  >
                    Debug Info
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('This will log you out and clear all admin sessions. Continue?')) {
                        try {
                          // Clear all sessions from database
                          await supabase.from('admin_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                          // Clear localStorage
                          localStorage.removeItem('admin_session_token');
                          // Logout
                          handleLogout();
                          alert('All sessions cleared. Please refresh the page to see the login screen.');
                        } catch (error) {
                          console.error('Error clearing sessions:', error);
                          alert('Error clearing sessions: ' + error.message);
                        }
                      }
                    }} 
                    className="action-btn"
                    style={{background: '#EF4444'}}
                  >
                    Clear Sessions
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Banners */}
          {activeSection === 'hero' && (
            <div className="content-section">
              <p className="section-description">
                Upload new banner images for your homepage hero section. Images will be automatically optimized.
              </p>
              
              <div className="banner-upload">
                <h3>Upload New Banner</h3>
                <div className="file-upload-area">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                    disabled={saving}
                    id="banner-upload"
                  />
                  <label htmlFor="banner-upload" className="file-upload-label">
                    {saving ? 'Uploading...' : 'Choose Image File'}
                  </label>
                  <p className="help-text">Recommended size: 1920x800px for best results</p>
                  <p className="help-text">Supported formats: JPG, PNG, WebP, GIF (Max 5MB)</p>
                  <p className="help-text">📁 Images stored in Supabase Storage</p>
                </div>
                {saving && <div className="upload-progress">Uploading to Supabase...</div>}
              </div>

              <div className="current-banners">
                <h3>Current Banners</h3>
                <p className="help-text">These are the banner images currently in your public/Banners folder</p>
                <div className="banner-grid">
                  <div className="banner-item">
                    <img src="/Banners/banner-1.jpg" alt="Banner 1" />
                    <div className="banner-actions">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleBannerReplace(e, 'banner-1.jpg')}
                        className="hidden-file-input"
                        id="banner-1-replace"
                        disabled={saving}
                      />
                      <label htmlFor="banner-1-replace" className="btn-replace">
                        {saving ? 'Uploading...' : 'Replace'}
                      </label>
                    </div>
                  </div>
                  <div className="banner-item">
                    <img src="/Banners/banner-2.jpg" alt="Banner 2" />
                    <div className="banner-actions">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleBannerReplace(e, 'banner-2.jpg')}
                        className="hidden-file-input"
                        id="banner-2-replace"
                        disabled={saving}
                      />
                      <label htmlFor="banner-2-replace" className="btn-replace">
                        {saving ? 'Uploading...' : 'Replace'}
                      </label>
                    </div>
                  </div>
                  <div className="banner-item">
                    <img src="/Banners/banner-3.jpg" alt="Banner 3" />
                    <div className="banner-actions">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleBannerReplace(e, 'banner-3.jpg')}
                        className="hidden-file-input"
                        id="banner-3-replace"
                        disabled={saving}
                      />
                      <label htmlFor="banner-3-replace" className="btn-replace">
                        {saving ? 'Uploading...' : 'Replace'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Management */}
          {activeSection === 'products' && (
            <div className="content-section">
              <div className="section-actions">
                <div className="category-tabs">
                  <button 
                    className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Products ({allProducts.length})
                  </button>
                  <button 
                    className={`category-tab ${selectedCategory === 'men' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('men')}
                  >
                    Men ({content.men?.products?.length || 0})
                  </button>
                  <button 
                    className={`category-tab ${selectedCategory === 'women' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('women')}
                  >
                    Women ({content.women?.products?.length || 0})
                  </button>
                  <button 
                    className={`category-tab ${selectedCategory === 'unisex' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('unisex')}
                  >
                    Unisex ({content.unisex?.products?.length || 0})
                  </button>
                </div>
                <button 
                  onClick={() => handleAddProduct(selectedCategory === 'all' ? 'men' : selectedCategory)} 
                  className="btn-add-product"
                  disabled={saving}
                >
                  {saving ? 'Adding...' : 'Add New Product'}
                </button>
                <button 
                  onClick={() => {
                    console.log('Test button clicked');
                    console.log('Selected category:', selectedCategory);
                    console.log('All products:', allProducts);
                    console.log('Filtered products:', filteredProducts);
                    alert('Check console for product debug info');
                  }} 
                  className="btn-add-product"
                  style={{marginLeft: '10px'}}
                >
                  Test Products
                </button>
              </div>

              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Notes</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <tr key={product.id || index}>
                        <td>
                          <div className="product-image-cell">
                            {/* Main image */}
                            <div style={{marginBottom: '6px'}}>
                              <p style={{fontSize:'11px', color:'#888', margin:'0 0 3px'}}>Main</p>
                              {product.image ? (
                                <img src={product.image} alt={product.name} />
                              ) : (
                                <div className="no-image">No Image</div>
                              )}
                              <div className="image-upload-btn">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleProductImageUpload(e, product)}
                                  className="hidden-file-input"
                                  id={`product-image-${product.id}`}
                                  disabled={saving}
                                />
                                <label htmlFor={`product-image-${product.id}`} className="upload-image-label">
                                  {saving ? '...' : 'Set Main'}
                                </label>
                              </div>
                            </div>
                            {/* Extra images */}
                            <div>
                              <p style={{fontSize:'11px', color:'#888', margin:'0 0 3px'}}>Extra</p>
                              <div style={{display:'flex', gap:'4px', flexWrap:'wrap', marginBottom:'4px'}}>
                                {(product.images || []).map((img, i) => (
                                  <div key={i} style={{position:'relative'}}>
                                    <img src={img} alt={`extra-${i}`} style={{width:'36px', height:'36px', objectFit:'cover', borderRadius:'4px'}} />
                                    <button
                                      onClick={() => handleRemoveExtraImage(product, img)}
                                      style={{position:'absolute', top:'-4px', right:'-4px', background:'#ef4444', color:'#fff', border:'none', borderRadius:'50%', width:'14px', height:'14px', fontSize:'9px', cursor:'pointer', lineHeight:'14px', padding:0}}
                                    >×</button>
                                  </div>
                                ))}
                              </div>
                              <div className="image-upload-btn">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleProductExtraImageUpload(e, product)}
                                  className="hidden-file-input"
                                  id={`product-extra-${product.id}`}
                                  disabled={saving}
                                />
                                <label htmlFor={`product-extra-${product.id}`} className="upload-image-label">
                                  {saving ? '...' : '+ Add'}
                                </label>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {editingProduct === product.id ? (
                            <input 
                              type="text" 
                              value={editingData.name}
                              onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            product.name
                          )}
                        </td>
                        <td>
                          <span className={`category-badge ${product.category}`}>
                            {product.category}
                          </span>
                        </td>
                        <td>
                          {editingProduct === product.id ? (
                            <input 
                              type="text" 
                              value={editingData.price}
                              onChange={(e) => setEditingData({...editingData, price: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            product.price
                          )}
                        </td>
                        <td>
                          {editingProduct === product.id ? (
                            <input 
                              type="text" 
                              value={editingData.notes}
                              onChange={(e) => setEditingData({...editingData, notes: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            product.notes
                          )}
                        </td>
                        <td>
                          <button
                            className={`featured-toggle ${product.isFeatured ? 'featured' : 'not-featured'}`}
                            onClick={() => toggleFeatured(product)}
                            disabled={saving}
                          >
                            {product.isFeatured ? '⭐ Featured' : '☆ Not Featured'}
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {editingProduct === product.id ? (
                              <>
                                <button 
                                  className="btn-save"
                                  onClick={() => handleUpdateProduct(product)}
                                  disabled={saving}
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                  className="btn-cancel"
                                  onClick={() => {
                                    setEditingProduct(null);
                                    setEditingData({});
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="btn-edit"
                                  onClick={() => startEditing(product)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn-delete"
                                  onClick={() => handleDeleteProduct(product)}
                                  disabled={saving}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Featured Products */}
          {activeSection === 'featured' && (
            <div className="content-section">
              <p className="section-description">
                Manage which products appear in the featured section on your homepage. You can have up to 6 featured products.
              </p>
              
              <div className="featured-stats">
                <div className="featured-count">
                  <span className="count">{featuredProducts.length}</span>
                  <span className="label">Featured Products</span>
                </div>
                <div className="featured-limit">
                  <span className="limit">6</span>
                  <span className="label">Maximum Allowed</span>
                </div>
              </div>

              <div className="featured-products-grid">
                {featuredProducts.map((product, index) => (
                  <div key={product.id || index} className="featured-product-card">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">{product.price}</p>
                    </div>
                    <button 
                      className="btn-remove-featured"
                      onClick={() => toggleFeatured(product)}
                      disabled={saving}
                    >
                      {saving ? 'Updating...' : 'Remove from Featured'}
                    </button>
                  </div>
                ))}
              </div>

              {featuredProducts.length < 6 && (
                <div className="add-featured">
                  <h3>Add More Featured Products</h3>
                  <p>Select from your existing products to feature on the homepage:</p>
                  <div className="available-products">
                    {allProducts.filter(p => !p.isFeatured).slice(0, 6).map((product, index) => (
                      <div key={product.id || index} className="available-product">
                        <span>{product.name} ({product.category})</span>
                        <button 
                          className="btn-add-featured"
                          onClick={() => toggleFeatured(product)}
                          disabled={saving}
                        >
                          {saving ? 'Adding...' : 'Add to Featured'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Newsletter */}
          {activeSection === 'newsletter' && (
            <div className="content-section">
              <div className="form-group">
                <label>Newsletter Title</label>
                <input 
                  type="text" 
                  value={tempContent.global?.newsletter?.title || ''}
                  onChange={(e) => handleInputChange('global.newsletter.title', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Newsletter Subtitle</label>
                <input 
                  type="text" 
                  value={tempContent.global?.newsletter?.subtitle || ''}
                  onChange={(e) => handleInputChange('global.newsletter.subtitle', e.target.value)}
                  className="form-input"
                />
              </div>

              <button onClick={saveGlobalSettings} className="btn-save-section" disabled={saving}>
                {saving ? 'Saving...' : 'Save Newsletter Settings'}
              </button>
            </div>
          )}

          {/* Settings */}
          {activeSection === 'settings' && (
            <div className="content-section">
              <div className="form-group">
                <label>Brand Name</label>
                <input 
                  type="text" 
                  value={tempContent.global?.brandName || ''}
                  onChange={(e) => handleInputChange('global.brandName', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Footer Description</label>
                <textarea 
                  value={tempContent.global?.footer?.description || ''}
                  onChange={(e) => handleInputChange('global.footer.description', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button onClick={saveGlobalSettings} className="btn-save-section" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <button onClick={handleRefreshContent} className="btn-refresh" disabled={saving}>
                  {saving ? 'Refreshing...' : 'Refresh Content'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernAdminPanel;