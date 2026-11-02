import React, { useState } from 'react';
import { ArrowLeft, Compass, MessageCircle, Rotate3D } from 'lucide-react';
import {
  buildWhatsAppUrl,
  type FlamingoHouseModel,
  HOUSE_MODELS,
  SHOWROOM_SIDES,
} from '../data/flamingoData';
import { BottomNav, FloatingMenuTrigger, FullscreenButton } from './BottomNav';
import { Panorama360Viewer } from './Panorama360Viewer';

export const AmenitiesPageClient: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative h-app w-full overflow-y-auto bg-[#241b29] text-white">
      <div className="absolute left-5 top-5 z-50"><FloatingMenuTrigger onClick={() => setMenuOpen(true)} /></div>
      <div className="absolute right-5 top-5 z-50"><FullscreenButton /></div>
      <main className="mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-pink-200">Según el plano oficial</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Recreación pública</h1>
        <img src="/urbanization/flamingo-lots-plan.webp" alt="Zona central de recreación pública en el plano oficial de Flamingo" className="mt-8 max-h-[55vh] rounded-2xl border border-white/20 bg-white object-contain shadow-2xl" />
        <p className="mt-5 max-w-xl text-sm text-white/70">El plano identifica una zona de recreación pública en el área central. Las amenidades específicas y sus fechas de implementación se confirman con Inmobiliaria Flamingo.</p>
        <a href="/showroom?step=phases" className="mt-6 rounded-full bg-pink-700 px-6 py-3 text-xs font-bold uppercase tracking-wider">Volver al plano interactivo</a>
      </main>
      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/amenidades" />
    </div>
  );
};

export const ToursPageClient: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeModel: FlamingoHouseModel = HOUSE_MODELS[0];

  return (
    <div className="relative w-full h-app overflow-hidden bg-neutral-950">
      <div className="absolute top-5 left-5 z-50">
        <FloatingMenuTrigger onClick={() => setMenuOpen(true)} />
      </div>

      <Panorama360Viewer
        model={activeModel}
        lotTitle="Showroom 360° Residencial Flamingo"
        onClose={() => (window.location.href = '/showroom?step=phases')}
      />

      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/recorridos" />
    </div>
  );
};

export const VideoCinemaClient: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeClipIdx, setActiveClipIdx] = useState(0);

  const clips = [{
    title: 'Apertura aérea · Residencial Flamingo',
    subtitle: 'Clip introductorio generado en Google Flow · 8 segundos',
    url: '/urbanization/sides/side-0/intro.day.mp4',
    poster: '/urbanization/flamingo-lots-plan.webp',
  }];

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
            Escríbenos para confirmar disponibilidad, áreas, condiciones de venta y coordinar una visita a Residencial Flamingo.
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
            <p className="text-xs text-white/75">Solicita información directamente al equipo comercial</p>
          </a>

          <a
            href="/showroom?step=lots"
            className="p-6 rounded-2xl bg-brand-primary/35 hover:bg-brand-primary/55 border border-white/20 flex flex-col items-center text-center gap-3 transition-all"
          >
            <Compass size={32} className="text-brand-orange" />
            <h2 className="text-base font-primary font-bold uppercase">Elegir Lote en Vivo</h2>
            <p className="text-xs text-white/75">Plano oficial de lotización A–H</p>
          </a>

          <a
            href="/showroom?step=models"
            className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 flex flex-col items-center text-center gap-3 transition-all"
          >
            <Rotate3D size={32} className="text-brand-light-orange" />
            <h2 className="text-base font-primary font-bold uppercase">Recorrido conceptual 360°</h2>
            <p className="text-xs text-white/75">Ambientes visuales de referencia generados con IA</p>
          </a>
        </div>
      </div>

      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/contact" />
    </div>
  );
};
