with open('src/App.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix base hero-no-bogo - add height
content = content.replace(
    '.hero-no-bogo {\n  margin-top: 84px !important; /* When BOGO is closed: header (70px) + gap (14px) */\n}',
    '.hero-no-bogo {\n  margin-top: 84px !important;\n  height: calc(100vh - 84px) !important;\n  padding: 0 2rem 2rem 2rem;\n}'
)

# Fix 768px mobile hero-banner
content = content.replace(
    '''  /* Hero Banner - Compact Mobile View */
  .hero-banner {
    height: 45vh;
    min-height: 350px;
    max-height: 450px;
    margin-top: 125px; /* Increased for larger header: BOGO banner (32px) + header (80px) + gap (13px) */
    margin-left: 1rem;
    margin-right: 1rem;
    border-radius: 16px;
    overflow: hidden;
    transition: margin-top 0.3s ease;
  }

  .hero-no-bogo {
    margin-top: 93px !important; /* When BOGO is closed: header (80px) + gap (13px) */
  }''',
    '''  /* Hero Banner - Compact Mobile View */
  .hero-banner {
    height: calc(100vh - 125px);
    min-height: 320px;
    max-height: 100vh;
    margin-top: 125px;
    padding: 0 1rem 1rem 1rem;
    transition: margin-top 0.3s ease, height 0.3s ease;
  }

  .hero-no-bogo {
    margin-top: 93px !important;
    height: calc(100vh - 93px) !important;
    padding: 0 1rem 1rem 1rem;
  }'''
)

# Fix 480px mobile hero-banner
content = content.replace(
    '''  /* Hero Banner - Optimized for Small Screens */
  .hero-banner {
    height: 40vh;
    min-height: 320px;
    max-height: 400px;
    margin-top: 115px; /* Increased for larger header: BOGO banner (28px) + header (75px) + gap (12px) */
    margin-left: 1rem;
    margin-right: 1rem;
    border-radius: 14px;
    transition: margin-top 0.3s ease;
  }

  .hero-no-bogo {
    margin-top: 87px !important; /* When BOGO is closed: header (75px) + gap (12px) */
  }''',
    '''  /* Hero Banner - Optimized for Small Screens */
  .hero-banner {
    height: calc(100vh - 115px);
    min-height: 300px;
    max-height: 100vh;
    margin-top: 115px;
    padding: 0 1rem 1rem 1rem;
    transition: margin-top 0.3s ease, height 0.3s ease;
  }

  .hero-no-bogo {
    margin-top: 87px !important;
    height: calc(100vh - 87px) !important;
    padding: 0 1rem 1rem 1rem;
  }'''
)

# Remove old banner-image border-radius overrides in mobile (no longer needed - slider handles it)
content = content.replace(
    '  .banner-image {\n    border-radius: 16px;\n  }\n',
    ''
)
content = content.replace(
    '  .banner-image {\n    border-radius: 14px;\n  }\n',
    ''
)
content = content.replace(
    '  .banner-image {\n    border-radius: 12px;\n  }\n',
    ''
)

# Update banner-slider border-radius in mobile breakpoints to match
content = content.replace(
    '  .banner-slider {\n    width: 100%;\n    max-width: 100%;\n    border-radius: 14px;\n  }',
    '  .banner-slider {\n    border-radius: 16px;\n  }'
)

with open('src/App.css', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('Done')
