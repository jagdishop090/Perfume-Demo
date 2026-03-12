import React, { useState, useEffect } from 'react';
import { useContent } from '../context/SupabaseContentContext';
import { adminAuth } from '../lib/supabase';
import AdminLogin from './SupabaseAdminLogin';
import './AdminPanel.css';

const AdminPanel = () => {
  const { 
    content, 
    loading,
    connectionError,
    updateGlobalSettings,
    updateHeroSection,
    addFeature,
    updateFeature,
    deleteFeature,
    addProduct,
    updateProduct,
    deleteProduct,
    updateAboutSection,
    uploadImage,
    refreshContent
  } = useContent();
  
  const [activeTab, setActiveTab] = useState('men');
  const [activeSection, setActiveSection] = useState('hero');
  const [tempContent, setTempContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setTempContent(content);
  }, [content]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await adminAuth.verifySession();
        if (session) {
          setIsAuthenticated(true);
          setAdmin(session.user);
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
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setTempContent(newContent);
  };

  const handleArrayChange = (path, index, field, value) => {
    const newContent = { ...tempContent };
    const keys = path.split('.');
    let current = newContent;
    
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        current[keys[i]][index][field] = value;
      } else {
        current = current[keys[i]];
      }
    }
    
    setTempContent(newContent);
    
    // Auto-save when featured status changes
    if (field === 'isFeatured') {
      const pathParts = path.split('.');
      handleProductSave(pathParts[0], index);
    }
    
    // Auto-save feature changes
    if (path.includes('features') && (field === 'title' || field === 'desc')) {
      const pathParts = path.split('.');
      handleFeatureSave(pathParts[0], index);
    }
  };

  const handleFeatureSave = async (mode, index) => {
    try {
      const feature = tempContent[mode].features[index];
      
      if (feature && feature.id) {
        await updateFeature(feature.id, {
          title: feature.title,
          description: feature.desc
        });
        console.log('Feature updated successfully');
      }
    } catch (error) {
      console.error('Error updating feature:', error);
    }
  };

  const handleFeatureSaveManual = async (mode, index) => {
    try {
      setSaving(true);
      const feature = tempContent[mode].features[index];
      
      if (feature && feature.id) {
        await updateFeature(feature.id, {
          title: feature.title,
          description: feature.desc
        });
        alert('Feature saved successfully!');
      } else {
        alert('Feature ID not found. Please refresh and try again.');
      }
      setSaving(false);
    } catch (error) {
      console.error('Error saving feature:', error);
      alert('Error saving feature: ' + error.message);
      setSaving(false);
    }
  };

  const handleProductSave = async (mode, index) => {
    try {
      setSaving(true);
      const product = tempContent[mode].products[index];
      
      if (product && product.id) {
        const productData = {
          name: product.name,
          price: product.price,
          notes: product.notes,
          productImage: product.image || '',
          isFeatured: product.isFeatured || false
        };
        
        await updateProduct(product.id, productData);
        alert('Product saved successfully!');
      } else {
        alert('Product ID not found. Please refresh and try again.');
      }
      setSaving(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
      setSaving(false);
    }
  };

  const handleImageUpload = async (path, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setSaving(true);
        const imageUrl = await uploadImage(file);
        
        // Handle different types of image uploads
        if (path.includes('heroImage')) {
          // Hero image upload
          const mode = path.split('.')[0]; // Extract mode from path like "men.heroImage"
          handleInputChange(path, imageUrl);
          
          const heroData = {
            title: tempContent[mode].hero.title,
            subtitle: tempContent[mode].hero.subtitle,
            ctaText: tempContent[mode].hero.cta,
            heroImage: imageUrl
          };
          await updateHeroSection(mode, heroData);
          alert('Hero image uploaded and saved successfully!');
          
        } else if (path.includes('products')) {
          // Product image upload - format: "men.products.0.image"
          const pathParts = path.split('.');
          const mode = pathParts[0];
          const index = parseInt(pathParts[2]);
          
          // Update the temp content first
          handleArrayChange(`${mode}.products`, index, 'image', imageUrl);
          
          // Get the product and update it in database
          const product = tempContent[mode].products[index];
          if (product && product.id) {
            const productData = {
              name: product.name,
              price: product.price,
              notes: product.notes,
              productImage: imageUrl,
              isFeatured: product.isFeatured
            };
            await updateProduct(product.id, productData);
            alert('Product image uploaded and saved successfully!');
          } else {
            alert('Product image uploaded! Please save the product to persist changes.');
          }
        } else {
          // Generic image upload
          handleInputChange(path, imageUrl);
        }
        
        setSaving(false);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image: ' + error.message);
        setSaving(false);
      }
    }
  };

  const saveHeroSection = async (mode) => {
    try {
      setSaving(true);
      const heroData = {
        title: tempContent[mode].hero.title,
        subtitle: tempContent[mode].hero.subtitle,
        ctaText: tempContent[mode].hero.cta,
        heroImage: tempContent[mode].heroImage
      };
      await updateHeroSection(mode, heroData);
      alert('Hero section saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error saving hero section:', error);
      alert('Error saving hero section: ' + error.message);
      setSaving(false);
    }
  };

  const handleAddFeature = async (mode) => {
    try {
      setSaving(true);
      await addFeature(mode, {
        title: "NEW FEATURE",
        description: "Feature description"
      });
      setSaving(false);
    } catch (error) {
      console.error('Error adding feature:', error);
      alert('Error adding feature: ' + error.message);
      setSaving(false);
    }
  };

  const handleDeleteFeature = async (mode, index) => {
    try {
      setSaving(true);
      const feature = content[mode].features[index];
      if (feature.id) {
        await deleteFeature(feature.id);
      }
      setSaving(false);
    } catch (error) {
      console.error('Error deleting feature:', error);
      alert('Error deleting feature: ' + error.message);
      setSaving(false);
    }
  };

  const handleAddProduct = async (mode) => {
    try {
      setSaving(true);
      await addProduct(mode, {
        name: "NEW PRODUCT",
        price: "$100",
        notes: "New fragrance notes",
        productImage: "",
        isFeatured: false
      });
      setSaving(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + error.message);
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (mode, index) => {
    try {
      setSaving(true);
      const product = content[mode].products[index];
      if (product.id) {
        await deleteProduct(product.id);
      }
      setSaving(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
      setSaving(false);
    }
  };

  const saveAboutSection = async (mode) => {
    try {
      setSaving(true);
      await updateAboutSection(mode, {
        title: tempContent[mode].about.title,
        description: tempContent[mode].about.description
      });
      alert('About section saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error saving about section:', error);
      alert('Error saving about section: ' + error.message);
      setSaving(false);
    }
  };

  const saveGlobalSettings = async () => {
    try {
      setSaving(true);
      await updateGlobalSettings({
        brandName: tempContent.global.brandName,
        newsletterTitle: tempContent.global.newsletter.title,
        newsletterSubtitle: tempContent.global.newsletter.subtitle,
        footerDescription: tempContent.global.footer.description
      });
      alert('Global settings saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error saving global settings:', error);
      alert('Error saving global settings: ' + error.message);
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setTempContent(content);
    alert('Changes reset to last saved version!');
  };

  const syncAllChanges = async () => {
    try {
      setSaving(true);
      await refreshContent();
      alert('Content synchronized successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error syncing content:', error);
      alert('Error syncing content: ' + error.message);
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="admin-panel">
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
      <div className="admin-panel">
        <div className="loading">
          <h2>Loading Admin Panel...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <h1>🛠️ ESSENCE ADMIN PANEL</h1>
          <p>Welcome, {admin?.username} - Powered by Supabase</p>
        </div>
        <div className="admin-status">
          {connectionError && (
            <div className="connection-error">
              ⚠️ Database Connection Error - Please check your Supabase configuration
            </div>
          )}
          <div className="admin-actions">
            <button onClick={resetChanges} className="btn-reset" disabled={saving}>
              Reset Changes
            </button>
            <button 
              onClick={syncAllChanges} 
              className="btn-refresh"
              disabled={saving}
            >
              {saving ? 'Syncing...' : 'Sync Content'}
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'global') {
                  saveGlobalSettings();
                } else if (activeSection === 'hero') {
                  saveHeroSection(activeTab);
                } else if (activeSection === 'about') {
                  saveAboutSection(activeTab);
                }
              }} 
              className="btn-save" 
              disabled={saving || connectionError}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'men' ? 'active' : ''}`}
          onClick={() => setActiveTab('men')}
        >
          Men's Content
        </button>
        <button 
          className={`tab ${activeTab === 'women' ? 'active' : ''}`}
          onClick={() => setActiveTab('women')}
        >
          Women's Content
        </button>
        <button 
          className={`tab ${activeTab === 'unisex' ? 'active' : ''}`}
          onClick={() => setActiveTab('unisex')}
        >
          Unisex Content
        </button>
        <button 
          className={`tab ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          Global Settings
        </button>
      </div>

      <div className="admin-content">
        {(activeTab === 'men' || activeTab === 'women' || activeTab === 'unisex') && (
          <div className="section-tabs">
            <button 
              className={`section-tab ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={() => setActiveSection('hero')}
            >
              Hero Section
            </button>
            <button 
              className={`section-tab ${activeSection === 'features' ? 'active' : ''}`}
              onClick={() => setActiveSection('features')}
            >
              Features
            </button>
            <button 
              className={`section-tab ${activeSection === 'products' ? 'active' : ''}`}
              onClick={() => setActiveSection('products')}
            >
              Products
            </button>
            <button 
              className={`section-tab ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => setActiveSection('about')}
            >
              About
            </button>
          </div>
        )}

        {/* Hero Section */}
        {activeSection === 'hero' && (activeTab === 'men' || activeTab === 'women' || activeTab === 'unisex') && (
          <div className="form-section">
            <h3>Hero Section - {activeTab.toUpperCase()}</h3>
            
            <div className="form-group">
              <label>Hero Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleImageUpload(`${activeTab}.heroImage`, e)}
              />
              {tempContent[activeTab].heroImage && (
                <img src={tempContent[activeTab].heroImage} alt="Hero" className="preview-image" />
              )}
            </div>

            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={tempContent[activeTab].hero.title}
                onChange={(e) => handleInputChange(`${activeTab}.hero.title`, e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Subtitle</label>
              <textarea 
                value={tempContent[activeTab].hero.subtitle}
                onChange={(e) => handleInputChange(`${activeTab}.hero.subtitle`, e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Call to Action Button</label>
              <input 
                type="text" 
                value={tempContent[activeTab].hero.cta}
                onChange={(e) => handleInputChange(`${activeTab}.hero.cta`, e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Features Section */}
        {activeSection === 'features' && (activeTab === 'men' || activeTab === 'women' || activeTab === 'unisex') && (
          <div className="form-section">
            <div className="section-header">
              <h3>Features - {activeTab.toUpperCase()}</h3>
              <button onClick={() => handleAddFeature(activeTab)} className="btn-add" disabled={saving}>
                Add Feature
              </button>
            </div>
            
            {tempContent[activeTab].features.map((feature, index) => (
              <div key={feature.id || index} className="item-group">
                <div className="item-header">
                  <h4>Feature {index + 1}</h4>
                  <div className="item-actions">
                    <button 
                      onClick={() => handleFeatureSaveManual(activeTab, index)} 
                      className="btn-save-item"
                      disabled={saving}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleDeleteFeature(activeTab, index)} 
                      className="btn-remove"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    value={feature.title}
                    onChange={(e) => handleArrayChange(`${activeTab}.features`, index, 'title', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={feature.desc}
                    onChange={(e) => handleArrayChange(`${activeTab}.features`, index, 'desc', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Section */}
        {activeSection === 'products' && (activeTab === 'men' || activeTab === 'women' || activeTab === 'unisex') && (
          <div className="form-section">
            <div className="section-header">
              <h3>Products - {activeTab.toUpperCase()}</h3>
              <button onClick={() => handleAddProduct(activeTab)} className="btn-add" disabled={saving}>
                Add Product
              </button>
            </div>
            
            {tempContent[activeTab].products.map((product, index) => (
              <div key={product.id || index} className="item-group">
                <div className="item-header">
                  <h4>Product {index + 1}</h4>
                  <div className="item-actions">
                    <button 
                      onClick={() => handleProductSave(activeTab, index)} 
                      className="btn-save-item"
                      disabled={saving}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(activeTab, index)} 
                      className="btn-remove"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(`${activeTab}.products.${index}.image`, e)}
                    disabled={saving}
                  />
                  {product.image && (
                    <img src={product.image} alt="Product" className="preview-image-small" />
                  )}
                </div>
                
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={product.name}
                    onChange={(e) => handleArrayChange(`${activeTab}.products`, index, 'name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Price</label>
                  <input 
                    type="text" 
                    value={product.price}
                    onChange={(e) => handleArrayChange(`${activeTab}.products`, index, 'price', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <input 
                    type="text" 
                    value={product.notes}
                    onChange={(e) => handleArrayChange(`${activeTab}.products`, index, 'notes', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={product.isFeatured || false}
                      onChange={(e) => handleArrayChange(`${activeTab}.products`, index, 'isFeatured', e.target.checked)}
                    />
                    <span className="checkbox-text">Featured Product</span>
                    <span className="checkbox-note">(Max 6 featured products per mode)</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (activeTab === 'men' || activeTab === 'women' || activeTab === 'unisex') && (
          <div className="form-section">
            <h3>About Section - {activeTab.toUpperCase()}</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={tempContent[activeTab].about.title}
                onChange={(e) => handleInputChange(`${activeTab}.about.title`, e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={tempContent[activeTab].about.description}
                onChange={(e) => handleInputChange(`${activeTab}.about.description`, e.target.value)}
                rows="4"
              />
            </div>
          </div>
        )}

        {/* Global Settings */}
        {activeTab === 'global' && (
          <div className="form-section">
            <h3>Global Settings</h3>
            
            <div className="form-group">
              <label>Brand Name</label>
              <input 
                type="text" 
                value={tempContent.global.brandName}
                onChange={(e) => handleInputChange('global.brandName', e.target.value)}
              />
            </div>

            <h4>Newsletter Section</h4>
            <div className="form-group">
              <label>Newsletter Title</label>
              <input 
                type="text" 
                value={tempContent.global.newsletter.title}
                onChange={(e) => handleInputChange('global.newsletter.title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Newsletter Subtitle</label>
              <input 
                type="text" 
                value={tempContent.global.newsletter.subtitle}
                onChange={(e) => handleInputChange('global.newsletter.subtitle', e.target.value)}
              />
            </div>

            <h4>Footer</h4>
            <div className="form-group">
              <label>Footer Description</label>
              <textarea 
                value={tempContent.global.footer.description}
                onChange={(e) => handleInputChange('global.footer.description', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;