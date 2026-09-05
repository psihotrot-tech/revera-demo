// ReveraAuth — jednostavna PIN zaštita na nivou ekrana (NE server-side sigurnost).
// Cilj: da osoblje/vlasnik ne mogu slučajno da otvore skener/dashboard,
// ne da zaštitimo podatke od nekog ko zna da čita kod stranice.
(function (global) {
    function storageKey(role) {
          return `revera:${REVERA_CONFIG.businessId}:auth:${role}`;
    }

   function hasValidSession(role) {
         try {
                 const raw = localStorage.getItem(storageKey(role));
                 if (!raw) return false;
                 const data = JSON.parse(raw);
                 return data && data.expires && Date.now() < data.expires;
         } catch (e) {
                 return false;
         }
   }

   function markSession(role) {
         const hours = (REVERA_CONFIG.auth && REVERA_CONFIG.auth.sessionHours) || 12;
         const expires = Date.now() + hours * 60 * 60 * 1000;
         localStorage.setItem(storageKey(role), JSON.stringify({ expires }));
   }

   function checkPin(role, pin) {
         const cfg = REVERA_CONFIG.auth || {};
         const expected = role === "owner" ? cfg.ownerPin : cfg.staffPin;
         return String(pin) === String(expected);
   }

   function logout(role) {
         localStorage.removeItem(storageKey(role));
         location.reload();
   }

   function buildOverlay(role, onSuccess) {
         const overlay = document.createElement("div");
         overlay.id = "reveraAuthOverlay";
         overlay.style.cssText = `
               position:fixed; inset:0; background:var(--bg,#FAF7F2); z-index:9999;
                     display:flex; align-items:center; justify-content:center; padding:20px;
                         `;
         const label = role === "owner" ? "PIN vlasnika" : "PIN osoblja";
         overlay.innerHTML = `
               <div class="card" style="max-width:340px; width:100%;">
                       <h2 style="margin-top:0;">🔒 ${label}</h2>
                               <p class="muted">Unesite PIN da nastavite.</p>
                                       <input type="password" id="reveraPinInput" inputmode="numeric" maxlength="6"
                                                 placeholder="••••" style="font-size:22px; letter-spacing:6px; text-align:center;">
                                                         <p id="reveraPinError" style="color:#B3403A; display:none; font-size:14px;">Pogrešan PIN, pokušajte ponovo.</p>
                                                                 <button id="reveraPinSubmit">Uđi</button>
                                                                       </div>
                                                                           `;
         document.body.appendChild(overlay);

      const input = overlay.querySelector("#reveraPinInput");
         const error = overlay.querySelector("#reveraPinError");
         const submit = overlay.querySelector("#reveraPinSubmit");

      function tryPin() {
              if (checkPin(role, input.value.trim())) {
                        markSession(role);
                        overlay.remove();
                        onSuccess();
              } else {
                        error.style.display = "block";
                        input.value = "";
                        input.focus();
              }
      }

      submit.addEventListener("click", tryPin);
         input.addEventListener("keydown", (e) => {
                 if (e.key === "Enter") tryPin();
         });
         input.focus();
   }

   function requireAuth(role, onSuccess) {
         if (hasValidSession(role)) {
                 onSuccess();
                 return;
         }
         buildOverlay(role, onSuccess);
   }

   global.ReveraAuth = { requireAuth, logout, hasValidSession, markSession, checkPin };
})(window);
