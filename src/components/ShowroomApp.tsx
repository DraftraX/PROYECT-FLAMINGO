import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Box,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Eye,
  Layers,
  LayoutGrid,
  ListFilter,
  Lock,
  Map as MapIcon,
  MapPin,
  Moon,
  MoveHorizontal,
  Rotate3D,
  RotateCcw,
  Sliders,
  Sun,
  SunMoon,
  X,
} from 'lucide-react';
import {
  BLOCKS_DATA,
  type FlamingoHouseModel,
  type FlamingoLot,
  getAssetUrl,
  HOUSE_MODELS,
  INITIAL_LOTS,
  type LotPosition,
  type LotStatus,
  MASTERPLAN_IMAGE,
  type PhaseConfig,
  PHASES_DATA,
  POSITION_LABELS,
  SHOWROOM_SIDES,
  STATUS_LABELS,
  type ViewpointItem,
  VIEWPOINTS_DATA,
  type ZoneConfig,
} from '../data/flamingoData';
import { BottomNav, FloatingMenuTrigger, FullscreenButton } from './BottomNav';
import { CalibratorOverlay } from './CalibratorOverlay';
import { HouseModelDetailModal, LotInspectorOverlay } from './HouseModal';
import { LocationMap } from './LocationMap';

export type ShowroomStep =
  | 'intro'
  | 'sides'
  | 'phases'
  | 'zones'
  | 'lots'
  | 'models'
  | 'location';

/**
 * Contenedor de relación de aspecto bloqueada (16:9) calcado del Showroom original (`k` component)
 * para garantizar alineación sub-píxel entre `<img/video>` y `<svg viewBox="0 0 100 100">`.
 */
const ShowroomStage: React.FC<{
  src: string;
  alt: string;
  ratio?: number;
  containerStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ src, alt, ratio = 16 / 9, containerStyle, children }) => {
  const [aspect, setAspect] = useState(ratio);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-neutral-950"
      style={{ containerType: 'size', ...containerStyle }}
    >
      <div
        data-showroom-stage=""
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `max(100cqw, calc(100cqh * ${aspect}))`,
          height: `max(100cqh, calc(100cqw / ${aspect}))`,
        }}
      >
        <img
          key={src}
          src={src}
          alt={alt}
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth > 0 && naturalHeight > 0) {
              setAspect(naturalWidth / naturalHeight);
            }
          }}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in select-none pointer-events-none"
        />
        {children}
      </div>
    </div>
  );
};

/**
 * Cono de Mirador Fotográfico (`C` component del Showroom original)
 */
const toRad = (deg: number) => (deg * Math.PI) / 180;
const CONE_M = (180 * Math.asin(0.5555555555555556)) / Math.PI;
const CONE_I = (2 * CONE_M - 48) / 3;
const CONE_D = (54 * Math.cos(toRad(CONE_I / 2)) - 40) / Math.cos(toRad(CONE_M));
const CONE_SIZE = 2 * Math.ceil(58);
const CONE_RAYS = [-(18 + 1.5 * CONE_I), -(6 + 0.5 * CONE_I), 6 + 0.5 * CONE_I, 18 + 1.5 * CONE_I].map(
  (angle) => {
    const pt = (a: number, r: number) => {
      const rad = toRad(a - 90);
      return `${(Math.cos(rad) * r).toFixed(2)} ${(Math.sin(rad) * r).toFixed(2)}`;
    };
    const a1 = angle - 6;
    const a2 = angle + 6;
    return `M ${pt(a1, CONE_D)} L ${pt(a1, 54)} L ${pt(a2, 54)} L ${pt(a2, CONE_D)} Z`;
  }
);

const ViewpointCone: React.FC<{
  x: number;
  y: number;
  heading: number;
  order: number;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ x, y, heading, order, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    style={{ left: `${x}%`, top: `${y}%`, width: CONE_SIZE, height: CONE_SIZE }}
    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none group focus:outline-none"
  >
    <svg
      viewBox={`${-CONE_SIZE / 2} ${-CONE_SIZE / 2} ${CONE_SIZE} ${CONE_SIZE}`}
      className={`absolute inset-0 w-full h-full transition-transform duration-300 ${
        isActive ? 'scale-110' : 'group-hover:scale-110'
      }`}
    >
      <g transform={`rotate(${heading})`}>
        {CONE_RAYS.map((d, i) => (
          <path
            key={i}
            d={d}
            className={`pointer-events-auto cursor-pointer transition-colors duration-300 ${
              isActive
                ? 'fill-brand-orange'
                : 'fill-white/85 group-hover:fill-brand-light-orange'
            }`}
            stroke="rgba(0,0,0,0.45)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        ))}
      </g>
      <circle
        cx="0"
        cy="0"
        r={10}
        className={`pointer-events-auto cursor-pointer transition-colors duration-300 ${
          isActive
            ? 'fill-brand-orange'
            : 'fill-brand-primary group-hover:fill-brand-orange'
        }`}
        stroke="white"
        strokeWidth="1.6"
      />
    </svg>
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white pointer-events-none">
      <Camera size={11} strokeWidth={2.5} className="drop-shadow" />
    </span>
    <span
      style={{ left: 'calc(50% + 10px)', top: 'calc(50% + 10px)' }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white text-[9px] font-bold flex items-center justify-center pointer-events-auto cursor-pointer transition-colors duration-300 ${
        isActive ? 'bg-white text-brand-primary' : 'bg-brand-primary text-white'
      }`}
    >
      {order}
    </span>
  </button>
);

/**
 * Comparador Interactivo Día / Noche (`ea` component del Showroom original)
 */
const DayNightComparator: React.FC<{
  point: ViewpointItem;
  onClose: () => void;
}> = ({ point, onClose }) => {
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    if (width > 0) {
      setSplit(Math.min(100, Math.max(0, ((clientX - left) / width) * 100)));
    }
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-neutral-950/95 backdrop-blur-sm animate-fade-in">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar comparación Día/Noche"
        className="absolute top-5 right-[4.5rem] z-20 w-9 h-9 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white/85 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>

      <div
        ref={containerRef}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging) updateFromClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          setDragging(false);
        }}
        className={`relative flex-1 min-h-0 overflow-hidden select-none touch-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <img
          src={point.imageNight}
          alt={`${point.label} de noche`}
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <img
          src={point.imageDay}
          alt={`${point.label} de día`}
          draggable={false}
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        <span
          className={`absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.18em] font-bold pointer-events-none transition-opacity ${
            split > 12 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Sun size={12} className="text-amber-400" /> Día
        </span>

        <span
          className={`absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.18em] font-bold pointer-events-none transition-opacity ${
            split < 88 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Moon size={12} className="text-sky-300" /> Noche
        </span>

        <div
          style={{ left: `${split}%` }}
          className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white/90 shadow-[0_0_14px_rgba(0,0,0,0.9)] pointer-events-none"
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-2xl">
            <MoveHorizontal size={18} strokeWidth={2.5} />
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-baseline justify-center gap-2 px-5 py-3 text-center">
        <p className="text-white font-primary text-[11px] uppercase tracking-[0.2em] font-bold truncate">
          {point.caption}
        </p>
        <span className="text-white/25">·</span>
        <p className="text-[10px] text-white/45 truncate">
          Arrastra la barra central para comparar la iluminación de día y de noche.
        </p>
      </div>
    </div>
  );
};

export const ShowroomApp: React.FC = () => {
  const [step, setStep] = useState<ShowroomStep>('intro');
  const [menuOpen, setMenuOpen] = useState(false);
  const [calibratorOpen, setCalibratorOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');

  // Estado de Cara 0 (intro.day.mp4 -> loop.day.mp4)
  const [introVideoDone, setIntroVideoDone] = useState(false);
  const loopVideoRef = useRef<HTMLVideoElement | null>(null);

  // Estado de giro 360° (side-1..4)
  const [activeSideId, setActiveSideId] = useState<'side-1' | 'side-2' | 'side-3' | 'side-4'>(
    'side-1'
  );

  // Estado de Fase y Zona activa
  const [activePhase, setActivePhase] = useState<PhaseConfig>(PHASES_DATA[0]);
  const [activeZoneId, setActiveZoneId] = useState<'zone-1' | 'zone-2' | 'zone-3'>('zone-1');
  const [hoveredPhaseId, setHoveredPhaseId] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Estado de Lotes, Filtros, Miradores y Casas
  const [lots, setLots] = useState<FlamingoLot[]>(INITIAL_LOTS);
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [pinnedLotId, setPinnedLotId] = useState<string | null>(null);
  const [inspectingLot, setInspectingLot] = useState<FlamingoLot | null>(null);
  const [inspectingHouseModel, setInspectingHouseModel] =
    useState<FlamingoHouseModel | null>(null);

  // Estado del Sidebar Derecho en Zone View (Vistas vs Filtros)
  const [sidebarTab, setSidebarTab] = useState<'views' | 'filters'>('filters');
  const [activeViewpointId, setActiveViewpointId] = useState<string | null>(null);
  const [comparingViewpoint, setComparingViewpoint] = useState<ViewpointItem | null>(null);
  const [filter, setFilter] = useState<{
    blockIds: string[];
    areas: number[];
    positions: LotPosition[];
    statuses: LotStatus[];
  }>({
    blockIds: [],
    areas: [],
    positions: [],
    statuses: [],
  });

  // Video global de transición entre pasos (`to` component en showroom1.js)
  const [bridgeVideo, setBridgeVideo] = useState<{
    url: string;
    onFinish: () => void;
  } | null>(null);

  // Sincronizar URL query params (`?step=intro|sides|phases|zones|lots|models|location` & `?calibrator=true`)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLots = localStorage.getItem('flamingo_calibrated_lots');
    if (savedLots) {
      try {
        setLots(JSON.parse(savedLots));
      } catch {}
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('calibrator') === 'true') {
      setCalibratorOpen(true);
    }
    const rawStep = params.get('step');
    if (
      rawStep === 'intro' ||
      rawStep === 'sides' ||
      rawStep === 'phases' ||
      rawStep === 'zones' ||
      rawStep === 'lots' ||
      rawStep === 'models' ||
      rawStep === 'location'
    ) {
      setStep(rawStep);
    } else if (rawStep === 'masterplan') {
      setStep('phases');
    }
  }, []);

  const navigateStep = useCallback((nextStep: ShowroomStep, transitionUrl?: string) => {
    const commit = () => {
      setStep(nextStep);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('step', nextStep);
        window.history.replaceState({}, '', url.toString());
      }
    };
    if (transitionUrl) {
      setBridgeVideo({ url: transitionUrl, onFinish: commit });
    } else {
      commit();
    }
  }, []);

  useEffect(() => {
    if (introVideoDone && loopVideoRef.current) {
      loopVideoRef.current.play().catch(() => {});
    }
  }, [introVideoDone]);

  // Zona actual y lotes filtrados
  const currentZone: ZoneConfig = useMemo(
    () =>
      activePhase.zones.find((z) => z.id === activeZoneId) ||
      PHASES_DATA[0].zones[0],
    [activePhase, activeZoneId]
  );

  const zoneBlocks = useMemo(
    () => BLOCKS_DATA.filter((b) => b.zoneId === activeZoneId),
    [activeZoneId]
  );

  const zoneLots = useMemo(
    () =>
      lots.filter((l) =>
        activeZoneId === 'zone-3' ? l.zoneId === 'zone-1' : l.zoneId === activeZoneId
      ),
    [lots, activeZoneId]
  );

  const areaOptions = useMemo(() => {
    const set = new Set<number>();
    zoneLots.forEach((l) => set.add(l.areaSqm));
    return Array.from(set).sort((a, b) => a - b);
  }, [zoneLots]);

  const hasActiveFilter =
    filter.blockIds.length > 0 ||
    filter.areas.length > 0 ||
    filter.positions.length > 0 ||
    filter.statuses.length > 0;

  const matchingLots = useMemo(
    () =>
      zoneLots.filter((lot) => {
        if (filter.blockIds.length > 0 && !filter.blockIds.includes(lot.blockId))
          return false;
        if (filter.areas.length > 0 && !filter.areas.includes(lot.areaSqm))
          return false;
        if (filter.positions.length > 0 && !filter.positions.includes(lot.position))
          return false;
        if (filter.statuses.length > 0 && !filter.statuses.includes(lot.status))
          return false;
        return true;
      }),
    [zoneLots, filter]
  );

  const matchingLotIds = useMemo(
    () => new Set(matchingLots.map((l) => l.id)),
    [matchingLots]
  );

  const zoneViewpoints = useMemo(
    () => VIEWPOINTS_DATA.filter((vp) => vp.zoneId === activeZoneId),
    [activeZoneId]
  );

  const activeLotId = pinnedLotId ?? hoveredLotId;
  const activeLot = useMemo(
    () => zoneLots.find((l) => l.id === activeLotId) || null,
    [zoneLots, activeLotId]
  );

  // Rotación entre caras (side-1..4)
  const rotateSide = (dir: 'left' | 'right') => {
    const order: ('side-1' | 'side-2' | 'side-3' | 'side-4')[] = [
      'side-1',
      'side-2',
      'side-3',
      'side-4',
    ];
    const idx = order.indexOf(activeSideId);
    const nextIdx =
      dir === 'left'
        ? (idx - 1 + order.length) % order.length
        : (idx + 1) % order.length;
    const nextSide = order[nextIdx];
    const vid = SHOWROOM_SIDES[activeSideId].transitions[dir];
    setBridgeVideo({
      url: vid,
      onFinish: () => setActiveSideId(nextSide),
    });
  };

  const side0 = SHOWROOM_SIDES['side-0'];
  const currentSide = SHOWROOM_SIDES[activeSideId];

  return (
    <div className="relative w-full h-app overflow-hidden bg-neutral-950 select-none">
      {/* Controles Superiores Flotantes: Menú Izquierdo, Barra de Pasos Central y Pantalla Completa Derecha */}
      <div className="absolute top-5 left-5 z-50 flex items-center gap-3">
        <FloatingMenuTrigger onClick={() => setMenuOpen(true)} />
      </div>

      {/* Barra Superior de Acceso Rápido a todas las Etapas del Showroom */}
      <div className="hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 z-40 items-center gap-1 p-1.5 rounded-full bg-neutral-950/80 backdrop-blur-xl border border-white/15 shadow-2xl">
        {(
          [
            { id: 'intro', label: '1. Pórtico', icon: Compass },
            { id: 'sides', label: '2. Giro 360°', icon: Rotate3D },
            { id: 'phases', label: '3. Masterplan', icon: Layers },
            { id: 'zones', label: '4. Zonas', icon: MapIcon },
            { id: 'lots', label: '5. Lotes & Día/Noche', icon: LayoutGrid },
            { id: 'models', label: '6. 4 Casas & 360°', icon: Box },
            { id: 'location', label: '7. Mapa 3D', icon: MapPin },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = step === item.id && !calibratorOpen;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCalibratorOpen(false);
                navigateStep(item.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-primary font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? 'bg-brand-orange text-white shadow-lg scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={13} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-white/15 mx-1" />

        {/* Conmutador Día / Noche Global */}
        <button
          type="button"
          onClick={() => setTimeOfDay((t) => (t === 'day' ? 'night' : 'day'))}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            timeOfDay === 'night'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white/10 text-amber-300 hover:bg-white/20'
          }`}
          title="Alternar iluminación Día / Noche"
        >
          {timeOfDay === 'day' ? <Sun size={13} /> : <Moon size={13} />}
          <span>{timeOfDay === 'day' ? 'Día' : 'Noche'}</span>
        </button>

        {/* Botón Modo Calibrador */}
        <button
          type="button"
          onClick={() => setCalibratorOpen(true)}
          className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-brand-primary text-white/75 hover:text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          title="Abrir Editor de Calibración en Vivo (?calibrator=true)"
        >
          <Sliders size={12} />
          <span>Calibrar</span>
        </button>
      </div>

      <div className="absolute top-5 right-5 z-50">
        <FullscreenButton />
      </div>

      {/* =====================================================================
          STEP 1: INTRO (`?step=intro` — `intro.day.mp4` -> `loop.day.mp4`)
         ===================================================================== */}
      {step === 'intro' && (
        <div className="relative w-full h-full overflow-hidden bg-neutral-950">
          {/* Imagen base de respaldo (Día o Noche) */}
          <img
            src={timeOfDay === 'day' ? side0.dayImage : side0.nightImage}
            alt="Portada Proyecto Residencial Flamingo"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Video Intro Descenso de Dron (solo en modo día antes de finalizar) */}
          {timeOfDay === 'day' && side0.introVideo && (
            <video
              src={side0.introVideo}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={() => setIntroVideoDone(true)}
              onError={() => setIntroVideoDone(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                introVideoDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            />
          )}

          {/* Video Loop Estático con Palmeras y Autos en Movimiento (0ms crossfade sobre el mismo frame) */}
          {timeOfDay === 'day' && side0.loopVideo && (
            <video
              ref={loopVideoRef}
              src={side0.loopVideo}
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                introVideoDone ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-black/15 to-black/65" />

          {/* Bloque de Identidad y Botón INGRESAR (idéntico a `e5` en showroom1.js) */}
          <div className="absolute right-[6%] sm:right-[10%] lg:right-[12%] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-6 lg:gap-7 max-w-xs sm:max-w-md lg:max-w-xl animate-fade-in">
            <img
              src="/logos/flamingo-logo.svg"
              alt="Inmobiliaria Flamingo · Proyecto Residencial Flamingo"
              className="w-72 sm:w-[420px] lg:w-[490px] object-contain drop-shadow-2xl"
            />

            <p className="text-center text-white/85 text-xs sm:text-sm max-w-md leading-relaxed font-secondary">
              Explora en tiempo real las etapas, los{' '}
              <strong className="text-brand-light-orange">133 lotes urbanizados</strong>, el
              comparador solar Día/Noche y nuestros{' '}
              <strong className="text-brand-light-orange">4 modelos de residencia</strong> con
              recorrido 360°.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button
                type="button"
                onClick={() => navigateStep('sides', side0.transitions.right)}
                className="group flex items-center justify-center gap-4 w-full sm:w-auto min-w-[240px] px-8 py-4 bg-black/55 hover:bg-brand-primary backdrop-blur-md border border-brand-orange/60 text-brand-orange hover:text-white text-xs sm:text-sm font-primary uppercase tracking-[0.25em] font-bold transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl rounded-xl"
              >
                <ArrowLeft
                  size={18}
                  className="text-brand-orange group-hover:text-white transition-transform duration-300 group-hover:-translate-x-1.5"
                />
                <span>INGRESAR</span>
              </button>

              <button
                type="button"
                onClick={() => navigateStep('lots', PHASES_DATA[0].zones[0].entryVideo)}
                className="px-6 py-4 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-primary uppercase tracking-[0.2em] font-bold shadow-2xl transition-all hover:scale-105 cursor-pointer"
              >
                Ver Lotes Disponibles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: SIDES (`?step=sides` — Giro 360° `side-1..4` con videos puente)
         ===================================================================== */}
      {step === 'sides' && (
        <div className="relative w-full h-full overflow-hidden bg-neutral-950">
          <img
            key={`${currentSide.id}-${timeOfDay}`}
            src={timeOfDay === 'day' ? currentSide.dayImage : currentSide.nightImage}
            alt={currentSide.label}
            onError={(e) => {
              e.currentTarget.src = currentSide.dayImage;
            }}
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          />

          <button
            type="button"
            onClick={() => rotateSide('left')}
            aria-label="Girar hacia la izquierda"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:bg-brand-orange hover:scale-110 cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={() => rotateSide('right')}
            aria-label="Girar hacia la derecha"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:bg-brand-orange hover:scale-110 cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>

          <button
            type="button"
            onClick={() => navigateStep('intro')}
            className="absolute top-5 right-[4.5rem] z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.18em] font-semibold hover:bg-black/75 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} /> Portada
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
            <div className="px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-center flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <p className="text-white font-primary text-xs uppercase tracking-[0.22em] font-bold">
                {currentSide.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigateStep('phases', currentSide.enterMasterplanVideo)
              }
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-brand-primary hover:bg-brand-orange border border-white/30 text-white text-xs uppercase tracking-[0.18em] font-bold shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <span>Ingresar al Masterplan</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: PHASES (`?step=phases` — Masterplan de Etapas 1 a 4)
         ===================================================================== */}
      {step === 'phases' && (
        <>
          <ShowroomStage src={MASTERPLAN_IMAGE} alt="Masterplan Etapas Residencial Flamingo">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full z-10"
            >
              {PHASES_DATA.map((phase) => {
                const isAvailable = phase.status === 'available';
                const isHovered = hoveredPhaseId === phase.id;
                return (
                  <path
                    key={phase.id}
                    d={phase.hotspot.path}
                    onClick={() => {
                      if (isAvailable) {
                        setActivePhase(phase);
                        navigateStep('zones', phase.entryVideo);
                      }
                    }}
                    onMouseEnter={() => setHoveredPhaseId(phase.id)}
                    onMouseLeave={() =>
                      setHoveredPhaseId((prev) => (prev === phase.id ? null : prev))
                    }
                    className={`transition-colors duration-300 ${
                      isAvailable
                        ? isHovered
                          ? 'fill-brand-primary/40 stroke-white [stroke-width:0.12] cursor-pointer'
                          : 'fill-brand-orange/15 stroke-white/40 hover:fill-brand-primary/40 hover:stroke-white [stroke-width:0.1] cursor-pointer'
                        : 'fill-black/30 stroke-white/20 [stroke-width:0.06] cursor-not-allowed'
                    }`}
                  />
                );
              })}
            </svg>

            {PHASES_DATA.map((phase) => {
              const isAvailable = phase.status === 'available';
              const isHovered = hoveredPhaseId === phase.id;
              return (
                <button
                  key={phase.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => {
                    if (isAvailable) {
                      setActivePhase(phase);
                      navigateStep('zones', phase.entryVideo);
                    }
                  }}
                  onMouseEnter={() => setHoveredPhaseId(phase.id)}
                  onMouseLeave={() =>
                    setHoveredPhaseId((prev) => (prev === phase.id ? null : prev))
                  }
                  style={{ left: `${phase.hotspot.x}%`, top: `${phase.hotspot.y}%` }}
                  className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 group ${
                    isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border text-[10px] lg:text-xs uppercase tracking-[0.18em] font-bold transition-all duration-300 ${
                      !isAvailable
                        ? 'bg-black/60 border-white/15 text-white/60'
                        : isHovered
                        ? 'bg-brand-orange border-white text-white shadow-2xl scale-110'
                        : 'bg-brand-primary/90 border-white/30 text-white shadow-2xl group-hover:scale-110'
                    }`}
                  >
                    {!isAvailable ? <Lock size={12} /> : <Layers size={13} />}
                    <span>{phase.label}</span>
                  </span>
                  <span className="mt-1.5 block text-[9px] uppercase tracking-[0.2em] font-semibold text-white/85 drop-shadow">
                    {isAvailable ? 'Click para ingresar' : phase.comingSoonNote}
                  </span>
                </button>
              );
            })}
          </ShowroomStage>

          <button
            type="button"
            onClick={() => navigateStep('sides')}
            className="absolute top-5 right-[4.5rem] z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.18em] font-semibold hover:bg-black/75 transition-colors cursor-pointer"
          >
            <Compass size={13} /> Vistas 360°
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-center">
            <p className="text-white/90 font-secondary text-[11px] uppercase tracking-[0.2em]">
              Selecciona la <strong>Etapa 1 · Flamingo Oasis</strong> para explorar las zonas y lotes
            </p>
          </div>
        </>
      )}

      {/* =====================================================================
          STEP 4: ZONES (`?step=zones` — Zonas 1, 2 y 3 de la Etapa 1)
         ===================================================================== */}
      {step === 'zones' && (
        <>
          <ShowroomStage src={activePhase.image} alt={activePhase.label}>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full z-10"
            >
              {activePhase.zones.map((zone) => {
                const isHovered = hoveredZoneId === zone.id;
                const paths =
                  zone.hotspot.paths && zone.hotspot.paths.length > 0
                    ? zone.hotspot.paths
                    : [zone.hotspot.path];
                return (
                  <g
                    key={zone.id}
                    onClick={() => {
                      setActiveZoneId(zone.id);
                      navigateStep('lots', zone.entryVideo);
                    }}
                    onMouseEnter={() => setHoveredZoneId(zone.id)}
                    onMouseLeave={() =>
                      setHoveredZoneId((prev) => (prev === zone.id ? null : prev))
                    }
                    className="cursor-pointer"
                  >
                    <path d={zone.hotspot.path} className="fill-transparent stroke-transparent" />
                    {paths.map((p, idx) => (
                      <path
                        key={idx}
                        d={p}
                        className={`transition-colors duration-300 pointer-events-none ${
                          isHovered
                            ? 'fill-brand-orange/40 stroke-white [stroke-width:0.1]'
                            : 'fill-brand-primary/20 stroke-white/35 [stroke-width:0.08]'
                        }`}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>

            {activePhase.zones.map((zone) => {
              const isHovered = hoveredZoneId === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    setActiveZoneId(zone.id);
                    navigateStep('lots', zone.entryVideo);
                  }}
                  onMouseEnter={() => setHoveredZoneId(zone.id)}
                  onMouseLeave={() =>
                    setHoveredZoneId((prev) => (prev === zone.id ? null : prev))
                  }
                  style={{ left: `${zone.hotspot.x}%`, top: `${zone.hotspot.y}%` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <span
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border text-[10px] lg:text-xs uppercase tracking-[0.18em] font-bold transition-all duration-300 ${
                      isHovered
                        ? 'bg-brand-orange border-white text-white shadow-2xl scale-110'
                        : 'bg-brand-primary/90 border-white/30 text-white shadow-2xl group-hover:scale-110'
                    }`}
                  >
                    <MapIcon size={13} />
                    <span>{zone.label}</span>
                  </span>
                  <span className="mt-1.5 block text-[9px] uppercase tracking-[0.2em] font-semibold text-white/90 drop-shadow">
                    {zone.subtitle}
                  </span>
                </button>
              );
            })}
          </ShowroomStage>

          <button
            type="button"
            onClick={() => navigateStep('phases')}
            className="absolute top-5 right-[4.5rem] z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.18em] font-semibold hover:bg-black/75 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} /> Etapas
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-6 py-2.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-center">
            <p className="text-white font-primary text-xs uppercase tracking-[0.2em] font-bold">
              {activePhase.label} · Selecciona una zona para inspeccionar lotes y miradores
            </p>
          </div>
        </>
      )}

      {/* =====================================================================
          STEP 5: LOTS (`?step=lots` — Overlay Vectorial de Lotes + Miradores Día/Noche + Filtros)
         ===================================================================== */}
      {step === 'lots' && (
        <>
          <ShowroomStage
            src={currentZone.image}
            alt={currentZone.label}
            containerStyle={{ right: 'clamp(300px, 28%, 420px)' }}
          >
            {/* Overlay Vectorial Milimétrico de Manzanas y Lotes */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full z-10"
            >
              {/* Contornos de Manzanas */}
              {zoneBlocks.map((blk) => (
                <path
                  key={blk.id}
                  d={blk.hotspot.path}
                  className="pointer-events-none fill-transparent stroke-white/30 [stroke-width:0.08]"
                />
              ))}

              {/* Polígonos Interactivos de Lotes coloreados por Estado (Verde, Ámbar, Rojo) */}
              {zoneLots.map((lot) => {
                const isActive = activeLotId === lot.id;
                const isFilteredMatch = hasActiveFilter && matchingLotIds.has(lot.id);
                const statusFill =
                  lot.status === 'available'
                    ? 'fill-emerald-400/30 hover:fill-emerald-400/60 stroke-emerald-200/80'
                    : lot.status === 'reserved'
                    ? 'fill-amber-400/35 hover:fill-amber-400/65 stroke-amber-200/80'
                    : 'fill-rose-500/35 hover:fill-rose-500/65 stroke-rose-200/80';

                return (
                  <path
                    key={lot.id}
                    d={lot.path}
                    onClick={() => {
                      setPinnedLotId(lot.id);
                      setInspectingLot(lot);
                    }}
                    onMouseEnter={() => setHoveredLotId(lot.id)}
                    onMouseLeave={() =>
                      setHoveredLotId((prev) => (prev === lot.id ? null : prev))
                    }
                    className={`cursor-pointer transition-colors duration-200 [stroke-width:0.08] ${
                      isActive
                        ? 'fill-brand-orange/65 stroke-white [stroke-width:0.14]'
                        : isFilteredMatch
                        ? 'fill-brand-orange/55 stroke-white [stroke-width:0.1]'
                        : hasActiveFilter && !isFilteredMatch
                        ? 'fill-black/50 stroke-white/15 [stroke-width:0.05]'
                        : statusFill
                    }`}
                  />
                );
              })}
            </svg>

            {/* Etiquetas de Manzana */}
            {zoneBlocks.map((blk) => (
              <span
                key={blk.id}
                style={{ left: `${blk.hotspot.x}%`, top: `${blk.hotspot.y}%` }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-white/85 text-[9px] lg:text-[10px] uppercase tracking-[0.18em] font-bold whitespace-nowrap"
              >
                Manzana {blk.letter}
              </span>
            ))}

            {/* Conos de Cámara para abrir el Comparador Día/Noche */}
            {zoneViewpoints.map((vp) => {
              const dx = vp.target.x - vp.anchor.x;
              const dy = (vp.target.y - vp.anchor.y) / (16 / 9);
              const heading = (180 * Math.atan2(dy, dx)) / Math.PI + 90;
              return (
                <ViewpointCone
                  key={vp.id}
                  x={vp.anchor.x}
                  y={vp.anchor.y}
                  heading={heading}
                  order={vp.order}
                  label={vp.label}
                  isActive={activeViewpointId === vp.id}
                  onClick={() => {
                    setActiveViewpointId(vp.id);
                    setSidebarTab('views');
                    setComparingViewpoint(vp);
                  }}
                />
              );
            })}

            {/* Tooltip Flotante Minimalista al Pasar el Cursor sobre Cualquier Lote */}
            {activeLot && (
              <div
                style={{ left: `${activeLot.x}%`, top: `${activeLot.y}%` }}
                className="absolute z-30 -translate-x-1/2 -translate-y-[125%] pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => setInspectingLot(activeLot)}
                  className="cursor-pointer flex flex-col gap-1 px-3.5 py-2 rounded-xl bg-neutral-950/90 hover:bg-brand-primary text-white shadow-2xl border border-white/25 transition-transform hover:scale-105 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        activeLot.status === 'available'
                          ? 'bg-emerald-400'
                          : activeLot.status === 'reserved'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="text-xs font-primary font-bold tracking-wider uppercase">
                      Mz {activeLot.blockLetter} · {activeLot.identifier}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/80 tabular-nums">
                    <span>{activeLot.areaSqm} m²</span>
                    <span>·</span>
                    <span className="text-brand-light-orange font-bold">
                      USD ${activeLot.priceUsd.toLocaleString()}
                    </span>
                    <span>·</span>
                    <span className="underline">Ver 4 Casas</span>
                  </div>
                </button>
              </div>
            )}
          </ShowroomStage>

          {/* Controles Flotantes sobre el Lienzo Izquierdo (Cambio de Zona con Videos de Transición) */}
          <div
            style={{ right: 'clamp(300px, 28%, 420px)' }}
            className="absolute inset-y-0 left-0 z-20 pointer-events-none"
          >
            {/* Selector de Zonas 1, 2 y 3 con transición de video */}
            <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-neutral-950/85 backdrop-blur-xl border border-white/15 shadow-2xl">
              {activePhase.zones.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    if (z.id === activeZoneId) return;
                    const transVid = currentZone.transitions[z.id];
                    if (transVid) {
                      setBridgeVideo({
                        url: transVid,
                        onFinish: () => setActiveZoneId(z.id),
                      });
                    } else {
                      setActiveZoneId(z.id);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-primary font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeZoneId === z.id
                      ? 'bg-brand-orange text-white shadow'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {z.label.split('·')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Comparador Interactivo Día / Noche */}
          {comparingViewpoint && (
            <div
              style={{ right: 'clamp(300px, 28%, 420px)' }}
              className="absolute inset-y-0 left-0 z-30"
            >
              <DayNightComparator
                point={comparingViewpoint}
                onClose={() => setComparingViewpoint(null)}
              />
            </div>
          )}

          {/* Vista de Detalle del Lote + Selector de los 4 Modelos de Casa */}
          {inspectingLot && (
            <LotInspectorOverlay
              lot={inspectingLot}
              onClose={() => {
                setInspectingLot(null);
                setPinnedLotId(null);
              }}
            />
          )}

          {/* Sidebar Derecho de Filtros de Lotes y Vistas Día/Noche (`X` component en showroom1.js) */}
          <aside
            style={{ width: 'clamp(300px, 28%, 420px)' }}
            className="absolute right-0 top-0 z-30 h-full flex flex-col bg-neutral-950/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl"
          >
            <header className="shrink-0 px-5 pt-16 pb-3 border-b border-white/10">
              <p className="text-[9px] uppercase tracking-[0.22em] text-brand-orange font-bold">
                {currentZone.label}
              </p>
              <h3 className="text-white font-primary text-sm uppercase tracking-[0.14em] font-bold mt-0.5">
                {sidebarTab === 'filters'
                  ? 'Inventario & Filtros de Lotes'
                  : 'Miradores Día / Noche'}
              </h3>
            </header>

            <div className="shrink-0 grid grid-cols-2 gap-1 m-3.5 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setSidebarTab('filters')}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  sidebarTab === 'filters'
                    ? 'bg-brand-primary text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <ListFilter size={13} />
                <span>Lotes ({matchingLots.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('views')}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  sidebarTab === 'views'
                    ? 'bg-brand-primary text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Camera size={13} />
                <span>Día / Noche ({zoneViewpoints.length})</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 scrollbar-thin">
              {sidebarTab === 'views' ? (
                <div className="space-y-2.5">
                  {zoneViewpoints.map((vp) => {
                    const active =
                      comparingViewpoint?.id === vp.id || activeViewpointId === vp.id;
                    return (
                      <button
                        key={vp.id}
                        type="button"
                        onClick={() => {
                          setActiveViewpointId(vp.id);
                          setComparingViewpoint(vp);
                        }}
                        className={`relative h-28 w-full rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-brand-orange ring-2 ring-brand-orange/45 shadow-lg'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={vp.imageDay}
                          alt={vp.label}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-bold">
                          <Camera size={11} /> {vp.label}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/20 text-white text-[9px] uppercase tracking-wider font-bold">
                          <SunMoon size={11} className="text-amber-300" /> Comparar Día / Noche
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filtro por Manzana */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold mb-2">
                      Manzana
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {zoneBlocks.map((b) => {
                        const active = filter.blockIds.includes(b.id);
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() =>
                              setFilter((prev) => ({
                                ...prev,
                                blockIds: active
                                  ? prev.blockIds.filter((id) => id !== b.id)
                                  : [...prev.blockIds, b.id],
                              }))
                            }
                            className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'bg-brand-orange border-brand-orange text-white'
                                : 'bg-white/5 border-white/15 text-white/75 hover:bg-white/10'
                            }`}
                          >
                            Mz {b.letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtro por Disponibilidad */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold mb-2">
                      Disponibilidad
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(['available', 'reserved', 'sold'] as LotStatus[]).map((st) => {
                        const active = filter.statuses.includes(st);
                        const dotColor =
                          st === 'available'
                            ? 'bg-emerald-400'
                            : st === 'reserved'
                            ? 'bg-amber-400'
                            : 'bg-rose-400';
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() =>
                              setFilter((prev) => ({
                                ...prev,
                                statuses: active
                                  ? prev.statuses.filter((s) => s !== st)
                                  : [...prev.statuses, st],
                              }))
                            }
                            className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              active
                                ? 'bg-brand-orange border-brand-orange text-white'
                                : 'bg-white/5 border-white/15 text-white/75 hover:bg-white/10'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            <span>{STATUS_LABELS[st]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtro por Posición */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold mb-2">
                      Ubicación del Lote
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(['corner', 'middle'] as LotPosition[]).map((pos) => {
                        const active = filter.positions.includes(pos);
                        return (
                          <button
                            key={pos}
                            type="button"
                            onClick={() =>
                              setFilter((prev) => ({
                                ...prev,
                                positions: active
                                  ? prev.positions.filter((p) => p !== pos)
                                  : [...prev.positions, pos],
                              }))
                            }
                            className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? 'bg-brand-orange border-brand-orange text-white'
                                : 'bg-white/5 border-white/15 text-white/75 hover:bg-white/10'
                            }`}
                          >
                            {POSITION_LABELS[pos]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cabecera de Resultados y Limpiar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <p className="text-xs text-white/65">
                      <strong className="text-brand-orange font-bold">
                        {matchingLots.length}
                      </strong>{' '}
                      de {zoneLots.length} lotes en zona
                    </p>
                    {hasActiveFilter && (
                      <button
                        type="button"
                        onClick={() =>
                          setFilter({ blockIds: [], areas: [], positions: [], statuses: [] })
                        }
                        className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/70 hover:text-white cursor-pointer"
                      >
                        <RotateCcw size={11} /> Limpiar
                      </button>
                    )}
                  </div>

                  {/* Lista Interactiva de Lotes */}
                  <div className="space-y-1.5 pt-1">
                    {matchingLots.map((lot) => {
                      const dotColor =
                        lot.status === 'available'
                          ? 'bg-emerald-400'
                          : lot.status === 'reserved'
                          ? 'bg-amber-400'
                          : 'bg-rose-400';
                      return (
                        <button
                          key={lot.id}
                          type="button"
                          onMouseEnter={() => setHoveredLotId(lot.id)}
                          onMouseLeave={() => setHoveredLotId(null)}
                          onClick={() => setInspectingLot(lot)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-brand-primary/50 border border-white/10 text-left transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs font-semibold text-white">
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            <span>
                              Mz {lot.blockLetter} · {lot.identifier}
                            </span>
                          </span>
                          <span className="text-[11px] text-white/65 tabular-nums">
                            {lot.areaSqm} m² ·{' '}
                            <strong className="text-brand-light-orange">
                              ${lot.priceUsd.toLocaleString()}
                            </strong>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* =====================================================================
          STEP 6: MODELS (`?step=models` — Catálogo Interactivo de las 4 Casas + 360°)
         ===================================================================== */}
      {step === 'models' && (
        <div className="relative w-full h-full overflow-y-auto bg-neutral-950 pt-24 pb-16 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-primary uppercase tracking-[0.25em] text-brand-orange font-bold">
                  Residencial Flamingo · Arquitectura & Recorridos 360°
                </p>
                <h1 className="text-3xl sm:text-4xl font-primary font-extrabold text-white uppercase tracking-tight mt-1">
                  Los 4 Modelos de Casa
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigateStep('lots')}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-brand-orange text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LayoutGrid size={15} />
                <span>Elegir sobre el Plano de Lotes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HOUSE_MODELS.map((model) => (
                <div
                  key={model.id}
                  className="group rounded-2xl overflow-hidden bg-neutral-900/90 border border-white/15 hover:border-brand-orange/60 transition-all shadow-2xl flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={model.exteriors.frontal}
                      alt={model.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest">
                      {model.badge}
                    </span>
                    <span className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold tabular-nums">
                      Desde USD ${model.priceFromUsd.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-light-orange">
                        {model.code}
                      </p>
                      <h2 className="text-2xl font-primary font-bold text-white mt-0.5">
                        {model.name}
                      </h2>
                      <p className="text-xs text-white/65 mt-2 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs">
                        <div>
                          <span className="block font-bold text-white tabular-nums">
                            {model.builtAreaSqm} m²
                          </span>
                          <span className="text-[10px] text-white/45">Techados</span>
                        </div>
                        <div>
                          <span className="block font-bold text-white tabular-nums">
                            {model.bedrooms} Dorm.
                          </span>
                          <span className="text-[10px] text-white/45">Con closets</span>
                        </div>
                        <div>
                          <span className="block font-bold text-white tabular-nums">
                            {model.floorsCount} {model.floorsCount > 1 ? 'Pisos' : 'Piso'}
                          </span>
                          <span className="text-[10px] text-white/45">Nivel</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectingHouseModel(model)}
                        className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-orange text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                      >
                        <Rotate3D size={16} />
                        <span>Explorar 3 Vistas, Planos & Tour 360°</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {inspectingHouseModel && (
            <HouseModelDetailModal
              model={inspectingHouseModel}
              onClose={() => setInspectingHouseModel(null)}
              onSelectModel={(id) =>
                setInspectingHouseModel(
                  HOUSE_MODELS.find((m) => m.id === id) || inspectingHouseModel
                )
              }
            />
          )}
        </div>
      )}

      {/* =====================================================================
          STEP 7: LOCATION (`?step=location` — Mapa Satelital 3D & Hitos en Video)
         ===================================================================== */}
      {step === 'location' && (
        <LocationMap onBackToShowroom={() => navigateStep('lots')} />
      )}

      {/* =====================================================================
          CAPA GLOBAL DE VIDEO DE TRANSICIÓN ENTRE PASOS (`bridgeVideo`)
         ===================================================================== */}
      {bridgeVideo && (
        <video
          key={bridgeVideo.url}
          src={bridgeVideo.url}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            bridgeVideo.onFinish();
            setBridgeVideo(null);
          }}
          onError={() => {
            bridgeVideo.onFinish();
            setBridgeVideo(null);
          }}
          className="fixed inset-0 w-full h-full object-cover z-[65] bg-neutral-950 animate-fade-in"
        />
      )}

      {/* =====================================================================
          MODO CALIBRADOR EN VIVO (`?calibrator=true`)
         ===================================================================== */}
      {calibratorOpen && (
        <CalibratorOverlay
          lots={lots}
          onUpdateLots={(updated) => setLots(updated)}
          onClose={() => setCalibratorOpen(false)}
        />
      )}

      {/* Menú Arquitectónico Inferior Desplegable */}
      <BottomNav
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activePath={`/showroom?step=${step}`}
      />
    </div>
  );
};
