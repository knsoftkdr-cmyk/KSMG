"""Build public/catalogue/ from KSMG_Global_Brochures.pdf.

Inputs (made by the render + OCR steps, see scripts/README-catalogue.md):
  <work>/web/full/pNNN.webp, <work>/web/thumb/pNNN.webp  page images
  <work>/ocr/pNNN.json                                 OCR lines per page
Output:
  public/catalogue/catalogue.json, public/catalogue/{full,thumb}/pNNN.webp

Usage: python -I scripts/build_catalogue.py <work-dir> <site-root>
"""
import json, os, re, shutil, sys
from collections import Counter

WORK, SITE = sys.argv[1], sys.argv[2]

# slug, name, first page, last page, kind, industries, blurb
COLLECTIONS = [
    ('back-2-school', 'Back 2 School', 1, 34, 'looks', ['schools'],
     'School uniform looks for boys and girls, each shown with its shirting and suiting fabrics.'),
    ('checks-uniform-bazaar', 'Checks Uniform Bazaar', 35, 73, 'fabrics', ['schools'],
     'Checked shirting fabrics for school uniforms: mini checks, square checks, tartans and more, with shade numbers.'),
    ('class-of-2025', 'Class of 2025', 74, 112, 'looks', ['schools'],
     'Complete school uniform sets with matching shirting and suiting fabrics.'),
    ('corporate-bazar-style', 'Corporate Bazar Style', 113, 139, 'corporate', ['corporate', 'hospitality', 'retail', 'transport'],
     'Corporate shirting fabrics: solids, stripes, checks and dobbies for office and front-desk uniforms.'),
    ('genius', 'Genius', 140, 171, 'looks', ['schools'],
     'School uniform looks for students and teachers, with shirting, suiting and saree fabrics.'),
    ('little-passport', 'Little Passport', 172, 202, 'looks', ['schools'],
     'Travel-themed school uniform looks with their checks, stripes and suiting fabrics.'),
    ('mr-bottoms', 'Mr. Bottoms', 203, 243, 'fabrics', ['schools', 'corporate', 'government'],
     'Premium suitings for trousers, skirts, shorts and blazers in fibre-dyed and piece-dyed qualities.'),
    ('plain-galaxy', 'Plain Galaxy', 244, 262, 'fabrics', ['schools', 'corporate', 'healthcare', 'hospitality', 'industrial', 'facilities'],
     'Plain uniform fabrics in a wide range of shades for shirts, kurtas, scrubs and workwear.'),
    ('qtab', 'Q-Tab', 263, 395, 'looks', ['schools', 'corporate'],
     'School and corporate uniform looks with base and trim fabric pairings.'),
    ('school-days', 'School Days', 396, 438, 'looks', ['schools'],
     'Bright school uniform looks with shirting, suiting and trim fabrics.'),
    ('remix', 'Remix', 439, 445, 'fabrics', ['schools'],
     'An add-on booklet of checks and stripes for school uniforms.'),
    ('scholar', 'Scholar', 446, 522, 'fabrics', ['schools'],
     'Swatch book of school shirting checks: multi checks, diamond, silver, super, twill and golden twill checks.'),
    ('signature', 'Signature', 523, 561, 'corporate', ['corporate', 'hospitality', 'healthcare', 'transport', 'industrial', 'retail'],
     'Corporate uniform fabrics shown on office, front-desk, cafe, airline, hospital, nursing and workwear teams.'),
    ('saree-suit-uniforms', 'Saree & Suit Uniforms', 562, 577, 'saree', ['schools', 'corporate', 'hospitality', 'transport'],
     'Uniform sarees and salwar suits for teachers, front-office and service staff.'),
    ('uniform-stripes-bazaar', 'Uniform Stripes Bazaar', 578, 599, 'fabrics', ['schools', 'corporate'],
     'Striped shirting fabrics for school and corporate uniforms, with shade numbers.'),
    ('uniforms-times', 'Uniforms Times', 600, 645, 'looks', ['schools'],
     'School uniform looks including blazers, with shirting and suiting fabrics.'),
]
# Dividers, back covers and empty sample pages.
SKIP = {576, 577, 34, 73, 112, 139, 171, 243, 262, 393, 394, 395, 445, 507, 508, 517, 561, 599, 645}
# Contents / index tables: kept searchable as plain text, not parsed into fabric labels.
INDEX = {2, 36, 114, 204, 264, 265, 397, 447, 579}
NOT_NAME = re.compile(r'^(width|fibre|piece|yarn|dyed|pc|pv|cms|page|pg|no|sr|merchant)(?![a-z])', re.I)

NOISE = re.compile(r'ksmg|global|private|limited|^\+?\s*9\s*1|9628|^iso\b|^www\.|@', re.I)
DESC = re.compile(r'shirt|suit|dyed|width|cotton|poly|\bpc\b|\bpv\b|\bcvc\b|cms|lycra|twill|linen|blend|\d+\s*s\b|\d\s*["”\'″]', re.I)
ITEM = re.compile(r'^([A-Za-z][A-Za-z .&\'/()]*?[A-Za-z)])\s*[-–—~:]+\s*([A-Za-z]{0,2}\d[\dA-Za-z]{0,7})\b\s*(.*)$')
RANGE = re.compile(r'^\d{1,5}\s*(to|-)\s*\d{1,5}$', re.I)

def clean(t):
    t = t.replace('”', '"').replace('″', '"').replace('’', "'").replace('‐', '-').strip(' .,;↗↙→')
    t = re.sub(r'\s+', ' ', t)
    return t

def tidy_desc(t):
    t = clean(t)
    t = re.sub(r'(?i)fibre\s*dyed', 'Fibre dyed', t)
    t = re.sub(r'(?i)piece\s*dyed', 'Piece dyed', t)
    t = re.sub(r'(?i)yarn\s*dyed', 'Yarn dyed', t)
    t = re.sub(r'(?i)width\s*[-:]?\s*(\d+)\s*"?', r'width \1"', t)
    t = re.sub(r'(?i)\bpc\s*shirting', 'PC shirting', t)
    t = re.sub(r'(?i)\bcp\s*shirting', 'CP shirting', t)
    t = re.sub(r'(?i)shirting', 'shirting', t)
    t = re.sub(r'(?i)suiting', 'suiting', t)
    t = re.sub(r'[↑↗↙→←↓]+', '', t)
    t = re.sub(r'(?i)dyed(?=suiting|shirting)', 'dyed ', t)
    t = re.sub(r'(?i)(shirting|suiting)(?=\d)', r'\1 ', t)
    t = re.sub(r'(?i)(?<=\bPC)(?=shirting)', ' ', t)
    t = re.sub(r'(?i)vat\s*dyed\s*', 'Vat dyed ', t)
    t = re.sub(r'(?i)cotton\s*rich', 'Cotton rich', t)
    t = re.sub(r'(?i)(\d)\s*cms\b', r'\1 cms', t)
    t = re.sub(r'(\d+s)\s*(PC|PV|Poly|CVC)', r'\1 \2', t, flags=re.I)
    t = re.sub(r'\s*[×x]\s*[×x]?\s*(?=\d)', ' × ', t)
    t = re.sub(r'\s*\(\s*', ' (', t).replace(' )', ')')
    t = re.sub(r"(\d)\s*'(?!\w)", r'\1"', t)
    t = re.sub(r'\s*,\s*', ', ', t).strip(' ,')
    if not re.search(r'[A-Za-z0-9]', t): return ''
    return t[:1].upper() + t[1:]

def title(t):
    small = {'and', 'of', 'the', 'n'}
    return ' '.join(w if (w.lower() in small and i) else (w[:1].upper() + w[1:].lower()) for i, w in enumerate(t.split()))

def load(n):
    f = f'{WORK}/ocr/p{n:03d}.json'
    if not os.path.exists(f): return None
    return json.load(open(f, encoding='utf-8'))

# Pass 1: learn spaced spellings ("SWISS DENIM") to repair squashed ones ("SWISSDENIM").
spaced = Counter()
for n in range(1, 646):
    d = load(n)
    for l in (d or {}).get('lines', []):
        t = clean(l['t']); m = ITEM.match(t)
        if m and ' ' in m.group(1).strip(): spaced[m.group(1).strip().upper()] += 1
        elif re.fullmatch(r"[A-Z][A-Z .&'-]{3,30}", t) and ' ' in t: spaced[t.upper()] += 1
fix = {k.replace(' ', ''): k for k, _ in spaced.most_common()}

def fix_name(name):
    name = name.strip().upper().replace('SOUARE', 'SQUARE')
    return title(fix.get(name.replace(' ', ''), name))

def parse(d):
    lines = [dict(l, t=clean(l['t'])) for l in d['lines'] if l['c'] >= 0.6]
    lines = [l for l in lines if l['t'] and not NOISE.search(l['t'])]
    # page numbers sit in the bottom corners
    lines = [l for l in lines if not (re.fullmatch(r'\d{1,3}', l['t']) and l['y'] > 0.85)]
    items, quals, extra = [], [], []
    for l in sorted(lines, key=lambda l: (round(l['y'], 2), l['x'])):
        t = l['t']; m = ITEM.match(t)
        if m and not RANGE.match(t) and not NOT_NAME.match(m.group(1)):
            rest = m.group(3).strip(' ()')
            items.append({'n': fix_name(m.group(1)), 'code': m.group(2).upper(), 'd': tidy_desc(rest) if rest else '', 'x': l['x'], 'y': l['y']})
            continue
        near = lambda o: abs(o['y'] - l['y']) < 0.07 and abs(o['x'] - l['x']) < 0.2 and o['y'] <= l['y'] + 0.01
        if DESC.search(t) or RANGE.match(t):
            host = next((o for o in reversed(items) if near(o)), None) or next((o for o in reversed(quals) if near(o)), None)
            if host is not None:
                if RANGE.match(t): host['r'] = re.sub(r'\s*(to|-)\s*', ' to ', t, flags=re.I)
                else:
                    extra_d = tidy_desc(t)
                    if host.get('d') and extra_d[1:2].islower(): extra_d = extra_d[:1].lower() + extra_d[1:]
                    host['d'] = ', '.join(x for x in [host.get('d', ''), extra_d] if x)
                continue
        if re.fullmatch(r"[A-Za-z][A-Za-z .&'/()-]{2,40}", t) and sum(c.isupper() for c in t) >= 3 and t.upper() == t:
            quals.append({'n': fix_name(t), 'x': l['x'], 'y': l['y']})
            continue
        extra.append(t)
    keep = ('n', 'code', 'd', 'r', 'x')
    strip = lambda o: {k: v for k, v in o.items() if k in keep and v not in ('', None)}
    seen = set(); uniq = []
    for i in map(strip, items):
        key = (i['n'], i['code'])
        if key not in seen: seen.add(key); uniq.append(i)
    qseen = set(); quals2 = []
    for q in map(strip, quals):
        if q['n'] not in qseen and len(q['n']) > 2: qseen.add(q['n']); quals2.append(q)
    return uniq, quals2

# ---------------------------------------------------------------------------
# Sector-first output: uniform looks (photo + fabrics) and fabric cards (swatch + specs).
from PIL import Image

ALL = ['schools', 'healthcare', 'corporate', 'hospitality', 'industrial', 'government', 'transport', 'retail',
       'sports', 'food-agri', 'beauty', 'ceremonial', 'events', 'facilities', 'specialised']
SECTORS = {  # which sectors each collection's cards belong to
    'checks-uniform-bazaar': ['schools'], 'remix': ['schools'], 'scholar': ['schools'], 'uniform-stripes-bazaar': ['schools', 'corporate'],
    'corporate-bazar-style': ['corporate', 'hospitality', 'retail', 'transport', 'government', 'events'],
    'mr-bottoms': ['schools', 'corporate', 'government', 'hospitality', 'retail', 'transport'],
    'plain-galaxy': ['schools', 'corporate', 'healthcare', 'hospitality', 'industrial', 'government', 'retail',
                     'food-agri', 'beauty', 'events', 'facilities', 'specialised'],
    'saree-suit-uniforms': ['schools', 'corporate', 'hospitality', 'transport'],
    'signature': ['corporate'], 'qtab': ['schools'],
}
PAGE_SECTOR = {531: ['hospitality'], 532: ['hospitality'], 537: ['hospitality'], 538: ['transport'],
               539: ['healthcare'], 540: ['healthcare'], 554: ['industrial', 'facilities']}
for n in range(377, 393): PAGE_SECTOR[n] = ['corporate']
LOOK_COLS = {'back-2-school', 'class-of-2025', 'genius', 'little-passport', 'qtab', 'school-days', 'signature',
             'saree-suit-uniforms', 'uniforms-times'}

def role(f):
    d = (f.get('d') or '').lower()
    if 'shirting' in d: return 'Shirt'
    if 'suiting' in d or 'bottom' in d: return 'Trousers / skirt'
    if re.search(r'\b3[68]"', d): return 'Shirt'
    if re.search(r'\b5[4-8]"', d): return 'Trousers / skirt'
    return 'Fabric'

dst = f'{SITE}/public/catalogue'
for sub in ('looks', 'swatches'): os.makedirs(f'{dst}/{sub}', exist_ok=True)

def page_img(n):
    return Image.open(f'{WORK}/web/full/p{n:03d}.webp').convert('RGB')

SIG_STOP = {'CUT', 'RICH', 'STRETCH', 'DESIGNED', 'FOR NURSES', 'READY TO HELP', 'HEALTH CARE', 'TESSO', 'EDEFIN',
            'CMS', 'TRIMS', 'SILK', 'SATIN', 'WHITE', 'BLUE', 'CITY', 'ENERGY', 'MEDICAL APRON', 'DR COAT', 'PC SHIRTING TRIMS',
            'FIBRE DYED TRIMS', 'LYCRA'}

def sig_fabrics(quals):
    """Signature pages: keep real fabric names, drop label words and OCR fragments of longer names."""
    sq = lambda s: re.sub(r'[^a-z]', '', s.lower())
    names = [q for q in quals if q['n'].upper() not in SIG_STOP and len(sq(q['n'])) > 3]
    out = []
    for q in names:
        others = [o for o in names if o is not q and sq(o['n']) != sq(q['n'])]
        if any(sq(q['n']) in sq(o['n']) for o in others if ' ' in o['n']): continue   # "Kings" when "Kings Crown" exists
        if ' ' not in q['n'] and any(sq(o['n']) in sq(q['n']) and ' ' in o['n'] for o in others): continue  # "Ahugolycra"
        if any(sq(o['n']) == sq(q['n']) for o in out): continue
        out.append({'n': q['n'].replace(' - ', ' '), 'code': '', 'd': q.get('d', '')})
    return out

def whiteness(im):
    g = im.convert('L').resize((80, 80))
    return sum(1 for v in g.tobytes() if v > 235) / 6400

def trim(im):
    # Drop plain white margins around the content.
    g = im.convert('L').point(lambda v: 255 if v < 238 else 0)
    box = g.getbbox()
    if box and (box[2] - box[0]) * (box[3] - box[1]) > 0.15 * im.width * im.height:
        pad = 8; im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
    return im

def save(im, path, maxw):
    im = trim(im)
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(path, quality=78, method=5)

looks, fabrics = [], []
cols_out = []
parsed = {}
for slug, name, a, b, kind, inds, blurb in COLLECTIONS:
    cols_out.append({'slug': slug, 'name': name, 'kind': kind, 'blurb': blurb})
    pages = [n for n in range(a, b + 1) if n not in SKIP and n not in INDEX and n != a]
    for n in pages:
        d = load(n)
        parsed[n] = parse(d) if d else ([], [])
    for n in pages:
        items, quals = parsed[n]
        im = page_img(n); W, H = im.size; spread = W / H > 1.2
        sectors = PAGE_SECTOR.get(n) or SECTORS.get(slug) or ['schools']
        if slug in LOOK_COLS:
            if slug == 'signature' and spread:
                # Labels here are printed sideways and have no "NAME - code" form:
                # the photo is the less-white half, fabrics are the named qualities on the page.
                L, R = im.crop((0, 0, W // 2, H)), im.crop((W // 2, 0, W, H))
                photo, sw = (L, R) if whiteness(L) <= whiteness(R) else (R, L)
                fabs = items or sig_fabrics(quals)
            elif spread:
                if not items and slug != 'saree-suit-uniforms': continue      # decorative spread
                sx = sum(i.get('x', .5) for i in items) / len(items) if items else 1
                photo = im.crop((0, 0, W // 2, H)) if sx >= 0.5 else im.crop((W // 2, 0, W, H))
                sw = im.crop((W // 2, 0, W, H)) if sx >= 0.5 else im.crop((0, 0, W // 2, H))
                fabs = items
            else:
                if items: continue                                          # swatch-only page, paired below
                if slug == 'saree-suit-uniforms':
                    photo, sw, fabs = im, None, []
                else:
                    mate = next((m for m in (n + 1, n - 1) if m in parsed and parsed[m][0]), None)
                    if mate is None: continue
                    photo, fabs = im, parsed[mate][0]
                    sw = page_img(mate)
            lid = f'p{n:03d}'
            save(photo, f'{dst}/looks/{lid}.webp', 760)
            if sw is not None: save(sw, f'{dst}/swatches/{lid}.webp', 700)
            looks.append({'id': lid, 'c': slug, 's': sectors, 'sw': sw is not None,
                          'f': [{'n': f['n'], 'code': f['code'], 'd': f.get('d', ''), 'role': role(f)} for f in fabs]})
        else:
            if not quals: continue
            halves = [(0, quals)] if not spread else [
                (1, [q for q in quals if q.get('x', 0) < 0.5]), (2, [q for q in quals if q.get('x', 0) >= 0.5])]
            for h, qs in halves:
                if not qs: continue
                part = im if h == 0 else im.crop((0, 0, W // 2, H)) if h == 1 else im.crop((W // 2, 0, W, H))
                fid = f'p{n:03d}{"abc"[h]}'
                save(part, f'{dst}/swatches/{fid}.webp', 700)
                fabrics.append({'id': fid, 'c': slug, 's': sectors,
                                'q': [{k: v for k, v in q.items() if k in ('n', 'd', 'r')} for q in qs]})

out = {'collections': cols_out, 'looks': looks, 'fabrics': fabrics}
json.dump(out, open(f'{dst}/catalogue.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
for old in ('full', 'thumb'): shutil.rmtree(f'{dst}/{old}', ignore_errors=True)
print(f"{len(looks)} uniform looks, {len(fabrics)} fabric cards, {os.path.getsize(dst + '/catalogue.json') // 1024} KB json")
for sct in ALL:
    print(f"  {sct}: {sum(sct in l['s'] for l in looks)} looks, {sum(sct in f['s'] for f in fabrics)} fabrics")
