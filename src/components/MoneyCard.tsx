import { View } from "react-native";

import { AppText } from "@/components/Text";
import { formatCurrency } from "@/utils/format";

type Props = {
  label: string;
  value: number;
  tone?: "good" | "bad" | "neutral";
};

export function MoneyCard({ label, value, tone = "neutral" }: Props) {
  const color = tone === "good" ? "text-primaryDark" : tone === "bad" ? "text-coral" : "text-ink";

  return (
    <View className="flex-1 rounded-paper border border-line bg-surface p-4">
      <AppText className="text-xs uppercase tracking-wide text-muted">{label}</AppText>
      <AppText className={`mt-2 font-body text-xl ${color}`}>{formatCurrency(value)}</AppText>
    </View>
  );
}
