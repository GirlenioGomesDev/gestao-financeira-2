import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { EditTransactionModal } from '@/components/EditTransactionModal';
import { EmptyState } from '@/components/EmptyState';
import { PaperScreen } from '@/components/PaperScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import { AppText } from '@/components/Text';
import { TransactionModal } from '@/components/TransactionModal';
import { useFinanceSummary } from '@/hooks/useFinanceSummary';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction, TransactionCategory, TransactionType } from '@/types/finance';
import { categoryIcons, categoryLabels, spendingCategories } from '@/utils/categories';
import { formatAmount, formatCurrency, formatShortDate } from '@/utils/format';

type ViewType = TransactionType | 'all';

function getMonthKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '');
}

export default function ExpensesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState<ViewType>('expense');
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthKey(new Date()));
  const transactions = useFinanceStore(state => state.transactions);
  const budgets = useFinanceStore(state => state.budgets);
  const removeTransaction = useFinanceStore(state => state.removeTransaction);
  const { monthlyEvolution } = useFinanceSummary();
  const monthOptions = monthlyEvolution.map(item => item.month).reverse();

  const filteredByMonth = useMemo(
    () => transactions.filter(transaction => getMonthKey(transaction.date) === selectedMonth),
    [selectedMonth, transactions],
  );
  const selectedMonthExpenses = useMemo(
    () => filteredByMonth.filter(transaction => transaction.type === 'expense'),
    [filteredByMonth],
  );
  const byCategory = useMemo(
    () =>
      selectedMonthExpenses.reduce<Partial<Record<TransactionCategory, number>>>(
        (totals, transaction) => {
          totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
          return totals;
        },
        {},
      ),
    [selectedMonthExpenses],
  );
  const budgetStatus = useMemo(
    () =>
      budgets.map(budget => {
        const spent = byCategory[budget.category] ?? 0;
        return {
          ...budget,
          spent,
          percent: budget.limit > 0 ? Math.min(1, spent / budget.limit) : 0,
        };
      }),
    [budgets, byCategory],
  );
  const visibleTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
    return filteredByMonth.filter(transaction => {
      const matchesType = viewType === 'all' || transaction.type === viewType;
      const matchesSearch =
        !normalizedSearch ||
        transaction.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        categoryLabels[transaction.category].toLocaleLowerCase('pt-BR').includes(normalizedSearch);
      return matchesType && matchesSearch;
    });
  }, [filteredByMonth, search, viewType]);

  function confirmRemove(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Apagar lançamento?', 'Esse registro sai do seu diário financeiro.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => removeTransaction(id) },
    ]);
  }

  return (
    <PaperScreen>
      <SectionHeader title="Lançamentos" subtitle="Encontre cada entrada e saída sem susto." />
      <View className="flex-row gap-2">
        <PrimaryButton
          label="Registrar"
          icon="add-circle"
          className="flex-1"
          onPress={() => setModalVisible(true)}
        />
        <PrimaryButton
          label="Importar Fatura"
          icon="document-text"
          variant="outline"
          className="flex-1"
          onPress={() => router.push('/import-invoice' as never)}
        />
      </View>

      <View className="mt-5 flex-row rounded-paper bg-line p-1">
        {[
          { key: 'expense' as const, label: 'Gastos' },
          { key: 'income' as const, label: 'Receitas' },
          { key: 'all' as const, label: 'Todos' },
        ].map(option => (
          <Pressable
            key={option.key}
            onPress={() => setViewType(option.key)}
            className={`flex-1 rounded-paper py-3 ${viewType === option.key ? 'bg-surface' : ''}`}
          >
            <AppText className="text-center font-body">{option.label}</AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="my-4"
        contentContainerClassName="gap-2"
      >
        {monthOptions.map(month => (
          <Pressable
            key={month}
            onPress={() => setSelectedMonth(month)}
            className={`rounded-full border px-4 py-2 ${
              selectedMonth === month
                ? 'border-primaryDark bg-primaryDark'
                : 'border-line bg-surface'
            }`}
          >
            <AppText
              className={`text-sm capitalize ${
                selectedMonth === month ? 'text-white' : 'text-ink'
              }`}
            >
              {getMonthLabel(month)}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar lançamento..."
        placeholderTextColor="#9A9085"
        className="rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
      />
      <AppText className="mb-4 mt-2 text-sm text-muted">
        {visibleTransactions.length} registros
      </AppText>

      {viewType === 'expense' ? (
        <>
          <View className="mb-5">
            <AppText className="mb-3 font-body text-lg">Por categoria</AppText>
            <View className="flex-row flex-wrap gap-3">
              {spendingCategories.map(category => (
                <View
                  key={category}
                  className="w-[47%] rounded-paper border border-line bg-surface p-3"
                >
                  <MaterialCommunityIcons
                    name={categoryIcons[category]}
                    size={22}
                    color="#2F8F6B"
                  />
                  <AppText className="mt-2 text-sm">{categoryLabels[category]}</AppText>
                  <AppText className="mt-1 font-body text-base">
                    {formatCurrency(byCategory[category] ?? 0)}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <AppText className="mb-3 font-body text-lg">Limites combinados</AppText>
            {budgetStatus.map(budget => (
              <View
                key={budget.category}
                className="mb-3 rounded-paper border border-line bg-surface p-4"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <AppText>{categoryLabels[budget.category]}</AppText>
                  <AppText className="text-sm text-muted">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </AppText>
                </View>
                <ProgressBar
                  value={budget.percent}
                  color={budget.percent > 0.9 ? '#E96C5F' : '#2F8F6B'}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      <AppText className="mb-3 font-body text-lg">Histórico</AppText>
      {visibleTransactions.length ? (
        visibleTransactions.map(transaction => (
          <SwipeToDelete key={transaction.id} onDelete={() => confirmRemove(transaction.id)}>
            <Pressable
              onPress={() => setEditingTransaction(transaction)}
              onLongPress={() => confirmRemove(transaction.id)}
              className="flex-row items-center border border-line bg-surface p-3"
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-paper">
                <MaterialCommunityIcons
                  name={categoryIcons[transaction.category]}
                  size={20}
                  color="#2F8F6B"
                />
              </View>
              <View className="flex-1">
                <AppText className="font-body">{transaction.title}</AppText>
                <AppText className="text-xs text-muted">
                  {categoryLabels[transaction.category]} - {formatShortDate(transaction.date)}
                </AppText>
              </View>
              <AppText
                className={transaction.type === 'income' ? 'text-primaryDark' : 'text-coral'}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </AppText>
            </Pressable>
          </SwipeToDelete>
        ))
      ) : (
        <EmptyState
          emoji="📓"
          title="Nenhum registro ainda."
          subtitle="Toque em Registrar para começar."
        />
      )}

      <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <EditTransactionModal
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </PaperScreen>
  );
}
