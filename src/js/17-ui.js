/* ================= UI ================= */
function say(t,type){const f=$('#feed');const d=document.createElement('div');d.className='msg'+(type?' '+type:'');d.innerHTML=t;f.appendChild(d);while(f.children.length>4)f.removeChild(f.firstChild);setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),700);},type==='gm'?9000:6000);}
let aiState='pending',SAMPLE=null,aiUsed=false;
function aiBadge(){const b=$('#ai-badge');if(aiState==='on'){b.textContent='MJ : IA Claude ✦';b.classList.add('on');}else if(aiState==='off'){b.textContent='MJ : classique';b.classList.remove('on');}else b.textContent='MJ : connexion…';}
setTimeout(async()=>{try{if(window.claude&&typeof window.claude.use==='function'){const s=await window.claude.use('sample');if(s){SAMPLE=s;aiState='on';}else aiState='off';}else aiState='off';}catch(e){aiState='off';}aiBadge();},0);
function updateHUD(){
 $('#i-time').textContent='Jour '+S.day+' · '+fmtTime(S.time)+' · '+(S.zone!=='monde'?'🕯':WEATHERS[(S.weather||{w:'clair'}).w].ic);
 $('#i-loc').textContent=(S.zone!=='monde'?ZONES[S.zone].n:S.locId?LOCBY[S.locId].name:'Sur les chemins')+(player.swim?' · 🏊 '+(BUFF.phoque?'':'froid '+Math.floor(player.cold||0)+'/13'):'');
 const L=lvl();$('#i-rank').textContent=rankOf(L).n+' · niveau '+L;
 const into=S.xp%100;$('#i-lvl').textContent=into+'/100 XP · '+Math.floor(mana)+'/'+manaMax()+' mana'+(Object.keys(BUFF).length?' · 🧪 '+Object.keys(BUFF).map(k=>POTIONS[k].n.split(' ').pop()+' '+Math.ceil(BUFF[k])+'s').join(', '):'');
 $('#xp-bar i').style.width=into+'%';
 const f=ptsFree();const bh='Grimoire'+(f>0?'<span class="pts">'+f+'</span>':'');if($('#b-book').innerHTML!==bh)$('#b-book').innerHTML=bh;
 renderSlots();
}
function renderSlots(){const n=rankOf(lvl()).slots;document.querySelectorAll('.slot').forEach(b=>{const i=+b.dataset.s;const sp=i<n?S.spells.find(s=>s.id===S.slots[i]):null;const key=i>=n?'L':sp?sp.id:'E';if(b.dataset.k===key)return;b.dataset.k=key;
 if(i>=n){b.className='cbtn slot empty';b.innerHTML='<span class="ic">🔒</span><span class="nm">'+RANKS.find(r=>r.slots>i).n+'</span>';b.style.borderColor='';b.style.boxShadow='';}
 else if(!sp){b.className='cbtn slot empty';b.innerHTML='<span class="k">'+(i+1)+'</span><span class="ic">+</span><span class="nm">vide</span>';b.style.borderColor='';b.style.boxShadow='';}
 else{const c=hex(ELEM[sp.el].c);b.className='cbtn slot';b.innerHTML='<div class="cd"></div><span class="k">'+(i+1)+'</span><span class="ic" style="color:'+c+'">'+FORMS[sp.form].ic+'</span><span class="nm">'+esc(sp.name)+'</span>';b.style.borderColor=c;b.style.boxShadow='0 0 12px '+c+'44';}});}
function updSlotsFast(){const now=performance.now()/1000;$('#mana-bar i').style.width=(mana/manaMax()*100).toFixed(1)+'%';const n=rankOf(lvl()).slots;
 document.querySelectorAll('.slot').forEach(b=>{const i=+b.dataset.s;if(i>=n)return;const sp=S.spells.find(s=>s.id===S.slots[i]);if(!sp)return;const cd=b.querySelector('.cd');const rem=(CD[sp.id]||0)-now,tot=spellCd(sp);
  if(cd)cd.style.background=rem>0?'conic-gradient(rgba(0,0,0,.62) '+(rem/tot*360).toFixed(0)+'deg, transparent 0)':'none';b.classList.toggle('low',mana<spellCost(sp));});}
function curStep(q){return q.steps[q.cur];}
function trackedQuest(){let q=S.quests.find(x=>x.id===S.track);if(!q)q=S.quests[0];return q;}
function stepTarget(q){const s=curStep(q);if(!s)return null;
 if(s.kind==='talk'){const n=NPCOBJ(s.npc);return n?{x:n.x,z:n.z}:null;}
 if(s.kind==='collect'){const e=ENT.find(e=>e.kind==='item'&&e.data.qid===q.id);if(e)return {x:e.x,z:e.z};}
 const L=LOCBY[s.loc];return L?{x:L.spot.x,z:L.spot.z}:null;}
let beacon;
function makeBeacon(){beacon=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,40,10,1,true),basic(0xf3cf7a,{transparent:true,opacity:0.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));p.position.y=20;beacon.add(p);const r=new THREE.Mesh(new THREE.RingGeometry(1.2,1.5,28).rotateX(-Math.PI/2),basic(0xf3cf7a,{transparent:true,opacity:0.6,depthWrite:false}));r.position.y=0.08;beacon.add(r);scene.add(beacon);}
function updateTracker(){
 const q=trackedQuest();const el=$('#tracker');
 if(!q){el.classList.add('hidden');beacon.visible=false;return;}
 const t=nav(stepTarget(q));el.classList.remove('hidden');$('#tr-q').textContent=q.title;const s=curStep(q);
 let d='';if(t){const dist=Math.hypot(t.x-player.x,t.z-player.z);d=' · '+Math.round(dist)+' m';
  const tx=t.x-player.x,tz=t.z-player.z,fx=Math.sin(camYaw),fz=Math.cos(camYaw);const f=tx*fx+tz*fz,r=tx*(-fz)+tz*fx;$('#arrow').style.transform='rotate('+Math.atan2(r,f)+'rad)';
  beacon.visible=S.zone==='monde';beacon.position.set(t.x,gh(t.x,t.z),t.z);}else beacon.visible=false;
 $('#tr-s').textContent=(s?s.text:'')+d;
}

/* ---------- dialogue ---------- */
let dlgCtx=null;const CHATS={};
function openDlg(ctx){dlgCtx=ctx;$('#dlg').classList.remove('hidden');$('#dlg-log').innerHTML='';
 if(ctx.mode==='talk'){const n=ctx.npc;$('#dlg-title').textContent=n.name;$('#dlg-sub').textContent=n.role+' · humeur : '+moodOf(n.id);
  const h=CHATS[n.id]||(CHATS[n.id]=[]);if(!h.length)h.push({w:'n',t:pick(LINES[n.id])});h.forEach(m=>line(m.w,m.t));
  chips(['Bonjour !','Tu as une mission pour moi ?','Des rumeurs ?','Apprends-moi quelque chose']);
  $('#dlg-in').placeholder='Parle à '+n.name+'…';
 }else{$('#dlg-title').textContent='Maître du Jeu';$('#dlg-sub').textContent='Décris librement ce que tu fais. Le MJ décide de ce qui arrive.';
  line('n','Où que tu sois, le monde t’écoute. Que fais-tu, '+S.name+' ?');
  chips(['J’explore les environs','Je cherche des sorts cachés','Je provoque un événement','Raconte-moi une rumeur','Je médite pour sentir la magie']);
  $('#dlg-in').placeholder='Ex : je grimpe en haut de la tour…';}
 $('#dlg-in').value='';
}
function closeDlg(){$('#dlg').classList.add('hidden');dlgCtx=null;$('#dlg-in').blur();}
function line(w,t){const d=document.createElement('div');d.className='ln '+w;d.textContent=t;$('#dlg-log').appendChild(d);$('#dlg-log').scrollTop=1e6;return d;}
function chips(arr){const c=$('#chips');c.innerHTML='';arr.forEach(a=>{const b=document.createElement('button');b.className='chip';b.textContent=a;b.onclick=()=>send(a);c.appendChild(b);});}
let busy=false;
async function send(text){text=String(text||'').trim();if(!text||busy||!dlgCtx)return;busy=true;$('#dlg-in').value='';
 const ctx=dlgCtx;line('p',text);const w=line('w',aiState==='on'?'Le Maître du Jeu réfléchit…':'…');
 let res;
 if(ctx.mode==='talk'){const h=CHATS[ctx.npc.id];h.push({w:'p',t:text});res=await callGM('talk',{npc:ctx.npc,msg:text,hist:h.slice(-8)});h.push({w:'n',t:res.narration});}
 else{res=await callGM('act',{text});chron('Action libre : '+text);}
 w.remove();
 if(dlgCtx===ctx){line('n',res.narration||'…');applyActions(res.actions,ctx.mode==='talk'?ctx.npc.id:null).forEach(t=>line('s',t));}
 else{say((ctx.mode==='talk'?'<b>'+esc(ctx.npc.name)+'</b> : ':'<b>MJ</b> : ')+esc(res.narration),'gm');applyActions(res.actions,null);}
 busy=false;save();
}
$('#dlg-form').addEventListener('submit',e=>{e.preventDefault();send($('#dlg-in').value);});
$('#dlg-x').onclick=closeDlg;

/* ---------- grimoire / journal ---------- */
let bookTab='sorts';
function openBook(tab){bookTab=tab;$('#book').classList.remove('hidden');renderBook();}
function renderBook(){
 const tabs=[['sorts','Sorts'],['talents','Talents'+(ptsFree()>0?' ('+ptsFree()+')':'')],['combos','Combos'],['quetes','Quêtes'],['sac','Sac'],['alchimie','Alchimie'],['cours','Cours'],['chron','Chronique']];
 $('#book-title').textContent=['sorts','talents','combos'].includes(bookTab)?'Grimoire':'Journal';
 $('#book-tabs').innerHTML=tabs.map(([k,n])=>'<button class="tab'+(k===bookTab?' on':'')+'" data-t="'+k+'">'+n+'</button>').join('');
 $('#book-tabs').querySelectorAll('.tab').forEach(b=>b.onclick=()=>{bookTab=b.dataset.t;renderBook();});
 let h='';const n=rankOf(lvl()).slots;
 if(bookTab==='sorts'){
  h='<div class="setbar"><span>Jeu de sorts :</span><button data-set="0" class="'+(S.setIdx?'':'on')+'">A</button><button data-set="1" class="'+(S.setIdx?'on':'')+'">B</button><span class="mu">⇄ en jeu pour basculer</span></div><div class="mu" style="margin-bottom:6px">Tu modifies le jeu <b>'+(S.setIdx?'B':'A')+'</b>. Place tes sorts dans les emplacements 1 à 4 (boutons sous chaque sort). Rang <b>'+rankOf(lvl()).n+'</b> : '+n+' emplacement'+(n>1?'s':'')+' actif'+(n>1?'s':'')+'. Chaque élément existe en 3 formes : ➶ Attaque, ◎ Zone, ✧ Utilitaire.</div>';
  ELS.forEach(el=>{const list=S.spells.filter(s=>s.el===el);if(!list.length)return;const ml=mLvl(el),xp=(S.mastery[el]||0)%30;
   h+='<div class="sec" style="display:flex;align-items:center;gap:7px"><span class="dot" style="background:'+hex(ELEM[el].c)+'"></span>'+ELEM[el].n+'<span class="badge">maîtrise '+ml+'/10</span></div><div class="mbar"><i style="width:'+(ml>=10?100:xp/30*100)+'%;background:'+hex(ELEM[el].c)+'"></i></div>';
   ['trait','zone','util'].forEach(f=>list.filter(s=>s.form===f).forEach(s=>{const si=S.slots.indexOf(s.id);
    h+='<div class="it'+(si>=0&&si<n?' sel':'')+'"><h4>'+esc(s.name)+'<span class="badge">'+FORMS[f].ic+' '+FORMS[f].n+'</span></h4><i>« '+esc(s.inc)+' »</i> <span class="mu">· '+spellCost(s)+' mana · recharge '+spellCd(s)+' s</span><div>'+esc(s.desc)+'</div><div class="fx">Effet : '+esc(fxOf(s))+'</div><div class="slotpick"><span class="mu">Emplacement :</span>'+[0,1,2,3].map(i=>'<button data-as="'+esc(s.id)+'" data-slot="'+i+'" class="'+(si===i?'on':'')+'"'+(i>=n?' disabled':'')+'>'+(i>=n?'🔒':(i+1))+'</button>').join('')+'</div></div>';}));});
  const missEl=ELS.filter(e=>!S.spells.some(s=>s.el===e));if(missEl.length)h+='<div class="sec">Éléments encore inconnus</div><div class="mu">'+missEl.map(e=>ELEM[e].n).join(' · ')+'</div>';
  const missF=[];ELS.forEach(e=>{if(S.spells.some(s=>s.el===e))['zone','util'].forEach(f=>{if(!S.spells.some(s=>s.el===e&&s.form===f))missF.push(ELEM[e].n+' '+FORMS[f].n.toLowerCase());});});
  if(missF.length)h+='<div class="sec">Formes à découvrir</div><div class="mu">'+missF.join(' · ')+'<br>Cherche les parchemins, suis les cours ou demande aux professeurs.</div>';}
 else if(bookTab==='talents'){const f=ptsFree();
  h='<div class="it"><b style="color:var(--gold);font-size:15px">'+f+' point'+(f>1?'s':'')+' disponible'+(f>1?'s':'')+'</b><div class="mu">1 point par niveau, +1 tous les 3 niveaux de maîtrise d’un élément (lance des sorts de cet élément pour progresser).</div><button class="tbtn" id="t-reset" style="margin-top:7px;background:rgba(255,255,255,.1);color:var(--ink)">Tout réinitialiser</button></div>';
  const row=(id,nm,max,d,req)=>{const r=tal(id);const ok=f>0&&r<max&&(!req||tal(req)>0);return '<div class="it'+(r>0?' sel':'')+'"><h4>'+esc(nm)+'<span class="badge">'+r+'/'+max+'</span></h4><div class="mu">'+esc(d)+(req&&!tal(req)?' <i>(nécessite au moins 1 rang de Puissance)</i>':'')+'</div><button class="tbtn" data-tal="'+id+'"'+(ok?'':' disabled')+' style="margin-top:7px">+1</button></div>';};
  h+='<div class="sec">Sorcier</div>'+TAL_GEN.map(t=>row(t.id,t.n,t.max,t.d)).join('');
  ELS.forEach(el=>{const known=S.spells.some(s=>s.el===el);h+='<div class="sec" style="display:flex;gap:7px;align-items:center;'+(known?'':'opacity:.55')+'"><span class="dot" style="background:'+hex(ELEM[el].c)+'"></span>'+ELEM[el].n+'<span class="badge">maîtrise '+mLvl(el)+'/10</span>'+(known?'':'<span class="badge">élément inconnu</span>')+'</div>';
   h+=row(el+'_pow','Puissance '+ELEM[el].a,3,'+25 % de rayon, de durée et d’efficacité par rang.');
   h+=row(el+'_eco','Économie '+ELEM[el].a,2,'−20 % de mana par rang pour cet élément.');
   h+=row(el+'_u','★ '+UNIQ[el].n,1,UNIQ[el].d,el+'_pow');});}
 else if(bookTab==='combos'){h='<div class="mu" style="margin-bottom:10px">Mélange deux éléments au même endroit, à quelques secondes d’intervalle. Découverts : '+S.combos.length+'/'+COMBOS.length+'.</div>'+COMBOS.map(c=>{const d=S.combos.includes(c.id);return '<div class="it'+(d?' sel':'')+'"><h4>'+(d?'⚡ '+esc(c.n):'???')+(d?'<span class="badge"><span class="dot" style="background:'+hex(ELEM[c.a].c)+'"></span>+<span class="dot" style="background:'+hex(ELEM[c.b].c)+'"></span></span>':'')+'</h4><div class="'+(d?'':'mu')+'">'+esc(d?c.d:'Indice : '+c.hint)+'</div></div>';}).join('');}
 else if(bookTab==='quetes'){if(!S.quests.length)h='<div class="mu">Aucune quête en cours. Parle aux habitants, ou demande au MJ.</div>';
  S.quests.forEach(q=>{h+='<div class="it'+(trackedQuest()===q?' sel':'')+'" data-q="'+q.id+'"><h4>'+esc(q.title)+'</h4><div class="mu">'+esc(q.desc||'')+' — donnée par '+esc((NPCBY[q.giver]||{name:'le MJ'}).name)+'</div>'+q.steps.map((s,i)=>'<div style="opacity:'+(i<q.cur?.45:1)+'">'+(i<q.cur?'✓ ':i===q.cur?'➤ ':'• ')+esc(s.text)+'</div>').join('')+'</div>';});
  {const k=S.karma||0;h+='<div class="sec">Ton âme</div><div class="mu">'+(k>=0?'☀':'🌑')+' '+alignOf(k)+' ('+(k>0?'+':'')+k+')</div><div style="position:relative;height:8px;border-radius:4px;margin:6px 0 4px;background:linear-gradient(90deg,#5a2a8a,#3a3450 50%,#c8a040)"><i style="position:absolute;top:-3px;left:calc('+(50+k/2)+'% - 4px);width:8px;height:14px;border-radius:3px;background:#fff"></i></div><div class="mu" style="font-size:11px">Aider, réparer, protéger éclaire ton âme (sorts de Lumière renforcés à +40). Brûler, nuire, user de magie interdite l’assombrit (sorts d’Ombre renforcés à −40).</div>';}
  {const R=S.duels;if(R&&(R.w||R.l))h+='<div class="sec">Arène des duels</div><div class="mu">⚔ '+R.w+' victoire'+(R.w>1?'s':'')+' · '+R.l+' défaite'+(R.l>1?'s':'')+(R.w>=5?' · titre : <b style="color:var(--gold)">Champion de l’arène</b>':'')+'</div>';}
  if(S.done.length)h+='<div class="sec">Accomplies</div>'+S.done.slice(-12).reverse().map(t=>'<div class="mu">✓ '+esc(t)+'</div>').join('');}
 else if(bookTab==='sac'){const pots=Object.keys(POTIONS).filter(k=>(S.inv['p_'+k]||0)>0);
  h='<div class="sec">Potions</div>'+(pots.length?pots.map(k=>{const P=POTIONS[k];return '<div class="it"><h4><span class="dot" style="background:'+hex(P.c)+'"></span>'+esc(P.n)+'<span class="badge">×'+S.inv['p_'+k]+'</span>'+(BUFF[k]?'<span class="badge">actif '+Math.ceil(BUFF[k])+' s</span>':'')+'</h4><div class="mu">'+esc(P.d)+'</div><button class="tbtn" data-drink="'+k+'" style="margin-top:7px">Boire</button></div>';}).join(''):'<div class="mu">Aucune potion. Prépare-en dans un chaudron (onglet Alchimie).</div>');
  const ings=Object.keys(INGR).filter(k=>(S.inv[k]||0)>0);
  h+='<div class="sec">Ingrédients</div>'+(ings.length?'<div class="it">'+ings.map(k=>'<div style="display:flex;align-items:center;gap:7px;margin:3px 0"><span class="dot" style="background:'+hex(INGR[k].c)+'"></span>'+esc(INGR[k].n)+'<b style="margin-left:auto">×'+S.inv[k]+'</b></div>').join('')+'</div>':'')+'<div class="mu">Cueille les plantes lumineuses, ouvre des coffres, disperse des créatures (essences) et cueille les fleurs que ta magie fait pousser (pétales).</div>';}
 else if(bookTab==='alchimie'){const c=nearCauldron();
  h='<div class="mu" style="margin-bottom:8px">'+(c?'⚗ Le chaudron bouillonne doucement. Choisis une recette.':'Approche-toi d’un chaudron (Serres enchantées, Village de Brumepont ou Marais des Lucioles) pour préparer des potions.')+'</div>'+Object.entries(POTIONS).map(([k,P])=>{const ok=c&&hasItems(P.need);return '<div class="it"><h4><span class="dot" style="background:'+hex(P.c)+'"></span>'+esc(P.n)+((S.inv['p_'+k]||0)>0?'<span class="badge">×'+S.inv['p_'+k]+'</span>':'')+'</h4><div class="mu">'+esc(P.d)+'</div><div style="margin-top:4px">'+Object.entries(P.need).map(([i,v])=>{const have=S.inv[i]||0;return '<span class="badge" style="margin:2px 4px 2px 0;'+(have>=v?'background:rgba(111,227,111,.2)':'opacity:.6')+'">'+esc(INGR[i].n)+' '+Math.min(have,v)+'/'+v+'</span>';}).join('')+'</div><button class="tbtn" data-brew="'+k+'"'+(ok?'':' disabled')+' style="margin-top:7px">Préparer</button></div>';}).join('');}
 else if(bookTab==='cours'){h='<div class="mu" style="margin-bottom:10px">Sois sur place pendant le cours pour apprendre un nouveau sort.</div>';
  S.courses.forEach(c=>{const nn=NPCBY[c.prof];h+='<div class="it"><h4>'+fmtTime(c.h)+' – '+fmtTime(c.h+c.dur)+' · '+esc(nn.name)+'</h4><div>'+ELEM[c.el].n+' · '+esc(LOCBY[c.loc].name)+'</div><div class="mu">'+({pending:'À venir',live:'En cours ('+Math.round(c.att)+'/45 min)',done:'Suivi ✓',missed:'Manqué'})[c.state]+'</div></div>';});}
 else{h=S.chron.slice().reverse().map(c=>'<div style="margin-bottom:7px;font-size:13px"><span class="mu">J'+c.d+' '+c.h+'</span> — '+esc(c.t)+'</div>').join('')||'<div class="mu">Rien encore.</div>';}
 const body=$('#book-body');const st=body.scrollTop;body.innerHTML=h;body.scrollTop=st;
 body.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{const id=b.dataset.as,i=+b.dataset.slot;const prev=S.slots.indexOf(id);if(prev===i){S.slots[i]=null;}else{if(prev>=0)S.slots[prev]=S.slots[i];S.slots[i]=id;}save();renderSlots();renderBook();});
 body.querySelectorAll('[data-tal]').forEach(b=>b.onclick=()=>{const id=b.dataset.tal;if(ptsFree()<=0)return;S.talents[id]=(S.talents[id]||0)+1;levelFx();save();updateHUD();renderBook();});
 const rs=$('#t-reset');if(rs)rs.onclick=()=>{S.talents={};mana=Math.min(mana,manaMax());save();updateHUD();renderBook();};
 body.querySelectorAll('[data-q]').forEach(d=>d.onclick=()=>{S.track=d.dataset.q;renderBook();});
 body.querySelectorAll('[data-drink]').forEach(b=>b.onclick=()=>{drink(b.dataset.drink);renderBook();});body.querySelectorAll('[data-brew]').forEach(b=>b.onclick=()=>{brew(b.dataset.brew);renderBook();});
}
$('#book-x').onclick=()=>$('#book').classList.add('hidden');
$('#b-book').onclick=()=>openBook('sorts');
$('#b-jour').onclick=()=>openBook('quetes');

