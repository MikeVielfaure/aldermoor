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
  lines:['On a creusé trop profond. On a réveillé quelque chose.','La fonderie est froide depuis l’incendie. Sans elle, Brisefer meurt.','Écoute… tu entends ? La montagne gronde.']}
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
  recompense:{xp:350,or:100}}];
HISTOIRES.forEach(h=>{if(!CQUETES.some(c=>c.id===h.id))CQUETES.push(h);});
/* la baguette de Brisefer : récompense de « Une baguette pour un héros » */
{const _f=finishQuest;finishQuest=function(q){const r=_f.apply(this,arguments);if(q&&q.cq==='hist-lame'&&typeof giveGear==='function')setTimeout(()=>giveGear('w','brisefer','Forgée par Borin pour toi'),800);return r;};}
/* les ennemis des histoires : ils apparaissent près du lieu pendant l'étape « vaincre » */
const HIST_ENN={'hist-caravanes':{nom:'Orcs de Grokk',w:'glace',l:'feu',hp:4},'hist-aubin':{nom:'Orcs geôliers de Grokk',w:'glace',l:'feu',hp:5},'hist-brisefer':{nom:'Démons des cendres',w:'eau',l:'feu',hp:4}};
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
