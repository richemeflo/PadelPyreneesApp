Voici le découpage détaillé de la Phase 1 (MVP - 3 mois) :
PHASE 1 - MVP (3 mois)
SEMAINE 1-2 : Configuration & Infrastructure
Backend

 Créer compte Supabase + configuration projet
 Configurer base PostgreSQL avec tables users, matches, pairs
 Créer projet Node.js + Express + structure dossiers
 Configurer authentification Supabase côté serveur
 Créer endpoints auth basiques (register, login, profile)
 Déployer sur Railway + configurer variables d'environnement
 Tester connexion DB + endpoints avec Postman

Frontend Web

 Créer projet React + Vite + Tailwind
 Configurer Supabase client côté web
 Créer structure composants + pages de base
 Implémenter routing avec React Router
 Créer store Zustand pour état global
 Déployer sur Vercel + configurer domaine

Mobile

 Installer Expo CLI + créer projet React Native
 Configurer navigation avec Bottom Tabs
 Créer écrans de base (Home, Profile, Matchmaking)
 Configurer Supabase client mobile
 Tester sur émulateur Android


SEMAINE 3-4 : Authentification & Profils
Fonctionnalités Auth

 Page inscription web (email, mot de passe, infos profil)
 Écran inscription mobile avec formulaires natifs
 Page connexion web + mobile
 Validation email automatique Supabase
 Gestion erreurs auth (compte existant, mot de passe faible)
 Persistance session entre rechargements

Profils Utilisateurs

 Formulaire profil complet (nom, prénom, niveau estimé)
 Upload photo de profil (Supabase Storage)
 Écran profil web responsive
 Écran profil mobile avec design natif
 Modification profil + sauvegarde
 Déconnexion sécurisée


SEMAINE 5-6 : Système Elo Basique
Base de données Elo

 Créer tables pour historique des matchs
 Implémenter algorithme Elo côté serveur
 Endpoints pour récupérer classement individuel
 Système de paliers visuels (Bronze, Argent, Or...)

Interface Classement

 Page classement web avec tableau
 Écran classement mobile avec liste native
 Graphique progression Elo (simple)
 Badges visuels selon le niveau
 Historique des 10 derniers matchs


SEMAINE 7-8 : Matchmaking Simple
Backend Matchmaking

 Endpoint recherche adversaires par niveau Elo
 Logique d'appariement basique (+/- 200 points Elo)
 Système d'invitations de match
 Notifications en temps réel (WebSocket simple)

Interface Matchmaking Web

 Page recherche avec filtres niveau
 Liste des joueurs disponibles
 Boutons "Défier" + gestion invitations
 Interface accepter/refuser défis

Interface Matchmaking Mobile

 Écran recherche avec design mobile
 Cards joueurs avec swipe (optionnel)
 Notifications locales pour invitations
 Navigation vers détails joueur


SEMAINE 9-10 : Validation Résultats
Système de Match

 Interface saisie score de match
 Système confirmation double (2 joueurs minimum)
 Calcul automatique nouveaux Elo après validation
 Gestion conflits simples (score différent)

Interface Post-Match

 Écran saisie score web
 Écran saisie score mobile
 Notifications validation aux autres joueurs
 Historique match dans profil


SEMAINE 11-12 : Tests & Finitions MVP
Tests & Debug

 Tests unitaires endpoints critiques
 Tests interface web sur Chrome/Firefox/Safari
 Tests mobile sur Android (émulateur + device réel)
 Gestion erreurs réseau + offline
 Performance loading + optimisations images

Finitions UX

 Loading states sur toutes les actions
 Messages d'erreur user-friendly
 Animations transitions basiques
 Responsive design mobile-first web
 Icônes et assets finaux

Déploiement Production

 Configuration domaine production
 Variables environnement production
 Monitoring basique (Sentry)
 Documentation API basique
 Backup automatique DB


LIVRABLES FIN PHASE 1
Fonctionnalités Opérationnelles
✅ Authentification complète web + mobile
✅ Profils utilisateurs avec photo
✅ Système Elo individuel avec classement
✅ Matchmaking basique entre joueurs niveau similaire
✅ Validation résultats avec confirmation double
✅ Applications déployées et accessibles
Métriques Cibles MVP

50 utilisateurs inscrits pour tests
100 matchs joués et validés
Temps réponse API < 500ms
Application mobile installable via APK
Site web responsive sur tous devices

Technologies Validées

Stack technique complète opérationnelle
Pipeline déploiement automatisé
Base de données structurée et performante
Architecture scalable pour phases suivantes

Estimation effort : 2-3 développeurs pendant 3 mois