import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/Text';
import { TransactionModal } from '@/components/TransactionModal';

const tabs = [
  { name: 'index', label: 'Início', icon: 'home-outline' as const },
  { name: 'gastos', label: 'Gastos', icon: 'receipt-outline' as const },
  { name: 'cartoes', label: 'Cartões', icon: 'card-outline' as const },
  { name: 'metas', label: 'Metas', icon: 'flag-outline' as const },
  { name: 'diario', label: 'Diário', icon: 'book-outline' as const },
];

export default function TabsLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={({ state, navigation }) => {
          const activeRoute = state.routes[state.index]?.name;
          return (
            <View
              style={{ paddingBottom: Math.max(insets.bottom, 8) }}
              className="flex-row items-center border-t border-line bg-surface px-2 pt-2"
            >
              {tabs.slice(0, 2).map(tab => (
                <TabButton
                  key={tab.name}
                  {...tab}
                  active={activeRoute === tab.name}
                  onPress={() => navigation.navigate(tab.name)}
                />
              ))}
              <View className="flex-1 items-center justify-center" style={{ height: 58 }}>
                <Pressable
                  onPress={() => setModalVisible(true)}
                  accessibilityLabel="Adicionar lançamento"
                  className="h-14 w-14 items-center justify-center rounded-full bg-primaryDark"
                  style={{
                    shadowColor: '#1E7055',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Ionicons name="add" size={30} color="#FFFFFF" />
                </Pressable>
              </View>
              {tabs.slice(2).map(tab => (
                <TabButton
                  key={tab.name}
                  {...tab}
                  active={activeRoute === tab.name}
                  onPress={() => navigation.navigate(tab.name)}
                />
              ))}
            </View>
          );
        }}
      >
        {tabs.map(tab => (
          <Tabs.Screen key={tab.name} name={tab.name} />
        ))}
        <Tabs.Screen name="ajustes" options={{ href: null }} />
      </Tabs>
      <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center py-1">
      <Ionicons name={icon} size={22} color={active ? '#1E7055' : '#9A9085'} />
      <AppText className={`mt-0.5 text-[10px] ${active ? 'text-primaryDark' : 'text-muted'}`}>
        {label}
      </AppText>
      <View className={`mt-1 h-1 w-1 rounded-full ${active ? 'bg-primaryDark' : ''}`} />
    </Pressable>
  );
}
