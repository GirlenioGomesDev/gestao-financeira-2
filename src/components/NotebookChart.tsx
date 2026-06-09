import { View } from 'react-native';

import { AppText } from '@/components/Text';

type Props = {
  values: number[];
};

export function NotebookChart({ values }: Props) {
  const max = Math.max(...values, 1);

  return (
    <View className="rounded-paper border border-line bg-surface p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <AppText className="font-body text-base">Ritmo de gastos</AppText>
        <AppText className="text-xs text-muted">ultimos lancamentos</AppText>
      </View>
      <View className="h-28 flex-row items-end gap-2">
        {values.map((value, index) => (
          <View
            key={`${value}-${index}`}
            className="flex-1 rounded-t-paper bg-primary"
            style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
          />
        ))}
      </View>
    </View>
  );
}
