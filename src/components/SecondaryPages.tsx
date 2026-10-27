import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Compass,
  Images,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Rotate3D,
  Sparkles,
  Video,
} from 'lucide-react';
import {
  AMENITIES_ZONES,
  buildWhatsAppUrl,
  type FlamingoHouseModel,
  getAssetUrl,
  HOUSE_MODELS,
  LOCATION_MILESTONES,
  SHOWROOM_SIDES,
} from '../data/flamingoData';
import { BottomNav, FloatingMenuTrigger, FullscreenButton } from './BottomNav';
import { HouseModelDetailModal } from './HouseModal';
import { Panorama360Viewer } from './Panorama360Viewer';

export const AmenitiesPageClient: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeZoneIdx, setActiveZoneIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);

  const currentZone = AMENITIES_ZONES[activeZoneIdx];
  const currentPhoto = currentZone.images[photoIdx] || currentZone.images[0];

  return (
    <div className="relative w-full h-app overflow-hidden bg-neutral-950 select-none">
      <img
        key={currentPhoto}
        src={currentPhoto}
        alt={currentZone.title}
        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/55" />

      <div className="absolute top-5 left-5 z-50 flex items-center gap-3">
        <FloatingMenuTrigger onClick={() => setMenuOpen(true)} />
        <a
          href="/showroom?step=lots"
          className="px-4 py-2 rounded-full bg-black/55 hover:bg-brand-primary backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Volver al Showroom
        </a>
      </div>

      <div className="absolute top-5 right-5 z-50">
        <FullscreenButton />
      </div>

      {/* Controles de Carrusel */}
      <button
        type="button"
        onClick={() =>
          setPhotoIdx(
            (i) => (i - 1 + currentZone.images.length) % currentZone.images.length
          )
        }
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-brand-orange text-white flex items-center justify-center border border-white/20 cursor-pointer"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        type="button"
        onClick={() => setPhotoIdx((i) => (i + 1) % currentZone.images.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-brand-orange text-white flex items-center justify-center border border-white/20 cursor-pointer"
      >
        <ChevronRight size={24} />
      </button>

      {/* Selector Inferior de Amenidades */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-[min(92vw,760px)]">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-orange">
            Amenidades Exclusivas · Foto {photoIdx + 1} de {currentZone.images.length}
          </span>
          <h1 className="text-xl sm:text-2xl font-primary font-bold text-white uppercase">
            {currentZone.title}
          </h1>
          <p className="text-xs text-white/75">{currentZone.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-neutral-950/85 backdrop-blur-xl border border-white/15">
          {AMENITIES_ZONES.map((z, idx) => (
            <button
              key={z.id}
              type="button"
              onClick={() => {
                setActiveZoneIdx(idx);
                setPhotoIdx(0);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeZoneIdx === idx
                  ? 'bg-brand-orange text-white shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {z.title.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/amenidades" />
    </div>
  );
};

export const ToursPageClient: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModel, setActiveModel] = useState<FlamingoHouseModel>(HOUSE_MODELS[0]);
  const [open360, setOpen360] = useState(true);

  return (
    <div className="relative w-full h-app overflow-hidden bg-neutral-950">
      <div className="absolute top-5 left-5 z-50">
        <FloatingMenuTrigger onClick={() => setMenuOpen(true)} />
      </div>

      {open360 ? (
        <Panorama360Viewer
          model={activeModel}
          lotTitle="Showroom 360° Residencial Flamingo"
          onClose={() => setOpen360(false)}
        />
      ) : (
        <HouseModelDetailModal
          model={activeModel}
          onClose={() => (window.location.href = '/showroom?step=models')}
          onSelectModel={(id) =>
            setActiveModel(HOUSE_MODELS.find((m) => m.id === id) || activeModel)
          }
        />
      )}

      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/recorridos" />
    </div>
  );
};

export const VideoCinemaClient: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeClipIdx, setActiveClipIdx] = useState(0);

  const clips = [
    {
      title: 'Vuelo Inaugural · Residencial Flamingo',
      subtitle: 'Toma aérea de ingreso y pórtico principal',
      url: getAssetUrl('homepage/intro_video.mp4'),
      poster: getAssetUrl('homepage/intro.webp'),
    },
    {
      title: 'Descenso Aéreo Dron · Masterplan Día',
      subtitle: 'Transición cinemática hacia el pórtico (intro.day.mp4)',
      url: SHOWROOM_SIDES['side-0'].introVideo!,
      poster: SHOWROOM_SIDES['side-0'].dayImage,
    },
    {
      title: 'Recorrido de Acceso a Etapas',
      subtitle: 'Vuelo sobre manzanas y parques interiores',
      url: getAssetUrl('urbanization/phases/phase-1/entry.mp4'),
      poster: getAssetUrl('urbanization/phases/phase-1/overview.webp'),
    },
    ...LOCATION_MILESTONES.map((m) => ({
      title: m.title,
      subtitle: `${m.subtitle} (${m.distanceTime})`,
      url: m.fullVideo,
      poster: m.poster,
    })),
  ];

  const currentClip = clips[activeClipIdx];

  return (
    <div className="relative w-full h-app overflow-hidden bg-neutral-950 flex flex-col">
      <div className="absolute top-5 left-5 z-50 flex items-center gap-3">
        <FloatingMenuTrigger onClick={() => setMenuOpen(true)} />
        <a
          href="/showroom?step=intro"
          className="px-4 py-2 rounded-full bg-black/60 hover:bg-brand-primary backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Showroom
        </a>
      </div>

      <div className="absolute top-5 right-5 z-50">
        <FullscreenButton />
      </div>

      <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
        <video
          key={currentClip.url}
          src={currentClip.url}
          poster={currentClip.poster}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-30 bg-neutral-950/95 border-t border-white/15 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
            Videoteca Cinemática · Clip {activeClipIdx + 1} de {clips.length}
          </span>
          <h1 className="text-base font-primary font-bold text-white uppercase">
            {currentClip.title}
          </h1>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {clips.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveClipIdx(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeClipIdx === idx
                  ? 'bg-brand-orange text-white shadow'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              {idx + 1}. {c.title.split('·')[0]}
            </button>
          ))}
        </div>
      </div>

      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/video" />
    </div>
  );
};

export const ContactPageClient: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-app overflow-y-auto bg-neutral-950 text-white">
      <img
        src={SHOWROOM_SIDES['side-0'].nightImage}
        alt="Residencial Flamingo de Noche"
        className="fixed inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
      />
      <div className="fixed top-5 left-5 z-50">
        <FloatingMenuTrigger onClick={() => setMenuOpen(true)} />
      </div>
      <div className="fixed top-5 right-5 z-50">
        <FullscreenButton />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 space-y-10">
        <div className="text-center space-y-3">
          <img
            src="/logos/flamingo-logo.svg"
            alt="Inmobiliaria Flamingo"
            className="h-20 mx-auto object-contain"
          />
          <h1 className="text-3xl sm:text-5xl font-primary font-extrabold uppercase tracking-tight">
            Agenda tu Visita Guiada o Cotiza en Línea
          </h1>
          <p className="text-sm text-white/75 max-w-xl mx-auto">
            Nuestro equipo de asesores inmobiliarios te brindará el plano oficial de lotes
            disponibles, financiamiento directo y presupuesto de los 4 modelos de casa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href={buildWhatsAppUrl(
              'Hola Inmobiliaria Flamingo, deseo recibir el catálogo y lista de precios de Residencial Flamingo.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-400/40 flex flex-col items-center text-center gap-3 transition-all"
          >
            <MessageCircle size={32} className="text-emerald-400" />
            <h2 className="text-base font-primary font-bold uppercase">WhatsApp Directo</h2>
            <p className="text-xs text-white/75">Atención inmediata con planos y precios</p>
          </a>

          <a
            href="/showroom?step=lots"
            className="p-6 rounded-2xl bg-brand-primary/35 hover:bg-brand-primary/55 border border-white/20 flex flex-col items-center text-center gap-3 transition-all"
          >
            <Compass size={32} className="text-brand-orange" />
            <h2 className="text-base font-primary font-bold uppercase">Elegir Lote en Vivo</h2>
            <p className="text-xs text-white/75">133 lotes en 8 manzanas interactivas</p>
          </a>

          <a
            href="/showroom?step=models"
            className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 flex flex-col items-center text-center gap-3 transition-all"
          >
            <Rotate3D size={32} className="text-brand-light-orange" />
            <h2 className="text-base font-primary font-bold uppercase">4 Modelos de Casa</h2>
            <p className="text-xs text-white/75">Recorridos 360° de Sala, Cocina y Dormitorios</p>
          </a>
        </div>
      </div>

      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/contact" />
    </div>
  );
};
