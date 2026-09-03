/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        xl: '1200px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // Terracotta du texte et des liens, distinct du remplissage des
        // boutons : en theme sombre l'un doit s'eclaircir pour rester lisible
        // sur le fond, quand l'autre doit rester sombre pour porter du blanc.
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // DESIGN.md brand colors
        terracotta: {
          '50': 'rgb(var(--c-terracotta-50) / <alpha-value>)',
          '100': 'rgb(var(--c-terracotta-100) / <alpha-value>)',
          '200': 'rgb(var(--c-terracotta-200) / <alpha-value>)',
          '300': 'rgb(var(--c-terracotta-300) / <alpha-value>)',
          '400': 'rgb(var(--c-terracotta-400) / <alpha-value>)',
          '500': 'rgb(var(--c-terracotta-500) / <alpha-value>)',
          '600': 'rgb(var(--c-terracotta-600) / <alpha-value>)',
          '700': 'rgb(var(--c-terracotta-700) / <alpha-value>)',
          '800': 'rgb(var(--c-terracotta-800) / <alpha-value>)',
          '900': 'rgb(var(--c-terracotta-900) / <alpha-value>)',
          'pale': 'rgb(var(--c-terracotta-pale) / <alpha-value>)',
          'deep': 'rgb(var(--c-terracotta-deep) / <alpha-value>)',
          'hover': 'rgb(var(--c-terracotta-hover) / <alpha-value>)',
          'warm': 'rgb(var(--c-terracotta-warm) / <alpha-value>)',  // Méditerranéen - variante chaude entre deep et hover
        },
        // Texte principal, et surface claire des cartes et sections. Ils
        // valaient noir et blanc, deux roles que le theme sombre separe : le
        // texte s'eclaircit, la surface s'assombrit.
        'ink': 'rgb(var(--c-ink) / <alpha-value>)',
        // Surtitre du carrousel des lots, pose sur des fonds teintes qui
        // s'inversent avec le theme.
        'lot-accent': 'rgb(var(--c-lot-accent) / <alpha-value>)',
        'surface': 'rgb(var(--c-surface) / <alpha-value>)',
        'cream': 'rgb(var(--c-cream) / <alpha-value>)',
        'noir': 'rgb(var(--c-noir) / <alpha-value>)',
        moss: {
          DEFAULT: 'rgb(var(--c-moss) / <alpha-value>)',
          'light': 'rgb(var(--c-moss-light) / <alpha-value>)',
          '50': 'rgb(var(--c-moss-50) / <alpha-value>)',
          '100': 'rgb(var(--c-moss-100) / <alpha-value>)',
          '500': 'rgb(var(--c-moss-500) / <alpha-value>)',
          // Bout sombre de la gamme, pour du texte pose sur les deux teintes
          // claires ci-dessus. Le 500 n'y donne que 4,02:1, sous le minimum AA.
          // Celui-ci atteint 6,5:1. Pendant du gold-900, qui joue le meme role.
          '900': 'rgb(var(--c-moss-900) / <alpha-value>)',
          // Le panneau du grand prix, seule grande surface verte du site. Le
          // vert par defaut sert surtout de texte et d'icone : il s'eclaircit
          // en theme sombre, ce panneau doit au contraire s'assombrir.
          'panel': 'rgb(var(--c-moss-panel) / <alpha-value>)',
        },
        'warm-beige': 'rgb(var(--c-warm-beige) / <alpha-value>)',
        // Filet gris des separations de section sur la maquette : sous les
        // titres « Comment participer ? » et « Pourquoi nous ? », et entre les
        // sections. Le beige chaud y etait trop present.
        'section-line': 'rgb(var(--c-section-line) / <alpha-value>)',
        gold: {
          '50': 'rgb(var(--c-gold-50) / <alpha-value>)',
          '100': 'rgb(var(--c-gold-100) / <alpha-value>)',
          '200': 'rgb(var(--c-gold-200) / <alpha-value>)',
          '300': 'rgb(var(--c-gold-300) / <alpha-value>)',
          '400': 'rgb(var(--c-gold-400) / <alpha-value>)',
          '500': 'rgb(var(--c-gold-500) / <alpha-value>)',
          '600': 'rgb(var(--c-gold-600) / <alpha-value>)',
          '700': 'rgb(var(--c-gold-700) / <alpha-value>)',
          '800': 'rgb(var(--c-gold-800) / <alpha-value>)',
          '900': 'rgb(var(--c-gold-900) / <alpha-value>)',
        },
        // Texte secondaire. L'ancienne valeur #8A8378 ne donnait que 3.48:1 sur
        // le creme, sous le minimum WCAG AA de 4.5:1. Cette nuance assombrie
        // garde la chaleur de la palette, atteint 8.71:1, et reste distincte du
        // noir #1A1A1A : passer le secondaire en noir supprimerait la hierarchie.
        stone: {
          DEFAULT: 'rgb(var(--c-stone) / <alpha-value>)',
          'grey': 'rgb(var(--c-stone-grey) / <alpha-value>)',
        },
        // Backward compat for admin/employee pages
        tea: {
          '50': 'rgb(var(--c-tea-50) / <alpha-value>)',
          '100': 'rgb(var(--c-tea-100) / <alpha-value>)',
          '200': 'rgb(var(--c-tea-200) / <alpha-value>)',
          '300': 'rgb(var(--c-tea-300) / <alpha-value>)',
          '400': 'rgb(var(--c-tea-400) / <alpha-value>)',
          '500': 'rgb(var(--c-tea-500) / <alpha-value>)',
          '600': 'rgb(var(--c-tea-600) / <alpha-value>)',
          '700': 'rgb(var(--c-tea-700) / <alpha-value>)',
          '800': 'rgb(var(--c-tea-800) / <alpha-value>)',
          '900': 'rgb(var(--c-tea-900) / <alpha-value>)',
          '950': 'rgb(var(--c-tea-950) / <alpha-value>)',
        },
      },
      borderRadius: {
        sharp: '2px',
        soft: '4px',
        card: '8px',
        pill: '20px',
        full: '999px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        editorial: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        functional: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      // En rem et non en pixels : le reglage d'agrandissement du module
      // d'accessibilite agit sur la taille de base du document, et un
      // espacement fige en pixels laisserait le texte grandir dans des
      // conteneurs qui ne bougent pas.
      spacing: {
        '2xs': '0.25rem',
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      fontSize: {
        h1: ['clamp(1.75rem, 4vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.03125rem', fontWeight: '700' }],
        h2: ['clamp(1.375rem, 3vw, 1.625rem)', { lineHeight: '1.3', fontWeight: '600' }],
        // Titres portes a 2.25rem par la maquette : hero, grand prix, « Les lots
        // a gagner », « Tout savoir ». Distinct de h2, qu'elle reserve a
        // « Comment participer ? » et « Pourquoi nous ? », a 1.625rem.
        display: ['clamp(1.75rem, 4vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.03125rem', fontWeight: '700' }],
        h3: ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['0.875rem', { lineHeight: '1.75', letterSpacing: '0.01875rem' }],
        ui: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.125rem', fontWeight: '700' }],
        caption: ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.01875rem' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
