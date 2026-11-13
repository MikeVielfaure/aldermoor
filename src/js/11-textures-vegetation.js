/* ================= ÉTAPE 4 : TEXTURES PEINTES & VÉGÉTATION RÉALISTE ================= */
const TX={};let ROCKM=null;const TREEV=[];let BUSHG=null,BUSHM=null,BUSHD=null;
let TRNG=987654;const tr=()=>{TRNG=(TRNG*16807)%2147483647;return (TRNG-1)/2147483646;};
function ctex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d');draw(q,w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
function wrapd(w,h,x,y,r,fn){for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const X=x+dx*w,Y=y+dy*h;if(X+r<0||X-r>w||Y+r<0||Y-r>h)continue;fn(X,Y);}}
function blobs(q,w,h,n,r0,r1,cols,a0,a1){for(let i=0;i<n;i++){const x=tr()*w,y=tr()*h,r=r0+tr()*(r1-r0),c=cols[Math.floor(tr()*cols.length)],a=a0+tr()*(a1-a0);wrapd(w,h,x,y,r,(X,Y)=>{const g=q.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,'rgba('+c+','+a+')');g.addColorStop(1,'rgba('+c+',0)');q.fillStyle=g;q.fillRect(X-r,Y-r,2*r,2*r);});}}
function makeTX(){if(TX.grass)return;
 TX.grass=ctex(256,256,(q,w,h)=>{q.fillStyle='rgb(206,206,200)';q.fillRect(0,0,w,h);blobs(q,w,h,70,10,40,['255,255,240','60,70,40'],0.1,0.22);
  for(let i=0;i<2200;i++){const x=tr()*w,y=tr()*h,l=4+tr()*9,a=-Math.PI/2+(tr()-0.5)*1.2;const lt=tr()<0.5;wrapd(w,h,x,y,l,(X,Y)=>{q.strokeStyle=lt?'rgba(255,255,235,'+(0.2+tr()*0.3)+')':'rgba(30,40,20,'+(0.15+tr()*0.25)+')';q.lineWidth=1+tr();q.beginPath();q.moveTo(X,Y);q.lineTo(X+Math.cos(a)*l,Y+Math.sin(a)*l);q.stroke();});}
  for(let i=0;i<160;i++){const x=tr()*w,y=tr()*h,r=1+tr()*2;q.fillStyle='rgba('+(tr()<0.5?'90,80,70':'230,225,210')+',0.5)';q.beginPath();q.arc(x,y,r,0,TAU);q.fill();}});
 TX.rock=ctex(256,256,(q,w,h)=>{q.fillStyle='rgb(196,194,188)';q.fillRect(0,0,w,h);blobs(q,w,h,90,8,46,['255,255,250','70,68,62','150,130,110'],0.12,0.3);
  for(let i=0;i<26;i++){let x=tr()*w,y=tr()*h,a=tr()*TAU;q.strokeStyle='rgba(40,38,34,'+(0.3+tr()*0.4)+')';q.lineWidth=0.8+tr()*1.6;q.beginPath();q.moveTo(x,y);for(let k=0;k<12;k++){a+=(tr()-0.5)*1.1;x+=Math.cos(a)*7;y+=Math.sin(a)*7;q.lineTo(x,y);}q.stroke();}
  for(let i=0;i<1400;i++){q.fillStyle='rgba('+(tr()<0.5?'255,255,255':'0,0,0')+','+tr()*0.12+')';q.fillRect(tr()*w,tr()*h,1+tr()*3,1+tr()*3);}});
 TX.stone=ctex(256,256,(q,w,h)=>{q.fillStyle='rgb(128,124,116)';q.fillRect(0,0,w,h);const rows=6,rh=h/rows;
  for(let r=0;r<rows;r++){let x=(r%2)*30-tr()*20;while(x<w){const bw=44+tr()*40;const v=180+Math.floor(tr()*45);const draw=X=>{q.fillStyle='rgb('+v+','+(v-4)+','+(v-12)+')';q.fillRect(X+2,r*rh+2,bw-4,rh-4);const g=q.createLinearGradient(0,r*rh,0,r*rh+rh);g.addColorStop(0,'rgba(255,255,255,0.14)');g.addColorStop(0.7,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.22)');q.fillStyle=g;q.fillRect(X+2,r*rh+2,bw-4,rh-4);for(let k=0;k<26;k++){q.fillStyle='rgba('+(tr()<0.5?'255,255,255':'0,0,0')+','+tr()*0.1+')';q.fillRect(X+2+tr()*(bw-6),r*rh+2+tr()*(rh-6),2+tr()*5,2+tr()*4);}};draw(x);if(x+bw>w)draw(x-w);x+=bw;}}});
 TX.roof=ctex(256,256,(q,w,h)=>{q.fillStyle='rgb(80,78,76)';q.fillRect(0,0,w,h);const rh=21.33,cw=32;
  for(let r=-1;r<13;r++){const off=(r%2)*cw/2;for(let c=-1;c<9;c++){const x=c*cw+off,y=r*rh;const v=150+Math.floor(tr()*60);q.fillStyle='rgb('+v+','+(v-3)+','+(v-6)+')';q.beginPath();q.moveTo(x+1,y);q.lineTo(x+cw-1,y);q.lineTo(x+cw-1,y+rh*1.05);q.quadraticCurveTo(x+cw/2,y+rh*1.45,x+1,y+rh*1.05);q.closePath();q.fill();q.fillStyle='rgba(0,0,0,0.25)';q.fillRect(x+1,y,cw-2,2.5);}}});
 TX.plaster=ctex(256,256,(q,w,h)=>{q.fillStyle='rgb(236,234,228)';q.fillRect(0,0,w,h);blobs(q,w,h,80,10,50,['255,255,255','170,160,140'],0.08,0.2);for(let i=0;i<1600;i++){q.fillStyle='rgba(0,0,0,'+tr()*0.07+')';q.fillRect(tr()*w,tr()*h,1+tr()*2,1+tr()*2);}});
 TX.wood=ctex(256,256,(q,w,h)=>{const n=8,ph=h/n;for(let i=0;i<n;i++){const v=170+Math.floor(tr()*50);q.fillStyle='rgb('+v+','+(v-6)+','+(v-14)+')';q.fillRect(0,i*ph,w,ph);for(let k=0;k<14;k++){const y=i*ph+tr()*ph,amp=1+tr()*2,f=0.02+tr()*0.05,p0=tr()*6;q.strokeStyle='rgba(60,40,20,'+(0.12+tr()*0.18)+')';q.lineWidth=0.8+tr();q.beginPath();for(let x=0;x<=w;x+=8)q.lineTo(x,y+Math.sin(x*f+p0)*amp);q.stroke();}q.fillStyle='rgba(30,18,8,0.6)';q.fillRect(0,i*ph+ph-2,w,2);}});
 TX.bark=ctex(128,256,(q,w,h)=>{q.fillStyle='rgb(112,86,62)';q.fillRect(0,0,w,h);for(let i=0;i<70;i++){const x=tr()*w,l=40+tr()*140,y=tr()*h,dark=tr()<0.6;q.strokeStyle=dark?'rgba(40,28,18,'+(0.3+tr()*0.4)+')':'rgba(170,140,110,'+(0.15+tr()*0.25)+')';q.lineWidth=1+tr()*3;wrapd(w,h,x,y,l,(X,Y)=>{q.beginPath();q.moveTo(X,Y);let xx=X;for(let k=0;k<=l;k+=8){xx+=(tr()-0.5)*3;q.lineTo(xx,Y+k);}q.stroke();});}});
 TX.birch=ctex(128,256,(q,w,h)=>{q.fillStyle='rgb(232,228,218)';q.fillRect(0,0,w,h);blobs(q,w,h,30,6,20,['200,195,180'],0.2,0.4);for(let i=0;i<90;i++){const x=tr()*w,y=tr()*h,l=4+tr()*18;q.fillStyle='rgba(40,36,32,'+(0.4+tr()*0.5)+')';wrapd(w,h,x,y,l,(X,Y)=>q.fillRect(X,Y,l,1.5+tr()*2.5));}});
 TX.leaf=ctex(256,256,(q,w,h)=>{const pal=['#2f5a22','#3f6e2a','#4f8232','#5f943a','#76aa46','#8fbf55','#a8d066'];
  for(let i=0;i<420;i++){const a=tr()*TAU,r=Math.pow(tr(),0.7)*w*0.42;const x=w/2+Math.cos(a)*r,y=h/2+Math.sin(a)*r*0.9;const s=7+tr()*7;const li=Math.max(0,Math.min(pal.length-1,Math.floor((1-y/h)*4+tr()*3.5)));q.save();q.translate(x,y);q.rotate(tr()*TAU);q.fillStyle=pal[li];q.beginPath();q.ellipse(0,0,s,s*0.48,0,0,TAU);q.fill();q.strokeStyle='rgba(20,40,10,0.35)';q.lineWidth=0.8;q.beginPath();q.moveTo(-s,0);q.lineTo(s,0);q.stroke();q.restore();}
  q.strokeStyle='rgba(80,55,30,0.9)';q.lineWidth=2;for(let i=0;i<6;i++){q.beginPath();const a=tr()*TAU;q.moveTo(w/2,h/2);q.lineTo(w/2+Math.cos(a)*w*0.3,h/2+Math.sin(a)*h*0.3);q.stroke();}});
 TX.leaf.wrapS=TX.leaf.wrapT=THREE.ClampToEdgeWrapping;
 TX.needle=ctex(256,128,(q,w,h)=>{const pal=['#1f3d1c','#2a5024','#35612c','#477538','#5a8a44'];q.lineCap='round';
  for(let x=2;x<w-6;x+=2.2){const t=x/w,len=(1-t)*34+10;for(const s of [-1,1]){const a=s*(0.7+tr()*0.4)+0.25;q.strokeStyle=pal[Math.floor(tr()*pal.length)];q.lineWidth=1.3+tr();q.beginPath();q.moveTo(x,h/2);q.lineTo(x+Math.cos(a*0.5)*len*0.6,h/2+Math.sin(a)*len);q.stroke();}}
  q.strokeStyle='#4a3420';q.lineWidth=3;q.beginPath();q.moveTo(0,h/2);q.lineTo(w-4,h/2);q.stroke();});
 TX.needle.wrapS=TX.needle.wrapT=THREE.ClampToEdgeWrapping;
 TX.grassCard=ctex(128,128,(q,w,h)=>{for(let i=0;i<55;i++){const x0=w/2+(tr()-0.5)*w*0.7,bw=2+tr()*2.5,ht=h*(0.45+tr()*0.5),bend=(tr()-0.5)*40;const g=q.createLinearGradient(0,h,0,h-ht);const c1=tr()<0.5?'60,110,40':'80,130,50';g.addColorStop(0,'rgb(30,55,22)');g.addColorStop(1,'rgb('+(tr()<0.3?'170,190,90':c1)+')');q.fillStyle=g;q.beginPath();q.moveTo(x0-bw,h);q.quadraticCurveTo(x0+bend*0.4,h-ht*0.6,x0+bend,h-ht);q.quadraticCurveTo(x0+bend*0.4+1,h-ht*0.6,x0+bw,h);q.closePath();q.fill();}});
 TX.grassCard.wrapS=TX.grassCard.wrapT=THREE.ClampToEdgeWrapping;
 TX.cloud=ctex(128,128,(q,w,h)=>{for(let i=0;i<14;i++){const x=w*0.2+tr()*w*0.6,y=h*0.35+tr()*h*0.35,r=14+tr()*26;const g=q.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,0.55)');g.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=g;q.fillRect(0,0,w,h);}});
 TX.cloud.wrapS=TX.cloud.wrapT=THREE.ClampToEdgeWrapping;
 TX.bark.repeat.set(2,3);TX.birch.repeat.set(1,2);
 ROCKM=triMat(0x86826f,TX.rock,TX.rock,0.42,1.0,{roughness:0.95});
}
/* projection triplanaire : la texture suit la géométrie sans coutures, quelle que soit la taille */
function triMat0(color,top,side,scale,boost,opts){const m=new THREE.MeshStandardMaterial(Object.assign({color,roughness:0.9,metalness:0},opts||{}));const U={triTop:{value:top},triSide:{value:side||top},triScale:{value:scale},triBoost:{value:boost||1.2}};
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader='varying vec3 vTriPos;\nvarying vec3 vTriNrm;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n{vec4 trW=vec4(transformed,1.0);vec3 trN=objectNormal;\n#ifdef USE_INSTANCING\ntrW=instanceMatrix*trW;trN=mat3(instanceMatrix)*trN;\n#endif\ntrW=modelMatrix*trW;vTriPos=trW.xyz;vTriNrm=normalize(mat3(modelMatrix)*trN);}');
  sh.fragmentShader='uniform sampler2D triTop;\nuniform sampler2D triSide;\nuniform float triScale;\nuniform float triBoost;\nvarying vec3 vTriPos;\nvarying vec3 vTriNrm;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec3 bw=abs(normalize(vTriNrm));bw=pow(bw,vec3(4.0));bw/=(bw.x+bw.y+bw.z);vec3 tS=texture2D(triSide,vTriPos.zy*triScale).rgb*bw.x+texture2D(triTop,vTriPos.xz*triScale).rgb*bw.y+texture2D(triSide,vTriPos.xy*triScale).rgb*bw.z;diffuseColor.rgb*=tS*triBoost;}');};
 m.customProgramCacheKey=()=>'tri';return m;}
/* feuillage : alpha, balancement au vent, normales "en boule" pour un volume doux */
function leafMat(map,amp){const m=new THREE.MeshStandardMaterial({map,alphaTest:0.5,side:THREE.DoubleSide,roughness:0.85,metalness:0,emissive:0x0c1606});const a=(amp||0.025).toFixed(3);
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=WIND.uTime;sh.uniforms.uWind=WIND.uWind;
  sh.vertexShader='uniform float uTime;\nuniform float uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec4 swp=instanceMatrix*vec4(0.0,0.0,0.0,1.0);\n#else\nvec4 swp=vec4(0.0);\n#endif\nfloat swk=max(0.0,position.y)*'+a+'*uWind;\ntransformed.x+=sin(uTime*2.1+swp.x*0.35+swp.z*0.2+position.y*0.6)*swk;\ntransformed.z+=cos(uTime*1.7+swp.z*0.3+swp.x*0.1)*swk*0.7;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize(vNormal);').replace('#include <alphatest_fragment>','#include <alphatest_fragment>\n{float vd=length(vViewPosition);if(vd<3.4){float dd=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);if(dd>(vd-1.6)/1.8)discard;}}').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#if defined(USE_COLOR)||defined(USE_INSTANCING_COLOR)\ntotalEmissiveRadiance+=clamp(vColor-vec3(1.0),vec3(0.0),vec3(2.0))*0.75;\n#endif');};
 m.customProgramCacheKey=()=>'leaf'+a;return m;}
const leafDepth=map=>new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map,alphaTest:0.5});
function mergeGeos(parts){const pos=[],nor=[],uv=[],idx=[];let off=0;
 for(const p of parts){const c=p.g.clone();if(p.m)c.applyMatrix4(p.m);const P=c.attributes.position,N=c.attributes.normal,U=c.attributes.uv;
  for(let i=0;i<P.count;i++){pos.push(P.getX(i),P.getY(i),P.getZ(i));nor.push(N.getX(i),N.getY(i),N.getZ(i));uv.push(U?U.getX(i):0,U?U.getY(i):0);}
  if(c.index){for(let i=0;i<c.index.count;i++)idx.push(c.index.getX(i)+off);}else{for(let i=0;i<P.count;i++)idx.push(i+off);}off+=P.count;}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));r.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));r.setIndex(idx);r.computeBoundingSphere();return r;}
function sphereNormals(g,cx,cy,cz,ys){const P=g.attributes.position,N=g.attributes.normal,v=new THREE.Vector3();for(let i=0;i<P.count;i++){v.set(P.getX(i)-cx,(P.getY(i)-cy)*ys,P.getZ(i)-cz).normalize();v.y=v.y*0.7+0.3;v.normalize();N.setXYZ(i,v.x,v.y,v.z);}N.needsUpdate=true;}
function cylNormals(g){const P=g.attributes.position,N=g.attributes.normal,v=new THREE.Vector3();for(let i=0;i<P.count;i++){v.set(P.getX(i),0.7,P.getZ(i)).normalize();N.setXYZ(i,v.x,v.y,v.z);}N.needsUpdate=true;}
const RY=a=>new THREE.Matrix4().makeRotationY(a),RZ=a=>new THREE.Matrix4().makeRotationZ(a),RX=a=>new THREE.Matrix4().makeRotationX(a),TR=(x,y,z)=>new THREE.Matrix4().makeTranslation(x,y,z);
function buildDecid(o){const tp=[],lp=[];const H=o.h;
 const tg=new THREE.CylinderGeometry(o.r1,o.r0,H,10,6,false);tg.translate(0,H/2,0);{const p=tg.attributes.position;const ph=tr()*6;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)+Math.sin(y*0.9+ph)*0.12*y/H);p.setZ(i,p.getZ(i)+Math.cos(y*0.7+ph)*0.07*y/H);}tg.computeVertexNormals();}
 tp.push({g:tg});
 for(let i=0;i<4;i++){const th=i/4*TAU+tr();const rg=new THREE.CylinderGeometry(0.03,o.r0*0.55,0.9,6);rg.translate(0,0.45,0);tp.push({g:rg,m:TR(0,0.05,0).multiply(RY(th)).multiply(RZ(-1.2))});}
 const ends=[[0,H+o.cr*0.55,0]];
 for(let i=0;i<o.nb;i++){const th=i/o.nb*TAU+tr()*0.8,ph=0.45+tr()*0.5,L=o.bl*(0.75+tr()*0.5),y0=H*(0.55+tr()*0.4);const bg=new THREE.CylinderGeometry(0.035,o.r1*0.7,L,6,1);bg.translate(0,L/2,0);tp.push({g:bg,m:TR(0,y0,0).multiply(RY(th)).multiply(RZ(-ph))});ends.push([L*Math.sin(ph)*Math.cos(th),y0+L*Math.cos(ph),-L*Math.sin(ph)*Math.sin(th)]);}
 const cy=H+o.cr*0.25;
 for(let i=0;i<o.fill;i++){const u=tr()*TAU,v=Math.acos(2*tr()-1),r=o.cr*Math.cbrt(tr())*0.85;ends.push([Math.sin(v)*Math.cos(u)*r,cy+Math.cos(v)*r*o.sq,Math.sin(v)*Math.sin(u)*r]);}
 const q=new THREE.Quaternion(),e=new THREE.Euler(),one=new THREE.Vector3(1,1,1);
 for(const p of ends){for(let k=0;k<o.cards;k++){const sz=o.card*(0.75+tr()*0.5);const sp=o.spread;e.set(tr()*TAU,tr()*TAU,tr()*TAU);q.setFromEuler(e);lp.push({g:new THREE.PlaneGeometry(sz,sz),m:new THREE.Matrix4().compose(new THREE.Vector3(p[0]+(tr()-0.5)*sp,p[1]+(tr()-0.5)*sp*0.7,p[2]+(tr()-0.5)*sp),q,one)});}}
 const leaf=mergeGeos(lp);sphereNormals(leaf,0,cy,0,1/(o.sq||1));return {trunk:mergeGeos(tp),leaf};}
function buildConifer(o){const tp=[],lp=[];const H=o.h;const tg=new THREE.CylinderGeometry(0.05,o.r0,H,9,4);tg.translate(0,H/2,0);tp.push({g:tg});
 for(let l=0;l<o.levels;l++){const t=l/(o.levels-1);const y=o.y0+t*(H-o.y0-0.7);const len=o.w*(1-t*0.82)+0.35;const nb=Math.max(4,Math.round(o.nb-t*2.5));
  for(let i=0;i<nb;i++){const th=i/nb*TAU+l*0.9+tr()*0.4;const dr=0.22+tr()*0.25+t*0.1;
   for(const roll of [0,1]){const pg=new THREE.PlaneGeometry(len,len*0.6);pg.translate(len/2,0,0);const rl=roll?(tr()<0.5?1:-1)*(0.9+tr()*0.4):(tr()-0.5)*0.3;lp.push({g:pg,m:TR(0,y,0).multiply(RY(th)).multiply(RZ(-dr)).multiply(RX(-Math.PI/2+rl))});}}}
 for(let i=0;i<3;i++){const pg=new THREE.PlaneGeometry(1.5,0.8);pg.rotateZ(Math.PI/2);pg.translate(0,0.75,0);lp.push({g:pg,m:TR(0,H-0.9,0).multiply(RY(i/3*Math.PI))});}
 const leaf=mergeGeos(lp);cylNormals(leaf);return {trunk:mergeGeos(tp),leaf};}
function makeTreeVariants(counts){
 const barkM=new THREE.MeshStandardMaterial({map:TX.bark,roughness:0.95}),birchM=new THREE.MeshStandardMaterial({map:TX.birch,roughness:0.8});
 const leafM=leafMat(TX.leaf,0.025),needM=leafMat(TX.needle,0.02);
 const defs=[{t:'d',o:{h:3,r0:0.34,r1:0.18,nb:5,bl:2.1,cr:2.4,sq:0.85,fill:8,cards:5,card:2.0,spread:1.7}},{t:'d',o:{h:4.2,r0:0.28,r1:0.15,nb:6,bl:1.7,cr:1.9,sq:1.3,fill:8,cards:5,card:1.75,spread:1.4}},{t:'b',o:{h:4.8,r0:0.19,r1:0.09,nb:5,bl:1.5,cr:1.6,sq:1.35,fill:6,cards:5,card:1.45,spread:1.2}},{t:'c',o:{h:7.6,r0:0.32,levels:10,w:2.7,y0:1.1,nb:7}},{t:'c',o:{h:9.6,r0:0.27,levels:13,w:1.95,y0:1.8,nb:6}}];
 defs.forEach((d,i)=>{const Gm=d.t==='c'?buildConifer(d.o):buildDecid(d.o);const n=Math.max(1,counts[i]);const lm=d.t==='c'?needM:leafM;
  const tm=new THREE.InstancedMesh(Gm.trunk,d.t==='b'?birchM:barkM,n),lf=new THREE.InstancedMesh(Gm.leaf,lm,n);
  [tm,lf].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);});lf.customDepthMaterial=leafDepth(lm.map);tm.setColorAt(0,WHITEC);lf.setColorAt(0,WHITEC);
  TREEV.push({trunk:tm,leaf:lf,t:d.t});});}
const UPV=new THREE.Vector3(0,1,0),CHARC=new THREE.Color(0x1d1a18),WHITEC=new THREE.Color(0xffffff);
function makeBush(){if(BUSHG)return;const lp=[];const q=new THREE.Quaternion(),e=new THREE.Euler(),one=new THREE.Vector3(1,1,1);
 for(let i=0;i<34;i++){const u=tr()*TAU,v=Math.acos(2*tr()-1),r=Math.cbrt(tr())*0.95;e.set(tr()*TAU,tr()*TAU,tr()*TAU);q.setFromEuler(e);const sz=0.9+tr()*0.5;lp.push({g:new THREE.PlaneGeometry(sz,sz),m:new THREE.Matrix4().compose(new THREE.Vector3(Math.sin(v)*Math.cos(u)*r*1.3,0.65+Math.cos(v)*r*0.6,Math.sin(v)*Math.sin(u)*r*1.3),q,one)});}
 BUSHG=mergeGeos(lp);sphereNormals(BUSHG,0,0.5,0,1.6);BUSHM=leafMat(TX.leaf,0.03);BUSHD=leafDepth(TX.leaf);}
function hedge(x,z,s){makeBush();const y=gh(x,z);const core=mesh(new THREE.SphereGeometry(1,14,10),mat(0x2a4a22,{roughness:1}),x,y+0.55,z);core.scale.set(1.15*(s||1),0.55*(s||1),1.15*(s||1));
 const m=new THREE.Mesh(BUSHG,BUSHM);m.position.set(x,y,z);m.rotation.y=Math.random()*TAU;m.scale.setScalar(s||1);m.castShadow=true;m.customDepthMaterial=BUSHD;scene.add(m);return m;}

