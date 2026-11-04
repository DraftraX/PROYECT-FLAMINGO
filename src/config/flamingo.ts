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
  description: string;
  thumb: string;
}

export interface EditorialCardSpec {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  image: string;
  objectPosition?: string;
  credit: string;
  whatsappMsg: string;
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
    label: 'Cordillera Escalera',
    startSec: 0,
    endSec: 9.5,
    title: 'ACR Cordillera Escalera: el pulmón verde de Tarapoto',
    description:
      'Más de 149,000 hectáreas de bosques nubosos protegidos que regulan el clima cálido y abastecen de agua cristalina al valle de Tarapoto.',
    thumb: '/tarapoto/cordillera-escalera-bosque.webp',
  },
  {
    id: 'turismo',
    num: '02',
    label: 'Turismo y Cataratas',
    startSec: 9.5,
    endSec: 19.0,
    title: 'Catarata de Ahuashiyacu y Laguna Azul de Sauce',
    description:
      'Maravillas naturales a pocos minutos de la ciudad que impulsan el crecimiento turístico, gastronómico e inmobiliario de San Martín.',
    thumb: '/tarapoto/catarata-ahuashiyacu.webp',
  },
  {
    id: 'biodiversidad',
    num: '03',
    label: 'Fauna y Flora',
    startSec: 19.0,
    endSec: 27.5,
    title: 'Santuario del Gallito de las Rocas, Mariposas y Heliconias',
    description:
      'Hogar de aves emblemáticas como el Rupicola peruvianus, mariposas amazónicas y especies botánicas tropicales que rodean el valle.',
    thumb: '/tarapoto/fauna-gallito-rocas.webp',
  },
  {
    id: 'vuelo-dron',
    num: '04',
    label: 'Dron Real Flamingo',
    startSec: 27.5,
    endSec: 39.0,
    title: 'Vuelo DJI Real sobre Residencial Flamingo en Tarapoto',
    description:
      'Recorrido aéreo real atravesando el pórtico de piedra y madera, la alameda de palmeras y los lotes de 160 m² y 200 m² a 30m del Colegio Virgen Dolorosa.',
    thumb: '/drive/2d/img-0760.webp',
  },
  {
    id: 'vision',
    num: '05',
    label: 'Proyección Flow',
    startSec: 39.0,
    endSec: 48.0,
    title: 'Urbanismo Armónico con Parque Central y Entrega Inmediata',
    description:
      'Proyección arquitectónica generada con Google Flow mostrando la consolidación de vías, pórtico y áreas verdes con título independizado.',
    thumb: '/urbanization/flamingo-render-clean.webp',
  },
];

export const SELVA_PROFUNDA_CARDS: EditorialCardSpec[] = [
  {
    id: 'cordillera-card',
    eyebrow: 'DESCUBRE',
    title: 'Cordillera Escalera y Clima Privilegiado',
    description:
      'Vive al pie del Área de Conservación Regional Cordillera Escalera, donde las montañas verdes abrazan a Tarapoto con aire puro, brisa fresca y paisajes amazónicos.',
    ctaLabel: 'Explorar ubicación',
    image: '/tarapoto/cordillera-escalera-valle.webp',
    credit: 'Fotografía real: ACR Cordillera Escalera, San Martín',
    whatsappMsg:
      'Hola Flamingo Residencial, me encanta el entorno natural de Tarapoto y la Cordillera Escalera. Deseo conocer los lotes disponibles.',
  },
  {
    id: 'turismo-card',
    eyebrow: 'TURISMO Y BIENESTAR',
    title: 'Catarata de Ahuashiyacu y Laguna Azul',
    description:
      'Tarapoto es el epicentro turístico y aéreo de la Amazonía peruana. Invertir aquí te conecta con cataratas cristalinas, lagunas navegables y alta demanda de vivienda.',
    ctaLabel: 'Solicitar dossier de inversión',
    image: '/tarapoto/laguna-azul-sauce.webp',
    credit: 'Fotografía real: Laguna Azul de Sauce, Tarapoto',
    whatsappMsg:
      'Hola Flamingo Residencial, deseo información sobre el potencial de inversión y plusvalía en Tarapoto.',
  },
  {
    id: 'fauna-flora-card',
    eyebrow: 'BIODIVERSIDAD VIVA',
    title: 'Fauna Silvestre y Flora Amazónica',
    description:
      'Un ecosistema único donde conviven el Gallito de las Rocas, mariposas multicolores de montaña, palmeras reales y heliconias tropicales que inspiran a Flamingo Residencial.',
    ctaLabel: 'Ver galería natural',
    image: '/tarapoto/fauna-gallito-rocas.webp',
    objectPosition: '78% 35%',
    credit: 'Fotografía real: Rupicola peruvianus y flora amazónica',
    whatsappMsg:
      'Hola Flamingo Residencial, quiero conocer más sobre el proyecto y sus áreas verdes en Tarapoto.',
  },
  {
    id: 'lotes-card',
    eyebrow: 'OPORTUNIDAD REAL',
    title: 'Lotes de 160 m² y 200 m² en Tarapoto',
    description:
      'Ubicados en Prolongación Jr. Cuzco s/n, a solo 30 metros del Colegio Virgen Dolorosa. Pórtico construido, agua, desagüe, luz, título independizado y entrega inmediata.',
    ctaLabel: 'Cotizar mi lote ahora',
    image: '/drive/2d/img-0751.webp',
    credit: 'Fotografía real en obra: Residencial Flamingo, Tarapoto',
    whatsappMsg:
      'Hola Flamingo Residencial, deseo cotizar un lote de 160 m² o 200 m² con entrega inmediata en Tarapoto.',
  },
];

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
      'Desliza hacia abajo para presenciar cómo el valle de Tarapoto se transforma paso a paso en la lotización residencial mejor ubicada.',
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
      'Conectividad inmediata a vía principal en Tarapoto, entorno educativo consolidado y alta plusvalía residencial garantizada.',
  },
  {
    id: 'tramo-4',
    range: [0.85, 1.0],
    badge: 'CIERRE COMERCIAL Y VISOR 360°',
    title: 'ELIGE TU LOTE HOY',
    highlight: 'Preventa Exclusiva · Atención Directa',
    subtitle: 'Explora el Recorrido Virtual 360° y el Plano Interactivo de Lotes a continuación.',
    description:
      'Reserva tu lote de 160 m² o 200 m² directamente con nuestros asesores oficiales por WhatsApp.',
  },
];
