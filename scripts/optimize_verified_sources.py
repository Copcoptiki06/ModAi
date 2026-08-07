from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1] / "public" / "question-images" / "verified"
count = 0
for path in root.rglob("*.png"):
    with Image.open(path).convert("RGB") as image:
        fitted = ImageOps.fit(image, (1280, 720), method=Image.Resampling.LANCZOS)
        fitted.save(path, "PNG", optimize=True, compress_level=9)
    count += 1
print(f"{count} doğrulanmış kaynak görsel web için optimize edildi.")
