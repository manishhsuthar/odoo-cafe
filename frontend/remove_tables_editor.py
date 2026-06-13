file_path = '/home/manish/Projects/odooo/frontend/src/pages/Dashboard/Dashboard.jsx'

with open(file_path, 'r') as f:
    lines = f.readlines()

# Ensure we delete the correct lines. Note that Python lists are 0-indexed.
# Lines 465-766 correspond to indices 464 to 765
# Lines 26-45 correspond to indices 25 to 44

# Delete from bottom to top so indices don't shift for the top deletion
del lines[464:766]
del lines[25:45]

with open(file_path, 'w') as f:
    f.writelines(lines)

print("Floors & Tables Plan Editor section removed successfully.")
