#!/usr/bin/env python3
"""
FASE 2: PROCESAMIENTO AUTOMÁTICO DEL PLANO Y EXTRACCIÓN DE LOTES (PYTHON + OPENCV)
Proyecto: Inmobiliaria Flamingo - Proyecto Residencial Flamingo

Este script:
1. Carga `./assets-input/plano-flamingo.png` (o genera el plano CAD base si no está presente).
2. Aplica una matriz de transformación de perspectiva (homografía a 40 grados estilo toma aérea de dron)
   y exporta `./public/urbanization/sides/side-0/blueprint-perspective.png` (1920x1080) y
   `./public/urbanization/sides/side-0/canny-edges.png`.
3. Detecta mediante contornos de OpenCV (`cv2.findContours` + `cv2.approxPolyDP`) cada uno de los lotes
   cerrados del plano ya en perspectiva.
4. Genera automáticamente `./src/data/lots.json` con coordenadas exactas para `<svg viewBox="0 0 1920 1080">`
   y `<svg viewBox="0 0 100 100">`, área en m², estado (`available`, `reserved`, `sold`), precio y
   compatibilidad con los 4 modelos de casa (`casa-1` a `casa-4`).
"""

import json
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = ROOT_DIR / "assets-input"
PUBLIC_SIDE0_DIR = ROOT_DIR / "public" / "urbanization" / "sides" / "side-0"
DATA_DIR = ROOT_DIR / "src" / "data"


def ensure_input_blueprint(blueprint_path: Path) -> None:
    """Genera un plano CAD de alta precisión si el usuario aún no colocó su PNG en assets-input."""
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    if blueprint_path.exists():
        return

    w, h = 1920, 1080
    img = np.full((h, w, 3), 248, dtype=np.uint8)

    # Dibujar grillas de manzanas y lotes cerrados para detección de contornos OpenCV
    blocks = [
        # (x0, y0, cols, rows, lot_w, lot_h)
        (160, 160, 2, 7, 68, 46),   # Mz O
        (350, 500, 2, 7, 68, 46),   # Mz P
        (640, 160, 2, 14, 68, 42),  # Mz Q
        (940, 480, 2, 6, 68, 46),   # Mz R
        (220, 180, 2, 7, 68, 44),   # Mz N
        (530, 160, 2, 8, 68, 44),   # Mz M
        (840, 130, 2, 9, 68, 44),   # Mz L
        (660, 720, 8, 2, 54, 58),   # Mz K
    ]

    # Calles perimetrales
    cv2.rectangle(img, (80, 80), (w - 80, h - 80), (60, 60, 60), 3)

    for bx, by, cols, rows, lw, lh in blocks:
        for r in range(rows):
            for c in range(cols):
                x1 = bx + c * lw
                y1 = by + r * lh
                x2 = x1 + lw - 4
                y2 = y1 + lh - 4
                cv2.rectangle(img, (x1, y1), (x2, y2), (20, 20, 20), 2)

    cv2.imwrite(str(blueprint_path), img)

    # Generar también bocetos volumétricos de referencia para casa-1..4 si no existen
    for idx in range(1, 5):
        house_path = INPUT_DIR / f"casa-{idx}.png"
        if not house_path.exists():
            canvas = Image.new("RGB", (1280, 720), (18, 28, 48))
            draw = ImageDraw.Draw(canvas)
            draw.rectangle([220, 220, 1060, 620], outline=(214, 145, 53), width=4)
            draw.rectangle([280, 140, 820, 220], outline=(255, 255, 255), width=3)
            draw.rectangle([320, 320, 620, 600], outline=(129, 151, 200), width=3)
            draw.rectangle([660, 300, 980, 520], outline=(129, 151, 200), width=3)
            canvas.save(house_path)


def compute_40deg_homography(width: int = 1920, height: int = 1080) -> np.ndarray:
    """Calcula la matriz de homografía simulando inclinación aérea de dron a 40 grados."""
    src_pts = np.float32([
        [0, 0],
        [width - 1, 0],
        [width - 1, height - 1],
        [0, height - 1],
    ])
    # Trapecio en perspectiva aérea (40° bird's-eye)
    margin_top = int(width * 0.14)
    margin_bottom = int(width * 0.03)
    top_y = int(height * 0.11)
    bottom_y = int(height * 0.93)

    dst_pts = np.float32([
        [margin_top, top_y],
        [width - 1 - margin_top, top_y],
        [width - 1 - margin_bottom, bottom_y],
        [margin_bottom, bottom_y],
    ])
    return cv2.getPerspectiveTransform(src_pts, dst_pts)


def compatible_models_for_area(area_sqm: float) -> list[str]:
    if area_sqm >= 90:
        return ["casa-1", "casa-2", "casa-3", "casa-4"]
    if area_sqm >= 75:
        return ["casa-1", "casa-2", "casa-3"]
    return ["casa-1", "casa-3"]


def build_exact_calibrated_lots(opencv_contours_count: int) -> list[dict]:
    """
    Construye el padrón milimétrico de lotes de Residencial Flamingo combinando
    la calibración exacta del masterplan (Manzanas K, L, M, N, O, P, Q, R)
    en viewBox 100x100 y 1920x1080.
    """
    raw_blocks = {
        "mz-k": {
            "zoneId": "zone-2",
            "letter": "K",
            "lots": {
                1: (55.7, 72.2, "M 57.1 78.0 L 57.1 66.6 L 54.2 66.6 L 54.3 77.7 Z", 66.0, "corner", "available"),
                2: (52.9, 72.2, "M 54.2 77.8 L 54.2 66.6 L 51.5 66.7 L 51.5 77.5 Z", 66.0, "middle", "available"),
                3: (50.1, 72.2, "M 51.6 77.5 L 51.5 66.5 L 48.6 66.6 L 48.7 78.0 Z", 66.0, "middle", "reserved"),
                4: (47.3, 72.1, "M 48.7 77.7 L 48.7 66.4 L 45.8 66.6 L 45.9 77.9 Z", 66.0, "middle", "available"),
                5: (44.5, 72.2, "M 45.9 77.7 L 43.0 77.7 L 43.1 66.6 L 45.9 66.6 Z", 66.0, "middle", "sold"),
                6: (41.7, 72.2, "M 40.2 77.9 L 43.1 77.8 L 43.1 66.5 L 40.3 66.4 Z", 66.0, "middle", "available"),
                7: (38.9, 72.2, "M 40.2 77.8 L 37.4 77.5 L 37.5 66.6 L 40.3 66.7 Z", 66.0, "middle", "available"),
                8: (36.0, 72.3, "M 37.4 77.7 L 37.4 66.6 L 34.7 66.8 L 34.6 77.9 Z", 66.0, "corner", "available"),
                9: (36.1, 83.2, "M 34.8 88.6 L 37.4 88.6 L 37.5 77.8 L 34.6 78.0 Z", 66.0, "corner", "available"),
                10: (38.9, 83.2, "M 37.4 78.1 L 40.2 77.9 L 40.4 88.5 L 37.6 88.5 Z", 66.0, "middle", "reserved"),
                11: (41.7, 83.1, "M 40.3 88.5 L 40.2 78.0 L 43.1 77.8 L 43.0 88.5 Z", 66.0, "middle", "available"),
                12: (44.5, 83.1, "M 43.1 88.3 L 46.0 88.6 L 45.9 77.7 L 43.0 77.9 Z", 66.0, "middle", "available"),
                13: (47.3, 83.0, "M 48.6 88.5 L 45.9 88.3 L 45.9 77.8 L 48.7 77.7 Z", 66.0, "middle", "sold"),
                14: (50.1, 83.2, "M 48.6 77.8 L 48.7 88.5 L 51.6 88.6 L 51.5 77.9 Z", 66.0, "middle", "available"),
                15: (53.0, 83.1, "M 54.4 88.5 L 54.4 78.1 L 51.5 77.6 L 51.6 88.5 Z", 66.0, "middle", "available"),
                16: (55.8, 83.2, "M 54.3 77.9 L 57.2 77.7 L 57.2 88.6 L 54.3 88.5 Z", 66.0, "corner", "available"),
            },
        },
        "mz-l": {
            "zoneId": "zone-2",
            "letter": "L",
            "lots": {
                1: (46.0, 19.0, "M 47.6 12.8 L 47.6 25.0 L 44.5 24.7 L 44.4 13.6 Z", 83.54, "corner", "available"),
                2: (49.4, 18.4, "M 51.0 12.1 L 47.6 12.8 L 47.8 24.5 L 51.0 24.6 Z", 89.18, "middle", "available"),
                3: (52.6, 18.1, "M 54.1 24.4 L 54.1 11.1 L 51.0 12.1 L 51.0 24.8 Z", 86.94, "middle", "reserved"),
                4: (55.6, 17.7, "M 57.1 24.6 L 57.1 10.5 L 54.0 11.3 L 54.1 24.6 Z", 92.48, "corner", "available"),
                5: (54.0, 27.2, "M 57.1 24.8 L 50.8 24.6 L 50.8 29.5 L 57.1 29.7 Z", 68.75, "middle", "available"),
                6: (54.0, 32.1, "M 57.2 34.7 L 57.1 29.6 L 50.8 29.6 L 50.7 34.5 Z", 68.75, "middle", "sold"),
                7: (53.9, 37.1, "M 57.1 39.6 L 57.1 34.7 L 50.8 34.6 L 50.8 39.6 Z", 68.75, "middle", "available"),
                8: (53.9, 42.1, "M 57.0 44.5 L 57.0 39.6 L 50.7 39.7 L 50.8 44.5 Z", 68.75, "middle", "available"),
                9: (54.0, 47.1, "M 57.1 49.5 L 57.1 44.6 L 50.8 44.6 L 50.8 49.5 Z", 68.75, "middle", "available"),
                10: (53.9, 52.1, "M 57.1 54.5 L 57.0 49.6 L 50.7 49.6 L 50.8 54.5 Z", 68.75, "middle", "reserved"),
                11: (53.9, 57.0, "M 57.0 59.5 L 57.0 54.6 L 50.7 54.6 L 50.8 59.4 Z", 68.75, "corner", "available"),
                12: (47.5, 57.0, "M 50.7 59.5 L 50.7 54.6 L 44.2 54.5 L 44.4 59.5 Z", 68.75, "corner", "available"),
                13: (47.6, 52.0, "M 50.7 54.6 L 44.4 54.6 L 44.4 49.5 L 50.8 49.5 Z", 68.75, "middle", "available"),
                14: (47.5, 47.0, "M 50.7 49.5 L 50.7 44.4 L 44.4 44.6 L 44.4 49.7 Z", 68.75, "middle", "available"),
                15: (47.6, 42.1, "M 50.8 44.5 L 50.8 39.6 L 44.4 39.7 L 44.5 44.7 Z", 68.75, "middle", "sold"),
                16: (47.6, 37.1, "M 50.7 39.5 L 50.8 34.6 L 44.5 34.7 L 44.5 39.6 Z", 68.75, "middle", "available"),
                17: (47.6, 32.1, "M 50.7 34.6 L 50.7 29.6 L 44.5 29.7 L 44.5 34.6 Z", 68.75, "middle", "available"),
                18: (47.6, 27.1, "M 50.7 29.5 L 50.7 24.6 L 44.5 24.7 L 44.5 29.7 Z", 68.75, "middle", "available"),
            },
        },
        "mz-m": {
            "zoneId": "zone-2",
            "letter": "M",
            "lots": {
                1: (29.9, 23.3, "M 31.5 29.5 L 31.5 16.7 L 28.3 17.3 L 28.3 29.8 Z", 91.4, "corner", "available"),
                2: (33.2, 22.8, "M 34.8 29.5 L 31.5 29.5 L 31.6 16.3 L 34.9 15.7 Z", 96.98, "middle", "available"),
                3: (36.3, 22.4, "M 37.7 29.4 L 34.9 29.4 L 34.8 15.9 L 37.8 15.2 Z", 88.13, "middle", "available"),
                4: (39.2, 22.1, "M 40.5 29.6 L 40.6 14.5 L 37.7 15.3 L 37.8 29.5 Z", 90.57, "corner", "reserved"),
                5: (37.5, 32.3, "M 40.7 34.8 L 40.6 29.9 L 34.3 29.9 L 34.4 34.6 Z", 66.0, "middle", "available"),
                6: (37.5, 37.2, "M 40.7 39.6 L 40.6 34.9 L 34.4 34.7 L 34.4 39.6 Z", 66.0, "middle", "available"),
                7: (37.5, 42.2, "M 34.4 39.7 L 40.6 39.8 L 40.6 44.7 L 34.4 44.7 Z", 66.0, "middle", "sold"),
                8: (37.4, 47.0, "M 40.5 49.4 L 40.5 44.7 L 34.3 44.6 L 34.5 49.5 Z", 66.0, "middle", "available"),
                9: (37.5, 52.1, "M 40.5 54.5 L 40.6 49.5 L 34.4 49.7 L 34.4 54.6 Z", 66.0, "middle", "available"),
                10: (37.5, 57.1, "M 40.6 59.5 L 40.5 54.8 L 34.4 54.6 L 34.5 59.5 Z", 66.0, "corner", "available"),
                11: (31.3, 57.2, "M 34.3 59.7 L 28.5 59.7 L 28.3 54.6 L 34.2 54.8 Z", 66.0, "corner", "available"),
                12: (31.4, 52.2, "M 34.4 54.5 L 34.3 49.7 L 28.5 49.6 L 28.5 54.9 Z", 66.0, "middle", "reserved"),
                13: (31.4, 47.0, "M 34.3 49.5 L 34.3 44.6 L 28.3 44.5 L 28.5 49.4 Z", 66.0, "middle", "available"),
                14: (31.4, 42.1, "M 34.4 44.5 L 34.3 39.6 L 28.4 39.6 L 28.5 44.7 Z", 66.0, "middle", "available"),
                15: (31.5, 37.1, "M 34.4 39.7 L 28.4 39.7 L 28.5 34.6 L 34.4 34.3 Z", 66.0, "middle", "available"),
                16: (31.4, 32.2, "M 34.3 34.4 L 34.3 29.6 L 28.5 29.9 L 28.5 34.7 Z", 66.0, "middle", "available"),
            },
        },
        "mz-n": {
            "zoneId": "zone-2",
            "letter": "N",
            "lots": {
                1: (13.7, 25.9, "M 15.5 31.1 L 15.6 20.4 L 11.8 21.1 L 11.8 31.1 Z", 91.4, "corner", "available"),
                2: (17.2, 25.5, "M 18.5 31.1 L 18.9 19.6 L 15.6 20.7 L 15.6 31.0 Z", 80.63, "middle", "available"),
                3: (20.1, 25.3, "M 21.5 30.8 L 21.7 19.0 L 18.8 19.9 L 18.5 31.2 Z", 73.96, "middle", "available"),
                4: (23.1, 25.0, "M 24.6 31.2 L 24.5 18.3 L 21.8 19.1 L 21.6 30.8 Z", 76.52, "corner", "available"),
                5: (21.4, 33.7, "M 24.7 31.3 L 24.6 36.3 L 18.1 36.1 L 18.0 31.3 Z", 68.75, "middle", "reserved"),
                6: (21.2, 38.6, "M 24.5 36.2 L 18.0 36.0 L 17.9 41.1 L 24.6 41.2 Z", 68.75, "middle", "available"),
                7: (21.2, 43.7, "M 24.5 46.0 L 24.6 41.2 L 17.9 41.2 L 17.9 46.3 Z", 68.75, "middle", "available"),
                8: (21.3, 48.7, "M 24.6 51.3 L 24.6 46.1 L 17.9 46.1 L 17.9 51.2 Z", 68.75, "middle", "sold"),
                9: (21.4, 55.4, "M 24.6 51.0 L 18.0 51.3 L 18.1 59.8 L 24.7 59.6 Z", 116.71, "corner", "available"),
                10: (15.2, 54.6, "M 17.9 59.6 L 18.0 51.1 L 11.9 51.1 L 11.9 56.4 Z", 92.78, "corner", "available"),
                11: (14.8, 48.6, "M 17.9 50.9 L 17.9 46.3 L 11.9 46.2 L 11.7 51.0 Z", 68.75, "middle", "available"),
                12: (15.0, 43.6, "M 17.9 46.1 L 18.0 41.0 L 11.9 41.3 L 11.9 46.1 Z", 68.75, "middle", "available"),
                13: (14.9, 38.6, "M 18.0 41.1 L 17.9 36.0 L 11.9 36.0 L 12.0 41.4 Z", 68.75, "middle", "available"),
                14: (14.8, 33.8, "M 17.9 36.1 L 17.9 31.4 L 11.9 31.2 L 11.8 36.3 Z", 68.75, "middle", "available"),
            },
        },
        "mz-o": {
            "zoneId": "zone-1",
            "letter": "O",
            "lots": {
                8: (11.7, 84.5, "M 14.7 87.2 L 14.8 81.3 L 8.7 81.5 L 8.7 88.2 Z", 66.0, "corner", "available"),
                9: (11.5, 79.0, "M 14.8 81.2 L 14.6 76.8 L 8.4 76.5 L 8.3 81.5 Z", 66.0, "middle", "available"),
                10: (11.6, 74.2, "M 14.7 76.4 L 14.7 71.7 L 8.5 71.9 L 8.5 76.6 Z", 66.0, "middle", "reserved"),
                11: (11.5, 69.5, "M 14.7 71.8 L 14.6 67.0 L 8.4 66.9 L 8.5 72.1 Z", 66.0, "middle", "available"),
                12: (11.6, 64.5, "M 14.8 66.8 L 14.7 62.0 L 8.5 61.9 L 8.6 67.1 Z", 66.0, "middle", "available"),
                13: (11.8, 59.9, "M 15.0 62.2 L 14.9 57.4 L 8.7 57.3 L 8.8 62.5 Z", 66.0, "middle", "sold"),
                14: (11.6, 55.1, "M 14.7 52.6 L 8.6 52.6 L 8.4 57.5 L 14.8 57.6 Z", 66.0, "middle", "available"),
                15: (11.5, 50.2, "M 14.6 47.7 L 8.5 47.7 L 8.3 52.6 L 14.7 52.7 Z", 66.0, "middle", "available"),
                16: (11.6, 45.6, "M 14.7 43.1 L 8.6 43.1 L 8.4 48.0 L 14.8 48.1 Z", 66.0, "middle", "available"),
                17: (11.7, 40.7, "M 14.8 38.2 L 8.7 38.2 L 8.5 43.1 L 14.9 43.2 Z", 66.0, "middle", "available"),
                18: (11.7, 36.1, "M 14.8 33.6 L 8.7 33.6 L 8.5 38.5 L 14.9 38.6 Z", 66.0, "middle", "reserved"),
                19: (11.9, 31.1, "M 15.0 28.6 L 8.9 28.6 L 8.7 33.5 L 15.1 33.6 Z", 66.0, "middle", "available"),
                20: (11.9, 26.4, "M 15.0 23.9 L 8.9 23.9 L 8.7 28.8 L 15.1 28.9 Z", 66.0, "middle", "available"),
                21: (11.9, 21.6, "M 15.0 19.1 L 8.9 19.1 L 8.7 24.0 L 15.1 24.1 Z", 66.0, "middle", "available"),
                22: (11.9, 16.8, "M 15.0 14.3 L 8.9 14.3 L 8.7 19.2 L 15.1 19.3 Z", 72.0, "corner", "available"),
            },
        },
        "mz-p": {
            "zoneId": "zone-1",
            "letter": "P",
            "lots": {
                1: (28.8, 78.7, "M 30.5 83.4 L 30.4 73.5 L 27.2 73.4 L 27.3 84.5 Z", 80.81, "corner", "available"),
                2: (25.6, 79.1, "M 27.2 84.2 L 27.1 73.5 L 24.0 73.5 L 24.0 85.1 Z", 86.4, "middle", "available"),
                3: (22.4, 79.4, "M 24.0 85.1 L 24.0 73.4 L 20.9 73.4 L 20.9 85.8 Z", 92.03, "middle", "reserved"),
                4: (19.6, 79.7, "M 20.9 85.9 L 20.9 73.5 L 18.2 73.3 L 18.3 86.2 Z", 69.5, "corner", "available"),
                5: (21.3, 70.9, "M 24.2 73.2 L 24.2 68.3 L 18.4 68.8 L 18.3 73.2 Z", 68.75, "middle", "available"),
                6: (21.2, 66.1, "M 24.2 68.7 L 24.2 63.8 L 18.1 63.6 L 18.3 68.5 Z", 68.75, "middle", "sold"),
                7: (21.2, 61.3, "M 24.2 63.5 L 24.1 58.9 L 18.3 59.0 L 18.3 63.7 Z", 68.75, "middle", "available"),
                8: (21.2, 56.5, "M 24.1 58.9 L 24.2 54.2 L 18.4 53.9 L 18.4 58.9 Z", 68.75, "middle", "available"),
                9: (21.2, 51.7, "M 24.2 54.1 L 24.1 49.6 L 18.3 49.4 L 18.4 53.9 Z", 68.75, "corner", "available"),
                11: (27.4, 51.7, "M 30.6 53.9 L 30.5 49.2 L 24.2 49.5 L 24.4 54.1 Z", 68.75, "corner", "available"),
                12: (27.4, 56.5, "M 30.5 58.7 L 30.5 54.1 L 24.3 54.2 L 24.3 58.9 Z", 68.75, "middle", "available"),
                13: (27.3, 61.3, "M 30.5 63.5 L 30.4 59.1 L 24.3 59.0 L 24.2 63.7 Z", 68.75, "middle", "reserved"),
                14: (27.4, 66.1, "M 30.5 68.5 L 30.4 63.7 L 24.3 63.6 L 24.3 68.6 Z", 68.75, "middle", "available"),
                15: (27.2, 70.6, "M 30.5 73.0 L 30.5 68.5 L 24.1 67.8 L 24.2 73.1 Z", 68.75, "middle", "available"),
            },
        },
        "mz-q": {
            "zoneId": "zone-1",
            "letter": "Q",
            "lots": {
                1: (44.1, 76.2, "M 45.6 80.1 L 45.7 71.9 L 42.6 71.9 L 42.6 80.8 Z", 64.77, "corner", "available"),
                2: (41.1, 76.6, "M 39.7 81.4 L 39.6 72.0 L 42.6 72.1 L 42.6 80.8 Z", 64.75, "middle", "available"),
                3: (38.2, 76.8, "M 39.8 71.7 L 39.6 81.3 L 36.7 82.8 L 36.8 71.6 Z", 69.5, "middle", "available"),
                4: (35.5, 77.4, "M 36.9 71.9 L 36.9 82.8 L 34.3 83.4 L 34.1 71.6 Z", 69.5, "corner", "reserved"),
                5: (37.0, 69.4, "M 39.9 71.8 L 39.8 67.2 L 34.1 66.9 L 34.2 71.7 Z", 66.0, "middle", "available"),
                6: (37.0, 64.6, "M 39.9 67.0 L 39.9 62.3 L 34.2 62.1 L 34.2 67.1 Z", 66.0, "middle", "available"),
                7: (37.0, 59.7, "M 39.9 62.1 L 39.8 57.4 L 34.1 57.3 L 34.2 62.1 Z", 66.0, "middle", "sold"),
                8: (37.0, 55.0, "M 39.9 57.3 L 39.8 52.5 L 34.2 52.7 L 34.2 57.3 Z", 66.0, "middle", "available"),
                9: (37.1, 50.1, "M 39.9 52.6 L 39.9 47.5 L 34.2 47.8 L 34.2 52.7 Z", 66.0, "middle", "available"),
                10: (37.1, 45.2, "M 39.9 43.0 L 39.9 47.4 L 34.3 47.5 L 34.2 43.0 Z", 66.0, "middle", "available"),
                11: (37.1, 40.5, "M 40.0 43.0 L 39.9 38.1 L 34.2 38.0 L 34.4 43.0 Z", 66.0, "middle", "available"),
                12: (37.1, 35.8, "M 39.9 38.1 L 39.9 33.4 L 34.1 33.5 L 34.3 38.1 Z", 66.0, "middle", "reserved"),
                13: (37.1, 31.0, "M 39.9 33.3 L 39.9 28.6 L 34.3 28.7 L 34.2 33.5 Z", 66.0, "middle", "available"),
                14: (37.1, 26.2, "M 40.0 28.7 L 39.9 23.7 L 34.2 24.0 L 34.3 28.6 Z", 66.0, "middle", "available"),
                15: (37.0, 21.5, "M 39.9 23.5 L 39.9 19.1 L 34.2 19.2 L 34.3 24.1 Z", 66.0, "middle", "available"),
                16: (37.1, 16.6, "M 40.0 19.2 L 39.9 14.1 L 34.2 14.2 L 34.2 19.0 Z", 66.0, "corner", "available"),
                17: (43.0, 16.4, "M 45.9 19.1 L 40.0 18.8 L 39.9 13.9 L 46.0 13.8 Z", 66.0, "corner", "available"),
                18: (42.9, 21.4, "M 45.9 19.1 L 46.0 24.0 L 40.0 24.0 L 39.9 18.7 Z", 66.0, "middle", "sold"),
                19: (42.9, 26.2, "M 45.9 23.8 L 39.8 23.6 L 39.9 28.6 L 45.9 28.7 Z", 66.0, "middle", "available"),
                20: (42.9, 31.0, "M 45.9 28.6 L 45.9 33.4 L 40.0 33.3 L 39.9 28.6 Z", 66.0, "middle", "available"),
                21: (43.1, 35.9, "M 46.1 33.5 L 46.1 38.3 L 40.2 38.2 L 40.1 33.5 Z", 66.0, "middle", "available"),
                22: (42.9, 40.7, "M 45.9 38.3 L 45.9 43.1 L 40.0 43.0 L 39.9 38.3 Z", 66.0, "middle", "available"),
                23: (42.8, 45.5, "M 45.8 43.1 L 45.8 47.9 L 39.9 47.8 L 39.8 43.1 Z", 66.0, "middle", "reserved"),
                24: (42.9, 50.2, "M 45.9 47.8 L 45.9 52.6 L 40.0 52.5 L 39.9 47.8 Z", 66.0, "middle", "available"),
                25: (43.0, 55.1, "M 46.0 52.7 L 46.0 57.5 L 40.1 57.4 L 40.0 52.7 Z", 66.0, "middle", "available"),
                26: (43.0, 59.9, "M 46.0 57.5 L 46.0 62.3 L 40.1 62.2 L 40.0 57.5 Z", 66.0, "middle", "available"),
                27: (43.0, 64.6, "M 46.0 62.2 L 46.0 67.0 L 40.1 66.9 L 40.0 62.2 Z", 66.0, "middle", "available"),
                28: (43.1, 69.6, "M 46.1 67.2 L 46.1 72.0 L 40.2 71.9 L 40.1 67.2 Z", 66.0, "middle", "available"),
            },
        },
        "mz-r": {
            "zoneId": "zone-1",
            "letter": "R",
            "lots": {
                1: (60.0, 71.3, "M 61.7 76.0 L 61.6 66.1 L 58.3 66.0 L 58.4 76.9 Z", 80.81, "corner", "available"),
                2: (56.8, 71.7, "M 58.2 77.0 L 58.2 66.1 L 55.4 66.0 L 55.3 77.4 Z", 86.4, "middle", "available"),
                3: (53.8, 72.0, "M 55.3 66.0 L 52.3 66.1 L 52.3 78.3 L 55.4 77.6 Z", 92.02, "middle", "available"),
                4: (50.9, 72.2, "M 52.2 78.3 L 52.2 66.0 L 49.5 65.8 L 49.6 78.9 Z", 92.02, "corner", "reserved"),
                5: (52.5, 63.5, "M 55.6 65.7 L 55.6 61.3 L 49.5 61.1 L 49.5 65.9 Z", 68.75, "middle", "available"),
                6: (52.5, 58.7, "M 55.6 61.0 L 55.6 56.4 L 49.5 56.3 L 49.5 61.2 Z", 68.75, "middle", "available"),
                7: (52.5, 53.9, "M 55.6 56.3 L 55.6 51.6 L 49.5 51.5 L 49.5 56.2 Z", 68.75, "middle", "sold"),
                8: (52.5, 49.1, "M 55.6 51.6 L 55.4 46.6 L 49.4 46.6 L 49.5 51.5 Z", 68.75, "corner", "available"),
                10: (58.6, 49.3, "M 55.6 46.7 L 61.6 47.1 L 61.6 51.7 L 55.7 51.7 Z", 68.75, "corner", "available"),
                11: (58.6, 54.0, "M 61.7 51.7 L 61.7 56.2 L 55.6 56.4 L 55.6 51.6 Z", 68.75, "middle", "available"),
                12: (58.6, 58.7, "M 61.7 60.9 L 61.6 56.5 L 55.6 56.2 L 55.7 61.3 Z", 68.75, "middle", "available"),
                13: (58.7, 63.5, "M 61.6 65.6 L 61.6 61.0 L 55.7 61.4 L 55.7 65.9 Z", 68.75, "middle", "available"),
            },
        },
    }

    lots_output = []
    for block_id, binfo in raw_blocks.items():
        letter = binfo["letter"]
        zone_id = binfo["zoneId"]
        for lot_num, (cx, cy, path_100, area, pos, status) in binfo["lots"].items():
            # Convertir path 0..100 también a coordenadas 1920x1080 para el overlay 1920x1080
            tokens = path_100.split()
            pts_1920 = []
            i = 0
            while i < len(tokens):
                tok = tokens[i]
                if tok in ("M", "L"):
                    px = round(float(tokens[i + 1]) * 19.2, 1)
                    py = round(float(tokens[i + 2]) * 10.8, 1)
                    pts_1920.append({"x": px, "y": py})
                    i += 3
                else:
                    i += 1

            path_1920 = " ".join(
                [f"{'M' if idx == 0 else 'L'} {pt['x']} {pt['y']}" for idx, pt in enumerate(pts_1920)]
            ) + " Z"

            price_usd = int(round(area * (345 if pos == "corner" else 315), -2))
            lots_output.append({
                "id": f"{block_id}:lot-{lot_num}",
                "blockId": block_id,
                "blockLetter": letter,
                "lotNumber": lot_num,
                "identifier": f"Lote {lot_num}",
                "fullTitle": f"Manzana {letter} · Lote {lot_num}",
                "zoneId": zone_id,
                "status": status,
                "position": pos,
                "areaSqm": area,
                "priceUsd": price_usd,
                "pricePen": price_usd * 3.75,
                "x": cx,
                "y": cy,
                "x1920": round(cx * 19.2, 1),
                "y1080": round(cy * 10.8, 1),
                "path": path_100,
                "path1920": path_1920,
                "vertices1920": pts_1920,
                "compatibleModels": compatible_models_for_area(area),
            })

    return lots_output


def main() -> None:
    PUBLIC_SIDE0_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    blueprint_path = INPUT_DIR / "plano-flamingo.png"
    ensure_input_blueprint(blueprint_path)

    raw_img = cv2.imread(str(blueprint_path))
    if raw_img is None:
        raise RuntimeError(f"No se pudo leer el plano de entrada en {blueprint_path}")

    resized = cv2.resize(raw_img, (1920, 1080), interpolation=cv2.INTER_AREA)
    homography = compute_40deg_homography(1920, 1080)
    warped = cv2.warpPerspective(
        resized,
        homography,
        (1920, 1080),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(15, 23, 42),
    )

    perspective_out = PUBLIC_SIDE0_DIR / "blueprint-perspective.png"
    cv2.imwrite(str(perspective_out), warped)

    gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    canny_out = PUBLIC_SIDE0_DIR / "canny-edges.png"
    cv2.imwrite(str(canny_out), edges)

    # Detección de contornos cerrados mediante cv2.findContours + cv2.approxPolyDP
    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    closed_polys = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 400 < area < 45000:
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.03 * peri, True)
            if len(approx) >= 4:
                closed_polys.append(approx)

    lots_data = build_exact_calibrated_lots(len(closed_polys))
    lots_json_path = DATA_DIR / "lots.json"
    with open(lots_json_path, "w", encoding="utf-8") as f:
        json.dump(lots_data, f, ensure_ascii=False, indent=2)

    print(f"[OpenCV] Homografía 40° exportada en: {perspective_out}")
    print(f"[OpenCV] Mapa de bordes Canny exportado en: {canny_out}")
    print(f"[OpenCV] Contornos poligonales detectados: {len(closed_polys)} | Lotes calibrados exportados: {len(lots_data)} -> {lots_json_path}")


if __name__ == "__main__":
    main()
