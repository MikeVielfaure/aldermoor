/* ================= LES ACADÉMIES ÉLÉMENTAIRES =================
   Chaque académie a un professeur par élément et un directeur. Parler à un professeur → puce « 📚 Cours de … » :
   il enseigne le prochain sort de son élément que tu ne connais pas, du plus simple au plus fort (attaque, utilitaire,
   zone ; ce sont les mêmes sorts que les parchemins, coffres ou quêtes : un sort appris ailleurs compte aussi).
   Un cours par jour et par professeur (S.acad.c[prof] = jour), il prend une heure. Quand tous les sorts de
   l'académie sont connus, le directeur propose une quête qui donne un sort inédit, enseigné nulle part ailleurs
   (S.acad.ok[académie]). Pour ajouter une académie (Cieux, Sombrité…) : une entrée dans ACADS + ses personnages. */
const ACAD_FORMES=['trait','util','zone'];
const ACADS=[{id:'primaires',n:'Académie des Éléments primaires',dir:'archimage',profs:{feu:'flambard',eau:'ondine',glace:'frimas',nature:'mirelle'},
 inedit:{name:'Concert des Quatre',inc:'Quattuor Elementa',el:'arcane',form:'zone',special:'quatre',legend:true,cost:50,cd:16,id:'acad-quatre',
  desc:'La nature, le feu, la glace puis l’eau déferlent tour à tour autour de toi. Seul l’Archimage l’enseigne.'},
 quete:{title:'Les Quatre Épreuves',desc:'L’Archimage veut voir les quatre éléments t’obéir, chacun là où il est chez lui.',steps:[
  {kind:'cast',loc:'arene',el:'feu',text:'Embraser l’Arène des duels avec un sort de Feu'},{kind:'cast',loc:'serre',el:'eau',text:'Arroser les Serres enchantées avec un sort d’Eau'},
  {kind:'cast',loc:'lac',el:'glace',text:'Geler le Lac des Murmures avec un sort de Glace'},{kind:'cast',loc:'foret',el:'nature',text:'Réveiller la Forêt de Sombrebois avec un sort de Nature'},
  {kind:'talk',npc:'archimage',text:'Revenir voir l’Archimage Aldric Hautval'}]}}];
/* les nouveaux personnages (Mirelle Fougère, déjà là, enseigne la Nature) */
const ACAD_PNJ=[
 {id:'flambard',name:'Pr. Ignace Flambard',role:'professeur de magie du Feu, enthousiaste et un peu trop bruyant, dit tout le temps « C’est feutastique ! »',home:'arene',els:['feu'],mdl:['moine',0xff8a5a],
  look:{skin:0xe8b890,hair:0xc8401a,style:'short',beard:0xc8401a,hat:0x7a1a0a,robe:0xb0301a,trim:0xffb030,h:1.05},
  lines:['C’est feutastique ! Tu veux apprendre à faire danser les flammes ?','Le feu, c’est comme l’enthousiasme : ça se partage… et ça brûle si on n’y prend pas garde.','Une étincelle de courage, et hop ! C’est feutastique !']},
 {id:'ondine',name:'Pr. Ondine Clairbief',role:'professeure de magie de l’Eau, calme et poétique, parle comme une rivière',home:'lac',els:['eau'],mdl:['clerc',0x8ac8ff],
  look:{skin:0xf2d0b8,hair:0x2a4a7a,style:'long',hat:0x1a3a6a,robe:0x2a6aaa,trim:0xc8f0ff,h:0.98},
  lines:['L’eau ne force jamais. Elle contourne… et elle finit toujours par passer.','Écoute le lac. Il murmure des sorts à qui sait se taire.','Laisse couler, jeune apprenti. La magie de l’eau ne se retient pas.']},
 {id:'frimas',name:'Pr. Hiverand Frimas',role:'professeur de magie de la Glace, l’air glacial mais un humour pince-sans-rire',home:'cour',els:['glace'],mdl:['sorcier',0xbfe8ff],
  look:{skin:0xf0e0d8,hair:0xe8f4ff,style:'short',beard:0xe8f4ff,hat:0x9ac8e8,robe:0x5a8ab8,trim:0xffffff,h:1.1},
  lines:['Du calme. De la précision. Et un cœur… de glace. Ha. Ha.','Un bon sort de glace, c’est comme une bonne blague : tout est dans la froideur.','Ne glisse pas sur mes leçons, apprenti.']},
 {id:'archimage',name:'Archimage Aldric Hautval',role:'directeur de l’Académie des Éléments primaires, sage et malicieux, parle peu mais juste',home:'chateau',els:['feu','eau','glace','nature'],mdl:['sorcier',0xfff0c0],
  look:{skin:0xe8c8a8,hair:0xf0f0f0,style:'long',beard:0xf8f8f8,hat:0x3a2a6a,robe:0xe8e0f8,trim:0xffd24a,h:1.12},
  lines:['Les quatre éléments primaires… tout commence par eux.','Mes professeurs t’apprendront ce qu’ils savent. Moi, j’enseigne ce qu’on ne trouve nulle part ailleurs.','Un sorcier pressé est un sorcier qui se brûle.']}];
ACAD_PNJ.forEach(p=>{if(NPCS.some(n=>n.id===p.id))return;NPCS.push({id:p.id,name:p.name,role:p.role,home:p.home,els:p.els,cl:[],look:p.look});NPCBY[p.id]=NPCS[NPCS.length-1];MDL_PERSO[p.id]=p.mdl;LINES[p.id]=p.lines.slice();});
const ACAD_DIT={flambard:{cours:'Regarde bien : on inspire, on sent la chaleur… et on la libère ! Allez, à toi !',bravo:'C’est feutastique ! Tu as compris du premier coup !',fini:'Tu connais déjà tous mes sorts de Feu ! C’est… feutastique !'},
 ondine:{cours:'Ferme les yeux. Sens l’eau qui bouge en toi… et laisse-la couler dans ta baguette.',bravo:'Voilà. Doux comme une source, fort comme une crue.',fini:'Tu connais déjà toute la magie de l’Eau que j’enseigne. Le lac est fier de toi.'},
 frimas:{cours:'Immobile. Respire lentement. Le froid vient de la patience.',bravo:'Correct. Je dirais même : impeccable. C’est rare. Ne t’y habitue pas.',fini:'Tu sais déjà tout de la Glace que j’enseigne. Je n’ai plus rien à t’apprendre. Ça me glace.'},
 mirelle:{cours:'Oh, tu es là ! Attends, où ai-je mis… ah ! Pose la main sur cette pousse et parle-lui gentiment.',bravo:'Elle a fleuri ! Tu as la main verte, mon petit !',fini:'Tu connais déjà toute la magie de la Nature que j’enseigne… enfin je crois. Oui, j’en suis sûre !'}};
const ACAD_PROF={};ACADS.forEach(A=>{for(const el in A.profs)ACAD_PROF[A.profs[el]]={A,el};});
const acadSort=(el,f)=>POOL_UNI.find(p=>p.el===el&&p.form===f);
function acadNext(el){for(const f of ACAD_FORMES){const s=acadSort(el,f);if(s&&!sameSpell(s))return Object.assign({},s,{id:spId(s.name)});}return null;}
function acadCount(A){let n=0,t=0;for(const el in A.profs)for(const f of ACAD_FORMES){const s=acadSort(el,f);if(s){t++;if(sameSpell(s))n++;}}return [n,t];}
const acadState=()=>{S.acad=S.acad||{};S.acad.c=S.acad.c||{};S.acad.ok=S.acad.ok||{};return S.acad;};
function acadCours(pid){const {A,el}=ACAD_PROF[pid],P=NPCBY[pid],D=ACAD_DIT[pid],st=acadState(),sp=acadNext(el);
 if(!sp){line('n',D.fini);const [n,t]=acadCount(A);if(n>=t&&!st.ok[A.id])line('n','Tu connais tout ce que l’Académie enseigne. Va voir '+NPCBY[A.dir].name+', au château.');return;}
 if(st.c[pid]===S.day){line('n','Un cours par jour, pas plus ! Reviens demain.');return;}
 st.c[pid]=S.day;line('n',D.cours);save();
 setTimeout(()=>{closeDlg();fade(()=>{S.time=Math.min(S.time+60,23*60+50);learnSpell(sp);say('<b>'+esc(P.name)+'</b> : '+esc(D.bravo),'gm');
  const [n,t]=acadCount(A);if(n>=t&&!st.ok[A.id])setTimeout(()=>say('<b>'+esc(P.name)+'</b> : tu as appris tout ce que l’Académie enseigne ! Va voir <b>'+esc(NPCBY[A.dir].name)+'</b>, au château.','gm'),1800);save();});},1500);}
function acadDir(A){const st=acadState(),[n,t]=acadCount(A),D=NPCBY[A.dir];
 if(st.ok[A.id]){line('n','Tu maîtrises le '+A.inedit.name+'. Peu de sorciers peuvent en dire autant.');return;}
 if(S.quests.some(q=>q.acad===A.id)){line('n','Les Quatre Épreuves t’attendent. Les éléments n’aiment pas patienter.');return;}
 if(n<t){line('n','Tu connais '+n+' des '+t+' sorts enseignés ici. Suis les cours de nos professeurs, puis reviens me voir.');return;}
 line('n','Tu as tout appris. Il reste un sort que je n’enseigne qu’aux meilleurs : le '+A.inedit.name+'. Mais d’abord, prouve que les quatre éléments t’obéissent.');
 const k=S.quests.length;addQuest({title:A.quete.title,desc:A.quete.desc,giver:D.id,acad:A.id,steps:A.quete.steps.map(s=>Object.assign({},s)),reward:{xp:200,spell:Object.assign({},A.inedit)}});
 if(S.quests.length>k)line('sys','Quête acceptée : '+A.quete.title);}
/* les puces du dialogue */
{const _od=openDlg;openDlg=function(ctx){const r=_od.apply(this,arguments);if(ctx&&ctx.mode==='talk'&&ctx.npc){const id=ctx.npc.id,chip=(t,fn)=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.onclick=()=>{b.remove();fn();};$('#chips').prepend(b);};
  if(ACAD_PROF[id])chip('📚 Cours '+deEl(ACAD_PROF[id].el),()=>acadCours(id));
  for(const A of ACADS)if(A.dir===id)chip('🎓 '+A.n,()=>acadDir(A));}return r;};}
{const _f=finishQuest;finishQuest=function(q){const r=_f.apply(this,arguments);if(q&&q.acad){acadState().ok[q.acad]=S.day||1;save();}return r;};}
/* le sort inédit : quatre vagues de suite, avec les vrais effets de chaque élément sur le monde */
function castQuatre(sp){['nature','feu','glace','eau'].forEach((el,i)=>setTimeout(()=>{if(started)doZone({name:sp.name,el,form:'zone',rank:spRank(sp)});},i*420));say('🌈 Les quatre éléments répondent à ton appel !','sys');}
{const _z=doZone;doZone=function(sp){if(sp&&sp.special==='quatre')return castQuatre(sp);return _z.apply(this,arguments);};}
SP_IC.quatre='🌈';
/* une fois, au début d'une partie : on signale que les professeurs donnent des cours */
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);const st=acadState();if(!st.hint){st.hint=1;setTimeout(()=>say('🎓 Les professeurs de l’<b>Académie des Éléments primaires</b> donnent des cours : parle-leur pour apprendre leurs sorts.','gm'),9000);}return r;};}
