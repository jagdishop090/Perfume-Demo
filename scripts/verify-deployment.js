// Deployment Verification Script
const https = require('https');

const VERCEL_URL = process.argv[2] || 'your-vercel-app.vercel.app';

function checkDeployment(url) {
  console.log(`🔍 Checking deployment at: ${url}`);
  
  const options = {
    hostname: url,
    port: 443,
    path: '/',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`📅 Last-Modified: ${res.headers['last-modified']}`);
    console.log(`🏷️  ETag: ${res.headers.etag}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // Check for key elements that indicate new deployment
      const hasModernDesign = data.includes('Modern Admin Panel') || data.includes('essence-perfume');
      const hasSupabase = data.includes('supabase');
      
      console.log(`🎨 Modern Design: ${hasModernDesign ? '✅' : '❌'}`);
      console.log(`🗄️  Supabase Integration: ${hasSupabase ? '✅' : '❌'}`);
      
      if (hasModernDesign && hasSupabase) {
        console.log('🎉 Deployment appears to be working correctly!');
      } else {
        console.log('⚠️  Deployment may be using cached version');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
  });

  req.end();
}

if (process.argv.length < 3) {
  console.log('Usage: node verify-deployment.js your-vercel-url.vercel.app');
  process.exit(1);
}

checkDeployment(VERCEL_URL);