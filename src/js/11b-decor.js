/* ================= DÉCOR RICHE (v13) =================
   Un « kit » de décor. Chaque pièce (boîte, cylindre, boule…) est ajoutée avec SA couleur, puis tout est fusionné
   par matériau et par case de 64 m (une case par lieu, la cour au centre) : des milliers de pièces pour une poignée d'appels de dessin.
   Les couleurs sont portées par les sommets, donc 7 matériaux suffisent pour tout le décor.
   Usage : dkAt(x,z,rotation) pose le repère d'un objet au sol, puis dBox/dCyl/dSph/dTri y ajoutent des pièces
   en coordonnées locales (y=0 au sol, +z = devant). dkFlush() (appelé par buildDecor) crée les meshes. */
const DK={b:new Map(),done:[],M:new THREE.Matrix4(),cell:'0,0',ao:1,y0:0,signs:[]};
const DKM={},DKG={box:new THREE.BoxGeometry(1,1,1)};
let DKRNG=424242;const dkr=()=>{DKRNG=(DKRNG*16807)%2147483647;return (DKRNG-1)/2147483646;};
const dkrr=(a,b)=>a+dkr()*(b-a),dkp=a=>a[Math.floor(dkr()*a.length)];
const _dv=new THREE.Vector3(),_dn=new THREE.Vector3(),_dc=new THREE.Color(),_dm=new THREE.Matrix4(),_dnm=new THREE.Matrix3(),_de=new THREE.Euler(),_dq=new THREE.Quaternion();
function dkMats(){if(DKM.wood)return;makeTX();
 DKM.wood=triMat(0xffffff,TX.wood,TX.wood,0.85,1.3,{vertexColors:true,roughness:0.85});
 DKM.stone=triMat(0xffffff,TX.stone,TX.stone,0.42,1.2,{vertexColors:true,roughness:0.95});
 DKM.rock=triMat(0xffffff,TX.rock,TX.rock,0.5,1.05,{vertexColors:true,roughness:0.95});
 DKM.plaster=triMat(0xffffff,TX.plaster,TX.plaster,0.45,1.08,{vertexColors:true});
 DKM.roof=triMat(0xffffff,TX.roof,TX.roof,0.6,1.4,{vertexColors:true,roughness:0.75});
 DKM.plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.85});
 DKM.win=winMat;} // vitres : s'allument la nuit comme celles du château
/* --- repère de l'objet courant --- */
function dkAt(x,z,ry,y,ao){const yy=y===undefined?gh(x,z):y;_dq.setFromAxisAngle(UPV,ry||0);DK.M.compose(_dv.set(x,yy,z),_dq,_dn.set(1,1,1));DK.cell=Math.floor((x+32)/64)+','+Math.floor((z+32)/64);DK.ao=ao===undefined?1:ao;DK.y0=yy;}
function dkSub(x,y,z,ry,f){const sv=DK.M.clone();DK.M.multiply(dT(x,y,z,1,1,1,ry||0));f();DK.M.copy(sv);}
function dkW(x,y,z){return new THREE.Vector3(x,y,z).applyMatrix4(DK.M);} // point local -> monde
function dT(x,y,z,sx,sy,sz,ry,rx,rz){_de.set(rx||0,ry||0,rz||0,'YXZ');return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(_de),new THREE.Vector3(sx,sy,sz));}
/* --- ajout d'une pièce : positions/normales cuites en repère monde, couleur par sommet, ombrage doux au pied --- */
function dkAdd(mk,geo,col,local){if(mk==='metal')mk='plain';const key=mk+'|'+DK.cell;let B=DK.b.get(key);const P=geo.attributes.position,Nn=geo.attributes.normal,I=geo.index,n=P.count;
 if(!B||B.n+n>64000){if(B)DK.done.push(B);B={mk,pos:[],nor:[],col:[],idx:[],n:0};DK.b.set(key,B);}
 if(local)_dm.multiplyMatrices(DK.M,local);else _dm.copy(DK.M);_dnm.getNormalMatrix(_dm);
 _dc.set(col);const j=0.95+dkr()*0.1,r=_dc.r*j,g=_dc.g*j,b=_dc.b*j;
 for(let i=0;i<n;i++){_dv.fromBufferAttribute(P,i).applyMatrix4(_dm);B.pos.push(_dv.x,_dv.y,_dv.z);
  _dn.fromBufferAttribute(Nn,i).applyMatrix3(_dnm).normalize();B.nor.push(_dn.x,_dn.y,_dn.z);
  const k=DK.ao?0.7+0.3*smooth(0,0.9,_dv.y-DK.y0):1;B.col.push(r*k,g*k,b*k);}
 if(I)for(let i=0;i<I.count;i++)B.idx.push(I.getX(i)+B.n);else for(let i=0;i<n;i++)B.idx.push(i+B.n);
 B.n+=n;}
function dkFlush(){const all=DK.done.concat(Array.from(DK.b.values()));let nm=0;
 for(const B of all){if(!B.n)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(B.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(B.col,3));
  g.setIndex(B.idx);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,DKM[B.mk]);m.castShadow=B.mk!=='win';m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();m.userData.decor=true;scene.add(m);nm++;}
 DK.b.clear();DK.done=[];return nm;}
/* --- formes --- */
function dkGeo(k,f){return DKG[k]||(DKG[k]=f());}
function dBox(mk,col,w,h,d,x,y,z,ry,rx,rz){dkAdd(mk,DKG.box,col,dT(x,y,z,w,h,d,ry,rx,rz));}
function dCyl(mk,col,rt,rb,h,x,y,z,seg,ry,rx,rz){const R=Math.max(rt,rb),s=seg||10;dkAdd(mk,dkGeo('c'+(rt/R).toFixed(2)+'_'+(rb/R).toFixed(2)+'_'+s,()=>new THREE.CylinderGeometry(rt/R,rb/R,1,s)),col,dT(x,y,z,R,h,R,ry,rx,rz));}
function dSph(mk,col,r,x,y,z,sy,sx,sz,det){const d=det===undefined?1:det;dkAdd(mk,dkGeo('s'+d,()=>new THREE.IcosahedronGeometry(1,d)),col,dT(x,y,z,r*(sx||1),r*(sy||1),r*(sz||1)));}
// prisme triangulaire : épaisseur le long de x, pointe vers +y, base le long de z (pignons, pointes de flèche, fanions)
function dTri(mk,col,t,h,w,x,y,z,ry,rx,rz){dkAdd(mk,dkGeo('tri',()=>{const A=[-.5,0,-.5],B=[-.5,0,.5],C=[-.5,1,0],D=[.5,0,-.5],E=[.5,0,.5],F=[.5,1,0];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([A,B,C,D,F,E,A,D,E,A,E,B,B,E,F,B,F,C,A,C,F,A,F,D].flat(),3));g.computeVertexNormals();return g;}),col,dT(x,y,z,t,h,w,ry,rx,rz));}
// demi-disque dans le plan XY (y>=0), épaisseur le long de z
function dHalf(mk,col,r,t,x,y,z){dkAdd(mk,dkGeo('half',()=>new THREE.CylinderGeometry(1,1,1,18,1,false,0,Math.PI)),col,dT(x,y,z,r,t,r,Math.PI/2,0,Math.PI/2));}
// rocher : boule cabossée (4 variantes mises en cache)
function dRock(col,s,x,y,z,sy){const k=Math.floor(dkr()*4);const g=dkGeo('rk'+k,()=>{const q=new THREE.IcosahedronGeometry(1,2),P=q.attributes.position;const a=dkrr(0,9),b=dkrr(0,9),c=dkrr(0,9);
  for(let i=0;i<P.count;i++){_dv.fromBufferAttribute(P,i);const f=1+0.2*Math.sin(_dv.x*2.3+a)+0.16*Math.sin(_dv.y*3.1+b)+0.16*Math.sin(_dv.z*2.7+c);P.setXYZ(i,_dv.x*f,_dv.y*f,_dv.z*f);}q.computeVertexNormals();return q;});
 dkAdd('rock',g,col,dT(x,y,z,s,s*(sy||0.7),s*dkrr(0.8,1.1),dkrr(0,TAU),dkrr(-.2,.2)));}
/* --- la place est-elle libre ? (collisions, chemins, eau, points d'arrivée, objets à actionner) --- */
function dkFree(x,z,r,pathGap){if(Math.hypot(x,z)>89||!isFree({x,z},r)||pathDist(x,z)<r+(pathGap===undefined?1.2:pathGap))return false;
 if(Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r+r+0.6||riverDist(x,z)<r+2.2||inPool(x,z))return false;
 for(const l of LOCS)if(Math.hypot(x-l.spot.x,z-l.spot.z)<r+2.4)return false;
 for(const s of STATIONS)if(Math.hypot(x-s.x,z-s.z)<r+1.8)return false;
 return true;}

/* ================= MAISON À COLOMBAGES ================= */
const HOUSE_LOOKS=[
 {wall:0xf0e6d0,roof:0xb0553c,shut:0x2f6f6a,floors:2},
 {wall:0xe4d6ba,roof:0x6a5a84,shut:0x8a3030,floors:1},
 {wall:0xf2ead8,roof:0x8f5f3c,shut:0x35527a,floors:2},
 {wall:0xe8dcc4,roof:0x5f7350,shut:0x7a5a2a,floors:1,thatch:true},
 {wall:0xf0e2cc,roof:0x8a3a30,shut:0x6a2a2a,floors:2,inn:true},
 {wall:0xeadfc8,roof:0x49597a,shut:0x4a7a3a,floors:2}];
let HOUSE_N=0;
function dWindow(ww,wh,shut,flower){const F=0x3a2410,t=0.07;
 dBox('win',0xffffff,ww,wh,0.06,0,0,0.02);
 dBox('wood',F,ww+0.16,t,0.1,0,wh/2+t/2,0.05);dBox('wood',F,ww+0.26,0.09,0.17,0,-wh/2-0.045,0.07);
 [-1,1].forEach(s=>dBox('wood',F,t,wh,0.1,s*(ww/2+t/2),0,0.05));
 dBox('wood',F,0.035,wh,0.03,0,0,0.066);dBox('wood',F,ww,0.035,0.03,0,0.04,0.066);
 if(shut!=null)[-1,1].forEach(s=>{dBox('wood',shut,0.32,wh+0.04,0.05,s*(ww/2+t+0.18),0,0.05);dBox('wood',F,0.26,0.03,0.02,s*(ww/2+t+0.18),wh*0.2,0.08);dBox('wood',F,0.26,0.03,0.02,s*(ww/2+t+0.18),-wh*0.2,0.08);});
 if(flower){dBox('wood',0x5a3a1c,ww+0.22,0.2,0.24,0,-wh/2-0.2,0.2);
  for(let i=0;i<4;i++)dSph('plain',0x3f8a3a,0.12,-ww/2+0.08+i*(ww/3.2),-wh/2-0.1,0.22,0.8,1,1,0);
  for(let i=0;i<5;i++)dSph('plain',dkp([0xe0507a,0xffd24a,0xf4f4f4,0xb070e0,0xff8040]),0.085,-ww/2+0.02+i*(ww/4),-wh/2-0.02+dkr()*0.05,0.2+dkrr(-.05,.06),1,1,1,0);}}
function dDoor(dw,dh,col){const F=0x3a2410;
 dBox('wood',F,dw+0.3,0.16,0.16,0,dh+0.08,0.04);[-1,1].forEach(s=>dBox('wood',F,0.15,dh,0.16,s*(dw/2+0.075),dh/2,0.04));
 dBox('wood',col,dw,dh,0.08,0,dh/2,0.02);
 for(let i=1;i<4;i++)dBox('wood',0x2a1a0c,0.02,dh-0.1,0.02,-dw/2+i*dw/4,dh/2,0.066);
 [0.38,dh-0.38].forEach(y=>dBox('metal',0x2a2a2e,dw*0.72,0.07,0.03,-dw*0.12,y,0.075));
 dSph('metal',0xc8a650,0.055,dw/2-0.17,dh*0.48,0.1);
 dBox('stone',0x8f897e,dw+0.7,0.16,0.72,0,0.08,0.34);}
function house(x,z,rot,look){dkMats();const L=look||HOUSE_LOOKS[HOUSE_N++%HOUSE_LOOKS.length];
 const w=5,d=5.2,hw=w/2,hd=d/2,two=L.floors===2,jet=two?0.24:0,B=0.5,F1=2.7,E=two?4.8:F1,r0=hd+jet,rise=two?2.7:2.95,th=Math.atan(rise/r0),hs=r0+0.55,sl=hs/Math.cos(th),zf=hd+jet,T=0x4a3018,TD=0x33210f;
 dkAt(x,z,rot);
 // soubassement de pierre, murs, pignons
 dBox('stone',0x9a948a,w+0.16,B,d+0.16,0,B/2,0);
 dBox('plaster',L.wall,w,F1-B,d,0,(F1+B)/2,0);
 if(two)dBox('plaster',L.wall,w,E-F1,d+jet*2,0,(E+F1)/2,0);
 [-1,1].forEach(s=>dTri('plaster',L.wall,0.2,rise,r0*2,s*(hw-0.1),E,0));
 // colombages : poteaux d'angle, sablières, corbeaux sous l'encorbellement
 [-1,1].forEach(sx=>[-1,1].forEach(sz=>{dBox('wood',T,0.2,F1-B,0.2,sx*(hw-0.06),(F1+B)/2,sz*(hd-0.06));if(two)dBox('wood',T,0.2,E-F1,0.2,sx*(hw-0.06),(E+F1)/2,sz*(zf-0.06));}));
 [-1,1].forEach(sz=>{dBox('wood',T,w+0.12,0.22,0.22,0,F1,sz*(zf-0.07));dBox('wood',T,w+0.04,0.14,0.12,0,B+0.07,sz*(hd-0.01));
  if(two){dBox('wood',T,w+0.12,0.18,0.2,0,E-0.09,sz*(zf-0.06));for(let i=-2;i<=2;i++)dBox('wood',TD,0.17,0.17,0.5,i*1.08,F1-0.2,sz*(hd+0.08));
   [-1,1].forEach(sx=>{dBox('wood',T,0.14,E-F1,0.12,sx*1.02,(E+F1)/2,sz*(zf-0.02));const dx=1.16,dy=E-F1-0.36;dBox('wood',T,Math.hypot(dx,dy),0.13,0.1,sx*1.72,(E+F1)/2,sz*(zf-0.02),0,0,Math.atan2(dy,sx*sz*dx));});}});
 [-1,1].forEach(sx=>{dBox('wood',T,0.12,0.2,d+jet*2,sx*(hw-0.01),F1,0);if(two)dBox('wood',T,0.12,0.16,d+jet*2,sx*(hw-0.01),E-0.08,0);});
 // façade : porte, fenêtres fleuries ; étage : fenêtre à volets
 dkSub(0,0,hd+0.09,0,()=>dDoor(1.15,2.02,L.inn?0x6a2a22:0x6b4a2a));
 [-1.5,1.5].forEach(wx=>dkSub(wx,1.72,hd,0,()=>dWindow(0.7,0.85,L.shut,true)));
 if(two)dkSub(0,(E+F1)/2+0.04,zf,0,()=>dWindow(0.8,0.95,L.shut,false));
 // arrière : deux fenêtres
 dkSub(-1.2,1.72,-hd,Math.PI,()=>dWindow(0.7,0.85,L.shut,false));if(two)dkSub(0.9,(E+F1)/2+0.04,-zf,Math.PI,()=>dWindow(0.7,0.9,null,false));
 // côtés : montants, fenêtres, décor du pignon (entrait, poinçon, lucarne)
 [-1,1].forEach(sx=>dkSub(sx*hw,0,0,sx*Math.PI/2,()=>{
  [-1.35,1.35].forEach(px=>{dBox('wood',T,0.15,F1-B,0.1,px,(F1+B)/2,0.02);if(two)dBox('wood',T,0.15,E-F1,0.1,px,(E+F1)/2,0.02);});
  dkSub(0,1.72,0,0,()=>dWindow(0.7,0.85,sx>0?L.shut:null,sx>0));
  if(two)dkSub(sx>0?-0.1:0.1,(E+F1)/2+0.04,0,0,()=>dWindow(0.7,0.9,sx<0?L.shut:null,false));
  dBox('wood',T,r0*2+0.06,0.18,0.1,0,E+0.02,0.03);dBox('wood',T,r0-0.05,0.15,0.1,0,E+rise*0.52,0.03);dBox('wood',T,0.16,rise*0.48-0.25,0.1,0,E+rise*0.76-0.1,0.03);
  dkSub(0,E+rise*0.27,0,0,()=>dWindow(0.5,0.55,null,false));}));
 // toit : deux pans, rives, faîtage
 const rk=L.thatch?'wood':'roof',rt=L.thatch?0.36:0.17,RL=w+1.05,ry=E+rise-(hs/2)*Math.tan(th)+rt*0.62;
 [-1,1].forEach(s=>{dBox(rk,L.roof,RL,rt,sl+0.12,0,ry,s*hs/2,0,s*th);[-1,1].forEach(sx=>dBox('wood',TD,0.09,rt+0.1,sl+0.16,sx*(RL/2+0.01),ry-0.03,s*hs/2,0,s*th));});
 dBox(rk,L.thatch?0xa98a44:0x3a3436,RL+0.1,L.thatch?0.3:0.16,L.thatch?0.6:0.34,0,E+rise+rt*0.8,0);
 // cheminée (un repère invisible sert de point d'émission à la fumée)
 const cx=hw-1.05,cz=-hd*0.4,yT=E+rise+0.8;dBox('stone',0x8a8378,0.78,yT-E-0.4,0.78,cx,(yT+E+0.4)/2,cz);dBox('stone',0x6f695f,0.98,0.14,0.98,cx,yT+0.07,cz);
 [-0.18,0.18].forEach(o=>dCyl('plain',0xb5623a,0.11,0.15,0.42,cx+o,yT+0.35,cz,8));
 const an=new THREE.Object3D();an.position.copy(dkW(cx,yT-0.3,cz));scene.add(an);chimneys.push(an);
 // lanterne de porte
 dBox('metal',0x25252a,0.05,0.05,0.36,0.98,2.46,hd+0.2);dBox('win',0xffffff,0.2,0.26,0.2,0.98,2.26,hd+0.34);dCyl('metal',0x25252a,0.02,0.19,0.13,0.98,2.45,hd+0.34,4,Math.PI/4);dBox('metal',0x25252a,0.24,0.03,0.24,0.98,2.12,hd+0.34);
 {const p=dkW(0.98,2.26,hd+0.5),lp=glow(0xffc870,1.3,0.3);lp.position.copy(p);scene.add(lp);LAMPS.push({s:lp,x:p.x,z:p.z,off:0});}
 // enseigne de l'auberge, tas de bois, banc
 if(L.inn){dBox('wood',TD,0.1,0.1,1.25,-1.75,3.5,zf+0.55);[0.25,0.95].forEach(o=>dBox('metal',0x25252a,0.03,0.3,0.03,-1.75,3.3,zf+o));
  dBox('wood',0x7a2e2a,0.07,0.62,0.92,-1.75,2.85,zf+0.6);[-1,1].forEach(s=>{dSph('plain',0xf3cf7a,0.15,-1.75+s*0.05,2.85,zf+0.6,1,0.3,1);});}
 if(HOUSE_N%2){dkSub(-hw-0.38,0,-0.6,Math.PI/2,()=>dWoodpile());}
 else dkSub(hw-1.0,0,hd+0.75,0,()=>{dBox('wood',0x7a5432,1.5,0.09,0.42,0,0.48,0);[-0.6,0.6].forEach(o=>dBox('wood',0x4a3018,0.1,0.46,0.38,o,0.23,0));});
}
function dWoodpile(){const rows=[4,3,2];rows.forEach((n,r)=>{for(let i=0;i<n;i++)dCyl('wood',dkp([0x6a4a2c,0x7a5836,0x5a4028]),0.13,0.13,0.95,(i-(n-1)/2)*0.27,0.14+r*0.235,0,7,0,Math.PI/2);});}

/* ================= OBJETS DE DÉCOR ================= */
function dStall(x,z,ry,c1,c2,goods){dkAt(x,z,ry);const W=2.5,D=1.35,a=Math.atan2(0.42,D),n=6,sw=(W+0.5)/n;
 [-1,1].forEach(sx=>[-1,1].forEach(sz=>{const h=sz>0?2.1:2.52;dBox('wood',0x6a4a2a,0.1,h,0.1,sx*W/2,h/2,sz*D/2);}));
 dBox('wood',0x8a6238,W+0.2,0.08,D+0.12,0,0.96,0);dBox('wood',0x6a4a2a,W,0.52,0.06,0,0.68,D/2);[-1,1].forEach(s=>dBox('wood',0x6a4a2a,0.06,0.52,D,s*W/2,0.68,0));
 for(let i=0;i<n;i++){const c=i%2?c1:c2,px=-(W+0.5)/2+sw*(i+0.5);dBox('plain',c,sw,0.05,Math.hypot(D,0.42)+0.55,px,2.36,0.04,0,a);dBox('plain',c,sw,0.2,0.03,px,2.0,D/2+0.31);}
 if(goods==='fruits'){[-0.8,0,0.8].forEach((o,k)=>{dBox('wood',0x9a7446,0.62,0.2,0.5,o,1.1,0.05,0,-0.25);const c=[0xd03a2a,0xe8a020,0x6aa838][k];for(let i=0;i<7;i++)dSph('plain',c,0.085,o+dkrr(-.22,.22),1.2+dkr()*0.06,0.05+dkrr(-.16,.16),1,1,1,0);});}
 else if(goods==='potions'){for(let i=0;i<9;i++){const px=-1+i*0.25,c=dkp([0xff5aa0,0x5ad0ff,0x7ae06a,0xffc040,0xb070ff]);dCyl('plain',c,0.05,0.075,0.2,px,1.1,dkrr(-.25,.2),7);dCyl('plain',0xd8c8a0,0.025,0.025,0.08,px,1.24,0,5);}dBox('wood',0x5a3a1c,0.9,0.5,0.34,0.5,1.25,-0.35);}
 else{[-0.75,0.05,0.8].forEach(o=>{for(let i=0;i<3;i++)dSph('plain',dkp([0xc08a48,0xb07a3a,0xd29a58]),0.15,o+dkrr(-.12,.12),1.08+i*0.02,dkrr(-.2,.25),0.55,1.5,1,1);});dCyl('plain',0xe8dcc0,0.2,0.2,0.1,0.9,1.05,-0.3,10);}
 addCol({x,z,r:1.35});}
function dCart(x,z,ry,load){dkAt(x,z,ry);const W=0x7a5432,D=0x4a3018;
 dBox('wood',W,1.9,0.1,1.0,0,0.78,0);[-1,1].forEach(s=>{dBox('wood',W,1.9,0.34,0.07,0,0.98,s*0.5);dCyl('wood',D,0.5,0.5,0.09,0,0.5,s*0.62,14,0,Math.PI/2);dCyl('metal',0x2a2a2e,0.1,0.1,0.14,0,0.5,s*0.62,8,0,Math.PI/2);
  dBox('wood',D,1.35,0.07,0.07,1.6,0.6,s*0.42,0,0,-0.3);});
 dBox('wood',W,0.07,0.34,1.0,-0.95,0.98,0);dBox('wood',D,0.08,0.5,0.08,2.2,0.25,0);dBox('wood',D,0.08,0.07,0.9,2.2,0.42,0);
 if(load==='hay'){dSph('wood',0xd9b85c,0.62,0,1.2,0,0.62,1.4,0.85,1);dSph('wood',0xcaa84e,0.4,0.5,1.15,0.1,0.6,1.2,0.9,1);}
 else[-0.5,0.1,0.55].forEach((o,i)=>dSph('plain',[0xb09a6a,0xa48c5c,0xbaa474][i],0.3,o,1.02,dkrr(-.12,.12),0.7,1,1.15,1));
 addCol({x,z,r:1.15});}
function dHay(x,z,ry,n){dkAt(x,z,ry);const put=(px,py,pz,r)=>{dBox('wood',0xd9b85c,1.0,0.5,0.62,px,py,pz,r);[-0.28,0.28].forEach(o=>dkSub(px,py,pz,r,()=>dBox('plain',0x8a6a3a,0.04,0.52,0.64,o,0,0)));};
 put(0,0.25,0,0);if(n>1)put(1.05,0.25,0.1,0.15);if(n>2)put(0.5,0.75,0.05,-0.1);addCol({x,z,r:n>1?1.1:0.7,h:gh(x,z)+(n>2?1.0:0.5)});}
function dFence(x1,z1,x2,z2){const L=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.round(L/1.7)),ang=Math.atan2(-(z2-z1),x2-x1);
 for(let i=0;i<=n;i++){const t=i/n,x=x1+(x2-x1)*t,z=z1+(z2-z1)*t;dkAt(x,z,ang);dBox('wood',0x6a4a2a,0.14,1.05,0.14,0,0.52,0);dBox('wood',0x4a3018,0.18,0.05,0.18,0,1.06,0);addCol({x,z,r:0.3,h:gh(x,z)+1.0});
  if(i<n){const xb=x1+(x2-x1)*(i+1)/n,zb=z1+(z2-z1)*(i+1)/n,seg=L/n,dy=gh(xb,zb)-gh(x,z),rz=Math.atan2(dy,seg);[0.42,0.82].forEach(h=>dBox('wood',0x7a5836,Math.hypot(seg,dy),0.09,0.06,seg/2,h+dy/2,0,0,0,rz));
   addCol({x:(x+xb)/2,z:(z+zb)/2,r:0.45,h:gh((x+xb)/2,(z+zb)/2)+0.95});}}}
function dPlanter(x,z){dkAt(x,z,dkrr(0,TAU));dCyl('stone',0x9a948a,0.62,0.68,0.5,0,0.25,0,8);dCyl('stone',0x86807a,0.7,0.7,0.09,0,0.5,0,8);dCyl('plain',0x4a3626,0.56,0.56,0.05,0,0.53,0,8);
 dSph('plain',0x3f8a3a,0.34,0,0.72,0,0.8,1,1,1);for(let i=0;i<9;i++){const a=i/9*TAU,r=0.38;dCyl('plain',0x3a7a2a,0.015,0.02,0.26,Math.cos(a)*r,0.66,Math.sin(a)*r,4);dSph('plain',dkp([0xe0507a,0xffd24a,0xf4f4f4,0xb070e0,0xff8040]),0.08,Math.cos(a)*r,0.82,Math.sin(a)*r,1,1,1,0);}
 addCol({x,z,r:0.75,h:gh(x,z)+0.58});}
function dBench(x,z,ry){dkAt(x,z,ry);dBox('wood',0x7a5432,1.9,0.1,0.5,0,0.5,0);dBox('wood',0x7a5432,1.9,0.5,0.08,0,0.86,-0.24,0,-0.12);[-0.75,0.75].forEach(o=>{dBox('metal',0x2a2a2e,0.09,0.5,0.46,o,0.25,0);});addCol({x,z,r:0.85,h:gh(x,z)+0.6});}
function dStand(x,z,ry){dkAt(x,z,ry);const W=0x7a5432,D=0x4a3018; // petit gradin à deux rangs
 dBox('wood',W,3.2,0.1,0.55,0,0.5,0.35);dBox('wood',W,3.2,0.1,0.55,0,0.98,-0.3);dBox('wood',D,3.2,0.08,0.08,0,1.5,-0.58);
 [-1.45,0,1.45].forEach(o=>{dBox('wood',D,0.1,0.5,0.5,o,0.25,0.35);dBox('wood',D,0.1,0.98,0.5,o,0.49,-0.3);dBox('wood',D,0.08,1.5,0.08,o,0.75,-0.58);});addCol({x,z,r:1.5,h:gh(x,z)+1.05});}
function dBanner(x,z,ry,col){dkAt(x,z,ry);dCyl('wood',0x4a3018,0.07,0.09,5,0,2.5,0,7);dBox('wood',0x4a3018,1.1,0.07,0.07,0.5,4.7,0);dBox('plain',col,0.9,2.3,0.03,0.55,3.5,0);dTri('plain',col,0.03,0.45,0.9,0.55,2.35,0,Math.PI/2,Math.PI);
 dBox('plain',0xf3cf7a,0.34,0.34,0.035,0.55,3.75,0,0,0,Math.PI/4);dSph('metal',0xc8a650,0.1,0,5.05,0);addCol({x,z,r:0.25});}
function dStatue(x,z,ry){dkAt(x,z,ry);const S1=0xa7a297,S2=0x8f8a80;
 dBox('stone',S2,1.6,0.22,1.6,0,0.11,0);dBox('stone',S1,1.2,0.95,1.2,0,0.69,0);dBox('stone',S2,1.36,0.14,1.36,0,1.23,0);
 dCyl('stone',S1,0.2,0.46,1.55,0,2.07,0,10);dCyl('stone',S1,0.26,0.22,0.5,0,3.0,0,10);dSph('stone',S1,0.2,0,3.42,0);dCyl('stone',S1,0.34,0.36,0.04,0,3.56,0,12);dCyl('stone',S1,0.01,0.2,0.62,0.04,3.88,0,9,0,0,-0.12);
 dCyl('stone',S1,0.07,0.07,0.75,0.36,2.95,0.12,6,0,0.5,-1.0);dCyl('stone',S2,0.035,0.045,2.9,0.66,2.75,0.3,6);dSph('win',0xffffff,0.14,0.66,4.28,0.3);
 addCol({x,z,r:0.95});}
function dBoard(x,z,ry){dkAt(x,z,ry);const D=0x4a3018; // panneau d'affichage
 [-0.95,0.95].forEach(o=>dBox('wood',D,0.13,2.3,0.13,o,1.15,0));dBox('wood',0x8a6a42,1.8,1.15,0.07,0,1.45,0);dBox('roof',0x6a4a3a,2.3,0.08,0.6,0,2.36,0.05,0,0.25);
 [[-0.5,1.6,0.42,0.5],[0.1,1.7,0.36,0.3],[0.55,1.4,0.44,0.56],[-0.1,1.22,0.4,0.34],[-0.6,1.12,0.3,0.26]].forEach(([px,py,pw,ph])=>dBox('plain',dkp([0xf2ead0,0xe8dcb8,0xf6f0e0]),pw,ph,0.012,px,py,0.045,0,0,dkrr(-.1,.1)));
 [[-0.5,1.82],[0.1,1.83],[0.55,1.65]].forEach(([px,py])=>dSph('plain',0xb03030,0.035,px,py,0.06,1,1,1,0));addCol({x,z,r:1.0});}
function dBoat(x,z,ry){dkAt(x,z,ry,0.0,0);const W=0x7a5432,D=0x5a3c20;
 dBox('wood',D,2.6,0.07,0.8,0,0.1,0);[-1,1].forEach(s=>{dBox('wood',W,2.7,0.42,0.06,0,0.3,s*0.47,0,s*0.28);dBox('wood',W,0.9,0.42,0.06,1.68,0.3,s*0.26,-s*0.52,s*0.28);});
 dBox('wood',W,0.06,0.42,0.9,-1.33,0.3,0);[-0.55,0.45].forEach(o=>dBox('wood',D,0.22,0.05,0.9,o,0.36,0));
 [-1,1].forEach(s=>dBox('wood',0x9a7a4a,1.9,0.04,0.09,0.1,0.48,s*0.62,s*0.25,0,0.06));addCol({x,z,r:1.0,h:0.6});}
function dReeds(x,z){dkAt(x,z,0,Math.max(-0.25,gh(x,z)),0);const n=4+Math.floor(dkr()*4);for(let i=0;i<n;i++){const px=dkrr(-.35,.35),pz=dkrr(-.35,.35),h=dkrr(1.1,1.9),lean=dkrr(-.12,.12);
  dCyl('plain',dkp([0x5a8a3a,0x6a9a44,0x4f7a34]),0.012,0.022,h,px,h/2,pz,4,0,lean,lean);if(dkr()<0.6)dCyl('plain',0x5a3a22,0.042,0.042,0.2,px-lean*h*0.5,h-0.08,pz+lean*h*0.5,6);}}
function dLog(x,z,ry){dkAt(x,z,ry);const L=dkrr(2.2,3.2);dCyl('wood',0x5a4632,0.26,0.3,L,0,0.26,0,9,0,Math.PI/2);dCyl('plain',0xc8a878,0.2,0.2,0.02,0,0.26,L/2+0.005,9,0,Math.PI/2);dCyl('plain',0xc8a878,0.23,0.23,0.02,0,0.26,-L/2-0.005,9,0,Math.PI/2);
 dCyl('wood',0x5a4632,0.05,0.09,0.5,0.1,0.55,L*0.2,6,0,0,-0.6);for(let i=0;i<3;i++)dMush(dkrr(-.1,.1)+0.28,0.06,dkrr(-L*0.4,L*0.4),0.6);addCol({x,z,r:0.5,h:gh(x,z)+0.5});}
function dStump(x,z){dkAt(x,z,dkrr(0,TAU));dCyl('wood',0x5f4a34,0.32,0.42,0.48,0,0.24,0,9);dCyl('plain',0xc8a878,0.3,0.3,0.02,0,0.49,0,9);for(let i=0;i<4;i++){const a=i/4*TAU+0.4;dCyl('wood',0x5f4a34,0.04,0.13,0.55,Math.cos(a)*0.5,0.08,Math.sin(a)*0.5,5,-a,0,Math.PI/2-0.25);}}
function dMush(x,y,z,s){const c=dkp([0xd03a30,0xc98a3a,0xa070e0,0xe8dcc8]);dCyl('plain',0xf0e8d8,0.035*s,0.05*s,0.2*s,x,y+0.1*s,z,6);dSph('plain',c,0.14*s,x,y+0.2*s,z,0.55,1,1,1);}
function dMushrooms(x,z){dkAt(x,z,0,undefined,0);const n=3+Math.floor(dkr()*4);for(let i=0;i<n;i++)dMush(dkrr(-.45,.45),0,dkrr(-.45,.45),dkrr(0.7,1.5));}
function dBoulders(x,z,big){dkAt(x,z,0);const moss=dkr()<0.5;const c=()=>moss&&dkr()<0.5?dkp([0x6f7a56,0x66724e]):dkp([0x8a8672,0x7d7a68,0x96917c]);
 const s=big?dkrr(1.0,1.6):dkrr(0.5,0.9);dRock(c(),s,0,s*0.35,0);if(dkr()<0.8)dRock(c(),s*0.55,s*0.95,s*0.18,dkrr(-.5,.5));if(dkr()<0.5)dRock(c(),s*0.4,-s*0.8,s*0.12,s*0.6);
 if(s>0.85)addCol({x,z,r:s*0.85,h:gh(x,z)+s*0.75});}
/* fanions tendus entre deux points */
function dBunting(a,b,n,sag){const mx=(a.x+b.x)/2,mz=(a.z+b.z)/2;dkAt(mx,mz,0,0,0);const ry=Math.atan2(-(b.z-a.z),b.x-a.x);const C=[0xd0403a,0xf3cf7a,0x3a7ad0,0x4aa85a,0xb060d0];
 for(let i=0;i<=n;i++){const t=i/n,x=a.x+(b.x-a.x)*t-mx,z=a.z+(b.z-a.z)*t-mz,y=a.y+(b.y-a.y)*t-(sag||0.5)*4*t*(1-t);
  if(i<n){const t2=(i+1)/n,x2=a.x+(b.x-a.x)*t2-mx,z2=a.z+(b.z-a.z)*t2-mz,y2=a.y+(b.y-a.y)*t2-(sag||0.5)*4*t2*(1-t2),L=Math.hypot(x2-x,z2-z),dy=y2-y;dBox('plain',0x3a2a1a,Math.hypot(L,dy),0.02,0.02,(x+x2)/2,(y+y2)/2,(z+z2)/2,ry,0,Math.atan2(dy,L));}
  if(i>0&&i<n)dTri('plain',C[i%C.length],0.02,0.34,0.3,x,y-0.01,z,ry+Math.PI/2,Math.PI);}}
/* poteau indicateur : une planche-flèche par destination, avec son nom */
const SIGN_NAMES={cour:'Grande Cour',chateau:'Château',biblio:'Bibliothèque',observatoire:'Observatoire',serre:'Serres',lac:'Lac des Murmures',foret:'Sombrebois',village:'Brumepont',cercle:'Cercle de pierres',arene:'Arène des duels',hauteurs:'Hauteurs',moulin:'Moulin du Ru',marais:'Marais',ruines:'Ruines d’Ysmer'};
const SIGN_IDS=Object.keys(SIGN_NAMES);
function dSignpost(x,z,ids){dkAt(x,z,0);dCyl('wood',0x4a3018,0.08,0.1,2.7,0,1.35,0,7);dSph('wood',0x4a3018,0.13,0,2.74,0,0.8,1,1,0);
 ids.slice(0,3).forEach((id,i)=>{const L=LOCBY[id];if(!L)return;const ry=Math.atan2(-(L.spot.z-z),L.spot.x-x),y=2.36-i*0.36;
  dkSub(0,y,0,ry,()=>{dBox('wood',0x8a6a42,1.36,0.3,0.06,0.62,0,0);dTri('wood',0x8a6a42,0.06,0.26,0.42,1.3,0,0,0,Math.PI/2,-Math.PI/2);
   const row=SIGN_IDS.indexOf(id);DK.signs.push({row,m:DK.M.clone().multiply(dT(0.62,0,0.032,1,1,1,0))},{row,m:DK.M.clone().multiply(dT(0.62,0,-0.032,1,1,1,Math.PI))});});});
 addCol({x,z,r:0.3});}
function dSignsFlush(){if(!DK.signs.length)return;const N=SIGN_IDS.length,cv=document.createElement('canvas');cv.width=512;cv.height=64*16;const q=cv.getContext('2d');
 SIGN_IDS.forEach((id,i)=>{const y=i*64;q.fillStyle='#93714a';q.fillRect(0,y,512,64);for(let k=0;k<26;k++){q.strokeStyle='rgba(50,30,12,'+(0.08+dkr()*0.14)+')';q.lineWidth=1+dkr()*1.5;q.beginPath();const yy=y+dkr()*64;q.moveTo(0,yy);q.bezierCurveTo(170,yy+dkrr(-5,5),340,yy+dkrr(-5,5),512,yy+dkrr(-3,3));q.stroke();}
  q.fillStyle='#2a1808';q.font='bold 40px Georgia, "Times New Roman", serif';q.textAlign='center';q.textBaseline='middle';q.fillText(SIGN_NAMES[id],256,y+34,490);});
 const tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;const parts=DK.signs.map(s=>{const g=new THREE.PlaneGeometry(1.3,0.26),U=g.attributes.uv;for(let k=0;k<U.count;k++)U.setY(k,1-(s.row+(1-U.getY(k)))*64/cv.height);return {g,m:s.m};});
 const m=new THREE.Mesh(mergeGeos(parts),new THREE.MeshStandardMaterial({map:tex,roughness:0.85}));m.receiveShadow=true;m.frustumCulled=false;m.userData.decor=true;scene.add(m);DK.signs=[];void N;}

/* ================= HABILLAGE DES LIEUX ================= */
function decorCastle(){dkAt(0,-39,0,0); // repère : façade du château (z local = distance devant le mur)
 // grande porte à deux vantaux sous son arc de pierre
 [-1,1].forEach(s=>{dBox('wood',0x5f3f22,1.93,5.4,0.1,s*0.98,2.7,0.8);for(let i=0;i<3;i++)dBox('wood',0x33200e,0.03,5.3,0.03,s*(0.5+i*0.48),2.7,0.86);
  [0.9,2.7,4.5].forEach(y=>dBox('metal',0x25252a,1.7,0.14,0.04,s*1.0,y,0.87));dCyl('metal',0xb89a4a,0.17,0.17,0.05,s*0.34,2.55,0.9,12,0,Math.PI/2);
  dBox('stone',0x8f897e,0.6,5.5,0.42,s*2.34,2.75,0.62);dBox('stone',0x7d776d,0.8,0.3,0.6,s*2.34,5.6,0.62);dBox('stone',0x7d776d,0.8,0.4,0.6,s*2.34,0.2,0.62);});
 dHalf('wood',0x5f3f22,1.95,0.1,0,5.4,0.8);dBox('metal',0x25252a,0.1,5.4,0.06,0,2.7,0.9);
 for(let i=0;i<=10;i++){const a=i/10*Math.PI,key=i===5;dBox('stone',key?0x77716a:(i%2?0x979186:0x8a8479),key?0.7:0.6,key?0.95:0.72,0.44,Math.cos(a)*2.36,5.62+Math.sin(a)*2.36,0.6,0,0,a-Math.PI/2);}
 // contreforts, bandeaux, rosace
 [-7.6,-4.5,4.5,7.6].forEach(px=>{dBox('stone',0x8a8479,1.25,1.3,1.1,px,0.65,0.5);dBox('stone',0x979186,0.95,7.4,0.8,px,4.4,0.4);dTri('stone',0x8a8479,0.95,0.8,0.8,px,8.1,0.4);});
 dBox('stone',0x8a8479,17.6,0.32,0.3,0,8.15,0.12);dBox('stone',0x8a8479,17.6,0.5,0.34,0,0.25,0.14);
 for(let i=0;i<16;i++){const a=i/16*TAU;dBox('stone',i%2?0x979186:0x857f74,0.56,0.42,0.3,Math.cos(a)*1.42,11.3+Math.sin(a)*1.42,0.14,0,0,a-Math.PI/2);}
 dCyl('win',0xffffff,1.24,1.24,0.08,0,11.3,0.07,20,0,Math.PI/2);for(let i=0;i<4;i++)dBox('stone',0x857f74,2.5,0.09,0.1,0,11.3,0.13,0,0,i/4*Math.PI);dCyl('stone',0x857f74,0.24,0.24,0.14,0,11.3,0.14,10,0,Math.PI/2);
 // lanternes murales de part et d'autre de la porte
 [-1,1].forEach(s=>{dBox('metal',0x25252a,0.07,0.07,0.6,s*3.35,4.3,0.3);dBox('win',0xffffff,0.3,0.42,0.3,s*3.35,4.0,0.55);dCyl('metal',0x25252a,0.03,0.28,0.2,s*3.35,4.3,0.55,4,Math.PI/4);dBox('metal',0x25252a,0.36,0.04,0.36,s*3.35,3.77,0.55);
  const lp=glow(0xffc870,2.4,0.25);lp.position.set(s*3.35,4.0,-38.3);scene.add(lp);LAMPS.push({s:lp,x:s*3.35,z:-38.3,off:0});});
 // oriflammes au sommet des tours
 [[-12,-39,3.2,20,0x8a2a3a],[12,-39,3.2,20,0x5a2a8a],[-12,-53,3.2,20,0x5a2a8a],[12,-53,3.2,20,0x8a2a3a],[0,-48,4.4,28,0xf3cf7a],[-32,-32,4.6,22,0x5a3a6a]].forEach(([tx,tz,r,h,c],i)=>{
  dkAt(tx,tz,0.6+i*1.1,h+0.6+r*2.6,0);dCyl('metal',0x3a3a40,0.035,0.05,2.6,0,1.3,0,6);dTri('plain',c,0.035,1.5,0.75,0.04,2.1,0,0,Math.PI/2,-Math.PI/2);});
 // statues de mages le long de l'allée
 [[-3.6,-21],[3.6,-21]].forEach(([sx,sz])=>{if(dkFree(sx,sz,1.0,0.8))dStatue(sx,sz,sx<0?0.5:-0.5);});}
function decorCour(){dkAt(0,2,0,0,0);
 // margelle du bassin
 for(let i=0;i<12;i++){const a=i/12*TAU;dBox('stone',i%2?0xa29d92:0x938d82,1.36,0.14,0.44,Math.cos(a)*2.66,0.76,Math.sin(a)*2.66,-a+Math.PI/2);}
 for(let i=0;i<4;i++){const a=i/4*TAU+0.4;dSph('stone',0x8a8479,0.2,Math.cos(a)*0.62,1.55,Math.sin(a)*0.62,0.9);}
 // jardinières près des bancs, panneau d'affichage
 for(let k=0;k<4;k++){const a0=k/4*TAU+Math.PI/4;[-0.3,0.3].forEach(o=>{const a=a0+o,px=Math.cos(a)*7.4,pz=2+Math.sin(a)*7.4;if(isFree({x:px,z:pz},0.75)&&pathDist(px,pz)>1.4)dPlanter(px,pz);});}
 for(const [bx,bz] of [[6.2,-7.2],[-6.2,-7.2],[8.6,8.2]]){if(dkFree(bx,bz,1.0,0.9)){dBoard(bx,bz,Math.atan2(-bx,2-bz));break;}}}
function decorVillage(){const C={x:12,z:62};
 // margelle, treuil et seau du puits
 dkAt(C.x,C.z,0);for(let i=0;i<8;i++){const a=i/8*TAU;dBox('stone',i%2?0xa29d92:0x8f897e,0.86,0.16,0.34,Math.cos(a)*1.02,1.04,Math.sin(a)*1.02,-a+Math.PI/2);}
 dCyl('wood',0x4a3018,0.07,0.07,1.9,0,2.25,0,7,0,0,Math.PI/2);dCyl('plain',0xcbb98a,0.012,0.012,1.0,0.25,1.75,0,4);dCyl('wood',0x7a5432,0.16,0.13,0.26,0.25,1.2,0,8);dBox('metal',0x25252a,0.05,0.3,0.05,1.0,2.12,0);
 // étals du marché, tournés vers le puits
 [[40,0xd0403a,0xf2ead0,'fruits'],[140,0x3a7ad0,0xf2ead0,'potions'],[218,0x4aa85a,0xf3cf7a,'pain']].forEach(([deg,c1,c2,g])=>{
  for(let t=0;t<8;t++){const a=(deg+t*7)*Math.PI/180,x=C.x+Math.cos(a)*5.6,z=C.z+Math.sin(a)*5.6;if(dkFree(x,z,1.4,0.9)){dStall(x,z,Math.atan2(-Math.cos(a),-Math.sin(a)),c1,c2,g);break;}}});
 for(const [x,z,ry,l] of [[19.6,57.4,0.9,'hay'],[3.6,66.5,2.2,'sacs']]){if(dkFree(x,z,1.2,0.9))dCart(x,z,ry,l);}
 for(const [x,z,n] of [[21.4,66.2,3],[5.4,58.6,2]]){if(dkFree(x,z,1.1,0.9))dHay(x,z,dkrr(0,3),n);}
 for(const [x,z] of [[9.2,64.6],[13.6,59.2]]){if(isFree({x,z},0.9)&&pathDist(x,z)>1.3)dBench(x,z,Math.atan2(C.x-x,C.z-z));}
 // porte du village sur le chemin de la cour, avec son nom et deux bouts de clôture
 const u={x:0.2349,z:0.972},pv={x:0.972,z:-0.2349},g={x:10.2,z:43.6};
 const P=[-1,1].map(s=>({x:g.x+pv.x*2.3*s,z:g.z+pv.z*2.3*s}));
 P.forEach((p,i)=>{dkAt(p.x,p.z,0);dCyl('wood',0x4a3018,0.13,0.17,5.0,0,2.5,0,8);dBox('stone',0x8f897e,0.5,0.4,0.5,0,0.2,0);dSph('wood',0x4a3018,0.19,0,5.06,0,0.8,1,1,0);
  dBox('metal',0x25252a,0.04,0.04,0.4,0,3.4,0,Math.atan2(-pv.x*(i?-1:1),-pv.z*(i?-1:1)));addCol({x:p.x,z:p.z,r:0.3});
  const s=i?1:-1;dFence(p.x+pv.x*0.5*s,p.z+pv.z*0.5*s,p.x+pv.x*5.6*s,p.z+pv.z*5.6*s);});
 {const ry=Math.atan2(-pv.z,pv.x);dkAt(g.x,g.z,ry);dBox('wood',0x4a3018,4.9,0.16,0.16,0,4.8,0);dBox('wood',0x8a6a42,2.5,0.5,0.07,0,4.4,0);[-1,1].forEach(s=>dBox('metal',0x25252a,0.03,0.24,0.03,s*1.0,4.66,0));
  const row=SIGN_IDS.indexOf('village');[[0.037,0],[-0.037,Math.PI]].forEach(([oz,r])=>DK.signs.push({row,m:DK.M.clone().multiply(dT(0,4.4,oz,1.75,1.6,1,r))}));}
 // guirlandes de fanions au-dessus de la place
 [[0.6,2.5],[2.7,4.6]].forEach(([a1,a2])=>dBunting({x:C.x+Math.cos(a1)*7.1,y:4.5,z:C.z+Math.sin(a1)*7.1},{x:C.x+Math.cos(a2)*7.1,y:4.5,z:C.z+Math.sin(a2)*7.1},15,0.7));
 if(dkFree(16.8,46.4,0.4,0.6))dSignpost(16.8,46.4,['cour','lac','arene']);}
function decorLake(){
 for(let i=0;i<34;i++){const a=dkr()*TAU,r=12.75+dkr()*0.9,x=LAKE.x+Math.cos(a)*r,z=LAKE.z+Math.sin(a)*r;if(pathDist(x,z)<2.6||Math.hypot(x-30.4,z-23.6)<3)continue;dReeds(x,z);}
 for(let i=0;i<16;i++){const a=dkr()*TAU,r=14.1+dkr()*1.6,x=LAKE.x+Math.cos(a)*r,z=LAKE.z+Math.sin(a)*r;if(pathDist(x,z)<3||!isFree({x,z},1.3)||Math.hypot(x-26,z-24)<4||Math.hypot(x-30.4,z-23.6)<3.5)continue;dBoulders(x,z,dkr()<0.3);}
 dkAt(LAKE.x,LAKE.z,0,0.085,0);for(let i=0;i<16;i++){const a=dkr()*TAU,r=6.5+dkr()*5.2,px=Math.cos(a)*r,pz=Math.sin(a)*r,s=dkrr(0.3,0.55);dCyl('plain',dkp([0x3a8a3a,0x4a9a44,0x357a35]),s,s,0.02,px,0,pz,9);if(dkr()<0.45)dSph('plain',dkp([0xffa0d0,0xf8f0f0]),0.11,px+0.08,0.08,pz,0.7,1,1,0);}
 {const a=216*Math.PI/180;dBoat(LAKE.x+Math.cos(a)*10.3,LAKE.z+Math.sin(a)*10.3,-a+Math.PI/2+0.3);} // à côté du ponton
 for(const [x,z] of [[24.6,19.6],[23.8,28.8]]){if(dkFree(x,z,0.9,0.8))dBench(x,z,Math.atan2(LAKE.x-x,LAKE.z-z));}}
function decorArena(){const A={x:-12,z:30};
 [25,155,205,335].forEach(deg=>{for(let t=0;t<6;t++){const a=(deg+t*6)*Math.PI/180,x=A.x+Math.cos(a)*11.6,z=A.z+Math.sin(a)*11.6;if(dkFree(x,z,1.6,0.8)){dStand(x,z,Math.atan2(-Math.cos(a),-Math.sin(a)));break;}}});
 [[70,0x9a2a2a],[110,0x2a5a9a],[250,0x9a2a2a],[290,0x2a5a9a]].forEach(([deg,c])=>{const a=deg*Math.PI/180,x=A.x+Math.cos(a)*10.4,z=A.z+Math.sin(a)*10.4;if(dkFree(x,z,0.4,0.6))dBanner(x,z,-a,c);});}
function decorSerre(){for(let i=0;i<7;i++){const x=-41.2+i*1.75,z=14.9;if(Math.abs(x+36)<1.4||!isFree({x,z},0.3))continue;dkAt(x,z,0);dCyl('plain',0xb5623a,0.26,0.19,0.36,0,0.18,0,9);dCyl('plain',0x4a3626,0.23,0.23,0.03,0,0.36,0,9);
  if(i%2){dSph('plain',0x3f8a3a,0.26,0,0.62,0,1.2,1,1,1);dSph('plain',dkp([0xe0507a,0xb070e0,0xffd24a]),0.09,0.1,0.92,0.05,1,1,1,0);}else{for(let k=0;k<5;k++)dCyl('plain',0x4f8a3a,0.01,0.03,dkrr(0.5,0.9),dkrr(-.1,.1),0.7,dkrr(-.1,.1),4,0,dkrr(-.3,.3),dkrr(-.3,.3));}}
 for(const [x,z] of [[-43.6,17.2],[-28.4,17.2]]){if(dkFree(x,z,0.8,0.8))dPlanter(x,z);}}
function decorPaths(){ // poteaux indicateurs au départ de la cour : chaque lieu figure sur le poteau le plus proche de sa direction
 const posts=[-78,12,82,168].map(d=>d*Math.PI/180),groups=posts.map(()=>[]);
 LOCS.forEach(l=>{if(l.id==='cour'||l.hidden)return;const a=Math.atan2(l.spot.z-2,l.spot.x);let bi=0,bd=9;posts.forEach((p,i)=>{const d=Math.abs(Math.atan2(Math.sin(a-p),Math.cos(a-p)));if(d<bd){bd=d;bi=i;}});groups[bi].push({id:l.id,d:bd});});
 posts.forEach((p,i)=>{const ids=groups[i].sort((a,b)=>a.d-b.d).map(g=>g.id);if(!ids.length)return;
  for(let t=0;t<10;t++){const a=p+(t%2?-1:1)*Math.ceil(t/2)*0.06,x=Math.cos(a)*12.9,z=2+Math.sin(a)*12.9;if(isFree({x,z},0.4)&&pathDist(x,z)>1.5){dSignpost(x,z,ids);break;}}});
 for(const [x,z,ids] of [[27.6,56.2,['marais','village','lac']],[-31.6,-19.6,['ruines','biblio','cour']],[36.6,-9.2,['moulin','cercle','hauteurs']]]){if(isFree({x,z},0.4)&&pathDist(x,z)>1.2&&riverDist(x,z)>2.5)dSignpost(x,z,ids);}}
function dkWild(x,z){for(const l of LOCS)if(l.id!=='foret'&&Math.hypot(x-l.x,z-l.z)<l.r+1.5)return false;return true;}
function decorNature(){let n=0;
 for(let i=0;i<160&&n<26;i++){const a=dkr()*TAU,r=16+dkr()*72,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!dkWild(x,z)||!dkFree(x,z,1.6,1.6)||slopeAt(x,z)>1.1)continue;dBoulders(x,z,dkr()<0.35);n++;}
 n=0;for(let i=0;i<200&&n<16;i++){const inF=dkr()<0.5,a=dkr()*TAU,r=inF?dkr()*19:16+dkr()*70,x=(inF?-48:0)+Math.cos(a)*r,z=(inF?52:0)+Math.sin(a)*r;if(!dkWild(x,z)||!dkFree(x,z,1.5,1.4)||slopeAt(x,z)>0.9)continue;if(dkr()<0.55)dLog(x,z,dkrr(0,TAU));else dStump(x,z);n++;}
 n=0;for(let i=0;i<300&&n<44;i++){const inF=dkr()<0.6,a=dkr()*TAU,r=inF?dkr()*20:14+dkr()*74,x=(inF?-48:0)+Math.cos(a)*r,z=(inF?52:0)+Math.sin(a)*r;if(Math.hypot(x,z)>89||!dkWild(x,z)||!isFree({x,z},0.5)||pathDist(x,z)<1.6||riverDist(x,z)<2.5||inPool(x,z)||Math.hypot(x-LAKE.x,z-LAKE.z)<14)continue;dMushrooms(x,z);n++;}}
/* forêt lointaine : des centaines de sapins simples sur les collines qui entourent la vallée (un seul appel de dessin) */
function decorFarForest(){const N=HQ?520:300;const parts=[],put=(g,c)=>{const col=new Float32Array(g.attributes.position.count*3);for(let i=0;i<col.length;i+=3){col[i]=c.r;col[i+1]=c.g;col[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(col,3));parts.push(g);};
 const tk=new THREE.CylinderGeometry(0.12,0.2,1.2,5);tk.translate(0,0.6,0);put(tk,new THREE.Color(0x4a3a2a));
 [[1.5,2.4,1.0,0x2f5a2c],[1.15,2.1,2.3,0x386a33],[0.75,1.9,3.5,0x447a3c]].forEach(([r,h,y,c])=>{const g=new THREE.ConeGeometry(r,h,7);g.translate(0,y+h/2,0);put(g,new THREE.Color(c));});
 const pos=[],nor=[],col=[];parts.forEach(g=>{const q=g.toNonIndexed();pos.push(...q.attributes.position.array);nor.push(...q.attributes.normal.array);col.push(...q.attributes.color.array);});
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 const im=new THREE.InstancedMesh(G,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}),N);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3();let k=0;
 for(let i=0;i<N*5&&k<N;i++){const a=dkr()*TAU,r=97+Math.pow(dkr(),0.8)*31,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)>128||Math.abs(z)>128)continue;if(noise(x*0.09,z*0.09)<-0.25&&dkr()<0.8)continue;
  const sc=dkrr(1.3,2.5);q.setFromAxisAngle(UPV,dkr()*TAU);m4.compose(p.set(x,gh(x,z)-0.3,z),q,s.set(sc,sc*dkrr(0.9,1.3),sc));im.setMatrixAt(k,m4);im.setColorAt(k,_dc.setHSL(0.27+dkr()*0.07,0.3,0.5+dkr()*0.22));k++;}
 im.count=k;im.frustumCulled=false;im.userData.decor=true;scene.add(im);regInst(im,instPos(im),9,400,0);}
let DECOR_LOG=null; // compte rendu du décor automatique (tests)
function buildDecor(){dkMats();decorCastle();decorCour();decorVillage();decorLake();decorArena();decorSerre();decorPaths();DECOR_LOG={lieux:autoDecor(),chemins:decorPathsides()};decorNature();decorFarForest();dSignsFlush();return dkFlush();}
