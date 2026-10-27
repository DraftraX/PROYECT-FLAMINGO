import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Compass,
  Globe,
  MapPin,
  Navigation,
  Play,
  Video,
  X,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  getAssetUrl,
  LOCATION_MILESTONES,
  type LocationMilestone,
} from '../data/flamingoData';

interface LocationMapProps {
  onBackToShowroom?: () => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({ onBackToShowroom }) => {
  const [introFlyDone, setIntroFlyDone] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<LocationMilestone>(
    LOCATION_MILESTONES[0]
  );
  const [fullVideoMilestone, setFullVideoMilestone] = useState<LocationMilestone | null>(
    null
  );
  const [mapMode, setMapMode] = useState<'cinematic' | 'satellite3d'>('cinematic');

  const planetPoster = getAssetUrl('location/photos/FOTO_VISTA_PLANETA_PERU.webp');
  const planetFlyVideo = getAssetUrl('location/videos/video_mapa.mp4');

  return (
    <div className="relative w-full h-app overflow-hidden bg-neutral-950 select-none">
      {/* Modo 1: Vuelo Satelital Cinemático + Puntos Interactivos con Videos Reales */}
      {mapMode === 'cinematic' ? (
        <div className="relative w-full h-full">
          <img
            src={planetPoster}
            alt="Vista Satelital Perú · Residencial Flamingo"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <video
            src={planetFlyVideo}
            autoPlay
            muted
            playsInline
            onEnded={() => setIntroFlyDone(true)}
            onError={() => setIntroFlyDone(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-transparent to-neutral-950/50" />

          {/* Polígono e Hitos Interactivos sobre el Mapa Satelital */}
          <div className="absolute inset-0 z-10">
            {/* Pin Central del Proyecto Residencial Flamingo */}
            <div
              style={{ left: '51%', top: '44%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20"
            >
              <div className="relative flex items-center justify-center px-4 py-2 rounded-full bg-brand-orange text-white font-primary text-xs font-extrabold uppercase tracking-widest shadow-2xl border-2 border-white">
                <MapPin size={15} className="mr-1.5" />
                Residencial Flamingo
                <span className="absolute inset-0 rounded-full bg-brand-orange animate-ping opacity-40" />
              </div>
            </div>

            {/* Pines de los 5 Hitos con Video */}
            {LOCATION_MILESTONES.map((m) => {
              const active = selectedMilestone.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMilestone(m)}
                  style={{ left: `${m.xPercent}%`, top: `${m.yPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    active ? 'z-30 scale-110' : 'z-20 hover:scale-105'
                  }`}
                >
                  <span
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border text-[11px] font-bold uppercase tracking-wider shadow-2xl transition-colors ${
                      active
                        ? 'bg-brand-primary border-brand-orange text-white ring-2 ring-brand-orange/50'
                        : 'bg-black/65 border-white/25 text-white/85 group-hover:bg-brand-primary'
                    }`}
                  >
                    <Video size={13} className="text-brand-orange" />
                    <span>{m.title.split(' ')[0]}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/15 text-[9px] text-brand-light-orange">
                      {m.distanceTime}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Modo 2: Mapa Satelital 3D Interactivo con Polígono y Rutas */
        <div className="relative w-full h-full">
          <iframe
            title="Mapa Satelital 3D Residencial Flamingo"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31857.26907447021!2d-80.4682!3d-3.5665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x90338dc28c3a500f%3A0x60417f707780f685!2sTumbes!5e1!3m2!1ses-419!2spe!4v1710000000000!5m2!1ses-419!2spe"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {/* Barra Superior de Conmutación */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-full bg-neutral-950/85 backdrop-blur-xl border border-white/15 shadow-2xl">
        <button
          type="button"
          onClick={() => setMapMode('cinematic')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            mapMode === 'cinematic'
              ? 'bg-brand-orange text-white shadow'
              : 'text-white/75 hover:text-white'
          }`}
        >
          <Globe size={15} />
          <span>Vuelo Satelital & Hitos en Video</span>
        </button>
        <button
          type="button"
          onClick={() => setMapMode('satellite3d')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            mapMode === 'satellite3d'
              ? 'bg-brand-orange text-white shadow'
              : 'text-white/75 hover:text-white'
          }`}
        >
          <Compass size={15} />
          <span>Cartografía Satelital 3D</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          if (onBackToShowroom) {
            onBackToShowroom();
          } else {
            window.location.href = '/showroom?step=lots';
          }
        }}
        className="absolute top-5 right-[4.5rem] z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.18em] font-semibold hover:bg-black/80 transition-colors cursor-pointer"
      >
        <ArrowLeft size={13} />
        <span>Volver al Showroom</span>
      </button>

      {/* Tarjeta Flotante Inferior Derecha con Video Preview del Hito Seleccionado */}
      <div className="absolute bottom-6 right-6 z-30 w-[clamp(300px,32vw,420px)] rounded-2xl overflow-hidden bg-neutral-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <video
            key={selectedMilestone.previewVideo}
            src={selectedMilestone.previewVideo}
            poster={selectedMilestone.poster}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow">
            <Clock size={12} /> A {selectedMilestone.distanceTime} del Proyecto
          </span>
          <button
            type="button"
            onClick={() => setFullVideoMilestone(selectedMilestone)}
            className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-neutral-900 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl cursor-pointer transition-transform hover:scale-105"
          >
            <Play size={12} className="fill-neutral-900" />
            <span>Ver Recorrido Completo</span>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-sm font-primary font-bold text-white uppercase tracking-wide">
              {selectedMilestone.title}
            </h3>
            <p className="text-xs text-white/65 mt-0.5">{selectedMilestone.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/10">
            {LOCATION_MILESTONES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMilestone(m)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedMilestone.id === m.id
                    ? 'bg-brand-primary text-white border border-brand-orange/50'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {m.title.split(' ')[0]} ({m.distanceTime})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Video Completo del Hito */}
      {fullVideoMilestone && (
        <div className="fixed inset-0 z-[90] bg-black/95 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-orange font-bold">
                Ruta de Conexión · A {fullVideoMilestone.distanceTime}
              </p>
              <h3 className="text-base font-primary font-bold text-white uppercase">
                {fullVideoMilestone.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setFullVideoMilestone(null)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <X size={16} /> Cerrar Video
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <video
              src={fullVideoMilestone.fullVideo}
              poster={fullVideoMilestone.poster}
              controls
              autoPlay
              playsInline
              className="max-h-[82vh] max-w-[92vw] rounded-2xl shadow-2xl border border-white/15"
            />
          </div>
        </div>
      )}
    </div>
  );
};
