"use client";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      appName: "PadelPyrenees",
      nav: {
        home: "Accueil",
        ranking: "Classement",
        matchmaking: "Matchmaking",
        reservations: "Réservations",
        tournaments: "Tournois",
      },
      home: {
        info: "Mes informations",
        events: "Événements Padel Pyrénées",
        upcomingMatches: "Parties prévues",
        declareResults: "Déclarer les résultats",
        tournaments: "Tournois prévus",
        missions: "Missions",
        addResult: "Ajouter un résultat",
      },
      stats: {
        elo: "Elo",
        scheduledMatches: "Matchs prévus",
        scheduledTournaments: "Tournois prévus",
        resultsToDeclare: "Résultats à déclarer",
      },
      tournaments: {
        upcoming: "Tournois à venir",
        register: "S'inscrire",
        alreadyRegistered: "Inscrit",
      },
      ranking: {
        title: "Classement",
        mine: "Mon classement",
        categoryHeading: "Classement {{category}}",
        general: "Classement général",
        searchPlaceholder: "Rechercher un joueur...",
        filters: {
          genderAll: "Genre (tous)",
          genderMale: "Hommes",
          genderFemale: "Femmes",
          genderLabel: "Sexe",
          categoryAll: "Catégorie (toutes)",
          categoryLabel: "Catégorie",
          periodLabel: "Période",
          toggle: "Filtres",
          clear: "Effacer",
        },
        periods: {
          "7j": "7 jours",
          "1m": "1 mois",
          "3m": "3 mois",
          "6m": "6 mois",
          "1y": "1 an",
        },
        table: {
          rank: "Rang",
          player: "Joueur",
          elo: "Points ELO",
          trend: "Évolution",
          ratio: "Ratio V/D",
          category: "Catégorie",
        },
      },
      matchmaking: {
        proposals: "Propositions de match",
        accept: "Accepter",
        accepted: "Accepté",
        distance: "Distance",
        eloGap: "Écart Elo",
        schedule: "Créneau",
      },
      common: {
        loading: "Chargement...",
        error: "Une erreur est survenue",
        refresh: "Actualiser",
      },
    },
  },
  en: {
    translation: {
      appName: "PadelPyrenees",
      nav: {
        home: "Home",
        ranking: "Ranking",
        matchmaking: "Matchmaking",
        reservations: "Bookings",
        tournaments: "Tournaments",
      },
      home: {
        info: "My information",
        events: "Padel Pyrénées events",
        upcomingMatches: "Upcoming matches",
        declareResults: "Declare results",
        tournaments: "Upcoming tournaments",
        missions: "Missions",
        addResult: "Add a result",
      },
      stats: {
        elo: "Elo",
        scheduledMatches: "Scheduled matches",
        scheduledTournaments: "Scheduled tournaments",
        resultsToDeclare: "Results to declare",
      },
      tournaments: {
        upcoming: "Upcoming tournaments",
        register: "Register",
        alreadyRegistered: "Registered",
      },
      ranking: {
        title: "Ranking",
        mine: "My ranking",
        categoryHeading: "{{category}} ranking",
        general: "Global ranking",
        searchPlaceholder: "Search for a player...",
        filters: {
          genderAll: "Gender (all)",
          genderMale: "Men",
          genderFemale: "Women",
          genderLabel: "Gender",
          categoryAll: "Category (all)",
          categoryLabel: "Category",
          periodLabel: "Period",
          toggle: "Filters",
          clear: "Clear",
        },
        periods: {
          "7j": "7 days",
          "1m": "1 month",
          "3m": "3 months",
          "6m": "6 months",
          "1y": "1 year",
        },
        table: {
          rank: "Rank",
          player: "Player",
          elo: "Elo points",
          trend: "Trend",
          ratio: "W/L ratio",
          category: "Category",
        },
      },
      matchmaking: {
        proposals: "Match proposals",
        accept: "Accept",
        accepted: "Accepted",
        distance: "Distance",
        eloGap: "Elo gap",
        schedule: "Slot",
      },
      common: {
        loading: "Loading...",
        error: "Something went wrong",
        refresh: "Refresh",
      },
    },
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "fr",
      interpolation: { escapeValue: false },
      detection: {
        order: ["querystring", "localStorage", "navigator"],
        caches: ["localStorage"],
      },
    })
    .catch((error) => {
      console.error("i18n init failed", error);
    });
}

export { i18n };
