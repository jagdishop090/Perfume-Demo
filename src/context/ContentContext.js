import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = window.adminToken;
  console.log('Getting auth headers, token:', token ? 'present' : 'missing');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({
    men: {
      hero: { title: "", subtitle: "", cta: "" },
      features: [],
      products: [],
      featuredProducts: [],
      about: { title: "", description: "" },
      heroImage: ""
    },
    women: {
      hero: { title: "", subtitle: "", cta: "" },
      features: [],
      products: [],
      featuredProducts: [],
      about: { title: "", description: "" },
      heroImage: ""
    },
    unisex: {
      hero: { title: "", subtitle: "", cta: "" },
      features: [],
      products: [],
      featuredProducts: [],
      about: { title: "", description: "" },
      heroImage: ""
    },
    global: {
      brandName: "ESSENCE",
      newsletter: { title: "", subtitle: "" },
      footer: { description: "", quickLinks: [], customerCare: [], socialLinks: [] }
    }
  });

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const initSocket = () => {
      try {
        const newSocket = io('http://localhost:5000', {
          timeout: 5000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
          console.log('Socket.IO connected');
          setConnectionError(false);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket.IO disconnected');
        });

        newSocket.on('connect_error', (error) => {
          console.log('Socket.IO connection error:', error);
          setConnectionError(true);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
        setConnectionError(true);
      }
    };

    const cleanup = initSocket();
    return cleanup;
  }, []);

  // Fetch initial content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching content from:', `${API_BASE_URL}/content`);
        
        const response = await axios.get(`${API_BASE_URL}/content`, {
          timeout: 10000
        });
        console.log('Content fetched successfully:', response.data);
        console.log('Men featured products:', response.data.men?.featuredProducts?.length);
        console.log('Women featured products:', response.data.women?.featuredProducts?.length);
        console.log('Unisex featured products:', response.data.unisex?.featuredProducts?.length);
        setContent(response.data);
        setLoading(false);
        setConnectionError(false);
      } catch (error) {
        console.error('Error fetching content:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Only set connection error if it's a network issue, not a data issue
        if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || !error.response) {
          setConnectionError(true);
        } else {
          setConnectionError(false);
        }
        
        setLoading(false);
        
        // Use fallback content if server is not available
        setContent({
          men: {
            hero: { 
              title: "SOPHISTICATED MASCULINITY", 
              subtitle: "Discover fragrances that define your presence", 
              cta: "EXPLORE MEN'S COLLECTION" 
            },
            features: [
              { title: "BOLD & CONFIDENT", desc: "Powerful scents for the modern man" },
              { title: "WOODY & SPICY", desc: "Rich compositions with depth" },
              { title: "DAY TO NIGHT", desc: "Versatile fragrances for every occasion" }
            ],
            products: [
              { name: "NOIR INTENSE", price: "$120", notes: "Bergamot, Cedar, Amber", image: "", isFeatured: true },
              { name: "ROYAL OUD", price: "$180", notes: "Oud, Rose, Saffron", image: "", isFeatured: true },
              { name: "MIDNIGHT", price: "$95", notes: "Lavender, Vetiver, Musk", image: "", isFeatured: true }
            ],
            featuredProducts: [
              { name: "NOIR INTENSE", price: "$120", notes: "Bergamot, Cedar, Amber", image: "", isFeatured: true },
              { name: "ROYAL OUD", price: "$180", notes: "Oud, Rose, Saffron", image: "", isFeatured: true },
              { name: "MIDNIGHT", price: "$95", notes: "Lavender, Vetiver, Musk", image: "", isFeatured: true }
            ],
            about: { 
              title: "CRAFTED FOR THE MODERN GENTLEMAN", 
              description: "Our men's collection embodies strength, sophistication, and timeless appeal." 
            },
            heroImage: ""
          },
          women: {
            hero: { 
              title: "DIVINE FEMININITY", 
              subtitle: "Embrace your enchanting essence with luxurious fragrances", 
              cta: "DISCOVER WOMEN'S COLLECTION" 
            },
            features: [
              { title: "FLORAL ROMANCE", desc: "Delicate petals and romantic blooms" },
              { title: "ELEGANT GRACE", desc: "Sophisticated scents for refined women" },
              { title: "ENCHANTING AURA", desc: "Captivating fragrances that inspire" }
            ],
            products: [
              { name: "ROSE GARDEN", price: "$135", notes: "Rose Petals, Peony, White Musk", image: "", isFeatured: true },
              { name: "CHERRY BLOSSOM", price: "$110", notes: "Sakura, Jasmine, Vanilla", image: "", isFeatured: true },
              { name: "PINK DIAMOND", price: "$165", notes: "Pink Pepper, Magnolia, Amber", image: "", isFeatured: true }
            ],
            featuredProducts: [
              { name: "ROSE GARDEN", price: "$135", notes: "Rose Petals, Peony, White Musk", image: "", isFeatured: true },
              { name: "CHERRY BLOSSOM", price: "$110", notes: "Sakura, Jasmine, Vanilla", image: "", isFeatured: true },
              { name: "PINK DIAMOND", price: "$165", notes: "Pink Pepper, Magnolia, Amber", image: "", isFeatured: true }
            ],
            about: { 
              title: "DESIGNED FOR THE ELEGANT WOMAN", 
              description: "Our women's collection celebrates femininity, grace, and inner beauty." 
            },
            heroImage: ""
          },
          unisex: {
            hero: { 
              title: "UNIVERSAL ELEGANCE", 
              subtitle: "Timeless fragrances that transcend boundaries", 
              cta: "EXPLORE UNISEX COLLECTION" 
            },
            features: [
              { title: "GENDER-FREE LUXURY", desc: "Sophisticated scents for everyone" },
              { title: "BALANCED HARMONY", desc: "Perfect blend of masculine and feminine notes" },
              { title: "TIMELESS APPEAL", desc: "Classic fragrances that never go out of style" }
            ],
            products: [
              { name: "PURE ESSENCE", price: "$145", notes: "Bergamot, White Tea, Cedar", image: "", isFeatured: true },
              { name: "HARMONY", price: "$125", notes: "Citrus, Lavender, Sandalwood", image: "", isFeatured: true },
              { name: "ETERNAL", price: "$155", notes: "Neroli, Jasmine, Amber", image: "", isFeatured: true }
            ],
            featuredProducts: [
              { name: "PURE ESSENCE", price: "$145", notes: "Bergamot, White Tea, Cedar", image: "", isFeatured: true },
              { name: "HARMONY", price: "$125", notes: "Citrus, Lavender, Sandalwood", image: "", isFeatured: true },
              { name: "ETERNAL", price: "$155", notes: "Neroli, Jasmine, Amber", image: "", isFeatured: true }
            ],
            about: { 
              title: "CREATED FOR EVERYONE", 
              description: "Our unisex collection breaks traditional boundaries, offering sophisticated fragrances that celebrate individuality." 
            },
            heroImage: ""
          },
          global: {
            brandName: "ESSENCE",
            newsletter: { 
              title: "STAY IN THE SCENT", 
              subtitle: "Be the first to discover new fragrances and exclusive offers" 
            },
            footer: { 
              description: "Crafting premium fragrances for the discerning individual since 2009.",
              quickLinks: ["Collection", "About Us", "Contact", "Shipping"],
              customerCare: ["Size Guide", "Returns", "FAQ", "Support"],
              socialLinks: ["Instagram", "Facebook", "Twitter"]
            }
          }
        });
      }
    };

    fetchContent();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('contentUpdated', (updatedContent) => {
        console.log('Content updated via Socket.IO:', updatedContent);
        setContent(updatedContent);
      });

      return () => {
        socket.off('contentUpdated');
      };
    }
  }, [socket]);

  // API functions with error handling
  const makeApiCall = async (apiCall) => {
    try {
      return await apiCall();
    } catch (error) {
      // Only throw connection error for actual network issues
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Server connection unavailable. Please ensure the backend server is running.');
      }
      throw error;
    }
  };

  const updateGlobalSettings = async (settings) => {
    try {
      await makeApiCall(() => axios.put(`${API_BASE_URL}/global`, settings, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error updating global settings:', error);
      throw error;
    }
  };

  const updateHeroSection = async (mode, heroData) => {
    try {
      console.log('Updating hero section:', mode, heroData);
      await makeApiCall(() => axios.put(`${API_BASE_URL}/hero/${mode}`, heroData, {
        headers: getAuthHeaders()
      }));
      console.log('Hero section updated successfully');
    } catch (error) {
      console.error('Error updating hero section:', error);
      throw error;
    }
  };

  const addFeature = async (mode, featureData) => {
    try {
      await makeApiCall(() => axios.post(`${API_BASE_URL}/features/${mode}`, featureData, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error adding feature:', error);
      throw error;
    }
  };

  const updateFeature = async (id, featureData) => {
    try {
      await makeApiCall(() => axios.put(`${API_BASE_URL}/features/${id}`, featureData, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error updating feature:', error);
      throw error;
    }
  };

  const deleteFeature = async (id) => {
    try {
      await makeApiCall(() => axios.delete(`${API_BASE_URL}/features/${id}`, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  };

  const addProduct = async (mode, productData) => {
    try {
      await makeApiCall(() => axios.post(`${API_BASE_URL}/products/${mode}`, productData, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      await makeApiCall(() => axios.put(`${API_BASE_URL}/products/${id}`, productData, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await makeApiCall(() => axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const updateAboutSection = async (mode, aboutData) => {
    try {
      await makeApiCall(() => axios.put(`${API_BASE_URL}/about/${mode}`, aboutData, {
        headers: getAuthHeaders()
      }));
    } catch (error) {
      console.error('Error updating about section:', error);
      throw error;
    }
  };

  const uploadImage = async (file) => {
    try {
      console.log('Uploading image:', file.name);
      console.log('Auth token available:', !!window.adminToken);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const authHeaders = getAuthHeaders();
      console.log('Auth headers:', authHeaders);
      
      const response = await makeApiCall(() => 
        axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: { 
            ...authHeaders
            // Don't set Content-Type manually for FormData, let axios handle it
          }
        })
      );
      
      console.log('Image upload response:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return (
    <ContentContext.Provider value={{
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
      uploadImage
    }}>
      {children}
    </ContentContext.Provider>
  );
};