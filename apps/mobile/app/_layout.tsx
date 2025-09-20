import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProviders } from '@/providers';
import { useEffect } from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <AppProviders>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <NavigationStack />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProviders>
    </AuthProvider>
  );
}

function NavigationStack() {
  const segments = useSegments();
  const router = useRouter();
  const { auth } = useAuth();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!auth && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (auth && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [auth, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
