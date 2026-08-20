# Tests fonctionnels de l'API

Ces suites exercent les cas d'usage du cahier des charges de bout en bout, à
travers la couche HTTP réelle : mêmes routes, même `ValidationPipe`, mêmes
gardes, même base. Elles répondent à une question que les tests unitaires ne
peuvent pas trancher — *est-ce que l'enchaînement tient ?* — et non à celle de
savoir si un service isolé se comporte bien.

## Lancer les tests

```bash
npm run test:e2e --workspace api
```

### Prérequis

PostgreSQL et Redis doivent être joignables avec les valeurs de `api/.env`
(`docker compose up -d postgres redis`), et la base doit être migrée et seedée :
les suites s'appuient sur la configuration de jeu active et sur la table des
lots.

C'est aussi la raison pour laquelle ces tests ne sont pas rattachés à l'étape
`npm test` du pipeline : celle-ci s'exécute sans service de base de données.
Les y ajouter suppose de provisionner PostgreSQL et Redis sur l'agent Jenkins —
décision d'infrastructure, pas de test.

## Ce qui est couvert

| Suite | Objet |
|---|---|
| `acces-et-authentification` | UC-01/UC-02 : inscription, connexion, cloisonnement des rôles, cycle de vie des jetons, convention 403 |
| `participation-anonyme` | UC-05 : parcours sans compte, de la saisie du code à la participation, et ses refus (RG-01, RG-03, RG-06, RG-07, RG-09) |
| `participation-connectee` | UC-06 : soumission depuis l'espace personnel, concurrence sur un même ticket, comptes sans adresse joignable, délai de réclamation |
| `protection-anti-abus` | Limitation de débit HTTP |

## Effets sur les données

Ces tests écrivent réellement. Trois précautions, toutes dans `utils.ts` :

- **Marqueur d'exécution.** Chaque donnée créée porte un identifiant unique au
  lancement, et le nettoyage ne supprime que par ce marqueur. Aucune suite ne
  vide de table.
- **Configuration du jeu.** Plusieurs règles dépendent des dates d'ouverture et
  de clôture ; les éprouver oblige à les déplacer. Les valeurs d'origine sont
  restaurées en fin de suite, y compris après un échec.
- **Envois d'emails.** Le `MailService` est remplacé par un journal en mémoire.
  Rien ne part chez le prestataire, et le code de vérification lu dans ce
  journal est exactement celui que le destinataire recevrait.

## Limitation de débit

Le `ThrottlerGuard` global plafonne à trois requêtes par seconde et par IP. Une
suite qui enchaîne ses appels le déclenche dès la quatrième, et tous les
scénarios métier échoueraient alors en 429 sans rien avoir prouvé. Son compteur
est donc neutralisé par défaut, et la protection est vérifiée séparément par
`protection-anti-abus`.
