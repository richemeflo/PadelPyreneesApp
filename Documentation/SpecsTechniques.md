# Spécifications techniques pour la nouvelle plateforme PadelPyrennees

## Introduction et objectifs

L’association **PadelPyrennees** souhaite moderniser son site web et lancer en parallèle une application mobile Android afin d’offrir à ses membres une expérience ludique et interactive inspirée des jeux compétitifs (League of Legends, Rocket League). La plateforme doit regrouper toutes les fonctionnalités nécessaires à la pratique du padel : suivi des classements, matchmaking, réservation des courts, gestion des tournois, validation des résultats et gamification. Compte tenu d’un budget limité, les solutions proposées s’appuient sur des technologies libres ou des services gratuits.

## Vue d’ensemble de l’architecture

- **Front‑end web :** site responsive (desktop + mobile) basé sur **React** et **Next.js** pour le routage et le rendu côté serveur.
- **Application mobile :** développée avec **React Native**, qui permet de créer des applications Android et iOS en JavaScript tout en utilisant des composants natifs:contentReference[oaicite:0]{index=0}.
- **Backend/API :** service RESTful écrit en **Node.js** avec **Express**, un framework minimaliste fournissant un socle robuste:contentReference[oaicite:1]{index=1}. L’API est documentée via Swagger.
- **Base de données :** **PostgreSQL** avec extension **PostGIS**. Cette base relationnelle open‑source est réputée pour sa fiabilité et ses performances:contentReference[oaicite:2]{index=2}.
- **Carte et géolocalisation :** **Leaflet** pour les cartes interactives:contentReference[oaicite:3]{index=3} et **Nominatim** pour le géocodage:contentReference[oaicite:4]{index=4}. La distance est calculée par la formule de Haversine:contentReference[oaicite:5]{index=5}.
- **Notifications et temps réel :** **Socket.io** pour les notifications en temps réel, **Firebase Cloud Messaging** (plan Spark) pour les notifications push:contentReference[oaicite:6]{index=6}.
- **Hébergement et déploiement :** conteneurs Docker déployés sur un VPS ou une plateforme PaaS avec free tier. La base PostgreSQL peut être hébergée sur un service gratuit.

## 1 Système de classement Elo

### 1.1 Algorithme et principes

Le classement Elo sert à mesurer le niveau des joueurs. Une différence de 100 points représente ~64 % de chances de victoire pour le joueur mieux classé et 200 points, ~76 %:contentReference[oaicite:7]{index=7}. Après chaque match, des points sont transférés du perdant au gagnant; plus l’écart de niveau est grand, moins le transfert est important:contentReference[oaicite:8]{index=8}. Les notes reflètent ainsi la performance réelle:contentReference[oaicite:9]{index=9}.

- **Classement individuel :** chaque joueur a un score Elo initial (p. ex. 1000) et un palier visuel (Bronze, Argent, Or, Platine). Les paliers déclenchent des badges et des animations.
- **Classement par paire :** une paire possède un score distinct pour les matchs en double. Ce score est indépendant du score individuel.
- **Historique et badges :** chaque variation de score est enregistrée (historique). Des badges sont attribués lors du franchissement d’un palier.

### 1.2 Flux utilisateur

1. **Inscription :** création du compte, saisie du pseudo, localisation (géocodée), choix d’un avatar.
2. **Consultation du classement :** classement général et régional, palier, courbe d’évolution.
3. **Fiche joueur :** stats, badges, bouton pour défier un joueur.

### 1.3 Modèle de données

- `players` : id, pseudo, email, coordonnées, elo_score, xp, level, tier, avatar.
- `pairs` : id, player1_id, player2_id, elo_score.
- `matches` : id, pair_a_id, pair_b_id, score, court, date, statut, validated.
- `rating_history` : id, player_id, match_id, rating_before, rating_after.

### 1.4 API

- `GET /players/{id}`
- `GET /ranking?region=`
- `POST /matches` (enregistrement du score avec double confirmation)

### 1.5 Interface

Affichage de badges colorés, barres de progression, animations lors des changements de palier. Possibilité de défier un joueur directement depuis sa fiche.

## 2 Matchmaking intelligent

### 2.1 Concept

Le système propose automatiquement une paire adverse en tenant compte :
1. **Équilibre de niveau :** différence Elo faible (±150 points):contentReference[oaicite:10]{index=10}.
2. **Proximité :** calcul de la distance grâce à la formule de Haversine:contentReference[oaicite:11]{index=11}.
3. **Disponibilités :** intersection des créneaux horaires enregistrés par les joueurs.

### 2.2 Flux utilisateur

- Définition du rayon de recherche et des créneaux disponibles.
- Lancement de la recherche, affichage des propositions (cartes montrant les joueurs, la distance et le créneau).
- Acceptation de la proposition par les quatre joueurs.

### 2.3 Modèle et API

- `AvailabilitySlot` pour les créneaux.
- `MatchSearchRequest` et `MatchProposal` pour les recherches.
- `POST /matchmaking/search` et `POST /matchmaking/proposals/{id}/accept`.

### 2.4 Interface

Cartes de propositions, animation pendant la recherche, notifications en temps réel lors de la confirmation.

## 3 Réservation optimisée

### 3.1 Contexte

Les fournisseurs de réservation de courts sont fragmentés:contentReference[oaicite:12]{index=12}. On propose donc :
1. **Intégration API** lorsqu’une API existe (Playtomic, Matchi…).
2. **Back‑office interne** pour les clubs partenaires.

### 3.2 Algorithme de suggestion

Choix du court en fonction :
- Distance moyenne (via Haversine:contentReference[oaicite:13]{index=13}).
- Disponibilité du court.
- Préférences du joueur (club favori, prix).

### 3.3 API

- `GET /courts?lat&lon&radius`
- `POST /reservations/suggest`
- `POST /reservations/{id}/confirm`

### 3.4 Interface

Cartes Leaflet avec marqueurs de courts, liste des créneaux triée par pertinence.

## 4 Exploration des tournois

### 4.1 Fonctionnalités

Page dédiée affichant :
- Tournois accessibles selon le niveau du joueur.
- Filtres (date, format, frais).
- Carte interactive Leaflet.

### 4.2 Données et API

- `tournaments` : id, nom, description, dates, min_elo, max_elo, format.
- `tournament_registrations`.
- API `GET /tournaments?minElo&maxElo`, `POST /tournaments/{id}/register`.

### 4.3 Interface

Listes de tournois sous forme de cartes, carte Leaflet interactive, possibilité de proposer un tournoi via un formulaire.

## 5 Recommandation & reporting post‑match

### 5.1 Validation du score

- Un joueur saisit le score.
- Les adversaires confirment ou contestent.
- Le score n’est pris en compte qu’une fois validé par tous.

### 5.2 Notation des adversaires

- Notes sur le fair‑play, le niveau et l’envie de rejouer.
- Commentaires publics ou privés.

### 5.3 Modèle et API

- `MatchResult`, `MatchConfirmation`, `RatingReview`.
- `POST /matches/{id}/submit-score`, `POST /matches/{id}/confirm-score`, `POST /matches/{id}/review`.

### 5.4 Interface

Notifications de confirmation, interface de notation simple, gestion des litiges via un formulaire.

## 6 Gamification et UX

### 6.1 Missions et XP

- Missions quotidiennes/hebdomadaires : « Joue 3 matchs », « Affronte un joueur Platine », etc.
- Points d’expérience et niveaux débloquant avatars, titres et skins.
- Classements régionaux et titres temporaires (Champion du mois).
- Effets audio/visuels pour chaque réussite.

### 6.2 Données et API

- `Mission`, `PlayerMission`, `Item`, `PlayerItem`.
- Endpoints : `GET /missions/today`, `POST /missions/{id}/progress`, `POST /missions/{id}/claim`, `GET /items`, `POST /items/{id}/equip`.

### 6.3 Interface

Tableau de bord des missions avec jauges de progression, inventaire d’avatars et de skins, paramètres pour activer/désactiver les sons.

## 7 Choix techniques

### 7.1 Front‑end

- React + Next.js pour le web.
- React Native pour l’app mobile, profitant des composants natifs:contentReference[oaicite:14]{index=14}.
- Leaflet pour les cartes:contentReference[oaicite:15]{index=15}, Chart.js pour les graphiques.

### 7.2 Backend

- Node.js + Express:contentReference[oaicite:16]{index=16}.
- ORM (Prisma ou TypeORM).
- Authentification via Keycloak ou Firebase Authentication:contentReference[oaicite:17]{index=17}.
- Notifications temps réel via Socket.io et FCM.

### 7.3 Base de données

- PostgreSQL:contentReference[oaicite:18]{index=18} avec PostGIS.
- Index géospatiaux et colonnes JSON pour plus de flexibilité.

### 7.4 Géolocalisation

- Nominatim pour le géocodage:contentReference[oaicite:19]{index=19}.
- Haversine pour la distance:contentReference[oaicite:20]{index=20}.

### 7.5 Hébergement

- Conteneurs Docker, déployés sur un VPS ou une plateforme PaaS à faible coût.
- Sauvegardes automatisées, monitoring avec Prometheus/Grafana.

## 8 Modèle relationnel global

Les principales tables sont :

| Table                | Description |
|----------------------|-------------|
| **players**          | Utilisateurs avec données de profil et score Elo. |
| **pairs**            | Paires de joueurs pour les matchs en double.      |
| **matches**          | Matches joués et leurs scores.                    |
| **courts**           | Courts disponibles avec localisation.             |
| **reservations**     | Réservations de courts liées à des matches.       |
| **tournaments**      | Informations sur les tournois.                    |
| **tournament_registrations** | Inscriptions aux tournois.              |
| **missions**, **player_missions**, **items**, **player_items** | Gamification. |
| **rating_history**, **rating_reviews** | Historique des notes Elo et avis. |
| **availability_slots** | Disponibilités des joueurs.                      |
| **match_proposals**, **match_confirmations** | Gestion du matchmaking. |

## Conclusion

Ce document fournit une base complète pour la refonte du site **PadelPyrennees** et le développement simultané de l’application mobile. En s’appuyant sur des technologies open‑source et des services gratuits (React/React Native, Express/Node.js:contentReference[oaicite:21]{index=21}, PostgreSQL:contentReference[oaicite:22]{index=22}, Leaflet:contentReference[oaicite:23]{index=23}, Nominatim:contentReference[oaicite:24]{index=24}), la plateforme est conçue pour être évolutive et maintenir une expérience utilisateur riche et gamifiée. Les principes du système Elo:contentReference[oaicite:25]{index=25}:contentReference[oaicite:26]{index=26}, la formule de Haversine pour les distances:contentReference[oaicite:27]{index=27} et l’intégration de missions et récompenses garantiront l’engagement des joueurs et la cohésion de la communauté PadelPyrennees.

