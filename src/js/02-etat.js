/* ================= ÉTAT ================= */
let S={time:17.5*60};
function newState(name){return {v:1,name:name||'Apprenti',day:1,time:8*60,xp:0,spells:[{...POOL[0],id:'etincelle'}],sel:0,talents:{},mastery:{},combos:[],slots:['etincelle',null,null,null],quests:[],done:[],chron:[],track:null,courses:[],npcLoc:{},locId:null};}
const SAVE_KEY='aldermoor-save-v1';
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function load(){try{const t=localStorage.getItem(SAVE_KEY);return t?JSON.parse(t):null;}catch(e){return null;}}
let QL=1;try{const q=localStorage.getItem('aldermoor-q');if(q)QL=q==='uq'?2:q==='hq'?1:0;}catch(e){}let HQ=QL>=1;
const lvl=()=>1+Math.floor(S.xp/100);
const fmtTime=m=>{m=Math.floor(m);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
function chron(t){S.chron.push({d:S.day,h:fmtTime(S.time),t});if(S.chron.length>80)S.chron.shift();}
const tal=id=>(S.talents&&S.talents[id])||0;
const rankOf=l=>{let r=RANKS[0];RANKS.forEach(x=>{if(l>=x.min)r=x;});return r;};
const mLvl=el=>Math.min(10,Math.floor(((S.mastery||{})[el]||0)/30));
const ptsTotal=()=>lvl()-1+(S.relics||0)+ELS.reduce((a,e)=>a+Math.floor(mLvl(e)/3),0);
const ptsSpent=()=>Object.values(S.talents||{}).reduce((a,b)=>a+b,0);
const ptsFree=()=>ptsTotal()-ptsSpent();
let CAST_K=1; // rang du sort en cours de lancement (19b-sorts-uniques)
const pow=el=>(1+0.25*tal(el+'_pow')+0.03*mLvl(el))*wMul(el)*(BUFF.puissance?1.3:1)*karmaMul(el)*CAST_K;
const manaMax=()=>100+25*tal('reserve');
const manaRegen=()=>9*(1+0.3*tal('flux'))*(lvl()>=15?1.5:1)*(typeof player!=='undefined'&&player.grounded&&player.spd<0.05&&!FLY.on?1.8:1); // immobile : méditation
function migrate(s){s.inv=s.inv||{};s.rep=s.rep||{};s.zone='monde';s.talents=s.talents||{};s.mastery=s.mastery||{};s.combos=s.combos||[];
 s.spells.forEach(sp=>{const p=POOL.find(x=>x.name.toLowerCase()===String(sp.name).toLowerCase());if(p){sp.form=p.form;sp.desc=p.desc;sp.inc=p.inc;}if(!FORMS[sp.form])sp.form='trait';if(!sp.id)sp.id=String(sp.name).toLowerCase().replace(/[^a-zà-ÿ0-9]+/g,'-');});
 if(!Array.isArray(s.slots))s.slots=[];
 s.slots=s.slots.slice(0,4).map(id=>s.spells.some(x=>x.id===id)?id:null);while(s.slots.length<4)s.slots.push(null);
 for(let i=0;i<4;i++){if(s.slots[i])continue;const used=s.spells.filter(x=>s.slots.includes(x.id));const cand=s.spells.filter(x=>!s.slots.includes(x.id));if(!cand.length)break;const c=cand.find(x=>!used.some(u=>u.el===x.el))||cand.find(x=>!used.some(u=>u.form===x.form))||cand[0];s.slots[i]=c.id;}
 return s;}
function gainXP(n){const before=lvl();const rb=rankOf(before);S.xp+=n;
 if(lvl()>before){say('✦ Niveau '+lvl()+' ! +'+(lvl()-before)+' point de talent (Grimoire › Talents)','gm');const rn=rankOf(lvl());
  if(rn.n!==rb.n){say('🎓 Tu deviens <b>'+rn.n+'</b> !'+(rn.slots>rb.slots?' Nouvel emplacement de sort débloqué.':'')+(rn.n==='Archimage'?' Ta magie se régénère 50 % plus vite.':''),'gm');chron('Rang atteint : '+rn.n);}
  levelFx();}}
function levelFx(){if(!player.H)return;for(let i=0;i<70;i++){const a=Math.random()*TAU,r=rnd(.4,1.2);PA.emit(player.x+Math.cos(a)*r,player.y+rnd(0,.5),player.z+Math.sin(a)*r,0,rnd(2,5),0,i%2?0xf3cf7a:0xffffff,0.35,0.05,rnd(.8,1.5),0,0.5);}flash(player.x,player.y+1.5,player.z,0xf3cf7a,3,1);}


