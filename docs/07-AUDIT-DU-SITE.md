# Audit du site - performance, SEO, accessibilité, sécurité

Audit réalisé sur la branche `develop`, avant lancement. Chaque constat est
étayé par une mesure ou une vérification dans le code - aucun n'est déduit d'un
rapport d'outil sans contrôle.

Les constats sont classés par gravité :

| Niveau | Définition |
|---|---|
| **Bloquant** | À corriger avant le lancement |
| **Majeur** | À corriger avant le lancement si le parcours est critique |
| **Mineur** | Backlog |
| **Conforme** | Vérifié, rien à faire |

---

## 1. Sécurité

### 1.1. Jetons OAuth transmis dans l'URL - **Bloquant**

Le retour de connexion Google et Facebook redirige vers :

```
/auth/callback?accessToken=…&refreshToken=…
```

Les deux jetons transitent donc dans la barre d'adresse. Ils sont alors
enregistrés dans l'historique du navigateur, transmis dans l'en-tête `Referer`
à toute ressource tierce chargée par la page, et inscrits dans les journaux de
tout intermédiaire - reverse proxy, CDN, pare-feu applicatif.

Le jeton de rafraîchissement est une crédence à longue durée de vie : quiconque
le récupère peut rouvrir une session, y compris après une déconnexion côté
navigateur.

`public/robots.txt` interdit l'indexation de `/auth/callback`, ce qui limite
l'exposition aux moteurs, mais ne règle ni l'historique, ni le `Referer`, ni les
journaux.

**Correction attendue** : transmettre les jetons hors de l'URL - cookie
`httpOnly` posé par l'API, ou code d'échange à usage unique échangé contre les
jetons par une requête POST.

*Détecté par : OWASP ZAP baseline, règle 10024, puis vérifié dans
`api/src/modules/auth/auth.controller.ts`.*

### 1.2. Content-Security-Policy absente - **Majeur**

`webapp/next.config.js` pose cinq en-têtes de sécurité - `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection`,
`X-DNS-Prefetch-Control` - mais aucune CSP. En l'absence de CSP, rien ne limite
l'exécution d'un script injecté.

L'API, elle, utilise `helmet()` et pose sa propre CSP ; l'écart ne concerne que
le front, c'est-à-dire précisément la surface exposée aux participants.

### 1.3. `X-Powered-By` divulgue le framework - **Mineur**

`poweredByHeader` n'est pas désactivé : chaque réponse annonce Next.js. Ce
n'est pas une vulnérabilité en soi, mais cela oriente un attaquant vers les CVE
correspondantes. Une ligne de configuration suffit.

### 1.4. Permissions-Policy et COEP absentes - **Mineur**

Aucune restriction déclarée sur les API du navigateur (caméra, micro,
géolocalisation), qu'aucune page n'utilise.

### 1.5. Dépendances de production - **Majeur**

`npm audit --omit=dev` : **12 vulnérabilités**, dont 9 de gravité élevée.

| Paquet | Nature | Avis notables |
|---|---|---|
| `next` (directe) | Élevée | SSRF via rewrites ; divulgation non authentifiée d'endpoints de Server Functions ; confusion de cache sur corps de réponse ; déni de service sur l'optimisation d'images via SVG |
| `axios` (directe) | Élevée | Pollution de prototype altérant la construction des requêtes ; contournements de `maxBodyLength` |
| `sharp`, `postcss`, `nanoid`, `js-yaml`, `form-data`, `qs` | Élevée à modérée | Transitives |

Les deux premières sont des dépendances **directes** : leur mise à jour est
sous notre contrôle. Parmi les avis Next, la confusion de cache et la
divulgation d'endpoints sont les seuls à impact direct sur une plateforme
publique portant des données personnelles.

**Traitement** : `npm audit fix` sans `--force` applique les correctifs
compatibles. La mise à jour doit se faire depuis la racine et pour les deux
workspaces à la fois.

### 1.6. Ce qui est conforme

Vérifié par les tests fonctionnels, à chaque exécution :

- **Contrôle d'accès** : toute route protégée répond 403 sans jeton valide ;
  un client n'atteint ni la liste des participations ni les routes employé.
- **Anti-énumération** : mot de passe erroné et adresse inconnue produisent le
  même statut et le même message ; idem pour un code de vérification faux et
  une demande inexistante.
- **Anti-IDOR** : un client consultant la participation d'un autre reçoit 404,
  jamais 403 - le second révélerait l'existence de la ressource.
- **Limitation de débit** : trois paliers par IP, plus un plafond par
  utilisateur et par heure.
- **Validation stricte** : toute propriété hors contrat est refusée.
- **Mots de passe** : hachés en bcrypt, jamais renvoyés par l'API.
- **Scan ZAP** : 0 alerte bloquante, 55 contrôles passés.

---

## 2. SEO

### 2.1. Conforme

- `sitemap.ts` généré dynamiquement ; `public/robots.txt` autorise l'indexation
  et exclut `/dashboard`, `/admin`, `/employee` et `/auth/callback`.
- 13 pages portent leurs propres métadonnées.
- Données structurées `Organization`, `WebSite` et `FAQPage` en JSON-LD.
- Rendu serveur natif : le contenu est visible des robots sans exécution de
  JavaScript.

### 2.2. À faire avant le lancement - **Majeur**

Trois éléments dépendent de l'environnement de production et ne peuvent être
posés qu'au déploiement :

- `NEXT_PUBLIC_SITE_URL` - sans lui, les URL canoniques et le sitemap pointent
  vers une valeur de repli ;
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, puis soumission du sitemap à la
  Search Console ;
- `NEXT_PUBLIC_GA_ID` pour la mesure d'audience.

---

## 3. Accessibilité

Auditée séparément au niveau **WCAG 2.2 AA**, et vérifiée en continu par
`cypress/e2e/accessibilite.cy.ts` - neuf contrôles sur dix pages.

Deux pièges méthodologiques rencontrés lors de cet audit, consignés pour que le
prochain ne les reproduise pas :

- un contrôle de contraste qui ignore le texte semi-transparent ne voit jamais
  le pied de page ;
- `.focus()` ne déclenche pas `:focus-visible` : mesurer l'indicateur de focus
  ainsi produit des faux positifs en masse.

**Reste ouvert - Mineur** : un bouton du système de design plafonne à 4,11:1,
sous le seuil de 4,5:1 exigé pour le texte normal.

---

## 4. Performance

Mesurée avec Lighthouse sur un **build de production**, en profil mobile avec
bridage réseau simulé - le parcours de participation se fait depuis un
téléphone, en boutique ou juste après, un score desktop n'aurait aucun rapport
avec l'usage réel.

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Accueil | **63** | 97 | 96 | 100 | 2,7 s | **0,19** | 720 ms |
| Participation | **75** | 97 | 96 | 100 | 3,8 s | 0 | 530 ms |
| Règlement | **82** | 97 | 96 | 100 | 3,6 s | 0 | 360 ms |

*Seuils de bon niveau : LCP < 2,5 s, CLS < 0,10, TBT < 200 ms.*

### 4.1. Portée de la mesure

Réalisée en local, latence réseau nulle, sur une machine de développement. Le
bridage mobile simulé compense partiellement, mais **ces chiffres ne valent pas
promesse de performance en production**. Ils servent à identifier les problèmes
structurels - ils y parviennent - et la mesure de référence devra être refaite
sur la préproduction, derrière Traefik et HTTPS.

Un point de méthode, appris à nos dépens : une première campagne a produit des
scores sensiblement différents (performance 58, bonnes pratiques 77) parce que
l'API n'était pas joignable depuis le navigateur de mesure. La page était donc
évaluée **amputée de ses données**, et le CLS comme le TBT reflétaient des
squelettes de chargement qui ne se remplissaient jamais. **Toute mesure doit
être précédée d'un contrôle des erreurs console** : sans lui, on publie des
chiffres qui décrivent une page qui n'existe pas.

### 4.2. Décalage de mise en page sur l'accueil - **Majeur**

CLS de 0,19, soit près du double du seuil. Une seule cause : le bloc des
boutons du hero (`hero-cta-buttons.tsx`) compte pour **0,188 à lui seul**.

Ce bloc n'apparaît pas tardivement - il est *poussé* par le contenu au-dessus.
Le `h1` a lui aussi enregistré un décalage, ce qui oriente vers le rechargement
des polices : Playfair Display et Montserrat sont chargées en `display: 'swap'`,
qui privilégie l'affichage immédiat en police de repli puis substitue la police
définitive, au prix d'un reflux.

Les deux autres pages sont à 0, ce qui confirme que le problème est localisé au
hero et non global.

### 4.3. Blocage du fil principal - **Majeur**

TBT de 720 ms sur l'accueil, contre un seuil de 200 ms, avec 4,5 s de travail
sur le fil principal et 1,9 s d'exécution JavaScript. Le délai maximal de
première interaction atteint 670 ms : pendant ce temps, la page est affichée
mais ne répond pas.

Économies chiffrées par Lighthouse :

| Poste | Gain estimé |
|---|---|
| JavaScript inutilisé | 50 Ko |
| JavaScript hérité (transpilé pour navigateurs anciens) | 13 Ko |
| Livraison des images | 15 Ko |

### 4.4. Favicon en 404 - **Mineur**

`/favicon.ico` répond 404 sur les trois pages : c'est la seule erreur console
restante une fois la mesure assainie.

### 4.5. Ce qui est conforme

- **Prérendu statique** de toutes les pages publiques - accueil, participation,
  règlement, FAQ, mentions légales, CGU. Seule `/health` est dynamique. C'est la
  meilleure configuration possible pour le référencement et le premier rendu.
- Aucun décalage de mise en page hors accueil.
- Bonnes pratiques à 96 sur les trois pages.

---

## 5. Suivi des corrections

L'audit ci-dessus est un constat daté. Cette section trace ce qui a été traité
depuis, sans réécrire les mesures d'origine - c'est l'écart entre les deux qui
documente le travail.

| Constat | Gravité | État |
|---|---|---|
| Jetons OAuth dans l'URL | Bloquant | **Ouvert** - approche retenue : code d'échange à usage unique |
| Content-Security-Policy absente | Majeur | **Ouvert** - à déployer d'abord en `Report-Only` |
| Dépendances de production vulnérables | Majeur | **Traité** - 12 vulnérabilités dont 9 élevées → 1 modérée |
| Variables d'environnement de production | Majeur | **Traité côté code** - les `ARG` manquaient au Dockerfile ; reste à les passer depuis Jenkins |
| Décalage de mise en page du hero | Majeur | **Traité** - CLS 0,190 → 0,001 |
| Blocage du fil principal | Majeur | **Partiellement** - TBT 720 → 498 ms ; le JavaScript inutilisé reste |
| `X-Powered-By` | Mineur | **Traité** |
| Permissions-Policy absente | Mineur | **Traité** |
| Favicon en 404 | Mineur | **Traité** - aucun fichier d'icône n'existait |
| Contraste du bouton d'action | Mineur | **Traité** - 4,11:1 → 4,96:1 |

### Mesures après correction

Médiane de quatre exécutions sur l'accueil, mêmes conditions que la mesure
d'origine :

| | Avant | Après |
|---|---|---|
| Performance | 63 | **74** |
| CLS | 0,190 | **0,001** |
| TBT | 720 ms | **498 ms** |
| FCP | 2,0 s | **1,4 s** |
| LCP | 2,65 s | 4,05 s |

Le LCP demande une lecture attentive plutôt qu'une conclusion hâtive.
L'élément mesuré est le paragraphe du hero, pas l'image. Avec `display: swap`,
ce texte se peignait immédiatement en police de repli - le LCP était donc
crédité tôt, puis le texte sautait. Avec `display: optional`, c'est la peinture
**stable** qui est comptabilisée. Le participant ne voit pas le texte plus
tard : il ne le voit plus bouger. Le score global, qui pondère les cinq
métriques, tranche dans le même sens.

Les leviers restants sur cette page sont chiffrés par Lighthouse : 656 ms de
délai de rendu de l'élément LCP, 9,3 Ko de CSS bloquant le rendu, et 50 Ko de
JavaScript inutilisé.

## 6. Synthèse

| Domaine | Bloquant | Majeur | Mineur |
|---|---|---|---|
| Sécurité | 1 | 2 | 2 |
| SEO | 0 | 1 | 0 |
| Accessibilité | 0 | 0 | 1 |
| Performance | 0 | 2 | 1 |
| **Total** | **1** | **5** | **4** |

**Un seul constat bloquant** : les jetons OAuth transmis dans l'URL. Il touche
au parcours d'authentification, fonctionnellement validé par ailleurs, et sa
correction change la manière dont la session parvient au front - c'est une
décision d'architecture, pas un correctif de surface.

Les cinq constats majeurs se répartissent en deux familles. Trois relèvent de
la configuration et se corrigent sans toucher au produit : CSP absente,
dépendances à mettre à jour, variables d'environnement de production. Deux
demandent un travail d'optimisation ciblé sur l'accueil : le décalage de mise
en page et le blocage du fil principal.

### Ordre suggéré

1. Jetons OAuth hors de l'URL - seul constat bloquant.
2. `npm audit fix` sans `--force`, puis revérification.
3. Content-Security-Policy sur le front.
4. Décalage de mise en page du hero, puis allègement du JavaScript.
5. Variables d'environnement de production et soumission du sitemap, au
   déploiement.
6. `poweredByHeader`, Permissions-Policy, favicon, contraste du bouton.

### Ce que cet audit ne couvre pas

- **Les performances en conditions réelles** : mesure locale, à refaire sur
  préproduction.
- **La tenue en charge** : elle relève du protocole dédié
  ([05-PROTOCOLES-DE-TESTS.md](05-PROTOCOLES-DE-TESTS.md)), et aucune campagne
  n'a encore été menée sur préproduction.
- **L'utilisabilité** : les scanners mesurent la conformité, pas la
  compréhension. C'est l'objet des tests utilisateurs
  ([06-TESTS-UTILISATEURS.md](06-TESTS-UTILISATEURS.md)).
