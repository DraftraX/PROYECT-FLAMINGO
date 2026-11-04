import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { buildFlamingoWhatsAppUrl, FLAMINGO_BRAND } from '../config/flamingo';

export type InterestOption =
  | 'Lote de 160 m² (8m × 20m)'
  | 'Lote de 200 m² (10m × 20m)'
  | 'Visita guiada al proyecto en Tarapoto';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialInterest?: InterestOption;
  selectedLotNote?: string;
}

const INTEREST_OPTIONS: InterestOption[] = [
  'Lote de 160 m² (8m × 20m)',
  'Lote de 200 m² (10m × 20m)',
  'Visita guiada al proyecto en Tarapoto',
];

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  isOpen,
  onClose,
  initialInterest = 'Lote de 160 m² (8m × 20m)',
  selectedLotNote = '',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState<InterestOption>(initialInterest);
  const [contactMethod, setContactMethod] = useState<'WhatsApp directo' | 'Llamada telefónica'>(
    'WhatsApp directo'
  );

  useEffect(() => {
    setInterest(initialInterest);
  }, [initialInterest, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotExtra = selectedLotNote ? ` (${selectedLotNote})` : '';
    const msg = `Hola Flamingo Residencial, mi nombre es ${
      name || 'Interesado'
    } (${phone || 'sin número'}). Mi interés principal es: ${interest}${lotExtra}. Prefiero ser contactado por: ${contactMethod}.`;
    window.open(buildFlamingoWhatsAppUrl(0, msg), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[80] transition-all duration-500 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* Frosted Dark Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#190B20]/65 backdrop-blur-md transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right Slide-Over Drawer Panel */}
      <aside
        role="dialog"
        data-testid="contact-drawer"
        data-open={isOpen ? 'true' : 'false'}
        aria-modal="true"
        aria-label="Formulario de contacto y cotización de lotes"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className={`absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[#F5F1FA] text-[#23112B] shadow-2xl border-l border-[#361D42]/10 flex flex-col justify-between overflow-y-auto p-6 sm:p-10 transition-transform duration-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Bar with Icon & Close Button */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-[#EAE3F2] px-4 py-1.5 border border-[#361D42]/10">
              <img
                src={FLAMINGO_BRAND.logos.icon}
                alt=""
                className="h-5 w-5 object-contain"
              />
              <span className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-[#361D42]">
                Preventa Oficial · Tarapoto
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de contacto"
              className="h-10 w-10 rounded-full bg-white border border-[#361D42]/15 flex items-center justify-center text-[#361D42] hover:bg-[#361D42] hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Editorial Heading */}
          <div className="space-y-2">
            <h2 className="font-geista font-normal text-3xl sm:text-4xl text-[#361D42] leading-tight">
              Separa tu lote hoy mismo
            </h2>
            <p className="font-dm text-sm text-[#361D42]/75 leading-relaxed">
              Solicita el plano actualizado en Prolongación Jr. Cuzco s/n o escríbenos directo a
              central de preventa.
            </p>
            {selectedLotNote && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#EE6B96]/15 border border-[#EE6B96]/40 px-3.5 py-1.5 font-dm text-xs font-bold text-[#361D42]">
                <span>Seleccionado: {selectedLotNote}</span>
              </div>
            )}
          </div>

          {/* Tactile Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <label
                htmlFor="drawer-name"
                className="block font-dm text-xs font-bold uppercase tracking-[0.14em] text-[#361D42]/80 pl-1"
              >
                Nombre y apellido
              </label>
              <input
                id="drawer-name"
                type="text"
                required
                placeholder="Ej. Andrea Morales"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-[#361D42]/20 bg-white px-4 py-3.5 font-dm text-sm text-[#23112B] placeholder:text-[#361D42]/40 focus:border-[#361D42] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="drawer-phone"
                className="block font-dm text-xs font-bold uppercase tracking-[0.14em] text-[#361D42]/80 pl-1"
              >
                Celular / WhatsApp
              </label>
              <input
                id="drawer-phone"
                type="tel"
                required
                placeholder="+51 999 999 999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-[#361D42]/20 bg-white px-4 py-3.5 font-dm text-sm text-[#23112B] placeholder:text-[#361D42]/40 focus:border-[#361D42] focus:outline-none transition-colors"
              />
            </div>

            {/* Tactile Selector for "Interés principal" */}
            <div className="space-y-2">
              <span className="block font-dm text-xs font-bold uppercase tracking-[0.14em] text-[#361D42]/80 pl-1">
                Interés principal
              </span>
              <div className="grid grid-cols-1 gap-2">
                {INTEREST_OPTIONS.map((opt) => {
                  const active = interest === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setInterest(opt)}
                      className={`w-full text-left rounded-2xl px-4 py-3 font-dm text-sm font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-[#361D42] text-white border-[#361D42] shadow-md'
                          : 'bg-white text-[#361D42] border-[#361D42]/15 hover:border-[#361D42]/40'
                      }`}
                    >
                      <span>{opt}</span>
                      <span
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          active ? 'border-[#EE6B96] bg-[#EE6B96]' : 'border-[#361D42]/30'
                        }`}
                      >
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-[#23112B]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Segmented Control for "¿Cómo prefieres ser contactado?" */}
            <div className="space-y-2">
              <span className="block font-dm text-xs font-bold uppercase tracking-[0.14em] text-[#361D42]/80 pl-1">
                ¿Cómo prefieres ser contactado?
              </span>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#EAE3F2] p-1.5 border border-[#361D42]/10">
                {(['WhatsApp directo', 'Llamada telefónica'] as const).map((method) => {
                  const active = contactMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setContactMethod(method)}
                      className={`rounded-xl py-2.5 px-3 font-dm text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-white text-[#361D42] shadow-sm'
                          : 'text-[#361D42]/70 hover:text-[#361D42]'
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#361D42] hover:bg-[#EE6B96] text-white hover:text-[#23112B] py-4 px-8 font-dm text-sm font-bold uppercase tracking-[0.18em] transition-all shadow-lg cursor-pointer"
            >
              Enviar Solicitud
            </button>
          </form>
        </div>

        {/* Compact Direct Links Footer */}
        <div className="mt-8 pt-5 border-t border-[#361D42]/12 space-y-2 font-dm text-xs text-[#361D42]/85">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <a
              href={buildFlamingoWhatsAppUrl(0)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#361D42] hover:text-[#EE6B96] transition-colors"
            >
              WhatsApp: {FLAMINGO_BRAND.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${FLAMINGO_BRAND.contact.email}`}
              className="hover:text-[#EE6B96] transition-colors"
            >
              {FLAMINGO_BRAND.contact.email}
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#361D42]/70">
            <a
              href={FLAMINGO_BRAND.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#EE6B96] transition-colors"
            >
              Instagram {FLAMINGO_BRAND.contact.handle}
            </a>
            <span>·</span>
            <a
              href={FLAMINGO_BRAND.contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#EE6B96] transition-colors"
            >
              Facebook Oficial
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
};
