/* The Nail Atelier – comportements discrets, sans dépendance. */
(function () {
  'use strict';
  var d = document;
  window.__nail = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  var header = $('[data-header]');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = $('.burger'), drawer = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    d.body.classList.toggle('menu-open', open);
    $('.burger__label', burger).textContent = open ? burger.dataset.close : burger.dataset.open;
  }
  burger.addEventListener('click', function () { setMenu(drawer.hidden); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); burger.focus(); } });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', function (e) { if (e.matches && !drawer.hidden) setMenu(false); });

  var reveals = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // légère parallaxe de la photo principale
  var par = $$('[data-parallax]');
  if (par.length && !reduce) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = r.top + r.height / 2 - vh / 2;
        el.style.setProperty('--py', (parseFloat(el.dataset.parallax) * p).toFixed(1) + 'px');
      });
    };
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    req();
  }

  // repère de section sur la page des tarifs
  var secs = $$('[data-section]');
  if (secs.length && 'IntersectionObserver' in window) {
    var links = $$('[data-subnav] a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          if (a.dataset.target === en.target.dataset.section) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    secs.forEach(function (s) { spy.observe(s); });
  }
})();
