import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { fetchPlayer, fetchTournaments } from '@/lib/api';

export default function DashboardScreen() {
  const { auth } = useAuth();

  const { data: player } = useQuery({
    queryKey: ['mobile-player', auth?.playerId],
    queryFn: () => fetchPlayer(auth, auth!.playerId),
    enabled: Boolean(auth?.playerId),
  });

  const { data: tournaments } = useQuery({
    queryKey: ['mobile-tournaments'],
    queryFn: () => fetchTournaments(auth, 3),
    enabled: Boolean(auth?.playerId),
  });

  if (!auth) {
    return (
      <View style={styles.centered}> 
        <Text style={styles.centeredText}>Connectez-vous pour voir votre tableau de bord.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Bienvenue</Text>
      <View style={styles.card}>
        <Text style={styles.title}>{player?.pseudo ?? 'Joueur'}</Text>
        <Text style={styles.muted}>Elo: {player?.elo ?? '--'}</Text>
        <Text style={styles.muted}>Langue: {player?.locale ?? 'fr'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Mes paires</Text>
        {(player?.pairsAsA ?? []).concat(player?.pairsAsB ?? []).map((pair: { id: string; elo: number }, index: number) => (
          <View key={pair.id} style={styles.listItem}>
            <Text style={styles.listText}>#{index + 1} • {pair.id}</Text>
            <Text style={styles.muted}>Elo: {pair.elo}</Text>
          </View>
        ))}
        {(!player?.pairsAsA?.length && !player?.pairsAsB?.length) && (
          <Text style={styles.muted}>Aucune paire enregistrée.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Tournois à venir</Text>
        {tournaments?.map((tournament) => (
          <View key={tournament.id} style={styles.listItem}>
            <Text style={styles.listText}>{tournament.name}</Text>
            <Text style={styles.muted}>{new Date(tournament.startsAt).toLocaleDateString()}</Text>
          </View>
        ))}
        {!tournaments?.length && (
          <Text style={styles.muted}>Aucun tournoi planifié.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centeredText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowColor: '#000',
    elevation: 2,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  muted: {
    color: '#777',
    fontSize: 14,
  },
  listItem: {
    marginTop: 12,
  },
  listText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
