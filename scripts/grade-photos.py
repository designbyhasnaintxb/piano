"""Consistent photo treatment for the site (run: python3 -I scripts/grade-photos.py <src_dir>).

<src_dir> must hold the originals from Lisa's site: portrait.jpg, and frames
v1_12.jpg, v1_25.jpg, v2_60.jpg (extracted from video1/video2 with ffmpeg).
Writes WebP files into public/media/.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src = sys.argv[1]
OUT = 'public/media/'

def grade(im, mute_cool=0.25, vignette=0.22):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    # 1) mute saturated blues/greens (lamps, painting) — skin, wood, ivory untouched
    hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(np.float32) / 255.0
    h, s = hsv[..., 0] * 360, hsv[..., 1]
    cool = ((h > 75) & (h < 300)).astype(np.float32) * np.clip((s - 0.18) / 0.3, 0, 1)
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    k = (cool * (1 - mute_cool))[..., None]
    a = a * (1 - k) + (lum * np.array([1.02, 0.99, 0.94])) * k
    # 2) gentle overall desaturation + warm tone (towards the site's greige/ochre)
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    a = lum + (a - lum) * 0.9
    a = a * np.array([1.035, 1.0, 0.94])
    # 3) soft S-curve and lifted blacks (filmic, never crushed)
    a = np.clip(a, 0, 1)
    a = a + 0.10 * (a - a * a) * (2 * a - 1) * -1 + 0.025 * (1 - a)
    # 4) subtle vignette
    hh, ww = a.shape[:2]
    yy, xx = np.mgrid[0:hh, 0:ww]
    d = np.sqrt(((xx - ww / 2) / (ww / 2)) ** 2 + ((yy - hh / 2) / (hh / 2)) ** 2) / 1.414
    a = a * (1 - vignette * np.clip(d - 0.35, 0, 1) ** 1.6)[..., None]
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))

def upscale(im, f=2):
    im = im.resize((im.width * f, im.height * f), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))

def crop_ratio(im, rx, ry, cx=0.5, cy=0.5, scale=1.0):
    """Largest rx:ry crop (times scale), centred on (cx, cy) as fractions."""
    w, h = im.size
    cw = min(w, h * rx / ry) * scale
    ch = cw * ry / rx
    x0 = int(np.clip(cx * w - cw / 2, 0, w - cw)); y0 = int(np.clip(cy * h - ch / 2, 0, h - ch))
    return im.crop((x0, y0, x0 + int(cw), y0 + int(ch)))

# Lisa: 4:5, a touch tighter, head kept clear of the top edge
p = Image.open(f'{src}/portrait.jpg')
p = crop_ratio(p, 4, 5, cx=0.5, cy=0.52, scale=0.97)
p = grade(p, mute_cool=0.1, vignette=0.18)
for w in (720, 1400):
    p.resize((w, int(w * 5 / 4)), Image.LANCZOS).save(f'{OUT}lisa-{w}.webp', quality=82, method=6)

# Dexter on stage: crop to performer + piano, upscale, grade
d = Image.open(f'{src}/v2_60.jpg')
d = crop_ratio(d, 16, 10, cx=0.56, cy=0.52, scale=0.86)
upscale(grade(d, vignette=0.28)).save(f'{OUT}dexter-poster.webp', quality=84, method=6)

# Wynnton: lose most of the altar cloth, focus on piano + player
for name, frame, cx, cy, sc in (('wynnton-poster', 'v1_25', 0.5, 0.45, 1.0), ('wynnton-still', 'v1_12', 0.48, 0.42, 0.78)):
    im = Image.open(f'{src}/{frame}.jpg')
    im = crop_ratio(im, 16, 9 if name.endswith('poster') else 11, cx=cx, cy=cy, scale=sc)
    upscale(grade(im, vignette=0.26)).save(f'{OUT}{name}.webp', quality=84, method=6)
print('graded:', 'lisa-720/1400, dexter-poster, wynnton-poster, wynnton-still')
