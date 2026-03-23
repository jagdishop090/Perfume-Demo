with open('src/App.css', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. banner-content-wrapper ─────────────────────────────────────────────────
old = '''.banner-content-wrapper {
  display: grid;
  grid-template-columns: 80px 1fr 340px;
  width: 100%;
  height: 100%;
  position: relative;
}'''
new = '''.banner-content-wrapper {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  width: 100%;
  height: 100%;
}'''
content = content.replace(old, new)

# ── 2. banner-image-section ───────────────────────────────────────────────────
old2 = '''.banner-image-section {
  position: relative;
  overflow: hidden;
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
  width: clamp(280px, 38vw, 520px);
  flex-shrink: 0;
}'''
content = content.replace(old2, new2)

# ── 3. banner-image ───────────────────────────────────────────────────────────
old3 = '''.banner-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
  background: #1a1210;
}'''
new3 = '''.banner-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
  background: #1a1210;
  max-height: 100%;
}'''
content = content.replace(old3, new3)

# ── 4. banner-text-section → replace with banner-side-panel ──────────────────
old4 = '''.banner-text-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem 2.5rem 3rem 2rem;
  background: #1a1210;
  overflow: hidden;
}

'''
new4 = '''.banner-text-section {
  display: none;
}

/* Symmetric side panels */
.banner-side-panel {
  background: #1a1210;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
  gap: 1.5rem;
  text-align: center;
  overflow: hidden;
}

.banner-left {
  border-right: 1px solid rgba(203, 173, 141, 0.15);
}

.banner-right {
  border-left: 1px solid rgba(203, 173, 141, 0.15);
}

.bsp-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #CBAD8D;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.bsp-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 2.8vw, 2.8rem);
  font-weight: 400;
  color: #F1EDE6;
  line-height: 1.2;
  letter-spacing: 1px;
  margin: 0;
}

.bsp-slogan {
  font-size: clamp(0.82rem, 1.1vw, 1rem);
  color: rgba(209, 199, 189, 0.65);
  line-height: 1.7;
  font-style: italic;
  font-family: 'Playfair Display', serif;
  margin: 0;
}

.bsp-desc {
  font-size: clamp(0.78rem, 1vw, 0.92rem);
  color: rgba(209, 199, 189, 0.6);
  line-height: 1.75;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.bsp-divider {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #CBAD8D, transparent);
  flex-shrink: 0;
}

.bsp-cta {
  background: transparent;
  border: 1px solid rgba(203, 173, 141, 0.5);
  color: #CBAD8D;
  padding: 0.75rem 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.bsp-cta:hover {
  background: #CBAD8D;
  color: #1a1210;
  border-color: #CBAD8D;
}

.bsp-tag {
  font-size: 0.65rem;
  letter-spacing: 3px;
  color: rgba(203, 173, 141, 0.35);
  font-family: 'Inter', sans-serif;
  margin-top: auto;
}

'''
content = content.replace(old4, new4)

# ── 5. Remove old left-panel styles (already inserted earlier) ────────────────
# Remove the old banner-left-panel block if it exists
import re
content = re.sub(
    r'/\* Banner left vertical label \*/\n\.banner-left-panel \{[^}]+\}\n\n\.banner-left-tag \{[^}]+\}\n\n\.banner-left-brand \{[^}]+\}\n\n\.banner-left-year \{[^}]+\}\n\n/\* Banner text content \*/\n\.banner-eyebrow \{[^}]+\}\n\n\.banner-slogan \{[^}]+\}\n\n',
    '',
    content,
    flags=re.DOTALL
)

# ── 6. Mobile: hide side panels, image fills full width ──────────────────────
# Update the 968px breakpoint override
content = content.replace(
    '''  .banner-content-wrapper {
    grid-template-columns: 1fr;
  }

  .banner-left-panel {
    display: none;
  }

  .banner-text-section {
    display: none;
  }

}''',
    '''  .banner-content-wrapper {
    grid-template-columns: 1fr;
  }

  .banner-side-panel {
    display: none;
  }

  .banner-image-section {
    width: 100%;
  }

}'''
)

with open('src/App.css', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('CSS done')
