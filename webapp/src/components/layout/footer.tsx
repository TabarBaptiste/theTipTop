import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-tea-600" />
              <span className="font-display text-xl font-bold text-tea-800">
                Thé Tip Top
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              Thé bio et fait main depuis 10 ans. Découvrez nos créations uniques 
              dans notre boutique de Nice.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900">Jeu Concours</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  Comment participer
                </Link>
              </li>
              <li>
                <Link
                  href="/#prizes"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  Les lots à gagner
                </Link>
              </li>
              <li>
                <Link
                  href="/reglement"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  Règlement du jeu
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  S&apos;inscrire
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900">Informations légales</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/cgu"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  CGU
                </Link>
              </li>
              <li>
                <Link
                  href="/gestion-cookies"
                  className="text-sm text-gray-600 hover:text-tea-600"
                >
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-tea-600" />
                18 rue Léon Foucault, 06000 Nice
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-tea-600" />
                04 93 XX XX XX
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-tea-600" />
                contact@thetiptop.fr
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Thé Tip Top. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
