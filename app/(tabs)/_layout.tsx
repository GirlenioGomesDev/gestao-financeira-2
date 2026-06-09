import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabColor = '#2F8F6B';
const mutedColor = '#9A9085';
type TabIconProps = { color: string; size: number };

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabColor,
        tabBarInactiveTintColor: mutedColor,
        tabBarStyle: {
          backgroundColor: '#FFFDF8',
          borderTopColor: '#E9DDC7',
          height: 64 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          height: 54,
        },
        tabBarLabelStyle: {
          fontFamily: 'NunitoSemiBold',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: 'Gastos',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="cash-register" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="metas"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <MaterialCommunityIcons name="bullseye-arrow" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cartoes"
        options={{
          title: 'Cartões',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="card-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="journal-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
