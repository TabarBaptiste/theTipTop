'use client';

import Link from 'next/link';
import { Mail, Instagram, Facebook, Youtube, Linkedin, Music2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SOCIAL_LINKS } from '@/lib/social-links';
import { api } from '@/lib/api';

/** Adresse officielle d'un reseau, par son nom. */
const lienSocial = (nom: string) => SOCIAL_LINKS.find((r) => r.nom === nom)!.url;

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/newsletter', { email });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } catch (error) {
      // Le refus vient de la validation de l'adresse dans l'immense majorité
      // des cas ; le reste est une panne, sur laquelle l'utilisateur ne peut
      // rien. On distingue les deux plutôt que d'afficher « erreur ».
      const status = (error as { response?: { status?: number } })?.response?.status;
      toast.error(
        status === 400
          ? "Cette adresse e-mail n'est pas valide"
          : "L'inscription a échoué, réessayez dans un instant",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-noir text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Marque */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-xl font-bold text-white">
                Thé Tip Top
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/70">
              Thé bio et fait main depuis 10 ans. Découvrez nos créations uniques
              dans notre boutique de Nice.
            </p>
            <div className="space-y-2">
              <Link
                href="/#why-us"
                className="block text-sm text-white/70 transition-colors hover:text-terracotta-300"
              >
                À propos
              </Link>
              <a
                href="mailto:contact@thetiptop.fr"
                className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-terracotta-300"
              >
                <Mail className="h-4 w-4 shrink-0 text-terracotta-300" strokeWidth={1.5} />
                Contact
              </a>
            </div>
          </div>

          {/* Jeu Concours */}
          <div>
            <h2 className="font-functional text-ui uppercase tracking-[2px] text-white">
              Jeu Concours
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Comment participer
                </Link>
              </li>
              <li>
                <Link
                  href="/#prizes"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Les lots à gagner
                </Link>
              </li>
              <li>
                <Link
                  href="/reglement"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Règlement du jeu
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  S&apos;inscrire
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h2 className="font-functional text-ui uppercase tracking-[2px] text-white">
              Légal
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/cgu"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  CGU
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/gestion-cookies"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Gestion des cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/plan-du-site"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Plan du site
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="font-functional text-ui uppercase tracking-[2px] text-white">
              Newsletter
            </h2>
            <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-3">
              <div className="flex gap-2">
                {/* Étiquette réelle plutôt que le seul placeholder : celui-ci
                    disparaît à la saisie et n'est pas annoncé de façon fiable
                    par les lecteurs d'écran (critères 3.3.2 et 4.1.2). Elle est
                    masquée visuellement, la maquette ne prévoyant pas de
                    libellé au-dessus du champ. */}
                <label htmlFor="newsletter-email" className="sr-only">
                  Votre adresse e-mail
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 flex-1 rounded-soft border border-white/40 bg-white/5 px-3 text-sm text-white placeholder:text-white/50 focus:border-terracotta-300 focus:outline-none focus:ring-1 focus:ring-terracotta-300"
                  required
                />
                {/* Beige au repos, orange au clic (cf. charte). Texte sombre :
                    le blanc ne passe pas le contraste sur le beige. */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSubmitting}
                  className="shrink-0 bg-warm-beige text-noir hover:bg-warm-beige/90 active:bg-terracotta-600 active:text-white"
                  aria-label="S'abonner à la newsletter"
                >
                  {isSubmitting ? '…' : '→'}
                </Button>
              </div>
              <p className="text-xs text-white/70">
                Nous respectons votre vie privée. Consultez notre{' '}
                <Link
                  href="/politique-confidentialite"
                  className="text-terracotta-300 hover:underline"
                >
                  politique de confidentialité
                </Link>
                .
              </p>
              {subscribed && (
                <p className="text-xs text-moss">Merci de votre inscription !</p>
              )}
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/10"></div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Thé Tip Top. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a
              href={lienSocial('Instagram')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-terracotta-300"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href={lienSocial('TikTok')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-terracotta-300"
              aria-label="TikTok"
            >
              <Music2 className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href={lienSocial('Pinterest')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-terracotta-300"
              aria-label="Pinterest"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.223-.937 1.58-6.685 1.58-6.685s-.4-.8-.4-1.983c0-1.858 1.08-3.246 2.424-3.246 1.146 0 1.699.86 1.699 1.888 0 1.15-.732 2.869-1.104 4.462-.313 1.323.627 2.401 1.863 2.401 2.236 0 3.957-2.356 3.957-5.75 0-3.012-2.165-5.116-5.256-5.116-3.58 0-5.679 2.686-5.679 5.453 0 1.08.399 2.236.9 2.866.098.12.12.225.088.345l-.36 1.473c-.042.196-.145.242-.335.146-1.247-.581-2.027-2.41-2.027-3.868 0-3.996 2.904-7.677 8.388-7.677 4.41 0 7.84 3.14 7.84 7.333 0 4.37-2.759 7.878-6.593 7.878-1.286 0-2.496-.666-2.91-1.453l-.792 3.017c-.287 1.094-.85 2.47-1.262 3.31 3.767 1.16 8.018.686 10.519-3.437 1.385-2.26 2.216-6.031 2.216-9.73 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href={lienSocial('Facebook')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-terracotta-300"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href={lienSocial('LinkedIn')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-terracotta-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href={lienSocial('YouTube')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-terracotta-300"
              aria-label="YouTube"
            >
              <Youtube className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
