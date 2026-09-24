/* Zwei animierte Köpfe für die Psychologie-Seite.
   - "wire":  Drahtkopf aus tuschartigen Linien (Canvas 2D)
   - "hatch": blau bemalter Kopf mit Kreuzschraffur (WebGL)
   Beide teilen dieselbe prozedurale Kopfform und wenden sich dem Mauszeiger zu.
   Einbinden: <div data-head3d="wire|hatch"></div> */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const g = (d2, w) => Math.exp(-d2 / w);

  // Radius der Kopfoberfläche in Richtung (x,y,z) (Einheitsvektor, Gesicht zeigt nach +z).
  function radius(x, y, z) {
    let a = 0.7, b = 1.12, c = 0.94;
    if (z < 0) c *= 1 + 0.1 * sm(-0.5, 0.4, y);
    const low = sm(0.1, -0.85, y);
    a *= 1 - 0.36 * low;
    c *= z < 0 ? 1 - 0.42 * low : (1 - 0.3 * sm(-0.66, -0.97, y)) * (1 + 0.1 * sm(0.15, -0.45, y) * (1 - sm(-0.7, -0.95, y)));
    let r = 1 / Math.sqrt((x / a) ** 2 + (y / b) ** 2 + (z / c) ** 2);
    const f = sm(0.2, 0.7, z), u = x, v = y, au = Math.abs(u);
    if (f > 0) {
      // Nase: vom Rücken (v≈0.1) zur Spitze (v≈-0.3)
      const prof = sm(0.1, -0.3, v) * (1 - sm(-0.31, -0.39, v));
      if (v < 0.16 && v > -0.4) r += f * (0.025 + 0.22 * prof) * g(u * u, 0.0025 + 0.011 * prof);
      r += f * 0.06 * g((v - 0.14) ** 2, 0.004) * g((au - 0.17) ** 2, 0.03);
      r -= f * 0.08 * g((v - 0.03) ** 2, 0.004) * g((au - 0.19) ** 2, 0.008);
      r += f * 0.025 * g((v - 0.025) ** 2, 0.001) * g((au - 0.19) ** 2, 0.003);
      r += f * 0.04 * g((v + 0.47) ** 2, 0.0012) * g(u * u, 0.016);
      r -= f * 0.025 * g((v + 0.515) ** 2, 0.0004) * g(u * u, 0.02);
      r += f * 0.035 * g((v + 0.56) ** 2, 0.0015) * g(u * u, 0.011);
      r += f * 0.09 * g((v + 0.74) ** 2, 0.006) * g(u * u, 0.03);
      r += f * 0.035 * g((v + 0.1) ** 2, 0.012) * g((au - 0.34) ** 2, 0.01);
    }
    r += 0.045 * g((y + 0.04) ** 2, 0.012) * g((z + 0.08) ** 2, 0.006) * sm(0.85, 0.98, Math.abs(x));
    // Hals, setzt hinter dem Kinn an
    const dx = 0, dy = -0.99, dz = -0.12;
    const ca = x * dx + y * dy + z * dz;
    if (ca > 0) {
      const sa = Math.sqrt(Math.max(1e-6, 1 - ca * ca));
      const rn = Math.min(0.37 / sa, 1.48 / ca);
      const k = 0.12, h = Math.max(k - Math.abs(r - rn), 0) / k;
      r = Math.max(r, rn) + h * h * k * 0.25;
    }
    return r;
  }
  const P = (x, y, z) => { const l = Math.hypot(x, y, z); x /= l; y /= l; z /= l; const r = radius(x, y, z); return [x * r, y * r, z * r]; };
  const dirOf = (th, ph) => [Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)];

  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // Blickrichtung: folgt dem Zeiger, sonst langsames Wiegen
  const pointer = { x: 0, y: 0, active: false };
  addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = e.clientY / innerHeight * 2 - 1; pointer.active = true; }, { passive: true });

  function makeLook(baseYaw, el) {
    const s = { yaw: baseYaw, pitch: 0 };
    return (t) => {
      let ty = baseYaw + Math.sin(t * 0.00023) * 0.35, tp = Math.sin(t * 0.00031) * 0.08;
      if (pointer.active) {
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.width / 2) / innerWidth * 2 - 1, cy = (r.top + r.height * 0.4) / innerHeight * 2 - 1;
        ty = baseYaw * 0.35 + Math.max(-1.1, Math.min(1.1, (pointer.x - cx) * 1.2));
        tp = Math.max(-0.35, Math.min(0.35, (pointer.y - cy) * 0.5));
      }
      s.yaw += (ty - s.yaw) * 0.04; s.pitch += (tp - s.pitch) * 0.04;
      return s;
    };
  }

  // ---------- Drahtkopf ----------
  function wireLines() {
    seed = 11;
    const lines = [];
    const jit = () => 1 + (rnd() - 0.5) * 0.03;
    for (let i = 0; i < 16; i++) {
      const th = 0.18 + i * 0.165 + (rnd() - 0.5) * 0.06, pts = [], turns = 1 + (rnd() < 0.3 ? 0.4 : 0), ph0 = rnd() * 6.28;
      const n = Math.round(90 * turns);
      for (let j = 0; j <= n; j++) {
        const ph = ph0 + j / 90 * 6.2832, w = th + Math.sin(ph * 3 + i) * 0.04;
        const p = P(...dirOf(w, ph)), k = jit();
        pts.push([p[0] * k, p[1] * k, p[2] * k]);
      }
      lines.push(pts);
    }
    for (let i = 0; i < 9; i++) {
      const ph = i / 9 * Math.PI + rnd() * 0.2, pts = [];
      for (let j = 0; j <= 120; j++) {
        const th = j / 120 * 2 * Math.PI, d = [Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)];
        const p = P(...d), k = jit();
        pts.push([p[0] * k, p[1] * k, p[2] * k]);
      }
      lines.push(pts);
    }
    // gekritzelte Linien, dichter im Gesicht
    for (let s = 0; s < 34; s++) {
      const face = s < 22;
      let th = face ? 1.25 + (rnd() - 0.5) * 1.1 : rnd() * 2.6 + 0.2, ph = face ? (rnd() - 0.5) * 1.3 : rnd() * 6.28, ang = rnd() * 6.28;
      const pts = [], n = 40 + Math.floor(rnd() * 60);
      for (let j = 0; j < n; j++) {
        ang += (rnd() - 0.5) * 0.9;
        th += Math.cos(ang) * 0.035; ph += Math.sin(ang) * 0.045;
        if (face) { th += (1.4 - th) * 0.02; ph *= 0.985; }
        th = Math.min(2.9, Math.max(0.1, th));
        const p = P(...dirOf(th, ph)), k = 1.004;
        pts.push([p[0] * k, p[1] * k, p[2] * k]);
      }
      lines.push(pts);
    }
    // Gesichtskonturen: Augen, Nasenrücken, Mund
    const loop = (cu, cv, ru, rv, n) => { const pts = []; for (let j = 0; j <= n; j++) { const a = j / n * 6.2832 * 1.15; const u = cu + Math.cos(a) * ru * (1 + (rnd() - .5) * .15), v = cv + Math.sin(a) * rv; pts.push(P(u, v, Math.sqrt(Math.max(0.05, 1 - u * u - v * v))).map((q) => q * 1.01)); } return pts; };
    lines.push(loop(-0.19, 0.03, 0.075, 0.03, 40), loop(0.19, 0.03, 0.075, 0.03, 40), loop(0, -0.515, 0.11, 0.025, 40));
    const nose = []; for (let j = 0; j <= 30; j++) { const v = 0.1 - j / 30 * 0.42; nose.push(P(0.012, v, 0.95).map((q) => q * 1.01)); } lines.push(nose);
    return lines;
  }

  function mountWire(el) {
    const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    el.appendChild(cv);
    const lines = wireLines(), look = makeLook(parseFloat(el.dataset.yaw || '-0.5'), el);
    const ink = getComputedStyle(el).color || '#1C1E1D';
    const accent = el.dataset.accent || '#2A5FD9';
    let W = 0, H = 0, dpr = 1;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); new ResizeObserver(size).observe(el);
    const buckets = [[], [], [], []];
    function draw(t) {
      const { yaw, pitch } = look(t);
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const S = Math.min(W, H / 1.25) * 1.7, ox = W / 2, oy = H * 0.42, cam = 5;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.lineCap = ctx.lineJoin = 'round';
      buckets.forEach((b) => (b.length = 0));
      const acc = [];
      lines.forEach((pts, li) => {
        const proj = pts.map(([x, y, z]) => {
          y -= 0.2;
          const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
          const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
          const s = S / (cam - z2);
          return [ox + x1 * s, oy - y2 * s, z2];
        });
        for (let i = 0; i < proj.length - 1; i += 6) {
          const seg = proj.slice(i, i + 7), zm = seg.reduce((a, p) => a + p[2], 0) / seg.length;
          (li % 13 === 5 ? acc : buckets[Math.max(0, Math.min(3, Math.floor((zm + 1) * 1.9)))]).push(seg);
        }
      });
      const alph = [0.16, 0.3, 0.55, 0.85];
      buckets.forEach((b, i) => {
        ctx.beginPath();
        b.forEach((seg) => { ctx.moveTo(seg[0][0], seg[0][1]); for (let k = 1; k < seg.length; k++) ctx.lineTo(seg[k][0], seg[k][1]); });
        ctx.strokeStyle = ink; ctx.globalAlpha = alph[i]; ctx.lineWidth = 0.6 + i * 0.22; ctx.stroke();
      });
      ctx.beginPath();
      acc.forEach((seg) => { ctx.moveTo(seg[0][0], seg[0][1]); for (let k = 1; k < seg.length; k++) ctx.lineTo(seg[k][0], seg[k][1]); });
      ctx.strokeStyle = accent; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.1; ctx.stroke();
      ctx.globalAlpha = 1;
    }
    return draw;
  }

  // ---------- Schraffierter Kopf (WebGL) ----------
  const VS = `attribute vec3 p;attribute vec3 n;uniform mat3 R;uniform float asp,sc;varying vec3 vn,vp,op;
void main(){vec3 q=R*(p-vec3(0.,.2,0.));vn=R*n;op=p;vp=q;float s=sc/(5.-q.z);gl_Position=vec4(q.x*s/asp,q.y*s+.15,-q.z*.2,1.);}`;
  const FS = `precision highp float;varying vec3 vn,vp,op;uniform vec3 base;uniform float dpr;
float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float nz(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float hatch(vec2 c,float a,float fr,float th){vec2 d=vec2(cos(a),sin(a));float w=nz(vec3(c*.02,a))*1.6;float l=abs(fract(dot(c,d)/fr+w)-.5)*fr;return 1.-smoothstep(th,th+.9,l);}
void main(){vec3 N=normalize(vn);if(!gl_FrontFacing)N=-N;vec3 L=normalize(vec3(-.55,.6,.6));
float pn=nz(op*9.)*.5+nz(op*23.)*.25;N=normalize(N+(vec3(nz(op*7.),nz(op*7.+3.),nz(op*7.+7.))-.5)*.35);
float d=max(dot(N,L),0.);float tone=d*.85+.1+(pn-.37)*.25;
vec3 col=base*(.72+.5*pn);float scr=smoothstep(.62,.7,nz(op*3.5+vec3(4.))+.25*nz(op*18.));
col=mix(col,vec3(.93,.92,.88),scr*step(op.z,.2)*.9);
float red=smoothstep(.74,.78,nz(op*4.+vec3(9.)))*step(.25,op.z)*step(op.y,.3);col=mix(col,vec3(.8,.22,.12),red*.9);
vec2 c=gl_FragCoord.xy/dpr;float ink=0.;
if(tone<.6)ink=max(ink,hatch(c,.8,6.,.35));
if(tone<.38)ink=max(ink,hatch(c,-.75,5.,.3));
if(tone<.2)ink=max(ink,hatch(c,.05,4.,.3));
float rim=1.-abs(N.z);ink=max(ink,smoothstep(.72,.9,rim+nz(op*14.)*.15)*.9);
float hi=d>.83?hatch(c,-1.1,7.,.35)*.8:0.;
col=mix(col,vec3(.97,.96,.92),hi);col=mix(col,vec3(.07,.08,.09),ink*.88);
gl_FragColor=vec4(col,1.);}`;

  function headMesh(NT, NP) {
    const pos = [], idx = [];
    for (let i = 0; i <= NT; i++) for (let j = 0; j <= NP; j++) pos.push(...P(...dirOf(0.001 + i / NT * (Math.PI - 0.002), j / NP * 6.2832)));
    for (let i = 0; i < NT; i++) for (let j = 0; j < NP; j++) { const a = i * (NP + 1) + j, b = a + NP + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    const nor = new Float32Array(pos.length);
    for (let k = 0; k < idx.length; k += 3) {
      const [a, b, c] = [idx[k] * 3, idx[k + 1] * 3, idx[k + 2] * 3];
      const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
      const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      for (const v of [a, b, c]) { nor[v] += n[0]; nor[v + 1] += n[1]; nor[v + 2] += n[2]; }
    }
        for (let k = 0; k < nor.length; k += 3) { const l = Math.hypot(nor[k], nor[k + 1], nor[k + 2]) || 1; nor[k] /= l; nor[k + 1] /= l; nor[k + 2] /= l; }
    return { pos: new Float32Array(pos), nor, idx: new Uint32Array(idx) };
  }

  function mountHatch(el) {
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl || !gl.getExtension('OES_element_index_uint')) return null;
    el.appendChild(cv);
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const m = headMesh(140, 160);
    const buf = (data, loc) => { gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const l = gl.getAttribLocation(pr, loc); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 3, gl.FLOAT, false, 0, 0); };
    buf(m.pos, 'p'); buf(m.nor, 'n');
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
    const U = (n) => gl.getUniformLocation(pr, n);
    const hex = (el.dataset.color || '#3E55B4').replace('#', '');
    gl.uniform3f(U('base'), ...[0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255));
    gl.enable(gl.DEPTH_TEST);
    const look = makeLook(parseFloat(el.dataset.yaw || '-1.2'), el);
    let dpr = 1;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); cv.width = el.clientWidth * dpr; cv.height = el.clientHeight * dpr; };
    size(); new ResizeObserver(size).observe(el);
    return (t) => {
      const { yaw, pitch } = look(t);
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      // R = Rx(pitch) * Ry(yaw), spaltenweise
      gl.uniformMatrix3fv(U('R'), false, [cy, sp * sy, -cp * sy, 0, cp, sp, sy, -sp * cy, cp * cy]);
      gl.uniform1f(U('asp'), cv.width / cv.height); gl.uniform1f(U('sc'), 2.5); gl.uniform1f(U('dpr'), dpr);
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, m.idx.length, gl.UNSIGNED_INT, 0);
    };
  }

  // ---------- Einhängen & Animationsschleife ----------
  const live = new Set();
  function mount(el) {
    if (el.__head) return;
    el.__head = true;
    let draw;
    try { draw = el.dataset.head3d === 'hatch' ? mountHatch(el) : mountWire(el); } catch (e) { console.warn(e); }
    if (!draw) { el.style.display = 'none'; return; }
    const item = { el, draw, vis: true };
    new IntersectionObserver(([e]) => { item.vis = e.isIntersecting; }).observe(el);
    live.add(item);
    requestAnimationFrame((t) => draw(t));
  }
  function scan() { document.querySelectorAll('[data-head3d]').forEach(mount); }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  scan();
  if (!reduce) (function loop(t) { live.forEach((i) => { if (!i.el.isConnected) live.delete(i); else if (i.vis) i.draw(t); }); requestAnimationFrame(loop); })(0);
})();
