/* SJMC cardiac landing page: behaviour rebuilt from the Ventrix template's Framer effects. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var vw = function () { return window.innerWidth; };
  var vh = function () { return window.innerHeight; };
  var bp = function () { var w = vw(); return w >= 1200 ? "d" : w >= 810 ? "t" : "p"; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var docTop = function (el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; };

  /* ---------------------------------------------------------- smooth scroll (template: Lenis, intensity 20 -> duration 2) */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 2 });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  var scrollY = function () { return window.scrollY || window.pageYOffset; };
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(t, { offset: id === "#top" ? 0 : 0 });
      else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------------------------------------------------------- nav: hide on scroll down, show on scroll up */
  var nav = $("#nav"), burger = $(".burger"), lastY = scrollY();
  function closeMenu() { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", function () {
    var open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $(".mclose").addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  function navTick(y) {
    if (nav.classList.contains("open")) { lastY = y; return; }
    if (y < 10) { nav.classList.remove("hide", "solid"); }
    else if (y > lastY + 2 && y > 80) { nav.classList.add("hide"); }
    else if (y < lastY - 2) { nav.classList.remove("hide"); nav.classList.add("solid"); }
    lastY = y;
  }

  /* ---------------------------------------------------------- scroll progress */
  var bar = $(".progress i");
  function progressTick(y) {
    var max = doc.scrollHeight - vh();
    bar.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";
  }

  /* ---------------------------------------------------------- in-view helper */
  function onView(els, threshold, fn) {
    if (!("IntersectionObserver" in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.unobserve(en.target); fn(en.target); }
      });
    }, { threshold: threshold });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------- heading wipe (two bars, 2s, ease .76/0/.24/1) */
  var EW = "cubic-bezier(.76,0,.24,1)";
  function wipe(wl) {
    if (reduce || !wl.animate) return;
    var d = parseFloat(wl.getAttribute("data-delay")) * 1000 || 0;
    var x = function (v) { return "translateX(" + v + "%)"; };
    wl.querySelector(".w1").animate([
      { transform: x(-100), offset: 0, easing: EW }, { transform: x(0), offset: .25, easing: EW },
      { transform: x(0), offset: .8, easing: EW }, { transform: x(100), offset: 1 }
    ], { duration: 2000, delay: d, fill: "forwards" });
    wl.querySelector(".w2").animate([
      { transform: x(-100), offset: 0, easing: EW }, { transform: x(-100), offset: .15, easing: EW },
      { transform: x(0), offset: .4, easing: EW }, { transform: x(0), offset: .6, easing: EW },
      { transform: x(100), offset: .82, easing: EW }, { transform: x(100), offset: 1 }
    ], { duration: 2000, delay: d, fill: "forwards" });
  }
  onView($$(".wl"), .35, wipe);

  /* ---------------------------------------------------------- badges (bar grows in, 0.5s) */
  onView($$(".badge:not(.is-static)"), 1, function (b) { b.classList.add("in"); });

  /* ---------------------------------------------------------- rolling digit counters */
  onView($$(".num"), .5, function (n) {
    $$(".dg", n).forEach(function (dg, i) {
      var d = +dg.getAttribute("data-d");
      var col = dg.firstElementChild;
      col.style.transitionDelay = (i * .08) + "s";
      col.style.transform = "translateY(" + (-d * 40) + "px)";
    });
  });

  /* ---------------------------------------------------------- footer image + wordmark clip reveal */
  onView($$(".foot-img"), .2, function (el) { el.classList.add("in"); });

  /* ---------------------------------------------------------- testimonial slider */
  $$("[data-slider]").forEach(function (s) {
    var texts = $$(".q-text", s), infos = $$(".q-info", s), dots = $$(".q-dots i", s), cur = 0;
    function go(n) {
      n = (n + texts.length) % texts.length;
      if (n === cur) return;
      texts[cur].classList.remove("on"); texts[cur].classList.add("out");
      infos[cur].classList.remove("on"); dots[cur].classList.remove("on");
      var old = texts[cur];
      setTimeout(function () { old.classList.remove("out"); }, 600);
      cur = n;
      texts[cur].classList.add("on"); infos[cur].classList.add("on"); dots[cur].classList.add("on");
    }
    $(".q-prev", s).addEventListener("click", function () { go(cur - 1); });
    $(".q-next", s).addEventListener("click", function () { go(cur + 1); });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });
  });

  /* ---------------------------------------------------------- procedures: hover a tile to swap the detail card */
  var tiles = $$(".pt"), details = $$(".pd");
  tiles.forEach(function (t, i) {
    var act = function () {
      tiles.forEach(function (x) { x.classList.toggle("on", x === t); });
      details.forEach(function (x, j) { x.classList.toggle("on", j === i); });
    };
    t.addEventListener("mouseenter", act); t.addEventListener("focus", act); t.addEventListener("click", act);
  });

  /* ---------------------------------------------------------- FAQ: single open */
  var fqs = $$(".fq");
  function setFq(f, open) {
    var a = $(".fq-a", f);
    f.classList.toggle("open", open);
    $(".fq-q", f).setAttribute("aria-expanded", String(open));
    a.style.height = open ? a.scrollHeight + "px" : "0px";
  }
  fqs.forEach(function (f) {
    if (f.classList.contains("open")) setFq(f, true);
    f.addEventListener("click", function () {
      var open = !f.classList.contains("open");
      fqs.forEach(function (o) { if (o !== f) setFq(o, false); });
      setFq(f, open);
    });
  });

  /* ---------------------------------------------------------- booking form: opens a pre-filled WhatsApp chat (copy deck section 8) */
  var form = $(".ct-form");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var f = form.elements, doc = form.getAttribute("data-doc"), ref = form.getAttribute("data-ref");
    var msg = "Hi, I'd like a consult with " + doc + ". Concern: " + f.concern.value + ". Preferred day: " + f.day.value + ". " +
      (f.language ? "Language: " + f.language.value + ". " : "") +
      "Payment: " + f.payment.value + ". Name: " + f.name.value.trim() + ". Ref: " + ref;
    var url = "https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(msg);
    form.setAttribute("data-last-url", url);
    window.open(url, "_blank", "noopener");
  });

  /* ---------------------------------------------------------- scroll-target transforms (Framer onScrollTarget, threshold .5) */
  function interp(s, P, V) {
    if (s <= P[0]) return V[0];
    for (var i = 1; i < P.length; i++) {
      if (s <= P[i]) return V[i - 1] + (V[i] - V[i - 1]) * ((s - P[i - 1]) / (P[i] - P[i - 1] || 1));
    }
    return V[V.length - 1];
  }
  var M = {}; // cached measurements
  // Framer onScrollTarget (threshold .5): each target element drives one segment, from its top
  // reaching mid-viewport to its bottom reaching mid-viewport (calibrated against the live template).
  function seg(el, h) { var t = docTop(el); return [t - h, t + el.offsetHeight - h]; }
  function piece(y, segs, vals) { // vals[0] before first segment, vals[i+1] after segment i
    var v = vals[0];
    for (var i = 0; i < segs.length; i++) {
      var a = segs[i][0], b = segs[i][1];
      if (y <= a) return v;
      if (y < b) return v + (vals[i + 1] - v) * ((y - a) / (b - a));
      v = vals[i + 1];
    }
    return v;
  }
  function measure() {
    var h = vh() * .5;
    M.bp = bp();
    var cards = $$(".cc");
    cards.forEach(function (c) { c.style.position = "relative"; c.style.top = "0"; });
    M.care = cards.map(function (c) { return seg(c, h); });
    cards.forEach(function (c) { c.style.position = ""; c.style.top = ""; });
    M.ws = $$(".ws").map(function (w) { return seg(w, h); });
    var stack = $(".fan-stack"), fis = $$(".fi");
    stack.style.transform = "none"; fis.forEach(function (f) { f.style.transform = "none"; });
    var sr = stack.getBoundingClientRect(), cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
    M.fan = fis.map(function (f) { var r = f.getBoundingClientRect(); return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) }; });
    M.ps = $$(".pscroll").map(function (p) { return seg(p, h); });
    M.dirty = true;
  }
  var careLine = $(".cl-div i"), fanStack = $(".fan-stack"), fans = $$(".fi"), pinBottom = $(".pin-bottom");
  var steps = $$(".ps-t"), bullets = $$(".ps-left .ps-b"), ods = $$(".od"), ols = $$(".ol"), ocIc = $(".oc-ic");
  var ROT = [0, 10, -10, 20];
  var cur = { care: -100, stack: 1000, fx: [1, 1, 1, 1], bottom: 0, rot: 0 }, step = -1;
  function applyScroll(y, snap) {
    var k = snap ? 1 : .22, isP = M.bp === "p";
    // care line (template px -520,-523,-311,-97,0 on a 522px track)
    if (!isP && M.care.length === 4) {
      var tc = piece(y, M.care, [-99.6, -100, -59.6, -18.6, 0]);
      cur.care += (tc - cur.care) * k;
      careLine.style.transform = "translateX(" + cur.care.toFixed(2) + "%)";
    }
    // photo fan: Pre Scroll lifts the stack, Work Scroll 01-04 send each photo to its slot, 05 scales the CTA in
    if (!isP && M.ws.length === 7) {
      var P = M.ws;
      var ts = piece(y, [P[0]], [1000, 0]);
      cur.stack += (ts - cur.stack) * k;
      fanStack.style.transform = "translate3d(0," + cur.stack.toFixed(1) + "px,0)";
      fans.forEach(function (f, i) {
        var t = piece(y, [P[i + 1]], [1, 0]);
        cur.fx[i] += (t - cur.fx[i]) * k;
        var p = cur.fx[i], o = M.fan[i];
        f.style.transform = p < .0005 ? "none" : "translate3d(" + (o.x * p).toFixed(1) + "px," + (o.y * p).toFixed(1) + "px,0) rotate(" + (ROT[i] * p).toFixed(2) + "deg)";
      });
      var tb = piece(y, [P[5]], [0, 1]);
      cur.bottom += (tb - cur.bottom) * k;
      pinBottom.style.transform = cur.bottom > .9995 ? "none" : "scale(" + (.1 + .9 * cur.bottom).toFixed(4) + ")";
      pinBottom.style.opacity = cur.bottom.toFixed(3);
    } else {
      fanStack.style.transform = ""; fans.forEach(function (f) { f.style.transform = ""; });
      pinBottom.style.transform = ""; pinBottom.style.opacity = "";
    }
    // care journey: step i is active once Process Scroll i starts crossing mid-viewport; icon turns 120deg per spacer
    if (!isP && M.ps.length === 3) {
      var s = 0;
      for (var i = 1; i < 3; i++) if (y >= M.ps[i][0]) s = i;
      if (s !== step) {
        step = s;
        [steps, bullets, ods, ols].forEach(function (g) { g.forEach(function (el, j) { el.classList.toggle("on", j === s); }); });
      }
      var tr = piece(y, M.ps, [0, 120, 240, 360]);
      cur.rot += (tr - cur.rot) * k;
      ocIc.style.transform = "rotate(" + cur.rot.toFixed(2) + "deg)";
    }
  }

  /* ---------------------------------------------------------- frame loop */
  var lastFrameY = -1, settle = 0;
  function frame() {
    var y = scrollY();
    if (y !== lastFrameY || M.dirty || settle > 0) {
      if (y !== lastFrameY) settle = 40;
      navTick(y); progressTick(y);
      applyScroll(y, M.dirty);
      M.dirty = false; lastFrameY = y; settle--;
    }
    requestAnimationFrame(frame);
  }
  measure();
  applyScroll(scrollY(), true);
  window.addEventListener("load", function () { measure(); });
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { measure(); fqs.forEach(function (f) { if (f.classList.contains("open")) setFq(f, true); }); }, 150);
  });
  window.addEventListener("scroll", function () { if (document.hidden) { navTick(scrollY()); progressTick(scrollY()); applyScroll(scrollY(), true); } }, { passive: true });
  requestAnimationFrame(frame);

  /* ---------------------------------------------------------- custom cursor (desktop, fine pointer) */
  var cursor = $(".cursor");
  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    var ring = $(".cur-ring", cursor), dot = $(".cur-dot", cursor);
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      cursor.classList.toggle("big", !!e.target.closest("a, button, .fq"));
    });
    (function loop() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();
  }
})();
