# Objectif n°2 – Client Thé Tip Top

## Contexte

Afin d'éprouver le nouveau workflow de production, Mr Guido Brasletti a décidé de répondre à la demande de leur nouveau client **« Thé Tip Top »** via ce dernier.

### Informations sur la société Thé Tip Top

- **Gérant** : Mr Eric Bourdon
- **Siège social** : 18 rue Léon Frot, 75011 Paris
- **Statut juridique** : SA au capital Social de 150 000€

## Présentation de l'entreprise

Thé Tip Top est une société ayant pour activité la promotion de gammes de thés de très grande qualité avec des mélanges signatures de l'entreprise, des thés détox, des thés blancs, des thés légumes, infusions, etc. L'ensemble des thés sont **bios** et **Handmades**.

## Le Jeu-Concours

### Objectif

Afin de fêter l'ouverture de leur 10ème boutique à Nice mais surtout afin d'attirer l'attention de nouveaux clients sur leurs produits, la société Thé Tip Top souhaite organiser un jeu-concours de type tirage au sort. 

Ainsi tous les clients ayant un ticket de caisse ou une facture supérieure à **49€** retrouveront sur ces derniers un code à **10 caractères** comprenant des chiffres et des lettres permettant une participation.

### Répartition des gains

**100% des tickets seront gagnants**, voici la répartition des gains :

- **60%** des tickets offrent un infuseur à thé
- **20%** des tickets offrent une boite de 100g d'un thé détox ou d'infusion
- **10%** des tickets offrent une boite de 100g d'un thé signature
- **6%** des tickets offrent un coffret découverte d'une valeur de 39€
- **4%** des tickets offrent un coffret découverte d'une valeur de 69€

### Durée et modalités

Le jeu-concours aura lieu sur une période de **30 jours** durant lesquels **500 000 tickets maximums** pourront être distribués. Les joueurs auront les 30 jours du jeu concours ainsi que **30 jours supplémentaires** à compter de la date de clôture du jeu pour aller sur le site internet afin tester le code de leur(s) ticket(s) et réclamer leur lot en magasin ou en ligne.

> **⚠️ Attention** : Les codes qui seront présents sur les tickets de caisse devront être générés dès le début du jeu concours afin de pouvoir respecter obligatoirement les pourcentages de gains. Vous devrez donc avoir en base de données **500 000 codes** qui pourront être utilisés avec leur gains déjà associé.

### Le Grand Prix

À l'issue du jeu-concours, un tirage au sort sera effectué parmi tous les participants afin de déterminer le gagnant d'**un an de thé** d'une valeur de **360€**.

**Important** : Pour le tirage au sort du gros lot, le nombre de participations d'un client n'augmente pas ses chances de gagner.

### Cadre légal

Le règlement et les modalités du jeu-concours ont été déposés auprès de **Maître Arnaud Rick** huissier de justice et le tirage au sort du gros lot sera également effectué sous le contrôle de ce dernier.

## Identité visuelle et promotion

Thé Tip Top souhaite profiter de ce jeu-concours pour revoir entièrement l'identité visuelle de leur marque. Vous devez donc être **force de proposition** à la fois sur le logo et sur le visuel du jeu concours. Faites bien attention toutefois de coller au mieux à l'activité et au positionnement de votre client.

Afin de faire la promotion du jeu concours, Thé Tip Top souhaite utiliser les **réseaux sociaux** et particulièrement faire des partenariats avec **influenceurs**. Vous devez donc être force de proposition sur cet aspect.

## Cahier des charges du site web

Le gérant de la société Thé Tip Top souhaite un site dédié au jeu-concours qui devra :

### Fonctionnalités côté clients

1. Présenter aux clients le jeu-concours et les lots à gagner
2. Permettre aux clients de s'inscrire au jeu-concours via un compte **Google/Facebook** et via un formulaire d'inscription "classique"
3. Permettre de participer au jeu-concours via leur(s) numéro(s) de ticket(s)
4. Permettre aux clients de visualiser l'historique de leurs gains

### Fonctionnalités côté administrateurs

5. Permettre aux administrateurs de visualiser les statistiques du jeu-concours (nombres de tickets fournis, nombres de tickets utilisés, nombre de lots déjà gagnés, statistiques sur les gagnants en termes de sexe, âge, etc.)
6. Permettre aux administrateurs d'utiliser les données récoltées à des fins d'emailing

### Fonctionnalités côté employés

7. Permettre aux employés en boutique de visualiser les gains d'un client afin de lui fournir son gain et de noter le gain comme remis

### Exigences techniques

8. Évidemment le site devra être :
   - Accessible à tous devices
   - Respecter les bonnes pratiques d'accessibilité et de référencement
   - **RGPD friendly**

> **⚠️ Attention** : On ne vous demande pas de réaliser le site internet de Thé Tip Top, mais uniquement le site du jeu-concours ! Le site internet sera à terme refait par une autre agence en fonction de votre identité visuelle.

## Architecture technique

Le site du jeu-concours sera composé d'une **API** et d'une **webApp**. L'API devra communiquer avec :
- Votre webApp
- Les caisses en magasin
- Le futur site de vente en ligne

Ceci afin par exemple de pouvoir récupérer les lots gagnés, tickets, etc.

Les différents tirages au sort seront évidemment effectués par votre application **côté serveur**.

## Démarche RSE

Enfin, votre agence devra prendre en compte que dans sa démarche éco-responsable votre client Thé Tip Top souhaite que le projet (et particulièrement vos préconisations techniques) soit mené dans une **démarche RSE**.

---

# Travail demandé

## Phase 1 : Workflow de production

Il vous est donc demandé de réaliser dans un premier temps le cahier des spécifications techniques pour le workflow et le workflow en lui-même pour l'agence.

### Contraintes et demandes

- Préconisations techniques avec justification des choix techniques des différentes briques logicielles (serveur CI, SCM, metrics, reverse proxy…)
- Diagramme d'infrastructure complet du workflow
- Diagrammes UML et BPNM afin de présenter les procédures mises en place avec le workflow
- Détermination des facteurs-risques
- Une estimation des coûts d'études, de développement et de suivis
- Les différentes procédures rédigées pour les utilisateurs
- Une fiche de poste pour le recrutement d'une ressource pour la gestion et maintenance du workflow ainsi qu'une proposition de formation
- Une présentation type PowerPoint

## Phase 2 : Site du jeu-concours

Dans un second temps, vous devrez réaliser le cahier des charges et le site internet du jeu-concours pour le client Thé Tip Top.

### Contraintes et demandes

- Étude marketing complète (marché, concurrence…)
- Établissement d'un mix Marketing
- Détermination des facteurs-risques
- Un Gantt complet en ASAP sous **MsProject** ou **Gantt Project** obligatoirement
- Une estimation des coûts d'études, de développement et de suivis
- Une présence accrue sur les réseaux sociaux
- La mise en place des outils nécessaires au projet par rapport à vos préconisations (Google Analytics, Réseaux sociaux…)
- Une charte graphique cohérente et justifiée
- Une accessibilité pour tous types de lecteurs
- Préconisations techniques avec justification des choix techniques
- Une lisibilité sur tous types de supports
- Une présentation type PowerPoint

## Outil de suivi de projet

Enfin afin de planifier et de suivre correctement l'avancée de votre projet, nous vous demandons obligatoirement de mettre en place un outil type **Trello** ou **Notion** dont les accès seront à nous fournir.
