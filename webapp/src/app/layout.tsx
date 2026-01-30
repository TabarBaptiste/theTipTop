import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Thé Tip Top - Jeu Concours',
    template: '%s | Thé Tip Top',
  },
  description:
    'Participez au grand jeu-concours Thé Tip Top ! 100% des tickets sont gagnants. Tentez de remporter un an de thé gratuit !',
  keywords: ['thé', 'jeu concours', 'loterie', 'bio', 'fait main', 'Nice'],
  authors: [{ name: 'Thé Tip Top' }],
  creator: 'Thé Tip Top',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://thetiptop.dsp5-archi-o23-15m-g5.fr',
    siteName: 'Thé Tip Top',
    title: 'Thé Tip Top - Jeu Concours',
    description:
      'Participez au grand jeu-concours Thé Tip Top ! 100% des tickets sont gagnants.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Thé Tip Top Jeu Concours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thé Tip Top - Jeu Concours',
    description:
      'Participez au grand jeu-concours Thé Tip Top ! 100% des tickets sont gagnants.',
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
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
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
