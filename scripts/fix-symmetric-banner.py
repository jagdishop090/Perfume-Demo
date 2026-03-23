with open('src/App.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find start: banner-content-wrapper line (757, index 756)
# Find end: closing </div> of banner-content-wrapper
start_idx = None
for i, line in enumerate(lines):
    if 'className="banner-content-wrapper"' in line:
        start_idx = i
        break

# Find the matching closing </div>
depth = 0
end_idx = start_idx
for i in range(start_idx, len(lines)):
    depth += lines[i].count('<div') + lines[i].count('<section') - lines[i].count('</div>') - lines[i].count('</section>')
    if depth <= 0 and i > start_idx:
        end_idx = i
        break

print(f'Replacing lines {start_idx+1} to {end_idx+1}')

new_jsx = '''              <div className="banner-content-wrapper">

                {/* LEFT PANEL */}
                <div className="banner-side-panel banner-left">
                  <span className="bsp-eyebrow">{banner.eyebrow}</span>
                  <h2 className="bsp-title">
                    {banner.title.split('\\n').map((l, i) => (
                      <span key={i}>{l}{i < banner.title.split('\\n').length - 1 && <br/>}</span>
                    ))}
                  </h2>
                  <div className="bsp-divider" />
                  <p className="bsp-slogan">{banner.slogan.replace('\\n', ' ')}</p>
                </div>

                {/* CENTER IMAGE */}
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

                {/* RIGHT PANEL */}
                <div className="banner-side-panel banner-right">
                  <p className="bsp-desc">{banner.description}</p>
                  <div className="bsp-divider" />
                  <button className="bsp-cta" onClick={() => navigate('/products')}>{banner.cta}</button>
                  <span className="bsp-tag">{banner.tag}</span>
                </div>

              </div>
'''

lines[start_idx:end_idx+1] = [new_jsx]

with open('src/App.js', 'w', encoding='utf-8', newline='') as f:
    f.writelines(lines)

print('JSX done')
