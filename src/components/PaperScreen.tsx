import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  scroll?: boolean;
}>;

export function PaperScreen({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const content = (
    <View
      className="min-h-full px-5 pt-4"
      style={{ paddingBottom: Math.max(32, insets.bottom + 24) }}
    >
      <View className="absolute bottom-0 left-9 top-0 w-px bg-coral/40" />
      <View className="absolute left-0 right-0 top-24 h-px bg-line" />
      <View className="absolute left-0 right-0 top-40 h-px bg-line" />
      <View className="absolute left-0 right-0 top-56 h-px bg-line" />
      <View className="absolute left-0 right-0 top-72 h-px bg-line" />
      <View className="pl-4">{children}</View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'left', 'right', 'bottom']}>
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
