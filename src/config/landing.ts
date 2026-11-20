export const landingNav = [
  { href: '/#inicio', label: 'Inicio' },
  { href: '/#nosotros', label: 'Nosotros' },
  { href: '/#ubicacion', label: 'Ubicación' },
  { href: '/#proyecto', label: 'El proyecto' },
  { href: '/#recorrido', label: 'Tour 360°' },
];

export const agendaVisita = '#agenda-visita';

export const atributosLanding = [
  { icon: 'pistas-y-veredas', titulo: 'Infraestructura vial', descripcion: 'Pistas, bermas, jardineras y veredas integradas en un diseño urbano planificado.' },
  { icon: 'agua', titulo: 'Servicios completos', descripcion: 'Agua, desagüe y electricidad contemplados en la infraestructura del proyecto.' },
  { icon: 'diseno-en-armonia', titulo: 'Armonía arquitectónica', descripcion: 'Una propuesta con identidad propia, acompañada de planos arquitectónicos y diseños de fachadas referenciales.' },
  { icon: 'documentos', titulo: 'Partidas registrales individuales', descripcion: 'Cada propiedad cuenta con su propia partida registral en SUNARP.' },
  { icon: 'areas-verdes', titulo: 'Parques y jardines', descripcion: 'Áreas verdes y espacios de recreación para disfrutar de la naturaleza y el bienestar.' },
  { icon: 'seguridad', titulo: 'Exclusividad residencial', descripcion: 'Un entorno residencial concebido para brindar privacidad y un ingreso organizado.' },
  { icon: 'ubicacion-estrategica', titulo: 'Ubicación estratégica', descripcion: 'Cercanía a Tarapoto, conexión con servicios urbanos y vistas a la Cordillera Escalera.' },
];

export const estadosLote = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
  'por-confirmar': 'Por confirmar',
};

interface FichaComercial {
  estado: Exclude<keyof typeof estadosLote, 'por-confirmar'>;
  precio?: number;
  moneda?: 'PEN' | 'USD';
  panoramaUrl?: string;
}

// Cargar únicamente fichas vigentes confirmadas por el equipo comercial.
// La clave coincide con el plano aprobado (por ejemplo, A-01).
export const fichasComerciales: Partial<Record<string, FichaComercial>> = {};

const configuredMaps = import.meta.env.PUBLIC_FLAMINGO_GOOGLE_MAPS_URL || '';
export const googleMapsUrl = /^https:\/\/(?:maps\.app\.goo\.gl\/|(?:www\.)?google\.com\/maps\/)/i.test(configuredMaps)
  ? configuredMaps
  : '';

export const tourAltoPlantaUrl = 'https://altoplanta.com/360/df9dd75a-bf04-40d2-a450-9b8525f894ae?embed=1&mapa=4f21792a-f072-4bcf-a8f4-6478cb24c55f';

const configuredEmbed = import.meta.env.PUBLIC_ALTOPLANTA_MAPA_URL || '';
// Allow only the public embed format. Management links never belong in the page.
export const mapaAltoPlantaUrl = /^https:\/\/altoplanta\.com\/embed\/mapa\/\?mapa=[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}#token=[A-Za-z0-9_-]+$/i.test(configuredEmbed)
  ? configuredEmbed
  : '';
