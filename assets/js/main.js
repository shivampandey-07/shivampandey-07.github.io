(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- year ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- sticky nav shadow ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- mobile menu ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- scroll reveal ---- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('in'); }, Math.min(i * 70, 280));
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- active nav link ---- */
  var sections = ['work', 'oss', 'experience', 'skills', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var navAnchors = {};
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
      navAnchors[a.getAttribute('href').slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = navAnchors[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          Object.keys(navAnchors).forEach(function (k) { navAnchors[k].classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- screenshot rails ---- */
  document.querySelectorAll('.project-shots').forEach(function (shots) {
    var rail = shots.querySelector('[data-rail]');
    var prev = shots.querySelector('[data-prev]');
    var next = shots.querySelector('[data-next]');
    if (!rail) return;

    function step() {
      var card = rail.querySelector('.phone');
      var gap = parseFloat(getComputedStyle(rail).gap) || 18;
      return card ? card.offsetWidth + gap : 220;
    }
    function scrollBy(dir) {
      rail.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { scrollBy(-1); });
    if (next) next.addEventListener('click', function () { scrollBy(1); });

    function syncButtons() {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max;
      if (prev) prev.style.opacity = prev.disabled ? '.4' : '1';
      if (next) next.style.opacity = next.disabled ? '.4' : '1';
      rail.classList.toggle('at-end', rail.scrollLeft >= max);
    }
    rail.addEventListener('scroll', syncButtons, { passive: true });
    window.addEventListener('resize', syncButtons);
    syncButtons();
  });

  /* ---- lightbox ---- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lastFocus = null;

  function openLightbox(img) {
    if (!lb || !lbImg) return;
    lastFocus = document.activeElement;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }
  function closeLightbox() {
    if (!lb) return;
    lb.hidden = true;
    if (lbImg) lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('img[data-zoom]').forEach(function (img) {
    img.addEventListener('click', function () { openLightbox(img); });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb && !lb.hidden) closeLightbox();
  });
})();
