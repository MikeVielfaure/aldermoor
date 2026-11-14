/* ================= SORTS UNIQUES : un sort par élément et par forme =================
   Avant, on pouvait apprendre « Flamme vive », « Lame de braise », « Écho de braise »… qui faisaient
   exactement la même chose (même élément, même forme). Désormais il n'existe qu'UN sort par couple
   élément × forme (8 × 3 = 24, plus les sorts spéciaux comme l'Oubli).
   Un parchemin, un cours ou le MJ qui enseigne un sort déjà connu (même élément, même forme) le fait
   monter de rang : II puis III. Chaque rang : −15 % de mana, −15 % de recharge, +15 % de puissance.
   Les anciennes sauvegardes sont fusionnées à l'ouverture (les doublons deviennent des rangs). */
const RANK_MAX=3,RANK_N=['','I','II','III'];
const spKey=sp=>sp.special?'sp:'+sp.special:sp.el+'|'+sp.form;
const spRank=sp=>clamp(sp&&sp.rank||1,1,RANK_MAX);
const sameSpell=sp=>S&&S.spells?S.spells.find(s=>spKey(s)===spKey(sp)):null;
const POOL_UNI=[];POOL.forEach(p=>{if(!POOL_UNI.some(q=>spKey(q)===spKey(p)))POOL_UNI.push(p);}); // un modèle par élément × forme
const spId=name=>String(name).toLowerCase().replace(/[^a-zà-ÿ0-9]+/g,'-');
// fait monter de rang le sort connu ; renvoie true si quelque chose a changé
function rankUp(known,from){const r=spRank(known);
 if(r>=RANK_MAX){gainXP(20);say('<b>'+esc(known.name)+'</b> est déjà à son rang maximum (III) : +20 XP.','sys');return false;}
 known.rank=r+1;gainXP(20);
 const alias=from&&from.name&&from.name.toLowerCase()!==known.name.toLowerCase()?' (« '+esc(from.name)+' » est une autre façon de le lancer)':'';
 say('✦ <b style="color:'+hex(ELEM[known.el].c)+'">'+esc(known.name)+'</b> passe au rang '+RANK_N[known.rank]+alias+' : moins de mana, recharge plus rapide, effet plus fort.','gm');
 chron(known.name+' : rang '+RANK_N[known.rank]);
 for(let i=0;i<30;i++){const a=Math.random()*TAU,r2=rnd(.3,1);PA.emit(player.x+Math.cos(a)*r2,player.y+rnd(0,2),player.z+Math.sin(a)*r2,0,rnd(1,3),0,ELEM[known.el].c,0.35,0.05,rnd(.6,1.2),0,1);}
 sfx('learn');updateHUD();save();return true;}
{const _l=learnSpell;learnSpell=function(sp){if(!sp)return false;const k=sameSpell(sp);
  if(k)return rankUp(k,sp)?'rang':false; // déjà connu (même élément, même forme) : pas de doublon
  sp.rank=1;return _l.apply(this,arguments);};}
// les parchemins, cours, coffres et duels proposent d'abord un élément × forme inconnu, sinon un sort à renforcer
{const _g=genSpell;genSpell=function(el,form){
  const onScroll=ENT.filter(e=>e.kind==='scroll').map(e=>spKey(e.data.spell));
  const can=POOL_UNI.filter(s=>(!el||s.el===el)&&(!form||s.form===form)&&!onScroll.includes(spKey(s)));
  const fresh=can.filter(s=>!sameSpell(s)),up=can.filter(s=>{const k=sameSpell(s);return k&&spRank(k)<RANK_MAX;});
  const c=fresh.length?fresh:up.length?up:can;if(!c.length)return _g.apply(this,arguments);
  const s=pick(c),k=sameSpell(s),b=k?{...s,name:k.name,inc:k.inc,desc:k.desc}:s;return {...b,id:spId(b.name)};};}
// coût et recharge selon le rang ; puissance via CAST_K (02-etat, utilisé par pow())
{const _c=spellCost;spellCost=function(sp){return Math.round(_c.apply(this,arguments)*(1-0.15*(spRank(sp)-1)));};}
{const _d=spellCd;spellCd=function(sp){return Math.round(_d.apply(this,arguments)*(1-0.15*(spRank(sp)-1))*100)/100;};}
{const _cs=castSpell;castSpell=function(sp){CAST_K=1+0.15*(spRank(sp)-1);try{return _cs.apply(this,arguments);}finally{CAST_K=1;}};}
// sauvegardes : les doublons deviennent des rangs (le sort placé dans un emplacement est gardé en priorité)
function mergeDupSpells(s){if(!s||!Array.isArray(s.spells))return 0;const slotted=new Set([].concat(s.slots||[],s.slotsAlt||[]).filter(Boolean));
 const keep=new Map(),drop={};
 s.spells.slice().sort((a,b)=>(slotted.has(b.id)?1:0)-(slotted.has(a.id)?1:0)).forEach(sp=>{const k=spKey(sp),K=keep.get(k);
  if(!K){keep.set(k,sp);sp.rank=clamp(sp.rank||1,1,RANK_MAX);}else{K.rank=Math.min(RANK_MAX,spRank(K)+spRank(sp));drop[sp.id]=K.id;}});
 const n=Object.keys(drop).length;if(!n)return 0;
 s.spells=s.spells.filter(sp=>!drop[sp.id]);
 const remap=arr=>{const seen=new Set();return (arr||[]).map(id=>{const v=drop[id]||id;if(!v||seen.has(v))return null;seen.add(v);return v;});};
 s.slots=remap(s.slots);if(Array.isArray(s.slotsAlt))s.slotsAlt=remap(s.slotsAlt);return n;}
{const _m=migrate;migrate=function(s){s=_m.apply(this,arguments);const n=mergeDupSpells(s);
  if(n)setTimeout(()=>say('✦ Ton grimoire a été rangé : '+n+' sort'+(n>1?'s':'')+' en double '+(n>1?'sont devenus':'est devenu')+' des rangs (II, III) de sorts que tu connais. Moins de sorts, mais plus forts.','gm'),2500);return s;};}
