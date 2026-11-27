/* ================= VRAIES HISTOIRES : les gens des hameaux des Grandes Terres =================
   Trois habitants (Maëlle l'aubergiste et Borin le forgeron à la Halte de l'Aube, Grégor le chef mineur à Brisefer) et des
   quêtes à plusieurs étapes, écrites comme celles de l'Atelier (CQUETES : puce « 📜 » dans le dialogue, étapes parler /
   aller / ramasser / lancer / vaincre, quêtes qui s'enchaînent avec « apres »). Pendant une étape « vaincre » d'une histoire,
   les ennemis apparaissent près du lieu (HIST_ENN) : dans une zone dangereuse, ils sont renforcés (20zk).
   L'auberge de la Halte : se reposer contre 10 pièces (vie et mana pleins, une heure passe). */
[{id:'maelle',name:'Maëlle Brune-Aube',role:'aubergiste de la Halte de l’Aube, chaleureuse, inquiète pour son frère Aubin, marchand',home:'terres_halte',mdl:['clerc',0xffc890],
  look:{skin:0xf2c8a0,hair:0x8a3a1a,style:'bun',hat:0x7a3a1a,robe:0xb86a3a,trim:0xffe0a0,h:0.95},
  lines:['Bienvenue à l’Auberge de l’Aube ! Un lit, une soupe, et les nouvelles des quatre coins des Grandes Terres.','Aubin aurait dû rentrer depuis trois jours… Ce n’est pas son genre.','Les caravanes passent par les Dunes de Sel-Rouge. Enfin… passaient.']},
 {id:'borin',name:'Borin Martel',role:'forgeron de la Halte, bourru, fier de son enclume, ne parle que de métal et de feu',home:'terres_halte',mdl:['guerrier',0xc8a080],
  look:{skin:0xc89070,hair:0x3a2a1a,style:'short',beard:0x3a2a1a,robe:0x4a3a2a,trim:0x8a6a4a,h:1.08,w:1.25},
  lines:['Une bonne lame, c’est du feu, du fer… et de la patience.','Le meilleur minerai vient de Brisefer. Le pire caractère aussi : demande à Grégor.','Tu veux que je forge quelque chose ? Apporte-moi de quoi travailler.']},
 {id:'gregor',name:'Grégor Sombrepic',role:'chef des mineurs de Brisefer, solide, superstitieux, inquiet pour ses hommes',home:'terres_mines',mdl:['guerrier',0x9a9aa8],
  look:{skin:0xd8b090,hair:0x6a6a6a,style:'bald',beard:0x8a8a8a,robe:0x5a5a68,trim:0xc8a040,h:1.04,w:1.2},
  lines:['On a creusé trop profond. On a réveillé quelque chose.','La fonderie est froide depuis l’incendie. Sans elle, Brisefer meurt.','Écoute… tu entends ? La montagne gronde.']},
 {id:'neree',name:'Nérée Coquillard',role:'pêcheuse de la Côte des Coquillages, rêveuse, entend des chants sous la mer la nuit',home:'terres_cote',mdl:['rodeuse',0x9ad8e8],
  look:{skin:0xe8c098,hair:0x2a4a5a,style:'pony',hat:0x2a5a7a,robe:0x3a7a9a,trim:0xf0e0c0,h:0.96},
  lines:['Tu l’entends, toi aussi ? Ce chant… il vient de sous les vagues.','Depuis que le phare s’est éteint, les bateaux ne rentrent plus.','La mer donne, la mer reprend. Mais là, elle reprend trop.']},
 {id:'haldaran',name:'Spectre du roi Haldaran',role:'fantôme d’un ancien roi, triste et solennel, parle de son royaume perdu comme s’il existait encore',home:'terres_ruines',mdl:['sorcier',0xbfe0ff],
  look:{skin:0xd8e8f0,hair:0xe8f0ff,style:'long',beard:0xe8f0ff,hat:0x8ab0d8,robe:0xa8c8e8,trim:0xe8f0ff,h:1.12},
  lines:['Ici s’élevait Haldaran… la plus belle cité des Grandes Terres.','Ma garde m’a trahi. Ma couronne… ils l’ont emportée dans la mort.','Je ne peux partir. Pas sans elle.']}
].forEach(p=>{if(NPCS.some(n=>n.id===p.id))return;NPCS.push({id:p.id,name:p.name,role:p.role,home:p.home,els:[],cl:[],look:p.look});NPCBY[p.id]=NPCS[NPCS.length-1];MDL_PERSO[p.id]=p.mdl;LINES[p.id]=p.lines.slice();});
WANDS.brisefer={n:'Baguette de Brisefer',p:0,d:'Forgée par Borin dans le minerai d’étoile : +12 % à tous tes sorts, +5 % de coups critiques.',tip:0xffb070,all:0.12,crit:0.05,unique:true};
const HISTOIRES=[
 {id:'hist-caravanes',titre:'Les caravanes perdues',donneur:'maelle',actif:true,
  description:'Depuis trois jours, plus aucune caravane n’arrive à la Halte. Aubin, le frère de Maëlle, conduisait la dernière. Elle te supplie de suivre leur piste vers les Dunes de Sel-Rouge.',
  etapes:[{type:'aller',lieu:'terres_dunes',texte:'Suivre la piste des caravanes jusqu’aux Dunes de Sel-Rouge'},
   {type:'ramasser',lieu:'terres_dunes',objet:'la sacoche d’Aubin',texte:'Fouiller les restes de la caravane (Dunes de Sel-Rouge)'},
   {type:'vaincre',creature:'orc',nombre:4,lieu:'terres_dunes',texte:'Chasser les orcs de Grokk qui rôdent autour de la caravane'},
   {type:'parler',pnj:'maelle',texte:'Rapporter la sacoche à Maëlle, à l’Auberge de l’Aube'}],
  recompense:{xp:220,or:150,cristal:2}},
 {id:'hist-aubin',titre:'Aubin, prisonnier des orcs',donneur:'maelle',actif:true,apres:'hist-caravanes',
  description:'Dans la sacoche, un mot griffonné : « Grokk m’emmène vers les mines. Je tiendrai. » Borin le forgeron connaît la route de Brisefer.',
  etapes:[{type:'parler',pnj:'borin',texte:'Demander à Borin le chemin de Brisefer'},
   {type:'aller',lieu:'terres_mines',texte:'Monter jusqu’aux Mines de Brisefer'},
   {type:'vaincre',creature:'orc',nombre:5,lieu:'terres_mines',texte:'Libérer le camp des orcs aux Mines de Brisefer'},
   {type:'parler',pnj:'gregor',texte:'Trouver Aubin… Grégor, le chef mineur, l’a peut-être vu'},
   {type:'parler',pnj:'maelle',texte:'Annoncer à Maëlle qu’Aubin est sauf'}],
  recompense:{xp:300,or:220,essence:2,cristal:3}},
 {id:'hist-brisefer',titre:'Le Cœur de Brisefer',donneur:'gregor',actif:true,
  description:'Les mineurs ont réveillé une chaleur terrible au fond de la mine : la fonderie s’est éteinte et des démons de cendres sortent des galeries. Grégor a besoin d’un sorcier.',
  etapes:[{type:'parler',pnj:'borin',texte:'Demander conseil à Borin, le forgeron de la Halte'},
   {type:'lancer',lieu:'terres_lac',element:'eau',texte:'Bénir de l’eau au Lac aux Nénuphars (sort d’Eau)'},
   {type:'lancer',lieu:'terres_mines',element:'eau',texte:'Apaiser la fonderie de Brisefer avec un sort d’Eau'},
   {type:'vaincre',creature:'démon',nombre:5,lieu:'terres_mines',texte:'Repousser les démons de cendres sortis des galeries'},
   {type:'parler',pnj:'gregor',texte:'Revenir voir Grégor'}],
  recompense:{xp:320,or:200,cristal:3}},
 {id:'hist-lame',titre:'Une baguette pour un héros',donneur:'borin',actif:true,apres:'hist-brisefer',
  description:'Borin veut te forger une baguette digne de toi. Il lui faut un éclat de givre éternel, qu’on ne trouve qu’au sommet des Pics de Givre-Haut, et du minerai d’étoile de Brisefer.',
  etapes:[{type:'ramasser',lieu:'terres_pics',objet:'un éclat de givre éternel',texte:'Trouver un éclat de givre éternel (Pics de Givre-Haut, zone très dangereuse)'},
   {type:'ramasser',lieu:'terres_mines',objet:'du minerai d’étoile',texte:'Rapporter du minerai d’étoile (Mines de Brisefer)'},
   {type:'parler',pnj:'borin',texte:'Rapporter les trésors à Borin'}],
  recompense:{xp:350,or:100}},
 {id:'hist-chant',titre:'Le chant sous les vagues',donneur:'neree',actif:true,
  description:'Le phare de la Côte s’est éteint, et chaque nuit des créatures gluantes remontent sur la plage en chantant. Nérée pense qu’une perle les appelle.',
  etapes:[{type:'vaincre',creature:'glub',nombre:4,lieu:'terres_cote',texte:'Repousser les glubs qui remontent sur la plage'},
   {type:'ramasser',lieu:'terres_cote',objet:'une perle chantante',texte:'Trouver la perle chantante dans le sable (Côte des Coquillages)'},
   {type:'lancer',lieu:'terres_cote',element:'lumiere',texte:'Rallumer le phare avec un sort de Lumière'},
   {type:'parler',pnj:'neree',texte:'Rapporter la perle à Nérée'}],
  recompense:{xp:260,or:170,essence:2}},
 {id:'hist-haldaran',titre:'La couronne d’Haldaran',donneur:'haldaran',actif:true,
  description:'Le fantôme du roi Haldaran erre dans les ruines de sa cité. Sa garde l’a trahi et a emporté sa couronne dans la mort. Tant qu’il ne l’aura pas retrouvée, il ne connaîtra pas le repos.',
  etapes:[{type:'vaincre',creature:'spectre',nombre:6,lieu:'terres_ruines',texte:'Affronter les spectres de la garde d’Haldaran (zone très dangereuse)'},
   {type:'ramasser',lieu:'terres_ruines',objet:'la couronne brisée',texte:'Retrouver la couronne brisée dans les ruines'},
   {type:'lancer',lieu:'terres_ruines',element:'lumiere',texte:'Bénir la couronne d’un sort de Lumière, au cœur des ruines'},
   {type:'parler',pnj:'haldaran',texte:'Rendre la couronne au roi Haldaran'}],
  recompense:{xp:420,or:260,cristal:4}}];
HISTOIRES.forEach(h=>{if(!CQUETES.some(c=>c.id===h.id))CQUETES.push(h);});
/* la baguette de Brisefer : récompense de « Une baguette pour un héros » */
{const _f=finishQuest;finishQuest=function(q){const r=_f.apply(this,arguments);
  if(q&&q.cq==='hist-haldaran')setTimeout(()=>say('👑 Le roi Haldaran pose la couronne sur sa tête. Un sourire, une lumière… puis il s’efface, enfin apaisé.','gm'),700);
  if(q&&q.cq==='hist-chant')setTimeout(()=>say('🌊 Le phare brille de nouveau sur la Côte. Au loin, le chant s’est tu.','gm'),700);
  if(q&&q.cq==='hist-lame'&&typeof giveGear==='function')setTimeout(()=>giveGear('w','brisefer','Forgée par Borin pour toi'),800);return r;};}
/* les ennemis des histoires : ils apparaissent près du lieu pendant l'étape « vaincre » */
const HIST_ENN={'hist-caravanes':{nom:'Orcs de Grokk',w:'glace',l:'feu',hp:4},'hist-aubin':{nom:'Orcs geôliers de Grokk',w:'glace',l:'feu',hp:5},'hist-brisefer':{nom:'Démons des cendres',w:'eau',l:'feu',hp:4},
 'hist-chant':{nom:'Glubs des profondeurs',w:'vent',l:'eau',hp:4},'hist-haldaran':{nom:'Spectres de la garde d’Haldaran',w:'lumiere',l:'ombre',hp:5}};
let HIST_T=0;
function histTick(dt){HIST_T-=dt;if(HIST_T>0||!started||S.zone!=='monde')return;HIST_T=1.5;
 for(const q of S.quests){const E=HIST_ENN[q.cq],s=curStep(q);if(!E||!s||s.kind!=='kill'||!s.loc)continue;const L=LOCBY[s.loc];if(!L||Math.hypot(player.x-L.x,player.z-L.z)>85)continue;
  const vivants=ENT.filter(e=>e.kind==='creature'&&e.data.hist===q.cq).length,manque=Math.min(3,s.n-s.got)-vivants;
  for(let i=0;i<manque;i++){let x,z,ok=false;for(let t=0;t<12&&!ok;t++){const a=Math.random()*TAU,r=8+Math.random()*18;x=L.x+Math.cos(a)*r;z=L.z+Math.sin(a)*r;ok=gh(x,z)>0.6&&isFree({x,z},1.2)&&Math.hypot(x-player.x,z-player.z)>10;}
   if(!ok)continue;const e=spawnCreatureAt(x,z,E.nom,E.w,E.l,E.hp);e.data.hist=q.cq;e.data.loc=s.loc;burst(x,gh(x,z)+1.2,z,0x8a3a1a,18,3);}}}
{const _w=world4Tick;world4Tick=function(dt){histTick(dt);return _w.apply(this,arguments);};}
/* l'Auberge de l'Aube : se reposer */
{const _d=buildDecor;buildDecor=function(){const r=_d.apply(this,arguments);const P=BATI_PLANS.find(p=>p.id==='halte_auberge');if(!P||P.x===undefined)return r;
  const D=BATI_TYPES.auberge.d*2,x=P.x+Math.sin(P.ry)*(D/2+1.4),z=P.z+Math.cos(P.ry)*(D/2+1.4);
  station({x,z,reach:2.6,hint:()=>'🍺 Auberge de l’Aube : repas et lit (10 💰)',act:()=>{if((S.or||0)<10){say('🍺 Maëlle : « Dix pièces le repas et le lit, mon petit. »','sys');return;}
   S.or-=10;fade(()=>{S.time=Math.min(S.time+60,23*60+50);if(typeof VIE!=='undefined')VIE.hp=VIE.max;mana=manaMax();say('🍺 Une soupe chaude, un vrai lit… Tu repars <b>en pleine forme</b>.','gm');save();});}});
  return r;};}
