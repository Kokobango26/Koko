import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createWorld } from './world.js';
import { createGate } from './gate.js';

gsap.registerPlugin(ScrollTrigger);
window.__tamoto2 = true;

const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) root.classList.add('reduced');

/* ---------- words ---------------------------------------------------------- */
function splitWords(el) {
  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
          const w = document.createElement('span');
          w.className = 'w';
          const wi = document.createElement('span');
          wi.className = 'wi';
          wi.textContent = part;
          w.appendChild(wi);
          frag.appendChild(w);
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

/* ---------- layers ----------------------------------------------------------- */
let world = { set() {}, snap() {} };
let gate = { set() {}, state: {} };
try {
  world = createWorld($('#bg'), { reduced });
} catch (e) {
  console.warn('Shader indisponible', e);
}
try {
  gate = createGate($('#gl'), { reduced });
} catch (e) {
  $('#gl').remove();
  console.warn('WebGL indisponible', e);
}
world.set({ world: 0, gx: 0.6, gy: 0.46, glow: 1.15 });
world.snap();

/* ---------- smooth scroll ------------------------------------------------------ */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', (e) => {
    ScrollTrigger.update();
    gate.set({ scroll: e.scroll, velocity: e.velocity });
    world.set({ warp: clamp(Math.abs(e.velocity) / 60, 0, 1.2) });
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
function scrollToEl(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target.scrollIntoView({ block: 'start' });
}

/* ---------- elements ----------------------------------------------------------- */
const stage = $('[data-stage]');
const pin = $('.stage__pin');
const actor = $('[data-actor]');
const imgs = {};
$$('[data-actor-img]').forEach((el) => (imgs[el.dataset.actorImg] = el));
const gws = {};
$$('.gw').forEach((el) => (gws[el.dataset.gw] = el));
const beats = {};
$$('.beat').forEach((el) => (beats[el.dataset.beat] = el));
const deals = $('[data-deals]');
const pills = $('[data-pills]');
const rail = $('[data-rail]');
const badge = $('.roundbadge');
const header = $('.head');

if (reduced) {
  gsap.set(['.wi', '.reveal', '[data-rise]'], { clearProps: 'all', opacity: 1 });
  $$('[data-split]').forEach((el) => el.classList.add('is-ready'));
  $$('[data-count]').forEach((el) => (el.textContent = el.dataset.count));
  $('#loader').remove();
  root.classList.remove('is-loading');
} else {
  gsap.set('.wi', { yPercent: 115 });
  gsap.set('.reveal', { opacity: 0, y: 24 });
  gsap.set('[data-rise]', { opacity: 0, y: 80 });
  $$('[data-split]').forEach((el) => el.classList.add('is-ready'));
}

/* ---------- chapter geometry ----------------------------------------------------- */
const T = 8.6;
const S = [1.8, 3.3, 4.8, 6.3]; // start of the transition into chapters 2..5
const GO = [0, 1.35, 3.0, 4.5, 6.0, 7.5]; // resting time of each rail entry
const BREAKS = [0.45, 2.15, 3.65, 5.15, 6.65];
let stageST = null;
let inFinale = false;
const railBtns = $$('button', rail);
let railIdx = 0;
function setRail(i) {
  railIdx = i;
  railBtns.forEach((b, k) => b.classList.toggle('is-on', k === i));
  rail.classList.toggle('on-yellow', i === 5);
}
function goChapter(i) {
  if (stageST) {
    scrollToEl(stageST.start + (stageST.end - stageST.start) * (GO[i] / T));
  } else {
    // calm version
    $$('.beat--chap')[i - 2]?.scrollIntoView({ block: 'start' });
  }
}
railBtns.forEach((b) => b.addEventListener('click', () => goChapter(parseInt(b.dataset.go, 10))));

/* ---------- the continuous scene -------------------------------------------------- */
function buildStage(compact) {
  const ws = { w: 0 };
  gsap.set(Object.values(imgs).slice(1), { xPercent: 36, scale: 0.78, rotationY: -28, opacity: 0 });
  gsap.set([gws[2], gws[3], gws[4], gws[5]], { yPercent: 32, opacity: 0, scale: 1.12 });
  gsap.set([beats[1], beats[2], beats[3], beats[4], beats[5]], { opacity: 0, y: 40 });
  gsap.set(deals, { opacity: 0 });
  gsap.set(rail, { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (compact ? 6.4 : 7.6),
      pin,
      scrub: 0.8,
      anticipatePin: 1,
      refreshPriority: 3,
      invalidateOnRefresh: true,
    },
    onUpdate: () => {
      if (!inFinale) world.set({ world: ws.w });
      const t = tl.time();
      const idx = BREAKS.filter((b) => b <= t).length;
      if (idx !== railIdx) setRail(idx);
    },
  });
  stageST = tl.scrollTrigger;
  tl.to({}, { duration: T }, 0);

  // 0 → 1 : le hero cède la place aux offres
  tl.to(beats[0], { opacity: 0, yPercent: -6, duration: 0.5, ease: 'power2.in' }, 0)
    .to(gws[0], { yPercent: -30, opacity: 0, scale: 0.92, duration: 0.85 }, 0)
    .to(pills, { opacity: 0, duration: 0.35 }, 0)
    .to(imgs[0], { scale: 1.12, rotationY: -12, xPercent: -6, duration: 0.9 }, 0)
    .to(ws, { w: 1, duration: 0.9 }, 0)
    .to(deals, { opacity: 1, duration: 0.4 }, 0.2)
    .to(rail, { opacity: 1, duration: 0.4 }, 0.3)
    .to(beats[1], { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.5);
  $$('[data-deals-row]').forEach((row) => {
    const dir = parseInt(row.dataset.dealsRow, 10);
    tl.fromTo(row, { xPercent: dir < 0 ? 0 : -52 }, { xPercent: dir < 0 ? -52 : 0, ease: 'none', duration: 2.2 }, 0.1);
  });
  $$('.fpill', pills).forEach((p) => tl.to(p, { yPercent: parseFloat(p.dataset.depth) * -160, duration: 0.9, ease: 'none' }, 0));

  // chapitres : le véhicule change, le monde de couleur se fond
  S.forEach((s, k) => {
    const ch = 2 + k;
    const prevImg = k === 0 ? imgs[0] : imgs[ch - 1];
    const prevBeat = k === 0 ? beats[1] : beats[ch - 1];
    tl.to(prevImg, { xPercent: -48, rotationY: 26, scale: 1.22, opacity: 0, duration: 0.7 }, s)
      .to(prevBeat, { opacity: 0, y: -30, duration: 0.35 }, s)
      .to(ws, { w: ch, duration: 0.8 }, s)
      .to(imgs[ch], { xPercent: 0, rotationY: 0, scale: 1, opacity: 1, duration: 0.85, ease: 'power3.out' }, s + 0.25)
      .to(gws[ch], { yPercent: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' }, s + 0.25)
      .to(beats[ch], { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, s + 0.5);
    if (k === 0) tl.to(deals, { opacity: 0, duration: 0.45 }, s);
    else tl.to(gws[ch - 1], { yPercent: -32, opacity: 0, scale: 0.92, duration: 0.65 }, s);
  });

  // sortie : le sujet quitte la scène, le monde s'assombrit
  tl.to(imgs[5], { yPercent: 18, opacity: 0, scale: 1.18, duration: 0.7 }, 7.8)
    .to(gws[5], { yPercent: -32, opacity: 0, duration: 0.65 }, 7.8)
    .to(beats[5], { opacity: 0, y: -30, duration: 0.35 }, 7.8)
    .to(ws, { w: 6, duration: 0.8 }, 7.8)
    .to(rail, { opacity: 0, duration: 0.3 }, 7.9)
    .to(badge, { opacity: 0, duration: 0.3 }, 0.1);
}

/* ---------- other sections ------------------------------------------------------------ */
function sections(desktop) {
  // headings, reveals, rising cards, counters
  $$('[data-split]').forEach((el) => {
    gsap.to($$('.wi', el), { yPercent: 0, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 52%', scrub: 0.7 } });
  });
  $$('.reveal').forEach((el) => {
    if (el.hasAttribute('data-hero-in')) return;
    gsap.to(el, { opacity: 1, y: 0, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 74%', scrub: 0.6 } });
  });
  $$('[data-rise]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 66%', scrub: 0.7 } });
    const pic = $('.picto', el);
    if (pic) gsap.fromTo(pic, { rotate: -22, scale: 0.7 }, { rotate: 0, scale: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 55%', scrub: 0.8 } });
  });
  $$('[data-count]').forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    const o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  // brand marquees
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
    gsap.fromTo(row, { x: () => (dir < 0 ? 0 : -travel()) }, { x: () => (dir < 0 ? -travel() : 0), ease: 'none', scrollTrigger: { trigger: '.brands', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } });
  });

  // horizontal fleet
  if (desktop) {
    const track = $('[data-fleet-track]');
    const bar = $('.fleet__progress i');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const slide = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: '.fleet', start: 'top top', end: () => '+=' + dist(), pin: '.fleet__pin', scrub: 0.8, anticipatePin: 1, refreshPriority: 1, invalidateOnRefresh: true, onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }) },
    });
    $$('[data-card]', track).forEach((card) => {
      gsap.fromTo($('.vcard__img', card), { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true } });
      gsap.from(card, { opacity: 0, y: 70, ease: 'power3.out', scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 98%', end: 'left 72%', scrub: true } });
    });
  }

  // finale: the subject comes back, the sunset world returns
  gsap.fromTo('.finale__word', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: '.finale', start: 'top 80%', end: 'top 10%', scrub: 0.7 } });
  gsap.fromTo('.finale__actor', { yPercent: 38, scale: 0.78, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: '.finale', start: 'top 70%', end: 'top -5%', scrub: 0.8 } });
  ScrollTrigger.create({ trigger: '.finale', start: 'top 75%', onEnter: () => { inFinale = true; world.set({ world: 7, gx: 0.5, gy: 0.62, glow: 1.2 }); }, onLeaveBack: () => { inFinale = false; world.set({ world: 6, gx: 0.6, gy: 0.46, glow: 1 }); } });
  gsap.fromTo('.footer', { yPercent: 0 }, { yPercent: 0, scrollTrigger: { trigger: '.footer', start: 'top bottom' } });

  // header over the light sections
  ScrollTrigger.create({ trigger: '.why', start: 'top 60px', endTrigger: '.acc', end: 'bottom 60px', toggleClass: { targets: header, className: 'head--light' } });
}

const mm = gsap.matchMedia();
if (!reduced) {
  mm.add({ desktop: '(min-width: 1001px)', compact: '(max-width: 1000px)' }, (ctx) => {
    const desktop = ctx.conditions.desktop;
    buildStage(!desktop);
    sections(desktop);
  });
}

/* ---------- intro: the camera flies through the tyre ------------------------------------ */
function intro() {
  const heroImg = imgs[0];
  const bar = $('.loader__bar i');
  const num = $('[data-load-n]');
  const prog = { v: 0 };
  const paint = () => {
    gsap.set(bar, { scaleX: prog.v / 100 });
    num.textContent = Math.round(prog.v);
  };
  gsap.to(prog, { v: 88, duration: 1.4, ease: 'power2.out', onUpdate: paint });

  const loaded = Promise.all([
    document.fonts && document.fonts.ready,
    heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1500)),
  ]);

  // starting poses (targets differ from the scroll timeline: wrappers / children only)
  gsap.set(actor, { y: 140, scale: 0.55, opacity: 0, transformOrigin: '50% 100%' });
  gsap.set('.gw--hero .gw__t, .gw--hero .gw__x', { opacity: 0, scale: 1.35, transformOrigin: '50% 60%' });
  gsap.set('.fpill', { opacity: 0, scale: 0.6, y: 30 });
  gate.set({ dolly: 0, show: 0 });
  const heroWords = $$('.hero-title .wi');

  loaded.then(() => {
    gsap.to(prog, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: paint });
    const tl = gsap.timeline({ delay: 0.3, defaults: { ease: 'expo.out' } });
    tl.to('#loader', { opacity: 0, duration: 0.7, ease: 'power2.inOut', onComplete: () => $('#loader').remove() }, 0)
      .to(gate.state, { dolly: 1, duration: 2.7, ease: 'power3.in', onUpdate: () => gate.set({ dolly: gate.state.dolly }) }, 0.3)
      .to(gate.state, { spin: 1.4, duration: 3, ease: 'power2.out' }, 0.3)
      .to(gate.state, { show: 1, duration: 1.6, ease: 'none' }, 1.6)
      .to(actor, { y: 0, scale: 1, opacity: 1, duration: 2.1 }, 1.7)
      .to('.gw--hero .gw__t, .gw--hero .gw__x', { opacity: 1, scale: 1, duration: 1.9, stagger: 0.05 }, 1.6)
      .to(heroWords, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 2.4)
      .to($$('[data-hero-in]'), { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 2.5)
      .to('.fpill', { opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'back.out(1.6)' }, 2.7)
      .add(() => {
        root.classList.remove('is-loading');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      }, 3.2);
    // idle: the subject floats, pills drift
    gsap.to(imgs[0], { y: -10, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3 });
    $$('.fpill').forEach((p, i) => gsap.to(p, { x: i % 2 ? 10 : -10, duration: 3 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  });
}
if (!reduced) intro();

// cursor: the glow of the world follows the pointer a little
if (!reduced && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    if (railIdx < 6) world.set({ gx: 0.5 + (nx - 0.5) * 0.35 + 0.1, gy: 0.5 + (0.5 - ny) * 0.25 - 0.04 });
  });
}

/* ---------- menu, anchors, newsletter ---------------------------------------------------- */
const menu = $('#menu');
const menuBtn = $('.head__menu');
function toggleMenu(open) {
  const willOpen = typeof open === 'boolean' ? open : menu.hidden;
  menu.hidden = !willOpen;
  menuBtn.setAttribute('aria-expanded', String(willOpen));
  $('span', menuBtn).textContent = willOpen ? 'Fermer' : 'Menu';
  if (lenis) willOpen ? lenis.stop() : lenis.start();
  if (willOpen) gsap.fromTo('.menu__nav li, .menu__info p', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.04 });
}
menuBtn.addEventListener('click', () => toggleMenu());
window.addEventListener('keydown', (e) => e.key === 'Escape' && !menu.hidden && toggleMenu(false));

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href');
  e.preventDefault();
  if (!menu.hidden) toggleMenu(false);
  if (a.dataset.chapter !== undefined) return goChapter(parseInt(a.dataset.chapter, 10));
  if (hash === '#top' || hash === '#') return scrollToEl(0, { duration: 1.6 });
  const t = $(hash);
  if (t) scrollToEl(t, { offset: hash === '#contact' ? 0 : -4 });
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

const refresh = () => ScrollTrigger.refresh();
window.addEventListener('load', refresh);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
