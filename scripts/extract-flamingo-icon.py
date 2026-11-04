#!/usr/bin/env python3
"""
Extracts the high-resolution Flamingo icon from the user-uploaded image
into a 100% transparent, zero-halo PNG without background:
  - public/brand/flamingo-icon.png
  - C:/Users/USUARIO/.gemini/antigravity/brain/f0f3ddeb-3217-4099-9725-bf56adef71e7/flamingo-icon-sin-fondo.png
  - Updates public/brand/logo-flamingo.svg & logo-flamingo-light.svg
"""
from pathlib import Path
import base64
import io
import cv2
import numpy as np
from PIL import Image

ROOT = Path(r'c:\Users\USUARIO\Desktop\PROYECT-FLAMINGO')
ARTIFACT_DIR = Path(r'C:\Users\USUARIO\.gemini\antigravity\brain\f0f3ddeb-3217-4099-9725-bf56adef71e7')
UPLOADED_IMG = ARTIFACT_DIR / '.user_uploaded' / 'media_1793769152033_66b1dc24.jpg'


def extract_clean_flamingo_icon():
    img_bgr = cv2.imread(str(UPLOADED_IMG))
    if img_bgr is None:
        raise FileNotFoundError(f'Could not read {UPLOADED_IMG}')

    h, w = img_bgr.shape[:2]
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)

    border_pixels = np.concatenate([
        rgb[:60, :, :].reshape(-1, 3),
        rgb[-60:, :, :].reshape(-1, 3),
        rgb[:, :60, :].reshape(-1, 3),
        rgb[:, -60:, :].reshape(-1, 3),
    ], axis=0)
    bg_color = np.median(border_pixels, axis=0)

    # Color distance from lavender background
    diff = np.linalg.norm(rgb - bg_color[None, None, :], axis=2)

    # Smooth elliptical mask specifically for the pale pink-white cheek patch between eye and beak
    yy, xx = np.ogrid[:h, :w]
    cx, cy = w * 0.366, h * 0.282
    rx, ry = w * 0.020, h * 0.026
    dist_sq = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
    cheek_box = np.clip(1.5 - dist_sq, 0.0, 1.0).astype(np.float32)
    r_minus_b = (rgb[:, :, 0] - rgb[:, :, 2]) - (bg_color[0] - bg_color[2])
    cheek_signal = cheek_box * (r_minus_b * 3.2)

    fg_signal = np.maximum(diff, cheek_signal)

    # Strict threshold to eliminate the 3px JPEG ringing halo around the bird
    # AND make the wing feather cutouts + leg gap 100% transparent
    t_low, t_high = 28.0, 54.0
    alpha_raw = np.clip((fg_signal - t_low) / (t_high - t_low), 0.0, 1.0)

    # Clean contour smoothing at 2x resolution for sub-pixel anti-aliased edges
    alpha_2x = cv2.resize(alpha_raw, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
    # Erode 1px at 2x (0.5px at 1x) to shave off any residual JPEG halo
    kernel_erode = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_2x_eroded = cv2.erode(alpha_2x, kernel_erode, iterations=1)
    alpha_2x_smooth = cv2.GaussianBlur(alpha_2x_eroded, (5, 5), 1.1)
    alpha_final = cv2.resize(alpha_2x_smooth, (w, h), interpolation=cv2.INTER_AREA)

    # Remove any tiny disconnected specks
    binary = (alpha_final > 0.15).astype(np.uint8) * 255
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
    valid_mask = np.zeros_like(binary, dtype=np.float32)
    for lbl in range(1, num_labels):
        if stats[lbl, cv2.CC_STAT_AREA] > 200:
            valid_mask[labels == lbl] = 1.0
    valid_mask = cv2.dilate(valid_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    alpha_final = np.clip(alpha_final * valid_mask, 0.0, 1.0)

    # Un-matte edge pixels against bg_color so edges have pure flamingo pink/plum RGB
    a_safe = np.clip(alpha_final[:, :, None], 0.22, 1.0)
    fg_unmatted = (rgb - bg_color[None, None, :] * (1.0 - alpha_final[:, :, None])) / a_safe

    # Additionally clamp edge pixels so they cannot be paler/more lavender than their 3px interior neighbor
    kernel_in = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    interior_rgb = cv2.erode(rgb, kernel_in, iterations=1)
    edge_zone = (alpha_final > 0.01) & (alpha_final < 0.92)
    fg_clean = np.where(edge_zone[:, :, None], interior_rgb, fg_unmatted)
    fg_clean = np.where(alpha_final[:, :, None] > 0.01, np.clip(fg_clean, 0, 255), 0)

    rgba = np.dstack([
        fg_clean.astype(np.uint8),
        (alpha_final * 255.0).round().astype(np.uint8),
    ])

    ys, xs = np.where(rgba[:, :, 3] > 10)
    y0, y1 = max(0, int(ys.min()) - 24), min(h, int(ys.max()) + 24)
    x0, x1 = max(0, int(xs.min()) - 24), min(w, int(xs.max()) + 24)
    cropped_rgba = rgba[y0:y1, x0:x1]

    ch, cw = cropped_rgba.shape[:2]
    side = max(ch, cw) + 64
    square_rgba = np.zeros((side, side, 4), dtype=np.uint8)
    oy = (side - ch) // 2
    ox = (side - cw) // 2
    square_rgba[oy:oy + ch, ox:ox + cw] = cropped_rgba

    icon_public_path = ROOT / 'public' / 'brand' / 'flamingo-icon.png'
    icon_artifact_path = ARTIFACT_DIR / 'flamingo-icon-sin-fondo.png'

    Image.fromarray(square_rgba, 'RGBA').save(icon_public_path, 'PNG', optimize=True)
    Image.fromarray(square_rgba, 'RGBA').save(icon_artifact_path, 'PNG', optimize=True)
    print(f'[Flamingo Icon] Saved halo-free transparent icon: {icon_public_path} ({side}x{side})')

    cropped_pil = Image.fromarray(cropped_rgba, 'RGBA')
    buf = io.BytesIO()
    cropped_pil.save(buf, format='PNG', optimize=True)
    icon_b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    font_b64 = base64.b64encode((ROOT / 'public/fonts/GeistaMond-Regular.woff2').read_bytes()).decode('ascii')

    icon_h = 680
    icon_w = int(round(cw * (icon_h / ch)))
    icon_x = (1080 - icon_w) // 2
    icon_y = 40

    def build_full_logo_svg(text_color: str, sub_color: str) -> str:
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1000" width="1080" height="1000">
  <defs>
    <style>
      @font-face {{
        font-family: 'GeistaMondLogo';
        src: url('data:font/woff2;base64,{font_b64}') format('woff2');
        font-weight: 400;
        font-style: normal;
      }}
      .logo-title {{
        font-family: 'GeistaMondLogo', 'Cormorant Garamond', Georgia, serif;
        font-size: 114px;
        font-weight: 700;
        letter-spacing: 0.09em;
        fill: {text_color};
      }}
      .logo-sub {{
        font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif;
        font-size: 39px;
        font-weight: 500;
        letter-spacing: 0.38em;
        fill: {sub_color};
      }}
    </style>
  </defs>
  <image href="data:image/png;base64,{icon_b64}" x="{icon_x}" y="{icon_y}" width="{icon_w}" height="{icon_h}" />
  <text x="545" y="852" text-anchor="middle" class="logo-title">FLAMINGO</text>
  <text x="552" y="946" text-anchor="middle" class="logo-sub">RESIDENCIAL</text>
</svg>'''

    (ROOT / 'public/brand/logo-flamingo.svg').write_text(build_full_logo_svg('#361D42', '#361D42'), encoding='utf-8')
    (ROOT / 'public/brand/logo-flamingo-light.svg').write_text(build_full_logo_svg('#F5F1FA', '#EAE3F2'), encoding='utf-8')


if __name__ == '__main__':
    extract_clean_flamingo_icon()
