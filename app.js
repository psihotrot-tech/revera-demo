/* ============================================================
   REVERA — data sloj
   Radi u dva režima, automatski, bez ikakve promene u ostatku
   koda:
     1) DEMO režim  — čuva sve u localStorage (za testiranje na
        jednom telefonu/računaru pre nego što napraviš Firebase).
     2) PRODUKCIJA  — kad u config.js ubaciš firebase config,
        automatski koristi Firestore u realnom vremenu, tako da
        gostova kartica i staff skener vide iste podatke uživo.
   ============================================================ */

const Revera = (() => {
    const cfg = REVERA_CONFIG;
    const isFirebase = !!cfg.firebase;
    let db = null;

                  if (isFirebase && window.firebase) {
                        firebase.initializeApp(cfg.firebase);
                        db = firebase.firestore();
                  }

                  // ---------- Pomoćne funkcije ----------

                  function genId(len = 10) {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bez lako-zabunjujućih znakova (0/O, 1/I)
      let out = "";
                        for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
                        return out;
                  }

                  function genClaimCode() {
                        return String(Math.floor(100000 + Math.random() * 900000)); // 6-cifreni kod
                  }

                  function lsKey(k) {
                        return `revera:${cfg.businessId}:${k}`;
                  }

                  function lsGetAll() {
                        try {
                                return JSON.parse(localStorage.getItem(lsKey("customers")) || "{}");
                        } catch (e) {
                                return {};
                        }
                  }

                  function lsSaveAll(data) {
                        localStorage.setItem(lsKey("customers"), JSON.stringify(data));
                        // window event da druge otvorene kartice/tabovi na istom uređaju vide promenu odmah (demo režim)
      window.dispatchEvent(new CustomEvent("revera:update"));
                  }

                  function lsGetClaims() {
                        try {
                                return JSON.parse(localStorage.getItem(lsKey("claims")) || "{}");
                        } catch (e) {
                                return {};
                        }
                  }

                  function lsSaveClaims(data) {
                        localStorage.setItem(lsKey("claims"), JSON.stringify(data));
                  }

                  function lsGetRecentScans() {
                        try {
                                return JSON.parse(localStorage.getItem(lsKey("recent_scans")) || "{}");
                        } catch (e) {
                                return {};
                        }
                  }

                  function lsSaveRecentScans(data) {
                        localStorage.setItem(lsKey("recent_scans"), JSON.stringify(data));
                  }

                  // ---------- Javni API ----------

                  /**
     * Registruje novog gosta. Vraća ceo objekat gosta (sa id-jem).
     */
                  async function createCustomer({ name, phone }) {
                        const id = genId();
                        const customer = {
                                id,
                                name: name || "",
                                phone: phone || "",
                                stamps: 0,
                                rewardsRedeemed: 0,
                                createdAt: Date.now(),
                                lastVisit: Date.now(),
                        };

      if (isFirebase) {
              await db.collection("businesses").doc(cfg.businessId)
                .collection("customers").doc(id).set(customer);
      } else {
              const all = lsGetAll();
              all[id] = customer;
              lsSaveAll(all);
      }
                        return customer;
                  }

                  async function getCustomer(id) {
                        if (isFirebase) {
                                const doc = await db.collection("businesses").doc(cfg.businessId)
                                  .collection("customers").doc(id).get();
                                return doc.exists ? doc.data() : null;
                        } else {
                                const all = lsGetAll();
                                return all[id] || null;
                        }
                  }

                  /**
     * Real-time listener na jednog gosta (koristi card.html da odmah
     * prikaže novi pečat čim ga osoblje doda, bez refresh-a).
     * callback(customerObj|null)
     * Vraća unsubscribe funkciju.
     */
                  function watchCustomer(id, callback) {
                        if (isFirebase) {
                                return db.collection("businesses").doc(cfg.businessId)
                                  .collection("customers").doc(id)
                                  .onSnapshot((doc) => callback(doc.exists ? doc.data() : null));
                        } else {
                                const check = () => callback(lsGetAll()[id] || null);
                                check();
                                const handler = () => check();
                                window.addEventListener("revera:update", handler);
                                window.addEventListener("storage", handler);
                                return () => {
                                          window.removeEventListener("revera:update", handler);
                                          window.removeEventListener("storage", handler);
                                };
                        }
                  }

                  /**
     * Real-time listener na SVE goste (koristi dashboard.html).
     */
                  function watchAllCustomers(callback) {
                        if (isFirebase) {
                                return db.collection("businesses").doc(cfg.businessId)
                                  .collection("customers").orderBy("lastVisit", "desc")
                                  .onSnapshot((snap) => {
                                              const list = [];
                                              snap.forEach((d) => list.push(d.data()));
                                              callback(list);
                                  });
                        } else {
                                const check = () => {
                                          const all = lsGetAll();
                                          const list = Object.values(all).sort((a, b) => b.lastVisit - a.lastVisit);
                                          callback(list);
                                };
                                check();
                                const handler = () => check();
                                window.addEventListener("revera:update", handler);
                                window.addEventListener("storage", handler);
                                return () => {
                                          window.removeEventListener("revera:update", handler);
                                          window.removeEventListener("storage", handler);
                                };
                        }
                  }

                  /**
     * Glavna anti-fraud provera: da li je ovaj tačan kod (QR/barkod
     * sadržaj gosta) već iskorišćen u poslednjih N sekundi. Sprečava
     * da se slučajnim duplim skenom ili screenshot deljenjem istog
     * ekrana u kratkom razmaku doda pečat dva puta.
     */
                  function wasRecentlyScanned(customerId) {
                        const recent = lsGetRecentScans(); // čuvamo lokalno na uređaju skenera, namerno (po kasi, ne globalno)
      const last = recent[customerId];
                        const now = Date.now();
                        if (last && now - last < cfg.rescanCooldownSeconds * 1000) return true;
                        recent[customerId] = now;
                        lsSaveRecentScans(recent);
                        return false;
                  }

                  /**
     * Dodaje jedan pečat gostu. Koristi se i kad OSOBLJE skenira
     * gostov QR/barkod direktno.
     * Vraća { ok, customer, alreadyScanned, rewardReady }
     */
                  async function addStamp(customerId) {
                        if (wasRecentlyScanned(customerId)) {
                                return { ok: false, alreadyScanned: true };
                        }

      if (isFirebase) {
              const ref = db.collection("businesses").doc(cfg.businessId)
                .collection("customers").doc(customerId);
              const result = await db.runTransaction(async (tx) => {
                        const doc = await tx.get(ref);
                        if (!doc.exists) return null;
                        const data = doc.data();
                        const stamps = data.stamps + 1;
                        tx.update(ref, { stamps, lastVisit: Date.now() });
                        return { ...data, stamps };
              });
              if (!result) return { ok: false, notFound: true };
              return { ok: true, customer: result, rewardReady: result.stamps >= cfg.stampsRequired };
      } else {
              const all = lsGetAll();
              const c = all[customerId];
              if (!c) return { ok: false, notFound: true };
              c.stamps += 1;
              c.lastVisit = Date.now();
              lsSaveAll(all);
              return { ok: true, customer: c, rewardReady: c.stamps >= cfg.stampsRequired };
      }
                  }

                  /**
     * Resetuje pečate na 0 i uvećava brojač iskorišćenih nagrada
     * (poziva se kad gost iskoristi nagradu).
     */
                  async function redeemReward(customerId) {
                        if (isFirebase) {
                                const ref = db.collection("businesses").doc(cfg.businessId)
                                  .collection("customers").doc(customerId);
                                await db.runTransaction(async (tx) => {
                                          const doc = await tx.get(ref);
                                          if (!doc.exists) return;
                                          const data = doc.data();
                                          tx.update(ref, {
                                                      stamps: Math.max(0, data.stamps - cfg.stampsRequired),
                                                      rewardsRedeemed: (data.rewardsRedeemed || 0) + 1,
                                          });
                                });
                        } else {
                                const all = lsGetAll();
                                const c = all[customerId];
                                if (!c) return;
                                c.stamps = Math.max(0, c.stamps - cfg.stampsRequired);
                                c.rewardsRedeemed = (c.rewardsRedeemed || 0) + 1;
                                lsSaveAll(all);
                        }
                  }

                  /**
     * SAMOSKENIRANJE / kod sa računa: osoblje na svom uređaju
     * generiše jednokratni 6-cifreni kod koji važi ograničeno vreme
     * (cfg.claimCodeTtlSeconds) i NIJE vezan ni za jednog gosta dok
     * ga gost ne unese sam na svojoj kartici. Ovo je zamena za
     * "skeniraj QR sa računa" bez potrebe za integracijom kase.
     */
                  function generateClaimCode() {
                        const code = genClaimCode();
                        const claims = lsGetClaims(); // claim kodovi žive lokalno na uređaju osoblja/kase
      claims[code] = { createdAt: Date.now(), used: false };
                        lsSaveClaims(claims);
                        return { code, ttl: cfg.claimCodeTtlSeconds };
                  }

                  /**
     * Gost unosi kod sa računa na svojoj kartici. Ako je validan i
     * nije istekao/iskorišćen, dodaje mu pečat.
     * NAPOMENA: u produkciji (Firebase) claim kodovi bi trebalo da
     * žive u zajedničkoj bazi (ne localStorage) da bi radili kad
     * kasa i gost nisu na istom uređaju — to je uključeno ispod
     * kao firebase grana.
     */
                  async function redeemClaimCode(customerId, code) {
                        if (isFirebase) {
                                const ref = db.collection("businesses").doc(cfg.businessId).collection("claimCodes").doc(code);
                                const doc = await ref.get();
                                if (!doc.exists) return { ok: false, reason: "not_found" };
                                const data = doc.data();
                                if (data.used) return { ok: false, reason: "used" };
                                if (Date.now() - data.createdAt > cfg.claimCodeTtlSeconds * 1000) return { ok: false, reason: "expired" };
                                await ref.update({ used: true, usedBy: customerId });
                                return await addStamp(customerId);
                        } else {
                                const claims = lsGetClaims();
                                const c = claims[code];
                                if (!c) return { ok: false, reason: "not_found" };
                                if (c.used) return { ok: false, reason: "used" };
                                if (Date.now() - c.createdAt > cfg.claimCodeTtlSeconds * 1000) return { ok: false, reason: "expired" };
                                c.used = true;
                                lsSaveClaims(claims);
                                return await addStamp(customerId);
                        }
                  }

                  // Ako je Firebase aktivan, claim kod mora i tamo da se upiše da bi ga gost
                  // (na svom uređaju) mogao da pronađe.
                  async function generateClaimCodeAsync() {
                        const { code, ttl } = generateClaimCode();
                        if (isFirebase) {
                                await db.collection("businesses").doc(cfg.businessId).collection("claimCodes").doc(code).set({
                                          createdAt: Date.now(),
                                          used: false,
                                });
                        }
                        return { code, ttl };
                  }

                  async function findByPhone(last4) {
                        if (isFirebase) {
                                const snap = await db.collection("businesses").doc(cfg.businessId)
                                  .collection("customers").get();
                                const matches = [];
                                snap.forEach((d) => {
                                          const c = d.data();
                                          if ((c.phone || "").slice(-4) === last4) matches.push(c);
                                });
                                return matches;
                        } else {
                                const all = Object.values(lsGetAll());
                                return all.filter((c) => (c.phone || "").slice(-4) === last4);
                        }
                  }

                  return {
                        cfg,
                        isFirebase,
                        createCustomer,
                        getCustomer,
                        watchCustomer,
                        watchAllCustomers,
                        addStamp,
                        redeemReward,
                        generateClaimCode: generateClaimCodeAsync,
                        redeemClaimCode,
                        findByPhone,
                  };
})();
