import '../global.css';

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText } from '@/components/Text';
import { useRecurringSync } from '@/hooks/useRecurringSync';
import { useFinanceStore } from '@/store/useFinanceStore';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const hasHydrated = useFinanceStore(state => state._hasHydrated);
  const resetHabitsIfNewDay = useFinanceStore(state => state.resetHabitsIfNewDay);
  const [fontsLoaded] = useFonts({
    Nunito: Nunito_400Regular,
    NunitoSemiBold: Nunito_600SemiBold,
    NunitoBold: Nunito_700Bold,
    PatrickHand: PatrickHand_400Regular,
  });
  useRecurringSync();

  useEffect(() => {
    if (hasHydrated) {
      resetHabitsIfNewDay();
    }
  }, [hasHydrated, resetHabitsIfNewDay]);

  useEffect(() => {
    if (fontsLoaded && hasHydrated) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, hasHydrated]);

  if (!fontsLoaded || !hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <AppText className="text-5xl">📓</AppText>
        <AppText className="mt-3 font-body text-lg">Meu Diário Financeiro</AppText>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
