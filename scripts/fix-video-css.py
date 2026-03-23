with open('src/App.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 964-976 (index 963-975)
new_block = '''/* VIDEO SECTION */
.video-section {
  padding: 2rem 2rem;
  background: #F1EDE6;
}

.video-container {
  position: relative;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  display: block;
}

.brand-video {
  width: 100%;
  max-height: 80vh;
  object-fit: cover;
  display: block;
  border-radius: 20px;
}

.video-overlay-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%);
  padding: 2rem;
  pointer-events: none;
}

.video-eyebrow {
  display: block;
  font-size: 0.72rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #CBAD8D;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-family: 'Inter', sans-serif;
}

.video-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  color: #fff;
  line-height: 1.2;
  margin: 0 0 0.75rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
}

.video-sub {
  font-size: clamp(0.88rem, 1.2vw, 1.05rem);
  color: rgba(255,255,255,0.75);
  margin: 0;
  font-style: italic;
  font-family: 'Playfair Display', serif;
}

'''

lines[963:976] = [new_block]

with open('src/App.css', 'w', encoding='utf-8', newline='') as f:
    f.writelines(lines)

print('Done')
