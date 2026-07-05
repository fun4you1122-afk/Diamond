/* =========================================================================
   Diamond Events — motion & interaction layer
   Parallax, tilt, magnetic buttons, scroll progress, 3D diorama,
   sketch/reality slider. Degrades gracefully: skips everything under
   prefers-reduced-motion; pointer-only effects skip touch devices.
   ========================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Scroll progress bar ---------- */
  if (!reduced) {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
  }

  /* ---------- Parallax registry ---------- */
  var pl = [];
  if (!reduced) {
    document.querySelectorAll('.hero__media video, .hero__media img, .page-hero__media img, [data-parallax]')
      .forEach(function (el) {
        pl.push({ el: el, speed: parseFloat(el.getAttribute('data-parallax')) || 0.18 });
        el.style.transform = 'scale(1.18)';
      });
  }

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function frame() {
    ticking = false;
    var doc = document.documentElement;
    if (bar) {
      var max = doc.scrollHeight - doc.clientHeight || 1;
      bar.style.transform = 'scaleX(' + Math.min(doc.scrollTop / max, 1) + ')';
    }
    var vh = window.innerHeight;
    pl.forEach(function (o) {
      var host = o.el.parentElement.getBoundingClientRect();
      if (host.bottom < -80 || host.top > vh + 80) return;
      var y = (host.top + host.height / 2 - vh / 2) * o.speed;
      o.el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(1.18)';
    });
  }
  var bar = document.querySelector('.scroll-progress');
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Staggered reveals ---------- */
  document.querySelectorAll('.grid, .svc-list, .steps, .stats, .gallery-grid').forEach(function (g) {
    var i = 0;
    Array.prototype.forEach.call(g.children, function (c) {
      if (c.classList.contains('reveal')) { c.style.transitionDelay = Math.min(i * 70, 420) + 'ms'; i++; }
    });
  });

  /* ---------- 3D tilt + glare on cards ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.card, .contact-card, .svc-item, .invite-card').forEach(function (el) {
      el.classList.add('tilt-ready');
      var glare = document.createElement('span');
      glare.className = 'tilt-glare';
      el.appendChild(glare);
      var rect = null;
      el.addEventListener('pointerenter', function () { rect = el.getBoundingClientRect(); });
      el.addEventListener('pointermove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        el.style.setProperty('--gx', (px * 100) + '%');
        el.style.setProperty('--gy', (py * 100) + '%');
        el.style.transform = 'perspective(700px) rotateX(' + ((0.5 - py) * 8).toFixed(2) + 'deg)' +
                             ' rotateY(' + ((px - 0.5) * 8).toFixed(2) + 'deg) translateY(-4px)';
        el.style.transition = 'box-shadow .35s, border-color .35s';
      });
      el.addEventListener('pointerleave', function () {
        rect = null;
        el.style.transform = '';
        el.style.transition = '';
      });
    });

    /* ---------- Magnetic buttons ---------- */
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = 'translate(' + (dx * 8).toFixed(1) + 'px,' + (dy * 6 - 2).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- Interactive 3D stage diorama (design page) ---------- */
  var dio = document.querySelector('[data-diorama]');
  if (dio) {
    var world = dio.querySelector('.d3-world');
    var rotY = -24, rotX = 12, targY = rotY, targX = rotX;
    var dragging = false, lastX = 0, lastY = 0, idleT = Date.now(), auto = !reduced;

    function apply() {
      rotY += (targY - rotY) * 0.12;
      rotX += (targX - rotX) * 0.12;
      world.style.transform = 'translateY(-20px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      if (auto && !dragging && Date.now() - idleT > 2500) targY += 0.05;
      requestAnimationFrame(apply);
    }
    apply();

    dio.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY; idleT = Date.now();
      dio.setPointerCapture(e.pointerId);
    });
    dio.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      targY += (e.clientX - lastX) * 0.4;
      targX -= (e.clientY - lastY) * 0.25;
      targX = Math.max(-4, Math.min(40, targX));
      lastX = e.clientX; lastY = e.clientY; idleT = Date.now();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      dio.addEventListener(ev, function () { dragging = false; idleT = Date.now(); });
    });

    dio.querySelectorAll('.d3-views button').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        targY = parseFloat(btn.getAttribute('data-y'));
        targX = parseFloat(btn.getAttribute('data-x'));
        idleT = Date.now() + 6000;
        dio.querySelectorAll('.d3-views button').forEach(function (b) { b.classList.remove('is-on'); });
        btn.classList.add('is-on');
      });
    });
  }

  /* ---------- Sketch <-> Reality slider ---------- */
  document.querySelectorAll('[data-cslider]').forEach(function (cs) {
    var range = cs.querySelector('input[type="range"]');
    function set(v) { cs.style.setProperty('--pos', v + '%'); }
    set(range.value);
    range.addEventListener('input', function () { set(range.value); });
    if (!reduced) {
      /* gentle intro sweep so users notice it's interactive */
      var t = 0, dir = 1, id = setInterval(function () {
        t += dir * 2;
        var v = 50 + Math.sin(t / 18) * 16;
        set(v); range.value = v;
        if (t > 56) clearInterval(id);
      }, 30);
      cs.addEventListener('pointerdown', function () { clearInterval(id); }, { once: true });
    }
  });
})();

/* ---------- Services showcase: hover list <-> image preview ---------- */
(function () {
  document.querySelectorAll('.svcx').forEach(function (sec) {
    var items = Array.prototype.slice.call(sec.querySelectorAll('.svcx-item'));
    var imgs = Array.prototype.slice.call(sec.querySelectorAll('.svcx__preview img'));
    function activate(i) {
      items.forEach(function (it, j) { it.classList.toggle('is-on', j === i); });
      imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
    }
    items.forEach(function (it, i) {
      ['pointerenter', 'focus', 'click'].forEach(function (ev) {
        it.addEventListener(ev, function () { activate(i); });
      });
      it.setAttribute('tabindex', '0');
    });
    activate(0);
  });
})();
