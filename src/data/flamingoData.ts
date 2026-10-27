import lotsJson from './lots.json';

export const R2_CDN = 'https://pub-02c8d15cc2e047f7967f101245f72286.r2.dev';
export const ASSET_VERSION = '20260922-2';

export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  const clean = path.replace(/^\/+/, '');
  return `${R2_CDN}/${clean}?v=${ASSET_VERSION}`;
}

export type LotStatus = 'available' | 'reserved' | 'sold';
export type LotPosition = 'corner' | 'middle';

export interface LotVertex {
  x: number;
  y: number;
}

export interface FlamingoLot {
  id: string;
  blockId: string;
  blockLetter: string;
  lotNumber: number;
  identifier: string;
  fullTitle: string;
  zoneId: string;
  status: LotStatus;
  position: LotPosition;
  areaSqm: number;
  priceUsd: number;
  pricePen: number;
  x: number;
  y: number;
  x1920: number;
  y1080: number;
  path: string;
  path1920: string;
  vertices1920: LotVertex[];
  compatibleModels: string[];
}

export const INITIAL_LOTS: FlamingoLot[] = lotsJson as FlamingoLot[];

export const STATUS_LABELS: Record<LotStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
};

export const POSITION_LABELS: Record<LotPosition, string> = {
  corner: 'En esquina',
  middle: 'Intermedio',
};

export const HOME_SLIDES = [
  {
    id: 1,
    tag: ' EXCLUSIVIDAD FRENTE AL SOL DEL NORTE',
    title: 'UN ESTILO DE VIDA QUE LO TIENE TODO',
    description:
      'Residencial Flamingo integra urbanismo moderno, seguridad permanente y arquitectura bioclimática en una comunidad planificada de alta plusvalía.',
    metric: '133 Lotes Residenciales',
  },
  {
    id: 2,
    tag: 'ARQUITECTURA PERSONALIZADA',
    title: '4 DISEÑOS DE CASA LISTOS PARA VIVIR',
    description:
      'Elige tu lote ideal y combínalo con cualquiera de nuestros 4 modelos residenciales con recorridos 360° interactivos y terrazas sociales.',
    metric: 'Desde 66 m² hasta 116 m²',
  },
  {
    id: 3,
    tag: 'AMENIDADES ESTILO RESORT',
    title: 'CLUB HOUSE, PISCINAS Y PARQUES PRIVADOS',
    description:
      'Más de 15 áreas recreativas pensadas para tu familia: Club House social, parques temáticos por manzana, canchas multiusos y alamedas peatonales.',
    metric: '+15 Amenidades Exclusivas',
  },
  {
    id: 4,
    tag: 'UBICACIÓN ESTRATÉGICA',
    title: 'CONECTADO CON LAS MEJORES PLAYAS Y SERVICIOS',
    description:
      'Sobre la vía Panamericana Norte, a pocos minutos del Aeropuerto, Costa Mar Plaza y las playas de aguas cálidas de Zorritos y Punta Sal.',
    metric: 'Alta Rentabilidad Anual',
  },
  {
    id: 5,
    tag: 'TECNOLOGÍA INMERSIVA',
    title: 'EXPLORA CADA LOTE Y VIVIENDA EN TIEMPO REAL',
    description:
      'Gira 360° sobre la urbanización, compara la iluminación de día y noche, filtra terrenos por metraje y camina por el interior de las casas.',
    metric: 'Showroom Digital 360°',
  },
];

export interface SideConfig {
  id: 'side-0' | 'side-1' | 'side-2' | 'side-3' | 'side-4';
  label: string;
  dayImage: string;
  nightImage: string;
  introVideo?: string;
  loopVideo?: string;
  enterMasterplanVideo?: string;
  transitions: {
    left: string;
    right: string;
  };
}

export const SHOWROOM_SIDES: Record<string, SideConfig> = {
  'side-0': {
    id: 'side-0',
    label: 'Pórtico Principal · Residencial Flamingo',
    dayImage: getAssetUrl('urbanization/sides/side-0/day.webp'),
    nightImage: getAssetUrl('urbanization/sides/side-0/night.webp'),
    introVideo: getAssetUrl('urbanization/sides/side-0/intro.day.mp4'),
    loopVideo: getAssetUrl('urbanization/sides/side-0/loop.day.mp4'),
    transitions: {
      left: getAssetUrl('urbanization/sides/transitions/side-0_to_side-1.day.mp4'),
      right: getAssetUrl('urbanization/sides/transitions/side-0_to_side-1.day.mp4'),
    },
  },
  'side-1': {
    id: 'side-1',
    label: 'Vista Aérea Frontal · Cara 1 (Norte)',
    dayImage: getAssetUrl('urbanization/sides/side-1/day.webp'),
    nightImage: getAssetUrl('urbanization/sides/side-1/night.webp'),
    enterMasterplanVideo: getAssetUrl('urbanization/sides/transitions/side-1_to_master-plan.day.mp4'),
    transitions: {
      left: getAssetUrl('urbanization/sides/transitions/side-1_to_side-4.day.mp4'),
      right: getAssetUrl('urbanization/sides/transitions/side-1_to_side-2.day.mp4'),
    },
  },
  'side-2': {
    id: 'side-2',
    label: 'Vista Aérea Lateral · Cara 2 (Este)',
    dayImage: getAssetUrl('urbanization/sides/side-2/day.webp'),
    nightImage: getAssetUrl('urbanization/sides/side-2/night.webp'),
    enterMasterplanVideo: getAssetUrl('urbanization/sides/transitions/side-2_to_master-plan.day.mp4'),
    transitions: {
      left: getAssetUrl('urbanization/sides/transitions/side-2_to_side-1.day.mp4'),
      right: getAssetUrl('urbanization/sides/transitions/side-2_to_side-3.day.mp4'),
    },
  },
  'side-3': {
    id: 'side-3',
    label: 'Vista Aérea Posterior · Cara 3 (Sur)',
    dayImage: getAssetUrl('urbanization/sides/side-3/day.webp'),
    nightImage: getAssetUrl('urbanization/sides/side-3/night.webp'),
    enterMasterplanVideo: getAssetUrl('urbanization/sides/transitions/side-3_to_master-plan.day.mp4'),
    transitions: {
      left: getAssetUrl('urbanization/sides/transitions/side-3_to_side-2.day.mp4'),
      right: getAssetUrl('urbanization/sides/transitions/side-3_to_side-4.day.mp4'),
    },
  },
  'side-4': {
    id: 'side-4',
    label: 'Vista Panorámica · Cara 4 (Oeste)',
    dayImage: getAssetUrl('urbanization/sides/side-4/day.webp'),
    nightImage: getAssetUrl('urbanization/sides/side-4/night.webp'),
    enterMasterplanVideo: getAssetUrl('urbanization/sides/transitions/side-4_to_master-plan.day.mp4'),
    transitions: {
      left: getAssetUrl('urbanization/sides/transitions/side-4_to_side-3.day.mp4'),
      right: getAssetUrl('urbanization/sides/transitions/side-4_to_side-1.day.mp4'),
    },
  },
};

export interface ZoneConfig {
  id: 'zone-1' | 'zone-2' | 'zone-3';
  label: string;
  subtitle: string;
  row: number;
  col: number;
  image: string;
  entryVideo: string;
  exitVideo: string;
  hotspot: {
    x: number;
    y: number;
    path: string;
    paths?: string[];
  };
  transitions: Partial<Record<'zone-1' | 'zone-2' | 'zone-3', string>>;
}

export interface PhaseConfig {
  id: string;
  label: string;
  status: 'available' | 'coming_soon';
  comingSoonNote?: string;
  image: string;
  entryVideo: string;
  hotspot: {
    x: number;
    y: number;
    path: string;
  };
  zones: ZoneConfig[];
}

export const MASTERPLAN_IMAGE = getAssetUrl('urbanization/master-plan.webp');

export const PHASES_DATA: PhaseConfig[] = [
  {
    id: 'phase-1',
    label: 'Etapa 1 · Flamingo Oasis',
    status: 'available',
    image: getAssetUrl('urbanization/phases/phase-1/overview.webp'),
    entryVideo: getAssetUrl('urbanization/phases/phase-1/entry.mp4'),
    hotspot: {
      x: 25.1,
      y: 66.8,
      path: 'M 19.7 95.8 L 32.0 87.3 L 31.8 81.9 L 37.9 78.3 L 26.8 48.0 L 21.8 49.0 L 18.7 42.3 L 10.6 43.3 L 15.6 93.7 L 19.7 95.8 Z',
    },
    zones: [
      {
        id: 'zone-1',
        label: 'Zona 1 · Manzanas O, P, Q, R',
        subtitle: 'Pórtico, Parque Mz P & Parque Mz R',
        row: 1,
        col: 0,
        image: getAssetUrl('urbanization/phases/phase-1/zone-1.webp'),
        entryVideo: getAssetUrl('urbanization/phases/phase-1/zone-1-entry.mp4'),
        exitVideo: getAssetUrl('urbanization/phases/phase-1/zone-1-exit.mp4'),
        hotspot: {
          x: 24.4,
          y: 51.8,
          path: 'M 7.1 75.5 L 35.4 61.9 L 35.1 24.1 L 12.1 26.5 Z',
          paths: [
            'M 10.6 73.8 L 7.1 75.5 L 9.5 52.0 L 12.6 50.9 Z',
            'M 9.6 51.0 L 12.7 49.9 L 15.1 26.2 L 12.1 26.5 Z',
            'M 19.2 69.7 L 13.7 72.3 L 16.0 47.4 L 21.4 45.7 Z',
            'M 28.0 65.5 L 22.4 68.2 L 24.4 25.2 L 29.5 24.7 Z',
            'M 35.4 61.9 L 30.8 64.1 L 31.4 40.9 L 35.2 39.7 Z',
          ],
        },
        transitions: {
          'zone-2': getAssetUrl('urbanization/phases/phase-1/transitions/zone-1_to_zone-2.mp4'),
          'zone-3': getAssetUrl('urbanization/phases/phase-1/transitions/zone-1_to_zone-3.mp4'),
        },
      },
      {
        id: 'zone-2',
        label: 'Zona 2 · Manzanas K, L, M, N',
        subtitle: 'Alameda Central & Lotes Esquinados',
        row: 0,
        col: 0,
        image: getAssetUrl('urbanization/phases/phase-1/zone-2.webp'),
        entryVideo: getAssetUrl('urbanization/phases/phase-1/zone-2-entry.mp4'),
        exitVideo: getAssetUrl('urbanization/phases/phase-1/zone-2-exit.mp4'),
        hotspot: {
          x: 52.8,
          y: 35.6,
          path: 'M 40.2 59.6 L 67.3 46.6 L 66.2 19.8 L 39.7 22.8 Z',
          paths: [
            'M 55.6 52.2 L 67.3 46.6 L 66.7 32.0 L 55.3 36.1 Z',
            'M 40.2 59.6 L 51.9 54.0 L 52.2 21.4 L 39.7 22.8 Z',
            'M 54.7 35.0 L 66.2 30.9 L 65.8 19.8 L 54.6 21.1 Z',
          ],
        },
        transitions: {
          'zone-1': getAssetUrl('urbanization/phases/phase-1/transitions/zone-2_to_zone-1.mp4'),
          'zone-3': getAssetUrl('urbanization/phases/phase-1/transitions/zone-2_to_zone-3.mp4'),
        },
      },
      {
        id: 'zone-3',
        label: 'Zona 3 · Club House & Módulos',
        subtitle: 'Club House Social, Piscina & Torres',
        row: 0,
        col: 1,
        image: getAssetUrl('urbanization/phases/phase-1/zone-3.webp'),
        entryVideo: getAssetUrl('urbanization/phases/phase-1/zone-3-entry.mp4'),
        exitVideo: getAssetUrl('urbanization/phases/phase-1/zone-3-exit.mp4'),
        hotspot: {
          x: 78.6,
          y: 26.8,
          path: 'M 71.1 44.8 L 91.5 35.0 L 89.4 12.1 L 70.0 14.3 Z',
        },
        transitions: {
          'zone-1': getAssetUrl('urbanization/phases/phase-1/transitions/zone-3_to_zone-1.mp4'),
          'zone-2': getAssetUrl('urbanization/phases/phase-1/transitions/zone-3_to_zone-2.mp4'),
        },
      },
    ],
  },
  {
    id: 'phase-2',
    label: 'Etapa 2 · Flamingo Laguna',
    status: 'coming_soon',
    comingSoonNote: 'Próximo Lanzamiento',
    image: getAssetUrl('urbanization/phases/phase-1/overview.webp'),
    entryVideo: getAssetUrl('urbanization/phases/phase-1/entry.mp4'),
    hotspot: {
      x: 41.2,
      y: 62.6,
      path: 'M 38.0 78.4 L 54.3 69.2 L 50.2 52.8 L 32.3 56.1 L 31.3 53.0 L 29.0 53.5 L 38.0 78.4 Z',
    },
    zones: [],
  },
  {
    id: 'phase-3',
    label: 'Etapa 3 · Flamingo Golf',
    status: 'coming_soon',
    comingSoonNote: 'En Planificación',
    image: getAssetUrl('urbanization/phases/phase-1/overview.webp'),
    entryVideo: getAssetUrl('urbanization/phases/phase-1/entry.mp4'),
    hotspot: {
      x: 59.5,
      y: 50.9,
      path: 'M 54.4 69.1 L 74.1 58.0 L 66.2 35.3 L 46.5 37.9 L 54.4 69.1 Z',
    },
    zones: [],
  },
  {
    id: 'phase-4',
    label: 'Etapa 4 · Flamingo Mirador',
    status: 'coming_soon',
    comingSoonNote: 'Reserva Futura',
    image: getAssetUrl('urbanization/phases/phase-1/overview.webp'),
    entryVideo: getAssetUrl('urbanization/phases/phase-1/entry.mp4'),
    hotspot: {
      x: 76.2,
      y: 41.2,
      path: 'M 74.2 57.9 L 89.2 49.4 L 80.5 26.8 L 63.8 28.8 L 74.2 57.9 Z',
    },
    zones: [],
  },
];

export interface BlockMetadata {
  id: string;
  letter: string;
  zoneId: 'zone-1' | 'zone-2';
  hotspot: {
    x: number;
    y: number;
    path: string;
  };
}

export const BLOCKS_DATA: BlockMetadata[] = [
  {
    id: 'mz-k',
    letter: 'K',
    zoneId: 'zone-2',
    hotspot: { x: 45.9, y: 77.7, path: 'M 57.2 88.6 L 57.1 66.6 L 34.6 66.8 L 34.6 88.6 Z' },
  },
  {
    id: 'mz-l',
    letter: 'L',
    zoneId: 'zone-2',
    hotspot: { x: 50.9, y: 32.7, path: 'M 57.8 0.0 L 43.8 3.7 L 43.9 63.8 L 57.8 63.5 Z' },
  },
  {
    id: 'mz-m',
    letter: 'M',
    zoneId: 'zone-2',
    hotspot: { x: 34.6, y: 35.0, path: 'M 41.2 4.7 L 27.9 8.6 L 27.9 63.7 L 41.3 63.0 Z' },
  },
  {
    id: 'mz-n',
    letter: 'N',
    zoneId: 'zone-2',
    hotspot: { x: 18.3, y: 37.0, path: 'M 24.8 9.4 L 11.4 13.8 L 11.2 58.9 L 18.0 63.6 L 25.0 62.8 Z' },
  },
  {
    id: 'mz-o',
    letter: 'O',
    zoneId: 'zone-1',
    hotspot: { x: 11.9, y: 51.4, path: 'M 15.4 14.3 L 15.3 88.0 L 8.5 89.2 L 8.3 15.0 Z' },
  },
  {
    id: 'mz-p',
    letter: 'P',
    zoneId: 'zone-1',
    hotspot: { x: 24.4, y: 67.7, path: 'M 17.8 87.8 L 17.9 49.1 L 31.1 48.8 L 31.2 84.8 Z' },
  },
  {
    id: 'mz-q',
    letter: 'Q',
    zoneId: 'zone-1',
    hotspot: { x: 40.0, y: 48.4, path: 'M 33.7 14.2 L 46.4 14.2 L 46.6 80.8 L 33.5 83.8 Z' },
  },
  {
    id: 'mz-r',
    letter: 'R',
    zoneId: 'zone-1',
    hotspot: { x: 55.5, y: 62.7, path: 'M 61.9 46.9 L 49.0 46.4 L 49.3 80.1 L 62.4 77.2 Z' },
  },
];

export interface ViewpointItem {
  id: string;
  zoneId: 'zone-1' | 'zone-2' | 'zone-3';
  order: number;
  label: string;
  caption: string;
  anchor: { x: number; y: number };
  target: { x: number; y: number };
  imageDay: string;
  imageNight: string;
}

export const VIEWPOINTS_DATA: ViewpointItem[] = [
  // Zona 1
  {
    id: 'zone-1:vp-1',
    zoneId: 'zone-1',
    order: 1,
    label: 'Vista 1 · Ingreso Mz O',
    caption: 'Zona 1 · Alameda Principal & Manzana O (Día vs Noche)',
    anchor: { x: 11.6, y: 90.0 },
    target: { x: 14.9, y: 87.8 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-1/1.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-1/1.night.webp'),
  },
  {
    id: 'zone-1:vp-2',
    zoneId: 'zone-1',
    order: 2,
    label: 'Vista 2 · Parque Mz P',
    caption: 'Zona 1 · Boulevard Peatonal & Parque Manzana P',
    anchor: { x: 21.2, y: 89.0 },
    target: { x: 23.2, y: 88.6 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-1/2.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-1/2.night.webp'),
  },
  {
    id: 'zone-1:vp-3',
    zoneId: 'zone-1',
    order: 3,
    label: 'Vista 3 · Esquina Mz Q',
    caption: 'Zona 1 · Avenida Central & Manzana Q',
    anchor: { x: 32.3, y: 14.6 },
    target: { x: 32.3, y: 22.2 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-1/3.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-1/3.night.webp'),
  },
  {
    id: 'zone-1:vp-4',
    zoneId: 'zone-1',
    order: 4,
    label: 'Vista 4 · Parque Mz R',
    caption: 'Zona 1 · Parque Recreativo Manzana R',
    anchor: { x: 63.8, y: 16.1 },
    target: { x: 63.8, y: 21.7 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-1/4.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-1/4.night.webp'),
  },
  // Zona 2
  {
    id: 'zone-2:vp-1',
    zoneId: 'zone-2',
    order: 1,
    label: 'Vista 1 · Manzana N',
    caption: 'Zona 2 · Paseo de Palmeras & Manzana N',
    anchor: { x: 10.7, y: 53.9 },
    target: { x: 9.0, y: 48.5 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-2/1.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-2/1.night.webp'),
  },
  {
    id: 'zone-2:vp-2',
    zoneId: 'zone-2',
    order: 2,
    label: 'Vista 2 · Manzana M',
    caption: 'Zona 2 · Cruce Residencial Manzana M',
    anchor: { x: 26.7, y: 61.9 },
    target: { x: 26.7, y: 54.0 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-2/2.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-2/2.night.webp'),
  },
  {
    id: 'zone-2:vp-3',
    zoneId: 'zone-2',
    order: 3,
    label: 'Vista 3 · Manzana K',
    caption: 'Zona 2 · Frente de Parques Manzana K',
    anchor: { x: 31.5, y: 87.1 },
    target: { x: 30.1, y: 83.1 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-2/3.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-2/3.night.webp'),
  },
  {
    id: 'zone-2:vp-4',
    zoneId: 'zone-2',
    order: 4,
    label: 'Vista 4 · Alameda K-L',
    caption: 'Zona 2 · Iluminación LED Nocturna Manzana K y L',
    anchor: { x: 34.4, y: 90.8 },
    target: { x: 36.8, y: 92.6 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-2/4.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-2/4.night.webp'),
  },
  // Zona 3
  {
    id: 'zone-3:vp-1',
    zoneId: 'zone-3',
    order: 1,
    label: 'Vista 1 · Club House',
    caption: 'Zona 3 · Ingreso al Club House Flamingo',
    anchor: { x: 7.9, y: 67.3 },
    target: { x: 11.0, y: 66.4 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-3/1.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-3/1.night.webp'),
  },
  {
    id: 'zone-3:vp-2',
    zoneId: 'zone-3',
    order: 2,
    label: 'Vista 2 · Piscina Resort',
    caption: 'Zona 3 · Terraza y Piscina Principal',
    anchor: { x: 18.1, y: 35.6 },
    target: { x: 21.8, y: 35.6 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-3/2.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-3/2.night.webp'),
  },
  {
    id: 'zone-3:vp-3',
    zoneId: 'zone-3',
    order: 3,
    label: 'Vista 3 · Explanada',
    caption: 'Zona 3 · Área Social y Canchas Deportivas',
    anchor: { x: 25.6, y: 65.3 },
    target: { x: 22.9, y: 65.4 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-3/3.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-3/3.night.webp'),
  },
  {
    id: 'zone-3:vp-4',
    zoneId: 'zone-3',
    order: 4,
    label: 'Vista 4 · Paseo Residencial',
    caption: 'Zona 3 · Alamedas Arboladas y Torres',
    anchor: { x: 48.7, y: 67.2 },
    target: { x: 46.0, y: 64.4 },
    imageDay: getAssetUrl('urbanization/viewpoints/zone-3/4.day.webp'),
    imageNight: getAssetUrl('urbanization/viewpoints/zone-3/4.night.webp'),
  },
];

export type PlanViewMode = 'furnished' | 'measured' | 'bare';

export const PLAN_VIEW_LABELS: Record<PlanViewMode, string> = {
  furnished: 'Amoblado',
  measured: 'Medidas',
  bare: 'Sin amoblar',
};

export interface RoomPanorama360 {
  id: 'sala' | 'cocina' | 'dormitorio';
  label: string;
  description: string;
  equirectangularUrl: string;
  backdropPhotoUrl: string;
  hotspots: {
    targetRoomId: 'sala' | 'cocina' | 'dormitorio';
    label: string;
    yaw: number;
    pitch: number;
  }[];
}

export interface HouseModelLevel {
  level: number;
  label: string;
  plans: Record<PlanViewMode, string>;
  transitions: Record<PlanViewMode, Partial<Record<PlanViewMode, string>>>;
}

export interface FlamingoHouseModel {
  id: 'casa-1' | 'casa-2' | 'casa-3' | 'casa-4';
  code: string;
  name: string;
  tagline: string;
  badge: string;
  minLotAreaSqm: number;
  builtAreaSqm: number;
  floorsCount: number;
  bedrooms: number;
  bathrooms: number;
  priceFromUsd: number;
  description: string;
  features: string[];
  exteriors: {
    frontal: string;
    diagonal: string;
    posterior: string;
  };
  lotOverlayImage: string;
  kuulaTourUrl: string;
  rooms360: RoomPanorama360[];
  levels: HouseModelLevel[];
  gallery: string[];
}

export const HOUSE_MODELS: FlamingoHouseModel[] = [
  {
    id: 'casa-1',
    code: 'MÓDULO CORAL · CASA 01',
    name: 'Modelo Coral',
    tagline: 'Dos pisos · 85.40 m² techados · Diseño Bioclimático',
    badge: 'Más Solicitado',
    minLotAreaSqm: 64,
    builtAreaSqm: 85.4,
    floorsCount: 2,
    bedrooms: 3,
    bathrooms: 3,
    priceFromUsd: 46500,
    description:
      'Residencia contemporánea de 2 niveles con doble altura visual, ventilación cruzada costera, cocina abierta con barra de cuarzo y jardín interior privado.',
    features: [
      'Sala-comedor integrada con mamparas de piso a techo',
      'Cocina estilo americano con isla desayunadora',
      'Dormitorio principal con walk-in closet y baño privado',
      'Terraza posterior con proyección para pérgola y BBQ',
      'Cochera frontal pergolada y jardín tropical',
    ],
    exteriors: {
      frontal: getAssetUrl('urbanization/lots/modules/module-1/gallery/1.webp'),
      diagonal: getAssetUrl('urbanization/lots/modules/module-1/gallery/2.webp'),
      posterior: getAssetUrl('urbanization/lots/modules/module-1/gallery/3.webp'),
    },
    lotOverlayImage: getAssetUrl('urbanization/lots/modules/module-1/right.webp'),
    kuulaTourUrl:
      'https://kuula.co/share/collection/7TRqJ?logo=-1&card=1&info=0&fs=1&vr=1&zoom=1&sd=1&initload=0&thumbs=3&inst=es',
    rooms360: [
      {
        id: 'sala',
        label: 'Sala - Comedor Principal',
        description: 'Iluminación natural cenital, pisos de porcelanato formato 120x60 y vista al jardín.',
        equirectangularUrl: '/models/casa-1/panorama/sala-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/4.webp'),
        hotspots: [
          { targetRoomId: 'cocina', label: 'Ir a Cocina Gourmet', yaw: 35, pitch: -4 },
          { targetRoomId: 'dormitorio', label: 'Subir a Dormitorio Principal', yaw: -45, pitch: 8 },
        ],
      },
      {
        id: 'cocina',
        label: 'Cocina Gourmet & Isla',
        description: 'Tableros de piedra sinterizada, reposteros altos y bajos con cierre lento.',
        equirectangularUrl: '/models/casa-1/panorama/cocina-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/5.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Volver a Sala - Comedor', yaw: -30, pitch: -2 },
          { targetRoomId: 'dormitorio', label: 'Ir a Dormitorio Principal', yaw: 50, pitch: 10 },
        ],
      },
      {
        id: 'dormitorio',
        label: 'Dormitorio Principal Suite',
        description: 'Suite en segundo nivel con balcón hacia la alameda y baño incorporado.',
        equirectangularUrl: '/models/casa-1/panorama/dormitorio-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/6.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Bajar a Sala - Comedor', yaw: 15, pitch: -12 },
          { targetRoomId: 'cocina', label: 'Ir a Cocina Gourmet', yaw: -40, pitch: -8 },
        ],
      },
    ],
    levels: [
      {
        level: 1,
        label: 'Piso 1',
        plans: {
          furnished: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-amoblado.webp'),
          measured: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-medidas.webp'),
          bare: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-sin-amoblar.webp'),
        },
        transitions: {
          furnished: {
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-amoblado_to_medidas.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-amoblado_to_sin-amoblar.mp4'),
          },
          measured: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-medidas_to_amoblado.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-medidas_to_sin-amoblar.mp4'),
          },
          bare: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-sin-amoblar_to_amoblado.mp4'),
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-sin-amoblar_to_medidas.mp4'),
          },
        },
      },
      {
        level: 2,
        label: 'Piso 2',
        plans: {
          furnished: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-amoblado.webp'),
          measured: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-medidas.webp'),
          bare: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-sin-amoblar.webp'),
        },
        transitions: {
          furnished: {
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-amoblado_to_medidas.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-amoblado_to_sin-amoblar.mp4'),
          },
          measured: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-medidas_to_amoblado.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-medidas_to_sin-amoblar.mp4'),
          },
          bare: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-sin-amoblar_to_amoblado.mp4'),
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-sin-amoblar_to_medidas.mp4'),
          },
        },
      },
    ],
    gallery: Array.from({ length: 8 }, (_, i) =>
      getAssetUrl(`urbanization/lots/modules/module-1/gallery/${i + 1}.webp`)
    ),
  },
  {
    id: 'casa-2',
    code: 'MÓDULO BRISA · CASA 02',
    name: 'Modelo Brisa',
    tagline: 'Dos pisos + Rooftop · 108.00 m² techados · Familiar',
    badge: 'Terraza Social',
    minLotAreaSqm: 68,
    builtAreaSqm: 108.0,
    floorsCount: 2,
    bedrooms: 3,
    bathrooms: 3,
    priceFromUsd: 54900,
    description:
      'Diseñada para familias que disfrutan recibir invitados: fachada en voladizo con celosías de madera tratada, sala de estar en segundo piso y terraza social.',
    features: [
      'Fachada con quiebravistas arquitectónicos y balcón corrido',
      '3 dormitorios amplios + Family Room en segundo nivel',
      'Cocina con comedor de diario y lavandería independiente',
      'Jardín posterior con zona de parrilla de acero inoxidable',
      'Pre-instalación de aire acondicionado Split en todos los ambientes',
    ],
    exteriors: {
      frontal: getAssetUrl('urbanization/lots/modules/module-1/gallery/2.webp'),
      diagonal: getAssetUrl('urbanization/lots/modules/module-1/gallery/7.webp'),
      posterior: getAssetUrl('urbanization/lots/modules/module-1/gallery/8.webp'),
    },
    lotOverlayImage: getAssetUrl('urbanization/lots/modules/module-1/left.webp'),
    kuulaTourUrl:
      'https://kuula.co/share/collection/7Tgw3?logo=-1&card=1&info=0&fs=1&vr=1&zoom=1&sd=1&initload=0&thumbs=3&inst=es',
    rooms360: [
      {
        id: 'sala',
        label: 'Sala Principal Doble Mampara',
        description: 'Espacio social conectado directamente con la terraza cubierta.',
        equirectangularUrl: '/models/casa-2/panorama/sala-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/7.webp'),
        hotspots: [
          { targetRoomId: 'cocina', label: 'Pasar a Cocina & Comedor', yaw: 40, pitch: -3 },
          { targetRoomId: 'dormitorio', label: 'Subir a Master Suite', yaw: -35, pitch: 9 },
        ],
      },
      {
        id: 'cocina',
        label: 'Cocina Integrada Brisa',
        description: 'Diseño ergonómico con ventilación natural hacia el patio interno.',
        equirectangularUrl: '/models/casa-2/panorama/cocina-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/5.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Volver a Sala Principal', yaw: -25, pitch: -2 },
          { targetRoomId: 'dormitorio', label: 'Ir a Master Suite', yaw: 45, pitch: 8 },
        ],
      },
      {
        id: 'dormitorio',
        label: 'Master Suite con Balcón',
        description: 'Vista despejada hacia los parques interiores de la urbanización.',
        equirectangularUrl: '/models/casa-2/panorama/dormitorio-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/6.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Bajar a Sala Principal', yaw: 18, pitch: -10 },
          { targetRoomId: 'cocina', label: 'Ir a Cocina', yaw: -35, pitch: -6 },
        ],
      },
    ],
    levels: [
      {
        level: 1,
        label: 'Piso 1',
        plans: {
          furnished: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-amoblado.webp'),
          measured: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-medidas.webp'),
          bare: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-sin-amoblar.webp'),
        },
        transitions: {
          furnished: {
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-amoblado_to_medidas.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-amoblado_to_sin-amoblar.mp4'),
          },
          measured: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-medidas_to_amoblado.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-medidas_to_sin-amoblar.mp4'),
          },
          bare: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-sin-amoblar_to_amoblado.mp4'),
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-sin-amoblar_to_medidas.mp4'),
          },
        },
      },
      {
        level: 2,
        label: 'Piso 2',
        plans: {
          furnished: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-amoblado.webp'),
          measured: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-medidas.webp'),
          bare: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-sin-amoblar.webp'),
        },
        transitions: {
          furnished: {
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-amoblado_to_medidas.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-amoblado_to_sin-amoblar.mp4'),
          },
          measured: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-medidas_to_amoblado.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-medidas_to_sin-amoblar.mp4'),
          },
          bare: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-sin-amoblar_to_amoblado.mp4'),
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-sin-amoblar_to_medidas.mp4'),
          },
        },
      },
    ],
    gallery: Array.from({ length: 8 }, (_, i) =>
      getAssetUrl(`urbanization/lots/modules/module-1/gallery/${((i + 2) % 8) + 1}.webp`)
    ),
  },
  {
    id: 'casa-3',
    code: 'MÓDULO ARENA · CASA 03',
    name: 'Modelo Arena',
    tagline: 'Un piso expandible · 62.50 m² techados · Smart Home',
    badge: 'Ideal Inversión',
    minLotAreaSqm: 60,
    builtAreaSqm: 62.5,
    floorsCount: 1,
    bedrooms: 2,
    bathrooms: 2,
    priceFromUsd: 34900,
    description:
      'Vivienda de un nivel con bases estructurales listas para construir un segundo y tercer piso a futuro. Perfecta como primera vivienda o renta vacacional.',
    features: [
      'Distribución sin pasillos perdidos (100% eficiencia de área)',
      'Bases antisísmicas proyectadas para futura ampliación a 2 pisos',
      '2 dormitorios con iluminación natural y closets empotrados',
      'Patio interior amplio con jardín y lavandería ventilada',
      'Entrega llave en mano con acabados cerámicos importados',
    ],
    exteriors: {
      frontal: getAssetUrl('urbanization/lots/modules/module-2/gallery/1.webp'),
      diagonal: getAssetUrl('urbanization/lots/modules/module-2/gallery/2.webp'),
      posterior: getAssetUrl('urbanization/lots/modules/module-2/gallery/3.webp'),
    },
    lotOverlayImage: getAssetUrl('urbanization/lots/modules/module-2/right.webp'),
    kuulaTourUrl:
      'https://kuula.co/share/collection/7TRqJ?logo=-1&card=1&info=0&fs=1&vr=1&zoom=1&sd=1&initload=0&thumbs=3&inst=es',
    rooms360: [
      {
        id: 'sala',
        label: 'Sala - Comedor Integrada',
        description: 'Concepto abierto con salida directa a la terraza interior.',
        equirectangularUrl: '/models/casa-3/panorama/sala-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-2/gallery/4.webp'),
        hotspots: [
          { targetRoomId: 'cocina', label: 'Ver Cocina Americana', yaw: 32, pitch: -4 },
          { targetRoomId: 'dormitorio', label: 'Ver Dormitorio Principal', yaw: -38, pitch: -2 },
        ],
      },
      {
        id: 'cocina',
        label: 'Cocina Americana Arena',
        description: 'Barra funcional integrada al comedor y muebles altos minimalistas.',
        equirectangularUrl: '/models/casa-3/panorama/cocina-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-2/gallery/5.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Volver a Sala', yaw: -30, pitch: -3 },
          { targetRoomId: 'dormitorio', label: 'Ir a Dormitorio', yaw: 42, pitch: 0 },
        ],
      },
      {
        id: 'dormitorio',
        label: 'Dormitorio Principal con Vista a Jardín',
        description: 'Confort térmico y acústico con ventanal hacia el jardín posterior.',
        equirectangularUrl: '/models/casa-3/panorama/dormitorio-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-2/gallery/6.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Ir a Sala - Comedor', yaw: 20, pitch: -3 },
          { targetRoomId: 'cocina', label: 'Ir a Cocina', yaw: -35, pitch: -3 },
        ],
      },
    ],
    levels: [
      {
        level: 1,
        label: 'Piso 1',
        plans: {
          furnished: getAssetUrl('urbanization/lots/modules/module-2/plans/piso-1-amoblado.webp'),
          measured: getAssetUrl('urbanization/lots/modules/module-2/plans/piso-1-medidas.webp'),
          bare: getAssetUrl('urbanization/lots/modules/module-2/plans/piso-1-sin-amoblar.webp'),
        },
        transitions: {
          furnished: {
            measured: getAssetUrl('urbanization/lots/modules/module-2/transitions/piso-1-amoblado_to_medidas.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-2/transitions/piso-1-amoblado_to_sin-amoblar.mp4'),
          },
          measured: {
            furnished: getAssetUrl('urbanization/lots/modules/module-2/transitions/piso-1-medidas_to_amoblado.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-2/transitions/piso-1-medidas_to_sin-amoblar.mp4'),
          },
          bare: {
            furnished: getAssetUrl('urbanization/lots/modules/module-2/transitions/piso-1-sin-amoblar_to_amoblado.mp4'),
            measured: getAssetUrl('urbanization/lots/modules/module-2/transitions/piso-1-sin-amoblar_to_medidas.mp4'),
          },
        },
      },
    ],
    gallery: Array.from({ length: 7 }, (_, i) =>
      getAssetUrl(`urbanization/lots/modules/module-2/gallery/${i + 1}.webp`)
    ),
  },
  {
    id: 'casa-4',
    code: 'VILLA FLAMINGO IMPERIAL · CASA 04',
    name: 'Modelo Flamingo Imperial',
    tagline: 'Dos pisos + Lounge · 142.00 m² techados · Lotes en Esquina / +80 m²',
    badge: 'Edición Signature',
    minLotAreaSqm: 78,
    builtAreaSqm: 142.0,
    floorsCount: 2,
    bedrooms: 4,
    bathrooms: 4,
    priceFromUsd: 68900,
    description:
      'Nuestra residencia insignia para lotes esquinados o de gran metraje. Incluye 4 dormitorios, estudio en primer nivel, terraza con piscina jacuzzi y acabados de lujo.',
    features: [
      'Doble fachada arquitectónica ideal para lotes en esquina',
      '4 dormitorios (1 en primer piso / estudio + 3 en segundo nivel)',
      'Terraza lounge con espejo de agua / jacuzzi climatizado',
      'Cocina isla central con equipamiento empotrado y despensa',
      'Domótica inteligente de iluminación y cerradura biométrica',
    ],
    exteriors: {
      frontal: getAssetUrl('urbanization/lots/modules/module-1/gallery/3.webp'),
      diagonal: getAssetUrl('urbanization/lots/modules/module-1/gallery/1.webp'),
      posterior: getAssetUrl('urbanization/lots/modules/module-2/gallery/7.webp'),
    },
    lotOverlayImage: getAssetUrl('urbanization/lots/modules/module-1/down.webp'),
    kuulaTourUrl:
      'https://kuula.co/share/collection/7Tgw3?logo=-1&card=1&info=0&fs=1&vr=1&zoom=1&sd=1&initload=0&thumbs=3&inst=es',
    rooms360: [
      {
        id: 'sala',
        label: 'Gran Salón Imperial & Terraza',
        description: 'Ventanales panorámicos corredizos que integran el salón con el deck exterior.',
        equirectangularUrl: '/models/casa-4/panorama/sala-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/8.webp'),
        hotspots: [
          { targetRoomId: 'cocina', label: 'Explorar Cocina con Isla', yaw: 38, pitch: -4 },
          { targetRoomId: 'dormitorio', label: 'Subir a Suite Imperial', yaw: -42, pitch: 10 },
        ],
      },
      {
        id: 'cocina',
        label: 'Cocina Signature con Isla Central',
        description: 'Acabados en cuarzo calacatta, iluminación LED indirecta y cava.',
        equirectangularUrl: '/models/casa-4/panorama/cocina-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/4.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Volver al Gran Salón', yaw: -32, pitch: -2 },
          { targetRoomId: 'dormitorio', label: 'Ir a Suite Imperial', yaw: 48, pitch: 8 },
        ],
      },
      {
        id: 'dormitorio',
        label: 'Suite Principal Imperial',
        description: 'Dormitorio principal con terraza privada, walk-in closet doble y baño spa.',
        equirectangularUrl: '/models/casa-4/panorama/dormitorio-360.webp',
        backdropPhotoUrl: getAssetUrl('urbanization/lots/modules/module-1/gallery/6.webp'),
        hotspots: [
          { targetRoomId: 'sala', label: 'Bajar al Gran Salón', yaw: 20, pitch: -10 },
          { targetRoomId: 'cocina', label: 'Ir a Cocina Signature', yaw: -38, pitch: -6 },
        ],
      },
    ],
    levels: [
      {
        level: 1,
        label: 'Piso 1',
        plans: {
          furnished: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-amoblado.webp'),
          measured: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-medidas.webp'),
          bare: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-1-sin-amoblar.webp'),
        },
        transitions: {
          furnished: {
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-amoblado_to_medidas.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-amoblado_to_sin-amoblar.mp4'),
          },
          measured: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-medidas_to_amoblado.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-medidas_to_sin-amoblar.mp4'),
          },
          bare: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-sin-amoblar_to_amoblado.mp4'),
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-1-sin-amoblar_to_medidas.mp4'),
          },
        },
      },
      {
        level: 2,
        label: 'Piso 2',
        plans: {
          furnished: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-amoblado.webp'),
          measured: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-medidas.webp'),
          bare: getAssetUrl('urbanization/lots/modules/module-1/plans/piso-2-sin-amoblar.webp'),
        },
        transitions: {
          furnished: {
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-amoblado_to_medidas.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-amoblado_to_sin-amoblar.mp4'),
          },
          measured: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-medidas_to_amoblado.mp4'),
            bare: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-medidas_to_sin-amoblar.mp4'),
          },
          bare: {
            furnished: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-sin-amoblar_to_amoblado.mp4'),
            measured: getAssetUrl('urbanization/lots/modules/module-1/transitions/piso-2-sin-amoblar_to_medidas.mp4'),
          },
        },
      },
    ],
    gallery: [
      ...Array.from({ length: 4 }, (_, i) =>
        getAssetUrl(`urbanization/lots/modules/module-1/gallery/${i + 1}.webp`)
      ),
      ...Array.from({ length: 4 }, (_, i) =>
        getAssetUrl(`urbanization/lots/modules/module-2/gallery/${i + 1}.webp`)
      ),
    ],
  },
];

export interface LocationMilestone {
  id: string;
  title: string;
  subtitle: string;
  distanceTime: string;
  coords: [number, number];
  xPercent: number;
  yPercent: number;
  poster: string;
  previewVideo: string;
  fullVideo: string;
}

export const LOCATION_MILESTONES: LocationMilestone[] = [
  {
    id: 'aeropuerto',
    title: 'Aeropuerto Capitán FAP Pedro Canga',
    subtitle: 'Conexión aérea directa con Lima a 10 minutos',
    distanceTime: '10 min',
    coords: [-80.3814, -3.5525],
    xPercent: 72,
    yPercent: 28,
    poster: getAssetUrl('location/videos/hitos/aeropuerto/poster.webp'),
    previewVideo: getAssetUrl('location/videos/hitos/aeropuerto/preview.mp4'),
    fullVideo: getAssetUrl('location/videos/hitos/aeropuerto/full.mp4'),
  },
  {
    id: 'zorritos',
    title: 'Playas de Zorritos & Punta Sal',
    subtitle: 'Balnearios de aguas cálidas todo el año',
    distanceTime: '18 min',
    coords: [-80.6782, -3.6805],
    xPercent: 24,
    yPercent: 66,
    poster: getAssetUrl('location/videos/hitos/zorritos/poster.webp'),
    previewVideo: getAssetUrl('location/videos/hitos/zorritos/preview.mp4'),
    fullVideo: getAssetUrl('location/videos/hitos/zorritos/full.mp4'),
  },
  {
    id: 'costa-mar-plaza',
    title: 'Centro Comercial Costa Mar Plaza',
    subtitle: 'Supermercados, bancos, cine y gastronomía',
    distanceTime: '6 min',
    coords: [-80.4515, -3.5689],
    xPercent: 48,
    yPercent: 52,
    poster: getAssetUrl('location/videos/hitos/costa-mar-plaza/poster.webp'),
    previewVideo: getAssetUrl('location/videos/hitos/costa-mar-plaza/preview.mp4'),
    fullVideo: getAssetUrl('location/videos/hitos/costa-mar-plaza/full.mp4'),
  },
  {
    id: 'plaza-de-armas',
    title: 'Plaza de Armas & Centro Financiero',
    subtitle: 'Corazón institucional y comercial de la ciudad',
    distanceTime: '7 min',
    coords: [-80.4592, -3.5708],
    xPercent: 55,
    yPercent: 58,
    poster: getAssetUrl('location/videos/hitos/plaza-de-armas/poster.webp'),
    previewVideo: getAssetUrl('location/videos/hitos/plaza-de-armas/preview.mp4'),
    fullVideo: getAssetUrl('location/videos/hitos/plaza-de-armas/full.mp4'),
  },
  {
    id: 'zoocriadero',
    title: 'Reserva Ecológica & Turismo Costero',
    subtitle: 'Naturaleza protegida y circuito ecoturístico',
    distanceTime: '12 min',
    coords: [-80.421, -3.541],
    xPercent: 64,
    yPercent: 38,
    poster: getAssetUrl('location/videos/hitos/zoocriadero/poster.webp'),
    previewVideo: getAssetUrl('location/videos/hitos/zoocriadero/preview.mp4'),
    fullVideo: getAssetUrl('location/videos/hitos/zoocriadero/full.mp4'),
  },
];

export const AMENITIES_ZONES = [
  {
    id: 'club-house',
    title: 'Club House Flamingo & Piscina Resort',
    subtitle: 'Zona 3 · Piscina semi-olímpica, solárium, salón de eventos y terraza lounge',
    images: Array.from({ length: 7 }, (_, i) =>
      getAssetUrl(`urbanization/amenities/phase-1/club-house/${i + 1}.webp`)
    ),
  },
  {
    id: 'parque-mz-p',
    title: 'Parque Central Manzana P',
    subtitle: 'Zona 1 · Juegos infantiles, pérgolas de lectura y senderos ecológicos',
    images: Array.from({ length: 5 }, (_, i) =>
      getAssetUrl(`urbanization/amenities/phase-1/parque-mz-p/${i + 1}.webp`)
    ),
  },
  {
    id: 'parque-mz-r',
    title: 'Parque Deportivo & Social Manzana R',
    subtitle: 'Zona 1 · Gimnasio biosaludable al aire libre, zona BBQ y alameda',
    images: Array.from({ length: 5 }, (_, i) =>
      getAssetUrl(`urbanization/amenities/phase-1/parque-mz-r/${i + 1}.webp`)
    ),
  },
];

export const WHATSAPP_NUMBER = '51999888777';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
