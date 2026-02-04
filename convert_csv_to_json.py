# CSV -> JSON converter (Python)
# Usage:
#   python3 convert_csv_to_json.py properties.csv properties.json
# If no output file provided, prints to stdout.

import csv
import json
import sys
from pathlib import Path

def to_bool(v):
    if v is None: return False
    s = str(v).strip().lower()
    if s in ('true','1','yes','y'): return True
    if s in ('false','0','no','n'): return False
    return False

def to_number(v):
    if v is None or v == '': return None
    try:
        return float(str(v).replace(',',''))
    except:
        return None

def split_images(s):
    if not s: return []
    return [p.strip() for p in str(s).split(';') if p.strip()]

def convert(infile):
    rows = []
    with open(infile, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                'id': row.get('id',''),
                'title': row.get('title',''),
                'slug': row.get('slug',''),
                'address': row.get('address',''),
                'city': row.get('city',''),
                'neighborhood': row.get('neighborhood',''),
                'price': to_number(row.get('price')),
                'price_currency': row.get('price_currency',''),
                'beds': to_number(row.get('beds')),
                'baths': to_number(row.get('baths')),
                'furnished': row.get('furnished',''),
                'area_sqm': to_number(row.get('area_sqm')),
                'type': row.get('type',''),
                'availability': row.get('availability',''),
                'featured': to_bool(row.get('featured')),
                'description': row.get('description',''),
                'images': split_images(row.get('images','')),
                'contact_phone': row.get('contact_phone',''),
                'listing_url': row.get('listing_url',''),
                'lat': to_number(row.get('lat')),
                'lng': to_number(row.get('lng')),
            })
    return rows

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 convert_csv_to_json.py properties.csv [out.json]")
        sys.exit(1)
    infile = sys.argv[1]
    outfile = sys.argv[2] if len(sys.argv) > 2 else None
    data = convert(infile)
    out = json.dumps(data, indent=2)
    if outfile:
        Path(outfile).write_text(out, encoding='utf-8')
        print(f"Wrote {outfile}")
    else:
        print(out)

if __name__ == '__main__':
    main()
