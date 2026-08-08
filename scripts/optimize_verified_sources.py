from pathlib import Path
import sys
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1] / "public" / "question-images" / "verified"
scan_root = root / sys.argv[1] if len(sys.argv) > 1 else root
count = 0
for path in scan_root.rglob("*.png"):
    with Image.open(path).convert("RGB") as image:
        fitted = ImageOps.fit(image, (1280, 720), method=Image.Resampling.LANCZOS)
        fitted.save(path, "PNG", optimize=True, compress_level=9)
    count += 1
print(f"{count} doğrulanmış kaynak görsel web için optimize edildi.")
