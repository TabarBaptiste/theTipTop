// ===========================================
// Erreur OAuth - Adresse email absente
// ===========================================

/**
 * Le fournisseur a authentifié la personne mais n'a transmis aucune adresse.
 *
 * Distinguée des autres échecs OAuth car elle n'appelle pas la même réponse :
 * une panne réseau ou un code expiré se retentent, alors qu'ici il faut
 * expliquer que ce compte ne partage pas d'email et orienter vers un autre
 * moyen de connexion. Une classe dédiée plutôt qu'un test sur le message :
 * celui-ci change au premier remaniement de formulation.
 */
export class OAuthMissingEmailError extends Error {
  constructor(provider: string) {
    super(`${provider} n'a fourni aucune adresse email`);
    this.name = 'OAuthMissingEmailError';
  }
}
