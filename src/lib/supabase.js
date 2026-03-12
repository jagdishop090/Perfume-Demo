import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../config/supabase.config'

// Try to get from environment variables first, then fallback to config
let supabaseUrl = process.env.REACT_APP_SUPABASE_URL
let supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// If environment variables are not available, use the config file
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.log('Using backup Supabase configuration')
  supabaseUrl = supabaseConfig.url
  supabaseAnonKey = supabaseConfig.anonKey
} else {
  console.log('Using environment variables for Supabase configuration')
}

// Debug logging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase configuration. Please check your .env file or config.')
}

if (!supabaseUrl.startsWith('http')) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Must start with http:// or https://`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
})

// Helper functions for admin authentication
export const adminAuth = {
  // Sign in admin user
  async signIn(username, password) {
    try {
      // First, get the admin user by username
      const { data: adminUser, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (userError || !adminUser) {
        throw new Error('Invalid username or password')
      }

      // For now, we'll do a simple password check
      // In production, you should hash passwords properly on the server side
      if (password !== adminUser.password_hash) {
        throw new Error('Invalid username or password')
      }

      // Create session token
      const sessionToken = generateSessionToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Save session
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          session_token: sessionToken,
          admin_id: adminUser.id,
          expires_at: expiresAt.toISOString()
        })

      if (sessionError) {
        throw new Error('Failed to create session')
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id)

      // Store session token in localStorage
      localStorage.setItem('admin_session_token', sessionToken)

      return {
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email
        },
        sessionToken
      }
    } catch (error) {
      throw error
    }
  },

  // Sign out admin user
  async signOut() {
    try {
      const sessionToken = localStorage.getItem('admin_session_token')
      if (sessionToken) {
        // Delete session from database
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('session_token', sessionToken)
      }
      
      // Remove from localStorage
      localStorage.removeItem('admin_session_token')
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      // Still remove from localStorage even if database deletion fails
      localStorage.removeItem('admin_session_token')
      return { success: true }
    }
  },

  // Verify current session
  async verifySession() {
    try {
      const sessionToken = localStorage.getItem('admin_session_token')
      if (!sessionToken) {
        return null
      }

      // Check if session exists and is valid
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select(`
          *,
          admin_users (
            id,
            username,
            email,
            is_active
          )
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !session || !session.admin_users.is_active) {
        // Invalid session, clean up
        localStorage.removeItem('admin_session_token')
        return null
      }

      return {
        user: {
          id: session.admin_users.id,
          username: session.admin_users.username,
          email: session.admin_users.email
        },
        sessionToken
      }
    } catch (error) {
      console.error('Session verification error:', error)
      localStorage.removeItem('admin_session_token')
      return null
    }
  }
}

// Generate random session token
function generateSessionToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Image upload helper - Using Supabase Storage
export const uploadImage = async (file, folder = 'general') => {
  try {
    console.log('Uploading image to Supabase storage:', file.name, file.size);
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('perfume-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      
      // If storage fails, provide helpful error message
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        throw new Error('Storage bucket not configured. Please create "perfume-images" bucket in Supabase dashboard with public access.');
      } else if (error.message.includes('policy') || error.statusCode === '403') {
        throw new Error('Storage permissions error. Please check RLS policies for the storage bucket.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('perfume-images')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

export default supabase