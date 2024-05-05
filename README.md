# Banking/Wallet kata

## Objectif

L'objectif de ce kata est de travailler l'utilisation de différentes stratégies de tests.
Pour cela, nous mettrons en place :

- des tests end-to-end
- des tests de composants
- des tests d'intégration
- des tests unitaires

Nous serons amené à utiliser Vitest, Supertest et Testcontainers.

Nous avancerons étape par étape et nous ajouterons quelques features en double loop TDD.

## Description

L'application est un backend NodeJS / Express qui permet de gérer des comptes bancaires.
Il est possible de créer un compte, effectuer des dépots et des retraits d'argent, et de consulter le solde en Euros et
en Yens.

L'application nécessite une base de données Mongo pour fonctionner. En local, installer Docker et lancer les commandes
suivantes :

```
mkdir ~/data  
docker run -d -p 27017:27017 -v ~/data:/data/db mongo:latest
```

Le fichier `Requests.http` détaille les routes existantes et est utiliser pour tester manuellement l'application.

## Etapes

### 1. Couvrir le code actuel

Le but est de toucher au minimum le code actuel pour le couvrir au maximum par des tests automatisés.

Il est possible d'utiliser le `Requests.http` pour tester les requêtes et obtenir des exemples de réponses.

Pour commencer sans trop de complexité, nous mettrons en place des tests hybrides entre end-to-end et composants.
Voici les consignes :

- Contrairement à des tests end-to-end, on ne build pas l'application et on ne la lance pas pour la tester. Pour cela on
  teste l'application en boîte blanche avec Supertest en frontal
- On utilise une vraie base de données qui tourne dans un conteneur Docker (voir le paragraphe "Description")
- On émet des appels vers Frankfurter pour récupérer les taux de conversion

Points d'attention :

- Ne lancez pas trop souvent les tests qui utilisent l'API Frankfurter (utiliser `it.skip` pour désactiver un test)
- En watch-mode, les tests vont beaucoup tourner. Pensez à une stratégie pour limiter les données en base.
- Placez vos tests dans un dossier `tests-e2e` qui correspondent à notre première stratégie de tests

Tips :

- Ne cherchez pas à tester la méthode `start()` de la classe `Application`

Mise en place :

```
npm install
```

Lancer les tests :

```
npm test
```

### 2. Se découpler de l'API et de la base de données

Les appels à l'API Frankfurter sont coûteux (traffic réseau, nombre de requêtes limitées).
Les appels à la base de données sont lourds (temps de requête, avoir une base qui tourne en parallèle).

L'étape suivante sera donc d'isoler notre application de ces services externes et d'écrire des tests de composants.

Ces tests auront une couverture inférieure (ils ne testeront pas les appels à la DB ni à l'API) mais seront bien plus
légers.

Consignes :

- Vous pouvez continuer avec votre code ou récupérer la branche `TODO`
- Vous pouvez créer un dossier `tests-component` et copier-coller vos tests e2e dedans et partir de ces tests
- Créez des workspaces Vitest pour lancer au choix les tests end-to-end ou les tests de composant
- Commencez par l'API, puis continuez avec la base de données
- Prenez garde à ne pas mettre de logique métier dans le code isolé
- Relancez régulièrement vos tests pour vérifier que vous n'avez rien cassé (ignorez au maximum les tests utilisant
  l'API !)
- Utilisez au maximum les fonctions de refactoring de votre IDE

Tips :

- Il faudra utiliser des doublures de tests pour les tests de composant

### 3. Isoler les règles métier

Le but de cette étape est d'isoler les règles métier présentes dans `Application.ts`.
A la fin de cette étape, il ne doit rester que du code spécifique à Express et au REST dans `Application.ts`.

Consignes :

- Utilisez les tests de composant pour sécuriser votre refactoring
- Essayez de faire apparaître les concepts métier via des classes / méthodes / fonctions
- Faites apparaître les fonctionnalités offertes par l'application :
    - Créer un compte bancaire
    - Déposer de l'argent
    - Retirer de l'argent
    - Consulter le solde (en euros ou en yens)

Tips :

- Une bonne manière de faire apparaître les fonctionnalités consiste à créer des classes pour les encapsuler (cf "
  Screaming architecture")
- Chaque route REST devrait être reliée à une fonctionnalité
- `Application.ts` ne devrait faire que de l'adaptation REST <> Domain

### 4. Tests d'intégration

On veut créer des tests pour valider le comportement du code lié à la base de données et à l'API Frankfurter.

Consignes :

- Utilisez TestContainers pour gérer une base de données par le code de tests
- Créez un dossier `tests-integration` pour lancer ces tests indépendamment des autres
- Ne lancez pas les tests liés à l'API Frankfurter trop souvent

### 5. Nouvelles règles

Ajouter les règles métier suivantes :

- Un dépôt ou un retrait doit toujours avoir un montant positif ou nul
- On ne peut pas retirer d'argent si l'opération rend le solde négatif

Consignes :

- TDD double loop : Commencez par écrire un test de composant, puis faites du TDD en tests unitaires pour coder les
  fonctionnalités
- Créez un dossier `tests-unit` pour lancer les tests unitaires indépendamment des autres

