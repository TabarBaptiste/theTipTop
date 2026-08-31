import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CookieConsentBanner } from '@/components/layout/cookie-consent-banner';
import { ConditionalAnalytics } from '@/components/layout/conditional-analytics';
import { StructuredData } from '@/components/seo/structured-data';
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from '@/lib/organization-schema';

// 'optional' et non 'swap' : la substitution de Montserrat, qui porte tout le
// texte courant, reflue les paragraphes et pousse le bloc de boutons du hero.
// Elle comptait a elle seule pour 0,188 du CLS de 0,19 mesure sur l'accueil.
//
// Avec 'optional', la police n'est utilisee que si elle arrive a temps ; sinon
// le rendu reste sur la police de repli, dont next/font ajuste deja les
// metriques. Elle est prechargee et mise en cache des la premiere visite, donc
// le cas de repli reste marginal.
//
// Playfair garde 'swap' : elle porte les titres, son decalage mesure est
// negligeable (0,0015), et c'est elle qui porte l'identite de la marque.
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
  display: 'optional',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://dsp5-archi-o24a-4-5-g1.fr'
  ),
  title: {
    // Le mot-clé ouvre le titre, la marque le referme : « Thé Tip Top » ne se
    // cherche pas encore, « jeu-concours thé » oui. Le CDC impose d'ailleurs le
    // mot-clé principal en début de balise.
    //
    // Ce libellé est celui de la page d'accueil : `default` s'applique aux
    // pages qui ne déclarent pas de titre, et toutes les autres en ont un.
    default: 'Jeu-concours thé bio : 100 % de tickets gagnants | Thé Tip Top',
    template: '%s | Thé Tip Top',
  },
  // Canonique de l'accueil. Les pages qui en ont une la remplacent ; celles
  // qui n'en déclarent pas héritent de celle-ci, ce qui est exact puisque
  // seules les pages publiques sont indexables.
  alternates: { canonical: '/' },
  description:
    'Participez au jeu-concours Thé Tip Top : 100 % des tickets sont gagnants. Infuseurs, thés détox, coffrets premium et un an de thé à gagner au tirage au sort.',
  keywords: ['thé', 'jeu concours', 'bio', 'fait main', 'Nice', 'artisanal', 'méditerranéen'],
  authors: [{ name: 'Thé Tip Top' }],
  creator: 'Thé Tip Top',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://dsp5-archi-o24a-4-5-g1.fr',
    siteName: 'Thé Tip Top',
    title: 'Jeu-concours thé bio : 100 % de tickets gagnants',
    description:
      'Participez au jeu-concours Thé Tip Top : 100 % des tickets sont gagnants. Un an de thé à gagner au tirage au sort.',
    images: [
      {
        url: '/og-image.png', // Sera résolu automatiquement en https://dsp5-archi-o24a-4-5-g1.fr/og-image.png
        width: 1200,
        height: 630,
        alt: 'Thé Tip Top Jeu Concours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jeu-concours thé bio : 100 % de tickets gagnants',
    description:
      'Participez au jeu-concours Thé Tip Top : 100 % des tickets sont gagnants. Un an de thé à gagner au tirage au sort.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  // Preuve de propriété pour Google Search Console, sans laquelle le plan du
  // site ne peut être soumis et les objectifs de trafic du CDC ne sont
  // mesurables par rien.
  //
  // La vérification par Google Analytics, plus simple en apparence puisque GA
  // est déjà installé, ne fonctionnerait pas ici : la balise GA ne se charge
  // qu'après consentement aux cookies, et le robot de vérification n'en donne
  // aucun. Il ne la verrait jamais.
  //
  // Le code vient de l'environnement : il est propre à une propriété et n'a
  // pas à vivre dans le dépôt. Absent, aucune balise n'est émise.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${montserrat.variable} ${playfair.variable} font-sans antialiased`}>
        {/* Identité de l'éditeur, présente sur toutes les pages : c'est ce qui
            permet aux moteurs de rattacher le site à l'entreprise plutôt que de
            le traiter comme une page isolée. */}
        <StructuredData data={ORGANIZATION_SCHEMA} />
        <StructuredData data={WEBSITE_SCHEMA} />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  'flex items-center gap-sm w-full rounded-soft border border-warm-beige bg-cream px-md py-sm font-sans text-body text-noir shadow-lg',
                title: 'font-semibold',
                description: 'text-stone',
                success: 'border-moss text-moss',
                error: 'border-terracotta-warm text-terracotta-warm',
                warning: 'border-gold-600 text-gold-600',
                info: 'border-terracotta-500 text-terracotta-500',
                // terracotta-600 et non 500 : sur fond 500, le texte blanc
                // plafonne a 4,11:1, sous le minimum de 4,5:1 exige par WCAG AA
                // pour du texte normal. C'est aussi la teinte du systeme de
                // boutons, ce bouton n'avait pas de raison d'en differer.
                actionButton:
                  'rounded-full bg-terracotta-600 px-sm py-2xs text-ui font-bold uppercase tracking-widest text-white',
                cancelButton: 'rounded-full bg-warm-beige px-sm py-2xs text-ui font-bold uppercase tracking-widest text-noir',
                closeButton: 'border-warm-beige text-stone',
              },
            }}
          />
          <CookieConsentBanner />
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <ConditionalAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
