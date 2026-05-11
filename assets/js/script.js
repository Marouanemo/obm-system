/* ============================================================
   OBM SYSTEM — interactions & animations · v2
   Mobile-friendly · Native cursor preserved · Idle-paused RAF
   ============================================================ */

(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const isFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

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
        document.body.style.overflow = '';
      } else {
        mobileMenu.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }
    });
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('hidden', '');
        document.body.style.overflow = '';
      })
    );
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        burger.click();
        burger.focus();
      }
    });
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
  // 3. DECORATIVE CURSOR — idle-paused RAF, native cursor preserved
  //    The native browser cursor remains fully visible. This is a subtle
  //    gold ring layer that lags for visual polish. Stops animating after
  //    400ms of pointer inactivity, resumes on movement.
  // ============================================================
  const cursor = document.querySelector('.cursor');
  if (cursor && isFinePointer && !reducedMotion) {
    const ring = cursor.querySelector('.cursor__ring');
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let rafId = null;
    let idleTimer = null;
    let movingSinceMs = 0;
    let darkAt = false;

    const startLoop = () => {
      if (rafId) return;
      const tick = () => {
        const lerp = 0.18;
        const dx = mx - rx;
        const dy = my - ry;
        rx += dx * lerp;
        ry += dy * lerp;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;

        // Stop the loop when the ring has caught up AND the pointer has been still for 400ms
        const stillness = Math.hypot(dx, dy);
        if (stillness < 0.4 && performance.now() - movingSinceMs > 400) {
          rafId = null;
          return;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const handleMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      movingSinceMs = performance.now();
      startLoop();

      // Detect dark sections without setInterval — sampled on movement only
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const el = document.elementFromPoint(mx, my);
        if (!el) return;
        const onDark = !!el.closest('.engine, .cta, .footer, .marquee, .problem--lg, .pillar--featured, .why__col--good');
        if (onDark !== darkAt) {
          cursor.classList.toggle('is-dark', onDark);
          darkAt = onDark;
        }
      }, 80);
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '';
    });

    // Hover states on interactive surfaces — event-driven, not polling
    document.querySelectorAll('a, button, [data-magnetic], summary, .directory__row, .faq__item').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // ============================================================
  // 4. MAGNETIC BUTTONS (desktop only, reduced motion respected)
  // ============================================================
  if (isFinePointer && !reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.25;
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('pointerleave', () => {
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
    ...document.querySelectorAll('.directory__row'),
    ...document.querySelectorAll('.stages__row'),
    ...document.querySelectorAll('.why__row'),
    ...document.querySelectorAll('.faq__item'),
    ...document.querySelectorAll('.cta__title'),
    ...document.querySelectorAll('.cta__form-wrap'),
    ...document.querySelectorAll('.outcomes'),
  ];
  revealTargets.forEach((el) => {
    el.setAttribute('data-reveal', '');
    const parent = el.parentElement;
    const siblings = parent ? Array.from(parent.children).filter(c => c.matches('[data-reveal]')) : [];
    const indexAmongSiblings = siblings.indexOf(el);
    if (indexAmongSiblings > 0) {
      el.style.setProperty('--reveal-delay', `${Math.min(indexAmongSiblings * 60, 360)}ms`);
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // ============================================================
  // 6. COUNTER ANIMATIONS — works on any [data-counter] element
  // ============================================================
  const counters = document.querySelectorAll('[data-counter]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
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
  // 7. ENGINE SCROLL — progressive gold line + per-step reveal
  // ============================================================
  const engineFlow = document.querySelector('.engine__flow');
  const engineSteps = document.querySelectorAll('.engine__step');
  const engineStage = document.querySelector('.engine__stage');

  if (engineFlow && engineStage) {
    let ticking = false;
    const updateEngineProgress = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = engineStage.getBoundingClientRect();
        const total = rect.height + window.innerHeight * 0.5;
        const passed = Math.max(0, window.innerHeight - rect.top);
        const progress = Math.min(1, passed / total);
        engineFlow.style.setProperty('--progress', progress);
        ticking = false;
      });
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
  }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });
  engineSteps.forEach(step => engineStepObserver.observe(step));

  // ============================================================
  // 8. FAQ — accordion behavior (only one open at a time)
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
  // 9. FORM — FormSubmit endpoint with in-page success state
  // ============================================================
  const form = document.getElementById('leadForm');
  const success = document.getElementById('formSuccess');

  // If the user is returning from a successful submission (?envoye=1)
  if (new URLSearchParams(window.location.search).get('envoye') === '1' && form && success) {
    form.setAttribute('hidden', '');
    success.removeAttribute('hidden');
    setTimeout(() => success.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
  }

  if (form && success) {
    form.addEventListener('submit', async (e) => {
      // Native validation first
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
      }

      // Try AJAX submission for instant in-page success
      try {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
          submitBtn.querySelector('span').textContent = 'Envoi en cours…';
        }

        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.setAttribute('hidden', '');
          success.removeAttribute('hidden');
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        // Fallback to standard form POST (FormSubmit handles the redirect via _next)
        if (form.hasAttribute('data-fallback-tried')) return;
        form.setAttribute('data-fallback-tried', '');
        form.submit();
      }
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
