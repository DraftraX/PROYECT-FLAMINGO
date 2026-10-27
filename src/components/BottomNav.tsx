import React, { useEffect, useState } from 'react';
import {
  Home,
  Compass,
  Layers,
  LayoutGrid,
  Box,
  Image as ImageIcon,
  Rotate3D,
  Video,
  MapPin,
  Phone,
  Sliders,
  X,
  Maximize,
  Minimize,
  Menu,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Inicio', href: '/', icon: Home },
  { id: 'intro', label: 'Showroom', href: '/showroom?step=intro', icon: Compass },
  { id: 'phases', label: 'Masterplan', href: '/showroom?step=phases', icon: Layers },
  { id: 'lots', label: 'Lotes', href: '/showroom?step=lots', icon: LayoutGrid },
  { id: 'models', label: '4 Casas', href: '/showroom?step=models', icon: Box },
  { id: 'tours', label: 'Tour 360°', href: '/recorridos', icon: Rotate3D },
  { id: 'amenities', label: 'Amenidades', href: '/amenidades', icon: ImageIcon },
  { id: 'video', label: 'Videos', href: '/video', icon: Video },
  { id: 'location', label: 'Ubicación', href: '/ubicacion', icon: MapPin },
  { id: 'calibrator', label: 'Calibrador', href: '/showroom?calibrator=true', icon: Sliders },
  { id: 'contact', label: 'Contacto', href: '/contact', icon: Phone },
];

export const FullscreenButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className={`relative z-50 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        className="peer p-2.5 bg-brand-primary/85 hover:bg-brand-primary backdrop-blur-xl border border-white/20 rounded-full text-white transition-all hover:scale-110 cursor-pointer shadow-lg"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      <div className="absolute top-1/2 right-full mr-3 -translate-y-1/2 px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded-md opacity-0 peer-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {isFullscreen ? 'Contraer' : 'Expandir'}
      </div>
    </div>
  );
};

interface BottomNavProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isOpen, onClose, activePath = '' }) => {
  const [currentUrl, setCurrentUrl] = useState(activePath);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.pathname + window.location.search);
    }
  }, [isOpen, activePath]);

  const isItemActive = (href: string) => {
    if (!currentUrl) return false;
    if (href === '/' && currentUrl === '/') return true;
    if (href !== '/' && currentUrl === href) return true;
    return false;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ocean-950/55 backdrop-blur-md z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Emblema Central Flotante cuando el menú está abierto */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[62] flex items-center justify-center px-8 pb-[clamp(11rem,24vh,15rem)] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <img
          src="/logos/flamingo-logo.svg"
          alt="Inmobiliaria Flamingo · Proyecto Residencial Flamingo"
          className="w-[260px] sm:w-[380px] lg:w-[460px] object-contain drop-shadow-2xl"
        />
      </div>

      {/* Barra Arquitectónica Inferior con Friso Griego / Costero */}
      <nav
        aria-label="Navegación principal"
        className={`sidebar-nav group fixed bottom-0 left-0 w-full z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Friso superior (.olympus-fret & .olympus-cornice) */}
        <div className="pointer-events-none relative h-[34px] w-full overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-ocean-800/85 to-ocean-700/80" />
          <div className="olympus-fret absolute inset-x-0 bottom-0 h-4 opacity-90" />
          <div className="olympus-cornice absolute inset-x-0 top-0 h-[5px]" />
        </div>

        {/* Cuerpo con Columnata (.olympus-colonnade) */}
        <div className="relative isolate -mt-px overflow-hidden bg-gradient-to-b from-ocean-700/90 via-ocean-800/90 to-ocean-950/95 backdrop-blur-xl px-4 pt-1 pb-7">
          <div className="olympus-colonnade absolute inset-0 z-0" />

          <div className="relative z-10 flex items-center justify-between px-2 pb-2">
            <span className="text-[10px] font-primary uppercase tracking-[0.24em] text-brand-light-orange font-bold">
              Inmobiliaria Flamingo · Navegación Inmersiva
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="p-1.5 text-white/75 hover:text-white hover:scale-110 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <ul className="relative z-10 flex gap-2 overflow-x-auto scrollbar-thin pb-1 justify-start lg:justify-center">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              return (
                <li key={item.id} className="shrink-0">
                  <a
                    href={item.href}
                    onClick={onClose}
                    className={`group/item w-[84px] flex flex-col items-center gap-1.5 rounded-2xl px-2 py-2.5 transition-all duration-300 cursor-pointer olympus-btn border ${
                      active
                        ? 'bg-white text-ocean-800 border-white shadow-xl'
                        : 'text-white/85 border-white/10 hover:text-white hover:border-brand-orange/50'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 relative z-10">
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <span className="font-primary text-[10px] font-bold tracking-wide text-center leading-tight whitespace-nowrap relative z-10">
                      {item.label}
                    </span>
                    {!active && <div className="olympus-btn-glow" />}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="relative z-10 mt-3 pt-2.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <img
                src="/logos/flamingo-logo.svg"
                alt="Inmobiliaria Flamingo"
                className="h-7 w-auto object-contain"
              />
              <span className="text-[10px] text-white/60 font-secondary">
                © {new Date().getFullYear()} Inmobiliaria Flamingo · Proyecto Residencial Flamingo
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/65">
              <a
                href="/showroom?calibrator=true"
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-brand-orange text-white font-semibold transition-colors"
              >
                Modo Calibrador OpenCV
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export const FloatingMenuTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Abrir menú principal"
    className="w-10 h-10 rounded-full bg-brand-primary hover:bg-brand-orange text-white flex items-center justify-center shadow-xl border border-white/25 transition-all hover:scale-105 cursor-pointer"
  >
    <Menu size={18} />
  </button>
);
