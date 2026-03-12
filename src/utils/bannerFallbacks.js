// Banner fallback utilities
// This provides base64 placeholder images as ultimate fallback

export const createPlaceholderImage = (width = 800, height = 400, text = 'ESSENCE') => {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3A2D28;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#A48374;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#CBAD8D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" rx="20"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            text-anchor="middle" dominant-baseline="middle" fill="white" opacity="0.9">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const bannerPlaceholders = {
  banner1: createPlaceholderImage(800, 400, 'SIGNATURE'),
  banner2: createPlaceholderImage(800, 400, 'ELEGANCE'), 
  banner3: createPlaceholderImage(800, 400, 'EXCLUSIVE')
};

export const getBannerWithFallbacks = (primaryPath, fallbackPath, placeholderKey) => {
  return {
    primary: primaryPath,
    fallback: fallbackPath,
    placeholder: bannerPlaceholders[placeholderKey]
  };
};