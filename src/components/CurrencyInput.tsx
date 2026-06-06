import { TextInput, TextInputProps } from "react-native";

type Props = Omit<TextInputProps, "value" | "onChangeText"> & {
  value: number;
  onChangeValue: (value: number) => void;
};

export function CurrencyInput({ value, onChangeValue, ...props }: Props) {
  return (
    <TextInput
      value={value ? String(value).replace(".", ",") : ""}
      onChangeText={(text) => {
        const normalized = text.replace(/[^\d,.]/g, "").replace(",", ".");
        onChangeValue(Number(normalized) || 0);
      }}
      keyboardType="decimal-pad"
      placeholder="R$ 0,00"
      placeholderTextColor="#9A9085"
      className="rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
      {...props}
    />
  );
}
