/* ============================================================
     REVERA — podešavanja po klijentu (lokalu)
   Ovo je JEDINI fajl koji menjaš kad praviš novu instancu za
   novog klijenta (novi kafić/restoran/pekaru).
   ============================================================ */

const REVERA_CONFIG = {
    // --- Identitet lokala ---
  businessName: "Demo Kafić",
      businessId: "demo-kafic",          // mora biti jedinstveno, bez razmaka (koristi se kao ključ u bazi)
      logoText: null,                    // null = koristi Revera pečat-logo; ili stavi svoj emoji/tekst da ga zameniš
      primaryColor: "#5B3A29",           // boja brenda (koristi se za dugmad, progres, itd.)
      accentColor: "#D9A441",

      // --- Pravila programa lojalnosti ---
      stampsRequired: 10,                // koliko pečata za nagradu
      rewardText: "1 gratis kafa po izboru",

      // --- Sigurnost / anti-fraud ---
      claimCodeTtlSeconds: 120,          // koliko traje jednokratni kod koji osoblje generiše za gosta
      rescanCooldownSeconds: 15,         // koliko dugo isti kod ne može ponovo da se iskoristi (sprečava dupli sken)

      // --- Pristup (PIN) ---
      // Osnovna zaštita da slučajan prolaznik sa linkom ne uđe u skener/dashboard.
      // VAŽNO: ovo je zaštita na nivou ekrana, ne na nivou baze — dok firestore.rules
      // stoje otvorene (vidi taj fajl), neko ko direktno gađa bazu i dalje može da
      // piše. Za pravu sigurnost pre rada sa novcem, pređi na Firebase Auth (opisano
      // u README-u). Za pilot sa jednim-dva lokala ovo je sasvim dovoljno.
      auth: {
    staffPin: "1234",                // PIN za osoblje — otvara scanner.html
          ownerPin: "9999",                // PIN za vlasnika — otvara dashboard.html (radi i za scanner.html)
          sessionHours: 12,                // koliko dugo PIN važi na tom uređaju pre nego što traži ponovni unos
      },

        // --- SMS podsetnik za goste "u riziku" ---
        smsReminderTemplate: "Nedostajete nam u {biznis}! Dođite ovih dana po vaš sledeći pečat — nagrada vas čeka. 🙂",


        // --- Firebase (ostavi prazno / null da radi u DEMO režimu preko localStorage) ---
        // Kad napraviš Firebase projekat, nalepi svoj config ovde i sistem
        // automatski prelazi sa demo (localStorage) na pravu bazu u realnom vremenu.
        firebase: null,
        /* Primer kad budeš imao pravi projekat:
      firebase: {
    apiKey: "...",
          authDomain: "revera-demo.firebaseapp.com",
          projectId: "revera-demo",
          storageBucket: "revera-demo.appspot.com",
          messagingSenderId: "...",
          appId: "..."
},
  */
      };
