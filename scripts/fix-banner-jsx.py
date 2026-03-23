with open('src/App.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the banner-content-wrapper block (line 757, index 756)
# Replace lines 757-808 (the inner slide content)
start = None
end = None
for i, line in enumerate(lines):
    if 'className="banner-content-wrapper"' in line:
        start = i
    if start and 'className="banner-text-section"' in line:
        # find the closing </div> of banner-text-section
        depth = 0
        for j in range(i, len(lines)):
            depth += lines[j].count('<div') - lines[j].count('</div>')
            if depth <= 0 and j > i:
                end = j
                break
        break

print(f'Replacing lines {start+1} to {end+1}')

new_jsx = '''              <div className="banner-content-wrapper">

                {/* Left vertical label */}
                <div className="banner-left-panel">
                  <span className="banner-left-tag">{banner.tag}</span>
                  <span className="banner-left-brand">ESSENCE</span>
                  <span className="banner-left-year">2025</span>
                </div>

                {/* Image */}
                <div
                  className="banner-image-section"
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
                >
                  <img
                    src={banner.primary}
                    alt={banner.alt}
                    className="banner-image"
                    draggable={false}
                    onError={(e) => {
                      if (banner.fallback && e.target.src !== banner.fallback) {
                        e.target.src = banner.fallback;
                      } else if (banner.fallback2 && e.target.src !== banner.fallback2) {
                        e.target.src = banner.fallback2;
                      } else if (banner.placeholder && e.target.src !== banner.placeholder) {
                        e.target.src = banner.placeholder;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>

                {/* Right text panel */}
                <div className="banner-text-section">
                  <div className="banner-text-content">
                    <span className="banner-eyebrow">{banner.eyebrow}</span>
                    <h1 className="banner-title">
                      {banner.title.split('\\n').map((line, i) => (
                        <span key={i}>{line}{i < banner.title.split('\\n').length - 1 && <br/>}</span>
                      ))}
                    </h1>
                    <p className="banner-slogan">
                      {banner.slogan.split('\\n').map((line, i) => (
                        <span key={i}>{line}{i < banner.slogan.split('\\n').length - 1 && <br/>}</span>
                      ))}
                    </p>
                    <p className="banner-description">{banner.description}</p>
                    <button className="banner-cta" onClick={() => navigate('/products')}>{banner.cta}</button>
                  </div>
                </div>

'''

lines[start:end+1] = [new_jsx]

with open('src/App.js', 'w', encoding='utf-8', newline='') as f:
    f.writelines(lines)

print('Done')
