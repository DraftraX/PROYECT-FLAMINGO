import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const flowFramesDir = path.join(rootDir, 'public', 'flow-frames');
const sequenceDir = path.join(rootDir, 'public', 'sequence');
const publicVideosDir = path.join(rootDir, 'public', 'videos');
const publicWebmPath = path.join(publicVideosDir, 'flamingo-flow.webm');
const publicMp4Path = path.join(publicVideosDir, 'flamingo-flow.mp4');

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 150;

function findFfmpegExecutable() {
  const playwrightFfmpeg = path.join(
    process.env.LOCALAPPDATA || 'C:\\Users\\manuel\\AppData\\Local',
    'ms-playwright',
    'ffmpeg-1013',
    'ffmpeg-win64.exe'
  );
  if (fs.existsSync(playwrightFfmpeg)) {
    return playwrightFfmpeg;
  }
  return 'ffmpeg';
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

async function loadRawStage(filePath) {
  const { data } = await sharp(filePath)
    .resize(WIDTH, HEIGHT, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}

async function main() {
  fs.mkdirSync(sequenceDir, { recursive: true });
  fs.mkdirSync(publicVideosDir, { recursive: true });

  const candidateStageNames = [
    'stage-00.jpg',
    'stage-12.jpg',
    'stage-25.jpg',
    'stage-37.jpg',
    'stage-50.jpg',
    'stage-62.jpg',
    'stage-75.jpg',
    'stage-87.jpg',
    'stage-100.jpg',
  ];

  const stageFiles = candidateStageNames
    .map((name) => path.join(flowFramesDir, name))
    .filter((filePath) => fs.existsSync(filePath));

  if (stageFiles.length < 5) {
    throw new Error('Faltan los keyframes base en public/flow-frames/stage-00..100.jpg');
  }

  console.log(
    `[Flamingo Flow] Cargando ${stageFiles.length} keyframes aéreos Gemini en 1920x1080 (Lanczos3)...`
  );
  const stages = await Promise.all(stageFiles.map(loadRawStage));

  // Precompute spatial construction propagation map (radial wave from entrance gate at x=0.37, y=0.63)
  // So roads, curbs, utility trenches, and houses build organically outward from the main entrance!
  const gateX = Math.round(WIDTH * 0.37);
  const gateY = Math.round(HEIGHT * 0.63);
  const maxDist = Math.sqrt(Math.pow(WIDTH * 0.65, 2) + Math.pow(HEIGHT * 0.65, 2));
  const spatialDelay = new Float32Array(WIDTH * HEIGHT);

  for (let y = 0; y < HEIGHT; y++) {
    const dy = y - gateY;
    for (let x = 0; x < WIDTH; x++) {
      const dx = x - gateX;
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy) / maxDist);
      spatialDelay[y * WIDTH + x] = d * 0.26;
    }
  }

  console.log(`[Flamingo Flow] Generando ${TOTAL_FRAMES} frames .webp (1920x1080, calidad 82, Lanczos)...`);
  const numIntervals = stages.length - 1;
  const outBuf = Buffer.allocUnsafe(WIDTH * HEIGHT * 3);
  const mjpegBuffers = [];

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const frameNum = i + 1;
    const globalProgress = i / (TOTAL_FRAMES - 1); // 0.0 -> 1.0
    const scaled = globalProgress * numIntervals;
    const segIdx = Math.min(numIntervals - 1, Math.floor(scaled));
    const segLocal = scaled - segIdx;

    const bufA = stages[segIdx];
    const bufB = stages[segIdx + 1];

    const totalPixels = WIDTH * HEIGHT;
    for (let p = 0; p < totalPixels; p++) {
      const delay = spatialDelay[p];
      const rawT = Math.max(0, Math.min(1, (segLocal - delay * 0.65) / (1 - 0.26 * 0.65)));
      const t = easeInOutCubic(rawT);
      const invT = 1 - t;

      const idx = p * 3;
      outBuf[idx] = Math.round(bufA[idx] * invT + bufB[idx] * t);
      outBuf[idx + 1] = Math.round(bufA[idx + 1] * invT + bufB[idx + 1] * t);
      outBuf[idx + 2] = Math.round(bufA[idx + 2] * invT + bufB[idx + 2] * t);
    }

    const frameName = `frame_${String(frameNum).padStart(4, '0')}.webp`;
    const framePath = path.join(sequenceDir, frameName);

    const sharpInstance = sharp(outBuf, {
      raw: { width: WIDTH, height: HEIGHT, channels: 3 },
    });

    await sharpInstance.clone().webp({ quality: 82, effort: 3 }).toFile(framePath);

    // Also keep an in-memory JPEG buffer to pipe into ffmpeg for video generation
    const jpegBuf = await sharpInstance.clone().jpeg({ quality: 86 }).toBuffer();
    mjpegBuffers.push(jpegBuf);

    if (frameNum % 25 === 0 || frameNum === 1 || frameNum === TOTAL_FRAMES) {
      console.log(`  -> Generado ${frameName} (${Math.round(globalProgress * 100)}%)`);
    }
  }

  // Encode master video in public/videos/ using Playwright's ffmpeg (mjpeg image2pipe -> VP9)
  try {
    const ffmpegBin = findFfmpegExecutable();
    console.log(`[Flamingo Flow] Codificando video maestro en public/videos/ con ${ffmpegBin}...`);
    const concatenatedMjpeg = Buffer.concat(mjpegBuffers);

    const res = spawnSync(
      ffmpegBin,
      [
        '-y',
        '-f',
        'image2pipe',
        '-vcodec',
        'mjpeg',
        '-framerate',
        '18.75',
        '-i',
        'pipe:0',
        '-c:v',
        'libvpx-vp9',
        '-b:v',
        '4M',
        '-crf',
        '24',
        publicWebmPath,
      ],
      {
        input: concatenatedMjpeg,
        maxBuffer: 256 * 1024 * 1024,
      }
    );

    if (res.status === 0 && fs.existsSync(publicWebmPath)) {
      fs.copyFileSync(publicWebmPath, publicMp4Path);
      console.log(`[Flamingo Flow] Videos generados en:\n  - ${publicWebmPath}\n  - ${publicMp4Path}`);
    } else {
      console.warn('[Flamingo Flow] Aviso ffmpeg:', res.stderr?.toString()?.slice(-300));
    }
  } catch (err) {
    console.warn('[Flamingo Flow] Aviso codificación de video:', err.message);
  }

  console.log('[Flamingo Flow] ¡Pipeline completado! 150 frames .webp listos en public/sequence/');
}

main().catch((err) => {
  console.error('[Flamingo Flow] Error:', err);
  process.exit(1);
});
