with open('src/App.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 572-585 (index 571-584) - the banner-text-section block
new_block = '''.banner-text-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem 2.5rem 3rem 2rem;
  background: #1a1210;
  overflow: hidden;
}

'''

lines[571:585] = [new_block]

with open('src/App.css', 'w', encoding='utf-8', newline='') as f:
    f.writelines(lines)

print('Done')
