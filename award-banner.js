/**
 * Befristetes Aktionsbanner: Movers of Tomorrow Award 2026 (Public Voting).
 *
 * Das Banner wird auf jeder eingebundenen Seite oben eingehaengt und
 * blendet sich nach Ablauf der Abstimmung VON SELBST aus – es ist dann
 * schlicht nicht mehr im DOM. Es muss also nichts manuell abgeschaltet
 * werden; die Datei kann nach dem Voting einfach geloescht und die
 * <script>-Zeilen aus den Seiten entfernt werden.
 *
 * Aendern muss man hier im Normalfall nur eins: ABSTIMMUNG_ENDET.
 */
(function () {
  "use strict";

  /* Ende des Public Votings (Ortszeit Deutschland, Sommerzeit = +02:00).
     Danach verschwindet das Banner automatisch auf allen Seiten. */
  var ABSTIMMUNG_ENDET = new Date("2026-10-04T23:59:59+02:00");

  var VOTE_URL = "https://movers-of-tomorrow-award.de/videos/gemeinschaft-fuer-alle/";
  var POSTER_SRC = "/assets/movers-of-tomorrow-2026-finalist.webp";
  var POSTER_ALT =
    "Aktionsplakat zum Movers of Tomorrow Award 2026: Simon Schaugg im rosafarbenen Hemd " +
    "vor violettem Hintergrund, daneben der Schriftzug „Finalist bei Movers of Tomorrow 2026 – " +
    "jetzt für mich abstimmen“.";

  var jetzt = new Date();
  if (!(jetzt < ABSTIMMUNG_ENDET)) return;

  /* Das Plakat zeigen wir nur auf der Startseite – auf den Unterseiten
     laeuft dasselbe Banner in der schlanken Textvariante. */
  var pfad = location.pathname.replace(/\/+$/, "/");
  var istStartseite = pfad === "/" || /\/index\.html$/.test(pfad);

  /* Verbleibende Kalendertage bis zum Stichtag: am Stichtag selbst
     steht "Nur noch heute". */
  var letzterTag = new Date(ABSTIMMUNG_ENDET); letzterTag.setHours(0, 0, 0, 0);
  var heute = new Date(jetzt); heute.setHours(0, 0, 0, 0);
  var tage = Math.round((letzterTag - heute) / 86400000);
  var restText = tage <= 0 ? "Nur noch heute"
    : tage === 1 ? "Noch 1 Tag"
    : "Noch " + tage + " Tage";

  var LILA = "#6D3FF3";
  var GRUEN = "#5BEF8B";
  var TINTE = "#0B0616";

  var css = [
    "#mota-banner{position:relative;z-index:61;display:flex;align-items:center;justify-content:flex-start;",
    "gap:clamp(18px,3vw,44px);flex-wrap:wrap;padding:clamp(16px,2.6vw,30px) clamp(16px,4vw,46px);",
    "background:" + LILA + ";color:#fff;font-family:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;",
    "text-align:left;line-height:1.5}",
    "#mota-banner *{box-sizing:border-box}",
    "#mota-banner .mota-text{display:flex;flex-direction:column;align-items:flex-start;gap:10px;max-width:56ch}",
    "#mota-banner .mota-kicker{display:inline-flex;align-items:center;gap:9px;font-size:10px;font-weight:700;",
    "letter-spacing:.18em;text-transform:uppercase;color:#fff}",
    "#mota-banner .mota-rest{background:" + GRUEN + ";color:" + TINTE + ";padding:3px 9px;border-radius:999px;letter-spacing:.12em}",
    "#mota-banner .mota-head{margin:0;font-size:clamp(1.35rem,3.2vw,2.15rem);line-height:1.1;font-weight:700;",
    "letter-spacing:-.015em;color:#fff}",
    "#mota-banner .mota-sub{margin:0;font-size:clamp(.88rem,1.5vw,1rem);color:rgba(255,255,255,.88)}",
    "#mota-banner .mota-cta{display:inline-flex;align-items:center;gap:10px;margin-top:4px;padding:13px 22px;",
    "background:" + GRUEN + ";color:" + TINTE + ";font-size:11px;font-weight:700;letter-spacing:.16em;",
    "text-transform:uppercase;text-decoration:none;border-radius:2px;transition:background .25s,transform .25s}",
    "#mota-banner .mota-cta:hover,#mota-banner .mota-cta:focus-visible{background:#fff;color:" + TINTE + ";transform:translateY(-2px)}",
    "#mota-banner .mota-poster{display:block;flex:0 0 auto;line-height:0;border-radius:3px;overflow:hidden;",
    "box-shadow:0 22px 44px -26px rgba(0,0,0,.75);transition:transform .35s}",
    "#mota-banner .mota-poster:hover,#mota-banner .mota-poster:focus-visible{transform:translateY(-3px)}",
    "#mota-banner .mota-poster img{width:auto;height:clamp(230px,34vw,400px);max-width:100%;display:block}",
    "#mota-banner .mota-close{position:absolute;top:10px;right:12px;width:30px;height:30px;display:flex;",
    "align-items:center;justify-content:center;background:none;border:0;border-radius:50%;cursor:pointer;",
    "color:rgba(255,255,255,.72);font-size:19px;line-height:1;transition:background .2s,color .2s}",
    "#mota-banner .mota-close:hover,#mota-banner .mota-close:focus-visible{background:rgba(255,255,255,.18);color:#fff}",
    "@media(max-width:760px){#mota-banner{flex-direction:column;align-items:flex-start;text-align:left}",
    "#mota-banner .mota-poster img{height:auto;width:min(100%,320px)}}",
    "@media (prefers-reduced-motion:reduce){#mota-banner *{transition:none!important}}"
  ].join("");

  function aufbauen() {
    if (document.getElementById("mota-banner")) return;

    var style = document.createElement("style");
    style.id = "mota-banner-style";
    style.textContent = css;
    document.head.appendChild(style);

    var banner = document.createElement("aside");
    banner.id = "mota-banner";
    banner.setAttribute("aria-label", "Movers of Tomorrow Award 2026 – Aufruf zur Abstimmung");

    if (istStartseite) {
      var posterLink = document.createElement("a");
      posterLink.className = "mota-poster";
      posterLink.href = VOTE_URL;
      posterLink.target = "_blank";
      posterLink.rel = "noopener";
      var poster = document.createElement("img");
      poster.src = POSTER_SRC;
      poster.alt = POSTER_ALT;
      poster.width = 1122;
      poster.height = 1402;
      poster.loading = "eager";
      poster.decoding = "async";
      posterLink.appendChild(poster);
      banner.appendChild(posterLink);
    }

    var text = document.createElement("div");
    text.className = "mota-text";

    var kicker = document.createElement("span");
    kicker.className = "mota-kicker";
    kicker.appendChild(document.createTextNode("Movers of Tomorrow Award 2026 · Finalist"));
    var rest = document.createElement("span");
    rest.className = "mota-rest";
    rest.textContent = restText;
    kicker.appendChild(rest);
    text.appendChild(kicker);

    var head = document.createElement("p");
    head.className = "mota-head";
    head.textContent = "Ich bin im Finale – jetzt zählt jede Stimme.";
    text.appendChild(head);

    var sub = document.createElement("p");
    sub.className = "mota-sub";
    sub.textContent =
      "„Gemeinschaft für alle“ steht beim Movers of Tomorrow Award 2026 im Publikums-Voting. " +
      "Eine Stimme dauert keine Minute – danke für deinen Support!";
    text.appendChild(sub);

    var cta = document.createElement("a");
    cta.className = "mota-cta";
    cta.href = VOTE_URL;
    cta.target = "_blank";
    cta.rel = "noopener";
    cta.appendChild(document.createTextNode("Jetzt für mich abstimmen "));
    var pfeil = document.createElement("span");
    pfeil.setAttribute("aria-hidden", "true");
    pfeil.textContent = "↗";
    cta.appendChild(pfeil);
    text.appendChild(cta);

    banner.appendChild(text);

    var close = document.createElement("button");
    close.type = "button";
    close.className = "mota-close";
    close.setAttribute("aria-label", "Hinweis zum Award ausblenden");
    close.textContent = "×";
    close.addEventListener("click", function () {
      banner.remove();
    });
    banner.appendChild(close);

    document.body.insertBefore(banner, document.body.firstChild);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", aufbauen);
  else aufbauen();
})();
