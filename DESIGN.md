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
| Terracotta Lumineux | `#C76C3A` | 199 / 108 / 58 | Accents, CTA, hover states |
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
  --color-terracotta-bright:  #C76C3A;
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
  --color-cta:                var(--color-terracotta-bright);
  --color-cta-hover:          var(--color-terracotta-deep);
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

### Tags & Badges

Style linéaire épuré, UPPERCASE, letter-spacing généreux.
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
}
.tag-bio     { color: var(--color-moss-green); border-color: var(--color-moss-green); }
.tag-premium { color: var(--color-gold);       border-color: var(--color-gold); }
.tag-new     { background: var(--color-terracotta-deep); color: var(--color-white); border: none; }
```

### Cards produit

```css
.card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  border: 1px solid var(--color-warm-beige);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.card:hover {
  box-shadow: 0 8px 24px rgba(186, 105, 5, 0.12);
  transform: translateY(-2px);
}
```

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
  border-color: var(--color-terracotta-bright);
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
