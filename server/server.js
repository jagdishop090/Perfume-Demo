const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const Database = require('./database/database');
const AuthMiddleware = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Initialize database and auth
const db = new Database();
const auth = new AuthMiddleware(db);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Broadcast content updates to all connected clients
const broadcastUpdate = (eventName, data) => {
  io.emit(eventName, data);
};

// API Routes

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    console.log('Authenticating user:', username);
    const admin = await auth.authenticateAdmin(username, password);
    
    if (!admin) {
      console.log('Authentication failed for:', username);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    console.log('Authentication successful for:', username);
    
    // Generate a simple session token for this login session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated token:', sessionToken.substring(0, 10) + '...');
    
    // Store in memory (will be lost on server restart or page refresh)
    global.adminSessions = global.adminSessions || new Map();
    global.adminSessions.set(sessionToken, {
      adminId: admin.id,
      username: admin.username,
      email: admin.email,
      loginTime: Date.now()
    });
    
    console.log('Session stored, total sessions:', global.adminSessions.size);
    
    res.json({
      success: true,
      message: 'Login successful',
      token: sessionToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    // For in-memory auth, just return success
    // Frontend will handle clearing the auth state
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/auth/verify', auth.requireAuth(), (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

// Get all content
app.get('/api/content', async (req, res) => {
  try {
    const content = await db.getAllContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Update global settings
app.put('/api/global', auth.requireAuth(), async (req, res) => {
  try {
    await db.updateGlobalSettings(req.body);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating global settings:', error);
    res.status(500).json({ error: 'Failed to update global settings' });
  }
});

// Update hero section
app.put('/api/hero/:mode', auth.requireAuth(), async (req, res) => {
  try {
    const { mode } = req.params;
    await db.updateHeroSection(mode, req.body);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({ error: 'Failed to update hero section' });
  }
});

// Features routes
app.get('/api/features/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    const features = await db.getFeatures(mode);
    res.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

app.post('/api/features/:mode', auth.requireAuth(), async (req, res) => {
  try {
    const { mode } = req.params;
    const result = await db.addFeature(mode, req.body);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Error adding feature:', error);
    res.status(500).json({ error: 'Failed to add feature' });
  }
});

app.put('/api/features/:id', auth.requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateFeature(id, req.body);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

app.delete('/api/features/:id', auth.requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteFeature(id);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
});

// Products routes
app.get('/api/products/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    const products = await db.getProducts(mode);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:mode/featured', async (req, res) => {
  try {
    const { mode } = req.params;
    const products = await db.getFeaturedProducts(mode);
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

app.post('/api/products/:mode', auth.requireAuth(), async (req, res) => {
  try {
    const { mode } = req.params;
    
    // Check featured products limit if trying to add a featured product
    if (req.body.isFeatured) {
      const featuredCount = await db.getFeaturedProductsCount(mode);
      if (featuredCount >= 6) {
        return res.status(400).json({ error: 'Maximum 6 featured products allowed per mode' });
      }
    }
    
    const result = await db.addProduct(mode, req.body);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/products/:id', auth.requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check featured products limit if trying to make a product featured
    if (req.body.isFeatured) {
      // Get current product to check if it's already featured
      const currentProduct = await new Promise((resolve, reject) => {
        db.db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      // If product is not currently featured, check the limit
      if (currentProduct && !currentProduct.is_featured) {
        const featuredCount = await db.getFeaturedProductsCount(currentProduct.mode);
        if (featuredCount >= 6) {
          return res.status(400).json({ error: 'Maximum 6 featured products allowed per mode' });
        }
      }
    }
    
    await db.updateProduct(id, req.body);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', auth.requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Update about section
app.put('/api/about/:mode', auth.requireAuth(), async (req, res) => {
  try {
    const { mode } = req.params;
    await db.updateAboutSection(mode, req.body);
    const content = await db.getAllContent();
    broadcastUpdate('contentUpdated', content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({ error: 'Failed to update about section' });
  }
});

// File upload endpoint
app.post('/api/upload', auth.requireAuth(), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: `http://localhost:5000${fileUrl}` });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    authentication: 'enabled'
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: SQLite`);
  console.log(`🔄 Real-time updates: Socket.IO`);
  console.log(`📁 File uploads: /uploads`);
  console.log(`🔐 Authentication: Enabled`);
  
  // Initialize default admin
  try {
    await auth.initializeDefaultAdmin();
    // Clean expired sessions on startup
    await auth.cleanExpiredSessions();
  } catch (error) {
    console.error('Error initializing authentication:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});