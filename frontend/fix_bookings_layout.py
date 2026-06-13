import re

file_path = '/home/manish/Projects/odooo/frontend/src/pages/POS/components/POSBookingsManagement.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add 'width: "100%", boxSizing: "border-box", ' to style objects in the form that have 'padding: "10px 12px"'
content = re.sub(
    r"style=\{\{\s*padding: '10px 12px',",
    r"style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',",
    content
)

with open(file_path, 'w') as f:
    f.write(content)

print("Layout updates successful.")
