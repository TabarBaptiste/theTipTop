# Mesures Lighthouse

Les tests k6 du dossier voisin mesurent ce que le serveur encaisse. Lighthouse
mesure ce que le visiteur perçoit : le temps avant que la page soit lisible,
puis utilisable. Les deux sont nécessaires et ne se remplacent pas — un backend
qui tient 1600 utilisateurs simultanés peut servir une page qui met cinq
secondes à s'afficher.

## Lancer une mesure

Chrome doit être installé ; Lighthouse s'exécute sans installation via `npx`.

```bash
CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe" \
npx --yes lighthouse@12 "https://thetiptop-dev.wk-archi-o24a-4-5-g1.fr/" \
  --output=html --output=json \
  --output-path="tests/performance/lighthouse/resultats/accueil" \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet
```

Le profil **mobile avec bridage réseau simulé** est celui par défaut, et c'est
celui qu'il faut : le parcours de participation se fait depuis un téléphone, en
boutique ou juste après. Un score desktop n'aurait aucun rapport avec l'usage.

Mesurer contre un serveur de développement Next n'a aucune valeur : le code n'y
est ni minifié ni mis en cache. Toujours viser un environnement déployé.

### Trois passes, pas une

La variance est réelle. Sur une même page et une même version, trois passes
consécutives ont donné 67, 71 et 59 en performance, et de 463 à 942 ms de temps
de blocage. **Seul le CLS s'est révélé stable.** Une mesure isolée ne permet de
conclure sur rien d'autre ; prendre la médiane de trois.

## Références

Relevé sur l'accueil, après la refonte, médiane de trois passes. La colonne
« avant » vient de [docs/07-AUDIT-DU-SITE.md](../../../docs/07-AUDIT-DU-SITE.md).

| | Avant | Après |
|---|---|---|
| Performance | 63 | 67 |
| Accessibilité | 97 | **100** |
| Bonnes pratiques | 96 | **100** |
| SEO | 100 | 100 |
| CLS | 0,19 | **0** |
| LCP | 2,7 s | 5,2 s |
| TBT | 720 ms | 854 ms |

Les deux campagnes n'ont pas tourné sous la même version de Lighthouse, et la
dev est hébergée sur un VPS partagé dont le temps de réponse varie — l'écart de
performance, quatre points, tient dans le bruit. Le CLS et les trois scores à
100, eux, sont stables.

## Le LCP n'a pas régressé

La ligne LCP du tableau, 2,7 s puis 5,2 s, se lit comme une régression franche.
Elle n'en est pas une. Vérification faite en construisant les deux versions du
site — avant et après la refonte — et en les mesurant l'une après l'autre sur la
même machine :

| | Avant | Après |
|---|---|---|
| LCP, passe 1 | 2,7 s | 5,0 s |
| LCP, passe 2 | 5,0 s | 4,7 s |
| Élément LCP | le paragraphe d'accroche | la photo du héros |
| Délai de rendu | 4510 ms | 3786 ms |

Deux choses en ressortent.

**La version d'avant produit elle aussi un LCP à 5 s.** Ses deux passes donnent
2,7 s et 5,0 s : tout l'écart du tableau de référence tient dans la variance
d'une seule version. Le 2,7 s de l'audit initial était une passe favorable, pas
un état à retrouver.

**Le délai de rendu, lui, précède la refonte** — il est même un peu plus court
après. Il vaut 3,8 à 4,5 s dans les deux versions et représente à lui seul plus
de 80 % du LCP : la page est reçue vite, elle attend le fil principal pour
s'afficher.

Ce qui a changé, c'est l'identité de l'élément mesuré. Avant, le plus grand bloc
peint était le paragraphe d'accroche du héros ; depuis la refonte c'est la photo.
Une photo doit être téléchargée avant d'être peinte, ce qui ajoute environ 400 ms
que le texte ne payait pas — mais elle est aussi ce que le visiteur vient voir,
et le LCP mesure désormais la bonne chose.

### Ce qui coûte réellement

Relevé du fil principal, identique dans les deux versions :

| | Avant | Après |
|---|---|---|
| Style & mise en page | 1458 ms | 1628 ms |
| Évaluation du script | 1191 ms | 1552 ms |

Le poste le plus lourd n'est pas le JavaScript, c'est le calcul de style et de
mise en page — sur les deux versions. Le paquet livré n'a d'ailleurs presque pas
bougé : 855 Ko avant, 870 Ko après, pour 18 scripts dans les deux cas.

La piste, si l'on veut ce délai plus court : trois des huit sections de
l'accueil sont des composants client qui interrogent l'API à l'hydratation
(compte à rebours, gros lot, lots à gagner). Les rendre côté serveur, ou différer
leur hydratation, viderait le fil principal au moment où le navigateur cherche à
peindre. C'est un chantier en soi, distinct de la refonte.

## Les résultats ne sont pas versionnés

Comme pour k6 : `resultats/` est ignoré par git. Un rapport Lighthouse pèse
près de 800 Ko, ne vaut que pour la version et l'environnement mesurés, et se
régénère en deux minutes. Ce qui mérite d'être conservé, ce sont les chiffres
ci-dessus et leur interprétation, pas le fichier.
