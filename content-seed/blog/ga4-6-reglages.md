---
title: "Google Analytics\_: 6 réglages à contrôler avant d’analyser"
date: '2026-11-01'
category: Mesure
excerpt: >-
  Une propriété GA4 installée avec ses réglages par défaut donne des chiffres
  incomplets ou faussés. Six réglages à contrôler avant de tirer la moindre
  conclusion de vos rapports.
readTime: 3 min de lecture
tag: ''
image: /assets/uploads/og-ga4-6-reglages-mvzabpln.jpg
metaTitle: "GA4\_: 6 réglages à contrôler\_· OBM System"
seoDescription: >-
  Une propriété GA4 laissée par défaut donne des chiffres incomplets ou faussés.
  Six réglages à contrôler avant de tirer la moindre conclusion.
keywords: >-
  réglages GA4, conservation des données GA4 14 mois, filtre trafic interne GA4,
  référents indésirables GA4, export BigQuery GA4
canonical: ''
noindex: false
nofollow: false
ogTitle: ''
ogDescription: ''
twitterTitle: ''
twitterDescription: ''
twitterImage: ''
published: true
updatedAt: '2026-11-02'
---
<p class="tldr"><strong>En bref.</strong> Avant d’analyser un rapport Google Analytics 4, vérifiez six réglages : la durée de conservation des données, le filtre du trafic interne, les sites référents indésirables, les événements clés, la devise et le fuseau horaire, et l’export vers BigQuery. Sans eux, les chiffres sont incomplets ou faussés.</p>
<h2>1. La conservation des données : 14 mois</h2>
<p>Par défaut, GA4 conserve les données détaillées au niveau des événements pendant 2 mois. Au-delà, les rapports standards restent disponibles, mais les explorations (les analyses détaillées) ne remontent pas plus loin. Passez la durée de conservation à 14 mois, le maximum pour une propriété standard, dans les paramètres de collecte des données.</p>
<h2>2. Le trafic interne : défini, testé, puis activé</h2>
<p>Vos équipes visitent votre site tous les jours. Leurs visites gonflent les chiffres et faussent les taux de conversion. GA4 permet de définir le trafic interne (par adresse IP) puis de l’exclure par un filtre. Créez le filtre en mode <strong>test</strong>, vérifiez dans les rapports que le trafic visé est bien identifié, puis passez-le en <strong>actif</strong>. Un filtre actif est définitif : les données exclues ne reviennent pas.</p>
<h2>3. Les sites référents indésirables</h2>
<p>Quand un client passe par une page de paiement ou un outil externe avant de revenir sur votre site, GA4 peut attribuer la conversion à ce site tiers. Déclarez ces domaines comme référents indésirables dans les paramètres du flux de données. La conversion reste alors attribuée à la vraie source d’origine.</p>
<h2>4. Les événements clés</h2>
<p>GA4 collecte de nombreux événements, mais seuls ceux marqués comme <strong>événements clés</strong> servent au calcul des conversions et à l’import dans Google Ads. Vérifiez que vos actions qui comptent (formulaire envoyé, réservation confirmée, achat, clic WhatsApp si c’est un canal de vente) sont marquées, et que les événements secondaires ne le sont pas.</p>
<h2>5. La devise et le fuseau horaire</h2>
<p>La devise et le fuseau horaire de la propriété déterminent comment sont affichés les montants et où commence chaque journée. Pour une entreprise au Maroc : le dirham (MAD) et le fuseau de Casablanca. Un fuseau mal réglé décale les ventes d’un jour sur l’autre et rend les comparaisons avec la caisse impossibles.</p>
<h2>6. L’export BigQuery</h2>
<p>L’export vers BigQuery copie chaque jour les données brutes de votre propriété dans votre propre base. Il conserve l’historique au-delà des limites de GA4 et permet des analyses impossibles dans l’interface, comme le rapprochement avec vos ventes. L’export quotidien est disponible pour les propriétés standards ; activez-le tôt, car il ne fonctionne pas rétroactivement.</p>
<h2>Ce qu’il faut retenir</h2>
<p>Ces réglages prennent moins d’une heure et conditionnent la fiabilité de tout ce que vous lirez ensuite. Nous les vérifions systématiquement lors de la mise en place du <a href="/services/tracking-server-side/">tracking côté serveur</a>, avant toute analyse.</p>
<h2>Sources</h2>
<ul>
<li><a href="https://support.google.com/analytics/answer/7667196">Aide Google Analytics : conservation des données</a></li>
<li><a href="https://support.google.com/analytics/answer/10104470">Aide Google Analytics : exclure le trafic interne</a></li>
<li><a href="https://support.google.com/analytics/answer/10327750">Aide Google Analytics : identifier les sites référents indésirables</a></li>
<li><a href="https://support.google.com/analytics/answer/9358801">Aide Google Analytics : configurer l’export BigQuery</a></li>
</ul>
<h2>À lire ensuite</h2>
<ul>
<li><a href="/blog/crm-meta-api-conversions/">CRM → Meta : renvoyer chaque étape du pipeline via l’API Conversions</a></li>
<li><a href="/blog/safari-itp-tracking-server-side/">Safari ITP : votre serveur de tracking survit-il à 7 jours ?</a></li>
</ul>
<p>Pour aller plus loin, découvrez <a href="/services/tracking-server-side/">notre mise en place du tracking server-side</a>.</p>
