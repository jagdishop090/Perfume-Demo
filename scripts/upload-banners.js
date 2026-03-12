// Script to upload banner images to Supabase storage
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function uploadBannerImages() {
  console.log('🚀 Starting banner image upload to Supabase...');
  
  const bannerFiles = [
    { local: 'public/Banners/banner-1.jpg', remote: 'banners/banner-1.jpg' },
    { local: 'public/Banners/banner-2.jpg', remote: 'banners/banner-2.jpg' },
    { local: 'public/Banners/banner-3.jpg', remote: 'banners/banner-3.jpg' }
  ];

  const uploadedUrls = [];

  for (const banner of bannerFiles) {
    try {
      console.log(`📤 Uploading ${banner.local}...`);
      
      // Read the file
      const filePath = path.join(process.cwd(), banner.local);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('perfume-images')
        .upload(banner.remote, fileBuffer, {
          cacheControl: '3600',
          upsert: true, // Replace if exists
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error(`❌ Failed to upload ${banner.local}:`, error);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('perfume-images')
        .getPublicUrl(banner.remote);

      console.log(`✅ Uploaded ${banner.local} → ${publicUrl}`);
      uploadedUrls.push({
        file: banner.local,
        url: publicUrl
      });

    } catch (err) {
      console.error(`❌ Error uploading ${banner.local}:`, err.message);
    }
  }

  console.log('\n🎉 Upload complete!');
  console.log('📋 Uploaded URLs:');
  uploadedUrls.forEach(item => {
    console.log(`   ${item.file} → ${item.url}`);
  });

  // Generate the banner configuration for App.js
  console.log('\n📝 Use these URLs in your App.js:');
  console.log('const bannerUrls = [');
  uploadedUrls.forEach((item, index) => {
    console.log(`  "${item.url}"${index < uploadedUrls.length - 1 ? ',' : ''}`);
  });
  console.log('];');

  return uploadedUrls;
}

// Run the upload
uploadBannerImages()
  .then(() => {
    console.log('\n✅ All done! Banner images are now available on Supabase CDN.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  });