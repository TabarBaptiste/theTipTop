# Protocole de tests utilisateurs

## 1. Ce que ces tests répondent, et que rien d'autre ne répond

Les tests automatisés répondent à une question : *le logiciel fait-il ce qu'on
lui a demandé ?* Ils ne disent rien de celle qui décide du succès de
l'opération : *une participante comprend-elle quoi faire, et le fait-elle sans
renoncer ?*

Un parcours peut être vert de bout en bout et perdre la moitié de ses
participants sur un libellé ambigu. Sur ce projet, le risque n'est pas
théorique : l'étude de cible décrit un cœur de cible à **« exigence élevée,
rejet rapide si incohérence perçue, faible tolérance à une UX moyenne »**. Une
friction que l'équipe ne voit plus, à force de connaître le parcours par cœur,
suffit à faire abandonner.

L'opération dure trente jours. Il n'y aura pas de seconde chance pour corriger
un parcours après coup : les tests utilisateurs se déroulent **avant le
lancement**, sur l'environnement de préproduction.

## 2. Panel

### 2.1. Combien

**Cinq participants par profil.** Au-delà, les mêmes problèmes reviennent sans
qu'apparaissent de nouveaux : cinq personnes révèlent l'essentiel des
difficultés d'un parcours donné, et il vaut mieux trois séries de cinq sur
trois profils qu'une série de quinze sur un seul.

| Profil | Nombre | Pourquoi lui |
|---|---|---|
| Cœur de cible - femmes 28-45 ans, CSP++, urbaines | 5 | Segment prioritaire en valeur et en prescription. C'est son verdict qui décide de la diffusion organique. |
| Jeunes actifs 22-30 ans | 3 | Fort potentiel viral, mais faible tolérance à la lenteur. Révèle les frictions mobiles. |
| Employé en boutique | 3 | Utilise le back-office en situation réelle : debout, entre deux clients, sur tablette. |
| Personne utilisant un lecteur d'écran | 2 | La conformité WCAG AA est vérifiée par des outils ; l'utilisabilité réelle ne l'est que par l'usage. |

### 2.2. Critères de recrutement

**À privilégier** : usage quotidien du smartphone, achats en boutique
physique, aucune participation au projet.

**À exclure absolument** : toute personne ayant déjà vu la plateforme -
collègues, proches de l'équipe, parties prenantes du projet. Quelqu'un qui sait
où cliquer ne teste rien.

### 2.3. Matériel

Le parcours de participation est **mobile d'abord** : le code est saisi depuis
le ticket de caisse, souvent en boutique ou juste après. Au moins **quatre
participants sur cinq testent sur leur propre téléphone**, pas sur un appareil
fourni - un téléphone inconnu ajoute une difficulté qui n'est pas celle qu'on
mesure.

L'employé teste sur tablette, comme en boutique.

## 3. Méthode

**Test d'utilisabilité modéré, par tâches, avec verbalisation.** On donne une
tâche, pas une marche à suivre, et on demande à la personne de dire à voix
haute ce qu'elle cherche, ce qu'elle comprend et ce qui la surprend.

Trois règles pour l'observateur, qui font la différence entre une observation
et une démonstration :

1. **Ne jamais aider**, même quand c'est pénible à regarder. Un blocage est le
   résultat le plus précieux de la séance.
2. **Ne jamais expliquer** l'intention derrière un écran. Si l'explication est
   nécessaire, l'écran a échoué.
3. **Répondre à une question par une question** : « et vous, qu'est-ce que vous
   feriez ? »

Deux personnes par séance : une qui anime, une qui note. L'animateur ne peut
pas faire les deux.

## 4. Scénarios

Chaque tâche est formulée comme un objectif, jamais comme une instruction.
Aucune ne nomme un bouton.

### Parcours participant

| # | Tâche donnée | Ce qu'on observe |
|---|---|---|
| 1 | « Vous avez ce ticket de caisse. Vous avez entendu dire qu'il y a un jeu. Débrouillez-vous. » | Trouve-t-elle l'entrée du jeu sans qu'on la nomme ? Combien de temps ? |
| 2 | « Participez avec ce code. » | Comprend-elle qu'un compte n'est pas nécessaire d'emblée ? Où hésite-t-elle ? |
| 3 | « Vous avez reçu un code par email. Terminez. » | La vérification en deux temps est-elle comprise, ou perçue comme un obstacle ? |
| 4 | « Qu'avez-vous gagné, et comment le récupérez-vous ? » | L'annonce du lot est-elle claire ? Le mode de retrait est-il compris ? |
| 5 | « Retrouvez ce que vous avez gagné, une semaine plus tard. » | Retrouve-t-elle son espace personnel et ses participations ? |
| 6 | « Vous ne voulez plus recevoir d'emails. » | Le retrait du consentement est-il trouvable ? (RGPD : il doit l'être aussi facilement que l'inscription.) |

### Parcours employé

| # | Tâche donnée | Ce qu'on observe |
|---|---|---|
| 7 | « Une cliente vous présente ce code. Vérifiez ce qu'elle a gagné. » | Combien de temps, sans formation préalable ? |
| 8 | « Elle repart avec son lot. » | L'enregistrement de la remise est-il évident ? Le risque d'erreur est-il faible ? |
| 9 | « Ce code a déjà été utilisé hier. » | L'employé comprend-il la situation et sait-il quoi dire à la cliente ? |

### Parcours lecteur d'écran

Les tâches 1, 2 et 4, réalisées avec NVDA ou VoiceOver. On observe la
navigation, l'annonce des erreurs de formulaire et la restitution du lot gagné.

## 5. Ce qu'on mesure

| Indicateur | Comment | Seuil d'acceptation |
|---|---|---|
| Taux de réussite | Tâche menée à bout sans aide | ≥ 90 % sur les tâches 1 à 4 |
| Taux de réussite employé | Idem, sans formation | 100 % sur les tâches 7 et 8 |
| Temps de participation | De l'arrivée à l'annonce du lot | ≤ 3 min, médiane |
| Abandons | Renoncements spontanés | 0 |
| Score SUS | Questionnaire de 10 items en fin de séance | ≥ 75 / 100 |
| Difficultés bloquantes | Voir échelle §7 | 0 avant lancement |

Le taux de réussite se mesure **sans aide**. Une tâche réussie après un indice
de l'observateur est une tâche échouée : en production, personne ne sera là
pour donner l'indice.

## 6. Déroulement d'une séance - 45 minutes

| Durée | Étape |
|---|---|
| 5 min | Accueil. Expliquer qu'on teste **le site, pas la personne** - et le dire vraiment, la nuance change les résultats. Recueillir le consentement d'enregistrement par écrit. |
| 5 min | Questions de contexte : usage du téléphone, habitudes d'achat, jeux-concours déjà faits. |
| 25 min | Les tâches, dans l'ordre. Chronomètre discret. |
| 5 min | Questionnaire SUS. |
| 5 min | Questions ouvertes : ce qui a surpris, ce qui manquait, recommanderiez-vous. |

**Enregistrement** : écran et voix, jamais le visage. Consentement écrit
préalable, conservation limitée à la durée de l'analyse, suppression ensuite -
la conformité RGPD vaut aussi pour les données du test.

## 7. Grille d'observation

Une ligne par tâche et par participant.

| Participant | Tâche | Réussie sans aide | Temps | Hésitations observées | Verbatim | Gravité |
|---|---|---|---|---|---|---|
| P1 | 2 | Non | 2 min 40 | A cherché « inscription » avant de trouver « participer » | « Je dois créer un compte d'abord, non ? » | Majeure |

**Échelle de gravité**

| Niveau | Définition | Traitement |
|---|---|---|
| **Bloquante** | La personne ne termine pas la tâche | Corrigée avant le lancement, sans exception |
| **Majeure** | Elle termine, mais avec une difficulté nette ou une erreur | Corrigée avant le lancement si le parcours est critique |
| **Mineure** | Hésitation passagère, sans conséquence | Backlog |
| **Confort** | Remarque de préférence personnelle | Notée, non traitée |

Une difficulté rencontrée par **deux participants ou plus** monte d'un niveau :
ce n'est plus un cas particulier, c'est un défaut de conception.

## 8. Restitution

Un rapport par campagne, contenant :

- le panel réel (profils, matériel, date) ;
- la grille complète, brute ;
- les difficultés classées par gravité, avec le nombre de participants
  concernés ;
- les extraits vidéo des blocages - trente secondes valent mieux qu'un
  paragraphe pour convaincre qu'un problème existe ;
- les décisions prises pour chaque difficulté majeure ou bloquante.

Le rapport n'est pas un document de conformité : c'est l'entrée du backlog de
la semaine qui suit.

## 9. Après correction

Toute difficulté bloquante corrigée est **revérifiée auprès de deux nouveaux
participants** du même profil. Une correction non retestée est une hypothèse,
pas une résolution - et c'est souvent en corrigeant une friction qu'on en crée
une autre.
