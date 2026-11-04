#!/usr/bin/env python3
"""
Builds the 48-second, 30fps 1080p HD documentary & real estate reel
with Natural Peruvian Spanish Neural Voiceover (es-PE-CamilaNeural via edge-tts),
real moving video footage (4K DJI drone flight, Google Flow architectural clips,
and real 1080p/4K nature & waterfall footage), and warm ambient soundtrack:
  - public/videos/tarapoto-flamingo-reel.mp4 (H.264 + AAC 192kbps)
  - public/videos/tarapoto-flamingo-reel.webm (VP9 + Opus 160kbps)
  - public/videos/tarapoto-voiceover.mp3
  - public/videos/tarapoto-flamingo-poster.webp
"""
import subprocess
import sys
import urllib.request
import wave
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(r'c:\Users\USUARIO\Desktop\PROYECT-FLAMINGO')
CACHE_DIR = ROOT / 'assets-input' / 'tarapoto-commons'
OUT_TARAPOTO = ROOT / 'public' / 'tarapoto'
OUT_VIDEOS = ROOT / 'public' / 'videos'
EDGE_TTS_BIN = ROOT / '.venv' / 'Scripts' / 'edge-tts.exe'
FFMPEG_BIN = (
    ROOT
    / 'assets-input'
    / 'video-tools'
    / 'imageio_ffmpeg'
    / 'binaries'
    / 'ffmpeg-win-x86_64-v7.1.exe'
)

REAL_NATURE_VIDEOS = {
    'valley_drone.webm': 'https://upload.wikimedia.org/wikipedia/commons/8/84/Beaverhead-River-Drone-Shot.webm',
    'waterfall_1080p.webm': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Karkloof_Falls_%2853460015297%29.webm',
    'river_drone.webm': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Big-Hole-River-Drone-Shot.webm',
    'butterfly_4k.webm': 'https://upload.wikimedia.org/wikipedia/commons/5/55/%22%2Barya%2B%22_4K_Danaus_chrysippus_on_ipomoea_aquatica_-_Pilangsari_2019.webm',
}

NARRATION_CHAPTERS = [
    {
        'id': 'ch1',
        'start_sec': 0.5,
        'text': (
            'Vivir en Tarapoto es despertar frente al aire puro de la Cordillera Escalera, '
            'un santuario de montañas verdes y aguas cristalinas que regulan nuestro clima todo el año.'
        ),
    },
    {
        'id': 'ch2',
        'start_sec': 9.8,
        'text': (
            'A pocos minutos de la Catarata de Ahuashiyacu y la Laguna Azul de Sauce, '
            'Tarapoto lidera el crecimiento turístico y la valorización inmobiliaria en la Amazonía.'
        ),
    },
    {
        'id': 'ch3',
        'start_sec': 19.2,
        'text': (
            'Un ecosistema vivo donde conviven el Gallito de las Rocas, '
            'mariposas tropicales y heliconias amazónicas que inspiran cada espacio de nuestro proyecto.'
        ),
    },
    {
        'id': 'ch4',
        'start_sec': 27.6,
        'text': (
            'En el corazón de esta plusvalía nace Flamingo Residencial: '
            'lotes de 160 y 200 metros cuadrados en Prolongación Jirón Cuzco, a 30 metros del Colegio Virgen Dolorosa, '
            'con pórtico en piedra y madera, agua, desagüe y luz.'
        ),
    },
    {
        'id': 'ch5',
        'start_sec': 41.2,
        'text': (
            'Con título independizado y entrega inmediata, '
            'convierte tu inversión en el hogar que tu familia merece en Tarapoto.'
        ),
    },
]


def ensure_wikimedia_video(filename: str, url: str) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    dest = CACHE_DIR / filename
    if dest.exists() and dest.stat().st_size > 200_000:
        return dest
    print(f'[Video Cache] Downloading real nature clip {filename}...')
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'FlamingoShowroomBuilder/2.0 (https://proyect-flamingo.vercel.app; contact@residencialflamingo.com)'
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
        dest.write_bytes(data)
    print(f'[Video Cache] Saved {filename} ({len(data) / (1024*1024):.2f} MB)')
    return dest


def synthesize_neural_es_pe(text: str, out_mp3: Path, voice: str = 'es-PE-CamilaNeural') -> bool:
    if out_mp3.exists() and out_mp3.stat().st_size > 4000:
        return True
    cmd = [
        str(EDGE_TTS_BIN),
        '--voice',
        voice,
        '--rate=-2%',
        '--pitch=-1Hz',
        '--text',
        text,
        '--write-media',
        str(out_mp3),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out_mp3.exists() and out_mp3.stat().st_size > 2000


def decode_audio_to_mono_44k(audio_path: Path) -> np.ndarray:
    cmd = [
        str(FFMPEG_BIN),
        '-y',
        '-i',
        str(audio_path),
        '-f',
        'f32le',
        '-acodec',
        'pcm_f32le',
        '-ac',
        '1',
        '-ar',
        '44100',
        '-',
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    samples = np.frombuffer(proc.stdout, dtype=np.float32).copy()
    non_silent = np.where(np.abs(samples) > 0.008)[0]
    if len(non_silent) > 100:
        s0 = max(0, int(non_silent[0]) - int(0.04 * 44100))
        s1 = min(len(samples), int(non_silent[-1]) + int(0.10 * 44100))
        samples = samples[s0:s1]
    return samples


def build_synergistic_audio(duration_sec: float = 48.0) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_VIDEOS.mkdir(parents=True, exist_ok=True)
    sr = 44100
    total_samples = int(round(duration_sec * sr))

    # 1. Warm acoustic & ambient soundtrack (Stereo)
    t = np.linspace(0.0, duration_sec, total_samples, endpoint=False, dtype=np.float32)
    chords = [
        [174.61, 220.00, 261.63, 329.63, 392.00],  # Fmaj9
        [130.81, 196.00, 246.94, 293.66, 329.63],  # Cmaj9
        [146.83, 220.00, 261.63, 329.63, 349.23],  # Dm9
        [110.00, 164.81, 220.00, 246.94, 329.63],  # Am9
    ]
    pad_l = np.zeros(total_samples, dtype=np.float32)
    pad_r = np.zeros(total_samples, dtype=np.float32)

    chord_len = duration_sec / 4.0
    for c_idx, freqs in enumerate(chords):
        c_start = c_idx * chord_len
        c_end = (c_idx + 1) * chord_len
        env = np.clip((t - (c_start - 1.2)) / 2.0, 0.0, 1.0) * np.clip(((c_end + 1.2) - t) / 2.0, 0.0, 1.0)
        for f_idx, f in enumerate(freqs):
            detune = 1.0 + (f_idx - 2) * 0.0008
            vib = 0.0011 * np.sin(2.0 * np.pi * 0.22 * t + f_idx)
            wave_l = np.sin(2.0 * np.pi * f * (1.0 + vib) * t) + 0.22 * np.sin(2.0 * np.pi * (f * 2.0) * t)
            wave_r = np.sin(2.0 * np.pi * (f * detune) * (1.0 - vib) * t + 0.35) + 0.22 * np.sin(2.0 * np.pi * (f * 2.0 * detune) * t)
            pad_l += env * wave_l * (0.028 / len(freqs))
            pad_r += env * wave_r * (0.028 / len(freqs))

    # Gentle warm harp/kalimba notes
    arp_freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 659.25, 587.33, 523.25]
    note_step = 1.5
    for n_idx in range(int(duration_sec / note_step)):
        n_time = n_idx * note_step + 0.25
        i0 = int(n_time * sr)
        n_dur = int(2.1 * sr)
        i1 = min(total_samples, i0 + n_dur)
        if i1 <= i0:
            continue
        nt = np.arange(i1 - i0, dtype=np.float32) / sr
        freq = arp_freqs[n_idx % len(arp_freqs)]
        n_env = (1.0 - np.exp(-nt * 42.0)) * np.exp(-nt * 2.2)
        tone = np.sin(2.0 * np.pi * freq * nt) + 0.25 * np.sin(2.0 * np.pi * freq * 2.0 * nt) * np.exp(-nt * 5.0)
        pan = 0.35 + 0.3 * ((n_idx % 3) - 1)
        pad_l[i0:i1] += tone * n_env * 0.018 * pan
        pad_r[i0:i1] += tone * n_env * 0.018 * (1.0 - pan)

    master_env = np.clip(t / 1.0, 0.0, 1.0) * np.clip((duration_sec - t) / 1.8, 0.0, 1.0)
    pad_l *= master_env
    pad_r *= master_env

    # 2. Natural Peruvian Spanish Neural Voiceover (es-PE-CamilaNeural)
    vo_track = np.zeros(total_samples, dtype=np.float32)

    for ch in NARRATION_CHAPTERS:
        mp3_cache = CACHE_DIR / f"vo_neural_es_pe_{ch['id']}_v2.mp3"
        synthesize_neural_es_pe(ch['text'], mp3_cache, voice='es-PE-CamilaNeural')
        samples = decode_audio_to_mono_44k(mp3_cache)
        peak = np.max(np.abs(samples))
        if peak > 0.01:
            samples = (samples / peak) * 0.86
        start_sample = int(round(ch['start_sec'] * sr))
        end_sample = min(total_samples, start_sample + len(samples))
        if end_sample > start_sample:
            vo_track[start_sample:end_sample] = samples[: end_sample - start_sample]
            dur_s = (end_sample - start_sample) / sr
            print(f"[Neural Voice es-PE-CamilaNeural] {ch['id']}: {ch['start_sec']:.1f}s -> {ch['start_sec'] + dur_s:.1f}s ({dur_s:.1f}s)")

    # Smooth sidechain ducking when voice is active
    vo_energy = np.abs(vo_track)
    win = int(0.18 * sr)
    kernel = np.ones(win, dtype=np.float32) / win
    vo_env = np.convolve(vo_energy, kernel, mode='same')
    duck = 1.0 - 0.48 * np.clip(vo_env * 5.5, 0.0, 1.0)

    mix_l = np.clip(pad_l * duck + vo_track * 0.94, -0.98, 0.98)
    mix_r = np.clip(pad_r * duck + vo_track * 0.94, -0.98, 0.98)

    stereo_int16 = np.empty((total_samples, 2), dtype=np.int16)
    stereo_int16[:, 0] = (mix_l * 32767.0).astype(np.int16)
    stereo_int16[:, 1] = (mix_r * 32767.0).astype(np.int16)

    wav_path = CACHE_DIR / 'tarapoto-master-audio-neural.wav'
    with wave.open(str(wav_path), 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(stereo_int16.tobytes())

    mp3_out = OUT_VIDEOS / 'tarapoto-voiceover.mp3'
    subprocess.run(
        [
            str(FFMPEG_BIN),
            '-y',
            '-i',
            str(wav_path),
            '-codec:a',
            'libmp3lame',
            '-b:a',
            '192k',
            str(mp3_out),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f'[Audio] Saved Peruvian neural voiceover + soundtrack: {mp3_out.name}')
    return wav_path


def load_video_clip_frames(
    video_path: Path,
    duration_sec: float,
    fps: int = 30,
    start_frac: float = 0.05,
    end_frac: float = 0.92,
    warm_grade: bool = True,
) -> list[np.ndarray]:
    """Extracts and resamples real moving video frames at 1920x1080 (cover fit)."""
    target_count = int(round(duration_sec * fps))
    cap = cv2.VideoCapture(str(video_path))
    raw_frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        h, w = frame.shape[:2]
        if w != 1920 or h != 1080:
            scale = max(1920.0 / w, 1080.0 / h)
            nw, nh = int(round(w * scale)), int(round(h * scale))
            resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_AREA if scale < 1.0 else cv2.INTER_LANCZOS4)
            x0 = (nw - 1920) // 2
            y0 = (nh - 1080) // 2
            frame = resized[y0 : y0 + 1080, x0 : x0 + 1920]
        if warm_grade:
            # Subtle filmic color harmony
            frame = cv2.convertScaleAbs(frame, alpha=1.03, beta=2)
        raw_frames.append(frame)
    cap.release()

    if not raw_frames:
        raise RuntimeError(f'No frames read from {video_path}')

    i_start = int(len(raw_frames) * start_frac)
    i_end = max(i_start + 1, int(len(raw_frames) * end_frac) - 1)
    indices = np.linspace(i_start, min(len(raw_frames) - 1, i_end), target_count)
    out = []
    for idx in indices:
        i0 = int(np.floor(idx))
        i1 = min(len(raw_frames) - 1, i0 + 1)
        frac = idx - i0
        if frac < 0.01 or i0 == i1:
            out.append(raw_frames[i0])
        else:
            out.append(cv2.addWeighted(raw_frames[i0], 1.0 - frac, raw_frames[i1], frac, 0.0))
    return out


def render_25d_parallax_clip(
    img_path: Path,
    duration_sec: float,
    fps: int = 30,
    zoom_start: float = 1.02,
    zoom_end: float = 1.12,
    pan_x: tuple[float, float] = (-0.28, 0.28),
    pan_y: tuple[float, float] = (-0.18, 0.18),
    water_shimmer: bool = False,
    cloud_mist: bool = False,
) -> list[np.ndarray]:
    """Renders 2.5D depth-map parallax motion with optional animated water ripples or cloud mist."""
    with Image.open(img_path) as im:
        rgb = np.array(im.convert('RGB'))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    h, w = bgr.shape[:2]
    scale = max((1920 * 1.24) / w, (1080 * 1.24) / h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    overscan = cv2.resize(bgr, (nw, nh), interpolation=cv2.INTER_LANCZOS4)

    # Estimate pseudo-depth map from luminance + vertical gradient (foreground bottom, sky top)
    gray = cv2.cvtColor(overscan, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    y_grad = np.linspace(0.15, 1.0, nh, dtype=np.float32)[:, None]
    depth = cv2.GaussianBlur(0.55 * y_grad + 0.45 * gray, (0, 0), 18.0)

    base_x, base_y = np.meshgrid(np.arange(1920, dtype=np.float32), np.arange(1080, dtype=np.float32))
    n_frames = int(round(duration_sec * fps))
    out = []

    for i in range(n_frames):
        t = i / max(1, n_frames - 1)
        s = 0.5 - 0.5 * np.cos(np.pi * t)
        zoom = zoom_start + (zoom_end - zoom_start) * s
        crop_w = 1920.0 / zoom
        crop_h = 1080.0 / zoom

        max_dx = max(0.0, (nw - crop_w) * 0.5)
        max_dy = max(0.0, (nh - crop_h) * 0.5)
        px = pan_x[0] + (pan_x[1] - pan_x[0]) * s
        py = pan_y[0] + (pan_y[1] - pan_y[0]) * s

        cx = nw * 0.5 + px * max_dx
        cy = nh * 0.5 + py * max_dy
        src_x0 = cx - crop_w * 0.5
        src_y0 = cy - crop_h * 0.5

        map_x = (src_x0 + (base_x / 1920.0) * crop_w).astype(np.float32)
        map_y = (src_y0 + (base_y / 1080.0) * crop_h).astype(np.float32)

        # Sample depth at current window for differential 2.5D foreground/background shift
        d_win = cv2.remap(depth, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
        parallax_shift = np.float32((s - 0.5) * 22.0)
        map_x = (map_x + (d_win - 0.5) * parallax_shift).astype(np.float32)
        map_y = (map_y + (d_win - 0.5) * (parallax_shift * 0.45)).astype(np.float32)

        if water_shimmer:
            # Animated water ripple displacement on lower half / waterfall column
            water_mask = np.clip((base_y / 1080.0 - 0.32) / 0.68, 0.0, 1.0).astype(np.float32)
            ripple_x = (np.sin(base_y * 0.085 - i * 0.32) * 2.2 * water_mask).astype(np.float32)
            ripple_y = (np.cos(base_x * 0.055 + i * 0.26) * 1.4 * water_mask).astype(np.float32)
            map_x = (map_x + ripple_x).astype(np.float32)
            map_y = (map_y + ripple_y).astype(np.float32)

        frame = cv2.remap(overscan, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)

        if cloud_mist:
            # Subtle drifting atmospheric cloud mist in upper mountain canopy
            mist_y = np.clip((0.55 - base_y / 1080.0) / 0.55, 0.0, 1.0)
            mist_wave = (
                0.5
                + 0.5 * np.sin((base_x + i * 3.2) * 0.0045 + np.cos(base_y * 0.008))
            ).astype(np.float32)
            mist_alpha = (mist_y * mist_wave * 0.14)[:, :, None]
            mist_color = np.full_like(frame, (245, 240, 248), dtype=np.float32)
            frame = np.clip(frame.astype(np.float32) * (1.0 - mist_alpha) + mist_color * mist_alpha, 0, 255).astype(np.uint8)

        out.append(frame)
    return out


def make_cinematic_vignette() -> np.ndarray:
    overlay_np = np.zeros((1080, 1920, 4), dtype=np.uint8)
    y_coords = np.linspace(0.0, 1.0, 1080)[:, None]
    bottom_alpha = np.clip((y_coords - 0.62) / 0.38, 0.0, 1.0) ** 1.5 * 130.0
    top_alpha = np.clip((0.16 - y_coords) / 0.16, 0.0, 1.0) ** 1.6 * 60.0
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
            ly = 155
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

    tagline = 'Tu terreno propio en Tarapoto, listo para construir hoy'
    tw = draw.textlength(tagline, font=font_h)
    draw.text(((1920 - tw) / 2, 632), tagline, font=font_h, fill=(245, 241, 250, 255))

    details = 'Lotes de 160 m² y 200 m²  ·  Prolongación Jr. Cuzco s/n, a 30m del Colegio Virgen Dolorosa'
    dw = draw.textlength(details, font=font_p)
    draw.text(((1920 - dw) / 2, 706), details, font=font_p, fill=(234, 227, 242, 225))

    cta = '+51 989 195 093   ·   @ResidencialFlamingo   ·   aurora.aybar@gmail.com'
    cw = draw.textlength(cta, font=font_b)
    draw.rounded_rectangle(((1920 - cw) / 2 - 38, 772, (1920 + cw) / 2 + 38, 836), radius=32, fill=(238, 107, 150, 240))
    draw.text(((1920 - cw) / 2, 786), cta, font=font_b, fill=(35, 17, 43, 255))

    return cv2.cvtColor(np.array(canvas.convert('RGB')), cv2.COLOR_RGB2BGR)


def build_synergistic_video(wav_path: Path):
    fps = 30
    vignette = make_cinematic_vignette()

    # Ensure real Wikimedia video clips are cached locally
    v_valley = ensure_wikimedia_video('valley_drone.webm', REAL_NATURE_VIDEOS['valley_drone.webm'])
    v_waterfall = ensure_wikimedia_video('waterfall_1080p.webm', REAL_NATURE_VIDEOS['waterfall_1080p.webm'])
    v_river = ensure_wikimedia_video('river_drone.webm', REAL_NATURE_VIDEOS['river_drone.webm'])
    v_butterfly = ensure_wikimedia_video('butterfly_4k.webm', REAL_NATURE_VIDEOS['butterfly_4k.webm'])

    # Chapter 1 (0.0s -> ~9.6s): 01. Cordillera Escalera (Real Valley Drone + 2.5D Cloud Forest)
    print('[Video 30fps] Rendering Chapter 1: 01. Cordillera Escalera (Real Drone + 2.5D Cloud Mist)...')
    s1 = [
        blend_overlay(f, vignette, 0.85)
        for f in load_video_clip_frames(v_valley, 5.2, fps, start_frac=0.08, end_frac=0.88)
    ]
    s2 = [
        blend_overlay(f, vignette, 0.90)
        for f in render_25d_parallax_clip(
            OUT_TARAPOTO / 'cordillera-escalera-bosque.webp',
            4.8,
            fps,
            1.02,
            1.12,
            (-0.25, 0.25),
            (-0.12, 0.12),
            cloud_mist=True,
        )
    ]

    # Chapter 2 (~9.6s -> ~19.2s): 02. Turismo y Cataratas (Real Waterfall 1080p Video + Laguna Azul River Drone)
    print('[Video 30fps] Rendering Chapter 2: 02. Cataratas y Laguna Azul (Real 1080p Waterfall & River Clips)...')
    s3 = [
        blend_overlay(f, vignette, 0.85)
        for f in load_video_clip_frames(v_waterfall, 5.2, fps, start_frac=0.05, end_frac=0.92)
    ]
    s4 = [
        blend_overlay(f, vignette, 0.88)
        for f in load_video_clip_frames(v_river, 4.8, fps, start_frac=0.10, end_frac=0.85)
    ]

    # Chapter 3 (~19.2s -> ~27.6s): 03. Fauna y Flora Amazónica (Real 4K Butterfly Video + 2.5D Gallito de las Rocas)
    print('[Video 30fps] Rendering Chapter 3: 03. Fauna y Flora (Real 4K Butterfly Clip + 2.5D Gallito de las Rocas)...')
    s5 = [
        blend_overlay(f, vignette, 0.85)
        for f in load_video_clip_frames(v_butterfly, 4.8, fps, start_frac=0.08, end_frac=0.85)
    ]
    s6 = [
        blend_overlay(f, vignette, 0.90)
        for f in render_25d_parallax_clip(
            OUT_TARAPOTO / 'fauna-gallito-rocas.webp',
            4.2,
            fps,
            1.02,
            1.11,
            (0.22, -0.18),
            (-0.12, 0.10),
        )
    ]

    # Chapter 4 (~27.6s -> ~39.0s): 04. Vuelo DJI Real sobre Residencial Flamingo
    print('[Video 30fps] Rendering Chapter 4: 04. Vuelo Real DJI sobre Residencial Flamingo...')
    drone_path = ROOT / 'assets-input' / 'drive-previews' / 'source-drone.mp4'
    s7 = [
        blend_overlay(f, vignette, 0.82)
        for f in load_video_clip_frames(drone_path, 11.8, fps, start_frac=0.04, end_frac=0.96, warm_grade=False)
    ]

    # Chapter 5 (~39.0s -> 48.0s): 05. Proyección Google Flow & Entrega Inmediata
    print('[Video 30fps] Rendering Chapter 5: 05. Transformación Google Flow + Cierre de Marca...')
    flow_portico = ROOT / 'public' / 'videos' / 'transform-portico.mp4'
    flow_master = ROOT / 'public' / 'videos' / 'flamingo-flow.mp4'
    s8 = [
        blend_overlay(f, vignette, 0.82)
        for f in load_video_clip_frames(flow_portico, 3.6, fps, start_frac=0.0, end_frac=0.98, warm_grade=False)
    ]
    s9 = [
        blend_overlay(f, vignette, 0.82)
        for f in load_video_clip_frames(flow_master, 4.2, fps, start_frac=0.10, end_frac=0.98, warm_grade=False)
    ]

    brand_card = build_closing_brand_card(
        s9[-1],
        ROOT / 'public' / 'brand' / 'logo-flamingo-light.png',
    )
    s10 = [brand_card for _ in range(int(round(2.8 * fps)))]

    segments = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10]

    # Smooth 12-frame (0.4s) crossfades between segments
    crossfade = 12
    master_frames: list[np.ndarray] = list(segments[0])
    for seg in segments[1:]:
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
    duration_s = total_frames / fps
    print(f'[Video 30fps] Assembled {total_frames} frames ({duration_s:.1f}s at {fps}fps). Muxing with neural audio...')

    poster_path = OUT_VIDEOS / 'tarapoto-flamingo-poster.webp'
    poster_rgb = cv2.cvtColor(master_frames[int(fps * 1.2)], cv2.COLOR_BGR2RGB)
    Image.fromarray(poster_rgb).save(poster_path, 'WEBP', quality=88, method=6)

    mp4_path = OUT_VIDEOS / 'tarapoto-flamingo-reel.mp4'
    webm_path = OUT_VIDEOS / 'tarapoto-flamingo-reel.webm'

    cmd_mp4 = [
        str(FFMPEG_BIN),
        '-y',
        '-f',
        'rawvideo',
        '-vcodec',
        'rawvideo',
        '-s',
        '1920x1080',
        '-pix_fmt',
        'bgr24',
        '-r',
        str(fps),
        '-i',
        '-',
        '-i',
        str(wav_path),
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'libx264',
        '-preset',
        'medium',
        '-crf',
        '26',
        '-maxrate',
        '3200k',
        '-bufsize',
        '6400k',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-shortest',
        '-movflags',
        '+faststart',
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
        raise RuntimeError(f'FFmpeg MP4 muxing failed ({ret}): {stderr_out[-500:]}')

    print(f'[Video] Saved {mp4_path} ({mp4_path.stat().st_size / (1024*1024):.2f} MB)')

    cmd_webm = [
        str(FFMPEG_BIN),
        '-y',
        '-i',
        str(mp4_path),
        '-c:v',
        'libvpx-vp9',
        '-b:v',
        '2200k',
        '-maxrate',
        '3000k',
        '-bufsize',
        '6000k',
        '-crf',
        '35',
        '-row-mt',
        '1',
        '-c:a',
        'libopus',
        '-b:a',
        '160k',
        str(webm_path),
    ]
    subprocess.run(cmd_webm, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'[Video] Saved {webm_path} ({webm_path.stat().st_size / (1024*1024):.2f} MB)')


if __name__ == '__main__':
    wav_file = build_synergistic_audio(48.0)
    build_synergistic_video(wav_file)
