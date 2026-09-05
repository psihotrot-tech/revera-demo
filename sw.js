/* Minimalan service worker — omogucava "Dodaj na pocetni ekran" i
   osnovni offline kes. Nije neophodan za rad sistema, ali poboljsava
   utisak instalacije na telefonu gosta.
   VAZNO: koristi "network-first" strategiju (ne cache-first) - svaka
   izmena u kodu odmah stize do gostiju cim su online; kes sluzi samo
   kao rezerva ako nema interneta. Stara cache-first verzija je
   uzrokovala da izmene (npr. lokalni QR/barkod fajlovi) ostanu
   "zaglavljene" na uredjajima koji su vec otvarali karticu. */

const CACHE = "revera-v2";
const ASSETS = ["card.html", "style.css", "config.js", "app.js"];

self.addEventListener("install", (e) => {
     self.skipWaiting();
     e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
     e.waitUntil(
            caches.keys()
              .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
              .then(() => self.clients.claim())
          );
});

self.addEventListener("fetch", (e) => {
     e.respondWith(
            fetch(e.request)
              .then((res) => {
                         const copy = res.clone();
                         caches.open(CACHE).then((c) => c.put(e.request, copy));
                         return res;
              })
              .catch(() => caches.match(e.request))
          );
});
