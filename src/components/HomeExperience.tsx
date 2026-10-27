import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown,
  ArrowRight,
  Box,
  Compass,
  Layers,
  LayoutGrid,
  MapPin,
  Moon,
  Play,
  Rotate3D,
  Sliders,
  Sparkles,
  Sun,
  Video,
} from 'lucide-react';
import {
  AMENITIES_ZONES,
  buildWhatsAppUrl,
  type FlamingoHouseModel,
  getAssetUrl,
  HOME_SLIDES,
  HOUSE_MODELS,
  INITIAL_LOTS,
  LOCATION_MILESTONES,
  SHOWROOM_SIDES,
} from '../data/flamingoData';
import { BottomNav, FloatingMenuTrigger, FullscreenButton } from './BottomNav';
import { HouseModelDetailModal } from './HouseModal';

export const HomeExperience: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [enteringShowroom, setEnteringShowroom] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [selectedModel, setSelectedModel] = useState<FlamingoHouseModel | null>(null);
  const [dayNightScrollSplit, setDayNightScrollSplit] = useState(50);

  const logoRef = useRef<HTMLDivElement | null>(null);
  const slideCardRef = useRef<HTMLDivElement | null>(null);
  const transitionVideoRef = useRef<HTMLVideoElement | null>(null);
  const scrollSectionsRef = useRef<HTMLDivElement | null>(null);
  const dayNightSectionRef = useRef<HTMLDivElement | null>(null);

  const introVideoUrl = getAssetUrl('homepage/intro_video.mp4');
  const introPosterUrl = getAssetUrl('homepage/intro.webp');
  const walkToShowroomVideo = getAssetUrl('videos/walks/trans_intro_to_0.mp4');

  // 1. GSAP Timeline para la portada cinemática (idéntico al módulo 52683 de home_page.js)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { y: 30, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
        );
      }
    });

    const interval = window.setInterval(() => {
      if (slideCardRef.current) {
        gsap.to(slideCardRef.current, {
          y: -16,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            setActiveSlideIdx((prev) => (prev + 1) % HOME_SLIDES.length);
            if (slideCardRef.current) {
              gsap.fromTo(
                slideCardRef.current,
                { y: 18, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }
              );
            }
          },
        });
      } else {
        setActiveSlideIdx((prev) => (prev + 1) % HOME_SLIDES.length);
      }
    }, 4800);

    return () => {
      ctx.revert();
      window.clearInterval(interval);
    };
  }, []);

  // 2. GSAP ScrollTrigger para las secciones scrollytelling debajo del hero
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      if (dayNightSectionRef.current) {
        ScrollTrigger.create({
          trigger: dayNightSectionRef.current,
          start: 'top 65%',
          end: 'bottom 35%',
          scrub: true,
          onUpdate: (self) => {
            setDayNightScrollSplit(Math.round(15 + self.progress * 70));
          },
        });
      }
    }, scrollSectionsRef);

    return () => ctx.revert();
  }, []);

  const handleEnterShowroom = () => {
    setEnteringShowroom(true);
    if (transitionVideoRef.current) {
      transitionVideoRef.current.currentTime = 0;
      transitionVideoRef.current.play().catch(() => {
        window.location.href = '/showroom?step=intro';
      });
    } else {
      window.location.href = '/showroom?step=intro';
    }
  };

  const currentSlide = HOME_SLIDES[activeSlideIdx];
  const availableCount = INITIAL_LOTS.filter((l) => l.status === 'available').length;

  return (
    <div ref={scrollSectionsRef} className="relative w-full min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      {/* Controles Flotantes Fijos */}
      <div className="fixed top-5 left-5 z-50">
        <FloatingMenuTrigger onClick={() => setMenuOpen(true)} />
      </div>
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5">
        <a
          href="/showroom?step=intro"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-primary font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-105"
        >
          <Compass size={15} />
          <span>Showroom 360°</span>
        </a>
        <FullscreenButton />
      </div>

      {/* =======================================================================
          SECCIÓN 1: HERO CINEMÁTICO FULLSCREEN CON VIDEO + SECUENCIA GSAP + VIDEO PUENTE
         ======================================================================= */}
      <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between py-12 px-6 select-none">
        {/* Video de Fondo Inmersivo (`homepage/intro_video.mp4`) */}
        <video
          src={introVideoUrl}
          poster={introPosterUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        />

        {/* Video de Transición Cinemática al pulsar ENTRAR (`videos/walks/trans_intro_to_0.mp4`) */}
        <video
          ref={transitionVideoRef}
          src={walkToShowroomVideo}
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            window.location.href = '/showroom?step=intro';
          }}
          onError={() => {
            window.location.href = '/showroom?step=intro';
          }}
          className={`fixed inset-0 w-full h-full object-cover z-[80] transition-opacity duration-300 ${
            enteringShowroom ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-neutral-950" />

        {/* Emblema Superior Animado con GSAP */}
        <div ref={logoRef} className="relative z-20 pt-4 flex flex-col items-center">
          <img
            src="/logos/flamingo-logo.svg"
            alt="Inmobiliaria Flamingo · Proyecto Residencial Flamingo"
            className="w-[270px] sm:w-[390px] lg:w-[460px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* Tarjeta Central Glassmorphism con Secuencia GSAP de 5 Diapositivas */}
        <div className="relative z-20 w-full max-w-2xl my-auto">
          <div
            ref={slideCardRef}
            className="rounded-3xl bg-neutral-950/60 backdrop-blur-xl border border-white/20 p-6 sm:p-9 text-center shadow-2xl space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/50 text-brand-light-orange text-[10px] font-primary font-bold uppercase tracking-[0.22em]">
              <Sparkles size={12} />
              <span>{currentSlide.tag}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-primary font-extrabold uppercase tracking-tight text-white leading-[1.12]">
              {currentSlide.title}
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed font-secondary">
              {currentSlide.description}
            </p>

            {/* Indicadores de Diapositiva */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {HOME_SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlideIdx(i)}
                  aria-label={`Diapositiva ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSlideIdx === i ? 'w-8 bg-brand-orange' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botones de Acción Inferiores + Indicador de Scroll */}
        <div className="relative z-20 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={handleEnterShowroom}
              className="group relative px-9 py-4 rounded-full bg-brand-orange hover:bg-brand-dark-orange text-white font-primary text-xs sm:text-sm font-extrabold uppercase tracking-[0.24em] shadow-[0_0_35px_rgba(214,145,53,0.5)] transition-all duration-300 hover:scale-105 flex items-center gap-3 cursor-pointer"
            >
              <Play size={16} className="fill-white" />
              <span>ENTRAR AL SHOWROOM 360°</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <a
              href="/showroom?step=lots"
              className="px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-primary text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-105"
            >
              Mapa de Lotes ({availableCount} Disponibles)
            </a>
          </div>

          <a
            href="#masterplan-scroll"
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/60 hover:text-white transition-colors pt-1"
          >
            <span>Desliza para explorar con animaciones de scroll</span>
            <ArrowDown size={14} className="animate-bounce text-brand-orange" />
          </a>
        </div>
      </section>

      {/* =======================================================================
          SECCIÓN 2: SCROLLYTELLING — RECORRIDO AÉREO DE DRON & MÉTRICAS DEL PROYECTO
         ======================================================================= */}
      <section
        id="masterplan-scroll"
        className="relative py-24 px-6 lg:px-14 max-w-7xl mx-auto space-y-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center gsap-reveal">
          <div className="lg:col-span-5 space-y-5">
            <span className="inline-block px-3.5 py-1 rounded-full bg-brand-primary/40 border border-brand-orange/40 text-brand-light-orange text-[11px] font-primary font-bold uppercase tracking-[0.22em]">
              Urbanismo & Computer Vision
            </span>
            <h2 className="text-3xl sm:text-4xl font-primary font-extrabold uppercase tracking-tight leading-tight">
              Masterplan Aéreo Interactivo en Tiempo Real
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Navega sobre la toma aérea en bucle de{' '}
              <strong className="text-white">Residencial Flamingo</strong>. Cada lote ha sido
              vectorizado milimétricamente para que consultes metraje, ubicación en esquina o
              intermedio, precio actualizado y compatibilidad constructiva con un solo clic.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-2xl sm:text-3xl font-primary font-extrabold text-brand-orange tabular-nums">
                  133
                </span>
                <p className="text-xs text-white/65 mt-1">
                  Lotes independizados en 8 manzanas (Mz K a Mz R)
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-2xl sm:text-3xl font-primary font-extrabold text-emerald-400 tabular-nums">
                  4 Modelos
                </span>
                <p className="text-xs text-white/65 mt-1">
                  Viviendas listas para construir con Tour Virtual 360°
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/showroom?step=lots"
                className="px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-primary font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all"
              >
                <LayoutGrid size={16} />
                <span>Abrir Visor de Lotes</span>
              </a>
              <a
                href="/showroom?calibrator=true"
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-primary font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
              >
                <Sliders size={15} />
                <span>Calibrador OpenCV</span>
              </a>
            </div>
          </div>

          {/* Vista Previa de Video Aéreo Loop con Overlay Vectorial */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl aspect-video bg-black group">
            <video
              src={SHOWROOM_SIDES['side-0'].loopVideo}
              poster={SHOWROOM_SIDES['side-0'].dayImage}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-light-orange">
                  Toma Aérea de Dron 40° · Cámara Estática en Loop
                </span>
                <h3 className="text-base font-primary font-bold text-white uppercase">
                  Pórtico de Ingreso & Alamedas Residencial Flamingo
                </h3>
              </div>
              <a
                href="/showroom?step=intro"
                className="px-4 py-2 rounded-full bg-white text-neutral-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xl hover:scale-105 transition-transform"
              >
                <span>Pantalla Completa</span>
                <ArrowRight size={14} className="text-brand-orange" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          SECCIÓN 3: SCROLL SCRUB — COMPARADOR DÍA / NOCHE SINCRONIZADO CON EL SCROLL
         ======================================================================= */}
      <section
        ref={dayNightSectionRef}
        className="relative py-20 px-6 lg:px-14 max-w-7xl mx-auto space-y-8 gsap-reveal"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-primary uppercase tracking-[0.22em] text-brand-orange font-bold">
              Iluminación Arquitectónica LED · Scroll Scrubbing
            </span>
            <h2 className="text-3xl sm:text-4xl font-primary font-extrabold uppercase tracking-tight mt-1">
              De Día y de Noche Sin Perder Detalle
            </h2>
          </div>
          <p className="text-xs text-white/60 max-w-md">
            Al hacer scroll (o arrastrar el control), la escena se transforma manteniendo el 100%
            de la geometría de calles, lotes y postes LED.
          </p>
        </div>

        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl select-none">
          <img
            src={SHOWROOM_SIDES['side-0'].nightImage}
            alt="Masterplan Noche"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            src={SHOWROOM_SIDES['side-0'].dayImage}
            alt="Masterplan Día"
            style={{ clipPath: `inset(0 ${100 - dayNightScrollSplit}% 0 0)` }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div
            style={{ left: `${dayNightScrollSplit}%` }}
            className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white shadow-[0_0_15px_rgba(0,0,0,0.9)] pointer-events-none"
          />

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-6 py-3 rounded-full bg-neutral-950/85 backdrop-blur-xl border border-white/20 shadow-2xl w-[min(90%,460px)]">
            <Sun size={16} className="text-amber-400 shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={dayNightScrollSplit}
              onChange={(e) => setDayNightScrollSplit(Number(e.target.value))}
              aria-label="Comparador Día y Noche"
              className="w-full accent-brand-orange cursor-pointer"
            />
            <Moon size={16} className="text-sky-300 shrink-0" />
          </div>
        </div>
      </section>

      {/* =======================================================================
          SECCIÓN 4: LOS 4 DISEÑOS DE CASA + TOUR VIRTUAL 360° INTERACTIVO
         ======================================================================= */}
      <section className="relative py-20 px-6 lg:px-14 max-w-7xl mx-auto space-y-10 gsap-reveal">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-primary uppercase tracking-[0.22em] text-brand-orange font-bold">
              Catálogo Residencial + Visor Equirectangular 360°
            </span>
            <h2 className="text-3xl sm:text-4xl font-primary font-extrabold uppercase tracking-tight mt-1">
              4 Modelos de Casa Compatibles con tu Lote
            </h2>
          </div>
          <a
            href="/showroom?step=models"
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-brand-orange text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <Box size={15} />
            <span>Ver en el Showroom</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOUSE_MODELS.map((model) => (
            <div
              key={model.id}
              className="group rounded-2xl overflow-hidden bg-neutral-900/80 border border-white/10 hover:border-brand-orange/60 flex flex-col justify-between transition-all shadow-xl"
            >
              <div>
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={model.exteriors.frontal}
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider">
                    {model.badge}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light-orange">
                    {model.builtAreaSqm} m² Techados · {model.bedrooms} Dorm.
                  </p>
                  <h3 className="text-xl font-primary font-bold text-white">{model.name}</h3>
                  <p className="text-xs text-white/65 line-clamp-3 leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedModel(model)}
                  className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-orange text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Rotate3D size={15} />
                  <span>Planos & Tour 360°</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =======================================================================
          SECCIÓN 5: AMENIDADES & UBICACIÓN CON VIDEOS DE HITOS
         ======================================================================= */}
      <section className="relative py-20 px-6 lg:px-14 max-w-7xl mx-auto space-y-12 gsap-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {AMENITIES_ZONES.map((am) => (
            <a
              key={am.id}
              href="/amenidades"
              className="group relative h-72 rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
            >
              <img
                src={am.images[0]}
                alt={am.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
                  Amenidades Exclusivas
                </span>
                <h3 className="text-lg font-primary font-bold text-white mt-0.5">{am.title}</h3>
                <p className="text-xs text-white/70 mt-1">{am.subtitle}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Banner Final de Ingreso al Showroom */}
        <div className="rounded-3xl bg-gradient-to-r from-ocean-900 via-ocean-800 to-neutral-900 border border-white/15 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <span className="text-xs font-primary uppercase tracking-[0.22em] text-brand-light-orange font-bold">
              Experiencia Inmersiva Completa
            </span>
            <h2 className="text-2xl sm:text-3xl font-primary font-extrabold uppercase">
              ¿Listo para elegir tu lote en Residencial Flamingo?
            </h2>
            <p className="text-xs sm:text-sm text-white/75">
              Ingresa al Showroom Virtual 360°, filtra por manzana o metraje y solicita tu
              cotización personalizada por WhatsApp en segundos.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/showroom?step=intro"
              className="px-8 py-4 rounded-full bg-brand-orange hover:bg-brand-dark-orange text-white font-primary text-xs font-extrabold uppercase tracking-[0.2em] shadow-xl transition-transform hover:scale-105"
            >
              Abrir Showroom 360°
            </a>
            <a
              href="/ubicacion"
              className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-primary text-xs font-bold uppercase tracking-[0.18em]"
            >
              Ver Mapa Satelital 3D
            </a>
          </div>
        </div>
      </section>

      {selectedModel && (
        <HouseModelDetailModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
          onSelectModel={(id) =>
            setSelectedModel(HOUSE_MODELS.find((m) => m.id === id) || selectedModel)
          }
        />
      )}

      <BottomNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} activePath="/" />
    </div>
  );
};
