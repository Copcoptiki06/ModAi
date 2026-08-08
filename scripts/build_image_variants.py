from pathlib import Path
import sys
from PIL import Image, ImageOps

SOURCE = Path(__file__).resolve().parents[1] / "public" / "question-images"
OUTPUT = SOURCE / "variants"
OUTPUT.mkdir(parents=True, exist_ok=True)
SIZES = {"thumb": (320, 180), "card": (640, 360), "full": (1280, 720), "option": (256, 256)}

scan_root = SOURCE / sys.argv[1] if len(sys.argv) > 1 else SOURCE
sources = [item for item in scan_root.rglob("*.png") if "variants" not in item.parts]
for source in sources:
    relative = source.relative_to(SOURCE)
    target_dir = OUTPUT / relative.parent
    target_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(source).convert("RGB") as image:
        for suffix, size in SIZES.items():
            target = target_dir / f"{source.stem}-{suffix}.webp"
            if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
                continue
            fitted = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            fitted.save(target, "WEBP", quality=84, method=6)

print(f"{len(list(SOURCE.glob('*.png')))} kaynak için {len(SIZES)} boyut üretildi.")
