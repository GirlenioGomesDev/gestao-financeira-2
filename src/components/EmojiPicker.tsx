import { Modal, Pressable, View } from "react-native";

import { AppText, DisplayText } from "@/components/Text";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
};

const emojis = ["💰", "🏆", "🏠", "🚗", "🍽️", "❤️", "🎉", "⭐", "📚", "🚌", "🛒", "💊", "🧾", "✈️", "🎯", "🔧", "👕", "📱"];

export function EmojiPicker({ visible, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-end bg-ink/30">
        <View className="rounded-t-3xl bg-paper p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <DisplayText className="text-3xl">Escolha um icone</DisplayText>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-line">
              <AppText>X</AppText>
            </Pressable>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {emojis.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="h-12 w-12 items-center justify-center rounded-paper border border-line bg-surface"
              >
                <AppText className="text-xl">{emoji}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
