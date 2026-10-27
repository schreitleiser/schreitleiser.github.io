/**
 * YOLD-Kennzahlen live aus Supabase – eine Quelle fuer alle Seiten.
 *
 * Im HTML steht jeweils nur die Zahl in einem Element mit data-yold:
 *   <span data-yold="anmeldungen">160</span>+ Anmeldungen
 *   <span data-yold="tandems">50</span>+ Tandems
 * Der Text im HTML ist der Fallback (ohne JS, offline, Fehler). Sobald die
 * Abfrage antwortet, wird er durch den aktuellen, auf Zehner abgerundeten
 * Wert (fertig berechnet von der Datenbank) ersetzt. Das "+" bzw. "mehr als"/"ueber" steht ausserhalb.
 *
 * Die Startseite liest dieselben Werte ueber window.yoldStats (Promise).
 * Aufschlag und Rundung stehen nur in der RPC get_yold_stats – yold.info und
 * yoldconnect.de lesen dasselbe Feld, damit alle Seiten dieselbe Zahl zeigen.
 */
(function () {
  "use strict";

  var URL = "https://kcdobqicmdklyudjbzxj.supabase.co/rest/v1/rpc/get_yold_stats";
  /* Publishable Key – fuer den Browser gedacht, nur Lesezugriff auf die RPC. */
  var KEY = "sb_publishable_yyO8UDikrv-fb3GUlovUUw_6sng6_l5";
  /* Aufschlag und Rundung rechnet ausschliesslich die Datenbankfunktion
     get_yold_stats (Feld "anzeige"). yold.info und yoldconnect.de lesen
     denselben Wert – hier wird nichts nachgerechnet. */

  var werte = null;

  window.yoldStats = fetch(URL, {
    method: "POST",
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: "{}"
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var a = data && data.anzeige;
      if (!a || typeof a.anmeldungen !== "number" || typeof a.tandems !== "number") return null;
      werte = { anmeldungen: a.anmeldungen, tandems: a.tandems };
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
