# Render every PDF page to a web image (max 1400px wide) + a thumbnail.
import fitz, sys, os
from PIL import Image
pdf, out = sys.argv[1], sys.argv[2]
os.makedirs(f'{out}/full', exist_ok=True); os.makedirs(f'{out}/thumb', exist_ok=True)
d = fitz.open(pdf)
for i in range(d.page_count):
    n = i + 1
    if os.path.exists(f'{out}/thumb/p{n:03d}.webp'): continue
    p = d[i]; z = min(2.0, 1400 / p.rect.width)
    pix = p.get_pixmap(matrix=fitz.Matrix(z, z))
    im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    im.save(f'{out}/full/p{n:03d}.webp', quality=74, method=5)
    t = im.copy(); t.thumbnail((480, 480), Image.LANCZOS); t.save(f'{out}/thumb/p{n:03d}.webp', quality=70, method=5)
    if n % 50 == 0: print(n, flush=True)
print('done')
