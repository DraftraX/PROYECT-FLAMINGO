// Datos compartidos del sitio Residencial Flamingo.
export const contacto = {
  central: { display: '+51 989 195 093', raw: '51989195093' },
  asesores: [
    { display: '940 152 191', raw: '51940152191' },
    { display: '942 710 250', raw: '51942710250' },
  ],
  instagram: { handle: '@inmobiliaria.flamingo', url: 'https://www.instagram.com/inmobiliaria.flamingo/' },
  direccion: 'Prolongación Jr. Cuzco s/n, Tarapoto, San Martín',
  mapa: 'https://www.google.com/maps/search/?api=1&query=Prolongaci%C3%B3n+Jr.+Cuzco+Tarapoto',
};

export const whatsapp = (raw: string, text = 'Hola, quiero información sobre Residencial Flamingo.') =>
  `https://wa.me/${raw}?text=${encodeURIComponent(text)}`;

export const nav = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/proyecto', label: 'El proyecto' },
  { href: '/modelos', label: 'Modelos' },
  { href: '/recorrido', label: 'Recorrido 3D' },
  { href: '/contacto', label: 'Contacto' },
];

// Iconografía oficial (Brandbook 2026, 3.9) con el atributo que representa en el proyecto.
export const atributos = [
  { icon: 'portico', t: 'Pórtico de ingreso', d: 'Acceso controlado con torre de piedra y marquesina sobre Prolongación Cuzco.' },
  { icon: 'residencial-cerrada', t: 'Residencial cerrada', d: 'Cerco perimétrico y un único ingreso para la privacidad de cada familia.' },
  { icon: 'seguridad', t: 'Seguridad', d: 'Control de acceso y un entorno ordenado, pensado para vivir tranquilo.' },
  { icon: 'areas-verdes', t: 'Áreas verdes', d: 'Plaza central de 1 134 m² con pérgola, pileta, juegos y jardines.' },
  { icon: 'pistas-y-veredas', t: 'Pistas y veredas', d: 'Vías asfaltadas con veredas y retiros en cada manzana.' },
  { icon: 'agua', t: 'Agua y desagüe', d: 'Servicios básicos instalados en cada lote.' },
  { icon: 'alumbrado-publico', t: 'Alumbrado público', d: 'Iluminación en vías, veredas y plaza.' },
  { icon: 'documentos', t: 'Título de propiedad', d: 'Lotes independizados con documentación en regla.' },
  { icon: 'ubicacion-estrategica', t: 'Ubicación estratégica', d: 'Conectado con Tarapoto y frente a la Cordillera Escalera.' },
  { icon: 'diseno-en-armonia', t: 'Diseño en armonía', d: 'Cuatro prototipos de casa con un mismo lenguaje arquitectónico.' },
  { icon: 'inicial-de-pago', t: 'Inicial de pago', d: 'Facilidades para separar tu lote con una cuota inicial.' },
  { icon: 'precio', t: 'Precio', d: 'Lotes de 160 y 200 m² con condiciones claras desde el inicio.' },
  { icon: 'calendario', t: 'Entrega inmediata', d: 'Agenda tu visita y conoce el terreno en persona.' },
];
