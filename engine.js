/* Pure functions, usable in browser and Node. All dates are interpreted in Rome. */
(function (root) {
  'use strict';
  const zone='Europe/Rome';
  const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function parts(ms) { return Object.fromEntries(formatter.formatToParts(new Date(ms)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value])); }
  function dateKey(ms) { const p=parts(ms); return `${p.year}-${p.month}-${p.day}`; }
  function shiftDate(key,n) {const d=new Date(key+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  function weekday(key) {return new Date(key+'T12:00:00Z').getUTCDay()||7;}
  function toRome(key,time) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return null;
    const utc=Date.parse(`${key}T${time}:00Z`);
    // Testing both Italian offsets also rejects nonexistent spring-transition times.
    // An ambiguous autumn time uses its first occurrence deterministically.
    for(const offset of [120,60]){const ms=utc-offset*60000,p=parts(ms);if(dateKey(ms)===key&&`${p.hour}:${p.minute}`===time)return ms;}
    return null;
  }
  function courseList(c) {return c.courses.filter(x=>x.confirmed);}
  function events(c,now=Date.now(),days=35) {
    const s=c.schedule;
    if(!s.confirmed||!s.validFrom)return [];
    const active=new Set(courseList(c).map(x=>x.id)),out=[],today=dateKey(now);
    for(let n=-1;n<=days;n++){
      const date=shiftDate(today,n);
      if(date<s.validFrom||(s.validThrough&&date>s.validThrough)||s.closures.includes(date))continue;
      const list=[...s.sessions.filter(x=>x.day===weekday(date)),...s.additions.filter(x=>x.date===date)];
      for(const x of list){
        if(!active.has(x.course)||x.validFrom&&date<x.validFrom||x.validThrough&&date>x.validThrough)continue;
        if(s.cancellations.some(v=>v.date===date&&v.session===x.id))continue;
        const start=toRome(date,x.time);if(start===null)continue;
        const end=x.duration?start+x.duration*60000:null;
        if((end??start)<=now)continue;
        out.push({...x,date,start,end,name:c.courses.find(v=>v.id===x.course).name});
      }
    }
    return out.sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
  }
  function next(c,now=Date.now()) {const all=events(c,now),up=all.filter(x=>x.start>now);return {current:all.filter(x=>x.start<=now&&x.end>now),upcoming:up.length?up.filter(x=>x.start===up[0].start):[]};}
  function countdown(ms) {let n=Math.max(0,Math.floor(ms/1000));return [Math.floor(n/86400),Math.floor(n%86400/3600),Math.floor(n%3600/60),n%60];}
  function matchesSlot(time,slots){const h=Number(time.slice(0,2));return slots.includes('qualsiasi')||slots.includes(h<12?'mattina':h<18?'pomeriggio':'sera');}
  function compatible(e,a){return (!a.days?.length||a.days.includes(weekday(e.date)))&&matchesSlot(e.time,a.slots||['qualsiasi']);}
  function freeWindows(c,a,now=Date.now()){
    if(!c.opening?.confirmed)return [];
    const ranges={mattina:[0,720],pomeriggio:[720,1080],sera:[1080,1440],qualsiasi:[0,1440]};
    const minutes=s=>Number(s.slice(0,2))*60+Number(s.slice(3));
    const time=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
    const out=[];
    for(let n=0;n<7;n++){
      const date=shiftDate(dateKey(now),n),day=weekday(date);
      if(a.days?.length&&!a.days.includes(day))continue;
      const exception=c.opening.exceptions.find(x=>x.date===date),slots=exception?exception.slots:c.opening.days[day];
      for(const slot of slots||[])for(const period of a.slots||['qualsiasi']){
        const r=ranges[period];if(!r)continue;
        let start=Math.max(minutes(slot[0]),r[0]),end=Math.min(minutes(slot[1]),r[1]);
        if(n===0){const p=parts(now);start=Math.max(start,Number(p.hour)*60+Number(p.minute));}
        if(start<end)out.push({date,from:time(start),to:time(end)});
      }
    }
    return out;
  }
  function rank(c,answers,now=Date.now()){
    const [goal,experience,intensity,mode,focus,availability]=answers;
    const weights=[[goal,4],[experience,1],[intensity,2],[mode,4],[focus,3]];
    const allEvents=events(c,now);
    return courseList(c).filter(x=>mode!=='gruppo'||x.tags.includes('gruppo')).filter(x=>mode!=='individuale'||x.tags.includes('individuale')).map(x=>{
      const reasons=weights.filter(([tag])=>x.tags.includes(tag)).map(([tag])=>tag);
      const appointments=allEvents.filter(e=>e.course===x.id&&e.start>now&&compatible(e,availability));
      return {...x,windows:x.kind==='free'?freeWindows(c,availability,now):[],score:weights.reduce((sum,[tag,w])=>sum+(x.tags.includes(tag)?w:0),0),reasons,appointments};
    }).sort((a,b)=>b.score-a.score||Number(b.appointments.length>0)-Number(a.appointments.length>0)||(a.order||999)-(b.order||999)||a.id.localeCompare(b.id));
  }
  const api={parts,dateKey,shiftDate,weekday,toRome,courseList,events,next,countdown,compatible,freeWindows,rank};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GymEngine=api;
})(typeof window==='undefined'?globalThis:window);
