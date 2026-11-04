#!/usr/bin/env python3
"""
Downloads verified real Wikimedia Commons media of Tarapoto & Cordillera Escalera,
prepares clean WebP assets in public/tarapoto/ and public/urbanization/,
and renders the 1080p HD documentary & project showcase video:
  - public/videos/tarapoto-flamingo-reel.mp4
  - public/videos/tarapoto-flamingo-reel.webm
  - public/videos/tarapoto-flamingo-poster.webp
"""
import subprocess
import urllib.request
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r'c:\Users\USUARIO\Desktop\PROYECT-FLAMINGO')
CACHE_DIR = ROOT / 'assets-input' / 'tarapoto-commons'
OUT_TARAPOTO = ROOT / 'public' / 'tarapoto'
OUT_VIDEOS = ROOT / 'public' / 'videos'
FFMPEG_BIN = ROOT / 'assets-input' / 'video-tools' / 'imageio_ffmpeg' / 'binaries' / 'ffmpeg-win-x86_64-v7.1.exe'

COMMONS_ASSETS = [
    {
        'slug': 'cordillera-escalera-bosque',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/3/30/%C3%81rea_de_conservaci%C3%B3n_regional_Cordillera_Escalera_01.jpg',
        'title': 'ACR Cordillera Escalera · Bosque Nuboso',
        'credit': 'Wikimedia Commons · CC BY-SA 4.0',
    },
    {
        'slug': 'cordillera-escalera-valle',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/4/46/%C3%81rea_de_conservaci%C3%B3n_regional_Cordillera_Escalera_03.jpg',
        'title': 'Cordillera Escalera · Valle y Montañas Verdes',
        'credit': 'Wikimedia Commons · CC BY-SA 4.0',
    },
    {
        'slug': 'tarapoto-ruta-cordillera',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Camino_a_la_Cordillera_Escalera%2C_Tarapoto%2C_Per%C3%BA.jpg',
        'title': 'Ruta escénica hacia la Cordillera Escalera, Tarapoto',
        'credit': 'Wikimedia Commons · CC BY-SA 4.0',
    },
    {
        'slug': 'catarata-ahuashiyacu',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Cataras_de_Ahuashiyacu.jpg',
        'title': 'Catarata de Ahuashiyacu · Cordillera Escalera',
        'credit': 'Wikimedia Commons · CC BY-SA 3.0',
    },
    {
        'slug': 'laguna-azul-sauce',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/0/01/Laguna_de_Sauce%2C_San_Mart%C3%ADn03.jpg',
        'title': 'Laguna Azul de Sauce · Tarapoto, San Martín',
        'credit': 'Wikimedia Commons · CC BY-SA 4.0',
    },
    {
        'slug': 'fauna-gallito-rocas',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Rupicola_peruvianus%2C_Manu%2C_Peru_2.jpg',
        'title': 'Gallito de las Rocas (Rupicola peruvianus)',
        'credit': 'Wikimedia Commons · CC BY 2.0',
    },
    {
        'slug': 'fauna-mariposa-cordillera',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Mariposa_en_Cordillera_Escalera.jpg',
        'title': 'Mariposa nativa en la Cordillera Escalera',
        'credit': 'Wikimedia Commons · CC BY-SA 4.0',
    },
    {
        'slug': 'flora-heliconia-amazonica',
        'url': 'https://upload.wikimedia.org/wikipedia/commons/6/65/Heliconia_orthotricha_%28Heliconiaceae%29_%2830415961528%29.jpg',
        'title': 'Heliconia orthotricha · Flora Amazónica',
        'credit': 'Wikimedia Commons · CC BY 2.0',
    },
]


def download_and_optimize_assets() -> dict[str, Path]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_TARAPOTO.mkdir(parents=True, exist_ok=True)
    OUT_VIDEOS.mkdir(parents=True, exist_ok=True)

    paths: dict[str, Path] = {}
    headers = {
        'User-Agent': 'FlamingoResidencialShowroomBot/1.0 (https://proyect-flamingo.vercel.app; aurora.aybar@gmail.com)'
    }

    for item in COMMONS_ASSETS:
        slug = item['slug']
        raw_path = CACHE_DIR / f'{slug}.jpg'
        webp_path = OUT_TARAPOTO / f'{slug}.webp'

        if not raw_path.exists() or raw_path.stat().st_size < 10_000:
            print(f'[Download] Fetching {slug} from Wikimedia Commons...')
            req = urllib.request.Request(item['url'], headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw_path.write_bytes(resp.read())

        if not webp_path.exists():
            with Image.open(raw_path) as im:
                im_rgb = im.convert('RGB')
                w, h = im_rgb.size
                if max(w, h) > 2200:
                    scale = 2200.0 / max(w, h)
                    im_rgb = im_rgb.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
                im_rgb.save(webp_path, 'WEBP', quality=86, method=6)
                print(f'[WebP] Saved {webp_path.name} ({im_rgb.size[0]}x{im_rgb.size[1]})')

        paths[slug] = webp_path

    render_src = ROOT / 'public' / 'urbanization' / 'flamingo-render-oficial.png'
    render_clean = ROOT / 'public' / 'urbanization' / 'flamingo-render-clean.webp'
    if render_src.exists() and not render_clean.exists():
        with Image.open(render_src) as r_im:
            r_rgb = r_im.convert('RGB')
            rw, rh = r_rgb.size
            cropped = r_rgb.crop((0, 0, rw, int(rh * 0.655)))
            cropped.save(render_clean, 'WEBP', quality=90, method=6)
            print(f'[Clean Render] Saved {render_clean.name} ({cropped.size[0]}x{cropped.size[1]})')

    return paths


def load_cover_1080p(path: Path, overscan: float = 1.18) -> np.ndarray:
    with Image.open(path) as im:
        rgb = np.array(im.convert('RGB'))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    h, w = bgr.shape[:2]
    target_w = int(1920 * overscan)
    target_h = int(1080 * overscan)
    scale = max(target_w / w, target_h / h)
    new_w = int(round(w * scale))
    new_h = int(round(h * scale))
    resized = cv2.resize(bgr, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    return resized


def sample_ken_burns(
    img_overscan: np.ndarray,
    t: float,
    zoom_start: float = 1.0,
    zoom_end: float = 1.10,
    pan_x: tuple[float, float] = (-0.35, 0.35),
    pan_y: tuple[float, float] = (-0.25, 0.25),
) -> np.ndarray:
    h, w = img_overscan.shape[:2]
    s = 0.5 - 0.5 * np.cos(np.pi * np.clip(t, 0.0, 1.0))
    zoom = zoom_start + (zoom_end - zoom_start) * s

    crop_w = 1920.0 / zoom
    crop_h = 1080.0 / zoom

    max_dx = max(0.0, (w - crop_w) * 0.5)
    max_dy = max(0.0, (h - crop_h) * 0.5)

    px = pan_x[0] + (pan_x[1] - pan_x[0]) * s
    py = pan_y[0] + (pan_y[1] - pan_y[0]) * s

    cx = w * 0.5 + px * max_dx
    cy = h * 0.5 + py * max_dy

    src_x0 = cx - crop_w * 0.5
    src_y0 = cy - crop_h * 0.5

    scale_x = crop_w / 1920.0
    scale_y = crop_h / 1080.0

    M = np.array(
        [
            [scale_x, 0.0, src_x0],
            [0.0, scale_y, src_y0],
        ],
        dtype=np.float32,
    )
    frame = cv2.warpAffine(
        img_overscan,
        M,
        (1920, 1080),
        flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP,
        borderMode=cv2.BORDER_REFLECT_101,
    )
    return frame


def make_cinematic_vignette() -> np.ndarray:
    """Subtle top and bottom plum-tinted vignette so UI overlays read with maximum contrast."""
    overlay_np = np.zeros((1080, 1920, 4), dtype=np.uint8)
    y_coords = np.linspace(0.0, 1.0, 1080)[:, None]
    bottom_alpha = np.clip((y_coords - 0.58) / 0.42, 0.0, 1.0) ** 1.5 * 145.0
    top_alpha = np.clip((0.18 - y_coords) / 0.18, 0.0, 1.0) ** 1.6 * 75.0
    scrim_alpha = np.maximum(bottom_alpha, top_alpha).astype(np.uint8)

    overlay_np[:, :, 0] = 34
    overlay_np[:, :, 1] = 14
    overlay_np[:, :, 2] = 28
    overlay_np[:, :, 3] = scrim_alpha[:, 0][:, None]
    return overlay_np


def blend_overlay(frame_bgr: np.ndarray, overlay_bgra: np.ndarray, opacity: float = 1.0) -> np.ndarray:
    if opacity <= 0.001:
        return frame_bgr
    alpha = (overlay_bgra[:, :, 3:4].astype(np.float32) / 255.0) * float(np.clip(opacity, 0.0, 1.0))
    fg = overlay_bgra[:, :, :3].astype(np.float32)
    bg = frame_bgr.astype(np.float32)
    out = bg * (1.0 - alpha) + fg * alpha
    return np.clip(out, 0, 255).astype(np.uint8)


def load_drone_frames(target_count: int) -> list[np.ndarray]:
    drone_path = ROOT / 'assets-input' / 'drive-previews' / 'source-drone.mp4'
    cap = cv2.VideoCapture(str(drone_path))
    raw_frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame.shape[1] != 1920 or frame.shape[0] != 1080:
            frame = cv2.resize(frame, (1920, 1080), interpolation=cv2.INTER_LANCZOS4)
        raw_frames.append(frame)
    cap.release()

    if not raw_frames:
        raise RuntimeError(f'No frames read from {drone_path}')

    start_idx = min(12, len(raw_frames) - 1)
    indices = np.linspace(start_idx, len(raw_frames) - 1, target_count)
    out = []
    for idx in indices:
        i0 = int(np.floor(idx))
        i1 = min(len(raw_frames) - 1, i0 + 1)
        frac = idx - i0
        if frac < 0.01 or i0 == i1:
            out.append(raw_frames[i0])
        else:
            blended = cv2.addWeighted(raw_frames[i0], 1.0 - frac, raw_frames[i1], frac, 0.0)
            out.append(blended)
    return out


def build_closing_brand_card(base_img: np.ndarray, logo_light_path: Path) -> np.ndarray:
    blurred = cv2.GaussianBlur(base_img, (35, 35), 12.0)
    plum = np.full_like(blurred, (43, 17, 35), dtype=np.uint8)
    bg = cv2.addWeighted(blurred, 0.28, plum, 0.72, 0.0)

    canvas = Image.fromarray(cv2.cvtColor(bg, cv2.COLOR_BGR2RGB)).convert('RGBA')
    if logo_light_path.exists():
        with Image.open(logo_light_path) as lg:
            lg_rgba = lg.convert('RGBA')
            lw, lh = lg_rgba.size
            scale = 420.0 / lh
            lg_resized = lg_rgba.resize((int(lw * scale), int(lh * scale)), Image.Resampling.LANCZOS)
            lx = (1920 - lg_resized.size[0]) // 2
            ly = 160
            canvas.alpha_composite(lg_resized, (lx, ly))

    draw = ImageDraw.Draw(canvas)
    try:
        font_h = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 48)
    except Exception:
        font_h = ImageFont.load_default()
    try:
        font_p = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 27)
        font_b = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 25)
    except Exception:
        font_p = ImageFont.load_default()
        font_b = ImageFont.load_default()

    tagline = 'Tu santuario residencial en el corazón verde de Tarapoto'
    tw = draw.textlength(tagline, font=font_h)
    draw.text(((1920 - tw) / 2, 635), tagline, font=font_h, fill=(245, 241, 250, 255))

    details = 'Lotes de 160 m² y 200 m²  ·  Prolongación Jr. Cuzco s/n, a 30m del Colegio Virgen Dolorosa'
    dw = draw.textlength(details, font=font_p)
    draw.text(((1920 - dw) / 2, 708), details, font=font_p, fill=(234, 227, 242, 225))

    cta = '+51 989 195 093   ·   @ResidencialFlamingo   ·   aurora.aybar@gmail.com'
    cw = draw.textlength(cta, font=font_b)
    draw.rounded_rectangle(((1920 - cw) / 2 - 38, 774, (1920 + cw) / 2 + 38, 838), radius=32, fill=(238, 107, 150, 240))
    draw.text(((1920 - cw) / 2, 788), cta, font=font_b, fill=(35, 17, 43, 255))

    return cv2.cvtColor(np.array(canvas.convert('RGB')), cv2.COLOR_RGB2BGR)


def build_video(paths: dict[str, Path]):
    fps = 24
    img_cordillera_1 = load_cover_1080p(paths['cordillera-escalera-bosque'], 1.20)
    img_cordillera_2 = load_cover_1080p(paths['cordillera-escalera-valle'], 1.20)
    img_ahuashiyacu = load_cover_1080p(paths['catarata-ahuashiyacu'], 1.20)
    img_laguna = load_cover_1080p(paths['laguna-azul-sauce'], 1.20)
    img_gallito = load_cover_1080p(paths['fauna-gallito-rocas'], 1.22)
    img_mariposa = load_cover_1080p(paths['fauna-mariposa-cordillera'], 1.22)
    img_heliconia = load_cover_1080p(paths['flora-heliconia-amazonica'], 1.22)
    img_aerial_real = load_cover_1080p(ROOT / 'public' / 'drive' / '2d' / 'img-0751.webp', 1.18)
    img_render_clean = load_cover_1080p(ROOT / 'public' / 'urbanization' / 'flamingo-render-clean.webp', 1.16)

    vignette = make_cinematic_vignette()

    def render_segment(img, n_frames, z0, z1, px, py):
        seg = []
        for i in range(n_frames):
            t = i / max(1, n_frames - 1)
            f = sample_ken_burns(img, t, z0, z1, px, py)
            seg.append(blend_overlay(f, vignette, 1.0))
        return seg

    print('[Video] Rendering Chapter 1: Cordillera Escalera...')
    seg_c1a = render_segment(img_cordillera_1, int(3.4 * fps), 1.00, 1.09, (-0.35, 0.20), (-0.15, 0.15))
    seg_c1b = render_segment(img_cordillera_2, int(3.4 * fps), 1.02, 1.11, (0.30, -0.25), (0.10, -0.15))

    print('[Video] Rendering Chapter 2: Turismo (Ahuashiyacu & Laguna Azul)...')
    seg_c2a = render_segment(img_ahuashiyacu, int(3.4 * fps), 1.00, 1.10, (0.0, 0.0), (0.35, -0.30))
    seg_c2b = render_segment(img_laguna, int(3.4 * fps), 1.01, 1.10, (-0.40, 0.35), (0.0, -0.15))

    print('[Video] Rendering Chapter 3: Fauna y Flora...')
    seg_c3a = render_segment(img_gallito, int(2.6 * fps), 1.00, 1.10, (-0.25, 0.25), (-0.15, 0.10))
    seg_c3b = render_segment(img_mariposa, int(2.4 * fps), 1.02, 1.11, (0.25, -0.20), (0.10, -0.15))
    seg_c3c = render_segment(img_heliconia, int(2.4 * fps), 1.00, 1.09, (-0.20, 0.25), (0.20, -0.20))

    print('[Video] Loading Chapter 4: Real DJI Drone Flight of Residencial Flamingo...')
    drone_raw = load_drone_frames(int(7.2 * fps))
    seg_c4 = [blend_overlay(df, vignette, 0.85) for df in drone_raw]

    print('[Video] Rendering Chapter 5: Architectural Vision & Brand End-Card...')
    seg_c5a = render_segment(img_aerial_real, int(2.6 * fps), 1.00, 1.08, (-0.20, 0.20), (0.15, -0.15))
    seg_c5b = render_segment(img_render_clean, int(2.8 * fps), 1.00, 1.08, (0.0, 0.0), (0.25, -0.20))

    brand_card_bgr = build_closing_brand_card(
        sample_ken_burns(img_aerial_real, 0.5, 1.04, 1.04, (0, 0), (0, 0)),
        ROOT / 'public' / 'brand' / 'logo-flamingo-light.png',
    )
    seg_c5c = [brand_card_bgr for _ in range(int(2.8 * fps))]

    all_segments = [
        seg_c1a,
        seg_c1b,
        seg_c2a,
        seg_c2b,
        seg_c3a,
        seg_c3b,
        seg_c3c,
        seg_c4,
        seg_c5a,
        seg_c5b,
        seg_c5c,
    ]

    crossfade = 12
    master_frames: list[np.ndarray] = list(all_segments[0])
    for seg in all_segments[1:]:
        overlap = min(crossfade, len(master_frames), len(seg))
        for k in range(overlap):
            alpha = (k + 1) / (overlap + 1)
            f_prev = master_frames[len(master_frames) - overlap + k]
            f_next = seg[k]
            master_frames[len(master_frames) - overlap + k] = cv2.addWeighted(
                f_prev, 1.0 - alpha, f_next, alpha, 0.0
            )
        master_frames.extend(seg[overlap:])

    total_frames = len(master_frames)
    duration_sec = total_frames / fps
    print(f'[Video] Assembled {total_frames} frames ({duration_sec:.1f}s at {fps}fps). Encoding MP4 & WebM...')

    poster_path = OUT_VIDEOS / 'tarapoto-flamingo-poster.webp'
    poster_rgb = cv2.cvtColor(master_frames[int(fps * 1.5)], cv2.COLOR_BGR2RGB)
    Image.fromarray(poster_rgb).save(poster_path, 'WEBP', quality=88, method=6)

    mp4_path = OUT_VIDEOS / 'tarapoto-flamingo-reel.mp4'
    webm_path = OUT_VIDEOS / 'tarapoto-flamingo-reel.webm'

    cmd_mp4 = [
        str(FFMPEG_BIN),
        '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', '1920x1080',
        '-pix_fmt', 'bgr24',
        '-r', str(fps),
        '-i', '-',
        '-an',
        '-vcodec', 'libx264',
        '-preset', 'medium',
        '-crf', '22',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        str(mp4_path),
    ]
    proc = subprocess.Popen(cmd_mp4, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdin is not None
    for frame in master_frames:
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    stderr_out = proc.stderr.read().decode('utf-8', errors='ignore') if proc.stderr else ''
    ret = proc.wait()
    if ret != 0:
        raise RuntimeError(f'FFmpeg MP4 encoding failed ({ret}): {stderr_out[-500:]}')

    print(f'[Video] Saved {mp4_path} ({mp4_path.stat().st_size / (1024*1024):.2f} MB)')

    cmd_webm = [
        str(FFMPEG_BIN),
        '-y',
        '-i', str(mp4_path),
        '-c:v', 'libvpx-vp9',
        '-b:v', '0',
        '-crf', '33',
        '-row-mt', '1',
        '-an',
        str(webm_path),
    ]
    subprocess.run(cmd_webm, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'[Video] Saved {webm_path} ({webm_path.stat().st_size / (1024*1024):.2f} MB)')


if __name__ == '__main__':
    asset_paths = download_and_optimize_assets()
    build_video(asset_paths)
