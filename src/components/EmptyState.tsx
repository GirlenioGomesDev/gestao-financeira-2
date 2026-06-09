import { View } from 'react-native';

import { AppText } from '@/components/Text';

type Props = {
  emoji: string;
  title: string;
  subtitle: string;
};

export function EmptyState({ emoji, title, subtitle }: Props) {
  return (
    <View className="items-center py-12">
      <AppText className="text-5xl">{emoji}</AppText>
      <AppText className="mt-4 text-center font-body text-lg">{title}</AppText>
      <AppText className="mt-2 max-w-72 text-center text-sm text-muted">{subtitle}</AppText>
    </View>
  );
}
