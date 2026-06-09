import { View } from 'react-native';

type Props = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = '#2F8F6B' }: Props) {
  const progress = Math.max(0, Math.min(1, value));

  return (
    <View className="h-3 overflow-hidden rounded-full bg-line">
      <View
        className="h-full rounded-full"
        style={{ backgroundColor: color, width: `${progress * 100}%` }}
      />
    </View>
  );
}
