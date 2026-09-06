/* ============================================================
   REVERA — podešavanja po klijentu (lokalu)
   Ovo je JEDINI fajl koji menjaš kad praviš novu instancu za
   novog klijenta (novi kafić/restoran/pekaru).
   ============================================================ */

// NAPOMENA: većinu polja ispod (boje, broj pečata, tekst nagrade, PIN-ovi,
// SMS tekst, riskDays...) vlasnik lokala sada može SAM da menja kroz
// dashboard.html → tab "Podešavanja", bez ikakvog dodirivanja ovog fajla —
// te promene se čuvaju odvojeno (Firestore ili localStorage u DEMO režimu)
// i automatski preklapaju (override) vrednosti ispod na svim ekranima.
// Vrednosti ovde i dalje služe kao PODRAZUMEVANE (pre nego što vlasnik
// išta promeni) i kao identitet lokala (businessId, firebase) koji se i
// dalje menja samo ovde, ručno, pri podešavanju novog klijenta.
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
     riskDays: 14,                      // posle koliko dana bez posete je gost "u riziku" (dashboard)

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
     firebase: {
            apiKey: "AIzaSyCRTqtUNg6gv7tfe-dQDPUCahISZssP9io",
            authDomain: "reversa-afef5.firebaseapp.com",
            projectId: "reversa-afef5",
            storageBucket: "reversa-afef5.firebasestorage.app",
            messagingSenderId: "449422642238",
            appId: "1:449422642238:web:2d68ccf4f6429f7d6ed56f"
     },
};
