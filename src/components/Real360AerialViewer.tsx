import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface AerialPanoramaItem {
  id: string;
  code: string;
  title: string;
  equirectangularUrl: string;
  initialYaw?: number;
  initialPitch?: number;
}

export const REAL_DRIVE_PANORAMAS_360: AerialPanoramaItem[] = [
  {
    id: 'pano-0098',
    code: 'VISTA 01 / 08',
    title: 'Pórtico de Ingreso y Colegio Virgen Dolorosa (a 30m)',
    equirectangularUrl: '/drive/360/pano-0098.webp',
    initialYaw: 185,
    initialPitch: -18,
  },
  {
    id: 'pano-0099',
    code: 'VISTA 02 / 08',
    title: 'Avenida Principal y Manzanas de 160 m² y 200 m²',
    equirectangularUrl: '/drive/360/pano-0099.webp',
    initialYaw: 160,
    initialPitch: -16,
  },
  {
    id: 'pano-0100',
    code: 'VISTA 03 / 08',
    title: 'Parque Central y Alameda de Palmeras',
    equirectangularUrl: '/drive/360/pano-0100.webp',
    initialYaw: 145,
    initialPitch: -15,
  },
  {
    id: 'pano-0102',
    code: 'VISTA 04 / 08',
    title: 'Corredor Vial y Acceso Directo',
    equirectangularUrl: '/drive/360/pano-0102.webp',
    initialYaw: 200,
    initialPitch: -18,
  },
  {
    id: 'pano-0103',
    code: 'VISTA 05 / 08',
    title: 'Sector Residencial Norte · Lotes de 160 m²',
    equirectangularUrl: '/drive/360/pano-0103.webp',
    initialYaw: 175,
    initialPitch: -16,
  },
  {
    id: 'pano-0104',
    code: 'VISTA 06 / 08',
    title: 'Sector Residencial Sur · Lotes de 200 m²',
    equirectangularUrl: '/drive/360/pano-0104.webp',
    initialYaw: 190,
    initialPitch: -16,
  },
  {
    id: 'pano-0105',
    code: 'VISTA 07 / 08',
    title: 'Panorámica Integral del Condominio',
    equirectangularUrl: '/drive/360/pano-0105.webp',
    initialYaw: 170,
    initialPitch: -18,
  },
  {
    id: 'pano-0120',
    code: 'VISTA 08 / 08',
    title: 'Horizonte del Valle y Entorno Consolidado',
    equirectangularUrl: '/drive/360/pano-0120.webp',
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

  const stageWrapRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setIsLoading(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      fovRef.current,
      Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight),
      0.1,
      1100
    );

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
      const nextYaw = (yawRef.current + (rotating ? elapsed * 0.0035 : 0) + 360) % 360;
      if (rotating) {
        yawRef.current = nextYaw;
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
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

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
    const el = stageWrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Clean Panoramic Frame (Selva Profunda style) */}
      <div
        ref={stageWrapRef}
        className="relative w-full h-[460px] sm:h-[560px] overflow-hidden bg-[#23112B]"
      >
        <div
          ref={canvasHostRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative h-full w-full select-none touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        />

        {/* Persistent Loading Overlay (CSS opacity to prevent DOM insertBefore / removeChild issues) */}
        <div
          className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#23112B]/40 backdrop-blur-sm transition-opacity duration-200 ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="font-dm text-xs uppercase tracking-[0.25em] text-white">
            Cargando vista 360°...
          </span>
        </div>

        {/* Minimalist Top-Left Caption */}
        <div className="pointer-events-none absolute left-6 top-6 z-10 bg-white/92 backdrop-blur-md px-5 py-3 text-[#361D42]">
          <span className="block font-dm text-[10px] font-bold uppercase tracking-[0.24em] text-[#515B1B]">
            {`${currentPano.code} · ARRASTRA PARA GIRAR EN 360°`}
          </span>
          <p className="font-geista text-xl sm:text-2xl text-[#361D42] mt-0.5">
            {currentPano.title}
          </p>
        </div>
      </div>

      {/* Selva Profunda Minimalist Status Legend + Floating Control Dock */}
      <div className="flex flex-col items-center gap-5">
        {/* 3 Pastel Status Pills (exact Selva Profunda reference) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-[#E6F2EA] px-6 py-2 font-dm text-xs font-bold text-[#26643B]">
            Disponible · 160 m² y 200 m²
          </span>
          <span className="rounded-full bg-[#FDF3E3] px-6 py-2 font-dm text-xs font-bold text-[#9C6516]">
            Separación en Preventa
          </span>
          <span className="rounded-full bg-[#FCE8EF] px-6 py-2 font-dm text-xs font-bold text-[#B33662]">
            Entrega Inmediata
          </span>
        </div>

        {/* Clean White Pill Control Dock (exact Selva Profunda reference) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-[0_10px_35px_rgba(54,29,66,0.08)] border border-[#361D42]/10">
          <button
            type="button"
            onClick={() => setFov((v) => Math.max(38, v - 10))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-medium text-[#361D42] hover:bg-[#EAE3F2] transition-colors cursor-pointer"
            title="Acercar"
            aria-label="Acercar"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setFov((v) => Math.min(88, v + 10))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-medium text-[#361D42] hover:bg-[#EAE3F2] transition-colors cursor-pointer"
            title="Alejar"
            aria-label="Alejar"
          >
            −
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`px-4 h-10 rounded-full font-dm text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              autoRotate ? 'bg-[#361D42] text-white' : 'text-[#361D42] hover:bg-[#EAE3F2]'
            }`}
          >
            360°
          </button>

          <div className="h-5 w-px bg-[#361D42]/15 mx-1" />

          <button
            type="button"
            onClick={() =>
              setSelectedIdx(
                (i) => (i - 1 + REAL_DRIVE_PANORAMAS_360.length) % REAL_DRIVE_PANORAMAS_360.length
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-[#361D42] hover:bg-[#EAE3F2] transition-colors cursor-pointer"
            title="Vista anterior"
            aria-label="Vista anterior"
          >
            ←
          </button>

          {/* Numbered Dots 1..8 */}
          <div className="flex items-center gap-1 px-1">
            {REAL_DRIVE_PANORAMAS_360.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`h-8 w-8 rounded-full font-dm text-xs font-bold transition-colors cursor-pointer ${
                  idx === selectedIdx
                    ? 'bg-[#EE6B96] text-white'
                    : 'text-[#361D42]/70 hover:bg-[#EAE3F2]'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSelectedIdx((i) => (i + 1) % REAL_DRIVE_PANORAMAS_360.length)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-[#361D42] hover:bg-[#EAE3F2] transition-colors cursor-pointer"
            title="Siguiente vista"
            aria-label="Siguiente vista"
          >
            →
          </button>

          <div className="h-5 w-px bg-[#361D42]/15 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex px-4 h-10 items-center justify-center rounded-full font-dm text-xs font-medium text-[#361D42] hover:bg-[#EAE3F2] transition-colors cursor-pointer"
          >
            Expandir
          </button>
        </div>
      </div>
    </div>
  );
};
