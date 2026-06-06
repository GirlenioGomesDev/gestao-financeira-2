import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { TransactionModal } from "@/components/TransactionModal";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { useFinanceSummary } from "@/hooks/useFinanceSummary";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Transaction } from "@/types/finance";
import { categoryIcons, categoryLabels, spendingCategories } from "@/utils/categories";
import { formatCurrency, formatShortDate } from "@/utils/format";

export default function ExpensesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const transactions = useFinanceStore((state) => state.transactions);
  const removeTransaction = useFinanceStore((state) => state.removeTransaction);
  const { byCategory, budgetStatus } = useFinanceSummary();
  const expenses = transactions.filter((transaction) => transaction.type === "expense");

  function confirmRemove(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Apagar lancamento?", "Esse registro sai do seu diario financeiro.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", style: "destructive", onPress: () => removeTransaction(id) }
    ]);
  }

  return (
    <PaperScreen>
      <SectionHeader title="Gastos" subtitle="Veja para onde o dinheiro esta indo sem susto." />
      <View className="flex-row gap-2">
        <PrimaryButton label="Registrar" icon="add-circle" className="flex-1" onPress={() => setModalVisible(true)} />
        <PrimaryButton label="Importar Fatura" icon="document-text" variant="outline" className="flex-1" onPress={() => router.push("/import-invoice" as never)} />
      </View>

      <View className="my-5">
        <AppText className="mb-3 font-body text-lg">Por categoria</AppText>
        <View className="flex-row flex-wrap gap-3">
          {spendingCategories.map((category) => {
            const total = byCategory[category] ?? 0;
            return (
              <View key={category} className="w-[47%] rounded-paper border border-line bg-surface p-3">
                <MaterialCommunityIcons name={categoryIcons[category]} size={22} color="#2F8F6B" />
                <AppText className="mt-2 text-sm">{categoryLabels[category]}</AppText>
                <AppText className="mt-1 font-body text-base">{formatCurrency(total)}</AppText>
              </View>
            );
          })}
        </View>
      </View>

      <View className="mb-5">
        <AppText className="mb-3 font-body text-lg">Limites combinados</AppText>
        {budgetStatus.map((budget) => (
          <View key={budget.category} className="mb-3 rounded-paper border border-line bg-surface p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText>{categoryLabels[budget.category]}</AppText>
              <AppText className="text-sm text-muted">
                {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
              </AppText>
            </View>
            <ProgressBar value={budget.percent} color={budget.percent > 0.9 ? "#E96C5F" : "#2F8F6B"} />
          </View>
        ))}
      </View>

      <AppText className="mb-3 font-body text-lg">Historico</AppText>
      {expenses.map((transaction) => (
        <Pressable
          key={transaction.id}
          onPress={() => setEditingTransaction(transaction)}
          onLongPress={() => confirmRemove(transaction.id)}
          className="mb-3 flex-row items-center rounded-paper border border-line bg-surface p-3"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-paper">
            <MaterialCommunityIcons name={categoryIcons[transaction.category]} size={20} color="#2F8F6B" />
          </View>
          <View className="flex-1">
            <AppText className="font-body">{transaction.title}</AppText>
            <AppText className="text-xs text-muted">
              {categoryLabels[transaction.category]} - {formatShortDate(transaction.date)}
            </AppText>
          </View>
          <AppText className="text-coral">- {formatCurrency(transaction.amount)}</AppText>
        </Pressable>
      ))}

      <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <EditTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />
    </PaperScreen>
  );
}
