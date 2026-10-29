/* ============================================================
   OBM System — navigation, apparitions au défilement, formulaires LeadFlow.
   ============================================================ */

(() => {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------
  // GTM + GA4 — même convention que l'ancien site : un push {event}
  // pour GTM, un gtag('event') pour GA4, sans doublon.
  // ------------------------------------------------------------
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    try {
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (e) { /* l'analytics ne doit jamais casser la page */ }
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
      burger.setAttribute('aria-expanded', String(open));
      burger.textContent = open ? 'Fermer' : 'Menu';
      mnav.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    mnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
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
    if (href.includes('wa.me')) track('whatsapp_click', { location: a.dataset.loc || 'page' });
    else if (href.includes('calendly.com')) track('booking_click', { location: a.dataset.loc || 'page' });
    else if (href.startsWith('tel:')) track('phone_click', { location: a.dataset.loc || 'page' });
    else if (a.classList.contains('work__link')) track('case_click', { case: a.dataset.case || '' });
  });

  // ------------------------------------------------------------
  // Formulaire : LeadFlow d'abord, FormSubmit en secours
  // ------------------------------------------------------------
  const LEADFLOW = {
    endpoint: 'https://leadflow-production-d68a.up.railway.app/web-leads',
    apiKey: '1b5bb99f4de498b44ff6ef9aef6f33607a8e4c48860150ad351122ac00ab79d0',
  };
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
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.querySelector('span') : null;
      const original = label ? label.textContent : '';
      if (btn) btn.disabled = true;
      if (label) label.textContent = 'Envoi en cours…';

      const d = new FormData(form);
      const get = (k) => (d.get(k) || '').toString().trim();
      const notes = [
        `[${form.dataset.lead}]`,
        get('Entreprise') && `> Entreprise\n  ${get('Entreprise')}`,
        get('Besoin') && `> Besoin\n  ${get('Besoin')}`,
        get('Message') && `> Message\n  ${get('Message')}`,
      ].filter(Boolean).join('\n\n');

      try {
        const res = await fetch(LEADFLOW.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': LEADFLOW.apiKey },
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
        track('form_submitted', { form_source: form.dataset.lead, besoin: get('Besoin'), duplicate: !!result.duplicate });
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

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
