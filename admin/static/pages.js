// Méthode, Contact, À propos, offre Site + Réseaux, pages légales, 404
// (cahier des charges v3, §9, §14.1, §16)
module.exports = (L) => {
  const { BRAND } = L;
  const WA_OFFRE = `${BRAND.whatsapp}?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20l%27offre%20Site%20%2B%20R%C3%A9seaux.`;

  const faqHtml = (faq) => faq.map(([q, a]) => `          <details>\n            <summary>${q}</summary>\n            <div class="faq__a">${a}</div>\n          </details>`).join('\n');
  const faqSchema = (faq) => ({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() } })),
  });

  const formLegal = `<p class="form__legal">Responsable du traitement : OBM System, ${BRAND.email}. Vos données servent uniquement à répondre à votre demande et sont transmises à nos prestataires techniques d’envoi et de suivi des demandes. Vous disposez d’un droit d’accès, de rectification et d’opposition (loi 09-08) : écrivez à ${BRAND.email}. Détails dans la <a href="/confidentialite/">politique de confidentialité</a>.</p>`;

  const besoins = ['Création de site', 'E-commerce', 'Publicité Meta / Google', 'Tracking et mesure', 'SEO / AEO', 'Réseaux sociaux', 'IA et automatisation', 'Diagnostic global', 'Site + Réseaux', 'Autre'];
  const demarrages = ['Dès que possible', 'Dans le mois', 'D’ici 1 à 3 mois', 'Au-delà de 3 mois'];

  // ================================================================ MÉTHODE
  const methodeFaq = [
    ['Avec quels types d’entreprises travaillez-vous ?', '<p>Des PME, des groupes et des marques, à Rabat, ailleurs au Maroc et à l’international, comme Éléganza au Canada.</p>'],
    ['Combien coûte un projet ?', '<p>Le prix dépend de ce qu’il faut faire. Après le diagnostic de croissance, vous recevez une proposition écrite avec le périmètre, le délai et le prix, avant tout engagement.</p>'],
    ['Faut-il refaire mon site ?', '<p>Pas forcément. Avant de décider, répondez à ces cinq questions :</p><ol><li>Que doit faire un visiteur en arrivant ?</li><li>D’où viennent vos visiteurs aujourd’hui ?</li><li>Qu’est-ce qui fait décider vos clients ?</li><li>Qui va faire vivre le site ?</li><li>Comment saurez-vous que ça marche ?</li></ol><p><a class="link" href="/blog/refonte-site-5-questions/">Lire l’article complet</a></p>'],
    ['Qui reste propriétaire du site et des statistiques ?', '<p>Vous. Le code, le nom de domaine, l’hébergement et les comptes Google Analytics sont à votre nom, et tous les accès vous sont transmis.</p>'],
    ['Pouvez-vous gérer nos réseaux sociaux sans refaire le site ?', '<p>Oui. Pour que chaque publication mène à une page qui convertit, nous proposons aussi l’<a class="link" href="/site-reseaux/">offre Site + Réseaux</a>.</p>'],
    ['En combien de temps un site est-il en ligne ?', '<p>Cela dépend du nombre de pages et des fonctionnalités. Le délai est fixé dans la proposition écrite, et vous validez les maquettes avant le début du développement.</p>'],
    ['Le budget publicitaire est-il compris ?', '<p>Non. Le budget des campagnes est payé directement à Meta, Google ou TikTok depuis votre compte. Nos honoraires couvrent la stratégie, la création et le pilotage.</p>'],
  ];

  const methode = {
    path: '/methode/',
    current: 'methode',
    head: {
      title: 'Méthode : du diagnostic au pilotage · OBM System',
      description: 'Diagnostic de croissance, proposition écrite, maquettes, développement, mise en ligne et pilotage : les six étapes d’un projet avec OBM System.',
    },
    schema: faqSchema(methodeFaq),
    crumbs: [['Accueil', '/'], ['Méthode', null]],
    main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker">Méthode</span>
        <h1 class="h1">Du diagnostic au pilotage, en six étapes</h1>
        <p class="lead">À la fin de chaque étape, vous recevez un livrable concret. Vous savez toujours où en est votre projet.</p>
      </div>
    </section>

    <section class="section section--night" aria-label="Les six étapes">
      <div class="wrap">
        <ol class="steps">
          <li><h3>Diagnostic de croissance</h3><p>30 minutes pour lire votre activité, vos clients et votre dispositif actuel. <b>Vous repartez avec :</b> vos priorités et un objectif clair.</p></li>
          <li><h3>Proposition écrite</h3><p>Le périmètre, le délai et le prix, avant tout engagement. <b>Vous recevez :</b> une proposition détaillée.</p></li>
          <li><h3>Maquettes</h3><p>Chaque page validée avant la première ligne de code. <b>Vous recevez :</b> les maquettes.</p></li>
          <li><h3>Développement et mesure</h3><p>Le site est construit et le marquage installé : GTM, GA4, Meta. <b>Vous recevez :</b> un lien de recette.</p></li>
          <li><h3>Mise en ligne</h3><p>Prise en main du back-office, accès à vos statistiques sur vos propres comptes. <b>Vous recevez :</b> le site en ligne et tous les accès.</p></li>
          <li><h3>Pilotage</h3><p>Lecture des résultats, décisions et plan d’actions. <b>Vous recevez :</b> un plan d’actions.</p></li>
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="n-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">De votre côté</span>
            <h2 class="h2" id="n-t">Ce dont nous aurons besoin</h2>
          </div>
          <p class="lead">Un projet avance au rythme des échanges. Voici ce que nous vous demanderons.</p>
        </div>
        <div class="needs">
          <div><h3>Vos accès</h3><p>Nom de domaine, hébergement actuel, comptes Facebook, Instagram et Google, selon le projet.</p></div>
          <div><h3>Vos contenus</h3><p>Logo, photos, textes ou informations de base. Nous les rédigeons avec vous si besoin.</p></div>
          <div><h3>Vos validations</h3><p>Un retour rapide sur les maquettes et les calendriers, pour tenir les délais.</p></div>
        </div>
      </div>
    </section>

    <section class="section section--rule" id="faq" aria-labelledby="f-t">
      <div class="wrap narrow">
        <span class="kicker">Questions fréquentes</span>
        <h2 class="h2" id="f-t" style="margin-bottom:2rem">Ce qu’on nous demande souvent</h2>
        <div class="faq">
${faqHtml(methodeFaq)}
        </div>
      </div>
    </section>
    ${L.ctaBand({ loc: 'methode-band' })}
`,
  };

  // ================================================================ CONTACT
  const contact = {
    path: '/contact/',
    current: '',
    head: {
      title: 'Contact · OBM System, Rabat',
      description: 'Réservez votre diagnostic de croissance de 30 minutes, écrivez-nous sur WhatsApp ou via le formulaire. OBM System, Rabat. Réponse sous 24 h ouvrées.',
    },
    crumbs: [['Accueil', '/'], ['Contact', null]],
    main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker">Contact</span>
        <h1 class="h1">Parlons de votre croissance</h1>
        <p class="lead">Un diagnostic de croissance de 30 minutes pour lire votre dispositif actuel et identifier vos leviers prioritaires. Si le projet s’y prête, vous recevez ensuite une proposition écrite avec le périmètre, le délai et le prix.</p>
      </div>
    </section>

    <section class="section" style="padding-top:0" aria-label="Nous contacter">
      <div class="wrap contact">
        <div>
          <div class="layer" id="diagnostic">
            <small>00 · Stratégie</small>
            <h2 class="h3">Diagnostic de croissance</h2>
            <p>30 minutes en visio ou par téléphone, pour faire le point sur vos priorités.</p>
            <div class="actions" style="margin-top:.8rem"><a class="btn" href="${BRAND.diagnostic}" data-loc="contact">Choisir mon créneau (30 min)</a></div>
          </div>
          <ul class="ways">
            <li><span>WhatsApp</span><a href="${BRAND.whatsapp}?text=${L.WA_TEXT}" target="_blank" rel="noopener" data-loc="contact">${BRAND.phoneLabel}</a></li>
            <li><span>Téléphone</span><a href="tel:${BRAND.phone}" data-loc="contact">${BRAND.phoneLabel}</a></li>
            <li><span>E-mail</span><a href="mailto:${BRAND.email}">${BRAND.email}</a></li>
            <li><span>Réseaux</span><span>${BRAND.social.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join(' · ')}</span></li>
            <li><span>Adresse</span>Rabat, Maroc</li>
          </ul>
          <p class="muted" style="margin-top:1.5rem">Avant votre diagnostic, vous pouvez lire <a class="link" href="/methode/">comment se passe un projet</a> et les <a class="link" href="/methode/#faq">questions fréquentes</a>.</p>
        </div>

        <div>
          <form class="form" id="leadForm" data-lead="Formulaire principal" data-ok="leadOk" action="https://formsubmit.co/${BRAND.email}" method="POST" novalidate>
            <input type="hidden" name="_subject" value="Nouvelle demande OBM System" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value="https://obm-system.com/contact/?envoye=1" />
            <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <h2 class="h3">Écrivez-nous</h2>
            <div class="row2">
              <div class="field"><label for="f-nom">Nom</label><input id="f-nom" name="Nom" required autocomplete="name" /></div>
              <div class="field"><label for="f-ent">Entreprise</label><input id="f-ent" name="Entreprise" autocomplete="organization" /></div>
            </div>
            <div class="row2">
              <div class="field"><label for="f-tel">Téléphone</label><input id="f-tel" name="Telephone" type="tel" required autocomplete="tel" inputmode="tel" pattern="[0-9 +]{8,16}" /></div>
              <div class="field"><label for="f-mail">E-mail</label><input id="f-mail" name="Email" type="email" autocomplete="email" /></div>
            </div>
            <div class="row2">
              <div class="field"><label for="f-besoin">Votre besoin</label>
                <select id="f-besoin" name="Besoin">${besoins.map(b => `<option>${b}</option>`).join('')}</select>
              </div>
              <div class="field"><label for="f-dem">Démarrage souhaité</label>
                <select id="f-dem" name="Demarrage"><option value="">Non précisé</option>${demarrages.map(d => `<option>${d}</option>`).join('')}</select>
              </div>
            </div>
            <div class="field"><label for="f-ville">Ville</label><input id="f-ville" name="Ville" autocomplete="address-level2" /></div>
            <div class="field"><label for="f-msg">Quelques mots sur votre projet</label><textarea id="f-msg" name="Message" rows="4"></textarea></div>
            <button class="btn" type="submit"><span>Envoyer</span></button>
            <p class="form__note">Nous répondons sous 24 h ouvrées.</p>
            ${formLegal}
          </form>
          <div class="form form__ok" id="leadOk" hidden tabindex="-1" role="status">
            <h3>Merci, votre message est bien arrivé.</h3>
            <p class="muted">Nous vous répondons sous 24 h ouvrées. Si c’est urgent, écrivez-nous sur WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
`,
  };

  // ================================================================ À PROPOS
  const apropos = {
    path: '/a-propos/',
    current: 'apropos',
    head: {
      title: 'À propos · OBM System, Rabat depuis 2018',
      description: 'OBM System conçoit des systèmes de croissance digitale pour les PME, groupes et marques, depuis Rabat. Fondée en 2018 par Oualid Benamara.',
    },
    schema: { '@context': 'https://schema.org', '@type': 'AboutPage', url: `${L.SITE_URL}/a-propos/`, mainEntity: L.personNode(), about: { '@id': L.ORG_ID } },
    crumbs: [['Accueil', '/'], ['À propos', null]],
    main: (crumbs) => `
    <section class="page-head">
      <div class="wrap">
        ${crumbs}
        <span class="kicker">À propos</span>
        <h1 class="h1">${BRAND.slogan}</h1>
        <p class="lead">OBM System est une ${BRAND.descriptor.toLowerCase()} fondée en 2018 à Rabat. Nous concevons des systèmes de croissance digitale pour les PME, les groupes et les marques, au Maroc et à l’international.</p>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="layers" style="grid-template-columns:repeat(2,minmax(0,1fr))">
          <div class="layer" id="oualid">
            <small>Fondateur</small>
            <h2 class="h3">Oualid Benamara</h2>
            <p>Fondateur d’OBM System. Il pilote chaque projet du diagnostic de croissance au pilotage des résultats.</p>
            <ul><li><a class="link" href="https://www.linkedin.com/in/oualidbenamara/" target="_blank" rel="noopener">Profil LinkedIn</a></li></ul>
          </div>
          <div class="layer">
            <small>OBM System</small>
            <h2 class="h3">Depuis 2018, à Rabat</h2>
            <p>${BRAND.trade} Une seule équipe pour la stratégie, la conception, l’acquisition, la mesure, la visibilité et l’activation.</p>
            <ul><li><a class="link" href="https://www.linkedin.com/company/obm-system/" target="_blank" rel="noopener">Page LinkedIn de l’entreprise</a></li></ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--rule" aria-labelledby="p-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">Nos principes</span>
            <h2 class="h2" id="p-t">Ce qui guide notre travail</h2>
          </div>
        </div>
        <div class="layers">
          <div class="layer"><small>01</small><h3>La stratégie d’abord</h3><p>Chaque levier part d’un objectif business, fixé pendant le diagnostic de croissance.</p></div>
          <div class="layer"><small>02</small><h3>La preuve plutôt que la promesse</h3><p>Nous montrons un mécanisme, une spécification, une capture. Un chiffre uniquement s’il est vérifié.</p></div>
          <div class="layer"><small>03</small><h3>Une mesure fiable</h3><p>Chaque demande et chaque vente rattachée à sa source, pour décider sur des données complètes.</p></div>
          <div class="layer"><small>04</small><h3>Tout vous appartient</h3><p>Code, nom de domaine, comptes publicitaires et statistiques sont à votre nom, avec tous les accès.</p></div>
          <div class="layer"><small>05</small><h3>Une seule équipe</h3><p>Un seul discours du premier post à la demande de contact, et un seul interlocuteur.</p></div>
          <div class="layer"><small>06</small><h3>L’écrit avant l’engagement</h3><p>Périmètre, délai et prix fixés par écrit, maquettes validées avant le code.</p></div>
        </div>
      </div>
    </section>
    ${L.ctaBand({ loc: 'apropos-band' })}
`,
  };

  // ================================================================ OFFRE SITE + RÉSEAUX
  const offre = {
    path: '/site-reseaux/',
    current: '',
    head: {
      title: 'Offre Site + Réseaux : site web et réseaux sociaux · OBM System',
      description: 'Votre site web et vos réseaux sociaux gérés par la même équipe à Rabat : création du site, reels, carrousels et stories chaque mois, réponses aux messages et bilan mensuel.',
    },
    schema: {
      '@context': 'https://schema.org', '@type': 'Service', '@id': `${L.SITE_URL}/site-reseaux/#service`,
      name: 'Offre Site + Réseaux', serviceType: 'Création de site web et gestion des réseaux sociaux',
      description: 'Création ou refonte du site web et gestion des réseaux sociaux par la même équipe : visuels, carrousels, reels et stories chaque mois, calendrier validé, réponses aux commentaires et messages, bilan mensuel, hébergement et maintenance du site.',
      provider: { '@id': L.ORG_ID }, areaServed: { '@type': 'Country', name: 'Maroc' }, url: `${L.SITE_URL}/site-reseaux/`,
    },
    crumbs: [['Accueil', '/'], ['Services', '/services/'], ['Offre Site + Réseaux', null]],
    main: (crumbs) => `
    <section class="intro">
      <div class="wrap intro__grid">
        <div>
          ${crumbs}
          <span class="kicker">Offre Site + Réseaux</span>
          <h1 class="h1">Votre site et vos réseaux sociaux, gérés par la même équipe.</h1>
          <p class="lead">Nous créons ou refaisons votre site, puis nous prenons en charge vos réseaux sociaux chaque mois : visuels, carrousels, vidéos, publication et réponses aux messages. Chaque publication mène à une page précise du site, conçue pour convertir.</p>
          <div class="actions">
            <a class="btn" href="${BRAND.diagnostic}" data-loc="offre-hero">Réserver mon diagnostic (30 min)</a>
            <a class="link" href="#contact">Recevoir le détail de l’offre</a>
          </div>
          <div class="intro__facts"><span>Calendrier validé avant publication</span><span>Visuels et vidéos inclus</span><span>Bilan chaque mois</span></div>
        </div>
        <div>
          <div class="reel"><video src="/assets/video/reel-site-reseaux.mp4" poster="/assets/video/reel-site-reseaux-poster.jpg" autoplay muted loop playsinline preload="metadata" aria-label="Vidéo de présentation de l'offre Site + Réseaux"></video></div>
          <p class="reel-cap">Un reel produit pour notre propre compte Instagram.</p>
        </div>
      </div>
    </section>

    <section class="section section--rule" aria-labelledby="p-t">
      <div class="wrap head" style="align-items:start;margin-bottom:0">
        <div>
          <span class="kicker">Pourquoi cette offre</span>
          <h2 class="h2" id="p-t">Un seul système, du premier post à la demande de contact</h2>
        </div>
        <ul class="lead checklist" style="margin-top:0">
          <li>Chaque publication mène à une page précise du site, conçue pour convertir</li>
          <li>Le site évolue au rythme de vos campagnes et de vos contenus</li>
          <li>Une seule équipe, un seul discours, un seul calendrier</li>
          <li>Chaque demande est rattachée à la publication qui l’a générée</li>
        </ul>
      </div>
    </section>

    <section class="section section--rule" aria-labelledby="e-t">
      <div class="wrap">
        <div class="head">
          <div>
            <span class="kicker">Ce qui est inclus</span>
            <h2 class="h2" id="e-t">Le site et les réseaux, pensés ensemble</h2>
          </div>
          <p class="lead">Le détail de chaque levier : <a class="link" href="/services/creation-site-web/">création de sites</a> et <a class="link" href="/services/reseaux-sociaux/">réseaux sociaux</a>.</p>
        </div>
        <div class="engines">
          <article class="engine" data-reveal>
            <span class="kicker">Votre site</span>
            <h3>Pour recevoir des demandes</h3>
            <p>Chaque page mène à une action claire : appeler, écrire sur WhatsApp, réserver ou acheter.</p>
            <ul><li>Pages pensées à partir des questions de vos clients</li><li>Appel et WhatsApp accessibles depuis chaque écran</li><li>Rapide sur téléphone</li><li>Référencement de base et suivi des demandes</li><li>Hébergement et maintenance compris</li></ul>
          </article>
          <article class="engine" data-reveal>
            <span class="kicker">Vos réseaux sociaux</span>
            <h3>Pour vous faire connaître</h3>
            <p>Chaque publication donne une raison de vous découvrir, puis de vous écrire.</p>
            <ul><li>Ligne éditoriale et ton adaptés à votre activité</li><li>Profils optimisés : présentation, liens, stories à la une</li><li>Visuels, carrousels, reels et stories</li><li>Réponses aux commentaires et aux messages</li><li>Liens vers les bonnes pages de votre site</li></ul>
          </article>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0" aria-labelledby="mo-t">
      <div class="wrap">
        <div class="head">
          <div><span class="kicker">Chaque mois</span><h2 class="h2" id="mo-t">Ce que vous recevez</h2></div>
          <p class="lead">Le nombre de publications est fixé avec vous dans la proposition écrite, selon votre activité et vos objectifs.</p>
        </div>
        <div class="monthly">
          <div><h3>Un calendrier</h3><p>Les publications du mois suivant, à valider avant leur mise en ligne.</p></div>
          <div><h3>Des visuels et des carrousels</h3><p>Dans vos couleurs, avec un message utile pour vos clients.</p></div>
          <div><h3>Des vidéos</h3><p>Reels et stories tournés, montés et publiés pour vous.</p></div>
          <div><h3>Des réponses</h3><p>Commentaires et messages suivis, et les demandes transmises à votre équipe.</p></div>
          <div><h3>Un site à jour</h3><p>Hébergement, maintenance et petites modifications.</p></div>
          <div><h3>Un bilan</h3><p>Ce qui a marché, ce qu’on ajuste le mois suivant.</p></div>
        </div>
      </div>
    </section>

    <section class="section section--rule" aria-labelledby="x-t">
      <div class="wrap">
        <article class="work">
          ${L.shot({ key: 'pharmacie', host: 'pharmagareriad.ma', alt: 'Boutique en ligne de la Pharmacie Gare Hay Riad', phone: true })}
          <div>
            <p class="work__meta">Un exemple</p>
            <h2 class="h2" id="x-t">Pharmacie Gare Hay Riad, à Rabat</h2>
            <p>Pour cette pharmacie de quartier, nous avons construit le site et les réseaux sociaux en même temps.</p>
            <ul><li>Une boutique en ligne de près de 700 produits</li><li>Les comptes Instagram et Facebook, créés puis animés</li><li>La création de contenu et la réponse aux messages</li><li>La fiche Google, les publicités Meta et Google, le référencement local</li></ul>
            <div class="actions"><a class="btn btn--line" href="/cas-clients/pharmacie-gare-hay-riad/">Lire le projet</a><a class="link" href="https://pharmagareriad.ma/" target="_blank" rel="noopener" data-case="pharmacie">Voir le site</a></div>
          </div>
        </article>
      </div>
    </section>

    <section class="section section--night" aria-labelledby="d-t">
      <div class="wrap">
        <div class="head"><div><span class="kicker">Déroulé</span><h2 class="h2" id="d-t">Du diagnostic au premier post</h2></div></div>
        <ol class="steps">
          <li><h3>Diagnostic de croissance</h3><p>30 minutes pour comprendre votre activité, vos clients et vos objectifs.</p></li>
          <li><h3>Ligne éditoriale</h3><p>Le ton, les sujets et les formats : ce que l’on dit, et comment on le dit.</p></li>
          <li><h3>Le site</h3><p>Maquettes validées, puis site en ligne après votre recette.</p></li>
          <li><h3>Les profils</h3><p>Présentation, liens et stories à la une : vos réseaux renvoient vers le site.</p></li>
          <li><h3>La production</h3><p>Chaque mois : calendrier validé, tournage, création, publication.</p></li>
          <li><h3>Le bilan</h3><p>Nous lisons les résultats avec vous et ajustons le mois suivant.</p></li>
        </ol>
      </div>
    </section>

    <section class="section" id="contact" aria-labelledby="c-t">
      <div class="wrap contact">
        <div>
          <span class="kicker">Contact</span>
          <h2 class="h2" id="c-t">Recevoir le détail de l’offre</h2>
          <p class="lead">Envoyez-nous le lien de votre site ou de votre compte Instagram. Nous revenons vers vous avec une lecture de votre présence actuelle et une proposition.</p>
          <ul class="ways">
            <li><span>Diagnostic</span><a href="${BRAND.diagnostic}" data-loc="offre-contact">Réserver mon diagnostic (30 min)</a></li>
            <li><span>WhatsApp</span><a href="${WA_OFFRE}" target="_blank" rel="noopener" data-loc="offre-contact">${BRAND.phoneLabel}</a></li>
            <li><span>E-mail</span><a href="mailto:${BRAND.email}">${BRAND.email}</a></li>
          </ul>
        </div>
        <div>
          <form class="form" id="offerForm" data-lead="Offre Site + Reseaux" data-ok="offerOk" action="https://formsubmit.co/${BRAND.email}" method="POST" novalidate>
            <input type="hidden" name="_subject" value="Nouvelle demande Site + Réseaux" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value="https://obm-system.com/site-reseaux/?envoye=1#contact" />
            <input type="hidden" name="Besoin" value="Site + Réseaux" />
            <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <h3>Vos coordonnées</h3>
            <div class="row2">
              <div class="field"><label for="o-nom">Nom</label><input id="o-nom" name="Nom" required autocomplete="name" /></div>
              <div class="field"><label for="o-ent">Entreprise</label><input id="o-ent" name="Entreprise" autocomplete="organization" /></div>
            </div>
            <div class="row2">
              <div class="field"><label for="o-tel">Téléphone</label><input id="o-tel" name="Telephone" type="tel" required autocomplete="tel" inputmode="tel" pattern="[0-9 +]{8,16}" /></div>
              <div class="field"><label for="o-dem">Démarrage souhaité</label><select id="o-dem" name="Demarrage"><option value="">Non précisé</option>${demarrages.map(d => `<option>${d}</option>`).join('')}</select></div>
            </div>
            <div class="field"><label for="o-msg">Lien de votre site ou de votre compte Instagram</label><textarea id="o-msg" name="Message" rows="3"></textarea></div>
            <button class="btn" type="submit"><span>Envoyer</span></button>
            ${formLegal}
          </form>
          <div class="form form__ok" id="offerOk" hidden tabindex="-1" role="status">
            <h3>Merci, votre demande est bien arrivée.</h3>
            <p class="muted">Nous revenons vers vous sous 24 h ouvrées.</p>
          </div>
        </div>
      </div>
    </section>
`,
  };

  // ================================================================ MENTIONS LÉGALES
  const mentions = {
    path: '/mentions-legales/',
    current: '',
    head: { title: 'Mentions légales · OBM System', description: 'Mentions légales du site obm-system.com : éditeur, hébergement, propriété intellectuelle et données personnelles.' },
    crumbs: [['Accueil', '/'], ['Mentions légales', null]],
    main: (crumbs) => `
    <section class="page-head"><div class="wrap narrow">${crumbs}<h1 class="h1">Mentions légales</h1></div></section>
    <div class="wrap narrow prose">
      <h2>Éditeur du site</h2>
      <p>OBM System, Rabat, Maroc<br />Téléphone : ${BRAND.phoneLabel} · E-mail : <a href="mailto:${BRAND.email}">${BRAND.email}</a><br />Directeur de la publication : Oualid Benamara, fondateur</p>
      <p class="notice">Les informations d’immatriculation (forme juridique, capital, siège social, RC, ICE, IF) seront publiées sur cette page.</p>
      <h2>Hébergement</h2>
      <p>Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Allemagne · <a href="https://www.hetzner.com" target="_blank" rel="noopener">hetzner.com</a></p>
      <h2>Propriété intellectuelle</h2>
      <p>L’ensemble des contenus du site (textes, visuels, logo, code) est la propriété d’OBM System, sauf mention contraire. Les captures des réalisations sont publiées avec l’accord des clients concernés. Toute reproduction sans autorisation écrite est interdite.</p>
      <h2>Données personnelles</h2>
      <p>Voir la <a href="/confidentialite/">politique de confidentialité</a>.</p>
    </div>
`,
  };

  // ================================================================ CONFIDENTIALITÉ
  const confid = {
    path: '/confidentialite/',
    current: '',
    head: { title: 'Politique de confidentialité · OBM System', description: 'Données collectées par obm-system.com, finalités, destinataires, durées de conservation, cookies et droits (loi 09-08).' },
    crumbs: [['Accueil', '/'], ['Confidentialité', null]],
    main: (crumbs) => `
    <section class="page-head"><div class="wrap narrow">${crumbs}<h1 class="h1">Politique de confidentialité</h1><p class="lead">Dernière mise à jour : 1er novembre 2026</p></div></section>
    <div class="wrap narrow prose">
      <h2>Responsable du traitement</h2>
      <p>OBM System, Rabat, Maroc · <a href="mailto:${BRAND.email}">${BRAND.email}</a></p>
      <h2>Données collectées et finalités</h2>
      <table>
        <thead><tr><th>Source</th><th>Données</th><th>Finalité</th></tr></thead>
        <tbody>
          <tr><td>Formulaire de contact</td><td>Nom, entreprise, téléphone, e-mail, ville, besoin, délai, message</td><td>Répondre à votre demande et vous adresser une proposition</td></tr>
          <tr><td>Réservation du diagnostic (Calendly)</td><td>Nom, e-mail, réponses au formulaire de réservation, numéro WhatsApp</td><td>Organiser et préparer le diagnostic</td></tr>
          <tr><td>WhatsApp</td><td>Numéro, messages</td><td>Échanger avec vous</td></tr>
          <tr><td>Mesure d’audience et publicité (Google Analytics, Meta), avec votre consentement</td><td>Identifiants en ligne, pages vues, événements</td><td>Mesurer et améliorer le site et nos campagnes</td></tr>
        </tbody>
      </table>
      <p>Les données de mesure d’audience sont conservées 14 mois au maximum.</p>
      <h2>Destinataires et sous-traitants</h2>
      <p>Vos données sont destinées à OBM System et à ses sous-traitants techniques : l’hébergeur du site (Hetzner), FormSubmit et notre outil de suivi des demandes pour le formulaire, Calendly pour les réservations, Google et Meta pour la mesure d’audience. Certains de ces prestataires sont situés hors du Maroc.</p>
      <h2>Vos droits</h2>
      <p>Conformément à la loi 09-08, vous disposez d’un droit d’accès, de rectification et d’opposition. Pour l’exercer, écrivez à <a href="mailto:${BRAND.email}">${BRAND.email}</a>.</p>
      <h2 id="cookies">Cookies</h2>
      <p>Les cookies de mesure et de publicité ne sont déposés qu’après votre accord. Vous pouvez modifier votre choix à tout moment via le lien « Gestion des cookies » en bas de chaque page.</p>
      <p><a class="btn btn--line" href="#" data-open-consent>Modifier mon choix</a></p>
    </div>
`,
  };

  // ================================================================ 404
  const notFound = {
    path: '/404.html',
    current: '',
    head: { title: 'Page introuvable · OBM System', description: 'Cette page n’existe pas, ou plus.', noindex: true },
    main: `
    <section class="page-head" style="min-height:50vh">
      <div class="wrap">
        <span class="kicker">Erreur 404</span>
        <h1 class="h1">Cette page n’existe pas, ou plus.</h1>
        <p class="lead">Le lien est peut-être ancien, ou l’adresse contient une faute de frappe.</p>
        <div class="actions">
          <a class="btn" href="${BRAND.diagnostic}" data-loc="404">Réserver mon diagnostic (30 min)</a>
          <a class="link" href="/">Retour à l’accueil</a>
        </div>
      </div>
    </section>
`,
  };

  return [methode, contact, apropos, offre, mentions, confid, notFound];
};
