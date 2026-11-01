// Générateur du site The Nail Atelier (français uniquement, aucune dépendance).
//
//   node nailatelier/build.mjs                  aperçu (noindex, liens « …/index.html »)
//   node nailatelier/build.mjs --production     version à publier (indexable, canonical, sitemap, robots)
//   node nailatelier/build.mjs --clean-urls     liens sans « index.html »
//
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, days, services, levels, nailArtNotes, gallery } from './content/data.mjs';

const PRODUCTION = process.argv.includes('--production');
const CLEAN = process.argv.includes('--clean-urls');
const ROOT = path.dirname(fileURLToPath(import.meta.url));

const PAGES = {
  home: { slug: '', nav: 'Accueil' },
  atelier: { slug: 'latelier', nav: 'L’atelier' },
  prestations: { slug: 'prestations', nav: 'Prestations' },
  realisations: { slug: 'realisations', nav: 'Réalisations' },
  reserver: { slug: 'reserver', nav: 'Infos pratiques' },
  legal: { slug: 'mentions-legales', nav: 'Mentions légales' },
  privacy: { slug: 'confidentialite', nav: 'Confidentialité et cookies' },
};
const META = {
  home: ['The Nail Atelier – Nails & self-care à Jodoigne', 'Salon de manucure à Jodoigne : gel, semi-permanent, nail art et soin des pieds. Hygiène, qualité et confort. Réservation en ligne.'],
  atelier: ['L’atelier – The Nail Atelier, Jodoigne', 'Hygiène, qualité et confort : l’univers de The Nail Atelier, salon de manucure à Jodoigne, et sa démarche de formation continue.'],
  prestations: ['Prestations et tarifs – The Nail Atelier, Jodoigne', 'Tarifs et durées : semi-permanent renforcé, gel, extensions, soin des pieds et nail art en quatre niveaux, de 4 € à 20 €.'],
  realisations: ['Réalisations – The Nail Atelier, Jodoigne', 'Galerie de manucures et de nail art réalisés à Jodoigne : french, chrome, 3D et compositions sur mesure.'],
  reserver: ['Réserver et infos pratiques – The Nail Atelier', 'Réservation en ligne, acompte de 20 €, conditions d’annulation, horaires et contact de The Nail Atelier à Jodoigne.'],
  legal: ['Mentions légales – The Nail Atelier', 'Mentions légales du site The Nail Atelier, salon de manucure à Jodoigne.'],
  privacy: ['Confidentialité et cookies – The Nail Atelier', 'Politique de confidentialité et de cookies du site The Nail Atelier.'],
};
const KEYS = Object.keys(PAGES);
const NAV = ['home', 'atelier', 'prestations', 'realisations', 'reserver'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const todo = (v, label = 'à compléter') => (v ? esc(v) : `<mark class="todo">[${label}]</mark>`);
const nb = '\u00a0';

const segs = (k) => (PAGES[k].slug ? [PAGES[k].slug] : []);
function rel(from, to, hash = '') {
  const f = segs(from), t = segs(to);
  let i = 0;
  while (i < f.length && i < t.length && f[i] === t[i]) i++;
  let p = '../'.repeat(f.length - i) + t.slice(i).join('/');
  if (p && !p.endsWith('/')) p += '/';
  if (!CLEAN) p += 'index.html';
  if (p === '') p = './';
  return p + hash;
}
const absUrl = (k) => `${site.url}/${segs(k).join('/')}${segs(k).length ? '/' : ''}`;

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ext: '<path d="M7 17 17 7M8 7h9v9"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 6 3-6M12 21 9 9M12 21l3-12"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 5c0 9-5 14-14 14"/><path d="M5 19c2-5 5-8 9-10"/>',
  hand: '<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.500a1.500 1.500 0 0 1 3 0V10M13 10V5.500a1.500 1.500 0 0 1 3 0V12M16 9.500a1.500 1.500 0 0 1 3 0V15a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.700L4 15.500a1.500 1.500 0 0 1 2.500-1.600L8 15.500"/>',
  foot: '<path d="M8 3c3 0 4 3 4 6s-1 4-1 7a3 3 0 0 0 3 3c3 0 5-1 5-4 0-4-2-5-3-8-.8-2.500-3-4-8-4z"/>',
  brush: '<path d="M18 3 9 12M9 12c-2.500 0-4 1.500-4 4 0 2-1 3-2 4 3 .5 7 .5 8.500-1.500 1-1.300.8-3 .5-4.500z"/>',
};
const icon = (n, c = 'ico') => `<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[n]}</svg>`;

const bookBtn = (cls = 'btn btn--solid', label = 'Réserver') => `<a class="${cls}" href="${site.bookingUrl}" target="_blank" rel="noopener">${label}<span class="sr"> (s’ouvre dans un nouvel onglet)</span>${icon('ext', 'ico ico--btn')}</a>`;
const telLink = (cls = 'btn btn--line') => (site.phone ? `<a class="${cls}" href="tel:${site.phone.replace(/[^\d+]/g, '')}">${icon('phone')}${esc(site.phone)}</a>` : '');

const levelDots = (n) => `<span class="dots" role="img" aria-label="Niveau ${n} sur 4">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

/* ---------- gabarit ---------- */
function ctx(key) {
  const depth = segs(key).length;
  return { key, asset: (p) => `${'../'.repeat(depth)}assets/${p}`, link: (k, h = '') => rel(key, k, h) };
}

function header(c) {
  const links = NAV.map((k) => `<li><a href="${c.link(k)}"${k === c.key ? ' aria-current="page"' : ''}>${esc(PAGES[k].nav)}</a></li>`).join('');
  return `<header class="header" data-header>
  <div class="header__in">
    <a class="brand" href="${c.link('home')}" aria-label="${esc(site.name)} – accueil"><img src="${c.asset('img/logo.png')}" alt="" width="46" height="46"><span class="brand__t" aria-hidden="true"><span>The</span> Nail Atelier</span></a>
    <nav class="nav" aria-label="Navigation principale"><ul>${links}</ul></nav>
    <div class="header__tools">
      ${bookBtn('btn btn--solid btn--sm header__book')}
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" data-open="Menu" data-close="Fermer"><span class="burger__label">Menu</span><span class="burger__bars" aria-hidden="true"><i></i><i></i></span></button>
    </div>
  </div>
  <div class="drawer" id="menu" hidden>
    <nav aria-label="Menu mobile"><ul>${NAV.map((k) => `<li><a href="${c.link(k)}">${esc(PAGES[k].nav)}</a></li>`).join('')}</ul></nav>
    <div class="drawer__foot">${bookBtn('btn btn--solid')}<a class="drawer__ig" href="${site.instagram}" rel="noopener">${icon('insta')}${site.instagramHandle}</a></div>
  </div>
</header>`;
}

function footer(c) {
  return `<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <a class="brand brand--footer" href="${c.link('home')}"><img src="${c.asset('img/logo.png')}" alt="" width="52" height="52"><span class="brand__t"><span>The</span> Nail Atelier</span></a>
      <p>Salon de manucure · Nails &amp; self-care<br>${esc(site.city)}</p>
      ${bookBtn('btn btn--light btn--sm')}
    </div>
    <nav class="footer__col" aria-label="Pages du site"><h2>Le site</h2><ul>${NAV.map((k) => `<li><a href="${c.link(k)}">${esc(PAGES[k].nav)}</a></li>`).join('')}</ul></nav>
    <div class="footer__col"><h2>Contact</h2><ul>
      <li>${icon('pin')}<span>${site.address.street ? `${esc(site.address.street)}<br>${esc(site.address.zip)} ` : ''}${esc(site.address.city)}</span></li>
      ${site.phone ? `<li>${icon('phone')}<a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${esc(site.phone)}</a></li>` : ''}
      ${site.email ? `<li>${icon('mail')}<a href="mailto:${site.email}">${esc(site.email)}</a></li>` : ''}
      <li>${icon('insta')}<a href="${site.instagram}" rel="noopener">${site.instagramHandle}</a></li>
    </ul></div>
  </div>
  <div class="wrap footer__legal">
    <p>© 2026 ${esc(site.name)}. Tous droits réservés.</p>
    <ul><li><a href="${c.link('legal')}">Mentions légales</a></li><li><a href="${c.link('privacy')}">Confidentialité et cookies</a></li></ul>
  </div>
</footer>`;
}

function jsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NailSalon',
    name: site.name,
    url: site.url + '/',
    image: `${site.url}/assets/img/og.jpg`,
    address: { '@type': 'PostalAddress', addressLocality: site.address.city, ...(site.address.street ? { streetAddress: site.address.street, postalCode: site.address.zip } : {}), addressCountry: 'BE' },
    ...(site.phone ? { telephone: site.phone } : {}),
    sameAs: [site.instagram],
    makesOffer: [...services.mains.items, ...services.pieds.items].slice(0, 6).map((s) => ({ '@type': 'Offer', name: s.name, price: String(parseFloat(s.price)), priceCurrency: 'EUR' })),
  };
}

function page(c, body, { ld = false, cls = '' } = {}) {
  const [title, desc] = META[c.key];
  const alt = PRODUCTION ? `<link rel="canonical" href="${absUrl(c.key)}">` : '<meta name="robots" content="noindex, nofollow">';
  const og = PRODUCTION ? `${site.url}/assets/img/og.jpg` : c.asset('img/og.jpg');
  return `<!doctype html>
<html lang="fr-BE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#fbf7f2">
${alt}
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:locale" content="fr_BE">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${c.asset('img/favicon.svg')}">
<link rel="stylesheet" href="${c.asset('css/site.css')}">
<script>document.documentElement.classList.add('js');setTimeout(function(){if(!window.__nail)document.documentElement.classList.add('no-anim')},3500)</script>
${ld ? `<script type="application/ld+json">${JSON.stringify(jsonLd()).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body class="${cls}">
<a class="skip" href="#contenu">Aller au contenu</a>
${header(c)}
${body}
${footer(c)}
<script src="${c.asset('js/site.js')}" defer></script>
</body>
</html>
`;
}

/* ---------- blocs ---------- */
const hexSvg = (cls) => `<svg class="${cls}" viewBox="0 0 200 230" aria-hidden="true" focusable="false"><polygon points="100,6 192,58 192,172 100,224 8,172 8,58" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;

const arch = (c, img, alt, w, h, extra = '', eager = false) => `<figure class="arch ${extra}"><img src="${c.asset(`img/${img}.webp`)}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></figure>`;

function priceRows(list) {
  return list
    .map((s) => `<article class="svc"><div class="svc__head"><h3 class="svc__name">${esc(s.name)}</h3><p class="svc__price"${s.priceNote ? ` title="${esc(s.priceNote)}"` : ''}>${esc(s.price)}</p></div>${s.time ? `<p class="svc__time">${icon('clock')}${esc(s.time)}</p>` : ''}<p class="svc__desc">${esc(s.desc)}</p>${s.priceNote ? `<p class="svc__note">${esc(s.priceNote)}</p>` : ''}</article>`)
    .join('\n');
}

const levelCards = (c) => levels
  .map((l) => `<article class="level" data-reveal style="--d:${(l.n - 1) * 0.08}s">
  <figure class="level__img"><img src="${c.asset(`img/${l.img}.webp`)}" alt="${esc(l.alt)}" width="1000" height="1315" loading="lazy" decoding="async"></figure>
  <div class="level__body"><div class="level__top">${levelDots(l.n)}<p class="level__price">${esc(l.price)}</p></div><h3 class="level__t">Niveau ${l.n} <span>${esc(l.label)}</span></h3><p>${esc(l.desc)}</p></div>
</article>`)
  .join('\n');

const pageHead = (eyebrow, title, lead) => `<section class="page-head"><div class="wrap"><p class="eyebrow" data-reveal>${esc(eyebrow)}</p><h1 class="display display--page" data-reveal style="--d:.08s">${title}</h1>${lead ? `<p class="lead" data-reveal style="--d:.16s">${esc(lead)}</p>` : ''}</div></section>`;

const priceNote = `<p class="fineprint">Tarifs relevés sur la publication Instagram du ${esc(site.pricesDate)}.</p>`;

/* ---------- pages ---------- */
function home(c) {
  const mainsFrom = '48 €';
  return page(c, `<main id="contenu">
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow" data-reveal>Salon de manucure · ${esc(site.city)}</p>
      <h1 class="display" data-reveal style="--d:.08s">Nails &amp; <em>self-care</em></h1>
      <p class="lead" data-reveal style="--d:.16s">Gel, semi-permanent et nail art, dans le soin du détail. Un moment pour vos mains, avec hygiène, qualité et confort.</p>
      <div class="actions" data-reveal style="--d:.24s">${bookBtn('btn btn--solid btn--lg', 'Réserver mon rendez-vous')}<a class="btn btn--text" href="${c.link('prestations')}">Voir les prestations</a></div>
      <p class="hero__note" data-reveal style="--d:.32s">${icon('pin')}${esc(site.city)}<span aria-hidden="true">·</span>Uniquement sur rendez-vous</p>
    </div>
    <div class="hero__visual">
      ${hexSvg('hex hex--a')}${hexSvg('hex hex--b')}
      ${arch(c, 'hero', 'Ongles bruns et nude avec détails dorés, mains dans la neige', 1000, 1343, 'arch--hero', true).replace('<figure class="arch arch--hero">', '<figure class="arch arch--hero" data-parallax="0.04">')}
      <p class="stamp" aria-hidden="true">Nail art<br><b>dès 4 €</b></p>
    </div>
  </div>
</section>

<section class="values" aria-labelledby="values-title">
  <div class="wrap">
    <h2 class="sr" id="values-title">Nos engagements</h2>
    <ul class="values__grid">
      <li data-reveal>${icon('drop')}<h3>Hygiène</h3><p>Une exigence à chaque rendez-vous, du premier soin à la dernière touche.</p></li>
      <li data-reveal style="--d:.08s">${icon('gem')}<h3>Qualité</h3><p>Des techniques et des produits choisis pour la tenue et la santé de l’ongle.</p></li>
      <li data-reveal style="--d:.16s">${icon('leaf')}<h3>Confort</h3><p>Un moment calme, sans précipitation, pensé pour que vous vous sentiez bien.</p></li>
    </ul>
  </div>
</section>

<section class="menu-teaser" aria-labelledby="mt-title">
  <div class="wrap">
    <div class="head-row"><div><p class="eyebrow" data-reveal>Prestations</p><h2 class="h2" id="mt-title" data-reveal style="--d:.08s">Pour vos mains <em>et vos pieds</em></h2></div><a class="btn btn--line btn--sm" href="${c.link('prestations')}" data-reveal>Tous les tarifs${icon('arrow', 'ico ico--btn')}</a></div>
    <ul class="cards3">
      <li data-reveal><a class="card" href="${c.link('prestations', '#mains')}">${icon('hand', 'ico ico--lg')}<h3>Beauté des mains</h3><p>Semi-permanent renforcé, gel, extensions, retouche et dépose.</p><p class="card__price">À partir de <b>${mainsFrom}</b></p></a></li>
      <li data-reveal style="--d:.08s"><a class="card" href="${c.link('prestations', '#pieds')}">${icon('foot', 'ico ico--lg')}<h3>Beauté des pieds</h3><p>Vernis semi-permanent et soin Silk pour des pieds doux et soignés.</p><p class="card__price">À partir de <b>43 €</b></p></a></li>
      <li data-reveal style="--d:.16s"><a class="card" href="${c.link('prestations', '#nail-art')}">${icon('brush', 'ico ico--lg')}<h3>Nail art</h3><p>Quatre niveaux, du motif discret au design sur mesure.</p><p class="card__price">À partir de <b>4 €</b></p></a></li>
    </ul>
  </div>
</section>

<section class="levels" aria-labelledby="lv-title">
  <div class="wrap">
    <div class="levels__head"><div><p class="eyebrow" data-reveal>Nail art</p><h2 class="h2" id="lv-title" data-reveal style="--d:.08s">Quatre niveaux, <em>un seul univers</em></h2></div><p class="lead" data-reveal style="--d:.16s">Du motif discret à la création élaborée : choisissez le niveau qui vous ressemble et précisez votre demande lors de la réservation.</p></div>
    <div class="levels__grid">${levelCards(c)}</div>
    <p class="fineprint fineprint--c" data-reveal>${nailArtNotes.map(esc).join(' ')}</p>
  </div>
</section>

<section class="gallery" aria-labelledby="gal-title">
  <div class="wrap">
    <div class="head-row"><div><p class="eyebrow" data-reveal>Réalisations</p><h2 class="h2" id="gal-title" data-reveal style="--d:.08s">Quelques <em>manucures</em></h2></div><a class="btn btn--line btn--sm" href="${c.link('realisations')}" data-reveal>Voir la galerie${icon('arrow', 'ico ico--btn')}</a></div>
    <ul class="strip">${gallery.slice(0, 4).map((g, i) => `<li data-reveal style="--d:${i * 0.07}s"><img src="${c.asset(`img/${g.img}.webp`)}" alt="${esc(g.alt)}" width="700" height="${g.ratio === 'tall' ? 940 : 700}" loading="lazy" decoding="async"></li>`).join('')}</ul>
  </div>
</section>

<section class="train" aria-labelledby="tr-title">
  <div class="wrap train__in">
    <div><p class="eyebrow eyebrow--light" data-reveal>L’atelier</p><h2 class="h2" id="tr-title" data-reveal style="--d:.08s">Toujours en <em>formation</em></h2></div>
    <div><p data-reveal style="--d:.12s">Manucure russe, retouche gainage… De nouvelles techniques sont intégrées petit à petit à l’institut, pour des résultats plus précis et plus durables.</p><a class="btn btn--light" data-reveal style="--d:.2s" href="${c.link('atelier')}">Découvrir l’atelier${icon('arrow', 'ico ico--btn')}</a></div>
  </div>
</section>

<section class="cta" aria-labelledby="cta-title">
  <div class="wrap cta__in">
    ${hexSvg('hex hex--c')}
    <h2 class="h2" id="cta-title" data-reveal>Prenez rendez-vous <em>en ligne</em></h2>
    <p class="lead" data-reveal style="--d:.08s">Choisissez votre prestation et votre créneau. Un acompte de ${site.deposit}${nb}€ confirme votre rendez-vous.</p>
    <div class="actions actions--c" data-reveal style="--d:.16s">${bookBtn('btn btn--solid btn--lg', 'Réserver')}<a class="btn btn--text" href="${c.link('reserver')}">Infos pratiques</a></div>
  </div>
</section>
</main>`, { ld: true, cls: 'is-home' });
}

function atelier(c) {
  return page(c, `<main id="contenu">
${pageHead('L’atelier', 'Un salon pensé <em>pour vous</em>', 'The Nail Atelier est un salon de manucure à Jodoigne, dédié aux soins des mains et des pieds et au nail art.')}
<section class="split">
  <div class="wrap split__grid">
    ${arch(c, 'niveau-3', 'Ongles nude avec lignes dorées en relief et petites perles', 1000, 1312, 'arch--s').replace('<figure class="arch arch--s">', '<figure class="arch arch--s" data-reveal data-parallax="0.03">')}
    <div class="split__text">
      <h2 class="h2" data-reveal>Nails &amp; <em>self-care</em></h2>
      <p data-reveal style="--d:.08s">Ici, la manucure est un temps pour soi. Gel, semi-permanent, extensions ou simple soin : chaque prestation est réalisée avec attention, dans le respect de la structure naturelle de l’ongle.</p>
      <p data-reveal style="--d:.16s">Le nail art tient une place particulière. Quatre niveaux permettent de choisir précisément ce que vous souhaitez, du détail discret à la composition sur mesure.</p>
      <ul class="facts" data-reveal style="--d:.24s">
        <li>${icon('drop')}<span><b>Hygiène</b>Une exigence à chaque rendez-vous.</span></li>
        <li>${icon('gem')}<span><b>Qualité</b>Des techniques choisies pour la tenue et la santé de l’ongle.</span></li>
        <li>${icon('leaf')}<span><b>Confort</b>Un moment calme, sans précipitation.</span></li>
      </ul>
    </div>
  </div>
</section>
<section class="train train--page" aria-labelledby="fo-title">
  <div class="wrap train__in">
    <div><p class="eyebrow eyebrow--light" data-reveal>Formations</p><h2 class="h2" id="fo-title" data-reveal style="--d:.08s">Se former, <em>toujours</em></h2></div>
    <div><p data-reveal style="--d:.12s">Les techniques évoluent vite. La nail artist se forme régulièrement, récemment à la manucure russe et à la retouche gainage, et intègre ces nouveautés à l’institut au fil des semaines.</p><p data-reveal style="--d:.18s">Suivez les actualités et les nouveautés sur Instagram.</p><a class="btn btn--light" data-reveal style="--d:.24s" href="${site.instagram}" rel="noopener">${icon('insta')}${site.instagramHandle}</a></div>
  </div>
</section>
<section class="cta cta--plain"><div class="wrap cta__in"><h2 class="h2" data-reveal>Envie d’un <em>moment pour vous</em> ?</h2><div class="actions actions--c" data-reveal style="--d:.1s">${bookBtn('btn btn--solid btn--lg', 'Réserver')}<a class="btn btn--text" href="${c.link('prestations')}">Voir les tarifs</a></div></div></section>
</main>`);
}

function prestations(c) {
  return page(c, `<main id="contenu">
${pageHead('Prestations et tarifs', 'Prestations <em>et tarifs</em>', 'Durées indicatives. Toutes les prestations se réservent en ligne.')}
<div class="wrap tarifs-layout">
  <nav class="subnav" aria-label="Sections des tarifs" data-subnav><ul>
    <li><a href="#mains" data-target="mains">Mains</a></li><li><a href="#nail-art" data-target="nail-art">Nail art</a></li><li><a href="#pieds" data-target="pieds">Pieds</a></li>
  </ul></nav>
  <section class="tsec" id="mains" data-section="mains" aria-labelledby="h-mains"><header class="tsec__head">${icon('hand', 'ico ico--lg')}<h2 class="h3" id="h-mains">${esc(services.mains.title)}</h2></header><div class="svcs">${priceRows(services.mains.items)}</div></section>
  <section class="tsec tsec--art" id="nail-art" data-section="nail-art" aria-labelledby="h-art">
    <header class="tsec__head">${icon('brush', 'ico ico--lg')}<h2 class="h3" id="h-art">Nail art</h2></header>
    <p class="lead lead--s">À ajouter à votre prestation. Quatre niveaux selon la complexité du design.</p>
    <div class="levels__grid levels__grid--page">${levelCards(c)}</div>
    <p class="fineprint">${nailArtNotes.map(esc).join('<br>')}</p>
  </section>
  <section class="tsec" id="pieds" data-section="pieds" aria-labelledby="h-pieds"><header class="tsec__head">${icon('foot', 'ico ico--lg')}<h2 class="h3" id="h-pieds">${esc(services.pieds.title)}</h2></header><div class="svcs">${priceRows(services.pieds.items)}</div></section>
  <div class="tarifs-end">${priceNote}${bookBtn('btn btn--solid btn--lg', 'Réserver')}</div>
</div>
</main>`);
}

function realisations(c) {
  const items = [
    ...levels.map((l) => ({ img: l.img, alt: l.alt, w: 1000, h: 1315, tag: `Nail art · niveau ${l.n}` })),
    ...gallery.map((g) => ({ img: g.img, alt: g.alt, w: g.ratio === 'tall' ? 1000 : 700, h: g.ratio === 'tall' ? 1343 : 700, tag: '' })),
  ];
  return page(c, `<main id="contenu">
${pageHead('Réalisations', 'Les <em>réalisations</em>', 'Quelques manucures et nail art réalisés à Jodoigne, publiés avec l’accord des clientes.')}
<div class="wrap masonry-wrap"><ul class="masonry">${items.map((it, i) => `<li data-reveal style="--d:${(i % 3) * 0.07}s"><figure><img src="${c.asset(`img/${it.img}.webp`)}" alt="${esc(it.alt)}" width="${it.w}" height="${it.h}" loading="lazy" decoding="async">${it.tag ? `<figcaption>${esc(it.tag)}</figcaption>` : ''}</figure></li>`).join('')}</ul>
<div class="more" data-reveal><p>Retrouvez toutes les créations sur Instagram.</p><a class="btn btn--line" href="${site.instagram}" rel="noopener">${icon('insta')}${site.instagramHandle}</a></div></div>
<section class="cta cta--plain"><div class="wrap cta__in"><h2 class="h2" data-reveal>Une idée en <em>tête</em> ?</h2><p class="lead" data-reveal>Précisez votre demande de nail art lors de la réservation.</p><div class="actions actions--c" data-reveal style="--d:.1s">${bookBtn('btn btn--solid btn--lg', 'Réserver')}</div></div></section>
</main>`);
}

function hoursBlock() {
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const s = site.hours[d] || [];
    return `<tr><th scope="row">${days[d]}</th><td>${s.length ? s.map((x) => `${x[0]}${nb}–${nb}${x[1]}`).join(' · ') : '<span class="muted">Fermé</span>'}</td></tr>`;
  }).join('');
  return Object.keys(site.hours).length ? `<table class="hours"><caption class="sr">Horaires</caption><tbody>${rows}</tbody></table>` : `<p>${todo('', 'horaires à compléter')}</p><p class="muted small">Uniquement sur rendez-vous, via la réservation en ligne.</p>`;
}

function reserver(c) {
  return page(c, `<main id="contenu">
${pageHead('Infos pratiques', 'Réserver <em>et venir</em>', 'La réservation se fait en ligne, à tout moment. Voici tout ce qu’il faut savoir avant votre rendez-vous.')}
<div class="wrap info-grid">
  <div class="info-main">
    <section class="block" data-reveal><h2 class="h3">Réserver en ligne</h2><p>Choisissez votre prestation et le créneau qui vous convient sur notre plateforme de réservation. Précisez dès la réservation toute demande de nail art.</p><div class="actions">${bookBtn('btn btn--solid btn--lg', 'Réserver en ligne')}${telLink()}</div></section>
    <section class="block" data-reveal><h2 class="h3">Acompte</h2><p>Un acompte de <b>${site.deposit}${nb}€</b> est demandé lors de la réservation pour confirmer votre rendez-vous. Il est déduit du montant de la prestation le jour du rendez-vous.</p></section>
    <section class="block" id="annulation" data-reveal><h2 class="h3">Annulation et modification</h2><p>En cas d’empêchement, merci de nous prévenir au moins <b>${site.cancelHours}${nb}heures</b> avant votre rendez-vous afin de le déplacer ou de libérer le créneau pour une autre cliente.</p><p>Une annulation dans ce délai permet de reporter l’acompte sur un nouveau rendez-vous. Passé ce délai, ou en cas d’absence, l’acompte reste acquis.</p></section>
    <section class="block" data-reveal><h2 class="h3">Nail art</h2><p>${nailArtNotes.map(esc).join(' ')}</p></section>
  </div>
  <aside class="info-side" data-reveal style="--d:.1s">
    <h2 class="h4">Horaires</h2>${hoursBlock()}
    <h2 class="h4">Adresse</h2><p>${site.address.street ? `${esc(site.address.street)}<br>${esc(site.address.zip)} ` : `${todo('', 'rue et code postal')}<br>`}${esc(site.address.city)}</p>
    <h2 class="h4">Contact</h2>
    <ul class="contact-list">
      <li>${icon('phone')}${site.phone ? `<a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${esc(site.phone)}</a>` : todo('', 'téléphone')}</li>
      <li>${icon('mail')}${site.email ? `<a href="mailto:${site.email}">${esc(site.email)}</a>` : todo('', 'e-mail')}</li>
      <li>${icon('insta')}<a href="${site.instagram}" rel="noopener">${site.instagramHandle}</a></li>
    </ul>
  </aside>
</div>
</main>`);
}

const val = (k) => (k === 'address' ? (site.address.street ? `${esc(site.address.street)}, ${esc(site.address.zip)} ${esc(site.address.city)}` : todo('', 'adresse')) : k === 'phone' ? todo(site.phone, 'téléphone') : k === 'email' ? todo(site.email, 'e-mail') : k === 'owner' ? todo(site.owner, 'prénom et nom') : todo(site.legal[k], k === 'company' ? 'raison sociale' : 'à compléter'));
const fillV = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => val(k));

function textPage(c, kind) {
  const T = kind === 'legal'
    ? { eyebrow: 'Informations', title: 'Mentions <em>légales</em>', secs: [
      ['Éditeur du site', '<p>Ce site est édité par <strong>{{company}}</strong> ({{legalForm}}), qui exploite le salon « The Nail Atelier ».</p><p>Adresse : {{address}}.<br>Numéro d’entreprise (BCE) : {{bce}}<br>N° de TVA : {{vat}}<br>Téléphone : {{phone}}<br>E-mail : {{email}}</p><p>Responsable de la publication : {{owner}}.</p>'],
      ['Hébergement', '<p>Le site est hébergé par {{host}}.</p>'],
      ['Prix et prestations', '<p>Les prix sont indiqués en euros, toutes taxes comprises. Les durées sont indicatives. Les tarifs peuvent évoluer ; en cas de doute, la grille communiquée lors de la réservation fait foi.</p>'],
      ['Réservation, acompte et annulation', '<p>Les rendez-vous se réservent sur la plateforme de réservation Optios. Un acompte de ' + site.deposit + ' € est demandé et déduit du prix de la prestation. Les conditions d’annulation figurent sur la page « Infos pratiques ».</p>'],
      ['Propriété intellectuelle', '<p>Les textes, photographies, logo et éléments graphiques du site sont protégés. Toute reproduction sans l’accord écrit du salon est interdite. Les photographies de clientes sont publiées avec leur accord.</p>'],
      ['Responsabilité', '<p>Nous veillons à l’exactitude des informations publiées, mais des erreurs restent possibles. Le salon n’est pas responsable du contenu des sites externes vers lesquels il renvoie (Instagram, plateforme de réservation).</p>'],
      ['Droit applicable', '<p>Le droit belge est applicable. En cas de litige, les tribunaux belges sont compétents.</p>'],
    ] }
    : { eyebrow: 'Informations', title: 'Confidentialité <em>et cookies</em>', secs: [
      ['Responsable du traitement', '<p><strong>{{company}}</strong>, {{address}}. Contact : {{email}} ou {{phone}}.</p>'],
      ['Ce site ne collecte rien', '<p>Ce site n’a ni formulaire, ni compte client, ni paiement. Il ne dépose aucun cookie, n’utilise aucun outil de mesure d’audience et ne charge aucun contenu externe. Les polices de caractères sont hébergées sur le site.</p>'],
      ['Réservation en ligne', '<p>La réservation s’effectue sur la plateforme Optios (booking.optios.net), qui traite vos données (nom, coordonnées, rendez-vous, acompte) selon sa propre politique de confidentialité. Le salon les utilise uniquement pour gérer votre rendez-vous (art. 6.1.b du RGPD) et les conserve le temps nécessaire à cette gestion et à ses obligations comptables.</p>'],
      ['Instagram', '<p>Les liens vers Instagram sont de simples liens : aucune donnée n’est transmise à Instagram tant que vous ne les ouvrez pas.</p>'],
      ['Photographies', '<p>Les photographies de mains et d’ongles sont publiées avec l’accord des personnes concernées. Pour demander le retrait d’une photographie : {{email}}.</p>'],
      ['Vos droits', '<p>Vous pouvez demander l’accès à vos données, leur rectification, leur effacement, la limitation du traitement, vous y opposer ou demander leur portabilité, en écrivant à {{email}}.</p><p>Vous pouvez aussi introduire une réclamation auprès de l’Autorité de protection des données, Rue de la Presse 35, 1000 Bruxelles, <a href="https://www.autoriteprotectiondonnees.be" rel="noopener">autoriteprotectiondonnees.be</a>.</p>'],
    ] };
  return page(c, `<main id="contenu"><section class="page-head page-head--text"><div class="wrap"><p class="eyebrow">${T.eyebrow}</p><h1 class="display display--page">${T.title}</h1><p class="muted">Dernière mise à jour : novembre 2026</p></div></section>
<div class="wrap"><div class="prose">${T.secs.map(([h, b]) => `<section><h2 class="h4">${esc(h)}</h2>${fillV(b)}</section>`).join('')}</div></div></main>`);
}

const R = { home, atelier, prestations, realisations, reserver, legal: (c) => textPage(c, 'legal'), privacy: (c) => textPage(c, 'privacy') };

for (const k of KEYS) {
  const file = path.join(ROOT, ...segs(k), 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, R[k](ctx(k)));
}
if (PRODUCTION) {
  await writeFile(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${KEYS.map((k) => `  <url><loc>${absUrl(k)}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
} else {
  await rm(path.join(ROOT, 'sitemap.xml'), { force: true });
  await rm(path.join(ROOT, 'robots.txt'), { force: true });
}
console.log(`${KEYS.length} pages (${PRODUCTION ? 'production' : 'aperçu, noindex'}${CLEAN ? ', URL propres' : ''})`);
