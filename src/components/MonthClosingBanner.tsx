import { View } from 'react-native';

import { AppText } from '@/components/Text';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/format';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function MonthClosingBanner() {
  const transactions = useFinanceStore(state => state.transactions);
  const salary = useFinanceStore(state => state.salary);
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const showPreviousMonth = now.getDate() <= 3;
  const shouldShow = showPreviousMonth || now.getDate() > lastDay - 5;

  if (!shouldShow) return null;

  const targetDate = showPreviousMonth
    ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const items = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return (
      date.getFullYear() === targetDate.getFullYear() && date.getMonth() === targetDate.getMonth()
    );
  });
  const income = items
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = items
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const balance = income - expenses;
  const sentence =
    balance > 0
      ? 'Fechou no azul! Que mês bem cuidado.'
      : Math.abs(balance) <= salary * 0.2
        ? 'Mês apertado, mas você passou.'
        : 'Atenção: esse mês pediu mais do que entrou.';

  return (
    <View
      className={`mb-4 rounded-paper border-2 p-5 ${
        balance >= 0 ? 'border-primaryDark bg-primary/10' : 'border-coral bg-coral/10'
      }`}
    >
      <AppText className="font-body text-lg">
        Fechamento de {MONTHS[targetDate.getMonth()]} {targetDate.getFullYear()}
      </AppText>
      <View className="mt-3 flex-row gap-3">
        <View className="flex-1">
          <AppText className="text-xs text-muted">Receitas</AppText>
          <AppText className="mt-1 text-primaryDark">{formatCurrency(income)}</AppText>
        </View>
        <View className="flex-1">
          <AppText className="text-xs text-muted">Despesas</AppText>
          <AppText className="mt-1 text-coral">{formatCurrency(expenses)}</AppText>
        </View>
      </View>
      <AppText className={`mt-3 font-body ${balance >= 0 ? 'text-primaryDark' : 'text-coral'}`}>
        Saldo: {formatCurrency(balance)}
      </AppText>
      <AppText className="mt-2 text-sm text-muted">{sentence}</AppText>
    </View>
  );
}
