import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Expand, Minimize2, Pause, Play, Rotate3D, ZoomIn, ZoomOut } from 'lucide-react';

export interface AerialPanoramaItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  altitude: string;
  equirectangularUrl: string;
  thumbUrl: string;
  initialYaw?: number;
  initialPitch?: number;
}

export const REAL_DRIVE_PANORAMAS_360: AerialPanoramaItem[] = [
  {
    id: 'pano-0098',
    code: 'DJI · 0098',
    title: 'Pórtico de Ingreso y Colegio Virgen Dolorosa (a 30m)',
    subtitle: 'Vista aérea 360° sobre el acceso principal y el entorno educativo consolidado',
    altitude: 'Altura Dron · 65m',
    equirectangularUrl: '/drive/360/pano-0098.webp',
    thumbUrl: '/drive/360/pano-0098-thumb.webp',
    initialYaw: 185,
    initialPitch: -18,
  },
  {
    id: 'pano-0099',
    code: 'DJI · 0099',
    title: 'Avenida Principal y Trazo de Manzanas',
    subtitle: 'Perspectiva esférica sobre el eje vial central y lotes de 160 m² y 200 m²',
    altitude: 'Altura Dron · 70m',
    equirectangularUrl: '/drive/360/pano-0099.webp',
    thumbUrl: '/drive/360/pano-0099-thumb.webp',
    initialYaw: 160,
    initialPitch: -16,
  },
  {
    id: 'pano-0100',
    code: 'DJI · 0100',
    title: 'Parque Central y Boulevard de Palmeras',
    subtitle: 'Vista 360° del corazón recreativo del proyecto y su alameda central',
    altitude: 'Altura Dron · 60m',
    equirectangularUrl: '/drive/360/pano-0100.webp',
    thumbUrl: '/drive/360/pano-0100-thumb.webp',
    initialYaw: 145,
    initialPitch: -15,
  },
  {
    id: 'pano-0102',
    code: 'DJI · 0102',
    title: 'Corredor Vial y Conexión Urbana',
    subtitle: 'Panorámica completa de la vía de acceso directo y lotes esquineros',
    altitude: 'Altura Dron · 75m',
    equirectangularUrl: '/drive/360/pano-0102.webp',
    thumbUrl: '/drive/360/pano-0102-thumb.webp',
    initialYaw: 200,
    initialPitch: -18,
  },
  {
    id: 'pano-0103',
    code: 'DJI · 0103',
    title: 'Sector Residencial Norte — Lotes de 160 m²',
    subtitle: 'Vista aérea sobre las manzanas interiores con cajas de agua y desagüe',
    altitude: 'Altura Dron · 68m',
    equirectangularUrl: '/drive/360/pano-0103.webp',
    thumbUrl: '/drive/360/pano-0103-thumb.webp',
    initialYaw: 175,
    initialPitch: -16,
  },
  {
    id: 'pano-0104',
    code: 'DJI · 0104',
    title: 'Sector Residencial Sur — Lotes de 200 m²',
    subtitle: 'Amplitud de frentes y orientación hacia la brisa natural del valle',
    altitude: 'Altura Dron · 72m',
    equirectangularUrl: '/drive/360/pano-0104.webp',
    thumbUrl: '/drive/360/pano-0104-thumb.webp',
    initialYaw: 190,
    initialPitch: -16,
  },
  {
    id: 'pano-0105',
    code: 'DJI · 0105',
    title: 'Vista Integral del Condominio y Valle',
    subtitle: 'Dominio visual completo de la parcelación y cordillera circundante',
    altitude: 'Altura Dron · 85m',
    equirectangularUrl: '/drive/360/pano-0105.webp',
    thumbUrl: '/drive/360/pano-0105-thumb.webp',
    initialYaw: 170,
    initialPitch: -18,
  },
  {
    id: 'pano-0120',
    code: 'DJI · 0120',
    title: 'Horizonte Panorámico 360° — Entorno Consolidado',
    subtitle: 'Conectividad inmediata con equipamiento educativo, recreativo y vías',
    altitude: 'Altura Dron · 90m',
    equirectangularUrl: '/drive/360/pano-0120.webp',
    thumbUrl: '/drive/360/pano-0120-thumb.webp',
    initialYaw: 180,
    initialPitch: -15,
  },
];

export const Real360AerialViewer: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentPano = REAL_DRIVE_PANORAMAS_360[selectedIdx] || REAL_DRIVE_PANORAMAS_360[0];

  const [yaw, setYaw] = useState<number>(currentPano.initialYaw ?? 180);
  const [pitch, setPitch] = useState<number>(currentPano.initialPitch ?? -16);
  const [fov, setFov] = useState<number>(68);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);

  const yawRef = useRef(yaw);
  const pitchRef = useRef(pitch);
  const fovRef = useRef(fov);
  const autoRotateRef = useRef(autoRotate);
  const draggingRef = useRef(isDragging);
  const dragStartRef = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });

  yawRef.current = yaw;
  pitchRef.current = pitch;
  fovRef.current = fov;
  autoRotateRef.current = autoRotate;
  draggingRef.current = isDragging;

  // Initialize Three.js Spherical Scene
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      fovRef.current,
      Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight),
      0.1,
      1100
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'absolute inset-0 h-full w-full';
    host.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const resize = new ResizeObserver(() => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    });
    resize.observe(host);

    let frame = 0;
    let previous = performance.now();
    const render = (now: number) => {
      const elapsed = Math.min(now - previous, 50);
      previous = now;
      const rotating = autoRotateRef.current && !draggingRef.current;
      const nextYaw = (yawRef.current + (rotating ? elapsed * 0.0038 : 0) + 360) % 360;
      if (rotating) {
        yawRef.current = nextYaw;
        if (now % 140 < 20) setYaw(nextYaw);
      }

      if (Math.abs(camera.fov - fovRef.current) > 0.1) {
        camera.fov += (fovRef.current - camera.fov) * 0.18;
        camera.updateProjectionMatrix();
      }

      const phi = THREE.MathUtils.degToRad(90 - pitchRef.current);
      const theta = THREE.MathUtils.degToRad(yawRef.current);
      camera.position.setFromSphericalCoords(1, phi, theta);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      sphereRef.current?.geometry.dispose();
      (sphereRef.current?.material as THREE.Material | undefined)?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      sphereRef.current = null;
    };
  }, []);

  // Load equirectangular texture when selection changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    setIsLoading(true);
    const nextYaw = currentPano.initialYaw ?? 180;
    const nextPitch = currentPano.initialPitch ?? -16;
    yawRef.current = nextYaw;
    pitchRef.current = nextPitch;
    setYaw(nextYaw);
    setPitch(nextPitch);

    const loader = new THREE.TextureLoader();
    let active = true;
    loader.load(
      currentPano.equirectangularUrl,
      (texture) => {
        if (!active) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const geometry = new THREE.SphereGeometry(500, 96, 64);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);

        if (sphereRef.current) {
          scene.remove(sphereRef.current);
          sphereRef.current.geometry.dispose();
          (sphereRef.current.material as THREE.Material).dispose();
        }
        sphereRef.current = sphere;
        scene.add(sphere);
        setIsLoading(false);
      },
      undefined,
      () => {
        if (active) setIsLoading(false);
      }
    );

    return () => {
      active = false;
    };
  }, [currentPano]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      yaw: yawRef.current,
      pitch: pitchRef.current,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const nextYaw = (dragStartRef.current.yaw - dx * 0.14 + 360) % 360;
    const nextPitch = Math.max(-72, Math.min(45, dragStartRef.current.pitch + dy * 0.14));
    yawRef.current = nextYaw;
    pitchRef.current = nextPitch;
    setYaw(nextYaw);
    setPitch(nextPitch);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = false;
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden rounded-[2rem] border border-[#361D42]/15 bg-[#23112B] text-[#F5F1FA] shadow-[0_28px_80px_rgba(35,17,43,0.22)]"
    >
      {/* Top Bar HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#23112B]/95 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EE6B96]/20 text-[#EE6B96] border border-[#EE6B96]/35">
            <Rotate3D size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#515B1B] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5F1FA]">
                {currentPano.code}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#EAE3F2]/70">
                {currentPano.altitude} · Captura Real en Terreno
              </span>
            </div>
            <h3 className="font-display text-xl text-white sm:text-2xl">{currentPano.title}</h3>
          </div>
        </div>

        {/* Viewer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs text-[#EAE3F2]/85 sm:flex">
            <Compass size={14} className="text-[#EE6B96]" />
            <span>{Math.round(yaw)}°</span>
            <span className="text-white/30">·</span>
            <span>Inclinación {Math.round(pitch)}°</span>
          </div>

          <button
            type="button"
            onClick={() => setFov((v) => Math.max(38, v - 10))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition hover:border-[#EE6B96] hover:bg-[#EE6B96] hover:text-white"
            title="Acercar vista"
            aria-label="Acercar vista"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={() => setFov((v) => Math.min(88, v + 10))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition hover:border-[#EE6B96] hover:bg-[#EE6B96] hover:text-white"
            title="Alejar vista"
            aria-label="Alejar vista"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition ${
              autoRotate
                ? 'border-[#EE6B96]/50 bg-[#EE6B96]/20 text-[#F48FB1]'
                : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
            {autoRotate ? 'Órbita Activa' : 'Orbitar'}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition hover:border-[#EE6B96] hover:bg-[#EE6B96] hover:text-white"
            title="Pantalla completa"
            aria-label="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Expand size={15} />}
          </button>
        </div>
      </div>

      {/* Main 360 Spherical Stage */}
      <div
        ref={canvasHostRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative h-[460px] w-full select-none touch-none overflow-hidden sm:h-[560px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Loading Shimmer */}
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#23112B]/70 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EE6B96] border-t-transparent" />
            <span className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#EAE3F2]">
              Cargando Esfera 360° ({currentPano.code})...
            </span>
          </div>
        )}

        {/* Interactive Drag Hint Pill */}
        <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-[#23112B]/75 px-4 py-2 text-xs font-medium text-[#F5F1FA] backdrop-blur-md">
          <Rotate3D size={15} className="text-[#EE6B96]" />
          <span>Arrastra en 360° para explorar el terreno real y su entorno</span>
        </div>

        {/* Bottom Caption Overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-4 bg-gradient-to-t from-[#23112B]/90 via-[#23112B]/40 to-transparent p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F48FB1]">
              Vista {selectedIdx + 1} de {REAL_DRIVE_PANORAMAS_360.length} · Registro Aéreo Oficial DJI
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#EAE3F2]/90">{currentPano.subtitle}</p>
          </div>
          <div className="rounded-full border border-white/15 bg-black/45 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#EAE3F2]/85 backdrop-blur-md">
            Lotes de 160 m² y 200 m² · Entrega Inmediata
          </div>
        </div>
      </div>

      {/* Filmstrip Selector of all 8 Real 360° Panoramas */}
      <div className="border-t border-white/10 bg-[#1B0C22] px-5 py-4">
        <div className="mb-2.5 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-[0.18em] text-[#EAE3F2]/75">
            Selecciona una captura aérea 360° del proyecto ({REAL_DRIVE_PANORAMAS_360.length} puntos reales)
          </span>
          <span className="hidden text-[11px] text-[#EAE3F2]/50 sm:inline">
            Vuelo fotogramétrico real sobre Flamingo Residencial
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {REAL_DRIVE_PANORAMAS_360.map((item, idx) => {
            const active = idx === selectedIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                  active
                    ? 'border-[#EE6B96] ring-2 ring-[#EE6B96]/50 scale-[1.02]'
                    : 'border-white/10 opacity-75 hover:border-white/30 hover:opacity-100'
                }`}
              >
                <div className="aspect-[2/1] w-full overflow-hidden bg-[#361D42]">
                  <img
                    src={item.thumbUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="bg-[#23112B]/95 px-2.5 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#EE6B96]">
                      {item.code}
                    </span>
                    <span className="text-[9px] text-white/55">360°</span>
                  </div>
                  <p className="truncate text-[11px] font-medium text-white/90">{item.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
