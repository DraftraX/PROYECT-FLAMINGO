import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Images,
  Layers,
  Mail,
  MessageCircle,
  Rotate3D,
  Ruler,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  type FlamingoHouseModel,
  type FlamingoLot,
  getAssetUrl,
  HOUSE_MODELS,
  PLAN_VIEW_LABELS,
  type PlanViewMode,
  POSITION_LABELS,
  STATUS_LABELS,
} from '../data/flamingoData';
import { Panorama360Viewer } from './Panorama360Viewer';

interface ProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectLabel: string;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({
  isOpen,
  onClose,
  subjectLabel,
}) => {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    email: '',
    medio: 'Whatsapp',
    terms: true,
  });
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white text-neutral-900 rounded-2xl shadow-2xl w-full max-w-[560px] overflow-hidden animate-scale-in">
        <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-orange">
              Inmobiliaria Flamingo · Atención Preferencial
            </p>
            <h2 className="text-xl font-primary font-bold text-neutral-900 uppercase tracking-wide mt-0.5">
              Solicitar Cotización Oficial
            </h2>
            <p className="text-xs text-brand-primary font-semibold mt-1">
              Interés en: {subjectLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
            <h3 className="text-lg font-bold text-neutral-900">
              ¡Solicitud registrada con éxito!
            </h3>
            <p className="text-sm text-neutral-600">
              Un asesor inmobiliario de Residencial Flamingo se comunicará contigo de inmediato.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="Nombres *"
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                className="w-full px-0 py-2 border-b border-gray-200 focus:border-brand-primary text-sm focus:outline-none"
              />
              <input
                required
                placeholder="Apellidos *"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className="w-full px-0 py-2 border-b border-gray-200 focus:border-brand-primary text-sm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="DNI / RUC *"
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
                className="w-full px-0 py-2 border-b border-gray-200 focus:border-brand-primary text-sm focus:outline-none"
              />
              <input
                required
                type="tel"
                placeholder="Celular / WhatsApp *"
                value={form.celular}
                onChange={(e) => setForm({ ...form, celular: e.target.value })}
                className="w-full px-0 py-2 border-b border-gray-200 focus:border-brand-primary text-sm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                type="email"
                placeholder="Correo electrónico *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-0 py-2 border-b border-gray-200 focus:border-brand-primary text-sm focus:outline-none"
              />
              <select
                value={form.medio}
                onChange={(e) => setForm({ ...form, medio: e.target.value })}
                className="w-full px-0 py-2 border-b border-gray-200 focus:border-brand-primary text-sm focus:outline-none bg-transparent"
              >
                <option value="Whatsapp">Contacto vía WhatsApp</option>
                <option value="Llamada">Llamada Telefónica</option>
                <option value="Videollamada">Zoom / Meet</option>
              </select>
            </div>
            <label className="flex items-center gap-2.5 text-xs text-gray-500 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                className="w-4 h-4 accent-brand-primary"
              />
              <span>
                Acepto las Políticas de Privacidad y Términos de Inmobiliaria Flamingo.
              </span>
            </label>
            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer"
              >
                Confirmar Solicitud
              </button>
              <a
                href={buildWhatsAppUrl(
                  `Hola Inmobiliaria Flamingo, deseo cotizar ${subjectLabel}. Mi nombre es ${
                    form.nombres || 'Cliente'
                  }.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface HouseModelDetailModalProps {
  model: FlamingoHouseModel;
  lot?: FlamingoLot | null;
  onClose: () => void;
  onSelectModel?: (modelId: FlamingoHouseModel['id']) => void;
}

export const HouseModelDetailModal: React.FC<HouseModelDetailModalProps> = ({
  model,
  lot,
  onClose,
  onSelectModel,
}) => {
  const [inspectMode, setInspectMode] = useState<'plans' | 'exterior'>('plans');
  const [exteriorAngle, setExteriorAngle] = useState<'frontal' | 'diagonal' | 'posterior'>('frontal');
  const [levelNum, setLevelNum] = useState<number>(1);
  const [planView, setPlanView] = useState<PlanViewMode>('furnished');
  const [transitionVideo, setTransitionVideo] = useState<{
    url: string;
    to: PlanViewMode;
  } | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTour360, setShowTour360] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showProspect, setShowProspect] = useState(false);

  const currentLevel = useMemo(
    () => model.levels.find((l) => l.level === levelNum) || model.levels[0],
    [model, levelNum]
  );

  useEffect(() => {
    setLevelNum(1);
    setTransitionVideo(null);
  }, [model.id]);

  const triggerPlanTransition = useCallback(
    (targetView: PlanViewMode) => {
      if (targetView === planView || transitionVideo) return;
      const vid = currentLevel.transitions[planView]?.[targetView];
      if (vid) {
        setTransitionVideo({ url: vid, to: targetView });
      } else {
        setPlanView(targetView);
      }
    },
    [currentLevel, planView, transitionVideo]
  );

  const otherPlanViews = useMemo(
    () =>
      (['measured', 'furnished', 'bare'] as PlanViewMode[]).filter(
        (v) => v !== planView
      ),
    [planView]
  );

  const whatsappText = lot
    ? `Hola Inmobiliaria Flamingo, quiero cotizar el ${lot.fullTitle} (${lot.areaSqm} m² - USD $${lot.priceUsd.toLocaleString()}) con el ${model.name} (${model.builtAreaSqm} m² construidos).`
    : `Hola Inmobiliaria Flamingo, quiero cotizar el ${model.name} (${model.builtAreaSqm} m² construidos - desde USD $${model.priceFromUsd.toLocaleString()}).`;

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-50 text-neutral-800 animate-fade-in">
      <ProspectModal
        isOpen={showProspect}
        onClose={() => setShowProspect(false)}
        subjectLabel={`${model.name}${lot ? ` · ${lot.fullTitle}` : ''}`}
      />

      {showTour360 && (
        <Panorama360Viewer
          model={model}
          lotTitle={lot?.fullTitle}
          onClose={() => setShowTour360(false)}
        />
      )}

      {/* Lightbox de Galería */}
      {showGallery && (
        <div className="fixed inset-0 z-[85] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="text-xs font-primary uppercase tracking-[0.2em] text-white font-bold">
              {model.name} · Foto {galleryIdx + 1} de {model.gallery.length}
            </span>
            <button
              type="button"
              onClick={() => setShowGallery(false)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer"
            >
              <X size={16} /> Cerrar Galería
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center p-6">
            <button
              type="button"
              onClick={() =>
                setGalleryIdx((i) => (i - 1 + model.gallery.length) % model.gallery.length)
              }
              className="absolute left-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-brand-orange text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <img
              src={model.gallery[galleryIdx]}
              alt={`${model.name} ${galleryIdx + 1}`}
              className="max-h-[82vh] max-w-[88vw] object-contain rounded-xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setGalleryIdx((i) => (i + 1) % model.gallery.length)}
              className="absolute right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-brand-orange text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Izquierdo de Especificaciones Arquitectónicas (Estilo Olimpo) */}
      {showSidebar && (
        <aside className="relative z-20 flex w-full xl:w-[clamp(340px,31%,440px)] shrink-0 flex-col bg-white shadow-2xl border-r border-gray-100">
          <header className="px-6 pt-14 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 -ml-2 rounded-full text-neutral-800 hover:bg-gray-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
                <span>{lot ? 'Volver al Lote' : 'Volver al Showroom'}</span>
              </button>

              {/* Selector rápido de los 4 modelos de casa */}
              {onSelectModel && (
                <div className="flex items-center gap-1">
                  {HOUSE_MODELS.map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onSelectModel(m.id)}
                      className={`w-7 h-7 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        m.id === model.id
                          ? 'bg-brand-primary text-white shadow'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={m.name}
                    >
                      C{idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-start pt-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
                  {model.code}
                </span>
                <h2 className="text-2xl font-primary font-bold tracking-tight text-neutral-900">
                  {model.name}
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {model.tagline}
                </p>
                {lot && (
                  <p className="text-xs font-bold text-brand-primary mt-1">
                    Sobre {lot.fullTitle} ({lot.areaSqm} m²)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-200">
                  {model.badge}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  title="Ver plano a pantalla completa"
                  className="hidden xl:flex p-2 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">
            {/* Banner con vista exterior */}
            <div
              className="relative overflow-hidden rounded-xl bg-neutral-900 py-10 px-4 text-center shadow-inner"
              style={{
                backgroundImage: `url(${model.exteriors.frontal})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/50" />
              <p className="relative z-10 font-serif italic text-base text-white drop-shadow-md">
                {model.description}
              </p>
              <div className="relative z-10 mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/90 text-white text-xs font-bold tabular-nums">
                Módulo desde USD ${model.priceFromUsd.toLocaleString()}
              </div>
            </div>

            {/* Indicadores Clave */}
            <div>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                Programa Arquitectónico
              </h3>
              <ul className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3.5 border border-gray-100">
                <li className="flex flex-col items-center text-center gap-1">
                  <Ruler size={20} className="text-brand-orange" />
                  <span className="text-xs font-bold text-neutral-800 tabular-nums">
                    {model.builtAreaSqm} m²
                  </span>
                  <span className="text-[10px] text-neutral-400">Techados</span>
                </li>
                <li className="flex flex-col items-center text-center gap-1">
                  <Bed size={20} className="text-brand-orange" />
                  <span className="text-xs font-bold text-neutral-800 tabular-nums">
                    {model.bedrooms} Dorm.
                  </span>
                  <span className="text-[10px] text-neutral-400">Con closets</span>
                </li>
                <li className="flex flex-col items-center text-center gap-1">
                  <Bath size={20} className="text-brand-orange" />
                  <span className="text-xs font-bold text-neutral-800 tabular-nums">
                    {model.bathrooms} Baños
                  </span>
                  <span className="text-[10px] text-neutral-400">Completos</span>
                </li>
              </ul>
            </div>

            {/* Características de la vivienda */}
            <div>
              <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                Acabados & Distribución
              </h3>
              <ul className="space-y-2">
                {model.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón para ver el visor en móvil/tablet */}
            <div className="xl:hidden pt-2">
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="w-full py-3 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Ver Planos Interactivos y Exteriores
              </button>
            </div>
          </div>

          {/* Footer de Cotización Directa a WhatsApp + Formulario */}
          <div className="border-t border-gray-100 bg-white p-4 space-y-2.5">
            <a
              href={buildWhatsAppUrl(whatsappText)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle size={17} />
              <span>
                Cotizar {lot ? `${lot.identifier} + ${model.name}` : model.name} por WhatsApp
              </span>
            </a>
            <button
              type="button"
              onClick={() => setShowProspect(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mail size={15} />
              <span>Solicitar Ficha Técnica PDF</span>
            </button>
          </div>
        </aside>
      )}

      {/* Escenario Principal Derecho: Planos Interactivos con Transiciones de Video + Vistas Exteriores IA */}
      <div
        className={`relative min-w-0 flex-1 overflow-hidden bg-white ${
          showSidebar ? 'hidden xl:block' : 'block'
        }`}
      >
        {!showSidebar && (
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="absolute left-6 top-6 z-30 flex items-center gap-2 rounded-full bg-neutral-900/80 px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xl cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Ficha de {model.name}</span>
          </button>
        )}

        {/* Conmutador Superior: Planos por Nivel vs 3 Vistas Exteriores IA + Galería + Tour 360° */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-full bg-neutral-900/85 backdrop-blur-md border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={() => setInspectMode('plans')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              inspectMode === 'plans'
                ? 'bg-brand-orange text-white shadow'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Planos Interactivos
          </button>
          <button
            type="button"
            onClick={() => setInspectMode('exterior')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              inspectMode === 'exterior'
                ? 'bg-brand-orange text-white shadow'
                : 'text-white/75 hover:text-white'
            }`}
          >
            3 Vistas Exteriores IA
          </button>
        </div>

        {/* Botones Superiores Derechos: Galería y Tour 360° */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowGallery(true)}
            className="px-4 py-2.5 rounded-full bg-brand-primary/90 hover:bg-brand-primary text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Images size={16} />
            <span>Galería ({model.gallery.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTour360(true)}
            className="px-4 py-2.5 rounded-full bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Rotate3D size={16} />
            <span>Tour 360°</span>
          </button>
        </div>

        {/* Vista de Planos Interactivos con Videos de Transición (Amoblado / Medidas / Sin Amoblar) */}
        {inspectMode === 'plans' ? (
          <div className="absolute inset-0 p-6 md:p-12 flex items-center justify-center bg-white">
            <img
              key={currentLevel.plans[planView]}
              src={currentLevel.plans[planView]}
              alt={`${model.name} · ${currentLevel.label} · ${PLAN_VIEW_LABELS[planView]}`}
              className="w-full h-full object-contain"
            />

            {/* Video de Transición entre estados del plano (Amoblado <-> Medidas <-> Sin Amoblar) */}
            {transitionVideo && (
              <video
                key={transitionVideo.url}
                src={transitionVideo.url}
                autoPlay
                playsInline
                muted
                onEnded={() => {
                  setPlanView(transitionVideo.to);
                  setTransitionVideo(null);
                }}
                onError={() => {
                  setPlanView(transitionVideo.to);
                  setTransitionVideo(null);
                }}
                className="absolute inset-0 w-full h-full object-contain z-20 bg-white"
              />
            )}

            {/* Botones Laterales Izquierdo y Derecho para transicionar entre Amoblado, Medidas y Sin Amoblar */}
            {!transitionVideo && (
              <>
                {otherPlanViews[0] && (
                  <button
                    type="button"
                    onClick={() => triggerPlanTransition(otherPlanViews[0])}
                    className="group absolute left-6 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2.5 rounded-full bg-neutral-900/75 hover:bg-neutral-900 p-3 pr-5 text-white backdrop-blur transition-all shadow-xl cursor-pointer"
                  >
                    <ChevronLeft
                      size={24}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {PLAN_VIEW_LABELS[otherPlanViews[0]]}
                    </span>
                  </button>
                )}
                {otherPlanViews[1] && (
                  <button
                    type="button"
                    onClick={() => triggerPlanTransition(otherPlanViews[1])}
                    className="group absolute right-6 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2.5 rounded-full bg-neutral-900/75 hover:bg-neutral-900 p-3 pl-5 text-white backdrop-blur transition-all shadow-xl cursor-pointer"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {PLAN_VIEW_LABELS[otherPlanViews[1]]}
                    </span>
                    <ChevronRight
                      size={24}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                )}
              </>
            )}

            {/* Conmutador Inferior de Piso 1 / Piso 2 y Estado de Vista */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-neutral-900/85 backdrop-blur-md border border-white/15 shadow-2xl">
              {model.levels.map((lvl) => (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => {
                    setLevelNum(lvl.level);
                    setTransitionVideo(null);
                  }}
                  className={`px-5 py-2 rounded-full text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    levelNum === lvl.level
                      ? 'bg-brand-primary text-white shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
              <div className="h-4 w-px bg-white/20 mx-1" />
              {(['furnished', 'measured', 'bare'] as PlanViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => triggerPlanTransition(mode)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase font-semibold tracking-wider transition-all cursor-pointer ${
                    planView === mode
                      ? 'bg-brand-orange text-white'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  {PLAN_VIEW_LABELS[mode]}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Vista de los 3 Ángulos Exteriores Generados (Frontal, Diagonal 3/4, Posterior) */
          <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
            <img
              key={exteriorAngle}
              src={model.exteriors[exteriorAngle]}
              alt={`${model.name} vista ${exteriorAngle}`}
              className="w-full h-full object-cover animate-fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-2 rounded-full bg-neutral-950/85 backdrop-blur-xl border border-white/15 shadow-2xl">
              {(
                [
                  { id: 'frontal', label: 'Vista Frontal' },
                  { id: 'diagonal', label: 'Diagonal 3/4' },
                  { id: 'posterior', label: 'Vista Posterior & Jardín' },
                ] as const
              ).map((ang) => (
                <button
                  key={ang.id}
                  type="button"
                  onClick={() => setExteriorAngle(ang.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    exteriorAngle === ang.id
                      ? 'bg-brand-orange text-white shadow-lg'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {ang.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface LotInspectorOverlayProps {
  lot: FlamingoLot;
  onClose: () => void;
}

export const LotInspectorOverlay: React.FC<LotInspectorOverlayProps> = ({
  lot,
  onClose,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<FlamingoHouseModel['id'] | null>(
    null
  );
  const [openFullModalId, setOpenFullModalId] = useState<FlamingoHouseModel['id'] | null>(
    null
  );

  const activeModel = useMemo(
    () => HOUSE_MODELS.find((m) => m.id === selectedModelId) || null,
    [selectedModelId]
  );

  const modalModel = useMemo(
    () => HOUSE_MODELS.find((m) => m.id === openFullModalId) || null,
    [openFullModalId]
  );

  // Resolver imagen del lote en el CDN (ej. urbanization/lots/mz-k/1-medidas.webp)
  const lotFileNum =
    lot.blockId === 'mz-o' ? Math.max(1, lot.lotNumber - 7) : lot.lotNumber;
  const lotPlanImage = getAssetUrl(
    `urbanization/lots/${lot.blockId}/${lotFileNum}${activeModel ? '' : '-medidas'}.webp`
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !openFullModalId) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, openFullModalId]);

  const whatsappUrl = buildWhatsAppUrl(
    `Hola Inmobiliaria Flamingo, me interesa el ${lot.fullTitle} (${lot.areaSqm} m² - USD $${lot.priceUsd.toLocaleString()})${
      activeModel ? ` combinado con el ${activeModel.name}` : ''
    }.`
  );

  return (
    <div className="absolute inset-0 z-40 bg-neutral-950 animate-fade-in overflow-hidden">
      {/* Imagen de fondo del lote acotado */}
      <img
        src={lotPlanImage}
        alt={lot.fullTitle}
        onError={(e) => {
          e.currentTarget.src = getAssetUrl('urbanization/phases/phase-1/zone-1.webp');
        }}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
      />

      {/* Superposición del módulo de casa elegido sobre el terreno */}
      {activeModel && (
        <img
          src={activeModel.lotOverlayImage}
          alt={activeModel.name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none animate-fade-in"
        />
      )}

      {/* Panel Flotante Izquierdo: Ficha Técnica del Lote */}
      <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-[clamp(270px,24%,380px)] flex flex-col rounded-2xl bg-neutral-950/88 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden">
        <header className="px-5 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-brand-orange font-bold">
              Manzana {lot.blockLetter} · Residencial Flamingo
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                lot.status === 'available'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : lot.status === 'reserved'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {STATUS_LABELS[lot.status]}
            </span>
          </div>
          <h3 className="mt-1 text-white font-primary text-xl uppercase tracking-[0.1em] font-bold">
            {lot.fullTitle}
          </h3>
        </header>

        <div className="px-5 py-3 space-y-2.5 text-xs">
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">
              Área de Terreno
            </span>
            <span className="text-white font-bold tabular-nums">{lot.areaSqm} m²</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">
              Ubicación
            </span>
            <span className="text-white font-semibold">
              {POSITION_LABELS[lot.position]}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/10">
            <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">
              Valor Lote (Ref.)
            </span>
            <span className="text-brand-light-orange font-bold tabular-nums">
              USD ${lot.priceUsd.toLocaleString()} (S/ {lot.pricePen.toLocaleString()})
            </span>
          </div>
          {activeModel && (
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">
                Casa Seleccionada
              </span>
              <span className="text-emerald-400 font-bold">
                {activeModel.name} ({activeModel.builtAreaSqm} m²)
              </span>
            </div>
          )}
        </div>

        <div className="p-4 pt-2 space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <MessageCircle size={15} />
            <span>Cotizar por WhatsApp</span>
          </a>
        </div>
      </aside>

      {/* Panel Flotante Derecho: Selector de los 4 Diseños de Casa de Residencial Flamingo */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5 w-[clamp(230px,22%,340px)]">
        <div className="px-4 py-2 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-white/15">
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-light-orange font-bold">
            4 Diseños de Casa Compatibles
          </p>
          <p className="text-[11px] text-white/65">
            Elige un modelo para superponerlo en el lote o recorrerlo en 360°:
          </p>
        </div>

        {HOUSE_MODELS.map((model) => {
          const isSelected = selectedModelId === model.id;
          const isCompatible = lot.compatibleModels.includes(model.id);

          return (
            <div key={model.id} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setSelectedModelId((prev) => (prev === model.id ? null : model.id))
                }
                className={`w-full py-3 px-4 rounded-xl backdrop-blur-md border text-left shadow-xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-orange border-white/50 text-white scale-[1.02]'
                    : 'bg-neutral-950/75 border-white/20 text-white/90 hover:bg-brand-primary hover:border-white/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-[0.15em] font-bold">
                    {model.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-white/90 font-semibold">
                    {model.builtAreaSqm} m²
                  </span>
                </div>
                <p
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-white/90' : 'text-white/60'
                  }`}
                >
                  {model.bedrooms} Dorm. · {model.bathrooms} Baños ·{' '}
                  {isCompatible ? 'Compatible' : 'Lote recomendado +78m²'}
                </p>
              </button>

              {isSelected && (
                <button
                  type="button"
                  onClick={() => setOpenFullModalId(model.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-neutral-900 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer animate-fade-in"
                >
                  <span>Ver Planos, 3 Vistas & Tour 360°</span>
                  <ArrowRight size={14} className="text-brand-orange" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón Volver a la Zona */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-[4.5rem] z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.18em] font-semibold hover:bg-black/80 transition-colors cursor-pointer"
      >
        <ArrowLeft size={13} />
        <span>Volver a los Lotes</span>
      </button>

      {/* Modal Completo del Modelo de Casa Seleccionado */}
      {modalModel && (
        <HouseModelDetailModal
          model={modalModel}
          lot={lot}
          onClose={() => setOpenFullModalId(null)}
          onSelectModel={(newId) => setOpenFullModalId(newId)}
        />
      )}
    </div>
  );
};
