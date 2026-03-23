with open('src/App.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace banner-content-wrapper to use 3-column grid
old = '''.banner-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}'''

new = '''.banner-content-wrapper {
  display: grid;
  grid-template-columns: 80px 1fr 340px;
  width: 100%;
  height: 100%;
  position: relative;
}'''

if old in content:
    content = content.replace(old, new)
    print('banner-content-wrapper OK')
else:
    print('NOT FOUND')

# Update banner-image-section - no longer absolute, it's a grid cell
old2 = '''.banner-image-section {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
  background: #1a1210;
  display: flex;
  align-items: center;
  justify-content: center;
}'''

new2 = '''.banner-image-section {
  position: relative;
  overflow: hidden;
  background: #1a1210;
  display: flex;
  align-items: center;
  justify-content: center;
}'''

if old2 in content:
    content = content.replace(old2, new2)
    print('banner-image-section OK')
else:
    print('banner-image-section NOT FOUND')

# Update banner-text-section - no longer absolute, it's a grid cell
old3 = '''.banner-text-section {
  position: absolute;
  top: 0;
  right: 0;
  width: 45%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 3rem 2rem 3rem;
  background: linear-gradient(to left, rgba(26,18,16,0.98) 60%, rgba(26,18,16,0.0) 100%);
  overflow: hidden;
  z-index: 2;
}'''

new3 = '''.banner-text-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem 3rem 3rem 2.5rem;
  background: #1a1210;
  overflow: hidden;
}'''

if old3 in content:
    content = content.replace(old3, new3)
    print('banner-text-section OK')
else:
    print('banner-text-section NOT FOUND')

# Add left panel styles and update text content styles
# Find banner-text-section::before and insert left panel before it
left_panel_css = '''
/* Banner left vertical label */
.banner-left-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem 0;
  background: #1a1210;
  border-right: 1px solid rgba(203, 173, 141, 0.12);
}

.banner-left-tag {
  font-size: 0.65rem;
  letter-spacing: 2px;
  color: rgba(203, 173, 141, 0.5);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-family: 'Inter', sans-serif;
}

.banner-left-brand {
  font-size: 0.7rem;
  letter-spacing: 4px;
  color: #CBAD8D;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.banner-left-year {
  font-size: 0.65rem;
  letter-spacing: 2px;
  color: rgba(203, 173, 141, 0.4);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-family: 'Inter', sans-serif;
}

/* Banner text content */
.banner-eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #CBAD8D;
  margin-bottom: 1.25rem;
  font-family: 'Inter', sans-serif;
}

.banner-slogan {
  font-size: clamp(0.95rem, 1.3vw, 1.15rem);
  line-height: 1.6;
  color: rgba(209, 199, 189, 0.75);
  margin-bottom: 1.5rem;
  font-style: italic;
  font-family: 'Playfair Display', serif;
}

'''

# Insert before .banner-text-section::before
if '.banner-text-section::before {' in content:
    content = content.replace('.banner-text-section::before {', left_panel_css + '.banner-text-section::before {')
    print('left panel CSS inserted')

# Update banner-title to be bigger and bolder
old_title = '''.banner-title {
  font-size: clamp(1.8rem, 3.5vw, 3.5rem);
  font-weight: 700;'''
new_title = '''.banner-title {
  font-size: clamp(2rem, 3.5vw, 3.8rem);
  font-weight: 800;'''
if old_title in content:
    content = content.replace(old_title, new_title)
    print('banner-title OK')

# Update banner-description
old_desc = '''.banner-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #D1C7BD;
  margin-bottom: 2rem;
  font-weight: 300;
}'''
new_desc = '''.banner-description {
  font-size: clamp(0.82rem, 1vw, 0.95rem);
  line-height: 1.7;
  color: rgba(209, 199, 189, 0.6);
  margin-bottom: 2rem;
  font-weight: 400;
}'''
if old_desc in content:
    content = content.replace(old_desc, new_desc)
    print('banner-description OK')

with open('src/App.css', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('All CSS done')
