/**
 * Plano raster oficial del usuario: 1034 × 1272 px. Los polígonos públicos de
 * AltoPlanta se registran sobre el plano mediante una homografía de sus cuatro
 * esquinas exteriores. Los nombres se corresponden con el plano A–H.
 * Precisión visual estimada 3–5 px; no es un levantamiento catastral.
 * Los metrajes son los impresos legibles, no los calculados por el mapa web.
 * H08 es recreación pública y se excluye de los 68 lotes residenciales.
 */
import geo from './flamingo-geo.json';

export const PLAN_WIDTH = 1034;
export const PLAN_HEIGHT = 1272;

export interface OfficialPlanLot {
  id: string;
  number: string;
  areaSqm?: number;
  path?: string;
}

export interface OfficialPlanBlock {
  id: string;
  letter: string;
  path: string;
  labelX: number;
  labelY: number;
  lots: OfficialPlanLot[];
}

// API bounds, in order, map to (-13,904), (533,0), (1034,354), (491,1260).
// E05's left corner is clipped in the source raster; preserving x=-13 makes
// the SVG viewBox clip that polygon exactly as it clips the image underneath.
const MATRIX = [
  0.6320809415308313, -0.0011965427632322564, 551.6712483361883,
  -0.004070548935231639, -0.6347904529504503, 545.061243687445,
  0.00000113898536543369, 0.0000014352491342220647, 1,
];

function polygonPath(ring: number[][]): string {
  return ring.map(([lng, lat], index) => {
    const u = (lng + 76.3575799) * 1e6;
    const v = (lat + 6.5047877) * 1e6;
    const w = MATRIX[6] * u + MATRIX[7] * v + MATRIX[8];
    const x = (MATRIX[0] * u + MATRIX[1] * v + MATRIX[2]) / w;
    const y = (MATRIX[3] * u + MATRIX[4] * v + MATRIX[5]) / w;
    return `${index ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

const LABELS: Record<string, [number, number]> = {
  A: [795, 227], B: [839, 632], C: [567, 938], D: [381, 1115],
  E: [155, 952], F: [286, 741], G: [358, 345], H: [566, 487],
};

// Empty values intentionally remain unknown until a legible/vector PDF is
// supplied. Do not fill them with the differing GIS-calculated source areas.
const PRINTED_AREAS: Record<string, Array<number | undefined>> = {
  A: [230.77, 200, 160, 200, 200, 200, 200, 200, 160, 200, 200],
  B: [200, 195.20, 160, 160, 160, 160, 160, 160],
  C: [160, 160, 200, 200, 160, 160, 160, 160, 160, 160, 160],
  D: [160, 160, 200, 200, 200],
  E: [200, 200, 200, 160, 165.62],
  F: [160, 160, 160, 160, 160, 160, 160, 204.40, 203.73, 160, 160],
  G: [199.60, 194.90, 159.93, 160.03, 160.14, 160.25, 160.35, 160.46],
  H: [160, 160, 200.80, 160, 160, undefined, undefined, undefined, undefined, undefined],
};

export const OFFICIAL_BLOCKS: OfficialPlanBlock[] = geo.blocks.map((block) => ({
  id: block.id,
  letter: block.letter,
  path: polygonPath(block.geometry.coordinates[0]),
  labelX: LABELS[block.letter][0],
  labelY: LABELS[block.letter][1],
  lots: geo.lots.filter((lot) => lot.blockId === block.id).map((lot) => {
    const areaSqm = PRINTED_AREAS[block.letter][Number(lot.number) - 1];
    return {
      id: lot.id,
      number: lot.number,
      ...(areaSqm === undefined ? {} : { areaSqm }),
      path: polygonPath(lot.geometry.coordinates[0]),
    };
  }),
}));

export const PUBLIC_RECREATION = {
  id: 'H-08',
  label: 'Recreación pública',
  areaSqm: 1134.66,
  path: polygonPath(geo.recreation[0].geometry.coordinates[0]),
  labelX: 524,
  labelY: 582,
};

export const OFFICIAL_LOT_COUNT = OFFICIAL_BLOCKS.reduce(
  (count, block) => count + block.lots.length,
  0,
);
