import { View } from 'react-native';

import { AppText } from '@/components/Text';

type Props = { values: number[] };

function abbreviate(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function NotebookChart({ values }: Props) {
  const max = Math.max(...values, 1);

  return (
    <View className="h-20 flex-row items-end gap-1">
      {values.map((value, index) => (
        <View key={index} className="flex-1 items-center justify-end">
          <AppText className="mb-0.5 text-[9px] text-muted">{abbreviate(value)}</AppText>
          <View
            className="w-full rounded-t-sm bg-primaryDark/60"
            style={{ height: Math.max(4, (value / max) * 56) }}
          />
        </View>
      ))}
    </View>
  );
}
