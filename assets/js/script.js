/* ============================================================
   OBM SYSTEM — interactions & animations
   ============================================================ */

(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;

  // ============================================================
  // 1. NAV — scroll state + mobile burger
  // ============================================================
  const nav = document.getElementById('nav');
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.getElementById('mobile-menu');

  const onScrollNav = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if (burger) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      if (open) {
        mobileMenu.setAttribute('hidden', '');
      } else {
        mobileMenu.removeAttribute('hidden');
      }
    });
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('hidden', '');
      })
    );
  }

  // ============================================================
  // 2. HERO — split text orchestrated animation
  // ============================================================
  const splitTarget = document.querySelector('[data-split]');
  if (splitTarget && !reducedMotion) {
    const walk = (node, callback) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          callback(child);
        } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('hero__underline')) {
          walk(child, callback);
        }
      });
    };

    let charIndex = 0;
    walk(splitTarget, (textNode) => {
      const text = textNode.textContent;
      if (!text.trim()) return;
      const frag = document.createDocumentFragment();
      [...text].forEach((ch) => {
        if (ch === ' ') {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const span = document.createElement('span');
        span.className = 'split-char';
        span.textContent = ch;
        span.style.animationDelay = `${0.3 + charIndex * 0.022}s`;
        frag.appendChild(span);
        charIndex++;
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  // ============================================================
  // 3. CUSTOM CURSOR
  // ============================================================
  const cursor = document.querySelector('.cursor');
  if (cursor && !isTouch && !reducedMotion) {
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let dx = mx, dy = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    const loop = () => {
      // Dot follows almost instantly
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;

      // Ring lags with smoothing
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    document.querySelectorAll('a, button, [data-magnetic], summary, input, textarea, label').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    // Dark sections — invert cursor
    const darkSelectors = '.engine, .cta, .footer, .marquee, .problem--lg, .pillar--featured, .step--featured, .why__col--good';
    const checkDark = () => {
      const el = document.elementFromPoint(mx, my);
      if (!el) return;
      const onDark = !!el.closest(darkSelectors);
      cursor.classList.toggle('is-dark', onDark);
    };
    setInterval(checkDark, 120);
  }

  // ============================================================
  // 4. MAGNETIC BUTTONS
  // ============================================================
  if (!isTouch && !reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.28;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // ============================================================
  // 5. REVEAL ON SCROLL — IntersectionObserver
  // ============================================================
  const revealTargets = [
    ...document.querySelectorAll('.section__header'),
    ...document.querySelectorAll('.problem'),
    ...document.querySelectorAll('.pillar'),
    ...document.querySelectorAll('.treatment'),
    ...document.querySelectorAll('.step'),
    ...document.querySelectorAll('.why__row'),
    ...document.querySelectorAll('.faq__item'),
    ...document.querySelectorAll('.cta__title'),
    ...document.querySelectorAll('.cta__form-wrap'),
  ];
  revealTargets.forEach((el, idx) => {
    el.setAttribute('data-reveal', '');
    // Add slight stagger for siblings
    const parent = el.parentElement;
    const siblings = parent ? Array.from(parent.children).filter(c => c.matches('[data-reveal]')) : [];
    const indexAmongSiblings = siblings.indexOf(el);
    if (indexAmongSiblings > 0) {
      el.style.setProperty('--reveal-delay', `${indexAmongSiblings * 70}ms`);
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // ============================================================
  // 6. COUNTER ANIMATIONS
  // ============================================================
  const counters = document.querySelectorAll('[data-counter]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const value = target * easeOut(p);
      el.textContent = (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ============================================================
  // 7. ENGINE SCROLL — sticky-style progressive reveal
  // ============================================================
  const engineFlow = document.querySelector('.engine__flow');
  const engineSteps = document.querySelectorAll('.engine__step');
  const engineStage = document.querySelector('.engine__stage');

  if (engineFlow && engineStage) {
    const updateEngineProgress = () => {
      const rect = engineStage.getBoundingClientRect();
      const total = rect.height + window.innerHeight * 0.5;
      const passed = Math.max(0, window.innerHeight - rect.top);
      const progress = Math.min(1, passed / total);
      engineFlow.style.setProperty('--progress', progress);
    };
    window.addEventListener('scroll', updateEngineProgress, { passive: true });
    updateEngineProgress();
  }

  const engineStepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
  engineSteps.forEach(step => engineStepObserver.observe(step));

  // ============================================================
  // 8. FAQ — only one open at a time (optional refinement)
  // ============================================================
  document.querySelectorAll('.faq__item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq__item').forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // ============================================================
  // 9. FORM — basic UX + mailto fallback (no backend for now)
  // ============================================================
  const form = document.getElementById('leadForm');
  const success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const subject = encodeURIComponent('Nouvelle demande d\'audit — OBM SYSTEM');
      const body = encodeURIComponent(
        `Nom du contact : ${data.get('name') || ''}\n` +
        `Cabinet : ${data.get('clinic') || ''}\n` +
        `Téléphone : ${data.get('phone') || ''}\n` +
        `Ville : ${data.get('city') || ''}\n\n` +
        `Objectif principal :\n${data.get('message') || '—'}\n`
      );

      // Open mail client as fallback delivery
      window.location.href = `mailto:Admin@obm-system.com?subject=${subject}&body=${body}`;

      // Show success state
      form.setAttribute('hidden', '');
      success.removeAttribute('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ============================================================
  // 10. YEAR
  // ============================================================
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ============================================================
  // 11. SMOOTH SCROLL FOR INTERNAL LINKS
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = nav?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset + 8;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

})();
