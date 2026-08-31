# DESIGN.md - Thé Tip Top
> Système de design pour le site du jeu-concours  
> Basé sur la charte graphique v1.0 · Avril 2026 · Agence Furious Ducks

---

## Esprit de marque

Thé Tip Top est **L'Artisan Méditerranéen**. La marque ne vend pas du thé - elle transmet un geste. Chaque décision visuelle doit refléter :
- L'authenticité (bio depuis l'origine, jamais converti)
- L'artisanat (handmade, gestes visibles, matières organiques)
- La proximité augmentée (chaleureux sans être familier, expert sans être condescendant)
- L'accessibilité premium (l'excellence sans l'intimidation)

**Mots-clés ADN** : rituel · naturalité · traçabilité · artisanat · origine · handmade · sensoriel · méditerranéen · slow living

---

## Couleurs

### Palette primaire

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| Terracotta Profond | `#BA6905` | 186 / 105 / 5 | Couleur signature - identité de marque. **Jamais en aplat sous du texte blanc** : 4.11:1, voir Accessibilité |
| Terracotta Intermédiaire | `#C25F1F` | 194 / 95 / 31 | Hover states boutons |
| Noir Institutionnel | `#1A1A1A` | 26 / 26 / 26 | Texte principal, fonds sombres |
| Blanc Pur | `#FFFFFF` | 255 / 255 / 255 | Fond, respiration visuelle |
| Crème Naturelle | `#FAF6EF` | 250 / 246 / 239 | Fond éditorial, fond de page principal |

### Palette secondaire

| Nom | Hex | Usage |
|-----|-----|-------|
| Vert Mousse | `#5C6B3A` | Nature & bio, badges certification |
| Beige Chaud | `#E8D5B0` | Textures organiques, séparateurs **décoratifs uniquement** |
| Or Discret | `#C9A96E` | Accent premium, highlights |
| Terracotta Pâle | `#F2E0D0` | Fonds de cards, surfaces douces |
| Gris Pierre | `#4A463E` | Texte secondaire, placeholders |

> **Deux valeurs de cette table ont été corrigées après mesure.**
>
> Le Gris Pierre valait `#8A8378`, qui ne donne que **3.48:1** sur le fond crème —
> sous le minimum de 4.5:1 pour du texte. La nuance assombrie garde la chaleur de
> la palette, atteint **8.71:1**, et reste distincte du noir : passer le texte
> secondaire en noir supprimerait la hiérarchie.
>
> Le Beige Chaud ne doit jamais border un champ ni un bouton : voir la section
> Accessibilité.

### Variables CSS

```css
:root {
  /* Primaires */
  --color-terracotta-deep:    #BA6905;
  --color-terracotta-hover:   #C25F1F;
  --color-black:              #1A1A1A;
  --color-white:              #FFFFFF;
  --color-cream:              #FAF6EF;

  /* Secondaires */
  --color-moss-green:         #5C6B3A;
  --color-warm-beige:         #E8D5B0;
  --color-gold:               #C9A96E;
  --color-terracotta-pale:    #F2E0D0;
  --color-stone-grey:         #4A463E;

  /* Sémantiques */
  --color-bg:                 var(--color-cream);
  --color-bg-card:            var(--color-terracotta-pale);
  --color-text-primary:       var(--color-black);
  --color-text-secondary:     var(--color-stone-grey);

  /* Terracotta assombri : le #BA6905 de la palette ne porte que 4.11:1 en
     blanc, sous le seuil. Voir la section Accessibilité. */
  --color-cta:                #A85D04;

  /* Bordure des champs et des contrôles à contour. Le beige chaud n'y suffit
     pas : 1.44:1, quand 3:1 est exigé pour délimiter un composant. */
  --color-border-field:       #9A7D48;
  --color-cta-hover:          var(--color-terracotta-hover);
  --color-accent:             var(--color-gold);
  --color-success:            var(--color-moss-green);
}
```

### Accessibilité (WCAG AA)

Toutes les valeurs ci-dessous ont été **mesurées**, non estimées. Les chiffres
qui figuraient ici auparavant étaient faux : « Terracotta sur Blanc : 18.7:1 »
reprenait la valeur du noir sur blanc, recopiée d'une ligne à l'autre.

#### Deux seuils, à ne pas confondre

| Ce qu'on mesure | Seuil |
|---|---|
| Texte courant (< 18.66 px gras, < 24 px) | **4.5:1** |
| Grand texte (≥ 24 px, ou ≥ 18.66 px en gras) | **3:1** |
| Bordure d'un champ, d'un bouton, d'une case à cocher | **3:1** (WCAG 1.4.11) |

Les libellés de boutons de cette charte font 11 px en gras : ils relèvent du
texte courant, donc de 4.5:1. Un bouton n'est pas « du grand texte ».

#### Combinaisons de référence

| Combinaison | Rapport | Verdict |
|---|---|---|
| Blanc sur Terracotta CTA `#A85D04` | **4.96:1** | ✅ |
| Blanc sur Noir `#1A1A1A` | **17.4:1** | ✅ |
| Noir sur Blanc | **17.4:1** | ✅ |
| Gris Pierre `#4A463E` sur crème | **8.71:1** | ✅ |
| Bordure de champ `#9A7D48` sur blanc | **3.89:1** | ✅ |

#### Combinaisons proscrites

| Combinaison | Rapport | Pourquoi |
|---|---|---|
| Blanc sur Terracotta Profond `#BA6905` | 4.11:1 | Sous 4.5:1. Utiliser `#A85D04` pour tout aplat portant du texte blanc. |
| Gris Pierre historique `#8A8378` sur crème | 3.48:1 | Sous 4.5:1. Remplacé par `#4A463E`. |
| Beige Chaud `#E8D5B0` en bordure de champ | 1.44:1 | Sous 3:1. Le beige ne délimite rien de perceptible sur du blanc. |
| Texte et fond de la même teinte, l'un en opacité réduite | 1.4 à 3.8:1 | Voir Tags et Badges : le procédé comprime mécaniquement le contraste. |

#### Règle de méthode

Un fond semi-transparent doit être **composé avec ce qui se trouve derrière**
avant toute mesure. Un outil qui remonte au premier ancêtre opaque, comme le
fait notre audit Cypress, surestime le contraste d'une pastille posée sur une
teinte : il mesure contre le fond de page au lieu du fond réellement rendu.

---

## Typographie

### Polices

| Rôle | Famille | Import |
|------|---------|--------|
| Éditoriale (titres, citations) | **Playfair Display** | Google Fonts |
| Fonctionnelle (body, UI, nav) | **Montserrat** | Google Fonts |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
```

### Hiérarchie typographique

| Niveau | Police | Graisse | Taille | Letter-spacing | Line-height | Usage |
|--------|--------|---------|--------|---------------|-------------|-------|
| H1 | Playfair Display | 700 | 36px / 2.25rem | −0.5px | 1.2 | Titre principal, hero |
| H2 | Playfair Display | 600 | 26px / 1.625rem | 0 | 1.3 | Sous-titres de section |
| H3 | Playfair Display | 500 Italic | 20px / 1.25rem | 0 | 1.4 | Titres de sections secondaires |
| Citation | Playfair Display | 400 Italic | 16px / 1rem | 0 | 1.6 | Pull quotes, témoignages |
| Nav / Label | Montserrat | 700 | 11px / 0.69rem | +2px | 1 | Navigation, labels UI - UPPERCASE |
| Corps | Montserrat | 400 | 14px / 0.875rem | +0.3px | 1.75 | Texte courant |
| Caption | Montserrat | 400 | 11px / 0.69rem | +0.3px | 1.5 | Légendes, annotations |
| Bouton | Montserrat | 700 | 11px / 0.69rem | +2px | 1 | Texte de bouton - UPPERCASE |

> **Les boutons d'appel à l'action dérogent à la ligne « Bouton ».**
>
> Un libellé de 11 px pour toutes les tailles ne permettait pas de hiérarchiser
> deux actions côte à côte : entre un bouton principal et un bouton secondaire,
> seuls 8 px de hauteur faisaient la différence. La taille du texte suit
> désormais celle du bouton.
>
> | Taille | Hauteur | Texte | Usage |
> |---|---|---|---|
> | `sm` | 36 px | 11 px | Actions denses : tableaux, barres d'outils |
> | `default` | 44 px | 11 px | Cas courant. 44 px est la cible tactile recommandée |
> | `lg` | 56 px | 13 px | Action secondaire d'un écran, CTA de bandeau |
> | `xl` | 64 px | 15 px | Action principale d'un écran — **une seule par vue** |
>
> Ces libellés restent en gras sous 18.66 px : ils relèvent du texte courant et
> donc du seuil de 4.5:1, quelle que soit la taille.

### Variables CSS

```css
:root {
  --font-editorial:  'Playfair Display', Georgia, serif;
  --font-functional: 'Montserrat', system-ui, sans-serif;

  --text-h1:    clamp(28px, 4vw, 36px);
  --text-h2:    clamp(22px, 3vw, 26px);
  --text-h3:    20px;
  --text-body:  14px;
  --text-small: 11px;
  --text-ui:    11px;
}
```

---

## Espacement

Unité de base : **4px**

```css
:root {
  --space-2xs: 4px;
  --space-xs:  8px;
  --space-sm:  12px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

---

## Rayons de bordure

```css
:root {
  --radius-sharp:   2px;   /* Boutons secondaires, tags, labels */
  --radius-soft:    4px;   /* Inputs, cards légères */
  --radius-card:    8px;   /* Cards produits, blocs */
  --radius-pill:    20px;  /* Pills, badges ronds */
  --radius-full:    999px; /* Boutons CTA principaux */
}
```

---

## Composants UI

### Boutons

**CTA Principal** (plein, arrondi complet)
```css
.btn-primary {
  background-color: var(--color-cta);
  color: var(--color-white);
  font-family: var(--font-functional);
  font-size: var(--text-ui);
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.btn-primary:hover  { background-color: var(--color-cta-hover); }
.btn-primary:active { transform: scale(0.98); }
```

**Bouton Outline**
```css
.btn-outline {
  background-color: transparent;
  color: var(--color-terracotta-deep);
  border: 1.5px solid var(--color-terracotta-deep);
  font-family: var(--font-functional);
  font-size: var(--text-ui);
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.btn-outline:hover {
  background-color: var(--color-terracotta-deep);
  color: var(--color-white);
}
```

### Tags

Petit, très arrondi (pill shape), UPPERCASE, pour labels rapides.

**Classe de base**
```css
.tag {
  font-family: var(--font-functional);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid currentColor;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
```

**Règle** : fond = **teinte claire** de la famille, texte = **nuance foncée** de la
même famille. Pas de bordure. Coins en capsule (pill).

> **Cette règle en remplace une autre, qui produisait des tags illisibles.**
>
> La version précédente posait « fond = couleur du texte en opacité réduite ».
> Le procédé comprime mécaniquement le contraste : texte et fond partageant la
> même teinte, seule l'opacité les sépare. Mesuré, aucune des sept variantes
> n'atteignait 4.5:1 — de **3.79:1** pour la meilleure à **1.39:1** pour
> `season`, du beige sur du beige. Le principe visuel est conservé : une
> pastille teintée, discrète. Seul change le sens de l'écart, désormais obtenu
> par la valeur plutôt que par la transparence.

**Variantes**
```css
/* fond = teinte claire, texte = nuance foncée de la même famille */
.tag-bio          { background: #F2F5EC; color: #5C6B3A; } /* mousse   5.26:1 */
.tag-detox        { background: #F2F5EC; color: #5C6B3A; } /* mousse   5.26:1 */
.tag-handmade     { background: #F9EDD9; color: #8B4D03; } /* terracotta 5.74:1 */
.tag-premium      { background: #F5E9D0; color: #644F2A; } /* or       6.48:1 */
.tag-neutral      { background: #FAF6EF; color: #4A463E; } /* pierre   8.71:1 */
.tag-mediteraneen { background: #F9EDD9; color: #8B4D03; } /* terracotta 5.74:1 */
.tag-season       { background: #F5E9D0; color: #644F2A; } /* or       6.48:1 */
```

| Variante | Texte | Fond | Rapport | Exemple |
|----------|-------|------|---------|---------|
| `bio` | `#5C6B3A` | `#F2F5EC` | 5.26:1 | 100% BIO |
| `detox` | `#5C6B3A` | `#F2F5EC` | 5.26:1 | DÉTOX |
| `handmade` / `new` | `#8B4D03` | `#F9EDD9` | 5.74:1 | HANDMADE |
| `premium` | `#644F2A` | `#F5E9D0` | 6.48:1 | PREMIUM |
| `neutral` | `#4A463E` | `#FAF6EF` | 8.71:1 | NOUVEAU |
| `mediteraneen` | `#8B4D03` | `#F9EDD9` | 5.74:1 | MÉDITERRANÉEN |
| `season` | `#644F2A` | `#F5E9D0` | 6.48:1 | SAISON |

`bio` et `detox` partagent désormais leurs couleurs, de même que `mediteraneen`
et `handmade` : seule l'opacité les distinguait, et c'est précisément ce qui
faisait échouer le contraste. Si la distinction visuelle importe, elle doit
passer par une icône ou un libellé, pas par une nuance de transparence.

---

### Badges

Plus gros, rectangulaire avec coins arrondis, avec icônes optionnelles.

**Classe de base**
```css
.badge {
  font-family: var(--font-functional);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 10px 16px;
  border-radius: var(--radius-soft);
  border: 1.5px solid currentColor;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  background-color: var(--color-white);
}
```

**Règle** : fond = **teinte claire** de la famille, texte et bordure = **nuance
foncée** de la même famille. Coins légèrement arrondis (soft 4px).

> Même correction que pour les tags, et pour la même raison. Les quatre
> variantes plafonnaient entre **1.66:1** et **3.23:1**. La bordure, elle, doit
> en outre se détacher du fond de page à 3:1 au titre de WCAG 1.4.11 — ce
> qu'une bordure de la couleur du texte satisfait sans difficulté dès lors que
> le texte est assez foncé.

**Variantes**
```css
/* fond = teinte claire ; texte et bordure = nuance foncée */
.badge-bio       { border: 1.5px solid #5C6B3A; background: #F2F5EC; color: #5C6B3A; }
.badge-handmade  { border: 1.5px solid #8B4D03; background: #F9EDD9; color: #8B4D03; }
.badge-location  { border: 1.5px solid #644F2A; background: #F5E9D0; color: #644F2A; }
.badge-certified { border: 1.5px solid #8B4D03; background: #F9EDD9; color: #8B4D03; }
```

| Variante | Texte et bordure | Fond | Texte / fond | Bordure / page | Exemple |
|----------|------------------|------|--------------|----------------|---------|
| `bio` | `#5C6B3A` | `#F2F5EC` | 5.26:1 | 5.80:1 | 100% BIO |
| `handmade` | `#8B4D03` | `#F9EDD9` | 5.74:1 | 6.64:1 | HANDMADE |
| `location` | `#644F2A` | `#F5E9D0` | 6.48:1 | 7.80:1 | NICE · 10E BOUTIQUE |
| `certified` | `#8B4D03` | `#F9EDD9` | 5.74:1 | 6.64:1 | ORIGINE CERTIFIÉE |

---

**Différences clés**
| | Tags | Badges |
|---|---|---|
| Taille | 10px | 12px |
| Padding | 4px / 10px | 10px / 16px |
| Border-radius | pill (999px) | soft (4px) |
| Icônes | Non | Oui (optionnelles) |
| Usage | Petites étiquettes rapides | Blocs d'information |

### Cards produit (lots à gagner)

Grille **3 colonnes** sur desktop. **Pas de bordure ni de fond de card** : tout est posé
directement sur le fond de page. Seule l'**image** porte un radius (sur ses 4 coins) ; le
reste n'est que de la typographie. La catégorie est un **label terracotta nu**, jamais un tag à fond.

**Structure HTML de référence** (ordre impératif : image → catégorie → titre → footer)
```html
<article class="card">
  <div class="card-image">
    <img src="..." alt="..." />
  </div>
  <p class="card-category">Thé Signature</p>
  <h3 class="card-title">Boîte 100g Thé Oolong</h3>
  <div class="card-footer">
    <span class="card-value">Valeur 39€</span>
    <span class="card-odds">1 chance sur 3</span>
  </div>
</article>
```

**CSS**
```css
/* Card sans bordure ni fond - pose directe sur le fond de page */
.card {
  display: flex;
  flex-direction: column;
}

/* Image : radius sur les 4 coins, ratio fixe, léger zoom au survol */
.card-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-card);
  overflow: hidden;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.card:hover .card-image img { transform: scale(1.04); }

/* Catégorie : label terracotta UPPERCASE, SANS background ni bordure */
.card-category {
  font-family: var(--font-functional);
  font-size: var(--text-ui);          /* 11px */
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-terracotta-deep);
  margin: var(--space-md) 0 0;
}

/* Titre en italique éditorial */
.card-title {
  font-family: var(--font-editorial);
  font-size: var(--text-h3);
  font-style: italic;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: var(--space-2xs) 0 0;
}

/* Footer : valeur (gauche) + pourcentage (droite), séparés par un filet */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-warm-beige);
}
.card-value {
  font-family: var(--font-functional);
  font-size: var(--text-small);
  color: var(--color-text-secondary);
}
.card-odds {
  font-family: var(--font-functional);
  font-size: var(--text-small);
  font-weight: 600;
  color: var(--color-terracotta-deep);
}
```

**Catégorie de lot** - simple label terracotta en capitales. Le libellé varie, la couleur
reste terracotta deep. Jamais de fond, jamais de bordure, jamais un tag.

| `category` | Libellé affiché | Cas d'usage |
|-----------|-----------------|-------------|
| `signature` | THÉ SIGNATURE | Thés signature |
| `accessoire` | ACCESSOIRE | Infuseurs, théières, tasses |
| `grandprix` | GRAND PRIX | Week-end, grand lot |

**Règles**
- Pas de bordure ni de fond de card. Seule l'image a un radius (ses 4 coins).
- Catégorie = texte terracotta UPPERCASE sans background. Jamais de pill ici.
- Pourcentage (`card-odds`) en bas à **droite** du footer, en vis-à-vis de la valeur.
  Jamais dans la catégorie, jamais au-dessus du titre.

**Composant React**
`PrizeCard` dans `components/ui/card.tsx` - props : `image`, `imageAlt`, `category`, `title`, `value`, `odds`.

### Formulaire (jeu-concours)

```css
/* La bordure porte var(--color-border-field), pas le beige chaud : celui-ci
   ne donne que 1.44:1 sur du blanc, quand WCAG 1.4.11 exige 3:1 pour
   délimiter un champ. Le beige reste réservé aux séparateurs décoratifs, que
   ce critère ne vise pas. */
.form-input {
  font-family: var(--font-functional);
  font-size: var(--text-body);
  color: var(--color-text-primary);
  background-color: var(--color-white);
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--radius-soft);
  padding: var(--space-sm) var(--space-md);
  width: 100%;
  transition: border-color 0.2s ease;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-terracotta-deep);
}
.form-label {
  font-family: var(--font-functional);
  font-size: var(--text-small);
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-xs);
}
```

### Loaders & états de chargement

**Règle** : jamais de spinner pour un contenu en cours de chargement (page, liste, carte). Utiliser un **skeleton loader** qui reproduit la structure réelle du contenu final (mêmes dimensions, mêmes radius).

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-10 w-full" />   {/* ex: placeholder d'un input */}
<Skeleton className="h-8 w-64" />      {/* ex: placeholder d'un titre */}
```

```css
/* components/ui/skeleton.tsx */
.skeleton {
  animation: pulse 2s ease-in-out infinite;
  border-radius: var(--radius-soft);
  background-color: var(--color-warm-beige);
  opacity: 0.5;
}
```

**Exception** : le spinner (`Loader2` de Lucide, `animate-spin`) reste autorisé uniquement pour le **feedback d'une action déjà déclenchée** par l'utilisateur (clic sur un bouton "Envoyer", "Supprimer", etc.), jamais pour un chargement de page ou de données au montage d'un composant.

| ✅ Do | ❌ Don't |
|-------|---------|
| Skeleton aux dimensions du contenu final pendant un chargement de page/données | Spinner plein écran ou centré pour un chargement de contenu |
| Spinner inline dans un bouton pendant le traitement d'une action cliquée | Spinner comme seul retour visuel d'un chargement de liste/formulaire |

---

## Iconographie

- Style : **linéaire épuré** - stroke 1.5 à 2px, arrondis doux
- Jamais d'icônes remplies (sauf badge d'exception)
- Couleur sur fond clair : `var(--color-terracotta-deep)`
- Couleur sur fond sombre : `var(--color-white)`
- Icônes recommandées : Lucide Icons (stroke natif, cohérent avec le style)
- Thèmes iconographiques : feuille, théière, tasse, bio certifié, boutique, Méditerranée

---

## Motifs décoratifs

Feuilles dorées, cercles dorés, soleil rayonnant, vagues naturelles.  
Toujours utilisés en **opacité réduite (10–25%)** pour ne pas concurrencer le contenu.

```css
.pattern-overlay {
  opacity: 0.12;
  pointer-events: none;
  position: absolute;
  inset: 0;
}
```

Usage : fonds de sections, headers de page, bandes graphiques.

---

## Layout & Grille

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* Grille 12 colonnes */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Breakpoints */
/* Mobile first */
/* sm  : 640px  */
/* md  : 768px  */
/* lg  : 1024px */
/* xl  : 1200px */
```

Patterns de layout typiques :
- **Header / Footer** : 12 colonnes pleine largeur
- **Hero + contenu** : 8 col contenu + 4 col sidebar
- **Grille de cards** : 3 × 4 colonnes (desktop), 2 × 6 (tablet), 1 × 12 (mobile)

---

## Voix de marque (guide pour les textes générés)

### À faire
- Expert mais accessible, jamais condescendant
- Précis et factuel : ingrédients, origines, certifications
- Sensoriel : arômes, textures, gestes artisanaux
- Chaleureux sans être familier
- Bénéfices concrets et vérifiables
- Tutoiement respectueux sur les réseaux

### À ne pas faire
- Superlatifs vagues : "le meilleur", "révolutionnaire"
- Promesses médicales non documentées
- Greenwashing : "écoresponsable" sans preuve
- Ton corporate froid ou institutionnel
- Urgence artificielle et FOMO non éthique

### Lexique privilégié
`rituel` · `naturalité` · `traçabilité` · `artisanat` · `origine` · `bio certifié` · `handmade` · `sensoriel` · `équilibre` · `engagement` · `premium` · `certifié` · `méditerranéen` · `slow living`

---

## Direction artistique (photos & visuels)

### Principes
- Lumière naturelle - lumière méditerranéenne, heure dorée. Jamais de flash dur.
- Plans rapprochés - textures, feuilles en vrac, vapeur, gestes de l'artisan.
- Tons chauds naturels - palette terracotta, beige, vert mousse. Pas de saturation excessive.
- Mains authentiques - sans bijou ostentatoire, retouche minimale.
- Matières organiques - lin, terre, bois, céramique non glacée.

### À proscrire
- Filtres Instagram artificiels ou surexposition numérique
- Stock photos génériques sans lien avec la marque
- Fond blanc studio (réservé au e-commerce uniquement)
- Mise en scène trop parfaite qui trahit l'authenticité

---

## Réseaux sociaux - specs techniques

| Réseau | Format | Dimensions | Notes |
|--------|--------|-----------|-------|
| Instagram | Post carré | 1080 × 1080 px | Zone safe 250px haut/bas |
| Instagram | Story / Réel | 1080 × 1920 px | - |
| Instagram | Portrait | 1080 × 1350 px | - |
| TikTok | Vidéo verticale | 1080 × 1920 px | Hook décisif dans les 3 premières secondes |
| Pinterest | Épingle standard | 1000 × 1500 px | SEO intégré obligatoire |
| Pinterest | Infographie | 1080 × 3000 px | - |

---

## Do's & Don'ts résumés

| ✅ Do | ❌ Don't |
|-------|---------|
| Fond crème (`#FAF6EF`) comme base | Fond blanc froid `#FFFFFF` comme fond principal |
| Playfair Display pour les titres | Arial, Inter, Roboto |
| Terracotta pour les CTA | Boutons bleus ou verts génériques |
| Icônes linéaires stroke 1.5–2px | Icônes remplies / flat style |
| Motifs en opacité 10–25% | Motifs décoratifs opaques concurrençant le contenu |
| Radius 999px sur les CTA principaux | Boutons carrés ou trop anguleux |
| Tutoiement chaleureux dans les UI | Formules corporate froides |
| Contrastes WCAG AA vérifiés | Texte gris sur fond crème sans vérification |
| Bordure de champ à 3:1 du fond | Bordure beige, invisible sur du blanc |
| Pastille : fond clair, texte foncé | Fond et texte de la même teinte, séparés par l'opacité |

---

*Thé Tip Top · L'Artisan Méditerranéen · Nice, 2026*  
*Charte graphique v1.0 - Agence Furious Ducks*
