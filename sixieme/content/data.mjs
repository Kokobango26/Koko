// Données communes aux trois langues : coordonnées, horaires, carte, formules.
// Tout ce qui est repris du site d'origine (lesixieme.com) est marqué « source : site ».

export const site = {
  name: 'Le Sixième',
  phone: '010 45 10 01', // source : site
  phoneHref: '+3210451001',
  email: 'info.lesixieme@gmail.com', // source : site
  address: { street: 'Avenue Fernand Charlot 2', zip: '1370', city: 'Jodoigne', country: 'BE' }, // source : site
  mapQuery: 'Restaurant Le Sixième, Avenue Fernand Charlot 2, 1370 Jodoigne, Belgique',
  // À compléter avec les vraies adresses : les icônes n'apparaissent que si l'URL est renseignée.
  social: { facebook: '', instagram: '' },
  // Note Google relevée sur la fiche (à mettre à jour de temps en temps).
  rating: { score: '4,6', count: 423 },
  // URL de production, utilisée pour les balises canonical / hreflang / sitemap.
  url: 'https://www.lesixieme.com',
  // Si un service de réservation (Zenchef, TheFork, Formspree…) est choisi, renseigner son URL :
  // le formulaire l'utilise à la place du courriel pré-rempli.
  reservationEndpoint: '',
  maxGuests: 10,
  // Informations légales à fournir par le restaurant (laissées vides : elles s'affichent en surbrillance).
  legal: { company: '', legalForm: '', bce: '', vat: '', publisher: '', host: '' },
};

// 0 = dimanche … 6 = samedi. Source : site « Du lundi au dimanche 12:00-13:30 / 18:30-21:30,
// fermé le mardi et mercredi, samedi midi ».
const both = [['12:00', '13:30'], ['18:30', '21:30']];
export const hours = {
  0: both,
  1: both,
  2: [],
  3: [],
  4: both,
  5: both,
  6: [['18:30', '21:30']],
};

// Tags de la carte : clé → rien d'autre à définir ici, les libellés sont dans chaque langue.
// Formules (source : site)
export const formulas = { three: 54, four: 66, wine3: 24, wine4: 32, cheese: 19, cheeseSwap: 8 };

// La carte. Les noms de plats restent en français dans toutes les langues ; les descriptions sont traduites.
export const menu = [
  {
    id: 'entrees',
    image: 'plat-saumon',
    items: [
      {
        name: 'Le saumon fumé par nos soins',
        tags: ['new', 'fish'],
        gloss: { nl: 'Huisgerookte zalm', en: 'House-smoked salmon' },
        desc: {
          fr: 'Crémeux de brocolis, panais en pickles, coulis de cerfeuil',
          nl: 'Romige broccoli, ingelegde pastinaak, kervelcoulis',
          en: 'Creamy broccoli, pickled parsnip, chervil coulis',
        },
      },
      {
        name: 'Le mijoté de marcassin',
        tags: ['new', 'mushroom'],
        gloss: { nl: 'Gestoofd everzwijntje', en: 'Slow-braised young wild boar' },
        desc: {
          fr: 'Mousseline de topinambours, coing, champignons des bois',
          nl: 'Topinamboermousseline, kweepeer, bospaddenstoelen',
          en: 'Jerusalem artichoke mousseline, quince, wild mushrooms',
        },
      },
      {
        name: 'La poitrine de cochon confite',
        tags: [],
        gloss: { nl: 'Gekonfijte varkensborst', en: 'Confit pork belly' },
        desc: {
          fr: 'Butternut, oignons grelots rôtis, beurre blanc tomaté',
          nl: 'Butternut, geroosterde zilveruitjes, tomaten-beurre blanc',
          en: 'Butternut squash, roasted pearl onions, tomato beurre blanc',
        },
      },
      {
        // Dans la source, ce plat est précédé d'un astérisque dont la signification n'est pas indiquée : à confirmer.
        name: 'Le croustillant d’effiloché d’agneau',
        tags: [],
        gloss: { nl: 'Krokant van getrokken lam', en: 'Crispy pulled lamb' },
        desc: {
          fr: 'Farce de maïs ‘Fuego’, condiment concombres et jus réduit',
          nl: '‘Fuego’-maïsvulling, komkommercondiment en gereduceerde jus',
          en: '‘Fuego’ corn stuffing, cucumber condiment and reduced jus',
        },
      },
    ],
  },
  {
    id: 'plats',
    image: 'plat-canard',
    items: [
      {
        name: 'Le filet de sébaste cuit à la vapeur douce',
        tags: ['new', 'fish', 'crustacean'],
        gloss: { nl: 'Zacht gestoomde roodbaarsfilet', en: 'Gently steamed redfish fillet' },
        desc: {
          fr: 'Farce fine aux crevettes et estragon, jus bisqué',
          nl: 'Fijne vulling van garnalen en dragon, bisque-jus',
          en: 'Fine prawn and tarragon stuffing, bisque jus',
        },
      },
      {
        name: 'Le filet de biche, comme un Wellington…',
        tags: ['new', 'mushroom'],
        gloss: { nl: 'Hertenfilet op Wellington-wijze', en: 'Venison fillet, Wellington-style' },
        desc: {
          fr: 'Pleurottes, jus corsé, speck fumé ‘Alto Adige’, mousseline de pommes de terre montée au beurre',
          nl: 'Oesterzwammen, krachtige jus, gerookte ‘Alto Adige’-speck, met boter opgeklopte aardappelmousseline',
          en: 'Oyster mushrooms, rich jus, smoked ‘Alto Adige’ speck, butter-whipped potato mousseline',
        },
      },
      {
        name: 'Notre sélection de viandes',
        tags: ['meat'],
        gloss: { nl: 'Onze selectie vlees', en: 'Our selection of meats' },
        desc: {
          fr: 'Selon arrivage… prix du marché',
          nl: 'Naargelang de aanvoer… marktprijs',
          en: 'Depending on what arrives… market price',
        },
      },
    ],
  },
  {
    id: 'fromage',
    image: 'plat-canard',
    items: [
      {
        name: 'La sélection de fromages affinés « Maison Elsen »',
        tags: [],
        gloss: { nl: 'Selectie gerijpte kazen van Maison Elsen', en: 'Selection of matured cheeses from Maison Elsen' },
        desc: { fr: '', nl: '', en: '' },
        price: 'cheese',
      },
    ],
  },
  {
    id: 'desserts',
    image: 'dessert-sorbets',
    items: [
      {
        name: 'La mousse chocolat légèrement citronnée',
        tags: ['new'],
        gloss: { nl: 'Chocolademousse met een vleugje citroen', en: 'Chocolate mousse with a hint of lemon' },
        desc: {
          fr: 'Zestes de citrons confits, noisettes caramélisées',
          nl: 'Gekonfijte citroenschil, gekaramelliseerde hazelnoten',
          en: 'Candied lemon zest, caramelised hazelnuts',
        },
      },
      {
        name: 'L’assortiment de sorbets maison',
        tags: [],
        gloss: { nl: 'Assortiment huisgemaakte sorbets', en: 'Assortment of house-made sorbets' },
        desc: {
          fr: 'Biscuit chocolaté, chantilly à la vanille',
          nl: 'Chocoladebiscuit, vanillechantilly',
          en: 'Chocolate biscuit, vanilla whipped cream',
        },
      },
    ],
  },
];

// Avis réels relevés sur Google et Tripadvisor (texte repris tel quel, en français).
export const reviews = [
  {
    featured: true,
    title: 'La meilleure table de Jodoigne',
    text: 'Toujours ravie de l’originalité des mets, la déco est top et l’accueil chaleureux. Je recommande sans hésitation !',
    author: 'Muri E.',
    source: 'Tripadvisor',
    date: '2025-11',
  },
  {
    text: 'Excellent comme à chaque fois ! Des plats pleins de saveurs et parfaitement de saison. On se régale autant avec les yeux qu’avec les papilles. Le service est attentionné et chaleureux, et l’ambiance toujours au top.',
    author: 'Emy B.',
    source: 'Google',
  },
  {
    text: 'Une excellente découverte. Une carte courte mais variée, des plats splendides et un vrai régal. Tout était fameux. Le personnel était agréable.',
    author: 'Eric D.',
    source: 'Google',
  },
  {
    text: 'Cadre sobre et reposant, personnel attentionné. La nourriture est excellente et les assiettes joliment décorées. Tout était parfait.',
    author: 'Fabienne',
    source: 'Tripadvisor',
  },
];
