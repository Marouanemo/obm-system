/* ============================================================
   OBM System — navigation, apparitions au défilement, consentement,
   mesure des intentions de contact et des réservations, formulaires LeadFlow.
   ============================================================ */

(() => {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------
  // Mesure GA4 : un seul envoi par événement, via gtag.
  // (Le jour où GTM sera configuré, remplacer gtag('event') par un dataLayer.push({event}).)
  // ------------------------------------------------------------
  window.dataLayer = window.dataLayer || [];
  const path = location.pathname;
  const PAGE_TYPE = path === '/' ? 'home'
    : path.startsWith('/diagnostic-de-croissance') ? 'diagnostic'
    : path.startsWith('/services/') && path !== '/services/' ? 'pillar'
    : path.startsWith('/cas-clients/') && path !== '/cas-clients/' ? 'case'
    : path.startsWith('/blog/') && path !== '/blog/' ? 'article'
    : path.startsWith('/contact') ? 'contact'
    : 'page';

  function track(name, params) {
    const p = Object.assign({ page_type: PAGE_TYPE }, params || {});
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, p);
    } catch (e) { /* l'analytics ne doit jamais casser la page */ }
  }

  // ------------------------------------------------------------
  // Consentement (Consent Mode v2 : défaut « refusé » posé dans le <head>)
  // ------------------------------------------------------------
  const box = document.getElementById('consent');
  if (box) {
    let saved = null;
    try { saved = localStorage.getItem('obm_consent'); } catch (e) { /* stockage indisponible */ }
    if (!saved) box.hidden = false;
    box.addEventListener('click', (e) => {
      const choice = e.target.getAttribute('data-consent');
      if (!choice) return;
      try { localStorage.setItem('obm_consent', choice); } catch (err) { /* stockage indisponible */ }
      if (choice === 'granted' && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
      }
      if (choice === 'denied' && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
      }
      window.dataLayer.push({ event: 'consent_update', consent: choice });
      box.hidden = true;
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-consent]')) { e.preventDefault(); box.hidden = false; }
    });
  }

  // ------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------
  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.querySelector('.nav__burger');
  const mnav = document.getElementById('mnav');
  if (burger && mnav) {
    const setOpen = (open) => {
      const wasOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(open));
      burger.textContent = open ? 'Fermer' : 'Menu';
      mnav.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { const first = mnav.querySelector('a'); if (first) first.focus(); }
      else if (wasOpen) burger.focus();
    };
    // le focus reste dans le menu tant qu'il est ouvert
    mnav.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const items = [burger, ...mnav.querySelectorAll('a')];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    });
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    mnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setOpen(false); });
  }

  // ------------------------------------------------------------
  // Révélations au défilement (décalage en cascade par groupe)
  // ------------------------------------------------------------
  const revealables = document.querySelectorAll('[data-reveal]');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      group.querySelectorAll(':scope > [data-reveal]').forEach((el, i) => el.style.setProperty('--d', (i * 0.08) + 's'));
    });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  // ------------------------------------------------------------
  // Suivi des intentions de contact
  // ------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const p = { location: a.dataset.loc || 'page', cta_label: (a.textContent || '').trim().slice(0, 80) };
    if (href.includes('wa.me')) track('whatsapp_click', p);
    else if (href.includes('calendly.com') || href.startsWith('/diagnostic-de-croissance')) track('booking_click', p);
    else if (href.startsWith('tel:')) track('phone_click', p);
    else if (a.dataset.case) track('case_click', Object.assign(p, { case: a.dataset.case }));
  });

  // ------------------------------------------------------------
  // Réservations Calendly (widget intégré sur /diagnostic-de-croissance/)
  // ------------------------------------------------------------
  let bookingViewed = false; // Calendly envoie event_type_viewed plusieurs fois
  addEventListener('message', (e) => {
    if (e.origin !== 'https://calendly.com' || !e.data || !e.data.event) return;
    if (e.data.event === 'calendly.event_type_viewed') {
      const wrap = document.querySelector('.calendly-wrap[data-loading]');
      if (wrap) wrap.removeAttribute('data-loading');
    }
    if (e.data.event === 'calendly.event_type_viewed' && !bookingViewed) {
      bookingViewed = true;
      track('booking_view', { tool: 'calendly' });
    }
    if (e.data.event === 'calendly.event_scheduled') {
      track('booking_completed', { tool: 'calendly', offer: 'diagnostic_croissance' });
    }
  });

  // ------------------------------------------------------------
  // WhatsApp : message prérempli avec une référence de page, pour attribuer chaque conversation
  // ------------------------------------------------------------
  const pageRef = (PAGE_TYPE + '-' + (path.split('/').filter(Boolean).pop() || 'accueil')).slice(0, 40);
  const utmSource = new URLSearchParams(location.search).get('utm_source');
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((a) => {
    const base = a.href.split('?')[0];
    const intro = a.href.includes('Site%20%2B%20R') ? 'Bonjour, je souhaite en savoir plus sur l’offre Site + Réseaux.' : 'Bonjour, je souhaite échanger avec OBM System.';
    a.href = base + '?text=' + encodeURIComponent(intro + ' (Réf. ' + pageRef + (utmSource ? ' · ' + utmSource : '') + ')');
  });

  // ------------------------------------------------------------
  // Vidéo de l'offre : bouton pause, et pas de lecture automatique si l'utilisateur limite les animations
  // ------------------------------------------------------------
  document.querySelectorAll('.reel').forEach((reel) => {
    const v = reel.querySelector('video');
    const b = reel.querySelector('.reel-toggle');
    if (!v || !b) return;
    const sync = () => { const paused = v.paused; b.textContent = paused ? 'Lecture' : 'Pause'; b.setAttribute('aria-pressed', String(paused)); };
    if (reducedMotion) { v.removeAttribute('autoplay'); v.pause(); }
    b.addEventListener('click', () => { if (v.paused) v.play(); else v.pause(); });
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
  });

  // ------------------------------------------------------------
  // Formulaire : LeadFlow d'abord, FormSubmit en secours
  // ------------------------------------------------------------
  // La clé LeadFlow n'est plus dans le navigateur : nginx l'ajoute côté serveur (location /api/lead).
  const LEADFLOW = { endpoint: '/api/lead' };
  // LeadFlow refuse certains mots accentués dans les champs libres
  const stripAccents = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '');

  document.querySelectorAll('form[data-lead]').forEach((form) => {
    const ok = document.getElementById(form.dataset.ok);
    // Retour de FormSubmit (secours) : ?envoye=1
    if (new URLSearchParams(location.search).get('envoye') === '1' && ok) {
      form.hidden = true;
      ok.hidden = false;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const get = (k) => (d.get(k) || '').toString().trim();
      // Champ piège : rempli seulement par les robots. On n'envoie rien.
      if (get('_honey')) { form.hidden = true; if (ok) ok.hidden = false; return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.querySelector('span') : null;
      const original = label ? label.textContent : '';
      if (btn) btn.disabled = true;
      if (label) label.textContent = 'Envoi en cours…';

      const notes = [
        `[${form.dataset.lead}]`,
        get('Entreprise') && `> Entreprise\n  ${get('Entreprise')}`,
        get('Besoin') && `> Besoin\n  ${get('Besoin')}`,
        get('Demarrage') && `> Demarrage souhaite\n  ${get('Demarrage')}`,
        get('Message') && `> Message\n  ${get('Message')}`,
      ].filter(Boolean).join('\n\n');

      try {
        const res = await fetch(LEADFLOW.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: get('Nom'),
            email: get('Email') || undefined,
            telephone: get('Telephone') || undefined,
            ville: stripAccents(get('Ville')) || undefined,
            message: stripAccents(notes) || undefined,
            source: `obm-system.com - ${form.dataset.lead}`,
          }),
        });
        if (!res.ok) throw new Error('LeadFlow ' + res.status);
        const result = await res.json().catch(() => ({}));
        track('form_submitted', { form_source: form.dataset.lead, besoin: get('Besoin'), demarrage: get('Demarrage'), duplicate: !!result.duplicate });
        form.hidden = true;
        if (ok) { ok.hidden = false; ok.focus(); }
      } catch (err) {
        if (!form.hasAttribute('data-fallback')) {
          form.setAttribute('data-fallback', '');
          form.submit();
          return;
        }
        if (btn) btn.disabled = false;
        if (label) label.textContent = original;
        alert("Une erreur réseau est survenue. Écrivez-nous sur WhatsApp ou réessayez dans un instant.");
      }
    });
  });
})();
