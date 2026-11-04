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

export interface VideoChapterSpec {
  id: string;
  num: string;
  label: string;
  startSec: number;
  endSec: number;
  title: string;
  subtitle: string;
  thumb: string;
}

export interface ObraEvidencePill {
  id: string;
  pillLabel: string;
  image: string;
  visionImage: string;
  caption: string;
  badge: string;
}

export const FLAMINGO_BRAND = {
  name: 'Flamingo Residencial',
  shortName: 'FLAMINGO',
  subName: 'RESIDENCIAL',
  tagline: 'Lotes de 160 m² y 200 m² · Con título de propiedad · ¡Entrega Inmediata!',
  locationReference: 'Prolongación Jr. Cuzco s/n, a 30 metros del Colegio Virgen Dolorosa, Tarapoto',
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
    icon: '/brand/flamingo-icon.png',
    darkText: '/brand/logo-flamingo.png',
    lightText: '/brand/logo-flamingo-light.png',
    svgDark: '/brand/logo-flamingo.svg',
    svgLight: '/brand/logo-flamingo-light.svg',
    raw: '/brand/logo-flamingo-raw.png',
  },
  contact: {
    phoneDisplay: '+51 989 195 093',
    phoneRaw: '51989195093',
    email: 'aurora.aybar@gmail.com',
    handle: '@ResidencialFlamingo',
    instagramUrl: 'https://www.instagram.com/inmobiliaria.flamingo/',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61583317215238',
    coordinates: {
      lat: -6.5047877,
      lng: -76.3575799,
    },
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
    role: 'Asesor Comercial Oficial · Preventa y Visitas',
  },
];

export function buildFlamingoWhatsAppUrl(
  advisorIndex: number = 0,
  customMessage?: string
): string {
  const advisor = WHATSAPP_ADVISORS[advisorIndex] ?? WHATSAPP_ADVISORS[0];
  const defaultMsg =
    'Hola Flamingo Residencial, deseo recibir información de la preventa de lotes de 160 m² y 200 m² en Tarapoto (a 30m del Colegio Virgen Dolorosa).';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${advisor.rawPhone}?text=${text}`;
}

export const TARAPOTO_VIDEO_CHAPTERS: VideoChapterSpec[] = [
  {
    id: 'cordillera',
    num: '01',
    label: '01. Cordillera Escalera',
    startSec: 0,
    endSec: 17.0,
    title: 'Aire puro y clima privilegiado frente a la Cordillera Escalera',
    subtitle:
      'Vivir en Tarapoto es despertar frente al aire puro de la Cordillera Escalera, un santuario natural de montañas verdes, clima privilegiado todo el año y aguas cristalinas.',
    thumb: '/tarapoto/cordillera-escalera-bosque.webp',
  },
  {
    id: 'turismo',
    num: '02',
    label: '02. Ruta Turística',
    startSec: 17.0,
    endSec: 34.0,
    title: 'Catarata de Ahuashiyacu, Laguna Azul y alta demanda turística',
    subtitle:
      'A pocos minutos de joyas naturales como la Catarata de Ahuashiyacu y la Laguna Azul, Tarapoto se consolida como el destino de mayor crecimiento y valorización inmobiliaria en la Amazonía.',
    thumb: '/tarapoto/catarata-ahuashiyacu.webp',
  },
  {
    id: 'plusvalia',
    num: '03',
    label: '03. Plusvalía en Tarapoto',
    startSec: 34.0,
    endSec: 51.0,
    title: 'Vuelo real sobre Flamingo Residencial: seguridad urbana y legal',
    subtitle:
      'En medio de esta alta valorización nace Flamingo Residencial: lotes de 160 y 200 m² en Prolongación Jr. Cuzco, a solo 30 metros del Colegio Virgen Dolorosa, con pórtico construido, agua, desagüe, luz, título independizado y entrega inmediata.',
    thumb: '/drive/2d/img-0760.webp',
  },
];

export const OBRA_EVIDENCE_PILLS: ObraEvidencePill[] = [
  {
    id: 'colegio',
    pillLabel: '📍 A 30m Col. Virgen Dolorosa',
    image: '/drive/2d/img-0752.webp',
    visionImage: '/drive/2d/vision-avenue.webp',
    caption: 'Prolongación Jr. Cuzco s/n, Tarapoto · A 30 metros reales del Colegio Virgen Dolorosa',
    badge: 'UBICACIÓN REAL VERIFICADA',
  },
  {
    id: 'portico',
    pillLabel: '🏛️ Pórtico en Piedra y Madera',
    image: '/drive/2d/img-0760.webp',
    visionImage: '/drive/2d/vision-portico.webp',
    caption: 'Prolongación Jr. Cuzco s/n, Tarapoto · Acceso monumental 100% ejecutado en obra',
    badge: 'OBRA CIVIL ENTREGADA',
  },
  {
    id: 'servicios',
    pillLabel: '💧 Agua, Desagüe y Luz',
    image: '/drive/2d/img-0702.webp',
    visionImage: '/drive/2d/vision-avenue.webp',
    caption: 'Prolongación Jr. Cuzco s/n, Tarapoto · Cajas domiciliarias de agua y red sanitaria en vía',
    badge: 'HABILITACIÓN URBANA',
  },
  {
    id: 'titulo',
    pillLabel: '📜 Título Independizado',
    image: '/drive/2d/img-0751.webp',
    visionImage: '/drive/2d/vision-park.webp',
    caption: 'Prolongación Jr. Cuzco s/n, Tarapoto · Parque central con palmeras y entrega inmediata',
    badge: 'SEGURIDAD JURÍDICA',
  },
];

export const URBAN_SERVICES: UrbanServiceItem[] = [
  {
    id: 'agua',
    title: 'AGUA',
    subtitle: 'Red Matriz Potable',
    detail: 'Conexión domiciliaria instalada a pie de cada lote de 160 m² y 200 m².',
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
    subtitle: 'Red Eléctrica y Luminarias LED',
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
      'Desliza hacia abajo para recorrer cómo el valle de Tarapoto se transforma en tu próxima propiedad residencial.',
  },
  {
    id: 'tramo-2',
    range: [0.25, 0.55],
    badge: 'HABILITACIÓN URBANA EN VIVO',
    title: 'SERVICIOS COMPLETOS',
    highlight: 'Agua · Desagüe · Alumbrado Público',
    subtitle: 'Infraestructura lista para construir tu hogar o asegurar tu inversión.',
    description:
      'Vías afirmadas, manzanas trazadas con precisión topográfica y factibilidad real de servicios básicos.',
  },
  {
    id: 'tramo-3',
    range: [0.55, 0.85],
    badge: 'UBICACIÓN ESTRATÉGICA EN TARAPOTO',
    title: 'ENTORNO PRIVILEGIADO',
    highlight: 'A solo 30 metros del Colegio Virgen Dolorosa',
    subtitle: 'Seguridad jurídica total: Título de propiedad independizado y Entrega Inmediata.',
    description:
      'En Prolongación Jr. Cuzco s/n, con vista directa a la Cordillera Escalera y alta valorización garantizada.',
  },
  {
    id: 'tramo-4',
    range: [0.85, 1.0],
    badge: ' ENTREGA INMEDIATA',
    title: 'ELIGE TU LOTE HOY',
    highlight: 'Preventa Exclusiva · Atención Directa',
    subtitle: 'Explora las tipologías de 160 m² y 200 m² y el Masterplan 360° a continuación.',
    description:
      'Separa tu lote directamente con nuestra central oficial de preventa.',
  },
];
