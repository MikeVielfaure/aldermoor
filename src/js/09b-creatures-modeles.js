/* ================= CRÉATURES : MODÈLES 3D (Quaternius « Cute Monsters », CC0) =================
   Chaque créature garde son corps fait par le code (boule lumineuse) tant que son modèle n'est pas chargé,
   ou si le fichier manque. Le modèle est choisi d'après le nom (le MJ en invente) puis d'après l'élément,
   et teinté par l'élément. Les feux follets restent des boules de lumière, ça leur va bien. */
const CREA_NOMS=[[/follet/i,null],[/lutin|givre|yéti|yeti/i,'yeti'],[/esprit|spectre|fantôme|fantome|ombre/i,'fantome'],[/farfadet|champignon/i,'champignon'],
 [/étincelle|etincelle|éclat|eclat/i,'alien'],[/golem|gardien/i,'cyclope'],[/chauve/i,'chauvesouris'],[/gelée|gelee|braise|diablotin|démon|demon/i,'demon'],
 [/crabe|crustacé/i,'crabe'],[/arbre|souche|racine|sylv/i,'arbre'],[/crâne|crane|squelette|os\b/i,'crane'],[/dragon|gueule|wyverne/i,'dragon'],[/abeille|guêpe|guepe|frelon/i,'abeille']];
const CREA_ELEM={feu:'demon',glace:'yeti',eau:'crabe',vent:'chauvesouris',nature:'champignon',lumiere:'abeille',ombre:'fantome',arcane:'alien'};
const CREA_VOL={chauvesouris:1,abeille:1,dragon:1}; // ces modèles volent (animation « Flying »)
const CREA_T={}; // nom du modèle → promesse du gabarit {scene, clips, h}
function creaModel(name,look){for(const [re,m] of CREA_NOMS)if(re.test(name||''))return m;return CREA_ELEM[look]||null;}
function creaTpl(m){if(!CREA_T[m])CREA_T[m]=mdlLoad('creatures/'+m+'.glb').then(g=>{const b=new THREE.Box3().setFromObject(g.scene);const c={};g.animations.forEach(a=>c[a.name]=a);return {scene:g.scene,clips:c,h:Math.max(0.1,b.max.y-b.min.y)};});return CREA_T[m];}
function creaDress(e,m,T){const D=e.data;if(!ENT.includes(e)||D.M)return;
 const r=THREE.SkeletonUtils.clone(T.scene),sc=e.obj.scale.x||1,vol=!!CREA_VOL[m];
 const tint=new THREE.Color(0xffffff).lerp(new THREE.Color(ELEM[D.look].c),0.25),mats=[];
 // le jeu n'utilise pas la conversion sRGB : on lit la texture telle quelle, comme les textures peintes du jeu
 r.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.map&&o.material.map.encoding!==THREE.LinearEncoding){o.material.map.encoding=THREE.LinearEncoding;o.material.map.needsUpdate=true;}o.material.needsUpdate=true;o.material.color.copy(tint);o.castShadow=true;o.frustumCulled=false;mats.push(o.material);}});
 const k=(vol?1.1:1.45)/T.h;r.scale.setScalar(k);r.position.y=vol?0.9:0; // l'objet entier est déjà à l'échelle de la créature (sc)
 e.obj.add(r);e.obj.children.forEach(o=>{if(o.isMesh&&o!==r)o.visible=false;});if(D.gl){D.gl.scale.multiplyScalar(0.6);D.gl.material.opacity=0.35;}
 const mx=new THREE.AnimationMixer(r),A={};for(const n in T.clips)A[n]=mx.clipAction(T.clips[n]);
 D.M={r,mx,A,mats,tint,vol,cur:null,lx:e.x,lz:e.z,hp:D.hp,hitT:0};creaPlay(D,vol?'Flying':'Idle');void sc;}
function creaPlay(D,n){const M=D.M,a=M.A[n];if(!a||M.cur===n)return;const old=M.cur&&M.A[M.cur];a.reset().play();if(old)old.crossFadeTo(a,0.2,false);M.cur=n;}
{const _s=spawnCreatureAt;spawnCreatureAt=function(x,z,name,weak,look,hp,extra){const e=_s.apply(this,arguments);
  if(MDL.failed||typeof THREE.GLTFLoader!=='function')return e;const m=creaModel(name,e.data.look);if(!m)return e;
  creaTpl(m).then(T=>creaDress(e,m,T)).catch(()=>{});return e;};}
// animation, couleur (gelée, touchée) et petite attaque quand le joueur est tout près
function creaTick(dt){const cam=camera.position;
 for(const e of ENT){if(e.kind!=='creature')continue;const D=e.data,M=D.M;if(!M)continue;
  if(D.hp<M.hp&&M.A.HitRecieve){const a=M.A.HitRecieve;a.reset();a.setLoop(THREE.LoopOnce,1);a.play();a.crossFadeFrom(M.A[M.cur]||a,0.08,false);M.hitT=0.5;M.cur='HitRecieve';}M.hp=D.hp;
  const col=D.frozen>0?0xcff4ff:null;for(const m of M.mats){if(M.hitT>0.35)m.color.setHex(0xffffff);else if(col)m.color.setHex(col);else m.color.copy(M.tint);if(m.emissive)m.emissive.setHex(M.hitT>0.35?0x553333:0);}
  if(M.hitT>0)M.hitT-=dt;
  else{const v=Math.hypot(e.x-M.lx,e.z-M.lz)/Math.max(dt,1e-3),stuck=D.frozen>0||D.rooted>0,near=Math.hypot(player.x-e.x,player.z-e.z)<1.6;
   creaPlay(D,M.vol?'Flying':near&&M.A.Bite_InPlace?'Bite_InPlace':!stuck&&v>0.4&&M.A.Walk?'Walk':'Idle');}
  M.lx=e.x;M.lz=e.z;
  const far=Math.hypot(e.x-cam.x,e.z-cam.z)>55;if(!far)M.mx.update((D.frozen>0||D.rooted>0)?dt*0.15:dt);}}
{const _w=world4Tick;world4Tick=function(dt){creaTick(dt);return _w.apply(this,arguments);};}
