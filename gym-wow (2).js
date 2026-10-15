/* ==========================================================================
   Gym Factory · gym-wow.js  — vanilla, zero dipendenze
   ========================================================================== */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  root.classList.add('gfw-js');

  /* ---------- osservatore unico: aggiunge .is-in quando entra in vista ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        (e.target.__gfw || []).forEach((x) => x.classList.add('is-in'));   // immagini ritagliate: si osserva il contenitore
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  const reveal = (el) => io.observe(el);

  /* ---------- 1. titoli spezzati in parole ---------- */
  function splitHeading(h) {
    if (h.classList.contains('gfw-split') || h.closest('.gfw-no')) return;
    const label = h.textContent.replace(/\s+/g, ' ').trim();
    let n = 0;
    (function walk(node) {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 3) {
          const parts = c.nodeValue.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'gfw-w'; w.setAttribute('aria-hidden', 'true');
            const s = document.createElement('span'); s.style.setProperty('--i', n++); s.textContent = p;
            w.appendChild(s); frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(h);
    h.setAttribute('aria-label', label);
    h.classList.add('gfw-split');
    reveal(h);
  }

  /* ---------- 2. immagini con effetto sipario ---------- */
  function prepImages() {
    $$('main img, [data-gfw-reveal]').forEach((img) => {
      if (img.closest('.gfw-tour, .gfw-bento, .gfw-lb, .gfw-facade, header, footer, nav') ) return;
      if (/logo/i.test(img.getAttribute('src') || '') || img.classList.contains('gfw-no')) return;
      if (img.hasAttribute('data-gfw-parallax')) return;
      img.classList.add('gfw-img'); const host = img.parentElement; (host.__gfw = host.__gfw || []).push(img); reveal(host);
    });
  }

  /* ---------- 3. parallax / ken-burns sulle immagini marcate ---------- */
  const parallax = $$('img[data-gfw-parallax]');

  /* ---------- 4. barra progresso + riflettore ---------- */
  const bar = document.createElement('div'); bar.className = 'gfw-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let spot, mx = innerWidth / 2, my = innerHeight / 2, sx = mx, sy = my;
  if (fine && !reduce) {
    spot = document.createElement('div'); spot.className = 'gfw-spot'; spot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spot);
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; spot.classList.add('is-on'); }, { passive: true });
    document.addEventListener('pointerleave', () => spot.classList.remove('is-on'));
  }

  /* ---------- 5. inclinazione 3D + bottoni magnetici ---------- */
  function bindTilt(el) {
    if (el.__gfwTilt || el.closest('.gfw-no')) return; el.__gfwTilt = true; el.classList.add('gfw-tilt');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('is-hover');
      el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%');
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 9}deg) rotateY(${(x - 0.5) * 11}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('is-hover'); el.style.transform = ''; });
  }
  function bindMagnet(el) {
    if (el.__gfwMag) return; el.__gfwMag = true; el.classList.add('gfw-magnetic');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.classList.add('is-hover'); el.style.transform = `translate(${dx * 0.28}px, ${dy * 0.4}px)`;
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('is-hover'); el.style.transform = ''; });
  }

  /* ---------- 6. equalizzatore ---------- */
  function buildEq(el) {
    const n = el.dataset.bars ? +el.dataset.bars : clamp(Math.round(innerWidth / 17), 24, 110);
    el.setAttribute('aria-hidden', 'true'); el.innerHTML = '';
    const bars = [];
    for (let i = 0; i < n; i++) {
      const b = document.createElement('i');
      // onda di base + disturbo: sembra musica vera, non un loop
      const wave = 0.5 + 0.5 * Math.sin(i * 0.33) * Math.cos(i * 0.11);
      const h = 0.22 + wave * 0.78 * (0.55 + Math.random() * 0.45);
      const lo = 0.06 + Math.random() * 0.08;
      b.style.setProperty('--h', h.toFixed(2));
      b.style.setProperty('--lo', lo.toFixed(2));
      el.appendChild(b);
      bars.push({ b, h, lo, sp: 1.8 + Math.random() * 3.4, ph: Math.random() * 6.283 });
    }
    // le barre sono mosse dal JS (requestAnimationFrame): funziona identico su iPhone, Android e desktop
    el.__bars = bars; el.classList.add('is-js');
    if (reduce) bars.forEach((o) => { o.b.style.transform = 'scaleY(' + (o.h * 0.6).toFixed(2) + ')'; });
  }
  function animateEqs(ts) {
    if (reduce) return;
    const t = ts / 1000, pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
    eqs.forEach((el) => {
      if (!el.__bars) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const amp = 0.55 + vel * 0.45, beat = 0.86 + 0.14 * pulse;
      el.__bars.forEach((o, i) => {
        const s = 0.5 + 0.5 * Math.sin(t * o.sp + o.ph + i * 0.12);
        const v = o.lo + (o.h * amp * beat - o.lo) * s;
        o.b.style.transform = 'scaleY(' + Math.max(0.04, v).toFixed(3) + ')';
      });
    });
  }
  const eqs = $$('.gfw-eq');
  // equalizzatore automatico prima del footer, se non l'hai già messo
  if (!eqs.length && !document.querySelector('[data-gfw-no-eq]')) {
    const f = document.querySelector('footer');
    if (f) { const d = document.createElement('div'); d.className = 'gfw-eq'; f.parentNode.insertBefore(d, f); eqs.push(d); }
  }
  eqs.forEach(buildEq);
  let eqW = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - eqW) > 120) { eqW = innerWidth; eqs.forEach(buildEq); } });

  /* ---------- 7. marquee: duplica il contenuto per il loop infinito ---------- */
  $$('.gfw-marquee').forEach((m) => {
    const row = m.querySelector('.gfw-marquee__row'); if (!row) return;
    const clone = row.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); m.appendChild(clone);
  });

  /* ---------- 8. TOUR a scorrimento orizzontale ---------- */
  const tours = $$('[data-gfw-tour]').map((sec) => {
    // lo "sticky" si rompe se un antenato ha overflow:hidden → lo convertiamo in clip (stesso aspetto)
    for (let p = sec.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(hidden|auto|scroll)/.test(cs.overflowX + cs.overflowY)) {
        if (cs.overflowX !== 'visible') p.style.overflowX = 'clip';
        if (cs.overflowY !== 'visible') p.style.overflowY = 'clip';
      }
    }
    const track = sec.querySelector('.gfw-tour__track');
    const items = Array.from(track.children);
    const t = { sec, track, items, max: 0, top: 0, h: 0,
      barEl: sec.querySelector('.gfw-tour__bar'), cur: sec.querySelector('[data-cur]'), tot: sec.querySelector('[data-tot]') };
    if (t.tot) t.tot.textContent = String(items.length).padStart(2, '0');
    items.forEach((it) => { const im = it.querySelector('img'); if (im && im.naturalWidth) it.style.setProperty('--ar', im.naturalWidth + '/' + im.naturalHeight); });
    items.forEach((it) => {
      it.tabIndex = 0; it.setAttribute('role', 'button');
      const open = () => openLightbox(it.querySelector('img'), (it.querySelector('figcaption') || {}).textContent || it.querySelector('img').alt);
      it.addEventListener('click', open);
      it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    return t;
  });
  function measureTours() {
    tours.forEach((t) => {
      if (reduce) return;
      t.items.forEach((it) => { const im = it.querySelector('img'); if (im && im.naturalWidth) it.style.setProperty('--ar', im.naturalWidth + '/' + im.naturalHeight); });
      const last = t.items[t.items.length - 1];
      // l'ultima foto si ferma al centro dello schermo
      t.max = Math.max(0, last.offsetLeft + last.offsetWidth / 2 - innerWidth / 2);
      t.h = innerHeight;
      t.sec.style.height = (t.max * 1.05 + innerHeight) + 'px';
      t.top = t.sec.getBoundingClientRect().top + scrollY;
    });
  }
  function updateTour(t) {
    if (reduce) return;
    const span = t.sec.offsetHeight - t.h;
    const p = clamp((scrollY - t.top) / (span || 1));
    t.track.style.transform = `translate3d(${-p * t.max}px,0,0)`;
    t.sec.style.setProperty('--tp', p.toFixed(4));
    t.sec.classList.toggle('is-moving', p > 0.02);
    let best = 0, bd = 9;
    t.items.forEach((it, i) => {
      const r = it.getBoundingClientRect();
      const d = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;     // -1 … 1
      const ad = Math.abs(d);
      it.style.setProperty('--ix', (d * -9).toFixed(2) + '%');             // parallax interno
      it.style.setProperty('--sc', (1 + (1 - clamp(ad * 1.4)) * 0.07).toFixed(3));
      it.style.setProperty('--f', clamp(1.25 - ad * 2.1).toFixed(2));      // didascalia a fuoco
      it.style.setProperty('--o', (0.45 + 0.55 * clamp(1.2 - ad * 0.9)).toFixed(2));
      if (ad < bd) { bd = ad; best = i; }
    });
    if (t.cur) t.cur.textContent = String(best + 1).padStart(2, '0');
  }

  /* ---------- 9. lightbox con transizione dal punto d'origine ---------- */
  let lb, lbImg, lbCap, lbFrom;
  function ensureLB() {
    if (lb) return;
    lb = document.createElement('dialog'); lb.className = 'gfw-lb'; lb.setAttribute('aria-label', 'Foto ingrandita');
    lb.innerHTML = '<div class="gfw-lb__in"><img alt=""><p></p><button type="button">Chiudi</button></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCap = lb.querySelector('p');
    const close = () => {
      if (!lb.open) return;
      if (reduce || !lbFrom) { lb.close(); return; }
      const a = lbImg.animate([{ transform: 'none', opacity: 1 }, { transform: lbFrom, opacity: 0.4 }], { duration: 380, easing: 'cubic-bezier(.6,0,.9,.4)' });
      a.onfinish = () => lb.close();
    };
    lb.addEventListener('click', close);
    lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  }
  async function openLightbox(img, caption) {
    ensureLB();
    const r = img.getBoundingClientRect();
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || ''; lbCap.textContent = caption || '';
    lb.showModal();
    try { await lbImg.decode(); } catch (e) { /* ok */ }
    if (reduce) return;
    const f = lbImg.getBoundingClientRect();
    const dx = r.left + r.width / 2 - (f.left + f.width / 2), dy = r.top + r.height / 2 - (f.top + f.height / 2);
    const s = Math.min(r.width / f.width, 1.2);
    lbFrom = `translate(${dx}px,${dy}px) scale(${s})`;
    lbImg.animate([{ transform: lbFrom, opacity: 0.5 }, { transform: 'none', opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  $$('[data-gfw-zoom]').forEach((fig) => {
    fig.tabIndex = 0; fig.setAttribute('role', 'button');
    const go = () => openLightbox(fig.querySelector('img'), (fig.querySelector('figcaption') || {}).textContent || '');
    fig.addEventListener('click', go);
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  /* ---------- ciclo principale (un solo rAF per tutto) ---------- */
  let lastY = scrollY, vel = 0, ticking = true;
  function frame(ts) {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
    // velocità di scroll → ampiezza dell'equalizzatore (più scorri, più la musica sale)
    vel = lerp(vel, Math.min(Math.abs(y - lastY) / 38, 1), 0.12); lastY = y;
    eqs.forEach((e) => e.style.setProperty('--amp', vel.toFixed(3)));
    animateEqs(ts || performance.now());
    if (!reduce) {
      parallax.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        const k = clamp((innerHeight - r.top) / (innerHeight + r.height));
        img.style.transform = `translate3d(0,${((k - 0.5) * -90).toFixed(1)}px,0) scale(${(1.14 - k * 0.07).toFixed(3)})`;
      });
      tours.forEach(updateTour);
    }
    if (spot) { sx = lerp(sx, mx, 0.14); sy = lerp(sy, my, 0.14); spot.style.setProperty('--sx', sx.toFixed(1) + 'px'); spot.style.setProperty('--sy', sy.toFixed(1) + 'px'); }
    if (ticking) requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { ticking = !document.hidden; if (ticking) requestAnimationFrame(frame); });

  /* ---------- avvio ---------- */
  function start() {
    $$('main h1, main h2, [data-gfw-split]').forEach(splitHeading);
    prepImages();
    $$('.gfw-facade, [data-gfw-reveal-block]').forEach(reveal);
    if (fine && !reduce) {
      $$('.gfw-tilt').forEach(bindTilt);
      $$('.gfw-magnetic, main a[class*="btn"], main a[class*="button"], main a[class*="cta"]').forEach(bindMagnet);
    }
    measureTours();
    root.classList.add('gfw-ready');
    requestAnimationFrame(frame);
    // sicurezza: se le immagini del tour caricano dopo, rimisura
    $$('.gfw-tour img').forEach((im) => { if (!im.complete) im.addEventListener('load', measureTours, { once: true }); });
  }
  addEventListener('resize', () => { measureTours(); });
  addEventListener('load', measureTours);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureTours);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  setTimeout(() => root.classList.add('gfw-ready'), 2500);
})();
