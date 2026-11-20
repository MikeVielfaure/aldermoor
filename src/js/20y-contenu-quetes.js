/* ================= QUÊTES DE L'ATELIER =================
   Fiche : {id, titre, description, donneur (id de PNJ), actif, apres (id d'une autre quête de l'Atelier à finir avant, ou ''),
   etapes:[{type:'parler'|'aller'|'ramasser'|'lancer'|'vaincre', pnj, lieu, objet, element, creature, nombre, texte}],
   recompense:{xp, or, essence, cristal, sort (id d'un sort de l'Atelier, ou '')}}.
   En jeu : parler au donneur affiche « 📜 titre » ; l'accepter la met dans le journal comme les autres quêtes.
   Étape « vaincre » (nouvelle, kind:'kill') : comptée dans un enrobage de killCreature (créature de l'Atelier par id, ou
   nom qui contient le texte, ou n'importe quelle créature hostile si vide). Quêtes finies : S.cqDone[id].
   Sources : src/contenu/quetes.json + localStorage de l'Atelier. ?test&quete=<id> la donne tout de suite. */
const CONT_QKEY='aldermoor-atelier-quetes';
const CQUETES=contList('quetes',CONT_QKEY);
const CQ_TYPES={parler:'💬 parler à',aller:'🚶 aller à',ramasser:'✋ ramasser',lancer:'✨ lancer un sort',vaincre:'⚔ vaincre'};
function cqStep(s,giver){const L=LOCBY[s.lieu]?s.lieu:null,txt=String(s.texte||'').slice(0,90);
 if(s.type==='parler'){const n=NPCBY[s.pnj]?s.pnj:giver;return {kind:'talk',npc:n,text:txt||('Parler à '+NPCBY[n].name)};}
 if(s.type==='aller')return L?{kind:'goto',loc:L,text:txt||('Aller à '+LOCBY[L].name)}:null;
 if(s.type==='ramasser'){const loc=L||pick(LOCS).id,item=String(s.objet||'un objet étrange').slice(0,50);return {kind:'collect',loc,item,text:txt||('Trouver '+item+' ('+LOCBY[loc].name+')')};}
 if(s.type==='lancer'){const loc=L||'cour',el=ELS.includes(s.element)?s.element:null;return {kind:'cast',loc,el,text:txt||('Lancer un sort'+(el?' '+deEl(el):'')+' à '+LOCBY[loc].name)};}
 if(s.type==='vaincre'){const n=clamp(Math.round(+s.nombre||3),1,50),cr=String(s.creature||'');const nom=(contCreatures().find(c=>c.id===cr)||{}).nom||cr||'créatures';
  const base=txt||('Vaincre '+n+' '+nom+(L?' ('+LOCBY[L].name+')':''));return {kind:'kill',crea:cr,n,got:0,loc:L||undefined,base,text:base+' (0/'+n+')'};}
 return null;}
function cqQuest(c){const giver=NPCBY[c.donneur]?c.donneur:'lila';const steps=(c.etapes||[]).map(s=>cqStep(s,giver)).filter(Boolean);if(!steps.length)return null;const R=c.recompense||{};
 const sp=R.sort?CSPELLS.find(x=>x.id===R.sort):null;
 return {title:String(c.titre||'Quête').slice(0,50),desc:String(c.description||'').slice(0,240),giver,steps,cq:c.id,reward:{xp:clamp(+R.xp||40,0,500),spell:sp?cSpell(sp):null,or:+R.or||0,essence:+R.essence||0,cristal:+R.cristal||0}};}
function cqOpen(npcId){S.cqDone=S.cqDone||{};return CQUETES.filter(c=>c.actif!==false&&c.donneur===npcId&&!S.cqDone[c.id]&&!S.quests.some(q=>q.cq===c.id)&&(!c.apres||S.cqDone[c.apres]));}
function cqGive(c){const q=cqQuest(c);if(!q){say('Cette quête n’a pas d’étape valable.','sys');return false;}const n=S.quests.length;addQuest(q);return S.quests.length>n;}
/* le donneur propose sa quête dans le dialogue */
{const _od=openDlg;openDlg=function(ctx){const r=_od.apply(this,arguments);if(ctx&&ctx.mode==='talk'){for(const c of cqOpen(ctx.npc.id)){const b=document.createElement('button');b.className='chip';b.textContent='📜 '+c.titre;
  b.onclick=()=>{b.remove();if(c.description)line('n',c.description);if(cqGive(c))line('sys','Quête acceptée : '+c.titre);};$('#chips').prepend(b);}}return r;};}
/* récompenses en plus de l'XP et du sort ; mémoire des quêtes finies */
{const _f=finishQuest;finishQuest=function(q){const r=_f.apply(this,arguments);if(q&&q.cq){S.cqDone=S.cqDone||{};S.cqDone[q.cq]=S.day||1;const R=q.reward||{},out=[];
  if(R.or){gainOr(R.or);out.push(R.or+' 🪙');}['essence','cristal'].forEach(k=>{if(R[k]){addItem(k,R[k]);out.push(R[k]+' '+INGR[k].n.toLowerCase());}});if(out.length)say('Récompense : '+out.join(', '),'sys');save();}return r;};}
/* étape « vaincre » */
function cqMatch(s,D){if(!D||D.duel||D.pet||D.charmed)return false;if(!s.crea)return !D.calme;if(D.cid===s.crea)return true;return (D.name||'').toLowerCase().includes(s.crea.toLowerCase());}
{const _k=killCreature;killCreature=function(e){const D=e&&e.data,was=D&&ENT.includes(e);const r=_k.apply(this,arguments);
  if(was&&!ENT.includes(e))S.quests.slice().forEach(q=>{const s=curStep(q);if(!s||s.kind!=='kill'||!cqMatch(s,D))return;if(s.loc&&!inLoc(s.loc,25))return;s.got=(s.got||0)+1;s.text=s.base+' ('+Math.min(s.got,s.n)+'/'+s.n+')';
   if(s.got>=s.n){say('✓ '+esc(s.base),'sys');advance(q);}else{say(esc(s.base)+' : '+s.got+'/'+s.n,'sys');save();}});return r;};}
{const _t=stepTarget;stepTarget=function(q){const s=curStep(q);if(s&&s.kind==='kill'){let b=null,bd=1e9;for(const e of ENT){if(e.kind!=='creature'||!cqMatch(s,e.data))continue;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;b=e;}}
  if(b&&(!s.loc||bd<60))return {x:b.x,z:b.z};}return _t.apply(this,arguments);};}
/* ?test&quete=<id> */
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);const m=/[?&]quete=([^&]+)/.exec(location.search);if(m){const c=CQUETES.find(x=>x.id===decodeURIComponent(m[1]));if(c)setTimeout(()=>{S.quests=S.quests.filter(q=>q.cq!==c.id);if(S.cqDone)delete S.cqDone[c.id];cqGive(c);updateHUD();},2200);}return r;};}
