# Supabase Setup Guide for Essence Perfume Store

This guide will help you set up Supabase as the database backend for your perfume store admin panel.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. Your React application ready

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `essence-perfume-store`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_ENVIRONMENT=development
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire content from `supabase-schema.sql` file
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (admin_users, global_settings, hero_sections, features, products, about_sections, footer_links)
- Row Level Security policies
- Storage bucket for images
- Default data
- A default admin user (username: `admin`, password: `admin123`)

## Step 5: Set Up Storage

1. In your Supabase dashboard, go to Storage
2. You should see a bucket called `perfume-images` (created by the schema)
3. If not, create it manually:
   - Click "New bucket"
   - Name: `perfume-images`
   - Make it public: ✅
   - Click "Create bucket"

## Step 6: Update Your Application

1. The Supabase client is already installed via `npm install @supabase/supabase-js`
2. The configuration files are already created:
   - `src/lib/supabase.js` - Supabase client and auth functions
   - `src/context/SupabaseContentContext.js` - Content management with Supabase
   - `src/components/SupabaseAdminLogin.js` - Admin login component
   - `src/components/SupabaseAdminPanel.js` - Admin panel component

## Step 7: Switch to Supabase Components

To use the Supabase version, update your main App.js:

```javascript
// Replace the old imports with Supabase versions
import { ContentProvider } from './context/SupabaseContentContext';
import AdminPanel from './components/SupabaseAdminPanel';

// In your routing, use the Supabase AdminPanel
```

## Step 8: Test the Setup

1. Start your React application: `npm start`
2. Navigate to `/admin`
3. Login with:
   - Username: `admin`
   - Password: `admin123`
4. Try creating, editing, and deleting content
5. Upload images to test the storage functionality

## Step 9: Create Additional Admin Users (Optional)

To create more admin users, you can either:

1. **Via SQL Editor:**
```sql
-- Generate password hash for 'newpassword123'
-- You'll need to hash the password using bcrypt with salt rounds 10
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('newadmin', '$2b$10$hashedpasswordhere', 'newadmin@essence.com');
```

2. **Via a registration endpoint** (you can create this later)

## Security Notes

1. **Change the default admin password** immediately after setup
2. **Use strong passwords** for all admin accounts
3. **Enable 2FA** on your Supabase account
4. **Review RLS policies** to ensure they meet your security requirements
5. **Use environment variables** for all sensitive configuration

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error:**
   - Check your `.env` file has the correct SUPABASE_URL and SUPABASE_ANON_KEY
   - Restart your development server after changing .env

2. **"Permission denied" errors:**
   - Ensure RLS policies are set up correctly
   - Check that the schema was executed completely

3. **Image upload fails:**
   - Verify the `perfume-images` bucket exists and is public
   - Check storage policies are correctly set

4. **Login fails:**
   - Ensure the admin_users table has data
   - Check that bcryptjs is installed: `npm install bcryptjs`

### Database Connection Issues:

If you see connection errors:
1. Check your Supabase project is active (not paused)
2. Verify your project URL and API key are correct
3. Check your internet connection
4. Look at the Supabase dashboard for any service issues

## Features Included

✅ **Admin Authentication** - Secure login/logout with session management
✅ **Content Management** - Full CRUD operations for all content
✅ **Image Upload** - Direct upload to Supabase Storage
✅ **Real-time Updates** - Changes reflect immediately
✅ **Responsive Design** - Works on desktop and mobile
✅ **Error Handling** - Graceful fallbacks and error messages
✅ **Security** - Row Level Security and proper authentication

## Next Steps

1. **Customize the admin interface** to match your brand
2. **Add more admin users** as needed
3. **Set up automated backups** in Supabase
4. **Configure custom domain** for your Supabase project
5. **Add email notifications** for admin actions
6. **Implement audit logging** for admin changes

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review the Supabase dashboard logs
3. Refer to Supabase documentation: https://supabase.com/docs
4. Check the React application logs

Your Essence Perfume Store admin panel is now powered by Supabase! 🚀