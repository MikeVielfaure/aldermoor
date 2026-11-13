/* ================= MAÎTRE DU JEU ================= */
function worldCtx(){return {
 joueur:{nom:S.name,niveau:lvl(),rang:rankOf(lvl()).n,lieu_actuel:S.locId||'chemins',sorts_connus:S.spells.map(s=>s.name+' ['+s.el+'/'+s.form+']'),talents:S.talents,combos_decouverts:S.combos},
 formes_de_sorts:ELS.map(e=>e+' — zone : '+FORMFX[e].zone+' | util : '+FORMFX[e].util),
 moment:{jour:S.day,heure:fmtTime(S.time)},
 lieux:LOCS.map(l=>l.id+' = '+l.name).concat(INLOCS.map(l=>l.id+' = '+l.name+' (intérieur)')),
 pnj:NPCS.map(n=>n.id+' = '+n.name+' ('+n.role+'), actuellement à '+(NPCOBJ(n.id)?NPCOBJ(n.id).cur:n.home)),
 elements:ELS.map(e=>e+' : '+ELEM[e].fx),
 ame:{karma:S.karma||0,alignement:alignOf()},oublis:S.forgot||{},actes_obscurs:S.darkLog||[],objets_magiques:Object.keys(S.objs||{}),faille_record:S.waveBest||0,
 arene:{victoires:(S.duels||{}).w||0,defaites:(S.duels||{}).l||0,battus:Object.keys((S.duels||{}).best||{})},meteo:(S.weather||{}).w,zone:S.zone,inventaire:S.inv,humeur_pnj:S.rep,enigmes:S.puz?{braseros_resolus:S.puz.braz.solved,souterrains_ouverts:S.puz.seals.open,gardien_vaincu:S.puz.dun.boss}:{},
 etat_du_monde:{arbres_brules:TREES.filter(t=>t.st!=='ok').length,glace_sur_le_lac:ICE.length>0,incendies_en_cours:TREES.filter(t=>t.st==='burning').length+PROPS.filter(p=>p.burn>0).length},
 quetes_actives:S.quests.map(q=>q.title+' → étape : '+(curStep(q)?curStep(q).text:'')),
 evenements_en_cours:ENT.filter(e=>e.kind==='event').map(e=>e.data.title+' @'+e.data.loc+' (besoin: '+e.data.need+')'),
 parchemins_presents:ENT.filter(e=>e.kind==='scroll').map(e=>e.data.spell.name+' @'+e.data.loc+(e.data.hidden?' (caché)':'')),
 cours_du_jour:S.courses.map(c=>fmtTime(c.h)+' '+c.prof+' '+c.el+' @'+c.loc+' ('+c.state+')'),
 chronique_recente:S.chron.slice(-8).map(c=>c.t)
};}
const RULES=`Tu es le Maître du Jeu d'« Aldermoor », un RPG de sorciers en monde ouvert dans une académie de magie. Univers ORIGINAL : n'utilise aucun nom, lieu, sort ou objet tiré de Harry Potter ou d'autres œuvres. Le joueur est totalement libre, il n'y a pas de fil rouge : tu fais vivre le monde avec des quêtes, événements, rumeurs, créatures et sorts, de façon imprévisible mais cohérente. Ton : merveilleux, malicieux, chaleureux. Écris en français et tutoie le joueur. Sois juste : le joueur ne réussit pas tout, mais ses initiatives intéressantes sont récompensées. Les sorts ont de vrais effets physiques dans le jeu (voir "elements") : tu peux t'en servir pour imaginer des quêtes (geler le lac pour atteindre un endroit, éteindre un incendie, faire repousser la forêt, éclairer la nuit…) et réagir aux dégâts (arbres brûlés, etc.).

ACTIONS POSSIBLES (utilise UNIQUEMENT les identifiants de lieux, de PNJ et d'éléments fournis) :
- {"type":"spell_scroll","loc":LIEU,"hidden":false,"spell":{"name":"nom du sort","inc":"incantation inventée (latin de fantaisie)","el":ELEMENT,"form":"trait|zone|util","desc":"effet en une phrase"}}  → cache un parchemin de sort à ramasser (hidden:true = invisible jusqu'à ce qu'un sort de lumière le révèle).
- {"type":"event","loc":LIEU,"title":"titre court","desc":"une phrase","need":ELEMENT,"xp":10-80}  → événement magique résolu en lançant un sort de cet élément sur place.
- {"type":"quest","title":"…","desc":"une phrase","giver":PNJ,"steps":[ÉTAPES],"reward":{"xp":20-150,"spell":SORT_ou_null}}  avec 1 à 4 étapes parmi : {"kind":"goto","loc":LIEU,"text":"…"} · {"kind":"talk","npc":PNJ,"text":"…"} · {"kind":"cast","loc":LIEU,"el":ELEMENT_ou_null,"text":"…"} · {"kind":"collect","loc":LIEU,"item":"nom de l'objet","text":"…"}
- {"type":"creatures","loc":LIEU,"name":"nom","count":1-4,"weak":ELEMENT_faiblesse,"look":ELEMENT_apparence}
- {"type":"move_npc","npc":PNJ,"loc":LIEU}
- {"type":"teach","spell":SORT}  → le joueur apprend directement un sort (rare, à mériter).
- {"type":"weather","w":"clair|nuages|pluie|orage|brume|neige"}  → change la météo (pluie : feu affaibli, eau renforcée ; orage : lumière renforcée, foudre ; brume : ombre renforcée ; neige : glace renforcée, le lac gèle).
- {"type":"chest","loc":LIEU,"lock":"gel|scelle|ombre|flamme|racines|enfoui|null"}  → cache un coffre (verrous : gel→feu, scelle→arcane, ombre→lumière, flamme→eau, racines→nature, enfoui→vent).
- {"type":"item","id":"soleil|lune|givre|braise|plume|ombre|petale|essence","n":1-3}  → donne des ingrédients au joueur (cadeau d'un PNJ…).
- {"type":"xp","amount":1-40}
- {"type":"duel","npc":"lila|orvane"}  → ce PNJ défie le joueur en duel : il l'attend à l'Arène des duels (combat de sorts en temps réel, avec esquives). Orvane n'accepte qu'un joueur aguerri.
Nouveaux lieux : Moulin du Ru (Gaspard le meunier ; sa grande roue gèle sous la glace, s'emballe avec le vent ou l'eau), Marais des Lucioles (Mère Brindille l'herboriste, chaudron, mares, champignons lunaires, lucioles la nuit), Ruines d'Ysmer (un oracle de pierre qui parle une fois par jour et bénit le joueur ; quatre gardiens à éveiller chacun avec leur élément pour ouvrir une crypte). Tu peux t'en servir pour des quêtes et des rumeurs.
Le joueur peut voler à balai (dès le niveau 3), affronter des vagues de créatures à la Faille des Hauteurs, et posséder des objets magiques (balai, pierre de rappel, boussole des arcanes, sablier d'ambre, lanterne-follet). Il a une âme (karma de -100 à 100, voir "ame") : aider l'éclaire, nuire l'assombrit. Le sort interdit « Oubli » efface la mémoire d'un PNJ (il oublie le joueur, ses rancunes et les quêtes qu'il lui a confiées) : si le contexte montre des oublis ("oublis", "actes_obscurs"), fais-en des conséquences imprévues (rumeurs, PNJ troublés, soupçons, chantage, rédemption…). Un lieu étrange caché existe : le Bosquet des Murmures (arbres flottant à l'envers, gravité faible). Tu peux proposer des quêtes plus obscures et exotiques si l'âme du joueur penche vers l'ombre, ou lumineuses si elle penche vers la lumière.
L'Arène des duels possède aussi une pierre rouge où le joueur affronte des duellistes (Mannequin enchanté, Lila, Corentin Ardent [feu], Sélène Givrecœur [glace], Maël Sombrelune [ombre], Pr. Orvane) : tu peux y faire allusion, organiser des tournois par des quêtes, ou faire réagir les PNJ à ses victoires.
Le monde contient des énigmes (braseros du Cercle de pierres, trois sceaux devant le château qui ouvrent les Souterrains et leur Gardien, glyphe secret sur la tour-bibliothèque) : tu peux y faire allusion par des indices. Les PNJ ont une humeur envers le joueur (humeur_pnj, de -10 à 10) : un PNJ fâché est froid, voire refuse d'aider ; un PNJ amical peut offrir des ingrédients.
Formes de sort : trait = projectile, zone = effet tout autour du joueur, util = utilitaire (déplacement, révélation…). L'effet réel dépend de l'élément ET de la forme (voir formes_de_sorts). Le joueur a un rang (Apprenti, Adepte, Mage, Archimage) : adapte la difficulté et la manière dont les PNJ le traitent. Les combos d'éléments existent ; tu peux y faire allusion de façon énigmatique.
Astuce : si un événement ou une quête exige un élément que le joueur ne connaît pas, tu peux cacher ailleurs un parchemin de cet élément. Varie les lieux. Pas d'action à chaque fois si ce n'est pas pertinent.

Réponds UNIQUEMENT avec un objet JSON : {"narration":"…","actions":[…]} (0 à 3 actions).`;
function buildPrompt(mode,p){
 let m='';
 if(mode==='talk'){const n=p.npc;m=`SITUATION : le joueur parle à ${n.name} (id ${n.id}, ${n.role}).
Conversation récente :
${p.hist.map(h=>(h.w==='p'?S.name:n.name)+' : '+h.t).join('\n')}
"narration" = la réplique de ${n.name}, en personnage, 1 à 3 phrases, sans guillemets ni nom devant. ${n.name} peut proposer une quête (giver "${n.id}"), révéler où trouver un sort, réagir à la situation… seulement si cela a du sens.`;}
 else if(mode==='act'){m=`SITUATION : le joueur tente une action libre : « ${p.text} ».
"narration" = ce qui se passe, 2 à 4 phrases à la 2e personne. Fais réagir le monde avec des actions si pertinent.`;}
 else if(mode==='day'){m=`SITUATION : le jour ${S.day} se lève sur Aldermoor. Prépare 2 à 4 actions variées qui rendent le monde vivant aujourd'hui (parchemins cachés, événement, quête d'un PNJ, créatures…).
"narration" = l'annonce du matin en 2 phrases (une rumeur, une ambiance, un indice).`;}
 else if(mode==='course'){m=`SITUATION : le joueur vient de suivre le cours de ${NPCBY[p.prof].name} (élément ${p.el}) à ${LOCBY[p.loc].name}. Invente le sort enseigné, élément "${p.el}", avec une action teach (un nom que le joueur ne connaît pas encore).
"narration" = résumé vivant du cours en 2 phrases.`;}
 return RULES+'\n\nÉTAT DU MONDE :\n'+JSON.stringify(worldCtx())+'\n\n'+m;
}
async function callGM(mode,p){
 if(SAMPLE&&aiState==='on'){
  try{const r=await SAMPLE.json(buildPrompt(mode,p),{modelTier:'quick',cache:false});
   if(r&&typeof r==='object'&&!Array.isArray(r)){aiUsed=true;return {narration:String(r.narration||'').slice(0,700),actions:Array.isArray(r.actions)?r.actions.slice(0,4):[],ai:true};}}
  catch(e){const c=e&&e.code;
   if(['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'].includes(c)){aiState='off';aiBadge();say('Le MJ IA n’est pas disponible : le MJ classique prend le relais.','sys');}
   else if(c==='rate_limited')say('Le MJ IA reprend son souffle (limite atteinte). Le MJ classique improvise.','sys');
   else if(SAMPLE.own)mjFail(e);}
 }
 return fallbackGM(mode,p);
}
function applyActions(actions,giverDefault){
 const out=[];if(!Array.isArray(actions))return out;
 for(const a of actions.slice(0,4)){if(!a||typeof a!=='object')continue;
  try{
  if(a.type==='spell_scroll'){const sp=normSpell(a.spell);const e=spawnScroll(a.loc,sp,null,!!a.hidden);out.push('Un parchemin de sort '+(a.hidden?'caché ':'')+'est apparu vers '+LOCBY[e.data.loc].name+'…');}
  else if(a.type==='event'){const e=spawnEvent(a.loc,String(a.title||'Phénomène étrange').slice(0,40),String(a.desc||'').slice(0,200),a.need,a.xp);out.push('Événement : '+e.data.title+' ('+LOCBY[e.data.loc].name+')');}
  else if(a.type==='quest'){const q=normQuest(a,giverDefault);if(q){addQuest(q);out.push('Nouvelle quête : '+q.title);}}
  else if(a.type==='creatures'){spawnCreatures(a.loc,String(a.name||'Créatures').slice(0,30),a.count,a.weak,a.look);out.push((a.name||'Des créatures')+' rôdent vers '+(LOCBY[a.loc]||{name:'quelque part'}).name);}
  else if(a.type==='move_npc'){const n=NPCOBJ(a.npc),L=LOCBY[a.loc];if(n&&L){S.npcLoc[n.d.id]=L.id;out.push(n.d.name+' part vers '+L.name);}}
  else if(a.type==='teach'){const sp=normSpell(a.spell);if(learnSpell(sp))out.push('Sort appris : '+sp.name);}
  else if(a.type==='weather'){if(WEATHERS[a.w]){setWeather(a.w);out.push('Météo : '+WEATHERS[a.w].n);}}
  else if(a.type==='chest'){const e=spawnChest(LOCBY[a.loc]?a.loc:pick(LOCS).id,(a.lock===null||a.lock==='null')?null:a.lock);out.push('Un coffre est apparu vers '+LOCBY[e.data.loc].name);}
  else if(a.type==='item'){if(INGR[a.id]){const n=clamp(+a.n||1,1,3);addItem(a.id,n);out.push('+'+n+' '+INGR[a.id].n);}}
  else if(a.type==='xp'){const n=clamp(+a.amount||5,1,40);gainXP(n);out.push('+'+n+' XP');}
  else if(a.type==='duel'){const r=duelInvite(a.npc);if(r){out.push('⚔ '+NPCBY[a.npc].name+' : '+r);}}
  }catch(err){console.warn(err);}
 }
 updateHUD();return out;
}
function normQuest(a,giverDefault){
 const giver=NPCBY[a.giver]?a.giver:(giverDefault||pick(NPCS).id);
 const steps=(Array.isArray(a.steps)?a.steps:[]).slice(0,4).map(s=>{if(!s)return null;const k=s.kind;
  if(k==='talk'){const n=NPCBY[s.npc]?s.npc:giver;return {kind:'talk',npc:n,text:String(s.text||('Parler à '+NPCBY[n].name)).slice(0,90)};}
  const loc=LOCBY[s.loc]?s.loc:pick(LOCS).id;
  if(k==='goto')return {kind:'goto',loc,text:String(s.text||('Aller à '+LOCBY[loc].name)).slice(0,90)};
  if(k==='cast'){const el=ELS.includes(s.el)?s.el:null;return {kind:'cast',loc,el,text:String(s.text||('Lancer un sort'+(el?' '+deEl(el):'')+' à '+LOCBY[loc].name)).slice(0,90)};}
  if(k==='collect'){const item=String(s.item||pick(ITEMS)).slice(0,50);return {kind:'collect',loc,item,text:String(s.text||('Trouver '+item)).slice(0,90)};}
  return null;}).filter(Boolean);
 if(!steps.length)return null;
 const r=a.reward||{};
 return {lakeItem:!!a.lakeItem,title:String(a.title||'Quête mystérieuse').slice(0,50),desc:String(a.desc||'').slice(0,200),giver,steps,reward:{xp:clamp(+r.xp||40,10,150),spell:r.spell?normSpell(r.spell):null}};
}
function genQuest(giverId){
 const g=NPCBY[giverId]||pick(NPCS);const L=()=>pick(LOCS);const t=Math.floor(Math.random()*5);
 if(t===0){const l=L(),it=pick(ITEMS);return {title:'Objet égaré',desc:g.name+' a perdu '+it+' du côté de '+l.name+'.',giver:g.id,steps:[{kind:'collect',loc:l.id,item:it,text:'Trouver '+it+' ('+l.name+')'},{kind:'talk',npc:g.id,text:'Rapporter l’objet à '+g.name}],reward:{xp:45,spell:null}};}
 if(t===1){const l=L(),el=pick(ELS);return {title:'Rituel '+ELEM[el].a,desc:g.name+' veut qu’un sort '+deEl(el)+' soit lancé à '+l.name+' pour rééquilibrer les flux magiques.',giver:g.id,steps:[{kind:'goto',loc:l.id,text:'Se rendre à '+l.name},{kind:'cast',loc:l.id,el,text:'Lancer un sort '+deEl(el)+' à '+l.name},{kind:'talk',npc:g.id,text:'Prévenir '+g.name}],reward:{xp:60,spell:null}};}
 if(t===2){const o=pick(NPCS.filter(n=>n.id!==g.id)),l=L(),it=pick(ITEMS);return {title:'Un message pour '+o.name,desc:g.name+' a besoin d’un messager discret.',giver:g.id,steps:[{kind:'talk',npc:o.id,text:'Parler à '+o.name},{kind:'collect',loc:l.id,item:it,text:'Récupérer '+it+' ('+l.name+')'},{kind:'talk',npc:g.id,text:'Revenir voir '+g.name}],reward:{xp:70,spell:genSpell()}};}
 if(t===3){return {title:'Le cœur du lac',desc:'On raconte qu’un cristal repose au milieu du Lac des Murmures. Il faudra trouver un moyen de marcher sur l’eau…',giver:g.id,steps:[{kind:'cast',loc:'lac',el:'glace',text:'Geler le lac avec un sort de Glace'},{kind:'collect',loc:'lac',item:'un cristal du lac',text:'Récupérer le cristal au milieu du lac'},{kind:'talk',npc:g.id,text:'Montrer le cristal à '+g.name}],reward:{xp:90,spell:genSpell()},lakeItem:true};}
 const a=L(),b=pick(LOCS.filter(x=>x!==a));return {title:'Les lueurs de '+a.name,desc:'Des lueurs étranges ont été aperçues. '+g.name+' veut savoir d’où elles viennent.',giver:g.id,steps:[{kind:'goto',loc:a.id,text:'Enquêter à '+a.name},{kind:'goto',loc:b.id,text:'Suivre la piste jusqu’à '+b.name},{kind:'cast',loc:b.id,el:null,text:'Lancer n’importe quel sort à '+b.name}],reward:{xp:50,spell:null}};
}
function fallbackGM(mode,p){
 if(mode==='talk'){const n=p.npc,m=p.msg.toLowerCase();const rp=S.rep[n.id]||0;if(rp<=-4&&/mission|quête|quete|aide|travail|service/.test(m))return {narration:pick(['Après ce que tu as fait ? Sûrement pas.','Je n’ai rien à confier à quelqu’un qui met le feu partout.']),actions:[]};if(rp<=-4&&Math.random()<0.6)return {narration:pick(['Je n’ai pas envie de te parler.','Tu as du culot de revenir me voir.','Hmpf.']),actions:[]};
  if(n.id==='lila'&&/mission|quête|quete|défi|defi|ennui|jouer/.test(m)&&lvl()>=2&&Math.random()<0.3)return {narration:'Une mission ? J’ai mieux : un duel ! Rejoins-moi à l’arène, si tu l’oses.',actions:[{type:'duel',npc:'lila'}]};
  if(/mission|quête|quete|aide|travail|service|boulot/.test(m)){if(Math.random()<0.8)return {narration:pick(['Justement, j’ai besoin de quelqu’un de débrouillard.','Hmm… Tu tombes bien. Écoute-moi attentivement.','D’accord, mais ne me déçois pas.']),actions:[{type:'quest',...genQuest(n.id)}]};return {narration:'Pas pour l’instant. Repasse plus tard, qui sait ?',actions:[]};}
  if(/rumeur|nouvelle|secret|sort|parchemin|ragot/.test(m)){const l=pick(LOCS);const hid=Math.random()<0.4;return {narration:hid?'Il paraît qu’un parchemin invisible dort du côté de '+l.name+'. Seule la lumière le fera apparaître…':'On raconte qu’un parchemin flotte du côté de '+l.name+'… Dépêche-toi, ces choses-là ne restent jamais longtemps.',actions:[{type:'spell_scroll',loc:l.id,hidden:hid,spell:genSpell()}]};}
  if(/apprend|enseign|leçon|lecon|cours/.test(m)){const c=S.courses.find(c=>c.prof===n.id&&c.state==='pending');if(c)return {narration:'Viens à mon cours à '+fmtTime(c.h)+', '+LOCBY[c.loc].name+'. Là, je t’apprendrai quelque chose.',actions:[]};return {narration:'Les meilleurs sorts ne s’apprennent pas en classe. Cherche les parchemins, observe le monde.',actions:[{type:'xp',amount:5}]};}
  const burnt=TREES.filter(t=>t.st!=='ok').length;if(burnt>4&&(n.id==='bram'||n.id==='mirelle'))return {narration:'Tu as vu l’état des arbres ? '+burnt+' troncs calcinés ! Si tu connais un sort de Nature, rends-toi utile.',actions:[]};
  return {narration:pick(LINES[n.id]),actions:[]};}
 if(mode==='act'){const t=p.text.toLowerCase();const here=S.locId||pick(LOCS).id;
  if(/cherch|fouill|explor|sort|parchemin/.test(t)){if(Math.random()<0.5){const hid=Math.random()<0.35;return {narration:hid?'Tu sens une présence magique tout près… mais tu ne vois rien. Peut-être qu’un peu de lumière aiderait ?':'Tu fouilles minutieusement les alentours. Un frémissement dans l’air… quelque chose de magique se cache tout près !',actions:[{type:'spell_scroll',loc:here,hidden:hid,spell:genSpell()}]};}return {narration:'Tu explores un bon moment sans rien trouver, mais tu remarques des traces de magie qui partent vers '+pick(LOCS.filter(l=>l.id!==here)).name+'.',actions:[{type:'xp',amount:5}]};}
  if(/événement|evenement|provoque|chaos|bêtise|betise/.test(t)){const e=pick(EVT);return {narration:'Tu fais quelque chose de vraiment pas raisonnable. Le monde répond aussitôt…',actions:[{type:'event',loc:here,title:e.t,desc:e.d,need:e.need,xp:30}]};}
  if(/rumeur|ragot/.test(t)){const c=pick(CREA),l=pick(LOCS);return {narration:'Il paraît que des '+c.name.toLowerCase()+' ont été vus vers '+l.name+'. Ils détesteraient la magie de type '+ELEM[c.weak].n+'.',actions:[{type:'creatures',loc:l.id,name:c.name,count:3,weak:c.weak,look:c.look}]};}
  if(/médit|medit|calme|écoute|ecoute/.test(t))return {narration:'Tu fermes les yeux. Les flux magiques d’Aldermoor bourdonnent doucement autour de toi. Tu te sens un peu plus aguerri.',actions:[{type:'xp',amount:8}]};
  return {narration:pick(['Tu tentes ta chance. Pendant un instant, rien… puis une brise étrange te frôle l’oreille.','Quelques élèves te regardent bizarrement, mais tu sens que la magie a remarqué ton audace.','Un corbeau se pose près de toi, te fixe, puis s’envole vers '+pick(LOCS).name+'.']),actions:[{type:'xp',amount:3}]};}
 if(mode==='day'){const acts=[{type:'spell_scroll',loc:pick(LOCS).id,spell:genSpell()},{type:'spell_scroll',loc:pick(LOCS).id,hidden:true,spell:genSpell()}];const e=pick(EVT);acts.push({type:'event',loc:e.loc||pick(LOCS).id,title:e.t,desc:e.d,need:e.need,xp:30});if(S.quests.length<4)acts.push({type:'quest',...genQuest(pick(NPCS).id)});
  return {narration:pick(['Une aube rose se lève. On murmure que des parchemins se sont échappés de la réserve cette nuit… certains seraient devenus invisibles.','Le brouillard se dissipe lentement. Quelque chose d’inhabituel flotte dans l’air aujourd’hui.','Les cloches sonnent. Une nouvelle journée d’étude… et de bêtises potentielles.']),actions:acts};}
 if(mode==='course')return {narration:NPCBY[p.prof].name+' termine sa démonstration et te félicite d’un signe de tête.',actions:[{type:'teach',spell:genSpell(p.el)}]};
 return {narration:'',actions:[]};
}

