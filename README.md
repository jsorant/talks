# Reprendre la main sur mon backend Node (Testing & refactoring)

## Objectif

L'objectif de cet atelier est d'améliorer un backend NodeJS et de manipuler différents types de tests :

- end-to-end
- de composants
- d'intégration
- unitaires

Pour cela, nous serons amené à utiliser les outils Vitest, Supertest et Testcontainers.

Nous avancerons étape par étape dans l'ajout de ces types de tests.
Ceci nous permettra de refactorer progressivement la base de code.

Nous ajouterons finalement quelques features en double loop TDD.

## Prérequis

- Un IDE configuré pour coder en TypeScript
- Une connexion Internet
- NodeJS & npm
- Docker
- L'image Docker Mongo `mongo:7.0.6`
    - Vous pouvez la précharger via la commande : `docker image pull mongo:7.0.6`
- Un client HTTP REST :
    - VS Code : https://marketplace.visualstudio.com/items?itemName=humao.rest-client
    - Webstorm : https://www.jetbrains.com/help/webstorm/http-client-in-product-code-editor.html
    - IDEA : https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html
- Clonez le repo et installez les dépendances avec la commande `npm install`

## Description

L'application est un backend NodeJS / Express qui permet de gérer des comptes bancaires.
Il est possible de créer un compte, d'effectuer des dépots et des retraits d'argent, et de consulter le solde en euros
et en yens.

L'application nécessite une base de données Mongo pour fonctionner. En local, installez Docker et lancer les commandes
suivantes :

```
mkdir ~/data  
docker run -d -p 27017:27017 -v ~/data:/data/db mongo:7.0.6
```

Il est aussi nécessaire d'être connecté à Internet car l'application dépend de l'API tierce Frankfurter.

## Tests

### Manuels

Pour le moment, l'application est testée manuellement via le fichier `Requests.http` qui détaille les appels possibles.

![manual-tests.jpg](assets%2Fmanual-tests.jpg)

## Etape 1 : Couvrir le code actuel

Le but de cette étape et de découvrir comment réaliser facilement des tests avec Supertest en couvrant l'application
existante.

Pour ne pas ajouter de complexité et obtenir rapidement une bonne couverture, nous mettrons en place des tests
end-to-end un peu particuliers. En effet, contrairement à des tests end-to-end "classiques", on ne build pas
l'application et on ne la lance pas pour la tester. On utilise Supertest pour tester en boîte blanche et simuler des
appels aux routes, sans démarrer l'application.

Voici les consignes :

- On utilise une vraie base de données qui tourne dans un conteneur Docker lancé manuellement avant les tests (voir le
  paragraphe "Description")
- L'application émet des appels vers Frankfurter pour récupérer les taux de conversion. De ce fait, ne lancez pas trop
  souvent les tests qui utilisent cette API (utiliser `it.skip` pour désactiver un test)
- `Application.ts` n'est pas encore couvert par des tests, ne modifiez son code que si cela est vraiment nécessaire
- Les tests sont à rédiger dans le fichier `tests-e2e/Accounts.spec.ts`
- Travaillez avec un feedback continu sur les tests e2e via la commande `npm run test:e2e`
- Commencez par compléter le test existant, et vérifiez la couverture de code
- Implémentez ensuite le test suggéré, vérifiez la couverture de code
- Implémentez une stratégie pour nettoyer régulièrement la base de données.
- Une fois ces étapes réalisées, ajoutez des tests pour atteindre une couverture maximale ou passez à l'étape suivante
  en allant sur la branche `step-2-start`

Tips :

- Ne cherchez pas à tester la méthode `start()` de la classe `Application`
- Utilisez le mode UI de Vitest pour vérifier la couverture de code avec plus de confort
- Il est possible de lancer le serveur via `npm run dev` et d'utiliser le fichier `Requests.http` pour tester les
  requêtes et obtenir des exemples de réponses.
- Mongo n'accepte que les id avec un format spécifique (hex string de longueur 24, ex : `6645b7ae2d4e3ffe018f0ba2`).
