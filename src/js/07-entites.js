/* ================= ENTITÉS (parchemins, événements, créatures, objets) ================= */
let ENT=[],eid=0;
const G={roll:new THREE.CylinderGeometry(0.09,0.09,0.75,12),rune:new THREE.RingGeometry(0.45,0.58,32).rotateX(-Math.PI/2),orb:new THREE.SphereGeometry(0.3,14,10),cry:new THREE.OctahedronGeometry(0.42),pil:new THREE.CylinderGeometry(0.7,0.7,9,16,1,true),ball:new THREE.SphereGeometry(0.2,12,8),shard:new THREE.ConeGeometry(0.11,0.8,6).rotateX(Math.PI/2)};
function addEnt(kind,x,z,obj,data,ttl){const e={id:++eid,kind,x,z,obj,data,ttl:ttl||Infinity,t:Math.random()*10};obj.position.set(x,gh(x,z),z);scene.add(obj);ENT.push(e);return e;}
function removeEnt(e){scene.remove(e.obj);ENT=ENT.filter(x=>x!==e);}
function normSpell(sp,elDefault){if(!sp||typeof sp!=='object')return genSpell(elDefault);const el=ELS.includes(sp.el)?sp.el:(elDefault||'arcane');const name=String(sp.name||'').slice(0,40)||genSpell(el).name;const pf=POOL.find(x=>x.name.toLowerCase()===name.toLowerCase());const form=FORMS[sp.form]?sp.form:(pf?pf.form:'trait');return {form,id:name.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g,'-'),name,inc:String(sp.inc||sp.incantation||'').slice(0,30)||syll(),el,desc:String(sp.desc||'').slice(0,160)||'Un sort au comportement encore mystérieux.'};}
function syll(){return pick(['Vor','Ael','Thal','Ser','Myr','Ka','Lun','Bri','Os','Fen','Cael','Iri'])+pick(['ion','ara','is','eth','ora','ux','iel','enna','ar','or']);}
const knows=name=>S.spells.some(s=>s.name.toLowerCase()===String(name).toLowerCase());
function genSpell(el,form){
 const scrollNames=ENT.filter(e=>e.kind==='scroll').map(e=>e.data.spell.name);
 const c=POOL.filter(s=>(!el||s.el===el)&&(!form||s.form===form)&&!knows(s.name)&&!scrollNames.includes(s.name));
 if(c.length){const s=pick(c);return {...s,id:s.name.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g,'-')};}
 el=el||pick(ELS);const name=pick(['Écho','Lame','Voile','Sceau','Souffle','Danse','Chant','Spirale','Éclat'])+' '+ELEM[el].a;
 return {form:form||pick(['trait','zone','util']),id:name.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g,'-'),name,inc:syll()+' '+syll(),el,desc:'Une variante '+ELEM[el].a+' transmise de bouche à oreille.'};
}
function spawnScroll(locId,spell,ttl,hidden){const loc=LOCBY[locId]||pick(LOCS);const p=freePoint(loc,7);const g=new THREE.Group();
 const inner=new THREE.Group();inner.position.y=1.1;g.add(inner);const r=mesh(G.roll,mat(0xf0e2c0,{flatShading:false}),0,0,0,inner);r.rotation.z=Math.PI/2;
 const rb=mesh(new THREE.TorusGeometry(0.1,0.025,6,12),mat(ELEM[spell.el].c,{emissive:ELEM[spell.el].c,emissiveIntensity:0.5}),0,0,0,inner);rb.rotation.y=Math.PI/2;
 const rune=new THREE.Mesh(G.rune,basic(ELEM[spell.el].c,{transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));rune.position.y=0.06;g.add(rune);
 const gl=glow(ELEM[spell.el].c,1.8,0.7);gl.position.y=1.1;g.add(gl);
 g.userData={inner,rune};
 const e=addEnt('scroll',p.x,p.z,g,{spell,loc:loc.id,hidden:!!hidden},ttl||300);if(hidden)g.visible=false;return e;}
function spawnEvent(locId,title,desc,need,xp,ttl){const loc=LOCBY[locId]||pick(LOCS);const p=freePoint(loc,4);const col=need&&ELEM[need]?ELEM[need].c:0xffd27a;const g=new THREE.Group();
 const pil=new THREE.Mesh(G.pil,basic(col,{transparent:true,opacity:0.14,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));pil.position.y=4.5;g.add(pil);
 const lb=label('! '+title,'#ffd27a');lb.position.y=4.4;g.add(lb);
 return addEnt('event',p.x,p.z,g,{title,desc,need:ELS.includes(need)?need:null,xp:clamp(+xp||25,5,120),loc:loc.id,col},ttl||420);}
function spawnCreatures(locId,name,count,weak,look){const loc=LOCBY[locId]||pick(LOCS);count=clamp(+count||3,1,4);weak=ELS.includes(weak)?weak:pick(ELS);look=ELS.includes(look)?look:pick(ELS);
 for(let i=0;i<count;i++){const p=freePoint(loc,6);const e=spawnCreatureAt(p.x,p.z,name,weak,look,2);e.data.loc=loc.id;e.ttl=420;}}
function spawnQuestItem(q,step){if(ENT.some(e=>e.kind==='item'&&e.data.qid===q.id))return;const loc=LOCBY[step.loc]||pick(LOCS);step.loc=loc.id;const p=freePoint(loc,6);const g=new THREE.Group();const c=mesh(G.cry,mat(0xffd27a,{emissive:0xffa020,emissiveIntensity:0.6,metalness:0.4,roughness:0.3}),0,1.2,0,g);c.userData.spin=true;const gl=glow(0xffd27a,2,0.8);gl.position.y=1.2;g.add(gl);addEnt('item',p.x,p.z,g,{qid:q.id,item:step.item});}

