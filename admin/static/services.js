// Hub Services et 7 pages piliers (cahier des charges v3, §4 et §7)
module.exports = (L) => {
  const { BRAND, escapeHtml } = L;

  const CASES = {
    'cerafas-logistics': ['cerafas', 'cerafas.ma', 'Cerafas Logistics', 'Aucun transporteur visible sans trois pièces vérifiées.', ['RC · Licence · Assurance : 3/3']],
    nassihacom: ['nassihacom', 'nassihacom.ma', 'Nassihacom', 'Appel, WhatsApp et contact sur chaque écran.', ['barre fixe', '3 actions directes']],
    la7dafan: ['la7dafan', 'la7dafan.ma', 'La7daFan', 'Format et cadre : le prix suit en direct.', ['990 → 1 290 → 1 640 DH']],
    'pharmacie-gare-hay-riad': ['pharmacie', 'pharmagareriad.ma', 'Pharmacie Gare Hay Riad', 'Retrait en 30 minutes ou livraison à Rabat, conseil sur WhatsApp avant l’achat.', ['près de 700 produits', 'Click & Collect']],
    eleganza: ['eleganza', 'eleganza.ca', 'Éléganza', 'Une boutique bilingue pour plus de 10 000 produits.', ['Shopify sur mesure', 'FR · EN']],
  };
  const ARTICLES = {
    'refonte-site-5-questions': 'Avant de refaire votre site, posez-vous ces 5 questions',
    'site-vitrine-ecommerce-plateforme': 'Site vitrine, e-commerce ou plateforme : lequel vous faut-il ?',
    'erreurs-meta-ads': 'Publicité Facebook et Instagram : 5 erreurs qui coûtent cher',
    'meta-ga4-caisse-quel-chiffre-piloter': 'Meta, GA4, la caisse : quel chiffre piloter ?',
    'crm-meta-api-conversions': 'CRM → Meta : renvoyer chaque étape du pipeline via l’API Conversions',
    'safari-itp-tracking-server-side': 'Safari ITP : votre serveur de tracking survit-il à 7 jours ?',
    'ga4-6-reglages': 'Google Analytics : 6 réglages à contrôler avant d’analyser',
    'fiche-google-6-reglages': 'Fiche Google : 6 réglages que beaucoup d’entreprises oublient',
    'relances-whatsapp-guide': 'Relances WhatsApp : le guide pour les entreprises au Maroc',
  };

  const caseCard = (slug) => {
    const [key, host, name, decision, specs] = CASES[slug];
    return `<a class="proofcard" href="/cas-clients/${slug}/" data-case="${key}">
            <div class="shot__frame"><div class="shot__bar"><i></i><i></i><i></i><span>${host}</span></div><img src="/assets/img/realisations/${key}-desktop.webp" width="1200" height="750" loading="lazy" decoding="async" alt="Site ${name}" /></div>
            <small>${name}</small>
            <h3>« ${decision} »</h3>
            <div class="spec">${specs.map(s => `<span>${s}</span>`).join('')}</div>
          </a>`;
  };

  const pillar = (p) => {
    const url = `/services/${p.slug}/`;
    const faqSchema = {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })),
    };
    const serviceSchema = {
      '@context': 'https://schema.org', '@type': 'Service', '@id': `${L.SITE_URL}${url}#service`,
      name: p.h1, serviceType: p.serviceType, description: p.answer.replace(/<[^>]+>/g, ''),
      provider: { '@id': L.ORG_ID }, areaServed: [{ '@type': 'Country', name: 'Maroc' }, 'International'], url: `${L.SITE_URL}${url}`,
    };
    return {
      path: url,
      current: 'services',
      head: { title: p.title, description: p.description },
      schema: [serviceSchema, faqSchema],
      crumbs: [['Accueil', '/'], ['Services', '/services/'], [p.short, null]],
      main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker kicker--mono">${p.layer}</span>
        <h1 class="h1">${p.h1}</h1>
        <p class="answer">${p.answer}</p>
      </div>
    </section>
    <div class="wrap pillar">
      <div class="prose">
        <h2>Ce que nous mettons en place</h2>
        <ul class="checklist">${p.deliver.map(d => `<li>${d}</li>`).join('')}</ul>
        ${p.why ? `<h2>${p.why[0]}</h2>\n        ${p.why[1]}` : ''}
        <h2>Comment nous travaillons</h2>
        <ol>${p.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        ${p.cases && p.cases.length ? `<h2>Réalisation liée</h2>\n        <div class="related">${p.cases.map(caseCard).join('')}</div>` : ''}
        <h2>Questions fréquentes</h2>
        <div class="faq">
${p.faq.map(([q, a]) => `          <details>\n            <summary>${q}</summary>\n            <div class="faq__a"><p>${a}</p></div>\n          </details>`).join('\n')}
        </div>
        ${p.articles && p.articles.length ? `<h2>À lire dans le Journal</h2>\n        <ul>${p.articles.map(a => `<li><a href="/blog/${a}/">${ARTICLES[a]}</a></li>`).join('')}</ul>` : ''}
      </div>
      <aside class="pillar__aside">
        <div class="specsheet"><p>Spécifications</p><div class="spec">${p.specs.map(s => `<span>${s}</span>`).join('')}</div></div>
        <a class="btn" href="${BRAND.diagnostic}" data-loc="pillar-${p.slug}">Réserver mon diagnostic (30 min)</a>
        <a class="btn btn--line" href="/services/">Tous les services</a>
      </aside>
    </div>
    ${L.ctaBand({ loc: `pillar-${p.slug}-band` })}
`,
    };
  };

  const PILLARS = [
    {
      slug: 'creation-site-web', short: 'Création de sites', layer: '01 · Conception', serviceType: 'Création de site web sur mesure',
      title: 'Création de site web sur mesure à Rabat · OBM System',
      description: 'Sites vitrines et plateformes codés sur mesure à Rabat : maquettes validées, contact sur chaque écran, FR, AR et EN, et un site qui vous appartient. Code, accès et back-office.',
      h1: 'Sites web sur mesure, conçus pour convertir',
      answer: 'Nous concevons et développons des sites vitrines et des plateformes en code natif, écrits pour votre activité. Chaque page mène à une action précise, le back-office vous rend autonome, et vous restez propriétaire du code et de tous les accès.',
      deliver: [
        'Architecture des pages à partir des questions de vos clients : une page par service, par expertise ou par zone',
        'Maquettes validées page par page avant la première ligne de code',
        'Code natif écrit sur mesure, sans thème générique ni empilement d’extensions',
        'Appel, WhatsApp et formulaire accessibles depuis chaque écran',
        'Versions en français, en arabe (lecture de droite à gauche) et en anglais',
        'Back-office pour modifier vos textes, vos pages et vos articles en autonomie',
        'Marquage installé dès la mise en ligne : GTM, GA4, Meta',
      ],
      why: ['Ce qui distingue nos sites', '<p>Le code est écrit pour votre projet et vous appartient, avec tous les accès : nom de domaine, hébergement, statistiques. À la livraison, nous vous formons au back-office et restons disponibles pour vous accompagner. Vous n’êtes jamais dépendant de nous pour modifier une page.</p>'],
      steps: ['Diagnostic de croissance et proposition écrite : périmètre, délai et prix', 'Maquettes de chaque page, validées avec vous', 'Développement sur un lien de recette, contrôle des performances et du marquage', 'Mise en ligne, formation au back-office et transfert de tous les accès'],
      specs: ['code sur mesure', 'maquettes validées', 'FR · AR (RTL) · EN', 'Core Web Vitals', 'GTM · GA4 · Meta', 'vous êtes propriétaire'],
      cases: ['cerafas-logistics', 'nassihacom'],
      faq: [
        ['Combien coûte un site sur mesure ?', 'Le prix dépend du nombre de pages, des langues et des fonctionnalités. Il est fixé par écrit dans la proposition, après le diagnostic de croissance et avant tout engagement.'],
        ['Pourrai-je modifier le site moi-même ?', 'Oui. Le back-office vous permet de modifier vos textes, vos pages et vos articles. Nous vous formons à la livraison.'],
        ['Qui est propriétaire du site ?', 'Vous. Le code, le nom de domaine, l’hébergement et les statistiques sont à votre nom, et tous les accès vous sont transmis.'],
        ['Pouvez-vous faire un site en arabe ?', 'Oui, avec une vraie version arabe lue de droite à gauche, aux côtés du français et de l’anglais. C’est le cas de la plateforme Cerafas Logistics.'],
        ['Combien de temps faut-il ?', 'Le délai est fixé dans la proposition écrite. Il dépend surtout du nombre de pages et de la rapidité des validations de maquettes.'],
      ],
      articles: ['refonte-site-5-questions', 'site-vitrine-ecommerce-plateforme'],
    },
    {
      slug: 'e-commerce', short: 'E-commerce', layer: '01 · Conception', serviceType: 'Création de site e-commerce',
      title: 'Création de site e-commerce au Maroc · OBM System',
      description: 'Boutiques en ligne pensées pour vendre : catalogue, configurateur, paiement, livraison ou retrait, et événements e-commerce GA4. Au Maroc et à l’international.',
      h1: 'Boutiques en ligne pensées pour vendre',
      answer: 'Nous créons des boutiques en ligne sur mesure ou sur Shopify, selon votre catalogue et votre logistique. Le parcours d’achat est conçu pour lever les hésitations, et chaque étape est mesurée jusqu’au paiement.',
      deliver: [
        'Catalogue structuré : rayons, filtres, fiches produits complètes',
        'Configurateurs quand le produit le demande : format, finition, options avec prix en direct',
        'Paiement, livraison ou retrait en magasin, selon votre organisation',
        'Contact rapide avant l’achat : WhatsApp ou conseil en ligne',
        'Boutique bilingue ou trilingue',
        'Événements e-commerce GA4 et Meta : vue produit, ajout au panier, achat',
        'Back-office pour gérer produits, stocks et commandes',
      ],
      steps: ['Diagnostic de croissance : catalogue, logistique, objectifs', 'Maquettes du parcours d’achat, de la page d’accueil à la confirmation', 'Développement, import du catalogue et recette des paiements', 'Mise en ligne, formation et suivi des premières ventes'],
      specs: ['catalogue', 'configurateur', 'paiement · livraison · retrait', 'événements e-commerce GA4', 'Shopify ou sur mesure'],
      cases: ['la7dafan', 'pharmacie-gare-hay-riad', 'eleganza'],
      faq: [
        ['Shopify ou sur mesure ?', 'Shopify convient à un catalogue classique avec beaucoup de produits. Le sur mesure se justifie dès que le parcours d’achat est particulier : configurateur, certificat, règles de prix. Nous tranchons pendant le diagnostic.'],
        ['Peut-on proposer le retrait en magasin ?', 'Oui. La Pharmacie Gare Hay Riad propose par exemple le retrait en 30 minutes ou la livraison à Rabat.'],
        ['Qui gère les produits après la mise en ligne ?', 'Vous, depuis le back-office. Nous pouvons aussi assurer la mise à jour du catalogue si vous le souhaitez.'],
        ['Les ventes seront-elles mesurées ?', 'Oui : les événements e-commerce sont installés dans GA4 et Meta dès la mise en ligne, pour savoir quelle source génère quelles ventes.'],
      ],
      articles: ['site-vitrine-ecommerce-plateforme'],
    },
    {
      slug: 'publicite-meta-google-ads', short: 'Publicité', layer: '02 · Acquisition', serviceType: 'Media buying Meta, Google et TikTok Ads',
      title: 'Agence Meta Ads et Google Ads au Maroc · OBM System',
      description: 'Media buying Meta, Google et TikTok Ads relié à vos ventes réelles : pages d’arrivée dédiées, API Conversions, rotation créative. Le budget est payé directement aux plateformes.',
      h1: 'Meta Ads et Google Ads reliés à vos ventes',
      answer: 'Nous pilotons vos campagnes Meta, Google et TikTok en les reliant à des pages d’arrivée dédiées et à vos ventes confirmées. Les plateformes optimisent ainsi sur vos clients, et non sur de simples clics ou formulaires.',
      deliver: [
        'Stratégie de campagnes par objectif : notoriété, demandes, ventes',
        'Pages d’arrivée dédiées, alignées sur la promesse de chaque annonce',
        'Créations : visuels, carrousels et vidéos courtes',
        'Rotation créative toutes les 2 à 3 semaines',
        'Pixel Meta et API Conversions, conversions Google Ads',
        'Remontée des ventes confirmées vers les plateformes',
        'Point régulier : ce qu’on garde, ce qu’on coupe, ce qu’on teste',
      ],
      steps: ['Vérification du marquage avant tout lancement', 'Structure de campagnes et créations validées avec vous', 'Lancement progressif et lecture des premiers signaux', 'Pilotage sur les ventes confirmées, pas seulement sur le coût par clic'],
      specs: ['pages d’arrivée dédiées', 'CAPI', 'rotation créative 2 à 3 semaines', 'Meta · Google · TikTok', 'budget payé aux plateformes'],
      cases: ['pharmacie-gare-hay-riad', 'eleganza'],
      faq: [
        ['Le budget publicitaire est-il compris ?', 'Non. Le budget est payé directement à Meta, Google ou TikTok depuis votre compte. Nos honoraires couvrent la stratégie, les créations et le pilotage.'],
        ['Quel budget minimum prévoir ?', 'Il dépend de votre marché et de votre objectif. Nous le fixons avec vous pendant le diagnostic, pour que les campagnes aient assez de données pour apprendre.'],
        ['Pourquoi installer l’API Conversions ?', 'Parce que le pixel seul perd une partie des événements (bloqueurs, Safari, consentement). L’API Conversions transmet les conversions depuis le serveur et permet de remonter les ventes confirmées.'],
        ['Les comptes publicitaires sont-ils à mon nom ?', 'Oui. Les comptes, les pixels et les audiences vous appartiennent ; nous y travaillons avec un accès partenaire.'],
      ],
      articles: ['erreurs-meta-ads', 'meta-ga4-caisse-quel-chiffre-piloter'],
    },
    {
      slug: 'tracking-server-side', short: 'Tracking', layer: '03 · Mesure', serviceType: 'Mesure et attribution marketing',
      title: 'Tracking server-side, GA4 et API Conversions Meta · OBM System',
      description: 'Google Tag Manager, GA4, API Conversions Meta et suivi côté serveur : chaque demande et chaque vente rattachée à sa source, y compris sur Safari. Mise en place et vérification.',
      h1: 'Tracking server-side et mesure des conversions',
      answer: 'Nous installons une mesure qui rattache chaque demande et chaque vente à sa source réelle, du clic publicitaire jusqu’au CRM. Vos campagnes peuvent ainsi optimiser sur vos clients, et non sur de simples formulaires.',
      deliver: [
        'Plan de marquage : événements, paramètres, conventions de nommage',
        'Google Tag Manager web et serveur (sGTM), servi depuis votre propre domaine',
        'GA4 : événements clés, conservation des données sur 14 mois, filtre de trafic interne validé, export BigQuery',
        'Pixel Meta + API Conversions, dédoublonnés par event_id',
        'Remontée des étapes du CRM vers Meta (lead_id, event_source = crm)',
        'Consent Mode et respect du consentement',
        'Tableau de bord lisible et réconciliation avec les ventes confirmées',
      ],
      why: ['Pourquoi côté serveur, et sur le même domaine', '<p>Sur Safari, un cookie créé par un script (pixel Meta, Google Analytics) est supprimé après 7 jours sans interaction avec le site. Le poser depuis un serveur de tracking prolonge sa durée de vie, à condition que ce serveur partage l’infrastructure du site : depuis Safari 16.4, un sous-domaine dont l’adresse IP diffère trop de celle du site est traité comme un tiers. Nous servons donc la mesure depuis le même domaine et la même infrastructure. Source : <a href="https://webkit.org/tracking-prevention/" target="_blank" rel="noopener">WebKit, Tracking Prevention</a>. Le détail dans notre analyse <a href="/blog/safari-itp-tracking-server-side/">Safari ITP et tracking server-side</a>.</p>'],
      steps: ['Audit du marquage existant', 'Plan de marquage validé avec vous', 'Installation et recette (DebugView GA4, Gestionnaire d’événements Meta)', 'Réconciliation après 30 jours avec vos ventes réelles'],
      specs: ['GTM web + server', 'GA4', 'Meta CAPI', 'event_id dedup', 'Consent Mode v2', 'first-party /metrics', 'BigQuery export'],
      cases: [],
      faq: [
        ['Faut-il un serveur de tracking pour une PME ?', 'Dès que la publicité représente un budget régulier, oui : c’est ce qui permet aux plateformes d’optimiser sur des données complètes.'],
        ['Pourquoi Meta, Google Analytics et ma caisse affichent-ils des chiffres différents ?', 'Chaque outil applique sa propre fenêtre d’attribution. La méthode : une seule source de vérité (les ventes confirmées) et un ratio de réconciliation par canal.'],
        ['Le tracking côté serveur respecte-t-il le consentement ?', 'Oui. Le Consent Mode transmet le choix du visiteur, et les balises publicitaires ne s’activent qu’avec son accord.'],
        ['Que se passe-t-il si mon site change ?', 'Le plan de marquage est documenté : chaque événement, son déclencheur et ses paramètres. Il se maintient sans repartir de zéro.'],
      ],
      articles: ['crm-meta-api-conversions', 'safari-itp-tracking-server-side', 'ga4-6-reglages'],
    },
    {
      slug: 'seo-aeo', short: 'SEO & AEO', layer: '04 · Visibilité', serviceType: 'Référencement naturel et AEO',
      title: 'Référencement Google et AEO à Rabat · OBM System',
      description: 'Être trouvé sur Google et cité par ChatGPT, Gemini et Perplexity : données structurées, pages par service et par ville, fiche Google, llms.txt.',
      h1: 'Être trouvé sur Google, et cité par les moteurs IA',
      answer: 'Nous travaillons votre visibilité sur Google, sur Maps et dans les moteurs de réponse comme ChatGPT, Gemini, Perplexity ou les résumés IA de Google. La méthode : des pages claires par intention de recherche, des données structurées et des informations cohérentes partout sur le web.',
      deliver: [
        'Audit technique : indexation, vitesse, erreurs, redirections',
        'Une page par service et par ville, pour chaque intention de recherche',
        'Données structurées : organisation, services, FAQ, articles, fil d’Ariane',
        'Fiche Google Business complète et tenue à jour',
        'Contenus en questions-réponses, avec une réponse directe en tête',
        'Fichier llms.txt et cohérence de vos informations sur les annuaires et réseaux',
        'Suivi des positions et des pages qui génèrent des demandes',
      ],
      why: ['Qu’est-ce que l’AEO ?', '<p>L’Answer Engine Optimization vise à être cité quand vos clients posent leur question à un assistant IA plutôt qu’à un moteur de recherche. Ces moteurs privilégient les sources claires : une réponse directe, des entités cohérentes (nom, ville, offre) et des données structurées lisibles.</p>'],
      steps: ['Audit technique et des recherches qui comptent pour vous', 'Corrections techniques en premier', 'Pages et contenus par intention de recherche', 'Suivi mensuel des positions et des demandes générées'],
      specs: ['données structurées', 'pages service × ville', 'fiche Google', 'llms.txt', 'Search Console'],
      cases: ['cerafas-logistics'],
      faq: [
        ['Combien de temps avant de voir des résultats ?', 'Les corrections techniques produisent leurs effets en quelques semaines ; les contenus se construisent sur plusieurs mois. Nous suivons l’évolution chaque mois dans la Search Console.'],
        ['La fiche Google compte-t-elle vraiment ?', 'Oui. Sur les recherches locales, c’est souvent la première chose qu’un client voit, avant même votre site.'],
        ['Peut-on être cité par ChatGPT ?', 'Personne ne peut le garantir. On peut en revanche donner aux moteurs IA une source claire et cohérente, ce qui augmente les chances d’être repris.'],
        ['Faut-il écrire des articles ?', 'Oui, quand ils répondent à de vraies questions de vos clients. Un article utile vaut mieux que dix articles génériques.'],
      ],
      articles: ['fiche-google-6-reglages'],
    },
    {
      slug: 'reseaux-sociaux', short: 'Réseaux sociaux', layer: '05 · Activation', serviceType: 'Community management et création de contenu',
      title: 'Community manager à Rabat : réseaux sociaux et contenu · OBM System',
      description: 'Ligne éditoriale, reels, carrousels et stories, calendrier validé, réponses aux messages et bilan mensuel : des réseaux sociaux qui nourrissent votre site.',
      h1: 'Des réseaux sociaux qui nourrissent votre site',
      answer: 'Nous prenons en charge vos réseaux sociaux : ligne éditoriale, création de contenu et de vidéos, publication, réponses aux commentaires et aux messages. Chaque publication a un rôle dans le parcours de vos clients et mène vers une page précise de votre site.',
      deliver: [
        'Ligne éditoriale et ton adaptés à votre activité',
        'Profils optimisés : présentation, liens, stories à la une',
        'Calendrier du mois suivant, validé avant publication',
        'Visuels, carrousels, reels et stories',
        'Tournage et montage vidéo',
        'Réponses aux commentaires et aux messages',
        'Bilan mensuel : ce qui a marché, ce qu’on ajuste',
      ],
      steps: ['Diagnostic : vos clients, vos concurrents, vos comptes actuels', 'Ligne éditoriale et calendrier du premier mois', 'Production, validation et publication', 'Bilan mensuel et ajustements'],
      specs: ['ligne éditoriale', 'reels · carrousels · stories', 'calendrier validé', 'bilan mensuel'],
      cases: ['pharmacie-gare-hay-riad'],
      faq: [
        ['Combien de publications par mois ?', 'Le volume est fixé dans la proposition écrite, selon votre activité et vos objectifs.'],
        ['Qui valide les contenus ?', 'Vous. Le calendrier du mois suivant vous est soumis avant toute publication.'],
        ['Gérez-vous aussi les messages ?', 'Oui. Nous répondons aux commentaires et aux messages, et transmettons les demandes à votre équipe.'],
        ['Peut-on combiner avec le site ?', 'Oui, c’est l’objet de l’offre <a href="/site-reseaux/">Site + Réseaux</a> : le site et les réseaux gérés par la même équipe.'],
      ],
      articles: [],
    },
    {
      slug: 'ia-automatisation', short: 'IA & automatisation', layer: '05 · Activation', serviceType: 'Automatisation WhatsApp, CRM et IA',
      title: 'Automatisation WhatsApp, CRM et IA pour entreprises au Maroc · OBM System',
      description: 'Relances et rappels WhatsApp, qualification des demandes, intégrations CRM et assistants pour vos équipes : chaque demande suit son parcours jusqu’à la vente.',
      h1: 'WhatsApp, CRM et IA : chaque demande suivie jusqu’à la vente',
      answer: 'Nous automatisons les tâches répétitives qui ralentissent vos ventes : confirmation immédiate des demandes, relances et rappels sur WhatsApp, qualification, intégration avec votre CRM. L’échange qui mène à la vente reste humain.',
      deliver: [
        'Confirmation immédiate de chaque nouvelle demande',
        'Séquences de relance et de rappel sur WhatsApp, avec modèles validés par Meta',
        'Qualification des demandes et transmission à la bonne personne',
        'Intégration avec votre CRM, et remontée des étapes vers les plateformes publicitaires',
        'Assistants IA pour vos équipes : réponses types, résumés, préparation des rendez-vous',
        'Suivi des réponses, des rendez-vous et des désabonnements',
      ],
      steps: ['Diagnostic : vos sources de demandes et votre parcours de vente', 'Scénarios et messages validés avec vous', 'Mise en place, tests et formation de l’équipe', 'Suivi et ajustement des séquences'],
      specs: ['séquences WhatsApp', 'API WhatsApp Business', 'qualification', 'CRM', 'assistants'],
      cases: [],
      faq: [
        ['Faut-il l’API WhatsApp Business ?', 'Dès que les messages doivent partir automatiquement depuis un formulaire ou un CRM, ou que plusieurs personnes répondent depuis le même numéro, oui.'],
        ['L’IA remplace-t-elle mon équipe ?', 'Non. Elle prend en charge les tâches répétitives ; les échanges qui mènent à la vente restent humains.'],
        ['Mes clients vont-ils recevoir trop de messages ?', 'Non. Les séquences sont limitées, espacées, et s’arrêtent dès que la personne répond ou ne donne pas suite.'],
        ['Avec quel CRM travaillez-vous ?', 'Avec celui que vous utilisez déjà quand il le permet. Sinon, nous vous recommandons un outil adapté à votre volume.'],
      ],
      articles: ['relances-whatsapp-guide', 'crm-meta-api-conversions'],
    },
  ];

  const hubLayers = [
    ['00 · Stratégie', 'Stratégie & audit', 'Audit du dispositif, priorités, feuille de route et copywriting.', [['Diagnostic de croissance', BRAND.diagnostic]]],
    ['01 · Conception', 'Sites & e-commerce', 'Sites vitrines, plateformes et boutiques codés sur mesure, pensés pour convertir.', [['Création de sites', '/services/creation-site-web/'], ['E-commerce', '/services/e-commerce/']]],
    ['02 · Acquisition', 'Media buying', 'Meta, Google et TikTok Ads, reliés à des pages d’arrivée dédiées et à vos ventes réelles.', [['Publicité Meta & Google', '/services/publicite-meta-google-ads/']]],
    ['03 · Mesure', 'Tracking', 'GTM, GA4, API Conversions Meta et suivi côté serveur.', [['Tracking server-side', '/services/tracking-server-side/']]],
    ['04 · Visibilité', 'SEO & AEO', 'Référencement Google, fiche Google et visibilité dans les moteurs de réponse IA.', [['SEO & AEO', '/services/seo-aeo/']]],
    ['05 · Activation', 'Réseaux, contenu, CRM & IA', 'Community management, création de contenu et vidéo, relances WhatsApp, CRM et IA.', [['Réseaux sociaux', '/services/reseaux-sociaux/'], ['IA & automatisation', '/services/ia-automatisation/']]],
  ];

  const hub = {
    path: '/services/',
    current: 'services',
    head: {
      title: 'Services : conception, acquisition, mesure · OBM System',
      description: 'Les 6 couches d’un système de croissance : stratégie, conception, acquisition, mesure, visibilité et activation. Le détail de chaque levier.',
    },
    crumbs: [['Accueil', '/'], ['Services', null]],
    main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker">Services</span>
        <h1 class="h1">Les 6 couches d’un système de croissance</h1>
        <p class="lead">Stratégie, conception, acquisition, mesure, visibilité et activation. Chaque couche a sa fonction ; ensemble, elles forment un système que nous concevons, mesurons et pilotons.</p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="layers">
${hubLayers.map(([n, t, p, links]) => `          <div class="layer" data-reveal><small>${n}</small><h2 class="h3">${t}</h2><p>${p}</p><ul>${links.map(([l, h]) => `<li><a class="link" href="${h}">${l}</a></li>`).join('')}</ul></div>`).join('\n')}
        </div>
      </div>
    </section>
    <section class="section section--rule" style="padding-top:clamp(3rem,5vw,4rem)">
      <div class="wrap">
        <div class="offer" data-reveal>
          <div>
            <span class="badge">Offre combinée</span>
            <h2 class="h2">Site + Réseaux</h2>
            <p class="lead">Votre site et vos réseaux sociaux conçus et gérés par la même équipe, avec visuels et vidéos produits chaque mois.</p>
            <div class="actions"><a class="btn btn--ink" href="/site-reseaux/">Découvrir l’offre</a></div>
          </div>
          <ul><li>Création ou refonte du site</li><li>Reels, carrousels, stories</li><li>Calendrier validé chaque mois</li><li>Hébergement, maintenance et bilan mensuel</li></ul>
        </div>
      </div>
    </section>
    ${L.ctaBand({ loc: 'services-band' })}
`,
  };

  return [hub, ...PILLARS.map(pillar)];
};
