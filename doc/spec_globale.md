### Phase 1 (MVP - 3 mois)
- [ ] **Web** : Authentification et profils utilisateurs
- [ ] **Mobile** : Configuration Expo + authentification
- [ ] Système Elo individuel basique
- [ ] **Mobile** : Navigation bottom tabs + écrans principaux
- [ ] Matchmaking simple (sans géoloc)
- [ ] Interface de base (React web + React Native mobile)
- [ ] Validation des résultats de match

### Phase 2 (4 mois)
- [ ] **Mobile** : Géolocalisation native + permissions
- [ ] Géolocalisation et matchmaking intelligent
- [ ] Système de paires et Elo de paire
- [ ] **Mobile** : Cartes natives avec react-native-maps
- [ ] Réservation de courts (intégration basique)
- [ ] **Mobile** : Notifications push natives
- [ ] Missions quotidiennes

### Phase 3 (5 mois)
- [ ] Interface de tournois (web + mobile)
- [ ] Système de badges et achievements
- [ ] **Mobile** : Intégration calendrier système
- [ ] **Mobile** : Build Android + publication Play Store
- [# Spécifications Techniques - Plateforme Padel Gamifiée

## 1. ARCHITECTURE GÉNÉRALE

### Stack Technique Recommandée (Budget Minimal)
- **Frontend Web** : React.js + Tailwind CSS (gratuit)
- **Mobile** : React Native + Expo (gratuit) - Android first, iOS ensuite
- **Backend** : Node.js + Express.js (gratuit)
- **Base de données** : PostgreSQL (gratuit via Supabase/Neon)
- **Authentification** : Supabase Auth (gratuit jusqu'à 50k utilisateurs)
- **Déploiement** : 
  - Web : Vercel (frontend) + Railway/Render (backend) - tiers gratuits
  - Mobile : Expo EAS Build (gratuit 30 builds/mois)
- **Maps** : 
  - Web : Leaflet + OpenStreetMap (gratuit)
  - Mobile : react-native-maps + OpenStreetMap (gratuit)
- **Notifications** : 
  - Web : WebPush API (gratuit)
  - Mobile : Expo Notifications (gratuit)
- **Storage** : Supabase Storage (gratuit 1GB)
- **App Stores** : Google Play (25$ one-time) + Apple Store (99$/an)

### Architecture Microservices Simplifiée
```
Frontend Web (React) ←→ API Gateway ←→ Services:
Mobile App (React Native) ←→              ├── User Service
                                          ├── Match Service  
                                          ├── Elo Service
                                          ├── Tournament Service
                                          ├── Notification Service
                                          └── Geolocation Service
```

### Architecture Mobile-First
- **Code partagé** : 80% du code business logic partagé entre web et mobile
- **Composants spécifiques** : Interface adaptée à chaque plateforme
- **API unique** : Même backend pour web et mobile
- **Authentification unifiée** : Session partagée entre plateformes

## 2. MODÈLES DE DONNÉES

### 2.1 Utilisateurs
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  username VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  avatar_url VARCHAR,
  individual_elo INTEGER DEFAULT 1200,
  individual_tier VARCHAR DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  lat DECIMAL(10,8), -- localisation approximative
  lng DECIMAL(11,8),
  radius_km INTEGER DEFAULT 10 -- rayon de recherche préféré
)
```

### 2.2 Paires et Elo de Paire
```sql
pairs (
  id UUID PRIMARY KEY,
  player1_id UUID REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  pair_elo INTEGER DEFAULT 1200,
  pair_tier VARCHAR DEFAULT 'bronze',
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  UNIQUE(player1_id, player2_id)
)
```

### 2.3 Matchs
```sql
matches (
  id UUID PRIMARY KEY,
  pair1_id UUID REFERENCES pairs(id),
  pair2_id UUID REFERENCES pairs(id),
  court_id UUID REFERENCES courts(id),
  scheduled_at TIMESTAMP,
  status VARCHAR DEFAULT 'scheduled', -- scheduled, completed, cancelled, disputed
  score_pair1 INTEGER,
  score_pair2 INTEGER,
  individual_elo_changes JSONB, -- {user_id: +/-points}
  pair_elo_changes JSONB,
  confirmed_by JSONB DEFAULT '[]', -- array des user_ids ayant confirmé
  created_at TIMESTAMP
)
```

### 2.4 Courts/Terrains
```sql
courts (
  id UUID PRIMARY KEY,
  name VARCHAR,
  address VARCHAR,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  hourly_rate DECIMAL(5,2),
  booking_url VARCHAR, -- URL externe si API indisponible
  available_hours JSONB, -- structure des créneaux
  created_at TIMESTAMP
)
```

### 2.5 Tournois
```sql
tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  start_date DATE,
  end_date DATE,
  registration_deadline DATE,
  min_elo INTEGER,
  max_elo INTEGER,
  max_participants INTEGER,
  entry_fee DECIMAL(5,2),
  court_id UUID REFERENCES courts(id),
  status VARCHAR DEFAULT 'open', -- open, full, ongoing, completed
  prize_pool JSONB,
  created_at TIMESTAMP
)
```

### 2.6 Système de Missions/Quêtes
```sql
missions (
  id UUID PRIMARY KEY,
  title VARCHAR,
  description TEXT,
  type VARCHAR, -- daily, weekly, achievement
  requirements JSONB, -- {matches: 3, tier: 'gold', etc.}
  xp_reward INTEGER,
  is_active BOOLEAN DEFAULT true
)

user_missions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mission_id UUID REFERENCES missions(id),
  progress JSONB,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP
)
```

## 3. FONCTIONNALITÉS DÉTAILLÉES

### 3.1 SYSTÈME DE CLASSEMENT ELO

#### Flux Utilisateur
1. **Consultation classement individuel**
   - Page dédiée avec progression visuelle (graphique)
   - Historique des 20 derniers matchs
   - Comparaison avec amis

2. **Consultation classement de paire**
   - Liste des paires formées
   - Statistiques détaillées par paire
   - Suggestion de partenaires compatibles

#### Algorithme Elo (K-factor adaptatif)
```javascript
function calculateEloChange(playerElo, opponentElo, result, kFactor = 32) {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  return Math.round(kFactor * (result - expectedScore));
}

// K-factor adaptatif selon le niveau
function getKFactor(elo, matchesPlayed) {
  if (matchesPlayed < 30) return 40; // Nouveaux joueurs
  if (elo < 2100) return 32;
  if (elo < 2400) return 24;
  return 16; // Joueurs experts
}
```

#### API Endpoints
```
GET /api/users/:id/elo-history
GET /api/users/:id/pairs
POST /api/pairs (création automatique si première fois ensemble)
GET /api/leaderboards/individual?region=:region&tier=:tier
GET /api/leaderboards/pairs?region=:region
```

### 3.2 MATCHMAKING INTELLIGENT

#### Flux Utilisateur
1. **Recherche de match** (bouton "Trouver un match")
2. **Sélection des paramètres** :
   - Partenaire (existant ou recherche automatique)
   - Rayon de recherche (5-50km)
   - Créneaux préférés
   - Niveau Elo accepté (+/- 200 points par défaut)

3. **Algorithme de matching** :
```javascript
async function findMatch(userId, preferences) {
  // 1. Trouver un partenaire si nécessaire
  const partner = preferences.partnerId || await findCompatiblePartner(userId);
  
  // 2. Calculer l'Elo de la paire potentielle
  const pairElo = await calculatePairElo(userId, partner.id);
  
  // 3. Chercher adversaires dans la fourchette Elo
  const opponents = await findOpponents({
    eloRange: [pairElo - 200, pairElo + 200],
    location: preferences.location,
    radius: preferences.radius,
    availableSlots: preferences.timeSlots
  });
  
  // 4. Scorer les matchs selon distance + disponibilité + équilibre Elo
  return rankMatches(opponents, preferences);
}
```

#### Interface Matchmaking
- **Web** : Carte interactive (Leaflet) avec markers des adversaires potentiels
- **Mobile** : 
  - Vue carte plein écran avec react-native-maps
  - Swipe cards pour parcourir les adversaires (style Tinder)
  - Géolocalisation native plus précise
- **Liste scorée** avec :
  - Photos des joueurs
  - Niveau Elo + badges visuels
  - Distance approximative
  - Créneaux communs
  - Bouton "Défier"

#### API Endpoints
```
POST /api/matchmaking/search
GET /api/users/compatible-partners/:userId
POST /api/matches/challenge (envoie une invitation)
PUT /api/matches/:id/accept
PUT /api/matches/:id/decline
```

### 3.3 RÉSERVATION OPTIMISÉE

#### Algorithme de Suggestion
```javascript
function suggestOptimalSlot(match) {
  const players = [match.pair1.player1, match.pair1.player2, 
                   match.pair2.player1, match.pair2.player2];
  
  // Calculer centre géographique
  const centerPoint = calculateCenterPoint(players.map(p => [p.lat, p.lng]));
  
  // Trouver courts dans un rayon raisonnable
  const availableCourts = findCourtsNear(centerPoint, 15); // 15km max
  
  // Croiser disponibilités joueurs + courts
  const commonSlots = findCommonAvailability(players, availableCourts);
  
  // Scorer par : distance moyenne + prix + qualité court
  return rankSlots(commonSlots);
}
```

#### Interface de Réservation
1. **Suggestions automatiques** (3 meilleures options)
2. **Vue calendrier** interactive avec disponibilités
3. **Cartes** :
   - Web : Leaflet avec courts disponibles
   - Mobile : react-native-maps avec navigation intégrée
4. **Système de vote** si désaccord sur le créneau
5. **Mobile spécifique** :
   - Notifications push natives pour confirmations
   - Intégration calendrier système
   - Géolocalisation continue pour ETA

#### Intégration Courts
- **API simple** : webhook pour récupérer disponibilités (format JSON standardisé)
- **Fallback** : liens directs vers sites de réservation
- **Manuel** : back-office pour saisir créneaux disponibles

### 3.4 EXPLORATION DES TOURNOIS

#### Interface Tournois
```javascript
// Composant React principal
function TournamentExplorer() {
  const [tournaments, setTournaments] = useState([]);
  const [filters, setFilters] = useState({
    minElo: null,
    maxElo: null,
    distance: 50,
    startDate: null,
    format: 'all' // individual, pairs, mixed
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <TournamentFilters filters={filters} onChange={setFilters} />
      </div>
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {tournaments.map(tournament => 
            <TournamentCard key={tournament.id} tournament={tournament} />
          )}
        </div>
        <TournamentMap tournaments={tournaments} />
      </div>
    </div>
  );
}
```

#### Carte Interactive
**Web (Leaflet)**
```javascript
function TournamentMap({ tournaments }) {
  return (
    <MapContainer center={[46.603354, 1.888334]} zoom={6}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {tournaments.map(tournament => (
        <Marker 
          key={tournament.id} 
          position={[tournament.court.lat, tournament.court.lng]}
        >
          <Popup>
            <TournamentPopup tournament={tournament} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

**Mobile (React Native)**
```javascript
import MapView, { Marker, Callout } from 'react-native-maps';

function TournamentMapMobile({ tournaments, userLocation }) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {tournaments.map(tournament => (
        <Marker
          key={tournament.id}
          coordinate={{
            latitude: tournament.court.lat,
            longitude: tournament.court.lng,
          }}
        >
          <Callout>
            <TournamentCallout tournament={tournament} />
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
```

#### API Endpoints
```
GET /api/tournaments?minElo=:elo&maxElo=:elo&lat=:lat&lng=:lng&radius=:km
POST /api/tournaments/:id/register
GET /api/tournaments/:id/participants
```

### 3.5 SYSTÈME DE NOTATION ET VALIDATION

#### Flux Post-Match
1. **Saisie du score** (par n'importe quel joueur)
2. **Notifications** aux 3 autres pour validation
3. **Interface de notation** :
   - Score du match (confirmation)
   - Notes adversaires (1-5 étoiles) :
     - Fair-play
     - Niveau technique
     - Envie de rejouer
   - Commentaire optionnel

#### Gestion des Conflits
```javascript
function handleMatchResult(matchId, results) {
  const confirmations = results.confirmations;
  
  if (confirmations.length === 4) {
    // Tous d'accord - validation automatique
    return processMatchResult(matchId, results.score);
  } else if (confirmations.length >= 2 && hasCoherentScore(results)) {
    // Majorité + cohérence - validation avec délai
    return scheduleValidation(matchId, 24); // 24h pour contester
  } else {
    // Conflit - intervention manuelle ou annulation
    return flagForReview(matchId);
  }
}
```

#### Interface de Notation
```javascript
function PostMatchRating({ match, currentUserId }) {
  const opponents = getOpponents(match, currentUserId);
  
  return (
    <div className="space-y-6">
      <ScoreConfirmation match={match} />
      {opponents.map(opponent => (
        <PlayerRating 
          key={opponent.id}
          player={opponent}
          onRate={(ratings) => submitRating(match.id, opponent.id, ratings)}
        />
      ))}
    </div>
  );
}
```

### 3.6 GAMIFICATION ET UX

#### Système d'XP et Niveaux
```javascript
const XP_TABLE = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700, 6: 1000,
  7: 1350, 8: 1750, 9: 2200, 10: 2700, // ... jusqu'à 100
};

function calculateLevel(xp) {
  return Object.keys(XP_TABLE).reverse().find(level => xp >= XP_TABLE[level]);
}

// Sources d'XP
const XP_REWARDS = {
  matchWin: 50,
  matchLoss: 20,
  tournamentParticipation: 100,
  tournamentWin: 500,
  dailyMissionComplete: 25,
  weeklyMissionComplete: 100,
  firstWinOfDay: 30,
  winStreak3: 75,
  ratingGiven: 5,
  profileComplete: 50
};
```

#### Missions Quotidiennes/Hebdomadaires
```javascript
const DAILY_MISSIONS = [
  {
    id: 'play_match',
    title: 'Premier match du jour',
    description: 'Joue ton premier match de la journée',
    requirement: { matches: 1 },
    xpReward: 25,
    weight: 100 // probabilité d'apparition
  },
  {
    id: 'win_match',
    title: 'Victoire écrasante',
    description: 'Remporte un match',
    requirement: { wins: 1 },
    xpReward: 50,
    weight: 80
  },
  {
    id: 'rate_opponent',
    title: 'Fair-play',
    description: 'Note tes adversaires après un match',
    requirement: { ratings_given: 2 },
    xpReward: 20,
    weight: 60
  }
];

// Génération missions quotidiennes
function generateDailyMissions(userId) {
  const userProfile = getUserProfile(userId);
  const availableMissions = DAILY_MISSIONS.filter(mission => 
    meetsRequirements(mission, userProfile)
  );
  
  return weightedSample(availableMissions, 3); // 3 missions par jour
}
```

#### Badges et Titres
```sql
achievements (
  id UUID PRIMARY KEY,
  code VARCHAR UNIQUE, -- 'first_win', 'win_streak_10', 'tournament_winner'
  title VARCHAR,
  description TEXT,
  icon_url VARCHAR,
  tier VARCHAR, -- bronze, silver, gold, legendary
  requirements JSONB,
  xp_reward INTEGER
)

user_achievements (
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMP,
  progress JSONB,
  PRIMARY KEY (user_id, achievement_id)
)
```

#### Interface Gamifiée
```javascript
// Composants d'effets visuels
function LevelUpAnimation({ fromLevel, toLevel }) {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white">LEVEL UP!</h2>
        <p className="text-xl">Niveau {fromLevel} → {toLevel}</p>
      </div>
    </motion.div>
  );
}

function XPBar({ currentXP, nextLevelXP, level }) {
  const progress = (currentXP / nextLevelXP) * 100;
  
  return (
    <div className="relative bg-gray-200 rounded-full h-3">
      <motion.div 
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <span className="absolute right-2 top-0 text-xs font-bold">
        Niveau {level}
      </span>
    </div>
  );
}
```

#### Notifications Push
**Web (Service Worker)**
```javascript
// Service Worker pour notifications web
function sendMatchFoundNotification(match) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Match trouvé !', {
        body: `Adversaires de niveau ${match.averageElo} trouvés`,
        icon: '/icons/padel-ball.png',
        badge: '/icons/badge.png',
        actions: [
          { action: 'accept', title: 'Accepter' },
          { action: 'decline', title: 'Refuser' }
        ],
        data: { matchId: match.id }
      });
    });
  }
}
```

**Mobile (Expo Notifications)**
```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configuration notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Envoyer notification native
async function sendMobileNotification(userId, notification) {
  const pushToken = await getUserPushToken(userId);
  
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: 'default',
      priority: 'high',
      channelId: 'match-notifications',
    }),
  });
}

// Gestion des actions de notification mobile
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { actionIdentifier, notification } = response;
    const { matchId } = notification.request.content.data;
    
    if (actionIdentifier === 'accept') {
      acceptMatch(matchId);
    } else if (actionIdentifier === 'decline') {
      declineMatch(matchId);
    }
  });
  
  return () => subscription.remove();
}, []);
```

## 4. ARCHITECTURE TECHNIQUE DÉTAILLÉE

### 4.1 Base de données (PostgreSQL + Supabase)
```sql
-- Indexes pour performance
CREATE INDEX idx_users_elo ON users(individual_elo DESC);
CREATE INDEX idx_users_location ON users USING GIST(point(lng, lat));
CREATE INDEX idx_matches_date ON matches(scheduled_at);
CREATE INDEX idx_tournaments_elo_range ON tournaments(min_elo, max_elo);

-- Vue pour leaderboards optimisés
CREATE MATERIALIZED VIEW leaderboard_individual AS
SELECT 
  u.id, u.username, u.individual_elo, u.individual_tier,
  COUNT(m.id) as matches_played,
  COUNT(CASE WHEN (m.pair1_id IN (SELECT id FROM pairs WHERE player1_id = u.id OR player2_id = u.id) 
                  AND m.score_pair1 > m.score_pair2) 
                OR (m.pair2_id IN (SELECT id FROM pairs WHERE player1_id = u.id OR player2_id = u.id) 
                  AND m.score_pair2 > m.score_pair1) THEN 1 END) as wins
FROM users u
LEFT JOIN pairs p ON (p.player1_id = u.id OR p.player2_id = u.id)
LEFT JOIN matches m ON (m.pair1_id = p.id OR m.pair2_id = p.id) 
  AND m.status = 'completed'
GROUP BY u.id, u.username, u.individual_elo, u.individual_tier
ORDER BY u.individual_elo DESC;

-- Rafraichissement automatique toutes les heures
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_individual;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('refresh-leaderboards', '0 * * * *', 'SELECT refresh_leaderboards();');
```

### 4.2 API Backend (Node.js + Express)
```javascript
// Structure des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/matches', authenticateToken, matchRoutes);
app.use('/api/tournaments', authenticateToken, tournamentRoutes);
app.use('/api/matchmaking', authenticateToken, matchmakingRoutes);

// Middleware rate limiting (gratuit avec express-rate-limit)
const rateLimit = require('express-rate-limit');
const matchmakingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limite 10 recherches matchmaking par 15min
  message: 'Trop de recherches de matchs, réessayez dans 15 minutes'
});

app.use('/api/matchmaking', matchmakingLimiter);

// WebSocket pour notifications temps réel (socket.io)
io.on('connection', (socket) => {
  socket.on('join-user-room', (userId) => {
    socket.join(`user:${userId}`);
  });
  
  // Notification match trouvé
  socket.on('match-found', (data) => {
    io.to(`user:${data.challengedUserId}`).emit('match-invitation', data);
  });
});
```

### 4.3 Frontend Multi-Plateforme

#### Shared Logic (React + React Native)
```javascript
// hooks/useGameLogic.js - Partagé entre web et mobile
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  user: null,
  notifications: [],
  activeMatch: null,
  
  setUser: (user) => set({ user }),
  addNotification: (notification) => 
    set(state => ({ 
      notifications: [...state.notifications, { 
        ...notification, 
        id: Date.now() 
      }] 
    })),
  
  // Actions matchmaking
  searchMatch: async (preferences) => {
    const response = await fetch('/api/matchmaking/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    return response.json();
  }
}));

// Géolocalisation cross-platform
function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Web
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }),
        (error) => setError(error.message)
      );
    }
    // React Native
    else if (typeof Location !== 'undefined') {
      Location.getCurrentPositionAsync({}).then(location => {
        setLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
      }).catch(setError);
    }
  }, []);
  
  return { location, error };
}
```

#### Web Components (React + Tailwind)
```javascript
// components/web/MatchCard.jsx
function MatchCard({ match, onAccept, onDecline }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={match.opponent.avatar} 
            className="w-12 h-12 rounded-full"
            alt={match.opponent.name}
          />
          <div>
            <h3 className="font-bold">{match.opponent.name}</h3>
            <p className="text-sm text-gray-600">Elo: {match.opponent.elo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{match.distance}km</p>
          <p className="text-xs">{match.availableTime}</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button 
          onClick={() => onAccept(match.id)}
          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
        >
          Accepter
        </button>
        <button 
          onClick={() => onDecline(match.id)}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
```

#### Mobile Components (React Native)
```javascript
// components/mobile/MatchCard.jsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function MatchCard({ match, onAccept, onDecline }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <Image 
            source={{ uri: match.opponent.avatar }} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.playerName}>{match.opponent.name}</Text>
            <Text style={styles.elo}>Elo: {match.opponent.elo}</Text>
          </View>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.distance}>{match.distance}km</Text>
          <Text style={styles.time}>{match.availableTime}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => onAccept(match.id)}
          style={styles.acceptButton}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Accepter</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => onDecline(match.id)}
          style={styles.declineButton}
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Refuser</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  elo: {
    fontSize: 14,
    color: '#6B7280',
  },
  matchInfo: {
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
```

#### Navigation Mobile (React Navigation)
```javascript
// navigation/AppNavigator.jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Matchmaking') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'Tournaments') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matchmaking" component={MatchmakingScreen} />
      <Tab.Screen name="Tournaments" component={TournamentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MatchDetails" 
        component={MatchDetailsScreen}
        options={{ title: 'Détails du Match' }}
      />
      <Stack.Screen 
        name="TournamentDetails" 
        component={TournamentDetailsScreen}
        options={{ title: 'Tournoi' }}
      />
    </Stack.Navigator>
  );
}
```

### 4.4 Déploiement Multi-Plateforme

#### Configuration Vercel (Frontend Web)
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

#### Configuration Expo (Mobile)
```json
// app.json
{
  "expo": {
    "name": "Padel Pro",
    "slug": "padel-pro",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B5CF6"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.padelx.padelgame",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B5CF6"
      },
      "package": "com.padelx.padelgame",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-location",
      "expo-camera",
      "expo-notifications",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      },
      "apiUrl": "https://your-api.railway.app",
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-anon-key"
    }
  }
}
```

#### Configuration EAS Build
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

#### Configuration Railway (Backend)
```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300

[[services]]
name = "padel-api"

[services.variables]
NODE_ENV = "production"
DATABASE_URL = "${{Postgres.DATABASE_URL}}"
REDIS_URL = "${{Redis.REDIS_URL}}"
EXPO_PUSH_TOKEN = "${{EXPO_PUSH_TOKEN}}"
```

#### Scripts de Déploiement
```json
// package.json
{
  "scripts": {
    "dev:web": "vite",
    "dev:mobile": "expo start",
    "build:web": "vite build",
    "build:mobile:android": "eas build --platform android",
    "build:mobile:ios": "eas build --platform ios",
    "deploy:web": "vercel --prod",
    "deploy:mobile:android": "eas submit --platform android",
    "deploy:mobile:ios": "eas submit --platform ios",
    "test": "jest",
    "test:e2e:mobile": "detox test"
  }
}
```

#### Monitoring gratuit (UptimeRobot + Sentry)
```javascript
// Sentry pour error tracking (gratuit 5k erreurs/mois)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1, // 10% sampling pour rester dans les limites
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});
```

## 5. ROADMAP DE DÉVELOPPEMENT

### Phase 1 (MVP - 2 mois)
- [ ] Authentification et profils utilisateurs
- [ ] Système Elo individuel basique
- [ ] Matchmaking simple (sans géoloc)
- [ ] Interface de base (React + Tailwind)
- [ ] Validation des résultats de match

### Phase 2 (3 mois)
- [ ] Géolocalisation et matchmaking intelligent
- [ ] Système de paires et Elo de paire
- [ ] Réservation de courts (intégration basique)
- [ ] Missions quotidiennes
- [ ] Interface de tournois

### Phase 3 (4 mois)
- [ ] Système de badges et achievements
- [ ] Notifications push
- [ ] Statistiques avancées
- [ ] API mobile (React Native)
- [ ] Optimisations performance

### Phase 4 (5+ mois)
- [ ] IA pour recommandations avancées
- [ ] Intégration calendriers externes
- [ ] Système de coaching
- [ ] Monétisation premium
- [ ] App mobile native

## 6. COÛTS ET RESSOURCES

### Coûts Mensuels Estimés (Démarrage)
- **Hébergement** : 0€ (tiers gratuits Vercel + Railway)
- **Base de données** : 0€ (Supabase gratuit jusqu'à 500MB)
- **Monitoring** : 0€ (UptimeRobot + Sentry gratuit)
- **Maps** : 0€ (OpenStreetMap + Leaflet)
- **Storage** : 0€ (1GB Supabase gratuit)
- **Domaine** : ~12€/an (.com)

**Total démarrage : ~1€/mois**

### Seuils de Scalabilité (Payant)
- **Supabase** : 25$/mois (8GB database, 100GB bandwidth)
- **Railway** : 5$/mois (512MB RAM serveur)
- **Vercel** : 20$/mois (commercial usage)
- **Sentry** : 26$/mois (50k erreurs)

**Total scale : ~76$/mois** (>10k utilisateurs actifs)

### Équipe Recommandée
- **1 Fullstack Developer** (React + Node.js)
- **1 UI/UX Designer** (temps partiel)
- **1 Product Owner** (vous)

**Budget équipe minimaliste : ~4k€/mois**

---

Cette spécification couvre tous les aspects techniques nécessaires pour développer votre plateforme de padel gamifiée. L'approche privilégie des solutions gratuites et scalables, avec une architecture moderne et maintenable.