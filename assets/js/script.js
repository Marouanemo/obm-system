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
  // GTM — dataLayer helper (no-op safely if GTM is blocked)
  // ============================================================
  window.dataLayer = window.dataLayer || [];
  function gtmEvent(name, params) {
    try {
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
    } catch (e) { /* never break the page over analytics */ }
  }

  // ============================================================
  // LEADFLOW — CRM integration
  // CORS restricted to obm-system.com on the server side. Rate limiting
  // and abuse protection live on the LeadFlow side.
  // ============================================================
  const LEADFLOW = {
    endpoint: 'https://leadflow-production-d68a.up.railway.app/web-leads',
    apiKey:   '1b5bb99f4de498b44ff6ef9aef6f33607a8e4c48860150ad351122ac00ab79d0',
  };

  async function sendLead(payload) {
    const response = await fetch(LEADFLOW.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LEADFLOW.apiKey,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`LeadFlow ${response.status}: ${text}`);
    }
    return response.json();
  }

  // LeadFlow blocks several accented French tokens (Téléphone, Coordonnées,
  // Réponses, Détail, évaluation, Avancé, ...) when present in the `message`
  // or `ville` field — probably to prevent PII-shaped strings being smuggled
  // through free-text. Strip diacritics on outbound text fields to be safe.
  function stripAccents(s) {
    if (s == null) return '';
    return String(s).normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  // Build a readable notes block. LeadFlow already has typed fields for
  // nom/email/telephone/ville — we DON'T duplicate them in the message
  // (the API rejects certain PII-shaped tokens like "Téléphone" / "Coordonnées",
  // probably to prevent malformed structured payloads being injected via msg).
  // Only contextual extras (cabinet, objectif, diagnostic score) go here.
  function buildNotes({ title, extras }) {
    const lines = [];
    if (title) lines.push(title);
    if (extras && extras.length) {
      extras.forEach(({ label, content }) => {
        if (!content || !String(content).trim()) return;
        lines.push('');
        lines.push(`> ${label}`);
        String(content).split('\n').forEach((ln) => {
          lines.push(`  ${ln}`);
        });
      });
    }
    return lines.join('\n').trim() || undefined;
  }

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

  if (burger && mobileMenu) {
    // Ensure the legacy hidden attribute doesn't fight our class-based toggle
    mobileMenu.removeAttribute('hidden');

    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      mobileMenu.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) closeMenu();
      else openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', closeMenu)
    );

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        burger.focus();
      }
    });

    // Auto-close if viewport grows past the mobile breakpoint
    matchMedia('(min-width: 920px)').addEventListener('change', (e) => {
      if (e.matches) closeMenu();
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
      // Tokenize keeping whitespace, then wrap each word so it stays atomic.
      const tokens = text.split(/(\s+)/);
      tokens.forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
          return;
        }
        const word = document.createElement('span');
        word.className = 'split-word';
        [...token].forEach((ch) => {
          const span = document.createElement('span');
          span.className = 'split-char';
          span.textContent = ch;
          span.style.animationDelay = `${0.3 + charIndex * 0.022}s`;
          word.appendChild(span);
          charIndex++;
        });
        frag.appendChild(word);
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  // ============================================================
  // 2b. HERO — mouse parallax on glow layers (depth + liveliness)
  // ============================================================
  const hero = document.querySelector('.hero');
  const heroGlows = document.querySelectorAll('.hero__glow');
  if (hero && heroGlows.length && isFinePointer && !reducedMotion) {
    const maxOffset = 32;
    let raf = null;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const animate = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      heroGlows.forEach((g, i) => {
        const factor = i === 0 ? 1 : -1.2;
        g.style.translate = `${cx * factor}px ${cy * factor}px`;
      });
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    };

    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * maxOffset * 2;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * maxOffset * 2;
      if (!raf) raf = requestAnimationFrame(animate);
    }, { passive: true });
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
      if (!cursor.classList.contains('is-ready')) cursor.classList.add('is-ready');
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
  // (grouped grids are handled by Motion One stagger, see section 12)
  // ============================================================
  const revealTargets = [
    ...document.querySelectorAll('.section__header'),
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
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const submitSpan = submitBtn?.querySelector('span');
      const originalLabel = submitSpan?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        if (submitSpan) submitSpan.textContent = 'Envoi en cours…';
      }

      const data = new FormData(form);
      const fields = {
        nom:       (data.get('Nom')       || '').toString().trim(),
        email:     (data.get('Email')     || '').toString().trim(),
        telephone: (data.get('Telephone') || '').toString().trim(),
        ville:     (data.get('Ville')     || '').toString().trim(),
        cabinet:   (data.get('Cabinet')   || '').toString().trim(),
        objectif:  (data.get('Objectif')  || '').toString().trim(),
      };

      const notesRaw = buildNotes({
        title: '[Formulaire principal - Audit gratuit]',
        extras: [
          { label: 'Cabinet',  content: fields.cabinet },
          { label: 'Objectif', content: fields.objectif },
        ],
      });
      const payload = {
        nom: fields.nom,
        email: fields.email || undefined,
        telephone: fields.telephone || undefined,
        ville: stripAccents(fields.ville) || undefined,
        message: stripAccents(notesRaw) || undefined,
        source: 'Landing obm-system.com - Formulaire principal',
      };

      try {
        const result = await sendLead(payload);
        // result: { success: true, leadId, duplicate? }
        if (result.duplicate && success.querySelector('p')) {
          success.querySelector('p').textContent =
            "Nous avons déjà votre demande, notre équipe vous recontacte très rapidement. Vous pouvez aussi nous écrire sur WhatsApp pour aller plus vite.";
        }
        gtmEvent('form_submitted', {
          form_source: 'main_audit',
          duplicate: !!result.duplicate,
          lead_id: result.leadId || null,
          has_email: !!fields.email,
          has_ville: !!fields.ville,
        });
        form.setAttribute('hidden', '');
        success.removeAttribute('hidden');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        console.warn('LeadFlow failed, falling back to FormSubmit:', err);
        // Graceful fallback: native form POST to FormSubmit endpoint
        if (!form.hasAttribute('data-fallback-tried')) {
          form.setAttribute('data-fallback-tried', '');
          form.submit();
          return;
        }
        // Last-resort error UI
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          if (submitSpan) submitSpan.textContent = originalLabel || 'Réserver mon audit gratuit';
        }
        alert("Une erreur réseau est survenue. Merci d'utiliser le bouton WhatsApp ou de réessayer dans un instant.");
      }
    });
  }

  // ============================================================
  // 9b. DIAGNOSTIC — interactive maturity assessment
  // ============================================================
  const diagApp = document.getElementById('diagApp');
  if (diagApp) {
    const QUESTIONS = [
      {
        id: 1,
        q: "Combien de demandes patients gérez-vous par mois ?",
        opts: [
          { v: 1, label: "0 à 10",   desc: "Démarrage / pas d'acquisition active" },
          { v: 2, label: "10 à 30",  desc: "Bouche-à-oreille principalement" },
          { v: 3, label: "30 à 100", desc: "Acquisition mixte (organique + pub)" },
          { v: 4, label: "100+",     desc: "Système d'acquisition rodé" },
        ],
      },
      {
        id: 2,
        q: "Comment vos leads sont-ils centralisés ?",
        opts: [
          { v: 1, label: "WhatsApp, téléphone, mémoire", desc: "Aucune centralisation" },
          { v: 2, label: "Excel ou cahier",              desc: "Suivi basique manuel" },
          { v: 3, label: "CRM généraliste",              desc: "Outil non spécialisé dentaire" },
          { v: 4, label: "CRM dentaire complet",         desc: "Pipeline, statuts, historique" },
        ],
      },
      {
        id: 3,
        q: "Avez-vous des relances automatiques ?",
        opts: [
          { v: 1, label: "Aucune relance",              desc: "Tout dépend de la mémoire de l'équipe" },
          { v: 2, label: "Relances manuelles ponctuelles", desc: "Quand on a le temps" },
          { v: 3, label: "Confirmations automatiques",  desc: "RDV J-1, H-2" },
          { v: 4, label: "Séquences complètes",         desc: "Capture, qualification, suivi, no-show" },
        ],
      },
      {
        id: 4,
        q: "Connaissez-vous votre coût par patient acquis ?",
        opts: [
          { v: 1, label: "Aucune idée",                desc: "Pas de tracking" },
          { v: 2, label: "Estimation approximative",   desc: "On sent que ça marche ou pas" },
          { v: 3, label: "Suivi par campagne",         desc: "On voit ce qui performe" },
          { v: 4, label: "Patient-level précis",       desc: "Du clic au RDV, du RDV au CA" },
        ],
      },
      {
        id: 5,
        q: "Quel pourcentage de vos demandes deviennent des RDV ?",
        opts: [
          { v: 1, label: "Moins de 20%", desc: "Beaucoup de fuite" },
          { v: 2, label: "20 à 40%",     desc: "Conversion irrégulière" },
          { v: 3, label: "40 à 60%",     desc: "Système qui fonctionne" },
          { v: 4, label: "Plus de 60%",  desc: "Excellence commerciale" },
        ],
      },
      {
        id: 6,
        q: "Quel budget mensuel en publicité (Meta / Google) ?",
        opts: [
          { v: 1, label: "Pas de publicité",      desc: "Uniquement organique" },
          { v: 2, label: "Moins de 5 000 dh",     desc: "Tests, expérimentation" },
          { v: 3, label: "5 000 à 15 000 dh",     desc: "Investissement structuré" },
          { v: 4, label: "Plus de 15 000 dh",     desc: "Acquisition à l'échelle" },
        ],
      },
      {
        id: 7,
        q: "Avez-vous une stratégie d'acquisition claire ?",
        opts: [
          { v: 1, label: "Pas vraiment",                  desc: "Ça se fait au feeling" },
          { v: 2, label: "Quelques actions ponctuelles",  desc: "Pas structuré" },
          { v: 3, label: "Stratégie définie",             desc: "Mais pas pilotée au quotidien" },
          { v: 4, label: "Pilotage complet",              desc: "Objectifs mensuels, ajustements en continu" },
        ],
      },
    ];

    const INSIGHTS = {
      1: "Votre volume de demandes est sous-exploité. Un système d'acquisition structuré peut multiplier votre flux mensuel par 2 à 3 en quelques mois.",
      2: "Vos leads sont dispersés. Sans centralisation, 30 à 50% des opportunités sont perdues — vous ne pouvez ni les suivre ni les optimiser.",
      3: "L'absence de relances automatiques est votre fuite numéro un. Chaque jour qui passe sans relance fait chuter le taux de conversion de 10%.",
      4: "Aucune visibilité sur le ROI publicitaire. Vous investissez à l'aveugle — impossible d'identifier ce qui rapporte, ce qui coûte.",
      5: "Votre taux de conversion est faible. Dans 90% des cas, le problème n'est pas la demande — c'est le système de suivi qui laisse filer les patients.",
      6: "Votre investissement publicitaire est insuffisant pour générer un volume stable. Vos concurrents captent les patients à forte valeur pendant ce temps.",
      7: "Votre acquisition repose sur la chance. Sans stratégie pilotée, impossible de prévoir, mesurer ou amplifier ce qui fonctionne.",
    };

    const VERDICTS = [
      { min: 0,  max: 30,  label: "Embryonnaire",   text: "Tout est à construire — et c'est exactement là que les gains sont les plus rapides. Le potentiel est énorme." },
      { min: 31, max: 60,  label: "En construction", text: "Vous avez posé des bases. Les leviers d'optimisation sont évidents et activables en quelques semaines." },
      { min: 61, max: 85,  label: "Avancé",          text: "Votre système fonctionne. Les marges restent significatives sur l'optimisation continue et le pilotage data." },
      { min: 86, max: 100, label: "Mature",          text: "Système d'élite. Nous vous aidons à scaler intelligemment vers le niveau supérieur." },
    ];

    const panels = {
      intro: diagApp.querySelector('[data-panel="intro"]'),
      questions: diagApp.querySelector('#diagQuestions'),
      result: diagApp.querySelector('[data-panel="result"]'),
    };

    const answers = {};

    // Build all question panels into the container
    QUESTIONS.forEach((Q) => {
      const panel = document.createElement('div');
      panel.className = 'diag__panel diag__panel--question';
      panel.dataset.panel = 'q' + Q.id;
      panel.innerHTML = `
        <header class="diag__panel-header">
          <span class="diag__step-label">Question ${Q.id} / ${QUESTIONS.length}</span>
          <div class="diag__progress"><div class="diag__progress-fill" style="width:${(Q.id / QUESTIONS.length) * 100}%"></div></div>
        </header>
        <h3 class="diag__question">${Q.q}</h3>
        <div class="diag__options"></div>
        ${Q.id > 1 ? `<button type="button" class="diag__back" data-back="${Q.id - 1}">← Question précédente</button>` : `<button type="button" class="diag__back" data-back="intro">← Annuler</button>`}
      `;
      const optsWrap = panel.querySelector('.diag__options');
      Q.opts.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'diag__option';
        btn.dataset.q = Q.id;
        btn.dataset.v = opt.v;
        btn.innerHTML = `
          <span class="diag__option-label">${opt.label}</span>
          <span class="diag__option-desc">${opt.desc}</span>
        `;
        optsWrap.appendChild(btn);
      });
      panels.questions.appendChild(panel);
    });
    panels.questions.removeAttribute('hidden');

    const showPanel = (name) => {
      // hide all panels first
      diagApp.querySelectorAll('.diag__panel').forEach((p) => p.classList.remove('is-active'));
      if (name === 'intro') {
        panels.intro.classList.add('is-active');
      } else if (name === 'result') {
        panels.result.classList.add('is-active');
        renderResult();
      } else {
        const p = diagApp.querySelector(`[data-panel="${name}"]`);
        if (p) p.classList.add('is-active');
      }
      // Scroll the app into view smoothly
      const top = diagApp.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    // Wire intro start
    diagApp.querySelector('[data-action="start"]').addEventListener('click', () => {
      gtmEvent('diagnostic_started');
      showPanel('q1');
    });

    // Wire option clicks (event delegation)
    panels.questions.addEventListener('click', (e) => {
      const optBtn = e.target.closest('.diag__option');
      if (optBtn) {
        const q = parseInt(optBtn.dataset.q, 10);
        const v = parseInt(optBtn.dataset.v, 10);
        answers[q] = v;
        gtmEvent('diagnostic_question_answered', { question: q, value: v });
        if (q < QUESTIONS.length) {
          showPanel('q' + (q + 1));
        } else {
          showPanel('result');
        }
        return;
      }
      const backBtn = e.target.closest('.diag__back');
      if (backBtn) {
        const target = backBtn.dataset.back;
        if (target === 'intro') showPanel('intro');
        else showPanel('q' + target);
      }
    });

    // Restart
    panels.result.querySelector('[data-action="restart"]').addEventListener('click', () => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      const form = document.getElementById('diagForm');
      const success = document.getElementById('diagFormSuccess');
      if (form) form.removeAttribute('hidden');
      if (success) success.setAttribute('hidden', '');
      showPanel('intro');
    });

    // Compute score, animate gauge + insights
    const renderResult = () => {
      const totalPts = Object.values(answers).reduce((a, b) => a + b, 0);
      const maxPts = QUESTIONS.length * 4;
      const score = Math.round((totalPts / maxPts) * 100);

      const verdict = VERDICTS.find((v) => score >= v.min && score <= v.max) || VERDICTS[1];

      document.getElementById('diagVerdictLabel').textContent = verdict.label;
      document.getElementById('diagVerdictText').textContent = verdict.text;

      // Animate score number
      const scoreEl = document.getElementById('diagScoreNum');
      const start = performance.now();
      const duration = 1400;
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        scoreEl.textContent = Math.round(score * easeOut(p));
        if (p < 1) requestAnimationFrame(tick);
        else scoreEl.textContent = score;
      };
      requestAnimationFrame(tick);

      // Render top-3 insights (lowest answers first)
      const sorted = Object.entries(answers)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3);
      const list = document.getElementById('diagInsights');
      list.innerHTML = '';
      sorted.forEach(([qid]) => {
        const li = document.createElement('li');
        li.textContent = INSIGHTS[qid];
        list.appendChild(li);
      });

      // Populate hidden form fields
      document.getElementById('diagFormScore').value = score + '/100';
      document.getElementById('diagFormLabel').value = verdict.label;
      const answersTxt = Object.entries(answers)
        .map(([q, v]) => `Q${q}=${v}`).join(' · ');
      document.getElementById('diagFormAnswers').value = answersTxt;

      // Track completion in GTM
      gtmEvent('diagnostic_completed', {
        score: score,
        score_band: verdict.label,
        total_points: totalPts,
      });
    };

    // Diagnostic form submission — LeadFlow with score/verdict/answers attached
    const diagForm = document.getElementById('diagForm');
    const diagSuccess = document.getElementById('diagFormSuccess');
    if (diagForm && diagSuccess) {
      diagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!diagForm.checkValidity()) {
          diagForm.reportValidity();
          return;
        }

        const submitBtn = diagForm.querySelector('button[type="submit"]');
        const submitSpan = submitBtn?.querySelector('span');
        const originalLabel = submitSpan?.textContent;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
          if (submitSpan) submitSpan.textContent = 'Envoi…';
        }

        const data = new FormData(diagForm);
        const fields = {
          nom:       (data.get('Nom')       || '').toString().trim(),
          telephone: (data.get('Telephone') || '').toString().trim(),
          email:     (data.get('Email')     || '').toString().trim(),
          ville:     (data.get('Ville')     || '').toString().trim(),
          cabinet:   (data.get('Cabinet')   || '').toString().trim(),
        };
        const score = (data.get('Score_Maturite') || '').toString();
        const verdict = (data.get('Maturite') || '').toString();
        const answersTxt = (data.get('Reponses') || '').toString();

        const diagBlock = [
          score ? `Score : ${score} — ${verdict}` : null,
          answersTxt ? `Quiz : ${answersTxt}` : null,
        ].filter(Boolean).join('\n');

        const notesRaw = buildNotes({
          title: '[Diagnostic interactif - auto-evaluation]',
          extras: [
            { label: 'Cabinet',    content: fields.cabinet },
            { label: 'Diagnostic', content: diagBlock },
          ],
        });
        const payload = {
          nom: fields.nom,
          email: fields.email || undefined,
          telephone: fields.telephone || undefined,
          ville: stripAccents(fields.ville) || undefined,
          message: stripAccents(notesRaw) || undefined,
          source: 'Landing obm-system.com - Diagnostic interactif',
        };

        try {
          const result = await sendLead(payload);
          if (result.duplicate && diagSuccess.querySelector('p')) {
            diagSuccess.querySelector('p').textContent =
              "Votre demande précédente est déjà dans notre pipeline. Pour aller plus vite :";
          }
          gtmEvent('form_submitted', {
            form_source: 'diagnostic',
            duplicate: !!result.duplicate,
            lead_id: result.leadId || null,
            score: parseInt(score, 10) || null,
            score_band: verdict,
            has_email: !!fields.email,
            has_ville: !!fields.ville,
          });
          diagForm.setAttribute('hidden', '');
          diagSuccess.removeAttribute('hidden');
        } catch (err) {
          console.warn('LeadFlow failed (diagnostic), falling back to FormSubmit:', err);
          if (!diagForm.hasAttribute('data-fallback-tried')) {
            diagForm.setAttribute('data-fallback-tried', '');
            diagForm.submit();
            return;
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '';
            if (submitSpan) submitSpan.textContent = originalLabel || 'Recevoir mon analyse complète';
          }
          alert("Une erreur réseau est survenue. Merci d'utiliser WhatsApp ou de réessayer dans un instant.");
        }
      });
    }
  }

  // ============================================================
  // 10. YEAR
  // ============================================================
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ============================================================
  // 10b. GTM — outbound click tracking (WhatsApp, phone, email)
  // ============================================================
  const labelFor = (el) => {
    // Use data-source first, fall back to the visible button label
    if (el.dataset && el.dataset.source) return el.dataset.source;
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return txt.slice(0, 60) || 'unknown';
  };
  document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach((a) => {
    a.addEventListener('click', () => {
      gtmEvent('whatsapp_clicked', { source: labelFor(a) });
    });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    a.addEventListener('click', () => {
      gtmEvent('phone_clicked', {
        number: a.getAttribute('href').replace('tel:', ''),
        source: labelFor(a),
      });
    });
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.addEventListener('click', () => {
      gtmEvent('email_clicked', {
        address: a.getAttribute('href').replace('mailto:', ''),
        source: labelFor(a),
      });
    });
  });

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

  // ============================================================
  // 12. MOTION ONE — premium animation layer
  //     (loads via CDN; gracefully falls back if blocked)
  // ============================================================
  const startMotion = () => {
    const M = window.Motion;
    if (!M || reducedMotion) return;

    const { animate, inView, stagger, spring } = M;

    // -------- A. STAGGER REVEALS on grouped lists --------
    const groups = [
      { container: '.problems__grid', items: '.problem',       distance: 32, axis: 'y', delay: 0.06 },
      { container: '.pillars__grid',  items: '.pillar',        distance: 40, axis: 'y', delay: 0.09 },
      { container: '.directory',      items: '.directory__row',distance: 28, axis: 'x', delay: 0.05 },
      { container: '.stages',         items: '.stages__row',   distance: 36, axis: 'y', delay: 0.12 },
      { container: '.why__right',     items: '.why__row',      distance: 32, axis: 'y', delay: 0.08 },
      { container: '.hero__trust',    items: 'li',             distance: 10, axis: 'y', delay: 0.05 },
      { container: '.footer__inner',  items: '.footer__brand, .footer__col', distance: 20, axis: 'y', delay: 0.07 },
    ];

    groups.forEach(({ container, items, distance, axis, delay }) => {
      const wrapper = document.querySelector(container);
      if (!wrapper) return;
      const elements = wrapper.querySelectorAll(items);
      if (!elements.length) return;

      // Initial hidden state
      elements.forEach(el => {
        el.style.opacity = '0';
        el.style.willChange = 'opacity, transform';
        if (axis === 'x') el.style.transform = `translateX(-${distance}px)`;
        else el.style.transform = `translateY(${distance}px)`;
      });

      inView(wrapper, () => {
        animate(
          elements,
          axis === 'x'
            ? { opacity: [0, 1], x: [-distance, 0] }
            : { opacity: [0, 1], y: [distance, 0] },
          {
            delay: stagger(delay),
            duration: 0.85,
            easing: spring({ stiffness: 110, damping: 18, mass: 0.9 }),
          }
        );
      }, { amount: 0.12 });
    });

    // -------- B. 3D TILT on premium cards --------
    const tiltSelector = '.pillar, .problem--lg, .step--featured';
    document.querySelectorAll(tiltSelector).forEach(card => {
      card.style.perspective = '1000px';
      card.style.transformStyle = 'preserve-3d';
      let leaveAnim = null;

      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        if (leaveAnim) leaveAnim.cancel();
        animate(
          card,
          { rotateX: -py * 6, rotateY: px * 8, y: -6 },
          { duration: 0.35, easing: [0.16, 1, 0.3, 1] }
        );
      };

      const handleLeave = () => {
        leaveAnim = animate(
          card,
          { rotateX: 0, rotateY: 0, y: 0 },
          { duration: 0.7, easing: spring({ stiffness: 180, damping: 22 }) }
        );
      };

      card.addEventListener('pointermove', handleMove);
      card.addEventListener('pointerleave', handleLeave);
    });

    // -------- C. SPRING SCALE on every button (y included to preserve lift) --------
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointerenter', () => {
        animate(btn, { scale: 1.035, y: -2 }, { duration: 0.4, easing: spring({ stiffness: 280, damping: 18 }) });
      });
      btn.addEventListener('pointerleave', () => {
        animate(btn, { scale: 1, y: 0 }, { duration: 0.5, easing: spring({ stiffness: 220, damping: 22 }) });
      });
      btn.addEventListener('pointerdown', () => {
        animate(btn, { scale: 0.97, y: 0 }, { duration: 0.12 });
      });
      btn.addEventListener('pointerup', () => {
        animate(btn, { scale: 1.035, y: -2 }, { duration: 0.3, easing: spring({ stiffness: 300, damping: 18 }) });
      });
    });

    // -------- D. HERO ACCENT — continuous breath --------
    const heroAccent = document.querySelector('.hero__title-accent');
    if (heroAccent) {
      animate(
        heroAccent,
        { y: [0, -5, 0] },
        { duration: 5.2, easing: 'ease-in-out', repeat: Infinity }
      );
    }

    // -------- E. SECTION TITLES — slide up on scroll into view --------
    document.querySelectorAll('.section__title').forEach(t => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(20px)';
      inView(t, () => {
        animate(t, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.95,
          easing: spring({ stiffness: 130, damping: 20 }),
        });
      }, { amount: 0.3 });
    });

    // -------- F. ENGINE NODES — pulse-glow on enter --------
    inView('.engine__step', (info) => {
      const node = info.target.querySelector('.engine__node');
      if (node) {
        animate(node, { scale: [0.7, 1.15, 1] }, {
          duration: 0.9, easing: spring({ stiffness: 200, damping: 14 }),
        });
      }
    }, { amount: 0.4 });

    // -------- G. PILLAR ICONS — soft rotate on hover --------
    document.querySelectorAll('.pillar').forEach(p => {
      const icon = p.querySelector('.pillar__icon');
      if (!icon) return;
      p.addEventListener('pointerenter', () => {
        animate(icon, { rotate: 6, scale: 1.08 }, { duration: 0.5, easing: spring({ stiffness: 260, damping: 18 }) });
      });
      p.addEventListener('pointerleave', () => {
        animate(icon, { rotate: 0, scale: 1 }, { duration: 0.6, easing: spring({ stiffness: 200, damping: 22 }) });
      });
    });

    // -------- H. CTA TREATMENTS ICON-LESS list hover glow --------
    document.querySelectorAll('.directory__row').forEach(row => {
      const name = row.querySelector('.directory__name');
      if (!name) return;
      row.addEventListener('pointerenter', () => {
        animate(name, { x: 10 }, { duration: 0.45, easing: spring({ stiffness: 220, damping: 18 }) });
      });
      row.addEventListener('pointerleave', () => {
        animate(name, { x: 0 }, { duration: 0.5, easing: spring({ stiffness: 180, damping: 22 }) });
      });
    });

    // -------- I. STAGES NUMBERS — count-up on enter --------
    inView('.stages__row', (info) => {
      const num = info.target.querySelector('.stages__num');
      if (num) {
        animate(num, { scale: [0.85, 1] }, {
          duration: 0.7, easing: spring({ stiffness: 200, damping: 16 }),
        });
      }
    }, { amount: 0.3 });

    // -------- J. FAQ — smooth height with spring on open --------
    document.querySelectorAll('.faq__item').forEach(item => {
      const icon = item.querySelector('.faq__icon');
      if (!icon) return;
      item.addEventListener('toggle', () => {
        if (item.open) {
          animate(icon, { rotate: 45 }, { duration: 0.35, easing: spring({ stiffness: 260, damping: 18 }) });
        } else {
          animate(icon, { rotate: 0 }, { duration: 0.35, easing: spring({ stiffness: 260, damping: 18 }) });
        }
      });
    });

    // -------- K. DIAGNOSTIC option buttons — spring on hover --------
    document.querySelectorAll('.diag__option').forEach(opt => {
      opt.addEventListener('pointerenter', () => {
        animate(opt, { x: 6 }, { duration: 0.35, easing: spring({ stiffness: 250, damping: 18 }) });
      });
      opt.addEventListener('pointerleave', () => {
        animate(opt, { x: 0 }, { duration: 0.4, easing: spring({ stiffness: 200, damping: 22 }) });
      });
    });

    // -------- L. FAB pulse → spring-driven breath --------
    const fab = document.querySelector('.fab');
    if (fab) {
      animate(fab, { scale: [1, 1.06, 1] }, {
        duration: 2.6, easing: 'ease-in-out', repeat: Infinity,
      });
    }
  };

  // Wait for Motion One CDN to load
  if (window.Motion) {
    startMotion();
  } else {
    window.addEventListener('load', () => {
      if (window.Motion) startMotion();
    });
  }

})();
