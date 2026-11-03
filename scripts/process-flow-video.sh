#!/usr/bin/env bash
# =============================================================================
# FLAMINGO RESIDENCIAL — Pipeline de Extracción de 150 Frames (.webp)
# Convierte raw-video/flamingo-flow.mp4 en public/sequence/frame_0001..0150.webp
# Resolución: 1920x1080 | Escala: Lanczos | Calidad WebP: 82
# =============================================================================

set -euo pipefail

INPUT_VIDEO="raw-video/flamingo-flow.mp4"
OUTPUT_DIR="public/sequence"
TOTAL_FRAMES=150

mkdir -p "$OUTPUT_DIR"

if [ ! -f "$INPUT_VIDEO" ]; then
  echo "[Flamingo Flow] Aviso: No se encontró $INPUT_VIDEO."
  echo "[Flamingo Flow] Ejecutando sintetizador progresivo desde los keyframes de public/flow-frames/..."
  node scripts/synthesize-and-extract-flow.mjs
  exit 0
fi

# Obtener duración del video en segundos usando ffprobe o ffmpeg
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT_VIDEO" 2>/dev/null || echo "8")
FPS=$(awk "BEGIN {printf \"%.6f\", $TOTAL_FRAMES / $DURATION}")

echo "[Flamingo Flow] Extrayendo $TOTAL_FRAMES frames desde $INPUT_VIDEO (duración: ${DURATION}s, fps objetivo: ${FPS})..."

ffmpeg -y -i "$INPUT_VIDEO" \
  -vf "fps=${FPS},scale=1920:1080:flags=lanczos" \
  -frames:v "$TOTAL_FRAMES" \
  -vcodec libwebp \
  -lossless 0 \
  -compression_level 4 \
  -q:v 82 \
  "$OUTPUT_DIR/frame_%04d.webp"

echo "[Flamingo Flow] ¡Completado! 150 frames .webp generados en $OUTPUT_DIR/frame_0001.webp .. frame_0150.webp"
