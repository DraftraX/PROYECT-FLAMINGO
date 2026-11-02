import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Compass, Navigation, Rotate3D, Sparkles } from 'lucide-react';
import type { FlamingoHouseModel, RoomPanorama360 } from '../data/flamingoData';

interface Panorama360ViewerProps {
  model: FlamingoHouseModel;
  lotTitle?: string;
  onClose: () => void;
}

export const Panorama360Viewer: React.FC<Panorama360ViewerProps> = ({ model, lotTitle, onClose }) => {
  const [activeRoomId, setActiveRoomId] = useState<'sala' | 'cocina' | 'dormitorio'>('sala');
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const autoRotateRef = useRef(true);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });
  const currentRoom: RoomPanorama360 = model.rooms360.find((room) => room.id === activeRoomId) || model.rooms360[0];
  yawRef.current = yaw;
  pitchRef.current = pitch;
  autoRotateRef.current = autoRotate;
  draggingRef.current = isDragging;

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, host.clientWidth / host.clientHeight, 0.1, 1100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label', 'Tour panorámico esférico de 360 grados');
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
    return () => {
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

  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!scene || !renderer || !camera) return;
    const loader = new THREE.TextureLoader();
    let active = true;
    loader.load(currentRoom.equirectangularUrl, (texture) => {
      if (!active) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.mapping = THREE.EquirectangularReflectionMapping;
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
    });
    let frame = 0;
    let previous = performance.now();
    const render = (now: number) => {
      const elapsed = Math.min(now - previous, 50);
      previous = now;
      const rotating = autoRotateRef.current && !draggingRef.current;
      const currentYaw = yawRef.current + (rotating ? elapsed * 0.004 : 0);
      if (rotating) {
        yawRef.current = currentYaw % 360;
        if (now % 120 < 20) setYaw(yawRef.current);
      }
      const phi = THREE.MathUtils.degToRad(90 - pitchRef.current);
      const theta = THREE.MathUtils.degToRad(currentYaw);
      camera.position.setFromSphericalCoords(1, phi, theta);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [currentRoom.equirectangularUrl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setIsDragging(true);
    autoRotateRef.current = false;
    setAutoRotate(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY, yaw, pitch };
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const nextYaw = (dragStartRef.current.yaw - dx * 0.12 + 360) % 360;
    const nextPitch = Math.max(-65, Math.min(65, dragStartRef.current.pitch + dy * 0.12));
    yawRef.current = nextYaw;
    pitchRef.current = nextPitch;
    setYaw(nextYaw);
    setPitch(nextPitch);
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    draggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-neutral-950 text-white animate-fade-in select-none">
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-neutral-950/85 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-pink-700"><ArrowLeft size={15} /> Volver</button>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-200">Recorrido conceptual · {lotTitle || 'Residencial Flamingo'}</p><h2 className="text-base font-bold">{model.name} — {currentRoom.label}</h2></div>
        </div>
        <button type="button" onClick={() => setAutoRotate((value) => !value)} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs"><Sparkles size={14} className="text-pink-200" />{autoRotate ? 'Pausar giro' : 'Giro automático'}</button>
      </header>
      <div ref={canvasHostRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className={`relative min-h-0 flex-1 touch-none overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        {!sphereRef.current && <img src={currentRoom.equirectangularUrl} alt="Vista panorámica del ambiente" className="absolute inset-0 h-full w-full object-cover opacity-0" />}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 z-10 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="pointer-events-none absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs"><Rotate3D size={16} className="text-pink-200" /> Arrastra para mirar · {Math.round(yaw)}°</div>
        {currentRoom.hotspots.map((hotspot) => {
          const x = 50 + (((hotspot.yaw - yaw + 540) % 360) - 180) * 0.42;
          const y = 54 + (hotspot.pitch - pitch) * 0.45;
          if (x < 8 || x > 92) return null;
          return <button key={hotspot.targetRoomId} type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => { setActiveRoomId(hotspot.targetRoomId); setYaw(0); setPitch(0); }} style={{ left: `${x}%`, top: `${Math.max(18, Math.min(78, y))}%` }} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"><span className="relative grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-pink-700/90 shadow-xl"><Navigation size={18} className="rotate-45" /></span><span className="whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-3 py-1.5 text-[10px] font-bold uppercase">{hotspot.label}</span></button>;
        })}
      </div>
      <footer className="relative z-20 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-neutral-950/95 px-4 py-4">
        {model.rooms360.map((room) => <button key={room.id} type="button" onClick={() => { setActiveRoomId(room.id); setYaw(0); setPitch(0); }} className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${room.id === activeRoomId ? 'bg-pink-700 text-white' : 'bg-white/10 text-white/75 hover:bg-white/20'}`}><Compass size={14} className="mr-2 inline" />{room.label}</button>)}
        <span className="basis-full text-center text-[10px] text-white/45">Imágenes de referencia generadas con IA; no representan planos o acabados aprobados.</span>
      </footer>
    </div>
  );
};
