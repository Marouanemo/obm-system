---
title: "Meta, GA4, la caisse\_: quel chiffre piloter ?"
date: '2026-11-01'
category: Publicité
excerpt: "Meta annonce un nombre de ventes, Google Analytics un autre, votre caisse un troisième. Aucun n’est faux\_: chacun compte selon ses propres règles. La méthode consiste à choisir une source de vérité et à suivre l’écart avec chaque outil."
readTime: 3 min de lecture
tag: ''
image: /assets/uploads/og-meta-ga4-caisse-quel-chiffre-piloter-mvzabplo.jpg
metaTitle: "Meta, GA4, la caisse\_: quel chiffre piloter ?\_· OBM System"
seoDescription: "Meta, Google Analytics et votre caisse affichent trois chiffres différents. Aucun n’est faux\_: choisissez une source de vérité et suivez l’écart."
keywords: >-
  attribution Meta GA4, écart Meta Google Analytics, réconciliation ventes
  publicité, fenêtre d'attribution Meta
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
**En bref.** Meta, Google Analytics et votre caisse (ou votre CRM) ne mesurent pas la même chose, avec les mêmes règles. Les écarts sont normaux. Pour décider, on choisit une seule source de vérité, les ventes confirmées, et on suit chaque mois le ratio entre ce que chaque outil annonce et ce qui est réellement encaissé.

## Pourquoi les trois chiffres diffèrent

### Meta compte ce que ses publicités ont influencé

Meta attribue une vente à une publicité si la personne a cliqué ou vu la publicité dans une certaine fenêtre de temps avant la conversion. Cette fenêtre se règle dans chaque ensemble de publicités. Meta peut donc revendiquer une vente que Google Analytics attribue à une recherche Google, parce que la même personne a vu une publicité Instagram quelques jours plus tôt.

### Google Analytics compte des sessions, selon son modèle

GA4 rattache les conversions aux sources de trafic de votre site selon son modèle d’attribution. Il ne voit que ce qui passe par votre site, avec les limites du navigateur : consentement refusé, bloqueurs, cookies raccourcis sur Safari. Une partie des conversions lui échappe, et celles qu’il voit sont réparties entre plusieurs canaux.

### La caisse compte les ventes, sans leur source

Votre caisse, votre CRM ou votre outil de facturation savent exactement combien vous avez vendu. Ils ne savent généralement pas d’où vient chaque client, sauf si cette information a été captée au moment de la demande.

## La méthode : une source de vérité, des ratios

1. **Choisir la référence.** Les ventes confirmées (encaissées ou signées) sont la seule mesure qui ne dépend d’aucune règle d’attribution.
2. **Capter la source au moment de la demande.** Enregistrer dans le CRM, avec chaque demande, les paramètres UTM et les identifiants de clic (`gclid`, `fbclid`). C’est ce qui permet ensuite de rattacher une vente à un canal.
3. **Calculer un ratio par canal.** Chaque mois, comparer ce que Meta annonce aux ventes confirmées attribuées à Meta dans votre CRM. Même chose pour Google. Le ratio obtenu est plus stable qu’on ne le croit.
4. **Décider sur le coût par vente confirmée.** Les budgets se répartissent selon le coût d’une vente réelle par canal, pas selon le nombre de conversions annoncé par chaque plateforme.
5. **Laisser chaque plateforme optimiser avec ses propres données.** Les algorithmes de Meta et de Google ont besoin de leurs signaux. On ne les pilote pas avec la caisse : on les alimente mieux, notamment en leur renvoyant les ventes confirmées.

## Ce que l’on suit chaque mois

- Les ventes confirmées par canal, issues du CRM.
- Les conversions annoncées par Meta et par Google Ads.
- Le ratio entre les deux, canal par canal.
- Le coût par vente confirmée.

Quand un ratio change brusquement, c’est un signal : un marquage cassé, un changement de réglage d’attribution, ou une campagne qui attire un public différent.

## Ce qu’il faut retenir

Chercher à faire coïncider les chiffres de Meta, de Google Analytics et de la caisse est une perte de temps. Ils ne coïncideront jamais. La bonne question est : combien coûte une vente réelle, canal par canal ? Pour y répondre, il faut une mesure fiable de bout en bout : c’est l’objet du [tracking server-side](/services/tracking-server-side/), et la condition d’une [publicité reliée à vos ventes](/services/publicite-meta-google-ads/).

## Sources

- [Meta for Developers : API Conversions](https://developers.facebook.com/documentation/ads-commerce/conversions-api)
- [Aide Google Analytics : attribution](https://support.google.com/analytics/answer/10596866)

## À lire ensuite

- [CRM → Meta : renvoyer chaque étape du pipeline via l’API Conversions](/blog/crm-meta-api-conversions/)
- [Publicité Facebook et Instagram : 5 erreurs qui coûtent cher](/blog/erreurs-meta-ads/)

Pour aller plus loin, découvrez notre accompagnement sur [la publicité Meta et Google reliée à vos ventes](/services/publicite-meta-google-ads/).
