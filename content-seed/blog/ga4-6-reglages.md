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
**En bref.** Avant d’analyser un rapport Google Analytics 4, vérifiez six réglages : la durée de conservation des données, le filtre du trafic interne, les sites référents indésirables, les événements clés, la devise et le fuseau horaire, et l’export vers BigQuery. Sans eux, les chiffres sont incomplets ou faussés.

## 1. La conservation des données : 14 mois

Par défaut, GA4 conserve les données détaillées au niveau des événements pendant 2 mois. Au-delà, les rapports standards restent disponibles, mais les explorations (les analyses détaillées) ne remontent pas plus loin. Passez la durée de conservation à 14 mois, le maximum pour une propriété standard, dans les paramètres de collecte des données.

## 2. Le trafic interne : défini, testé, puis activé

Vos équipes visitent votre site tous les jours. Leurs visites gonflent les chiffres et faussent les taux de conversion. GA4 permet de définir le trafic interne (par adresse IP) puis de l’exclure par un filtre. Créez le filtre en mode **test**, vérifiez dans les rapports que le trafic visé est bien identifié, puis passez-le en **actif**. Un filtre actif est définitif : les données exclues ne reviennent pas.

## 3. Les sites référents indésirables

Quand un client passe par une page de paiement ou un outil externe avant de revenir sur votre site, GA4 peut attribuer la conversion à ce site tiers. Déclarez ces domaines comme référents indésirables dans les paramètres du flux de données. La conversion reste alors attribuée à la vraie source d’origine.

## 4. Les événements clés

GA4 collecte de nombreux événements, mais seuls ceux marqués comme **événements clés** servent au calcul des conversions et à l’import dans Google Ads. Vérifiez que vos actions qui comptent (formulaire envoyé, réservation confirmée, achat, clic WhatsApp si c’est un canal de vente) sont marquées, et que les événements secondaires ne le sont pas.

## 5. La devise et le fuseau horaire

La devise et le fuseau horaire de la propriété déterminent comment sont affichés les montants et où commence chaque journée. Pour une entreprise au Maroc : le dirham (MAD) et le fuseau de Casablanca. Un fuseau mal réglé décale les ventes d’un jour sur l’autre et rend les comparaisons avec la caisse impossibles.

## 6. L’export BigQuery

L’export vers BigQuery copie chaque jour les données brutes de votre propriété dans votre propre base. Il conserve l’historique au-delà des limites de GA4 et permet des analyses impossibles dans l’interface, comme le rapprochement avec vos ventes. L’export quotidien est disponible pour les propriétés standards ; activez-le tôt, car il ne fonctionne pas rétroactivement.

## Ce qu’il faut retenir

Ces réglages prennent moins d’une heure et conditionnent la fiabilité de tout ce que vous lirez ensuite. Nous les vérifions systématiquement lors de la mise en place du [tracking server-side](/services/tracking-server-side/), avant toute analyse.

## Sources

- [Aide Google Analytics : conservation des données](https://support.google.com/analytics/answer/7667196)
- [Aide Google Analytics : exclure le trafic interne](https://support.google.com/analytics/answer/10104470)
- [Aide Google Analytics : identifier les sites référents indésirables](https://support.google.com/analytics/answer/10327750)
- [Aide Google Analytics : configurer l’export BigQuery](https://support.google.com/analytics/answer/9358801)

## À lire ensuite

- [Meta, GA4, la caisse : quel chiffre piloter ?](/blog/meta-ga4-caisse-quel-chiffre-piloter/)
- [Safari ITP : votre serveur de tracking survit-il à 7 jours ?](/blog/safari-itp-tracking-server-side/)

Pour aller plus loin, découvrez notre accompagnement sur [le tracking server-side et la mesure des conversions](/services/tracking-server-side/).
