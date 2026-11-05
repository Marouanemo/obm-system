---
title: "Safari ITP\_: votre serveur de tracking survit-il à 7 jours ?"
date: '2026-11-01'
category: Mesure
excerpt: "Safari limite la durée de vie des cookies de mesure. Un serveur de tracking prolonge cette durée, à une condition que beaucoup de mises en place oublient\_: partager l’infrastructure du site. Voici ce que Safari limite, et comment servir la mesure depuis votre propre domaine."
readTime: 4 min de lecture
tag: ''
image: /assets/uploads/og-safari-itp-tracking-server-side-mvzabpls.jpg
metaTitle: "Safari ITP et tracking server-side\_· OBM System"
seoDescription: "Safari limite la durée des cookies de mesure. Un serveur de tracking la prolonge s’il partage l’infrastructure du site\_: ce qui change, et comment faire."
keywords: >-
  Safari ITP cookies 7 jours, tracking server-side Safari, sGTM même domaine,
  Intelligent Tracking Prevention
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
<p class="tldr"><strong>En bref.</strong> Sur Safari, un cookie créé par un script (pixel Meta, Google Analytics) est supprimé après 7 jours sans interaction de l’utilisateur avec le site. Un serveur de tracking peut poser des cookies plus durables, mais seulement s’il partage l’infrastructure du site. Un sous-domaine qui pointe vers un serveur dont l’adresse IP est trop différente de celle du site est traité comme un tiers, et ses cookies sont eux aussi limités à 7 jours.</p>
<h2>Ce que Safari limite</h2>
<p>Safari applique un ensemble de protections appelé Intelligent Tracking Prevention (ITP). Trois règles concernent directement la mesure marketing :</p>
<ol>
<li><strong>Les cookies créés par un script</strong> (en JavaScript, via <code>document.cookie</code>) sont supprimés après 7 jours sans interaction de l’utilisateur avec le site. C’est le cas des cookies posés par le pixel Meta ou par la balise Google Analytics installée dans la page.</li>
<li><strong>Les cookies posés par un sous-domaine « déguisé »</strong> : quand un sous-domaine du site pointe, par un enregistrement CNAME, vers un domaine tiers, Safari plafonne à 7 jours les cookies posés dans ses réponses HTTP (WebKit parle de <em>third-party CNAME cloaking</em>).</li>
<li><strong>Les cookies posés par un serveur dont l’adresse IP ne correspond pas à celle du site</strong> : depuis Safari 16.4, ITP applique la même limite de 7 jours quand le serveur qui répond a une adresse IP trop différente de celle du site (WebKit parle de <em>third-party IP address cloaking</em>), même si le sous-domaine appartient au site.</li>
</ol>
<p>La documentation de WebKit détaille ces règles et leur historique.</p>
<h2>Pourquoi c’est un problème</h2>
<p>Un client qui découvre votre marque par une publicité, puis revient acheter deux semaines plus tard, n’est plus reconnu : son cookie a expiré. La vente est attribuée à « accès direct » ou à une autre source, et la publicité qui l’a amené paraît moins rentable qu’elle ne l’est.</p>
<p>Sur un marché où une part importante des visiteurs utilise un iPhone, l’effet sur la lecture des campagnes n’est pas marginal.</p>
<h2>Ce que change le tracking côté serveur</h2>
<p>Avec Google Tag Manager côté serveur (sGTM), les données de mesure passent d’abord par votre serveur de tracking, qui les transmet ensuite à Google Analytics, Meta ou Google Ads. Ce serveur peut poser des cookies dans ses réponses HTTP, ce qui les place hors de la règle n° 1.</p>
<p>Mais la règle n° 3 s’applique toujours. Beaucoup d’installations placent le serveur de tracking sur un sous-domaine (par exemple <code>mesure.votresite.com</code>) qui pointe vers un hébergeur cloud. L’adresse IP de ce serveur n’a rien à voir avec celle du site : Safari le traite comme un tiers, et le bénéfice disparaît.</p>
<h2>La bonne architecture : même domaine, même infrastructure</h2>
<p>La solution consiste à servir la mesure <strong>depuis le domaine du site et depuis la même infrastructure</strong>. Concrètement :</p>
<ul>
<li>le serveur web du site reçoit les requêtes de mesure sur un chemin dédié, par exemple <code>https://votresite.com/metrics/</code> ;</li>
<li>il les relaie en interne (reverse proxy) vers le conteneur sGTM ;</li>
<li>pour Safari, la réponse vient de la même adresse IP que le site : les cookies posés par le serveur gardent leur durée de vie normale.</li>
</ul>
<h2>À vérifier sur votre installation</h2>
<ul>
<li>Où répond votre serveur de tracking : sur un chemin du site, ou sur un sous-domaine qui pointe ailleurs ?</li>
<li>Les cookies d’identification sont-ils posés par le serveur, dans la réponse HTTP, ou par un script dans la page ?</li>
<li>Le consentement du visiteur est-il bien transmis au serveur de tracking ?</li>
</ul>
<h2>Ce qu’il faut retenir</h2>
<p>Un serveur de tracking ne suffit pas : il faut qu’il soit, aux yeux de Safari, le même que votre site. C’est un détail d’architecture qui fait la différence entre une mesure qui tient deux semaines et une mesure qui s’effondre au bout de sept jours. Le détail de notre approche : <a href="/services/tracking-server-side/">tracking server-side et mesure des conversions</a>.</p>
<h2>Sources</h2>
<ul>
<li><a href="https://webkit.org/tracking-prevention/">WebKit : Tracking Prevention in WebKit</a></li>
<li><a href="https://developers.google.com/tag-platform/tag-manager/server-side">Google : Server-side Tag Manager</a></li>
</ul>
<h2>À lire ensuite</h2>
<ul>
<li><a href="/blog/crm-meta-api-conversions/">CRM → Meta : renvoyer chaque étape du pipeline via l’API Conversions</a></li>
<li><a href="/blog/ga4-6-reglages/">Google Analytics : 6 réglages à contrôler avant d’analyser</a></li>
</ul>
<p>Pour aller plus loin, découvrez <a href="/services/tracking-server-side/">un serveur de mesure sur votre propre domaine</a>.</p>
