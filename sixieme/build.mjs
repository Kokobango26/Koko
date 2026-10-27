// Générateur du site Le Sixième : trois langues (fr à la racine, /nl/, /en/), aucune dépendance.
//
//   node sixieme/build.mjs                   aperçu (noindex, liens « …/index.html » : fonctionne en ouvrant les fichiers)
//   node sixieme/build.mjs --production      version à mettre en ligne (indexable, canonical, hreflang, sitemap, robots)
//   node sixieme/build.mjs --clean-urls      liens sans « index.html » (pour un hébergement web classique)
//
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, hours, formulas, menu, reviews } from './content/data.mjs';
import fr from './content/fr.mjs';
import nl from './content/nl.mjs';
import en from './content/en.mjs';

const LANGS = { fr, nl, en };
const ORDER = ['fr', 'nl', 'en'];
const PRODUCTION = process.argv.includes('--production');
const CLEAN = process.argv.includes('--clean-urls');
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = ROOT;
const PAGES = ['home', 'menu', 'book', 'contact', 'legal', 'privacy'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nbsp = '\u00a0';
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

function segsOf(lang, key) {
  const L = LANGS[lang];
  return [...(lang === 'fr' ? [] : [lang]), ...(key === 'home' ? [] : [L.slugs[key]])];
}
function relUrl(from, to, hash = '') {
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  let p = '../'.repeat(from.length - i) + to.slice(i).join('/');
  if (p && !p.endsWith('/')) p += '/';
  if (!CLEAN) p += 'index.html';
  if (p === '') p = './';
  return p + hash;
}
function absUrl(lang, key) {
  const segs = segsOf(lang, key);
  return `${site.url}/${segs.join('/')}${segs.length ? '/' : ''}`;
}
const hm = (t) => t; // horaires affichés en 24 h : 12:00
const range = ([a, b]) => `<span class="r">${hm(a)}${nbsp}–${nbsp}${hm(b)}</span>`;

function legalValue(L, key) {
  const v = key === 'address' ? `${site.address.street}, ${site.address.zip} ${site.address.city}, Belgique` : key === 'phone' ? site.phone : key === 'email' ? site.email : site.legal[key];
  return v ? esc(v) : `<mark class="todo">${esc(L.todo)}</mark>`;
}

const ICONS = {
  leaf: '<path d="M5 19C5 10 10 5 20 5c0 9-5 14-14 14"/><path d="M5 19c2-5 5-8 9-10"/>',
  flame: '<path d="M12 3c.5 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500.2 2 1 3 2 3 0-3-1-5 1-8.500z"/>',
  snow: '<path d="M12 3v18M4.200 7.500l15.600 9M19.800 7.500l-15.600 9"/><path d="m9.500 4.500 2.500 2.500 2.500-2.500M9.500 19.500l2.500-2.500 2.500 2.500"/>',
  car: '<path d="M5 17v-6l2-5h10l2 5v6"/><path d="M3 17h18"/><path d="M7.500 13.500h.01M16.500 13.500h.01"/><path d="M5 17v2M19 17v2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.4c.9.3 1.800.6 2.800.7a2 2 0 0 1 1.700 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.970 5.700a1.940 1.940 0 0 1-2.060 0L2 7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.370A4 4 0 1 1 12.630 8 4 4 0 0 1 16 11.370z"/><path d="M17.500 6.500h.01"/>',
};
const icon = (name, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

/* ---------- gabarit commun ---------- */
function makeCtx(lang, key) {
  const L = LANGS[lang];
  const segs = segsOf(lang, key);
  const depth = segs.length;
  return {
    lang,
    L,
    key,
    segs,
    asset: (p) => `${'../'.repeat(depth)}assets/${p}`,
    link: (k, hash = '', l = lang) => relUrl(segs, segsOf(l, k), hash),
  };
}

function wordmark(c, cls = '') {
  return `<a class="wordmark ${cls}" href="${c.link('home')}" aria-label="${esc(site.name)} – ${esc(c.L.ui.nav.home)}"><span class="wordmark__top" aria-hidden="true">${esc(c.L.ui.restaurantWord)}</span><span class="wordmark__main" aria-hidden="true">Le Si<span class="wordmark__x">x</span>ième</span></a>`;
}

function langSwitch(c, cls = 'langs') {
  return `<ul class="${cls}" aria-label="${esc(c.L.ui.langLabel)}">${ORDER.map(
    (l) => `<li><a href="${c.link(c.key, '', l)}" lang="${LANGS[l].htmlLang}" hreflang="${LANGS[l].htmlLang}"${l === c.lang ? ' aria-current="true"' : ''} title="${esc(LANGS[l].label)}">${l.toUpperCase()}</a></li>`,
  ).join('')}</ul>`;
}

function header(c) {
  const { L } = c;
  const nav = [
    ['home', L.ui.nav.home, c.link('home')],
    ['restaurant', L.ui.nav.restaurant, c.link('home', '#restaurant')],
    ['menu', L.ui.nav.menu, c.link('menu')],
    ['contact', L.ui.nav.contact, c.link('contact')],
  ];
  const links = nav.map(([k, label, href]) => `<li><a href="${href}"${k === c.key ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`).join('');
  return `<header class="header" data-header>
  <div class="header__in">
    ${wordmark(c)}
    <nav class="nav" aria-label="${esc(L.ui.mainNav)}"><ul>${links}</ul></nav>
    <div class="header__tools">
      ${langSwitch(c)}
      <a class="btn btn--line btn--sm header__book" href="${c.link('book')}"${c.key === 'book' ? ' aria-current="page"' : ''}>${esc(L.ui.nav.book)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" data-label-open="${esc(L.ui.menuOpen)}" data-label-close="${esc(L.ui.menuClose)}"><span class="burger__label">${esc(L.ui.menuOpen)}</span><span class="burger__bars" aria-hidden="true"><i></i><i></i></span></button>
    </div>
  </div>
  <div class="drawer" id="menu" hidden>
    <nav aria-label="${esc(L.ui.mainNav)}"><ul>
      ${nav.map(([, label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}
      <li><a href="${c.link('book')}">${esc(L.ui.nav.book)}</a></li>
    </ul></nav>
    <div class="drawer__foot">
      <a class="drawer__phone" href="tel:${site.phoneHref}">${icon('phone')}${esc(site.phone)}</a>
      ${langSwitch(c, 'langs langs--big')}
    </div>
  </div>
</header>`;
}

function footer(c) {
  const { L } = c;
  const social = [['facebook', 'Facebook'], ['instagram', 'Instagram']]
    .filter(([k]) => site.social[k])
    .map(([k, name]) => `<li><a href="${esc(site.social[k])}" rel="noopener" aria-label="${name}">${icon(k)}</a></li>`)
    .join('');
  return `<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      ${wordmark(c, 'wordmark--light')}
      <p>${esc(L.footer.tagline)}</p>
      ${social ? `<ul class="social" aria-label="${esc(L.footer.social)}">${social}</ul>` : ''}
    </div>
    <div class="footer__col">
      <h2>${esc(L.footer.contact)}</h2>
      <ul>
        <li>${icon('pin')}<span>${esc(site.address.street)}<br>${esc(site.address.zip)} ${esc(site.address.city)}</span></li>
        <li>${icon('phone')}<a href="tel:${site.phoneHref}">${esc(site.phone)}</a></li>
        <li>${icon('mail')}<a href="mailto:${site.email}">${esc(site.email)}</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h2>${esc(L.footer.pages)}</h2>
      <ul>
        <li><a href="${c.link('home')}">${esc(L.ui.nav.home)}</a></li>
        <li><a href="${c.link('menu')}">${esc(L.ui.nav.menu)}</a></li>
        <li><a href="${c.link('book')}">${esc(L.ui.nav.book)}</a></li>
        <li><a href="${c.link('contact')}">${esc(L.ui.nav.contact)}</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h2>${esc(L.ui.langLabel)}</h2>
      ${langSwitch(c, 'langs langs--footer')}
    </div>
  </div>
  <div class="wrap footer__legal">
    <p>© 2026 ${esc(site.name)}. ${esc(L.footer.rights)}</p>
    <ul>
      <li><a href="${c.link('legal')}">${esc(L.footer.legal)}</a></li>
      <li><a href="${c.link('privacy')}">${esc(L.footer.privacy)}</a></li>
    </ul>
  </div>
</footer>`;
}

function jsonLd(c) {
  const open = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (const d of DAY_ORDER) for (const [o, cl] of hours[d]) open.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayNames[d], opens: o, closes: cl });
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    url: absUrl(c.lang, 'home'),
    image: `${site.url}/assets/img/og.jpg`,
    telephone: `+32${site.phoneHref.slice(3)}`,
    email: site.email,
    servesCuisine: 'French',
    acceptsReservations: 'True',
    menu: absUrl(c.lang, 'menu'),
    address: { '@type': 'PostalAddress', streetAddress: site.address.street, postalCode: site.address.zip, addressLocality: site.address.city, addressCountry: 'BE' },
    openingHoursSpecification: open,
    ...(site.social.facebook || site.social.instagram ? { sameAs: [site.social.facebook, site.social.instagram].filter(Boolean) } : {}),
  };
}

function page(c, { body, bodyClass = '', ld = null }) {
  const { L, key } = c;
  const m = L.meta[key];
  const i18n = {
    lang: c.lang,
    locale: L.htmlLang,
    days: L.days,
    status: L.status,
    book: { form: L.book.form, msg: L.book.msg, mail: L.book.mail },
    hours,
    phone: site.phone,
    email: site.email,
    maxGuests: site.maxGuests,
    endpoint: site.reservationEndpoint,
    closedNote: L.home.visit.lunchOnlyNote,
  };
  const alternates = PRODUCTION
    ? ORDER.map((l) => `<link rel="alternate" hreflang="${LANGS[l].htmlLang}" href="${absUrl(l, key)}">`).join('\n') +
      `\n<link rel="alternate" hreflang="x-default" href="${absUrl('fr', key)}">\n<link rel="canonical" href="${absUrl(c.lang, key)}">`
    : '';
  const ogImage = PRODUCTION ? `${site.url}/assets/img/og.jpg` : c.asset('img/og.jpg');
  return `<!doctype html>
<html lang="${L.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.description)}">
<meta name="theme-color" content="#f5f4f1">
${PRODUCTION ? '' : '<meta name="robots" content="noindex, nofollow">'}
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${L.ogLocale}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.description)}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${c.asset('img/favicon.svg')}">
<link rel="stylesheet" href="${c.asset('css/site.css')}">
<script>document.documentElement.classList.add('js');setTimeout(function(){if(!window.__six)document.documentElement.classList.add('no-anim')},3500)</script>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body class="${bodyClass}">
<a class="skip" href="#contenu">${esc(L.ui.skip)}</a>
${header(c)}
${body}
${footer(c)}
<script type="application/json" id="i18n">${JSON.stringify(i18n).replace(/</g, '\\u003c')}</script>
<script src="${c.asset('js/site.js')}" defer></script>
</body>
</html>
`;
}

/* ---------- blocs réutilisables ---------- */
function hoursTable(c) {
  const { L } = c;
  const rows = DAY_ORDER.map((d) => {
    const slots = hours[d];
    const cell = slots.length ? slots.map(range).join(`<span class="sep"> · </span>`) : `<span class="muted">${esc(L.home.visit.closed)}</span>`;
    return `<tr data-day="${d}"><th scope="row">${esc(L.days[d])}</th><td>${cell}</td></tr>`;
  }).join('');
  return `<table class="hours"><caption class="sr">${esc(L.home.visit.hours)}</caption><tbody>${rows}</tbody></table><p class="hours__note">${esc(L.home.visit.lunchOnlyNote)}</p>`;
}

function circle(c, src, alt, cls = '', extra = '') {
  return `<figure class="plate ${cls}" ${extra}><div class="plate__disc"><img src="${c.asset(`img/${src}.webp`)}" alt="${esc(alt)}" width="1400" height="1400" loading="lazy" decoding="async"></div></figure>`;
}

const tagsHtml = (L, tags) => (tags.length ? `<ul class="tags">${tags.map((t) => `<li class="tag tag--${t}">${esc(L.tags[t])}</li>`).join('')}</ul>` : '');

/* ---------- pages ---------- */
function homePage(c) {
  const { L } = c;
  const H = L.home;
  const monthFmt = new Intl.DateTimeFormat(L.htmlLang, { month: 'long', year: 'numeric' });
  const lead = reviews.find((r) => r.featured);
  const others = reviews.filter((r) => !r.featured);
  const reviewDate = (r) => (r.date ? ` · ${esc(monthFmt.format(new Date(`${r.date}-15`)))}` : '');
  const sectionLink = (id) => c.link('menu', `#${id}`);

  const body = `<main id="contenu">
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow" data-reveal>${esc(H.hero.eyebrow)}</p>
      <h1 class="display" data-reveal style="--d:.08s">${H.hero.title}</h1>
      <p class="lead" data-reveal style="--d:.16s">${esc(H.hero.lead)}</p>
      <div class="actions" data-reveal style="--d:.24s">
        <a class="btn btn--solid" href="${c.link('book')}">${esc(H.hero.book)}${icon('arrow', 'ico ico--btn')}</a>
        <a class="btn btn--text" href="${c.link('menu')}">${esc(H.hero.menu)}</a>
      </div>
      <p class="seal" data-reveal style="--d:.32s"><span class="seal__mark" aria-hidden="true"></span>${esc(H.hero.michelin)}</p>
    </div>
    <div class="hero__visual">
      <div class="rings" aria-hidden="true"><i></i><i></i><i></i></div>
      <figure class="plate plate--hero" data-rotate="0.018" data-parallax="-0.05"><div class="plate__disc"><img src="${c.asset('img/plat-saumon.webp')}" alt="${esc(H.hero.imageAlt)}" width="1400" height="1400" fetchpriority="high" decoding="async"></div></figure>
    </div>
  </div>
  <div class="wrap">
    <ul class="ticket" data-reveal style="--d:.4s">
      <li class="ticket__status"><span class="dot" aria-hidden="true"></span><span data-status>${esc(L.home.visit.hours)}</span></li>
      <li>${icon('pin')}<span>${esc(site.address.street)}, ${esc(site.address.city)}</span></li>
      <li>${icon('phone')}<a href="tel:${site.phoneHref}">${esc(site.phone)}</a></li>
    </ul>
  </div>
</section>

<section class="story" id="restaurant" aria-labelledby="story-title">
  <div class="wrap story__grid">
    <figure class="arch" data-reveal><img src="${c.asset('img/salle.webp')}" alt="${esc(H.story.imageAlt)}" width="1400" height="1260" loading="lazy" decoding="async" data-parallax-img="0.06"></figure>
    <div class="story__text">
      <p class="eyebrow" data-reveal>${esc(H.story.eyebrow)}</p>
      <h2 class="h2" id="story-title" data-reveal style="--d:.08s">${H.story.title}</h2>
      ${H.story.paragraphs.map((p, i) => `<p data-reveal style="--d:${0.16 + i * 0.08}s">${esc(p)}</p>`).join('\n      ')}
      <ul class="facts" data-reveal style="--d:.3s">
        ${H.story.facts.map((f) => `<li>${icon(f.icon)}<span>${esc(f.text)}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<section class="carte" aria-labelledby="carte-title">
  <div class="wrap">
    <div class="carte__head">
      <div>
        <p class="eyebrow" data-reveal>${esc(H.menu.eyebrow)}</p>
        <h2 class="h2" id="carte-title" data-reveal style="--d:.08s">${H.menu.title}</h2>
        <p class="lead" data-reveal style="--d:.16s">${esc(H.menu.lead)}</p>
      </div>
      <aside class="formulas" data-reveal style="--d:.2s" aria-label="${esc(H.menu.formulasTitle)}">
        <dl>
          <div><dt>${esc(H.menu.three)}</dt><dd>${esc(L.money(formulas.three))}</dd></div>
          <div><dt>${esc(H.menu.four)}</dt><dd>${esc(L.money(formulas.four))}</dd></div>
          <div class="formulas__wine"><dt>${esc(H.menu.wine)}<small>${esc(H.menu.wineNote)}</small></dt><dd>${esc(L.money(formulas.wine3))} / ${esc(L.money(formulas.wine4))}</dd></div>
        </dl>
        <a class="btn btn--line btn--sm" href="${c.link('menu')}">${esc(H.menu.cta)}${icon('arrow', 'ico ico--btn')}</a>
      </aside>
    </div>
    <ul class="plates">
      <li data-reveal><a class="plate-link" href="${sectionLink('entrees')}">${circle(c, 'plat-saumon', H.menu.alts.entrees, '', 'data-rotate="-0.01"')}<span>${esc(H.menu.captions.entrees)}</span></a></li>
      <li data-reveal style="--d:.1s"><a class="plate-link plate-link--mid" href="${sectionLink('plats')}">${circle(c, 'plat-canard', H.menu.alts.plats, '', 'data-rotate="0.012"')}<span>${esc(H.menu.captions.plats)}</span></a></li>
      <li data-reveal style="--d:.2s"><a class="plate-link" href="${sectionLink('desserts')}">${circle(c, 'dessert-sorbets', H.menu.alts.desserts, '', 'data-rotate="-0.014"')}<span>${esc(H.menu.captions.desserts)}</span></a></li>
    </ul>
  </div>
</section>

<section class="reviews" aria-labelledby="reviews-title">
  <div class="wrap">
    <div class="reviews__head">
      <div>
        <p class="eyebrow" data-reveal>${esc(H.reviews.eyebrow)}</p>
        <h2 class="h2" id="reviews-title" data-reveal style="--d:.08s">${H.reviews.title}</h2>
      </div>
      <p class="score" data-reveal style="--d:.16s"><strong>${esc(site.rating.score)}</strong><span class="score__max">/5</span><small>${esc(fill(H.reviews.score, { count: site.rating.count }))}</small></p>
    </div>
    <div class="reviews__grid">
      <figure class="quote quote--lead" data-reveal>
        <blockquote lang="fr"><p class="quote__title">${esc(lead.title)}</p><p>${esc(lead.text)}</p></blockquote>
        <figcaption>${esc(lead.author)} · ${esc(H.reviews.source)} ${esc(lead.source)}${reviewDate(lead)}</figcaption>
      </figure>
      <div class="quotes">
        ${others.map((r, i) => `<figure class="quote" data-reveal style="--d:${0.08 * (i + 1)}s"><blockquote lang="fr"><p>${esc(r.text)}</p></blockquote><figcaption>${esc(r.author)} · ${esc(H.reviews.source)} ${esc(r.source)}</figcaption></figure>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="visit" aria-labelledby="visit-title">
  <div class="wrap visit__grid">
    <div class="visit__info">
      <p class="eyebrow eyebrow--light" data-reveal>${esc(H.visit.eyebrow)}</p>
      <h2 class="h2" id="visit-title" data-reveal style="--d:.08s">${H.visit.title}</h2>
      <ul class="visit__list" data-reveal style="--d:.16s">
        <li>${icon('phone')}<a href="tel:${site.phoneHref}">${esc(site.phone)}</a></li>
        <li>${icon('mail')}<a href="mailto:${site.email}">${esc(site.email)}</a></li>
        ${H.visit.notes.map((n, i) => `<li>${icon(['car', 'snow'][i] || 'car')}<span>${esc(n)}</span></li>`).join('\n        ')}
      </ul>
      <div class="actions" data-reveal style="--d:.24s">
        <a class="btn btn--light" href="${c.link('book')}">${esc(H.visit.book)}${icon('arrow', 'ico ico--btn')}</a>
        <a class="btn btn--ghost" href="tel:${site.phoneHref}">${icon('phone')}${esc(H.visit.call)}</a>
      </div>
    </div>
    <div class="visit__hours" data-reveal style="--d:.16s">
      <h3 class="visit__hours-title">${esc(H.visit.hours)}</h3>
      ${hoursTable(c)}
    </div>
  </div>
</section>
</main>`;
  return page(c, { body, bodyClass: 'is-home', ld: jsonLd(c) });
}

function menuPage(c) {
  const { L } = c;
  const P = L.menuPage;
  const sectionImg = { entrees: ['plat-saumon', L.home.menu.alts.entrees], plats: ['plat-canard', L.home.menu.alts.plats], desserts: ['dessert-sorbets', L.home.menu.alts.desserts] };
  const secs = menu.map((s) => {
    const items = s.items
      .map((it) => {
        const gloss = c.lang !== 'fr' && it.gloss ? `<p class="dish__gloss">${esc(it.gloss[c.lang])}</p>` : '';
        const desc = it.desc[c.lang] ? `<p class="dish__desc">${esc(it.desc[c.lang])}</p>` : '';
        const price = it.price
          ? `<p class="dish__price"><strong>${esc(L.money(formulas[it.price]))}</strong><small>${esc(fill(P.cheeseNote, { price: L.money(formulas.cheeseSwap) }))}</small></p>`
          : '';
        return `<article class="dish"><div class="dish__main"><h3 class="dish__name">${esc(it.name)}</h3>${gloss}${desc}${tagsHtml(L, it.tags)}</div>${price}</article>`;
      })
      .join('\n');
    const img = sectionImg[s.id] ? `<div class="section-plate">${circle(c, sectionImg[s.id][0], sectionImg[s.id][1])}</div>` : '';
    return `<section class="msec" id="${s.id}" data-section="${s.id}" aria-labelledby="h-${s.id}">
  <header class="msec__head">${img}<h2 class="h3" id="h-${s.id}">${esc(P.sections[s.id])}</h2></header>
  <div class="dishes">${items}</div>
</section>`;
  }).join('\n');

  const body = `<main id="contenu">
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow" data-reveal>${esc(P.eyebrow)}</p>
    <h1 class="display display--page" data-reveal style="--d:.08s">${P.title}</h1>
    <p class="lead" data-reveal style="--d:.16s">${esc(P.lead)}</p>
  </div>
</section>
<div class="wrap carte-layout">
  <aside class="carte-visual" aria-hidden="true" data-carte-visual>
    <div class="rings"><i></i><i></i></div>
    <div class="stack">
      <figure class="plate is-on" data-for="entrees"><div class="plate__disc"><img src="${c.asset('img/plat-saumon.webp')}" alt="" width="1400" height="1400" decoding="async"></div></figure>
      <figure class="plate" data-for="plats fromage"><div class="plate__disc"><img src="${c.asset('img/plat-canard.webp')}" alt="" width="1321" height="1321" loading="lazy" decoding="async"></div></figure>
      <figure class="plate" data-for="desserts"><div class="plate__disc"><img src="${c.asset('img/dessert-sorbets.webp')}" alt="" width="1400" height="1400" loading="lazy" decoding="async"></div></figure>
      <figure class="plate" data-for="formules"><div class="plate__disc"><img src="${c.asset('img/dessert-chocolat.webp')}" alt="" width="1400" height="1400" loading="lazy" decoding="async"></div></figure>
    </div>
  </aside>
  <div class="carte-body">
    <nav class="subnav" aria-label="${esc(P.eyebrow)}" data-subnav>
      <ul>
        ${[...menu.map((s) => [s.id, P.sections[s.id]]), ['formules', P.formulasTitle]].map(([id, label]) => `<li><a href="#${id}" data-target="${id}">${esc(label)}</a></li>`).join('\n        ')}
      </ul>
    </nav>
    ${secs}
    <section class="msec msec--formulas" id="formules" data-section="formules" aria-labelledby="h-formules">
      <header class="msec__head"><h2 class="h3" id="h-formules">${esc(P.formulasTitle)}</h2></header>
      <dl class="leaders">
        <div><dt>${esc(P.three)}</dt><dd>${esc(L.money(formulas.three))}</dd></div>
        <div><dt>${esc(P.four)}</dt><dd>${esc(L.money(formulas.four))}</dd></div>
      </dl>
      <header class="msec__head msec__head--sub"><h2 class="h3">${esc(P.wineTitle)}</h2><p>${esc(P.wineLead)}</p></header>
      <dl class="leaders">
        <div><dt>${esc(P.wine3)}</dt><dd>${esc(L.money(formulas.wine3))}</dd></div>
        <div><dt>${esc(P.wine4)}</dt><dd>${esc(L.money(formulas.wine4))}</dd></div>
      </dl>
    </section>
    <div class="carte-notes">
      ${P.notes.map((n) => `<p>${esc(n)}</p>`).join('\n      ')}
      <a class="btn btn--solid" href="${c.link('book')}">${esc(P.book)}${icon('arrow', 'ico ico--btn')}</a>
    </div>
  </div>
</div>
</main>`;
  return page(c, { body, bodyClass: 'is-carte' });
}

function bookPage(c) {
  const { L } = c;
  const B = L.book;
  const F = B.form;
  const guestOpts = Array.from({ length: site.maxGuests }, (_, i) => i + 1)
    .map((n) => `<option value="${n}"${n === 2 ? ' selected' : ''}>${esc(fill(n === 1 ? F.guestOne : F.guestMany, { n }))}</option>`)
    .join('');
  const body = `<main id="contenu">
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow" data-reveal>${esc(B.eyebrow)}</p>
    <h1 class="display display--page" data-reveal style="--d:.08s">${B.title}</h1>
    <p class="lead" data-reveal style="--d:.16s">${esc(B.lead)}</p>
  </div>
</section>
<div class="wrap book-grid">
  <aside class="book-side" data-reveal>
    <h2 class="h4">${esc(B.phoneTitle)}</h2>
    <a class="bigphone" href="tel:${site.phoneHref}">${esc(site.phone)}</a>
    <p class="muted">${esc(B.phoneNote)}</p>
    <h2 class="h4">${esc(B.hoursTitle)}</h2>
    ${hoursTable(c)}
    <p class="small">${esc(fill(B.groupNote, { max: site.maxGuests }))}</p>
    <p class="small">${esc(B.cancelNote)}</p>
  </aside>
  <div class="book-form" data-reveal style="--d:.1s">
    <form id="booking-form" novalidate data-privacy="${c.link('privacy')}">
      <div class="form-grid">
        <div class="field"><label for="date">${esc(F.date)}</label><input id="date" name="date" type="date" required autocomplete="off"><p class="field__error" id="date-error" aria-live="polite"></p></div>
        <div class="field"><label for="time">${esc(F.time)}</label><select id="time" name="time" required disabled><option value="">${esc(F.choose)}</option></select><p class="field__error" id="time-error" aria-live="polite"></p></div>
        <div class="field"><label for="guests">${esc(F.guests)}</label><select id="guests" name="guests" required>${guestOpts}</select></div>
        <div class="field"><label for="name">${esc(F.name)}</label><input id="name" name="name" type="text" required autocomplete="name"><p class="field__error" id="name-error" aria-live="polite"></p></div>
        <div class="field"><label for="phone">${esc(F.phone)}</label><input id="phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel"><p class="field__error" id="phone-error" aria-live="polite"></p></div>
        <div class="field"><label for="email">${esc(F.email)}</label><input id="email" name="email" type="email" required autocomplete="email" inputmode="email"><p class="field__error" id="email-error" aria-live="polite"></p></div>
        <div class="field field--wide"><label for="note">${esc(F.note)} <span class="muted">· ${esc(F.noteHint)}</span></label><textarea id="note" name="note" rows="3"></textarea></div>
      </div>
      <div class="hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
      <div class="field field--check"><input id="consent" name="consent" type="checkbox" required><label for="consent">${fill(F.consent, { privacy: c.link('privacy') })}</label><p class="field__error" id="consent-error" aria-live="polite"></p></div>
      <button class="btn btn--solid btn--lg" type="submit">${esc(F.submit)}${icon('arrow', 'ico ico--btn')}</button>
      <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
      <noscript><p class="form-status is-error">${esc(fill(B.noscript, { phone: site.phone, email: site.email }))}</p></noscript>
    </form>
  </div>
</div>
</main>`;
  return page(c, { body, bodyClass: 'is-book' });
}

function contactPage(c) {
  const { L } = c;
  const C = L.contact;
  const dirs = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;
  const body = `<main id="contenu">
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow" data-reveal>${esc(C.eyebrow)}</p>
    <h1 class="display display--page" data-reveal style="--d:.08s">${C.title}</h1>
    <p class="lead" data-reveal style="--d:.16s">${esc(C.lead)}</p>
  </div>
</section>
<div class="wrap contact-grid">
  <div class="contact-info" data-reveal>
    <dl class="infolist">
      <div>${icon('pin')}<dt>${esc(C.address)}</dt><dd>${esc(site.address.street)}<br>${esc(site.address.zip)} ${esc(site.address.city)}, Belgique<br><a class="textlink" href="${dirs}" rel="noopener">${esc(C.directions)}</a></dd></div>
      <div>${icon('phone')}<dt>${esc(C.phone)}</dt><dd><a class="bigphone bigphone--sm" href="tel:${site.phoneHref}">${esc(site.phone)}</a></dd></div>
      <div>${icon('mail')}<dt>${esc(C.email)}</dt><dd><a href="mailto:${site.email}">${esc(site.email)}</a></dd></div>
      <div>${icon('car')}<dt>${esc(C.access)}</dt><dd>${esc(C.accessText)}</dd></div>
    </dl>
    <h2 class="h4">${esc(C.hours)}</h2>
    ${hoursTable(c)}
    <a class="btn btn--solid" href="${c.link('book')}">${esc(L.ui.nav.book)}${icon('arrow', 'ico ico--btn')}</a>
  </div>
  <div class="contact-media">
    <figure class="facade" data-reveal><img src="${c.asset('img/facade.webp')}" alt="${esc(C.facadeAlt)}" width="817" height="519" loading="lazy" decoding="async"></figure>
    <div class="map" data-map data-src="${embed}" data-title="${esc(C.mapFrame)}" data-reveal style="--d:.1s">
      <div class="map__ph">
        <p class="map__title">${esc(C.mapTitle)}</p>
        <button class="btn btn--line btn--sm" type="button" data-map-load>${esc(C.mapButton)}</button>
        <p class="map__consent">${fill(C.mapConsent, { privacy: c.link('privacy') })}</p>
      </div>
    </div>
  </div>
</div>
</main>`;
  return page(c, { body, bodyClass: 'is-contact' });
}

function textPage(c, key) {
  const { L } = c;
  const T = L[key];
  const sections = T.sections
    .map((s, i) => `<section id="s${i + 1}"><h2 class="h4">${esc(s.h)}</h2>${s.html.replace(/\{\{(\w+)\}\}/g, (_, k) => legalValue(L, k))}</section>`)
    .join('\n');
  const body = `<main id="contenu">
<section class="page-head page-head--text">
  <div class="wrap">
    <p class="eyebrow">${esc(T.eyebrow)}</p>
    <h1 class="display display--page">${T.title}</h1>
    <p class="muted">${esc(T.updated)}</p>
  </div>
</section>
<div class="wrap"><div class="prose">${sections}</div></div>
</main>`;
  return page(c, { body, bodyClass: 'is-text' });
}

/* ---------- écriture ---------- */
const renderers = { home: homePage, menu: menuPage, book: bookPage, contact: contactPage, legal: (c) => textPage(c, 'legal'), privacy: (c) => textPage(c, 'privacy') };

async function main() {
  // nettoyage des pages générées lors d'un build précédent
  const known = new Set(['nl', 'en']);
  for (const l of ORDER) for (const k of PAGES) if (k !== 'home' && l === 'fr') known.add(LANGS[l].slugs[k]);
  for (const d of known) await rm(path.join(OUT, d), { recursive: true, force: true });
  await rm(path.join(OUT, 'index.html'), { force: true });

  const written = [];
  for (const lang of ORDER) {
    for (const key of PAGES) {
      const c = makeCtx(lang, key);
      const file = path.join(OUT, ...c.segs, 'index.html');
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, renderers[key](c));
      written.push(file);
    }
  }

  if (PRODUCTION) {
    const urls = ORDER.flatMap((l) => PAGES.map((k) => absUrl(l, k)));
    const sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${PAGES.flatMap((k) =>
      ORDER.map((l) => `  <url><loc>${absUrl(l, k)}</loc>${ORDER.map((a) => `<xhtml:link rel="alternate" hreflang="${LANGS[a].htmlLang}" href="${absUrl(a, k)}"/>`).join('')}</url>`),
    ).join('\n')}\n</urlset>\n`;
    await writeFile(path.join(OUT, 'sitemap.xml'), sm);
    await writeFile(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
    void urls;
  } else {
    await rm(path.join(OUT, 'sitemap.xml'), { force: true });
    await rm(path.join(OUT, 'robots.txt'), { force: true });
  }
  console.log(`${written.length} pages (${PRODUCTION ? 'production' : 'aperçu, noindex'}${CLEAN ? ', URL propres' : ''})`);
}
main();
