// Texturas procedurales para el recorrido 3D. Se generan en un <canvas> (sin descargas extra)
// y se aplican en proyección triplanar en coordenadas de mundo, porque los modelos exportados
// desde Blender no traen coordenadas UV.
import type * as T from 'three';

type Three = typeof import('three');

const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function canvas(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!] as const;
}

/** Ruido suave: varias capas de puntos aleatorios escaladas con suavizado. */
function noise(ctx: CanvasRenderingContext2D, size: number, base: string, tones: string[], seed = 1, alpha = 0.18) {
  const r = rnd(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  for (const cell of [64, 24, 8, 3]) {
    const [t, tc] = canvas(Math.ceil(size / cell));
    for (let y = 0; y < t.height; y++) for (let x = 0; x < t.width; x++) {
      tc.fillStyle = tones[Math.floor(r() * tones.length)]; tc.globalAlpha = r(); tc.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = cell > 3;
    // dibujar en mosaico para que la textura repita sin costuras
    for (const dx of [-size, 0]) for (const dy of [-size, 0]) ctx.drawImage(t, dx + size / 2, dy + size / 2, size, size);
    ctx.drawImage(t, 0, 0, size, size);
  }
  ctx.globalAlpha = 1;
}

function bricks(ctx: CanvasRenderingContext2D, size: number, rows: number, minW: number, maxW: number, colors: string[], mortar: string, gap: number, seed: number) {
  const r = rnd(seed); const h = size / rows;
  ctx.fillStyle = mortar; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < rows; i++) {
    let x = -r() * maxW;
    while (x < size) {
      const w = minW + r() * (maxW - minW);
      ctx.fillStyle = colors[Math.floor(r() * colors.length)];
      ctx.fillRect(x + gap, i * h + gap, w - gap * 2, h - gap * 2);
      if (x + w > size) ctx.fillRect(x - size + gap, i * h + gap, w - gap * 2, h - gap * 2);
      x += w;
    }
  }
}

function make(THREE: Three, draw: (ctx: CanvasRenderingContext2D, s: number) => void, size = 512) {
  const [c, ctx] = canvas(size); draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function crearTexturas(THREE: Three) {
  return {
    pasto: make(THREE, (c, s) => noise(c, s, '#5d7c32', ['#4a6726', '#6f8f3c', '#7d9a44', '#3f5a20'], 3, 0.32)),
    asfalto: make(THREE, (c, s) => { noise(c, s, '#3a3939', ['#2c2b2b', '#4a4949', '#555353'], 5, 0.3); }),
    vereda: make(THREE, (c, s) => {
      noise(c, s, '#c9c5be', ['#bdb9b2', '#d6d2cb', '#b2aea6'], 7, 0.22);
      c.strokeStyle = 'rgba(120,112,104,.45)'; c.lineWidth = 3;
      for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(0, i * s / 4); c.lineTo(s, i * s / 4); c.stroke(); c.beginPath(); c.moveTo(i * s / 4, 0); c.lineTo(i * s / 4, s); c.stroke(); }
    }),
    terracota: make(THREE, (c, s) => { bricks(c, s, 8, 90, 140, ['#b8573f', '#ad503a', '#c26248', '#a54a35'], '#8f7b70', 2, 9); }),
    maderaOscura: make(THREE, (c, s) => {
      c.fillStyle = '#6e4529'; c.fillRect(0, 0, s, s); const r = rnd(11);
      for (let y = 0; y < s; y += 2) { c.fillStyle = `rgba(${40 + r() * 60},${22 + r() * 30},${10 + r() * 15},${0.25 + r() * 0.3})`; c.fillRect(0, y, s, 1 + r() * 2); }
      for (let y = 0; y < s; y += 32) { c.fillStyle = 'rgba(30,18,10,.55)'; c.fillRect(0, y, s, 2); }
    }),
    maderaClara: make(THREE, (c, s) => {
      c.fillStyle = '#b68c60'; c.fillRect(0, 0, s, s); const r = rnd(13);
      for (let y = 0; y < s; y += 2) { c.fillStyle = `rgba(${120 + r() * 60},${80 + r() * 40},${40 + r() * 30},${0.2 + r() * 0.3})`; c.fillRect(0, y, s, 1 + r() * 2); }
      for (let y = 0; y < s; y += 40) { c.fillStyle = 'rgba(70,45,25,.55)'; c.fillRect(0, y, s, 3); }
    }),
    piedraApilada: make(THREE, (c, s) => bricks(c, s, 22, 40, 120, ['#7d7e82', '#8f9094', '#6c6d71', '#9fa0a4', '#77787b'], '#4c4d50', 1.5, 17)),
    pizarra: make(THREE, (c, s) => bricks(c, s, 26, 50, 150, ['#2b2b2d', '#353538', '#232325', '#3e3e41'], '#161617', 1.2, 19)),
    piedra: make(THREE, (c, s) => {
      bricks(c, s, 3, 160, 260, ['#cbc7c0', '#c2beb6', '#d3cfc8'], '#a7a39c', 2, 23);
      c.globalAlpha = 0.25; noise(c, s, 'rgba(0,0,0,0)', ['#b5b1aa', '#ddd9d2'], 29, 0.25); c.globalAlpha = 1;
    }),
    yeso: make(THREE, (c, s) => noise(c, s, '#f2f0eb', ['#ebe8e2', '#f7f5f1', '#e6e3dc'], 31, 0.12)),
    yesoGris: make(THREE, (c, s) => noise(c, s, '#a3a19e', ['#999794', '#adaba8', '#94928f'], 37, 0.16)),
  };
}

/** Aplica una textura en proyección triplanar (coordenadas de mundo) a un MeshStandardMaterial. */
export function triplanar(mat: T.MeshStandardMaterial, tex: T.Texture, scale: number, roughness?: number) {
  mat.color.set('#ffffff');
  if (roughness !== undefined) mat.roughness = roughness;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.tMap = { value: tex };
    sh.uniforms.tScale = { value: scale };
    sh.vertexShader = 'varying vec3 vWP;\nvarying vec3 vWN;\n' + sh.vertexShader.replace(
      '#include <worldpos_vertex>',
      '#include <worldpos_vertex>\n  vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\n  vWN = normalize(mat3(modelMatrix) * objectNormal);',
    );
    sh.fragmentShader = 'uniform sampler2D tMap;\nuniform float tScale;\nvarying vec3 vWP;\nvarying vec3 vWN;\n' + sh.fragmentShader.replace(
      '#include <map_fragment>',
      `vec3 bw = pow(abs(normalize(vWN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z);
       vec4 tx = texture2D(tMap, vWP.zy * tScale);
       vec4 ty = texture2D(tMap, vWP.xz * tScale);
       vec4 tz = texture2D(tMap, vWP.xy * tScale);
       diffuseColor.rgb *= (tx * bw.x + ty * bw.y + tz * bw.z).rgb;`,
    );
  };
  mat.customProgramCacheKey = () => 'tri-' + tex.uuid + scale;
  mat.needsUpdate = true;
}

/** Asigna la textura según el nombre del material exportado desde Blender. */
export function texturizar(root: T.Object3D, tx: ReturnType<typeof crearTexturas>, done = new Set<string>()) {
  const plan: Record<string, [T.Texture, number, number?]> = {
    W_S_via: [tx.asfalto, 0.18, 0.9], W_F_asfalto: [tx.asfalto, 0.18, 0.9],
    W_S_lote: [tx.pasto, 0.12, 1], W_S_parque: [tx.pasto, 0.12, 1], W_F_grass: [tx.pasto, 0.25, 1],
    W_F_vereda: [tx.vereda, 0.35, 0.9], W_F_terracota: [tx.terracota, 0.35, 0.85],
    W_F_madera: [tx.maderaOscura, 0.9, 0.6], W_F_madera_clara: [tx.maderaClara, 0.7, 0.6],
    W_F_piedra_apilada: [tx.piedraApilada, 0.45, 0.9], W_F_pizarra: [tx.pizarra, 0.55, 0.75],
    W_F_piedra: [tx.piedra, 0.5, 0.85], W_F_blanco: [tx.yeso, 0.4, 0.9], W_F_gris: [tx.yesoGris, 0.4, 0.9],
  };
  root.traverse((o: any) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      const p = plan[m.name];
      if (p && !done.has(m.uuid)) { triplanar(m, p[0], p[1], p[2]); done.add(m.uuid); }
      if (m.name === 'W_F_vidrio') { m.metalness = 0.1; m.roughness = 0.05; m.envMapIntensity = 1.6; }
      if (m.name === 'W_F_metal' || m.name === 'W_F_porton') { m.envMapIntensity = 1.2; }
    }
  });
  return done;
}
