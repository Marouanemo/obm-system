// Page de l'offre d'entrée : Diagnostic de croissance (cahier des charges v3, §6 et §12.4)
module.exports = (L) => {
  const { BRAND, escapeHtml } = L;
  // Question « Avec qui se fait l'échange ? » volontairement absente tant qu'Oualid n'a pas fourni la réponse.
  const faq = [
    ['Le diagnostic est-il engageant ?', 'Non. Il sert à établir vos priorités. Une proposition n’est envoyée que si le projet s’y prête.'],
    ['Et si je dois décaler ?', 'Vous pouvez reprogrammer depuis l’e-mail de confirmation, idéalement 24 h à l’avance.'],
  ];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${L.SITE_URL}${BRAND.diagnostic}#service`,
    name: 'Diagnostic de croissance',
    serviceType: 'Audit et stratégie digitale',
    description: '30 minutes en visio ou par téléphone pour lire votre dispositif actuel, clarifier vos objectifs et identifier les leviers de croissance à activer en priorité.',
    provider: { '@id': L.ORG_ID },
    areaServed: [{ '@type': 'Country', name: 'Maroc' }, 'International'],
    url: `${L.SITE_URL}${BRAND.diagnostic}`,
  };
  const calUrl = `${BRAND.calendly}?hide_gdpr_banner=1&primary_color=5b43c9`;

  return [{
    path: BRAND.diagnostic,
    current: '',
    head: {
      title: 'Diagnostic de croissance (30 min) · OBM System, Rabat',
      description: '30 minutes en visio ou par téléphone pour lire votre dispositif digital, clarifier vos objectifs et identifier les leviers de croissance à activer en priorité. Réservez votre créneau.',
    },
    schema: [serviceSchema, faqSchema],
    crumbs: [['Accueil', '/'], ['Diagnostic de croissance', null]],
    main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker kicker--mono">00 · Stratégie</span>
        <h1 class="h1">Diagnostic de croissance</h1>
        <p class="lead">30 minutes en visio ou par téléphone pour faire le point sur votre activité, vos objectifs et les leviers à activer en priorité.</p>
        <div class="actions"><a class="btn" href="#creneau" data-loc="diagnostic-top">Choisir mon créneau (30 min)</a></div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="layers" style="grid-template-columns:repeat(2,minmax(0,1fr))">
          <div class="layer">
            <h2 class="h3">Ce que nous regardons ensemble</h2>
            <ul class="checklist">
              <li>Votre activité, vos clients et votre positionnement</li>
              <li>Vos objectifs pour les 6 à 12 prochains mois</li>
              <li>Votre dispositif actuel : site, publicité, référencement, réseaux sociaux, mesure des résultats</li>
              <li>Les leviers les plus rentables pour votre situation</li>
            </ul>
          </div>
          <div class="layer">
            <h2 class="h3">Ce que vous en retirez</h2>
            <ul class="checklist">
              <li>Une lecture claire de vos priorités</li>
              <li>De premières recommandations, applicables tout de suite</li>
              <li>Si le projet s’y prête : une proposition écrite avec le périmètre, le délai et le prix</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--rule" id="creneau" aria-labelledby="c-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">Réservation</span>
            <h2 class="h2" id="c-t">Choisissez votre créneau</h2>
          </div>
          <p class="lead">Pour gagner du temps, gardez à portée de main votre site, vos comptes Instagram, Facebook et Google et, si vous en avez, vos derniers résultats publicitaires.</p>
        </div>
        <div class="calendly-wrap">
          <div class="calendly-inline-widget" id="calendly" data-url="${escapeHtml(calUrl)}"></div>
        </div>
        <p class="muted" style="margin-top:1rem">Le calendrier ne s’affiche pas ? <a class="link" href="${BRAND.calendly}" target="_blank" rel="noopener" data-loc="diagnostic-fallback">Ouvrir la page de réservation</a></p>
        <noscript><p><a href="${BRAND.calendly}">Réserver mon diagnostic</a></p></noscript>
      </div>
    </section>

    <section class="section section--rule" aria-labelledby="f-t">
      <div class="wrap narrow">
        <span class="kicker">Questions fréquentes</span>
        <h2 class="h2" id="f-t" style="margin-bottom:2rem">Avant de réserver</h2>
        <div class="faq">
${faq.map(([q, a]) => `          <details>\n            <summary>${q}</summary>\n            <div class="faq__a"><p>${a}</p></div>\n          </details>`).join('\n')}
        </div>
      </div>
    </section>

    <script>
      // Transmet les UTM de la visite à Calendly, puis charge le widget (uniquement sur cette page)
      (function () {
        var el = document.getElementById('calendly');
        var q = new URLSearchParams(location.search), keep = new URLSearchParams();
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { if (q.get(k)) keep.set(k, q.get(k)); });
        if ([...keep].length) el.setAttribute('data-url', el.getAttribute('data-url') + '&' + keep.toString());
        var s = document.createElement('script');
        s.src = 'https://assets.calendly.com/assets/external/widget.js';
        s.async = true;
        document.body.appendChild(s);
      })();
    </script>
`,
  }];
};
