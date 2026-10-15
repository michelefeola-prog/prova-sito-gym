/* Gym Factory · gf-cookie.js — banner cookie, vanilla, zero dipendenze.
   - Rifiuta e Accetta hanno lo stesso peso. Nessuno strumento non necessario parte prima del consenso.
   - Per aggiungere in futuro uno strumento (statistiche, pixel, mappe incorporate) basta scriverlo così:
       <script type="text/plain" data-consent="stats" src="..."></script>      (statistiche)
       <script type="text/plain" data-consent="ext">...</script>               (contenuti esterni)
       <iframe data-consent="ext" data-src="https://..."></iframe>
     Parte solo dopo il consenso della relativa categoria.                                          */
(() => {
  'use strict';
  const KEY = 'gf-consent', VER = 1;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && v.v === VER ? v : null; } catch (e) { return null; } };
  const write = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* navigazione privata: si richiede a ogni visita */ } };
  let current = read(), lastFocus = null;

  const count = (cat) => document.querySelectorAll('[data-consent="' + cat + '"]').length;
  const note = (cat) => count(cat) ? '' : '<small class="gf-cookie__off">Al momento nessuno strumento di questo tipo è attivo sul sito.</small>';

  const el = document.createElement('section');
  el.className = 'gf-cookie'; el.id = 'gf-cookie'; el.setAttribute('role', 'dialog');
  el.setAttribute('aria-labelledby', 'gf-cookie-t'); el.setAttribute('aria-describedby', 'gf-cookie-d'); el.tabIndex = -1;
  el.innerHTML =
    '<div class="gf-cookie__top"><img src="logo-gf.svg" alt="" width="22" height="17"><span>Cookie</span></div>' +
    '<p class="gf-cookie__t" id="gf-cookie-t">Una scelta, poi si <em>allena.</em></p>' +
    '<p class="gf-cookie__d" id="gf-cookie-d">Usiamo strumenti tecnici necessari al funzionamento del sito. Con il tuo consenso possiamo usare anche statistiche e contenuti di terze parti. Puoi cambiare idea quando vuoi. <a href="cookie.html">Cookie policy</a></p>' +
    '<div class="gf-cookie__prefs" id="gf-cookie-prefs" hidden>' +
      '<label class="gf-cookie__row"><span><b>Necessari</b><small>Ricordano questa scelta e il funzionamento di base del sito. Sempre attivi.</small></span><input type="checkbox" class="gf-sw" checked disabled></label>' +
      '<label class="gf-cookie__row"><span><b>Statistiche</b><small>Ci aiutano a capire come viene usato il sito, in forma aggregata.</small>' + note('stats') + '</span><input type="checkbox" class="gf-sw" data-cat="stats"></label>' +
      '<label class="gf-cookie__row"><span><b>Contenuti esterni</b><small>Mappe, video e social incorporati da altri servizi.</small>' + note('ext') + '</span><input type="checkbox" class="gf-sw" data-cat="ext"></label>' +
    '</div>' +
    '<div class="gf-cookie__act">' +
      '<button type="button" class="gf-btn gf-btn--ghost" data-a="reject">Rifiuta</button>' +
      '<button type="button" class="gf-btn gf-btn--solid" data-a="accept">Accetta tutti</button>' +
      '<button type="button" class="gf-cookie__more" data-a="custom" aria-expanded="false" aria-controls="gf-cookie-prefs">Personalizza</button>' +
    '</div>';
  document.body.appendChild(el);
  const prefs = el.querySelector('#gf-cookie-prefs'), more = el.querySelector('[data-a="custom"]');
  const boxes = Array.from(el.querySelectorAll('input[data-cat]'));

  function activate(c) {
    document.querySelectorAll('script[type="text/plain"][data-consent]').forEach((s) => {
      if (!c[s.dataset.consent] || s.dataset.done) return;
      const n = document.createElement('script');
      Array.from(s.attributes).forEach((a) => { if (a.name !== 'type' && a.name !== 'data-consent' && a.name !== 'data-done') n.setAttribute(a.name, a.value); });
      n.text = s.text; s.dataset.done = '1'; s.after(n);
    });
    document.querySelectorAll('iframe[data-consent][data-src]').forEach((f) => { if (c[f.dataset.consent] && !f.getAttribute('src')) f.setAttribute('src', f.dataset.src); });
  }
  function setPrefs(open) {
    prefs.hidden = !open; more.setAttribute('aria-expanded', String(open));
    more.textContent = open ? 'Salva le mie scelte' : 'Personalizza';
    more.classList.toggle('is-save', open);
  }
  function show(withPrefs) {
    boxes.forEach((b) => { b.checked = !!(current && current[b.dataset.cat]); });
    setPrefs(!!withPrefs);
    lastFocus = document.activeElement;
    document.documentElement.classList.add('gf-cookie-open');
    el.classList.add('is-open');
    if (withPrefs || current) setTimeout(() => el.focus({ preventScroll: true }), 50);
  }
  function hide() {
    el.classList.remove('is-open'); document.documentElement.classList.remove('gf-cookie-open');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ok */ } }
  }
  function save(stats, ext) {
    const prev = current;
    current = { v: VER, stats: !!stats, ext: !!ext, ts: Date.now() };
    write(current); hide(); activate(current);
    document.dispatchEvent(new CustomEvent('gf:consent', { detail: current }));
    // se hai tolto un consenso già dato, ricarichiamo per fermare ciò che era già partito
    if (prev && ((prev.stats && !current.stats) || (prev.ext && !current.ext))) location.reload();
  }
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'accept') save(true, true);
    else if (a === 'reject') save(false, false);
    else if (a === 'custom') {
      if (prefs.hidden) setPrefs(true);
      else { const v = {}; boxes.forEach((x) => { v[x.dataset.cat] = x.checked; }); save(v.stats, v.ext); }
    }
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) { e.stopPropagation(); hide(); } });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-cookie-open]')) { e.preventDefault(); show(true); } });

  window.gfCookies = { get: () => current, open: () => show(true) };
  if (current) activate(current);
  else setTimeout(() => show(false), reduce ? 0 : 900);
})();
