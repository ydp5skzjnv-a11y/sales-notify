import {tick} from './_scheduler.mjs';
import { authorized, ready, json, settings, store, makeOrder, send } from './_common.mjs';
export default async (req) => {
 if(req.method !== 'POST')return json({error:'Metodo non consentito'},405);
 if(!ready())return json({error:'Configurazione Netlify mancante: APP_PIN o VAPID'},503);
 if(!authorized(req))return json({error:'PIN non valido'},401);
 try {
  const b=await req.json();const action=b.action;const db=store();
  if(action==='public-key')return json({publicKey:process.env.VAPID_PUBLIC_KEY});
  if(action==='diagnose') {const last=await db.get('last-scheduler-result',{type:'json'});const s=settings(await db.get('settings',{type:'json'}));return json({running:s.running,nextAt:s.nextAt,last});}
  if(action==='run-now'){return json(await tick(true));}
  if(action==='upload-logo') {
    if(!/^data:image\/(png|jpeg|webp);base64,/.test(b.image||''))return json({error:'Usa un logo PNG, JPG o WebP'},400);
    const type=b.image.slice(5,b.image.indexOf(';'));const raw=b.image.split(',')[1];
    if(raw.length>500000)return json({error:'Logo troppo grande: massimo circa 350 KB'},400);
    const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
    await db.set('custom-logo',bytes.buffer,{metadata:{contentType:type}});
    return json({ok:true,url:'/.netlify/functions/logo?v='+Date.now()});
  }
  if(action==='status') {
   const s=await db.get('settings',{type:'json'});
   const sub=await db.get('subscription',{type:'json'});
   return json({settings:s||settings(),subscribed:!!sub});
  }
  if(action==='subscribe') {
   const sub=b.subscription;
   if(!sub?.endpoint?.startsWith('https://')||!sub?.keys?.p256dh||!sub?.keys?.auth)return json({error:'Iscrizione push non valida'},400);
   await db.setJSON('subscription',sub);
   return json({ok:true});
  }
  if(action==='unsubscribe') {await db.delete('subscription'); const s=settings(await db.get('settings',{type:'json'}));s.running=false;await db.setJSON('settings',s);return json({ok:true});}
  if(action==='save') {
   const old=settings(await db.get('settings',{type:'json'}));
   const s=settings({...b.settings,order:old.order===1074 && !old.running && !old.nextAt ? b.settings?.order : old.order});
   if(s.running && !(await db.get('subscription',{type:'json'})))return json({error:'Attiva prima le notifiche push'},400);
   if(s.running && (!old.running || old.interval!==s.interval))s.nextAt=Date.now()+s.interval*60_000;
   if(!s.running)s.nextAt=0;
   await db.setJSON('settings',s);return json({ok:true,settings:s});
  }
  if(action==='test') {
   const sub=await db.get('subscription',{type:'json'});
   if(!sub)return json({error:'Attiva prima le notifiche push'},400);
   const s=settings(await db.get('settings',{type:'json'})||b.settings);
   const notification=makeOrder(s);
   await send(sub,notification);
   s.order+=1;await db.setJSON('settings',s);
   return json({ok:true,notification,settings:s});
  }
  return json({error:'Azione sconosciuta'},400);
 } catch(e) {console.error(e);return json({error:'Errore backend: '+String(e.message||e)},500);}
};
