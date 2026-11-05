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
<p class="tldr"><strong>En bref.</strong> Une campagne Meta apprend à partir des événements qu’elle reçoit. Si le seul événement transmis est le formulaire rempli, l’algorithme cherche des profils qui remplissent des formulaires. En renvoyant depuis votre CRM les étapes suivantes (demande qualifiée, rendez-vous, vente), via l’API Conversions, vous lui donnez le signal qui compte vraiment : qui devient client.</p>
<h2>Pourquoi le formulaire ne suffit pas</h2>
<p>Le pixel Meta voit ce qui se passe sur votre site : une page vue, un formulaire envoyé. Il ne voit pas ce qui se passe ensuite dans votre équipe commerciale. Or c’est là que se joue la différence entre une demande et un client.</p>
<p>Sans information sur la suite, Meta optimise sur la seule étape qu’il connaît. Le coût par demande peut alors baisser, pendant que la proportion de demandes qui aboutissent diminue.</p>
<h2>Le principe</h2>
<p>Chaque fois qu’une demande change d’étape dans votre CRM, le CRM (ou un petit service intermédiaire) envoie un événement à l’API Conversions de Meta. Cet événement décrit :</p>
<ul>
<li><strong>ce qui s’est passé</strong> : le nom de l’étape, par exemple « Demande qualifiée », « Rendez-vous », « Vente » ;</li>
<li><strong>quand</strong> : la date et l’heure du changement d’étape ;</li>
<li><strong>pour qui</strong> : un identifiant qui permet à Meta de rattacher l’événement à la personne qui a vu ou cliqué sur la publicité ;</li>
<li><strong>d’où vient l’information</strong> : le CRM, et non le site.</li>
</ul>
<h2>Les champs qui comptent</h2>
<p>Pour les demandes issues des <strong>formulaires instantanés Meta</strong> (publicités à formulaire), le plus fiable est le <code>lead_id</code> que Meta attribue à chaque demande. Il est récupéré avec le lead, stocké dans le CRM, puis renvoyé à chaque étape.</p>
<p>Pour les demandes issues de <strong>votre site</strong>, on transmet les données de correspondance captées au moment de l’envoi du formulaire : e-mail et téléphone hachés, et les identifiants de clic et de navigateur Meta (<code>fbc</code>, <code>fbp</code>) quand ils sont disponibles. Ils doivent être enregistrés avec la demande dans le CRM, sinon ils sont perdus.</p>
<p>Les événements venant du CRM se déclarent comme tels : <code>action_source</code> indique qu’ils proviennent d’un système interne, et les données personnalisées précisent <code>event_source = crm</code> ainsi que le nom de votre CRM (<code>lead_event_source</code>), comme le décrit la documentation de Meta.</p>
<h2>La mise en place, étape par étape</h2>
<ol>
<li><strong>Cartographier le pipeline.</strong> Lister les étapes réelles de votre CRM, de la demande reçue à la vente, et choisir celle sur laquelle les campagnes doivent optimiser. C’est souvent l’étape la plus avancée qui reste suffisamment fréquente.</li>
<li><strong>Conserver les identifiants.</strong> Vérifier que chaque demande arrive dans le CRM avec son <code>lead_id</code> (formulaires Meta) ou ses données de correspondance (site).</li>
<li><strong>Envoyer les changements d’étape.</strong> Brancher l’envoi vers l’API Conversions, idéalement en continu, au minimum une fois par jour.</li>
<li><strong>Contrôler la qualité.</strong> Dans le Gestionnaire d’événements, suivre la réception des événements et la qualité de correspondance. Un événement mal rattaché ne sert à rien.</li>
<li><strong>Changer l’objectif des campagnes.</strong> Une fois le volume d’événements stable, faire optimiser les campagnes sur l’étape choisie plutôt que sur le simple formulaire.</li>
</ol>
<h2>Les erreurs fréquentes</h2>
<ul>
<li><strong>Envoyer des étapes trop rares.</strong> Si l’étape choisie n’arrive que quelques fois par mois, l’algorithme n’a pas assez de signal. Mieux vaut une étape intermédiaire fréquente qu’une vente trop rare.</li>
<li><strong>Perdre les identifiants en route.</strong> Un formulaire qui n’enregistre ni e-mail, ni téléphone, ni identifiant de clic rend le rattachement impossible.</li>
<li><strong>Envoyer en retard.</strong> Les événements doivent arriver rapidement après le changement d’étape pour être exploitables.</li>
<li><strong>Doublonner.</strong> Si un même événement part à la fois du site et du serveur, il doit porter le même <code>event_id</code> pour être dédoublonné.</li>
</ul>
<h2>Ce qu’il faut retenir</h2>
<p>L’API Conversions ne sert pas seulement à compenser les pertes du pixel. Branchée sur votre CRM, elle transmet à Meta la seule information qui compte : quelles demandes deviennent des clients. C’est l’un des leviers que nous installons dans le cadre de <a href="/services/tracking-server-side/">notre accompagnement en tracking server-side</a>.</p>
<h2>Sources</h2>
<ul>
<li><a href="https://developers.facebook.com/documentation/ads-commerce/conversions-api">Meta for Developers : API Conversions</a></li>
<li><a href="https://developers.facebook.com/documentation/ads-commerce/conversions-api/conversion-leads-integration">Meta for Developers : intégration CRM pour l’optimisation des leads de conversion</a></li>
<li><a href="https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters">Meta for Developers : paramètres de l’API Conversions</a></li>
</ul>
<h2>À lire ensuite</h2>
<ul>
<li><a href="/blog/safari-itp-tracking-server-side/">Safari ITP : votre serveur de tracking survit-il à 7 jours ?</a></li>
<li><a href="/blog/ga4-6-reglages/">Google Analytics : 6 réglages à contrôler avant d’analyser</a></li>
</ul>
<p>Pour aller plus loin, découvrez notre accompagnement sur <a href="/services/tracking-server-side/">le tracking server-side et la mesure des conversions</a>.</p>
