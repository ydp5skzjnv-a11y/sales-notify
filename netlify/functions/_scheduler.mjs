import { ready, store, settings, makeOrder, send } from './_common.mjs';
export async function tick(force=false) {
 if(!ready())return {ok:false,reason:'Configurazione VAPID o PIN mancante'};
 const db=store();const current=await db.get('settings',{type:'json'});
 const s=settings(current);
 if(!s.running && !force)return {ok:true,sent:false,reason:'Timer disattivato'};
 if(!force && (!s.nextAt || Date.now()<s.nextAt))return {ok:true,sent:false,reason:'Non ancora previsto',nextAt:s.nextAt};
 const sub=await db.get('subscription',{type:'json'});
 if(!sub)return {ok:false,sent:false,reason:'Nessuna iscrizione push sul server'};
 try {
  const notification=makeOrder(s);
  await send(sub,notification);
  s.order+=1;
  s.nextAt=Date.now()+s.interval*60_000;
  await db.setJSON('settings',s);
  const report={ok:true,sent:true,at:Date.now(),nextAt:s.nextAt};
  await db.setJSON('last-scheduler-result',report);
  return report;
 }catch(e){
  const report={ok:false,sent:false,at:Date.now(),reason:String(e.message||e),statusCode:e.statusCode||null};
  await db.setJSON('last-scheduler-result',report);
  if([404,410].includes(e.statusCode)){await db.delete('subscription');s.running=false;s.nextAt=0;await db.setJSON('settings',s);}
  return report;
 }
}
