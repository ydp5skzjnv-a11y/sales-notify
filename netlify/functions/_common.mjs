import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

export function store() { return getStore({ name: 'sales-demo-push', consistency: 'strong' }); }
export function json(data, status=200) { return new Response(JSON.stringify(data), { status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'} }); }
export function authorized(req) { const pin = process.env.APP_PIN; return !!pin && req.headers.get('x-app-pin') === pin; }
export function ready() {return !!(process.env.APP_PIN && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);}
export function settings(input={}) {
 const clean=(s,n)=>String(s??'').replace(/[<>\n\r]/g,'').trim().slice(0,n);
 const interval=Math.max(1,Math.min(60,Number.parseInt(input.interval,10)||5));
 const min=Math.max(1,Math.min(99999,Number(input.minPrice)||34.9));
 const max=Math.max(min,Math.min(99999,Number(input.maxPrice)||59.9));
 return {storeName:clean(input.storeName,50)||'Demo Store',sourceName:clean(input.sourceName,60)||'Modulo ordini demo',minPrice:min,maxPrice:max,order:Math.max(1,Math.min(9999999,Number.parseInt(input.order,10)||1074)),maxItems:Math.max(1,Math.min(10,Number.parseInt(input.maxItems,10)||2)),interval, running:!!input.running, nextAt:Number(input.nextAt)||0};
}
export function configurePush() {
 webpush.setVapidDetails(process.env.VAPID_SUBJECT,process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
}
export function makeOrder(s) {
 const amount=(Math.round((s.minPrice+Math.random()*(s.maxPrice-s.minPrice))*100)/100).toFixed(2).replace('.',',');
 const count=1+Math.floor(Math.random()*s.maxItems);
 const n=s.order;
 const title=`Ordine #${n} · DEMO`;
 const body=`${amount} €, ${count} ${count===1?'articolo':'articoli'} da ${s.sourceName} · ${s.storeName} (simulato)`;
 return {title,body,icon:'/.netlify/functions/logo',badge:'/icons/badge.png',tag:`demo-sale-${n}`,data:{url:'/'},timestamp:Date.now()};
}
export async function send(subscription,payload) {configurePush();await webpush.sendNotification(subscription,JSON.stringify(payload),{TTL:3600,urgency:'normal'});}
