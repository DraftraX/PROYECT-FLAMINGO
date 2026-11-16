import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  // Las demás rutas se redirigen a secciones de la portada en public/_redirects.
  const urls = [new URL('/', site).href];
  const entries = urls.sort().map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
