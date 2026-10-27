import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Rotate3D,
  Maximize2,
  Sparkles,
  Navigation,
  Eye,
} from 'lucide-react';
import type { FlamingoHouseModel, RoomPanorama360 } from '../data/flamingoData';

interface Panorama360ViewerProps {
  model: FlamingoHouseModel;
  lotTitle?: string;
  onClose: () => void;
}

export const Panorama360Viewer: React.FC<Panorama360ViewerProps> = ({
  model,
  lotTitle,
  onClose,
}) => {
  const [viewerMode, setViewerMode] = useState<'interactive360' | 'kuula'>('interactive360');
  const [activeRoomId, setActiveRoomId] = useState<'sala' | 'cocina' | 'dormitorio'>('sala');
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({
    x: 0,
    y: 0,
    yaw: 0,
    pitch: 0,
  });

  const currentRoom: RoomPanorama360 =
    model.rooms360.find((r) => r.id === activeRoomId) || model.rooms360[0];

  useEffect(() => {
    if (!autoRotate || isDragging || viewerMode !== 'interactive360') return;
    const interval = window.setInterval(() => {
      setYaw((prev) => (prev + 0.18) % 360);
    }, 30);
    return () => window.clearInterval(interval);
  }, [autoRotate, isDragging, viewerMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setAutoRotate(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw,
      pitch,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setYaw((dragStartRef.current.yaw - dx * 0.25 + 360) % 360);
    setPitch(Math.max(-28, Math.min(28, dragStartRef.current.pitch + dy * 0.16)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-neutral-950 flex flex-col animate-fade-in select-none">
      {/* Header Superior */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-neutral-950/85 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-brand-orange text-white text-xs uppercase tracking-[0.16em] font-bold transition-all cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Volver al Modelo</span>
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-brand-light-orange font-bold">
              Tour Virtual Equirectangular 360° · {lotTitle || 'Residencial Flamingo'}
            </p>
            <h2 className="text-base sm:text-lg font-primary font-bold text-white uppercase tracking-wider">
              {model.name} — {currentRoom.label}
            </h2>
          </div>
        </div>

        {/* Selector de Motor 360° (Hotspots Interactivos vs Kuula VR) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewerMode('interactive360')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              viewerMode === 'interactive360'
                ? 'bg-brand-orange text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Compass size={15} />
            <span>Visor 360° Hotspots</span>
          </button>
          <button
            type="button"
            onClick={() => setViewerMode('kuula')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              viewerMode === 'kuula'
                ? 'bg-brand-primary text-white shadow-lg border border-white/30'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Rotate3D size={15} />
            <span>Escena VR Completa</span>
          </button>
        </div>
      </header>

      {/* Cuerpo del Visor 360° */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {viewerMode === 'kuula' ? (
          <iframe
            src={model.kuulaTourUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="xr-spatial-tracking; gyroscope; accelerometer"
            title={`Recorrido 360 ${model.name}`}
          />
        ) : (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full h-full overflow-hidden ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Capa Equirectangular + Foto Arquitectónica Panorámica con Desplazamiento Esférico */}
            <div
              className="absolute inset-[-18%] transition-transform duration-75 ease-out"
              style={{
                backgroundImage: `url(${currentRoom.backdropPhotoUrl}), url(${currentRoom.equirectangularUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: `${50 + Math.sin((yaw * Math.PI) / 180) * 35}% ${
                  50 + pitch * 1.1
                }%`,
                transform: `scale(1.16) rotateX(${pitch * 0.18}deg) rotateY(${
                  Math.sin((yaw * Math.PI) / 180) * 6
                }deg)`,
              }}
            />

            {/* Vignette + Malla de Horizonte 360° */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/45" />

            {/* Hotspots 3D para caminar entre ambientes (Sala, Cocina, Dormitorios) */}
            {currentRoom.hotspots.map((hs) => {
              const offsetX = 50 + ((hs.yaw - (yaw % 60)) * 0.85);
              const offsetY = 54 + (hs.pitch - pitch * 0.5);
              const clampedX = Math.max(15, Math.min(85, offsetX));
              const clampedY = Math.max(22, Math.min(78, offsetY));

              return (
                <button
                  key={hs.targetRoomId}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveRoomId(hs.targetRoomId);
                    setYaw(0);
                    setPitch(0);
                  }}
                  style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center gap-2 cursor-pointer"
                >
                  <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-brand-orange/90 group-hover:bg-brand-orange text-white border-2 border-white shadow-2xl transition-transform duration-300 group-hover:scale-115">
                    <Navigation size={20} className="rotate-45" />
                    <span className="absolute inset-0 rounded-full bg-brand-orange animate-ping opacity-40" />
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-neutral-950/85 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xl">
                    {hs.label}
                  </span>
                </button>
              );
            })}

            {/* Brújula 360° e Indicador de Arrastre */}
            <div className="pointer-events-none absolute top-5 left-6 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs">
              <Rotate3D size={16} className="text-brand-orange animate-spin [animation-duration:8s]" />
              <span>Arrastra para girar 360° · Yaw: {Math.round(yaw)}°</span>
            </div>

            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              className="absolute top-5 right-6 z-20 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} className="text-brand-orange" />
              <span>{autoRotate ? 'Pausar Giro Automático' : 'Reanudar Giro 360°'}</span>
            </button>
          </div>
        )}

        {/* Dock Inferior de Selección de Ambientes 360° (Sala-Comedor, Cocina, Dormitorio Principal) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-neutral-950/85 backdrop-blur-xl border border-white/15 shadow-2xl">
          {model.rooms360.map((room) => {
            const active = room.id === activeRoomId && viewerMode === 'interactive360';
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setViewerMode('interactive360');
                  setActiveRoomId(room.id);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-brand-orange text-white shadow-lg scale-105'
                    : 'bg-white/5 text-white/75 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Eye size={14} />
                <span>{room.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
