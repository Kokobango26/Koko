/* Le Sixième – comportements du site. Sans dépendance, discret, accessible. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  window.__six = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i18n = JSON.parse(d.getElementById('i18n').textContent);
  var fill = function (s, v) { return s.replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; }); };
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- en-tête ---------- */
  var header = $('[data-header]');
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- menu mobile ---------- */
  var burger = $('.burger');
  var drawer = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    root.classList.toggle('menu-open', open);
    d.body.classList.toggle('menu-open', open);
    $('.burger__label', burger).textContent = open ? burger.dataset.labelClose : burger.dataset.labelOpen;
  }
  burger.addEventListener('click', function () { setMenu(drawer.hidden); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); burger.focus(); } });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', function (e) { if (e.matches && !drawer.hidden) setMenu(false); });

  /* ---------- apparitions ---------- */
  var reveals = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- légère rotation / parallaxe des assiettes et de la salle ---------- */
  if (!reduce) {
    var movers = $$('[data-rotate], [data-parallax]');
    var imgs = $$('[data-parallax-img]');
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      movers.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        var p = r.top + r.height / 2 - vh / 2;
        var k = parseFloat(el.dataset.rotate || 0);
        var py = parseFloat(el.dataset.parallax || 0);
        el.style.setProperty('--rot', (k * p).toFixed(2) + 'deg');
        el.style.setProperty('--py', (py * p).toFixed(1) + 'px');
      });
      imgs.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        var p = r.top + r.height / 2 - vh / 2;
        el.style.setProperty('--iy', (parseFloat(el.dataset.parallaxImg) * p).toFixed(1) + 'px');
      });
    };
    var request = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    request();
  }

  /* ---------- ouvert / fermé (heure de Bruxelles) ---------- */
  var toMin = function (s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; };
  function brusselsNow() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: map[get('weekday')], min: +get('hour') * 60 + +get('minute') };
  }
  function openStatus() {
    var n = brusselsNow();
    var today = i18n.hours[n.day] || [];
    var i;
    for (i = 0; i < today.length; i++) {
      if (n.min >= toMin(today[i][0]) && n.min < toMin(today[i][1])) return { open: true, day: n.day, text: fill(i18n.status.open, { time: today[i][1] }) };
    }
    for (i = 0; i < today.length; i++) {
      if (n.min < toMin(today[i][0])) return { open: false, day: n.day, text: fill(i18n.status.later, { time: today[i][0] }) };
    }
    for (i = 1; i <= 7; i++) {
      var dd = (n.day + i) % 7;
      var slots = i18n.hours[dd] || [];
      if (slots.length) {
        var t = slots[0][0];
        return { open: false, day: n.day, text: i === 1 ? fill(i18n.status.tomorrow, { time: t }) : fill(i18n.status.day, { day: i18n.days[dd], time: t }) };
      }
    }
    return { open: false, day: n.day, text: '' };
  }
  function paintStatus() {
    var s = openStatus();
    $$('[data-status]').forEach(function (el) {
      el.textContent = s.text;
      el.parentNode.classList.toggle('is-open', s.open);
    });
    $$('.hours tr').forEach(function (tr) { tr.classList.toggle('is-today', +tr.dataset.day === s.day); });
  }
  paintStatus();
  window.setInterval(paintStatus, 60000);

  /* ---------- carte : repère de section + assiette qui change ---------- */
  var sections = $$('[data-section]');
  if (sections.length && 'IntersectionObserver' in window) {
    var links = $$('[data-subnav] a');
    var plates = $$('[data-carte-visual] .plate');
    var setActive = function (id) {
      links.forEach(function (a) {
        var on = a.dataset.target === id;
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (on && a.scrollIntoView && a.parentNode.parentNode.parentNode.scrollWidth > a.parentNode.parentNode.parentNode.clientWidth) {
          var nav = a.closest('[data-subnav]');
          nav.scrollTo({ left: a.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
        }
      });
      plates.forEach(function (p) { p.classList.toggle('is-on', (p.dataset['for'] || '').split(' ').indexOf(id) > -1); });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.dataset.section); });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
    setActive(sections[0].dataset.section);
  }

  /* ---------- carte Google Maps : chargée seulement après un clic ---------- */
  $$('[data-map]').forEach(function (box) {
    var btn = $('[data-map-load]', box);
    btn.addEventListener('click', function () {
      var f = d.createElement('iframe');
      f.src = box.dataset.src;
      f.title = box.dataset.title;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(f);
    });
  });

  /* ---------- formulaire de réservation ---------- */
  var form = d.getElementById('booking-form');
  if (form) initBooking(form);

  function initBooking(form) {
    var F = i18n.book.form;
    var M = i18n.book.msg;
    var dateI = form.elements.date;
    var timeS = form.elements.time;
    var statusEl = d.getElementById('form-status');
    var todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date());
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var maxD = new Date(Date.UTC(+todayStr.slice(0, 4) + 1, +todayStr.slice(5, 7) - 1, +todayStr.slice(8, 10)));
    dateI.min = todayStr;
    dateI.max = maxD.getUTCFullYear() + '-' + pad(maxD.getUTCMonth() + 1) + '-' + pad(maxD.getUTCDate());

    function err(name, msg) {
      var el = d.getElementById(name + '-error');
      var input = form.elements[name];
      if (el) el.textContent = msg || '';
      if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); if (msg) input.setAttribute('aria-describedby', name + '-error'); }
    }

    function slotsFor(dateStr) {
      var p = dateStr.split('-').map(Number);
      var dow = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
      var out = [];
      (i18n.hours[dow] || []).forEach(function (w) {
        var meal = toMin(w[0]) < 15 * 60 ? 'lunch' : 'dinner';
        for (var t = toMin(w[0]); t <= toMin(w[1]); t += 30) out.push({ meal: meal, label: pad(Math.floor(t / 60)) + ':' + pad(t % 60), min: t });
      });
      if (dateStr === todayStr) { var now = brusselsNow().min + 60; out = out.filter(function (s) { return s.min >= now; }); }
      return { dow: dow, slots: out, closed: !(i18n.hours[dow] || []).length };
    }

    function refreshTimes() {
      var v = dateI.value;
      timeS.innerHTML = '';
      var ph = d.createElement('option'); ph.value = ''; ph.textContent = F.choose; timeS.appendChild(ph);
      err('date', ''); err('time', '');
      if (!v) { timeS.disabled = true; return; }
      var r = slotsFor(v);
      if (r.closed) { timeS.disabled = true; err('date', M.closedDay); return; }
      if (!r.slots.length) { timeS.disabled = true; err('date', fill(M.noSlot, { phone: i18n.phone })); return; }
      var group = null;
      r.slots.forEach(function (s) {
        if (!group || group.dataset.meal !== s.meal) {
          group = d.createElement('optgroup'); group.dataset.meal = s.meal; group.label = s.meal === 'lunch' ? F.lunch : F.dinner; timeS.appendChild(group);
        }
        var o = d.createElement('option'); o.value = s.label; o.textContent = s.label; group.appendChild(o);
      });
      timeS.disabled = false;
    }
    dateI.addEventListener('change', refreshTimes);
    dateI.addEventListener('input', refreshTimes);
    refreshTimes();

    ['name', 'phone', 'email', 'time', 'date'].forEach(function (n) { form.elements[n].addEventListener('input', function () { if (n !== 'date') err(n, ''); }); });
    form.elements.consent.addEventListener('change', function () { err('consent', ''); });

    function validate() {
      var bad = [];
      var v = function (n) { return (form.elements[n].value || '').trim(); };
      if (!v('date')) { err('date', M.pickDate); bad.push('date'); }
      else { var r = slotsFor(v('date')); if (r.closed) { err('date', M.closedDay); bad.push('date'); } }
      if (!bad.length && !v('time')) { err('time', M.required); bad.push('time'); }
      if (!v('name')) { err('name', M.required); bad.push('name'); }
      if (v('phone').replace(/\D/g, '').length < 8 || !/^[+()\d\s./-]+$/.test(v('phone'))) { err('phone', M.phone); bad.push('phone'); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) { err('email', M.email); bad.push('email'); }
      if (!form.elements.consent.checked) { err('consent', M.consent); bad.push('consent'); }
      if (bad.length) form.elements[bad[0]].focus();
      return !bad.length;
    }

    function setStatus(text, kind) { statusEl.textContent = text; statusEl.className = 'form-status' + (kind ? ' is-' + kind : ''); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');
      if (form.elements.website.value) { setStatus(M.sent, 'ok'); form.reset(); return; } // anti-spam : champ piège rempli
      if (!validate()) return;
      var guestsN = +form.elements.guests.value;
      var guestsLabel = fill(guestsN === 1 ? F.guestOne : F.guestMany, { n: guestsN });
      var p = form.elements.date.value.split('-').map(Number);
      var dateLabel = new Intl.DateTimeFormat(i18n.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(p[0], p[1] - 1, p[2])));
      var data = {
        date: form.elements.date.value, dateLabel: dateLabel, time: form.elements.time.value, guests: guestsN,
        name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(), email: form.elements.email.value.trim(),
        note: form.elements.note.value.trim(), lang: i18n.lang,
      };
      if (i18n.endpoint) {
        setStatus(M.sending);
        fetch(i18n.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); setStatus(M.sent, 'ok'); form.reset(); refreshTimes(); })
          .catch(function () { setStatus(fill(M.error, { phone: i18n.phone, email: i18n.email }), 'error'); });
        return;
      }
      // Sans service de réservation configuré : courriel pré-rempli vers le restaurant.
      var vars = { date: dateLabel, time: data.time, guests: guestsLabel, name: data.name, phone: data.phone, email: data.email, note: data.note || '–' };
      var href = 'mailto:' + i18n.email + '?subject=' + encodeURIComponent(fill(i18n.book.mail.subject, vars)) + '&body=' + encodeURIComponent(fill(i18n.book.mail.body, vars));
      setStatus(fill(M.mailto, { phone: i18n.phone }), 'ok');
      window.location.href = href;
    });
  }
})();
