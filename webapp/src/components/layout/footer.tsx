import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-noir text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-xl font-bold text-white">
                The Tip Top
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/70">
              The bio et fait main depuis 10 ans. Decouvrez nos creations uniques
              dans notre boutique de Nice.
            </p>
          </div>

          {/* Jeu Concours */}
          <div>
            <h3 className="font-functional text-ui uppercase tracking-[2px] text-white">
              Jeu Concours
            </h3>
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
                  Les lots a gagner
                </Link>
              </li>
              <li>
                <Link
                  href="/reglement"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Reglement du jeu
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
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-functional text-ui uppercase tracking-[2px] text-white">
              Informations legales
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Mentions legales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Politique de confidentialite
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
                  href="/gestion-cookies"
                  className="text-sm text-white/70 transition-colors hover:text-terracotta-300"
                >
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-functional text-ui uppercase tracking-[2px] text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 shrink-0 text-terracotta-300" strokeWidth={1.5} />
                18 rue Leon Frot, 75011 Paris
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4 shrink-0 text-terracotta-300" strokeWidth={1.5} />
                04 93 XX XX XX
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4 shrink-0 text-terracotta-300" strokeWidth={1.5} />
                contact@thetiptop.fr
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} The Tip Top. Tous droits reserves.
          </p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="text-xs text-white/50 hover:text-white/70">
              Mentions
            </Link>
            <Link href="/politique-confidentialite" className="text-xs text-white/50 hover:text-white/70">
              Confidentialite
            </Link>
            <Link href="/cgu" className="text-xs text-white/50 hover:text-white/70">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
