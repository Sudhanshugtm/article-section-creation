import json
import csv
import os

def flatten_dict(d, parent_key='', sep='.'):
    """Flatten nested dictionary into dot notation keys"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

# Read the translations.json file
with open('translations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Extract English and Indonesian translations
en_flat = flatten_dict(data['en'])
id_flat = flatten_dict(data['id'])

# Create CSV data
csv_data = []
for key in sorted(en_flat.keys()):
    english_text = en_flat.get(key, '')
    indonesian_text = id_flat.get(key, '')
    
    # Skip empty values and some technical keys
    if english_text and not key.startswith('_'):
        csv_data.append({
            'Key': key,
            'English': english_text,
            'Indonesian': indonesian_text,
            'Reviewer_Notes': '',
            'Status': 'Needs Review'
        })

print(f"Found {len(csv_data)} translation pairs")

# Write CSV file
csv_filename = 'translation_review.csv'
with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['Key', 'English', 'Indonesian', 'Reviewer_Notes', 'Status'])
    writer.writeheader()
    writer.writerows(csv_data)

print(f"CSV file created: {csv_filename}")
print(f"Total entries: {len(csv_data)}")