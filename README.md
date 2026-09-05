# Revera — digitalna kartica lojalnosti

Radni naziv proizvoda: **Revera** (lako se menja — vidi "Promena imena" ispod).

## Šta je unutra

- `index.html` — landing/pregled sa linkovima na sve delove (za demo klijentu)
- `card.html` — gostova digitalna kartica: registracija, QR + barkod, progres pečata, unos jednokratnog koda sa računa
- `scanner.html` — ekran za osoblje: čitač barkoda (keyboard wedge), kamera za QR, generisanje jednokratnog koda, ručna pretraga po broju telefona
- `dashboard.html` — pregled za vlasnika: broj gostiju, dati pečati, iskorišćene nagrade, gosti "u riziku" (nisu dolazili 14+ dana)
- `config.js` — **jedini fajl koji menjaš po klijentu** (ime lokala, boje, broj pečata za nagradu, PIN-ovi, tekst SMS podsetnika, Firebase konfiguracija)
- `app.js` — sva logika (baza, anti-fraud, pečati) — ne diraj osim ako menjaš funkcionalnost
- `auth.js` — PIN zaštita za scanner.html i dashboard.html
- `logo.js` — podrazumevani logo (pečat sa zvezdom), lako zamenljiv
- `firestore.rules` — pravila pristupa bazi kad pređeš na Firebase
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — da kartica gosta radi kao instalabilna PWA (dodaj na početni ekran)

## Pristup (PIN zaštita) — NOVO

`scanner.html` i `dashboard.html` sada traže PIN pre ulaska (podesivo u
`config.js` → `auth.staffPin` / `auth.ownerPin`, podrazumevano `1234` i
`9999` — **promeni ih pre nego što daš pristup bilo kom klijentu**). PIN se
pamti na tom uređaju `auth.sessionHours` sati (podrazumevano 12h), pa
osoblje ne unosi PIN pri svakom otvaranju u toku smene. "Odjava" dugme u
zaglavlju briše sesiju.

**Važno ograničenje koje treba da znaš:** ovo je zaštita na nivou ekrana
(sprečava slučajnog prolaznika sa linkom), ne prava autentifikacija na
nivou baze — dok `firestore.rules` stoje otvorene (podrazumevano, radi
demo/pilot rada bez prijave), neko ko direktno gađa Firebase API mimo tvoje
aplikacije i dalje tehnički može da piše. Za pravi rad sa više klijenata i
novcem, sledeći korak je Firebase Authentication (anonimna prijava +
custom claims) da se ista provera sprovede i na serverskoj strani, ne samo
u browseru. Za pilot sa jednim-dva lokala, PIN je sasvim dovoljan.

## SMS podsetnik za goste "u riziku" — NOVO

Na `dashboard.html`, svaki gost koji nije dolazio 14+ dana ima dugme
"✉️ SMS" koje otvara nativnu SMS aplikaciju na telefonu (na kom je
dashboard otvoren) sa već upisanim brojem i tekstom poruke — bez ikakvog
SMS API-ja, naloga ili troška po poruci. Tekst poruke se menja u
`config.js` → `smsReminderTemplate`.

Za veći obim postoji i "📋 Kopiraj brojeve i poruku" dugme koje kopira sve
rizične brojeve + tekst u clipboard, za lepljenje u WhatsApp/Viber
broadcast listu ili spoljni alat.

**Sledeći nivo (kad poraste broj klijenata):** automatsko slanje bez
klika, preko SMS API-ja (npr. Infobip, smsapi.rs ili slično) — to bi
zahtevalo nalog kod provajdera i malu Cloud Function koja se okida na
raspored (npr. jednom dnevno proveri ko je "u riziku" i sama pošalje). Nisam
ovo uveo sad jer traži tvoj nalog/API ključ kod provajdera; trenutno
rešenje (klik → SMS aplikacija) radi odmah bez ičije dozvole.

## Logo — NOVO

Podrazumevani logo je jednostavan "pečat sa zvezdom" (`logo.js`),
renderovan i kao SVG u zaglavlju stranica i kao PNG ikonica
(`icon-192.png`, `icon-512.png`) za instalaciju na telefon.
Ovo NIJE gotov brend identitet za klijenta — to je profesionalan
placeholder da ne stoji slovo "R" ili emoji. Kad budeš imao pravi logo za
klijenta:
- najbrže: u `config.js` stavi `logoText: "🍕"` (ili sličan emoji) da
  privremeno zameniš mark bez ikakvog dizajna;
  - za pravi logo: zameni SVG markup u `logo.js` i ubaci sopstveni PNG kao
    `icon-192.png` i `icon-512.png` istih dimenzija (192×192 i 512×512).

    ## Radi odmah, bez ikakvog podešavanja (DEMO režim)

    Dok je `firebase: null` u `config.js`, sistem čuva sve podatke u
    `localStorage` na uređaju. Ovo je namerno tako da možeš odmah da otvoriš
    `index.html` u browseru (ili ga staviš na GitHub Pages) i pokažeš ceo tok
    klijentu bez ikakvog Firebase naloga. Ograničenje: gost i osoblje moraju
    biti na istom uređaju/browseru da vide iste podatke uživo (dobro za
    demo, ne za pravi rad sa dva odvojena telefona).

    ## Prelazak na pravu bazu (Firebase — besplatno za ovaj obim)

    1. Idi na https://console.firebase.google.com → **Add project** → daj mu ime (npr. `revera-demo-kafic`).
    2. U meniju levo → **Build → Firestore Database** → **Create database** → izaberi region (npr. `eur3` — Evropa) → **Start in production mode**.
    3. Nalepi sadržaj `firestore.rules` fajla u Firestore → **Rules** tab → **Publish**.
    4. U project settings (zupčanik gore levo) → **Your apps** → klikni web ikonicu `</>` → registruj app → Firebase ti daje objekat sa `apiKey`, `authDomain`, itd.
    5. Nalepi taj objekat u `config.js`, u polje `firebase: { ... }` (primer je već zakomentarisan u fajlu).
    6. Osveži stranicu — sistem sam prelazi sa localStorage na pravu bazu, ništa drugo ne menjaš.

    Besplatni Firestore limit (Spark plan) pokriva desetine hiljada čitanja/upisa
    dnevno — dovoljno za nekoliko lokala pre nego što bilo šta plaćaš.

    ## Deploy na GitHub Pages

    1. Napravi novi repo (npr. `revera-demo-kafic`), ubaci sve fajlove iz ovog foldera u njega.
    2. Settings → Pages → Source: `main` branch, `/ (root)` folder → Save.
    3. Za nekoliko minuta sajt je živ na `https://<korisnik>.github.io/revera-demo-kafic/`.
    4. Custom domen (opciono): Settings → Pages → Custom domain, unesi npr. `kartica.tvojklijent.rs`, i kod registra domena dodaj CNAME zapis koji pokazuje na `<korisnik>.github.io`. GitHub Pages automatski izda besplatan HTTPS sertifikat.

    ## Kako napraviš novog klijenta (novi lokal)

    Ne pravi novu arhitekturu — samo:
    1. Kopiraj ceo folder u novi repo.
    2. Izmeni `config.js`: ime lokala, boje, broj pečata, nagrada.
    3. Napravi NOV Firebase projekat (ili novi `businessId` unutar istog projekta — oboje radi, poseban projekat je čistije za naplatu/razdvajanje klijenata).
    4. Deploy kao gore.

    Ovo je isti obrazac po kom već radiš ostale projekte (jedan repo po klijentu na GitHub Pages).

    ## QR čitač na kasi — šta ako lokal već ima čitač barkoda

    `scanner.html` ima uvek-aktivno tekstualno polje. Svaki čitač barkoda/QR-a
    povezan na računar ili kasu (USB ili Bluetooth) radi kao tastatura — kad
    skenira, "otkuca" kod u to polje i pošalje Enter, sistem automatski
    prepozna gosta. Nema potrebe ni za kakvim drajverom ili podešavanjem.

    Napomena: **stariji laserski čitači ne mogu da pročitaju QR sa ekrana
    telefona**, samo obične linijske barkodove. Zato `card.html` po defaultu
    prikazuje OBA koda (QR i CODE128 barkod) — koji god čitač postoji na
    kasi, nešto od to dvoje će raditi.

    ## Anti-fraud, ukratko

    - Isti kod (isti gost) ne može da dobije dva pečata u razmaku manjem od
      `rescanCooldownSeconds` (podesivo u `config.js`, default 15s) — sprečava
        slučajan dupli sken.
        - Jednokratni kod za samoskeniranje (`generateClaimCode`) važi ograničeno
          vreme (`claimCodeTtlSeconds`, default 120s) i može se iskoristiti samo
            jednom — sprečava deljenje koda sa drugim gostima.
            - Pre pravog puštanja u rad sa novcem: dodaj Firebase Auth za
              `scanner.html`/`dashboard.html` (vidi napomenu u `firestore.rules`) da
                neko sa strane ne može direktno da piše u bazu mimo tvoje aplikacije.

                ## Promena imena proizvoda

                Ime "Revera" je radni naziv — pojavljuje se samo u `<title>` tagovima i u
                tekstu na `index.html`. Zameni ga bilo kojim finalnim imenom (npr. Fidera,
                Vernova...) pretragom "Revera" kroz sve `.html` fajlove — nema nikakve
                logike vezane za samo ime, čisto tekst/branding.

                ## Šta bi trebalo dodati pre pravog lansiranja (roadmap)

                Urađeno: PIN zaštita za osoblje/vlasnika, SMS podsetnik (ručni, jedan klik), i pravi logo (pečat-mark umesto placeholder slova). Ostaje:

                - Firebase Authentication (umesto PIN-a) kad broj klijenata poraste i firestore.rules treba da se zatvore na serverskoj strani, ne samo u browseru
                - Automatsko (ne ručno) slanje SMS podsetnika preko API-ja (Infobip/smsapi.rs), kad bude vredelo truška oko naloga i Cloud Function-a
                - Pravi brend logo klijenta umesto generičkog pečat-marka (vidi "Logo" sekciju iznad)
                - Multi-tenant signup (da klijent sam registruje svoj lokal bez da mu ti ručno praviš repo) — trenutna arhitektura je namerno "jedan repo po klijentu" jer je to obrazac koji već koristiš, ali se lako širi u pravi multi-tenant kasnije ako poraste broj klijenata
