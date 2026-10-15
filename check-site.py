"""Static checks: python3 tests/check-site.py. No external packages required."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import re
ROOT=Path(__file__).resolve().parents[1]
class Document(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=[];self.h1=0;self.lang=None;self.meta={};self.images=[];self.current=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content')
  if tag=='img':self.images.append(a)
  if a.get('aria-current')=='page':self.current+=1
  if tag in ('a','link') and a.get('href'):self.refs.append(a['href'])
  if tag in ('script','img') and a.get('src'):self.refs.append(a['src'])
docs={}
for file in ROOT.glob('*.html'):
 d=Document();d.feed(file.read_text());docs[file.name]=d
errors=[];checked=0
for name,d in docs.items():
 if d.h1!=1:errors.append(f'{name}: expected one h1')
 if d.lang!='it':errors.append(f'{name}: wrong language')
 if len(d.ids)!=len(set(d.ids)):errors.append(f'{name}: duplicate IDs')
 if name!='404.html':
  if d.current!=1:errors.append(f'{name}: active navigation item')
  if not d.meta.get('description'):errors.append(f'{name}: missing description')
  for img in d.images:
   if 'alt' not in img or 'width' not in img or 'height' not in img:errors.append(f'{name}: image dimensions or alt')
 for ref in d.refs:
  u=urlparse(ref)
  if u.scheme or u.netloc:continue
  if ref.startswith('/'):errors.append(f'{name}: root-relative URL {ref}')
  p=ROOT/unquote(u.path) if u.path else ROOT/name
  if not p.is_file():errors.append(f'{name}: missing {ref}')
  if u.fragment and p.name in docs and u.fragment not in docs[p.name].ids:errors.append(f'{name}: missing fragment {ref}')
  checked+=1
for css in ROOT.rglob('*.css'):
 for url in re.findall(r'url\([\'"]?([^\)\'" ]+)',css.read_text()):
  if url.startswith(('http','data:')):errors.append(f'external dependency {url}')
  elif not (css.parent/url).is_file():errors.append(f'{css.name}: missing {url}')
assert not errors,'\n'.join(errors)
print(f'PASS: {len(docs)} pages; {checked} local references; unique IDs, metadata, active menu, images and fonts.')
print('No viewport rendering tested by this script.')
