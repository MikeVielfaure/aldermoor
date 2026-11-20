/* ================= L'ATELIER (sur ordinateur : adresse du jeu + « ?atelier ») =================
   v1 : les CRÉATURES. À gauche la liste des fiches, au centre l'aperçu 3D (tourner à la souris, molette = zoom,
   boutons d'animation), à droite la fiche. « Enregistrer » : garde la fiche sur cet ordinateur (le jeu local la voit
   aussitôt) et écrit src/contenu/creatures.json dans le projet (Chrome / Edge : on choisit une fois le dossier
   src/contenu ; Firefox : le fichier est téléchargé, à placer dans src/contenu). « Tester » : ouvre une partie de
   test à côté du groupe. Ensuite : objets, personnages, sorts, lieux, sur le même modèle. */
(function(){if(!/[?&]atelier\b/.test(location.search))return;
 const css=`#atelier{position:fixed;inset:0;z-index:60;display:grid;grid-template-columns:230px 1fr 330px;background:#0d0a1e;color:var(--ink);font:13px Inter,sans-serif}
 #atelier h2{font-family:Cinzel,serif;color:var(--gold);font-size:15px;margin:12px 12px 6px}#at-l,#at-f{overflow:auto;border-right:1px solid rgba(255,255,255,.08);padding-bottom:20px}#at-f{border-right:none;border-left:1px solid rgba(255,255,255,.08);padding:0 12px 20px}
 .at-tabs{display:flex;gap:4px;flex-wrap:wrap;margin:0 10px 8px}.at-tabs b{padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.08);font-weight:600;font-size:11px}.at-tabs b.on{background:var(--gold);color:#241a05}.at-tabs b.off{opacity:.4}
 .at-it{padding:8px 12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05)}.at-it:hover{background:rgba(255,255,255,.05)}.at-it.on{background:rgba(243,207,122,.15)}
 #at-f label{display:block;margin:9px 0 3px;color:var(--mute);font-size:11.5px}#at-f input,#at-f select{width:100%;background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:6px 8px;font:13px Inter,sans-serif}
 #at-f input[type=range]{padding:0}.at-row{display:flex;gap:8px}.at-row>div{flex:1}.at-b{margin:12px 6px 0 0;padding:8px 12px;border-radius:9px;border:none;font:700 12.5px Inter,sans-serif;cursor:pointer}
 #at-c{position:relative}#at-c canvas{width:100%;height:100%;display:block}#at-anim{position:absolute;left:10px;bottom:10px;display:flex;gap:5px;flex-wrap:wrap}#at-anim button{background:rgba(16,12,36,.8);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:5px 9px;cursor:pointer;font:12px Inter,sans-serif}
 #at-msg{position:absolute;left:10px;top:10px;color:var(--mute);font-size:12px;max-width:70%}`;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const box=document.createElement('div');box.id='atelier';document.body.appendChild(box);$('#start').classList.add('hidden');
 box.innerHTML=`<div id="at-l"><h2>🛠 L’Atelier</h2><div class="at-tabs"><b class="on">Créatures</b><b class="off" title="bientôt">Objets</b><b class="off">Personnages</b><b class="off">Sorts</b><b class="off">Lieux</b></div><div id="at-list"></div><div style="padding:10px"><button class="at-b gold" id="at-new">＋ Nouvelle créature</button></div></div>
 <div id="at-c"><canvas id="at-cv"></canvas><div id="at-msg">Glisse pour tourner, molette pour zoomer.</div><div id="at-anim"></div></div><div id="at-f"></div>`;
 // ---------- données ----------
 const local=()=>{try{return JSON.parse(localStorage.getItem(CONT_KEY)||'[]');}catch(e){return [];}};
 let list=contCreatures(),cur=null,dirH=null;
 const blank=()=>({id:'creature-'+Date.now().toString(36),nom:'Nouvelle créature',modele:'yeti',element:'glace',faiblesse:'feu',pv:3,nombre:3,taille:1,comportement:'hostile',tireur:0.3,lieu:'foret',rayon:10,actif:true});
 // ---------- aperçu 3D ----------
 const cv=$('#at-cv'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true});R.outputEncoding=THREE.LinearEncoding;const SC=new THREE.Scene();SC.background=new THREE.Color(0x1a1530);
 const CAM=new THREE.PerspectiveCamera(40,1,0.1,100);SC.add(new THREE.HemisphereLight(0xdde8ff,0x40304a,1.1));const dl=new THREE.DirectionalLight(0xffffff,1.2);dl.position.set(3,5,4);SC.add(dl);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,48).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2a2440,roughness:1}));SC.add(floor);
 let V={o:null,mx:null,A:{},yaw:0.6,dist:4.2,drag:null};
 function size(){const r=$('#at-c').getBoundingClientRect();R.setSize(r.width,r.height,false);CAM.aspect=r.width/Math.max(1,r.height);CAM.updateProjectionMatrix();}addEventListener('resize',size);
 cv.addEventListener('pointerdown',e=>{V.drag=e.clientX;});addEventListener('pointerup',()=>V.drag=null);addEventListener('pointermove',e=>{if(V.drag!==null){V.yaw+=(e.clientX-V.drag)*0.01;V.drag=e.clientX;}});
 cv.addEventListener('wheel',e=>{e.preventDefault();V.dist=clamp(V.dist*Math.exp(e.deltaY*0.001),1.5,12);},{passive:false});
 function show(c){if(V.o)SC.remove(V.o);V.o=null;V.mx=null;$('#at-anim').innerHTML='';$('#at-msg').textContent='Chargement du modèle « '+c.modele+' »…';
  creaTpl(c.modele).then(T=>{if(cur!==c)return;const r=THREE.SkeletonUtils.clone(T.scene),tint=new THREE.Color(0xffffff).lerp(new THREE.Color(ELEM[c.element].c),0.25);
   r.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.map)o.material.map.encoding=THREE.LinearEncoding;o.material.color.copy(tint);o.frustumCulled=false;}});
   const k=1.45/T.h*(c.taille||1);r.scale.setScalar(k);SC.add(r);V.o=r;V.mx=new THREE.AnimationMixer(r);V.A={};for(const n in T.clips)V.A[n]=V.mx.clipAction(T.clips[n]);
   const play=n=>{for(const a of Object.values(V.A))a.stop();if(V.A[n])V.A[n].reset().play();};play(V.A.Idle?'Idle':V.A.Flying?'Flying':Object.keys(V.A)[0]);
   const fr={Idle:'Repos',Walk:'Marche',Flying:'Vol',Bite_Front:'Attaque',HitRecieve:'Coup reçu',Death:'Mort',Dance:'Danse',Jump:'Saut'};
   $('#at-anim').innerHTML=Object.keys(V.A).filter(n=>fr[n]).map(n=>'<button data-a="'+n+'">'+fr[n]+'</button>').join('');$('#at-anim').querySelectorAll('button').forEach(b=>b.onclick=()=>play(b.dataset.a));
   $('#at-msg').textContent=c.nom+' — modèle « '+c.modele+' », '+Object.keys(V.A).length+' animations.';}).catch(()=>{$('#at-msg').textContent='Modèle introuvable : '+c.modele;});}
 let last=performance.now();(function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min(0.05,(now-last)/1000);last=now;if(V.mx)V.mx.update(dt);
  const t=(cur&&cur.taille)||1;CAM.position.set(Math.sin(V.yaw)*V.dist*t,(0.9+0.5*V.dist/4.2)*t,Math.cos(V.yaw)*V.dist*t);CAM.lookAt(0,0.7*t,0); /* la caméra recule avec la taille */R.render(SC,CAM);})();
 // ---------- liste et fiche ----------
 function renderList(){$('#at-list').innerHTML=list.map(c=>'<div class="at-it'+(cur&&cur.id===c.id?' on':'')+'" data-id="'+esc(c.id)+'">'+(c.comportement==='calme'?'🕊 ':'⚔ ')+esc(c.nom)+'<br><span class="mu">'+esc(c.modele)+' · '+esc((LOCBY[c.lieu]||{}).name||c.lieu)+'</span></div>').join('')||'<div class="mu" style="padding:12px">Aucune créature pour l’instant.</div>';
  $('#at-list').querySelectorAll('.at-it').forEach(d=>d.onclick=()=>edit(list.find(c=>c.id===d.dataset.id)));}
 const opt=(arr,v)=>arr.map(([k,n])=>'<option value="'+esc(k)+'"'+(k===v?' selected':'')+'>'+esc(n)+'</option>').join('');
 function edit(c){cur=c;renderList();const els=ELS.map(e=>[e,ELEM[e].n]),lieux=LOCS.filter(L=>LOCBY[L.id]).map(L=>[L.id,(L.x>1500?'Landes · ':'Vallée · ')+L.name]);
  $('#at-f').innerHTML=`<h2>Fiche</h2><label>Nom (au pluriel : c’est un groupe)</label><input id="f-nom" value="${esc(c.nom)}">
  <label>Modèle 3D</label><select id="f-modele">${opt((window.__CATALOGUE||{}).creatures.map(m=>[m,m]),c.modele)}</select>
  <div class="at-row"><div><label>Élément</label><select id="f-element">${opt(els,c.element)}</select></div><div><label>Faiblesse</label><select id="f-faiblesse">${opt(els,c.faiblesse)}</select></div></div>
  <div class="at-row"><div><label>Comportement</label><select id="f-comportement">${opt([['hostile','⚔ hostile'],['calme','🕊 paisible']],c.comportement)}</select></div><div><label>Points de vie</label><input id="f-pv" type="number" min="1" max="30" value="${c.pv}"></div></div>
  <div class="at-row"><div><label>Nombre dans le groupe</label><input id="f-nombre" type="number" min="1" max="12" value="${c.nombre}"></div><div><label>Rayon d’apparition (m)</label><input id="f-rayon" type="number" min="3" max="40" value="${c.rayon}"></div></div>
  <label>Taille : <b id="f-taille-v">${c.taille}</b></label><input id="f-taille" type="range" min="0.5" max="2.5" step="0.1" value="${c.taille}">
  <label>Tireuse (chance d’attaquer de loin) : <b id="f-tireur-v">${Math.round(c.tireur*100)} %</b></label><input id="f-tireur" type="range" min="0" max="1" step="0.1" value="${c.tireur}">
  <label>Lieu d’apparition</label><select id="f-lieu">${opt(lieux,c.lieu)}</select>
  <label><input id="f-actif" type="checkbox" style="width:auto" ${c.actif!==false?'checked':''}> active dans le jeu</label>
  <button class="at-b gold" id="f-save">💾 Enregistrer</button><button class="at-b" id="f-test" style="background:#3a7ad8;color:#fff">▶ Tester dans le jeu</button><button class="at-b" id="f-del" style="background:rgba(255,90,90,.2);color:#ffb0b0">🗑 Supprimer</button>
  <div class="mu" id="f-info" style="margin-top:10px;line-height:1.5"></div>`;
  const up=()=>{c.nom=$('#f-nom').value.trim()||'Créatures';['modele','element','faiblesse','comportement','lieu'].forEach(k=>c[k]=$('#f-'+k).value);['pv','nombre','rayon'].forEach(k=>c[k]=+$('#f-'+k).value);c.taille=+$('#f-taille').value;c.tireur=+$('#f-tireur').value;c.actif=$('#f-actif').checked;
   $('#f-taille-v').textContent=c.taille;$('#f-tireur-v').textContent=Math.round(c.tireur*100)+' %';renderList();};
  $('#at-f').querySelectorAll('input,select').forEach(i=>i.oninput=i.onchange=()=>{const m=c.modele,el=c.element,t=c.taille;up();if(m!==c.modele||el!==c.element||t!==c.taille)show(c);});
  $('#f-save').onclick=()=>save1(c);$('#f-test').onclick=()=>{save1(c,true);window.open(location.pathname+'?test&voir='+encodeURIComponent(c.id),'_blank');};
  $('#f-del').onclick=()=>{list=list.filter(x=>x!==c);cur=null;persist();$('#at-f').innerHTML='';renderList();if(V.o){SC.remove(V.o);V.o=null;}};show(c);}
 function persist(){try{localStorage.setItem(CONT_KEY,JSON.stringify(list));}catch(e){}}
 async function save1(c,quiet){if(!list.includes(c))list.push(c);persist();renderList();const json=JSON.stringify(list,null,1),info=$('#f-info');
  if(window.showDirectoryPicker){try{if(!dirH){dirH=await window.showDirectoryPicker({id:'aldermoor-contenu',mode:'readwrite'});}const fh=await dirH.getFileHandle('creatures.json',{create:true}),w=await fh.createWritable();await w.write(json+'\n');await w.close();
    info.innerHTML='✔ Enregistré dans <b>'+esc(dirH.name)+'/creatures.json</b>. Ce PC la voit déjà ; pour le téléphone, le jeu doit être reconstruit et publié.';return;}catch(e){if(quiet){info.textContent='✔ Gardé sur cet ordinateur (test).';return;}info.textContent='Dossier non choisi : '+e.message;}}
  if(!quiet){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json+'\n'],{type:'application/json'}));a.download='creatures.json';a.click();info.innerHTML='✔ Gardé sur cet ordinateur. Fichier <b>creatures.json</b> téléchargé : place-le dans <b>src/contenu</b> du projet.';}}
 $('#at-new').onclick=()=>{const c=blank();list.push(c);edit(c);};
 setTimeout(()=>{size();renderList();if(list[0])edit(list[0]);},50);
 // l'Atelier ne lance pas la partie : on coupe la boucle du jeu derrière
 window.addEventListener('keydown',e=>e.stopPropagation(),true);
})();
