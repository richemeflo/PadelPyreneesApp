import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { createMatch, fetchPlayer } from '@/lib/api';

export default function MatchCreatorScreen() {
  const { auth } = useAuth();
  const { data: player } = useQuery({
    queryKey: ['mobile-player', auth?.playerId],
    queryFn: () => fetchPlayer(auth, auth!.playerId),
    enabled: Boolean(auth?.playerId),
  });

  const pairs = useMemo(() => {
    if (!player) return [];
    return [...(player.pairsAsA ?? []), ...(player.pairsAsB ?? [])];
  }, [player]);

  const [pairAId, setPairAId] = useState<string | undefined>(() => pairs[0]?.id);
  const [opponentPairId, setOpponentPairId] = useState('');
  const [startsAt, setStartsAt] = useState(new Date(Date.now() + 60 * 60 * 1000).toISOString());

  const mutation = useMutation({
    mutationFn: () => {
      if (!auth) throw new Error('Not authenticated');
      if (!pairAId) throw new Error('Sélectionnez votre paire');
      return createMatch(auth, {
        pairAId,
        pairBId: opponentPairId,
        startsAt,
      });
    },
    onSuccess: () => {
      Alert.alert('Match', 'Match créé avec succès');
      setOpponentPairId('');
    },
    onError: (error: unknown) => {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de créer le match');
    },
  });

  if (!auth) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>Connectez-vous pour créer un match.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Créer un match</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Votre paire</Text>
        <TextInput
          placeholder="Identifiant de votre paire"
          value={pairAId}
          onChangeText={setPairAId}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.helper}>
          {pairs.length ? `Paires disponibles : ${pairs.map((p: { id: string }) => p.id).join(', ')}` : 'Aucune paire enregistrée.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Paire adverse</Text>
        <TextInput
          placeholder="Identifiant de la paire adverse"
          value={opponentPairId}
          onChangeText={setOpponentPairId}
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Date et heure</Text>
        <TextInput
          placeholder="YYYY-MM-DDTHH:mm:ssZ"
          value={startsAt}
          onChangeText={setStartsAt}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.helper}>Utiliser le format ISO 8601. Exemple: 2025-08-12T18:30:00Z</Text>
      </View>

      <Pressable style={styles.button} onPress={() => mutation.mutate()} disabled={mutation.isLoading}>
        <Text style={styles.buttonText}>{mutation.isLoading ? 'Création...' : 'Créer le match'}</Text>
      </Pressable>
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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowColor: '#000',
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  helper: {
    fontSize: 12,
    color: '#777',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1b6ef3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
