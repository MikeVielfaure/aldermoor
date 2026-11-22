/* ================= MINAGE : creuser et remblayer le relief des Grandes Terres =================
   Dans la roulette de Construo : ⛏ Creuser (récolte pierre, parfois minerai de fer, cristal, pépite d'or ; plus riche
   dans les montagnes, en profondeur et autour des Mines de Brisefer) et ⛰ Remblayer (1 pierre). Chaque coup est un
   creux arrondi {x,z,r,d} gardé dans S.digs (d > 0 : creusé, d < 0 : remblayé), rangé par cases de 16 m (DIG.grid) ;
   TER.digH(x,z) l'ajoute au relief (20z). Après un coup, seuls les sommets touchés des morceaux sont recalculés (terPatch).
   Les arbres et rochers du trou disparaissent (et ne repoussent pas). Brique de fer : 1 minerai, la plus solide. */
const DIG={grid:new Map(),cd:0,R:2.4,STEP:0.9};
INGR.minerai=INGR.minerai||{n:'Minerai de fer',c:0x8a6e5e,where:[],look:'herb'};SELL.minerai=7;
BRK_T.fer={n:'Brique de fer',w:0.9,h:0.9,d:0.9,hp:110,mass:3,cost:{minerai:1},col:0x6a6e74};
const MITEMS={creuser:{n:'Creuser (pierre, minerai, cristal…)',w:2*DIG.R,h:0.2,d:2*DIG.R,cost:{}},remblai:{n:'Remblayer (1 pierre)',w:2*DIG.R,h:0.2,d:2*DIG.R,cost:{pierre:1}}};
BITEMS.splice(5,0,['b:fer','🔩','Fer']);BITEMS.splice(10,0,['m:creuser','⛏','Creuser'],['m:remblai','⛰','Remblayer']); /* en tête de la 3e page */
function digIndex(){DIG.grid.clear();for(const d of (S.digs||[]))digAdd(d);}
function digAdd(d){const a=Math.floor((d.x-d.r)/16),b=Math.floor((d.x+d.r)/16),c=Math.floor((d.z-d.r)/16),e=Math.floor((d.z+d.r)/16);
 for(let i=a;i<=b;i++)for(let j=c;j<=e;j++){const k=i+','+j;let L=DIG.grid.get(k);if(!L)DIG.grid.set(k,L=[]);if(!L.includes(d))L.push(d);}}
TER.digH=(x,z)=>{const L=DIG.grid.get(Math.floor(x/16)+','+Math.floor(z/16));if(!L)return 0;let s=0;for(const d of L){const dx=x-d.x,dz=z-d.z,q=(dx*dx+dz*dz)/(d.r*d.r);if(q<1){const w=1-q;s-=d.d*w*w;}}return s;};
/* les sommets des morceaux autour d'un point sont recalculés (hauteur, normale, couleur) */
function terPatch(x,z,r){const st=TER.CH/TER.SEG,N=TER.SEG,c=TER.tc,c2=TER.tc2;
 for(const C of TER.chunks.values()){if(x+r<C.x0-st||x-r>C.x0+TER.CH+st||z+r<C.z0-st||z-r>C.z0+TER.CH+st)continue;const g=C.mesh.geometry,P=g.attributes.position,Nn=g.attributes.normal,Co=g.attributes.color;
  const i0=Math.max(0,Math.floor((x-r-C.x0)/st)-1),i1=Math.min(N,Math.ceil((x+r-C.x0)/st)+1),j0=Math.max(0,Math.floor((z-r-C.z0)/st)-1),j1=Math.min(N,Math.ceil((z+r-C.z0)/st)+1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*(N+1)+i,vx=C.x0+i*st,vz=C.z0+j*st,h=terH(vx,vz);P.setY(k,h);
   let nx=terH(vx-st,vz)-terH(vx+st,vz),nz=terH(vx,vz-st)-terH(vx,vz+st),ny=2*st;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;Nn.setXYZ(k,nx,ny,nz);terColor(vx,vz,h,ny,c,c2);Co.setXYZ(k,c.r,c.g,c.b);}
  P.needsUpdate=Nn.needsUpdate=Co.needsUpdate=true;g.computeBoundingSphere();
  C.T=C.T.filter(t=>Math.hypot(t.x-x,t.z-z)>r+0.6);C.K=C.K.filter(t=>Math.hypot(t.x-x,t.z-z)>r+0.4);}
 TER.dirty=true;terCols();if(typeof brkWake==='function')brkWake(x,z,-99,r+1);}
/* un coup de pioche magique (ou une pelletée de remblai) */
function mineAt(kind,Q){if(DIG.cd>0)return;if(!inTerres()||S.zone!=='monde'){say('⛏ Le sol d’ici est trop dur et trop ancien : on creuse dans les Grandes Terres.','sys');return;}
 const x=Q.x,z=Q.z;if(Math.hypot(x-player.x,z-player.z)>14){say('⛏ Trop loin : approche-toi.','sys');return;}if(!terIn(x,z)){say('⛏ Pas ici.','sys');return;}
 if(terBlocked(x,z)&&TER_LIEUX.some(L=>L.id==='terres_halte'&&Math.hypot(x-TER.c.x-L.u,z-TER.c.z-L.v)<L.r+4)){say('⛏ Pas au milieu de la Halte.','sys');return;}
 const fill=kind==='remblai';if(fill&&(S.inv.pierre||0)<1){say('⛰ Il faut 1 pierre pour remblayer.','sys');return;}
 const h0=terH(x,z),dug=-TER.digH(x,z);if(!fill&&dug>18){say('⛏ La roche est trop dure plus bas.','sys');return;}if(fill&&dug<-6){say('⛰ Ça ne monte pas plus haut.','sys');return;}
 S.digs=S.digs||[];let d=S.digs.find(o=>Math.hypot(o.x-x,o.z-z)<0.7);
 if(!d){if(S.digs.length>=900){say('⛏ Le sol est déjà bien creusé… (limite atteinte)','sys');return;}d={x:Math.round(x*10)/10,z:Math.round(z*10)/10,r:DIG.R,d:0};S.digs.push(d);digAdd(d);}
 d.d=Math.round((d.d+(fill?-DIG.STEP:DIG.STEP))*10)/10;if(fill)S.inv.pierre--;DIG.cd=0.3;terPatch(d.x,d.z,d.r);
 const b=terBiomeAt(x,z),col=b===2||b===6?0xd8c08a:b===3?0xf0f4fa:0x7a5a3a;for(let i=0;i<14;i++)PN.emit(x+rnd(-0.8,0.8),h0+0.3,z+rnd(-0.8,0.8),rnd(-2,2),rnd(1.5,4),rnd(-2,2),col,0.18,0.9,0.7,1,2,0.6);
 sfx(fill?'land':'hitC',x,z);if(fill){floatAt(x,z,'⛰','#c8b89a');save();renderSlots();return;}
 /* butin : plus riche en profondeur, en montagne et près des Mines de Brisefer */
 const M=LOCBY.terres_mines,nearM=M?Math.hypot(x-M.x,z-M.z)<140:false,deep=-TER.digH(x,z),out=[];
 if(b!==2&&b!==6||Math.random()<0.5){addItem('pierre',1);out.push('+1 pierre');}else out.push('sable');
 if(Math.random()<(nearM?0.42:(b===5||b===3)?0.24:0.06)+deep*0.025){addItem('minerai',1);out.push('+1 minerai');}
 if(Math.random()<(nearM&&deep>2?0.22:deep>4?0.07:0.015)){addItem('cristal',1);out.push('+1 cristal');}
 if(Math.random()<0.035+(nearM?0.03:0)){const g=4+Math.floor(Math.random()*9);gainOr(g);out.push('+'+g+' 💰');}
 floatAt(x,z,out.join(' · '),'#ffe0a0');if(!S.mineVu){S.mineVu=1;say('⛏ Chaque coup rapporte de la pierre. Creuse en profondeur ou près des <b>Mines de Brisefer</b> pour trouver du minerai de fer et des cristaux. Le minerai fait des <b>briques de fer</b>, les plus solides.','gm');}
 save();renderSlots();}
/* dans la roulette : aperçu en disque, et la page du minage d'abord quand on est dans les Grandes Terres */
{const _t=bmodeTick;bmodeTick=function(){const r=_t.apply(this,arguments);if(BMODE.on&&BMODE.sel&&BMODE.sel[0]==='m'&&BMODE.ghost){const Q=bldTarget(),g=BMODE.ghost;g.position.set(Q.x,gh(Q.x,Q.z)-0.05,Q.z);
  g.children[0].material.color.setHex(BMODE.sel==='m:creuser'?0xffb070:0x9fffb0);}else if(BMODE.ghost)BMODE.ghost.children[0].material.color.setHex(0x9fffb0);return r;};}
{const _s=bmodeSet;bmodeSet=function(on){const r=_s.apply(this,arguments);if(on&&inTerres()){BMODE.page=Math.floor(BITEMS.findIndex(it=>it[0]==='m:creuser')/5);renderSlots();say('⛏ Page du minage : ⛏ creuser, ⛰ remblayer (➡ pour les constructions).','sys');}return r;};}
{const _w=world4Tick;world4Tick=function(dt){DIG.cd=Math.max(0,DIG.cd-dt);return _w.apply(this,arguments);};}
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{digIndex();}catch(e){console.error(e);}return r;};}
/* filons des Mines de Brisefer : éclats de cristal et rochers (décor fixe, posé avec le reste) */
{const _b=buildTerres;buildTerres=function(){const r=_b.apply(this,arguments);const M=LOCBY.terres_mines;if(!M)return r;
  for(let k=0;k<7;k++){const a=k/7*TAU+0.4,x=M.x+Math.cos(a)*(M.r+3),z=M.z+Math.sin(a)*(M.r+3),y=terH(x,z);dkAt(x,z,a);dRock(0x6f6a62,1.3,0,0.3,0,0.9);
   for(let i=0;i<3;i++)dCyl('plain',0x9fe0ff,0.02,0.16,0.9+i*0.25,(i-1)*0.35,0.9+i*0.1,0.3,5,0,(i-1)*0.4,0.25);const gl=glow(0x9fe0ff,2.2,0.5);gl.position.set(x,y+1.4,z);scene.add(gl);TER.block.push({x,z,r:2.5});}return r;};}
