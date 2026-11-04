#!/usr/bin/env python3
"""
Builds the 46-second, 30fps 1080p HD synergistic commercial & documentary video
WITH synchronized Spanish voiceover narration + warm ambient soundtrack:
  - public/videos/tarapoto-flamingo-reel.mp4 (H.264 + AAC 192kbps)
  - public/videos/tarapoto-flamingo-reel.webm (VP9 + Opus 160kbps)
  - public/videos/tarapoto-voiceover.mp3
  - public/videos/tarapoto-flamingo-poster.webp
"""
import subprocess
import urllib.parse
import urllib.request
import wave
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r'c:\Users\USUARIO\Desktop\PROYECT-FLAMINGO')
CACHE_DIR = ROOT / 'assets-input' / 'tarapoto-commons'
OUT_TARAPOTO = ROOT / 'public' / 'tarapoto'
OUT_VIDEOS = ROOT / 'public' / 'videos'
FFMPEG_BIN = (
    ROOT
    / 'assets-input'
    / 'video-tools'
    / 'imageio_ffmpeg'
    / 'binaries'
    / 'ffmpeg-win-x86_64-v7.1.exe'
)

NARRATION_CHAPTERS = [
    {
        'id': 'ch1',
        'start_sec': 0.8,
        'phrases': [
            'Vivir en Tarapoto es despertar frente al aire puro de la Cordillera Escalera,',
            'un santuario natural de montañas verdes, clima privilegiado todo el año y aguas cristalinas.',
        ],
    },
    {
        'id': 'ch2',
        'start_sec': 14.8,
        'phrases': [
            'A pocos minutos de joyas naturales como la Catarata de Ahuashiyacu y la Laguna Azul,',
            'Tarapoto se consolida como el destino de mayor crecimiento y valorización inmobiliaria en la Amazonía.',
        ],
    },
    {
        'id': 'ch3',
        'start_sec': 28.8,
        'phrases': [
            'En medio de esta alta valorización nace Flamingo Residencial:',
            'lotes de 160 y 200 metros cuadrados en Prolongación Jirón Cuzco, a solo 30 metros del Colegio Virgen Dolorosa.',
            'Con pórtico construido, agua, desagüe, luz, título independizado y entrega inmediata.',
            'Naturaleza extraordinaria afuera; seguridad urbana y legal dentro de tu propiedad.',
        ],
    },
]


def fetch_tts_phrase_mp3(text: str, out_mp3: Path) -> bool:
    if out_mp3.exists() and out_mp3.stat().st_size > 1500:
        return True
    q = urllib.parse.quote(text)
    url = f'https://translate.google.com/translate_tts?ie=UTF-8&tl=es-US&client=tw-ob&q={q}'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) > 1000:
                out_mp3.write_bytes(data)
                return True
    except Exception as e:
        print(f'[TTS] Warning fetching phrase via web TTS: {e}')
    return False


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
    # Trim leading/trailing silence (< 0.008)
    non_silent = np.where(np.abs(samples) > 0.008)[0]
    if len(non_silent) > 100:
        s0 = max(0, int(non_silent[0]) - int(0.05 * 44100))
        s1 = min(len(samples), int(non_silent[-1]) + int(0.12 * 44100))
        samples = samples[s0:s1]
    return samples


def build_synergistic_audio(duration_sec: float = 52.0) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_VIDEOS.mkdir(parents=True, exist_ok=True)
    sr = 44100
    total_samples = int(round(duration_sec * sr))

    # 1. Synthesize warm, luxury ambient background soundtrack (Stereo)
    t = np.linspace(0.0, duration_sec, total_samples, endpoint=False, dtype=np.float32)

    # Chord progression: Fmaj9 -> Cmaj9 -> Dm9 -> Am9 (cycling every 11.5 seconds)
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
        # Smooth crossfade envelope for each chord
        env = np.clip((t - (c_start - 1.2)) / 2.0, 0.0, 1.0) * np.clip(((c_end + 1.2) - t) / 2.0, 0.0, 1.0)
        for f_idx, f in enumerate(freqs):
            detune = 1.0 + (f_idx - 2) * 0.0008
            vib = 0.0012 * np.sin(2.0 * np.pi * 0.25 * t + f_idx)
            wave_l = np.sin(2.0 * np.pi * f * (1.0 + vib) * t) + 0.25 * np.sin(2.0 * np.pi * (f * 2.0) * t)
            wave_r = np.sin(2.0 * np.pi * (f * detune) * (1.0 - vib) * t + 0.4) + 0.25 * np.sin(2.0 * np.pi * (f * 2.0 * detune) * t)
            pad_l += env * wave_l * (0.032 / len(freqs))
            pad_r += env * wave_r * (0.032 / len(freqs))

    # Gentle crystalline harp/kalimba arpeggio notes (pentatonic C major: C5, D5, E5, G5, A5)
    arp_freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 659.25, 587.33, 523.25]
    note_step = 1.4375  # s
    for n_idx in range(int(duration_sec / note_step)):
        n_time = n_idx * note_step + 0.3
        i0 = int(n_time * sr)
        n_dur = int(2.2 * sr)
        i1 = min(total_samples, i0 + n_dur)
        if i1 <= i0:
            continue
        nt = np.arange(i1 - i0, dtype=np.float32) / sr
        freq = arp_freqs[n_idx % len(arp_freqs)]
        # Plucked exponential decay envelope
        n_env = (1.0 - np.exp(-nt * 45.0)) * np.exp(-nt * 2.1)
        tone = np.sin(2.0 * np.pi * freq * nt) + 0.3 * np.sin(2.0 * np.pi * freq * 2.0 * nt) * np.exp(-nt * 5.0)
        pan = 0.35 + 0.3 * ((n_idx % 3) - 1)
        pad_l[i0:i1] += tone * n_env * 0.022 * pan
        pad_r[i0:i1] += tone * n_env * 0.022 * (1.0 - pan)

    # Master fade-in (1.2s) and fade-out (2.0s)
    master_env = np.clip(t / 1.2, 0.0, 1.0) * np.clip((duration_sec - t) / 2.0, 0.0, 1.0)
    pad_l *= master_env
    pad_r *= master_env

    # 2. Assemble Spanish Voiceover Track + sidechain ducking
    vo_track = np.zeros(total_samples, dtype=np.float32)

    for ch in NARRATION_CHAPTERS:
        cursor_sample = int(round(ch['start_sec'] * sr))
        for p_idx, phrase in enumerate(ch['phrases']):
            mp3_cache = CACHE_DIR / f"vo_{ch['id']}_{p_idx}.mp3"
            ok = fetch_tts_phrase_mp3(phrase, mp3_cache)
            if ok:
                samples = decode_audio_to_mono_44k(mp3_cache)
                # Slightly warm and normalize voiceover
                peak = np.max(np.abs(samples))
                if peak > 0.01:
                    samples = (samples / peak) * 0.82
                end_sample = min(total_samples, cursor_sample + len(samples))
                if end_sample > cursor_sample:
                    vo_track[cursor_sample:end_sample] += samples[: end_sample - cursor_sample]
                    cursor_sample = end_sample + int(0.24 * sr)  # natural breath pause between clauses

    # Compute smooth ducking envelope so music lowers gently when voice speaks
    vo_energy = np.abs(vo_track)
    # 200ms moving average
    win = int(0.20 * sr)
    kernel = np.ones(win, dtype=np.float32) / win
    vo_env = np.convolve(vo_energy, kernel, mode='same')
    duck = 1.0 - 0.42 * np.clip(vo_env * 6.0, 0.0, 1.0)

    mix_l = np.clip(pad_l * duck + vo_track * 0.92, -0.98, 0.98)
    mix_r = np.clip(pad_r * duck + vo_track * 0.92, -0.98, 0.98)

    stereo_int16 = np.empty((total_samples, 2), dtype=np.int16)
    stereo_int16[:, 0] = (mix_l * 32767.0).astype(np.int16)
    stereo_int16[:, 1] = (mix_r * 32767.0).astype(np.int16)

    wav_path = CACHE_DIR / 'tarapoto-master-audio.wav'
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
    print(f'[Audio] Generated synchronized voiceover + ambient soundtrack: {mp3_out.name}')
    return wav_path


def load_cover_1080p(path: Path, overscan: float = 1.20) -> np.ndarray:
    with Image.open(path) as im:
        rgb = np.array(im.convert('RGB'))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    h, w = bgr.shape[:2]
    target_w = int(1920 * overscan)
    target_h = int(1080 * overscan)
    scale = max(target_w / w, target_h / h)
    new_w = int(round(w * scale))
    new_h = int(round(h * scale))
    return cv2.resize(bgr, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)


def sample_ken_burns(
    img_overscan: np.ndarray,
    t: float,
    zoom_start: float = 1.0,
    zoom_end: float = 1.11,
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

    M = np.array([[scale_x, 0.0, src_x0], [0.0, scale_y, src_y0]], dtype=np.float32)
    return cv2.warpAffine(
        img_overscan,
        M,
        (1920, 1080),
        flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP,
        borderMode=cv2.BORDER_REFLECT_101,
    )


def make_cinematic_vignette() -> np.ndarray:
    overlay_np = np.zeros((1080, 1920, 4), dtype=np.uint8)
    y_coords = np.linspace(0.0, 1.0, 1080)[:, None]
    bottom_alpha = np.clip((y_coords - 0.58) / 0.42, 0.0, 1.0) ** 1.5 * 145.0
    top_alpha = np.clip((0.18 - y_coords) / 0.18, 0.0, 1.0) ** 1.6 * 70.0
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

    start_idx = min(10, len(raw_frames) - 1)
    indices = np.linspace(start_idx, len(raw_frames) - 1, target_count)
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
    img_c1 = load_cover_1080p(OUT_TARAPOTO / 'cordillera-escalera-bosque.webp', 1.22)
    img_c2 = load_cover_1080p(OUT_TARAPOTO / 'cordillera-escalera-valle.webp', 1.22)
    img_c3 = load_cover_1080p(OUT_TARAPOTO / 'tarapoto-ruta-cordillera.webp', 1.22)
    img_t1 = load_cover_1080p(OUT_TARAPOTO / 'catarata-ahuashiyacu.webp', 1.22)
    img_t2 = load_cover_1080p(OUT_TARAPOTO / 'laguna-azul-sauce.webp', 1.22)
    img_t3 = load_cover_1080p(OUT_TARAPOTO / 'fauna-gallito-rocas.webp', 1.22)
    img_p1 = load_cover_1080p(ROOT / 'public' / 'drive' / '2d' / 'img-0751.webp', 1.18)
    img_p2 = load_cover_1080p(ROOT / 'public' / 'urbanization' / 'flamingo-render-clean.webp', 1.16)

    vignette = make_cinematic_vignette()

    def render_seg(img, duration_s, z0, z1, px, py):
        n_frames = int(round(duration_s * fps))
        out = []
        for i in range(n_frames):
            t = i / max(1, n_frames - 1)
            f = sample_ken_burns(img, t, z0, z1, px, py)
            out.append(blend_overlay(f, vignette, 1.0))
        return out

    # Chapter 1 (0.0s -> ~14.5s): Cordillera Escalera
    print('[Video 30fps] Rendering Chapter 1: 01. Cordillera Escalera...')
    s1 = render_seg(img_c1, 5.2, 1.00, 1.10, (-0.35, 0.25), (-0.15, 0.15))
    s2 = render_seg(img_c2, 5.2, 1.02, 1.11, (0.30, -0.25), (0.10, -0.15))
    s3 = render_seg(img_c3, 4.8, 1.00, 1.09, (-0.25, 0.30), (0.20, -0.15))

    # Chapter 2 (~14.5s -> ~28.5s): Ruta Turística (Ahuashiyacu, Laguna Azul, Biodiversidad)
    print('[Video 30fps] Rendering Chapter 2: 02. Ruta Turística...')
    s4 = render_seg(img_t1, 5.2, 1.00, 1.11, (0.0, 0.0), (0.35, -0.30))
    s5 = render_seg(img_t2, 5.2, 1.01, 1.10, (-0.40, 0.35), (0.0, -0.15))
    s6 = render_seg(img_t3, 4.4, 1.00, 1.10, (0.25, -0.15), (-0.15, 0.10))

    # Chapter 3 (~28.5s -> 52.0s): Plusvalía en Tarapoto (Real DJI Drone Flight + Obra Real + Render + End-Card)
    print('[Video 30fps] Rendering Chapter 3: 03. Plusvalía en Tarapoto (DJI Drone + Proyecto)...')
    drone_raw = load_drone_frames(int(round(11.5 * fps)))
    s7 = [blend_overlay(df, vignette, 0.85) for df in drone_raw]
    s8 = render_seg(img_p1, 4.8, 1.00, 1.09, (-0.25, 0.25), (0.15, -0.15))
    s9 = render_seg(img_p2, 4.8, 1.00, 1.08, (0.0, 0.0), (0.25, -0.20))

    brand_card = build_closing_brand_card(
        sample_ken_burns(img_p1, 0.5, 1.04, 1.04, (0, 0), (0, 0)),
        ROOT / 'public' / 'brand' / 'logo-flamingo-light.png',
    )
    s10 = [brand_card for _ in range(int(round(4.2 * fps)))]

    segments = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10]

    # Smooth 15-frame (0.5s) crossfades between segments
    crossfade = 15
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
    print(f'[Video 30fps] Assembled {total_frames} frames ({duration_s:.1f}s at {fps}fps). Muxing with audio...')

    poster_path = OUT_VIDEOS / 'tarapoto-flamingo-poster.webp'
    poster_rgb = cv2.cvtColor(master_frames[int(fps * 1.5)], cv2.COLOR_BGR2RGB)
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
        '22',
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
        '0',
        '-crf',
        '33',
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
    wav_file = build_synergistic_audio(52.0)
    build_synergistic_video(wav_file)
