from pathlib import Path
from PIL import Image, ImageOps

SOURCE = Path(__file__).resolve().parents[1] / "public" / "question-images"
OUTPUT = SOURCE / "variants"
OUTPUT.mkdir(parents=True, exist_ok=True)
SIZES = {"thumb": (320, 180), "card": (640, 360), "full": (1280, 720), "option": (256, 256)}

for source in SOURCE.glob("*.png"):
    with Image.open(source).convert("RGB") as image:
        for suffix, size in SIZES.items():
            fitted = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            fitted.save(OUTPUT / f"{source.stem}-{suffix}.webp", "WEBP", quality=84, method=6)

print(f"{len(list(SOURCE.glob('*.png')))} kaynak için {len(SIZES)} boyut üretildi.")
