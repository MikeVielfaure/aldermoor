/* ================= OBJETS ET PERSONNAGES CRÉÉS DANS L'ATELIER =================
   PERSONNAGE : {id, nom, role (personnalité, lue par le Maître du Jeu IA), modele (apprenti, sorcier, clerc…), couleur,
   lieu (sa maison), promenade [lieux], repliques [phrases]}. Ajouté à NPCS avant que buildCharacters les fabrique :
   il vit comme les autres (déplacements, sommeil, dialogue, quêtes, MJ). « ?test&pnj=<id> » : on arrive à côté.
   OBJET : {id, nom, modele (un objet de objets.glb, ou « imp:<nom> » importé dans src/assets/objets-import), x, z,
   rotY, taille, solide, interaction:'aucune'|'coffre'|'message'|'soin'|'mana', texte, butin:{or, essence, cristal}}.
   Coffre : butin une fois par jour. Sources : src/contenu/{persos,objets}.json + localStorage de l'Atelier. */
const CONT_PKEY='aldermoor-atelier-persos',CONT_OKEY='aldermoor-atelier-objets';
function contList(file,key){const base=((window.__CONTENU||{})[file]||[]).slice();let loc=[];try{loc=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}const by={};base.concat(loc).forEach(c=>{if(c&&c.id)by[c.id]=c;});return Object.values(by);}
const CPERSOS=contList('persos',CONT_PKEY),COBJETS=contList('objets',CONT_OKEY);
// personnages : dans les listes du jeu, avant la construction des habitants
CPERSOS.forEach(c=>{if(NPCS.some(n=>n.id===c.id))return;const home=LOCBY[c.lieu]?c.lieu:'village',col=c.couleur?parseInt(String(c.couleur).replace('#',''),16):0x4a5a8a;
 NPCS.push({id:c.id,name:c.nom,role:c.role||'habitant',home,els:[],cl:[home].concat((c.promenade||[]).filter(l=>LOCBY[l])),look:{skin:0xf0c8a0,hair:0x5a3a20,style:'short',hat:col,robe:col,trim:0xd8c8a0,h:1},atelier:true});
 MDL_PERSO[c.id]=[c.modele||'sorcier',col];LINES[c.id]=(c.repliques&&c.repliques.length?c.repliques:['Bonjour, voyageur.']).slice();});
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);const m=/[?&]pnj=([^&]+)/.exec(location.search);if(m){const id=decodeURIComponent(m[1]);setTimeout(()=>{const n=npcs.find(n=>n.d.id===id);if(n){bot0(n.x+2,n.z+2);say('🛠 Test de l’Atelier : voici <b>'+esc(n.d.name)+'</b>. Approche-toi et parle-lui.','gm');}},2000);}return r;};}
// objets : posés quand le fichier d'objets (ou l'objet importé) est chargé
const COBJ={done:false,list:[]};
function cObjTpl(m){if(m&&m.startsWith('imp:'))return mdlLoad('objets-import/'+m.slice(4)+'.glb').then(g=>g.scene);return O3.ready&&O3.tpl[m]?Promise.resolve(O3.tpl[m]):null;}
function cObjBuild(){if(COBJ.done||!COBJETS.length)return;if(!O3.ready&&COBJETS.some(c=>!String(c.modele).startsWith('imp:')))return;COBJ.done=true;
 COBJETS.forEach(c=>{if(!inWorld(c.x,c.z))return;const p=cObjTpl(c.modele);if(!p)return;p.then(T=>{const o=T.clone(true),y=gh(c.x,c.z);o.position.set(c.x,y,c.z);o.rotation.y=(c.rotY||0)*Math.PI/180;o.scale.multiplyScalar(c.taille||1);
  o.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;q.userData.dyn=true;}});scene.add(o);const b=new THREE.Box3().setFromObject(o),r=Math.max(0.3,Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2*0.8);
  if(c.solide!==false)addCol({x:c.x,z:c.z,r,h:b.max.y});COBJ.list.push({c,o});
  if(c.interaction&&c.interaction!=='aucune')station({x:c.x,z:c.z,reach:r+1.6,hint:()=>c.interaction==='coffre'?((S.objLoot||{})[c.id]===S.day?null:'Ouvrir : '+c.nom):c.interaction==='message'?'Lire : '+c.nom:c.interaction==='soin'?'Se soigner : '+c.nom:'Se ressourcer : '+c.nom,act:()=>cObjUse(c)});}).catch(()=>{});});}
function cObjUse(c){if(c.interaction==='message'){say('📜 <b>'+esc(c.nom)+'</b> : '+esc(c.texte||'…'),'gm');return;}
 if(c.interaction==='soin'){if(typeof VIE!=='undefined')VIE.hp=VIE.max;burst(player.x,player.y+1,player.z,0xff7aa0,20,3);say('💚 '+esc(c.nom)+' : te voilà soigné(e).','sys');return;}
 if(c.interaction==='mana'){mana=manaMax();burst(player.x,player.y+1,player.z,0x4a7dff,20,3);say('💧 '+esc(c.nom)+' : ta magie est pleine.','sys');return;}
 if(c.interaction==='coffre'){S.objLoot=S.objLoot||{};if(S.objLoot[c.id]===S.day)return;S.objLoot[c.id]=S.day;const B=c.butin||{or:20};const out=[];if(B.or){gainOr(B.or);out.push(B.or+' 💰');}['essence','cristal','bois','pierre'].forEach(k=>{if(B[k]){addItem(k,B[k]);out.push(B[k]+' '+INGR[k].n.toLowerCase());}});
  sfx('win');burst(c.x,gh(c.x,c.z)+1,c.z,0xffd24a,30,4);say('🎁 '+esc(c.nom)+' : '+(out.join(', ')||'vide…')+'. (Il se remplit chaque jour.)','gm');save();}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{if(!COBJ.done)cObjBuild();}catch(e){}return r;};}
