# 🔒 Conformité RGPD & Accessibilité - Thé Tip Top

## Table des matières

1. [RGPD - Règlement Général sur la Protection des Données](#rgpd)
2. [Accessibilité WCAG 2.1](#accessibilité)
3. [Mentions légales](#mentions-légales)
4. [Cookies et traceurs](#cookies)

---

## 📋 RGPD - Règlement Général sur la Protection des Données

### Données collectées

| Donnée | Finalité | Base légale | Durée conservation |
|--------|----------|-------------|-------------------|
| Email | Identification, communication | Consentement | 3 ans après fin jeu |
| Nom, Prénom | Identification gagnants | Exécution contrat | 3 ans après fin jeu |
| Téléphone | Contact (optionnel) | Consentement | 3 ans après fin jeu |
| Date naissance | Vérification majorité, statistiques | Intérêt légitime | 3 ans après fin jeu |
| Genre | Statistiques marketing | Consentement | 3 ans après fin jeu |
| Adresse IP | Sécurité, logs | Intérêt légitime | 1 an |
| Codes participation | Gestion jeu-concours | Exécution contrat | 3 ans après fin jeu |

### Droits des utilisateurs

L'application implémente tous les droits RGPD :

#### 1. Droit d'accès (Article 15)
```
GET /api/v1/users/me
```
- L'utilisateur peut consulter toutes ses données personnelles
- Export possible en JSON via le dashboard

#### 2. Droit de rectification (Article 16)
```
PATCH /api/v1/users/me
```
- Modification du profil via l'interface utilisateur
- Historique des modifications dans les logs d'audit

#### 3. Droit à l'effacement (Article 17)
```
DELETE /api/v1/users/me
```
- Suppression du compte avec anonymisation des données
- Conservation des participations anonymisées pour les statistiques

#### 4. Droit à la portabilité (Article 20)
```
GET /api/v1/users/me/export
```
- Export des données en format JSON
- Téléchargeable depuis le dashboard utilisateur

#### 5. Droit d'opposition (Article 21)
- Désinscription newsletter via le profil
- Opposition au traitement marketing

### Implémentation technique

#### Consentement
```typescript
// Lors de l'inscription
interface RegisterDto {
  // ... autres champs
  rgpdConsent: boolean;      // Obligatoire - CGU et politique
  newsletterOptIn: boolean;  // Optionnel - Communications marketing
}
```

#### Anonymisation (suppression de compte)
```typescript
// Le compte est anonymisé, pas supprimé
{
  email: `deleted_${hash}@anonymized.local`,
  firstName: 'Utilisateur',
  lastName: 'Supprimé',
  phone: null,
  birthDate: null,
  deletedAt: new Date(),
}
```

#### Logs d'audit
Toutes les actions sensibles sont tracées :
- Création de compte
- Modification de données
- Participations
- Connexions
- Suppressions

### Responsable de traitement

**Thé Tip Top SAS**
- Adresse : 18 rue Léon Foucault, 06000 Nice
- Email DPO : dpo@thetiptop.fr
- SIRET : XXX XXX XXX XXXXX

### Sous-traitants

| Sous-traitant | Service | Localisation données |
|---------------|---------|---------------------|
| OVH | Hébergement | France |
| Google | OAuth2 | UE |
| Facebook | OAuth2 | UE |
| Cloudflare | CDN/DNS | UE |

---

## ♿ Accessibilité WCAG 2.1

### Niveau de conformité visé : AA

### Critères implémentés

#### Perceptible

1. **Alternatives textuelles** (1.1.1)
   - Toutes les images ont un attribut `alt`
   - Icônes décoratives marquées `aria-hidden="true"`

2. **Contenu adaptable** (1.3.x)
   - Structure sémantique HTML5 (`<header>`, `<main>`, `<nav>`, etc.)
   - Ordre de lecture logique
   - Labels associés aux champs de formulaire

3. **Distinguable** (1.4.x)
   - Ratio de contraste minimum 4.5:1 (texte)
   - Ratio de contraste minimum 3:1 (éléments UI)
   - Texte redimensionnable jusqu'à 200%
   - Pas de perte d'information avec zoom 200%

#### Utilisable

1. **Accessibilité au clavier** (2.1.x)
   - Tous les éléments interactifs accessibles au clavier
   - Ordre de tabulation logique
   - Pas de piège clavier

2. **Délai suffisant** (2.2.x)
   - Pas de limite de temps pour remplir les formulaires
   - Compte à rebours informatif uniquement

3. **Navigation** (2.4.x)
   - Skip links pour sauter au contenu
   - Titres de page descriptifs
   - Focus visible sur tous les éléments
   - Breadcrumbs quand pertinent

#### Compréhensible

1. **Lisible** (3.1.x)
   - Langue de la page définie (`lang="fr"`)
   - Langage clair et simple

2. **Prévisible** (3.2.x)
   - Navigation cohérente
   - Identification cohérente des composants

3. **Assistance à la saisie** (3.3.x)
   - Identification des erreurs
   - Labels descriptifs
   - Suggestions de correction
   - Prévention des erreurs (confirmation)

#### Robuste

1. **Compatible** (4.1.x)
   - HTML valide
   - Attributs ARIA corrects
   - Compatible lecteurs d'écran (NVDA, VoiceOver)

### Composants accessibles

```tsx
// Exemple de bouton accessible
<Button
  aria-label="Valider le code de participation"
  aria-describedby="code-help"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Vérification...</span>
    </>
  ) : (
    'Valider'
  )}
</Button>
```

### Tests d'accessibilité

- **Automatisés** : Lighthouse, axe-core dans les tests Cypress
- **Manuels** : Navigation clavier, lecteur d'écran
- **Utilisateurs** : Tests avec personnes en situation de handicap

---

## 📜 Mentions légales

### Éditeur du site

**Thé Tip Top SAS**
- Capital social : XX XXX €
- SIRET : XXX XXX XXX XXXXX
- RCS Nice : XXX XXX XXX
- TVA : FR XX XXX XXX XXX
- Siège : 18 rue Léon Foucault, 06000 Nice
- Téléphone : 04 93 XX XX XX
- Email : contact@thetiptop.fr

### Directeur de publication
M./Mme [Nom du dirigeant]

### Hébergeur
OVHcloud
2 rue Kellermann
59100 Roubaix
France

### Propriété intellectuelle
Tous les contenus du site (textes, images, logos) sont la propriété exclusive de Thé Tip Top SAS ou de ses partenaires.

---

## 🍪 Cookies et traceurs

### Cookies essentiels (sans consentement)

| Cookie | Finalité | Durée |
|--------|----------|-------|
| `refreshToken` | Authentification | 7 jours |
| `XSRF-TOKEN` | Sécurité CSRF | Session |

### Cookies optionnels (avec consentement)

| Cookie | Finalité | Durée | Opt-in |
|--------|----------|-------|--------|
| `_ga` | Google Analytics | 2 ans | Oui |
| `_gid` | Google Analytics | 24h | Oui |

### Implémentation du bandeau cookie

```tsx
// Composant de consentement cookies
function CookieBanner() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent');
    if (stored) {
      setConsent(JSON.parse(stored));
    }
  }, []);

  if (consent !== null) return null;

  return (
    <div role="dialog" aria-labelledby="cookie-title">
      <h2 id="cookie-title">Gestion des cookies</h2>
      <p>
        Nous utilisons des cookies pour améliorer votre expérience.
      </p>
      <button onClick={() => handleConsent(true)}>
        Accepter
      </button>
      <button onClick={() => handleConsent(false)}>
        Refuser
      </button>
      <a href="/gestion-cookies">Personnaliser</a>
    </div>
  );
}
```

### Page de gestion des cookies

Accessible via `/gestion-cookies` :
- Liste de tous les cookies utilisés
- Possibilité de modifier les choix
- Explication claire de chaque cookie

---

## 📝 Textes légaux à publier

### 1. Politique de confidentialité
Fichier : `/politique-confidentialite`

Doit contenir :
- Identité du responsable de traitement
- Coordonnées DPO
- Données collectées et finalités
- Bases légales
- Durées de conservation
- Droits des personnes
- Destinataires des données
- Transferts hors UE
- Sécurité des données
- Réclamation CNIL

### 2. Conditions Générales d'Utilisation
Fichier : `/cgu`

Doit contenir :
- Objet du service
- Conditions d'accès
- Obligations des utilisateurs
- Propriété intellectuelle
- Responsabilités
- Modification des CGU
- Droit applicable

### 3. Règlement du jeu-concours
Fichier : `/reglement`

Doit contenir :
- Article 1 : Organisation
- Article 2 : Conditions de participation
- Article 3 : Modalités de participation
- Article 4 : Désignation des gagnants
- Article 5 : Lots
- Article 6 : Remise des lots
- Article 7 : Données personnelles
- Article 8 : Responsabilité
- Article 9 : Litiges
- Article 10 : Dépôt du règlement

### 4. Mentions légales
Fichier : `/mentions-legales`

Contenu détaillé ci-dessus.

---

## ✅ Checklist conformité

### RGPD
- [ ] Politique de confidentialité publiée
- [ ] Consentement explicite à l'inscription
- [ ] Opt-in newsletter séparé
- [ ] Droit d'accès implémenté
- [ ] Droit de rectification implémenté
- [ ] Droit à l'effacement implémenté
- [ ] Droit à la portabilité implémenté
- [ ] Logs d'audit en place
- [ ] DPO désigné et coordonnées publiées
- [ ] Registre des traitements à jour
- [ ] Contrats sous-traitants signés

### Accessibilité
- [ ] Score Lighthouse Accessibilité > 90
- [ ] Tests axe-core sans erreur critique
- [ ] Navigation clavier complète
- [ ] Test avec lecteur d'écran
- [ ] Contraste couleurs vérifié
- [ ] Zoom 200% fonctionnel
- [ ] Déclaration d'accessibilité publiée

### Légal
- [ ] Mentions légales complètes
- [ ] CGU publiées et validées
- [ ] Règlement jeu déposé chez huissier
- [ ] Bandeau cookies conforme
- [ ] Page gestion cookies accessible
