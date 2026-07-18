

| ![][image1]![][image2] | Thé Tip Top SA  SIREN : 123 456 789 SIRET : 123 456 789 00010 18 rue Léon Frot \- 75011 Paris eric.bourdon@thetiptop.fr |
| :---- | ----: |

---

| CAHIER DES SPÉCIFICATIONS TECHNIQUES FURIOUS DUCKS |
| :---: |

| Titre du projet | Mise en place d'un workflow de production \- Agence Furious Ducks  |
| :---- | :---- |
| **Résumé du projet** | La webagency Furious Ducks (45 employés, spécialisée open source depuis 2007\) souhaite moderniser son organisation en abandonnant le cycle en V au profit de méthodologies Agile, et industrialiser sa production via un workflow CI/CD complet basé sur Docker, Jenkins et GitLab, hébergé sur serveurs Linux dédiés. Le workflow est éprouvé sur un projet pilote : le site du jeu-concours Thé Tip Top. |
| **Date de début du projet** | 22 janvier 2026 |
| **Rédacteurs** | ANDRIAMANANJARA MANDIMBY Harena  TABAR LABONNE Baptiste BAH Elhadj Ibrahima |

| Date | Version | Objet de la modification | Coordinatrice Furious Ducks |
| :---: | :---: | :---: | :---: |
| 01/06/2026 | 1.0 | Première émission | ANDRIAMANANJARA MANDIMBY Harena |
| 22/06/2026 | 2.0 | Corrections | ANDRIAMANANJARA MANDIMBY Harena |

# **CAHIER DES SPÉCIFICATION TECHNIQUES** {#cahier-des-spécification-techniques}

[**CAHIER DES SPÉCIFICATION TECHNIQUES	1**](#cahier-des-spécification-techniques)

[**État des lieux	6**](#état-des-lieux)

[1\. Présentation de l’agence	6](#1.-présentation-de-l’agence)

[2\. Présentation de la problématique	7](#2.-présentation-de-la-problématique)

[3\. Méthodologie de projet actuelle	8](#3.-méthodologie-de-projet-actuelle)

[**Méthodologie de projet à venir	11**](#méthodologie-de-projet-à-venir)

[1\. Méthodologie préconisée : Agile Scrum	11](#1.-méthodologie-préconisée-:-agile-scrum)

[2\. Avantages de Scrum pour Furious Ducks	12](#2.-avantages-de-scrum-pour-furious-ducks)

[3\. Limites et points de vigilance	12](#heading=h.oupeohmfpje2)

[4\. Mise en œuvre au sein de l’agence	13](#4.-mise-en-œuvre-au-sein-de-l’agence)

[5\. Articulation avec le workflow d’intégration continue	13](#5.-articulation-avec-le-workflow-d’intégration-continue)

[6\. Outils Recommandés	14](#6.-outils-recommandés)

[7\. Conclusion	15](#7.-conclusion)

[**Introduction au mouvement DevOps et DevSecOps	15**](#introduction-au-mouvement-devops-et-devsecops)

[1\. Comprendre le mouvement DevOps	15](#heading=h.rd2s8s9a8wp9)

[2\. DevOps et intégration continue	15](#heading=h.8znpsoli6ntx)

[3\. Évolution vers le DevSecOps	16](#heading=h.zefp6vo8kx9l)

[4\. Avantages du DevOps et du DevSecOps pour Furious Ducks	16](#heading=h.a20sqwatb3qi)

[5\. Topologie DevOps retenue pour l’agence Furious Ducks	17](#heading=h.xihnjn9cg7al)

[6\. Articulation avec la méthodologie Agile	17](#heading=h.jrphgybjep9v)

[7\. Conclusion	17](#heading=h.vs9ne35b0b4s)

[**Analyse du workflow CI/CD	18**](#analyse-du-workflow-ci/cd)

[1\. Présentation du workflow CI/CD	18](#1.-présentation-du-workflow-ci/cd)

[2\. Choix techniques	21](#2.-choix-techniques)

[3\. Hébergement et backups	28](#3.-hébergement-et-backups)

[**Diagramme d’infrastructure complet du workflow	33**](#diagramme-d’infrastructure-complet-du-workflow)

[Vue d'ensemble de l'infrastructure	34](#vue-d'ensemble-de-l'infrastructure)

[Table des ports et protocoles	34](#table-des-ports-et-protocoles)

[Dimensionnement Réseau	42](#dimensionnement-réseau)

[**Gestion des ressources humaines	44**](#gestion-des-ressources-humaines)

[1\. Recrutement	44](#1.-recrutement)

[2\. Formation	49](#2.-formation)

[3\. Conseil sur le contrat de travail	60](#heading=)

[**Procédures	62**](#procédures)

[Diagrammes d'Activité BPMN \- Workflow CI/CD Furious Ducks	62](#diagrammes-d'activité-bpmn---workflow-ci/cd-furious-ducks)

[Processus de Déploiement \- DEV, PREPROD et PROD	69](#processus-de-déploiement---dev,-preprod-et-prod)

[Procédure de Sauvegarde du Workflow \- Production	81](#procédure-de-sauvegarde-du-workflow---production)

[Procédure de Restauration du Workflow \- DEV, PREPROD et PROD	88](#procédure-de-restauration-du-workflow---dev,-preprod-et-prod)

[2\. Processus de restauration complète du workflow	88](#2.-processus-de-restauration-complète-du-workflow)

[**Diagramme de Gantt	100**](#heading)

[1\. Ressources du projet	100](#1.-ressources-du-projet)

[2\. Listing des tâches par lots	101](#2.-listing-des-tâches-par-lots)

[3\. Diagramme des ressources	110](#3.-diagramme-des-ressources)

[4\. Devis projet par lot	111](#4.-devis-projet-par-lot)

[5\. Diagramme de Gantt (visuelle simplifié)	112](#5.-diagramme-de-gantt-\(visuelle-simplifié\))

[6\. Synthèse des jalons	112](#6.-synthèse-des-jalons)

[7\. Chemin critique	113](#7.-chemin-critique)

[8\. Cohérence avec la méthodologie Scrum	113](#8.-cohérence-avec-la-méthodologie-scrum)

[**Estimation des coûts et rentabilité	114**](#estimation-des-coûts-et-rentabilité)

[**ANNEXES	123**](#annexes)

[Annexe A \- Calcul du TJM des ressources du projet	123](#annexe-a---calcul-du-tjm-des-ressources-du-projet)

[Annexe B \- Glossaire technique	127](#annexe-b---glossaire-technique)

[Annexe C \- Matrice RACI du projet	130](#annexe-c---matrice-raci-du-projet)

[Annexe D \- Tableau comparatif des outils retenus	131](#annexe-d---tableau-comparatif-des-outils-retenus)

[Annexe E \- Cartographie des ports et protocoles	132](#annexe-e---cartographie-des-ports-et-protocoles)

[Annexe F \- Matrice de correspondance exigences / réponses	133](#annexe-f---matrice-de-correspondance-exigences-/-réponses)

[Annexe G \- Politique de nommage et conventions	135](#annexe-g---politique-de-nommage-et-conventions)

[Annexe H \- Checklist de validation pré-production	136](#annexe-h---checklist-de-validation-pré-production)

[Annexe I \- Indicateurs de suivi (KPIs)	137](#annexe-i---indicateurs-de-suivi-\(kpis\))

[Annexe J \- Références et ressources	138](#annexe-j---références-et-ressources)

## 

## 

## 

## 

## 

## **État des lieux** {#état-des-lieux}

### 1\. Présentation de l’agence {#1.-présentation-de-l’agence}

#### **Storytelling \- L’évolution de Furious Ducks**

Fondée en 2007 par Guido Brasletti, Furious Ducks est née d'une ambition simple : proposer des solutions web open source performantes, accessibles et techniquement irréprochables. À ses débuts, l'agence réunissait une petite équipe de développeurs passionnés, travaillant en proximité totale, avec une culture forte de collaboration et d'innovation.

Portée par la qualité de ses réalisations et par l'essor du numérique, l'agence connaît une croissance régulière. Quinze ans plus tard, Furious Ducks compte 45 collaborateurs et accompagne des clients variés dans la conception de sites vitrines, d'applications web complexes, d'API et de solutions mobiles.

Cependant, cette croissance a progressivement introduit de nouvelles contraintes : multiplication des projets, complexité organisationnelle, allongement des délais, dépendance à des processus rigides hérités du cycle en V.

L'agilité naturelle des débuts s'est diluée dans des méthodes moins adaptées à un marché exigeant rapidité, fiabilité et capacité d'adaptation.

Quinze ans après sa fondation, l'agence se retrouve dans une situation paradoxale, où les conditions mêmes de sa réussite, la multiplication des projets, l'élargissement des équipes, la diversification des clients ont progressivement rendu ses méthodes de production inadaptées. Sa surface de risque s'est élargie avec elle, sans que ses pratiques de production aient évolué au même rythme. En 2026, Monsieur Brasletti prend acte de cet écart et engage le chantier de sa résolution.

#### **Informations Juridiques de l'Agence[^1]**

Voici la synthèse administrative de l'agence Furious Ducks.

| Libellé | Informations |
| ----- | ----- |
| Dénomination sociale | Furious Ducks |
| Siège social | 12 Avenue de l'Innovation, 75002 Paris |
| Statut juridique | SARL (Société à Responsabilité Limitée) |
| Capital social | 100 000 € |
| Directeur / Gérant | Mr Guido Brasletti |
| Numéro SIREN | 493 123 456 |
| Numéro SIRET | 493 123 456 00021 |
| RCS | Paris B 493 123 456 |
| Code APE / NAF | 6201Z (Programmation informatique) |
| **TVA Intracommunautaire** | FR 45 493123456 |

#### **Valeurs de l’agence**

Tout au long de cette trajectoire, Furious Ducks a maintenu une ligne de conduite constante, qui dépasse le seul choix des technologies. L'engagement envers l'open source s'y affirme non comme une posture, mais comme une condition pratique d'indépendance et de maîtrise, pour l'agence comme pour ses clients. L'exigence technique qui en découle se manifeste dans une culture d'industrialisation et d'automatisation des processus de production, portée par une équipe habituée à intervenir sur des environnements hétérogènes : sites vitrines, applications web complexes, APIs, solutions mobiles. La transmission des compétences et la montée en autonomie des collaborateurs sont au cœur du fonctionnement interne, dans un esprit de responsabilité collective qui se prolonge naturellement dans la relation client : fiabilité des livrables, sécurité des données, respect des engagements.

### 2\. Présentation de la problématique {#2.-présentation-de-la-problématique}

#### **Diagnostic opérationnel**

L'analyse menée par Monsieur Brasletti a mis en évidence une réalité plus précise que la désorganisation évoquée en première lecture : les pratiques de production de l'agence n'ont pas suivi le rythme de sa croissance. À l'échelle d'une petite équipe, l'absence de versionning centralisé, de procédures documentées ou de backups automatisés reste gérable, compensée par la proximité et la communication directe entre les membres. À l'échelle de quarante-cinq collaborateurs répartis sur des projets simultanés et de natures variées, ces lacunes deviennent des risques opérationnels chroniques.

Sans système de versionning partagé, les conflits de code entre développeurs sont récurrents et la restauration d'un état stable après une erreur relève du cas par cas. Les données de production : bases de données clients, configurations d'environnements ne font l'objet d'aucune sauvegarde structurée, exposant chaque projet géré par l'agence à un risque de perte irréversible. Les mises en production, réalisées manuellement et sans procédure documentée, concentrent des fenêtres d'erreur humaine dont les conséquences se mesurent en heures d'indisponibilité. Faute de tests automatisés, les anomalies ne remontent qu'en production, là où leur correction mobilise le plus de ressources et génère le plus d'impact client. Sans monitoring des services en exploitation, l'agence avance sans visibilité sur les performances réelles de ce qu'elle livre, incapable d'anticiper les incidents avant qu'ils n'affectent les utilisateurs finaux.

Sur le plan organisationnel, la répartition séquentielle des responsabilités entre les équipes de développement, de test et d'exploitation allonge les boucles de feedback et ralentit la résolution des incidents. L'absence de procédures partagées renforce cette fragmentation : chaque livraison dépend de l'expérience individuelle de ceux qui la réalisent, sans capitalisation possible sur les projets précédents.

#### **Demande de Monsieur Brasletti**

C'est dans ce contexte que Monsieur Brasletti a confié à l'équipe une mission en deux volets. Sur le plan organisationnel, il souhaite faire évoluer l'agence vers des méthodes de gestion de projet plus modernes et itératives, en remplacement du cycle en V jusqu'ici pratiqué. Sur le plan technique, il mandate la conception et la mise en œuvre d'un workflow de production industrialisé, entièrement basé sur Docker et capable de couvrir l'ensemble des projets de l'agence, quelle qu'en soit la nature.

#### **Vision cible**

La transformation engagée par Monsieur Brasletti ne se mesure pas à l'installation d'outils, mais à un changement observable dans le quotidien des équipes et dans l'expérience des clients. À l'issue de la mise en place du workflow, l'agence doit être en mesure de déployer en production au minimum trois fois par semaine et par projet actif, un rythme qui traduit concrètement le basculement vers une logique de livraison continue, en rupture avec les cycles de plusieurs semaines actuellement pratiqués.

Sur le plan de la qualité, l'automatisation des pipelines permet d'intercepter les anomalies dès les environnements de développement ou de préproduction, avant qu'elles n'atteignent la production. Chaque déploiement est entièrement traçable : associé à un commit identifié, une version sémantique et un rapport d'analyse qualité généré automatiquement, il peut être audité, reproduit ou annulé à tout moment. Les développeurs pilotent leurs propres pipelines via des Jenkinsfiles versionnés dans leurs dépôts, sans dépendance à une intervention manuelle extérieure. Cette combinaison de fiabilité, de traçabilité et d'autonomie opérationnelle définit l'agence que Furious Ducks a pour objectif de devenir.

#### **Livrables attendus**

La réponse à la problématique de Monsieur Brasletti s'organise autour de deux axes complémentaires, technique et humain, qui forment ensemble un dispositif cohérent et pérenne.

Sur le plan technique, le livrable central est un workflow CI/CD complet basé sur Docker, intégrant des pipelines automatisés de build, de tests et de déploiement sur trois environnements distincts. Ce socle est complété par la mise en place d'outils de tests automatisés, de monitoring et de métriques permettant une supervision continue de l'ensemble de la chaîne de production. L'application Thé Tip Top, développée dans le cadre du second objectif du projet, sert de projet pilote pour éprouver le workflow dans des conditions réelles. Les procédures de déploiement et de sauvegarde, formalisées sous forme de diagrammes BPMN, garantissent que les pratiques instaurées peuvent être reproduites, transmises et maintenues de manière autonome par les équipes de l'agence.

Sur le plan humain, deux livrables viennent ancrer la transformation dans la durée. Une fiche de poste détaillée pour le recrutement d'un ingénieur DevOps permet à l'agence d'identifier la ressource qui assurera la maintenance et l'évolution du workflow au-delà de la phase initiale de mise en place. Un plan de formation structuré accompagne ce recrutement et garantit une prise en main rapide de l'ensemble des outils et des procédures mis en œuvre.

### 3\. Méthodologie de projet actuelle {#3.-méthodologie-de-projet-actuelle}

À ce jour, l’agence Furious Ducks s’appuie principalement sur une méthodologie de gestion de projet en cycle en V, héritée de ses pratiques historiques. Ce modèle repose sur une organisation séquentielle des phases du projet, allant de l’expression des besoins à la mise en production, avec des étapes clairement définies et peu de retours en arrière possibles.

#### **Fonctionnement du cycle en V au sein de l’agence**

Dans ce cadre, les projets suivent généralement les étapes suivantes :

* Analyse et cadrage des besoins clients,

* Conception fonctionnelle et technique,

* Phase de développement,

* Phase de tests,

* Livraison finale.

Ce fonctionnement a longtemps permis à l’agence de structurer ses projets, notamment lorsque les périmètres étaient stables, les technologies peu évolutives et les attentes clients clairement définies en amont.

#### **Limites et problématiques du cycle en V**

Cependant, dans le contexte actuel de Furious Ducks caractérisé par une diversité de projets, des technologies multiples et des attentes clients évolutives, cette méthodologie montre aujourd’hui plusieurs limites.

Tout d’abord, le cycle en V induit une forte rigidité organisationnelle. Les besoins étant figés en début de projet, toute évolution demandée par le client en cours de réalisation génère des retards, des surcoûts et des arbitrages complexes. Cette rigidité est en décalage avec la réalité des projets digitaux modernes, où les ajustements sont fréquents.

Ensuite, la méthodologie actuelle entraîne une visibilité limitée sur l’avancement réel des projets. Les phases longues de développement, sans livraisons intermédiaires, rendent difficile l’identification précoce des écarts, qu’ils soient techniques ou fonctionnels. Les problèmes sont souvent détectés tardivement, notamment lors de la phase de pré-production voire de production.

Par ailleurs, le cycle en V accentue la séparation des rôles et des équipes. Les développeurs, testeurs et chefs de projet interviennent de manière successive plutôt que collaborative, ce qui limite les échanges, ralentit la résolution des problèmes et renforce la dépendance à certaines personnes clés.

Enfin, cette méthodologie est peu compatible avec l’industrialisation de la production souhaitée par Monsieur Brasletti. L’absence de livraisons fréquentes, de tests automatisés et de boucles de feedback rapides freine la mise en place d’un workflow CI/CD efficace et empêche l’agence de gagner en fiabilité, en qualité et en réactivité. Ces constats expliquent la volonté de l’agence d’évoluer vers des méthodologies de gestion de projet plus modernes et itératives, capables de mieux accompagner sa croissance et la complexité croissante de ses projets.

## 

## 

## 

## 

## 

## 

## 

## **Méthodologie de projet à venir** {#méthodologie-de-projet-à-venir}

Afin de répondre aux problématiques identifiées au sein de l’agence Furious Ducks et d’accompagner la mise en place d’un workflow de production industrialisé, il est nécessaire d’adopter une méthodologie de gestion de projet plus flexible, itérative et collaborative.

Dans ce contexte, la méthodologie Agile Scrum apparaît comme la plus adaptée aux enjeux de l’agence, notamment en lien avec la mise en place d’un workflow d’intégration continue.

Certains principes issus de Kanban sont utilisés en complément de Scrum, notamment pour la gestion des tâches transverses, de la maintenance et des demandes non planifiées. L’approche Kanban permet de visualiser le flux de travail, de limiter le nombre de tâches en cours et de traiter efficacement les urgences, sans perturber les sprints en cours.

### 1\. Méthodologie préconisée : Agile Scrum {#1.-méthodologie-préconisée-:-agile-scrum}

Scrum est une méthodologie Agile reposant sur des cycles courts et itératifs, appelés sprints, permettant de livrer régulièrement des incréments fonctionnels et testés. Contrairement au cycle en V, Scrum favorise l’adaptation continue, la collaboration entre les équipes et l’amélioration progressive du produit.

Le fonctionnement repose principalement sur :

* Un **backlog produit priorisé**, regroupant l’ensemble des besoins fonctionnels et techniques,

* Des **sprints de courte durée** (1 à 2 semaines),

* Des **livraisons régulières** sur des environnements de développement ou de pré-production,

* Et des temps de synchronisation favorisant la communication et l’amélioration continue.

![][image3]

*Figure 1 \- Cycle Scrum / Sprint Workflow*

### 2\. Avantages de Scrum pour Furious Ducks {#2.-avantages-de-scrum-pour-furious-ducks}

Le principal attrait de Scrum pour Furious Ducks tient à son alignement direct avec le rythme que l'agence veut instaurer. Les sprints courts permettent d'intégrer les évolutions client sans remettre en cause l'ensemble d'un projet, et les livraisons régulières donnent une mesure concrète de l'avancement là où les phases longues du cycle en V ne laissaient remonter les problèmes qu'en fin de parcours. Cette cadence favorise aussi une collaboration plus continue entre développeurs, chefs de projet et clients, au lieu de faire se succéder des équipes qui travaillent chacune sur leur portion de manière étanche. Enfin, les cycles d'une à deux semaines s'articulent naturellement avec les pipelines CI/CD : chaque fin de sprint donne lieu à une version intégrée, testée et déployable.

Scrum n'est pas sans exigences. La méthode demande une discipline collective réelle, un backlog mal priorisé ou des équipes peu impliquées dans les cérémonies suffisent à en vider la substance. Le changement de posture est aussi non négligeable pour des collaborateurs habitués à un modèle plus linéaire, où les rôles et les périmètres d'intervention sont fixés une fois pour toutes. Ces points de vigilance ne remettent pas en cause le choix de la méthode, mais ils en conditionnent la réussite : un accompagnement progressif, une documentation des pratiques et une formation adaptée sont indispensables pour que Scrum tienne ses promesses à l'échelle de l'agence.

### 4\. Mise en œuvre au sein de l’agence {#4.-mise-en-œuvre-au-sein-de-l’agence}

#### **4.1 Rôles Scrum**

La mise en œuvre de Scrum repose sur trois rôles distincts, dont la complémentarité est au cœur du fonctionnement de la méthode. Le Product Owner porte la vision produit : c'est lui qui priorise le backlog, arbitre entre les besoins fonctionnels et techniques, et assure l'interface avec le client tout au long du projet. Le Scrum Master joue un rôle de facilitateur : il veille à ce que le cadre méthodologique soit respecté, fluidifie les échanges au sein de l'équipe et lève les obstacles qui freinent la progression des sprints. L'équipe de développement, enfin, est auto-organisée et pluridisciplinaire : elle prend en charge la réalisation des fonctionnalités et s'engage collectivement sur les objectifs de chaque sprint. Cette répartition, sans hiérarchie formelle entre membres de l'équipe, crée les conditions d'une responsabilisation partagée et d'une collaboration plus transparente.

#### **4.2 Cérémonies et adaptation au contexte de l’agence**

Les cérémonies Scrum (planification, points d’avancement, revue et rétrospective) seront adaptées au contexte de Furious Ducks sans être appliquées dogmatiquement. Ces temps de synchronisation réguliers servent un double objectif : maintenir une visibilité partagée sur l'avancement des projets et créer les conditions d'une amélioration continue, sans alourdir inutilement la charge opérationnelle des équipes.

Des principes issus de Kanban pourront être utilisés en complément pour gérer les tâches transverses, la maintenance du workflow ou les demandes urgentes.

### 5\. Articulation avec le workflow d’intégration continue {#5.-articulation-avec-le-workflow-d’intégration-continue}

La méthodologie Scrum structure l’organisation du travail et le rythme des projets, tandis que le workflow CI/CD automatise les aspects techniques tels que les tests, les builds et les déploiements.

Chaque sprint donne lieu à des développements versionnés, intégrés et testés automatiquement, permettant des livraisons fréquentes sur les environnements de développement et de pré-production, tout en conservant un contrôle maîtrisé sur les mises en production.

Cette complémentarité garantit une qualité constante, une meilleure fiabilité des livraisons et une capacité d’évolution rapide.

### 6\. Outils Recommandés {#6.-outils-recommandés}

Les outils retenus pour accompagner la méthodologie Agile ont été sélectionnés selon deux critères constants : leur caractère open source, en cohérence avec l'ADN de Furious Ducks, et leur capacité à s'intégrer sans friction dans un environnement conteneurisé. 

Pour la gestion de projet, Taiga couvre précisément les besoins liés à la méthode retenue grâce à son interface Scrum/Kanban, avec OpenProject en alternative pour les projets nécessitant un suivi de portefeuille plus structuré. 

La communication d'équipe s'appuiera sur Mattermost, auto-hébergeable et fonctionnellement équivalent aux solutions propriétaires du marché, complété par Jitsi Meet pour les réunions de sprint à distance. 

La documentation technique, les runbooks et les guides d'intégration trouveront leur place dans Wiki.js, dont l'organisation par espaces correspond bien à une agence gérant plusieurs projets en parallèle. 

Ces choix forment un socle cohérent et pérenne, dimensionné pour les besoins actuels de l'agence et extensible avec sa montée en maturité DevOps.

### 7\. Conclusion {#7.-conclusion}

L’adoption d’une méthodologie Agile Scrum, complétée par des principes Kanban, permet à Furious Ducks de passer d’une gestion de projet rigide à une organisation moderne, collaborative et orientée valeur. Cette méthodologie constitue un pilier essentiel de la transformation de l’agence et s’intègre naturellement au workflow de production industrialisé mis en place.

## 

## 

## 

## 

## 

## 

## **Introduction au mouvement DevOps et DevSecOps** {#introduction-au-mouvement-devops-et-devsecops}

### 1\. Le mouvement DevOps et son évolution vers le DevSecOps

Le DevOps est avant tout une culture de travail. Née à la fin des années 2000, cette approche vise à rapprocher les équipes de développement (Dev) et d'exploitation (Ops), historiquement organisées en silos étanches : les développeurs livrent des fonctionnalités, les exploitants maintiennent la stabilité des systèmes, et les deux pôles se renvoient mutuellement la responsabilité des incidents. Le DevOps rompt avec cette logique en instaurant une responsabilité partagée du produit tout au long de son cycle de vie, de l'écriture du code jusqu'à son exploitation en production. Le référentiel des DevOps Topologies (Skelton & Pais) le confirme : les outils ne produisent un effet durable que s'ils accompagnent un changement réel dans les modes de collaboration entre équipes.

Cette culture trouve son expression technique dans les pratiques d'intégration et de déploiement continus. L'intégration continue permet de vérifier à chaque modification que le code reste stable et cohérent, en déclenchant automatiquement des contrôles (tests, analyse qualité, scans de sécurité) sans attendre la phase de recette finale. Le déploiement continu prolonge cette logique jusqu'à la mise en production, en automatisant la promotion des versions validées d'un environnement à l'autre. Ces pratiques réduisent le risque de chaque livraison, raccourcissent le temps de détection des anomalies et permettent d'atteindre le rythme de déploiement visé par Monsieur Brasletti, au minimum trois mises en production par semaine par projet actif, dans des conditions de fiabilité maîtrisées.

Le DevSecOps prolonge naturellement cette démarche en intégrant la sécurité dès la conception, au lieu de la traiter comme une validation tardive. Concrètement, les scans de vulnérabilités sur les conteneurs, la détection de secrets dans le code source et les audits de dépendances s'exécutent dans le pipeline, au même titre que les tests fonctionnels. Pour Furious Ducks, dont les projets manipulent des données clients et des infrastructures mutualisées, cette intégration transforme la sécurité d'une contrainte externe en réflexe d'équipe, et réduit les risques réputationnels liés à une exposition accidentelle de données sensibles. L'agence se trouve ainsi en conformité avec les exigences du RGPD dès la phase de développement, sans opération corrective coûteuse après coup.

### 2\. Topologie retenue

La question de la topologie, c'est-à-dire de la structure d'équipe adoptée, est aussi déterminante que le choix des outils. Pour une agence de quarante-cinq personnes en cours de structuration DevOps, plusieurs trajectoires sont possibles, et leurs résultats varient fortement selon la maturité de l'organisation. La cible à terme pour Furious Ducks est le **Type 1** du référentiel Skelton & Pais : une collaboration directe entre équipes de développement et d'exploitation, où chaque équipe projet partage la responsabilité du code jusqu'en production, sur le modèle d'Etsy, qui a popularisé ce type d'organisation. Atteindre ce niveau de maturité directement serait irréaliste dans le contexte actuel. La trajectoire retenue passe par le **Type 5**, dit "équipe DevOps à durée limitée" : une équipe transverse est constituée pour la durée du projet, soit six mois[^2], avec une mission précise, poser le socle technique, définir les standards CI/CD et accompagner les équipes projets dans l'adoption des nouvelles pratiques. Sa particularité, et ce qui la distingue d'une simple équipe outillage, est qu'elle a vocation à se rendre superflue : les équipes projets reprennent progressivement la main sur leurs propres pipelines, et l'ingénieur DevOps recruté se recentre sur la sécurité, l'amélioration continue et la montée en compétences de l'ensemble de l'agence. Deux anti-patterns identifiés par Skelton & Pais guident la mise en œuvre pour éviter les dérives les plus fréquentes. L'**Anti-Type B** correspond à l'équipe DevOps qui se transforme en nouveau silo, défendant ses outils et ses pratiques contre le reste de l'organisation au lieu de les transmettre. L'**Anti-Type H** "Fake SRE" dans le référentiel désigne le cas où les exploitants existants sont simplement rebaptisés sans que les modes de collaboration réels changent. Dans les deux cas, les outils sont en place mais la culture ne suit pas : c'est précisément cette dérive que la limite temporelle du Type 5 cherche à prévenir.

La démarche DevOps / DevSecOps et la méthodologie Agile Scrum se renforcent mutuellement dans l'organisation de Furious Ducks. Scrum structure le rythme et les responsabilités au sein des équipes projets ; le DevOps automatise et sécurise la chaîne technique qui transforme le code produit à chaque sprint en une version déployable et exploitable. Cette complémentarité garantit que la cadence de livraison souhaitée est à la fois organisationnellement possible et techniquement soutenable sur le long terme.

## **Analyse du workflow CI/CD** {#analyse-du-workflow-ci/cd}

### 1\. Présentation du workflow CI/CD {#1.-présentation-du-workflow-ci/cd}

#### **1.1 Définitions**

L’Intégration Continue (CI) désigne la pratique consistant à intégrer fréquemment le code dans un dépôt central et à déclencher automatiquement des contrôles (build, tests, analyse qualité) afin de détecter les erreurs au plus tôt.

Le Déploiement Continu / Livraison Continue (CD) prolonge cette logique en automatisant la livraison d’une version validée vers des environnements (DEV, PREPROD). La mise en production peut être automatique ou soumise à validation humaine selon le niveau de criticité.

#### **1.2 Contexte et objectifs du workflow**

Dans le cadre de la transformation de l’agence Furious Ducks, la mise en place d’un workflow CI/CD constitue un levier central pour répondre aux problématiques identifiées : désorganisation, déploiements manuels, absence de tests automatisés, manque de fiabilité et de visibilité sur la production. L'objectif est de standardiser la chaîne de production pour l'ensemble des projets de l'agence, d'automatiser les tâches répétitives et à risque, d'améliorer la qualité des livrables et de sécuriser les mises en production, tout en restant compatible avec des projets très hétérogènes : sites vitrines, applications web, API ou projets mobiles.

#### **1.3 Contraintes du workflow CI/CD**

Le workflow CI/CD doit répondre à plusieurs contraintes structurelles propres à Furious Ducks. Sur le **plan organisationnel**, l'agence regroupe 45 collaborateurs répartis en plusieurs équipes projets, intervenant sur des technologies multiples pour des clients très différents. Le workflow doit donc permettre de mutualiser l'outillage tout en conservant la flexibilité nécessaire à chaque projet, dans un contexte où les équipes amorcent leur transition vers les pratiques Agile et DevOps.

Les **contraintes techniques** imposent de s'appuyer exclusivement sur des environnements Linux et des technologies open source, dans une infrastructure entièrement conteneurisée via Docker. La séparation claire des environnements DEV, PREPROD, PROD est impérative, de même que la capacité à absorber des volumes importants, comme l'exige le projet Thé Tip Top.

Les **exigences de sécurité et de fiabilité** complètent ce cadre : protection du code source et des données clients, traçabilité complète des déploiements, capacité à revenir rapidement à un état stable, et intégration progressive des pratiques DevSecOps. C'est l'ensemble de ces contraintes qui justifie la conception d'un workflow centralisé, automatisé et évolutif, plutôt qu'une accumulation de scripts ou de pratiques disparates.

#### **1.4 Tâches automatisées par le workflow CI/CD**

Le workflow CI/CD a vocation à automatiser l’ensemble des tâches critiques de la chaîne de production. Ces automatisations permettent de réduire les erreurs humaines, d’accélérer les livraisons et de garantir un niveau de qualité homogène entre les projets.

La première brique est la **gestion du code source**. À chaque push ou merge, le pipeline se déclenche automatiquement, vérifie la cohérence du code et des branches, et centralise le versionning. Dans une agence multi-projets, cette traçabilité est indispensable : elle garantit que l'on sait exactement ce qui a été fait, quand, et par qui.

Le **build et la préparation des environnements** constituent l'étape suivante. Les images Docker sont construites automatiquement, ce qui uniformise les environnements d'exécution et supprime les écarts entre les postes de développement et les serveurs de production. La conteneurisation permet de fiabiliser les livraisons et de réduire les problèmes liés aux différences d’environnements.  
Les **tests automatisés** interviennent immédiatement après le build : tests unitaires, fonctionnels, avec blocage du pipeline en cas d'échec (quality gate) et génération de rapports. L'absence de cette étape avait jusqu'ici exposé l'agence à des régressions coûteuses ; elle garantit désormais un socle de qualité minimal avant tout déploiement.

L'**optimisation des assets**, minification et compression des fichiers CSS et JS, contrôles de performance et des bonnes pratiques, complète la phase de build en améliorant les performances applicatives et l'expérience utilisateur, dans une logique de sobriété numérique.

La **publication des artefacts** consiste à stocker les images et les packages Docker construits dans un registre versionné, par tags. Cette gestion des versions est la condition de l'industrialisation : elle permet de redéployer une version validée à l'identique et, si nécessaire, de revenir en arrière rapidement.

Le **déploiement automatisé** couvre les trois environnements. Le déploiement en DEV est entièrement automatique ; celui en PREPROD est contrôlé ; la mise en production fait l'objet d'une validation humaine selon les projets. Les déploiements manuels étaient sources d’erreurs et de perte de temps. L’automatisation améliore la fiabilité tout en conservant un contrôle sur la production.

Le **monitoring, les métriques et l'alerting** ferment la boucle opérationnelle. La collecte de métriques techniques et applicatives, le suivi de la disponibilité et la détection précoce des incidents permettent à l'agence de passer d'une exploitation réactive, où les incidents sont découverts trop tard souvent signalés en premier par le client, à une supervision proactive.

Enfin, les **sauvegardes automatisées**, les backups réguliers des données et des configurations, avec vérification d'intégrité, constituent le filet de sécurité de l'ensemble du dispositif. L'absence de backups automatisés représentait un risque critique pour l'agence ; leur automatisation sécurise à la fois les projets clients et l'infrastructure technique du workflow elle-même.

#### **1.5 Positionnement du workflow dans l’agence**

Le workflow CI/CD est conçu comme un socle commun à l'ensemble des projets de Furious Ducks. Il n'impose pas une technologie unique mais un cadre standardisé, adaptable au type de projet, à la stack technique et au niveau d'exigence du client. Le projet Thé Tip Top en sera le premier terrain d'application : il permettra de valider, d'ajuster et de démontrer la pertinence du workflow avant son déploiement généralisé à l'ensemble de l'agence.

#### **1.6 Conclusion**

Le workflow CI/CD proposé répond directement aux problématiques exprimées par Monsieur Brasletti. En automatisant les tâches critiques de la chaîne de production, il permet à Furious Ducks de gagner en fiabilité, en qualité et en efficacité, tout en posant les bases d’une organisation moderne, compatible avec les pratiques Agile, DevOps et DevSecOps.

### 2\. Choix techniques {#2.-choix-techniques}

Afin de répondre aux objectifs d’industrialisation de la production, Furious Ducks met en place un socle technique commun CI/CD, réutilisable sur l’ensemble des projets de l’agence (sites vitrines, applications web, API, mobile).

Ce socle repose sur des outils open source, conteneurisés via Docker, et configurables par projet grâce à des fichiers versionnés (Jenkinsfile, docker-compose, fichiers de configuration).

#### **2.1 Reverse proxy / ingress \- Traefik**

Traefik constitue le point d'entrée unique du workflow : il reçoit l'ensemble du trafic HTTP/HTTPS entrant et route automatiquement les requêtes vers les conteneurs correspondants (SCM, CI, registry, monitoring et autres services). Il prend en charge la gestion des certificats TLS via Let's Encrypt et expose des middlewares d'authentification, de limitation de débit et de sécurisation des en-têtes HTTP. Nativement conçu pour Docker, il se configure via des labels directement dans les fichiers docker-compose, sans fichier de configuration centralisé supplémentaire, ce qui réduit sensiblement la charge opérationnelle liée à la gestion réseau. Sa capacité à exposer proprement plusieurs services sur un domaine unique sans configuration lourde en fait l'outil adapté à une infrastructure multi-services conteneurisée comme celle de Furious Ducks.

En pratique, Traefik impose le HTTPS systématique sur l'ensemble des services (Let's Encrypt), une séparation par sous-domaines dédiés (ci., git., registry., monitor., etc.) et une limitation du trafic sur les endpoints sensibles tels que les routes d'authentification et les API exposées.

#### **2.2 SCM (gestion de code source) \- GitLab Community Edition**

GitLab Community Edition assure la centralisation du code source de l'ensemble des projets de l'agence. Il gère les branches, les merge requests et les permissions par projet, et déclenche les pipelines Jenkins via webhooks à chaque événement Git. L'issue tracking de GitLab n'est pas utilisé : la gestion des tickets est confiée à un outil dédié de gestion de projet (cf. B. Méthodologie de projet à venir). GitLab CE devient ainsi la « source of truth » de l'agence, référentiel unique du code, des pipelines-as-code et des fichiers de configuration, ce qui réduit les conflits, les pertes de code et les erreurs humaines liées à des pratiques de versionning disparates. Gitea peut constituer une alternative plus légère si les contraintes serveur l'imposent.

Les standards retenus pour le SCM s'articulent autour de cinq axes. La stratégie **GitFlow** : branches main, develop, feature/\*, release/\*, hotfix/\* ; structure le cycle de vie des versions. Toute intégration passe par une **Merge Request** soumise à au moins une approbation, les branches main et develop étant **protégées contre tout push direct**. Les conventions **Conventional Commits** et le **Semantic Versioning** assurent la traçabilité et permettent la génération automatique de changelogs. Des templates de MR, ainsi qu'une checklist de définition de terminé (DoD), complètent ce cadre.

#### **2.3 Serveur CI \- Jenkins** 

Jenkins orchestre l'intégralité des pipelines du workflow : build, tests, scans de qualité et de sécurité, packaging des artefacts et déploiements vers les environnements cibles. Il centralise les rapports d'exécution et historise chaque run pour permettre l'audit et le diagnostic. Jenkins est retenu pour son extensibilité, son écosystème de plugins couvre l'ensemble des stacks utilisées par l'agence et sa compatibilité avec tous les types de projets traités par Furious Ducks.

Les pipelines sont systématiquement définis sous forme de **Jenkinsfile** versionnés dans les dépôts de chaque projet (**Pipeline as Code**), ce qui rend la configuration des builds modifiable sans accès à l'interface Jenkins. Les credentials sont gérés via le **Jenkins Credentials Store** avec rotation régulière, et les agents Jenkins sont configurés de manière éphémère (ou dédiés) pour isoler les exécutions entre jobs. Les **Shared Libraries Jenkins** permettent de standardiser les étapes communes sans duplication entre projets. Un **RBAC strict** structure les accès en trois rôles : admin CI, mainteneur et développeur.

#### **2.4 Stockage des images Docker (Registry) \- Harbor** 

Harbor centralise le stockage de l'ensemble des images Docker produites par la CI. Il assure leur signature, leur scan de vulnérabilités et l'application de politiques de rétention, et garantit que la même image construite une fois peut être réutilisée à l'identique à travers les environnements sans reconstruction. Cette promotion contrôlée d'une image de DEV vers PREPROD puis vers PROD est la condition de la reproductibilité des déploiements : chaque image taggée et certifiée par Harbor correspond exactement à ce qui s'exécute en production. La centralisation dans un registre unique simplifie également la maintenance, la sécurisation et la sauvegarde de l'ensemble des artefacts produits par l'agence.

Les conventions de nommage et de tagging suivent le standard app:1.2.3, app:commitSHA et app:releasex. Une politique de rétention et de garbage collection est définie pour éviter l'explosion du stockage, et les accès sont segmentés par projet.

#### **2.5 Tests applicatifs et qualité de code**

La stratégie de tests repose sur un socle commun agnostique au langage, complété d'outils propres à chaque stack. Pour les tests API, Postman/Newman ou un équivalent assure la validation des échanges entre services. Les tests end-to-end s'appuient sur Playwright ou Cypress pour couvrir les parcours utilisateurs critiques. Les tests unitaires sont assurés par PHPUnit pour les projets PHP, Jest pour JavaScript/Node.js, Pytest pour Python et RSpec pour Ruby. L'ensemble suit la pyramide de tests : un volume important de tests unitaires, un volume moindre de tests d'intégration et d'E2E. Le pipeline échoue automatiquement en cas d'échec et les tests s'exécutent dans des environnements isolés pour garantir leur indépendance. Cette couverture de tests sécurise les échanges API, valide les parcours utilisateurs, limite les régressions et réduit les bugs atteignant la production.

L'analyse statique de la qualité du code est confiée à **SonarQube Community Edition**. SonarQube mesure la dette technique, les duplications, la complexité cyclomatique et la couverture de code à partir des rapports générés par les tests unitaires. Des **quality gates** automatiques bloquent le pipeline si les seuils définis ne sont pas atteints (couverture minimale, nombre de bugs critiques) avant tout déploiement en PREPROD ou en PROD. Le suivi dans le temps de la dette technique et de la couverture par projet permet d'arbitrer les efforts de refactoring de manière objective et de maintenir un code lisible et homogène à travers l'ensemble des projets de l'agence.

Les tests de performance sont réalisés via **K6** (Grafana K6) en environnement PREPROD. K6 exécute des scénarios de charge pour valider la tenue en charge avant chaque mise en production, notamment lors de campagnes marketing ou de pics de trafic attendus comme ceux du projet Thé Tip Top(ex. campagnes d’influenceurs). Open source et exécutable en ligne de commande, il s'intègre directement dans un stage Jenkins dédié, et ses scripts, écrits en JavaScript, sont versionnés avec le code source du projet. Les tests de performance sont systématiques en PREPROD avant toute promotion en PROD.

#### **2.6 Environnements et QA**

Le workflow distingue trois environnements Docker dédiés : **DEV**, support de l'intégration continue et des tests automatisés ; **PREPROD**, environnement de validation fonctionnelle et technique au plus proche de la production ; et **PROD**, l'environnement de production. La PREPROD constitue le support de la phase de QA, qui recouvre la recette fonctionnelle (interne ou cliente) et les démonstrations lors des Sprint Reviews. Cette séparation claire des contextes d'exécution protège la production contre des changements non validés et permet d'anticiper les comportements sous charge, notamment lors de campagnes d'influenceurs ou de pics de trafic, avant toute mise en ligne.

La bonne pratique centrale est la **parité de configuration entre PREPROD et PROD**. Sont identiques : les images Docker (mêmes tags), les versions de services (Traefik, runtime, base de données), les templates docker-compose, les règles reverse-proxy (labels Traefik), les probes et healthchecks, ainsi que les dashboards et alertes. Sont volontairement distincts : les données, anonymisées en PREPROD ; les secrets, séparés entre contexte sandbox et contexte de production ; les ressources matérielles, ajustées si nécessaire tout en conservant une configuration logicielle strictement identique ; et les intégrations externes (paiement, email, SMS), activées en mode sandbox quand c'est possible.

#### **2.7 Métriques, monitoring et logs \- Prometheus, Grafana, Loki**

La supervision du workflow repose sur la stack **Prometheus** (collecte des métriques), **Grafana** (dashboards et alerting) et **Loki** (agrégation des logs). ELK peut être substitué à Loki si les volumes de logs nécessitent un outillage plus lourd. Ce triptyque assure le suivi des performances (CPU, RAM, disque), de la disponibilité des services et des indicateurs applicatifs (latence, taux d'erreur), et génère des alertes vers les canaux de notification configurés (mail, messagerie). Avant sa mise en place, les incidents étaient découverts trop tard, souvent signalés en premier par le client ; la supervision rend l'exploitation proactive et permet de mesurer objectivement la qualité de service et les performances des déploiements.

L'alerting est basé sur les symptômes plutôt que sur les causes : taux d'erreur, latence, saturation des ressources. Les dashboards sont standardisés pour l'ensemble des projets et la journalisation est centralisée dans Loki pour en permettre l'interrogation unifiée.

#### **2.8 Backups automatisés \- Restic et MinIO**

Les sauvegardes automatisées reposent sur **Restic**, couplé à un stockage objet S3-compatible assuré par **MinIO**. Restic sauvegarde les données, configurations et volumes Docker du workflow et permet une restauration rapide en cas d'incident majeur, de corruption de données ou d'erreur humaine. Protéger l'intégralité du workflow et sécuriser les projets clients contre un risque de perte totale est une responsabilité de premier ordre pour l'agence ; Restic y répond de manière fiable, légère et entièrement open source.

La politique de rétention retenue suit un schéma Grandfather-Father-Son : les snapshots des 7 derniers jours sont intégralement conservés, puis un snapshot par semaine sur les 4 semaines suivantes, un snapshot par mois sur les 6 mois suivants, et un snapshot par an sur les 2 années suivantes ; les snapshots excédentaires sont supprimés automatiquement lors du nettoyage mensuel.

#### **2.9 Sécurité intégrée au pipeline \- DevSecOps**

La sécurité est intégrée directement dans les pipelines via quatre outils complémentaires. **Trivy** scanne les images Docker à la recherche de vulnérabilités connues. L'audit des dépendances applicatives est assuré par les outils natifs des stacks : npm audit, composer audit et équivalents. **Semgrep** réalise une analyse statique du code source (SAST) pour détecter les patterns dangereux. **Gitleaks** détecte les secrets, credentials et tokens accidentellement commités dans le code source, opère via un hook pre-commit local sur chaque poste développeur, et bloque le pipeline aux stades DEV et PREPROD si des secrets exposés sont trouvés. Ces outils sont open source, légers et s'intègrent directement dans Jenkins sans configuration complexe. Dans une agence multi-clients, le risque réputationnel lié à une fuite de données est élevé ; la sécurité est conçue by design, conformément aux exigences du RGPD.

La gestion des secrets suit une politique stricte. Les secrets CI/CD (tokens de registry, clés API, credentials SonarQube, accès S3/MinIO) sont stockés exclusivement dans le **Jenkins Credentials Store**. Les secrets applicatifs sont injectés via variables d'environnement (fichiers .env non versionnés, générés à partir d'un .env.example versionné dans chaque dépôt) ; la transmission des valeurs réelles est assurée par l'Admin CI via un canal sécurisé. Chaque environnement (DEV, PREPROD et PROD) dispose de jeux de credentials distincts, jamais partagés entre eux. Seuls les rôles **Admin CI** et **Mainteneur** peuvent créer ou modifier des credentials ; les développeurs ne voient jamais les secrets en clair grâce au masquage Jenkins. La rotation des comptes techniques est effectuée trimestriellement, ou immédiatement en cas de suspicion d'exposition ; les tokens à expiration sont privilégiés. L'ensemble des actions sensibles (création ou modification de credentials, accès admin) est journalisé. Le principe « **aucun secret dans Git** » est appliqué à trois niveaux : prévenu en amont par le hook pre-commit, contrôlé dans le pipeline DEV, et validé de manière bloquante dans le pipeline PREPROD.

Toute exception à ces règles (contournement d'un quality gate Semgrep, Trivy ou Gitleaks) doit être documentée (raison, durée, plan de correction), validée par le Tech Lead ou le DevOps, tracée dans une Merge Request et un ticket, et limitée au strict nécessaire en termes de périmètre et de durée.

#### **2.10 Standards transverses**

Afin de garantir un workflow industrialisé, cohérent et réutilisable pour l'ensemble des projets de l'agence, un ensemble de standards communs est appliqué de manière transverse. La gestion du code suit la stratégie **GitFlow**, retenue pour sa clarté et son adéquation aux cycles de release multi-projets de l'agence. Le **Semantic Versioning** régit le numérotage des versions, et les **Conventional Commits** structurent l'historique Git pour en permettre l'exploitation automatisée (changelogs, génération de tags). Les **quality gates** : linting, tests automatisés, analyse SonarQube et scans de sécurité sont obligatoires avant tout déploiement en PREPROD et en PROD. La promotion des versions suit un chemin unique : DEV → PREPROD → PROD via une **image Docker identique**, sans reconstruction. Harbor constitue le **registre unique** pour l'ensemble des projets. L'ensemble de la configuration (pipelines, infrastructure, services) est géré **as code** via des Jenkinsfiles, des fichiers docker-compose et des templates versionnés. Chaque projet dispose d'un README et de runbooks couvrant les procédures d'incident, de rollback et de restauration.

#### **Conclusion**

Les choix techniques retenus permettent à Furious Ducks de disposer d’un workflow de production cohérent et industrialisé, capable de s’adapter à la diversité des projets de l’agence tout en garantissant un haut niveau de qualité et de fiabilité. En s’appuyant sur des outils open source, une conteneurisation systématique et des standards communs, l’agence sécurise ses mises en production, réduit les risques opérationnels et améliore la lisibilité de ses processus. Ce socle constitue une base évolutive, pensée à la fois pour les besoins actuels de l’agence et pour sa montée en maturité DevOps.

### 3\. Hébergement et backups {#3.-hébergement-et-backups}

#### **3.1 Principes généraux d'hébergement**

L'hébergement du workflow CI/CD et des environnements projets doit répondre à plusieurs objectifs majeurs pour l'agence Furious Ducks. La fiabilité et la disponibilité des services critiques (SCM, CI, registry, monitoring) constituent la première exigence, complétées par une capacité de scalabilité permettant d'absorber des pics de charge ponctuels, comme lors des campagnes marketing. La sécurité des données clients et du code source, la maîtrise des coûts en cohérence avec une démarche RSE, et l'indépendance technologique via des solutions open source et des standards ouverts en forment les autres axes structurants.

Dans ce cadre, il est recommandé de s'appuyer sur une infrastructure cloud ou serveurs dédiés, reposant sur des distributions Linux, et entièrement conteneurisée via Docker.

#### **3.2 Architecture d'hébergement préconisée**

L'infrastructure est organisée autour de plusieurs nœuds distincts, afin d'isoler les rôles critiques et d'améliorer la résilience globale.

**a) Serveurs socle du workflow (CI/CD & outils)**

Ces serveurs hébergent les composants centraux du workflow : le SCM (Git), la plateforme d'intégration continue (Jenkins), le registry Docker (Harbor), les outils de monitoring et de métriques, ainsi que les outils de sauvegarde.

**Préconisations minimales par serveur socle :**

| Ressource | Préconisation |
| ----- | ----- |
| CPU | 8 vCPU |
| RAM | 16 à 32 Go |
| Disque | 500 Go SSD NVMe |
| Bande passante | 1 Gbps |
| OS | Linux (Debian / Ubuntu Server) |

Ces services sont fortement sollicités en I/O et en CPU lors des builds, des scans et du stockage des images Docker.

**b) Environnements projets (DEV / PREPROD)**

Ces environnements hébergent les applications clientes en cours de développement et de validation.

**Préconisations par environnement mutualisé :**

| Ressource | Préconisation |
| ----- | ----- |
| CPU | 4 à 8 vCPU |
| RAM | 8 à 16 Go |
| Disque | 200 à 500 Go SSD |
| Bande passante | 500 Mbps à 1 Gbps |

Ces ressources peuvent être mutualisées entre plusieurs projets grâce à la conteneurisation.

**c) Environnements de production**

Les environnements de production sont dimensionnés selon les projets.

À titre d'exemple, pour le projet Thé Tip Top, un dimensionnement spécifique est requis afin d'absorber un fort trafic ponctuel.

**Préconisation initiale pour Thé Tip Top (scalable) :**

| Ressource | Préconisation |
| ----- | ----- |
| CPU | 8 vCPU |
| RAM | 16 Go |
| Disque | 500 Go SSD |
| Bande passante | ≥ 1 Gbps |

L'architecture devra permettre l'ajout rapide de ressources et une montée en charge horizontale si nécessaire, tout en assurant une supervision renforcée pendant la durée du jeu-concours.

#### **3.3 Disponibilité, SLA et GTR**

**a) SLA (Service Level Agreement)**

Les niveaux de service recommandés sont les suivants :

| Service | SLA MVP (Phase 1\) | SLA cible (Phase HA) |
| ----- | ----- | ----- |
| SCM / CI | 99,5 % | 99,9 % |
| Environnements de production | 99,5 % | 99,9 % |
| Monitoring | 99,0 % | 99,5 % |

Ces niveaux garantissent un équilibre entre disponibilité, coût et réalisme opérationnel pour une agence de cette taille.

**b) GTR (Garantie de Temps de Rétablissement)**

| Criticité | GTR cible |
| ----- | ----- |
| Incident bloquant CI/CD | \< 4 heures |
| Incident production | \< 2 heures |
| Incident non critique | \< 24 heures |

Le monitoring et l'alerting automatisés permettent de respecter ces délais sans dépendre exclusivement des retours clients.

**c) Hypothèses et moyens pour tenir les SLA/GTR**

Les valeurs SLA/GTR sont des objectifs internes (SLO) servant de référence opérationnelle, ajustables selon le niveau d'architecture (MVP vs HA) et les contraintes clients. En régime normal, les incidents sont traités en heures ouvrées ; pendant les périodes critiques (déploiements PROD et campagne Thé Tip Top) une astreinte ciblée complète une surveillance renforcée.

Les mécanismes de tenue reposent sur l'alerting Prometheus/Grafana, des runbooks couvrant les procédures d'incident, de rollback et de restauration, des tests de restauration planifiés, et une validation manuelle en PROD destinée à réduire les incidents évitables.

L'architecture initiale à 4 VPS ne dispose pas de redondance active : aucun réplica SCM, aucun nœud Jenkins secondaire, registry Harbor sur un seul hôte. Dans ce contexte, une maintenance planifiée ou une panne matérielle entraîne une indisponibilité totale du service concerné, rendant le 99,9 % intenable sur le périmètre CI/SCM. Les SLA MVP (99,5 %) sont calculés sur la base d'une tolérance de \~3,6 h d'indisponibilité mensuelle, cohérente avec une fenêtre de maintenance mensuelle de 2 h (nuit, hors astreinte), un MTTR moyen estimé à 1 h sur incident courant, et l'absence de basculement automatique. Dès que des SLA contractuels à 99,9 % sont requis (notamment pour la production Thé Tip Top en période de campagne) l'activation de l'option HA est obligatoire.

**d) Architecture cible HA (option)**

Pour atteindre 99,9 % de disponibilité sur les services critiques (SCM, CI, production), une évolution vers une architecture haute disponibilité est préconisée selon le calendrier suivant.

| Composant | Évolution MVP → HA | Impact SLA |
| ----- | ----- | ----- |
| GitLab CE | Réplication Geo (1 nœud primaire \+ 1 secondaire) ou migration GitLab HA | SCM : 99,5 % → 99,9 % |
| Jenkins | Ajout d'un nœud controller en standby chaud (ou bascule manuelle documentée) | CI : 99,5 % → 99,9 % |
| Harbor Registry | Volume partagé NFS/S3 ou réplication inter-nœuds | Registry : 99,5 % → 99,9 % |
| Base de données (GitLab/Jenkins) | PostgreSQL en streaming replication (primaire \+ réplica) | Réduction MTTR BDD |
| Reverse proxy Traefik | Déploiement en mode actif/passif sur 2 nœuds | Élimination SPOF réseau |

**Surcoût infrastructure estimé** : \+3 VPS supplémentaires (\~330 EUR/mois), soit un total de \~830 EUR/mois pour l'infrastructure.

**Recommandation opérationnelle** : démarrer en MVP pour les 6 premiers mois (développement, recette Thé Tip Top hors période campagne), puis activer l'option HA avant la mise en production de la campagne jeu-concours (J-30 de l'ouverture).

#### **3.4 Politique de sauvegarde (Backups)**	

La stratégie de sauvegarde doit couvrir l'intégralité du workflow et des projets, conformément aux exigences du cahier des charges.

**a) Périmètre des sauvegardes**

Sont sauvegardés automatiquement les bases de données applicatives, les dépôts Git, les images Docker critiques stockées dans le registry Harbor, les configurations CI/CD, les volumes persistants Docker, ainsi que les métriques et logs essentiels.

**b) Fréquence et rétention des sauvegardes**

Politique de rétention :

| Période | Rétention | Nombre max de snapshots |
| ----- | ----- | ----- |
| 7 derniers jours | Tous les snapshots | \~7 |
| 4 dernières semaines | 1 par semaine | 4 |
| 6 derniers mois | 1 par mois | 6 |
| 2 dernières années | 1 par an | 2 |

Cette politique offre un bon compromis entre sécurité et consommation de stockage, en garantissant des points de restauration à court, moyen et long terme, jusqu'à deux ans en archive légale. 

**c) Sécurité et bonnes pratiques des backups**

Les sauvegardes sont chiffrées au repos et en transit, et stockées sur un support distinct selon le principe 3-2-1. Les accès sont restreints et journalisés. Une vérification d'intégrité automatique est effectuée chaque semaine, et des tests de restauration complets sont planifiés trimestriellement.

Un backup non testé est considéré comme non fiable.

#### **3.5 Lien avec la continuité d'activité**

Cette architecture d'hébergement et de sauvegarde permet une reprise rapide après incident, assure la continuité de service pour les projets critiques et réduit les risques financiers et réputationnels pour Furious Ducks et ses clients.

#### **Conclusion**

Les préconisations d'hébergement et de sauvegarde proposées permettent à Furious Ducks de disposer d'une infrastructure robuste, scalable et sécurisée, capable de soutenir la montée en charge des projets et l'industrialisation de la production. Elles constituent un socle fiable pour le workflow CI/CD et s'inscrivent pleinement dans une démarche DevOps et RSE.

## 

## 

## 

## 

## **Diagramme d’infrastructure complet du workflow** {#diagramme-d’infrastructure-complet-du-workflow}

Ce document présente l'architecture complète du workflow CI/CD pour l'agence Furious Ducks, incluant tous les services, ports, protocoles et flux de communication.

### Vue d'ensemble de l'infrastructure {#vue-d'ensemble-de-l'infrastructure}

### ![][image4]

*Figure 2 : Diagramme d’infrastructure complet du workflow*

### Table des ports et protocoles {#table-des-ports-et-protocoles}

#### **Reverse Proxy \- Traefik**

| Service | Port interne | Port externe | Protocole | Description |
| ----- | ----- | ----- | ----- | ----- |
| Traefik Dashboard | 8080 | 443 | HTTPS | Interface d’administration sécurisée via Traefik |
| HTTP | 80 | 80 | HTTP | Redirection automatique vers HTTPS |
| HTTPS | 443 | 443 | HTTPS/TLS | Point d'entrée principal |

**Sous-domaines gérés :**

| Sous-domaine | Service  |
| ----- | ----- |
| git.wk-archi-o24a-4-5-G1.fr | GitLab |
| ci.wk-archi-o24a-4-5-G1.fr | Jenkins |
| registry.wk-archi-o24a-4-5-G1.fr | Harbor |
| monitor.wk-archi-o24a-4-5-G1.fr | Grafana |
| sonar.wk-archi-o24a-4-5-G1.fr | SonarQube |
| s3.wk-archi-o24a-4-5-G1.fr | MinIO |

#### **SCM \- GitLab Community Edition**

| Service | Port interne | Port externe | Protocole | Description |
| ----- | ----- | ----- | ----- | ----- |
| Web UI | 80 | 443 | HTTPS | Interface web GitLab via Traefik |
| SSH Git | 22 | 2222 | SSH/TCP | Clone, push, pull via port publié sur l’hôte |

Sur le plan des communications, GitLab envoie des webhooks HTTP vers Jenkins lors des événements Git tels que les push et les merge requests, reçoit les connexions SSH des développeurs pour les opérations de clone, push et pull, et expose une API REST pour les intégrations.

#### **CI Server \- Jenkins**

| Service | Port interne | Port externe | Protocole | Description |
| ----- | ----- | ----- | ----- | ----- |
| Web UI | 8080 | 443 | HTTP | Interface Jenkins (via Traefik) |
| Webhook Receiver | 8080 | 443 | HTTP | Réception webhooks GitLab |
| Agent JNLP | 50000 | 50000 | TCP | Communication avec agents Jenkins |

Côté communications sortantes, Jenkins clone le code via SSH sur le port 22 vers GitLab, pousse les images vers Harbor en HTTPS sur le port 443, déclenche les déploiements via l'API Docker en TLS sur le port 2376 et transmet les résultats d'analyse qualité vers SonarQube sur le port 9000\. Les secrets utilisés pour ces communications sont gérés en interne via le Jenkins Credentials Store.

Les agents Jenkins sont des conteneurs éphémères fonctionnant en Docker-in-Docker, communiquent avec le controller via le protocole JNLP sur le port 50000, publié directement sur l'hôte, et disposent d'un accès réseau isolé par projet.

#### **Registry Docker \- Harbor**

| Service | Port interne | Port externe | Protocole | Description |
| ----- | ----- | ----- | ----- | ----- |
| Web UI \+ Docker Registry API v2 | 80 | 443 | HTTPS | Interface Harbor et push/pull images Docker |

Harbor intègre un scan de vulnérabilités (Trivy/Clair), prend en charge la réplication inter-registries, applique des politiques de rétention automatiques et gère les droits d'accès par projet via RBAC. 

#### **Analyse qualité code \- SonarQube\***

| Service | Port interne | Protocole | Description |
| ----- | ----- | ----- | ----- |
| Web UI / API | 9000 | HTTP | Interface SonarQube (via Traefik) |
| Base de données (PostgreSQL) | 5432 | TCP (interne) | Base interne de SonarQube, sans port hôte |

SonarQube reçoit les rapports d'analyse transmis par Jenkins et ses agents CI, stocke les métriques de qualité du code (couverture, dette technique, duplications) et expose une API REST pour s'intégrer aux pipelines. 

#### **Monitoring \- Prometheus \+ Grafana \+ Loki**

#### **Prometheus**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| Web UI | 9090 | HTTP | Interface Prometheus |
| API | 9090 | HTTP | PromQL queries |

**Targets scraping :**

| Cible | Port | Métriques |
| ----- | ----- | ----- |
| Jenkins | 8080 | Endpoint de métriques  |
| Harbor | 8080 | Métriques |
| Node Exporter | 9100 | Métriques système |
| cAdvisor | 8081 | Métriques conteneurs Docker |
| PostgreSQL Exporter | 9187 | Métriques base de données |
| Application metrics | Variable | Selon le service |

#### **Grafana**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| Web UI | 3000 | HTTP | Dashboards (via Traefik) |

Grafana s'appuie sur deux sources de données : Prometheus, interrogé en PromQL, et Loki, interrogé en LogQL.

#### **Loki**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| HTTP | 3100 | HTTP | API ingestion & query |
| gRPC | 9095 | gRPC | Communication interne |

La collecte des logs repose sur Promtail, déployé en agent sur chaque serveur, et sur le driver de logging Docker natif. Le port gRPC (9095) n'est pas publié sur l'hôte, Loki reste accessible uniquement depuis le réseau Docker interne, par Promtail et Grafana.

#### **cAdvisor**

| Service | Port interne | Port externe | Protocole | Description |
| ----- | ----- | ----- | ----- | ----- |
| Web UI / API | 8080 | 8081 | HTTP | Métriques conteneurs Docker (CPU, RAM, réseau) |

#### **AlertManager**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| Web UI | 9093 | HTTP | Gestion alertes |
| API | 9093 | HTTP | Réception alertes Prometheus |

Les notifications sont relayées par email via SMTP sur les ports 587 ou 465, et par Mattermost via webhook HTTPS. 

#### **Backups \- Restic \+ MinIO**

#### **Restic**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| \- | \- | \- | Client CLI uniquement |

Restic se connecte à MinIO via l'API S3 sur le port 9000 et chiffre les données en AES-256 localement avant leur envoi. 

#### **MinIO**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| S3 API | 9000 | HTTP/HTTPS | API compatible S3 |
| Console UI | 9001 | HTTP/HTTPS | Interface web MinIO |

Le système exécute une sauvegarde complète quotidienne à 2h. La politique de rétention, appliquée lors du nettoyage mensuel, conserve l'intégralité des snapshots des 7 derniers jours, puis ne conserve plus qu'un snapshot par semaine sur les 4 semaines suivantes, un snapshot par mois sur les 6 mois suivants, et un snapshot par an sur les 2 années suivantes ; les snapshots excédentaires sont supprimés automatiquement.

#### **Sécurité\***

Trivy s'intègre directement dans le pipeline Jenkins en ligne de commande, sans port exposé, et s'appuie sur une base de données de vulnérabilités mise à jour quotidiennement.

Semgrep s'intègre de la même manière au niveau des agents CI du pipeline Jenkins, également en ligne de commande sans port exposé, et réalise l'analyse statique du code source avant le push vers le registry.

#### **Environnements Applicatifs**

#### **Environnement DEV**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| Application Web | 80/443 | HTTP/HTTPS | App conteneurisée |
| Base de données | 5432 | TCP | PostgreSQL |
| Redis (cache) | 6379 | TCP | Cache applicatif |

L'environnement DEV se caractérise par un déploiement automatique à chaque push sur develop, des données de test régénérées et des logs verbeux activés.

#### **Environnement PREPROD**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| Application Web | 80/443 | HTTP/HTTPS | Validation QA |
| Base de données | 5432 | TCP | Données anonymisées |
| Redis | 6379 | TCP | Configuration identique PROD |

L'environnement PREPROD reproduit la configuration de production et sert à la validation fonctionnelle et technique, aux tests de charge et de performance, ainsi qu'aux démonstrations lors des Sprint Review. 

#### **Environnement PROD**

| Service | Port | Protocole | Description |
| ----- | ----- | ----- | ----- |
| Application Web | 80/443 | HTTP/HTTPS | Production |
| Base de données | 5432 | TCP | Données production |
| Redis | 6379 | TCP | Cache haute performance |

L'environnement PROD repose sur un déploiement manuel soumis à validation, un monitoring renforcé, des backups automatiques quotidiens et une stratégie de déploiement Blue/Green.

#### **Flux de Communication Principaux**

*![][image5]*  
*Figure 3 : Flux de communication principaux*

#### 

#### 

#### **Sécurité Réseau**

**Règles de pare-feu recommandées**

Pour les entrées publiques depuis Internet, le port 80 en HTTP et le port 443 en HTTPS sont réservés à Traefik, le port 2222 en SSH est dédié à GitLab, et le port 50000 permet la connexion des agents Jenkins en JNLP. Les ports 8080 (dashboard Traefik) et 8081 (cAdvisor) sont également publiés sur l'hôte à des fins de debug ; leur exposition publique n'est pas recommandée et devrait être restreinte au réseau interne ou à une liste d'IP autorisées. En interne, tous les services communiquent via le réseau Docker, sans exposition directe en dehors de Traefik. Côté sorties autorisées, le port 443 en HTTPS permet les mises à jour et les webhooks externes, les ports 25, 587 et 465 en SMTP acheminent les notifications email, et le port 53 assure la résolution DNS.

#### **Bonnes pratiques**

La segmentation réseau repose sur quatre réseaux Docker à rôle fonctionnel (CI/CD, monitoring, backup, cf. Convention de Nommage), complétés par une isolation applicative assurée par Traefik : chaque service est exposé sur un sous-domaine dédié en HTTPS, et les environnements DEV/PREPROD/PROD d'un même projet sont distingués par convention de nommage (suffixes \-dev/-preprod/-prod) plutôt que par une segmentation réseau dédiée. Le chiffrement impose TLS 1.2 ou supérieur sur l'ensemble des flux, des certificats Let's Encrypt renouvelés automatiquement, et une gestion des secrets centralisée via le Jenkins Credentials Store. L'authentification privilégie OAuth2/OIDC pour les services qui le permettent, des clés SSH protégées par passphrase, et la double authentification pour les accès administrateur. Les logs d'audit tracent l'ensemble des actions administrateur, sont conservés 90 jours au minimum, et font l'objet d'une analyse automatique des anomalies.

### Dimensionnement Réseau {#dimensionnement-réseau}

#### **Bande passante recommandée**

| Service | Bande passante minimale | Justification |
| ----- | ----- | ----- |
| Serveur CI/CD | 1 Gbps | Transfert images Docker volumineuses |
| Environnements DEV | 500 Mbps | Trafic modéré |
| Environnement PREPROD | 1 Gbps | Tests de charge |
| Environnement PROD | 1 Gbps minimum | Trafic utilisateur \+ pics |
| Backup/Storage | 500 Mbps | Transferts nocturnes principalement |

#### **Latence réseau**

La latence entre les services CI/CD doit rester inférieure à 5 ms. Les échanges vers les environnements applicatifs s'effectuent dans un délai inférieur à 10 ms, et les transferts vers le stockage de sauvegarde tolèrent une latence maximale de 20 ms.

#### **Exemple Projet Thé Tip Top**

Le projet **Thé Tip Top** présente un profil de trafic particulier : le jeu-concours génère une charge concentrée sur une période courte, ce qui impose un dimensionnement PROD spécifique. **Traefik** assure le routage et l'équilibrage de charge entre les conteneurs applicatifs, permettant d'exploiter la stratégie Blue/Green déjà en place pour absorber les pics sans interruption de service. **Redis** fournit un cache haute performance en configuration standalone. Le monitoring est renforcé pendant toute la durée de la campagne : **Prometheus**, **Grafana** et **AlertManager** assurent une supervision en temps réel et une réactivité accrue sur les alertes critiques. Traefik expose l'application sur 80/443 et les services restants communiquent en interne via le réseau Docker.

#### **Convention de Nommage**

**Services Docker**

Format socle CI/CD : common-{service}-{env}  
Format services applicatifs : {projet}-{service}-{env}

L'infrastructure distingue deux périmètres de nommage. Les services du socle CI/CD (Traefik, GitLab, Jenkins, SonarQube et leurs dépendances) utilisent le préfixe common avec le suffixe d'environnement ci : common-traefik-ci, common-gitlab-ci, common-jenkins-ci. Les services applicatifs des projets clients suivent le même schéma en substituant le préfixe par le nom du projet et le suffixe par l'environnement cible : thetiptop-api-dev, thetiptop-frontend-preprod, thetiptop-db-prod. Exception pour le conteneur applicatif PROD : la stratégie Blue/Green impose deux instances nommées {projet}-prod-blue et {projet}-prod-green (ex. thetiptop-prod-blue), une seule étant routée par Traefik à un instant donné.

**Volumes**

Format socle CI/CD : common-{service}-data-{env}  
Format services applicatifs : {projet}-{service}-data-{env}

La même logique s'applique aux volumes persistants. Les volumes du socle incluent le suffixe d'environnement : common-gitlab-data-ci, common-jenkins-data-ci, common-prometheus-data-ci. Les volumes applicatifs suivront le même modèle avec le préfixe projet : thetiptop-postgres-data-prod, thetiptop-redis-data-dev.

**Réseaux**

L'infrastructure repose sur quatre réseaux Docker à rôle fonctionnel, sans isolation par environnement au niveau réseau. ci\_network est le réseau principal partagé, déclaré en external: true dans les stacks monitoring et backup afin que tous les services puissent communiquer sans recréer le réseau. workflow-network regroupe les services CI/CD — Traefik, GitLab, SonarQube et leurs dépendances. monitoring\_network isole les services de supervision (Prometheus, Grafana, Loki, AlertManager), et backup\_network ceux dédiés à la sauvegarde (Restic, MinIO).

#### **Outils d'Administration**

**Accès SSH d'urgence**

L'accès SSH aux serveurs est restreint à l'authentification par clé, sans mot de passe autorisé. L'ensemble des connexions est collecté et centralisé dans Loki pour assurer la traçabilité des accès et faciliter l'audit.

**Docker Management**

\# Commandes courantes  
docker ps \# Liste conteneurs  
docker logs \-f \<container\> \# Logs en temps réel  
docker stats \# Métriques ressources  
docker network ls \# Liste réseaux

**Maintenance**

Les redémarrages de services s'effectuent via Docker Compose, une migration vers Kubernetes étant envisagée à terme si la croissance de l'agence le justifie. Les mises à jour s'appuient sur des images taguées avec un déploiement progressif, ce qui permet de revenir à la version précédente en moins de 5 minutes en cas d'incident.

## 

## 

## 

## 

## **Gestion des ressources humaines** {#gestion-des-ressources-humaines}

### 1\. Recrutement {#1.-recrutement}

#### **Fiche de poste \- Ingénieur DevOps / Administrateur Infrastructure CI/CD**

**Informations générales**

| Élément | Détail |
| ----- | ----- |
| Intitulé du poste | Ingénieur DevOps \- Responsable Infrastructure CI/CD |
| Entreprise | Furious Ducks |
| Direction | Direction Technique |
| Rattachement hiérarchique | Mr Guido Brasletti, Directeur (supervision globale) |
| Encadrement fonctionnel | Chef de projet (CDP) pour les aspects projet |
| Lieu de travail | Siège de l'agence (télétravail partiel possible) |
| Type de contrat | CDI |
| Statut | Cadre |

##### **Résumé du poste**

L'agence Furious Ducks, spécialisée dans les technologies open source depuis 2007, a engagé une transformation de ses méthodes de travail autour d'un **workflow CI/CD industrialisé**. Ce workflow repose sur une infrastructure entièrement conteneurisée (Docker), orchestrée par Jenkins, et intégrant des outils de monitoring, de sauvegarde et de sécurité.

Le poste consiste à **prendre en charge la maintenance, l'évolution et la supervision de cette infrastructure**, afin de garantir sa disponibilité et sa fiabilité pour l'ensemble des projets de l'agence.

##### **Missions principales**

* Assurer la disponibilité et la performance de l'infrastructure CI/CD (Jenkins, GitLab/Gitea, Harbor, Traefik) et faire évoluer les pipelines (Jenkinsfiles, Shared Libraries).

* Gérer le cycle de vie des conteneurs et images Docker (build, push, rétention, garbage collection) et administrer le reverse proxy Traefik (routage, TLS, middlewares de sécurité).

* Administrer les environnements de développement, test, pré-production et production, en garantissant leur parité de configuration et le dimensionnement des ressources serveur.

* Administrer la stack de monitoring (Prometheus, Grafana, Loki), configurer les alertes et dashboards, et respecter les SLA en vigueur (99,5 % en phase MVP, 99,9 % en phase HA), en documentant tout écart dans le registre d'incidents.

* Administrer la solution de backup (Restic \+ MinIO), garantir l'application de la politique de sauvegarde et du principe 3-2-1, et exécuter des tests de restauration trimestriels minimum.

* Maintenir les outils de scan de sécurité du pipeline (Trivy, Semgrep), appliquer le principe du moindre privilège (RBAC, gestion des secrets), veiller à la conformité RGPD et assurer la rotation des credentials.

* Accompagner les développeurs dans l'utilisation du workflow, rédiger et maintenir la documentation technique (runbooks, procédures d'incident, guides), et participer à la formation des équipes.

##### **Profil recherché**

* Formation Bac+3 à Bac+5 en informatique, systèmes et réseaux ou équivalent ; certifications appréciées : Docker Certified Associate, Certified Jenkins Engineer, Linux Foundation (LFCS/LFCE).  
* 3 ans minimum d'expérience en administration système / DevOps / infrastructure, idéalement en environnement de production conteneurisé ; une expérience en agence web ou environnement multi-projets est un plus.

##### **Compétences techniques requises**

| Domaine | Compétences attendues |
| ----- | ----- |
| Conteneurisation | Docker, Docker Compose (maîtrise impérative) |
| CI/CD | Jenkins (pipelines déclaratifs, Shared Libraries, agents) |
| SCM | Git, GitLab CE ou Gitea, GitFlow |
| Système | Linux (Debian/Ubuntu Server), administration serveur |
| Reverse proxy | Traefik (routage, TLS, middlewares) |
| Monitoring | Prometheus, Grafana, Loki |
| Backup | Restic ou BorgBackup, stockage objet (MinIO/S3) |
| Registry | Harbor ou Docker Registry |
| Sécurité | Trivy, Semgrep, gestion de secrets, RBAC |
| Scripting | Bash, Python ou équivalent |
| Réseau | DNS, HTTP/HTTPS, TLS, notions de pare-feu |

* Compétences appréciées : stacks web de l'agence (PHP, Node.js, Python, Ruby), outils de tests automatisés (Playwright, Cypress, Newman), notions de Kubernetes, outils d'Infrastructure as Code (Ansible, Terraform).  
* Qualités attendues : rigueur et méthode, autonomie dans le diagnostic et la résolution d'incidents, pédagogie auprès des développeurs, réactivité conforme aux GTR (2h en production, 4h sur CI/CD), curiosité technique et capacité à documenter et vulgariser.

##### **Évolutions possibles**

Le poste peut évoluer vers un rôle de Responsable Infrastructure / Lead DevOps avec la croissance de l'agence, incluant une montée en compétences vers Kubernetes et une implication croissante dans le conseil DevOps et la stratégie technique de Furious Ducks.

##### **Recommandations sur le contrat de travail**

Le poste répond à un besoin structurel et permanent : l'infrastructure CI/CD est critique pour l'ensemble de l'activité de l'agence, et la montée en compétences sur son environnement spécifique demande plusieurs mois, ce qui justifie un contrat en CDI favorisant la fidélisation du collaborateur. Le statut cadre ouvre le choix entre 35 heures hebdomadaires et un forfait jours de 218 jours par an, ce dernier étant recommandé pour sa flexibilité face aux contraintes d'astreinte et d'intervention en cas d'incident. Un régime d'astreinte encadré doit être prévu, à une fréquence recommandée d'une semaine sur quatre maximum dans un premier temps, avec compensation selon la convention collective applicable.

Les fourchettes de rémunération ci-dessous sont indicatives et basées sur le marché français pour un profil DevOps en 2025-2026 :

| Expérience | Salaire brut annuel (fourchette) |
| ----- | ----- |
| Junior (1-3 ans) | 35 000 \- 42 000 EUR |
| Confirmé (3-5 ans) | 42 000 \- 52 000 EUR |
| Senior (5+ ans) | 52 000 \- 65 000 EUR |

Pour Furious Ducks, le profil visé est un DevOps confirmé (3 à 5 ans), avec un salaire brut annuel dans la fourchette 42 000 à 50 000 EUR, ajustable selon la localisation géographique de l'agence et le coût de la vie local. Les avantages complémentaires recommandés comprennent le télétravail partiel (2 à 3 jours par semaine), un budget annuel de formation et certifications, la participation aux frais de transport, une mutuelle d'entreprise et une prime d'astreinte selon la convention collective.

La période d'essai recommandée est de 4 mois renouvelable une fois, conformément aux dispositions légales pour les cadres, ce qui permet de valider la montée en compétences sur l'infrastructure spécifique de l'agence. La convention collective applicable est généralement la Convention collective nationale des bureaux d'études techniques, cabinets d'ingénieurs-conseils et sociétés de conseil (SYNTEC / BETIC \- IDCC 1486), avec une position recommandée de 2.1 à 2.3 selon l'expérience du candidat (coefficient 115 à 150).

### 2\. Formation {#2.-formation}

#### **Plan de formation \- Ingénieur DevOps / Administrateur Infrastructure CI/CD**

#### **Informations générales**

| Élément | Détail |
| ----- | ----- |
| **Objet** | Parcours d'intégration et de montée en compétences |
| **Public cible** | Nouvel ingénieur DevOps recruté |
| **Durée totale estimée** | 12 semaines (6 phases de 2 semaines)  |
| **Lieu de formation** | Présentiel dans les locaux de l'agence (poste de travail dédié), avec accès à distance à l'environnement sandbox pour les phases d'autoformation et de mise en situation |
| **Effectif** | 1 collaborateur par session, accompagnement individualisé en binôme avec le référent technique |
| **Prérequis** | Connaissances Linux (administration de base), Docker, Git |
| **Responsable de la formation** | Direction Technique / Référent technique désigné |
| **Modalités** | Formation interne, autoformation guidée, mise en situation progressive |
| **Environnement** | Sandbox dédié (clone isolé de l'infrastructure de production) |

Le parcours structuré est précédé d'une semaine d'immersion en binôme sur le projet pilote en cours (S14 du planning projet), permettant au nouvel arrivant d'observer le workflow en conditions réelles avant le début du programme.

#### **Objectifs du plan de formation**

Ce plan vise à permettre au nouveau collaborateur de comprendre l'organisation et la culture de Furious Ducks, de maîtriser l'architecture globale du workflow CI/CD et l'ensemble des services qui la composent, et d'administrer l'infrastructure serveur (VPS Linux, conteneurisation Docker). Il doit également savoir configurer et maintenir Jenkins, les pipelines CI/CD et le SCM, administrer le reverse proxy Traefik (routage, TLS, middlewares) et opérer la stack de monitoring (Prometheus, Grafana, Loki). Le parcours couvre enfin l'exécution et la vérification des procédures de sauvegarde et de restauration, l'interprétation des résultats des scans de sécurité et l'application des pratiques DevSecOps, ainsi que le diagnostic et la résolution des incidents courants dans le respect des SLA et GTR en vigueur (99,5 % de disponibilité en phase MVP, 99,9 % en phase HA ; GTR inférieur à 4 heures en MVP et inférieur à 2 heures en HA pour la production, inférieur à 4 heures pour le CI/CD), et l'accompagnement des équipes de développement dans l'utilisation du workflow.

#### **Phase 1 \- Accueil et découverte (Semaines 1-2)**

##### **1.1 Intégration dans l'agence**

Cette première étape comprend la présentation de l'agence Furious Ducks, de son histoire et de ses valeurs autour de l'open source depuis 2007, ainsi qu'une rencontre avec les équipes (développeurs, chefs de projet, direction) et la présentation de l'organigramme et du rattachement hiérarchique à Mr Guido Brasletti. Le matériel est remis et les accès configurés, puis les outils obligatoires sont installés sur le poste de développement : Git, Node.js et Gitleaks, ce dernier étant requis par le hook pre-commit local de détection de secrets.

**Accès à configurer :**

| Ressource | Type d'accès | Niveau |
| ----- | ----- | ----- |
| VPS Principal | SSH | Admin |
| VPS Backup | SSH | Admin |
| GitLab CE / Gitea | Web | Admin |
| Jenkins | Web | Admin |
| Grafana | Web | Admin |
| Harbor (Registry) | Web \+ API | Admin |
| MinIO | Web \+ API | Admin |

##### **1.2 Découverte du contexte technique**

Cette phase couvre la lecture et l'appropriation de la documentation existante, notamment la présentation du workflow CI/CD, les choix techniques retenus et l'architecture d'hébergement avec sa politique de sauvegarde. Elle inclut également une présentation de l'architecture globale et un tour d'horizon des projets en cours et de leurs stacks respectives (PHP, Node.js, Python, Ruby, etc.).

##### **1.3 Découverte des méthodologies de travail**

Cette étape présente la stratégie de branches GitFlow (main, develop, feature/, release/, hotfix/\*), les conventions appliquées (Conventional Commits, Semantic Versioning) et le processus de Merge Request, avec une approbation minimum requise, la protection des branches main et develop et l'interdiction de push direct. Elle couvre également le cycle de vie d'un projet, de DEV à PREPROD puis PROD, les tests automatisés s'exécutant dans le pipeline CI, ainsi que les quality gates : linting, tests et scans de sécurité obligatoires avant tout déploiement.

##### **1.4 Prise en main des serveurs**

**Atelier pratique :**

L'atelier pratique consiste à se connecter en SSH aux différents VPS, à naviguer dans l'arborescence pour comprendre la structure des répertoires, et à vérifier les services actifs en consultant les logs système. Il couvre également la gestion des utilisateurs et la vérification de la configuration du pare-feu, ainsi que la mise à jour système et la vérification de l'état général de l'infrastructure.

**Livrable attendu** : Le collaborateur est capable de décrire l'architecture globale du workflow, d'identifier le rôle de chaque service et de se connecter de manière autonome à l'infrastructure.

#### **Phase 2 \- Outils fondamentaux : Docker, SCM, Traefik (Semaines 3-4)**

##### **2.1 Docker et conteneurisation**

**Théorie :**

La théorie aborde les rappels Docker (images, conteneurs, volumes, réseaux) et la différence entre Docker et Docker Compose, avant de détailler l'organisation des fichiers docker-compose dans le workflow, les réseaux Docker utilisés et la gestion des volumes persistants. Elle couvre également les variables d'environnement et la gestion des secrets, ainsi que les bonnes pratiques attendues : images minimales et exécution avec un utilisateur non-root.

**Commandes essentielles à maîtriser :**

docker ps \-a \# Lister tous les conteneurs  
docker logs \<container\> \# Consulter les logs d'un conteneur  
docker exec \-it \<container\> bash \# Accéder à un conteneur  
docker stats \# Métriques temps réel  
docker system df \# Utilisation disque Docker  
docker system prune \# Nettoyage (images/conteneurs inutilisés)  
docker-compose up \-d \# Démarrer un stack  
docker-compose down \# Arrêter un stack  
docker-compose logs \-f \<service\> \# Suivre les logs d'un service  
docker-compose restart \<service\> \# Redémarrer un service individuel

**Atelier pratique :**

L'atelier pratique consiste à déployer un projet existant de l'agence en local via Docker Compose, à démarrer, arrêter et redémarrer des services individuels, puis à consulter les logs pour diagnostiquer un problème. Il inclut également la mise à jour d'un service par pull d'une nouvelle image suivi d'un redéploiement, ainsi que la vérification de l'utilisation disque et un nettoyage.

##### **2.2 SCM \- GitLab CE**

La théorie couvre l'interface d'administration (utilisateurs, groupes, permissions), la configuration des webhooks vers Jenkins, ainsi que la gestion des templates de Merge Request, d'issues et de la checklist de Definition of Done.

L'atelier pratique consiste à créer un utilisateur et à configurer ses permissions, puis à créer un nouveau projet avec les protections de branches appropriées. Il comprend la réalisation d'un cycle GitFlow complet, de feature à develop puis release et main, ainsi que la configuration d'un webhook vers Jenkins et la vérification de son déclenchement.

##### **2.3 Reverse proxy \- Traefik**

La théorie présente le rôle de Traefik comme point d'entrée unique HTTP/HTTPS de l'infrastructure et son routage automatique vers les conteneurs via labels Docker, ainsi que la gestion des certificats TLS avec Let's Encrypt. Elle couvre les middlewares de sécurité (HSTS, rate limiting, headers tels que X-Frame-Options) et la séparation par sous-domaines, à l'image de ci.wk-archi-o24a-4-5-G1.fr, git.wk-archi-o24a-4-5-G1.fr, registry.wk-archi-o24a-4-5-G1.fr ou monitor.wk-archi-o24a-4-5-G1.fr.

l’atelier pratique consiste à ajouter un nouveau service derrière Traefik avec un sous-domaine dédié et un certificat TLS.

**Livrable attendu** : Le collaborateur sait manipuler les trois briques fondamentales (Docker, SCM, Traefik) de manière autonome.

#### **Phase 3 \- Pipeline CI/CD : Jenkins et Harbor (Semaines 5-6)**

##### **3.1 Jenkins \- Administration**

La théorie présente l'architecture Jenkins, avec son controller et ses agents éphémères ou dédiés, ainsi que la gestion des credentials via le store Jenkins et leur rotation. Elle couvre le RBAC, avec les rôles admin CI, mainteneur et développeur, ainsi que l'interface d'administration et la gestion des plugins.

##### **3.2 Jenkins \- Pipelines as Code**

La théorie détaille l'anatomie d'un Jenkinsfile déclaratif, avec ses stages, ses steps et ses post-actions, ainsi que l'utilisation des Shared Libraries Jenkins pour mutualiser des fonctions entre projets. Elle couvre l'intégration avec le SCM et le déclenchement automatique sur push ou merge, la gestion des environnements dans le pipeline (variables, secrets, promotion d'images), ainsi que la gestion des erreurs et des notifications.

##### **3.3 Cycle complet d'un pipeline**

Le cycle complet d'un pipeline suit les étapes build, tests, scan de sécurité, packaging puis déploiement, avec des quality gates qui bloquent la progression en cas de tests en échec ou de vulnérabilités critiques. La promotion d'image suit le parcours DEV vers PREPROD puis PROD, en conservant la même image Docker tout au long du processus, conformément aux choix techniques retenus.

L'atelier pratique consiste à lire et comprendre un Jenkinsfile existant d'un projet de l'agence, puis à le modifier pour y ajouter une étape, par exemple un linter. Il comprend le suivi du pipeline de bout en bout jusqu'au déploiement en PREPROD, ainsi que le débogage d'un pipeline en échec par lecture des logs et identification de la cause.

##### **3.4 Registry Docker \- Harbor**

La théorie couvre l'administration de Harbor (projets, utilisateurs, politiques de rétention), la convention de nommage et de tagging des images (app:1.2.3, app:commitSHA), le scan de vulnérabilités intégré à Harbor, ainsi que la garbage collection et la gestion du stockage.

L’atelier pratique consiste à pousser une image, vérifier le scan de vulnérabilités, appliquer une politique de rétention.

**Livrable attendu** : Le collaborateur est capable de créer, modifier et déboguer un pipeline Jenkins complet, de la source au déploiement.

#### **Phase 4 \- Monitoring, backups et sécurité (Semaines 7-8)**

##### **4.1 Monitoring \- Prometheus, Grafana, Loki**

La théorie présente l'architecture de la stack de monitoring, avec la collecte assurée par Prometheus, la visualisation par Grafana et les logs par Loki, ainsi que les métriques clés suivies : CPU, RAM, disque, latence applicative et taux d'erreurs. Elle couvre les bases du langage PromQL et ses requêtes courantes, la configuration des dashboards Grafana standardisés par type de projet, et l'alerting basé sur les symptômes (taux d'erreur, latence, saturation). Les SLO et SLA sont également abordés, avec des objectifs de disponibilité différenciés selon le niveau d'architecture (99,5 % en MVP, 99,9 % en HA), le calcul du budget d'erreur mensuel associé à chaque niveau, et la procédure de révision des SLA lors du passage en mode HA.

L'atelier pratique consiste à ajouter une nouvelle target Prometheus, à écrire une requête PromQL simple, puis à créer un dashboard Grafana pour un projet. Il comprend la configuration d'une alerte sur un seuil de latence, ainsi que la simulation d'un incident pour vérifier la remontée d'alerte.

##### **4.2 Sauvegarde et restauration \- Restic \+ MinIO**

La théorie précise le périmètre des sauvegardes, couvrant les bases de données, les dépôts Git, le registry, les configurations CI/CD et les volumes Docker, ainsi que la politique de rétention en rotation Grandfather-Father-Son : quotidienne sur 7 jours, hebdomadaire sur 4 semaines, mensuelle sur 6 mois et annuelle sur 2 ans. Elle aborde le principe 3-2-1 (3 copies, 2 supports, 1 hors site), le chiffrement au repos et en transit, ainsi que la fréquence trimestrielle des tests de restauration.

L'atelier pratique consiste à lancer un backup manuel, à vérifier son intégrité, puis à restaurer un fichier spécifique et une base de données. Il se conclut par une restauration complète réalisée sur l'environnement sandbox.

##### **4.3 Sécurité \- DevSecOps**

La théorie couvre le scan de conteneurs avec Trivy, avec la lecture des rapports et la gestion des vulnérabilités, ainsi que l'analyse statique avec Semgrep, la configuration des règles et l'interprétation des résultats. Elle aborde l'audit de dépendances (npm audit, composer audit), la gestion des secrets selon le principe du moindre privilège avec RBAC et rotation des credentials, les scans pre-commit de détection de secrets dans le code, ainsi que les bonnes pratiques d'images Docker minimales exécutées avec un utilisateur non-root.

L’atelier pratique consiste à analyser les résultats d'un scan Trivy sur une image existante, corriger une vulnérabilité identifiée, vérifier la conformité.

**Livrable attendu** : Le collaborateur sait opérer la supervision, exécuter et vérifier les backups, et interpréter les résultats des scans de sécurité.

#### **Phase 5 \- Mise en situation et autonomie (Semaines 9-10)**

##### **5.1 Gestion d'incidents simulés**

Simulation d'incidents bloquants avec application complète de la procédure : diagnostic, communication, résolution, post-mortem. Respect des GTR définis (\< 2h en production, \< 4h sur CI/CD).

**Scénarios de simulation :**

| \# | Symptôme | Compétences testées |
| ----- | ----- | ----- |
| 1 | Jenkins ne démarre pas | Docker, logs, diagnostic système |
| 2 | Build qui échoue sans raison apparente | Jenkinsfile, debugging pipeline |
| 3 | Espace disque plein sur un VPS | Système, Docker prune, monitoring |
| 4 | Service inaccessible (SCM ou CI) | Réseau, Traefik, DNS, certificats TLS |
| 5 | Perte de données simulée | Backup Restic, restauration, MinIO |
| 6 | Certificat TLS expiré | Traefik, Let's Encrypt, renouvellement |

Rédaction d'un **post-mortem** structuré après chaque exercice (chronologie, cause racine, actions correctives, mesures préventives).

##### **5.2 Onboarding d'un projet complet**

Cette phase consiste en la prise en charge de l'intégration d'un nouveau projet dans le workflow CI/CD, de A à Z : création du dépôt dans le SCM avec configuration GitFlow et protections de branches, rédaction du Jenkinsfile et du docker-compose, puis configuration du routage Traefik sur un sous-domaine dédié sous wk-archi-o24a-4-5-G1.fr avec certificat TLS. Elle se poursuit par la mise en place du monitoring (dashboard Grafana, alertes Prometheus), la configuration des backups via Restic et MinIO, et l'intégration des scans de sécurité Trivy et Semgrep dans le pipeline, jusqu'au déploiement complet de DEV vers PREPROD.

**Livrable attendu** : Un projet entièrement intégré dans le workflow, fonctionnel et déployé en PREPROD.

##### **5.3 Accompagnement des développeurs**

Cette étape comprend un exercice de pédagogie consistant à présenter le workflow CI/CD à un groupe de développeurs dans un format court de 30 minutes, ainsi que la capacité à répondre aux questions courantes portant sur l'écriture d'un Jenkinsfile, le debugging de pipeline, l'utilisation de GitFlow et les conventions de commits. Elle se conclut par la rédaction d'un guide rapide à destination des développeurs.

#### **Phase 6 \- Documentation et validation (Semaines 11-12)**

##### **6.1 Documentation technique**

Cette phase comprend la revue et la mise à jour des runbooks existants (incident, rollback, restauration), la rédaction des procédures manquantes identifiées pendant la montée en compétences, ainsi que la rédaction de fiches réflexes pour les incidents courants, avec arbre de décision, commandes clés et contacts. Elle se conclut par une vérification que la documentation est complète et à jour.

##### **6.2 Test de restauration complet**

Cette étape consiste en la planification et l'exécution d'un test de restauration grandeur nature, conforme à l'exigence trimestrielle, suivie de la documentation des résultats et des éventuels correctifs.

##### **6.3 Évaluation des compétences**

**Grille d'évaluation :**

| Compétence | Non acquis | En cours | Acquis | Maîtrisé |
| ----- | ----- | ----- | ----- | ----- |
| Administration Linux / VPS |  |  |  |  |
| Docker / Docker Compose |  |  |  |  |
| SCM (GitLab CE / Gitea) \+ GitFlow |  |  |  |  |
| Traefik (routage, TLS, middlewares) |  |  |  |  |
| Jenkins / Pipelines as Code |  |  |  |  |
| Harbor (Registry Docker) |  |  |  |  |
| Monitoring (Prometheus, Grafana, Loki) |  |  |  |  |
| Backup / Restauration (Restic, MinIO) |  |  |  |  |
| Sécurité (Trivy, Semgrep, RBAC) |  |  |  |  |
| Résolution d'incidents |  |  |  |  |
| Documentation et communication |  |  |  |  |

**Critères de validation :**

La validation repose sur l'intégration réussie d'un projet dans le workflow (phase 5.2), la résolution d'au moins 4 scénarios d'incident sur les 6 proposés (phase 5.1), l'exécution et la documentation d'un test de restauration (phase 6.2), une documentation à jour et validée (phase 6.1), ainsi que la rédaction du guide développeur (phase 5.3).

##### **6.4 Bilan de fin de formation**

Le bilan de fin de formation se conclut par un entretien avec la Direction Technique, au cours duquel les compétences acquises sont évaluées sur la base des livrables produits et de la grille d'évaluation. Les axes de progression sont identifiés et un plan de formation continue est défini, portant sur les certifications, Kubernetes ou l'Infrastructure as Code, avant la validation de l'autonomie du collaborateur sur les missions courantes.

**Livrable attendu** : Documentation à jour, test de restauration validé, grille d'évaluation renseignée, autonomie confirmée sur l'ensemble du périmètre.

#### **Synthèse du parcours**

| Phase | Semaines | Thème | Livrable clé |
| ----- | ----- | ----- | ----- |
| 1 | S1-S2 | Accueil et découverte | Connaissance de l'architecture, accès configurés |
| 2 | S3-S4 | Outils fondamentaux (Docker, SCM, Traefik) | Autonomie sur les briques de base |
| 3 | S5-S6 | Pipeline CI/CD (Jenkins, Harbor) | Maîtrise du pipeline de bout en bout |
| 4 | S7-S8 | Monitoring, backups, sécurité | Opérations de supervision et maintenance |
| 5 | S9-S10 | Mise en situation et autonomie | Projet intégré \+ incidents résolus |
| 6 | S11-S12 | Documentation et validation | Bilan, évaluation, documentation à jour |

#### **Ressources de formation**

##### **Documentation à fournir au collaborateur**

| Document | Contenu |
| ----- | ----- |
| **Guide d'architecture** | Schémas d'infrastructure, flux réseau, rôle de chaque service |
| **Runbooks opérationnels** | Procédures pas à pas : incident, rollback, restauration |
| **Fiches réflexes** | Résolution des incidents courants (arbre de décision) |
| **Cheatsheets** | Commandes essentielles Docker, Jenkins CLI, Git, Restic |

##### **Autoformation recommandée**

| Domaine | Ressource |
| ----- | ----- |
| Docker | Documentation officielle Docker, Docker Certified Associate prep |
| Jenkins | Documentation Jenkins, Certified Jenkins Engineer prep |
| Git / GitFlow | Atlassian Git tutorials, Conventional Commits spec |
| Traefik | Documentation officielle Traefik |
| Prometheus / Grafana | Grafana University, Prometheus docs |
| Sécurité | Trivy docs, OWASP Top 10, Semgrep Academy |
| Linux | Linux Foundation (LFCS) prep materials |

##### **Certifications encouragées (budget formation annuel)**

Les certifications encouragées, financées par le budget formation annuel, sont le Docker Certified Associate (DCA), le Certified Jenkins Engineer (CJE) et le Linux Foundation Certified System Administrator (LFCS), auxquelles s'ajoute le Certified Kubernetes Administrator (CKA) dans une perspective d'évolution vers l'orchestration Kubernetes.

#### **Conditions de réussite**

L'efficacité de ce parcours repose sur la désignation d'un référent technique au sein de l'équipe pour accompagner le collaborateur pendant les 12 semaines, et sur du temps dédié à la formation qui ne doit pas entrer en concurrence permanente avec les urgences opérationnelles. Un environnement sandbox, clone isolé de l'infrastructure de production, est mis à disposition pour les exercices pratiques sans risque, avec des points d'avancement hebdomadaires planifiés entre le collaborateur et son référent. Les questions récurrentes sont documentées afin d'enrichir la base de connaissances interne.

#### **Communication et posture attendue**

Le nouveau collaborateur est encouragé à solliciter son référent dès l'apparition d'un blocage plutôt que de rester bloqué en autonomie prolongée, et à documenter les questions récurrentes pour enrichir la base de connaissances interne. Le rythme de communication s'appuie sur les points d'avancement hebdomadaires déjà prévus, complétés par un canal Mattermost dédié pour les échanges informels du quotidien. Le référent technique adopte une posture pédagogique et disponible, avec un retour constructif donné au fil de l'eau plutôt que réservé au seul bilan de fin de parcours.

#### **Valorisation du parcours d'intégration**

Ce parcours structuré constitue un argument d'attractivité pour les futurs recrutements : il peut être mis en avant dans les offres d'emploi et sur les réseaux professionnels de l'agence pour illustrer sa culture d'investissement dans la montée en compétences. En interne, un témoignage du collaborateur à l'issue de son parcours peut être partagé sur les canaux de communication de l'agence, renforçant la marque employeur et l'image d'une agence innovante dans sa manière d'accompagner ses recrues.

#### **Suivi post-formation**

| Période | Accompagnement |
| ----- | ----- |
| Mois 3-4 | Autonomie progressive, référent technique disponible en support |
| Mois 4 | Point de suivi formel (aligné avec la période d'essai) |
| Trimestriel | Tests de restauration conformes aux exigences SLA |
| Continu | Canal de communication dédié au support DevOps |

### 3\. Conseil sur le contrat de travail

#### **Ingénieur DevOps / Responsable CI/CD**

Au regard du caractère structurant et critique du workflow CI/CD pour l’agence Furious Ducks, le recrutement doit s’inscrire dans une logique pérenne et sécurisée.

#### **Type de contrat recommandé : CDI**

Le **CDI** est le contrat le plus adapté car :

* Le poste répond à un **besoin permanent** (exploitation, maintenance et évolution du workflow),

* L’infrastructure CI/CD est **au cœur de la production** de l’agence,

* La montée en compétences sur l’écosystème spécifique de Furious Ducks nécessite plusieurs mois,

* La stabilité du poste est essentielle pour garantir la fiabilité et la continuité de service.

Un CDD ne serait pertinent qu’en cas de remplacement temporaire ou de mission ponctuelle, ce qui ne correspond pas au besoin exprimé par Mr Brasletti.

#### **Temps de travail**

Deux formats sont envisageables, avec une préférence pour le second :

* **35 heures hebdomadaires**, durée légale,

* Ou forfait jours (218 jours/an), recommandé pour un poste cadre technique.

Le forfait jours est particulièrement adapté en raison :

* Des contraintes d’exploitation,

* Des interventions possibles en dehors des heures ouvrées,

* De la gestion d’astreintes ponctuelles.

#### **Astreintes**

Un **régime d’astreinte encadré** est à prévoir afin d’assurer la continuité de service :

* Fréquence recommandée : **1 semaine sur 4 maximum**,

* Astreintes compensées conformément à la convention collective,

* Astreintes principalement liées aux incidents de production ou de sécurité.

#### **Grille de rémunération**

Compte tenu du niveau de responsabilité et du marché actuel, la recommandation est la suivante :

* **Profil visé** : DevOps confirmé (3 à 5 ans d’expérience),

* **Fourchette de salaire brut annuel** : **42 000 € à 50 000 €**,

* Ajustement possible selon :

* La localisation de l’agence,

* L’expérience réelle du candidat,

* La polyvalence (CI/CD, sécurité, infra).

Cette fourchette permet à Furious Ducks de rester compétitive tout en attirant un profil capable de porter la transformation technique de l’agence.

#### **Avantages complémentaires conseillés**

Pour renforcer l’attractivité du poste :

* Télétravail partiel (2 à 3 jours / semaine),

* Budget annuel de formation et certifications,

* Prime d’astreinte,

* Mutuelle et avantages conventionnels.

Le recrutement d’un Ingénieur DevOps en CDI, à temps plein et avec un niveau de rémunération aligné sur le marché, constitue un investissement stratégique pour Furious Ducks. Il garantit la pérennité du workflow CI/CD, la fiabilité de la production et l’accompagnement durable des équipes dans leur montée en maturité DevOps.

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## **Procédures** {#procédures}

### Diagrammes d'Activité BPMN \- Workflow CI/CD Furious Ducks {#diagrammes-d'activité-bpmn---workflow-ci/cd-furious-ducks}

#### **1\. Diagramme d'activité global du Workflow CI/CD**

Ce diagramme représente le processus complet depuis le push d'un développeur jusqu'au déploiement en production. Il met en évidence les différents acteurs (développeur, Jenkins, GitLab, SonarQube) et les points de décision automatiques ou manuels.

*![][image6]*

*Figure 4 : Diagramme d'activité global du Workflow CI/CD*

#### **2\. Diagramme d'activité : Gestion d'une Merge Request**

Ce diagramme modélise le processus collaboratif de revue de code au sein d'une équipe Scrum, depuis la création de la Merge Request jusqu'à sa fusion dans la branche cible.

*![][image7]*

*Figure 5 : Diagramme d'activité \- Gestion d’une Merge Request*

#### **3\. Justifications**

##### **3.1 Pourquoi des diagrammes d'activité BPMN ?**

| Raison | Explication |
| ----- | ----- |
| Clarté | Les diagrammes d'activité offrent une vue synthétique et compréhensible du workflow, accessible à tous les acteurs (développeurs, PO, direction) |
| Documentation vivante | En Mermaid, les diagrammes sont versionnés avec le code et évoluent avec le projet |
| Formation | Support visuel indispensable pour l'onboarding des nouveaux collaborateurs et la formation de l'ingénieur DevOps |
| Audit | Traçabilité des processus pour les audits qualité et conformité |

##### **3.2 Points de décision clés**

| Point de décision | Type | Justification |
| ----- | ----- | ----- |
| **Lint OK ?** | Automatique | Bloque les erreurs de syntaxe et de style avant toute exécution de tests coûteux |
| **Tests OK ?** | Automatique | Garantit la non-régression avant tout déploiement |
| **Quality Gate SonarQube ?** | Automatique | Maintient les standards de qualité de l'agence (couverture \> 70%, pas de vulnérabilités critiques) |
| **Vulnérabilités critiques ?** | Automatique | Bloque les déploiements présentant des failles de sécurité connues |
| **Approbation PROD ?** | Manuel | Validation humaine obligatoire avant déploiement en production (conformité, responsabilité) |
| **Revue de code approuvée ?** | Manuel | Garantit la qualité par la revue par les pairs, transfert de connaissance entre développeurs |

#### **3.3 Automatisation vs. Validation manuelle**

* **DEV** : 100% automatique → feedback rapide pour les développeurs

* **PREPROD** : Déploiement automatique, validation métier manuelle par le PO/client

* **PROD** : Approbation manuelle obligatoire dans Jenkins (bouton "Deploy to PROD"), puis déploiement et health checks automatisés

Ce compromis permet d'allier vitesse de développement (automatisation) et sécurité des mises en production (validation humaine).

### Processus de Déploiement \- DEV, PREPROD et PROD {#processus-de-déploiement---dev,-preprod-et-prod}

#### **1\. Vue d'ensemble des environnements**

##### **1.1 Architecture multi-environnements**

*![][image8]*  
*Figure 6 : Architecture multi-environnements*

##### **1.2 Mise en place et cycle de vie des branches**

La stratégie GitFlow retenue pour l'agence (cf. D.2.2 SCM) distingue des branches permanentes, protégées et durables, de branches temporaires, créées pour un besoin ponctuel puis supprimées après intégration. Cette distinction structure directement le déclenchement des environnements présentés dans cette section.

Les deux branches permanentes, **main** et **develop**, sont protégées contre tout push direct et ne reçoivent du code que via une Merge Request soumise à au moins une approbation. **develop** centralise l'intégration continue de l'ensemble des contributions et constitue la branche source de l'environnement DEV ; **main** reflète l'état stable de chaque projet et constitue la branche source des environnements PREPROD et PROD, ce dernier nécessitant en complément un tag sémantique.

Trois types de branches temporaires alimentent ces deux branches permanentes. Les branches **feature/\<description\>**, créées depuis develop pour le développement d'une fonctionnalité, y sont réintégrées via Merge Request puis supprimées ; leur durée de vie correspond à celle du développement concerné et n'a pas de limite fixe. Le déploiement DEV est déclenché par la fusion dans develop elle-même, indépendamment de la durée de vie de la branche feature en amont. Les branches **release/\<version\>**, créées depuis develop pour stabiliser une version avant sa mise en production, sont fusionnées à la fois dans main, où leur intégration déclenche le déploiement PREPROD puis, une fois le tag créé, le déploiement PROD, et dans develop, afin que les correctifs apportés pendant la stabilisation ne soient pas perdus lors du cycle suivant. Leur durée de vie est volontairement limitée à 1 à 2 jours, cohérente avec l'objectif de livraison continue d'au moins trois déploiements en production par semaine et par projet actif (cf. Vision cible). Les branches **hotfix/\<version\>**, créées depuis main pour corriger un incident bloquant en production, suivent le même principe de double fusion vers main et develop ; leur durée de vie, de l'ordre de quelques heures, découle directement de la GTR de moins de 2 heures retenue pour les incidents de production (cf. 3.3 Disponibilité, SLA et GTR).

Le tableau suivant synthétise ce cycle de vie et son effet sur les environnements.

| Branche | Source | Fusionnée vers | Durée de vie indicative | Effet sur les environnements |
| ----- | ----- | ----- | ----- | ----- |
| feature/\<description\>  | develop | develop | Variable (durée du développement) | Déclenche DEV à la fusion dans develop |
| release/\<version\> | develop | main (tag) et develop | 1 à 2 jours maximum | Déclenche PREPROD à la fusion sur main, puis PROD à la création du tag |
| hotfix/\<version\> | main | main (tag) et develop | Quelques heures | Déclenche un nouveau déploiement PROD à la fusion et au tag |

Cette articulation fait transiter systématiquement chaque branche temporaire par main ou develop avant tout déploiement, ce qui garantit la traçabilité de chaque déploiement jusqu'à la Merge Request et au commit qui l'ont déclenché.

##### **1.3 Conventions de nommage**

| Élément | DEV | PREPROD | PROD |
| ----- | ----- | ----- | ----- |
| Branche source | develop | main | main (tag) |
| Tag Docker | project:develop-\<sha\> | project:main-\<sha\> | project:v1.x.x |
| Domaine | projet-dev.wk-archi-o24a-4-5-G1.fr | projet-preprod.wk-archi-o24a-4-5-G1.fr | projet.dsp5-archi-o24a-4-5-G1.fr |
| Conteneur applicatif | {projet}-{service}-dev | {projet}-{service}-preprod | {projet}-{service}-prod |
| Conteneur socle CI/CD | common-{service}-ci | \- | \- |
| Réseau Docker | ci\_network | ci\_network | ci\_network |

#### **2\. Processus de déploiement DEV**

##### **2.1 Diagramme BPMN \- Déploiement DEV**

*![][image9]*

*Figure 7 : Processus de déploiement DEV*

##### **2.2 Détail des étapes**

| Étape | Action | Commande / Outil | Durée estimée |
| ----- | ----- | ----- | ----- |
| 1\. Checkout | Clone du repo \+ détection SHA | git checkout via Jenkins SCM | 10s |
| 2\. Dépendances | Installation selon la stack | npm ci / composer install / pip install | 30s-2min |
| 3\. Build | Compilation de l'application | npm run build / framework spécifique | 1-3min |
| 4\. Assets | Minification CSS/JS, compression | Webpack / Vite / Mix | 30s-1min |
| 5\. Tests unitaires | Exécution de la suite de tests | Jest / PHPUnit / pytest | 1-3min |
| 6\. Lint | Vérification du code | ESLint / PHPStan / Pylint | 15-30s |
| 7\. SonarQube | Analyse qualité \+ couverture | Scanner SonarQube | 1-2min |
| 8\. Docker Build | Construction image multi-stage | docker build | 1-3min |
| 9\. Docker Push | Envoi vers le registry | docker push | 30s-1min |
| 10\. Scan Trivy | Détection vulnérabilités | trivy image | 30s |
| 11\. Scan Gitleaks | Détection de secrets dans le code | gitleaks detect | 5s |
| 12\. Déploiement | Remplacement du conteneur | docker run avec labels Traefik | 15s |
| 13\. Health check | Vérification de santé | curl sur /health | 30s |
| 14\. Smoke tests | Tests fonctionnels basiques | Cypress / Newman | 30s-1min |

**Durée totale estimée : 5-15 minutes**

##### **2.3 Automatisation complète**

Le déploiement DEV est 100% automatique : chaque push sur develop déclenche l'intégralité du pipeline sans intervention humaine. Cela permet aux développeurs d'obtenir un feedback rapide sur l'état de leur code dans un environnement intégré.

#### **3\. Processus de déploiement PREPROD**

##### **3.1 Diagramme BPMN \- Déploiement PREPROD**

*![][image10]*

*Figure 8 : Processus de déploiement PREPROD*

##### **3.2 Détail des étapes spécifiques PREPROD**

| Étape | Spécificité PREPROD | Justification |
| ----- | ----- | ----- |
| **Tests E2E** | Exécutés systématiquement (optionnels en DEV) | Valider les parcours utilisateurs complets avant la prod |
| **Tests de performance** | K6 avec 100 utilisateurs simulés pendant 5 min | Détecter les régressions de performance dans un environnement iso-prod |
| **BDD anonymisée** | Copie des données de prod avec anonymisation RGPD | Tester avec des données réalistes sans compromission des données personnelles |
| **Scan sécurité complet** | Trivy (image) \+ Gitleaks (secrets) \+ OWASP | Dernière barrière de sécurité avant la production |
| **Quality Gate strict** | Couverture ≥ 70%, 0 vulnérabilité critique, rating A | Maintenir les standards de qualité de l'agence |
| **Notification élargie** | PO, client, Tech Lead, équipe support | Permettre la validation métier et technique |

##### **3.3 Niveau d'automatisation**

Le déploiement PREPROD est automatique pour le déploiement technique, mais la validation métier reste manuelle. Le PO et/ou le client effectue la recette fonctionnelle sur l'environnement de pré-production avant d'autoriser le passage en production.

#### **4\. Processus de déploiement PROD**

##### **4.1 Diagramme BPMN \- Déploiement PROD**

*![][image11]*

*Figure 9 : Processus de déploiement PROD*

##### **4.2 Stratégie Blue/Green détaillée**

*![][image12]*

*Figure 10 : Stratégie Blue/Green détaillée*

##### **4.3 Pré-requis obligatoires avant déploiement PROD**

| Pré-requis | Vérification | Responsable |
| ----- | ----- | ----- |
| Pipeline PREPROD réussi | Jenkins \- dernier build main vert | Automatique |
| Recette client validée | Ticket GitLab ou email de validation | PO / Client |
| Fenêtre de déploiement | Hors heures de pointe (10h-12h ou 14h-16h) | DevOps |
| Backup récent | Snapshot \< 24h ou backup manuel déclenché | DevOps |
| Monitoring opérationnel | Grafana, Prometheus, Alertmanager actifs | DevOps |
| Personne de garde identifiée | Planning d'astreinte à jour | Management |

##### **4.4 Checklist de déploiement PROD**

\#\# Checklist Pré-déploiement

\- \[ \] Pipeline PREPROD passé avec succès (build \#\_\_\_)  
\- \[ \] Recette client validée (date: \_\_/\_\_/\_\_\_\_)  
\- \[ \] Backup/snapshot BDD prod effectué  
\- \[ \] Fenêtre de déploiement confirmée  
\- \[ \] Équipe support prévenue  
\- \[ \] Personne de garde disponible  
\- \[ \] Monitoring Grafana ouvert et surveillé

\#\# Checklist Post-déploiement

\- \[ \] Health checks OK  
\- \[ \] Smoke tests passés  
\- \[ \] Monitoring stable pendant 15 min  
\- \[ \] Ancienne version BLUE supprimée  
\- \[ \] Notification envoyée aux parties prenantes  
\- \[ \] Changelog mis à jour  
\- \[ \] Rapports archivés

#### **5\. Processus de Rollback**

##### **5.1 Diagramme BPMN \- Rollback**

*![][image13]*  
*Figure 11 : Diagramme BPMN \- Rollback*

##### **5.2 Temps de rollback par environnement**

| Environnement | Méthode | Temps estimé | Impact |
| ----- | ----- | ----- | ----- |
| **DEV** | Redéploiement de l'image précédente | \< 1 min | Aucun impact client |
| **PREPROD** | Redéploiement de l'image précédente | \< 1 min | Aucun impact client |
| **PROD** | Bascule Traefik Blue→Green (ou inverse) | \< 30s | Zero-downtime |
| **PROD \+ BDD** | Bascule Traefik \+ restauration snapshot BDD | 2-5 min | Perte potentielle de données récentes |

#### **6\. Matrice de comparaison des environnements**

| Critère | DEV | PREPROD | PROD |
| ----- | ----- | ----- | ----- |
| **Déclencheur** | Push sur develop | Push/Merge sur main | Approbation manuelle |
| **Automatisation** | 100% automatique | Déploiement auto, validation manuelle | Validation \+ déploiements contrôlés |
| **Tests exécutés** | Unitaires \+ Lint | Unitaires \+ Intégration \+ E2E \+ Performance | Smoke tests post-deploy |
| **Scan sécurité** | Trivy  \+ Gitleaks | Trivy \+ Gitleaks \+ OWASP | Vérification image signée |
| **BDD** | Données de test | Copie anonymisée de la prod | Données réelles |
| **Backup pré-deploy** | Non | Non | Oui (snapshot BDD obligatoire) |
| **Stratégie déploiement** | Remplacement direct | Remplacement direct | Blue/Green |
| **Monitoring post-deploy** | Basique (health check) | 5 min métriques | 15 min métriques strictes |
| **Rollback** | Automatique si health check échoue | Automatique si health check échoue | Automatique \< 15min, manuel après |
| **Notification** | Développeur uniquement | PO \+ Client \+ Tech Lead | Toutes les parties prenantes |
| **Durée pipeline** | 5-10 min | 10-20 min | 15-25 min |

#### **7\. Justifications des choix**

##### **7.1 Pourquoi une stratégie Blue/Green en production ?**

| Avantage | Description |
| ----- | ----- |
| **Zero-downtime** | La bascule Traefik se fait sans interruption de service pour les utilisateurs finaux |
| **Rollback instantané** | En cas de problème, il suffit de basculer le trafic vers l'ancienne version |
| **Validation avant bascule** | Le conteneur GREEN est testé avant de recevoir du trafic réel |
| **Sécurité** | L'ancienne version reste active pendant la phase de monitoring, prête à reprendre |

##### **7.2 Pourquoi une approbation manuelle pour la PROD ?**

* **Responsabilité** : une personne identifiée (Tech Lead ou DevOps) valide le déploiement

* **Conformité** : certains clients exigent une validation humaine avant mise en production

* **Contexte business** : le déploiement peut être retardé si le timing n'est pas favorable (campagne marketing en cours, heure de pointe, etc.)

* **Qualité** : dernière vérification que la recette client est bien validée

##### **7.3 Pourquoi des tests de performance uniquement en PREPROD ?**

* L'environnement PREPROD est iso-production (même config, données anonymisées)

* Les tests de performance en DEV seraient peu fiables (données de test, configuration allégée)

* Les tests de performance en PROD impacteraient les utilisateurs réels

* K6 permet de simuler une charge réaliste et de détecter les régressions avant la mise en production

##### **7.4 Pourquoi Traefik comme reverse proxy ?**

| Critère | Traefik | Nginx (alternative) |
| ----- | ----- | ----- |
| **Découverte automatique** | Labels Docker natifs | Fichiers de config manuels |
| **SSL automatique** | Let's Encrypt intégré | Certbot à configurer |
| **Routing dynamique** | Mise à jour en temps réel | Reload nécessaire |
| **Dashboard** | Inclus | Module payant ou tiers |
| **Blue/Green** | Natif via labels | Configuration manuelle |

Traefik est le choix idéal pour un workflow Docker-first car il s'intègre nativement avec Docker et permet les bascules Blue/Green sans rechargement de configuration.

### Procédure de Sauvegarde du Workflow \- Production {#procédure-de-sauvegarde-du-workflow---production}

#### **1\. Vue d'ensemble du système de backup**

##### **1.1 Composants du système**

Le système de sauvegarde repose sur trois conteneurs Docker dédiés, déployés via le fichier docker-compose.backup.yml :

| Composant | Rôle | Image Docker |
| ----- | ----- | ----- |
| **MinIO** | Stockage objet compatible S3 pour stocker les backups | minio/minio:latest |
| **Backup Manager** | Conteneur exécutant les scripts de backup via Restic | Custom (build local) |
| **Backup Scheduler (Ofelia)** | Planificateur cron qui déclenche les backups | mcuadros/ofelia:latest |

##### 

##### 

##### 

##### 

##### **1.2 Outils de sauvegarde**

| Outil | Rôle | Justification |
| ----- | ----- | ----- |
| **Restic** | Moteur de backup incrémental, chiffré et dédupliqué | Open source, performant, supporte S3, chiffrement AES-256 |
| **MinIO** | Stockage S3 compatible pour les snapshots Restic | Open source, compatible AWS S3, interface web, haute disponibilité |
| **Ofelia** | Scheduler cron Docker-native | Léger, configuration par labels Docker, adapté aux environnements conteneurisés |

#### **2\. Planification de sauvegarde**

| Opération | Fréquence | Horaire | Cron Ofelia |
| ----- | ----- | ----- | ----- |
| **Backup complet** | Quotidien | 02h00 | 0 0 2 \* \* \* |
| **Vérification intégrité** | Hebdomadaire (dimanche) | 03h00 | 0 0 3 \* \* 0 |
| **Nettoyage / Rétention** | Mensuel (1er du mois) | 04h00 | 0 0 4 1 \* \* |

#### **3\. Processus de sauvegarde automatique quotidienne**

##### **3.1 Diagramme BPMN \- Backup automatique**

*![][image14]*

*Figure 12 : Diagramme BPMN \- Backup automatique*

##### **3.2 Détail technique des volumes sauvegardés**

| Volume Docker | Contenu | Taille estimée | Tags Restic |
| ----- | ----- | ----- | ----- |
| gitlab-config | Configuration GitLab (/etc/gitlab) | \~50 Mo | gitlab-config, daily |
| gitlab-data | Données GitLab (repos, uploads, BDD) | 5-50 Go | gitlab-data, daily |
| jenkins-data | Configuration Jenkins, jobs, plugins | 1-5 Go | jenkins, daily |
| prometheus-data | Métriques TSDB (30j de rétention) | 1-10 Go | prometheus, daily |
| grafana-data | Dashboards, datasources, alertes | \~200 Mo | grafana, daily |

##### **3.3 Caractéristiques du backup Restic**

| Caractéristique | Valeur | Avantage |
| ----- | ----- | ----- |
| **Type** | Incrémental (dédupliqué) | Seules les modifications sont sauvegardées → économie de stockage |
| **Chiffrement** | AES-256 côté client | Les données sont chiffrées avant envoi vers MinIO |
| **Compression** | Zstd automatique | Réduction de 40-60% de la taille des snapshots |
| **Déduplication** | Au niveau des blocs de données | Pas de duplication entre snapshots → économie massive |
| **Transport** | HTTPS vers MinIO (S3 API) | Sécurité du transfert réseau |

#### 

#### **4\. Processus de sauvegarde manuelle**

Ce processus est utilisé avant un déploiement en production, une mise à jour majeure, ou une opération de maintenance planifiée.

##### **4.1 Commandes de backup manuel**

\# Connexion au serveur  
ssh furious-admin@vps-principal \-p 2222

\# Vérifier l'état du système de backup  
docker compose \-f docker-compose.backup.yml ps

\# Lancer un backup complet  
docker exec backup-manager /scripts/backup-all.sh

\# Lancer un backup d'un service spécifique  
docker exec backup-manager restic backup /backup-sources/gitlab-data \--tag gitlab-data \--tag manual

\# Vérifier le résultat  
docker exec backup-manager restic snapshots \--last 5

\# Vérifier les statistiques de stockage  
docker exec backup-manager restic stats

#### **5\. Processus de rétention et nettoyage**

| Période | Rétention | Nombre max de snapshots | Justification |
| ----- | ----- | ----- | ----- |
| **7 derniers jours** | Tous les snapshots | \~7 | Restauration granulaire récente pour incidents immédiats |
| **4 dernières semaines** | 1 par semaine | 4 | Point de restauration hebdomadaire pour erreurs détectées tardivement |
| **6 derniers mois** | 1 par mois | 6 | Conformité RGPD, audit, restauration après incident majeur |
| **2 dernières années** | 1 par an | 2 | Archive légale et historique de l'infrastructure |

**Total maximum estimé : \~19 snapshots conservés**

#### **6\. Éléments sauvegardés**

##### **6.1 Matrice des éléments sauvegardés**

| Élément | Volume Docker | Méthode | Fréquence | Criticité |
| ----- | ----- | ----- | ----- | ----- |
| **Configuration GitLab** | gitlab-config | Restic → MinIO | Quotidien 02h | Critique |
| **Données GitLab** (repos, uploads) | gitlab-data | Restic → MinIO | Quotidien 02h | Critique |
| **BDD GitLab** (PostgreSQL) | via gitlab-backup create | Dump intégré | Quotidien 02h | Critique |
| **Configuration Jenkins** | jenkins-data | Restic → MinIO | Quotidien 02h | Critique |
| **Métriques Prometheus** | prometheus-data | Restic → MinIO | Quotidien 02h | Important |
| **Dashboards Grafana** | grafana-data | Restic → MinIO | Quotidien 02h | Important |
| **Fichiers de configuration** | Montés en :ro | Restic → MinIO | Quotidien 02h | Critique |
| **Certificats SSL Traefik** | traefik-certificates | Regénérés automatiquement | N/A | Faible |
| **Images Docker critiques (registry Harbor)**  | /data/harbor (bind mount hôte)  | Restic → MinIO | Hebdomadaire (dimanche)  | Critique  |

##### 

##### 

##### 

##### 

##### **6.2 Données NON sauvegardées (et pourquoi)**

| Élément | Raison | Alternative |
| ----- | ----- | ----- |
| **Logs Docker** | Volumétrie trop importante, rétention courte | Loki avec sa propre rétention |
| **Certificats SSL** | Let's Encrypt les régénère automatiquement | Traefik redemande les certificats au démarrage |
| **Données SonarQube** | Regénérables par ré-analyse du code | Relancer les analyses SonarQube |
| **Données Portainer** | Configuration minimale | Reconfiguration rapide (\< 5 min) |

#### **7\. Justifications des choix**

##### **7.1 Pourquoi Restic ?**

| Critère | Restic | Alternatives (Borg, Duplicity) |
| ----- | ----- | ----- |
| **Déduplication** | Blocs de données | Borg : déduplication par blocs équivalente / Duplicity : déduplication plus limitée |
| **Chiffrement** | AES-256 côté client | Borg : chiffrement natif équivalent / Duplicity : chiffrement natif équivalent |
| **Backend S3** | Natif | Borg : pas de support natif S3 / Duplicity : support possible via configuration spécifique |
| **Performance** | Rapide, parallélisé | Borg : performances comparables / Duplicity : performances plus faibles |
| **Restauration sélective** | Par fichier/dossier | Borg : restauration fine équivalente / Duplicity : restauration plus contraignante |
| **Vérification intégrité** | restic check | Borg : vérification intégrée équivalente / Duplicity : vérification partielle |
| **Open source** | BSD-2 | Borg : open source / Duplicity : open source |

##### **7.2 Pourquoi MinIO plutôt qu'un stockage local ?**

| Avantage | Description |
| ----- | ----- |
| **Séparation stockage/compute** | Les backups ne sont pas sur le même disque que les services → protection contre panne disque |
| **Compatibilité S3** | Possibilité de migrer vers AWS S3, Scaleway, OVH Object Storage sans changer les scripts |
| **Interface web** | Console MinIO pour visualiser et gérer les backups facilement |
| **Réplication future** | MinIO supporte la réplication multi-site pour une copie off-site |
| **Open source** | Licence AGPL-3.0, pas de vendor lock-in |

##### **7.3 Pourquoi Ofelia comme scheduler ?**

| Avantage | Description |
| ----- | ----- |
| **Docker-native** | Configuration par labels Docker, pas besoin de crontab sur l'hôte |
| **Léger** | Image \< 20 Mo, consommation minimale |
| **Fiable** | Exécution précise des jobs, logs intégrés |
| **Cohérent** | Même philosophie "tout en conteneur" que le reste du workflow |

##### **7.4 Pourquoi un backup à 02h00 ?**

* **Activité minimale** : les développeurs ne travaillent pas la nuit → moins de changements en cours

* **Impact réseau réduit** : la bande passante est disponible pour les transferts vers MinIO

* **Cohérence des données** : moins de risque de sauvegarder un état intermédiaire incohérent

* **Fenêtre de maintenance** : les mises à jour système peuvent être planifiées à 05h-06h, après le backup

##### **7.5 Pourquoi un backup hebdomadaire pour Harbor plutôt que quotidien ?**

* **Rythme de changement** : les images critiques (taguées et promues en PREPROD/PROD) n'apparaissent qu'au rythme des releases (branches release/\* et hotfix/\*, à durée de vie courte selon GitFlow), pas quotidiennement  
* **Politique de rétention déjà appliquée en amont** : Harbor conserve les 10 dernières versions taguées par projet et purge les images non taguées après 7 jours ; le contenu sauvegardé est donc déjà nettoyé de l'essentiel du superflu  
* **Garantie de reproductibilité** : sauvegarder Harbor protège la promesse de promotion sans reconstruction (cf. 2.4) en cas de perte du registre, un rebuild depuis le Dockerfile ne garantit pas une image identique (dérive des images de base, résolution non figée des dépendances)

### Procédure de Restauration du Workflow \- DEV, PREPROD et PROD {#procédure-de-restauration-du-workflow---dev,-preprod-et-prod}

#### **1\. Vue d'ensemble de la stratégie de restauration**

| Environnement | RPO (perte de données max) | RTO (temps de restauration max) |
| ----- | ----- | ----- |
| **DEV** | 24h (dernier backup quotidien) | 30 min |
| **PREPROD** | 24h (dernier backup quotidien) | 30 min |
| **PROD \- Service unique** | 24h | 15 min |
| **PROD \- Workflow complet** | 24h | 1h |
| **Disaster Recovery** | 24h | 3h |

#### **2\. Processus de restauration complète du workflow** {#2.-processus-de-restauration-complète-du-workflow}

##### **2.1 Diagramme BPMN \- Restauration complète**

Ce processus est utilisé en cas de panne majeure nécessitant la restauration de l'ensemble du workflow (GitLab, Jenkins, monitoring, etc.).

*![][image15]*

*Figure 13 : Diagramme BPMN \- Restauration complète*

##### **2.2 Commandes détaillées \- Restauration complète**

\# 1\. Connexion au serveur  
ssh furious-admin@vps-principal \-p 2222  
cd /opt/workflow-furious-ducks/infrastructure

\# 2\. Arrêt complet  
docker compose down  
docker compose \-f docker-compose.monitoring.yml down  
docker compose \-f docker-compose.backup.yml down

\# 3\. Démarrer MinIO et Backup Manager  
docker compose \-f docker-compose.backup.yml up \-d minio backup-manager

\# 4\. Lister les snapshots disponibles  
docker exec backup-manager restic snapshots \--last 10

\# 5\. Restaurer (remplacer \<SNAPSHOT\_ID\> par l'ID choisi)  
docker exec backup-manager restic restore \<SNAPSHOT\_ID\> \--target /tmp/restore

\# 6\. Vérifier le contenu restauré  
docker exec backup-manager ls \-la /tmp/restore

\# 7\. Supprimer les volumes corrompus  
docker volume rm gitlab-config gitlab-data jenkins-data prometheus-data grafana-data

\# 8\. Recréer les volumes  
docker volume create gitlab-config  
docker volume create gitlab-data  
docker volume create jenkins-data  
docker volume create prometheus-data  
docker volume create grafana-data

\# 9\. Copier les données restaurées  
for vol in gitlab-config gitlab-data jenkins-data prometheus-data grafana-data; do  
docker cp backup-manager:/tmp/restore/backup-sources/${vol}/. /var/lib/docker/volumes/${vol}/\_data/  
done

\# 10\. Redémarrage complet  
docker compose up \-d  
sleep 300 \# Attendre GitLab (démarrage long)  
docker compose \-f docker-compose.monitoring.yml up \-d  
docker compose \-f docker-compose.backup.yml up \-d

\# 11\. Vérification  
docker ps \--format "table {{.Names}}\\\\t{{.Status}}\\\\t{{.Ports}}"  
for url in "\<https://git.wk-archi-o24a-4-5-G1.fr/-/health\>" \\  
"\<https://ci.wk-archi-o24a-4-5-G1.fr/login\>" \\  
"\<https://monitor.wk-archi-o24a-4-5-G1.fr/api/health\>"; do  
echo \-n "$url: "  
curl \-s \-o /dev/null \-w "%{http\_code}\\\\n" "$url"  
done

##### **2.3 Structure des processus de restauration**

Les trois processus de restauration détaillés ci-après (DEV, PREPROD, PROD) suivent une structure commune : identification de l'incident, arrêt du service concerné, choix de la méthode de restauration adaptée au type de donnée corrompue, exécution, puis vérification (health check) et notification ou escalade selon le résultat. Cette structure partagée reflète une méthodologie de réponse aux incidents standardisée sur l'ensemble du workflow. Les spécificités propres à chaque environnement (criticité, données concernées, méthodes disponibles et niveaux d'escalade) sont détaillées dans les tableaux “Spécificités” de chaque section et, pour la PROD, dans les commandes à plusieurs niveaux (section 5.2). 

#### **3\. Processus de restauration DEV**

##### **3.1 Diagramme BPMN \- Restauration environnement DEV**

La restauration DEV concerne les conteneurs de projets clients déployés sur l'environnement de développement, pas le workflow lui-même.

*![][image16]*  
*Figure 14 : Diagramme BPMN \- Restauration DEV*

##### **3.2 Spécificités DEV**

| Aspect | Détail |
| ----- | ----- |
| **Priorité** | Basse \- n'impacte pas les clients finaux |
| **Données** | Données de test → recréables via seed/fixtures |
| **Méthode préférée** | Relancer le pipeline Jenkins sur develop (plus simple et plus propre) |
| **RTO** | 30 min maximum |
| **Validation** | Le développeur vérifie que l'environnement fonctionne |

#### **4\. Processus de restauration PREPROD**

La restauration PREPROD concerne l'environnement de recette client, alimenté par une copie anonymisée de la production.

##### **4.1 Diagramme BPMN \- Restauration environnement PREPROD**

*![][image17]*  
*Figure 15 : Diagramme BPMN \- Restauration PREPROD*

##### **4.2 Spécificités PREPROD**

| Aspect | Détail |
| ----- | ----- |
| **Priorité** | Moyenne \- impacte la recette client et les tests de performance |
| **Données** | Copie anonymisée de la PROD → restaurable depuis backup ou régénérable |
| **Méthode préférée** | Rollback Docker si possible, sinon relancer le pipeline main |
| **RTO** | 30 min maximum |
| **Validation** | PO et/ou client vérifient que la recette peut continuer |
| **Anonymisation** | Obligatoire pour conformité RGPD si les données viennent de la PROD |

#### **5\. Processus de restauration PROD**

##### **5.1 Diagramme BPMN \- Restauration PROD**

La restauration de production est la procédure la plus critique. Elle suit un protocole strict avec des validations à chaque étape.

![][image18]

*Figure 16 : Diagramme BPMN \- Restauration PROD*

##### **5.2 Spécificités PROD**

| Aspect | Détail |
| ----- | ----- |
| **Priorité** | Critique \- impacte directement les utilisateurs finaux |
| **Données** | Base de données et fichiers de production ; snapshot pré-déploiement systématique |
| **Méthode préférée** | Escalade progressive : rollback conteneur → rollback \+ BDD → restauration complète → disaster recovery (voir 5.3) |
| **RTO** | De 30 s (rollback simple) à 3h (disaster recovery) selon le niveau |
| **Validation** | Validation Tech Lead / DevOps à chaque niveau ; post-mortem obligatoire sous 48h |

##### **5.3 Commandes de restauration PROD**

\# \========================================  
\# NIVEAU 1 : Rollback conteneur uniquement  
\# \========================================

\# Outil : infrastructure/scripts/rollback.sh (usage manuel via SSH).  
\# Le conteneur réellement actif en PROD alterne entre {projet}-prod-blue  
\# et {projet}-prod-green selon la dernière bascule Blue/Green : le script  
\# détecte lui-même la couleur active et le tag précédent (label Docker  
\# "deploy.previous-tag"), inutile de les connaître à l'avance.

ssh furious-admin@vps-principal \-p 2222  
cd /opt/workflow-furious-ducks/infrastructure/scripts

\# Rollback vers le tag précédent auto-détecté  
./rollback.sh projet prod

\# OU vers un tag précis  
./rollback.sh projet prod v1.2.2

\# Le script démarre l'autre couleur avec l'image de rollback, attend son  
\# health check, bascule le routing Traefik, puis retire l'ancien conteneur.

\# Vérification  
curl \-f \<https://projet.dsp5-archi-o24a-4-5-G1.fr/health\\\>

\# \========================================  
\# NIVEAU 2 : Rollback conteneur \+ BDD  
\# \========================================

\# Restaurer le snapshot BDD (si pg\_dump pré-déploiement disponible)  
docker exec projet-db-prod pg\_restore \\  
\--clean \--if-exists \\  
\-d production \\  
/backups/snapshot\_20260208.dump

\# OU restaurer depuis Restic  
docker exec backup-manager restic restore latest \\  
\--target /tmp/restore \\  
\--tag projet-db-prod

\# Puis rollback conteneur (commandes Niveau 1\)

\# \========================================  
\# NIVEAU 3 : Restauration complète  
\# \========================================

\# Activer la page de maintenance  
docker exec traefik sh \-c 'echo "maintenance" \> /etc/traefik/dynamic/maintenance.yml'

\# Suivre la procédure complète de la Section 2

\# Désactiver la page de maintenance  
docker exec traefik sh \-c 'rm /etc/traefik/dynamic/maintenance.yml'

#### **6\. Matrice de restauration**

| Scénario | Environnement | Méthode | RTO | RPO | Responsable |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Rollback déploiement raté | DEV | Relancer pipeline develop | 5 min | 0 | Développeur |
| Rollback déploiement raté | PREPROD | Image Docker précédente | 2 min | 0 | Tech Lead |
| Rollback déploiement raté | PROD | Bascule Blue/Green Traefik | 30s | 0 | DevOps |
| Données BDD corrompues | DEV | Seed/fixtures | 10 min | N/A | Développeur |
| Données BDD corrompues | PREPROD | Dump anonymisé de PROD | 15 min | N/A | DevOps |
| Données BDD corrompues | PROD | Snapshot pré-deploy \+ rollback | 10 min | Minutes | DevOps \+ Tech Lead |
| Service workflow crashé | Tous | Redémarrage Docker | 2 min | 0 | DevOps |
| Volume Docker corrompu | Workflow | Restauration Restic | 30 min | 24h max | DevOps |
| Perte serveur total | Workflow | Disaster Recovery | 1-3h | 24h max | Équipe complète |

#### **7\. Justifications**

##### **7.1 Pourquoi plusieurs niveaux de restauration ?**

| Raison | Explication |
| ----- | ----- |
| **Proportionnalité** | La réponse doit être proportionnelle à la gravité de l'incident |
| **Rapidité** | Un rollback conteneur (Niveau 1\) prend 30 secondes, une restauration complète prend 1 heure → il faut toujours essayer le niveau le plus simple d'abord |
| **Minimisation des pertes** | Chaque niveau supérieur implique potentiellement plus de perte de données |
| **Escalade ordonnée** | Chaque niveau implique des responsables différents, avec une escalade claire |

##### **7.2 Pourquoi un snapshot BDD avant chaque déploiement PROD ?**

* **RPO quasi-nul** pour les rollbacks post-déploiement (seules les données écrites pendant le déploiement sont perdues)

* **Rapidité** de restauration : un pg\_restore est plus rapide qu'une restauration Restic complète

* **Indépendance** du système de backup : même si Restic/MinIO est indisponible, le snapshot BDD est local

* **Cohérence** : le snapshot est pris au même moment que le déploiement, garantissant la cohérence données/code

##### **7.3 Pourquoi la stratégie Blue/Green facilite le rollback PROD ?**

* **Instantané** : le basculement Traefik se fait en moins de 1 seconde

* **Zero-downtime** : les utilisateurs ne subissent aucune interruption

* **Réversible** : l'ancienne version reste active pendant 15 minutes de monitoring

* **Sûr** : aucune modification de l'ancienne version pendant le déploiement de la nouvelle

##### **7.4 Tests réguliers de restauration**

| Test | Fréquence | Objectif |
| ----- | ----- | ----- |
| Vérification intégrité Restic | Hebdomadaire (automatique) | Garantir que les backups sont lisibles |
| Restauration test sur env DEV | Mensuelle | Valider la procédure de restauration complète |
| Exercice Disaster Recovery | Semestriel | Tester le DR complet sur un nouveau serveur |
| Rollback simulé PREPROD | Trimestriel | Vérifier que le rollback Blue/Green fonctionne |

## 

## 

## 

## 

## 

##   {#heading}

## **Diagramme de Gantt[^3]**

Le diagramme de Gantt présente le planning prévisionnel de mise en œuvre du workflow CI/CD pour l'agence Furious Ducks. Il couvre l'intégralité du projet, du brief client à la livraison finale, en estimant les temps et les coûts comme une agence.

Le planning est construit sur une durée totale de **31 semaines (du 19 janvier au 21 août 2026, environ 7 mois)**, ce qui correspond à un rythme réaliste pour une agence de 45 collaborateurs en activité, où la transformation doit s'opérer sans interrompre la production courante.

### 1\. Ressources du projet {#1.-ressources-du-projet}

#### **1.1 Équipe projet**

| Code | Rôle | Profil | TJM (HT) | Taux horaire (HT) |
| ----- | ----- | ----- | ----- | ----- |
| **DIR** | Direction / Validation stratégique | Mr Brasletti, Directeur | 620 EUR/j | 89 EUR/h |
| **CDP** | Chef de projet / Coordination | Chef de projet confirmé | 460 EUR/j | 66 EUR/h |
| **IDS** | Ingénieur DevOps Senior | Expert DevOps, architecte technique | 475 EUR/j | 68 EUR/h |
| **DS** | Développeur Senior | Développeur référent, support intégration | 400 EUR/j | 57 EUR/h |

Le détail complet du calcul des TJM (salaire brut, charges salariales, charges patronales, frais de structure, marge agence) figure en **Annexe A**.

#### **1.2 Hypothèses de planification**

La base de travail retenue est de **7 heures par jour** sur **218 jours productifs par an**, conformément au forfait jours cadre de la convention SYNTEC. L'IDS, ressource technique principale, est mobilisé à hauteur de **\~85-90 %** sur le projet, tandis que le CDP est mobilisé à **\~50 %** pour le pilotage et la coordination, le reste de son temps étant consacré à d'autres projets de l'agence. Le DS intervient ponctuellement sur les phases nécessitant un appui développement, et le DIR intervient sur les validations et les jalons uniquement ; les développeurs de l'agence restent par ailleurs mobilisés sur les projets clients en parallèle. Le projet **Thé Tip Top** sert de projet pilote pour valider le workflow avant sa généralisation, dans le cadre d'une méthodologie **Scrum** appliquée avec des sprints de 2 semaines.

Le planning est exprimé en **jours ouvrés** (semaine de 5 jours, week-ends exclus) ; les jours fériés sont absorbés par les charges partielles des ressources, aucune tâche n'étant planifiée à 100 % de charge sur ces périodes. Les durées calendaires des tâches sont dimensionnées pour tenir dans la fenêtre de chaque lot, et le travail en parallèle des ressources sur plusieurs tâches maintient la charge en jours-homme sous la durée calendaire.

### 2\. Listing des tâches par lots {#2.-listing-des-tâches-par-lots}

Les tâches sont organisées en **8 lots** (Lot 0 à Lot 7). Pour chaque tâche sont indiqués : l'identifiant, la durée, les ressources affectées, la charge en jours-homme, les prédécesseurs et le % d'achèvement.

Le % d'achèvement est initialisé à **0 %** (document prévisionnel) et sera mis à jour dans GanttProject au fil de l'exécution du projet.

#### **Lot 0 \- Pilotage et suivi de projet**

*Transverse à l'ensemble du projet*

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 0.1 | Pilotage et coordination projet | 23 sem. | CDP | 23,5 j | \- | 0 % |
| 0.2 | Comités de pilotage bimensuels | 23 sem. | DIR \+ CDP | DIR: 5 j, CDP: 5 j | \- | 0 % |
| 0.3 | Reporting et suivi d'avancement | 23 sem. | CDP | (inclus dans 0.1) | 0.1 | 0 % |

| Ressource | Charge lot 0 | Coût |
| ----- | ----- | ----- |
| CDP | 28,5 j | 13 110 EUR |
| DIR | 5 j | 3 100 EUR |
| **Total Lot 0** | **33,5 j** | **16 210 EUR** |

#### **Lot 1 \- Audit et cadrage (S1-S4)**

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 1.0 | 1er RDV de cadrage client | 1 j | DIR \+ CDP  | DIR : 0,5 j, CDP : 1 j | \- | 0 % |
| 1.1 | Audit de l'existant (infrastructure, pratiques, outils) | 1 sem. | CDP \+ IDS | CDP: 5 j, IDS: 5 j | 1.0 | 0 % |
| 1.2 | Recueil des besoins et contraintes par équipe | 3 j | CDP \+ DS | CDP: 3 j, DS: 2 j | 1.0  | 0 % |
| 1.3 | Rédaction du cahier des spécifications techniques | 1 sem. | CDP \+ IDS | CDP: 5 j, IDS: 3 j | 1.1, 1.2 | 0 % |
| 1.4 | Définition de la stratégie de migration | 3j | IDS | 3 j | 1.1 | 0 % |
| 1.5 | Validation du planning et du budget par la direction | 1 j | DIR \+ CDP | DIR: 1 j, CDP: 0,5 j | 1.3, 1.4 | 0 % |
|  | **JALON M1 : GO projet validé par la direction** |  |  |  | **1.5** |  |

| Ressource | Charge lot 1 | Coût |
| ----- | ----- | ----- |
| CDP | 14,5 j | 6 670 EUR |
| IDS | 11 j | 5 225 EUR |
| DS | 2 j | 800 EUR |
| DIR | 1,5 j | 930 EUR |
| **Total Lot 1** | **29 j** | **13 625 EUR** |

#### **Lot 2 \- Infrastructure socle (S5-S9)**

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 2.1 | Provisionnement des serveurs VPS Linux | 4 j | IDS | 2 j | 1.5 (M1) | 0 % |
| 2.2 | Installation et configuration de Docker | 4 j | IDS | 2 j | 2.1 | 0 % |
| 2.3 | Mise en place de Traefik (reverse proxy, TLS, sous-domaines) | 3 j | IDS | 3 j | 2.2 | 0 % |
| 2.4 | Déploiement de GitLab CE (SCM) | 1 sem. | IDS \+ DS | IDS: 3 j, DS: 2 j | 2.3 | 0 % |
| 2.5 | Configuration GitFlow, protections branches, templates MR | 1 sem. | IDS \+ DS | IDS: 1 j, DS: 2 j | 2.4 | 0 % |
| 2.6 | Déploiement de Jenkins (controller \+ agents) | 1 sem. | IDS | 4 j | 2.3 | 0 % |
| 2.7 | Configuration RBAC Jenkins, credentials store | 1 j | IDS | 1 j | 2.6 | 0 % |
| 2.8 | Déploiement de Harbor (registry Docker) | 1 sem. | IDS | 2 j | 2.3 | 0 % |
| 2.9 | Tests d'intégration chaîne SCM → Jenkins → Harbor | 2 j | IDS \+ DS | IDS: 2 j, DS: 1 j | 2.5, 2.7, 2.8 | 0 % |
|  | **JALON M2 : Chaîne CI/CD de base opérationnelle** |  |  |  | **2.9** |  |

| Ressource | Charge lot 2 | Coût |
| ----- | ----- | ----- |
| IDS | 20 j | 9 500 EUR |
| DS | 5 j | 2 000 EUR |
| **Total Lot 2** | **25 j** | **11 500 EUR** |

#### **Lot 3 \- Monitoring, backups et sécurité (S10-S18)**

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 3.1 | Déploiement de Prometheus \+ Grafana | 2 sem. | IDS | 4 j | 2.9 (M2) | 0 % |
| 3.2 | Configuration des dashboards standardisés et alertes | 2 sem. | IDS | 3 j | 3.1 | 0 % |
| 3.3 | Déploiement de Loki (centralisation des logs) | 1 sem. | IDS | 2 j | 3.1 | 0 % |
| 3.4 | Mise en place de Restic \+ MinIO (backups automatisés) | 1 sem. | IDS | 3 j | 2.9 (M2) | 0 % |
| 3.5 | Configuration politique de rétention (quotidienne/hebdo/mensuelle) | 2 j | IDS | 1 j | 3.4 | 0 % |
| 3.6 | Premier test de restauration complet | 1 sem. | IDS \+ CDP | IDS: 2 j, CDP: 1 j | 3.5 | 0 % |
| 3.7 | Intégration Trivy, Semgrep, Gitleaks dans Jenkins | 1 sem. | IDS | 2 j | 2.9 (M2) | 0 % |
| 3.8 | Déploiement de SonarQube \+ quality gates | 2 sem. | IDS \+ DS | IDS: 2 j, DS: 1 j | 2.9 (M2) | 0 % |
| 3.9 | Validation de la stack complète | 2 j | IDS \+ CDP | IDS: 1 j, CDP: 1 j | 3.2, 3.3, 3.6, 3.7, 3.8 | 0 % |
|  | **JALON M3 : Infrastructure complète opérationnelle** |  |  |  | **3.9** |  |

| Ressource | Charge lot 3 | Coût |
| ----- | ----- | ----- |
| IDS | 20 j | 9 500 EUR |
| DS | 1 j | 400 EUR |
| CDP | 2 j | 920 EUR |
| **Total Lot 3** | **23 j** | **10 820 EUR** |

#### **Lot 4 \- Projet pilote Thé Tip Top (S10-S21)**

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 4.1 | Création dépôt, configuration GitFlow, Jenkinsfile | 1 sem. | IDS \+ DS | IDS: 1 j, DS: 2 j | 2.9 (M2) | 0 % |
| 4.2 | Rédaction pipeline CI/CD complet (build, tests, scans, deploy) | 2 sem. | IDS \+ DS | IDS: 4 j, DS: 2 j | 4.1 | 0 % |
| 4.3 | Déploiement environnement DEV automatisé | 1 sem. | IDS | 2 j | 4.2 | 0 % |
| 4.4 | Déploiement environnement PREPROD \+ tests de charge K6 | 1 sem. | IDS \+ DS | IDS: 3,5 j, DS: 2 j | 4.3 | 0 % |
| 4.5 | Recette fonctionnelle PREPROD (QA interne) | 1 sem. | CDP \+ DS | CDP: 3 j, DS: 4 j | 4.4, 3.9 (M3) | 0 % |
| 4.6 | Déploiement production (stratégie Blue/Green) | 3 j | IDS \+ CDP | IDS: 1,5 j, CDP: 1 j | 4.5 | 0 % |
| 4.7 | Monitoring production \+ validation des alertes | 1 sem. | IDS | 1 j | 4.6 | 0 % |
| 4.8 | Retour d'expérience et ajustements workflow | 2 j | CDP \+ IDS \+ DIR | CDP: 1,5 j, IDS: 1 j, DIR: 0,5 j | 4.7 | 0 % |
|  | **JALON M4 : Projet pilote en production, workflow validé** |  |  |  | **4.8** |  |

Ce lot chevauche volontairement le lot 3\. Les premières tâches (4.1, 4.2) peuvent démarrer dès que la chaîne CI de base est opérationnelle (M2), tandis que la recette (4.5) nécessite l'infrastructure complète (M3).Le retour d'expérience (4.8) conclut le jalon M4 ; la validation du monitoring en production (4.7) se prolonge la semaine suivante (S21), en observation du fonctionnement réel du pilote. Le lot 4 porte sur la mise en place du workflow CI/CD du projet Thé Tip Top (pipeline, environnements, mise en production pilote) : le développement fonctionnel du site de jeu-concours lui-même, objet du cahier des charges, se poursuit au-delà de M4 et aboutit à la mise en ligne du 24 août 2026, qui s'effectue ainsi sur un workflow éprouvé et généralisé à toute l'agence.

| Ressource | Charge lot 4 | Coût |
| ----- | ----- | ----- |
| IDS | 14 j | 6 650 EUR |
| DS | 10 j | 4 000 EUR |
| CDP | 5,5 j | 2 530 EUR |
| DIR | 0,5 j | 310 EUR |
| **Total Lot 4** | **30,5 j** | **13 490 EUR** |

#### **Lot 5 \- Recrutement et formation (S6-S26)**

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 5.1 | Publication de l'offre et sourcing | 3 sem. | CDP \+ DIR | CDP: 3 j, DIR: 1 j | 1.5 (M1) | 0 % |
| 5.2 | Entretiens et sélection | 3 sem. | CDP \+ DIR \+ IDS | CDP: 4 j, DIR: 2 j, IDS: 3 j | 5.1 | 0 % |
| 5.3 | Intégration administrative | 3 j | CDP | 2 j | 5.2 | 0 % |
| 5.4 | Formation Phase 1 : Accueil et découverte | 2 sem. | IDS (réf.) | IDS: 2 j | 5.3 | 0 % |
| 5.5 | Formation Phase 2 : Docker, SCM, Traefik | 2 sem. | IDS (réf.) | IDS: 2 j | 5.4 | 0 % |
| 5.6 | Formation Phase 3 : Jenkins, Harbor, pipelines | 2 sem. | IDS (réf.) | IDS: 2 j | 5.5 | 0 % |
| 5.7 | Formation Phase 4 : Monitoring, backups, sécurité | 2 sem. | IDS (réf.) | IDS: 2 j | 5.6 | 0 % |
| 5.8 | Formation Phase 5 : Mise en situation et autonomie | 2 sem. | IDS (réf.) | IDS: 2 j | 5.7 | 0 % |
| 5.9 | Formation Phase 6 : Documentation et validation | 2 sem. | IDS (réf.) \+ CDP | IDS: 2 j, CDP: 1 j | 5.8 | 0 % |
|  | **JALON M5 : Ingénieur DevOps autonome** |  |  |  | **5.9** |  |

Le recrutement est lancé dès S6, pendant la mise en place de l'infrastructure. L'ingénieur DevOps recruté arrive en S13, alors que le socle technique vient d'être finalisé ; il s'immerge d'abord en binôme sur le projet pilote en cours (S14), puis la formation structurée se déroule de S15 à S26. L'IDS intervient en tant que référent technique (\~20 % de son temps pendant les 12 semaines de formation), le reste étant en autoformation guidée et ateliers pratiques (cf. plan de formation, partie F).

| Ressource | Charge lot 5 | Coût |
| ----- | ----- | ----- |
| CDP | 10 j | 4 600 EUR |
| DIR | 3 j | 1 860 EUR |
| IDS | 14 j | 6 650 EUR |
| **Total Lot 5** | **27 j** | **13 110 EUR** |

#### **Lot 6 \- Généralisation et migration des projets (S21-S28)**

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 6.1 | Définition du plan de migration priorisé | 1 sem. | IDS \+ CDP | IDS: 2 j, CDP: 2 j | 4.8 (M4) | 0 % |
| 6.2 | Mise en place des templates et conventions réutilisables | 1 sem. | IDS \+ DS | IDS: 2 j, DS: 2 j | 6.1 | 0 % |
| 6.3 | Migration lot 1 : projets critiques (2-3 projets) | 2 sem. | IDS \+ DS | IDS: 6 j, DS: 4 j | 6.2 | 0 % |
| 6.4 | Migration lot 2 : projets courants (3-5 projets) | 4 sem. | IDS \+ DS | IDS: 8 j, DS: 6 j | 6.3 | 0 % |
| 6.5 | Migration lot 3 : projets restants | 2 sem. | IDS \+ DS | IDS: 6 j, DS: 5 j | 6.4 | 0 % |
| 6.6 | Accompagnement des équipes de développement | 3 sem. | IDS \+ DS | IDS: 3 j, DS: 3 j | 6.1 | 0 % |
|  | **JALON M6 : 100 % des projets migrés** |  |  |  | **6.5** |  |

L'accompagnement des équipes (6.6) est concentré sur les trois premières semaines de la généralisation (S21-S23), l'ingénieur DevOps recruté prenant progressivement le relais. Celui-ci participe activement aux migrations dès sa montée en compétences (à partir de S25), ce qui permet de tenir les migrations sur 2 semaines par vague. Sa charge n'est pas valorisée dans le devis projet car son salaire est comptabilisé en coût récurrent (cf. partie I).

| Ressource | Charge lot 6 | Coût |
| ----- | ----- | ----- |
| IDS | 27 j | 12 825 EUR |
| DS | 20 j | 8 000 EUR |
| CDP | 2 j | 920 EUR |
| **Total Lot 6** | **49 j** | **21 745 EUR** |

#### **Lot 7 \- Stabilisation et clôture (S29-S31)**

| ID | Tâche | Durée | Ressource(s) | Charge (j/h) | Prédécesseur | % |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 7.1 | Optimisation des performances (pipelines, monitoring, backups) | 1 sem. | IDS | 4 j | 6.5 (M6) | 0 % |
| 7.2 | Rédaction et finalisation de la documentation complète | 3 j | IDS \+ CDP | IDS: 3 j, CDP: 2 j | 6.5 (M6) | 0 % |
| 7.3 | Tests de restauration complets (validation trimestrielle) | 2 j | IDS | 2 j | 7.1 | 0 % |
| 7.4 | Bilan de projet avec la direction | 3 j | CDP \+ DIR | CDP: 2 j, DIR: 1 j | 7.2, 7.3 | 0 % |
| 7.5 | Transfert de responsabilité à l'ingénieur DevOps | 2 j | IDS \+ CDP | IDS: 2 j, CDP: 1 j | 7.4, 5.9 (M5)  | 0 % |
| 7.6 | Définition de la roadmap d'évolution (Kubernetes, Vault, etc.) | 2 j | IDS \+ DIR | IDS: 1 j, DIR: 0,5 j | 7.2, 7.3 | 0 % |
|  | **JALON M7 : Clôture du projet, exploitation transférée** |  |  |  | **7.5, 7.6** |  |

| Ressource | Charge lot 7 | Coût |
| ----- | ----- | ----- |
| IDS | 12 j | 5 700 EUR |
| CDP | 5 j | 2 300 EUR |
| DIR | 1,5 j | 930 EUR |
| **Total Lot 7** | **18,5 j** | **8 930 EUR** |

La roadmap d'évolution (7.6) est préparée en amont puis présentée lors du bilan de projet (7.4), qui constitue la clôture formelle avec la direction. Le transfert de responsabilité (7.5) intervient en toute fin de projet, une fois le bilan réalisé et la formation validée (M5).

### 3\. Diagramme des ressources {#3.-diagramme-des-ressources}

#### **Charge par ressource et par lot**

| Ressource | Lot 0 | Lot 1 | Lot 2 | Lot 3 | Lot 4 | Lot 5 | Lot 6 | Lot 7 | Total (j) | Coût total |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **DIR** | 5 j | 1,5 j | \- | \- | 0,5 j | 3 j | \- | 1,5 j | **11,5 j** | **7 130 EUR** |
| **CDP** | 28,5 j | 14,5 j | \- | 2 j | 5,5 j | 10 j | 2 j | 5 j | **67,5 j** | **31 050 EUR** |
| **IDS** | \- | 11 j | 20 j | 20 j | 14 j | 14 j | 27 j | 12 j | **118 j** | **56 050 EUR** |
| **DS** | \- | 2 j | 5 j | 1 j | 10 j | \- | 20 j | \- | **38 j** | **15 200 EUR** |
| **Total** | **33,5 j** | **29 j** | **25 j** | **23 j** | **30 j** | **27 j** | **49 j** | **18,5 j** | **235 j** | **109 430 EUR** |

#### **Taux d'occupation par période**

| Période | Semaines | IDS | CDP | DS | DIR |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Phase cadrage | S1-S4 (20 j ouvrés) | 11 j (55 %) | 14,5 j (73 %) | 2 j (10 %) | 1,5 j (8 %) |
| Infrastructure | S5-S9 (25 j ouvrés) | 20 j (80 %) | 8,3 j (33 %) | 5 j (20 %) | 1,9 j (8 %) |
| Monitoring \+ sécurité | S10-S18 (45 j ouvrés) | 37,5 j (83 %) | 17,5 j (39 %) | 7 j (16 %) | 3,7 j (8%) |
| Pilote \+ recrutement | S19-S21 (15 j ouvrés) | 9,5 j (63 %) | 10,7 j (71 %) | 5 j (33 %) | 1,1 j (7 %) |
| Migration \+ formation | S22-S28 (35 j ouvrés) | 28 j (80 %) | 8,4 j (24 %) | 19 j (54 %) | 1,3 j (4 %) |
| Stabilisation | S29-S31 (15 j ouvrés) | 12 j (80 %) | 8,2 j (55 %) | \- | 2,1 j (14 %) |

Les charges du CDP intègrent le pilotage transverse (lot 0), lissé de S5 à S31 ; sur S1-S4, le pilotage est porté par les tâches de cadrage du lot 1, ce qui concentre le CDP à 73 % d'occupation sur cette phase intensive de cadrage.

Le planning ne comporte aucune surallocation : aucune ressource ne dépasse 100 % de charge sur aucune journée du projet. L'IDS, ressource technique principale, est mobilisé à 80-83 % en moyenne sur les phases denses, en cohérence avec l'hypothèse de mobilisation à 85-90 % ; les journées affichées à exactement 100 % dans GanttProject (couleur « charge pleine ») correspondent au cumul volontaire de tâches parallèles à charges partielles, sans dépassement.

### 4\. Devis projet par lot {#4.-devis-projet-par-lot}

#### **Coûts humains par lot**

| Lot | Intitulé | Charge totale | Coût humain |
| ----- | ----- | ----- | ----- |
| Lot 0 | Pilotage et suivi de projet | 33,5 j | 16 210 EUR |
| Lot 1 | Audit et cadrage | 29 j | 13 625 EUR |
| Lot 2 | Infrastructure socle | 25 j | 11 500 EUR |
| Lot 3 | Monitoring, backups et sécurité | 23 j | 10 820 EUR |
| Lot 4 | Projet pilote Thé Tip Top | 30 j | 13 490 EUR |
| Lot 5 | Recrutement et formation | 27 j | 13 110 EUR |
| Lot 6 | Généralisation et migration | 49 j | 21 745 EUR |
| Lot 7 | Stabilisation et clôture | 18,5 j | 8 930 EUR |
|  | **Sous-total coûts humains** | **235 j** | **109 430 EUR** |

#### 

#### **Coûts directs complémentaires**

| Poste | Détail | Coût |
| ----- | ----- | ----- |
| Infrastructure serveur (6 mois) | 4 VPS \+ stockage objet (cf. partie I) | 2 460 EUR |
| Frais de recrutement | Publication offres, outils sourcing | 1 500 EUR |
| Environnement sandbox formation | VPS dédié à la formation (6 mois) | 540 EUR |
| Budget certifications DevOps | DCA, CJE (cf. plan de formation) | 1 500 EUR |
|  | **Sous-total coûts directs** | **6 000 EUR** |

#### **Devis total du projet**

|  | Montant HT |
| :---- | ----- |
| Coûts humains | 109 430 EUR |
| Coûts directs complémentaires | 6 000 EUR |
| **TOTAL PROJET** | **115 430 EUR** |

### 5\. Diagramme de Gantt (visuelle simplifié) {#5.-diagramme-de-gantt-(visuelle-simplifié)}

### ![][image19]

### 6\. Synthèse des jalons {#6.-synthèse-des-jalons}

| Jalon | Semaine | Date prévisionnelle | Prédécesseur | Description |
| ----- | ----- | ----- | ----- | ----- |
| **M1** | S4 | 13/02/2026 | 1.5 | GO projet validé par la direction |
| **M2** | S9 | 20/03/2026 | 2.9 | Chaîne CI/CD de base opérationnelle |
| **M3** | S18 | 22/05/2026 | 3.9 | Infrastructure complète (monitoring, backups, sécurité) |
| **M4** | S20 | 05/06/2026 | 4.8 | Projet pilote Thé Tip Top en production |
| **M5** | S26 | 17/07/2026 | 5.9 | Ingénieur DevOps autonome |
| **M6** | S28 | 31/07/2026 | 6.5 | 100 % des projets migrés |
| **M7** | S31 | 21/08/2026 | 7.5, 7.6 | Clôture du projet, exploitation transférée |

### 7\. Chemin critique {#7.-chemin-critique}

Le diagramme ci-dessous détaille le chemin critique du projet : il traverse les lots techniques de bout en bout, du cadrage à la stabilisation, tout retard sur l'une de ces tâches décalant directement la date de clôture (M7, 21/08/2026) dont dépend le rendu officiel du 24 août. Les tâches amont du pilote (4.1 à 4.4) disposent d'environ trois semaines de marge, le lot 3 étant volontairement étalé en parallèle pour lisser la charge de l'IDS sans créer de surallocation. Le recrutement (Lot 5\) constitue quant à lui un chemin secondaire critique, connecté au chemin principal via M5 et la tâche 7.5 : un retard sur le recrutement décale la formation et impacte la capacité de migration et le transfert de responsabilité.

![][image20]

*Figure 17 : Schéma chemin critique*

#### **Risques et mitigations**

| Risque | Impact | Probabilité | Mitigation |
| ----- | ----- | ----- | ----- |
| Retard de recrutement DevOps | Décalage formation et transfert | Moyenne | Lancer le sourcing dès S6, prévoir alternative (freelance temporaire) |
| Indisponibilité des équipes (charge client) | Ralentissement des migrations | Moyenne | Migration par lots priorisés, planning en sprints ajustables |
| Incompatibilité technique d'un projet existant | Retard sur la migration | Faible | Identifier les projets à risque lors de l'audit (Lot 1\) |
| Incident majeur pendant la mise en place | Interruption du planning | Faible | Environnement sandbox isolé, backups systématiques |
| Sous-estimation de la charge migration | Dépassement budget Lot 6 | Moyenne | Marge de 10 % intégrée, rétrospectives Scrum pour ajustement |

### 8\. Cohérence avec la méthodologie Scrum {#8.-cohérence-avec-la-méthodologie-scrum}

Le planning est structuré en **sprints de 2 semaines**, conformément à la méthodologie préconisée en partie B. Une **Sprint Review** est organisée à chaque fin de sprint pour présenter l'avancement à la direction, complétée par une **rétrospective** permettant d'ajuster le rythme et les priorités. Les **jalons** correspondent à des points de décision formels où la direction valide la poursuite du projet, et le **% d'achèvement** de chaque tâche est mis à jour dans GanttProject à chaque fin de sprint.

## **Estimation des coûts et rentabilité** {#estimation-des-coûts-et-rentabilité}

Cette section présente l'estimation budgétaire complète du projet de mise en place du workflow CI/CD pour l'agence Furious Ducks. Elle couvre les **coûts de mise en place** (issus du devis Gantt, partie H), les **coûts de maintenance récurrents**, et une **analyse de rentabilité comparative** entre l'organisation actuelle (sans workflow) et l'organisation cible (avec workflow).

Toutes les estimations sont basées sur des prix constatés sur le marché français en 2025-2026, pour des solutions open source hébergées sur infrastructure dédiée ou cloud.

### 1\. Coûts de mise en place du workflow

Les coûts de mise en place correspondent au **devis projet** établi dans le diagramme de Gantt (partie H). Ils couvrent les 31 semaines de mise en œuvre, du brief client à la livraison.

#### **1.1 Rappel du devis par lot (cf. Gantt)**

| Lot | Intitulé | Charge | Coût humain |
| ----- | ----- | ----- | ----- |
| Lot 0 | Pilotage et suivi de projet | 33,5 j | 16 210 EUR |
| Lot 1 | Audit et cadrage | 29 j | 13 625 EUR |
| Lot 2 | Infrastructure socle | 25 j | 11 500 EUR |
| Lot 3 | Monitoring, backups et sécurité | 23 j | 10 820 EUR |
| Lot 4 | Projet pilote Thé Tip Top | 30 j | 13 490 EUR |
| Lot 5 | Recrutement et formation | 27 j | 13 110 EUR |
| Lot 6 | Généralisation et migration | 49 j | 21 745 EUR |
| Lot 7 | Stabilisation et clôture | 18,5 j | 8 930 EUR |
|  | **Sous-total coûts humains** | **235 j** | **109 430 EUR** |

#### **1.2 Coûts directs complémentaires**

| Poste | Détail | Coût |
| ----- | ----- | ----- |
| Infrastructure serveur (6 mois) | 4 VPS Linux \+ stockage objet MinIO | 2 460 EUR |
| Frais de recrutement | Publication offres, outils sourcing | 1 500 EUR |
| Environnement sandbox formation | VPS dédié (6 mois) | 540 EUR |
| Budget certifications DevOps | DCA, CJE (cf. plan de formation, partie F) | 1 500 EUR |
|  | **Sous-total coûts directs** | **6 000 EUR** |

#### **1.3 Licences logicielles**

L'ensemble du socle technique repose sur des **outils 100 % open source**, conformément aux exigences du cahier des charges :

| Outil | Licence | Coût |
| ----- | ----- | ----- |
| GitLab Community Edition | MIT (Expat) | Gratuit |
| Jenkins | MIT | Gratuit |
| Harbor | Apache 2.0 | Gratuit |
| Traefik | MIT | Gratuit |
| Prometheus \+ Grafana \+ Loki | Apache 2.0 / AGPL v3 | Gratuit |
| SonarQube Community | LGPL v3 | Gratuit |
| Restic \+ MinIO | BSD / AGPL v3 | Gratuit |
| Trivy, Semgrep, Gitleaks | Apache 2.0 / LGPL / MIT | Gratuit |
| K6 | AGPL v3 | Gratuit |
| Docker Engine | Apache 2.0 | Gratuit |

**Sous-total licences : 0 EUR**

Ce choix 100 % open source supprime les coûts de licence récurrents et garantit l'indépendance technologique de l'agence.

#### **1.4 Total des coûts de mise en place**

| Poste | Montant HT |
| ----- | ----- |
| Coûts humains (devis Gantt) | 109 430 EUR |
| Coûts directs complémentaires | 6 000 EUR |
| Licences logicielles | 0 EUR |
| **TOTAL mise en place** | **115 430 EUR** |

### 2\. Coûts de maintenance récurrents (annuels)

Une fois le workflow en production, les coûts récurrents se répartissent comme suit :

#### **2.1 Infrastructure serveur**

| Poste | Coût mensuel | Coût annuel |
| ----- | ----- | ----- |
| VPS Socle CI/CD (8 vCPU, 32 Go RAM, 500 Go SSD NVMe) | 150 EUR | 1 800 EUR |
| VPS Monitoring \+ Backups (8 vCPU, 16 Go RAM, 500 Go SSD) | 110 EUR | 1 320 EUR |
| VPS DEV/PREPROD mutualisé (8 vCPU, 16 Go RAM, 500 Go SSD) | 110 EUR | 1 320 EUR |
| VPS Production (8 vCPU, 16 Go RAM, 500 Go SSD) | 110 EUR | 1 320 EUR |
| Stockage objet backups externalisés (1 To) | 20 EUR | 240 EUR |
| **Sous-total infrastructure MVP** | **500 EUR/mois** | **6 000 EUR/an** |
| Option HA : \+3 VPS redondance SCM/CI/Registry | \+330 EUR | \+3 960 EUR |
| **Sous-total infrastructure avec option HA** | **830 EUR/mois** | **9 960 EUR/an** |

Les prix sont basés sur les grilles tarifaires 2026 des hébergeurs cloud français (OVHcloud b3-32 : \~0,20 EUR/h, Scaleway, Infomaniak). Un engagement annuel permet généralement une réduction de 10 à 20 %, ce qui ramènerait ce poste à environ 5 000-5 400 EUR/an.

#### **2.2 Salaire ingénieur DevOps**

Conformément à la fiche de poste et au conseil sur le contrat de travail (partie F) :

| Poste | Montant |
| ----- | ----- |
| Salaire brut annuel (profil confirmé 3-5 ans) | 50 000 EUR |
| Charges patronales (\~45 %) | 22 500 EUR |
| **Coût total employeur annuel** | **72 500 EUR** |

#### **2.3 Formation continue et veille**

| Poste | Coût annuel |
| ----- | ----- |
| Budget certifications et formations continues | 2 000 EUR |
| Participation conférences / événements DevOps | 1 000 EUR |
| **Sous-total formation continue** | **3 000 EUR/an** |

#### **2.4 Maintenance courante**

| Poste | Coût annuel |
| ----- | ----- |
| Domaines (wk-archi-o24a-4-5-G1.fr et sous-domaines) | 50 EUR |
| Certificats TLS (Let's Encrypt) | Gratuit |
| Maintenance applicative (mises à jour, patches) | Inclus dans le temps ingénieur DevOps |
| **Sous-total maintenance** | **50 EUR/an** |

#### **2.5 Total des coûts récurrents annuels**

| Poste | Montant annuel |
| ----- | ----- |
| Infrastructure serveur | 6 000 EUR |
| Salaire ingénieur DevOps (coût employeur) | 72 500 EUR |
| Formation continue | 3 000 EUR |
| Maintenance | 50 EUR |
| **TOTAL récurrent annuel** | **81 550 EUR/an** |

### 3\. Estimation de la rentabilité : avec workflow vs sans workflow

Conformément aux attentes, cette section compare le coût de fonctionnement de l'agence **avec** et **sans** le workflow CI/CD, en valorisant les gains et pertes associés.

#### **3.1 Coûts cachés de l'organisation actuelle (sans workflow)**

L'organisation actuelle de Furious Ducks, telle que décrite dans la partie A (État des lieux), engendre des **coûts cachés** significatifs, absorbés de manière diffuse par les équipes :

| Poste de coût caché | Estimation | Méthode de calcul |
| ----- | ----- | ----- |
| **Déploiements manuels** | 27 000 EUR/an | \~20 déploiements/mois x 2,5h/déploiement x 12 mois x 45 EUR/h |
| **Incidents production (absence de monitoring)** | 28 080 EUR/an | \~10 incidents/mois x 5h résolution x 12 mois x 46,80 EUR/h |
| **Conflits de code et pertes de versions** | 8 640 EUR/an | \~20h/mois de résolution manuelle x 12 mois x 36 EUR/h |
| **Tests manuels et régressions** | 16 200 EUR/an | \~30h/mois de tests manuels \+ correction régressions x 12 mois x 45 EUR/h |
| **Risque de perte de données (absence de backups)** | 5 000 EUR/an | Coût annualisé du risque (probabilité x impact estimé) |
| **Temps de coordination non structuré** | 10 800 EUR/an | \~20h/mois de coordination ad hoc x 12 mois x 45 EUR/h |
| **TOTAL coûts cachés annuels** | **95 720 EUR/an** |  |

**Justification des taux horaires** : Le coût horaire moyen d'un développeur de l'agence est estimé à 45 EUR/h (coût employeur, hors marge). Ce taux est cohérent avec le profil Développeur Senior (TJM 400 EUR/j ÷ 7h \= 57 EUR/h avec marge, soit \~40-45 EUR/h en coût employeur). Pour les incidents, un taux légèrement supérieur (46,80 EUR/h) reflète l'implication de profils plus seniors.

#### **3.2 Tableau comparatif annuel : avec vs sans workflow**

| Poste | Sans workflow | Avec workflow | Différence |
| ----- | ----- | ----- | ----- |
| **Infrastructure serveur** | \~1 200 EUR/an (hébergement basique, pas de monitoring, pas de registry) | 6 000 EUR/an | \+4 800 EUR |
| **Ingénieur DevOps dédié** | 0 EUR (pas de poste dédié) | 72 500 EUR/an | \+72 500 EUR |
| **Formation continue** | 0 EUR | 3 000 EUR/an | \+3 000 EUR |
| **Maintenance** | 0 EUR | 50 EUR/an | \+50 EUR |
| **Déploiements manuels** | 27 000 EUR/an | \~4 050 EUR/an (temps résiduel, \-85 %) | \-22 950 EUR |
| **Incidents production** | 28 080 EUR/an | \~8 424 EUR/an (monitoring proactif, \-70 %) | \-19 656 EUR |
| **Conflits de code** | 8 640 EUR/an | \~1 728 EUR/an (GitFlow \+ MR, \-80 %) | \-6 912 EUR |
| **Tests manuels et régressions** | 16 200 EUR/an | \~3 240 EUR/an (tests automatisés, \-80 %) | \-12 960 EUR |
| **Risque perte de données** | 5 000 EUR/an | \~500 EUR/an (backups automatisés, \-90 %) | \-4 500 EUR |
| **Coordination non structurée** | 10 800 EUR/an | \~2 160 EUR/an (Scrum \+ outils, \-80 %) | \-8 640 EUR |
|  |  |  |  |
| **TOTAL annuel** | **96 920 EUR/an** | **101 652 EUR/an** | **\+4 732 EUR** |

#### **3.3 Analyse de la comparaison**

**Lecture du tableau** :

* **Sans workflow**, l'agence dépense **96 920 EUR/an** de manière invisible : temps perdu sur des tâches manuelles, incidents, conflits, risques. Ces coûts sont absorbés de façon diffuse par les 45 collaborateurs et ne figurent sur aucune ligne budgétaire, mais ils pèsent directement sur la productivité et la rentabilité.

* **Avec workflow**, l'agence dépense **101 652 EUR/an** de manière structurée et maîtrisée : un poste dédié, une infrastructure professionnelle, et des processus automatisés. Les coûts sont identifiés, budgétés et contrôlables.

**Résultat net quantifiable** : Sur les seuls coûts directement mesurables, le workflow représente un surcoût net de **\+4 732 EUR/an** par rapport à la situation actuelle. Ce delta s'explique principalement par l'intégration du salaire de l'ingénieur DevOps (72 500 EUR/an), poste inexistant aujourd'hui.

**Interprétation** : Ce résultat ne doit pas être lu comme un désavantage. La comparaison chiffre-à-chiffre reste incomplète car elle ne valorise pas la **capacité de livraison libérée** : les 75 618 EUR de coûts évités correspondent à du temps développeur récupéré, qui peut être directement redirigé vers des missions facturables. Si seulement **6 % de ce temps libéré** génère du chiffre d'affaires additionnel (environ 4 500 EUR/an), le workflow atteint l'équilibre financier. Au-delà, il devient un levier de croissance net.

En d'autres termes : l'agence ne paye pas pour un outil de plus, elle structure son activité pour produire davantage à effectif constant.

#### **3.4 Gains non quantifiables mais stratégiques**

Au-delà des chiffres, le workflow apporte des gains structurants qui ne figurent pas dans le tableau mais représentent une valeur significative :

| Gain | Impact |
| ----- | ----- |
| **Qualité des livrables** | Réduction des bugs en production grâce aux tests automatisés et quality gates |
| **Satisfaction client** | Livraisons plus fiables et plus fréquentes, réactivité accrue |
| **Attractivité employeur** | Environnement technique moderne → attirer et fidéliser les profils techniques |
| **Scalabilité** | Capacité à absorber de nouveaux projets sans augmenter proportionnellement les effectifs |
| **Conformité et sécurité** | Intégration DevSecOps, protection des données clients (RGPD) |
| **Réduction du bus factor** | Procédures documentées, infrastructure as code, réduction de la dépendance aux individus |
| **Image de marque** | Positionnement professionnel vis-à-vis des clients et prospects |
| **Capacité de livraison** | x3 sur la fréquence de déploiement → plus de projets livrés à effectif constant |

### 4\. Retour sur investissement (ROI)

#### **4.1 Calcul du ROI**

| Indicateur | Valeur |
| ----- | ----- |
| Investissement initial (mise en place) | 115 430 EUR |
| Coûts récurrents annuels (avec workflow) | 81 550 EUR |
| Coûts cachés annuels évités (gains quantifiables) | 75 618 EUR |
| Surcoût net annuel vs organisation actuelle (quantifiable) | \+4 732 EUR |
| Valeur du temps développeur libéré (si 100 % redirigé) | 75 618 EUR/an |

**Détail des gains quantifiables** : 22 950 \+ 19 656 \+ 6 912 \+ 12 960 \+ 4 500 \+ 8 640 \= **75 618 EUR/an** de coûts évités (temps développeur libéré des tâches manuelles non productives).

**Note sur le surcoût net** : Le workflow représente un surcoût de 4 732 EUR/an sur la seule base des coûts directement mesurables. Ce delta est entièrement compensé si seulement 6 % du temps développeur libéré (environ 450 h/an sur 75 618 EUR) est redirigé vers des missions facturables.

#### **4.2 Délai de retour sur investissement**

Le délai de retour se calcule sur le bénéfice net annuel du workflow, c'est-à-dire la valeur du temps développeur libéré effectivement redirigé vers des missions facturables, diminuée du surcoût récurrent net de 4 732 EUR/an établi au 3.2. Cette base de calcul est volontairement prudente : le temps redirigé est valorisé à son coût interne (45 EUR/h), sans compter la marge de l'agence appliquée aux missions facturées.

| Scénario | Hypothèse (part du temps libéré redirigée vers des missions facturables)  | Bénéfice net annuel | Calcul | Délai de retour  |
| ----- | ----- | ----- | ----- | ----- |
| **Prudent** | 50 % | 50 % × 75 618 \- 4 732 \= 33 077 EUR/an | 115 430 / 33 077 | **\~42 mois** |
| **Réaliste** | 75 % | 75 % × 75 618 \- 4 732 \= 51 982 EUR/an | 115 430 / 51 982 | **\~27 mois** |
| **Volontariste** | 100 % | 100 % × 75 618 \- 4 732 \= 70 886 EUR/an  | 115 430 / 70 886 | **\~20 mois** |

Dans le scénario réaliste, l'investissement initial de 115 430 EUR est amorti en environ 27 mois. Ce calcul est cohérent avec le seuil d'équilibre du 3.3 : en dessous de 6 % de temps redirigé, le surcoût annuel n'est pas couvert et l'investissement ne se rembourse pas. La rentabilité du workflow repose donc explicitement sur la capacité de l'agence à revendre la capacité de production récupérée \- hypothèse réaliste pour une agence de 45 collaborateurs en croissance, dont le carnet de commandes (à commencer par le projet Thé Tip Top) absorbe naturellement cette capacité.

#### **4.3 Rentabilité croissante**

Les gains augmentent dans le temps car :

* La **fréquence de déploiement** augmente avec la montée en maturité des équipes.

* Les **coûts d'infrastructure** restent stables grâce à la conteneurisation et à la mutualisation.

* L'**ingénieur DevOps** gagne en efficacité et peut prendre en charge des missions complémentaires (conseil DevOps clients, Kubernetes, IaC).

* Les **coûts cachés résiduels** continuent de diminuer au fil de l'adoption du workflow.

### 5\. Budget prévisionnel sur 3 ans

#### **5.1 Budget de trésorerie (dépenses réelles)**

| Poste | Année 1 (mise en place \+ exploitation) | Année 2 | Année 3 | Total 3 ans |
| ----- | ----- | ----- | ----- | ----- |
| **Investissement initial** | 115 430 EUR | \- | \- | 115 430 EUR |
| Infrastructure serveur | 6 000 EUR | 6 600 EUR (+10 %) | 7 260 EUR (+10 %) | 19 860 EUR |
| Salaire ingénieur DevOps | 72 500 EUR | 74 700 EUR (+3 %) | 76 940 EUR (+3 %) | 224 140 EUR |
| Formation continue | 3 000 EUR | 3 000 EUR | 3 000 EUR | 9 000 EUR |
| Maintenance | 50 EUR | 50 EUR | 50 EUR | 150 EUR |
| **Total dépenses** | **196 980 EUR** | **84 350 EUR** | **87 250 EUR** | **368 580 EUR** |

#### **5.2 Trajectoire de rentabilité (scénario réaliste)**

La trajectoire ci-dessous cumule le bénéfice net annuel du scénario réaliste du 4.2 (51 982 EUR/an en régime de croisière). L'année 1 est proratisée à 4/12 : la migration de l'ensemble des projets s'achève au jalon M6 (31 juillet 2026, cf. partie H), l'agence ne bénéficie donc du workflow à pleine échelle qu'à partir de septembre 2026\.

| Échéance | Bénéfice net de la période | Position nette cumulée (investissement inclus) |
| ----- | ----- | ----- |
| Lancement (T0) | \- | \-115 430 EUR |
| Fin année 1 | \+17 327 EUR (4/12 du régime de croisière)  | \-98 103 EUR |
| Fin année 2 | \+51 982 EUR | \-46 121 EUR |
| Fin année 3 | \+51 982 EUR | **\+5 861 EUR** |

**Lecture** : la position nette cumulée devient positive au cours de la troisième année \- le point mort est atteint vers le 35ᵉ mois dans le scénario réaliste (vers le 28ᵉ mois en scénario volontariste, vers le 50e mois en scénario prudent). L'écart avec le délai de \~27 mois du 4.2 s'explique par la montée en charge de la première année : le 4.2 raisonne en régime de croisière, la présente trajectoire intègre le calendrier réel de déploiement. Sur les seuls coûts directement mesurables, sans revente du temps libéré, le workflow reste un surcoût annuel (3.2) : sa rentabilité financière est conditionnée à la redirection de la capacité récupérée vers des missions facturables, et sa valeur complète intègre les gains stratégiques non quantifiés du 3.4 (qualité, scalabilité, réduction du bus factor).

### 6\. Recommandations financières

* **Négocier un engagement annuel** avec l'hébergeur pour obtenir une réduction de 10 à 20 % sur les VPS.

* **Privilégier le recrutement direct** (annonces, cooptation) plutôt qu'un cabinet de recrutement pour limiter les frais (6 000 à 10 000 EUR économisés).

* **Mutualiser l'infrastructure** entre projets grâce à Docker pour maîtriser les coûts serveur.

* **Planifier une revue budgétaire semestrielle** pour ajuster le dimensionnement serveur à la charge réelle.

* **Capitaliser sur l'open source** : la gratuité des licences est un avantage concurrentiel durable, à condition de maintenir les compétences internes.

* **Envisager Kubernetes** (année 2-3) uniquement si la croissance de l'agence le justifie, pour éviter un sur-investissement prématuré.

* **Mesurer les gains réels** via les KPIs définis (cf. Annexes) pour affiner les projections et démontrer le ROI à la direction.

## 

## 

## 

## 

## 

## 

## 

## 

## **ANNEXES** {#annexes}

### Annexe A \- Calcul du TJM des ressources du projet {#annexe-a---calcul-du-tjm-des-ressources-du-projet}

Cette annexe détaille la **base de calcul des taux journaliers moyens (TJM)** utilisés pour chiffrer le diagramme de Gantt (partie H) et l'estimation des coûts (partie I). Le calcul prend en compte les charges salariales, les charges patronales, les frais de structure et la marge de l'agence.

**Hypothèses de calcul**

| Paramètre | Valeur | Justification |
| ----- | ----- | ----- |
| Jours ouvrés par an | 228 j | 365 \- 104 (week-ends) \- 25 (CP) \- 8 (jours fériés) |
| Jours productifs par an | **218 j** | 228 \- 10 (maladie, absences, formation interne) |
| Heures par jour | **7 h** | Convention SYNTEC, base 35h/semaine |
| Taux de charges patronales | **\~45 %** du salaire brut | Estimation standard France (URSSAF, retraite, prévoyance) |
| Frais de structure | **\~15 %** du coût employeur | Locaux, matériel, logiciels, administration |
| Marge agence | **20 %** du coût complet | Marge opérationnelle standard agence web |

**Calcul détaillé par profil**

**Direction \- Mr Brasletti (DIR)**

| Étape | Calcul | Montant |
| ----- | ----- | ----- |
| Salaire brut annuel | Base | 65 000 EUR |
| Charges salariales (\~22 %) | 65 000 x 0,22 | 14 300 EUR |
| Salaire net annuel (indicatif) | 65 000 \- 14 300 | 50 700 EUR |
| Charges patronales (\~45 %) | 65 000 x 0,45 | 29 250 EUR |
| **Coût employeur annuel** | **65 000 \+ 29 250** | **94 250 EUR** |
| Frais de structure (15 %) | 94 250 x 0,15 | 14 138 EUR |
| **Coût complet annuel** | **94 250 \+ 14 138** | **108 388 EUR** |
| Coût journalier (218 j) | 108 388 / 218 | 497 EUR/j |
| **Marge agence (20 %)** | **497 / (1 \- 0,20)** | **621 EUR/j** |
| **TJM arrondi** |  | **620 EUR/j** |
| **Taux horaire (7 h/j)** | **620 / 7** | **89 EUR/h** |

**Chef de projet confirmé (CDP)**

| Étape | Calcul | Montant |
| ----- | ----- | ----- |
| Salaire brut annuel | Base | 48 000 EUR |
| Charges salariales (\~22 %) | 48 000 x 0,22 | 10 560 EUR |
| Salaire net annuel (indicatif) | 48 000 \- 10 560 | 37 440 EUR |
| Charges patronales (\~45 %) | 48 000 x 0,45 | 21 600 EUR |
| **Coût employeur annuel** | **48 000 \+ 21 600** | **69 600 EUR** |
| Frais de structure (15 %) | 69 600 x 0,15 | 10 440 EUR |
| **Coût complet annuel** | **69 600 \+ 10 440** | **80 040 EUR** |
| Coût journalier (218 j) | 80 040 / 218 | 367 EUR/j |
| **Marge agence (20 %)** | **367 / (1 \- 0,20)** | **459 EUR/j** |
| **TJM arrondi** |  | **460 EUR/j** |
| **Taux horaire (7 h/j)** | **460 / 7** | **66 EUR/h** |

**Ingénieur DevOps Senior (IDS)**

| Étape | Calcul | Montant |
| ----- | ----- | ----- |
| Salaire brut annuel | Base | 50 000 EUR |
| Charges salariales (\~22 %) | 50 000 x 0,22 | 11 000 EUR |
| Salaire net annuel (indicatif) | 50 000 \- 11 000 | 39 000 EUR |
| Charges patronales (\~45 %) | 50 000 x 0,45 | 22 500 EUR |
| **Coût employeur annuel** | **50 000 \+ 22 500** | **72 500 EUR** |
| Frais de structure (15 %) | 72 500 x 0,15 | 10 875 EUR |
| **Coût complet annuel** | **72 500 \+ 10 875** | **83 375 EUR** |
| Coût journalier (218 j) | 83 375 / 218 | 382 EUR/j |
| **Marge agence (20 %)** | **382 / (1 \- 0,20)** | **478 EUR/j** |
| **TJM arrondi** |  | **475 EUR/j** |
| **Taux horaire (7 h/j)** | **475 / 7** | **68 EUR/h** |

**Développeur Senior (DS)**

| Étape | Calcul | Montant |
| ----- | ----- | ----- |
| Salaire brut annuel | Base | 42 000 EUR |
| Charges salariales (\~22 %) | 42 000 x 0,22 | 9 240 EUR |
| Salaire net annuel (indicatif) | 42 000 \- 9 240 | 32 760 EUR |
| Charges patronales (\~45 %) | 42 000 x 0,45 | 18 900 EUR |
| **Coût employeur annuel** | **42 000 \+ 18 900** | **60 900 EUR** |
| Frais de structure (15 %) | 60 900 x 0,15 | 9 135 EUR |
| **Coût complet annuel** | **60 900 \+ 9 135** | **70 035 EUR** |
| Coût journalier (218 j) | 70 035 / 218 | 321 EUR/j |
| **Marge agence (20 %)** | **321 / (1 \- 0,20)** | **401 EUR/j** |
| **TJM arrondi** |  | **400 EUR/j** |
| **Taux horaire (7 h/j)** | **400 / 7** | **57 EUR/h** |

**Tableau récapitulatif des TJM**

| Profil | Salaire brut annuel | Coût employeur | Coût complet (+ structure) | TJM (avec marge 20 %) | Taux horaire |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **DIR** (Direction) | 65 000 EUR | 94 250 EUR | 108 388 EUR | **620 EUR/j** | 89 EUR/h |
| **CDP** (Chef de projet) | 48 000 EUR | 69 600 EUR | 80 040 EUR | **460 EUR/j** | 66 EUR/h |
| **IDS** (Ingénieur DevOps Senior) | 50 000 EUR | 72 500 EUR | 83 375 EUR | **475 EUR/j** | 68 EUR/h |
| **DS** (Développeur Senior) | 42 000 EUR | 60 900 EUR | 70 035 EUR | **400 EUR/j** | 57 EUR/h |

**Justification des salaires bruts retenus**

| Profil | Salaire brut retenu | Justification |
| ----- | ----- | ----- |
| DIR | 65 000 EUR | Directeur d'agence web, 15+ ans d'expérience, rémunération cohérente avec le marché PME/ETI |
| CDP | 48 000 EUR | Chef de projet confirmé (5-8 ans), marché agence web France |
| IDS | 50 000 EUR | Ingénieur DevOps senior (5+ ans), fourchette haute du marché (cf. fiche de poste partie F : 42-52 kEUR pour 3-5 ans confirmé) |
| DS | 42 000 EUR | Développeur senior (3-5 ans), cohérent avec la grille SYNTEC et le marché agence |

**Convention collective applicable** : SYNTEC / BETIC (IDCC 1486), conformément aux recommandations de la partie F.

### Annexe B \- Glossaire technique {#annexe-b---glossaire-technique}

| Terme | Définition |
| ----- | ----- |
| **CI/CD** | Continuous Integration / Continuous Delivery (ou Deployment). Pratiques d'intégration et de livraison continue du code. |
| **Pipeline** | Séquence automatisée d'étapes (build, tests, déploiement) déclenchée par un événement (push, merge). |
| **SCM** | Source Code Management. Système de gestion du code source (ex. GitLab, Gitea). |
| **GitFlow** | Stratégie de branching Git structurée autour des branches main, develop, feature, release et hotfix. |
| **Jenkinsfile** | Fichier de configuration déclaratif définissant les étapes d'un pipeline Jenkins, versionné avec le code source. |
| **Shared Libraries** | Bibliothèques Jenkins mutualisées entre projets pour standardiser les pipelines. |
| **Docker** | Plateforme de conteneurisation permettant d'empaqueter une application et ses dépendances dans un conteneur isolé et reproductible. |
| **Docker Compose** | Outil de définition et d'exécution d'applications multi-conteneurs via un fichier YAML. |
| **Image Docker** | Package immuable contenant le code, les dépendances et la configuration d'une application. |
| **Registry** | Registre de stockage et de distribution d'images Docker (ex. Harbor). |
| **Harbor** | Registre Docker open source avec gestion des accès, scan de vulnérabilités et politiques de rétention. |
| **Traefik** | Reverse proxy et load balancer cloud-native, conçu pour les environnements conteneurisés. |
| **Reverse proxy** | Serveur intermédiaire qui redirige les requêtes entrantes vers les services internes appropriés. |
| **TLS** | Transport Layer Security. Protocole de chiffrement des communications (HTTPS). |
| **Let's Encrypt** | Autorité de certification gratuite et automatisée pour les certificats TLS. |
| **Prometheus** | Système de monitoring et d'alerting open source, basé sur la collecte de métriques time-series. |
| **Grafana** | Plateforme de visualisation et de dashboarding pour les métriques et les logs. |
| **Loki** | Système d'agrégation de logs intégré à l'écosystème Grafana. |
| **PromQL** | Langage de requête natif de Prometheus pour interroger les métriques. |
| **SonarQube** | Plateforme d'analyse statique de la qualité du code (dette technique, couverture, duplications). |
| **Quality gate** | Seuil de qualité automatique qui conditionne la poursuite du pipeline (ex. couverture de tests minimale). |
| **K6** | Outil open source de tests de charge et de performance (Grafana K6). |
| **Restic** | Outil de backup incrémental, chiffré et déduplicable. |
| **MinIO** | Serveur de stockage objet compatible S3, utilisé pour le stockage des sauvegardes. |
| **Trivy** | Scanner de vulnérabilités pour conteneurs, systèmes de fichiers et dépendances. |
| **Semgrep** | Outil d'analyse statique de sécurité (SAST) multi-langages. |
| **Gitleaks** | Outil de détection de secrets (mots de passe, tokens, clés) dans les dépôts Git. |
| **SAST** | Static Application Security Testing. Analyse de sécurité du code source sans exécution. |
| **DevOps** | Mouvement culturel et technique visant à rapprocher les équipes de développement et d'exploitation. |
| **DevSecOps** | Extension du DevOps intégrant la sécurité à chaque étape du cycle de développement. |
| **SLA** | Service Level Agreement. Accord de niveau de service définissant les engagements de disponibilité. |
| **GTR** | Garantie de Temps de Rétablissement. Délai maximal de remise en service après un incident. |
| **RTO** | Recovery Time Objective. Durée maximale acceptable d'interruption de service. |
| **RPO** | Recovery Point Objective. Quantité maximale de données pouvant être perdue (en durée). |
| **Blue/Green** | Stratégie de déploiement utilisant deux environnements identiques pour basculer sans interruption. |
| **Rollback** | Retour à une version précédente d'une application ou d'une configuration après un incident. |
| **RBAC** | Role-Based Access Control. Contrôle d'accès basé sur les rôles attribués aux utilisateurs. |
| **Conventional Commits** | Convention de nommage des messages de commit pour garantir la lisibilité et l'automatisation des changelogs. |
| **Semantic Versioning** | Convention de versionnement (MAJOR.MINOR.PATCH) permettant de communiquer la nature des changements. |
| **BPMN** | Business Process Model and Notation. Standard de modélisation des processus métier. |
| **Scrum** | Framework Agile de gestion de projet basé sur des itérations courtes (sprints) et des rôles définis. |
| **Sprint** | Itération de travail en méthodologie Scrum, généralement de 1 à 4 semaines. |
| **Sprint Review** | Cérémonie Scrum de présentation des réalisations à la fin de chaque sprint. |
| **TJM** | Taux Journalier Moyen. Coût journalier d'une ressource incluant salaire, charges et marge. |
| **VPS** | Virtual Private Server. Serveur virtuel dédié hébergé chez un fournisseur cloud. |
| **NVMe** | Non-Volatile Memory Express. Interface de stockage haute performance pour les disques SSD. |
| **RGPD** | Règlement Général sur la Protection des Données. Réglementation européenne sur la protection des données personnelles. |
| **Bus factor** | Nombre minimal de personnes dont le départ mettrait en péril la continuité d'un projet. |
| **SYNTEC** | Convention collective des bureaux d'études techniques, cabinets d'ingénieurs-conseils et sociétés de conseil (IDCC 1486). |

### Annexe C \- Matrice RACI du projet[^4] {#annexe-c---matrice-raci-du-projet}

La matrice RACI définit les responsabilités pour les activités clés du projet de transformation.

**Légende** :

* **R** \= Responsable (réalise la tâche)

* **A** \= Approbateur (valide et rend compte)

* **C** \= Consulté (fournit un avis)

* **I** \= Informé (tenu au courant)

**Acteurs** :

* **DIR** \= Direction (Mr Brasletti)

* **EQP** \= Équipe projet (CDP \+ IDS \+ DS)

* **DEV** \= Ingénieur DevOps recruté

* **EQUIPE** \= Équipes de développement de l'agence

| Activité | DIR | EQP | DEV | EQUIPE |
| ----- | ----- | ----- | ----- | ----- |
| Validation du cahier des spécifications | **A** | R | \- | C |
| Provisionnement des serveurs | I | **R** | \- | \- |
| Mise en place infrastructure CI/CD | A | **R** | \- | I |
| Déploiement monitoring et backups | I | **R** | \- | \- |
| Intégration du projet pilote Thé Tip Top | A | **R** | \- | C |
| Recrutement ingénieur DevOps | **A** | R | \- | C |
| Formation ingénieur DevOps | I | **R** | R | \- |
| Migration des projets existants | I | **R** | R | C |
| Accompagnement des équipes | I | C | **R** | R |
| Maintenance et exploitation du workflow | I | \- | **R** | I |
| Documentation technique | A | R | **R** | I |
| Tests de restauration trimestriels | I | \- | **R** | \- |
| Veille technologique et évolutions | I | C | **R** | I |
| Gestion des incidents de production | I | C | **R** | I |
| Définition de la roadmap d'évolution | **A** | C | R | C |

### Annexe D \- Tableau comparatif des outils retenus {#annexe-d---tableau-comparatif-des-outils-retenus}

| Catégorie | Outil retenu | Alternatives évaluées | Raison du choix |
| ----- | ----- | ----- | ----- |
| **Reverse proxy** | Traefik | Nginx, HAProxy | Natif Docker, gestion TLS automatique, configuration dynamique |
| **SCM** | GitLab CE | Gitea, Gogs | Fonctionnalités complètes (MR, webhooks, permissions), communauté active |
| **CI** | Jenkins | GitLab CI, Drone CI, Woodpecker | Exigence du cahier des charges, extensibilité via plugins, maturité |
| **Registry Docker** | Harbor | Docker Registry, Nexus | Scan de vulnérabilités intégré, gestion des accès par projet, rétention |
| **Qualité code** | SonarQube CE | CodeClimate, ESLint seul | Quality gates, suivi de la dette technique dans le temps, multilangues |
| **Tests de charge** | K6 | JMeter, Locust, Gatling | Open source, léger, scripts JS versionnables, intégrable dans Jenkins |
| **Monitoring** | Prometheus \+ Grafana | Zabbix, Datadog, ELK | Standard cloud-native, open source, alerting natif, dashboards flexibles |
| **Logs** | Loki | ELK Stack, Fluentd | Léger, intégré à Grafana, adapté à l'échelle de l'agence |
| **Backups** | Restic \+ MinIO | BorgBackup, Duplicity, Bareos | Incrémental, chiffré, déduplication, compatible stockage objet S3 |
| **Scan conteneurs** | Trivy | Clair, Anchore, Snyk | Open source, rapide, intégrable CI, base de vulnérabilités à jour |
| **SAST** | Semgrep | Bandit, Brakeman, SonarQube SAST | Multi-langages, règles personnalisables, communauté active |
| **Détection secrets** | Gitleaks | TruffleHog, git-secrets | Rapide, faible taux de faux positifs, intégrable dans le pipeline |
| **Gestion de projet** | Taiga / OpenProject | Jira, Trello, Asana | Open source, compatible Scrum/Kanban, auto-hébergeable |
| **Communication** | Mattermost | Slack, Rocket.Chat | Open source, auto-hébergeable, intégrations CI/CD natives |
| **Visioconférence** | Jitsi Meet | Zoom, Google Meet | Open source, auto-hébergeable, aucun compte requis |
| **Documentation interne** | Wiki.js | BookStack, Confluence | Open source, Markdown natif, interface moderne, auto-hébergeable |

### Annexe E \- Cartographie des ports et protocoles {#annexe-e---cartographie-des-ports-et-protocoles}

| Service | Port interne | Port externe (Traefik ou publication hôte) | Protocole | Hôte / Sous-domaine |
| ----- | ----- | ----- | ----- | ----- |
| Traefik (HTTP) | 80 | 80 | HTTP → HTTPS redirect | \- |
| Traefik (HTTPS) | 443 | 443 | HTTPS (TLS) | \- |
| Traefik (Dashboard) | 8080 | 443 | HTTPS | traefik.wk-archi-o24a-4-5-G1.fr |
| GitLab CE | 80 | 443 | HTTPS | git.wk-archi-o24a-4-5-G1.fr |
| GitLab CE (SSH) | 22 | 2222 | SSH/TCP | git.wk-archi-o24a-4-5-G1.fr |
| Jenkins | 8080 | 443 | HTTPS | ci.wk-archi-o24a-4-5-G1.fr |
| Jenkins (agents) | 50000 | 50000 | JNLP (interne) | \- |
| Harbor | 80 | 443 | HTTPS | registry.wk-archi-o24a-4-5-G1.fr |
| SonarQube | 9000 | 443 | HTTPS | sonar.wk-archi-o24a-4-5-G1.fr |
| SonarQube (base de données PostgreSQL) | 5432 | \- | TCP (interne) | \- |
| Prometheus | 9090 | 443 | HTTPS | prometheus.wk-archi-o24a-4-5-G1.fr |
| AlertManager | 9093 | \- | HTTP (interne)  | \- |
| cAdvisor | 8080 | 8081 | HTTP | \- (debug, normalement interne) |
| Grafana | 3000 | 443 | HTTPS | monitor.wk-archi-o24a-4-5-G1.fr |
| Loki (HTTP)  | 3100 | \- | HTTP (interne) | \- |
| Loki (gRPC) | 9095 | \- | gRPC (interne)  |  |
| MinIO (API) | 9000 | 443 | HTTPS | s3.wk-archi-o24a-4-5-G1.fr |
| MinIO (Console) | 9001 | 443 | HTTPS | minio.wk-archi-o24a-4-5-G1.fr |

La majorité des services accessibles depuis Internet transitent par Traefik en HTTPS (TLS), à l'exception du SSH GitLab (port 2222\) et des agents Jenkins en JNLP (port 50000), publiés directement sur l'hôte en dehors de Traefik. Les communications inter-services restent en HTTP, ou en gRPC pour Loki, sur le réseau Docker interne.

### Annexe F \- Matrice de correspondance exigences / réponses {#annexe-f---matrice-de-correspondance-exigences-/-réponses}

| \# | Exigence du cahier des charges | Réponse dans le document | Section |
| ----- | ----- | ----- | ----- |
| 1 | Hébergement sur serveurs dédiés ou cloud, Linux | VPS Linux (Debian/Ubuntu Server) conteneurisés | D.6 |
| 2 | Entièrement basé sur Docker | Tous les services conteneurisés via Docker/Docker Compose | D.2 à D.9 |
| 3 | Solution CI Jenkins | Jenkins (controller \+ agents) | D.3 |
| 4 | Solution SCM de type Git | GitLab Community Edition | D.2 |
| 5 | Solutions de tests applicatifs | PHPUnit, Jest, Pytest, RSpec, Playwright, Newman, K6, SonarQube | D.5 |
| 6 | Solutions de backups automatisés | Restic \+ MinIO, politique de rétention, principe 3-2-1 | D.8, G |
| 7 | Solutions de métriques | Prometheus \+ Grafana \+ Loki | D.7 |
| 8 | Optimisation des assets (minification, compression) | Stage dédié dans le pipeline Jenkins | D.4 |
| 9 | Déploiement automatique serveurs de dev | Pipeline Jenkins, déploiement 100 % auto sur push develop | G |
| 10 | Stockage des images Docker | Harbor (registry Docker) | D.4 |
| 11 | Déploiement pré-production automatique | Pipeline Jenkins, validation technique auto \+ fonctionnelle manuelle | G |
| 12 | Déploiement production | Pipeline Jenkins, validation humaine, stratégie Blue/Green | G |
| 13 | Tests unitaires et/ou fonctionnels | Tests unitaires par stack \+ E2E (Playwright/Cypress) \+ API (Newman) | D.5 |
| 14 | Envoi/stockage des rapports de tests | Jenkins : archivage, SonarQube : suivi dans le temps | D.3, D.5 |
| 15 | Configuration modifiable par les devs (sans accès CI) | Jenkinsfile versionné dans le dépôt Git | D.3 |
| 16 | Applications open source ou libres | 100 % open source (cf. tableau des licences, partie I) | D, I |
| 17 | Adaptation multi-stacks (PHP, Node.js, Python, Ruby, Mobile) | Socle commun \+ configs par stack, Shared Libraries Jenkins | D.3, D.5 |
| 18 | Backup intégralité du workflow et des projets | Périmètre complet : Git, CI, registry, configs, BDD, volumes | D.8, G |
| 19 | Fiche de poste pour recrutement | Fiche de poste Ingénieur DevOps détaillée | F |
| 20 | Formation pour prise en main du workflow | Plan de formation 10-12 semaines en 6 phases | F |
| 21 | SLA 99,9 % sur services critiques | Architecture HA optionnelle (SCM répliqué, Jenkins standby, Harbor HA) activable avant campagne production | D.3.d |

L'ensemble des 20 exigences identifiées dans le cahier des charges est couvert par une réponse argumentée dans le document.

### Annexe G \- Politique de nommage et conventions {#annexe-g---politique-de-nommage-et-conventions}

**Conventions de nommage des conteneurs Docker**

Deux périmètres coexistent avec des conventions distinctes.

Les services du socle CI/CD utilisent le format common-{service}-ci : common-traefik-ci, common-gitlab-ci, common-jenkins-ci, common-sonarqube-ci.

Les services applicatifs des projets clients suivent le format {projet}-{service}-{env} : thetiptop-api-dev, thetiptop-frontend-preprod, thetiptop-db-prod.

En PROD, le conteneur applicatif exposé via Traefik déroge à ce format pour porter la couleur de la stratégie Blue/Green : {projet}-prod-blue / {projet}-prod-green (ex. thetiptop-prod-blue). C'est ce nom, et non {projet}-{service}-prod, que ciblent le rollback automatisé (deployBlueGreen.groovy) et le rollback manuel (rollback.sh).

**Conventions de nommage des volumes Docker**

De même, deux formats s'appliquent selon le périmètre.

Volumes du socle CI/CD : common-{service}-data-ci,  par exemple common-gitlab-data-ci, common-jenkins-data-ci, common-prometheus-data-ci.

Volumes des services applicatifs : {projet}-{service}-data-{env},  par exemple thetiptop-postgres-data-prod, thetiptop-redis-data-dev.

**Conventions de nommage des images Docker (Harbor)**

registry.wk-archi-o24a-4-5-G1.fr/{projet}/{service}:{tag}

Tags :

* latest : dernière version de develop (DEV uniquement)

* \<semver\> : version sémantique (ex. 1.2.3) pour les releases

* \<commitSHA\> : hash court du commit pour traçabilité

**Conventions de nommage des branches (GitFlow)**

| Type | Format | Exemple |  |
| ----- | ----- | ----- | ----- |
| Pré-production  | main | main | Déploiement PREPROD à la fusion |
| Production | main+ tag sémantique | main → tag v1.2.3 | Déploiement PROD à la création du tag |
| Développement | develop | develop | Déploiement DEV à la fusion |
| Fonctionnalité | feature/\<description\> | feature/ajout-panier | \- |
| Release | release/\<version\> | release/1.2.0 | \- |
| Correctif urgent | hotfix/\<version\> | hotfix/1.2.1 | Déploiement PROD à la fusion et au tag |

**Conventions de commits (Conventional Commits)**

\<type\>(\<scope\>): \<description\>

| Type | Usage |
| ----- | ----- |
| feat | Nouvelle fonctionnalité |
| fix | Correction de bug |
| docs | Documentation |
| style | Formatage (pas de changement de code) |
| refactor | Refactoring (pas de changement fonctionnel) |
| test | Ajout ou modification de tests |
| chore | Maintenance (dépendances, CI, config) |
| perf | Amélioration de performance |
| ci | Modification de la configuration CI/CD |

**Sous-domaines**

| Sous-domaine | Service |
| ----- | ----- |
| git.wk-archi-o24a-4-5-G1.fr | GitLab CE |
| ci.wk-archi-o24a-4-5-G1.fr | Jenkins |
| registry.wk-archi-o24a-4-5-G1.fr | Harbor |
| sonar.wk-archi-o24a-4-5-G1.fr | SonarQube |
| monitor.wk-archi-o24a-4-5-G1.fr | Grafana |
| prometheus.wk-archi-o24a-4-5-G1.fr | Prometheus |
| s3.wk-archi-o24a-4-5-G1.fr | MinIO API |
| minio.wk-archi-o24a-4-5-G1.fr | MinIO Console |
| traefik.wk-archi-o24a-4-5-G1.fr | Traefik Dashboard |

### Annexe H \- Checklist de validation pré-production {#annexe-h---checklist-de-validation-pré-production}

**Validation technique**

* \[ \] Pipeline CI/CD exécuté sans erreur (build, tests, scans)

* \[ \] Tests unitaires : 100 % passants

* \[ \] Quality gate SonarQube : statut "Passed"

* \[ \] Scan Trivy : aucune vulnérabilité critique ou haute non traitée

* \[ \] Scan Gitleaks : aucun secret détecté

* \[ \] Tests de charge K6 : temps de réponse conformes aux seuils

* \[ \] Image Docker taguée avec version sémantique

* \[ \] Image promue depuis PREPROD (même image, pas de rebuild)

**Validation fonctionnelle**

* \[ \] Recette fonctionnelle validée en PREPROD

* \[ \] Merge Request approuvée (1 approbation minimum)

* \[ \] Changelog mis à jour

* \[ \] Documentation mise à jour si nécessaire

**Validation opérationnelle**

* \[ \] Monitoring actif (dashboard Grafana, alertes Prometheus)

* \[ \] Backups vérifiés et opérationnels

* \[ \] Procédure de rollback identifiée et testée

* \[ \] Communication à l'équipe effectuée

### Annexe I \- Indicateurs de suivi (KPIs) {#annexe-i---indicateurs-de-suivi-(kpis)}

**KPIs techniques**

| Indicateur | Cible | Fréquence |
| ----- | ----- | ----- |
| Taux de disponibilité CI/SCM | \>= 99,9 % | Mensuel |
| Taux de disponibilité production | \>= 99,9 % | Mensuel |
| Temps moyen de déploiement (DEV) | \< 15 min | Par déploiement |
| Temps moyen de déploiement (PROD) | \< 25 min | Par déploiement |
| Taux de succès des pipelines | \>= 90 % | Hebdomadaire |
| MTTR (temps moyen de résolution) | \< 2h (PROD), \< 4h (CI) | Par incident |
| Fréquence de déploiement | \>= 3/semaine par projet actif | Mensuel |

**KPIs qualité**

| Indicateur | Cible | Fréquence |
| ----- | ----- | ----- |
| Couverture de tests (SonarQube) | \>= 70 % (nouveaux projets) | Par pipeline |
| Bugs critiques en production | \< 2/mois | Mensuel |
| Vulnérabilités critiques non corrigées | 0 | Hebdomadaire |
| Conformité des backups | 100 % | Hebdomadaire (auto) |
| Tests de restauration réussis | 100 % | Trimestriel |

**KPIs organisationnels**

| Indicateur | Cible | Fréquence |
| ----- | ----- | ----- |
| Projets intégrés au workflow | 100 % | Mensuel |
| Satisfaction des développeurs | \>= 7/10 | Trimestriel |
| Procédures documentées à jour | 100 % | Trimestriel |

### Annexe J \- Références et ressources {#annexe-j---références-et-ressources}

**Documentation officielle des outils**

| Outil | URL |
| ----- | ----- |
| Docker | https://docs.docker.com |
| Jenkins | https://www.jenkins.io/doc |
| GitLab CE | https://docs.gitlab.com |
| Harbor | https://goharbor.io/docs |
| Traefik | https://doc.traefik.io/traefik |
| Prometheus | https://prometheus.io/docs |
| Grafana | https://grafana.com/docs |
| Loki | https://grafana.com/docs/loki |
| SonarQube | https://docs.sonarsource.com/sonarqube |
| Restic | https://restic.readthedocs.io |
| MinIO | https://min.io/docs |
| Trivy | https://aquasecurity.github.io/trivy |
| Semgrep | https://semgrep.dev/docs |
| Gitleaks | https://github.com/gitleaks/gitleaks |
| K6 | https://grafana.com/docs/k6 |

**Normes et standards**

| Référence | Sujet |
| ----- | ----- |
| Conventional Commits | https://www.conventionalcommits.org |
| Semantic Versioning | https://semver.org |
| OWASP Top 10 | https://owasp.org/www-project-top-ten |
| RGPD | Règlement (UE) 2016/679 |
| BPMN 2.0 | OMG \- Business Process Model and Notation |
| ISO 27001 | Système de management de la sécurité de l'information |

**Méthodologies et ouvrages de référence**

| Référence | Auteurs |
| ----- | ----- |
| Scrum Guide | https://scrumguides.org |
| The DevOps Handbook | Gene Kim, Jez Humble, Patrick Debois, John Willis |
| Accelerate | Nicole Forsgren, Jez Humble, Gene Kim |
| Team Topologies | Matthew Skelton, Manuel Pais |
| The Phoenix Project | Gene Kim, Kevin Behr, George Spafford |

[^1]:  Les numéros SIREN/SIRET et TVA sont des exemples simulés pour compléter la structure demandée, l'énoncé initial ne fournissant que les informations de capital et d'adresse.

[^2]:  Le planning prévisionnel du projet est établi sur 26 semaines. Le transfert de responsabilité à l'ingénieur DevOps constitue le jalon de clôture de cette phase transverse. cf. Diagramme de Gantt, partie H.

[^3]:  Le diagramme de Gantt officiel est produit sous **GanttProject**. Le présent document fournit l'ensemble des données structurées (tâches, lots, ressources, prédécesseurs, coûts) permettant de reconstituer le diagramme dans l'outil.

[^4]:  Pendant la phase de mise en place (6 mois), l'équipe projet (EQP) est le principal acteur. Après le transfert de responsabilité (M7), l'ingénieur DevOps (DEV) devient le référent opérationnel.
