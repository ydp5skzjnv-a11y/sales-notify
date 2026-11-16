self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let d={};try{d=event.data?.json()||{};}catch{}
 event.waitUntil(self.registration.showNotification(d.title||'Ordine demo',{body:d.body||'Notifica simulata',icon:'/icons/icon-192.png',badge:'/icons/badge.png',tag:d.tag||undefined,data:d.data||{url:'/'},timestamp:d.timestamp||Date.now()}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();event.waitUntil((async()=>{
 const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
 if(windows.length){await windows[0].focus();return;}
 await clients.openWindow('/');
 })());
});
