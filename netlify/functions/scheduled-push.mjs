import { ready,store,settings,makeOrder,send } from './_common.mjs';
export default async () => {
 if(!ready())return;
 const db=store();
 const s=settings(await db.get('settings',{type:'json'}));
 if(!s.running || !s.nextAt || Date.now()<s.nextAt)return;
 const sub=await db.get('subscription',{type:'json'});
 if(!sub)return;
 // Move next execution forward before sending; this limits repeats if the platform retries.
 s.nextAt=Date.now()+s.interval*60_000;
 const notification=makeOrder(s);s.order+=1;
 await db.setJSON('settings',s);
 try {await send(sub,notification);} catch(e) {
   console.error('Scheduled push error:',e);
   if([404,410].includes(e.statusCode)){await db.delete('subscription');s.running=false;s.nextAt=0;await db.setJSON('settings',s);}
 }
};
