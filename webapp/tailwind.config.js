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
        accent: {
          DEFAULT: 'hsl(var(--accent))',
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
      spacing: {
        '2xs': '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      fontSize: {
        h1: ['clamp(28px, 4vw, 36px)', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '700' }],
        h2: ['clamp(22px, 3vw, 26px)', { lineHeight: '1.3', fontWeight: '600' }],
        // Titres portes a 36px par la maquette : hero, grand prix, « Les lots
        // a gagner », « Tout savoir ». Distinct de h2, qu'elle reserve a
        // « Comment participer ? » et « Pourquoi nous ? », a 26px.
        display: ['clamp(28px, 4vw, 36px)', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '700' }],
        h3: ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['14px', { lineHeight: '1.75', letterSpacing: '0.3px' }],
        ui: ['11px', { lineHeight: '1', letterSpacing: '2px', fontWeight: '700' }],
        caption: ['11px', { lineHeight: '1.5', letterSpacing: '0.3px' }],
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
