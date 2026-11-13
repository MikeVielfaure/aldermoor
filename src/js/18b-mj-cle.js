/* ================= MJ IA AVEC LA CLÉ DU JOUEUR (hors artifact claude.ai) =================
   La clé n'est JAMAIS dans le code ni dans le dépôt : le joueur la colle dans Options ⚙, elle reste dans le
   localStorage de son appareil et ne part que vers l'API Anthropic. Le SDK officiel est chargé à la demande. */
const MJ_SDK='https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.8.0/+esm';
// prix en $ par million de jetons (entrée / sortie), pour l'estimation affichée au joueur
const MJ_MODELS=[
 {id:'claude-opus-5-5',n:'Opus 5.5 (le plus fin)',pi:4,po:20,fb:true},
 {id:'claude-sonnet-5-5',n:'Sonnet 5.5 (équilibré)',pi:2,po:10,fb:true},
 {id:'claude-haiku-5-5',n:'Haiku 5.5 (rapide, économique)',pi:0.1,po:0.5,fb:false}];
const lsGet=k=>{try{return localStorage.getItem(k)||'';}catch(e){return '';}};
const lsSet=(k,v)=>{try{if(v)localStorage.setItem(k,v);else localStorage.removeItem(k);}catch(e){}};
const mjKey=()=>lsGet('aldermoor-mj-key');
const mjModel=()=>MJ_MODELS.find(m=>m.id===lsGet('aldermoor-mj-model'))||MJ_MODELS[0];
const MJ_USE=(()=>{try{return JSON.parse(lsGet('aldermoor-mj-use'))||{};}catch(e){return {};}})();
let mjSdk=null,mjClient=null,mjClientKey='',mjPlain=false,mjSrc='',mjWarned={};
const MJ_MSG={
 bad_key:'🔑 Ta clé Claude est refusée. Vérifie-la dans Options ⚙ → Maître du Jeu IA.',
 network:'Le MJ IA est injoignable (connexion ?). Le MJ classique improvise.',
 refusal:'Le MJ IA préfère ne pas répondre à ça. Le MJ classique improvise.',
 bad_json:'Le MJ IA s’est embrouillé. Le MJ classique improvise.'};
function mjErr(code,msg){const e=new Error(msg||code);e.code=code;return e;}
function mjWrap(e){const A=mjSdk;if(e&&e.code&&(MJ_MSG[e.code]||e.code==='rate_limited'))return e;
 if(A){ // du plus précis au plus général
  if(e instanceof A.AuthenticationError||e instanceof A.PermissionDeniedError)return mjErr('bad_key');
  if(e instanceof A.RateLimitError)return mjErr('rate_limited');
  if(e instanceof A.BadRequestError)return mjErr('bad_request',e.message);
  if(e instanceof A.APIConnectionError)return mjErr('network');
  if(e instanceof A.APIError)return mjErr('api',e.message);}
 return mjErr('network',e&&e.message);}
async function mjGetClient(){const key=mjKey();if(!key)throw mjErr('bad_key');
 if(!mjSdk){const m=await import(MJ_SDK);mjSdk=m.default||m.Anthropic;}
 if(!mjClient||mjClientKey!==key){mjClient=new mjSdk({apiKey:key,dangerouslyAllowBrowser:true,maxRetries:1,timeout:60000});mjClientKey=key;mjPlain=false;}
 return mjClient;}
function mjParse(t){t=String(t||'');const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<=a)return null;try{const o=JSON.parse(t.slice(a,b+1));return o&&typeof o==='object'&&!Array.isArray(o)?o:null;}catch(e){return null;}}
function mjCount(M,u){if(!u)return;const inp=(u.input_tokens||0)+(u.cache_creation_input_tokens||0)*1.25+(u.cache_read_input_tokens||0)*0.1;
 MJ_USE.calls=(MJ_USE.calls||0)+1;MJ_USE.usd=(MJ_USE.usd||0)+(inp*M.pi+(u.output_tokens||0)*M.po)/1e6;lsSet('aldermoor-mj-use',JSON.stringify(MJ_USE));}
async function mjCall(prompt){const c=await mjGetClient(),M=mjModel();
 // les règles (stables) vont dans le prompt système mis en cache ; l'état du monde (changeant) dans le message
 const sys=prompt.startsWith(RULES)?RULES:'',user=sys?prompt.slice(RULES.length).trim():prompt;
 const body={model:M.id,max_tokens:16000,output_config:{effort:'low'},messages:[{role:'user',content:user}]};
 if(sys)body.system=[{type:'text',text:sys,cache_control:{type:'ephemeral'}}];
 let r=null;
 if(M.fb&&!mjPlain){ // repli automatique côté serveur si le modèle décline ; si l'option est refusée, on continue sans
  try{r=await c.beta.messages.create(Object.assign({betas:['server-side-fallback-2026-07-01'],fallbacks:'default'},body));}
  catch(e){if(e instanceof mjSdk.BadRequestError)mjPlain=true;else throw e;}}
 if(!r)r=await c.messages.create(body);
 mjCount(M,r.usage);
 if(r.stop_reason==='refusal')throw mjErr('refusal');
 const o=mjParse(r.content.filter(b=>b.type==='text').map(b=>b.text).join(''));if(!o)throw mjErr('bad_json');return o;}
const MJ_API={own:true,json:async prompt=>{try{return await mjCall(prompt);}catch(e){throw mjWrap(e);}}};
function mjFail(e){const c=e&&e.code;if(c==='bad_key'){aiState='off';aiBadge();}
 const t=MJ_MSG[c]||('Le MJ IA a un souci : '+esc(String(e&&e.message||'erreur inconnue').slice(0,170))+' — le MJ classique improvise.');
 if(mjWarned[c]&&performance.now()-mjWarned[c]<60000)return;mjWarned[c]=performance.now();say(t,'sys');}
async function mjInit(){
 try{if(window.claude&&typeof window.claude.use==='function'){const s=await window.claude.use('sample');if(s){SAMPLE=s;aiState='on';mjSrc='artifact';}}}catch(e){}
 if(mjSrc!=='artifact'){if(mjKey()){SAMPLE=MJ_API;aiState='on';mjSrc='cle';}else{SAMPLE=null;aiState='off';mjSrc='';}}
 aiBadge();mjStartNote();}
function mjStartNote(){const n=$('#mj-note'),b=$('#b-mjkey');if(!n||!b)return;
 if(mjSrc==='artifact'){b.classList.add('hidden');n.textContent='Le Maître du Jeu IA utilise ton compte Claude : une autorisation te sera demandée au premier échange.';}
 else{b.classList.remove('hidden');b.textContent=mjSrc==='cle'?'Maître du Jeu IA : clé branchée ✦':'Maître du Jeu IA : brancher ma clé Claude';
  n.textContent=mjSrc==='cle'?'Le Maître du Jeu IA répond avec ta clé Claude.':'Sans clé Claude, un Maître du Jeu classique (sans IA) fait vivre le monde.';}}

/* ---------- panneau « Maître du Jeu IA » ---------- */
function openMjk(){$('#mjk').classList.remove('hidden');renderMjk();}
function renderMjk(msg,ok){const k=mjKey(),M=mjModel(),art=mjSrc==='artifact';
 const st=art?'✦ IA Claude active (compte claude.ai)':aiState==='on'?'✦ IA Claude active (ta clé)':k?'Clé enregistrée, mais MJ IA à l’arrêt':'MJ classique (pas de clé)';
 let h='<div class="op"><span>État</span><b style="font-size:13px;color:'+(aiState==='on'?'#ffd9f4':'var(--mute)')+'">'+st+'</b></div>';
 if(!art){
  h+='<div class="op" style="display:block"><div style="margin-bottom:7px">Ta clé Claude (API)</div><input id="mjk-in" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+(k?'clé enregistrée : '+esc(k.slice(0,10))+'…'+esc(k.slice(-4)):'sk-ant-…')+'">'+
   '<div style="display:flex;gap:8px;margin-top:9px"><button class="gold" id="mjk-ok" style="flex:1;padding:11px 0">Enregistrer et tester</button>'+(k?'<button class="ghost sm" id="mjk-del">Oublier la clé</button>':'')+'</div>'+
   (msg?'<div id="mjk-msg" style="margin-top:9px;font-size:13px;color:'+(ok?'#9fe8a0':'#ffb0a0')+'">'+msg+'</div>':'')+'</div>';
  h+='<div class="op"><span>Modèle</span><button class="ghost sm" id="mjk-mod">'+esc(M.n)+'</button></div>';
  h+='<div class="op"><span>Utilisation</span><span class="mu">'+(MJ_USE.calls||0)+' échange'+((MJ_USE.calls||0)>1?'s':'')+' · ≈ '+(MJ_USE.usd||0).toFixed(2).replace('.',',')+' $</span></div>';
  h+='<p class="note"><b>Où trouver une clé ?</b> Sur <b>platform.claude.com</b> (la Console Anthropic) → « API keys » → « Create key ». C’est un compte séparé de l’abonnement claude.ai : il faut y mettre un peu de crédit. Pense à fixer une limite de dépense.</p>'+
   '<p class="note">La clé reste sur cet appareil et ne part que vers Anthropic. Le MJ n’est appelé que quand tu lui parles, quand tu parles à un personnage, à la fin d’un cours et au lever du jour. Le coût affiché est une estimation.</p>';}
 else h+='<p class="note">Dans un artifact claude.ai, le MJ utilise directement ton compte : aucune clé à fournir.</p>';
 $('#mjk-b').innerHTML=h;if(art)return;
 $('#mjk-mod').onclick=()=>{const i=MJ_MODELS.indexOf(mjModel());lsSet('aldermoor-mj-model',MJ_MODELS[(i+1)%MJ_MODELS.length].id);renderMjk();};
 const del=$('#mjk-del');if(del)del.onclick=()=>{lsSet('aldermoor-mj-key','');mjClient=null;mjInit();renderMjk('Clé oubliée : le MJ classique reprend.',true);};
 $('#mjk-ok').onclick=async()=>{const v=$('#mjk-in').value.trim()||mjKey();if(!v){renderMjk('Colle d’abord ta clé.',false);return;}
  lsSet('aldermoor-mj-key',v);$('#mjk-ok').textContent='Test en cours…';$('#mjk-ok').disabled=true;
  try{const c=await mjGetClient();await c.models.retrieve(mjModel().id);await mjInit();renderMjk('Clé valide : le Maître du Jeu IA est branché ✦',true);}
  catch(e){const w=mjWrap(e);
   if(w.code==='bad_key'){lsSet('aldermoor-mj-key',k);mjClient=null;await mjInit();renderMjk('Clé refusée par Anthropic. Vérifie qu’elle est complète (elle commence par « sk-ant- »).',false);}
   else{await mjInit();renderMjk(w.code==='network'?'Clé enregistrée, mais impossible de joindre Anthropic pour la tester (connexion ?).':'Clé enregistrée, mais le test a échoué : '+esc(String(w.message).slice(0,160)),false);}}};}
$('#mjk-x').onclick=()=>$('#mjk').classList.add('hidden');
$('#b-mjkey').onclick=openMjk;
$('#ai-badge').onclick=()=>{if(started&&!anyModal()){sfx('click');openMjk();}};
