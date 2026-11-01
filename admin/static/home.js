// Accueil (cahier des charges v3, §5)
module.exports = (L) => {
  const { BRAND } = L;
  const strip = [
    ['pharmacie-gare-hay-riad', 'pharmacie', 'Pharmacie Gare Hay Riad', 'E-commerce, réseaux, fiche Google et publicité · Rabat'],
    ['cerafas-logistics', 'cerafas', 'Cerafas Logistics', 'Plateforme trilingue · transporteurs vérifiés'],
    ['eleganza', 'eleganza', 'Éléganza', 'E-commerce bilingue · Canada'],
    ['la7dafan', 'la7dafan', 'La7daFan', '« Voir sur mon mur » · prix en direct'],
    ['nassihacom', 'nassihacom', 'Nassihacom', 'Contact sur chaque écran · bilingue FR / EN'],
  ].map(([slug, key, name, meta], i) => `
          <a href="/cas-clients/${slug}/" data-case="${key}">
            <div class="strip__f"><img src="/assets/img/realisations/${key}-mobile-260.webp" srcset="/assets/img/realisations/${key}-mobile-260.webp 260w, /assets/img/realisations/${key}-mobile.webp 520w" sizes="(max-width: 560px) 62vw, (max-width: 900px) 44vw, 220px" width="520" height="1126" alt="Site ${name} sur mobile"${i === 0 ? ' fetchpriority="high"' : ''} decoding="async" /></div>
            <b>${name}</b><small>${meta}</small>
          </a>`).join('');

  const layers = [
    ['00 · Stratégie', 'Stratégie', 'Audit du dispositif, priorités, feuille de route et copywriting : chaque levier part d’un objectif business.', BRAND.diagnostic, 'Le diagnostic'],
    ['01 · Conception', 'Conception', 'Sites vitrines, e-commerce et plateformes codés sur mesure, pensés pour convertir.', '/services/creation-site-web/', 'Création de sites'],
    ['02 · Acquisition', 'Acquisition', 'Media buying Meta, Google et TikTok Ads, relié à des pages d’arrivée dédiées et à vos ventes réelles.', '/services/publicite-meta-google-ads/', 'Publicité'],
    ['03 · Mesure', 'Mesure', 'Google Tag Manager, GA4, API Conversions Meta et suivi côté serveur : chaque demande et chaque vente rattachée à sa source.', '/services/tracking-server-side/', 'Tracking'],
    ['04 · Visibilité', 'Visibilité', 'Référencement Google, fiche Google et AEO : être trouvé, et cité par les moteurs de réponse IA.', '/services/seo-aeo/', 'SEO & AEO'],
    ['05 · Activation', 'Activation', 'Community management, création de contenu et vidéo, relances WhatsApp, CRM et IA : chaque demande suit son parcours jusqu’à la vente.', '/services/reseaux-sociaux/', 'Réseaux sociaux · IA'],
  ].map(([n, t, p, href, lbl]) => `
          <a class="layer" href="${href}" data-reveal><small>${n}</small><h3>${t}</h3><p>${p}</p><span>${lbl}</span></a>`).join('');

  const proof = (slug, key, host, name, decision, specs) => `
          <a class="proofcard" href="/cas-clients/${slug}/" data-case="${key}" data-reveal>
            <div class="shot__frame"><div class="shot__bar"><i></i><i></i><i></i><span>${host}</span></div><img src="/assets/img/realisations/${key}-desktop.webp" width="1200" height="750" loading="lazy" decoding="async" alt="Site ${name}" /></div>
            <small>${name}</small>
            <h3>« ${decision} »</h3>
            <div class="spec">${specs.map(s => `<span>${s}</span>`).join('')}</div>
          </a>`;

  return [{
    path: '/',
    current: 'home',
    head: {
      title: 'OBM System · Croissance digitale à Rabat, Maroc',
      description: 'Agence de conseil 360° : stratégie, sites sur mesure, e-commerce, Meta, Google & TikTok Ads, tracking, SEO & AEO, contenu, CRM et IA. Réservez votre diagnostic.',
      ogTitle: `OBM System · ${BRAND.slogan}`,
      preload: '<link rel="preload" as="image" href="/assets/img/realisations/pharmacie-mobile-260.webp" imagesrcset="/assets/img/realisations/pharmacie-mobile-260.webp 260w, /assets/img/realisations/pharmacie-mobile.webp 520w" imagesizes="(max-width: 560px) 62vw, (max-width: 900px) 44vw, 220px" fetchpriority="high" />',
    },
    schema: L.orgGraph(),
    main: `
    <section class="hero">
      <div class="wrap">
        <span class="kicker">${BRAND.descriptor} · Rabat</span>
        <div class="hero__row">
          <div>
            <h1>Ingénierie et précision. L’exécution chirurgicale des ventes.</h1>
            <p class="sub">${BRAND.trade}</p>
          </div>
          <div>
            <p class="lead">De la stratégie à l’exécution, nous concevons le système qui transforme votre présence en ligne en croissance mesurable : sites sur mesure, media buying Meta, Google et TikTok, mesure fiable des conversions, visibilité sur Google et dans les moteurs IA, contenu et réseaux sociaux. Une seule équipe, du diagnostic au pilotage.</p>
            <div class="actions">
              <a class="btn" href="${BRAND.diagnostic}" data-loc="hero">Réserver mon diagnostic (30 min)</a>
              <a class="link" href="/cas-clients/">Voir l’anatomie de nos réalisations</a>
            </div>
            <p class="note">PME, groupes et marques · Maroc &amp; international</p>
          </div>
        </div>
        <div class="strip" aria-label="Nos réalisations">${strip}
        </div>
      </div>
    </section>

    <section class="section section--rule" aria-labelledby="a-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">Notre approche</span>
            <h2 class="h2" id="a-t">La croissance ne vient pas d’un levier isolé. Elle vient de leur architecture.</h2>
          </div>
          <p class="lead">Tout part de la stratégie. Chaque levier a ensuite une fonction précise dans le parcours de votre client. Nous les concevons ensemble, pour qu’ils se renforcent au lieu de s’additionner.</p>
        </div>
        <div class="layers">${layers}
        </div>
      </div>
    </section>

    <section class="section section--rule" aria-labelledby="r-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">Réalisations</span>
            <h2 class="h2" id="r-t">Anatomie d’un système</h2>
          </div>
          <p class="lead">Un site se juge aux décisions qui le font vendre. Pour chaque projet, nous montrons les choix de conception et ce qu’ils apportent au business. <a class="link" href="/cas-clients/">Toutes les réalisations</a></p>
        </div>
        <div class="proofs">${proof('cerafas-logistics', 'cerafas', 'cerafas.ma', 'Cerafas Logistics', 'Aucun transporteur visible sans trois pièces vérifiées.', ['RC · Licence · Assurance : 3/3'])}${proof('nassihacom', 'nassihacom', 'nassihacom.ma', 'Nassihacom', 'Appel, WhatsApp et contact sur chaque écran.', ['barre fixe', '3 actions directes'])}${proof('la7dafan', 'la7dafan', 'la7dafan.ma', 'La7daFan', 'Format et cadre : le prix suit en direct.', ['990 → 1 290 → 1 640 DH'])}
        </div>
      </div>
    </section>

    <section class="section section--night" aria-labelledby="m-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">Méthode</span>
            <h2 class="h2" id="m-t">Du diagnostic au pilotage</h2>
          </div>
          <p class="lead">Six étapes, avec à chacune un livrable concret. <a class="link" href="/methode/">La méthode en détail</a></p>
        </div>
        <ol class="steps">
          <li><h3>Diagnostic de croissance</h3><p>30 minutes pour lire votre dispositif et fixer l’objectif prioritaire.</p></li>
          <li><h3>Proposition écrite</h3><p>Le périmètre, le délai et le prix, avant tout engagement.</p></li>
          <li><h3>Maquettes</h3><p>Chaque page validée avant la première ligne de code.</p></li>
          <li><h3>Développement et mesure</h3><p>Le site est construit et le marquage installé : GTM, GA4, Meta.</p></li>
          <li><h3>Mise en ligne</h3><p>Prise en main du site et accès à vos statistiques, sur vos propres comptes.</p></li>
          <li><h3>Pilotage</h3><p>Lecture des résultats, décisions et plan d’actions.</p></li>
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="j-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">Journal</span>
            <h2 class="h2" id="j-t">Analyses</h2>
          </div>
          <p class="lead">Mesure, acquisition, visibilité : ce que nous appliquons, expliqué avec précision. <a class="link" href="/blog/">Tous les articles</a></p>
        </div>
        <div class="posts">
          <a class="post" href="/blog/crm-meta-api-conversions/" data-reveal><small>Mesure</small><h3>CRM → Meta : renvoyer chaque étape du pipeline via l’API Conversions</h3><p>Pour que Meta optimise sur vos clients, et non sur de simples formulaires remplis.</p><span>Lire l’analyse</span></a>
          <a class="post" href="/blog/safari-itp-tracking-server-side/" data-reveal><small>Mesure</small><h3>Safari ITP : votre serveur de tracking survit-il à 7 jours ?</h3><p>Ce que Safari limite, depuis quelle version, et comment servir la mesure depuis votre propre domaine.</p><span>Lire l’analyse</span></a>
          <a class="post" href="/blog/meta-ga4-caisse-quel-chiffre-piloter/" data-reveal><small>Publicité</small><h3>Meta, GA4, la caisse : quel chiffre piloter ?</h3><p>Pourquoi les trois ne disent jamais la même chose, et comment décider malgré tout.</p><span>Lire l’analyse</span></a>
        </div>
      </div>
    </section>

    ${L.ctaBand({ loc: 'home-band' })}
`,
  }];
};
