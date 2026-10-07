"""One-time, authored layer extraction from the approved poster; no frame synthesis."""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from pathlib import Path
root=Path(__file__).resolve().parents[1]; out=root/'assets/scenes/Seattle'
im=Image.open(out/'source.png').convert('RGBA'); W,H=im.size
# Explicit silhouette: hull/cabin, three crane masts, two navigation masts, rigging.
polys=[[(641,389),(676,371),(711,365),(781,376),(823,391),(829,366),(942,367),(943,377),(972,378),(973,392),(956,400),(965,418),(977,440),(969,521),(932,537),(710,538),(659,529),(652,470),(641,404)],[(752,252),(768,250),(776,329),(780,366),(753,370)],[(796,276),(813,276),(821,379),(795,374)],[(745,321),(784,322),(847,351),(891,373),(887,379),(825,352),(784,334),(745,335)],[(718,274),(728,269),(733,370),(719,369)],[(842,336),(855,332),(861,382),(845,383)],[(900,307),(908,306),(913,374),(902,374)]]
mask=Image.new('L',(W*4,H*4));d=ImageDraw.Draw(mask)
for poly in polys:d.polygon([(x*4,y*4) for x,y in poly],fill=255)
for a,b in [((724,268),(724,375)),((710,294),(738,294)),((715,306),(740,306)),((904,304),(904,377)),((892,330),(917,330)),((893,343),(919,343)),((766,266),(726,329)),((807,281),(768,342)),((906,318),(945,371))]:d.line((a[0]*4,a[1]*4,b[0]*4,b[1]*4),fill=255,width=6)
mask=mask.resize((W,H),Image.Resampling.LANCZOS)
ship=im.copy();ship.putalpha(mask);ship.crop((636,242,982,542)).save(out/'ship.png')
# Blend only the vacated area, keeping original pixels elsewhere unchanged.
clean=Image.open(root/'art-direction/seattle-clean-generated.png').convert('RGBA').resize((W,H),Image.Resampling.LANCZOS)
repair=mask.filter(ImageFilter.MaxFilter(19));dr=ImageDraw.Draw(repair)
dr.polygon([(653,519),(843,527),(853,667),(817,718),(708,728),(650,657)],fill=255)
repair=repair.filter(ImageFilter.GaussianBlur(4))
Image.composite(clean,im,repair).save(out/'background.png')
# Artwork coverage: water may move within collage, never across paper margins.
water=Image.new('L',(W,H));dw=ImageDraw.Draw(water)
dw.polygon([(54,468),(980,468),(980,562),(954,602),(918,615),(880,641),(839,650),(813,708),(726,713),(698,669),(632,676),(582,649),(485,664),(424,623),(341,626),(272,596),(202,575),(137,571),(89,540),(54,519)],fill=255)
wm=Image.new('RGBA',(W,H),'white');wm.putalpha(water);wm.save(out/'water-mask.png')
# Texture used for thin wake fragments, extracted from original material.
im.crop((606,462,622,467)).save(out/'wake-shell.png')
print('Prepared fixed background, exact-source ship, water coverage and wake material.')
