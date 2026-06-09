import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { EditTransactionModal } from '@/components/EditTransactionModal';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import { AppText, DisplayText } from '@/components/Text';
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState<ViewType>('expense');
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthKey(new Date()));
  const [selectedResponsible, setSelectedResponsible] = useState<string | null>(null);
  const transactions = useFinanceStore(state => state.transactions);
  const budgets = useFinanceStore(state => state.budgets);
  const removeTransaction = useFinanceStore(state => state.removeTransaction);

  const monthOptions = useMemo(() => {
    const keys = new Set(transactions.map(transaction => getMonthKey(transaction.date)));
    keys.add(getMonthKey(new Date()));
    return Array.from(keys).sort().reverse();
  }, [transactions]);
  const filteredByMonth = useMemo(
    () => transactions.filter(transaction => getMonthKey(transaction.date) === selectedMonth),
    [selectedMonth, transactions],
  );
  const responsibles = useMemo(() => {
    const names = new Set(
      filteredByMonth
        .map(transaction => transaction.responsible)
        .filter((name): name is string => Boolean(name)),
    );
    return Array.from(names).sort();
  }, [filteredByMonth]);
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
      const matchesResponsible =
        !selectedResponsible || transaction.responsible === selectedResponsible;
      const matchesSearch =
        !normalizedSearch ||
        transaction.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        categoryLabels[transaction.category]
          .toLocaleLowerCase('pt-BR')
          .includes(normalizedSearch) ||
        transaction.responsible?.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        transaction.purchaseLocation?.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
      return matchesType && matchesResponsible && matchesSearch;
    });
  }, [filteredByMonth, search, selectedResponsible, viewType]);

  function confirmRemove(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Apagar lançamento?', 'Esse registro sai do seu diário financeiro.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => removeTransaction(id) },
    ]);
  }

  return (
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerClassName="px-5 pb-32 pt-14"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-6 flex-row items-end justify-between">
        <View>
          <AppText className="text-xs uppercase text-muted">Movimentações</AppText>
          <DisplayText className="text-4xl">Gastos</DisplayText>
          <AppText className="text-sm text-muted">cada real no lugar certo</AppText>
        </View>
        <Pressable
          onPress={() => router.push('/import-invoice' as never)}
          className="h-10 items-center justify-center rounded-pill border border-line bg-surface px-4"
        >
          <AppText className="text-xs text-primaryDark">Importar CSV</AppText>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 mb-4"
        contentContainerClassName="gap-2 px-5"
      >
        {monthOptions.map(month => {
          const isCurrentMonth = month === getMonthKey(new Date());
          return (
            <Pressable
              key={month}
              onPress={() => {
                setSelectedMonth(month);
                setSelectedResponsible(null);
              }}
              className={`relative rounded-pill border px-4 py-2 ${
                selectedMonth === month
                  ? 'border-primaryDark bg-primaryDark'
                  : 'border-line bg-surface'
              }`}
            >
              {!isCurrentMonth && selectedMonth !== month ? (
                <View className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-coral" />
              ) : null}
              <AppText
                className={`text-sm capitalize ${
                  selectedMonth === month ? 'text-white' : 'text-ink'
                }`}
              >
                {getMonthLabel(month)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="mb-4 flex-row rounded-xl bg-line p-1">
        {(['expense', 'income', 'all'] as ViewType[]).map(option => (
          <Pressable
            key={option}
            onPress={() => setViewType(option)}
            className={`flex-1 rounded-xl py-2.5 ${viewType === option ? 'bg-surface' : ''}`}
          >
            <AppText className="text-center text-sm font-body">
              {option === 'expense' ? 'Gastos' : option === 'income' ? 'Receitas' : 'Todos'}
            </AppText>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome, categoria, responsável..."
        placeholderTextColor="#9A9085"
        className="mb-2 rounded-xl border border-line bg-surface px-4 py-3 font-body text-sm text-ink"
      />

      {responsibles.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5 mb-4"
          contentContainerClassName="gap-2 px-5"
        >
          <Pressable
            onPress={() => setSelectedResponsible(null)}
            className={`rounded-pill border px-3 py-1.5 ${
              selectedResponsible === null
                ? 'border-lavender bg-lavender/15'
                : 'border-line bg-surface'
            }`}
          >
            <AppText className="text-xs">Todos</AppText>
          </Pressable>
          {responsibles.map(name => (
            <Pressable
              key={name}
              onPress={() => setSelectedResponsible(name)}
              className={`rounded-pill border px-3 py-1.5 ${
                selectedResponsible === name
                  ? 'border-lavender bg-lavender/15'
                  : 'border-line bg-surface'
              }`}
            >
              <AppText className="text-xs">{name}</AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <AppText className="mb-5 text-xs text-muted">{visibleTransactions.length} registros</AppText>

      {viewType === 'expense' ? (
        <>
          <AppText className="mb-3 font-body text-base">Por categoria</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5 mb-5"
            contentContainerClassName="gap-3 px-5"
          >
            {spendingCategories
              .filter(category => (byCategory[category] ?? 0) > 0)
              .sort((a, b) => (byCategory[b] ?? 0) - (byCategory[a] ?? 0))
              .map(category => (
                <View
                  key={category}
                  className="w-36 rounded-card border border-line bg-surface p-3 shadow-card"
                >
                  <MaterialCommunityIcons
                    name={categoryIcons[category]}
                    size={20}
                    color="#1E7055"
                  />
                  <AppText className="mt-2 text-xs text-muted">{categoryLabels[category]}</AppText>
                  <AppText className="mt-0.5 font-body text-sm">
                    {formatCurrency(byCategory[category] ?? 0)}
                  </AppText>
                </View>
              ))}
          </ScrollView>

          {budgetStatus.some(budget => budget.limit > 0) ? (
            <>
              <AppText className="mb-3 font-body text-base">Limites</AppText>
              {budgetStatus
                .filter(budget => budget.limit > 0)
                .map(budget => (
                  <View
                    key={budget.category}
                    className="mb-3 rounded-card border border-line bg-surface p-4"
                  >
                    <View className="mb-2 flex-row items-center justify-between">
                      <AppText className="text-sm">{categoryLabels[budget.category]}</AppText>
                      <AppText className="text-xs text-muted">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </AppText>
                    </View>
                    <ProgressBar
                      value={budget.percent}
                      color={budget.percent > 0.9 ? '#E96C5F' : '#1E7055'}
                    />
                  </View>
                ))}
            </>
          ) : null}
        </>
      ) : null}

      <AppText className="mb-3 mt-2 font-body text-base">Histórico</AppText>
      {visibleTransactions.length ? (
        visibleTransactions.map(transaction => (
          <SwipeToDelete key={transaction.id} onDelete={() => confirmRemove(transaction.id)}>
            <Pressable
              onPress={() => setEditingTransaction(transaction)}
              className="flex-row items-center rounded-card border border-line bg-surface p-3"
            >
              <View
                className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                  transaction.type === 'income' ? 'bg-positive' : 'bg-negative'
                }`}
              >
                <MaterialCommunityIcons
                  name={categoryIcons[transaction.category]}
                  size={18}
                  color={transaction.type === 'income' ? '#1E7055' : '#E96C5F'}
                />
              </View>
              <View className="flex-1">
                <AppText className="text-sm font-body">{transaction.title}</AppText>
                <AppText className="text-xs text-muted">
                  {categoryLabels[transaction.category]} · {formatShortDate(transaction.date)}
                </AppText>
                {transaction.responsible || transaction.purchaseLocation ? (
                  <AppText className="text-xs text-muted">
                    {[transaction.responsible, transaction.purchaseLocation]
                      .filter(Boolean)
                      .join(' · ')}
                  </AppText>
                ) : null}
                {transaction.installmentTotal ? (
                  <AppText className="text-xs text-lavender">
                    Parcela {transaction.installmentCurrent}/{transaction.installmentTotal}
                  </AppText>
                ) : null}
                {transaction.cardId ? <AppText className="text-xs text-sky">Cartão</AppText> : null}
              </View>
              <AppText
                className={`text-sm font-body ${
                  transaction.type === 'income' ? 'text-primaryDark' : 'text-coral'
                }`}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </AppText>
            </Pressable>
          </SwipeToDelete>
        ))
      ) : (
        <EmptyState
          emoji="R$"
          title="Nenhum registro ainda."
          subtitle="Use o botão + para adicionar."
        />
      )}

      <EditTransactionModal
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </ScrollView>
  );
}
