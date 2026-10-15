/* Optional utility: node tools/configure-seo.cjs https://USER.github.io/REPOSITORY/ */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),raw=process.argv[2];
let base;try{base=new URL(raw);if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw Error();}catch{console.error('Indica un URL pubblico https valido, senza parametri.');process.exit(1);}
if(!base.pathname.endsWith('/'))base.pathname+='/';
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data/config.js'),'utf8'),sandbox);const c=sandbox.window.GYM_CONFIG;
const xml=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const pages=['index.html','palestra.html','corsi.html','quiz.html','contatti.html'];
for(const p of pages){let text=fs.readFileSync(path.join(root,p),'utf8');text=text.replace(/<!-- SEO START -->[\s\S]*?<!-- SEO END -->/g,'');
 const url=new URL(p==='index.html'?'':p,base).href;
 const image=new URL('assets/images/brand-original.png',base).href;
 text=text.replace(/<meta property="og:image" content="[^"]*">/,`<meta property="og:image" content="${xml(image)}">`);
 const schema={'@context':'https://schema.org','@type':'ExerciseGym',name:c.name,url:base.href,address:{'@type':'PostalAddress',streetAddress:c.address,addressLocality:'Caserta',postalCode:'81100',addressCountry:'IT'},sameAs:[c.instagram]};
 if(c.phone)schema.telephone=c.phone;
 const safeJSON=JSON.stringify(schema).replace(/</g,'\\u003c');
 text=text.replace('</head>',`<!-- SEO START --><link rel="canonical" href="${xml(url)}"><meta property="og:url" content="${xml(url)}">${p==='index.html'?'<script type="application/ld+json">'+safeJSON+'</script>':''}<!-- SEO END --></head>`);
 fs.writeFileSync(path.join(root,p),text);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>'+xml(new URL(p==='index.html'?'':p,base).href)+'</loc></url>').join('')+'</urlset>\n');
fs.writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+new URL('sitemap.xml',base).href+'\n');
let notFound=fs.readFileSync(path.join(root,'404.html'),'utf8');notFound=notFound.replace(/href="[^"]*"/,`href="${xml(base.href)}"`);fs.writeFileSync(path.join(root,'404.html'),notFound);
console.log('URL canonici, anteprima social, dati strutturati, sitemap e 404 configurati:',base.href);
