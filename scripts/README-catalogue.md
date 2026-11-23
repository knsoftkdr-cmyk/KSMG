# Rebuilding the catalogue

The catalogue (`/catalogue`) is generated from `KSMG_Global_Brochures.pdf`. Run these when the PDF changes.

```sh
pip install pymupdf pillow rapidocr-onnxruntime   # once, ideally in a virtual environment
python scripts/catalogue_render.py <path-to-pdf> <work>/web   # page images (~2 min)
python scripts/catalogue_ocr.py    <path-to-pdf> <work>/ocr   # read fabric labels (~1 hour, resumable)
python scripts/build_catalogue.py  <work> .                   # writes public/catalogue/
```

Collections, page ranges, sectors and pages to skip are set at the top of `build_catalogue.py`.
