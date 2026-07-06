/* =========================================================================
   Diamond — shared interactions
   ========================================================================= */
(function () {
  'use strict';

  /* ---- Language toggle (EN <-> AR, with RTL) ------------------------- */
  var STORAGE_KEY = 'diamond-lang';
  var root = document.documentElement;

  function applyLang(lang) {
    var isAr = lang === 'ar';
    root.setAttribute('lang', isAr ? 'ar' : 'en');
    root.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      // The button shows the language you can switch TO.
      btn.textContent = isAr ? 'EN' : 'العربية';
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  var saved = 'en';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) {}
  applyLang(saved);

  document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(root.getAttribute('lang') === 'ar' ? 'en' : 'ar');
    });
  });

  /* ---- Mobile navigation drawer -------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.nav-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('is-open');
        toggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Header shadow on scroll --------------------------------------- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- FAQ accordion -------------------------------------------------- */
  document.querySelectorAll('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq__item');
      var answer = item.querySelector('.faq__a');
      var open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      answer.style.maxHeight = open ? answer.scrollHeight + 'px' : null;
    });
  });

  /* ---- Reveal on scroll ---------------------------------------------- */
  /* threshold must stay 0: an area-percentage threshold (e.g. 0.12) can
     never be satisfied by a target taller than ~8x the viewport (a long
     photo grid, a multi-item showcase) since that much of it can never
     be onscreen at once - the element would sit at opacity:0 forever. */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Animated stat counters ---------------------------------------- */
  var nums = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && nums.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = performance.now();
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Gallery lightbox ---------------------------------------------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lb = document.querySelector('.lightbox');
  if (lb && items.length) {
    var lbInner = lb.querySelector('[data-lb-inner]');
    var current = 0;

    function render(i) {
      current = (i + items.length) % items.length;
      var src = items[current].getAttribute('data-full');
      if (src) {
        lbInner.innerHTML = '<img src="' + src + '" alt="">';
      } else {
        // placeholder fallback
        var label = items[current].getAttribute('data-label') || 'Gallery image';
        lbInner.innerHTML = '<div class="ph ph--dark" style="width:80vw;max-width:900px;aspect-ratio:4/3"><span>' + label + '</span></div>';
      }
    }
    function open(i) { render(i); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('is-open'); document.body.style.overflow = ''; }

    items.forEach(function (it, i) { it.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { render(current - 1); });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { render(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') render(current + 1);
      if (e.key === 'ArrowLeft') render(current - 1);
    });
  }

  /* ---- Footer year ---------------------------------------------------- */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
