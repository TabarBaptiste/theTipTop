import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'The Tip Top - Jeu Concours',
    template: '%s | The Tip Top',
  },
  description:
    'Participez au grand jeu-concours The Tip Top ! 100% des tickets sont gagnants. Tentez de remporter un an de the gratuit !',
  keywords: ['the', 'jeu concours', 'bio', 'fait main', 'Nice', 'artisanal', 'mediterraneen'],
  authors: [{ name: 'The Tip Top' }],
  creator: 'The Tip Top',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://thetiptop.dsp5-archi-o23-15m-g5.fr',
    siteName: 'The Tip Top',
    title: 'The Tip Top - Jeu Concours',
    description:
      'Participez au grand jeu-concours The Tip Top ! 100% des tickets sont gagnants.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Tip Top Jeu Concours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Tip Top - Jeu Concours',
    description:
      'Participez au grand jeu-concours The Tip Top ! 100% des tickets sont gagnants.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
