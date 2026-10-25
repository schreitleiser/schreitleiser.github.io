/* Ich/Wir – Partikel-Animation für die Psychologie-Seite.
   Dieselben Punkte bilden abwechselnd EINEN großen Kopf, in dem viele kleine stecken
   (das Wir im Ich) und eine Menge vieler Köpfe, in der einer sich abhebt (das Ich im Wir).
   Einbinden: <div data-ichwir></div> (das Canvas legt das Skript selbst an) */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HEAD = [[0.703,1],[0.703,0.982],[0.702,0.965],[0.702,0.947],[0.701,0.929],[0.701,0.912],[0.702,0.894],[0.703,0.876],[0.704,0.859],[0.707,0.841],[0.712,0.824],[0.719,0.807],[0.729,0.79],[0.742,0.775],[0.756,0.76],[0.771,0.746],[0.787,0.732],[0.803,0.718],[0.818,0.703],[0.832,0.688],[0.845,0.673],[0.858,0.658],[0.871,0.642],[0.883,0.627],[0.896,0.611],[0.908,0.596],[0.92,0.58],[0.931,0.564],[0.942,0.548],[0.952,0.532],[0.961,0.515],[0.969,0.498],[0.976,0.481],[0.982,0.464],[0.988,0.447],[0.992,0.429],[0.996,0.412],[0.998,0.394],[1,0.377],[1,0.359],[0.999,0.341],[0.997,0.324],[0.995,0.306],[0.991,0.289],[0.987,0.271],[0.981,0.254],[0.974,0.237],[0.966,0.22],[0.957,0.204],[0.946,0.187],[0.934,0.172],[0.92,0.157],[0.904,0.143],[0.888,0.129],[0.871,0.116],[0.852,0.103],[0.833,0.091],[0.813,0.08],[0.793,0.069],[0.772,0.059],[0.75,0.049],[0.727,0.041],[0.703,0.033],[0.679,0.026],[0.655,0.02],[0.63,0.015],[0.605,0.01],[0.58,0.006],[0.554,0.003],[0.528,0.001],[0.503,0],[0.477,0],[0.451,0.002],[0.425,0.005],[0.4,0.01],[0.375,0.015],[0.351,0.022],[0.328,0.029],[0.305,0.038],[0.283,0.048],[0.263,0.059],[0.244,0.071],[0.226,0.084],[0.21,0.097],[0.194,0.112],[0.18,0.126],[0.167,0.142],[0.155,0.157],[0.145,0.174],[0.138,0.191],[0.132,0.208],[0.128,0.225],[0.125,0.243],[0.123,0.261],[0.122,0.278],[0.127,0.295],[0.137,0.312],[0.14,0.329],[0.135,0.347],[0.126,0.363],[0.115,0.379],[0.104,0.395],[0.091,0.411],[0.079,0.426],[0.066,0.441],[0.053,0.457],[0.038,0.471],[0.022,0.485],[0.005,0.498],[0,0.515],[0.023,0.522],[0.049,0.525],[0.074,0.529],[0.089,0.542],[0.081,0.559],[0.083,0.575],[0.105,0.585],[0.114,0.599],[0.101,0.614],[0.102,0.63],[0.125,0.638],[0.147,0.646],[0.151,0.662],[0.139,0.678],[0.133,0.695],[0.146,0.71],[0.164,0.723],[0.184,0.734],[0.206,0.743],[0.231,0.749],[0.256,0.753],[0.282,0.757],[0.307,0.76],[0.332,0.765],[0.358,0.765],[0.367,0.781],[0.37,0.798],[0.372,0.816],[0.373,0.834],[0.374,0.851],[0.374,0.869],[0.374,0.887],[0.375,0.904],[0.375,0.922],[0.375,0.94],[0.375,0.957],[0.375,0.975],[0.375,0.993],[0.391,1],[0.417,1],[0.443,1],[0.469,1],[0.495,1],[0.521,1],[0.547,1],[0.573,1],[0.599,1],[0.625,1],[0.651,1],[0.677,1]]; // Kopfprofil, normiert (0..1), Gesicht nach links
  const W = 660, H = 760, N = 640, BIG = 440, SMALL = 40;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // n gleichmäßig verteilte Punkte entlang des Kopfumrisses, in Box (x,y,h) gesetzt
  function headPts(n, x, y, h, flip) {
    const w = h * 0.68, out = [];
    for (let i = 0; i < n; i++) {
      const f = (i / n) * HEAD.length, a = Math.floor(f), b = (a + 1) % HEAD.length, t = f - a;
      let u = HEAD[a][0] + (HEAD[b][0] - HEAD[a][0]) * t;
      const v = HEAD[a][1] + (HEAD[b][1] - HEAD[a][1]) * t;
      if (flip) u = 1 - u;
      out.push([x + (u - 0.5) * w, y + (v - 0.5) * h]);
    }
    return out;
  }

  // Ziel A: ein großer Kopf mit fünf kleinen darin
  const A = headPts(BIG, 330, 395, 640, false);
  const inner = [[0.47, 0.285, 120, 0], [0.64, 0.21, 86, 1], [0.37, 0.4, 82, 1], [0.66, 0.4, 100, 0], [0.5, 0.5, 70, 1]];
  inner.forEach(([u, v, h, fl]) => headPts(SMALL, 330 + (u - 0.5) * 430, 395 + (v - 0.5) * 640, h, !!fl).forEach((p) => A.push(p)));
  // Ziel B: Gruppe aus 16 Köpfen, einer (Nr. 11) ist „das Ich"
  const B = [];
  for (let k = 0; k < 16; k++) {
    const row = Math.floor(k / 4), col = k % 4;
    const h = 118 + ((k * 37) % 5) * 7 + (k === 11 ? 34 : 0);
    const x = 100 + col * 152 + (row % 2) * 36, y = 108 + row * 178 + ((k * 53) % 3) * 6;
    headPts(SMALL, x, y, h, col < 2).forEach((p) => B.push(p));
  }
  const SEED = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const blue = (i) => i >= 440 && i < 480;

  function mount(host) {
    if (host.__iw) return; host.__iw = true;
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    const ctx = cv.getContext('2d');
    const ink = '#1C1E1D';
    const accent = (cv.closest('[style*="--ac"]') ? getComputedStyle(cv.closest('[style*="--ac"]')).getPropertyValue('--ac').trim() : '') || '#2A5FD9';
    const px = new Float32Array(N), py = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N);
    const rnd = Array.from({ length: N }, (_, i) => ({ d: SEED(i) * 0.35, a: (SEED(i + 900) - 0.5) * 2, s: SEED(i + 40) * 6.28, r: 0.8 + SEED(i + 70) * 0.9 }));
    for (let i = 0; i < N; i++) { px[i] = A[i][0]; py[i] = A[i][1]; }
    let sc = 1, dpr = 1, mx = -999, my = -999;
    const cap = document.querySelector('[data-ichwir-cap]');
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1);
      const r = cv.getBoundingClientRect(); sc = r.width / W;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.width * (H / W) * dpr);
    }
    size(); new ResizeObserver(size).observe(cv);
    cv.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) / sc; my = (e.clientY - r.top) / sc; });
    cv.addEventListener('pointerleave', () => { mx = my = -999; });

    // Zeitplan: halten – verwandeln – halten – zurück
    const HOLD = 3600, MORPH = 2800, CYC = (HOLD + MORPH) * 2;
    let mixPrev = -1, t0 = null, vis = true, lastCap = '';
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(cv);

    function frame(now) {
      if (t0 === null) t0 = now;
      const tt = reduce ? 0 : (now - t0) % CYC;
      let m; // 0 = A (Ich: ein Kopf), 1 = B (Wir: viele)
      if (tt < HOLD) m = 0; else if (tt < HOLD + MORPH) m = (tt - HOLD) / MORPH;
      else if (tt < 2 * HOLD + MORPH) m = 1; else m = 1 - (tt - 2 * HOLD - MORPH) / MORPH;
      const sec = now / 1000;
      const lbl = m < 0.5 ? 'wir-im-ich' : 'ich-im-wir';
      if (cap && lbl !== lastCap) { cap.setAttribute('data-state', lbl); lastCap = lbl; }

      ctx.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const r = rnd[i];
        const e = ease(Math.min(1, Math.max(0, (m - r.d) / 0.65)));
        let tx = A[i][0] + (B[i][0] - A[i][0]) * e, ty = A[i][1] + (B[i][1] - A[i][1]) * e;
        const sw = Math.sin(Math.PI * e) * 90 * r.a;
        tx += sw * Math.cos(r.s); ty += sw * Math.sin(r.s);
        if (!reduce) { tx += Math.sin(sec * 0.9 + r.s) * 1.6; ty += Math.cos(sec * 0.8 + r.s * 1.3) * 1.6; }
        // Zeiger stößt Punkte ab, sie federn zurück
        const dx = px[i] - mx, dy = py[i] - my, d2 = dx * dx + dy * dy;
        if (d2 < 5200) { const f = (1 - d2 / 5200) * 2.4, d = Math.sqrt(d2) + 0.01; vx[i] += (dx / d) * f; vy[i] += (dy / d) * f; }
        vx[i] += (tx - px[i]) * 0.07; vy[i] += (ty - py[i]) * 0.07;
        vx[i] *= 0.82; vy[i] *= 0.82;
        px[i] += vx[i]; py[i] += vy[i];
      }
      // Linien zwischen nahen Punkten (Raster zur Beschleunigung)
      const CELL = 14, gw = Math.ceil(W / CELL) + 2, grid = new Map();
      for (let i = 0; i < N; i++) { const k = (Math.floor(px[i] / CELL) + 1) + (Math.floor(py[i] / CELL) + 1) * gw; (grid.get(k) || grid.set(k, []).get(k)).push(i); }
      ctx.lineWidth = 0.7; ctx.lineCap = 'round';
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          if ((pass === 1) !== blue(i)) continue;
          const cx = Math.floor(px[i] / CELL) + 1, cy = Math.floor(py[i] / CELL) + 1;
          for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
            const c = grid.get((cx + ox) + (cy + oy) * gw); if (!c) continue;
            for (const j of c) { if (j <= i) continue; const dx = px[i] - px[j], dy = py[i] - py[j]; if (dx * dx + dy * dy < 196) { ctx.moveTo(px[i], py[i]); ctx.lineTo(px[j], py[j]); } }
          }
        }
        ctx.strokeStyle = pass ? accent : ink; ctx.globalAlpha = pass ? 0.9 : 0.5; ctx.stroke();
      }
      // Punkte
      ctx.globalAlpha = 1;
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (let i = 0; i < N; i++) { if ((pass === 1) !== blue(i)) continue; const r = rnd[i].r * (pass ? 1.25 : 1); ctx.moveTo(px[i] + r, py[i]); ctx.arc(px[i], py[i], r, 0, 6.2832); }
        ctx.fillStyle = pass ? accent : ink; ctx.fill();
      }
    }
    function loop(now) { if (!cv.isConnected) return; if (vis && !document.hidden) frame(now); if (!reduce) requestAnimationFrame(loop); }
    if (reduce) { for (let k = 0; k < 40; k++) frame(0); } else requestAnimationFrame(loop);
  }
  function scan() { document.querySelectorAll('[data-ichwir]').forEach(mount); }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
