import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { EditableField } from "@/components/EditableField";
import { EmojiPicker } from "@/components/EmojiPicker";
import { GoalModal } from "@/components/GoalModal";
import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/utils/format";

export default function GoalsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [emojiGoalId, setEmojiGoalId] = useState<string | null>(null);
  const goals = useFinanceStore((state) => state.goals);
  const contributeToGoal = useFinanceStore((state) => state.contributeToGoal);
  const updateGoal = useFinanceStore((state) => state.updateGoal);
  const removeGoal = useFinanceStore((state) => state.removeGoal);

  function addContribution(goalId: string, amount: number) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    contributeToGoal(goalId, amount);
  }

  return (
    <PaperScreen>
      <SectionHeader title="Metas e sonhos" subtitle="Guardar dinheiro fica mais leve quando ele tem destino." />
      <PrimaryButton label="Criar sonho" icon="flag" onPress={() => setModalVisible(true)} />

      <View className="mt-5">
        {goals.map((goal) => {
          const percent = goal.savedAmount / goal.targetAmount;
          return (
            <View key={goal.id} className="mb-4 rounded-paper border border-line bg-surface p-4">
              <View className="mb-3 flex-row items-start justify-between">
                <Pressable onPress={() => setEmojiGoalId(goal.id)} className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-paper">
                  <AppText>{goal.emoji ?? "🎯"}</AppText>
                </Pressable>
                <View className="flex-1 pr-3">
                  <EditableField value={goal.title} type="text" displayStyle="title" onSave={(value) => updateGoal(goal.id, { title: String(value) })} />
                  <EditableField value={goal.savedAmount} type="currency" displayStyle="subtitle" onSave={(value) => updateGoal(goal.id, { savedAmount: Number(value) })} />
                  <EditableField value={goal.targetAmount} type="currency" displayStyle="subtitle" onSave={(value) => updateGoal(goal.id, { targetAmount: Number(value) })} />
                </View>
                <AppText className="font-body text-primaryDark">{Math.round(percent * 100)}%</AppText>
              </View>

              <ProgressBar value={percent} color={goal.color} />
              <View className="mt-3 flex-row flex-wrap gap-2">
                {["#2F8F6B", "#F5B84B", "#7DB7D9", "#9A86C8", "#E96C5F", "#7B7167"].map((color) => (
                  <Pressable key={color} onPress={() => updateGoal(goal.id, { color })} className="h-8 w-8 rounded-full border border-line" style={{ backgroundColor: color }} />
                ))}
              </View>
              <EditableField value={goal.monthlyAmount ?? 0} type="currency" label="Guardar por mes" displayStyle="card" onSave={(value) => updateGoal(goal.id, { monthlyAmount: Number(value) })} />
              <EditableField value={goal.kind ?? "goal"} type="select" label="Tipo" options={["goal", "dream"]} displayStyle="card" onSave={(value) => updateGoal(goal.id, { kind: value === "dream" ? "dream" : "goal" })} />

              <View className="mt-4 flex-row gap-2">
                {[10, 25, 50].map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => addContribution(goal.id, amount)}
                    className="flex-1 rounded-paper border border-line bg-paper py-3"
                  >
                    <AppText className="text-center font-body">+{formatCurrency(amount)}</AppText>
                  </Pressable>
                ))}
              </View>
              <PrimaryButton
                label="Excluir meta"
                icon="trash"
                variant="outline"
                className="mt-3"
                onPress={() =>
                  Alert.alert("Excluir meta?", "O progresso guardado nesta meta sera perdido.", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Excluir", style: "destructive", onPress: () => removeGoal(goal.id) }
                  ])
                }
              />
            </View>
          );
        })}
      </View>

      <GoalModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <EmojiPicker
        visible={emojiGoalId !== null}
        onClose={() => setEmojiGoalId(null)}
        onSelect={(emoji) => {
          if (emojiGoalId) updateGoal(emojiGoalId, { emoji });
        }}
      />
    </PaperScreen>
  );
}
