'use strict';
const regions = [
{id:'northwest',name:'西北',en:'PACIFIC NORTHWEST',x:12,y:17,origin:'15% 16%',note:'水面的光，城市的轮廓。'},
{id:'bay',name:'旧金山湾区',en:'SAN FRANCISCO BAY',x:10,y:47,origin:'9% 44%',note:'沿着海湾，收集细碎的日常。'},
{id:'socal',name:'南加州',en:'SOUTHERN CALIFORNIA',x:21,y:65,origin:'15% 65%',note:'棕榈树、海风与金色阳光。'},
{id:'texas',name:'德州',en:'TEXAS',x:49,y:76,origin:'46% 72%',note:'城市天际线，和安静的倒影。'},
{id:'midwest',name:'中西部',en:'THE MIDWEST',x:65,y:43,origin:'67% 29%',note:'河流穿过城市，雪落在校园。'},
{id:'louisiana',name:'路易斯安那',en:'LOUISIANA',x:63,y:76,origin:'60% 75%',note:'古老橡树，缓慢生长的时光。'},
{id:'atlantic',name:'东南海岸',en:'ATLANTIC COAST',x:83,y:64,origin:'84% 47%',note:'糖果色的街，树影深处的路。'},
{id:'florida',name:'佛罗里达',en:'FLORIDA',x:81,y:87,origin:'82% 78%',note:'水边的风，热带的明亮记忆。'}
];
const places = [
['Seattle','西雅图','northwest',37,39,'货轮驶过海湾，晚霞把城市染成金色。'],
['Bellevue','贝尔维尤','northwest',68,61,'绿意与楼宇相邻，城市也有轻柔的一面。'],
['San-Francisco','旧金山','bay',26,25,'红色桥梁横过海峡，雾与海留在记忆里。'],
['Stanford','斯坦福','bay',27,48,'钟塔立在晴空下，暖色石墙接住阳光。'],
['Mountain-View','山景城','bay',49,37,'在岸边停一停，看水面展开天空。'],
['Sunnyvale','森尼韦尔','bay',67,49,'海湾湿地把蓝与绿安静地铺开。'],
['San-Jose','圣何塞','bay',79,68,'盐田的颜色，像大地自己的调色盘。'],
['Los-Gatos','洛斯盖图斯','bay',49,70,'湖面、树影，和一段不用赶路的下午。'],
['Santa-Cruz','圣克鲁兹','bay',26,83,'灯塔守着海岸，浪花一遍遍写下白色。'],
['Los-Angeles','洛杉矶','socal',61,30,'天文台望向远处，城市在山脚下舒展。'],
['Santa-Monica','圣莫尼卡','socal',31,48,'棕榈树与街角，把阳光留在旅途中。'],
['San-Diego','圣迭戈','socal',68,74,'沿着海岸，把视线交给澄澈的蓝。'],
['Dallas','达拉斯','texas',68,39,'城市高楼像一列排列整齐的光。'],
['Fort-Worth','沃思堡','texas',31,59,'建筑在水中延续，倒影让时间放慢。'],
['Chicago','芝加哥','midwest',66,33,'河水穿过高楼，城市的线条有了方向。'],
['Champaign-Urbana','香槟–厄巴纳','midwest',36,68,'雪中的校园钟塔，留下干净而安静的一页。'],
['New-Orleans','新奥尔良','louisiana',67,62,'巨大的橡树展开枝桠，树荫里藏着时光。'],
['Wallace','华莱士','louisiana',31,37,'弯曲的白色围栏，带着目光走向远方。'],
['Charleston','查尔斯顿','atlantic',68,34,'浅色房子排成一行，街道有柔和的节奏。'],
['Savannah','萨凡纳','atlantic',32,68,'橡树长廊向前延伸，风穿过垂落的枝叶。'],
['Miami','迈阿密','florida',63,36,'水上的石舟，把花园的梦延伸到海里。'],
['Miami-Beach','迈阿密海滩','florida',79,65,'走到堤岸尽头，让海与天空靠近。'],
['Everglades','大沼泽地','florida',28,65,'水草之间，遇见湿地安静而原始的生命。']
].map((p,i)=>({id:p[0],name:p[1],region:p[2],x:p[3],y:p[4],description:p[5],en:p[0].replaceAll('-',' '),number:i+1}));
