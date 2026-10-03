"""Prepare locally hosted variable fonts from the official Google Fonts service."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote
import re

root=Path(__file__).resolve().parents[1]
dest=root/'public'/'fonts'
dest.mkdir(parents=True,exist_ok=True)
chars=set()
for base in ['components','app','data']:
 for p in (root/base).rglob('*'):
  if p.suffix in ['.tsx','.ts','.json','.css']:
   chars.update(re.findall(r'[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]',p.read_text(encoding='utf-8')))
ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
def fetch(url):
 with urlopen(Request(url,headers={'User-Agent':ua}),timeout=50) as response:return response.read()
faces=[]
for family,name,text in [('Inter','inter-latin',''.join(chr(i) for i in range(32,127))+'—–·↑↓←→↗’'),('Noto Sans SC','noto-sans-sc-ui',''.join(sorted(chars)))]:
 url='https://fonts.googleapis.com/css2?family='+quote(family)+':wght@400..700&display=swap&text='+quote(text)
 css=fetch(url).decode()
 match=re.search(r'url\((https://[^)]+)\)',css)
 if not match:raise RuntimeError('Missing font source for '+family)
 payload=fetch(match.group(1))
 if payload[:4]!=b'wOF2':raise RuntimeError('Expected a WOFF2 font for '+family)
 (dest/(name+'.woff2')).write_bytes(payload)
 print(f'{family}: {len(payload):,} bytes; '+re.search(r'font-weight:([^;]+)',css).group(0))
 faces.append(css.replace(match.group(1),'/fonts/'+name+'.woff2'))
for family in ['inter','notosanssc']:
 (dest/(family+'-OFL.txt')).write_bytes(fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt'))
(root/'app'/'font-faces.css').write_text('\n'.join(faces),encoding='utf-8')
(dest/'README.md').write_text('Official sources: https://github.com/google/fonts/tree/main/ofl/inter and https://github.com/google/fonts/tree/main/ofl/notosanssc. WOFF2 subsets supplied by the official Google Fonts CSS API. Fonts are locally hosted; browsers make no external font requests. Regenerate after adding UI characters with python scripts/prepare-ui-fonts.py. See bundled OFL licenses.\n',encoding='utf-8')