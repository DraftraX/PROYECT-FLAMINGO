import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Trash2,
} from 'lucide-react';
import {
  type FlamingoLot,
  getAssetUrl,
  INITIAL_LOTS,
  type LotStatus,
  STATUS_LABELS,
} from '../data/flamingoData';

interface CalibratorOverlayProps {
  lots: FlamingoLot[];
  onUpdateLots: (newLots: FlamingoLot[]) => void;
  onClose: () => void;
}

export const CalibratorOverlay: React.FC<CalibratorOverlayProps> = ({
  lots,
  onUpdateLots,
  onClose,
}) => {
  const [selectedLotId, setSelectedLotId] = useState<string | null>(lots[0]?.id || null);
  const [bgSource, setBgSource] = useState<'zone1' | 'zone2' | 'side0' | 'perspective' | 'canny'>(
    'zone1'
  );
  const [draggingVertexIdx, setDraggingVertexIdx] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const selectedLot = lots.find((l) => l.id === selectedLotId) || null;

  const bgImageUrl = {
    zone1: getAssetUrl('urbanization/phases/phase-1/zone-1.webp'),
    zone2: getAssetUrl('urbanization/phases/phase-1/zone-2.webp'),
    side0: getAssetUrl('urbanization/sides/side-0/day.webp'),
    perspective: '/urbanization/sides/side-0/blueprint-perspective.png',
    canny: '/urbanization/sides/side-0/canny-edges.png',
  }[bgSource];

  const rebuildLotPaths = (vertices1920: { x: number; y: number }[]) => {
    const path1920 =
      vertices1920
        .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
        .join(' ') + ' Z';
    const path100 =
      vertices1920
        .map(
          (pt, i) =>
            `${i === 0 ? 'M' : 'L'} ${(pt.x / 19.2).toFixed(1)} ${(pt.y / 10.8).toFixed(1)}`
        )
        .join(' ') + ' Z';
    const avgX1920 =
      vertices1920.reduce((acc, v) => acc + v.x, 0) / Math.max(1, vertices1920.length);
    const avgY1080 =
      vertices1920.reduce((acc, v) => acc + v.y, 0) / Math.max(1, vertices1920.length);
    return {
      path1920,
      path: path100,
      x1920: Number(avgX1920.toFixed(1)),
      y1080: Number(avgY1080.toFixed(1)),
      x: Number((avgX1920 / 19.2).toFixed(1)),
      y: Number((avgY1080 / 10.8).toFixed(1)),
    };
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingVertexIdx === null || !selectedLot || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x1920 = Math.max(0, Math.min(1920, ((e.clientX - rect.left) / rect.width) * 1920));
    const y1080 = Math.max(0, Math.min(1080, ((e.clientY - rect.top) / rect.height) * 1080));

    const updatedVertices = selectedLot.vertices1920.map((v, idx) =>
      idx === draggingVertexIdx ? { x: Number(x1920.toFixed(1)), y: Number(y1080.toFixed(1)) } : v
    );
    const paths = rebuildLotPaths(updatedVertices);

    const updatedLots = lots.map((l) =>
      l.id === selectedLot.id
        ? { ...l, vertices1920: updatedVertices, ...paths }
        : l
    );
    onUpdateLots(updatedLots);
  };

  const handleAddNewLot = () => {
    const nextNum = lots.length + 1;
    const defaultVerts = [
      { x: 880, y: 460 },
      { x: 960, y: 460 },
      { x: 960, y: 540 },
      { x: 880, y: 540 },
    ];
    const paths = rebuildLotPaths(defaultVerts);
    const newLot: FlamingoLot = {
      id: `mz-f:lot-${nextNum}`,
      blockId: 'mz-o',
      blockLetter: 'F',
      lotNumber: nextNum,
      identifier: `Lote ${nextNum}`,
      fullTitle: `Manzana F · Lote ${nextNum}`,
      zoneId: 'zone-1',
      status: 'available',
      position: 'middle',
      areaSqm: 72,
      priceUsd: 24500,
      pricePen: 91875,
      vertices1920: defaultVerts,
      compatibleModels: ['casa-1', 'casa-2', 'casa-3'],
      ...paths,
    };
    const nextLots = [...lots, newLot];
    onUpdateLots(nextLots);
    setSelectedLotId(newLot.id);
  };

  const handleSaveLocal = () => {
    localStorage.setItem('flamingo_calibrated_lots', JSON.stringify(lots));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2200);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(lots, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lots.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    localStorage.removeItem('flamingo_calibrated_lots');
    onUpdateLots(INITIAL_LOTS);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-neutral-950 flex overflow-hidden select-none">
      {/* Lienzo 1920x1080 con SVG Editable */}
      <div className="relative flex-1 h-full overflow-hidden bg-black flex items-center justify-center">
        <div className="relative w-full h-full">
          <img
            src={bgImageUrl}
            alt="Fondo de calibración"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />

          <svg
            ref={svgRef}
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
            onPointerMove={handleSvgPointerMove}
            onPointerUp={() => setDraggingVertexIdx(null)}
            className="absolute inset-0 w-full h-full z-10"
          >
            {lots.map((lot) => {
              const isSelected = lot.id === selectedLotId;
              const fillClass =
                lot.status === 'available'
                  ? 'fill-emerald-500/35 stroke-emerald-300'
                  : lot.status === 'reserved'
                  ? 'fill-amber-500/40 stroke-amber-300'
                  : 'fill-rose-500/40 stroke-rose-300';

              return (
                <g key={lot.id}>
                  <path
                    d={lot.path1920}
                    onClick={() => setSelectedLotId(lot.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'fill-brand-orange/55 stroke-white stroke-[3]'
                        : `${fillClass} stroke-[1.5] hover:fill-brand-primary/50`
                    }`}
                  />
                  {isSelected &&
                    lot.vertices1920.map((v, idx) => (
                      <circle
                        key={idx}
                        cx={v.x}
                        cy={v.y}
                        r={9}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setDraggingVertexIdx(idx);
                        }}
                        className="fill-brand-orange stroke-white stroke-[2.5] cursor-grab active:cursor-grabbing"
                      />
                    ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Barra Superior de Capas de Calibración (Render vs Homografía 40° vs Bordes Canny) */}
        <div className="absolute top-5 left-6 z-20 flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-neutral-950/90 backdrop-blur-xl border border-white/15 shadow-2xl">
          {(
            [
              { id: 'zone1', label: 'Render Zona 1' },
              { id: 'zone2', label: 'Render Zona 2' },
              { id: 'side0', label: 'Masterplan Día (side-0)' },
              { id: 'perspective', label: 'Homografía OpenCV 40°' },
              { id: 'canny', label: 'Bordes Canny (1920x1080)' },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBgSource(b.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bgSource === b.id
                  ? 'bg-brand-orange text-white shadow'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Lateral del Editor de Calibración */}
      <aside className="w-[380px] shrink-0 bg-neutral-900 border-l border-white/15 flex flex-col z-20">
        <header className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange flex items-center gap-1.5">
              <Sliders size={12} /> Calibrador en Vivo (`?calibrator=true`)
            </span>
            <h2 className="text-base font-primary font-bold text-white uppercase tracking-wider mt-0.5">
              Editor de Polígonos SVG
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/75 leading-relaxed">
            Haz clic sobre cualquier lote y <strong>arrastra los círculos naranjas</strong> para
            ajustar sus vértices en <code>viewBox="0 0 1920 1080"</code>.
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddNewLot}
              className="flex-1 py-2.5 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Nuevo Polígono
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Restaurar lotes originales"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {selectedLot && (
            <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{selectedLot.fullTitle}</h3>
                <span className="text-[11px] text-brand-light-orange font-mono">
                  {selectedLot.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase text-white/45 mb-1">
                    Estado
                  </label>
                  <select
                    value={selectedLot.status}
                    onChange={(e) => {
                      const status = e.target.value as LotStatus;
                      onUpdateLots(
                        lots.map((l) => (l.id === selectedLot.id ? { ...l, status } : l))
                      );
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-neutral-800 border border-white/15 text-white"
                  >
                    <option value="available">Disponible (Verde)</option>
                    <option value="reserved">Reservado (Ámbar)</option>
                    <option value="sold">Vendido (Rojo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-white/45 mb-1">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedLot.areaSqm}
                    onChange={(e) => {
                      const areaSqm = Number(e.target.value);
                      onUpdateLots(
                        lots.map((l) => (l.id === selectedLot.id ? { ...l, areaSqm } : l))
                      );
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-neutral-800 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-white/45 mb-1">
                  Path SVG Normalizado (1920x1080)
                </label>
                <textarea
                  readOnly
                  rows={2}
                  value={selectedLot.path1920}
                  className="w-full p-2 rounded-lg bg-neutral-950 border border-white/10 text-[11px] font-mono text-emerald-400"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-2 bg-neutral-950">
          <button
            type="button"
            onClick={handleSaveLocal}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {copiedToast ? <Check size={16} /> : <Save size={16} />}
            <span>
              {copiedToast ? '¡Guardado en el Navegador!' : 'Guardar Calibración en Vivo'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={15} />
            <span>Exportar `./src/data/lots.json`</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
