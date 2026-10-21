import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createScene } from './scene.js';

gsap.registerPlugin(ScrollTrigger);
window.__tamoto = true;

const root = document.documentElement;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) root.classList.add('reduced');

/* -------------------------------------------------------------------------
   Word-by-word masks for headings
   ------------------------------------------------------------------------- */
function splitWords(el) {
  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
          } else {
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  walk(el);
  $$('.w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
}
$$('[data-split]').forEach(splitWords);

/* -------------------------------------------------------------------------
   WebGL backdrop
   ------------------------------------------------------------------------- */
let scene = { set() {} };
try {
  scene = createScene($('#gl'), { reduced });
} catch (err) {
  // No WebGL: the page stays fully usable on the CSS glow alone.
  $('#gl').remove();
  console.warn('WebGL indisponible', err);
}

/* -------------------------------------------------------------------------
   Smooth scroll (Lenis) wired to ScrollTrigger
   ------------------------------------------------------------------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', (e) => {
    ScrollTrigger.update();
    scene.set({ scroll: e.scroll, velocity: e.velocity });
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
} else {
  window.addEventListener('scroll', () => scene.set({ scroll: window.scrollY }), { passive: true });
}

const header = $('.site-header');
ScrollTrigger.create({
  onUpdate: (self) => header.classList.toggle('is-stuck', self.scroll() > 60),
});

function scrollToEl(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target.scrollIntoView({ block: 'start' });
}

/* -------------------------------------------------------------------------
   Initial hidden states (the CSS hides them too, this takes over the transform)
   ------------------------------------------------------------------------- */
const heroIn = $$('[data-hero-in]');
const heroWords = $$('[data-hero-title] .wi');
const allWords = $$('.wi').filter((w) => !w.closest('[data-hero-title]'));

if (reduced) {
  gsap.set(['.wi', '.reveal', '[data-rise]'], { clearProps: 'all', opacity: 1 });
  $$('[data-split]').forEach((el) => el.classList.add('is-ready'));
} else {
  gsap.set('.wi', { yPercent: 112 });
  $$('[data-split]').forEach((el) => el.classList.add('is-ready'));
  gsap.set('.reveal', { opacity: 0, y: 26 });
  gsap.set('[data-rise]', { opacity: 0, y: 90 });
}

/* -------------------------------------------------------------------------
   Intro (hero)
   ------------------------------------------------------------------------- */
if (!reduced) {
  const proxy = { appear: 0 };
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
  intro
    .fromTo('[data-hero-vehicle]', { opacity: 0, scale: 0.76, y: 90, rotate: -3 }, { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 1.9 }, 0.15)
    .fromTo('.hero__glow', { opacity: 0, scale: 0.55 }, { opacity: 0.85, scale: 1, duration: 2.4 }, 0)
    .to(proxy, { appear: 1, duration: 2.6, ease: 'power3.out', onUpdate: () => scene.set({ appear: proxy.appear }) }, 0)
    .to(heroWords, { yPercent: 0, duration: 1.35, stagger: 0.09 }, 0.2)
    .to(heroIn, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.5)
    .from('.usps li', { y: 46, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.9);

  // idle float of the hero vehicle (separate element from the scroll transform)
  gsap.to('[data-hero-vehicle] img', { y: -12, rotate: -0.6, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

/* pointer parallax on the hero stage + 3D scene */
if (!reduced && window.matchMedia('(pointer: fine)').matches) {
  const stage = $('.hero__stage');
  gsap.set(stage, { transformPerspective: 1400 });
  const rx = gsap.quickTo(stage, 'rotationX', { duration: 1.1, ease: 'power3.out' });
  const ry = gsap.quickTo(stage, 'rotationY', { duration: 1.1, ease: 'power3.out' });
  const sx = gsap.quickTo(stage, 'x', { duration: 1.1, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    scene.set({ px: nx, py: ny });
    ry(nx * 5);
    rx(ny * -4);
    sx(nx * -14);
  });
}

/* -------------------------------------------------------------------------
   Scroll-driven animations
   ------------------------------------------------------------------------- */
const mm = gsap.matchMedia();

// Shared by every viewport – headings, reveals, counters, marquee, accessories…
function commonScroll() {
  // headings: word by word, tied to the scroll position
  $$('[data-split]').forEach((el) => {
    if (el.closest('[data-hero-title]') || el.matches('[data-hero-title]')) return;
    const words = $$('.wi', el);
    gsap.to(words, {
      yPercent: 0,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 52%', scrub: 0.7 },
    });
  });

  // small reveals
  $$('.reveal').forEach((el) => {
    if (el.hasAttribute('data-hero-in')) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 74%', scrub: 0.6 },
    });
  });

  // cards rising
  $$('[data-rise]').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 66%', scrub: 0.7 },
    });
    const media = $('.why__icon, .acard__media .picto', el);
    if (media) {
      gsap.fromTo(media, { rotate: -24, scale: 0.7 }, { rotate: 0, scale: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 55%', scrub: 0.8 } });
    }
  });

  // counters
  $$('[data-count]').forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    el.textContent = reduced ? end : '0';
    if (reduced) return;
    gsap.to(obj, {
      v: end,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // brand marquees (opposite directions, scrubbed)
  $$('[data-marquee]').forEach((wrap) => {
    const row = $('.marquee__row', wrap);
    const dir = parseInt(wrap.dataset.marquee, 10);
    if (!row.dataset.cloned) {
      const originals = Array.from(row.children);
      for (let k = 0; k < 2; k++) {
        originals.forEach((li) => {
          const c = li.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          $('img', c).alt = '';
          row.appendChild(c);
        });
      }
      row.dataset.cloned = '1';
    }
    const travel = () => row.scrollWidth / 3;
    gsap.fromTo(
      row,
      { x: () => (dir < 0 ? 0 : -travel()) },
      {
        x: () => (dir < 0 ? -travel() : 0),
        ease: 'none',
        scrollTrigger: { trigger: '.brands', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
      },
    );
  });

  // newsletter: orange circle expands from the bottom edge
  gsap.fromTo(
    '.news__bg',
    { '--reveal': '0%' },
    { '--reveal': '150%', ease: 'power2.out', scrollTrigger: { trigger: '.news', start: 'top 92%', end: 'top 8%', scrub: 0.6 } },
  );

  // giant footer wordmark
  gsap.fromTo(
    '.footer__giant span',
    { yPercent: 38 },
    { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.footer__giant', start: 'top bottom', end: 'bottom bottom', scrub: true } },
  );
}

/* ---- Universe: pinned chapters ------------------------------------------ */
const uni = $('[data-universe]');
const uniTitles = $$('.uni__title', uni);
const uniMetas = $$('.uni__meta', uni);
const uniGhosts = $$('.ghost', uni);
const uniItems = $$('.uni__item', uni);
const uniBtns = $$('.uni__nav button', uni);
const uniNum = $('[data-uni-num]');
const STEPS = uniItems.length;
let uniTrigger = null;
let uniST = null;
let heroST = null;
let heroK = 1;
let currentChapter = 0;

function setChapterUI(i) {
  currentChapter = i;
  uniBtns.forEach((b, k) => b.classList.toggle('is-on', k === i));
  uniNum.textContent = String(i + 1).padStart(2, '0');
}

function goChapter(i) {
  if (uniTrigger) {
    const span = uniTrigger.end - uniTrigger.start;
    scrollToEl(uniTrigger.start + span * ((i + 0.3) / (STEPS + 0.2)));
  } else {
    // calm version – switch chapter without any motion
    [uniTitles, uniMetas, uniGhosts, uniItems].forEach((list) => list.forEach((el, k) => el.classList.toggle('is-on', k === i)));
    uniTitles.forEach((t, k) => gsap.set($('span', t), { yPercent: k === i ? 0 : 115, visibility: k === i ? 'visible' : 'hidden' }));
    setChapterUI(i);
  }
}
uniBtns.forEach((b) => b.addEventListener('click', () => goChapter(parseInt(b.dataset.go, 10))));

function universeScroll() {
  gsap.set(uniTitles.map((t) => $('span', t)), { yPercent: (i) => (i === 0 ? 0 : 115), visibility: 'visible' });
  gsap.set(uniMetas, { opacity: (i) => (i === 0 ? 1 : 0) });
  gsap.set(uniGhosts, { opacity: (i) => (i === 0 ? 1 : 0) });
  gsap.set(uniItems, { opacity: (i) => (i === 0 ? 1 : 0) });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    scrollTrigger: {
      trigger: uni,
      start: 'top top',
      end: () => '+=' + window.innerHeight * 3.4,
      pin: $('.uni__pin', uni),
      refreshPriority: 2,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set($('.uni__bar i', uni), { scaleX: self.progress });
      },
    },
    // the scrubbed timeline lags slightly behind the scroll: derive the chapter from its own time
    onUpdate: () => {
      const idx = clamp(Math.floor(tl.time() + 0.2), 0, STEPS - 1);
      if (idx !== currentChapter) setChapterUI(idx);
    },
  });
  uniTrigger = tl.scrollTrigger;
  uniST = uniTrigger;

  for (let i = 0; i < STEPS - 1; i++) {
    const t = i + 0.55;
    tl.to($('span', uniTitles[i]), { yPercent: -115, duration: 0.5 }, t)
      .to(uniItems[i], { xPercent: -22, scale: 1.25, opacity: 0, rotate: -3, duration: 0.55 }, t)
      .to(uniGhosts[i], { xPercent: -14, opacity: 0, duration: 0.55 }, t)
      .to(uniMetas[i], { opacity: 0, duration: 0.25 }, t)
      .fromTo($('span', uniTitles[i + 1]), { yPercent: 115 }, { yPercent: 0, duration: 0.55 }, t + 0.2)
      .fromTo(uniItems[i + 1], { xPercent: 22, scale: 0.74, opacity: 0, rotate: 3 }, { xPercent: 0, scale: 1, opacity: 1, rotate: 0, duration: 0.65 }, t + 0.2)
      .fromTo(uniGhosts[i + 1], { xPercent: 14, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.55 }, t + 0.2)
      .to(uniMetas[i + 1], { opacity: 1, duration: 0.3 }, t + 0.5);
  }
  tl.to({}, { duration: 0.3 }, STEPS - 0.3 + 0.2); // hold on the last chapter

  // slow drift of the outlined word behind the vehicle
  gsap.to('.uni__ghosts', { xPercent: -4, ease: 'none', scrollTrigger: { trigger: uni, start: 'top top', end: () => '+=' + window.innerHeight * 3.4, scrub: true } });
}

/* ---- Hero ----------------------------------------------------------------- */
function heroScrollDesktop() {
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: () => '+=' + window.innerHeight * 1.7,
      pin: '.hero__pin',
      refreshPriority: 3,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  heroST = tl.scrollTrigger;
  heroK = 1;
  tl.to('.hero__copy', { yPercent: -14, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0)
    .to('.hero__vertical, .hero__hint', { opacity: 0, duration: 0.2 }, 0)
    .to('.usps', { opacity: 0, yPercent: 60, duration: 0.45 }, 0.05)
    .to('.hero__glow', { scale: 1.6, opacity: 1, duration: 1.1 }, 0)
    .to('[data-hero-vehicle]', { scale: 1.55, xPercent: -6, yPercent: -2, duration: 1.1, ease: 'power2.in' }, 0)
    .to('.hero__flash', { opacity: 1, duration: 0.35, ease: 'power2.in' }, 0.78)
    .to('[data-hero-vehicle]', { opacity: 0, duration: 0.25, ease: 'none' }, 0.85)
    .to('.hero__glow', { opacity: 0, duration: 0.3 }, 1.05)
    .to('.hero__flash', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 1.15);
}

function heroScrollCompact() {
  // phones/tablets: no pin – the vehicle simply drifts and fades as the hero leaves
  heroST = ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top' });
  heroK = 0.6;
  gsap.to('[data-hero-vehicle]', { yPercent: 8, scale: 1.12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__copy', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---- Fleet: pinned horizontal gallery -------------------------------------- */
function fleetScroll() {
  const track = $('[data-fleet-track]');
  const bar = $('.fleet__progress i');
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const slide = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.fleet',
      start: 'top top',
      end: () => '+=' + dist(),
      pin: '.fleet__pin',
      refreshPriority: 1,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    },
  });

  $$('[data-card]', track).forEach((card) => {
    const img = $('.vcard__img', card);
    gsap.fromTo(img, { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true } });
    gsap.from(card, { opacity: 0, y: 70, ease: 'power3.out', scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 98%', end: 'left 72%', scrub: true } });
  });
}

mm.add(
  { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1001px)' },
  (ctx) => {
    const { motion, desktop } = ctx.conditions;
    if (!motion) return;
    if (desktop) heroScrollDesktop();
    else heroScrollCompact();
    commonScroll();
    universeScroll();
    if (desktop) fleetScroll();
  },
);

if (!reduced) {
  // the WebGL scene reads the scroll progress of the pinned sections every frame
  gsap.ticker.add(() => scene.set({ hero: heroST ? heroST.progress * heroK : 0, uni: uniST ? uniST.progress : 0 }));
}

if (reduced) {
  // calm version: everything visible, no pinning, counters at their final value
  $$('[data-count]').forEach((el) => (el.textContent = el.dataset.count));
  $('.news__bg').style.setProperty('--reveal', '150%');
  $$('.marquee__row').forEach((row) => row.parentElement.style.overflowX = 'auto');
}

/* -------------------------------------------------------------------------
   Navigation: anchors, mobile menu, newsletter
   ------------------------------------------------------------------------- */
const menu = $('#menu');
const burger = $('.burger');
function toggleMenu(open) {
  const willOpen = typeof open === 'boolean' ? open : menu.hidden;
  menu.hidden = !willOpen;
  burger.setAttribute('aria-expanded', String(willOpen));
  burger.setAttribute('aria-label', willOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  burger.querySelector('use').setAttribute('href', willOpen ? '#i-close' : '#i-menu');
  if (lenis) willOpen ? lenis.stop() : lenis.start();
  if (willOpen) gsap.fromTo('#menu li', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.04 });
}
burger.addEventListener('click', () => toggleMenu());
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) toggleMenu(false); });

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href');
  const chapter = a.dataset.chapter;
  e.preventDefault();
  if (!menu.hidden) toggleMenu(false);
  if (chapter !== undefined) {
    const go = () => goChapter(parseInt(chapter, 10));
    if (uniTrigger) {
      // reach the pinned section first, then glide to the requested chapter
      go();
    } else {
      scrollToEl($('#univers'));
      go();
    }
    return;
  }
  if (hash === '#top' || hash === '#') return scrollToEl(0, { duration: 1.6 });
  const target = $(hash);
  if (target) scrollToEl(target, { offset: hash === '#contact' ? 0 : -4 });
});

const form = $('.news__form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('input', form);
  const msg = $('.news__msg', form);
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
  msg.textContent = ok ? 'Merci, à très vite !' : 'Veuillez saisir une adresse email valide.';
  if (ok) input.value = '';
  gsap.fromTo(msg, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
});

/* -------------------------------------------------------------------------
   Layout refresh once fonts/images are in
   ------------------------------------------------------------------------- */
const refresh = () => ScrollTrigger.refresh();
window.addEventListener('load', refresh);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
