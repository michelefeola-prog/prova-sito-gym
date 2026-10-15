/* Gym Factory · gf.js — menu, conto alla rovescia, calendario, orari, quiz. Nessun dato lascia il browser. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');
  const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  document.documentElement.classList.add('js-on');

  /* ---------- header + menu ---------- */
  const header = $('.gf-header'), nav = $('.gf-nav'), btn = $('.gf-menu-btn');
  const onScroll = () => header && header.classList.toggle('is-stuck', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (nav) $$('a', nav).forEach((a, i) => a.style.setProperty('--k', i));
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open); header.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open); btn.textContent = open ? 'Chiudi' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (btn && nav) {
    btn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- splash d'apertura (solo home, una volta per sessione) ---------- */
  const root = document.documentElement;
  if (root.classList.contains('gf-intro')) {
    try { sessionStorage.setItem('gfi', '1'); } catch (e) { /* ok */ }
    const ov = document.createElement('div'); ov.className = 'gf-splash'; ov.setAttribute('aria-hidden', 'true');
    const logo = document.createElement('img'); logo.src = 'assets/images/logo.svg'; logo.alt = '';
    const eq = document.createElement('div'); eq.className = 'gfw-eq';
    for (let i = 0; i < 28; i++) {
      const b = document.createElement('i');
      b.style.setProperty('--h', (0.25 + Math.abs(Math.sin(i * 0.5)) * 0.75).toFixed(2));
      b.style.setProperty('--lo', '.1'); b.style.setProperty('--t', (0.5 + Math.random() * 0.5).toFixed(2) + 's');
      b.style.setProperty('--dl', (-Math.random()).toFixed(2) + 's'); eq.appendChild(b);
    }
    ov.append(logo, eq); document.body.appendChild(ov);
    setTimeout(() => ov.classList.add('is-out'), 1250);
    setTimeout(() => { ov.remove(); root.classList.remove('gf-intro'); }, 2400);
  }

  /* ---------- ora di Roma (indipendente dal fuso del visitatore) ---------- */
  function wall() {
    const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const o = {}; f.formatToParts(new Date()).forEach((p) => { if (p.type !== 'literal') o[p.type] = +p.value; });
    return new Date(o.year, o.month - 1, o.day, o.hour, o.minute, o.second);
  }

  /* ---------- prossimo corso + conto alla rovescia ---------- */
  let sched = null;
  const sj = $('#gf-sched'); if (sj) { try { sched = JSON.parse(sj.textContent); } catch (e) { /* ok */ } }
  function nextClass(now) {
    if (!sched) return null;
    for (let add = 0; add <= 7; add++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add);
      for (const [t, name, slug] of (sched[d.getDay()] || [])) {
        const [h, m] = t.split(':').map(Number);
        const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
        if (dt > now) return { dt, add, t, name, slug, day: d.getDay() };
      }
    }
    return null;
  }
  const box = $('[data-next]');
  function tickNext() {
    const now = wall(), n = nextClass(now); if (!n) return;
    const diff = Math.max(0, n.dt - now), s = Math.floor(diff / 1000);
    const parts = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    if (box) {
      box.classList.add('is-live');
      const when = n.add === 0 ? 'Oggi' : n.add === 1 ? 'Domani' : DAYS[n.day][0].toUpperCase() + DAYS[n.day].slice(1);
      $('[data-next-name]', box).textContent = n.name;
      $('[data-next-when]', box).textContent = `${when} alle ${n.t}`;
      const a = $('[data-next-link]', box); if (a) a.href = 'corsi.html#corso-' + n.slug;
      Object.keys(parts).forEach((k) => { const el = $(`[data-n="${k}"]`, box); if (el) el.textContent = pad(parts[k]); });
    }
    $$('.gf-slot').forEach((el) => {
      const day = +el.closest('.gf-day').dataset.day;
      el.classList.toggle('is-next', day === n.day && el.dataset.time === n.t && el.dataset.c === n.slug);
    });
  }
  /* calendario: oggi, orari già passati, filtro per corso */
  const cal = $('.gf-cal');
  if (cal) {
    const now = wall();
    $$('.gf-day', cal).forEach((d) => {
      if (+d.dataset.day === now.getDay()) {
        d.classList.add('is-today');
        $$('.gf-slot', d).forEach((s) => { const [h, m] = s.dataset.time.split(':').map(Number); if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) s.classList.add('is-past'); });
      }
    });
    $$('.gf-chip').forEach((c) => c.addEventListener('click', () => {
      const f = c.dataset.f; const on = c.getAttribute('aria-pressed') === 'true';
      $$('.gf-chip').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      if (on || f === 'all') { delete cal.dataset.filter; $('.gf-chip[data-f="all"]').setAttribute('aria-pressed', 'true'); }
      else { c.setAttribute('aria-pressed', 'true'); cal.dataset.filter = f; $$('.gf-slot', cal).forEach((s) => s.classList.toggle('is-match', s.dataset.c === f)); }
    }));
  }
  if (box || cal) { tickNext(); setInterval(tickNext, 1000); }

  /* ---------- orari della sala pesi: oggi + aperto/chiuso ---------- */
  const table = $('[data-hours]');
  if (table) {
    const rows = {}; $$('tr[data-day]', table).forEach((r) => { rows[+r.dataset.day] = [r.dataset.open, r.dataset.close, r]; });
    const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const status = $('[data-open-status]');
    const upd = () => {
      const now = wall(), d = now.getDay(), cur = now.getHours() * 60 + now.getMinutes();
      $$('tr', table).forEach((r) => r.classList.remove('is-today')); rows[d][2].classList.add('is-today');
      if (!status) return;
      const [o, c] = rows[d];
      if (cur >= mins(o) && cur < mins(c)) { status.className = 'gf-status is-open'; status.textContent = `Aperto ora · chiude alle ${c}`; }
      else if (cur < mins(o)) { status.className = 'gf-status'; status.textContent = `Chiuso · apre oggi alle ${o}`; }
      else { const nd = (d + 1) % 7; status.className = 'gf-status'; status.textContent = `Chiuso · riapre ${nd === (d + 1) % 7 ? 'domani' : ''} alle ${rows[nd][0]}`; }
    };
    upd(); setInterval(upd, 30000);
  }

  /* ---------- quiz (tutto nel browser) ---------- */
  const qroot = $('#quiz'); if (!qroot) return;
  const ACT = {
    sala: { name: 'Sala pesi', tag: 'Forza · il tuo ritmo', when: 'Lun–Ven 07:00–22:00 · Sab 09:00–18:00 · Dom 10:00–13:00' },
    functional: { name: 'Functional Training', tag: 'Movimento · energia', when: 'Lun · Mer · Ven 19:00' },
    tabata: { name: 'Tabata', tag: 'Intervalli · intensità', when: 'Mar · Gio 19:00' },
    trx: { name: 'TRX', tag: 'Sospensione · controllo', when: 'Lun · Mer · Ven 20:00' },
    pilates: { name: 'Pilates', tag: 'Respirazione · precisione', when: 'Mar · Gio 09:30 · 18:00' },
    calisthenics: { name: 'Calisthenics', tag: 'Corpo libero · forza', when: 'Lun · Mer · Ven 21:00' },
    spinning: { name: 'Spinning', tag: 'Pedalata · resistenza', when: 'Lun · Mer · Ven 19:30' },
    'pole-dance': { name: 'Pole Dance', tag: 'Tecnica · espressione', when: 'Mar · Gio 20:00 · 21:00' }
  };
  const Q = [
    { q: 'Cosa cerchi dal tuo allenamento?', o: [
      ['Più forza', { sala: 3, calisthenics: 2, functional: 2, trx: 2 }],
      ['Più energia e fiato', { tabata: 3, spinning: 3, functional: 2 }],
      ['Equilibrio e postura', { pilates: 3, trx: 1, calisthenics: 1 }],
      ['Provare qualcosa di nuovo', { 'pole-dance': 3, calisthenics: 2, trx: 1, tabata: 1 }] ] },
    { q: 'Come ti piace allenarti?', o: [
      ['Per conto mio, coi miei tempi', { sala: 3, calisthenics: 1 }],
      ['In gruppo, guidato da un istruttore', { functional: 2, tabata: 2, spinning: 2, pilates: 2, 'pole-dance': 2, trx: 2 }],
      ['Un po’ e un po’', { sala: 1, functional: 1, calisthenics: 1, trx: 1 }] ] },
    { q: 'Che ritmo ti somiglia?', o: [
      ['Lento e controllato', { pilates: 3, trx: 1, 'pole-dance': 1 }],
      ['Costante, senza fretta', { spinning: 2, sala: 2, functional: 1 }],
      ['Intenso, a scatti', { tabata: 3, functional: 2, spinning: 1 }],
      ['Cambia ogni volta', { functional: 2, calisthenics: 2, 'pole-dance': 1, trx: 1 }] ] },
    { q: 'Quando riesci ad allenarti?', o: [
      ['In mattinata', { pilates: 3, sala: 2 }],
      ['Sera, tra le 18 e le 19:30', { pilates: 2, tabata: 2, functional: 2, spinning: 2, sala: 1 }],
      ['Sera, dalle 20 in poi', { trx: 2, 'pole-dance': 2, calisthenics: 2, spinning: 1, sala: 1 }],
      ['Nel weekend', { sala: 4 }] ] },
    { q: 'Cosa ti attira di più?', o: [
      ['Pesi e bilancieri', { sala: 3, functional: 1 }],
      ['Una bici e un bel ritmo', { spinning: 3 }],
      ['Il mio corpo come attrezzo', { calisthenics: 3, pilates: 1, trx: 1 }],
      ['Cinghie o palo', { trx: 2, 'pole-dance': 2, calisthenics: 1 }] ] },
    { q: 'Con che esperienza parti?', o: [
      ['Parto da zero', { sala: 1, pilates: 1, functional: 1, spinning: 1 }],
      ['Mi alleno ogni tanto', { functional: 1, tabata: 1, trx: 1, spinning: 1, pilates: 1 }],
      ['Mi alleno con costanza', { calisthenics: 1, trx: 1, tabata: 1, 'pole-dance': 1, sala: 1 }] ] }
  ];
  let i = 0; const ans = [];
  const stage = $('#quiz-stage'), bar = $('.gf-quiz__bar i', qroot);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  function renderQ() {
    stage.innerHTML = ''; bar.parentElement.hidden = false;
    qroot.style.setProperty('--qp', (i / Q.length).toFixed(3));
    const w = el('div', 'gf-q-enter');
    w.append(el('div', 'gf-quiz__step', `${pad(i + 1)} / ${pad(Q.length)}`), el('p', 'gf-qtext', Q[i].q));
    const opts = el('div', 'gf-opts');
    Q[i].o.forEach(([label, sc], k) => {
      const b = el('button', 'gf-opt' + (ans[i] === k ? ' is-picked' : ''), label); b.type = 'button';
      b.addEventListener('click', () => { ans[i] = k; $$('.gf-opt', opts).forEach((x) => x.classList.remove('is-picked')); b.classList.add('is-picked'); setTimeout(() => { i++; i < Q.length ? renderQ() : renderRes(); }, reduce ? 0 : 320); });
      opts.append(b);
    });
    w.append(opts);
    const nv = el('div', 'gf-quiz__nav');
    if (i > 0) { const back = el('button', 'gf-quiz__back', '← Indietro'); back.type = 'button'; back.onclick = () => { i--; renderQ(); }; nv.append(back); }
    w.append(nv); stage.append(w);
    $('.gf-opt', stage).focus({ preventScroll: true });
  }
  function renderRes() {
    const score = {}; Object.keys(ACT).forEach((k) => (score[k] = 0));
    ans.forEach((a, qi) => { const sc = Q[qi].o[a][1]; Object.keys(sc).forEach((k) => (score[k] += sc[k])); });
    const keys = Object.keys(ACT), top = keys.sort((a, b) => score[b] - score[a] || keys.indexOf(a) - keys.indexOf(b)).slice(0, 3);
    const max = score[top[0]] || 1;
    qroot.style.setProperty('--qp', 1); stage.innerHTML = '';
    const w = el('div', 'gf-q-enter');
    w.append(el('div', 'gf-quiz__step', 'Il tuo match'), el('p', 'gf-qtext', 'Da qui puoi cominciare.'));
    const list = el('div', 'gf-res');
    top.forEach((k, r) => {
      const a = ACT[k], it = el('div', 'gf-res__i'); it.style.setProperty('--k', r);
      it.innerHTML = `<span class="n">0${r + 1}</span><div><span class="gf-tag">${a.tag}</span><h3>${a.name}</h3><div class="gf-meter" style="--k:${r};--w:${Math.round(score[k] / max * 100)}%"><i></i></div><p class="gf-hours" style="margin:0 0 .5rem">${a.when}</p><a class="gf-link" href="corsi.html#corso-${k}">Scopri ${k === 'sala' ? 'la sala pesi' : 'il corso'} ↗</a></div>`;
      list.append(it);
    });
    const cta = el('div', 'gf-quiz__nav', '<a class="gf-btn gf-btn--solid" href="contatti.html">Parlane con lo staff ↗</a>');
    const again = el('button', 'gf-quiz__back', 'Rifai il quiz'); again.type = 'button'; again.onclick = () => { i = 0; ans.length = 0; renderQ(); };
    cta.append(again);
    w.append(list, el('p', 'gf-note', 'È un primo orientamento in base alle tue preferenze, non una valutazione medica né una prescrizione di allenamento. Le risposte restano sul tuo dispositivo.'), cta);
    stage.append(w);
  }
  const start = $('#quiz-start');
  if (start) start.addEventListener('click', renderQ);
})();
