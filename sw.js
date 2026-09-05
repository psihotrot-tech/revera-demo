/* Minimalan service worker — omogućava "Dodaj na početni ekran" i
   osnovni offline keš. Nije neophodan za rad sistema, ali poboljšava
      utisak instalacije na telefonu gosta. */

      const CACHE = "revera-v1";
      const ASSETS = ["card.html", "style.css", "config.js", "app.js"];

      self.addEventListener("install", (e) => {
        e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
        });

        self.addEventListener("fetch", (e) => {
          e.respondWith(
              caches.match(e.request).then((cached) => cached || fetch(e.request))
                );
                });
