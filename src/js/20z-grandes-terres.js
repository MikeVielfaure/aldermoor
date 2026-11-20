/* ================= LES GRANDES TERRES : une immense région continue (≈ 2 km × 2 km), chargée par morceaux =================
   Centre x=6000, z=0, même zone « monde » (météo, balai, sorts, créatures marchent tels quels). gh() passe par terH() quand x > 4000.
   Relief : terH0 (procédural : collines, montagnes au nord, dunes au sud-est, marais à l'ouest, lac, côtes) + retouches de
   l'Atelier (grille de 8 m TER.dh / biomes TER.bi : src/contenu/terrain.json ou localStorage 'aldermoor-atelier-terrain')
   + creusages du minage (TER.digH, 20zb). Biomes TER_BIO : 0 prairie, 1 forêt, 2 désert, 3 neige, 4 marais, 5 roche, 6 plage.
   Morceaux de 96 m (TER.CH) construits autour du joueur, un par image ; arbres, rochers, herbe : InstancedMesh partagés,
   remplis avec ce qui est devant la caméra (terFill) ; collisions des arbres et rochers proches seulement (COLS c.ter).
   Mer au niveau 0 (plan qui suit le joueur) : tout creux sous 0 devient de l'eau ; l'eau profonde repousse (terClamp).
   Accès : portails dans la vallée, dans les Landes, et à la Halte de l'Aube (centre). */
function regionOf(x){return x>4000?'terres':x>1500?'landes':'vallee';}
function terIn(x,z){return Math.abs(x-6000)<975&&Math.abs(z)<975;} /* sans TER : appelée au chargement par 20v */
const TER={c:{x:6000,z:0},H:1000,CH:96,SEG:40,R:200,N:251,S:8,chunks:new Map(),built:false,popT:0,fx:1e9,fz:1e9,fyaw:9,fpit:9,ft:0,dirty:true,gx:1e9,gz:1e9,cx:1e9,cz:1e9,img:null,on:false,block:[],
 tc:new THREE.Color(),tc2:new THREE.Color(),fru:new THREE.Frustum(),pm:new THREE.Matrix4(),sph:new THREE.Sphere(),m4:new THREE.Matrix4(),q:new THREE.Quaternion(),p3:new THREE.Vector3(),s3:new THREE.Vector3()};
TER.dh=new Float32Array(TER.N*TER.N);TER.bi=new Uint8Array(TER.N*TER.N).fill(255);
function terLoadEdits(d){TER.dh.fill(0);TER.bi.fill(255);if(!d)return;const ok=(i,j)=>i>=0&&j>=0&&i<TER.N&&j<TER.N;
 (d.h||[]).forEach(([i,j,v])=>{if(ok(i,j))TER.dh[j*TER.N+i]=v;});(d.b||[]).forEach(([i,j,v])=>{if(ok(i,j))TER.bi[j*TER.N+i]=v;});}
{let d=null;try{d=JSON.parse(localStorage.getItem('aldermoor-atelier-terrain')||'null');}catch(e){}terLoadEdits(d||(window.__CONTENU||{}).terrain||null);}
/* ---------- bruit (valeurs lissées, sans répétition visible sur 2 km) ---------- */
function terHash(i,j){let h=(Math.imul(i,374761393)+Math.imul(j,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
function terNoise(x,z){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),a=terHash(i,j),b=terHash(i+1,j),c=terHash(i,j+1),d=terHash(i+1,j+1);return (a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*2-1;}
function terFbm(x,z,o){let s=0,a=1,n=0;for(let k=0;k<o;k++){s+=terNoise(x+k*17.31,z-k*9.13)*a;n+=a;a*=0.5;x*=2.03;z*=2.03;}return s/n;}
function terRng(s){return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
/* ---------- lieux (coordonnées locales) : aplat = hauteur ajoutée au relief du centre (null : pas d'aplat) ---------- */
const TER_LIEUX=[
 {id:'terres_halte',n:'Halte de l’Aube',u:0,v:0,r:13,flat:0.3,st:'ferme'},
 {id:'terres_sylve',n:'Sylve des Mille-Troncs',u:-170,v:280,r:42,flat:null,st:'foret'},
 {id:'terres_lac',n:'Lac aux Nénuphars',u:150,v:170,r:44,flat:null,st:null},
 {id:'terres_mines',n:'Mines de Brisefer',u:290,v:-300,r:16,flat:1,st:'montagne'},
 {id:'terres_pics',n:'Pics de Givre-Haut',u:-60,v:-600,r:34,flat:null,st:null},
 {id:'terres_dunes',n:'Dunes de Sel-Rouge',u:430,v:390,r:34,flat:null,st:null},
 {id:'terres_marais',n:'Marais des Brumes-Vertes',u:-440,v:120,r:36,flat:null,st:'marais'},
 {id:'terres_ruines',n:'Ruines d’Haldaran',u:-470,v:520,r:18,flat:1.2,st:'ruines'},
 {id:'terres_cote',n:'Côte des Coquillages',u:700,v:-40,r:24,flat:null,st:null}];
function terRegions(u,v){const f=(cu,cv,ru,rv)=>Math.max(0,1-Math.hypot((u-cu)/ru,(v-cv)/rv));
 return {mN:f(-60,-640,430,300),mNE:f(300,-360,260,220),dS:f(440,400,300,260),dM:f(-450,120,250,240),lac:f(150,170,52,46),syl:f(-170,280,300,260)};}
function terH0(u,v,noflat){const R=terRegions(u,v),r=Math.hypot(u,v);
 let h=5+terFbm(u/260,v/260,4)*12+terFbm(u/70,v/70,2)*1.6;
 const mm=R.mN*R.mN*100+R.mNE*R.mNE*60;if(mm>0.05){const ridge=1-Math.abs(terFbm(u/170+40,v/170-12,4));h+=mm*(0.35+ridge*0.8);}
 if(R.dS>0){const w=terFbm(u/90,v/90,2)*3;h=lerp(h,7+Math.sin(u*0.045+v*0.02+w)*4.2+Math.sin(u*0.11-v*0.07+w*1.7)*1.6,smooth(0,0.45,R.dS));}
 if(R.dM>0)h=lerp(h,0.5+terFbm(u/35,v/35,2)*1.1,smooth(0,0.5,R.dM));
 if(R.lac>0)h=lerp(h,-3.5,smooth(0,0.55,R.lac));
 let e=Math.max(Math.abs(u),Math.abs(v))/TER.H*0.55+r/TER.H*0.5;if(e>0.6)e+=terFbm(u/230-7,v/230+3,3)*0.13;if(e>0.76)h=lerp(h,-16,smooth(0.76,0.95,e));
 if(!noflat)for(const L of TER_LIEUX){if(L.flat==null)continue;const du=u-L.u,dv=v-L.v;if(du>L.r+16||du<-L.r-16||dv>L.r+16||dv<-L.r-16)continue;const d=Math.hypot(du,dv);if(d<L.r+16)h=lerp(h,L.base+L.flat,smooth(L.r+16,L.r,d));}
 return h;}
TER_LIEUX.forEach(L=>{L.base=Math.max(L.flat!=null?3:-99,terH0(L.u,L.v,true));});
function terEd(A,u,v){const gx=(u+TER.H)/TER.S,gz=(v+TER.H)/TER.S,i=Math.floor(gx),j=Math.floor(gz);if(i<0||j<0||i>=TER.N-1||j>=TER.N-1)return 0;const fx=gx-i,fz=gz-j,N=TER.N,k=j*N+i;return (A[k]*(1-fx)+A[k+1]*fx)*(1-fz)+(A[k+N]*(1-fx)+A[k+N+1]*fx)*fz;}
function terH(x,z){const u=x-TER.c.x,v=z-TER.c.z;return terH0(u,v)+terEd(TER.dh,u,v)+(TER.digH?TER.digH(x,z):0);}
{const _gh=gh;gh=function(x,z){return x>4000?terH(x,z):_gh(x,z);};}
const inTerres=()=>player.x>4000;
/* ---------- biomes ---------- */
const TER_BIO=[{n:'prairie',c:[0x6c9a46,0x86ad54]},{n:'forêt',c:[0x3f6a2e,0x527c38]},{n:'désert',c:[0xd6bb80,0xe4cc96]},{n:'neige',c:[0xe6edf5,0xf6f9fc]},{n:'marais',c:[0x55653a,0x6c7648]},{n:'roche',c:[0x857f70,0x9a9484]},{n:'plage',c:[0xd8c690,0xe8d8a8]}];
function terBi(u,v){const i=Math.round((u+TER.H)/TER.S),j=Math.round((v+TER.H)/TER.S);if(i<0||j<0||i>=TER.N||j>=TER.N)return 255;return TER.bi[j*TER.N+i];}
function terBiome(u,v,h){const o=terBi(u,v);if(o!==255)return o;const R=terRegions(u,v);
 if(h<1.4&&h>-8&&R.dM<0.3&&R.lac<0.05&&Math.max(Math.abs(u),Math.abs(v))*0.55+Math.hypot(u,v)*0.5>TER.H*0.62)return 6; /* plages : seulement sur la côte */if(h>52)return 3;if(R.dS>0.22)return 2;if(R.dM>0.25)return 4;if(h>30)return 5;
 if(R.syl>0.15||terFbm(u/280+90,v/280-40,3)>0.22)return 1;return 0;}
function terBiomeAt(x,z){return terBiome(x-TER.c.x,z-TER.c.z,terH(x,z));}
function terSlope(x,z){const e=1.2;return Math.hypot(terH(x+e,z)-terH(x-e,z),terH(x,z+e)-terH(x,z-e))/(2*e);}
/* ---------- bord du monde et eau profonde ---------- */
function terClamp(o){const L=TER.H-12;o.x=clamp(o.x,TER.c.x-L,TER.c.x+L);o.z=clamp(o.z,TER.c.z-L,TER.c.z+L);
 for(let k=0;k<8;k++){const h=terH(o.x,o.z);if(h>-1.2)break;const e=1.5,gx=terH(o.x+e,o.z)-terH(o.x-e,o.z),gz=terH(o.x,o.z+e)-terH(o.x,o.z-e),l=Math.hypot(gx,gz)||1;o.x+=gx/l*0.6;o.z+=gz/l*0.6;}
 for(let k=0;k<150&&terH(o.x,o.z)<=-1.2;k++){const dx=TER.c.x-o.x,dz=TER.c.z-o.z,d=Math.hypot(dx,dz)||1;o.x+=dx/d*3;o.z+=dz/d*3;}}
/* ---------- un morceau de terrain (96 m) : maillage, arbres, rochers ---------- */
const TER_DENS=[{t:0.04,r:0.02},{t:0.42,r:0.02},{t:0,r:0.05},{t:0.05,r:0.05},{t:0.12,r:0.02},{t:0.03,r:0.12},{t:0.01,r:0.03}];
function terBlocked(x,z){for(const b of TER.block)if(Math.hypot(x-b.x,z-b.z)<b.r)return true;return false;}
/* couleur du sol : biome, roche dans les pentes, sable sous l'eau, terre et roche dans les trous creusés */
function terColor(x,z,hh,ny,c,c2){const u=x-TER.c.x,v=z-TER.c.z,b=terBiome(u,v,hh),B=TER_BIO[b];c.setHex(B.c[0]).lerp(c2.setHex(B.c[1]),clamp(terNoise(u*0.15,v*0.15)*0.5+0.5,0,1));
 if(b!==2&&b!==6&&ny<0.86)c.lerp(c2.setHex(b===3?0x9a9aa0:0x7a7566),clamp((0.86-ny)*3,0,0.85));if(hh<-0.2)c.lerp(c2.setHex(0xb0a070),clamp(-hh/2,0,0.75));
 if(TER.digH){const d=TER.digH(x,z);if(d<-0.15)c.lerp(c2.setHex(d<-2.5?0x6f6a62:0x6a4e34),clamp(-d*0.8,0,0.9));else if(d>0.15)c.lerp(c2.setHex(0x7a6a52),clamp(d,0,0.7));}}
function terChunk(ci,cj){const N=TER.SEG,CH=TER.CH,st=CH/N,x0=TER.c.x-TER.H+ci*CH,z0=TER.c.z-TER.H+cj*CH,W=N+3,hs=new Float32Array(W*W);
 for(let j=0;j<W;j++)for(let i=0;i<W;i++)hs[j*W+i]=terH(x0+(i-1)*st,z0+(j-1)*st);
 const V=(N+1)*(N+1),pos=new Float32Array(V*3),nor=new Float32Array(V*3),col=new Float32Array(V*3),c=TER.tc,c2=TER.tc2;
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const k=j*(N+1)+i,x=x0+i*st,z=z0+j*st,hh=hs[(j+1)*W+i+1];pos[k*3]=x;pos[k*3+1]=hh;pos[k*3+2]=z;
  let nx=hs[(j+1)*W+i]-hs[(j+1)*W+i+2],nz=hs[j*W+i+1]-hs[(j+2)*W+i+1],ny=2*st;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;nor[k*3]=nx;nor[k*3+1]=ny;nor[k*3+2]=nz;
  terColor(x,z,hh,ny,c,c2);col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;}
 const idx=new Uint16Array(N*N*6);let q=0;for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,d=a+N+1,e=d+1;idx[q++]=a;idx[q++]=d;idx[q++]=b;idx[q++]=b;idx[q++]=d;idx[q++]=e;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(new THREE.BufferAttribute(idx,1));geo.computeBoundingSphere();
 const mesh=new THREE.Mesh(geo,TER.mat);mesh.receiveShadow=true;mesh.userData.noCull=true;scene.add(mesh);
 /* végétation : même hasard pour un même morceau (le monde ne change pas d'une visite à l'autre) */
 const R=terRng((ci*73856093)^(cj*19349663)^1234567),T=[],K=[],tries=Math.round(CH*CH*0.02*(HQ?1:0.65));
 for(let n=0;n<tries;n++){const x=x0+R()*CH,z=z0+R()*CH,ro=R(),r2=R(),r3=R(),r4=R();const y=terH(x,z);if(y<0.5)continue;if(TER.digH&&Math.abs(TER.digH(x,z))>0.05)continue;const u=x-TER.c.x,v=z-TER.c.z,b=terBiome(u,v,y),D=TER_DENS[b];
  if(ro<D.t){if(terSlope(x,z)>1.25||terBlocked(x,z))continue;const vv=(b===3||b===5||y>26)?3+(r2<0.5?1:0):b===1?(r2<0.45?3+(r3<0.5?1:0):Math.floor(r3*3)):b===4?(r2<0.6?1:0):Math.floor(r2*3);
   const s=0.8+r4*0.6;T.push({x,y,z,s,v:vv,ry:r3*TAU,hh:TREEV[vv]&&TREEV[vv].t==='c'?0.29+r2*0.06:(b===4?0.15+r2*0.05:0.2+r2*0.09),ss:b===4?0.25:0.3+r3*0.2,ll:b===1?0.5+r4*0.1:0.58+r4*0.14});}
  else if(ro<D.t+D.r){if(terBlocked(x,z))continue;const s=0.35+r2*r2*(b===5||b===3?2.2:1.4);K.push({x,y:y-s*0.25,z,s,ry:r3*TAU,l:0.4+r4*0.25});}}
 return {ci,cj,mesh,T,K,x0,z0};}
function terDrop(C){scene.remove(C.mesh);C.mesh.geometry.dispose();}
/* ---------- chargement autour du joueur ---------- */
function terStream(force){const px=player.x,pz=player.z,CH=TER.CH,X0=TER.c.x-TER.H,Z0=TER.c.z-TER.H,NC=Math.ceil(2*TER.H/CH),ci0=Math.floor((px-X0)/CH),cj0=Math.floor((pz-Z0)/CH),n=Math.ceil(TER.R/CH)+1,need=[];
 const dist=(ci,cj)=>Math.max(0,Math.hypot(X0+(ci+0.5)*CH-px,Z0+(cj+0.5)*CH-pz)-CH*0.71);
 for(const [k,C] of TER.chunks)if(dist(C.ci,C.cj)>TER.R+50){terDrop(C);TER.chunks.delete(k);TER.dirty=true;}
 for(let dj=-n;dj<=n;dj++)for(let di=-n;di<=n;di++){const ci=ci0+di,cj=cj0+dj;if(ci<0||cj<0||ci>=NC||cj>=NC)continue;const d=dist(ci,cj);if(d<TER.R&&!TER.chunks.has(ci+','+cj))need.push([d,ci,cj]);}
 need.sort((a,b)=>a[0]-b[0]);let built=0;for(const [,ci,cj] of need){TER.chunks.set(ci+','+cj,terChunk(ci,cj));TER.dirty=true;if(++built>=(force?999:1))break;}}
function terClear(){for(const C of TER.chunks.values())terDrop(C);TER.chunks.clear();terCols(true);TER.dirty=true;
 TER.tim.forEach(M=>{M.trunk.count=M.leaf.count=0;});TER.rocks.count=0;if(TER.grass)TER.grass.count=0;TER.gx=TER.gz=1e9;TER.cx=TER.cz=1e9;}
/* ---------- arbres et rochers devant la caméra ---------- */
function terFill(){camera.updateMatrixWorld();camera.matrixWorldInverse.copy(camera.matrixWorld).invert();TER.pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);TER.fru.setFromProjectionMatrix(TER.pm);
 const n=TER.tim.map(()=>0),FAR=(scene.fog?scene.fog.far:170)+25,F2=FAR*FAR,px=player.x,pz=player.z,{m4,q,p3,s3,sph}=TER,c=TER.tc;let nr=0;
 for(const C of TER.chunks.values()){for(const t of C.T){const dx=t.x-px,dz=t.z-pz;if(dx*dx+dz*dz>F2)continue;const M=TER.tim[t.v];if(!M||n[t.v]>=M.cap)continue;sph.center.set(t.x,t.y+3*t.s,t.z);sph.radius=5.5*t.s;if(!TER.fru.intersectsSphere(sph))continue;
   q.setFromAxisAngle(UPV,t.ry);m4.compose(p3.set(t.x,t.y-0.08,t.z),q,s3.set(t.s,t.s,t.s));const i=n[t.v]++;M.trunk.setMatrixAt(i,m4);M.trunk.setColorAt(i,WHITEC);M.leaf.setMatrixAt(i,m4);M.leaf.setColorAt(i,c.setHSL(t.hh,t.ss,t.ll));}
  for(const k of C.K){const dx=k.x-px,dz=k.z-pz;if(dx*dx+dz*dz>F2||nr>=TER.rocks.cap)continue;sph.center.set(k.x,k.y,k.z);sph.radius=2*k.s;if(!TER.fru.intersectsSphere(sph))continue;
   q.setFromAxisAngle(UPV,k.ry);m4.compose(p3.set(k.x,k.y,k.z),q,s3.set(k.s,k.s*0.75,k.s));TER.rocks.setMatrixAt(nr,m4);TER.rocks.setColorAt(nr,c.setHSL(0.1,0.06,k.l));nr++;}}
 TER.tim.forEach((M,v)=>{M.trunk.count=M.leaf.count=n[v];M.trunk.instanceMatrix.needsUpdate=M.leaf.instanceMatrix.needsUpdate=true;if(M.leaf.instanceColor)M.leaf.instanceColor.needsUpdate=true;if(M.trunk.instanceColor)M.trunk.instanceColor.needsUpdate=true;});
 TER.rocks.count=nr;TER.rocks.instanceMatrix.needsUpdate=true;if(TER.rocks.instanceColor)TER.rocks.instanceColor.needsUpdate=true;}
/* collisions des arbres et rochers proches (le reste n'existe pas pour la physique) */
function terCols(clear){for(let i=COLS.length-1;i>=0;i--)if(COLS[i].ter)COLS.splice(i,1);if(clear)return;const px=player.x,pz=player.z;
 for(const C of TER.chunks.values()){for(const t of C.T)if(Math.abs(t.x-px)<45&&Math.abs(t.z-pz)<45)COLS.push({x:t.x,z:t.z,r:0.42*t.s,h:t.y+6.5*t.s,ter:1});
  for(const k of C.K)if(k.s>0.7&&Math.abs(k.x-px)<45&&Math.abs(k.z-pz)<45)COLS.push({x:k.x,z:k.z,r:k.s*0.85,h:k.y+k.s*1.3,ter:1});}}
/* herbe autour du joueur */
function terGrass(){const G=TER.grass;if(!G)return;const {m4,q,p3,s3}=TER,c=TER.tc;let k=0;
 for(let i=0;i<G.cap*3&&k<G.cap;i++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*50,x=player.x+Math.cos(a)*r,z=player.z+Math.sin(a)*r,y=terH(x,z);if(y<0.4)continue;const b=terBiomeAt(x,z);if(b!==0&&b!==1&&b!==4)continue;if(terSlope(x,z)>1.2)continue;
  const sc=0.5+Math.random()*0.6;q.setFromAxisAngle(UPV,Math.random()*TAU);m4.compose(p3.set(x,y,z),q,s3.set(sc,sc*(0.7+Math.random()*0.8),sc));G.setMatrixAt(k,m4);G.setColorAt(k,c.setHSL(b===4?0.17:0.2+Math.random()*0.08,0.3,0.48+Math.random()*0.16));k++;}
 G.count=k;G.instanceMatrix.needsUpdate=true;if(G.instanceColor)G.instanceColor.needsUpdate=true;}
/* ---------- construction (avant buildDecor : le décor automatique habille aussi les lieux d'ici) ---------- */
TER_LIEUX.forEach(L=>{const x=TER.c.x+L.u,z=TER.c.z+L.v;const o={id:L.id,name:L.n,x,z,r:L.r,spot:{x:x+2,z:z+2},hidden:true,region:'terres'};LOCS.push(o);LOCBY[L.id]=o;LOC_STYLE[L.id]=L.st||null;});
function terSpots(){/* les points d'arrivée restent sur la terre ferme */TER_LIEUX.forEach(L=>{const o=LOCBY[L.id];for(let k=0;k<40&&terH(o.spot.x,o.spot.z)<0.6;k++){const dx=TER.c.x-o.spot.x,dz=TER.c.z-o.spot.z,d=Math.hypot(dx,dz)||1;o.spot.x+=dx/d*4;o.spot.z+=dz/d*4;}});}
function terPortalSpot(cx,cz,r0,avoid,road){for(let k=0;k<160;k++){const a=k*2.39996,r=r0+(k%7)*3,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
 if(Math.hypot(x,z)>82&&x<1500)continue;if(road){const pd=pathDist(x,z);if(pd<3.5||pd>8||gh(x,z)<0.2)continue;}if(avoid.some(p=>p&&Math.hypot(p.x-x,p.z-z)<12))continue;if(!isFree({x,z},2.4)||slopeAt(x,z)>1.1)continue;if(x<1500&&pathDist(x,z)<2.5)continue;
 if(LOCS.some(L=>!L.region&&Math.hypot(L.x-x,L.z-z)<L.r+3))continue;return {x,z,ry:Math.atan2(cx-x,cz-z)};}return null;}
function buildTerres(){if(TER.built)return;TER.built=true;terSpots();
 TER.mat=triMat(0xffffff,TX.grass,TX.rock,0.3,1.06,{vertexColors:true,roughness:1});
 TER.tim=TREEV.map(V=>{const cap=HQ?1400:800,tm=new THREE.InstancedMesh(V.trunk.geometry,V.trunk.material,cap),lf=new THREE.InstancedMesh(V.leaf.geometry,V.leaf.material,cap);
  tm.setColorAt(0,WHITEC);lf.setColorAt(0,WHITEC);[tm,lf].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.count=0;m.userData.noCull=true;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);});lf.customDepthMaterial=V.leaf.customDepthMaterial;return {trunk:tm,leaf:lf,cap};});
 TER.rocks=new THREE.InstancedMesh(rockGeo(1),ROCKM,HQ?900:500);TER.rocks.setColorAt(0,WHITEC);TER.rocks.cap=TER.rocks.count;TER.rocks.count=0;TER.rocks.castShadow=true;TER.rocks.receiveShadow=true;TER.rocks.frustumCulled=false;TER.rocks.userData.noCull=true;scene.add(TER.rocks);
 if(typeof grassMesh!=='undefined'&&grassMesh){const G=new THREE.InstancedMesh(grassMesh.geometry,grassMesh.material,HQ?3000:1300);G.setColorAt(0,WHITEC);G.cap=G.count;G.count=0;G.frustumCulled=false;G.receiveShadow=true;G.userData.noCull=true;scene.add(G);TER.grass=G;}
 TER.sea=new THREE.Mesh(new THREE.PlaneGeometry(1100,1100).rotateX(-Math.PI/2),waterMat({op:0.72,nk:0.06}));TER.sea.visible=false;TER.sea.userData.noCull=true;TER.sea.userData.dyn=true;scene.add(TER.sea);
 /* la Halte : deux arches (vallée, Landes), tentes, feu */
 const C=TER.c;dkMats();TER.arch=[{x:C.x-7,z:C.z-10,ry:0,to:'vallee'},{x:C.x+7,z:C.z-10,ry:0,to:'landes'}];
 TER.arch.forEach(a=>{portal(a.x,a.z,a.ry);TER.block.push({x:a.x,z:a.z,r:6});station({x:a.x,z:a.z+1.6,reach:2.8,hint:()=>inTerres()?(a.to==='vallee'?'Traverser le portail : retour à Aldermoor':'Traverser le portail : vers les Landes d’Ombrelune'):null,act:()=>terBack(a.to)});});
 [[-6,6,0.5],[5,7,2.4],[9,-1,-0.6]].forEach(([x,z,ry])=>dTent(C.x+x,C.z+z,ry));dFirebowl(C.x,C.z+2);
 TER_LIEUX.forEach(L=>TER.block.push({x:C.x+L.u,z:C.z+L.v,r:L.r*0.55+4}));
 (typeof COBJETS!=='undefined'?COBJETS:[]).forEach(o=>{if(o.x>4000)TER.block.push({x:o.x,z:o.z,r:4});});(typeof CSTRUCT!=='undefined'?CSTRUCT:[]).forEach(o=>{if(o.x>4000)TER.block.push({x:o.x,z:o.z,r:Math.max(o.longueur||4,o.largeur||4)});});
 /* portails de départ : dans la vallée et au campement des Landes */
 TER.vp=terPortalSpot(0,0,58,[LANDES.vp],true)||terPortalSpot(0,0,80,[LANDES.vp]);
 {const V=TER.vp;if(V&&typeof TREES!=='undefined'){TREES=TREES.filter(t=>{if(Math.hypot(t.x-V.x,t.z-V.z)<6.5){COLS.forEach(c=>{if(c.tree===t)c.off=true;});return false;}return true;});treesDirty();}} /* place dégagée devant l'arche */TER.lp=terPortalSpot(LOCBY.landes_camp.x,LOCBY.landes_camp.z,16,[]);
 [['vp','Traverser le portail vers les Grandes Terres'],['lp','Traverser le portail vers les Grandes Terres']].forEach(([k,h])=>{const p=TER[k];if(!p)return;portal(p.x,p.z,p.ry);
  station({x:p.x+Math.sin(p.ry)*1.6,z:p.z+Math.cos(p.ry)*1.6,reach:2.8,hint:()=>inTerres()?null:h,act:()=>terGo()});});}
{const _bd=buildDecor;buildDecor=function(){try{buildTerres();}catch(e){console.error(e);}return _bd.apply(this,arguments);};}
/* ---------- voyages ---------- */
function terGo(x,z){fade(()=>{const a=TER.arch[0];player.x=x!==undefined?x:a.x+(Math.random()<0.5?-1:1)*1.2;player.z=z!==undefined?z:a.z+3.5;player.y=gh(player.x,player.z)+0.2;player.vx=player.vz=player.vy=0;player.ry=0;camYaw=0;
  terStream(true);terCols();sfx('door');
  if(!S.terresVu){S.terresVu=1;chron('Découverte des Grandes Terres.');gainXP(40);setTimeout(()=>say('🗺 Les <b>Grandes Terres</b> : une contrée immense, des forêts, des dunes, des pics enneigés, des marais, la mer tout autour… La carte 🗺 te guide. (+40 XP)','gm'),600);}
  else say('🗺 Les Grandes Terres.','sys');save();});}
function terBack(to){const p=to==='landes'?TER.lp:TER.vp;if(!p)return;fade(()=>{player.x=p.x+Math.sin(p.ry)*3;player.z=p.z+Math.cos(p.ry)*3;player.y=gh(player.x,player.z)+0.2;player.vx=player.vz=player.vy=0;player.ry=p.ry;camYaw=p.ry;terClear();
  sfx('door');say(to==='landes'?'🌄 Les Landes d’Ombrelune.':'🏰 Retour dans la vallée d’Aldermoor.','sys');if(to==='landes'&&typeof LANDES!=='undefined')LANDES.seen=true;save();});}
/* ---------- peuplement selon le biome ---------- */
const TER_POP=[
 [['Cerfs des plaines','feu','nature',2,1],['Sangliers grogneurs','glace','nature',3],['Poules des bruyères','eau','lumiere',1,1]],
 [['Farfadets tapageurs','vent','nature',2],['Arbres errants','feu','nature',5],['Pandas des brumes','feu','ombre',2,1]],
 [['Cactus grincheux','eau','nature',3],['Diablotins des sables','eau','feu',3],['Étincelles sauvages','ombre','arcane',2]],
 [['Lutins de givre','feu','glace',3],['Pingouins des neiges','feu','glace',1,1],['Yétis des cimes','feu','glace',6]],
 [['Esprits d’ombre','lumiere','ombre',3],['Farfadets des tourbières','vent','nature',2],['Poulpes des marais','lumiere','eau',3]],
 [['Gardiens de pierre','glace','arcane',5],['Lutins de givre','feu','glace',3]],
 [['Poules des bruyères','eau','lumiere',1,1],['Poulpes volants','lumiere','eau',3]]];
function terPop(){let near=0;for(const e of ENT.slice()){if(e.kind!=='creature'||!e.data.terPop)continue;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d>175){removeEnt(e);continue;}if(d<110)near++;}
 const want=HQ?9:7;for(let g=0;g<3&&near<want;g++){let x,z,ok=false;for(let t=0;t<10&&!ok;t++){const a=Math.random()*TAU,r=40+Math.random()*45;x=player.x+Math.cos(a)*r;z=player.z+Math.sin(a)*r;ok=terIn(x,z)&&terH(x,z)>0.6&&isFree({x,z},1.2);}
  if(!ok)continue;const L=TER_POP[terBiomeAt(x,z)]||TER_POP[0],P=pick(L),k=P[4]?2+Math.floor(Math.random()*2):1+Math.floor(Math.random()*2);
  for(let i=0;i<k;i++){const xx=x+rnd(-4,4),zz=z+rnd(-4,4);if(!isFree({x:xx,z:zz},1))continue;const e=spawnCreatureAt(xx,zz,P[0],P[1],P[2],P[3],{calme:!!P[4]});e.data.terPop=1;near++;}}}
CREA_NOMS.unshift([/yéti|yeti/i,'yeti'],[/tourbière/i,'champignon']);
/* ---------- à chaque image ---------- */
function terTick(dt){if(!started||!TER.built)return;const on=S.zone==='monde'&&inTerres();
 if(!on){if(TER.on){TER.on=false;terClear();TER.sea.visible=false;}return;}
 if(!TER.on){TER.on=true;terStream(true);TER.dirty=true;}
 terStream(false);TER.sea.visible=true;TER.sea.position.set(Math.round(player.x/50)*50,0,Math.round(player.z/50)*50);
 TER.ft-=dt;const mv=Math.hypot(player.x-TER.fx,player.z-TER.fz),dy=Math.abs(Math.atan2(Math.sin(camYaw-TER.fyaw),Math.cos(camYaw-TER.fyaw)));
 if(TER.dirty||mv>9||dy>0.22||Math.abs((typeof camPitch!=='undefined'?camPitch:0)-TER.fpit)>0.15||TER.ft<=0){TER.dirty=false;TER.fx=player.x;TER.fz=player.z;TER.fyaw=camYaw;TER.fpit=typeof camPitch!=='undefined'?camPitch:0;TER.ft=1.2;terFill();}
 if(Math.hypot(player.x-TER.cx,player.z-TER.cz)>8){TER.cx=player.x;TER.cz=player.z;terCols();}
 if(Math.hypot(player.x-TER.gx,player.z-TER.gz)>14){TER.gx=player.x;TER.gz=player.z;terGrass();}
 TER.popT-=dt;if(TER.popT<=0){TER.popT=2.5;terPop();}}
{const _w=world4Tick;world4Tick=function(dt){terTick(dt);return _w.apply(this,arguments);};}
/* ---------- carte de la région ---------- */
function terMapImg(){if(TER.img)return TER.img;const n=200,cv=document.createElement('canvas');cv.width=cv.height=n;const g=cv.getContext('2d'),im=g.createImageData(n,n),c=TER.tc;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=(i+0.5)/n*2*TER.H-TER.H,v=(j+0.5)/n*2*TER.H-TER.H,h=terH0(u,v)+terEd(TER.dh,u,v);
  if(h<0)c.setHex(h<-6?0x2a5a86:0x3a7fb0);else{c.setHex(TER_BIO[terBiome(u,v,h)].c[0]);c.multiplyScalar(0.8+clamp(h/80,0,0.3));}const k=(j*n+i)*4;im.data[k]=c.r*255;im.data[k+1]=c.g*255;im.data[k+2]=c.b*255;im.data[k+3]=255;}
 g.putImageData(im,0,0);TER.img=cv;return cv;}
{const _d=drawMap;drawMap=function(){if(!inTerres()||S.zone!=='monde')return _d.apply(this,arguments);$('#map h3').textContent='Grandes Terres';const cv=$('#map-c'),W=mapSize();cv.width=W*2;cv.height=W*2;cv.style.width=cv.style.height=W+'px';const g=cv.getContext('2d');g.setTransform(2,0,0,2,0,0);
 g.imageSmoothingEnabled=true;g.drawImage(terMapImg(),0,0,W,W);const k=W/(2*TER.H),P=(x,z)=>[(x-TER.c.x+TER.H)*k,(z-TER.c.z+TER.H)*k];
 g.font='600 11px Inter,sans-serif';g.textAlign='center';TER_LIEUX.forEach(L=>{const o=LOCBY[L.id],[a,b]=P(o.x,o.z);g.fillStyle='#f3cf7a';g.beginPath();g.arc(a,b,3.5,0,TAU);g.fill();g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=3;const tw=g.measureText(L.n).width/2+3,ax=clamp(a,tw,W-tw);g.strokeText(L.n,ax,b-7);g.fillText(L.n,ax,b-7);});
 const [px,pz]=P(player.x,player.z);g.save();g.translate(px,pz);g.rotate(-player.ry+Math.PI);g.fillStyle='#ff7ae0';g.beginPath();g.moveTo(0,-8);g.lineTo(5,6);g.lineTo(-5,6);g.closePath();g.fill();g.restore();
 $('#map-s').innerHTML='Tu es dans les <b>Grandes Terres</b>. Retour : les portails de la Halte de l’Aube, au centre.';cv.onclick=null;};}
/* le MJ connaît la région */
{const _bp=buildPrompt;buildPrompt=function(){return _bp.apply(this,arguments).replace(RULES,RULES+'\nRégion des Grandes Terres (lieux terres_*) : contrée immense entourée par la mer, atteinte par des portails (vallée, Landes). Halte de l’Aube au centre, Sylve des Mille-Troncs, Lac aux Nénuphars, Mines de Brisefer, Pics de Givre-Haut enneigés, Dunes de Sel-Rouge, Marais des Brumes-Vertes, Ruines d’Haldaran, Côte des Coquillages. Tu peux y envoyer le joueur en quête.');};}
