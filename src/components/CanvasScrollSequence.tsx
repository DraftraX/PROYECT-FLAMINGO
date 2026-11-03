import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CheckCircle2,
  Compass,
  Droplets,
  FileCheck2,
  Lightbulb,
  MapPin,
  MessageCircle,
  Sparkles,
  Waves,
} from 'lucide-react';
import {
  buildFlamingoWhatsAppUrl,
  FLAMINGO_BRAND,
  SCROLL_STAGES,
  URBAN_SERVICES,
  WHATSAPP_ADVISORS,
} from '../config/flamingo';

gsap.registerPlugin(ScrollTrigger);

interface CanvasScrollSequenceProps {
  onOpen360?: () => void;
  onScrollToLots?: () => void;
}

const TOTAL_FRAMES = FLAMINGO_BRAND.sequence.totalFrames; // 150

function getFrameUrl(index1Based: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, index1Based));
  const padded = String(clamped).padStart(FLAMINGO_BRAND.sequence.padLength, '0');
  return `${FLAMINGO_BRAND.sequence.basePath}/${FLAMINGO_BRAND.sequence.prefix}${padded}.${FLAMINGO_BRAND.sequence.extension}`;
}

/**
 * Dibujo de Pluma de Flamenco realista en SVG con desenfoque de profundidad de campo (2.5D)
 */
const FlamingoFeatherSVG: React.FC<{ className?: string; flip?: boolean }> = ({
  className = '',
  flip = false,
}) => (
  <svg
    viewBox="0 0 260 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="featherBody" x1="0%" y1="20%" x2="100%" y2="80%">
        <stop offset="0%" stopColor="#FF94B8" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#EE6B96" stopOpacity="0.92" />
        <stop offset="100%" stopColor="#C93B6B" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="featherSpine" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#FFE4EE" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#B82D5B" stopOpacity="0.7" />
      </linearGradient>
      <filter id="featherSoftness" x="-15%" y="-15%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
    </defs>
    <g filter="url(#featherSoftness)">
      <path
        d="M18 112 C48 48, 134 18, 236 38 C218 68, 194 98, 138 116 C88 132, 46 124, 18 112 Z"
        fill="url(#featherBody)"
      />
      {/* Barbas suaves de la pluma */}
      <path
        d="M42 96 C78 56, 146 38, 224 44 M58 106 C102 74, 160 60, 212 62 M32 82 C64 46, 118 28, 182 30"
        stroke="#FFD4E3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
      {/* Raquis central */}
      <path
        d="M8 118 C66 86, 144 52, 242 38"
        stroke="url(#featherSpine)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

export const CanvasScrollSequence: React.FC<CanvasScrollSequenceProps> = ({
  onOpen360,
  onScrollToLots,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinViewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParallaxWrapRef = useRef<HTMLDivElement | null>(null);
  const featherLeftRef = useRef<HTMLDivElement | null>(null);
  const featherRightRef = useRef<HTMLDivElement | null>(null);
  const featherTopRightRef = useRef<HTMLDivElement | null>(null);
  const hudParallaxRef = useRef<HTMLDivElement | null>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const fallbackImgRef = useRef<HTMLImageElement | null>(null);
  const currentFrameRef = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);

  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [useFallback25D, setUseFallback25D] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);

  // =========================================================================
  // 1. DIBUJO EN CANVAS DE ALTA DENSIDAD (devicePixelRatio + Fallback 2.5D)
  // =========================================================================
  const renderCanvasFrame = (frameIndex0Based: number, progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Find exact loaded frame or nearest already-loaded frame
    let img = imagesRef.current[frameIndex0Based];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = frameIndex0Based - offset;
        const next = frameIndex0Based + offset;
        if (prev >= 0 && imagesRef.current[prev]?.complete && imagesRef.current[prev]!.naturalWidth > 0) {
          img = imagesRef.current[prev];
          break;
        }
        if (
          next < TOTAL_FRAMES &&
          imagesRef.current[next]?.complete &&
          imagesRef.current[next]!.naturalWidth > 0
        ) {
          img = imagesRef.current[next];
          break;
        }
      }
    }

    if (!img && fallbackImgRef.current?.complete && fallbackImgRef.current.naturalWidth > 0) {
      img = fallbackImgRef.current;
    }

    if (img && img.complete && img.naturalWidth > 0) {
      // Object-cover calculation
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;
      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawW = width;
        drawH = width / imgRatio;
        offsetY = (height - drawH) * 0.5;
      } else {
        drawH = height;
        drawW = height * imgRatio;
        offsetX = (width - drawW) * 0.5;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // Subtle atmospheric golden-hour warmth & vignette that intensifies with scroll
      if (progress > 0.65) {
        const goldenAlpha = Math.min(0.18, ((progress - 0.65) / 0.35) * 0.16);
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, `rgba(255, 196, 132, ${goldenAlpha})`);
        grad.addColorStop(0.6, 'rgba(54, 29, 66, 0.04)');
        grad.addColorStop(1, `rgba(35, 17, 43, ${goldenAlpha * 1.4})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      // Pure procedural gradient fallback while first frame is decoding
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#EAE3F2');
      bgGrad.addColorStop(1, '#361D42');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  };

  // =========================================================================
  // 2. PRECARGA PROGRESIVA INTELIGENTE DE LOS 150 FRAMES (.WEBP)
  // =========================================================================
  useEffect(() => {
    let isCancelled = false;

    // Aviso informativo en consola sobre tipografía Geista Mond + modo secuencia
    console.info(
      '%c[Flamingo Residencial]%c Tipografía editorial "Geista Mond" activa (/fonts/GeistaMond-Regular.woff2, fallback Cormorant Garamond) + "DM Sans". Inicializando motor CanvasScrollSequence (150 frames)...',
      'background:#361D42;color:#F48FB1;padding:2px 6px;border-radius:4px;font-weight:bold;',
      'color:#361D42;font-weight:500;'
    );

    // Load fallback image immediately just in case
    const fbImg = new Image();
    fbImg.src = FLAMINGO_BRAND.sequence.firstFrameFallback;
    fbImg.onload = () => {
      fallbackImgRef.current = fbImg;
      if (currentFrameRef.current === 0) {
        renderCanvasFrame(0, scrollProgressRef.current);
      }
    };

    // Priority loading order: Frame 1 -> Keyframes every 10 frames -> Remaining frames
    const loadOrder: number[] = [];
    const seen = new Set<number>();

    const addFrameIndex = (idx0: number) => {
      if (idx0 >= 0 && idx0 < TOTAL_FRAMES && !seen.has(idx0)) {
        seen.add(idx0);
        loadOrder.push(idx0);
      }
    };

    addFrameIndex(0);
    addFrameIndex(TOTAL_FRAMES - 1);
    for (let step = 10; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < TOTAL_FRAMES; i += step) {
        addFrameIndex(i);
      }
      if (step === 1) break;
    }

    let loadedSoFar = 0;
    let failedCount = 0;
    let cursor = 0;
    const CONCURRENCY = 10;

    const loadNext = () => {
      if (isCancelled || cursor >= loadOrder.length) return;
      const frameIdx = loadOrder[cursor++];
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameUrl(frameIdx + 1);

      img.onload = () => {
        if (isCancelled) return;
        imagesRef.current[frameIdx] = img;
        loadedSoFar++;
        setLoadedCount(loadedSoFar);

        if (frameIdx === 0 || Math.abs(frameIdx - currentFrameRef.current) <= 2) {
          renderCanvasFrame(currentFrameRef.current, scrollProgressRef.current);
        }
        loadNext();
      };

      img.onerror = () => {
        if (isCancelled) return;
        failedCount++;
        if (failedCount > 12 && loadedSoFar === 0) {
          setUseFallback25D(true);
        }
        loadNext();
      };
    };

    for (let c = 0; c < CONCURRENCY; c++) {
      loadNext();
    }

    const handleResize = () => {
      renderCanvasFrame(currentFrameRef.current, scrollProgressRef.current);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // =========================================================================
  // 3. GSAP SCROLLTRIGGER PINNED (450vh, scrub: 0.6) + PARALLAX DE MOUSE
  // =========================================================================
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const pinEl = pinViewportRef.current;
    if (!sectionEl || !pinEl) return;

    const ctx = gsap.context(() => {
      // ScrollTrigger principal: fija el viewport durante 450vh y hace scrubbing de los 150 frames
      ScrollTrigger.create({
        trigger: sectionEl,
        pin: pinEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress; // 0.0 -> 1.0
          scrollProgressRef.current = progress;
          setScrollProgress(progress);

          // Determinar tramo activo (0..3)
          if (progress < 0.25) setActiveStageIdx(0);
          else if (progress < 0.55) setActiveStageIdx(1);
          else if (progress < 0.85) setActiveStageIdx(2);
          else setActiveStageIdx(3);

          // Mapear progreso (0% -> 100%) a los 150 frames (0 -> 149)
          const targetFrame = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.round(progress * (TOTAL_FRAMES - 1)))
          );
          currentFrameRef.current = targetFrame;
          requestAnimationFrame(() => {
            renderCanvasFrame(targetFrame, progress);
          });
        },
      });

      // Mousemove 2.5D Parallax con gsap.quickTo
      const canvasX = canvasParallaxWrapRef.current
        ? gsap.quickTo(canvasParallaxWrapRef.current, 'x', { duration: 0.85, ease: 'power3.out' })
        : null;
      const canvasY = canvasParallaxWrapRef.current
        ? gsap.quickTo(canvasParallaxWrapRef.current, 'y', { duration: 0.85, ease: 'power3.out' })
        : null;

      const fLeftX = featherLeftRef.current
        ? gsap.quickTo(featherLeftRef.current, 'x', { duration: 0.65, ease: 'power3.out' })
        : null;
      const fLeftY = featherLeftRef.current
        ? gsap.quickTo(featherLeftRef.current, 'y', { duration: 0.65, ease: 'power3.out' })
        : null;

      const fRightX = featherRightRef.current
        ? gsap.quickTo(featherRightRef.current, 'x', { duration: 0.7, ease: 'power3.out' })
        : null;
      const fRightY = featherRightRef.current
        ? gsap.quickTo(featherRightRef.current, 'y', { duration: 0.7, ease: 'power3.out' })
        : null;

      const fTopX = featherTopRightRef.current
        ? gsap.quickTo(featherTopRightRef.current, 'x', { duration: 0.55, ease: 'power3.out' })
        : null;
      const fTopY = featherTopRightRef.current
        ? gsap.quickTo(featherTopRightRef.current, 'y', { duration: 0.55, ease: 'power3.out' })
        : null;

      const hudX = hudParallaxRef.current
        ? gsap.quickTo(hudParallaxRef.current, 'x', { duration: 0.75, ease: 'power3.out' })
        : null;
      const hudY = hudParallaxRef.current
        ? gsap.quickTo(hudParallaxRef.current, 'y', { duration: 0.75, ease: 'power3.out' })
        : null;

      const handleMouseMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 .. 1
        const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 .. 1

        // El canvas se desplaza suavemente mientras las plumas en primer plano hacen contra-parallax
        canvasX?.(nx * 20);
        canvasY?.(ny * 14);

        fLeftX?.(-nx * 36);
        fLeftY?.(-ny * 26);

        fRightX?.(-nx * 42);
        fRightY?.(-ny * 30);

        fTopX?.(-nx * 28);
        fTopY?.(-ny * 22);

        hudX?.(nx * 8);
        hudY?.(ny * 6);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, sectionEl);

    return () => ctx.revert();
  }, []);

  // =========================================================================
  // 4. CÁLCULO DE MÁSCARA ORGÁNICA ("ALA DE FLAMENCO") AL INICIAR EL SCROLL (0% -> 16%)
  // =========================================================================
  // En scroll = 0, la ventana aérea tiene la silueta orgánica exacta del flyer sobre fondo #EAE3F2.
  // Entre 0% y 16% de scroll, la máscara se expande fluidamente hasta cubrir el 100vw x 100vh.
  const maskExpandT = Math.min(1, Math.max(0, scrollProgress / 0.16));
  const maskScale = 1 + Math.pow(maskExpandT, 1.65) * 3.4;
  const heroOverlayOpacity = Math.max(0, 1 - scrollProgress / 0.18);

  // Progreso de trazado vectorial de lotes (se dibuja entre 15% y 60% del scroll)
  const lotDrawProgress = Math.min(1, Math.max(0, (scrollProgress - 0.12) / 0.45));
  const currentStage = SCROLL_STAGES[activeStageIdx] || SCROLL_STAGES[0];
  const loadingPct = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));

  return (
    <section
      ref={sectionRef}
      id="preventa-scroll-stage"
      className="relative w-full h-[450vh] bg-[#EAE3F2] select-none"
    >
      {/* Contenedor Pinned 100vw x 100vh */}
      <div
        ref={pinViewportRef}
        className="relative w-full h-screen overflow-hidden bg-[#EAE3F2] flex flex-col justify-between"
      >
        {/* ===================================================================
            DEFINICIÓN DE MÁSCARA SVG ORGÁNICA ("SILUETA ALA DE FLAMENCO" DEL FLYER)
           =================================================================== */}
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id="flamingoWingMask" clipPathUnits="objectBoundingBox">
              <path
                transform={`translate(0.5, 0.62) scale(${maskScale.toFixed(4)}) translate(-0.5, -0.62)`}
                d="M 0.50,0.32
                   C 0.62,0.32 0.76,0.41 0.96,0.64
                   C 1.01,0.70 0.97,0.74 0.89,0.72
                   C 0.81,0.70 0.71,0.63 0.65,0.60
                   C 0.63,0.59 0.62,0.61 0.65,0.64
                   C 0.73,0.70 0.83,0.75 0.81,0.80
                   C 0.78,0.85 0.63,0.84 0.49,0.78
                   C 0.44,0.75 0.42,0.77 0.46,0.82
                   C 0.52,0.87 0.53,0.93 0.41,0.93
                   C 0.25,0.92 0.08,0.79 0.02,0.66
                   C -0.01,0.60 0.05,0.55 0.14,0.48
                   C 0.27,0.39 0.38,0.32 0.50,0.32 Z"
              />
            </clipPath>
          </defs>
        </svg>

        {/* ===================================================================
            CAPA 1: ESCENARIO CANVAS 150 FRAMES + OVERLAY VECTORIAL 2.5D
            (Con máscara orgánica que se abre de 0% a 16% de scroll)
           =================================================================== */}
        <div
          style={{
            clipPath: maskExpandT < 0.99 ? 'url(#flamingoWingMask)' : 'none',
          }}
          className="absolute inset-0 w-full h-full overflow-hidden z-10 transition-[clip-path] duration-75"
        >
          {/* Contenedor escalado a 1.06 para parallax de mouse sin bordes vacíos */}
          <div
            ref={canvasParallaxWrapRef}
            className="relative w-full h-full scale-[1.06] will-change-transform"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block object-cover"
              aria-label="Secuencia interactiva de construcción de Flamingo Residencial"
            />

            {/* Trazado Técnico Vectorial de Lotes y Vías (Se dibuja progresivamente con el scroll) */}
            <svg
              viewBox="0 0 1920 1080"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                opacity:
                  scrollProgress < 0.08
                    ? 0.85
                    : scrollProgress < 0.72
                    ? 0.92
                    : Math.max(0.25, 1 - (scrollProgress - 0.72) * 2.5),
              }}
            >
              <defs>
                <linearGradient id="lotStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#F48FB1" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#EAE3F2" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Perímetro punteado blanco idéntico al flyer en el estado inicial */}
              <polygon
                points="422,592 1035,484 1438,538 1228,748 764,658"
                fill="rgba(238, 107, 150, 0.05)"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeDasharray="14 10"
                className="drop-shadow-[0_2px_8px_rgba(35,17,43,0.65)]"
              />

              {/* Red de Manzanas y Lotes de 160m² y 200m² que se dibuja con el scroll */}
              <g
                stroke="url(#lotStrokeGrad)"
                strokeWidth="2.2"
                fill="none"
                strokeDasharray="1800"
                strokeDashoffset={Math.round(1800 * (1 - lotDrawProgress))}
              >
                {/* Manzanas internas trazadas en perspectiva aérea */}
                <polygon
                  points="535,585 815,532 910,564 645,624"
                  fill={`rgba(238, 107, 150, ${(lotDrawProgress * 0.12).toFixed(3)})`}
                />
                <polygon
                  points="845,526 1055,490 1165,520 945,558"
                  fill={`rgba(245, 241, 250, ${(lotDrawProgress * 0.1).toFixed(3)})`}
                />
                <polygon
                  points="685,634 955,572 1110,612 855,682"
                  fill={`rgba(238, 107, 150, ${(lotDrawProgress * 0.14).toFixed(3)})`}
                />
                <polygon
                  points="990,564 1205,526 1355,562 1148,604"
                  fill={`rgba(81, 91, 27, ${(lotDrawProgress * 0.15).toFixed(3)})`}
                />
                {/* Subdivisiones de lotes de 160 m² y 200 m² */}
                <line x1="605" y1="572" x2="710" y2="608" />
                <line x1="675" y1="558" x2="778" y2="593" />
                <line x1="745" y1="545" x2="845" y2="578" />
                <line x1="765" y1="615" x2="925" y2="664" />
                <line x1="835" y1="598" x2="995" y2="646" />
                <line x1="905" y1="584" x2="1055" y2="628" />
              </g>

              {/* Indicador Georreferenciado en el Canvas: Colegio Virgen Dolorosa (30m) */}
              {scrollProgress >= 0.48 && (
                <g className="transition-opacity duration-500">
                  {/* Línea de cota de 30 metros entre el Pórtico Flamingo y el Colegio Virgen Dolorosa */}
                  <line
                    x1="720"
                    y1="650"
                    x2="865"
                    y2="755"
                    stroke="#EE6B96"
                    strokeWidth="3.5"
                    strokeDasharray="8 6"
                  />
                  <circle cx="720" cy="650" r="8" fill="#EE6B96" stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx="865" cy="755" r="11" fill="#361D42" stroke="#F48FB1" strokeWidth="3.5" />
                  <circle
                    cx="865"
                    cy="755"
                    r="24"
                    fill="none"
                    stroke="#EE6B96"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                </g>
              )}
            </svg>

            {/* Viñeta editorial suave para garantizar contraste de lectura en los 4 tramos */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{
                opacity: scrollProgress > 0.14 ? 1 : 0,
                background:
                  'linear-gradient(180deg, rgba(35,17,43,0.42) 0%, rgba(35,17,43,0.08) 38%, rgba(35,17,43,0.16) 68%, rgba(35,17,43,0.68) 100%)',
              }}
            />
          </div>
        </div>

        {/* Línea decorativa curva ciruela que acompaña el borde izquierdo del ala (idéntica al flyer) */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          style={{ opacity: heroOverlayOpacity }}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          aria-hidden="true"
        >
          <path
            d="M 40,540 C 210,390 385,265 565,245"
            fill="none"
            stroke="#361D42"
            strokeWidth="1.8"
            strokeOpacity="0.65"
          />
        </svg>

        {/* ===================================================================
            CAPA 2: PLUMAS DE FLAMENCO EN PRIMER PLANO CON CONTRA-PARALLAX (2.5D)
           =================================================================== */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {/* Pluma izquierda flotante */}
          <div
            ref={featherLeftRef}
            style={{
              opacity: Math.max(0.18, 1 - scrollProgress * 0.95),
              transform: `translate3d(0, ${-scrollProgress * 90}px, 0)`,
            }}
            className="absolute left-[4%] sm:left-[9%] top-[39%] sm:top-[41%] w-36 sm:w-52 lg:w-60 drop-shadow-[0_18px_28px_rgba(238,107,150,0.32)]"
          >
            <FlamingoFeatherSVG />
          </div>

          {/* Pluma derecha flotante */}
          <div
            ref={featherRightRef}
            style={{
              opacity: Math.max(0.18, 1 - scrollProgress * 0.95),
              transform: `translate3d(0, ${-scrollProgress * 120}px, 0)`,
            }}
            className="absolute right-[5%] sm:right-[11%] top-[34%] sm:top-[35%] w-32 sm:w-48 lg:w-56 drop-shadow-[0_18px_28px_rgba(238,107,150,0.32)]"
          >
            <FlamingoFeatherSVG flip />
          </div>

          {/* Ala / Plumas suaves desenfocadas en la esquina superior derecha (como en el flyer) */}
          <div
            ref={featherTopRightRef}
            style={{
              opacity: Math.max(0.12, 1 - scrollProgress * 1.1),
            }}
            className="absolute -right-12 -top-10 w-52 sm:w-80 lg:w-96 rotate-45 blur-[1.5px] opacity-90"
          >
            <FlamingoFeatherSVG flip />
          </div>
        </div>

        {/* ===================================================================
            CAPA 3: HUD EDITORIAL SUPERIOR & COMPOSICIÓN INICIAL DE PREVENTA
           =================================================================== */}
        <div
          ref={hudParallaxRef}
          className="relative z-30 w-full flex-1 flex flex-col justify-between px-5 sm:px-10 lg:px-16 py-5 sm:py-7 pointer-events-none"
        >
          {/* Barra Superior: Logo Oficial Flamingo Residencial + Estado del Scroll/Precarga */}
          <header className="w-full flex items-start justify-between gap-4 pointer-events-auto">
            <a
              href="#top"
              className="group flex items-center gap-3 rounded-2xl px-3.5 py-2 transition-all duration-300"
              style={{
                backgroundColor:
                  scrollProgress > 0.14 ? 'rgba(35, 17, 43, 0.82)' : 'rgba(245, 241, 250, 0.65)',
                backdropFilter: 'blur(12px)',
                border:
                  scrollProgress > 0.14
                    ? '1px solid rgba(244, 143, 177, 0.28)'
                    : '1px solid rgba(54, 29, 66, 0.12)',
              }}
            >
              <img
                src={
                  scrollProgress > 0.14
                    ? FLAMINGO_BRAND.logos.lightText
                    : FLAMINGO_BRAND.logos.darkText
                }
                alt="Flamingo Residencial"
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Controles rápidos de navegación & Barra de carga minimalista del Flamenco */}
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              {loadedCount < TOTAL_FRAMES && !useFallback25D && (
                <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#361D42]/90 text-[#F5F1FA] text-xs font-dm border border-[#F48FB1]/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#EE6B96] animate-ping" />
                  <span>Cargando secuencia HD · {loadingPct}%</span>
                </div>
              )}

              <button
                type="button"
                onClick={onScrollToLots}
                className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-dm font-medium tracking-wide transition-all cursor-pointer border"
                style={{
                  backgroundColor:
                    scrollProgress > 0.14 ? 'rgba(245, 241, 250, 0.92)' : 'rgba(245, 241, 250, 0.85)',
                  color: '#361D42',
                  borderColor: '#361D42',
                }}
              >
                Plano de Lotes
              </button>

              <button
                type="button"
                onClick={onOpen360}
                className="px-4 py-2.5 rounded-full bg-[#361D42] hover:bg-[#23112B] text-[#F5F1FA] text-xs sm:text-sm font-dm font-medium tracking-wide flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-[#F48FB1]/35"
              >
                <Compass size={15} className="text-[#EE6B96]" />
                <span>Tour 360°</span>
              </button>
            </div>
          </header>

          {/* =================================================================
              BLOQUE EDITORIAL CENTRAL — SE TRANSFORMA SEGÚN EL TRAMO DE SCROLL
             ================================================================= */}
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between pt-0 pb-2">
            {/* TRAMO 1 (0% - 25%): Composición Editorial Exacta del Flyer Preventa */}
            <div
              className="mx-auto text-center transition-all duration-500 pointer-events-auto -mt-2 sm:-mt-6"
              style={{
                opacity: scrollProgress < 0.25 ? 1 : 0,
                transform: `translate3d(0, ${scrollProgress < 0.25 ? 0 : -28}px, 0)`,
                pointerEvents: scrollProgress < 0.25 ? 'auto' : 'none',
              }}
            >
              <div
                className="inline-flex items-center justify-center px-5 py-1 rounded-full border-[1.5px] text-[11px] sm:text-xs lg:text-sm font-dm font-medium uppercase tracking-[0.28em] transition-colors"
                style={{
                  borderColor: scrollProgress > 0.13 ? '#F5F1FA' : '#361D42',
                  color: scrollProgress > 0.13 ? '#F5F1FA' : '#361D42',
                  backgroundColor:
                    scrollProgress > 0.13 ? 'rgba(54, 29, 66, 0.72)' : 'rgba(245, 241, 250, 0.85)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                APROVECHA LA
              </div>

              <h1
                className="mt-1 font-geista font-normal uppercase tracking-[0.06em] text-4xl sm:text-6xl lg:text-[68px] leading-[0.95] transition-colors"
                style={{
                  color: scrollProgress > 0.13 ? '#F5F1FA' : '#361D42',
                  textShadow:
                    scrollProgress > 0.13 ? '0 8px 32px rgba(35, 17, 43, 0.7)' : 'none',
                }}
              >
                PREVENTA
              </h1>

              <div
                className="mt-1.5 space-y-0 font-dm text-xs sm:text-base lg:text-lg transition-colors"
                style={{
                  color: scrollProgress > 0.13 ? '#F5F1FA' : '#361D42',
                }}
              >
                <p>
                  Lotes de <strong className="font-bold">160 m²</strong> y{' '}
                  <strong className="font-bold">200 m²</strong>
                </p>
                <p className="text-[11px] sm:text-sm lg:text-base">
                  Con <strong className="font-bold">título de propiedad.</strong> ¡Entrega
                  Inmediata!
                </p>
              </div>
            </div>

            {/* ZONA MEDIA: TARJETAS DE TRAMO (Servicios en Vivo / Ubicación / Cierre) */}
            <div className="relative w-full flex-1 flex items-center justify-between">
              {/* Columna Izquierda: Píldoras de Servicios Básicos (AGUA, DESAGÜE, ALUMBRADO PÚBLICO) */}
              <div className="space-y-2.5 sm:space-y-3 pointer-events-auto max-w-sm">
                {URBAN_SERVICES.map((srv, idx) => {
                  // Visible tanto en la portada inicial (como en el flyer) como resaltado en Tramo 2 (25% - 55%)
                  const isHighlightedInTramo2 =
                    scrollProgress >= 0.22 && scrollProgress <= 0.62;
                  const isUnlocked = scrollProgress >= srv.progressThreshold;

                  return (
                    <div
                      key={srv.id}
                      className="flamingo-service-pill rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-[#F5F1FA] transition-all duration-500 flex items-center gap-3.5"
                      style={{
                        transform: isHighlightedInTramo2
                          ? `translate3d(${isUnlocked ? '8px' : '0px'}, 0, 0) scale(${
                              isUnlocked ? 1.04 : 1
                            })`
                          : 'translate3d(0, 0, 0) scale(0.96)',
                        borderColor: isUnlocked
                          ? 'rgba(238, 107, 150, 0.85)'
                          : 'rgba(244, 143, 177, 0.3)',
                      }}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#EE6B96]/20 border border-[#EE6B96]/50 flex items-center justify-center shrink-0 text-[#F48FB1]">
                        {idx === 0 && <Droplets size={18} />}
                        {idx === 1 && <Waves size={18} />}
                        {idx === 2 && <Lightbulb size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-dm font-bold text-xs sm:text-sm tracking-[0.2em] uppercase text-white">
                            {srv.title}
                          </span>
                          {isUnlocked && (
                            <CheckCircle2 size={14} className="text-[#EE6B96] shrink-0" />
                          )}
                        </div>
                        {isHighlightedInTramo2 && (
                          <p className="text-[11px] sm:text-xs text-[#EAE3F2]/85 font-dm mt-0.5 leading-snug">
                            {srv.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Columna Derecha: Tarjeta Narrativa Dinámica según Tramo 2, 3 o 4 */}
              {scrollProgress >= 0.25 && (
                <div className="hidden md:block max-w-md rounded-3xl bg-[#361D42]/90 backdrop-blur-xl border border-[#F48FB1]/35 p-6 text-[#F5F1FA] shadow-2xl pointer-events-auto transition-all duration-500">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE6B96]/20 border border-[#EE6B96]/40 text-[#F48FB1] text-[11px] font-dm font-bold uppercase tracking-[0.2em]">
                    <Sparkles size={12} />
                    <span>{currentStage.badge}</span>
                  </div>

                  <h2 className="mt-3 font-geista text-3xl lg:text-4xl text-white tracking-wide uppercase">
                    {currentStage.title}
                  </h2>

                  <p className="mt-1 text-sm font-dm font-bold text-[#F48FB1]">
                    {currentStage.highlight}
                  </p>

                  <p className="mt-2 text-xs sm:text-sm font-dm text-[#EAE3F2]/85 leading-relaxed">
                    {currentStage.description}
                  </p>

                  {activeStageIdx === 2 && (
                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2.5 text-xs text-[#F5F1FA]">
                      <FileCheck2 size={16} className="text-[#EE6B96] shrink-0" />
                      <span>Título de propiedad independizado · Entrega inmediata</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===============================================================
                BARRA INFERIOR DEL HUD: UBICACIÓN (30M COLEGIO) + BOTONES CÁPSULA WHATSAPP
               =============================================================== */}
            <div className="w-full flex flex-col gap-3 pointer-events-auto">
              {/* Indicador georreferenciado derecha: A solo 30 metros del Colegio Virgen Dolorosa */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Indicador de progreso de construcción por scroll */}
                <div
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs font-dm transition-colors"
                  style={{
                    backgroundColor:
                      scrollProgress > 0.14
                        ? 'rgba(35, 17, 43, 0.84)'
                        : 'rgba(245, 241, 250, 0.82)',
                    color: scrollProgress > 0.14 ? '#F5F1FA' : '#361D42',
                    border:
                      scrollProgress > 0.14
                        ? '1px solid rgba(244, 143, 177, 0.35)'
                        : '1px solid rgba(54, 29, 66, 0.25)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#EE6B96]" />
                  <span className="font-bold tabular-nums">
                    Construcción: {Math.round(scrollProgress * 100)}%
                  </span>
                  <span className="hidden sm:inline opacity-75">· {currentStage.title}</span>
                </div>

                {/* Pin de Ubicación Oficial del Flyer */}
                <div
                  className="ml-auto flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all duration-300"
                  style={{
                    backgroundColor:
                      scrollProgress > 0.14
                        ? 'rgba(54, 29, 66, 0.9)'
                        : 'rgba(245, 241, 250, 0.85)',
                    color: scrollProgress > 0.14 ? '#F5F1FA' : '#361D42',
                    border:
                      scrollProgress > 0.5 && scrollProgress < 0.86
                        ? '2px solid #EE6B96'
                        : '1px solid rgba(54, 29, 66, 0.25)',
                  }}
                >
                  <MapPin size={22} className="text-[#EE6B96] shrink-0" />
                  <div className="text-right font-dm leading-tight">
                    <p className="text-xs sm:text-sm">
                      A solo <strong className="font-bold">30 metros</strong> del
                    </p>
                    <p className="text-xs sm:text-sm font-medium">Colegio Virgen Dolorosa</p>
                  </div>
                </div>
              </div>

              {/* Botones Cápsula de WhatsApp (940 152 191 y 942 710 250) fieles al Flyer */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-1">
                {WHATSAPP_ADVISORS.map((adv, idx) => (
                  <a
                    key={adv.id}
                    href={buildFlamingoWhatsAppUrl(idx as 0 | 1)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-dm text-sm sm:text-base lg:text-lg font-medium tracking-[0.14em] transition-all duration-300 hover:scale-105 shadow-md"
                    style={{
                      backgroundColor:
                        scrollProgress > 0.14
                          ? 'rgba(245, 241, 250, 0.95)'
                          : 'rgba(245, 241, 250, 0.9)',
                      color: '#361D42',
                      border: '1.5px solid #361D42',
                    }}
                  >
                    <MessageCircle
                      size={18}
                      className="text-[#361D42] group-hover:text-[#EE6B96] transition-colors shrink-0"
                    />
                    <span className="tabular-nums font-bold">{adv.displayPhone}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso lineal minimalista en el borde inferior */}
        <div className="relative z-30 w-full h-1.5 bg-[#361D42]/20">
          <div
            className="h-full bg-gradient-to-r from-[#361D42] via-[#EE6B96] to-[#F48FB1] transition-all duration-75"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
};
