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
          50: '#FDF8F3',
          100: '#F9EDD9',
          200: '#F2E0D0',
          300: '#D4A76A',
          400: '#C8923A',
          500: '#BA6905',
          600: '#A85D04',
          700: '#8B4D03',
          800: '#6E3D02',
          900: '#512D02',
          pale: '#F2E0D0',
          deep: '#BA6905',
          hover: '#C25F1F',
        },
        cream: '#FAF6EF',
        noir: '#1A1A1A',
        moss: {
          DEFAULT: '#5C6B3A',
          light: '#7A8C56',
          50: '#F2F5EC',
          100: '#E0E8D0',
          500: '#5C6B3A',
        },
        'warm-beige': '#E8D5B0',
        gold: {
          50: '#FBF6ED',
          100: '#F5E9D0',
          200: '#EBDBB5',
          300: '#DCCB95',
          400: '#D1B97E',
          500: '#C9A96E',
          600: '#B5955A',
          700: '#9A7D48',
          800: '#7F6638',
          900: '#644F2A',
        },
        stone: {
          DEFAULT: '#8A8378',
          grey: '#8A8378',
        },
        // Backward compat for admin/employee pages
        tea: {
          50: '#FDF8F3',
          100: '#F9EDD9',
          200: '#F2E0D0',
          300: '#D4A76A',
          400: '#C8923A',
          500: '#BA6905',
          600: '#A85D04',
          700: '#8B4D03',
          800: '#6E3D02',
          900: '#512D02',
          950: '#3A2001',
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
