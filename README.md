# 🌸 Essence - Premium Perfume Store

A modern, responsive e-commerce website for premium fragrances with a comprehensive admin panel. Built with React and Supabase.

![Essence Perfume Store](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Mobile Optimized](https://img.shields.io/badge/Mobile-Optimized-orange)

## ✨ Features

### 🛍️ Customer Experience
- **Modern Design**: Elegant nude color palette with premium aesthetics
- **Product Catalog**: Browse men's, women's, and unisex fragrances
- **Advanced Filtering**: Filter products by category with smooth animations
- **Product Details**: Detailed product information with modal views
- **Mobile-First**: Fully responsive design with app-style navigation
- **Contact System**: Integrated contact form and information

### 🔧 Admin Panel
- **Comprehensive Dashboard**: Statistics and quick actions
- **Product Management**: Full CRUD operations for products
- **Image Upload**: Supabase storage integration for product images
- **Featured Products**: Toggle featured status for homepage display
- **Content Management**: Update global settings, newsletter content
- **Banner Management**: Upload and replace hero banner images
- **Mobile Admin**: Fully responsive admin interface

### 🚀 Technical Features
- **Real-time Database**: Supabase PostgreSQL with real-time updates
- **Authentication**: Secure session-based admin authentication
- **Performance**: Lazy loading, code splitting, optimized bundles
- **SEO Optimized**: Meta tags, semantic HTML, accessibility
- **PWA Ready**: Progressive Web App capabilities

## 🎨 Design Highlights

**Color Palette:**
- `#3A2D28` - Dark Brown (Primary)
- `#A48374` - Medium Brown (Secondary)
- `#CBAD8D` - Light Brown (Accent)
- `#D1C7BD` - Light Beige (Background)
- `#EBE3DB` - Very Light Beige (Cards)
- `#F1EDE6` - Off White (Base)

**Typography:**
- Playfair Display (Headings)
- Inter (Body Text)

## 📱 Responsive Design

### Desktop (1024px+)
- Full sidebar navigation
- Multi-column layouts
- Hover effects and animations
- Large product images

### Tablet (768px - 1024px)
- Adaptive layouts
- Touch-optimized controls
- Flexible grid systems

### Mobile (< 768px)
- App-style bottom navigation
- Single-column layouts
- Touch-friendly buttons (44px minimum)
- Optimized image sizes

## 🛠 Tech Stack

**Frontend:**
- React 18.2.0
- React Router 6.8.1
- CSS3 with custom properties
- Responsive Grid & Flexbox

**Backend:**
- Supabase (PostgreSQL)
- Real-time subscriptions
- Row Level Security (RLS)
- File storage

**Development:**
- Create React App
- ES6+ JavaScript
- Modern CSS features
- Performance optimizations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd essence-perfume-store
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Set up Supabase database:**
   ```bash
   # Run the SQL schema in your Supabase dashboard
   # See SUPABASE_SETUP.md for detailed instructions
   ```

5. **Start development server:**
   ```bash
   npm start
   ```

6. **Access the application:**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Login: `admin` / `admin123`

## 📁 Project Structure

```
essence-perfume-store/
├── public/
│   ├── Banners/              # Hero banner images
│   ├── favicon.svg           # Site favicon
│   └── index.html           # HTML template
├── src/
│   ├── components/          # React components
│   │   ├── ModernAdminPanel.js    # Main admin interface
│   │   ├── SupabaseAdminLogin.js  # Admin authentication
│   │   ├── ProductModal.js        # Product detail modal
│   │   └── *.css                  # Component styles
│   ├── context/             # React context providers
│   │   └── SupabaseContentContext.js
│   ├── lib/                 # Utility libraries
│   │   └── supabase.js      # Supabase client
│   ├── config/              # Configuration files
│   ├── App.js               # Main application
│   ├── App.css              # Global styles
│   └── index.js             # Application entry
├── docs/                    # Documentation
│   ├── SUPABASE_SETUP.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── SUPABASE_STORAGE_SETUP.md
└── package.json
```

## 🔐 Admin Panel

### Access
- URL: `/admin`
- Username: `admin`
- Password: `admin123`

### Features
- **Dashboard**: Overview statistics and quick actions
- **Products**: Full CRUD operations with image upload
- **Featured**: Manage homepage featured products
- **Banners**: Upload and replace hero banners
- **Settings**: Global site configuration
- **Newsletter**: Manage newsletter content

### Mobile Admin
- Horizontal scrolling navigation
- Touch-optimized controls
- Responsive table layouts
- Collapsible sections

## 🗄 Database Schema

**Core Tables:**
- `admin_users` - Admin authentication
- `admin_sessions` - Session management
- `products` - Product catalog
- `global_settings` - Site configuration
- `hero_sections` - Homepage banners
- `features` - Feature listings
- `about_sections` - About content
- `footer_links` - Footer navigation

**Storage:**
- `perfume-images` bucket for product and banner images

## 🎯 Performance

**Bundle Sizes (Gzipped):**
- Main Bundle: 107.57 kB
- CSS Bundle: 5.66 kB
- Admin Panel: 5.54 kB (lazy loaded)

**Optimizations:**
- Code splitting and lazy loading
- Image optimization
- CSS minification
- Tree shaking
- Performance monitoring

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Netlify** (Recommended)
- **Vercel**
- **GitHub Pages**
- **Traditional Hosting**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 🧪 Testing

### Development Testing
```bash
npm start
# Test at http://localhost:3000
```

### Production Testing
```bash
npm run build
npm run build:analyze
```

### Manual Testing Checklist
- [ ] Homepage loads and banners work
- [ ] Product filtering and modal
- [ ] Admin login and all CRUD operations
- [ ] Mobile responsiveness
- [ ] Image uploads (requires Supabase setup)

## 📚 Documentation

- **[Supabase Setup](SUPABASE_SETUP.md)** - Database configuration
- **[Storage Setup](SUPABASE_STORAGE_SETUP.md)** - File upload configuration  
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Implementation Summary](SUPABASE_IMPLEMENTATION_SUMMARY.md)** - Technical details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation files
- Review the admin panel at `/admin`
- Test with provided credentials: `admin` / `admin123`

---

**Built with ❤️ for premium fragrance retail**

*Essence - Where sophistication meets technology*