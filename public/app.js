const $=id=>document.getElementById(id);
let connected=false;
const fields=['storeName','sourceName','minPrice','maxPrice','order','maxItems','interval'];
const notice=(message,error=false)=>{const el=$('notice');el.className='notice'+(error?' error':'');el.textContent=message;};
const values=()=>Object.fromEntries(fields.map(f=>[f,$(f).value]));
const fill=(s)=>{if(!s)return;for(const f of fields)if(s[f]!==undefined)$(f).value=s[f];};
const change=(running,subscribed)=>{ $('dot').className='dot'+(running?' on':'');$('status').textContent=running?'Invii automatici attivi':subscribed?'Push abilitate · timer fermo':'Push non abilitate';};
async function api(action,data={}){
 const response=await fetch('/.netlify/functions/control',{method:'POST',headers:{'content-type':'application/json','x-app-pin':$('pin').value},body:JSON.stringify({action,...data})});
 const result=await response.json().catch(()=>({error:'Risposta non valida dal server'}));
 if(!response.ok)throw new Error(result.error||'Errore '+response.status);
 return result;
}
function base64ToUint8Array(s){const str=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(str,c=>c.charCodeAt(0));}
function refreshPreview(){const s=values();$('preview').textContent=`${Number(s.minPrice||34.9).toFixed(2).replace('.',',')} €, 1 articolo da ${s.sourceName||'Modulo ordini demo'} · ${s.storeName||'Demo Store'} (simulato)`;}
async function doWork(fn){const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await fn();}catch(e){notice(e.message||String(e),true);}finally{buttons.forEach(b=>b.disabled=false);}}
$('connect').onclick=()=>doWork(async()=>{const state=await api('status');connected=true;$('controls').classList.remove('hidden');fill(state.settings);change(state.settings?.running,state.subscribed);refreshPreview();sessionStorage.setItem('sales-demo-pin',$('pin').value);notice('Dashboard connessa. Ora puoi abilitare le notifiche.');});
$('enable').onclick=()=>doWork(async()=>{
 if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))throw Error('Questo dispositivo non supporta Web Push. Su iPhone apri la PWA dalla schermata Home.');
 if(/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone)throw Error('Su iPhone devi prima installare questa app dalla schermata Home e aprirla dall’icona.');
 const key=(await api('public-key')).publicKey;
 const reg=await navigator.serviceWorker.register('/sw.js',{scope:'/'});await navigator.serviceWorker.ready;
 const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Permesso notifiche non concesso. Controlla Impostazioni → Notifiche.');
 let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToUint8Array(key)});
 await api('subscribe',{subscription:sub.toJSON()});change(false,true);notice('Notifiche push abilitate! Premi “Invia notifica di prova”.');
});
$('test').onclick=()=>doWork(async()=>{const result=await api('test',{settings:values()});fill(result.settings);notice('Push di prova inviata! Controlla le notifiche del telefono.');});
$('start').onclick=()=>doWork(async()=>{const result=await api('save',{settings:{...values(),running:true}});fill(result.settings);change(true,true);notice('Invio automatico avviato. Prima notifica tra circa '+result.settings.interval+' minuti; il cron può introdurre fino a circa 1 minuto di ritardo.');});
$('stop').onclick=()=>doWork(async()=>{const result=await api('save',{settings:{...values(),running:false}});change(false,true);notice('Invii automatici disattivati.');});
$('unsubscribe').onclick=()=>doWork(async()=>{const reg=await navigator.serviceWorker.getRegistration('/');const sub=await reg?.pushManager.getSubscription();if(sub)await sub.unsubscribe();await api('unsubscribe');change(false,false);notice('Dispositivo rimosso, notifiche ferme.');});
fields.forEach(f=>$(f).addEventListener('input',refreshPreview));
const saved=sessionStorage.getItem('sales-demo-pin');if(saved){$('pin').value=saved;$('connect').click();}
refreshPreview();
