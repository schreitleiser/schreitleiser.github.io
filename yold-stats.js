/**
 * YOLD-Kennzahlen live aus Supabase – eine Quelle fuer alle Seiten.
 *
 * Im HTML steht jeweils nur die Zahl in einem Element mit data-yold:
 *   <span data-yold="anmeldungen">160</span>+ Anmeldungen
 *   <span data-yold="tandems">50</span>+ Tandems
 * Der Text im HTML ist der Fallback (ohne JS, offline, Fehler). Sobald die
 * Abfrage antwortet, wird er durch den aktuellen, auf Zehner abgerundeten
 * Wert ersetzt. Das "+" bzw. "mehr als"/"ueber" steht ausserhalb.
 *
 * Die Startseite liest dieselben Werte ueber window.yoldStats (Promise).
 * RPC und Offsets sind dieselben wie auf yold.info (js/script.js), damit
 * beide Seiten immer dieselbe Zahl zeigen.
 */
(function () {
  "use strict";

  var URL = "https://kcdobqicmdklyudjbzxj.supabase.co/rest/v1/rpc/get_yold_stats";
  /* Publishable Key – fuer den Browser gedacht, nur Lesezugriff auf die RPC. */
  var KEY = "sb_publishable_yyO8UDikrv-fb3GUlovUUw_6sng6_l5";
  /* Aufschlag fuer Anmeldungen und Tandems, die nicht in der Datenbank stehen
     (z.B. aus der Zeit vor der Plattform). */
  var OFFSETS = { anmeldungen: 20, tandems: 40 };

  function abrunden(n) { return Math.floor(n / 10) * 10; }

  var werte = null;

  window.yoldStats = fetch(URL, {
    method: "POST",
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: "{}"
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || typeof data.anmeldungen !== "number" || typeof data.tandems !== "number") return null;
      werte = {
        anmeldungen: abrunden(data.anmeldungen + OFFSETS.anmeldungen),
        tandems: abrunden(data.tandems + OFFSETS.tandems)
      };
      einsetzen();
      return werte;
    })
    .catch(function () { return null; });

  function einsetzen() {
    if (!werte) return;
    var els = document.querySelectorAll("[data-yold]");
    for (var i = 0; i < els.length; i++) {
      var v = werte[els[i].getAttribute("data-yold")];
      if (v != null && els[i].textContent !== String(v)) els[i].textContent = String(v);
    }
  }

  /* Die Seiten werden clientseitig gerendert; Elemente koennen also erst nach
     der Antwort im DOM landen. Deshalb bei neuen Knoten erneut einsetzen. */
  function beobachten() {
    einsetzen();
    new MutationObserver(function () { if (werte) einsetzen(); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) beobachten();
  else document.addEventListener("DOMContentLoaded", beobachten);
})();
