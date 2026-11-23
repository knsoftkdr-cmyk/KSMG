# OCR every page; save raw lines (text, x, y, w, h, conf) in page-relative units (0..1).
import fitz, sys, os, json
import numpy as np
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
pdf, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
d = fitz.open(pdf)
for i in range(d.page_count):
    n = i + 1; f = f'{out}/p{n:03d}.json'
    if os.path.exists(f): continue
    p = d[i]; z = 2400 / p.rect.width
    pix = p.get_pixmap(matrix=fitz.Matrix(z, z))
    img = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)
    res, _ = ocr(img)
    lines = []
    for box, txt, conf in (res or []):
        xs = [b[0] for b in box]; ys = [b[1] for b in box]
        lines.append({'t': txt, 'x': min(xs)/pix.width, 'y': min(ys)/pix.height,
                      'w': (max(xs)-min(xs))/pix.width, 'h': (max(ys)-min(ys))/pix.height, 'c': round(float(conf), 3)})
    json.dump({'page': n, 'w': pix.width, 'h': pix.height, 'lines': lines}, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
    if n % 25 == 0: print(n, flush=True)
print('done', flush=True)
