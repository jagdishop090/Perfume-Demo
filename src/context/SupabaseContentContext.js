import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, uploadImage as supabaseUploadImage } from '../lib/supabase';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({
    global: {
      brandName: 'ESSENCE',
      newsletter: {
        title: 'STAY IN THE SCENT',
        subtitle: 'Be the first to discover new fragrances and exclusive offers'
      },
      footer: {
        description: 'Crafting premium fragrances for the discerning individual since 2009.',
        quickLinks: [],
        customerCare: [],
        socialLinks: []
      }
    },
    men: {
      hero: { title: '', subtitle: '', cta: '' },
      heroImage: '',
      features: [],
      products: [],
      featuredProducts: [],
      about: { title: '', description: '' }
    },
    women: {
      hero: { title: '', subtitle: '', cta: '' },
      heroImage: '',
      features: [],
      products: [],
      featuredProducts: [],
      about: { title: '', description: '' }
    },
    unisex: {
      hero: { title: '', subtitle: '', cta: '' },
      heroImage: '',
      features: [],
      products: [],
      featuredProducts: [],
      about: { title: '', description: '' }
    }
  });

  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Fetch all content from Supabase
  const fetchContent = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      console.log('Fetching content from Supabase...');

      // Fetch global settings
      const { data: globalData, error: globalError } = await supabase
        .from('global_settings')
        .select('*')
        .limit(1)
        .single();

      console.log('Global data:', globalData, 'Error:', globalError);

      // Fetch hero sections
      const { data: heroData, error: heroError } = await supabase
        .from('hero_sections')
        .select('*');

      console.log('Hero data:', heroData, 'Error:', heroError);

      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*')
        .order('sort_order');

      console.log('Features data:', featuresData, 'Error:', featuresError);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('sort_order');

      console.log('Products data:', productsData, 'Error:', productsError);

      // Fetch about sections
      const { data: aboutData, error: aboutError } = await supabase
        .from('about_sections')
        .select('*');

      console.log('About data:', aboutData, 'Error:', aboutError);

      // Fetch footer links
      const { data: footerData, error: footerError } = await supabase
        .from('footer_links')
        .select('*')
        .order('sort_order');

      console.log('Footer data:', footerData, 'Error:', footerError);

      if (globalError || heroError || featuresError || productsError || aboutError || footerError) {
        console.error('Database errors:', { globalError, heroError, featuresError, productsError, aboutError, footerError });
        throw new Error('Failed to fetch content');
      }

      // Transform data to match expected structure
      const newContent = {
        global: {
          brandName: globalData?.brand_name || 'ESSENCE',
          newsletter: {
            title: globalData?.newsletter_title || 'STAY IN THE SCENT',
            subtitle: globalData?.newsletter_subtitle || 'Be the first to discover new fragrances and exclusive offers'
          },
          footer: {
            description: globalData?.footer_description || 'Crafting premium fragrances for the discerning individual since 2009.',
            quickLinks: [],
            customerCare: [],
            socialLinks: []
          }
        },
        men: {
          hero: { title: '', subtitle: '', cta: '' },
          heroImage: '',
          features: [],
          products: [],
          featuredProducts: [],
          about: { title: '', description: '' }
        },
        women: {
          hero: { title: '', subtitle: '', cta: '' },
          heroImage: '',
          features: [],
          products: [],
          featuredProducts: [],
          about: { title: '', description: '' }
        },
        unisex: {
          hero: { title: '', subtitle: '', cta: '' },
          heroImage: '',
          features: [],
          products: [],
          featuredProducts: [],
          about: { title: '', description: '' }
        }
      };

      // Process footer links
      if (footerData) {
        const quickLinks = footerData.filter(link => link.category === 'quick_links').map(link => link.link_text);
        const customerCare = footerData.filter(link => link.category === 'customer_care').map(link => link.link_text);
        const socialLinks = footerData.filter(link => link.category === 'social_links').map(link => link.link_text);
        
        newContent.global.footer.quickLinks = quickLinks;
        newContent.global.footer.customerCare = customerCare;
        newContent.global.footer.socialLinks = socialLinks;
      }

      // Process hero sections
      heroData?.forEach(hero => {
        if (newContent[hero.mode]) {
          newContent[hero.mode].hero = {
            title: hero.title,
            subtitle: hero.subtitle,
            cta: hero.cta_text
          };
          newContent[hero.mode].heroImage = hero.hero_image || '';
        }
      });

      // Process features
      featuresData?.forEach(feature => {
        if (newContent[feature.mode]) {
          newContent[feature.mode].features.push({
            id: feature.id,
            title: feature.title,
            desc: feature.description
          });
        }
      });

      // Process products
      productsData?.forEach(product => {
        if (newContent[product.mode]) {
          const productObj = {
            id: product.id,
            name: product.name,
            price: product.price,
            notes: product.notes,
            image: product.product_image || '',
            images: product.product_images || [],
            isFeatured: product.is_featured
          };
          
          newContent[product.mode].products.push(productObj);
          
          // Add to featured products if featured
          if (product.is_featured) {
            newContent[product.mode].featuredProducts.push(productObj);
          }
        }
      });

      // Process about sections
      aboutData?.forEach(about => {
        if (newContent[about.mode]) {
          newContent[about.mode].about = {
            title: about.title,
            description: about.description
          };
        }
      });

      setContent(newContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setConnectionError(true);
      
      // Use fallback content
      setContent({
        global: {
          brandName: 'ESSENCE',
          newsletter: {
            title: 'STAY IN THE SCENT',
            subtitle: 'Be the first to discover new fragrances and exclusive offers'
          },
          footer: {
            description: 'Crafting premium fragrances for the discerning individual since 2009.',
            quickLinks: ['Collection', 'About Us', 'Contact', 'Shipping'],
            customerCare: ['Size Guide', 'Returns', 'FAQ', 'Support'],
            socialLinks: ['Instagram', 'Facebook', 'Twitter']
          }
        },
        men: {
          hero: { 
            title: 'SOPHISTICATED MASCULINITY', 
            subtitle: 'Discover fragrances that define your presence', 
            cta: 'EXPLORE MEN\'S COLLECTION' 
          },
          heroImage: '',
          features: [
            { id: 1, title: 'BOLD & CONFIDENT', desc: 'Powerful scents for the modern man' },
            { id: 2, title: 'WOODY & SPICY', desc: 'Rich compositions with depth' },
            { id: 3, title: 'DAY TO NIGHT', desc: 'Versatile fragrances for every occasion' }
          ],
          products: [
            { id: 1, name: 'NOIR INTENSE', price: '$120', notes: 'Bergamot, Cedar, Amber', image: '', isFeatured: true },
            { id: 2, name: 'ROYAL OUD', price: '$180', notes: 'Oud, Rose, Saffron', image: '', isFeatured: true },
            { id: 3, name: 'MIDNIGHT', price: '$95', notes: 'Lavender, Vetiver, Musk', image: '', isFeatured: true }
          ],
          featuredProducts: [
            { id: 1, name: 'NOIR INTENSE', price: '$120', notes: 'Bergamot, Cedar, Amber', image: '', isFeatured: true },
            { id: 2, name: 'ROYAL OUD', price: '$180', notes: 'Oud, Rose, Saffron', image: '', isFeatured: true },
            { id: 3, name: 'MIDNIGHT', price: '$95', notes: 'Lavender, Vetiver, Musk', image: '', isFeatured: true }
          ],
          about: { 
            title: 'CRAFTED FOR THE MODERN GENTLEMAN', 
            description: 'Our men\'s collection embodies strength, sophistication, and timeless appeal.' 
          }
        },
        women: {
          hero: { 
            title: 'DIVINE FEMININITY', 
            subtitle: 'Embrace your enchanting essence with luxurious fragrances', 
            cta: 'DISCOVER WOMEN\'S COLLECTION' 
          },
          heroImage: '',
          features: [
            { id: 4, title: 'FLORAL ROMANCE', desc: 'Delicate petals and romantic blooms' },
            { id: 5, title: 'ELEGANT GRACE', desc: 'Sophisticated scents for refined women' },
            { id: 6, title: 'ENCHANTING AURA', desc: 'Captivating fragrances that inspire' }
          ],
          products: [
            { id: 7, name: 'ROSE GARDEN', price: '$135', notes: 'Rose Petals, Peony, White Musk', image: '', isFeatured: true },
            { id: 8, name: 'CHERRY BLOSSOM', price: '$110', notes: 'Sakura, Jasmine, Vanilla', image: '', isFeatured: true },
            { id: 9, name: 'PINK DIAMOND', price: '$165', notes: 'Pink Pepper, Magnolia, Amber', image: '', isFeatured: true }
          ],
          featuredProducts: [
            { id: 7, name: 'ROSE GARDEN', price: '$135', notes: 'Rose Petals, Peony, White Musk', image: '', isFeatured: true },
            { id: 8, name: 'CHERRY BLOSSOM', price: '$110', notes: 'Sakura, Jasmine, Vanilla', image: '', isFeatured: true },
            { id: 9, name: 'PINK DIAMOND', price: '$165', notes: 'Pink Pepper, Magnolia, Amber', image: '', isFeatured: true }
          ],
          about: { 
            title: 'DESIGNED FOR THE ELEGANT WOMAN', 
            description: 'Our women\'s collection celebrates femininity, grace, and inner beauty.' 
          }
        },
        unisex: {
          hero: { 
            title: 'UNIVERSAL ELEGANCE', 
            subtitle: 'Timeless fragrances that transcend boundaries', 
            cta: 'EXPLORE UNISEX COLLECTION' 
          },
          heroImage: '',
          features: [
            { id: 7, title: 'GENDER-FREE LUXURY', desc: 'Sophisticated scents for everyone' },
            { id: 8, title: 'BALANCED HARMONY', desc: 'Perfect blend of masculine and feminine notes' },
            { id: 9, title: 'TIMELESS APPEAL', desc: 'Classic fragrances that never go out of style' }
          ],
          products: [
            { id: 13, name: 'PURE ESSENCE', price: '$145', notes: 'Bergamot, White Tea, Cedar', image: '', isFeatured: true },
            { id: 14, name: 'HARMONY', price: '$125', notes: 'Citrus, Lavender, Sandalwood', image: '', isFeatured: true },
            { id: 15, name: 'ETERNAL', price: '$155', notes: 'Neroli, Jasmine, Amber', image: '', isFeatured: true }
          ],
          featuredProducts: [
            { id: 13, name: 'PURE ESSENCE', price: '$145', notes: 'Bergamot, White Tea, Cedar', image: '', isFeatured: true },
            { id: 14, name: 'HARMONY', price: '$125', notes: 'Citrus, Lavender, Sandalwood', image: '', isFeatured: true },
            { id: 15, name: 'ETERNAL', price: '$155', notes: 'Neroli, Jasmine, Amber', image: '', isFeatured: true }
          ],
          about: { 
            title: 'CREATED FOR EVERYONE', 
            description: 'Our unisex collection breaks traditional boundaries, offering sophisticated fragrances.' 
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Update global settings
  const updateGlobalSettings = async (settings) => {
    try {
      console.log('Updating global settings:', settings);
      
      const { data, error } = await supabase
        .from('global_settings')
        .upsert({
          brand_name: settings.brandName,
          newsletter_title: settings.newsletterTitle,
          newsletter_subtitle: settings.newsletterSubtitle,
          footer_description: settings.footerDescription,
          updated_at: new Date().toISOString()
        })
        .select();

      console.log('Global settings update result:', data, 'Error:', error);

      if (error) throw error;
      await fetchContent();
      return data;
    } catch (error) {
      console.error('Error updating global settings:', error);
      throw error;
    }
  };

  // Update hero section
  const updateHeroSection = async (mode, heroData) => {
    try {
      const { error } = await supabase
        .from('hero_sections')
        .upsert({
          mode,
          title: heroData.title,
          subtitle: heroData.subtitle,
          cta_text: heroData.ctaText,
          hero_image: heroData.heroImage,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchContent();
    } catch (error) {
      console.error('Error updating hero section:', error);
      throw error;
    }
  };

  // Add feature
  const addFeature = async (mode, featureData) => {
    try {
      const { error } = await supabase
        .from('features')
        .insert({
          mode,
          title: featureData.title,
          description: featureData.description,
          sort_order: 0
        });

      if (error) throw error;
      await fetchContent();
    } catch (error) {
      console.error('Error adding feature:', error);
      throw error;
    }
  };

  // Update feature
  const updateFeature = async (id, featureData) => {
    try {
      const { error } = await supabase
        .from('features')
        .update({
          title: featureData.title,
          description: featureData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchContent();
    } catch (error) {
      console.error('Error updating feature:', error);
      throw error;
    }
  };

  // Delete feature
  const deleteFeature = async (id) => {
    try {
      const { error } = await supabase
        .from('features')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchContent();
    } catch (error) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  };

  // Add product
  const addProduct = async (mode, productData) => {
    try {
      console.log('Adding product:', mode, productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          mode,
          name: productData.name,
          price: productData.price,
          notes: productData.notes,
          product_image: productData.productImage || '',
          is_featured: productData.isFeatured || false,
          sort_order: 0
        })
        .select();

      console.log('Insert result:', data, 'Error:', error);

      if (error) throw error;
      await fetchContent();
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id, productData) => {
    try {
      console.log('Updating product:', id, productData);
      
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          price: productData.price,
          notes: productData.notes,
          product_image: productData.productImage || '',
          product_images: productData.productImages || [],
          is_featured: productData.isFeatured || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      console.log('Update result:', data, 'Error:', error);

      if (error) throw error;
      await fetchContent();
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      console.log('Deleting product:', id);
      
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      console.log('Delete result:', data, 'Error:', error);

      if (error) throw error;
      await fetchContent();
      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Update about section
  const updateAboutSection = async (mode, aboutData) => {
    try {
      const { error } = await supabase
        .from('about_sections')
        .upsert({
          mode,
          title: aboutData.title,
          description: aboutData.description,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchContent();
    } catch (error) {
      console.error('Error updating about section:', error);
      throw error;
    }
  };

  // Upload image
  const uploadImage = async (file) => {
    try {
      const imageUrl = await supabaseUploadImage(file, 'products');
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Initialize content on mount
  useEffect(() => {
    fetchContent();
  }, []);

  const value = {
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
    refreshContent: fetchContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};