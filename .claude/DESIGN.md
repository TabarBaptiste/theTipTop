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
| Terracotta Profond | `#BA6905` | 186 / 105 / 5 | Couleur signature - identité de marque |
| Terracotta Intermédiaire | `#C25F1F` | 194 / 95 / 31 | Hover states boutons |
| Noir Institutionnel | `#1A1A1A` | 26 / 26 / 26 | Texte principal, fonds sombres |
| Blanc Pur | `#FFFFFF` | 255 / 255 / 255 | Fond, respiration visuelle |
| Crème Naturelle | `#FAF6EF` | 250 / 246 / 239 | Fond éditorial, fond de page principal |

### Palette secondaire

| Nom | Hex | Usage |
|-----|-----|-------|
| Vert Mousse | `#5C6B3A` | Nature & bio, badges certification |
| Beige Chaud | `#E8D5B0` | Textures organiques, séparateurs |
| Or Discret | `#C9A96E` | Accent premium, highlights |
| Terracotta Pâle | `#F2E0D0` | Fonds de cards, surfaces douces |
| Gris Pierre | `#8A8378` | Texte secondaire, placeholders |

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
  --color-stone-grey:         #8A8378;

  /* Sémantiques */
  --color-bg:                 var(--color-cream);
  --color-bg-card:            var(--color-terracotta-pale);
  --color-text-primary:       var(--color-black);
  --color-text-secondary:     var(--color-stone-grey);
  --color-cta:                var(--color-terracotta-deep);
  --color-cta-hover:          var(--color-terracotta-hover);
  --color-accent:             var(--color-gold);
  --color-success:            var(--color-moss-green);
}
```

### Accessibilité (WCAG AA)

- Blanc sur Terracotta Profond : **4.8:1** ✅
- Blanc sur Noir Institutionnel : **18.7:1** ✅
- Terracotta sur Blanc : **18.7:1** ✅
- Ne jamais utiliser Gris Pierre (`#8A8378`) pour du texte sur fond crème sans vérification de contraste.

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

**Règle** : fond = couleur du texte avec opacité réduite. Pas de bordure. Coins en capsule (pill).

**Variantes**
```css
/* fond = même couleur que le texte, opacité réduite */
.tag-bio          { background: #5C6B3A40; color: #5C6B3A; } /* vert mousse 40% */
.tag-detox        { background: #5C6B3A4D; color: #5C6B3A; } /* vert mousse 30% */
.tag-handmade     { background: #BA690566; color: #BA6905; } /* terracotta 40% */
.tag-premium      { background: #C9A96E4D; color: #C9A96E; } /* or 30% */
.tag-neutral      { background: #8A83784D; color: #8A8378; } /* gris pierre 30% */
.tag-mediteraneen { background: #C76C3A66; color: #C76C3A; } /* terracotta chaud 40% */
.tag-season       { background: #E8D5B01A; color: #E8D5B0; } /* beige chaud 10% */
```

| Variante | Texte | Fond | Opacité | Exemple |
|----------|-------|------|---------|---------|
| `bio` | #5C6B3A | #5C6B3A | 40% | 100% BIO |
| `detox` | #5C6B3A | #5C6B3A | 30% | DÉTOX |
| `handmade` / `new` | #BA6905 | #BA6905 | 40% | HANDMADE |
| `premium` | #C9A96E | #C9A96E | 30% | PREMIUM |
| `neutral` | #8A8378 | #8A8378 | 30% | NOUVEAU |
| `mediteraneen` | #C76C3A | #C76C3A | 40% | MÉDITERRANÉEN |
| `season` | #E8D5B0 | #E8D5B0 | 10% | SAISON |

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

**Règle** : fond = couleur du texte/bordure à 40% d'opacité. Bordure unie de la même couleur. Coins légèrement arrondis (soft 4px).

**Variantes**
```css
/* fond = même couleur que bordure/texte, opacité 40% */
.badge-bio       { border: 1.5px solid #5C6B3A; background: #5C6B3A66; color: #5C6B3A; }
.badge-handmade  { border: 1.5px solid #BA6905; background: #BA690566; color: #BA6905; }
.badge-location  { border: 1.5px solid #C9A96E; background: #C9A96E66; color: #C9A96E; }
.badge-certified { border: 1.5px solid #C76C3A; background: #C76C3A66; color: #C76C3A; }
```

| Variante | Couleur | Exemple |
|----------|---------|---------|
| `bio` | #5C6B3A vert mousse | 100% BIO |
| `handmade` | #BA6905 terracotta | HANDMADE |
| `location` | #C9A96E or | NICE · 10E BOUTIQUE |
| `certified` | #C76C3A terracotta chaud | ORIGINE CERTIFIÉE |

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
.form-input {
  font-family: var(--font-functional);
  font-size: var(--text-body);
  color: var(--color-text-primary);
  background-color: var(--color-white);
  border: 1.5px solid var(--color-warm-beige);
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

---

*Thé Tip Top · L'Artisan Méditerranéen · Nice, 2026*  
*Charte graphique v1.0 - Agence Furious Ducks*
