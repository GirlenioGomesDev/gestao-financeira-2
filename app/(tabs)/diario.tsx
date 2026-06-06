import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { DiaryModal } from "@/components/DiaryModal";
import { EditableField } from "@/components/EditableField";
import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatLongDate } from "@/utils/format";

const moodColors = {
  tranquilo: "#2F8F6B",
  apertado: "#E96C5F",
  animado: "#F5B84B",
  alerta: "#9A86C8"
};

export default function DiaryScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const habits = useFinanceStore((state) => state.habits);
  const diary = useFinanceStore((state) => state.diary);
  const toggleHabit = useFinanceStore((state) => state.toggleHabit);
  const updateDiaryEntry = useFinanceStore((state) => state.updateDiaryEntry);

  return (
    <PaperScreen>
      <SectionHeader title="Diario" subtitle="Habitos pequenos tambem contam historia." />
      <PrimaryButton label="Escrever nota" icon="create" onPress={() => setModalVisible(true)} />

      <View className="my-5">
        <AppText className="mb-3 font-body text-lg">Habitos de hoje</AppText>
        {habits.map((habit) => (
          <Pressable
            key={habit.id}
            onPress={() => {
              Haptics.selectionAsync();
              toggleHabit(habit.id);
            }}
            className={`mb-3 flex-row items-center rounded-paper border p-4 ${
              habit.doneToday ? "border-primary bg-primary/10" : "border-line bg-surface"
            }`}
          >
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-paper">
              <AppText className="font-body">{habit.emoji}</AppText>
            </View>
            <View className="flex-1">
              <AppText className="font-body">{habit.title}</AppText>
              <AppText className="mt-1 text-xs text-muted">{habit.streak} dias no embalo</AppText>
            </View>
            <Ionicons name={habit.doneToday ? "checkmark-circle" : "ellipse-outline"} size={24} color="#2F8F6B" />
          </Pressable>
        ))}
      </View>

      <AppText className="mb-3 font-body text-lg">Notas recentes</AppText>
      {diary.map((entry) => (
        <View key={entry.id} className="mb-3 rounded-paper border border-line bg-surface p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <AppText className="text-sm text-muted">{formatLongDate(entry.date)}</AppText>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${moodColors[entry.mood]}22` }}>
              <AppText className="text-xs" style={{ color: moodColors[entry.mood] }}>
                {entry.mood}
              </AppText>
            </View>
          </View>
          <EditableField
            value={entry.text || "Sem texto, so o registro do sentimento."}
            type="multiline"
            displayStyle="inline"
            onSave={(value) => updateDiaryEntry(entry.id, { text: String(value) })}
          />
        </View>
      ))}

      <DiaryModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </PaperScreen>
  );
}
