/* ================= MONDE ================= */
const PATHS=LOCS.filter(l=>l.id!=='cour'&&l.id!=='hauteurs'&&!l.hidden).map(l=>(l.from||[0,2]).concat([l.spot.x,l.spot.z]));const TRAILS=[[49,-4.8,54,-17],[54,-17,63,-27],[63,-27,58.3,-43.5],[58.3,-43.5,53,-51]];const ALLP=PATHS.concat(TRAILS);
function pathDist(x,z){let m=1e9;for(const [x1,z1,x2,z2] of ALLP){const dx=x2-x1,dz=z2-z1,L2=dx*dx+dz*dz;const t=clamp(((x-x1)*dx+(z-z1)*dz)/L2,0,1);const d=Math.hypot(x-(x1+dx*t),z-(z1+dz*t));if(d<m)m=d;}return m;}
const LAMPS=[];let winMat,water,waterBase,banners=[],TREES=[],treeMeshes={},grassMesh,chimneys=[];
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function buildWorld(){makeTX();
 // --- terrain peint (herbe, chemins, pavés, sable, rives) ---
 const N=HQ?240:160;HN=N;const geo=new THREE.PlaneGeometry(260,260,N,N);geo.rotateX(-Math.PI/2);
 const P=geo.attributes.position,cols=new Float32Array(P.count*3);const c=new THREE.Color(),c2=new THREE.Color();
 const G1=new THREE.Color(0x4f7d38),G2=new THREE.Color(0x6a9a45),G3=new THREE.Color(0x3c6530),PATH=new THREE.Color(0xa08c68),PAVE=new THREE.Color(0xa9a091),SAND=new THREE.Color(0xcfb784),MUD=new THREE.Color(0x7d6e4e),DEEP=new THREE.Color(0x1d3a5a),FOR=new THREE.Color(0x2f4f28),ROCK=new THREE.Color(0x77735f);
 for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),r=Math.hypot(x,z),n=noise(x,z);
  let y=terrainH(x,z);
  P.setY(i,y);
  c.copy(G1).lerp(G2,clamp(n*0.5+0.5,0,1)*0.8);if(noise(x*2.3,z*2.1)>0.8)c.lerp(G3,0.5);
  const fd=Math.hypot(x+48,z-52);if(fd<22)c.lerp(FOR,smooth(22,14,fd)*0.75);
  if(r>96)c.lerp(ROCK,clamp((y-3)/14,0,0.8));
  const pd=pathDist(x,z);if(pd<2.2)c.lerp(PATH,smooth(2.2,1.0,pd)*(0.85+noise(x*3,z*3)*0.1));
  const cd=Math.hypot(x,z-2);if(cd<11.5){c2.copy(PAVE).multiplyScalar(0.92+0.08*Math.sin(x*3.1)*Math.sin(z*3.1));c.lerp(c2,smooth(11.5,10.5,cd));}
  const ad=Math.hypot(x+12,z-30);if(ad<8.6)c.lerp(SAND,smooth(8.6,7.8,ad));
  const ld=Math.hypot(x-LAKE.x,z-LAKE.z);if(ld<15)c.lerp(MUD,smooth(15,13.2,ld));if(ld<13)c.lerp(DEEP,smooth(13,10,ld));
  const sd=Math.hypot(x-58,z+6);if(sd<7.5)c.lerp(ROCK,smooth(7.5,6,sd)*0.4);paintW4(x,z,c);
  cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(cols,3));geo.computeVertexNormals();
 HF=new Float32Array(P.count);for(let i=0;i<P.count;i++)HF[i]=P.getY(i);
 {const Nn=geo.attributes.normal,ROCK2=new THREE.Color(0x6e6a5e),BED=new THREE.Color(0x5a5040);for(let i=0;i<P.count;i++){const ny=Nn.getY(i),x=P.getX(i),z=P.getZ(i);c.setRGB(cols[i*3],cols[i*3+1],cols[i*3+2]);if(ny<0.9)c.lerp(ROCK2,clamp((0.9-ny)*3,0,0.92));const rd=riverDist(x,z);if(rd<3)c.lerp(BED,smooth(3,1.5,rd)*0.8);if(P.getY(i)>6.5&&Math.hypot(x-PC.x,z-PC.z)<14)c.lerp(G2,0.25);cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}geo.attributes.color.needsUpdate=true;}
 for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),ld=Math.hypot(x-LAKE.x,z-LAKE.z);if(ld<14.6)P.setY(i,P.getY(i)-0.32*smooth(14.6,13.3,ld)-2.4*smooth(13.4,6,ld));}geo.computeVertexNormals();
 const ground=new THREE.Mesh(geo,triMat(0xffffff,TX.grass,TX.rock,0.3,1.06,{vertexColors:true,roughness:1}));ground.receiveShadow=true;scene.add(ground);

 // --- ciel ---
 skyMat=new THREE.ShaderMaterial({uniforms:{top:{value:new THREE.Color(0x4d8fe0)},bot:{value:new THREE.Color(0xbfdcf5)}},
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 bot;varying vec3 vP;void main(){float h=clamp(vP.y*1.8+0.05,0.0,1.0);gl_FragColor=vec4(mix(bot,top,pow(h,0.8)),1.0);}',side:THREE.BackSide,depthWrite:false,fog:false});
 skyMesh=new THREE.Mesh(new THREE.SphereGeometry(400,32,16),skyMat);skyMesh.renderOrder=-10;scene.add(skyMesh);
 sunSpr=glow(0xfff4c0,60,1);sunSpr.material.fog=false;scene.add(sunSpr);moonSpr=glow(0xdde6ff,34,1);moonSpr.material.fog=false;scene.add(moonSpr);
 for(let i=0;i<16;i++){const g=new THREE.Group();const n=4+Math.floor(srand()*4);for(let k=0;k<n;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TX.cloud,color:0xffffff,transparent:true,opacity:0.95,depthWrite:false,fog:false}));const sc=14+srand()*16;sp.scale.set(sc*1.7,sc,1);sp.position.set(k*7-n*3.5+srand()*4,srand()*4,srand()*6);g.add(sp);}const a=srand()*TAU,r=60+srand()*130;g.position.set(Math.cos(a)*r,60+srand()*30,Math.sin(a)*r);g.userData.v=0.6+srand();scene.add(g);clouds.push(g);}
 const sg=new THREE.BufferGeometry(),arr=[];for(let i=0;i<900;i++){const a=srand()*TAU,b=srand()*1.3+0.12,R=380;arr.push(Math.cos(a)*Math.cos(b)*R,Math.sin(b)*R,Math.sin(a)*Math.cos(b)*R);}sg.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
 stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.8,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(stars);

 winMat=new THREE.MeshStandardMaterial({color:0x332211,emissive:0xffc060,emissiveIntensity:0.3,roughness:0.6});
 const STONE=triMat(0xa29d92,TX.stone,TX.stone,0.32,1.15),STONE2=triMat(0x8a857a,TX.stone,TX.stone,0.32,1.15),SLATE=0x3b4a6b,WOOD=triMat(0x7a5432,TX.wood,TX.wood,0.7,1.2),DWOOD=triMat(0x4a3018,TX.wood,TX.wood,0.7,1.2);

 // --- Grande Cour : fontaine, bancs, haies ---
 mesh(new THREE.CylinderGeometry(2.6,2.8,0.7,28),STONE,0,0.35,2);
 mesh(new THREE.CylinderGeometry(2.3,2.3,0.2,28),waterMat({amp:0.12,op:0.78,color:0x2a6a8e,nk:0.05}),0,0.62,2,null,false);
 mesh(new THREE.CylinderGeometry(0.35,0.5,1.8,10),STONE,0,1.3,2);
 mesh(new THREE.CylinderGeometry(1.1,0.5,0.35,16),STONE,0,2.25,2);
 addCol({x:0,z:2,r:2.8,h:0.7});addCol({x:0,z:2,r:0.55,h:2.4});
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4,x=Math.cos(a)*7,z=2+Math.sin(a)*7;const b=new THREE.Group();mesh(new THREE.BoxGeometry(2.2,0.12,0.6),WOOD,0,0.55,0,b);mesh(new THREE.BoxGeometry(2.2,0.6,0.1),WOOD,0,0.85,-0.28,b);[-0.9,0.9].forEach(o=>mesh(new THREE.BoxGeometry(0.12,0.55,0.5),0x2a2a2a,o,0.28,0,b));b.position.set(x,0,z);b.rotation.y=-a-Math.PI/2;scene.add(b);addCol({x,z,r:0.9,h:0.62});}
 for(let k=0;k<10;k++){const a=k/10*TAU+0.31;if(PATHS.some(p=>Math.abs(Math.atan2(p[3]-2,p[2])-a)<0.25||Math.abs(Math.atan2(p[3]-2,p[2])-a+TAU)<0.25||Math.abs(Math.atan2(p[3]-2,p[2])-a-TAU)<0.25))continue;hedge(Math.cos(a)*11.6,2+Math.sin(a)*11.6,1.3);}

 // --- château ---
 const keep=new THREE.Group();scene.add(keep);
 mesh(new THREE.BoxGeometry(25,1.2,15),STONE2,0,0.6,-46,keep);
 mesh(new THREE.BoxGeometry(24,14,14),STONE,0,7.4,-46,keep);
 for(let i=-11.5;i<=11.6;i+=1.6){mesh(new THREE.BoxGeometry(0.9,1.2,0.9),STONE,i,15,-39.4,keep);mesh(new THREE.BoxGeometry(0.9,1.2,0.9),STONE,i,15,-52.6,keep);}
 mesh(new THREE.BoxGeometry(5,7,0.6),STONE2,0,3.5,-38.8,keep);
 const arch=mesh(new THREE.CylinderGeometry(2,2,0.65,20,1,false,0,Math.PI),0x2a1c10,0,5.6,-38.6,keep);arch.rotation.x=Math.PI/2;arch.rotation.z=Math.PI/2;arch.rotation.y=0;
 mesh(new THREE.BoxGeometry(4,5.6,0.66),0x2a1c10,0,2.8,-38.6,keep);
 for(let i=-9;i<=9;i+=3)for(let j=0;j<2;j++)if(Math.abs(i)>2){const w=mesh(new THREE.BoxGeometry(1,1.8,0.2),winMat,i,5.2+j*4.6,-38.95,keep,false);const wa=mesh(new THREE.CylinderGeometry(0.5,0.5,0.2,10,1,false,0,Math.PI),winMat,i,6.1+j*4.6,-38.95,keep,false);wa.rotation.x=Math.PI/2;wa.rotation.z=Math.PI/2;void w;}
 [[-12,-39],[12,-39],[-12,-53],[12,-53]].forEach(([x,z])=>tower(x,z,3.2,20,STONE,SLATE,true));
 tower(0,-48,4.4,28,STONE,SLATE,true);
 [-6,6].forEach(x=>{const b=new THREE.Mesh(new THREE.PlaneGeometry(1.8,4.2,1,6),new THREE.MeshStandardMaterial({color:x<0?0x5a2a8a:0x8a2a3a,side:THREE.DoubleSide,roughness:0.9}));b.position.set(x,10.5,-38.85);b.castShadow=true;scene.add(b);banners.push(b);b.userData.base=b.geometry.attributes.position.array.slice();});
 addCol({x:0,z:-46,hw:12.3,hd:7.3,fh:16});
 // --- tour-bibliothèque ---
 tower(-32,-32,4.6,22,0xa08f72,0x5a3a6a,true);
 for(let k=0;k<6;k++){const a=k*1.1+0.6;const w=mesh(new THREE.BoxGeometry(0.8,1.4,0.15),winMat,-32+Math.sin(a)*4.62,5+k*3,-32+Math.cos(a)*4.62,null,false);w.rotation.y=a;}
 for(let k=0;k<5;k++)mesh(new THREE.BoxGeometry(0.5,0.7,0.35),pick([0x8a2a2a,0x2a4a8a,0x2a6a3a]),-28.5+k*0.45,0.35,-26.8).rotation.y=0.1*k;
 // --- observatoire ---
 mesh(new THREE.CylinderGeometry(4.2,4.6,12,32),triMat(0xbcb29c,TX.stone,TX.stone,0.32,1.12),32,6,-32);
 mesh(new THREE.SphereGeometry(4.5,24,12,0,TAU,0,Math.PI/2),mat(0x7a8fb8,{metalness:0.4,roughness:0.4,flatShading:false}),32,12,-32);
 const tel=mesh(new THREE.CylinderGeometry(0.45,0.75,5.5,12),mat(0xb08a3a,{metalness:0.6,roughness:0.35,flatShading:false}),33.8,15.2,-31);tel.rotation.z=-0.8;
 mesh(new THREE.BoxGeometry(1.6,2.6,0.3),0x3a2a1a,32,1.3,-27.6);
 addCol({x:32,z:-32,r:4.8,fh:16.8});
 // --- serres ---
 const glass=new THREE.MeshStandardMaterial({color:0xbff0e0,transparent:true,opacity:0.28,roughness:0.05,metalness:0.3,side:THREE.DoubleSide,depthWrite:false});
 mesh(new THREE.BoxGeometry(12,5,8),glass,-36,2.5,10,null,false);
 const roof=mesh(new THREE.CylinderGeometry(4.6,4.6,12,3,1,false,Math.PI/2),glass,-36,6.25,10,null,false);roof.rotation.z=Math.PI/2;roof.scale.set(0.55,1,1);
 const FR=0x2f3a2f;for(let i=-6;i<=6;i+=2){mesh(new THREE.BoxGeometry(0.12,5,0.12),FR,-36+i,2.5,6);mesh(new THREE.BoxGeometry(0.12,5,0.12),FR,-36+i,2.5,14);}
 mesh(new THREE.BoxGeometry(12.2,0.15,0.15),FR,-36,5,6);mesh(new THREE.BoxGeometry(12.2,0.15,0.15),FR,-36,5,14);mesh(new THREE.BoxGeometry(12.2,0.15,0.15),FR,-36,7.5,10);
 for(let i=0;i<14;i++){const x=-36+rnd(-5,5),z=10+rnd(-3,3);mesh(new THREE.CylinderGeometry(0.3,0.22,0.4,8),0x9a5a3a,x,0.2,z);mesh(new THREE.IcosahedronGeometry(rnd(.4,.8),0),pick([0x3fae4f,0x58c46a,0xd46ab0,0xe8c040,0x8a4ad0]),x,rnd(.7,1.2),z);}
 addCol({x:-36,z:10,hw:6.1,hd:4.1,fh:8.2});
 // --- lac ---
 const wg=new THREE.RingGeometry(0.2,13.4,64,12);wg.rotateX(-Math.PI/2);waterBase=wg.attributes.position.array.slice();
 water=new THREE.Mesh(wg,waterMat({cx:LAKE.x,cz:LAKE.z,r:13.4,op:0.58}));water.position.set(LAKE.x,0.06,LAKE.z);water.receiveShadow=true;scene.add(water);
 addCol({x:LAKE.x,z:LAKE.z,r:LAKE.r,lake:true});
 for(let i=0;i<40;i++){const a=srand()*TAU,r=13.2+srand()*1.2;const x=LAKE.x+Math.cos(a)*r,z=LAKE.z+Math.sin(a)*r;if(pathDist(x,z)<2)continue;mesh(new THREE.ConeGeometry(.08,1.4+srand(),4),0x5a7a2a,x,0.7,z,null,false);}
 const dock=new THREE.Group();for(let i=0;i<6;i++)mesh(new THREE.BoxGeometry(2.4,0.15,0.5),WOOD,0,0.35,i*0.55,dock);[-1,1].forEach(s=>[0,2.6].forEach(z=>mesh(new THREE.CylinderGeometry(0.1,0.1,1,6),DWOOD,s*1.1,0,z,dock)));dock.position.set(30.4,0,23.6);dock.rotation.y=Math.PI/2+0.15;scene.add(dock);
 // --- village ---
 for(let k=0;k<6;k++){const a=k/6*TAU,x=12+Math.cos(a)*10,z=62+Math.sin(a)*10;house(x,z,-a+Math.PI/2);addCol({x,z,r:3.7,fh:7.2});}
 mesh(new THREE.CylinderGeometry(1,1.1,1,14),STONE,12,0.5,62);mesh(new THREE.CylinderGeometry(0.85,0.85,0.1,14),mat(0x1d3a5a,{flatShading:false}),12,0.98,62,null,false);
 [[-0.9],[0.9]].forEach(([o])=>mesh(new THREE.BoxGeometry(0.12,1.8,0.12),WOOD,12+o,1.8,62));mesh(new THREE.ConeGeometry(1.3,0.8,4),0x6a3a2a,12,3,62).rotation.y=Math.PI/4;
 addCol({x:12,z:62,r:1.3,h:1.0});
 // --- cercle de pierres ---
 for(let k=0;k<9;k++){const a=k/9*TAU,x=58+Math.cos(a)*6,z=-6+Math.sin(a)*6;const h=3.4+srand()*1.6;const s=mesh(new THREE.BoxGeometry(1.3,h,0.85,2,4,2),ROCKM,x,h/2-0.1,z);s.rotation.set((srand()-0.5)*0.1,-a,(srand()-0.5)*0.12);addCol({x,z,r:0.95});}
 mesh(new THREE.CylinderGeometry(1.5,1.7,0.55,24),ROCKM,58,0.27,-6);addCol({x:58,z:-6,r:1.6,h:0.55});
 // --- arène ---
 for(let k=0;k<22;k++){const a=k/22*TAU;if(Math.abs(Math.atan2(Math.sin(a+Math.PI/2.6),Math.cos(a+Math.PI/2.6)))<0.3)continue;const x=-12+Math.cos(a)*8.8,z=30+Math.sin(a)*8.8;mesh(new THREE.CylinderGeometry(.22,.28,1.6+((k%2)*0.8),7),WOOD,x,0.9,z);}
 [[-12+8.8,30],[-12-8.8,30]].forEach(([x,z])=>{mesh(new THREE.BoxGeometry(0.3,4,0.3),DWOOD,x,2,z);const f=mesh(new THREE.PlaneGeometry(1.2,1.6),new THREE.MeshStandardMaterial({color:x>-12?0x2a5a9a:0x9a2a2a,side:THREE.DoubleSide}),x,3.2,z+0.65);f.rotation.y=Math.PI/2;});
 // --- arbres (instanciés, chaque arbre peut brûler et repousser) ---
 for(let i=0;i<80;i++){const a=srand()*TAU,r=Math.sqrt(srand())*20;const x=-48+Math.cos(a)*r,z=52+Math.sin(a)*r;if(Math.hypot(x+46,z-50)<6||pathDist(x,z)<3)continue;TREES.push({x,z,s:0.85+srand()*0.6,k:srand()<0.7?0:1});}
 for(let i=0;i<420&&TREES.length<210;i++){const a=srand()*TAU,r=18+srand()*74;const x=Math.cos(a)*r,z=Math.sin(a)*r;let ok=true;for(const l of LOCS){if(Math.hypot(x-l.x,z-l.z)<l.r+4){ok=false;break;}}if(Math.hypot(x-LAKE.x,z-LAKE.z)<16)ok=false;if(ok&&(pathDist(x,z)<4||riverDist(x,z)<4.5||slopeAt(x,z)>1.3))ok=false;if(ok&&isFree({x,z},1.6))TREES.push({x,z,s:0.8+srand()*0.6,k:srand()<0.45?0:1});}
 const tcount=[0,0,0,0,0];TREES.forEach(t=>{t.y=gh(t.x,t.z);t.v=t.k===0?(srand()<0.6?3:4):(srand()<0.45?0:(srand()<0.6?1:2));t.rot=srand()*TAU;t.i=tcount[t.v]++;t.st='ok';t.burn=0;t.hp=1;addCol({x:t.x,z:t.z,r:0.45*t.s,tree:t});});
 makeTreeVariants(tcount);
 TREES.forEach(t=>{const c=TREEV[t.v].t;t.c1=c==='c'?new THREE.Color().setHSL(0.29+srand()*0.06,0.25+srand()*0.15,0.62+srand()*0.12):c==='b'?new THREE.Color().setHSL(0.2+srand()*0.05,0.45,0.78+srand()*0.1):new THREE.Color().setHSL(0.2+srand()*0.09,0.3+srand()*0.25,0.62+srand()*0.16);treeLook(t);});
 treesDirty();
 // --- herbe, fleurs, rochers ---
 const blade=(()=>{const a=new THREE.PlaneGeometry(0.75,0.6);a.translate(0,0.3,0);const b=a.clone();b.rotateY(Math.PI/2);const g=mergeGeos([{g:a},{g:b}]);const N=g.attributes.normal;for(let k=0;k<N.count;k++)N.setXYZ(k,0,1,0);return g;})();
 const GN=HQ?5600:2200;grassMesh=new THREE.InstancedMesh(blade,leafMat(TX.grassCard,0.45),GN);grassMesh.frustumCulled=false;
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),s3=new THREE.Vector3(),p3=new THREE.Vector3(),e=new THREE.Euler();let gi=0;
 for(let tries=0;tries<GN*4&&gi<GN;tries++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*92;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(pathDist(x,z)<2.4||Math.hypot(x,z-2)<12||Math.hypot(x+12,z-30)<9||Math.hypot(x-LAKE.x,z-LAKE.z)<14.5||riverDist(x,z)<2.8||inPool(x,z)||Math.abs(x+66)<6&&Math.abs(z+24)<8||slopeAt(x,z)>1.5||!isFree({x,z},0.3))continue;
  const sc=0.5+Math.random()*0.55;e.set(0,Math.random()*TAU,0);q.setFromEuler(e);s3.set(sc,sc*(0.7+Math.random()*0.8),sc);p3.set(x,gh(x,z),z);m4.compose(p3,q,s3);grassMesh.setMatrixAt(gi,m4);grassMesh.setColorAt(gi,new THREE.Color().setHSL(0.19+Math.random()*0.09,0.28,0.5+Math.random()*0.16));gi++;}
 grassMesh.count=gi;grassMesh.receiveShadow=true;scene.add(grassMesh);grassFade(grassMesh.material);regInst(grassMesh,instPos(grassMesh),1,60,6);
 const fl=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.11,0),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x111111}),400);let fi=0;
 for(let tries=0;tries<1600&&fi<400;tries++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*90;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(pathDist(x,z)<2.4||Math.hypot(x,z-2)<12||Math.hypot(x-LAKE.x,z-LAKE.z)<14.5||!isFree({x,z},0.3))continue;if(riverDist(x,z)<2.8||inPool(x,z)||slopeAt(x,z)>1.5)continue;p3.set(x,gh(x,z)+0.3,z);q.identity();s3.set(1,1,1);m4.compose(p3,q,s3);fl.setMatrixAt(fi,m4);fl.setColorAt(fi,new THREE.Color(pick([0xffe066,0xff7ab0,0xffffff,0xb08aff,0x7ac8ff])));fi++;}
 fl.count=fi;fl.frustumCulled=false;scene.add(fl);regInst(fl,instPos(fl),0.5,45,8);
 for(let i=0;i<34;i++){const a=srand()*TAU,r=15+srand()*75;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(pathDist(x,z)<3||!isFree({x,z},1.5)||Math.hypot(x-LAKE.x,z-LAKE.z)<15)continue;const s=0.5+srand()*1.2;if(riverDist(x,z)<4||inPool(x,z)||Math.hypot(x+66,z+24)<13)continue;const rk=mesh(rockGeo(s),ROCKM,x,gh(x,z)+s*0.4,z);rk.rotation.set(srand()*3,srand()*3,0);rk.scale.y=0.7;if(s>0.9)addCol({x,z,r:s*0.9,h:gh(x,z)+s*0.72});}
 // --- lanternes le long des chemins ---
 PATHS.forEach(([x1,z1,x2,z2])=>{const dx=x2-x1,dz=z2-z1,L=Math.hypot(dx,dz);const n=Math.floor(L/13);for(let i=1;i<=n;i++){const t=i/(n+1);lamp(x1+dx*t+(dz/L)*2.3,z1+dz*t-(dx/L)*2.3);}});
}
let skyMat,sunSpr,moonSpr,stars,skyMesh;const clouds=[];
function tower(x,z,r,h,col,roof,cren){const wm=typeof col==='number'?triMat(col,TX.stone,TX.stone,0.32,1.15):col;const rm=triMat(typeof roof==='number'?roof:0x3b4a6b,TX.roof,TX.roof,0.42,1.3,{roughness:0.7});
 mesh(new THREE.CylinderGeometry(r,r*1.06,h,28),wm,x,h/2,z);
 if(cren){mesh(new THREE.CylinderGeometry(r*1.15,r*1.15,0.8,28),wm,x,h+0.2,z);for(let k=0;k<12;k++){const a=k/12*TAU;mesh(new THREE.BoxGeometry(0.6,0.7,0.5),wm,x+Math.cos(a)*r*1.12,h+0.95,z+Math.sin(a)*r*1.12).rotation.y=-a;}}
 mesh(new THREE.ConeGeometry(r*1.3,r*2.6,28),rm,x,h+0.6+r*1.3,z);
 const fl=glow(0xffd27a,0.7,0.6);fl.position.set(x,h+0.6+r*2.6+0.2,z);scene.add(fl);addCol({x,z,r:r+0.3,fh:h+r*2.6+0.8});}
function house(x,z,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
 const wall=triMat(pick([0xeae2cc,0xddd0b6,0xf0e8d6]),TX.plaster,TX.plaster,0.5,1.08);mesh(new THREE.BoxGeometry(5,3.6,5.2),wall,0,1.8,0,g);
 const B=0x4a3018;[[-2.45,0],[2.45,0]].forEach(([bx])=>{mesh(new THREE.BoxGeometry(0.18,3.6,0.18),B,bx,1.8,2.62,g);mesh(new THREE.BoxGeometry(0.18,3.6,0.18),B,bx,1.8,-2.62,g);});mesh(new THREE.BoxGeometry(5.1,0.2,0.2),B,0,1.9,2.62,g);
 const r=mesh(new THREE.ConeGeometry(4.3,3.2,4),triMat(pick([0x9a4a36,0x6a5a7a,0x8a5a3a,0x5a6a4a]),TX.roof,TX.roof,0.5,1.3),0,5.2,0,g);r.rotation.y=Math.PI/4;
 mesh(new THREE.BoxGeometry(1.2,2,0.12),0x5a3a1a,0,1,2.62,g);
 [-1.5,1.5].forEach(wx=>mesh(new THREE.BoxGeometry(0.8,0.8,0.12),winMat,wx,2.3,2.62,g,false));
 const ch=mesh(new THREE.BoxGeometry(0.7,1.6,0.7),triMat(0x8a7a6a,TX.stone,TX.stone,0.6,1.1),1.4,5.6,-1,g);chimneys.push(ch);
 const lp=glow(0xffc870,1.2,0.3);lp.position.set(0.9,2.6,2.8);g.add(lp);LAMPS.push({s:lp,x,z,off:0});}
function lamp(x,z){const y0=gh(x,z),iron=mat(0x2a2a30,{metalness:0.5,roughness:0.5});mesh(new THREE.CylinderGeometry(.17,.23,0.3,8),iron,x,y0+0.15,z);mesh(new THREE.CylinderGeometry(.055,.075,2.9,8),iron,x,y0+1.6,z);mesh(new THREE.BoxGeometry(0.24,0.32,0.24),mat(0x332211,{emissive:0xffb050,emissiveIntensity:0.7}),x,y0+3.15,z,null,false);for(const [ox,oz] of [[-.14,-.14],[.14,-.14],[-.14,.14],[.14,.14]])mesh(new THREE.BoxGeometry(0.035,0.42,0.035),iron,x+ox,y0+3.15,z+oz,null,false);mesh(new THREE.BoxGeometry(0.34,0.04,0.34),iron,x,y0+2.94,z,null,false);const cap=mesh(new THREE.ConeGeometry(0.27,0.24,4),iron,x,y0+3.48,z);cap.rotation.y=Math.PI/4;mesh(new THREE.SphereGeometry(0.04,6,4),iron,x,y0+3.64,z,null,false);const g=glow(0xffc870,2.6,0.2);g.position.set(x,y0+3.15,z);scene.add(g);LAMPS.push({s:g,x,z,off:0});}

