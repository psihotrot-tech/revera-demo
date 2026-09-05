/* ============================================================
   REVERA — podrazumevani logo (pečat sa zvezdom)
   Zamenljivo: ako klijent ima svoj logo, ili stavi emoji/tekst u
   config.js (logoText), ili ovde zameni SVG markup svojim.
   ============================================================ */

const REVERA_LOGO_SVG = `
<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" class="logo-mark-bg"/>
    <circle cx="50" cy="50" r="47" fill="none" class="logo-mark-ring" stroke-width="4" stroke-dasharray="6 5"/>
      <path class="logo-mark-fg" d="M50 24 L58.6 42.5 L79 45.4 L64.5 60 L68 80.2 L50 70.7 L32 80.2 L35.5 60 L21 45.4 L41.4 42.5 Z"/>
      </svg>`.trim();

function applyRevraLogo(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (REVERA_CONFIG.logoText) {
          el.textContent = REVERA_CONFIG.logoText;
          el.style.background = REVERA_CONFIG.primaryColor;
    } else {
          el.innerHTML = REVERA_LOGO_SVG;
          el.style.background = "transparent";
    }
}
