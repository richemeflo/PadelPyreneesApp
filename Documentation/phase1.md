<h1>Phase 1 : Cadrage et préparation du projet PadelPyrennees</h1>
Ce document de cadrage repose sur les spécifications techniques de la plateforme de padel gamifiée. Il intègre vos précisions :

Vous disposez d’environ 8 heures par semaine à consacrer au projet.

L’objectif est de livrer un MVP (site web + application mobile Android, iOS optionnel) en janvier 2026 avec priorité au site web.

Les clubs partenaires confirmés sont ViaPadel et probablement le centre sportif des Bruyères. D’autres clubs pourront être ajoutés progressivement via des APIs.

L’application devra être multilingue (français par défaut, structure prévue pour anglais et espagnol), prendre en charge les paiements en ligne, et permettre l’ajout ultérieur de missions quotidiennes/avatars.

<h2>1 Analyse des besoins détaillés</h2>
<h3>1.1 Données nécessaires</h3>
Les principaux objets de données identifiés sont :
<h4>Utilisateur (Player) : </h4>
<li>Pseudo, adresse e‑mail, mot de passe chiffré.</li>
<li>Localisation (lat, lon) et rayon de recherche préféré.</li>
<li>Palier Elo et niveau, XP et niveau de gamification (pour l’avenir)</li>
<li>Langue préférée (fr, en, es).</li>
<li>Informations facultatives : photo/avatar, genre, date de naissance (selon RGPD).</li>
<h4>Club/centre sportif</h4>
<li>Nom, adresse (géocodée), logo et coordonnées.</li>
<li>Liste de courts et leurs caractéristiques (type de surface, couvert/découvert).</li>
<li>API de réservation associée (identifiant et clés d’API) ou indication de réservation manuelle.</li>
<li>Tarifs et créneaux d’ouverture.</li>
<h4>Court</h4>
<li>Identifiant unique, club associé, description (type de surface, dimensions).</li>
<li>Créneaux disponibles (extraits via l’API ou définis manuellement).</li>
<h4>Match et paire</h4>
<li>Identifiant unique, participants (joueurs ou paires), date et heure.</li>
<li>Court réservé, score (avec historique des variations Elo).</li>
<li>Statut du match (proposé, en attente de confirmation, validé, litige).</li>
<li>Variations du score Elo (stockées dans rating_history).</li>
<h4>Disponibilités</h4>
<li>Jour de la semaine, heure de début et de fin.</li>
<li>Affectées à un joueur ou une paire.</li>
<h4>Tournoi (MVP simple)</h4>
<li>Nom, description, lieu, dates, niveau Elo minimum/maximum.</li>
<li>Participants (joueurs ou paires).</li>
<li>Statut (inscriptions ouvertes, en cours, terminé).</li>
<h4>Réservation</h4>
<li>Identifiant de court, créneau réservé, statut (réservé, annulé).</li>
<li>Montant payé et information de paiement (stripe_session_id).</li>

<p>

Ces entités constituent le modèle minimum pour le MVP. Les entités de gamification (missions, objets) seront planifiées ultérieurement mais la structure doit permettre de les ajouter (champs XP/niveau dans players, tables missions/items).</p>

<h2>2 Établissement du planning et des priorités</h2>
<h3>2.1 Périmètre du MVP (Version Minimale Viable)</h3>
Le MVP doit couvrir les besoins essentiels pour les membres de l’association à la sortie en janvier 2026 :

<li>Inscription et authentification sécurisée (via Keycloak ou Firebase Auth).</li>

<li>Profil joueur : consultation et modification de ses informations, localisation, langue.</li>

<li>Système de classement Elo : calcul et affichage du classement individuel, historique des matchs.</li>

<li>Création et validation d’un match : proposer un match à une paire d’adversaires, enregistrement du score avec double confirmation.</li>

<li>Réservation de courts chez les partenaires ViaPadel et centre des Bruyères, avec paiement en ligne (Stripe) ou redirection si API indisponible.</li>

<li>Matchmaking basique : recherche d’adversaires de niveau similaire dans un rayon géographique, sans gestion avancée des disponibilités. La version avancée (agenda complet, ranking par région) pourra être ajoutée par la suite.</li>

<li>Listing des tournois : visualisation des tournois organisés par l’association, inscriptions et affichage des participants.</li>

<li>Infrastructure multilingue : interface en français avec structure prête pour anglais/espagnol (utilisation d’une librairie d’internationalisation).</li>

<p>
Les fonctionnalités de missions quotidiennes, avatars personnalisables, classements régionaux et notification en temps réel seront prévues dans l’architecture mais mises en œuvre dans une phase ultérieure.</p>

<h3>2.2 Répartition du travail sur 20 semaines (août 2025 → janvier 2026)</h3>
Avec 8 h/semaine (~ 160 h au total), il est essentiel de hiérarchiser les tâches. La table ci‑dessous propose une découpe hebdomadaire indicative :

Période (semaine)	Objectifs principaux	Détail des tâches
<li>Semaine 1‑2 (août)	Cadrage et design	Finaliser les questions en suspens ; modéliser la base de données ; concevoir les wireframes ; installer l’environnement de développement.</li>
<li>
Semaine 3‑5 (sept.)	Backend – cœur du MVP	Implémenter le modèle utilisateur/paire, l’authentification, le calcul Elo ; créer les endpoints pour les matchs et la réservation ; intégrer Stripe en mode test.</li>
<li>
Semaine 6‑8 (oct.)	Frontend Web – fondations	Monter l’interface Next.js : pages d’inscription/connexion, profil, classement ; intégrer l’appel aux API backend ; gérer la localisation des textes (i18n).
</li>
<li>
Semaine 9‑11 (nov.)	Backend – réservation & tournois	Ajouter l’intégration avec ViaPadel/centre des Bruyères (mocks si pas d’API); implémenter les tournois et l’inscription ; développer un module d’intégration pour futurs clubs.
</li>
<li>
Semaine 12‑14 (nov./déc.)	Frontend Web – fonctionnalités	Intégrer la réservation de courts sur le site ; créer les pages tournois ; tester l’ensemble des parcours (création de match, validation, réservation).
</li>
<li>
Semaine 15‑16 (déc.)	Application mobile (version Android)	Démarrer le projet React Native, reprendre les écrans clés (inscription, profil, classement, création de match) ; tests sur Android ; prévoir la structure iOS (tests sur simulateur).
</li>
<li>
Semaine 17‑18 (déc.)	Tests, débogage	Effectuer des tests manuels et unitaires ; corriger les bugs ; ajuster l’UI et l’UX ; optimiser les performances.
</li>
<li>
Semaine 19‑20 (janv. 2026)	Déploiement et préparation au lancement	Configurer le serveur de production ; déployer la base de données et l’API ; mettre en ligne le site ; publier l’appli Android (Play Store) ; préparer la transition depuis l’ancien site.
</li>

<p>
Cette répartition est indicative et devra être ajustée selon l’avancement. Il est important de réserver du temps pour la communication avec les clubs partenaires (intégration des API) et la configuration des moyens de paiement.</p>

<h3>2.3 Choix technologiques</h3>
<table>
<thead>
<tr>
<th>Couche</th>
<th>Choix retenu</th>
<th>Justification</th>
</tr>
</thead>
<tbody>
<tr>
<td>Front‑end web</td>
<td>React + Next.js</td>
<td>Routage côté serveur, performances et SEO. Facile à maintenir et à étendre.</td>
</tr>
<tr>
<td>Application mobile</td>
<td>React Native (Expo)</td>
<td>Mutualisation du code avec React ; possibilité de cibler Android en priorité et d’étendre à iOS facilement <a href="https://reactnative.dev">reactnative.dev</a>.</td>
</tr>
<tr>
<td>Backend</td>
<td>Node.js + Express</td>
<td>Framework rapide, minimaliste et robuste <a href="https://expressjs.com">expressjs.com</a> ; large écosystème.</td>
</tr>
<tr>
<td>Base de données</td>
<td>PostgreSQL + PostGIS</td>
<td>Fiabilité et gestion relationnelle <a href="https://postgresql.org">postgresql.org</a> ; support des données géospatiales pour les distances.</td>
</tr>
<tr>
<td>ORM</td>
<td>Prisma ou TypeORM</td>
<td>Facilite la gestion des migrations et la génération de types ; améliore la productivité.</td>
</tr>
<tr>
<td>Cartographie</td>
<td>Leaflet</td>
<td>Bibliothèque JS open‑source légère pour cartes interactives <a href="https://leafletjs.com">leafletjs.com</a>.</td>
</tr>
<tr>
<td>Géocodage</td>
<td>Nominatim</td>
<td>Géocodage et reverse‑geocoding gratuits <a href="https
="https://wiki.openstreetmap.org">wiki.openstreetmap.org</a>.</td>
</tr>
<tr>
<td>Internationalisation</td>
<td>i18next ou react-i18next</td>
<td>Gestion des traductions ; chargement dynamique des langues.</td>
</tr>
<tr>
<td>Authentification</td>
<td>Keycloak (self‑hosted) ou Firebase Authentication</td>
<td>Keycloak offre une solution open‑source autonome ; Firebase Auth simplifie la mise en œuvre (plan gratuit).</td>
</tr>
<tr>
<td>Paiement</td>
<td>Stripe</td>
<td>API reconnue pour les paiements en ligne ; disponible en France ; mode test facile à utiliser.</td>
</tr>
</tbody>
</table>

