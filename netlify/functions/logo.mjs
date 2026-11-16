import {store} from './_common.mjs';
export default async () => {
 const found=await store().getWithMetadata('custom-logo',{type:'arrayBuffer'});
 if(!found)return Response.redirect('/icons/icon-192.png',302);
 const type=found.metadata?.contentType||'image/png';
 return new Response(found.data,{headers:{'content-type':type,'cache-control':'public, max-age=60','access-control-allow-origin':'*'}});
};
