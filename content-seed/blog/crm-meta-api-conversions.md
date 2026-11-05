---
title: "CRM → Meta\_: renvoyer chaque étape du pipeline via l’API Conversions"
date: '2026-11-01'
category: Mesure
excerpt: >-
  Meta optimise sur ce qu’il voit. Si vous ne lui transmettez que des
  formulaires remplis, il vous trouve des gens qui remplissent des formulaires.
  En renvoyant les étapes de votre CRM via l’API Conversions, vous lui apprenez
  à trouver des clients.
readTime: 4 min de lecture
tag: ''
image: /assets/uploads/og-crm-meta-api-conversions-mvzabplg.jpg
metaTitle: "CRM → Meta\_: l’API Conversions par étape\_· OBM System"
seoDescription: >-
  Si Meta ne reçoit que des formulaires remplis, il trouve des gens qui
  remplissent des formulaires. Renvoyez les étapes de votre CRM via l’API
  Conversions.
keywords: >-
  API Conversions Meta CRM, conversion leads Meta, lead_id Meta, event_source
  crm, tracking CRM Meta Ads
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
**En bref.** Une campagne Meta apprend à partir des événements qu’elle reçoit. Si le seul événement transmis est le formulaire rempli, l’algorithme cherche des profils qui remplissent des formulaires. En renvoyant depuis votre CRM les étapes suivantes (demande qualifiée, rendez-vous, vente), via l’API Conversions, vous lui donnez le signal qui compte vraiment : qui devient client.

## Pourquoi le formulaire ne suffit pas

Le pixel Meta voit ce qui se passe sur votre site : une page vue, un formulaire envoyé. Il ne voit pas ce qui se passe ensuite dans votre équipe commerciale. Or c’est là que se joue la différence entre une demande et un client.

Sans information sur la suite, Meta optimise sur la seule étape qu’il connaît. Le coût par demande peut alors baisser, pendant que la proportion de demandes qui aboutissent diminue.

## Le principe

Chaque fois qu’une demande change d’étape dans votre CRM, le CRM (ou un petit service intermédiaire) envoie un événement à l’API Conversions de Meta. Cet événement décrit :

- **ce qui s’est passé** : le nom de l’étape, par exemple « Demande qualifiée », « Rendez-vous », « Vente » ;
- **quand** : la date et l’heure du changement d’étape ;
- **pour qui** : un identifiant qui permet à Meta de rattacher l’événement à la personne qui a vu ou cliqué sur la publicité ;
- **d’où vient l’information** : le CRM, et non le site.

## Les champs qui comptent

Pour les demandes issues des **formulaires instantanés Meta** (publicités à formulaire), le plus fiable est le `lead_id` que Meta attribue à chaque demande. Il est récupéré avec le lead, stocké dans le CRM, puis renvoyé à chaque étape.

Pour les demandes issues de **votre site**, on transmet les données de correspondance captées au moment de l’envoi du formulaire : e-mail et téléphone hachés, et les identifiants de clic et de navigateur Meta (`fbc`, `fbp`) quand ils sont disponibles. Ils doivent être enregistrés avec la demande dans le CRM, sinon ils sont perdus.

Les événements venant du CRM se déclarent comme tels : `action_source` indique qu’ils proviennent d’un système interne, et les données personnalisées précisent `event_source = crm` ainsi que le nom de votre CRM (`lead_event_source`), comme le décrit la documentation de Meta.

## La mise en place, étape par étape

1. **Cartographier le pipeline.** Lister les étapes réelles de votre CRM, de la demande reçue à la vente, et choisir celle sur laquelle les campagnes doivent optimiser. C’est souvent l’étape la plus avancée qui reste suffisamment fréquente.
2. **Conserver les identifiants.** Vérifier que chaque demande arrive dans le CRM avec son `lead_id` (formulaires Meta) ou ses données de correspondance (site).
3. **Envoyer les changements d’étape.** Brancher l’envoi vers l’API Conversions, idéalement en continu, au minimum une fois par jour.
4. **Contrôler la qualité.** Dans le Gestionnaire d’événements, suivre la réception des événements et la qualité de correspondance. Un événement mal rattaché ne sert à rien.
5. **Changer l’objectif des campagnes.** Une fois le volume d’événements stable, faire optimiser les campagnes sur l’étape choisie plutôt que sur le simple formulaire.

## Les erreurs fréquentes

- **Envoyer des étapes trop rares.** Si l’étape choisie n’arrive que quelques fois par mois, l’algorithme n’a pas assez de signal. Mieux vaut une étape intermédiaire fréquente qu’une vente trop rare.
- **Perdre les identifiants en route.** Un formulaire qui n’enregistre ni e-mail, ni téléphone, ni identifiant de clic rend le rattachement impossible.
- **Envoyer en retard.** Les événements doivent arriver rapidement après le changement d’étape pour être exploitables.
- **Doublonner.** Si un même événement part à la fois du site et du serveur, il doit porter le même `event_id` pour être dédoublonné.

## Ce qu’il faut retenir

L’API Conversions ne sert pas seulement à compenser les pertes du pixel. Branchée sur votre CRM, elle transmet à Meta la seule information qui compte : quelles demandes deviennent des clients. C’est l’un des leviers que nous installons dans le cadre du [tracking server-side](/services/tracking-server-side/).

## Sources

- [Meta for Developers : API Conversions](https://developers.facebook.com/documentation/ads-commerce/conversions-api)
- [Meta for Developers : intégration CRM pour l’optimisation des leads de conversion](https://developers.facebook.com/documentation/ads-commerce/conversions-api/conversion-leads-integration)
- [Meta for Developers : paramètres de l’API Conversions](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters)

## À lire ensuite

- [Meta, GA4, la caisse : quel chiffre piloter ?](/blog/meta-ga4-caisse-quel-chiffre-piloter/)
- [Safari ITP : votre serveur de tracking survit-il à 7 jours ?](/blog/safari-itp-tracking-server-side/)

Pour aller plus loin, découvrez notre accompagnement sur [le tracking server-side et la mesure des conversions](/services/tracking-server-side/).
