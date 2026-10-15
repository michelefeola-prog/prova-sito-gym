/* Shared rendering for browser and static HTML synchronisation. */
(function(root){
 'use strict';
 const esc=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const days=['','Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
 function weekly(course,c){
  if(course.kind==='free'){const groups={};for(let day=1;day<=7;day++){const slots=c.opening.days[day],label=slots===null?'Da confermare':slots.length?slots.map(s=>s.join('–')).join(' · '):'Chiuso';(groups[label]??=[]).push(days[day]);}return Object.entries(groups).map(([time,ds])=>'<span>'+ds.join(' · ')+' <strong>'+esc(time)+'</strong></span>').join('');}
  const groups={};
  for(let d=1;d<=7;d++){const times=c.schedule.sessions.filter(s=>s.course===course.id&&s.day===d).map(s=>s.time).sort();if(times.length){const key=times.join(' · ');(groups[key]??=[]).push(days[d]);}}
  return Object.entries(groups).map(([time,ds])=>`<span>${ds.join(' · ')} <strong>${esc(time)}</strong></span>`).join('');
 }
 function card(x,c,compact=false){return `<article class="course-card" id="corso-${esc(x.id)}"><a class="course-image" href="${compact?'corsi.html#corso-'+esc(x.id):'#info-'+esc(x.id)}" aria-label="Scopri ${esc(x.name)}"><img src="${esc(x.image)}" alt="${esc(x.imageAlt)}" width="1200" height="800" loading="lazy"><span class="course-number" aria-hidden="true">${String(x.order).padStart(2,'0')}</span></a><div class="course-body"><p class="course-kicker">${esc(x.eyebrow)}</p><h3>${esc(x.name)}</h3><div class="course-times" aria-label="Orari ${esc(x.name)}">${weekly(x,c)}</div><p>${esc(x.description)}</p>${compact?`<a class="btn text" href="corsi.html#corso-${esc(x.id)}">Scopri il corso <span aria-hidden="true">↗</span></a>`:`<details id="info-${esc(x.id)}"><summary>Come si svolge</summary><p>${esc(x.detail)}</p></details><a class="course-contact" href="contatti.html">Chiedi informazioni <span aria-hidden="true">↗</span></a>`}</div></article>`;}
 function overview(c){return `<div class="week-overview">${[1,2,3,4,5,6,7].map(day=>{const rows=c.schedule.sessions.filter(s=>s.day===day).sort((a,b)=>a.time.localeCompare(b.time));return `<section class="week-day"><h3>${['','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'][day]}</h3>${rows.length?'<ul>'+rows.map(s=>`<li><time>${esc(s.time)}</time><a href="#corso-${esc(s.course)}">${esc(c.courses.find(x=>x.id===s.course).name)}</a></li>`).join('')+'</ul>':'<p>Nessun corso in programma.<br>Sala pesi '+esc(c.opening.days[day][0].join('–'))+'.</p>'}</section>`;}).join('')}</div>`;}
 const api={card,weekly,overview};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GymCatalog=api;
})(typeof window==='undefined'?globalThis:window);
