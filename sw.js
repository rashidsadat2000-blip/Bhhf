/* sw.js — کش برای کار کردن آفلاین */
var CACHE='sultan-v1';
var CORE=['./','./index.html','./manifest.json','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){});}));
  }).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);

  /* کتابخانه‌های Firebase: اول کش، تا آفلاین هم بالا بیاید */
  if(url.hostname==='www.gstatic.com'){
    e.respondWith(caches.match(req).then(function(hit){
      return hit||fetch(req).then(function(res){
        var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});return res;
      });
    }));
    return;
  }

  /* درخواست‌های ابری (Firestore، ورود، گوگل) دست‌نخورده بروند */
  if(url.origin!==self.location.origin)return;

  /* فایل‌های خود برنامه: اول اینترنت، اگر نبود از کش */
  e.respondWith(fetch(req).then(function(res){
    if(res&&res.status===200){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});}
    return res;
  }).catch(function(){
    return caches.match(req).then(function(hit){
      return hit||(req.mode==='navigate'?caches.match('./index.html'):undefined);
    });
  }));
});
