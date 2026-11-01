---
title: "Safari ITP : votre serveur de tracking survit-il à 7 jours ?"
date: "2026-11-01"
category: "Mesure"
readTime: "7 min de lecture"
excerpt: "Safari limite la durée de vie des cookies de mesure. Un serveur de tracking prolonge cette durée, à une condition que beaucoup de mises en place oublient : partager l’infrastructure du site. Voici ce que Safari limite, et comment servir la mesure depuis votre propre domaine."
keywords: "Safari ITP cookies 7 jours, tracking server-side Safari, sGTM même domaine, Intelligent Tracking Prevention"
sources:
  - title: "WebKit : Tracking Prevention in WebKit"
    url: "https://webkit.org/tracking-prevention/"
  - title: "Google : Server-side Tag Manager"
    url: "https://developers.google.com/tag-platform/tag-manager/server-side"
published: true
---

**En bref.** Sur Safari, un cookie créé par un script (pixel Meta, Google Analytics) est supprimé après 7 jours sans interaction de l’utilisateur avec le site. Un serveur de tracking peut poser des cookies plus durables, mais seulement s’il partage l’infrastructure du site. Un sous-domaine qui pointe vers un serveur dont l’adresse IP est trop différente de celle du site est traité comme un tiers, et ses cookies sont eux aussi limités à 7 jours.

## Ce que Safari limite

Safari applique un ensemble de protections appelé Intelligent Tracking Prevention (ITP). Trois règles concernent directement la mesure marketing :

1. **Les cookies créés par un script** (en JavaScript, via `document.cookie`) sont supprimés après 7 jours sans interaction de l’utilisateur avec le site. C’est le cas des cookies posés par le pixel Meta ou par la balise Google Analytics installée dans la page.
2. **Les cookies posés par un sous-domaine « déguisé »** : quand un sous-domaine du site pointe, par un enregistrement CNAME, vers un domaine tiers, Safari plafonne à 7 jours les cookies posés dans ses réponses HTTP (WebKit parle de *third-party CNAME cloaking*).
3. **Les cookies posés par un serveur dont l’adresse IP ne correspond pas à celle du site** : depuis Safari 16.4, ITP applique la même limite de 7 jours quand le serveur qui répond a une adresse IP trop différente de celle du site (WebKit parle de *third-party IP address cloaking*), même si le sous-domaine appartient au site.

La documentation de WebKit détaille ces règles et leur historique.

## Pourquoi c’est un problème

Un client qui découvre votre marque par une publicité, puis revient acheter deux semaines plus tard, n’est plus reconnu : son cookie a expiré. La vente est attribuée à « accès direct » ou à une autre source, et la publicité qui l’a amené paraît moins rentable qu’elle ne l’est.

Sur un marché où une part importante des visiteurs utilise un iPhone, l’effet sur la lecture des campagnes n’est pas marginal.

## Ce que change le tracking côté serveur

Avec Google Tag Manager côté serveur (sGTM), les données de mesure passent d’abord par votre serveur de tracking, qui les transmet ensuite à Google Analytics, Meta ou Google Ads. Ce serveur peut poser des cookies dans ses réponses HTTP, ce qui les place hors de la règle n° 1.

Mais la règle n° 3 s’applique toujours. Beaucoup d’installations placent le serveur de tracking sur un sous-domaine (par exemple `mesure.votresite.com`) qui pointe vers un hébergeur cloud. L’adresse IP de ce serveur n’a rien à voir avec celle du site : Safari le traite comme un tiers, et le bénéfice disparaît.

## La bonne architecture : même domaine, même infrastructure

La solution consiste à servir la mesure **depuis le domaine du site et depuis la même infrastructure**. Concrètement :

- le serveur web du site reçoit les requêtes de mesure sur un chemin dédié, par exemple `https://votresite.com/metrics/` ;
- il les relaie en interne (reverse proxy) vers le conteneur sGTM ;
- pour Safari, la réponse vient de la même adresse IP que le site : les cookies posés par le serveur gardent leur durée de vie normale.

C’est l’architecture que nous appliquons, y compris pour notre propre site.

## À vérifier sur votre installation

- Où répond votre serveur de tracking : sur un chemin du site, ou sur un sous-domaine qui pointe ailleurs ?
- Les cookies d’identification sont-ils posés par le serveur, dans la réponse HTTP, ou par un script dans la page ?
- Le consentement du visiteur est-il bien transmis au serveur de tracking ?

## Ce qu’il faut retenir

Un serveur de tracking ne suffit pas : il faut qu’il soit, aux yeux de Safari, le même que votre site. C’est un détail d’architecture qui fait la différence entre une mesure qui tient deux semaines et une mesure qui s’effondre au bout de sept jours. Le détail de notre approche : [tracking server-side et mesure des conversions](/services/tracking-server-side/).
