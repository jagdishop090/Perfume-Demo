with open('src/App.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find .hero-banner { block
start = None
for i, line in enumerate(lines):
    if line.strip() == '.hero-banner {':
        start = i
        break

if start is None:
    print('ERROR: .hero-banner { not found')
    exit(1)

# Find closing brace
end = start
depth = 0
for i in range(start, len(lines)):
    depth += lines[i].count('{') - lines[i].count('}')
    if depth == 0:
        end = i
        break

print(f'Replacing lines {start+1} to {end+1}')

new_block = [
    '.hero-banner {\n',
    '  margin-top: 120px; /* BOGO banner (36px) + header (70px) + gap (14px) */\n',
    '  position: relative;\n',
    '  height: calc(100vh - 120px);\n',
    '  min-height: 400px;\n',
    '  max-height: 100vh;\n',
    '  width: 100%;\n',
    '  padding: 0 2rem 2rem 2rem;\n',
    '  box-sizing: border-box;\n',
    '  background: #F1EDE6;\n',
    '  overflow: visible;\n',
    '  transition: margin-top 0.3s ease, height 0.3s ease;\n',
    '}\n',
]

lines[start:end+1] = new_block

with open('src/App.css', 'w', encoding='utf-8', newline='') as f:
    f.writelines(lines)

print('Done')
