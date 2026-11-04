export interface WhatsAppAdvisor {
  id: string;
  label: string;
  displayPhone: string;
  rawPhone: string;
  role: string;
}

export interface UrbanServiceItem {
  id: 'agua' | 'desague' | 'alumbrado';
  title: string;
  subtitle: string;
  detail: string;
  progressThreshold: number;
  coords: { xPct: number; yPct: number };
}

export interface ScrollStageSpec {
  id: 'tramo-1' | 'tramo-2' | 'tramo-3' | 'tramo-4';
  range: [number, number];
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
}

export const FLAMINGO_BRAND = {
  name: 'Flamingo Residencial',
  shortName: 'FLAMINGO',
  subName: 'RESIDENCIAL',
  tagline: 'Lotes de 160 m² y 200 m² · Con título de propiedad · ¡Entrega Inmediata!',
  locationReference: 'A solo 30 metros del Colegio Virgen Dolorosa',
  lotSizes: ['160 m²', '200 m²'] as const,
  colors: {
    lavenderSilk: '#EAE3F2',
    lavenderLight: '#F5F1FA',
    plumDeep: '#361D42',
    plumDark: '#23112B',
    flamingoPink: '#EE6B96',
    flamingoSoft: '#F48FB1',
    oliveOrganic: '#515B1B',
  },
  fonts: {
    serif: "'Geista Mond', 'Cormorant Garamond', Georgia, serif",
    sans: "'DM Sans', sans-serif",
  },
  logos: {
    darkText: '/brand/logo-flamingo.png',
    lightText: '/brand/logo-flamingo-light.png',
    raw: '/brand/logo-flamingo-raw.png',
  },
  contact: {
    phoneDisplay: '+51 989 195 093',
    phoneRaw: '51989195093',
    email: 'aurora.aybar@gmail.com',
    handle: '@ResidencialFlamingo',
    instagramUrl: 'https://www.instagram.com/inmobiliaria.flamingo/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61583317215238',
  },
  sequence: {
    basePath: '/sequence',
    totalFrames: 150,
    extension: 'webp',
    prefix: 'frame_',
    padLength: 4,
    firstFrameFallback: '/flow-frames/first-frame.jpg',
    lastFrameFallback: '/flow-frames/last-frame.jpg',
  },
} as const;

export const WHATSAPP_ADVISORS: WhatsAppAdvisor[] = [
  {
    id: 'advisor-1',
    label: 'Central Preventa Oficial',
    displayPhone: '+51 989 195 093',
    rawPhone: '51989195093',
    role: 'Asesor Comercial Oficial · Preventa & Visitas',
  },
];

export function buildFlamingoWhatsAppUrl(
  advisorIndex: number = 0,
  customMessage?: string
): string {
  const advisor = WHATSAPP_ADVISORS[advisorIndex] ?? WHATSAPP_ADVISORS[0];
  const defaultMsg =
    'Hola Flamingo Residencial, deseo aprovechar la PREVENTA de lotes de 160 m² y 200 m² con título de propiedad y entrega inmediata (a 30m del Colegio Virgen Dolorosa).';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${advisor.rawPhone}?text=${text}`;
}

export const URBAN_SERVICES: UrbanServiceItem[] = [
  {
    id: 'agua',
    title: 'AGUA',
    subtitle: 'Red Matriz Potable',
    detail: 'Conexión domiciliaria proyectada a pie de cada lote de 160 m² y 200 m².',
    progressThreshold: 0.28,
    coords: { xPct: 39, yPct: 56 },
  },
  {
    id: 'desague',
    title: 'DESAGÜE',
    subtitle: 'Alcantarillado Integral',
    detail: 'Sistema colector subterráneo habilitado con pendiente técnica y buzones.',
    progressThreshold: 0.36,
    coords: { xPct: 52, yPct: 52 },
  },
  {
    id: 'alumbrado',
    title: 'ALUMBRADO PÚBLICO',
    subtitle: 'Red Eléctrica & Luminarias LED',
    detail: 'Postes ornamentales e iluminación cálida en vías internas y pórtico principal.',
    progressThreshold: 0.44,
    coords: { xPct: 63, yPct: 48 },
  },
];

export const SCROLL_STAGES: ScrollStageSpec[] = [
  {
    id: 'tramo-1',
    range: [0, 0.25],
    badge: 'APROVECHA LA',
    title: 'PREVENTA',
    highlight: 'Lotes de 160 m² y 200 m²',
    subtitle: 'Con título de propiedad. ¡Entrega Inmediata!',
    description:
      'Desliza hacia abajo para presenciar cómo el valle se transforma paso a paso en la lotización residencial mejor ubicada.',
  },
  {
    id: 'tramo-2',
    range: [0.25, 0.55],
    badge: 'HABILITACIÓN URBANA EN VIVO',
    title: 'SERVICIOS COMPLETOS',
    highlight: 'Agua · Desagüe · Alumbrado Público',
    subtitle: 'Infraestructura lista para construir tu hogar o asegurar tu inversión.',
    description:
      'Vías afirmadas con sardineles, manzanas trazadas con precisión topográfica y factibilidad de servicios básicos completos.',
  },
  {
    id: 'tramo-3',
    range: [0.55, 0.85],
    badge: 'UBICACIÓN ESTRATÉGICA CONSOLIDADA',
    title: 'ENTORNO PRIVILEGIADO',
    highlight: 'A solo 30 metros del Colegio Virgen Dolorosa',
    subtitle: 'Seguridad jurídica total: Título de propiedad independizado y Entrega Inmediata.',
    description:
      'Conectividad inmediata a vía principal asfaltada, entorno educativo consolidado y alta plusvalía residencial garantizada.',
  },
  {
    id: 'tramo-4',
    range: [0.85, 1.0],
    badge: 'CIERRE COMERCIAL & VISOR 360°',
    title: 'ELIGE TU LOTE HOY',
    highlight: 'Preventa Exclusiva · Atención Directa',
    subtitle: 'Explora el Recorrido Virtual 360° y el Plano Interactivo de Lotes a continuación.',
    description:
      'Reserva tu lote de 160 m² o 200 m² directamente con nuestros asesores oficiales por WhatsApp.',
  },
];
