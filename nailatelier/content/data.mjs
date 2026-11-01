// The Nail Atelier – toutes les données et tous les textes du site (français, vouvoiement).
// Les champs vides s'affichent en surbrillance « à compléter » sur les pages concernées.

export const site = {
  name: 'The Nail Atelier',
  city: 'Jodoigne',
  // Nom de domaine inventé pour la maquette : à remplacer par le vrai.
  url: 'https://www.thenailatelier.be',
  bookingUrl: 'https://booking.optios.net/23155/activities', // source : bio Instagram
  instagram: 'https://www.instagram.com/thenailatelier_be/',
  instagramHandle: '@thenailatelier_be',
  phone: '', // à compléter (ex. '0470 12 34 56')
  email: '', // à compléter
  address: { street: '', zip: '', city: 'Jodoigne' }, // rue et code postal à compléter
  owner: '', // prénom de la nail artist, à compléter
  // Horaires : à compléter. Format : { 1: [['09:00','18:00']], 2: [...] } avec 0 = dimanche … 6 = samedi.
  hours: {},
  deposit: 20, // acompte demandé à la réservation, en euros
  cancelHours: 48, // délai d'annulation proposé : à valider avec la professionnelle
  legal: { company: '', legalForm: '', bce: '', vat: '', publisher: '', host: '' },
  pricesDate: '20 juillet', // date de la publication Instagram d'où viennent les tarifs
};

export const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// Tarifs repris de la story Instagram « Tarifs & infos » (20 juillet).
export const services = {
  mains: {
    title: 'Beauté des mains',
    items: [
      { name: 'Semi-permanent renforcé', price: '48 €', time: '1h45', desc: 'Manucure longue tenue avec une base gainante qui apporte maintien et résistance aux ongles courts (XS à S). Il est idéal pour les ongles mous, fins ou fragilisés.' },
      { name: 'Gel – Extensions', price: '60 €', time: '3h00', desc: 'Création d’extensions personnalisées (de S à L) qui permettent d’allonger l’ongle tout en respectant sa structure naturelle.' },
      { name: 'Gel – Ongles naturels', price: '55 €', time: '2h15', desc: 'Renfort réalisé sur ongles naturels (de XS à L) qui apporte solidité et tenue tout en conservant leur longueur.' },
      { name: 'Gel – Retouche', price: '48 €', time: '2h00', desc: 'Rééquilibrage de l’architecture et de la forme qui permet de préserver la solidité et l’intégrité de l’ongle (de XS à L).' },
      { name: 'Dépose de la matière', price: '20 € · 25 €', priceNote: 'semi-permanent renforcé 20 €, gel 25 €', time: '45 min', desc: 'Retrait complet de la matière tout en préservant la santé de l’ongle.' },
    ],
  },
  pieds: {
    title: 'Beauté des pieds',
    items: [
      { name: 'Vernis semi-permanent', price: '43 €', time: '1h30', desc: 'Mise en forme et soin des ongles avec application d’un vernis semi-permanent offrant une pédicure durable et brillante.' },
      { name: 'Soin Silk', price: '43 €', time: '1h15', desc: 'Soin ciblé permettant d’éliminer les callosités et de lisser la peau pour des pieds doux et nets. Il est idéal pour les personnes ayant les pieds secs ou rugueux.' },
      { name: 'Soin Silk + semi-permanent', price: '75 €', time: '2h00', desc: 'Soin complet associant mise en beauté des ongles et traitement des callosités pour des pieds doux et soignés.' },
      { name: 'Dépose de la matière', price: '20 €', time: '30 min', desc: 'Retrait complet de la matière tout en préservant la santé de l’ongle.' },
      { name: 'Nail art', price: '5 €', time: '', desc: 'Option esthétique comprenant une french, du chrome ou des détails minimalistes.' },
    ],
  },
};

export const levels = [
  { n: 1, price: '4 €', img: 'niveau-1', alt: 'Ongles courts bordeaux, l’un avec un cercle doré, un autre avec une petite fleur', label: 'Simple', desc: 'Nail art simple comprenant décoration minimaliste sur deux ongles maximum, motif discret sur l’ensemble des ongles, chrome.' },
  { n: 2, price: '8 €', img: 'niveau-2', alt: 'French colorées sur ongles courts : bleu, rose, vert et orange', label: 'Intermédiaire', desc: 'Nail art intermédiaire comprenant french, babyboomer, babycolor, aura, travail de dégradé ou ligne structurée.' },
  { n: 3, price: '12 €', img: 'niveau-3', alt: 'Ongles nude avec des lignes dorées en relief et de petites perles', label: 'Complexe', desc: 'Nail art complexe comprenant effets de matière, effet tortoise, 3D, dessins détaillés et compositions élaborées.' },
  { n: 4, price: '20 €', img: 'niveau-4', alt: 'Ongles amande avec fleurs 3D jaune et pêche, french jaune et lignes blanches', label: 'Avancé', desc: 'Nail art avancé comprenant combinaison de plusieurs niveaux, accumulation de techniques, design sur mesure nécessitant un travail approfondi.' },
];

export const nailArtNotes = [
  'Toute demande de nail art doit être précisée lors de la prise de rendez-vous.',
  'Je me réserve le droit de refuser toute demande de nail art ne correspondant pas à mon univers artistique.',
];

export const gallery = [
  { img: 'hero', alt: 'Ongles bruns et nude avec détails dorés, mains dans la neige', ratio: 'tall' },
  { img: 'galerie-3', alt: 'Ongles rose clair, main posée sur un jean', ratio: 'sq' },
  { img: 'galerie-2', alt: 'Ongles roses avec petits motifs, pull rose et rouge', ratio: 'sq' },
  { img: 'galerie-4', alt: 'Ongles roses à pois bruns, bague dorée', ratio: 'sq' },
  { img: 'galerie-1', alt: 'Ongles nude nacrés, main posée sur un jean', ratio: 'sq' },
  { img: 'galerie-5', alt: 'Ongles bordeaux brillants sur un pull rose avec un cœur rouge', ratio: 'sq' },
];
