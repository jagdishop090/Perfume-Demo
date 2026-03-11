const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'essence-admin-secret-key-2024';

// In-memory session storage (resets on server restart)
const activeSessions = new Map();

class AuthMiddleware {
  constructor(database) {
    this.db = database;
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT token
  generateToken(adminId, username) {
    return jwt.sign(
      { adminId, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Generate session token
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create admin user
  async createAdmin(username, password, email) {
    try {
      const hashedPassword = await this.hashPassword(password);
      
      return new Promise((resolve, reject) => {
        this.db.db.run(
          'INSERT INTO admin_users (username, password_hash, email) VALUES (?, ?, ?)',
          [username, hashedPassword, email],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, username, email });
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Authenticate admin
  async authenticateAdmin(username, password) {
    try {
      return new Promise((resolve, reject) => {
        this.db.db.get(
          'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
          [username],
          async (err, admin) => {
            if (err) {
              reject(err);
              return;
            }

            if (!admin) {
              resolve(null);
              return;
            }

            const isValidPassword = await this.verifyPassword(password, admin.password_hash);
            
            if (isValidPassword) {
              // Update last login
              this.db.db.run(
                'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [admin.id]
              );
              
              resolve({
                id: admin.id,
                username: admin.username,
                email: admin.email
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Create session
  async createSession(adminId) {
    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION);

      return new Promise((resolve, reject) => {
        this.db.db.run(
          'INSERT INTO admin_sessions (session_token, admin_id, expires_at) VALUES (?, ?, ?)',
          [sessionToken, adminId, expiresAt.toISOString()],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ sessionToken, expiresAt });
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Validate session
  async validateSession(sessionToken) {
    try {
      return new Promise((resolve, reject) => {
        this.db.db.get(
          `SELECT s.*, u.username, u.email 
           FROM admin_sessions s 
           JOIN admin_users u ON s.admin_id = u.id 
           WHERE s.session_token = ? AND s.expires_at > datetime('now') AND u.is_active = 1`,
          [sessionToken],
          (err, session) => {
            if (err) {
              reject(err);
            } else {
              resolve(session);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete session (logout)
  async deleteSession(sessionToken) {
    try {
      return new Promise((resolve, reject) => {
        this.db.db.run(
          'DELETE FROM admin_sessions WHERE session_token = ?',
          [sessionToken],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Clean expired sessions
  async cleanExpiredSessions() {
    try {
      return new Promise((resolve, reject) => {
        this.db.db.run(
          'DELETE FROM admin_sessions WHERE expires_at <= datetime(\'now\')',
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Middleware function to protect admin routes
  requireAuth() {
    return async (req, res, next) => {
      try {
        console.log('Auth middleware - checking authorization');
        console.log('Headers:', req.headers.authorization);
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          console.log('No token provided');
          return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
          });
        }

        console.log('Token received:', token.substring(0, 10) + '...');

        // Check in-memory sessions
        const sessions = global.adminSessions || new Map();
        console.log('Active sessions count:', sessions.size);
        
        const session = sessions.get(token);
        
        if (!session) {
          console.log('Invalid session for token');
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired session.' 
          });
        }

        console.log('Valid session found for user:', session.username);

        // Add admin info to request
        req.admin = {
          id: session.adminId,
          username: session.username,
          email: session.email
        };

        next();
      } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Authentication error.' 
        });
      }
    };
  }

  // Initialize default admin if not exists
  async initializeDefaultAdmin() {
    try {
      return new Promise((resolve, reject) => {
        this.db.db.get(
          'SELECT COUNT(*) as count FROM admin_users',
          async (err, result) => {
            if (err) {
              reject(err);
              return;
            }

            if (result.count === 0) {
              try {
                // Create admin with proper bcrypt hash
                const hashedPassword = await this.hashPassword('admin123');
                
                this.db.db.run(
                  'INSERT INTO admin_users (username, password_hash, email, is_active) VALUES (?, ?, ?, ?)',
                  ['admin', hashedPassword, 'admin@essence.com', 1],
                  function(err) {
                    if (err) {
                      console.log('ℹ️  Default admin creation failed:', err.message);
                      resolve(null);
                    } else {
                      console.log('✅ Default admin created: admin');
                      resolve({ id: this.lastID, username: 'admin' });
                    }
                  }
                );
              } catch (createError) {
                console.log('ℹ️  Default admin creation error:', createError.message);
                resolve(null);
              }
            } else {
              console.log('ℹ️  Admin users already exist');
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  }
}

module.exports = AuthMiddleware;