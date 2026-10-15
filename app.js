(function(){
  'use strict';
  const c=window.GYM_CONFIG,E=window.GymEngine;
  if(!c||!E)return;
  const q=(s,el=document)=>el.querySelector(s),qa=(s,el=document)=>Array.from(el.querySelectorAll(s));
  const esc=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const dayNames=['','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
  const dateFormat=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',weekday:'long',day:'numeric',month:'long'});
  const button=(href,label,kind='')=>`<a class="btn ${kind}" href="${esc(href)}">${esc(label)} <span aria-hidden="true">↗</span></a>`;
  function allowedUrl(value,protocols=['https:']){try{return protocols.includes(new URL(value,location.href).protocol);}catch{return false;}}
  qa('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  qa('[data-address]').forEach(el=>el.textContent=c.address);
  qa('[data-city]').forEach(el=>el.textContent=c.city);
  qa('[data-instagram]').forEach(el=>{if(allowedUrl(c.instagram))el.href=c.instagram;});
  qa('[data-maps]').forEach(el=>{if(allowedUrl(c.maps))el.href=c.maps;});
  qa('[data-phone]').forEach(el=>{if(/^\+?[\d ]+$/.test(c.phone)){el.href='tel:'+c.phone.replace(/ /g,'');el.textContent=c.phoneLabel||c.phone;}else el.remove();});
  const contacts=q('[data-extra-contacts]');
  if(contacts){
    if(/^\+?\d+$/.test(c.whatsapp))contacts.insertAdjacentHTML('beforeend','<div class="actions">'+button('https://wa.me/'+c.whatsapp.replace('+',''),'Scrivici su WhatsApp')+'</div>');
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))contacts.insertAdjacentHTML('beforeend',`<p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>`);
  }
  if(c.gallery[0]){const g=c.gallery[0];qa('[data-gallery]').forEach(el=>{el.src=g.src;el.alt=g.alt;});qa('[data-gallery-caption]').forEach(el=>{el.textContent=g.caption;el.hidden=!g.caption;});}
  const menu=q('.menu-toggle'),nav=q('#main-nav'),mobile=matchMedia('(max-width:760px)');
  function toggleMenu(open,focus=false){menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);if(focus)menu.focus();}
  menu.addEventListener('click',()=>toggleMenu(menu.getAttribute('aria-expanded')!=='true'));
  qa('a',nav).forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){e.preventDefault();toggleMenu(false,true);}});
  document.addEventListener('click',e=>{if(!q('.site-header').contains(e.target))toggleMenu(false);});
  document.addEventListener('focusin',e=>{if(mobile.matches&&!q('.site-header').contains(e.target))toggleMenu(false);});
  const mediaChange=()=>{if(!mobile.matches)toggleMenu(false);};
  if(mobile.addEventListener)mobile.addEventListener('change',mediaChange);
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target);}}),{threshold:.12});qa('.reveal').forEach(el=>observer.observe(el));}
  const hours=q('[data-hours]');
  if(hours){
    const rows=Object.entries(c.opening.days).map(([d,slots])=>`<tr><th scope="row">${dayNames[d]}</th><td>${slots===null?'Da confermare':!slots.length?'Chiuso':slots.map(x=>esc(x.join('–'))).join('<br>')}</td></tr>`).join('');
    const today=E.dateKey(Date.now()),exception=c.opening.exceptions.find(x=>x.date===today);
    hours.innerHTML=`<table class="hours"><caption class="visually-hidden">${c.opening.confirmed?'Orari di apertura':'Orari di riferimento da confermare'}</caption><tbody>${rows}</tbody></table>${exception?`<p class="info-note">Oggi: ${exception.slots.length?exception.slots.map(x=>esc(x.join('–'))).join(', '):'chiuso'}${exception.note?' · '+esc(exception.note):''}.</p>`:''}<p class="info-note">${esc(c.opening.note)}</p>`;
  }
  const courses=q('[data-courses]');
  if(courses&&window.GymCatalog)courses.innerHTML=E.courseList(c).map(x=>GymCatalog.card(x,c)).join('');
  const overview=q('[data-week-overview]');if(overview&&window.GymCatalog)overview.innerHTML=GymCatalog.overview(c);
  const preview=q('[data-course-preview]');if(preview&&window.GymCatalog)preview.innerHTML=['functional','pilates','spinning'].map(id=>c.courses.find(x=>x.id===id)).filter(Boolean).map(x=>GymCatalog.card(x,c,true)).join('');
  let nextSignature='';
  function updateNext(){
    const now=Date.now(),n=E.next(c,now),signature=JSON.stringify([n.current.map(x=>x.id+x.start),n.upcoming.map(x=>x.id+x.start)]);
    if(signature!==nextSignature){
      nextSignature=signature;
      qa('[data-next]').forEach(el=>{
        if(!n.upcoming.length){el.innerHTML=`<div><p class="eyebrow">Il prossimo appuntamento</p><h3 class="next-title">${n.current.length?'In corso: '+esc(n.current.map(x=>x.name).join(' + ')):'Il tuo prossimo corso?'}</h3><p class="next-meta">${n.current.length?'Allenamento in svolgimento.':'Scopri il programma aggiornato con il nostro staff.'}</p></div><div class="next-empty">${c.schedule.confirmed?'Non ci sono altri appuntamenti confermati nei prossimi 35 giorni.':'Contattaci per conoscere giorni, orari e disponibilità dei corsi.'}<div class="actions">${button('contatti.html','Chiedi il calendario','outline')}</div></div>`;return;}
        const x=n.upcoming[0];
        el.innerHTML=`<div><p class="eyebrow">Il prossimo appuntamento</p><h3 class="next-title">${esc(n.upcoming.map(x=>x.name).join(' + '))}</h3><p class="next-meta">${esc(dateFormat.format(new Date(x.start)))} · ${esc(x.time)}${n.current.length?'<br>In corso: '+esc(n.current.map(x=>x.name).join(', ')):''}</p><a href="corsi.html#calendario" class="small" style="text-decoration:underline">Vai al calendario</a></div><div class="countdown" aria-label="Tempo al prossimo corso">${['Giorni','Ore','Minuti','Secondi'].map((label,i)=>`<div><strong data-count="${i}">00</strong><span>${label}</span></div>`).join('')}</div>`;
      });
    }
    if(n.upcoming.length){const vals=E.countdown(n.upcoming[0].start-now);qa('[data-count]').forEach(el=>el.textContent=String(vals[Number(el.dataset.count)]).padStart(2,'0'));}
  }
  if(q('[data-next]')){updateNext();setInterval(updateNext,1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateNext();});}
  const calendar=q('[data-calendar]');let filter='all';
  function renderCalendar(){
    const all=E.events(c,Date.now(),6);
    if(!all.length){calendar.innerHTML=`<div class="empty-state" style="margin-top:30px"><h3>${c.schedule.confirmed?'Nessun appuntamento in calendario.':'Chiedici il programma aggiornato.'}</h3><p>${c.schedule.confirmed?'Non risultano lezioni confermate nei prossimi 35 giorni. Contattaci per conoscere il prossimo programma.':'Contattaci per conoscere gli orari e la disponibilità dei corsi, così puoi organizzarti prima di venire.'}</p><div class="actions">${button('contatti.html','Contatta la palestra')}</div></div>`;return;}
    const filtered=filter==='all'?all:all.filter(x=>E.weekday(x.date)===Number(filter));
    calendar.innerHTML=`<div class="day-filters" role="group" aria-label="Filtra per giorno">${[['all','Tutti'],...dayNames.slice(1).map((x,i)=>[String(i+1),x.slice(0,3)])].map(([id,name])=>`<button class="chip" type="button" data-day="${id}" aria-pressed="${filter===id}">${name}</button>`).join('')}</div><p class="small muted" style="margin-bottom:20px">Appuntamenti dei prossimi 7 giorni · Orario italiano (Europe/Rome)</p><div class="calendar-list" aria-live="polite">${filtered.length?filtered.map(x=>`<article class="calendar-row"><time datetime="${new Date(x.start).toISOString()}">${esc(x.time)}</time><div><h3>${esc(x.name)}</h3><p class="small muted">${esc(dateFormat.format(new Date(x.start)))}</p></div><span class="small">${x.start<=Date.now()?'In corso':x.duration?esc(x.duration)+' min':'Durata da confermare'}</span></article>`).join(''):'<p class="info-note">Nessun appuntamento confermato per questo giorno.</p>'}</div>`;
    qa('[data-day]',calendar).forEach(el=>el.addEventListener('click',()=>{filter=el.dataset.day;renderCalendar();q(`[data-day="${filter}"]`,calendar).focus();}));
  }
  if(calendar)renderCalendar();
  const root=q('#quiz-root');if(!root)return;
  const questions=[
    {title:'Cosa cerchi nel tuo allenamento?',hint:'Scegli ciò che conta di più per te.',options:[['forza','Sentirmi più forte'],['resistenza','Avere più energia e resistenza'],['mobilita','Muovermi con più scioltezza'],['benessere','Dedicare tempo a me']]},
    {title:'Da dove parti?',hint:'Ogni percorso ha un punto di partenza.',options:[['inizio','È la mia prima esperienza'],['inizio','Riprendo dopo una pausa'],['esperto','Mi alleno già con regolarità']]},
    {title:'Quale ritmo ti somiglia?',hint:'Pensa al tipo di esperienza che preferisci.',options:[['moderata','Graduale e controllato'],['moderata','Dinamico, ma senza fretta'],['intensa','Intenso e coinvolgente']]},
    {title:'Come ti piace allenarti?',hint:'Scegli l’ambiente in cui ti senti meglio.',options:[['individuale','Con i miei tempi, individualmente'],['gruppo','Con l’energia di un gruppo'],['qualsiasi','Mi piacciono entrambe le possibilità']]},
    {title:'Su cosa vuoi concentrarti?',hint:'Non è un piano di allenamento: raccontaci il tuo interesse.',options:[['forza','Forza e controllo'],['resistenza','Resistenza e movimento'],['mobilita','Mobilità e fluidità'],['benessere','Un’esperienza varia']]},
    {title:'Quando ti piacerebbe venire?',hint:'Seleziona almeno un giorno e una fascia. Puoi sceglierne più di una.'}
  ];
  let step=0,answers=[],selectedIndices=[];
  const labels={forza:'Forza',resistenza:'Resistenza',mobilita:'Mobilità',benessere:'Benessere',inizio:'Un nuovo inizio',esperto:'Esperienza',moderata:'Ritmo graduale',intensa:'Ritmo intenso',individuale:'Tempi personali',gruppo:'Energia del gruppo',qualsiasi:'Flessibilità'};
  function focusTitle(){q('h2',root)?.focus({preventScroll:true});}
  function renderStep(focus=true){
    const item=questions[step],saved=answers[step];
    const options=step<5?`<fieldset class="quiz-options"><legend class="visually-hidden">${esc(item.title)}</legend>${item.options.map(([v,label],i)=>`<label class="option"><input type="radio" name="answer" value="${v}" data-index="${i}" ${selectedIndices[step]===i?'checked':''}><span>${esc(label)}</span></label>`).join('')}</fieldset>`:`<fieldset class="quiz-fieldset"><legend>Quali giorni?</legend><div class="choices-grid">${dayNames.slice(1).map((name,i)=>`<label class="option"><input type="checkbox" name="day" value="${i+1}" ${saved?.days.includes(i+1)?'checked':''}>${name}</label>`).join('')}</div></fieldset><fieldset class="quiz-fieldset"><legend>Quali fasce orarie?</legend><div class="choices-grid">${[['mattina','Mattina · prima delle 12'],['pomeriggio','Pomeriggio · 12–18'],['sera','Sera · dalle 18']].map(([v,label])=>`<label class="option"><input type="checkbox" name="slot" value="${v}" ${saved?.slots.includes(v)?'checked':''}>${label}</label>`).join('')}</div></fieldset>`;
    root.innerHTML=`<div class="quiz-scene"><div class="quiz-progress-row"><span>Il tuo percorso</span><span>0${step+1} / 06</span></div><div class="progress" role="progressbar" aria-label="Avanzamento del quiz" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${step+1}"><span style="width:${(step+1)/6*100}%"></span></div><h2 tabindex="-1">${esc(item.title)}</h2><p class="hint">${esc(item.hint)}</p><form id="quiz-form">${options}<p class="error" id="quiz-error" role="alert"></p><div class="quiz-actions"><button class="back" type="button" data-back ${step===0?'disabled':''}>← Indietro</button><button class="btn" type="submit">${step===5?'Scopri il risultato':'Continua'} <span aria-hidden="true">↗</span></button></div></form></div>`;
    function read(){
      if(step<5){const chosen=q('input[name=answer]:checked',root);if(!chosen)return false;answers[step]=chosen.value;selectedIndices[step]=Number(chosen.dataset.index);}
      else{const days=qa('input[name=day]:checked',root).map(x=>Number(x.value)),slots=qa('input[name=slot]:checked',root).map(x=>x.value);answers[step]={days,slots};if(!days.length||!slots.length)return false;}
      return true;
    }
    q('[data-back]',root).addEventListener('click',()=>{read();step--;renderStep();});
    q('#quiz-form',root).addEventListener('submit',e=>{e.preventDefault();if(!read()){q('#quiz-error').textContent=step===5?'Seleziona almeno un giorno e una fascia oraria.':'Scegli una risposta per continuare.';return;}if(step===5)renderResult();else{step++;renderStep();}});
    if(focus)focusTitle();
  }
  function renderResult(){
    const ranked=E.rank(c,answers),best=ranked[0],alternative=ranked[1],tags=[answers[0],answers[3],answers[4]].filter((v,i,a)=>a.indexOf(v)===i);
    let detail='';
    if(best){
      detail=`<span class="eyebrow purple">Un’attività da esplorare</span><h2 tabindex="-1">${esc(best.name)}</h2>${best.image?'<img class="result-image" src="'+esc(best.image)+'" alt="'+esc(best.imageAlt)+'" width="1200" height="800">':''}<p class="result-copy">${esc(best.description)}</p><p class="small">Affinità con le tue risposte: ${best.reasons.length?[...new Set(best.reasons)].map(x=>esc(labels[x]||x)).join(', '):'un punto di partenza da approfondire con lo staff'}.</p>`;
      if(best.kind==='free')detail+=`<div class="result-detail"><h3>${best.windows.length?'Fasce compatibili in sala':'Nessuna fascia compatibile in sala'}</h3>${best.windows.length?'<ul>'+best.windows.slice(0,4).map(w=>'<li>'+esc(dateFormat.format(new Date(w.date+'T12:00:00Z')))+' · '+w.from+'–'+w.to+'</li>').join('')+'</ul>':'<p>Nei prossimi sette giorni la sala non risulta aperta nelle fasce che hai selezionato.</p>'}<p>Accesso libero negli orari della sala: queste fasce non sono prenotazioni. Personale qualificato dal lunedì al sabato, domenica esclusa.</p></div>`;
      else if(best.appointments.length)detail+=`<div class="result-detail"><h3>Appuntamenti compatibili</h3><ul>${best.appointments.slice(0,3).map(e=>`<li>${esc(dateFormat.format(new Date(e.start)))} · ${esc(e.time)}</li>`).join('')}</ul></div>`;
      else detail+='<div class="result-detail"><h3>Nessun appuntamento compatibile</h3><p>Nei prossimi 35 giorni non risultano lezioni confermate che coincidano con i giorni e le fasce che hai scelto. Chiedi allo staff le alternative.</p></div>';
      if(alternative)detail+=`<p class="result-copy">Un’altra attività da esplorare: <strong>${esc(alternative.name)}</strong>. ${alternative.kind==='free'?(alternative.windows.length?'Ci sono fasce di apertura compatibili.':'Non ci sono fasce di apertura compatibili nei prossimi sette giorni.'):alternative.appointments.length?esc(dateFormat.format(new Date(alternative.appointments[0].start)))+' · '+esc(alternative.appointments[0].time):'Non risultano appuntamenti compatibili nei prossimi 35 giorni.'}</p>`;
    }else detail='<span class="eyebrow purple">Le tue preferenze sono il punto di partenza</span><h2 tabindex="-1">Ti piace l’energia del gruppo.</h2><p class="result-copy">Chiedi allo staff quali corsi sono disponibili. Al momento non abbiamo un’attività di gruppo confermata nel catalogo del sito da abbinare alle tue risposte.</p>';
    root.innerHTML=`<div class="quiz-scene">${detail}<p class="small" style="margin-top:25px">Il tuo profilo di preferenze</p><div>${tags.map(t=>`<span class="result-tag">${esc(labels[t])}</span>`).join('')}</div><p class="small muted" style="margin-top:20px">Il risultato considera solo le attività confermate sul sito. È un orientamento, non una prescrizione di allenamento.</p><div class="actions">${button('contatti.html','Parlane con lo staff')}${button('corsi.html','Vedi il calendario','outline')}</div><div class="quiz-actions"><button class="back" type="button" data-edit>← Modifica le risposte</button><button class="back" type="button" data-restart>Ricomincia ↻</button></div></div>`;
    q('[data-restart]').addEventListener('click',()=>{answers=[];selectedIndices=[];step=0;renderStep();});
    q('[data-edit]').addEventListener('click',()=>{step=5;renderStep();});focusTitle();
  }
  renderStep(false);
})();
