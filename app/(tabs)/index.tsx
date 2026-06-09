import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { EditableField } from '@/components/EditableField';
import { MonthClosingBanner } from '@/components/MonthClosingBanner';
import { NotebookChart } from '@/components/NotebookChart';
import { ProgressBar } from '@/components/ProgressBar';
import { AppText, DisplayText } from '@/components/Text';
import { useFinanceSummary } from '@/hooks/useFinanceSummary';
import { useSpendingInsights } from '@/hooks/useSpendingInsights';
import { useFinanceStore } from '@/store/useFinanceStore';
import { categoryIcons, categoryLabels } from '@/utils/categories';
import { formatAmount, formatCurrency, formatShortDate } from '@/utils/format';

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function HomeScreen() {
  const { balance, expenses, income, salaryUsage, forecast, monthlyEvolution } =
    useFinanceSummary();
  const insights = useSpendingInsights();
  const transactions = useFinanceStore(state => state.transactions);
  const userName = useFinanceStore(state => state.userName);
  const setUserName = useFinanceStore(state => state.setUserName);
  const fixedQuote = useFinanceStore(state => state.fixedQuote);
  const motivationalQuotes = useFinanceStore(state => state.motivationalQuotes);
  const setFixedQuote = useFinanceStore(state => state.setFixedQuote);
  const salary = useFinanceStore(state => state.salary);
  const setSalary = useFinanceStore(state => state.setSalary);

  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);
  const upcomingInstallments = transactions
    .filter(transaction => {
      if (!transaction.installmentTotal || !transaction.installmentCurrent) return false;
      const date = new Date(transaction.date);
      return date >= today && date <= in30Days;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  const weekSpend = weekDays.map(day =>
    transactions
      .filter(
        transaction =>
          transaction.type === 'expense' &&
          new Date(transaction.date).toDateString() === day.toDateString(),
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );
  const dayLabels = weekDays.map(day =>
    new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow' }).format(day).toUpperCase(),
  );
  const greeting =
    today.getHours() < 12 ? 'Bom dia' : today.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerClassName="px-5 pb-32 pt-14"
      showsVerticalScrollIndicator={false}
    >
      <MonthClosingBanner />

      <View className="mb-6 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <AppText className="text-sm text-muted">{greeting},</AppText>
          <EditableField
            value={userName}
            type="text"
            displayStyle="title"
            onSave={value => setUserName(String(value))}
          />
          <EditableField
            value={fixedQuote ?? motivationalQuotes[0] ?? ''}
            type="multiline"
            displayStyle="subtitle"
            onSave={value => setFixedQuote(String(value))}
          />
        </View>
        <Pressable
          onPress={() => router.push('/ajustes')}
          className="h-11 w-11 items-center justify-center rounded-full border border-line bg-surface"
        >
          <Ionicons name="settings-outline" size={21} color="#1E7055" />
        </Pressable>
      </View>

      <View className="mb-6 overflow-hidden rounded-card bg-ink p-5">
        <AppText className="mb-4 text-xs uppercase tracking-wider text-white/50">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(today)}
        </AppText>
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1">
            <AppText className="mb-1 text-xs text-white/50">Receitas</AppText>
            <DisplayText className="text-xl text-white">{formatCurrency(income)}</DisplayText>
          </View>
          <View className="flex-1">
            <AppText className="mb-1 text-xs text-white/50">Gastos</AppText>
            <DisplayText className="text-xl text-coral">{formatCurrency(expenses)}</DisplayText>
          </View>
        </View>
        <View className="rounded-xl bg-white/10 p-3">
          <AppText className="mb-1 text-xs text-white/50">Saldo do mês</AppText>
          <DisplayText className={`text-3xl ${balance >= 0 ? 'text-white' : 'text-coral'}`}>
            {formatCurrency(balance)}
          </DisplayText>
        </View>
      </View>

      <View className="mb-6 rounded-card border border-line bg-surface p-4 shadow-card">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText className="font-body text-base">Últimos 7 dias</AppText>
          <AppText className="text-xs text-muted">
            {formatCurrency(weekSpend.reduce((sum, value) => sum + value, 0))}
          </AppText>
        </View>
        <NotebookChart values={weekSpend} />
        <View className="mt-1 flex-row gap-1">
          {dayLabels.map((label, index) => (
            <AppText key={`${label}-${index}`} className="flex-1 text-center text-[9px] text-muted">
              {label}
            </AppText>
          ))}
        </View>
      </View>

      <View className="mb-6 rounded-card border border-line bg-surface p-4 shadow-card">
        <View className="mb-2 flex-row items-center justify-between">
          <AppText className="text-sm text-muted">Salário comprometido</AppText>
          <AppText
            className={`font-body text-sm ${salaryUsage > 0.8 ? 'text-coral' : 'text-primaryDark'}`}
          >
            {Math.round(salaryUsage * 100)}%
          </AppText>
        </View>
        <ProgressBar value={salaryUsage} color={salaryUsage > 0.8 ? '#E96C5F' : '#1E7055'} />
        <View className="mt-3 flex-row items-center justify-between">
          <AppText className="flex-1 text-xs text-muted">
            {salaryUsage > 0.8 ? 'Atenção: mês pesado.' : 'Você ainda tem fôlego.'}
          </AppText>
          <EditableField
            value={salary}
            type="currency"
            displayStyle="subtitle"
            onSave={value => setSalary(Number(value))}
          />
        </View>
      </View>

      <View className="mb-6 rounded-card border border-line bg-surface p-4 shadow-card">
        <AppText className="mb-3 font-body text-base">Evolução dos últimos meses</AppText>
        <NotebookChart values={monthlyEvolution.map(month => month.expenses)} />
      </View>

      {insights.length > 0 ? (
        <View className="mb-6">
          <AppText className="mb-3 font-body text-base">O que os números dizem</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5"
            contentContainerClassName="gap-3 px-5"
          >
            {insights.map(insight => (
              <View
                key={insight.id}
                className="w-52 rounded-card border border-line bg-surface p-4 shadow-card"
              >
                <MaterialCommunityIcons
                  name={insight.icon as MaterialIconName}
                  size={22}
                  color={
                    insight.severity === 'warning'
                      ? '#E96C5F'
                      : insight.severity === 'good'
                        ? '#1E7055'
                        : '#9A86C8'
                  }
                />
                <AppText className="mt-3 font-body text-sm">{insight.title}</AppText>
                <AppText className="mt-1 text-xs text-muted">{insight.description}</AppText>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {upcomingInstallments.length > 0 ? (
        <View className="mb-6">
          <AppText className="mb-3 font-body text-base">Próximas parcelas</AppText>
          {upcomingInstallments.map(transaction => (
            <View
              key={transaction.id}
              className="mb-2 flex-row items-center rounded-card border border-line bg-surface p-3"
            >
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-warning">
                <Ionicons name="calendar-outline" size={17} color="#9A6A10" />
              </View>
              <View className="flex-1">
                <AppText className="text-sm font-body">{transaction.title}</AppText>
                <AppText className="text-xs text-muted">
                  {formatShortDate(transaction.date)}
                </AppText>
              </View>
              <AppText className="text-sm text-coral">{formatCurrency(transaction.amount)}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mb-3 flex-row items-center justify-between">
        <AppText className="font-body text-base">Últimos lançamentos</AppText>
        <Pressable onPress={() => router.push('/gastos')}>
          <AppText className="text-sm text-primaryDark">Ver todos</AppText>
        </Pressable>
      </View>
      {transactions.slice(0, 5).map(transaction => (
        <Pressable
          key={transaction.id}
          onPress={() => router.push('/gastos')}
          className="mb-2 flex-row items-center rounded-card border border-line bg-surface p-3"
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
          </View>
          <AppText
            className={`text-sm ${transaction.type === 'income' ? 'text-primaryDark' : 'text-coral'}`}
          >
            {formatAmount(transaction.amount, transaction.type)}
          </AppText>
        </Pressable>
      ))}

      <View className="mt-4 rounded-card border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-base">Previsão</AppText>
        {forecast.map(item => (
          <View key={item.month} className="mb-2 flex-row items-center justify-between">
            <AppText className="text-sm text-muted">{item.month}</AppText>
            <AppText className={item.balance >= 0 ? 'text-primaryDark' : 'text-coral'}>
              {formatCurrency(item.balance)}
            </AppText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
