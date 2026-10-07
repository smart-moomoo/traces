"""Build original-art layers once from an explicit semantic mask manifest.

Usage: python scripts/prepare-scene.py assets/scenes/Seattle/layers.json
Reports geometry/provenance facts only; it never declares visual acceptance.
"""
import argparse,hashlib,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
p=argparse.ArgumentParser();p.add_argument('manifest',type=Path);a=p.parse_args()
manifest=a.manifest.resolve();folder=manifest.parent;spec=json.loads(manifest.read_text())
source_path=folder/spec['source'];source=Image.open(source_path).convert('RGBA');w,h=source.size
masks={};records=[]
def shapes(layer):
 im=Image.new('L',(w*4,h*4));d=ImageDraw.Draw(im)
 for poly in layer.get('polygons',[]):d.polygon([(x*4,y*4) for x,y in poly],fill=255)
 for line in layer.get('lines',[]):d.line([(x*4,y*4) for x,y in line['points']],fill=255,width=round(line['width']*4))
 return im.resize((w,h),Image.Resampling.LANCZOS)
for layer in spec['layers']:
 op=layer['op'];record={'id':layer['id'],'op':op,'file':layer['file'],'visualVerdict':'pending'}
 if op=='cutout':
  mask=shapes(layer);masks[layer['id']]=mask;result=source.copy();result.putalpha(mask);result=result.crop(tuple(layer['bounds']))
  record['rgbSource']='exact original pixels';record['bounds']=layer['bounds']
 elif op=='repair':
  mask=masks[layer['fromMask']].filter(ImageFilter.MaxFilter(layer.get('dilate',1)))
  d=ImageDraw.Draw(mask)
  for poly in layer.get('polygons',[]):d.polygon([tuple(v) for v in poly],fill=255)
  mask=mask.filter(ImageFilter.GaussianBlur(layer.get('feather',0)))
  fill_path=folder/layer['fill'];fill=Image.open(fill_path).convert('RGBA').resize((w,h),Image.Resampling.LANCZOS)
  result=Image.composite(fill,source,mask)
  record['fillSha256']=hashlib.sha256(fill_path.read_bytes()).hexdigest()
  record['originalPixelsOutsideRepairPreserved']=True
 elif op=='mask':
  result=Image.new('RGBA',(w,h),'white');result.putalpha(shapes(layer))
 elif op=='sample':result=source.crop(tuple(layer['bounds']))
 else:raise ValueError('Unknown operation '+op)
 result.save(folder/layer['file']);record['size']=result.size;record['sha256']=hashlib.sha256((folder/layer['file']).read_bytes()).hexdigest();records.append(record)
report={'source':spec['source'],'sourceSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'manifestSha256':hashlib.sha256(manifest.read_bytes()).hexdigest(),'status':'built-not-visually-accepted','layers':records}
(folder/'build-report.json').write_text(json.dumps(report,indent=2)+'\n')
print('Built',len(records),'layers; visual acceptance remains pending.')
