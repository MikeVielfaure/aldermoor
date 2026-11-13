/* ================= MÉCANIQUES ================= */
function learnSpell(sp){if(knows(sp.name)){gainXP(10);say('Tu connais déjà <b>'+esc(sp.name)+'</b> (+10 XP)','sys');return false;}
 const newEl=!S.spells.some(s=>s.el===sp.el);
 S.spells.push(sp);gainXP(15);say('✦ Nouveau sort : <b style="color:'+hex(ELEM[sp.el].c)+'">'+esc(sp.name)+'</b> — « '+esc(sp.inc)+' »'+(newEl?'<br><span style="font-size:11.5px">'+esc(ELEM[sp.el].fx)+'</span>':''),'gm');chron('Sort appris : '+sp.name);
 for(let i=0;i<40;i++){const a=Math.random()*TAU,r=rnd(.3,1);PA.emit(player.x+Math.cos(a)*r,rnd(0,2),player.z+Math.sin(a)*r,0,rnd(1,3),0,ELEM[sp.el].c,0.35,0.05,rnd(.6,1.2),0,1);}flash(player.x,1.5,player.z,ELEM[sp.el].c,2.5,0.8);
 const n=rankOf(lvl()).slots;const free=S.slots.findIndex((x,i)=>!x&&i<n);if(free>=0){S.slots[free]=sp.id;say('Placé dans l’emplacement '+(free+1)+'.','sys');}else say('Ouvre le Grimoire pour le placer dans un emplacement.','sys');updateHUD();save();return true;}
function addQuest(q){if(S.quests.length>=7){say('Ton journal est plein : termine une quête d’abord.','sys');return;}
 q.id='q'+Date.now().toString(36)+Math.floor(Math.random()*1e4);q.cur=0;S.quests.push(q);if(!S.track)S.track=q.id;
 say('✦ Nouvelle quête : <b>'+esc(q.title)+'</b>','gm');chron('Quête reçue : '+q.title);
 q.steps.forEach(s=>{if(s.kind==='cast'&&s.el&&!S.spells.some(x=>x.el===s.el)){const l=pick(LOCS.filter(l=>l.id!=='lac'));spawnScroll(l.id,genSpell(s.el),600);say('Il te faudra un sort '+deEl(s.el)+'… on en signale un vers '+l.name+'.','sys');}});
 onStepStart(q);save();}
function onStepStart(q){const s=curStep(q);if(!s)return;if(s.kind==='collect'){if(q.lakeItem&&s.loc==='lac'){if(!ENT.some(e=>e.kind==='item'&&e.data.qid===q.id)){const g=new THREE.Group();mesh(G.cry,mat(0x9ee8ff,{emissive:0x4080ff,emissiveIntensity:0.7,metalness:0.4,roughness:0.2}),0,1.2,0,g);const gl=glow(0x9ee8ff,2.2,0.9);gl.position.y=1.2;g.add(gl);addEnt('item',LAKE.x+rnd(-2,2),LAKE.z+rnd(-2,2),g,{qid:q.id,item:s.item});}}else spawnQuestItem(q,s);}}
function advance(q){q.cur++;if(q.cur>=q.steps.length){finishQuest(q);return;}say('Étape suivante : '+esc(curStep(q).text),'sys');onStepStart(q);save();}
function finishQuest(q){S.quests=S.quests.filter(x=>x!==q);S.done.push(q.title);if(S.track===q.id)S.track=S.quests[0]?S.quests[0].id:null;
 gainXP(q.reward.xp);say('✦ Quête accomplie : <b>'+esc(q.title)+'</b> (+'+q.reward.xp+' XP)','gm');chron('Quête accomplie : '+q.title);burst(player.x,1.5,player.z,0xf3cf7a,30,5);
 if(q.reward.spell)learnSpell(q.reward.spell);save();}
function checkTalk(npcId){const out=[];S.quests.slice().forEach(q=>{const s=curStep(q);if(s&&s.kind==='talk'&&s.npc===npcId){out.push('✓ '+s.text);advance(q);}});return out;}
function castAt(el){
 ENT.filter(e=>e.kind==='event').forEach(e=>{const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<11){if(!e.data.need||e.data.need===el){resolveEvent(e);}else if(!e.data.warned){e.data.warned=true;say('Ton sort n’a aucun effet sur « '+esc(e.data.title)+' ». Il faudrait de la magie de type <b>'+ELEM[e.data.need].n+'</b>.','sys');}}});
 S.quests.slice().forEach(q=>{const s=curStep(q);if(s&&s.kind==='cast'&&inLoc(s.loc,2)&&(!s.el||s.el===el)){say('✓ '+esc(s.text),'sys');advance(q);}});
}
function resolveEvent(e){burst(e.x,1.5,e.z,0xffd27a,34,6);flash(e.x,2,e.z,0xffd27a,2.5,0.8);gainXP(e.data.xp);say('✦ Événement résolu : <b>'+esc(e.data.title)+'</b> (+'+e.data.xp+' XP)','gm');chron('Événement résolu : '+e.data.title);removeEnt(e);
 if(Math.random()<0.4){const l=pick(LOCS);spawnScroll(l.id,genSpell(),360);say('En remerciement, quelqu’un te glisse : « un parchemin traîne vers '+l.name+' ».','sys');}save();}
function inLoc(id,extra){const L=LOCBY[id];return L&&Math.hypot(player.x-L.x,player.z-L.z)<L.r+(extra||0);}

/* ---------- interaction ---------- */
let focus=null;
function findFocus(){let best=null,bd=3.6;
 for(const e of ENT){if(e.kind==='creature'||e.kind==='bounce'||e.kind==='guide'||(e.kind==='scroll'&&e.data.hidden)||(e.kind==='chest'&&e.data.open))continue;const d=Math.hypot(e.x-player.x,e.z-player.z);if(e.kind==='herb'&&d>2.2)continue;const pr=e.kind==='event'?0.6:0;if(d-pr<bd){bd=d-pr;best={t:'ent',e};}}
 for(const n of npcs){if(n.sleep||n.inDuel)continue;const d=Math.hypot(n.x-player.x,n.z-player.z);if(d<bd){bd=d;best={t:'npc',n};}}
 for(const s of STATIONS){const d=Math.hypot(s.x-player.x,s.z-player.z);if(d<(s.reach||2.6)&&d<bd+0.4){const hh=s.hint();if(hh){bd=d;best={t:'st',s,h:hh};}}}
 for(const p of PLANTS){if(p.type!=='flower'||p.t<1||p.burn>0)continue;const d=Math.hypot(p.x-player.x,p.z-player.z);if(d<1.4&&d<bd){bd=d;best={t:'plant',p};}}
 focus=best;const h=$('#hint'),b=$('#b-act');
 if(!best){h.classList.add('hidden');b.classList.remove('ready');return;}
 h.classList.remove('hidden');b.classList.add('ready');
 if(best.t==='npc')h.textContent='Parler à '+best.n.d.name;
 else if(best.t==='st')h.textContent=best.h;
 else if(best.t==='plant')h.textContent='Cueillir un pétale enchanté';
 else{const e=best.e;h.textContent=e.kind==='scroll'?'Ramasser le parchemin':e.kind==='item'?'Prendre '+e.data.item:e.kind==='mana'?'Cueillir la fleur de mana':e.kind==='herb'?'Cueillir : '+INGR[e.data.ing].n:e.kind==='chest'?(e.data.lock?'Examiner le coffre':'Ouvrir le coffre'):'Examiner : '+e.data.title;}
}
function interact(){if(!focus)return;
 if(focus.t==='npc'){const n=focus.n;n.tx=n.x;n.tz=n.z;n.wait=8;n.obj.rotation.y=Math.atan2(player.x-n.x,player.z-n.z);openDlg({mode:'talk',npc:n.d});checkTalk(n.d.id).forEach(t=>line('s',t));return;}
 if(focus.t==='st'){const s=focus.s;focus=null;s.act();findFocus();return;}
 if(focus.t==='plant'){const p=focus.p;scene.remove(p.g);PLANTS=PLANTS.filter(x=>x!==p);addItem('petale',1);burst(p.x,0.5,p.z,0xff9ad0,14,2);say('Tu cueilles un <b>pétale enchanté</b> ('+S.inv.petale+').','sys');focus=null;findFocus();return;}
 const e=focus.e;
 if(e.kind==='herb'){addItem(e.data.ing,1);burst(e.x,0.5,e.z,INGR[e.data.ing].c,16,2);say('Tu cueilles : <b>'+INGR[e.data.ing].n+'</b> ('+S.inv[e.data.ing]+')','sys');removeEnt(e);hint('herb','🌿 Ingrédient rangé dans ton Sac (Journal › Sac). Combine-les dans un chaudron (Serres ou Village) pour préparer des potions.');}
 else if(e.kind==='chest'){openChest(e);}
 else if(e.kind==='scroll'){learnSpell(e.data.spell);removeEnt(e);}
 else if(e.kind==='mana'){mana=manaMax();gainXP(5);burst(e.x,1,e.z,0x6ab4ff,30,4);flash(e.x,1.2,e.z,0x6ab4ff,2.5,0.6);say('💧 Ta magie déborde : mana au maximum !','sys');removeEnt(e);}
 else if(e.kind==='item'){const q=S.quests.find(q=>q.id===e.data.qid);removeEnt(e);say('Tu ramasses <b>'+esc(e.data.item)+'</b>.','sys');burst(e.x,1.2,e.z,0xffd27a,20,3);if(q&&curStep(q)&&curStep(q).kind==='collect')advance(q);}
 else if(e.kind==='event'){const need=e.data.need;let t='<b>'+esc(e.data.title)+'</b> — '+esc(e.data.desc);if(need){const k=S.spells.find(s=>s.el===need);t+=' <br>Il faudrait un sort de type <b>'+ELEM[need].n+'</b>'+(k?' : lance « '+esc(k.name)+' » ici !':' — tu n’en connais aucun pour l’instant.');}else t+=' <br>N’importe quel sort devrait faire l’affaire.';say(t,'gm');}
 focus=null;findFocus();
}

/* ---------- cours ---------- */
function planCourses(){const profs=PROFS.slice().sort(()=>Math.random()-0.5).slice(0,3);const hours=[9*60,14*60,18*60+30];
 S.courses=profs.map((p,i)=>({h:hours[i],dur:90,prof:p.id,loc:pick(p.cl),el:pick(p.els),att:0,state:'pending',ann:false}));}
function updCourses(dtMin){for(const c of S.courses){
 if(c.state==='pending'){if(!c.ann&&S.time>=c.h-30){c.ann=true;say('🔔 Dans 30 min : cours '+deEl(c.el)+' avec '+esc(NPCBY[c.prof].name)+' — '+esc(LOCBY[c.loc].name),'sys');}
  if(S.time>=c.h){c.state='live';say('🔔 Le cours de '+esc(NPCBY[c.prof].name)+' commence à '+esc(LOCBY[c.loc].name)+' !','gm');}}
 else if(c.state==='live'){if(inLoc(c.loc,2)){c.att+=dtMin;if(c.att>=45){c.state='done';finishCourse(c);}}
  if(S.time>=c.h+c.dur&&c.state==='live'){c.state='missed';say('Le cours de '+esc(NPCBY[c.prof].name)+' est terminé.','sys');}}
}}
async function finishCourse(c){gainXP(20);chron('Cours suivi : '+ELEM[c.el].n+' avec '+NPCBY[c.prof].name);
 const res=(aiUsed&&aiState==='on')?await callGM('course',c):fallbackGM('course',c);
 if(res.narration)say('<b>'+esc(NPCBY[c.prof].name)+'</b> : '+esc(res.narration),'gm');
 const acts=res.actions&&res.actions.some(a=>a&&a.type==='teach')?res.actions:[{type:'teach',spell:genSpell(c.el)}];
 acts.forEach(a=>{if(a&&a.type==='teach'&&a.spell&&typeof a.spell==='object'&&!ELS.includes(a.spell.el))a.spell.el=c.el;});
 applyActions(acts,c.prof);save();}

/* ---------- monde ambiant ---------- */
function ambient(){const r=Math.random();
 const sc=ENT.filter(e=>e.kind==='scroll').length,ev=ENT.filter(e=>e.kind==='event').length,cr=ENT.filter(e=>e.kind==='creature').length;
 if(r<0.45&&sc<5){const l=pick(LOCS);const hid=Math.random()<0.3;spawnScroll(l.id,genSpell(),null,hid);if(Math.random()<0.6)say((hid?'Une présence magique invisible se fait sentir vers ':pick(['Un élève jure avoir vu un parchemin voler vers ','Une lueur colorée a été aperçue vers ','Un grimoire s’est échappé de la réserve… direction ']))+esc(l.name)+'.','sys');}
 else if(r<0.75&&ev<3){const e=pick(EVT);const l=e.loc||pick(LOCS).id;spawnEvent(l,e.t,e.d,e.need,30);say('⚠ '+esc(e.t)+' — '+esc(LOCBY[l].name),'gm');}
 else if(cr<6){const c=pick(CREA),l=pick(LOCS);spawnCreatures(l.id,c.name,rnd(2,4)|0,c.weak,c.look);say(esc(c.name)+' ont été aperçus vers '+esc(l.name)+'.','sys');}
}

