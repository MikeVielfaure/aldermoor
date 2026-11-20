/* ================= L'ATELIER (sur ordinateur : adresse du jeu + « ?atelier ») =================
   Onglets : CRÉATURES (fiche, aperçu 3D animé, import de modèles .glb, animations, attaques), SORTS (variantes de sorts
   avec effets), MONDE (carte : lieux et portails, clic pour placer). Barre « IA » : une phrase → ton Claude remplit la
   fiche (clé du Maître du Jeu IA de cet ordinateur), tu relis puis tu enregistres.
   Enregistrer : la fiche est gardée sur cet ordinateur (le jeu local la voit aussitôt) et écrite dans le projet
   (Chrome / Edge : on choisit une fois le dossier du projet « aldermoor-projet » ; il est retenu) :
   src/contenu/<type>.json, et les modèles importés dans src/assets/creatures (+ dist/assets pour tester sans reconstruire).
   Firefox : les fichiers sont téléchargés, à ranger à la main. « Tester » : ouvre une partie de test au bon endroit. */
(function(){if(!/[?&]atelier\b/.test(location.search))return;
 const css=`#atelier{position:fixed;inset:0;z-index:60;display:grid;grid-template-columns:240px 1fr 340px;grid-template-rows:1fr auto;background:#0d0a1e;color:var(--ink);font:13px Inter,sans-serif}
 #atelier h2{font-family:Cinzel,serif;color:var(--gold);font-size:15px;margin:12px 12px 6px}#at-l,#at-f{overflow:auto;padding-bottom:20px}#at-l{border-right:1px solid rgba(255,255,255,.08);grid-row:1/3}#at-f{border-left:1px solid rgba(255,255,255,.08);padding:0 12px 20px;grid-row:1/3;grid-column:3}
 .at-tabs{display:flex;gap:4px;flex-wrap:wrap;margin:0 10px 8px}.at-tabs b{padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.08);font-weight:600;font-size:11.5px;cursor:pointer}.at-tabs b.on{background:var(--gold);color:#241a05}.at-tabs b.off{opacity:.35;cursor:default}
 .at-it{padding:8px 12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05)}.at-it:hover{background:rgba(255,255,255,.05)}.at-it.on{background:rgba(243,207,122,.15)}
 #at-f label{display:block;margin:9px 0 3px;color:var(--mute);font-size:11.5px}#at-f input,#at-f select,#at-f textarea,#at-ia input{width:100%;background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:6px 8px;font:13px Inter,sans-serif}
 #at-f input[type=range]{padding:0}#at-f input[type=checkbox]{width:auto}.at-row{display:flex;gap:8px}.at-row>div{flex:1}.at-b{margin:10px 6px 0 0;padding:8px 12px;border-radius:9px;border:none;font:700 12.5px Inter,sans-serif;cursor:pointer}
 #at-c{position:relative;grid-column:2}#at-c canvas{width:100%;height:100%;display:block}#at-anim{position:absolute;left:10px;bottom:10px;display:flex;gap:5px;flex-wrap:wrap}#at-anim button{background:rgba(16,12,36,.8);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:5px 9px;cursor:pointer;font:12px Inter,sans-serif}
 #at-msg{position:absolute;left:10px;top:10px;color:var(--mute);font-size:12px;max-width:75%}#at-ia{grid-column:2;display:flex;gap:8px;padding:8px;border-top:1px solid rgba(255,255,255,.08)}#at-ia button{white-space:nowrap}.at-sec{color:var(--gold);font:700 12px Cinzel,serif;margin:16px 0 0}`;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const box=document.createElement('div');box.id='atelier';document.body.appendChild(box);$('#start').classList.add('hidden');
 box.innerHTML=`<div id="at-l"><h2>🛠 L’Atelier</h2><div class="at-tabs" id="at-tabs"></div><div id="at-list"></div><div style="padding:10px" id="at-news"></div><div class="mu" id="at-dir" style="padding:0 12px;line-height:1.5"></div></div>
 <div id="at-c"><canvas id="at-cv"></canvas><canvas id="at-map" style="display:none;cursor:crosshair"></canvas><div id="at-msg"></div><div id="at-anim"></div></div>
 <div id="at-ia"><input id="at-ia-in" placeholder="✨ Décris ce que tu veux créer, l’IA remplit la fiche (ex. : « un loup des glaces très agressif qui crache du givre dans les Landes »)"><button class="at-b gold" id="at-ia-go" style="margin:0">Créer avec l’IA</button></div><div id="at-f"></div>`;
 /* ---------- dossier du projet (retenu dans IndexedDB) ---------- */
 let ROOT=null;const idb=(mode,fn)=>new Promise(res=>{const r=indexedDB.open('aldermoor-atelier',1);r.onupgradeneeded=()=>r.result.createObjectStore('h');r.onsuccess=()=>{const t=r.result.transaction('h',mode),s=t.objectStore('h');const q=fn(s);q.onsuccess=()=>res(q.result);q.onerror=()=>res(null);};r.onerror=()=>res(null);});
 idb('readonly',s=>s.get('root')).then(h=>{if(h){ROOT=h;dirInfo();}});
 function dirInfo(){$('#at-dir').innerHTML=window.showDirectoryPicker?(ROOT?'📁 Projet : <b>'+esc(ROOT.name)+'</b>':'📁 Le dossier du projet sera demandé au premier enregistrement.'):'🦊 Firefox : les fichiers seront téléchargés.';}dirInfo();
 async function root(){if(!window.showDirectoryPicker)return null;if(ROOT){if(await ROOT.queryPermission({mode:'readwrite'})==='granted')return ROOT;if(await ROOT.requestPermission({mode:'readwrite'})==='granted')return ROOT;}
  const h=await window.showDirectoryPicker({id:'aldermoor-projet',mode:'readwrite'});try{await h.getDirectoryHandle('src');}catch(e){alert('Choisis le dossier du projet « aldermoor-projet » (celui qui contient src).');return null;}ROOT=h;idb('readwrite',s=>s.put(h,'root'));dirInfo();return h;}
 async function writeTo(path,data){const h=await root();if(!h)return false;const parts=path.split('/');let d=h;for(const p of parts.slice(0,-1)){try{d=await d.getDirectoryHandle(p,{create:p!=='dist'});}catch(e){return false;}}const f=await d.getFileHandle(parts[parts.length-1],{create:true}),w=await f.createWritable();await w.write(data);await w.close();return true;}
 const download=(name,data)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data]));a.download=name;a.click();};
 /* ---------- aperçu 3D ---------- */
 const cv=$('#at-cv'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true});R.outputEncoding=THREE.LinearEncoding;const SC=new THREE.Scene();SC.background=new THREE.Color(0x1a1530);
 const CAM=new THREE.PerspectiveCamera(40,1,0.1,100);SC.add(new THREE.HemisphereLight(0xdde8ff,0x40304a,1.1));const dl=new THREE.DirectionalLight(0xffffff,1.2);dl.position.set(3,5,4);SC.add(dl);
 SC.add(new THREE.Mesh(new THREE.CircleGeometry(2.4,48).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2a2440,roughness:1})));
 const V={o:null,mx:null,A:{},yaw:0.6,dist:4.2,drag:null,size:1};let TAB='creatures',cur=null;
 function size(){const r=$('#at-c').getBoundingClientRect();R.setSize(r.width,r.height,false);CAM.aspect=r.width/Math.max(1,r.height);CAM.updateProjectionMatrix();const m=$('#at-map');m.width=r.width;m.height=r.height;if(TAB==='monde')drawMap();}addEventListener('resize',size);
 cv.addEventListener('pointerdown',e=>{V.drag=e.clientX;});addEventListener('pointerup',()=>V.drag=null);addEventListener('pointermove',e=>{if(V.drag!==null){V.yaw+=(e.clientX-V.drag)*0.01;V.drag=e.clientX;}});
 cv.addEventListener('wheel',e=>{e.preventDefault();V.dist=clamp(V.dist*Math.exp(e.deltaY*0.001),1.5,12);},{passive:false});
 const clear3d=()=>{if(V.o)SC.remove(V.o);V.o=null;V.mx=null;$('#at-anim').innerHTML='';};
 let last=performance.now();(function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min(0.05,(now-last)/1000);last=now;if(V.mx)V.mx.update(dt);if(V.spin&&V.o)V.o.rotation.y+=dt;
  const t=V.size;CAM.position.set(Math.sin(V.yaw)*V.dist*t,(0.9+0.5*V.dist/4.2)*t,Math.cos(V.yaw)*V.dist*t);CAM.lookAt(0,0.7*t,0);if(TAB!=='monde')R.render(SC,CAM);})();
 /* ---------- les types de fiches ---------- */
 const els=()=>ELS.map(e=>[e,ELEM[e].n]),lieux=()=>LOCS.filter(L=>LOCBY[L.id]).map(L=>[L.id,(L.x>1500?'Landes · ':'Vallée · ')+L.name]);
 const opt=(arr,v)=>arr.map(([k,n])=>'<option value="'+esc(k)+'"'+(String(k)===String(v)?' selected':'')+'>'+esc(n)+'</option>').join('');
 const uid=p=>p+'-'+Date.now().toString(36);
 const TYPES={
  creatures:{t:'Créatures',key:CONT_KEY,file:'creatures.json',news:[['＋ Nouvelle créature',()=>({id:uid('creature'),nom:'Nouvelles créatures',modele:'yeti',element:'glace',faiblesse:'feu',pv:3,nombre:3,taille:1,comportement:'hostile',tireur:0.3,lieu:'foret',rayon:10,actif:true,rotY:0,vol:false,anims:{},attaque:{morsure:5,tir:6,cadence:3.5,portee:15,vitesse:11,effet:'aucun'}})]],
   item:c=>(c.comportement==='calme'?'🕊 ':'⚔ ')+esc(c.nom)+'<br><span class="mu">'+esc(c.modele)+' · '+esc((LOCBY[c.lieu]||{}).name||c.lieu)+'</span>',test:c=>'?test&voir='+encodeURIComponent(c.id)},
  sorts:{t:'Sorts',key:CONT_SKEY,file:'sorts.json',news:[['＋ Nouveau sort',()=>({id:uid('sort'),nom:'Nouveau sort',incantation:'Incantatem',description:'',element:'feu',forme:'trait',effet:'explosion',cout:20,recharge:1.5,puissance:1,obtention:'depart',lieu:'cour'})]],
   item:c=>esc(c.nom)+'<br><span class="mu">'+esc(ELEM[c.element].n)+' · '+({trait:'attaque',zone:'zone',util:'utilitaire'})[c.forme]+' · '+esc(c.effet)+'</span>',test:c=>'?test&sort='+encodeURIComponent(c.id)},
  monde:{t:'Monde',key:CONT_MKEY,file:'monde.json',news:[['＋ Nouveau lieu',()=>({id:uid('lieu'),type:'lieu',nom:'Nouveau lieu',x:20,z:20,rayon:10,style:'campagne',repere:true})],['＋ Nouveau portail',()=>({id:uid('portail'),type:'portail',nom:'Portail',ax:10,az:10,bx:1900,bz:0,couleur:'#b48cff'})]],
   item:c=>(c.type==='portail'?'🌀 ':'📍 ')+esc(c.nom)+'<br><span class="mu">'+(c.type==='portail'?'('+Math.round(c.ax)+','+Math.round(c.az)+') ↔ ('+Math.round(c.bx)+','+Math.round(c.bz)+')':(c.x>1500?'Landes':'Vallée')+' · '+(c.style||'aucun'))+'</span>',test:c=>c.type==='lieu'?'?test&lieu='+encodeURIComponent(c.id):'?test&pos='+Math.round(c.ax+3)+','+Math.round(c.az+3)},
  persos:{t:'Personnages',off:true},objets:{t:'Objets',off:true}};
 const lists={};for(const k in TYPES)if(TYPES[k].key){try{lists[k]=JSON.parse(localStorage.getItem(TYPES[k].key)||'null');}catch(e){}if(!lists[k])lists[k]=k==='creatures'?contCreatures():k==='sorts'?contSpellsList():contWorldList();}
 function tabs(){$('#at-tabs').innerHTML=Object.entries(TYPES).map(([k,T])=>'<b data-t="'+k+'" class="'+(k===TAB?'on':'')+(T.off?' off':'')+'"'+(T.off?' title="bientôt"':'')+'>'+T.t+'</b>').join('');
  $('#at-tabs').querySelectorAll('b').forEach(b=>b.onclick=()=>{if(TYPES[b.dataset.t].off)return;TAB=b.dataset.t;cur=null;$('#at-f').innerHTML='';clear3d();tabs();renderList();size();});
  $('#at-news').innerHTML=(TYPES[TAB].news||[]).map((n,i)=>'<button class="at-b gold" data-n="'+i+'">'+n[0]+'</button>').join('')+(TAB==='creatures'?'<button class="at-b" id="at-imp" style="background:#3a7ad8;color:#fff">📥 Importer un modèle</button><input type="file" id="at-file" accept=".glb" style="display:none">':'');
  $('#at-news').querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{const c=TYPES[TAB].news[+b.dataset.n][1]();lists[TAB].push(c);edit(c);});
  if($('#at-imp')){$('#at-imp').onclick=()=>$('#at-file').click();$('#at-file').onchange=e=>importModel(e.target.files[0]);}
  const map=TAB==='monde';cv.style.display=map?'none':'block';$('#at-map').style.display=map?'block':'none';$('#at-msg').textContent=map?'Clique sur la carte pour placer le lieu sélectionné (ou les deux bouts d’un portail).':'Glisse pour tourner, molette pour zoomer.';}
 function renderList(){const L=lists[TAB],T=TYPES[TAB];$('#at-list').innerHTML=L.map(c=>'<div class="at-it'+(cur&&cur.id===c.id?' on':'')+'" data-id="'+esc(c.id)+'">'+T.item(c)+'</div>').join('')||'<div class="mu" style="padding:12px">Rien pour l’instant.</div>';
  $('#at-list').querySelectorAll('.at-it').forEach(d=>d.onclick=()=>edit(L.find(c=>c.id===d.dataset.id)));if(TAB==='monde')drawMap();}
 /* ---------- formulaires ---------- */
 const F={
  creatures:c=>{const A=c.attaque||(c.attaque={}),an=c.anims||(c.anims={});const clips=Object.keys(V.A||{});const aopt=v=>'<option value="">(auto)</option>'+clips.map(n=>'<option'+(n===v?' selected':'')+'>'+esc(n)+'</option>').join('');
   return `<label>Nom (au pluriel : c’est un groupe)</label><input data-k="nom" value="${esc(c.nom)}"><label>Modèle 3D</label><select data-k="modele">${opt((window.__CATALOGUE||{}).creatures.map(m=>[m,m]),c.modele)}</select>
   <div class="at-row"><div><label>Élément</label><select data-k="element">${opt(els(),c.element)}</select></div><div><label>Faiblesse</label><select data-k="faiblesse">${opt(els(),c.faiblesse)}</select></div></div>
   <div class="at-row"><div><label>Comportement</label><select data-k="comportement">${opt([['hostile','⚔ hostile'],['calme','🕊 paisible']],c.comportement)}</select></div><div><label>Points de vie</label><input data-k="pv" data-n type="number" min="1" max="60" value="${c.pv}"></div></div>
   <div class="at-row"><div><label>Nombre</label><input data-k="nombre" data-n type="number" min="1" max="12" value="${c.nombre}"></div><div><label>Rayon (m)</label><input data-k="rayon" data-n type="number" min="3" max="40" value="${c.rayon}"></div></div>
   <label>Taille : ${c.taille}</label><input data-k="taille" data-n type="range" min="0.4" max="3" step="0.1" value="${c.taille}"><label>Lieu d’apparition</label><select data-k="lieu">${opt(lieux(),c.lieu)}</select>
   <div class="at-row"><div><label>Tourner le modèle (°)</label><input data-k="rotY" data-n type="number" step="15" value="${c.rotY||0}"></div><div><label><input data-k="vol" type="checkbox" ${c.vol?'checked':''}> vole</label><label><input data-k="actif" type="checkbox" ${c.actif!==false?'checked':''}> active</label></div></div>
   <div class="at-sec">⚔ Attaques</div><div class="at-row"><div><label>Morsure (dégâts)</label><input data-a="morsure" type="number" min="0" max="60" value="${A.morsure??5}"></div><div><label>Tir (dégâts)</label><input data-a="tir" type="number" min="0" max="60" value="${A.tir??6}"></div></div>
   <label>Chance de tirer de loin : ${Math.round((c.tireur||0)*100)} %</label><input data-k="tireur" data-n type="range" min="0" max="1" step="0.1" value="${c.tireur}">
   <div class="at-row"><div><label>Cadence (s)</label><input data-a="cadence" type="number" min="0.5" max="10" step="0.5" value="${A.cadence??3.5}"></div><div><label>Portée (m)</label><input data-a="portee" type="number" min="5" max="40" value="${A.portee??15}"></div><div><label>Vitesse</label><input data-a="vitesse" type="number" min="4" max="40" value="${A.vitesse??11}"></div></div>
   <label>Effet sur toi</label><select data-a="effet">${opt([['aucun','aucun'],['brulure','🔥 brûlure'],['poison','☠ poison'],['gel','❄ gel (ralentit)'],['repousse','💨 repousse']],A.effet||'aucun')}</select>
   <div class="at-sec">🎞 Animations du modèle</div><div class="mu">Pour les modèles importés : quelle animation joue quoi (sinon deviné).</div>
   <div class="at-row"><div><label>Repos</label><select data-m="Idle">${aopt(an.Idle)}</select></div><div><label>Marche</label><select data-m="Walk">${aopt(an.Walk)}</select></div></div>
   <div class="at-row"><div><label>Attaque</label><select data-m="Bite_InPlace">${aopt(an.Bite_InPlace)}</select></div><div><label>Mort</label><select data-m="Death">${aopt(an.Death)}</select></div></div>
   <div class="at-row"><div><label>Coup reçu</label><select data-m="HitRecieve">${aopt(an.HitRecieve)}</select></div><div><label>Vol</label><select data-m="Flying">${aopt(an.Flying)}</select></div></div>`;},
  sorts:c=>{const eff={trait:[['aucun','aucun'],['explosion','💥 explosion'],['multi','🔱 multi (3 projectiles)'],['rebond','⚡ rebond (3 cibles)']],zone:[['aucun','aucun'],['grande','◎ grande zone'],['attire','🌀 attire'],['souffle','💨 souffle']],util:[['plateforme','🧱 plateforme'],['teleport','✨ téléportation'],['soin','💚 soin'],['bouclier','🛡 bouclier'],['bond','🦘 bond']]}[c.forme]||[];
   return `<label>Nom</label><input data-k="nom" value="${esc(c.nom)}"><label>Incantation</label><input data-k="incantation" value="${esc(c.incantation||'')}"><label>Description</label><input data-k="description" value="${esc(c.description||'')}">
   <div class="at-row"><div><label>Élément</label><select data-k="element">${opt(els(),c.element)}</select></div><div><label>Forme</label><select data-k="forme">${opt([['trait','➶ attaque'],['zone','◎ zone'],['util','✧ utilitaire']],c.forme)}</select></div></div>
   <label>Effet</label><select data-k="effet">${opt(eff,c.effet)}</select><div class="at-row"><div><label>Coût (mana)</label><input data-k="cout" data-n type="number" min="0" max="150" value="${c.cout}"></div><div><label>Recharge (s)</label><input data-k="recharge" data-n type="number" min="0.2" max="60" step="0.1" value="${c.recharge}"></div></div>
   <label>Puissance : ×${c.puissance}</label><input data-k="puissance" data-n type="range" min="0.5" max="3" step="0.1" value="${c.puissance}">
   <div class="at-row"><div><label>Obtention</label><select data-k="obtention">${opt([['depart','connu dès le départ'],['parchemin','parchemin à trouver']],c.obtention)}</select></div><div><label>Lieu du parchemin</label><select data-k="lieu">${opt(lieux(),c.lieu)}</select></div></div>`;},
  monde:c=>c.type==='portail'?`<label>Nom</label><input data-k="nom" value="${esc(c.nom)}"><label>Couleur</label><input data-k="couleur" type="color" value="${esc(c.couleur||'#b48cff')}"><div class="mu" style="margin-top:8px">Clique sur la carte : 1er clic = arche A, 2e clic = arche B (prochain : <b id="f-ab">${PORT_AB}</b>).</div>
   <div class="at-row"><div><label>A : x</label><input data-k="ax" data-n type="number" value="${Math.round(c.ax)}"></div><div><label>A : z</label><input data-k="az" data-n type="number" value="${Math.round(c.az)}"></div></div><div class="at-row"><div><label>B : x</label><input data-k="bx" data-n type="number" value="${Math.round(c.bx)}"></div><div><label>B : z</label><input data-k="bz" data-n type="number" value="${Math.round(c.bz)}"></div></div>`
   :`<label>Nom</label><input data-k="nom" value="${esc(c.nom)}"><div class="at-row"><div><label>x</label><input data-k="x" data-n type="number" value="${Math.round(c.x)}"></div><div><label>z</label><input data-k="z" data-n type="number" value="${Math.round(c.z)}"></div><div><label>Rayon</label><input data-k="rayon" data-n type="number" min="4" max="40" value="${c.rayon}"></div></div>
   <label>Décor automatique</label><select data-k="style">${opt([['aucun','aucun']].concat(Object.keys(DECOR_STYLES).map(k=>[k,k])),c.style||'aucun')}</select><label><input data-k="repere" type="checkbox" ${c.repere!==false?'checked':''}> pierre-repère lumineuse</label>
   <div class="mu" style="margin-top:8px">Clique sur la carte pour placer le lieu. Le relief reste celui du monde actuel ; les nouvelles régions viendront ensuite.</div>`};
 let PORT_AB='A';
 function edit(c){cur=c;renderList();const T=TYPES[TAB];
  $('#at-f').innerHTML='<h2>Fiche</h2>'+F[TAB](c)+'<div><button class="at-b gold" id="f-save">💾 Enregistrer</button><button class="at-b" id="f-test" style="background:#3a7ad8;color:#fff">▶ Tester dans le jeu</button><button class="at-b" id="f-del" style="background:rgba(255,90,90,.2);color:#ffb0b0">🗑</button></div><div class="mu" id="f-info" style="margin-top:10px;line-height:1.5"></div>';
  $('#at-f').querySelectorAll('[data-k],[data-a],[data-m]').forEach(i=>i.oninput=i.onchange=()=>{const v=i.type==='checkbox'?i.checked:(i.dataset.n!==undefined||i.type==='number'||i.type==='range')?+i.value:i.value;
   if(i.dataset.k)c[i.dataset.k]=v;if(i.dataset.a)(c.attaque=c.attaque||{})[i.dataset.a]=i.type==='number'?+i.value:i.value;if(i.dataset.m)(c.anims=c.anims||{})[i.dataset.m]=i.value||undefined;
   renderList();if(['modele','element','taille','rotY'].includes(i.dataset.k)||i.dataset.k==='forme'){if(i.dataset.k==='forme'){c.effet=({trait:'explosion',zone:'grande',util:'plateforme'})[c.forme];edit(c);}else preview(c);}if(i.type==='range')$('#at-f').querySelectorAll('label').forEach(()=>{});});
  $('#f-save').onclick=()=>save1(c);$('#f-test').onclick=async()=>{await save1(c,true);window.open(location.pathname+T.test(c),'_blank');};
  $('#f-del').onclick=()=>{lists[TAB]=lists[TAB].filter(x=>x!==c);cur=null;persist();$('#at-f').innerHTML='';renderList();clear3d();};preview(c);}
 function preview(c){V.spin=false;if(TAB==='creatures'){clear3d();V.size=c.taille||1;$('#at-msg').textContent='Chargement du modèle « '+c.modele+' »…';
   creaTpl(c.modele).then(T=>{if(cur!==c)return;const r=THREE.SkeletonUtils.clone(T.scene),tint=new THREE.Color(0xffffff).lerp(new THREE.Color(ELEM[c.element].c),0.25);
    r.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.map)o.material.map.encoding=THREE.LinearEncoding;if(o.material.color)o.material.color.copy(tint);o.frustumCulled=false;}});
    r.scale.setScalar(1.45/T.h*(c.taille||1));r.rotation.y=(c.rotY||0)*Math.PI/180;SC.add(r);V.o=r;V.mx=new THREE.AnimationMixer(r);V.A={};for(const n in T.clips)V.A[n]=V.mx.clipAction(T.clips[n]);
    const names=Object.keys(V.A),play=n=>{for(const a of Object.values(V.A))a.stop();if(V.A[n])V.A[n].reset().play();};play((c.anims&&c.anims.Idle)||names.find(n=>/idle/i.test(n))||names[0]);
    $('#at-anim').innerHTML=names.slice(0,14).map(n=>'<button data-a="'+esc(n)+'">'+esc(n)+'</button>').join('');$('#at-anim').querySelectorAll('button').forEach(b=>b.onclick=()=>play(b.dataset.a));
    $('#at-msg').textContent=c.nom+' — « '+c.modele+' », '+names.length+' animations.';if(names.length&&!$('#at-f').querySelector('[data-m] option:nth-child(2)'))edit(c); /* remplit les listes d’animations (une seule fois) */}).catch(()=>{$('#at-msg').textContent='Modèle introuvable : '+c.modele;});}
  else if(TAB==='sorts'){clear3d();V.size=1;const col=ELEM[c.element].c,g=new THREE.Group();g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.35,2),new THREE.MeshBasicMaterial({color:col})));const gl=glow(col,2.5,0.9);g.add(gl);g.position.y=0.9;SC.add(g);V.o=g;V.spin=true;
   $('#at-msg').textContent='« '+(c.incantation||c.nom)+' » — '+ELEM[c.element].n+', '+({trait:'attaque',zone:'zone',util:'utilitaire'})[c.forme]+', effet : '+c.effet+'. Teste-le pour le voir en action.';}}
 /* ---------- carte du monde ---------- */
 const MAPR={v:{x:0,z:0,r:92,n:'Vallée d’Aldermoor'},l:{x:2000,z:0,r:168,n:'Landes d’Ombrelune'}};
 function mapT(){const m=$('#at-map'),W=m.width,H=m.height,s=Math.min((W-60)/(2*92+2*168+40),(H-40)/(2*168));const ox=30+92*s,lx=30+(2*92+40+168)*s,cy=H/2;return {s,P:(x,z)=>x>1500?[lx+(x-2000)*s,cy+z*s]:[ox+x*s,cy+z*s],U:(px,py)=>{const dv=Math.hypot(px-ox,py-cy)/s,dl=Math.hypot(px-lx,py-cy)/s;return dl<dv?{x:2000+(px-lx)/s,z:(py-cy)/s}:{x:(px-ox)/s,z:(py-cy)/s};}};}
 function drawMap(){const m=$('#at-map'),g=m.getContext('2d'),{s,P}=mapT();g.fillStyle='#0d0a1e';g.fillRect(0,0,m.width,m.height);
  for(const k in MAPR){const Z=MAPR[k],[x,y]=P(Z.x,Z.z);g.fillStyle=k==='v'?'#24452a':'#2f3a28';g.beginPath();g.arc(x,y,Z.r*s,0,TAU);g.fill();g.fillStyle='#b9b2d8';g.font='600 12px Inter';g.fillText(Z.n,x-50,y-Z.r*s-8);}
  g.font='11px Inter';for(const L of LOCS){if(L.atelier)continue;const [x,y]=P(L.x,L.z);g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(x,y,3,0,TAU);g.fill();g.fillText(L.name,x+5,y+3);}
  for(const c of lists.monde){const on=cur===c;if(c.type==='portail'){const a=P(c.ax,c.az),b=P(c.bx,c.bz);g.strokeStyle=c.couleur||'#b48cff';g.setLineDash([6,5]);g.lineWidth=on?2.5:1.5;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.setLineDash([]);
    for(const [p,t] of [[a,'A'],[b,'B']]){g.fillStyle=c.couleur||'#b48cff';g.beginPath();g.arc(p[0],p[1],on?7:5,0,TAU);g.fill();g.fillStyle='#fff';g.fillText(t,p[0]-3,p[1]+4);}}
   else{const [x,y]=P(c.x,c.z);g.strokeStyle='#f3cf7a';g.lineWidth=on?2.5:1.2;g.beginPath();g.arc(x,y,Math.max(4,c.rayon*s),0,TAU);g.stroke();g.fillStyle='#f3cf7a';g.fillText('📍 '+c.nom,x+6,y-6);}}}
 $('#at-map').addEventListener('click',e=>{if(!cur||TAB!=='monde')return;const r=e.target.getBoundingClientRect(),{U}=mapT(),w=U(e.clientX-r.left,e.clientY-r.top);w.x=Math.round(w.x);w.z=Math.round(w.z);
  if(cur.type==='portail'){if(PORT_AB==='A'){cur.ax=w.x;cur.az=w.z;PORT_AB='B';}else{cur.bx=w.x;cur.bz=w.z;PORT_AB='A';}}else{cur.x=w.x;cur.z=w.z;}edit(cur);});
 /* ---------- enregistrer ---------- */
 function persist(){try{localStorage.setItem(TYPES[TAB].key,JSON.stringify(lists[TAB]));}catch(e){}}
 async function save1(c,quiet){const T=TYPES[TAB];if(!lists[TAB].includes(c))lists[TAB].push(c);persist();renderList();const json=JSON.stringify(lists[TAB],null,1)+'\n',info=$('#f-info');
  try{if(window.showDirectoryPicker){if(await writeTo('src/contenu/'+T.file,json)){info.innerHTML='✔ Enregistré dans <b>src/contenu/'+T.file+'</b>. Le jeu de ce PC le voit déjà ; pour le téléphone : reconstruire et publier (<b>npm run publier</b>).';return;}}}catch(e){if(quiet){info.textContent='✔ Gardé sur cet ordinateur (test).';return;}info.textContent='Pas enregistré dans le projet : '+e.message;}
  if(!quiet){download(T.file,json);info.innerHTML='✔ Gardé sur cet ordinateur. Fichier <b>'+T.file+'</b> téléchargé : range-le dans <b>src/contenu</b>.';}}
 /* ---------- importer un modèle .glb ---------- */
 async function importModel(file){if(!file)return;const name=file.name.replace(/\.glb$/i,'').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'modele';const buf=await file.arrayBuffer();
  $('#at-msg').textContent='Import de « '+name+' »…';
  try{const g=await new Promise((res,rej)=>new THREE.GLTFLoader().parse(buf.slice(0),'',res,rej));const b=new THREE.Box3().setFromObject(g.scene),c={};g.animations.forEach(a=>c[a.name]=a);CREA_T[name]=Promise.resolve({scene:g.scene,clips:c,h:Math.max(0.1,b.max.y-b.min.y)});}
  catch(e){$('#at-msg').textContent='Ce fichier ne se lit pas : '+e.message+' (il faut un .glb).';return;}
  const cat=window.__CATALOGUE.creatures;if(!cat.includes(name))cat.push(name);let imp=[];try{imp=JSON.parse(localStorage.getItem('aldermoor-atelier-imports')||'[]');}catch(e){}if(!imp.includes(name)){imp.push(name);localStorage.setItem('aldermoor-atelier-imports',JSON.stringify(imp));}
  let ok=false;try{ok=await writeTo('src/assets/creatures/'+name+'.glb',buf);if(ok)await writeTo('dist/assets/creatures/'+name+'.glb',buf).catch(()=>{});}catch(e){}if(!ok&&!window.showDirectoryPicker)download(name+'.glb',buf);
  const c=TYPES.creatures.news[0][1]();c.nom=name.replace(/-/g,' ');c.modele=name;lists.creatures.push(c);edit(c);
  $('#f-info').innerHTML=ok?'✔ Modèle copié dans <b>src/assets/creatures/'+name+'.glb</b> (et dist pour tester tout de suite).':'Modèle chargé pour l’aperçu. Range <b>'+name+'.glb</b> dans src/assets/creatures du projet.';}
 /* ---------- l'IA remplit la fiche ---------- */
 $('#at-ia-go').onclick=async()=>{const q=$('#at-ia-in').value.trim();if(!q)return;const b=$('#at-ia-go');b.disabled=true;b.textContent='L’IA réfléchit…';
  const ctx={creatures:'Une fiche CRÉATURE : {nom (pluriel, français), modele (un de : '+window.__CATALOGUE.creatures.join(', ')+'), element et faiblesse (parmi '+ELS.join(', ')+'), pv (1-30), nombre (1-8), taille (0.5-2.5), comportement ("hostile"|"calme"), tireur (0-1), lieu (id parmi : '+lieux().map(l=>l[0]).join(', ')+'), rayon (5-25), vol (bool), attaque:{morsure (0-30), tir (0-30), cadence (s), portee (m), vitesse, effet ("aucun"|"brulure"|"poison"|"gel"|"repousse")}}.',
   sorts:'Une fiche SORT : {nom, incantation (latin de fantaisie), description (1 phrase), element (parmi '+ELS.join(', ')+'), forme ("trait"|"zone"|"util"), effet (trait : aucun|explosion|multi|rebond ; zone : aucun|grande|attire|souffle ; util : plateforme|teleport|soin|bouclier|bond), cout (5-80), recharge (0.5-20), puissance (0.5-3), obtention ("depart"|"parchemin"), lieu (id parmi : '+lieux().map(l=>l[0]).join(', ')+')}.',
   monde:'Une fiche LIEU : {type:"lieu", nom, x, z, rayon (6-25), style (parmi aucun, '+Object.keys(DECOR_STYLES).join(', ')+'), repere:true} OU PORTAIL : {type:"portail", nom, ax, az, bx, bz, couleur "#rrggbb"}. La vallée est un disque de rayon 88 centré en (0,0) ; les Landes un disque de rayon 160 centré en (2000,0). Lieux existants : '+LOCS.slice(0,40).map(L=>L.id+'('+Math.round(L.x)+','+Math.round(L.z)+')').join(', ')+'.'}[TAB];
  try{const o=await mjCall('Tu es l’assistant de création du jeu Aldermoor (RPG de sorciers, univers original). Réponds UNIQUEMENT par un objet JSON valide, sans texte autour. '+ctx+' Demande du créateur : « '+q+' ».');
   const c=Object.assign(TYPES[TAB].news[TAB==='monde'&&o.type==='portail'?1:0][1](),o);lists[TAB].push(c);edit(c);$('#f-info').innerHTML='✨ Proposé par l’IA : relis la fiche, puis <b>Enregistrer</b>.';}
  catch(e){alert('L’IA n’a pas pu répondre ('+(e.message||e)+'). Branche ta clé Claude dans le jeu : Options ⚙ → Maître du Jeu IA.');}
  b.disabled=false;b.textContent='Créer avec l’IA';};
 tabs();setTimeout(()=>{size();renderList();if(lists[TAB][0])edit(lists[TAB][0]);},60);
 window.addEventListener('keydown',e=>e.stopPropagation(),true);
})();
