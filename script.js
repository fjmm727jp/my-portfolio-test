(function () {
  'use strict';

  function init() {
    var root = document;
    var main = document.getElementById('fmMain');

    function isMobile() { return window.matchMedia('(max-width:960px)').matches; }
    function scroller() { return isMobile() ? null : main; }

    // ---- scroll reveal ----
    var els = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.transition = 'opacity 0.7s cubic-bezier(.2,.7,.2,1), transform 0.7s cubic-bezier(.2,.7,.2,1)';
    });
    function reveal(el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
      }, { root: scroller(), threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { io.observe(el); });
    } else { els.forEach(reveal); }
    setTimeout(function () { els.forEach(reveal); }, 4000);

    // ---- nav: smooth scroll + scrollspy ----
    var links = Array.prototype.slice.call(root.querySelectorAll('[data-nav]'));
    function setActive(id) {
      links.forEach(function (l) {
        var on = l.getAttribute('data-nav') === id;
        l.style.color = on ? '#F3EADB' : '#8a8270';
        l.style.paddingLeft = on && !isMobile() ? '10px' : '0px';
        var num = l.querySelector('.fm-navnum');
        if (num) num.style.color = on ? '#ED8A8A' : 'inherit';
      });
    }
    links.forEach(function (l) {
      l.addEventListener('click', function (e) { e.preventDefault(); scrollToId(l.getAttribute('data-nav')); });
    });
    if (main) {
      var sections = Array.prototype.slice.call(main.querySelectorAll('section[id]'));
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
      }, { root: scroller(), rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
    setActive('top');

    // ---- WORKS carousel ----
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-dot]'));
    var track = root.querySelector('[data-track]');
    var viewport = root.querySelector('[data-carousel]');
    var active = 0;

    function goCard(i) {
      var n = cards.length;
      if (!n) return;
      active = ((i % n) + n) % n;
      layoutCarousel();
    }
    function layoutCarousel() {
      if (!cards.length || !viewport || !track) return;
      cards.forEach(function (c, i) {
        var on = i === active;
        c.style.transform = on ? 'scale(1)' : 'scale(0.82)';
        c.style.opacity = on ? '1' : '0.4';
        var media = c.querySelector('[data-card-media]');
        if (media) media.style.boxShadow = on ? '0 0 0 2px #ED8A8A, 0 20px 44px rgba(0,0,0,.45)' : 'none';
      });
      var card = cards[active];
      var offset = (viewport.clientWidth / 2) - (card.offsetLeft + card.offsetWidth / 2);
      track.style.transform = 'translateX(' + offset + 'px)';
      dots.forEach(function (d, i) {
        var on = i === active;
        d.style.background = on ? '#ED8A8A' : 'rgba(237,138,138,.4)';
        d.style.width = on ? '26px' : '9px';
      });
    }

    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { goCard(active - 1); });
    if (next) next.addEventListener('click', function () { goCard(active + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { goCard(i); }); });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { goCard(i); }); });

    var sx = null;
    if (viewport) {
      viewport.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      window.addEventListener('pointerup', function (e) {
        if (sx === null) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 44) goCard(active + (dx < 0 ? 1 : -1));
        sx = null;
      });
    }
    window.addEventListener('resize', layoutCarousel);
    layoutCarousel();
    [120, 400, 900].forEach(function (t) { setTimeout(layoutCarousel, t); });

    // ---- contact form overlay ----
    var floatCta = root.querySelector('[data-cta-float]');
    var overlay = root.querySelector('[data-contact-overlay]');
    var ink = root.querySelector('[data-contact-ink]');
    var panel = root.querySelector('[data-contact-panel]');
    var closeBtn = root.querySelector('[data-contact-close]');

    function openContact() {
      if (!overlay) return;
      overlay.style.visibility = 'visible';
      overlay.style.pointerEvents = 'auto';
      requestAnimationFrame(function () {
        var big = isMobile() ? '150%' : '160%';
        if (ink) ink.style.clipPath = 'circle(' + big + ' at calc(100% - 76px) calc(100% - 76px))';
        if (panel) panel.style.opacity = '1';
      });
      if (floatCta) { floatCta.style.opacity = '0'; floatCta.style.pointerEvents = 'none'; }
    }
    function closeContact() {
      if (!overlay) return;
      if (panel) panel.style.opacity = '0';
      if (ink) ink.style.clipPath = 'circle(0px at calc(100% - 76px) calc(100% - 76px))';
      setTimeout(function () {
        overlay.style.visibility = 'hidden';
        overlay.style.pointerEvents = 'none';
      }, 760);
      if (floatCta) { floatCta.style.opacity = '1'; floatCta.style.pointerEvents = 'auto'; }
    }
    if (floatCta) floatCta.addEventListener('click', function (e) { e.preventDefault(); openContact(); });
    if (closeBtn) closeBtn.addEventListener('click', closeContact);

    // ---- CTA turns white only on the Contact section ----
    var contactSec = root.querySelector('#contact');
    if (floatCta && contactSec) {
      var arr = floatCta.querySelector('.fm-cta-arrow');
      var tintCheck = function () {
        var r = contactSec.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var reached = r.top < vh * 0.6 && r.bottom > 0;
        if (reached) {
          floatCta.style.background = '#fff';
          floatCta.style.color = '#221C15';
          if (arr) arr.style.color = '#ED8A8A';
        } else {
          floatCta.style.background = '#ED8A8A';
          floatCta.style.color = '#221C15';
          if (arr) arr.style.color = '#221C15';
        }
      };
      if (main) main.addEventListener('scroll', tintCheck, { passive: true });
      window.addEventListener('scroll', tintCheck, { passive: true });
      window.addEventListener('resize', tintCheck);
      tintCheck();
      [200, 600, 1200].forEach(function (t) { setTimeout(tintCheck, t); });
    }

    // ---- scrollToId ----
    function scrollToId(id) {
      var target = root.querySelector('#' + id);
      if (!target) return;
      if (isMobile() || !main) {
        var y = target.getBoundingClientRect().top + window.scrollY - 6;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        main.scrollTo({ top: target.offsetTop - 2, behavior: 'smooth' });
      }
    }

    // ---- mobile hamburger menu ----
    var burger = root.querySelector('[data-burger]');
    var nav = root.querySelector('.fm-nav');
    var menuOpen = false;
    function applyMenu() {
      if (!nav) return;
      if (!isMobile()) {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.gap = '2px';
        nav.style.margin = '24px 0';
        nav.style.position = '';
        nav.style.top = '';
        nav.style.left = '';
        nav.style.right = '';
        nav.style.background = '';
        nav.style.padding = '';
        nav.style.boxShadow = '';
        nav.style.borderBottom = '';
        return;
      }
      if (menuOpen) {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.gap = '6px';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = '#221C15';
        nav.style.padding = '16px 22px 22px';
        nav.style.boxShadow = '0 20px 34px rgba(0,0,0,.34)';
        nav.style.borderBottom = '1.5px solid #3a342b';
      } else {
        nav.style.display = 'none';
      }
    }
    if (burger && nav) {
      burger.addEventListener('click', function (e) { e.stopPropagation(); menuOpen = !menuOpen; applyMenu(); });
      links.forEach(function (l) { l.addEventListener('click', function () { menuOpen = false; applyMenu(); }); });
      window.addEventListener('resize', applyMenu);
      applyMenu();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
