import { View } from "react-native";

import { AppText, DisplayText } from "@/components/Text";

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View className="mb-4">
      <DisplayText className="text-4xl">{title}</DisplayText>
      {subtitle ? <AppText className="mt-1 text-sm text-muted">{subtitle}</AppText> : null}
    </View>
  );
}
