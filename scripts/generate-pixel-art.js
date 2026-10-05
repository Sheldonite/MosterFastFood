/* Authored pixel primitives, transparent PNGs, no image service or runtime cutouts. */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const root = path.join(__dirname, "..", "assets", "pixel");
const ink = "#101522", cream = "#fff1cd", gold = "#efbe55", coral = "#ff7469", teal = "#69dec3";
function color(value) {
  const hex = value.replace("#", "");
  return [parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),255];
}
function surface(w,h) {
  const data = Buffer.alloc(w*h*4);
  const set = (x,y,c) => { x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<w&&y<h) { const rgba=color(c); for(let i=0;i<4;i++) data[(y*w+x)*4+i]=rgba[i]; } };
  const rect=(x,y,rw,rh,c)=> { for(let py=Math.round(y);py<Math.round(y+rh);py++) for(let px=Math.round(x);px<Math.round(x+rw);px++) set(px,py,c); };
  const ellipse=(x,y,rx,ry,c)=> { for(let py=Math.floor(y-ry);py<=y+ry;py++) for(let px=Math.floor(x-rx);px<=x+rx;px++) if(((px-x)/rx)**2+((py-y)/ry)**2<=1) set(px,py,c); };
  const line=(x1,y1,x2,y2,c,width=1)=> { const steps=Math.max(Math.abs(x2-x1),Math.abs(y2-y1),1);for(let i=0;i<=steps;i++) rect(x1+(x2-x1)*i/steps,y1+(y2-y1)*i/steps,width,width,c); };
  const triangle=(x,y,size,c)=> { for(let row=0;row<size;row++) rect(x-row/2,y+row,row+1,1,c); };
  return {w,h,data,set,rect,ellipse,line,triangle};
}
function crc(buffer) { let c=0xffffffff;for(const byte of buffer){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0; }
function chunk(type,data) { const name=Buffer.from(type), size=Buffer.alloc(4), checksum=Buffer.alloc(4);size.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([size,name,data,checksum]); }
function write(name,image) {
  const header=Buffer.alloc(13);header.writeUInt32BE(image.w,0);header.writeUInt32BE(image.h,4);header[8]=8;header[9]=6;
  const rows=Buffer.alloc((image.w*4+1)*image.h);for(let y=0;y<image.h;y++)image.data.copy(rows,y*(image.w*4+1)+1,y*image.w*4,(y+1)*image.w*4);
  const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",header),chunk("IDAT",zlib.deflateSync(rows)),chunk("IEND",Buffer.alloc(0))]);
  const target=path.join(root,name+".png");fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,png);
}
function paste(target,source,x,y) { for(let sy=0;sy<source.h;sy++)for(let sx=0;sx<source.w;sx++){const at=(sy*source.w+sx)*4;if(source.data[at+3])source.data.copy(target.data,((sy+y)*target.w+sx+x)*4,at,at+4);} }
const classes = {
  warrior:["#c25e49","#ef956d","#b6c6d6"], ranger:["#398871","#75c5a0","#cda372"],
  mage:["#5b63ad","#a4a3ef","#75d9ea"], rogue:["#5b467d","#a387c2","#79dcaa"],
  paladin:["#b79148","#f4d281","#d6e4f2"], bard:["#467f9f","#8fc4da","#dcb476"]
};
function hero(kind,row=0,frame=0) {
  const s=surface(32,48), [base,light,accent]=classes[kind], bob=frame%2, back=row===3, side=row===1||row===2;
  s.ellipse(16,44,11,2,"#22303a");
  s.rect(8,20+bob,16,20,ink);s.rect(9,21+bob,14,18,base);s.rect(10,23+bob,4,15,light);
  s.rect(10,35+bob,5,8,ink);s.rect(18,35-bob,5,8,ink);s.rect(9,42+bob,7,3,accent);s.rect(18,42-bob,7,3,accent);
  s.rect(7,12+bob,18,14,ink);s.rect(9,13+bob,14,11,"#e7ac80");s.rect(10,14+bob,4,6,"#ffd5a0");
  s.rect(5,23+bob,5,11,ink);s.rect(6,24+bob,3,8,accent);s.rect(23,23+bob,5,11,ink);s.rect(24,24+bob,3,8,accent);
  if(kind==="mage"||kind==="bard") { s.triangle(16,2+bob,16,ink);s.triangle(16,4+bob,12,base);s.rect(5,16+bob,22,3,ink);s.rect(7,16+bob,18,2,light); }
  else { s.rect(8,8+bob,16,8,ink);s.rect(9,9+bob,14,6,kind==="warrior"||kind==="paladin"?accent:base);s.rect(11,8+bob,9,2,light); }
  if(!back) { s.rect(side?(row===1?10:20):11,18+bob,2,2,ink);if(!side)s.rect(20,18+bob,2,2,ink);s.rect(14,23+bob,5,1,"#a46d62"); }
  else s.rect(10,15+bob,12,11,base);
  s.rect(10,29+bob,13,2,gold);
  const weaponX=row===1?3:26, lift=frame===3?-5:0;
  if(kind==="warrior"){s.rect(weaponX,17+lift,2,19,ink);s.rect(weaponX,18+lift,1,13,cream);s.rect(weaponX-2,32+lift,6,2,gold);s.rect(weaponX,34+lift,2,4,"#976749");s.ellipse(5,29,4,7,ink);s.ellipse(5,29,3,6,base);s.rect(4,25,2,8,gold);}
  if(kind==="ranger"){s.line(weaponX,16+lift,weaponX+2,22+lift,gold,2);s.line(weaponX+2,22+lift,weaponX+2,30+lift,gold,2);s.line(weaponX+2,30+lift,weaponX,36+lift,gold,2);s.line(weaponX,17+lift,weaponX,35+lift,cream);}
  if(kind==="mage"){s.rect(weaponX,13+lift,2,27,"#b78759");s.ellipse(weaponX+1,13+lift,4,4,ink);s.ellipse(weaponX+1,12+lift,3,3,teal);s.set(weaponX,11+lift,cream);}
  if(kind==="rogue"){s.line(weaponX,24+lift,weaponX+3,16+lift,cream,2);s.rect(weaponX-1,26+lift,5,2,gold);s.line(3,26,0,19,teal,2);}
  if(kind==="paladin"){s.rect(weaponX,21+lift,2,18,"#a1744b");s.rect(weaponX-3,16+lift,8,8,ink);s.rect(weaponX-2,17+lift,6,6,gold);s.rect(1,24,7,12,ink);s.rect(2,25,5,10,accent);s.rect(4,27,1,6,gold);}
  if(kind==="bard"){s.ellipse(25,30+lift,5,7,ink);s.ellipse(25,30+lift,4,6,gold);s.rect(25,16+lift,2,16,"#ae7846");s.rect(25,28+lift,1,8,cream);s.rect(25,32+lift,2,2,ink);}
  return s;
}
function boss(kind,row=0,frame=0) {
  const s=surface(64,64), bob=(frame%2)-(row===2?1:0);
  s.ellipse(32,58,24,4,"#233447");
  function face(y=35){s.rect(21,y+bob,4,5,ink);s.rect(39,y+bob,4,5,ink);s.set(21,y+bob,cream);s.set(39,y+bob,cream);s.rect(27,y+10+bob,10,row===1?5:2,ink);if(row===1)s.rect(29,y+11+bob,6,1,cream);}
  if(kind==="burger"){
    s.ellipse(32,27+bob,26,20,ink);s.ellipse(32,26+bob,24,18,"#bd713f");s.ellipse(31,23+bob,22,14,"#eeae60");
    s.rect(6,31+bob,52,6,ink);s.rect(8,32+bob,48,4,"#5fa866");s.rect(10,37+bob,44,4,"#d96251");s.rect(8,42+bob,48,7,ink);s.rect(10,43+bob,44,5,"#744835");
    s.rect(9,49+bob,46,6,"#d18b48");s.rect(13,55+bob,38,3,"#a45b36");s.rect(19,39+bob,14,3,gold);s.rect(31,39+bob,3,7,gold);
    [[21,15],[37,13],[29,21],[45,22],[14,25]].forEach(p=>s.rect(p[0],p[1]+bob,3,1,cream));face(23);
  } else if(kind==="cola"||kind==="shake"){
    s.rect(18,16+bob,29,40,ink);s.rect(20,18+bob,25,36,kind==="cola"?"#b94d51":"#9b7169");
    s.rect(22,19+bob,4,32,kind==="cola"?"#ec7970":"#d1a487");s.rect(18,15+bob,29,4,"#c6d0df");s.rect(16,12+bob,33,4,cream);
    s.rect(39,2+bob,4,11,teal);s.rect(37,2+bob,10,3,teal);s.rect(19,30+bob,27,13,kind==="cola"?"#df625e":"#e8d1a3");
    if(kind==="shake"){s.ellipse(32,11+bob,14,7,"#e9d4ad");s.ellipse(33,5+bob,4,4,coral);}face(28);
  } else if(kind==="fries"){
    for(let i=0;i<7;i++){const x=12+i*6,y=6+(i%3)*3;s.rect(x,y+bob,5,34,ink);s.rect(x+1,y+1+bob,3,30,gold);s.rect(x+1,y+2+bob,1,22,cream);}
    s.rect(11,29+bob,44,26,ink);s.rect(13,31+bob,40,22,"#c1544c");s.rect(15,33+bob,6,18,coral);s.rect(20,52+bob,27,5,"#913f45");face(33);
  } else if(["ketchup","mustard","mayo","sauce"].includes(kind)){
    const c={ketchup:"#d45f58",mustard:"#efbe55",mayo:"#e5dfc1",sauce:"#bd8858"}[kind];
    s.rect(25,4+bob,14,10,ink);s.rect(27,5+bob,10,8,c);s.rect(22,13+bob,20,7,ink);s.rect(16,20+bob,32,35,ink);s.rect(18,21+bob,28,32,c);s.rect(20,23+bob,4,26,cream);s.rect(20,53+bob,24,3,c);face(30);
  } else if(kind==="pizza"||kind==="nacho"||kind==="taco"){
    if(kind==="taco"){s.ellipse(32,35+bob,27,22,ink);s.ellipse(32,34+bob,25,20,gold);s.ellipse(32,26+bob,21,12,"#55886b");s.ellipse(32,32+bob,21,8,"#965741");s.ellipse(32,38+bob,24,11,"#e6aa52");}
    else{s.triangle(32,9+bob,45,ink);s.triangle(32,13+bob,38,gold);s.rect(10,52+bob,44,5,"#b97b40");[[30,29],[23,41],[38,43]].forEach(p=>s.ellipse(p[0],p[1]+bob,4,4,kind==="pizza"?"#bd4e51":"#519768"));}
    face(33);
  } else if(kind==="donut"){
    s.ellipse(32,32+bob,26,24,ink);s.ellipse(32,31+bob,24,22,"#cb945d");s.ellipse(32,29+bob,22,19,"#cf85ab");s.ellipse(32,29+bob,9,8,ink);s.ellipse(32,28+bob,7,6,"#493947");
    [[18,18],[39,16],[48,29],[41,43],[21,44],[12,31]].forEach((p,i)=>s.rect(p[0],p[1]+bob,3,2,i%2?teal:gold));s.rect(17,30+bob,3,4,ink);s.rect(45,30+bob,3,4,ink);s.rect(29,48+bob,8,2,ink);
  } else if(kind==="sushi"){
    s.ellipse(32,32+bob,25,19,ink);s.ellipse(32,31+bob,23,17,"#48776b");s.rect(12,22+bob,39,20,cream);s.rect(17,26+bob,30,12,"#ff907c");s.rect(20,28+bob,22,4,"#c75c63");s.rect(35,32+bob,9,7,teal);face(29);
  }
  if(row===3){s.rect(10,57,12,2,coral);s.rect(40,57,12,2,coral);}
  return s;
}
function icon(kind,index=0) {
  const s=surface(32,32),c=classes[kind]?.[1]||teal;
  if(kind==="potion"){s.rect(13,3,7,5,cream);s.rect(12,8,9,4,ink);s.rect(8,12,17,16,ink);s.rect(10,13,13,13,teal);s.rect(11,14,3,8,cream);s.rect(14,26,6,2,"#318d89");}
  else if(index===2){s.line(5,24,22,7,c,4);s.line(15,7,24,7,cream,3);s.line(24,7,24,16,cream,3);s.rect(4,10,7,2,c);s.rect(2,15,6,2,c);}
  else if(index===3){s.rect(7,5,18,18,ink);s.rect(9,7,14,14,c);s.triangle(16,21,7,c);s.rect(14,10,4,12,cream);s.rect(10,14,12,3,cream);}
  else if(kind==="mage"){s.ellipse(16,18,10,11,ink);s.ellipse(16,18,8,9,coral);s.triangle(16,2,15,gold);s.ellipse(16,20,4,6,cream);}
  else if(kind==="ranger"){s.line(5,25,24,6,cream,2);s.line(17,6,24,6,gold,3);s.line(24,6,24,13,gold,3);s.line(4,18,11,25,c,3);}
  else if(kind==="bard"){s.rect(12,7,3,17,gold);s.rect(15,7,11,3,gold);s.rect(23,9,3,13,gold);s.ellipse(9,24,5,3,cream);s.ellipse(21,22,5,3,cream);}
  else if(kind==="rogue"){s.line(8,25,22,6,cream,4);s.line(3,19,13,27,c,3);s.ellipse(24,22,4,5,teal);}
  else if(kind==="paladin"){s.rect(15,8,3,19,gold);s.rect(7,6,19,10,cream);s.rect(8,7,5,8,c);}
  else if(kind==="warrior"){s.line(9,25,24,7,cream,4);s.line(4,19,14,28,gold,3);s.line(5,27,10,22,"#c25e49",3);}
  else {s.ellipse(16,16,11,11,ink);s.ellipse(16,16,9,9,gold);s.rect(14,9,4,14,cream);s.rect(9,14,14,4,cream);}
  if(index===1){s.rect(3,27,26,2,c);s.rect(7,3,2,4,c);s.rect(26,16,3,2,c);}
  return s;
}
const manifest={version:1,tiles:{size:16},classes:{},bosses:{},icons:{}};
for(const kind of Object.keys(classes)){
  const sheet=surface(128,192);for(let row=0;row<4;row++)for(let frame=0;frame<4;frame++)paste(sheet,hero(kind,row,frame),frame*32,row*48);
  write("classes/"+kind,sheet);write("portraits/"+kind,hero(kind));
  manifest.classes[kind]={src:"./assets/pixel/classes/"+kind+".png",frameWidth:32,frameHeight:48,columns:4,rows:4,anchor:[16,44],attachments:{down:{feet:[16,44],hand:[20,28],weaponTip:[20,32],cast:[20,28]},up:{feet:[16,44],hand:[12,17],weaponTip:[12,13],cast:[12,17]},left:{feet:[16,44],hand:[7,23],weaponTip:[3,23],cast:[7,23]},right:{feet:[16,44],hand:[25,23],weaponTip:[29,23],cast:[25,23]}},animations:{idle:[0],walk:[0,1,2,3],attack:[2,3]},fps:8};
  for(let index=0;index<4;index++){write("icons/"+kind+"-"+index,icon(kind,index));manifest.icons[kind+"-"+index]="./assets/pixel/icons/"+kind+"-"+index+".png";}
}
for(const kind of ["burger","cola","fries","ketchup","mustard","mayo","sauce","shake","nacho","pizza","taco","donut","sushi"]){
  const sheet=surface(256,256);for(let row=0;row<4;row++)for(let frame=0;frame<4;frame++)paste(sheet,boss(kind,row,frame),frame*64,row*64);
  write("bosses/"+kind+"-sheet",sheet);write("bosses/"+kind,boss(kind));
  manifest.bosses[kind]={src:"./assets/pixel/bosses/"+kind+"-sheet.png",frameWidth:64,frameHeight:64,columns:4,rows:4,anchor:[32,58],animations:{idle:[0,1],attack:[0,1,2,3],hurt:[2],defeat:[3]},fps:6};
}
write("icons/potion",icon("potion"));
const dummy=surface(32,48);
dummy.rect(14,8,4,35,ink);dummy.rect(15,9,2,31,"#c7a171");
dummy.rect(5,14,22,4,ink);dummy.rect(6,15,20,2,"#a9764e");
dummy.ellipse(16,19,10,14,ink);dummy.ellipse(16,18,8,12,"#bd8654");
dummy.ellipse(16,18,5,8,gold);dummy.ellipse(16,18,3,5,"#865a39");
dummy.rect(15,10,2,17,cream);dummy.rect(11,17,10,2,cream);
dummy.rect(6,42,20,4,ink);dummy.rect(8,42,16,2,"#a9764e");write("props/training-dummy",dummy);
const letters={B:["11110","10001","10001","11110","10001","10001","11110"],O:["01110","10001","10001","10001","10001","10001","01110"],S:["01111","10000","10000","01110","00001","00001","11110"],F:["11111","10000","10000","11110","10000","10000","10000"],I:["11111","00100","00100","00100","00100","00100","11111"],G:["01111","10000","10000","10111","10001","10001","01110"],H:["10001","10001","10001","11111","10001","10001","10001"],T:["11111","00100","00100","00100","00100","00100","00100"]};
const logo=surface(128,76);
for(const [word,y,c] of [["BOSS",0,cream],["FIGHT",40,gold]])for(let index=0;index<word.length;index++)for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(letters[word[index]][row][col]==="1"){logo.rect(index*24+col*4+4,y+row*4+4,4,4,ink);logo.rect(index*24+col*4,y+row*4,4,4,c);}
write("ui/logo",logo);
for(const kind of ["hp","damage","armor","speed","attackSpeed","cooldown"]){const key={hp:"paladin",damage:"warrior",armor:"paladin",speed:"ranger",attackSpeed:"rogue",cooldown:"mage"}[kind];write("icons/"+kind,icon(key,kind==="armor"?3:kind==="speed"?2:0));}
const projectiles=["arrow","dagger","magic-bolt","fireball","sword-wave","holy-smite","bard-note","cola-bubble","fry","peanut","sprinkle","sauce-blob","pizza-slice","taco-shard","nacho-chip","cheese-bolt","cherry-shot","mustard-seed","sushi-roll","burger-tomato-slice","burger-onion-ring","burger-pickle-splash"];
for(const kind of projectiles) {
  const s=surface(16,16);
  if(kind.includes("slice")||kind.includes("shard")||kind.includes("chip")){s.triangle(8,2,12,ink);s.triangle(8,4,8,gold);s.rect(8,9,2,2,coral);}
  else if(kind==="fry"){s.rect(2,6,13,5,ink);s.rect(3,7,11,3,gold);s.rect(4,7,8,1,cream);}
  else if(kind==="arrow"||kind==="dagger"||kind==="sword-wave"){s.line(2,8,13,8,cream,2);s.triangle(12,3,7,teal);}
  else if(["magic-bolt","fireball","holy-smite","bard-note"].includes(kind)){
    // Friendly shots share a pointed silhouette and teal edge, even for fire magic.
    s.line(2,8,8,2,ink,2);s.line(8,2,14,8,ink,2);s.line(14,8,8,14,ink,2);s.line(8,14,2,8,ink,2);
    s.line(4,8,8,4,teal,2);s.line(8,4,12,8,teal,2);s.line(12,8,8,12,teal,2);s.line(8,12,4,8,teal,2);
    s.rect(6,6,5,5,kind==="fireball"?gold:cream);
    if(kind==="bard-note"){s.rect(8,3,2,7,cream);s.rect(9,3,4,2,cream);}
  }
  else if(kind==="sushi-roll"){s.ellipse(8,8,7,6,ink);s.ellipse(8,8,5,4,cream);s.rect(6,6,5,4,coral);}
  else if(kind.includes("ring")||kind.includes("bubble")){s.ellipse(8,8,7,7,ink);s.ellipse(8,8,6,6,kind.includes("bubble")?coral:gold);s.ellipse(8,8,4,4,"#2a394f");s.rect(4,4,3,2,cream);}
  else{s.ellipse(8,8,6,6,ink);s.ellipse(8,8,4,4,kind.includes("magic")||kind.includes("holy")?teal:kind.includes("fire")||kind.includes("cherry")?coral:gold);s.rect(5,5,3,2,cream);}
  write("projectiles/"+kind,s);
}
const floors={starter:"#263e3d",cola:"#2a354b",burger:"#3b302e",fries:"#3e3330",trio:"#293b3c",sauce:"#354231",shake:"#263b4d",nacho:"#41362d",pizza:"#3c2d39",donut:"#392d42",taco:"#3b3e2b",sushi:"#243a39"};
const hazards=["grease","puddle","glaze-ring","warning-circle","beam","wasabi-wave","slam","cola-straw-snipe","cola-fizz-burst","cola-soda-drop","cola-soda-puddle","burger-pickle-puddle","burger-sauce-drop","burger-sauce-burst","burger-charge-lane","burger-burst-ring","wasabi-splatter","soy-wave","chopstick-slash"];
for(const kind of hazards){
  const s=surface(64,64), liquid=kind.includes("puddle")||kind.includes("grease")||kind.includes("splatter");
  if(kind.includes("lane")||kind.includes("beam")||kind.includes("snipe")||kind.includes("slash")){
    s.rect(0,25,64,14,ink);s.rect(0,27,64,10,coral);s.rect(0,29,64,3,gold);
    for(let x=4;x<64;x+=12){s.line(x,27,x+5,36,cream,2);}
  }else{
    s.ellipse(32,32,30,liquid?21:30,ink);s.ellipse(32,31,28,liquid?19:28,kind.includes("wasabi")||kind.includes("pickle")?"#8dbf65":kind.includes("soda")?"#5997c7":coral);
    s.ellipse(31,29,23,liquid?14:23,kind.includes("glaze")?"#bd7eaa":kind.includes("soy")?"#805448":"#da9165");
    if(kind.includes("ring")||kind.includes("circle")){s.ellipse(32,32,19,19,ink);s.ellipse(32,32,17,17,"#243248");}
    else {s.rect(15,20,8,3,cream);s.rect(40,40,5,2,gold);}
  }
  write("hazards/"+kind,s);
}
const wave=surface(128,32);
for(let x=0;x<128;x++){const offset=2+Math.round(Math.sin(x/9)*3);wave.rect(x,offset,1,24,ink);wave.rect(x,offset+2,1,20,"#986749");wave.rect(x,offset+3,1,4,"#d9ac70");if(x%11<4)wave.rect(x,offset+5,1,2,cream);}
write("hazards/soy-sake-wave",wave);
for(const type of ["segment","weak-segment","tail"]){const s=surface(48,32);s.ellipse(24,16,23,14,ink);s.ellipse(24,15,21,12,cream);s.rect(10,7,29,6,coral);s.rect(16,16,20,6,type==="weak-segment"?teal:"#cc8365");s.rect(14,8,4,2,"#ffd2ab");if(type==="tail")s.triangle(40,2,14,"#6f9e7b");write("bosses/sushi-"+type,s);}
const bossIcons={burger:["tomato","pickle","onion","sauce","charge","burst"],cola:["bubbles","straw","spill","fizz"],sushi:["wasabi-dash","chopstick-jab","roll-barrage","soy-sake-wave"]};
for(const [kind,names] of Object.entries(bossIcons))for(const name of names){write("icons/"+kind+"-"+name,icon("warrior",name.includes("dash")||name==="charge"?2:name.includes("wave")||name==="fizz"?1:0));}
for(const [kind,c] of Object.entries(floors)){const s=surface(16,16);s.rect(0,0,16,16,c);s.rect(0,0,16,1,"#192334");s.rect(0,0,1,16,"#192334");s.rect(3,3,2,1,"#52616b");s.rect(11,12,2,1,"#52616b");write("tiles/"+kind,s);}
fs.writeFileSync(path.join(root,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
fs.writeFileSync(path.join(root,"README.md"),"# Pixel arcade art\n\nOriginal deterministic pixel art authored in scripts/generate-pixel-art.js. Regenerate with npm run generate:pixel. PNGs have authored alpha; no background removal is needed. Hero frames are 32×48, boss frames 64×64, tiles 16×16, and icons 32×32. The manifest records frame grids, anchors, animations, and timing. Physics footprints are independent of image dimensions.\n");
console.log("Pixel arcade asset library generated.");
