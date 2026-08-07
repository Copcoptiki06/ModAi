from pathlib import Path
import ast, math, re
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'public/question-images/curriculum'; OUT.mkdir(parents=True,exist_ok=True)
def f(n,b=False):
 p=Path('C:/Windows/Fonts')/('arialbd.ttf' if b else 'arial.ttf'); return ImageFont.truetype(str(p),n)
def items():
 text=(ROOT/'data/curriculum-visual-inventory.ts').read_text(encoding='utf-8'); out=[]; grade=0
 for line in text.splitlines():
  g=re.match(r'\s*(\d):\s*{',line)
  if g: grade=int(g.group(1)); continue
  m=re.match(r'\s*"([^"]+)":\s*\[(.*)\],?',line)
  if m and grade:
   for concept in ast.literal_eval('['+m.group(2)+']'): out.append((grade,m.group(1),concept))
 return out
def theme(s):
 s=s.casefold(); groups=[(('güneş','ay','gezegen','uzay','yıldız','galaksi','evren','mevsim'),((12,24,58),(40,116,220),(255,199,62),'orbit')),(('hücre','organ','sistem','kalp','akciğer','böbrek','dna','gen','kromozom','mitoz','mayoz'),((40,24,64),(147,72,181),(66,205,162),'cell')),(('ışık','ayna','mercek','gölge','renk','yansı','kırıl'),((16,43,68),(36,159,190),(255,219,91),'ray')),(('elektr','devre','pil','lamba','direnç','amper','volt'),((24,42,48),(27,155,112),(255,193,7),'circuit')),(('kuvvet','enerji','makara','kaldıraç','dişli','hareket','sürat','hız'),((44,35,24),(231,112,52),(250,208,92),'gear')),(('ses','titreş','frekans','genlik'),((32,31,68),(102,82,204),(72,202,228),'wave')),(('asit','baz','atom','proton','nötron','elektron','molekül','element','kimyasal','madde'),((23,48,64),(39,174,143),(235,107,86),'atom'))]
 for keys,value in groups:
  if any(k in s for k in keys): return value
 return ((23,55,40),(52,168,83),(174,219,92),'nature')
def wrap(d,s,font,w):
 lines=[]; cur=''
 for word in s.split():
  trial=(cur+' '+word).strip()
  if d.textbbox((0,0),trial,font=font)[2]<=w: cur=trial
  else: lines.append(cur); cur=word
 if cur: lines.append(cur)
 return lines
def motif(d,kind,main,accent):
 cx,cy=920,340
 if kind=='orbit':
  d.ellipse((820,240,1020,440),fill=accent)
  for r in (160,235): d.ellipse((cx-r,cy-r//2,cx+r,cy+r//2),outline=main,width=8)
 elif kind=='cell':
  d.ellipse((690,185,1150,495),fill=(225,247,240),outline=main,width=14); d.ellipse((855,275,985,405),fill=accent)
  for a in range(0,360,60): x=cx+155*math.cos(math.radians(a));y=cy+95*math.sin(math.radians(a));d.ellipse((x-22,y-15,x+22,y+15),fill=main)
 elif kind=='ray': d.line((660,170,920,340,1160,190),fill=accent,width=18); d.line((920,100,920,570),fill=main,width=7)
 elif kind=='circuit':
  d.rounded_rectangle((680,170,1150,510),radius=45,outline=main,width=17); d.ellipse((850,235,990,375),fill=accent); d.line((920,375,920,510),fill=main,width=17)
 elif kind=='gear':
  d.ellipse((790,210,1050,470),outline=main,width=25); d.ellipse((865,285,975,395),fill=accent)
  for a in range(0,360,45): d.line((cx+120*math.cos(math.radians(a)),cy+120*math.sin(math.radians(a)),cx+190*math.cos(math.radians(a)),cy+190*math.sin(math.radians(a))),fill=accent,width=24)
 elif kind=='wave':
  d.line([(x,340+110*math.sin((x-650)/34)) for x in range(650,1180,5)],fill=accent,width=13)
 elif kind=='atom':
  d.ellipse((860,280,980,400),fill=accent)
  for k in (0,55,110): d.arc((690,205,1150,475),k,k+225,fill=main,width=10)
 else:
  d.ellipse((780,205,1060,485),fill=(225,247,232),outline=main,width=14); d.polygon([(920,175),(970,300),(1110,315),(1000,395),(1035,525),(920,450),(805,525),(840,395),(730,315),(870,300)],fill=accent)
def make(g,u,c,i):
 bg,main,accent,kind=theme(c); im=Image.new('RGB',(1280,720),bg); d=ImageDraw.Draw(im); d.rounded_rectangle((42,42,1238,678),42,fill=(250,250,247),outline=main,width=8); d.rounded_rectangle((76,78,580,132),20,fill=main); d.text((100,91),f'{g}. SINIF  •  FEN BİLİMLERİ',font=f(25,True),fill='white'); y=190
 for line in wrap(d,c,f(54,True),500)[:3]: d.text((92,y),line,font=f(54,True),fill=bg); y+=67
 d.text((94,535),u,font=f(24),fill=(72,82,92)); d.rounded_rectangle((92,588,520,635),16,fill=(235,240,242)); d.text((112,598),'Kavram görseli • MODAI',font=f(22,True),fill=main); motif(d,kind,main,accent); im.save(OUT/f'g{g}-{i:03d}.png',optimize=True)
all_items=items()
for i,row in enumerate(all_items,1): make(*row,i)
print(f'{len(all_items)} kavram görseli oluşturuldu.')
