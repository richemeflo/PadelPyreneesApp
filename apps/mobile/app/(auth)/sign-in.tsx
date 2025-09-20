import { useState } from 'react';
import { SafeAreaView, Text, TextInput, Pressable, View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [playerId, setPlayerId] = useState('');
  const [idToken, setIdToken] = useState('');

  const handleSubmit = () => {
    if (!playerId || !idToken) {
      Alert.alert('Connexion', 'Veuillez renseigner votre identifiant joueur et le token Firebase.');
      return;
    }
    signIn({ playerId, idToken });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>PadelPyrenees</Text>
        <Text style={styles.subtitle}>Connectez-vous avec votre compte Firebase</Text>

        <TextInput
          placeholder="Identifiant joueur"
          value={playerId}
          onChangeText={setPlayerId}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="ID Token Firebase"
          value={idToken}
          onChangeText={setIdToken}
          autoCapitalize="none"
          style={styles.input}
          secureTextEntry
        />

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#fff',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1b6ef3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 16,
  },
});
