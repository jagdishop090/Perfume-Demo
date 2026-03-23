with open('src/App.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix hero-no-bogo
old = '''.hero-no-bogo {
  margin-top: 84px !important; /* When BOGO is closed: header (70px) + gap (14px) */
  height: calc(100vh - 84px) !important;
}'''
new = '''.hero-no-bogo {
  margin-top: 84px !important;
  height: calc(100vh - 84px) !important;
}'''
if old in content:
    content = content.replace(old, new)
    print('hero-no-bogo OK')
else:
    # try without the comment
    old2 = '''.hero-no-bogo {
  margin-top: 84px !important;
  height: calc(100vh - 84px) !important;
}'''
    if old2 in content:
        print('hero-no-bogo already clean')
    else:
        print('hero-no-bogo NOT FOUND - searching...')
        idx = content.find('.hero-no-bogo')
        print(repr(content[idx:idx+120]))

# Fix banner-slider to have border-radius (already done but verify)
if 'border-radius: 20px' in content and '.banner-slider' in content:
    print('banner-slider border-radius OK')

# Fix the mobile hero-banner overrides to keep padding consistent
# 768px breakpoint
old_768 = '''  /* Hero Banner - Compact Mobile View */
  .hero-banner {
    height: calc(100vh - 125px);
    min-height: 320px;
    max-height: 100vh;
    margin-top: 125px; /* BOGO banner (32px) + header (80px) + gap (13px) */
    margin-left: 1rem;
    margin-right: 1rem;
    border-radius: 16px;
    overflow: hidden;
    transition: margin-top 0.3s ease, height 0.3s ease;
  }'''
new_768 = '''  /* Hero Banner - Compact Mobile View */
  .hero-banner {
    height: calc(100vh - 125px);
    min-height: 320px;
    max-height: 100vh;
    margin-top: 125px; /* BOGO banner (32px) + header (80px) + gap (13px) */
    padding: 0 1rem 1rem 1rem;
    transition: margin-top 0.3s ease, height 0.3s ease;
  }'''
if old_768 in content:
    content = content.replace(old_768, new_768)
    print('768px hero-banner OK')
else:
    print('768px hero-banner NOT FOUND')

# 480px breakpoint
old_480 = '''  /* Hero Banner - Optimized for Small Screens */
  .hero-banner {
    height: calc(100vh - 115px);
    min-height: 300px;
    max-height: 100vh;
    margin-top: 115px; /* BOGO banner (28px) + header (75px) + gap (12px) */
    margin-left: 1rem;
    margin-right: 1rem;
    border-radius: 14px;
    transition: margin-top 0.3s ease, height 0.3s ease;
  }'''
new_480 = '''  /* Hero Banner - Optimized for Small Screens */
  .hero-banner {
    height: calc(100vh - 115px);
    min-height: 300px;
    max-height: 100vh;
    margin-top: 115px; /* BOGO banner (28px) + header (75px) + gap (12px) */
    padding: 0 1rem 1rem 1rem;
    transition: margin-top 0.3s ease, height 0.3s ease;
  }'''
if old_480 in content:
    content = content.replace(old_480, new_480)
    print('480px hero-banner OK')
else:
    print('480px hero-banner NOT FOUND')

with open('src/App.css', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('All done')
