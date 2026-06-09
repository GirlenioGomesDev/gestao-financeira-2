import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { MoneyCard } from '@/components/MoneyCard';
import { MonthClosingBanner } from '@/components/MonthClosingBanner';
import { NotebookChart } from '@/components/NotebookChart';
import { PaperScreen } from '@/components/PaperScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { AppText } from '@/components/Text';
import { TransactionModal } from '@/components/TransactionModal';
import { EditableField } from '@/components/EditableField';
import { useFinanceSummary } from '@/hooks/useFinanceSummary';
import { useSpendingInsights } from '@/hooks/useSpendingInsights';
import { useFinanceStore } from '@/store/useFinanceStore';
import { categoryIcons, categoryLabels } from '@/utils/categories';
import { formatAmount, formatCurrency, formatShortDate } from '@/utils/format';

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    balance,
    currentBalance,
    expenses,
    income,
    annualExpenses,
    annualIncome,
    salaryUsage,
    budgetStatus,
    monthlyEvolution,
    annualEvolution,
    cardUsage,
    forecast,
    alerts,
  } = useFinanceSummary();
  const insights = useSpendingInsights();
  const transactions = useFinanceStore(state => state.transactions);
  const goals = useFinanceStore(state => state.goals);
  const userName = useFinanceStore(state => state.userName);
  const setUserName = useFinanceStore(state => state.setUserName);
  const salary = useFinanceStore(state => state.salary);
  const setSalary = useFinanceStore(state => state.setSalary);
  const fixedQuote = useFinanceStore(state => state.fixedQuote);
  const motivationalQuotes = useFinanceStore(state => state.motivationalQuotes);
  const setFixedQuote = useFinanceStore(state => state.setFixedQuote);
  const updateGoal = useFinanceStore(state => state.updateGoal);
  const chartValues = transactions
    .filter(item => item.type === 'expense')
    .slice(0, 8)
    .reverse()
    .map(item => item.amount);
  const mainGoal = goals[0];

  return (
    <PaperScreen>
      <SectionHeader title="Meu Diario" subtitle="Um retrato simples do seu dinheiro hoje." />
      <MonthClosingBanner />
      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="text-sm text-muted">Ola,</AppText>
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

      <View className="mb-3 flex-row gap-3">
        <MoneyCard label="Entrou" value={income} tone="good" />
        <MoneyCard label="Saiu" value={expenses} tone="bad" />
      </View>
      <EditableField
        value={salary}
        type="currency"
        label="Salario mensal"
        displayStyle="card"
        onSave={value => setSalary(Number(value))}
      />
      <View className="mt-3 flex-row gap-3">
        <MoneyCard label="Saldo do mes" value={balance} tone={balance >= 0 ? 'good' : 'bad'} />
        <MoneyCard
          label="Saldo atual"
          value={currentBalance}
          tone={currentBalance >= 0 ? 'good' : 'bad'}
        />
      </View>

      <View className="my-5 rounded-paper border border-line bg-surface p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText className="font-body text-base">Salario usado</AppText>
          <AppText className="font-body text-base text-primaryDark">
            {Math.round(salaryUsage * 100)}%
          </AppText>
        </View>
        <ProgressBar value={salaryUsage} color={salaryUsage > 0.8 ? '#E96C5F' : '#2F8F6B'} />
        <AppText className="mt-3 text-sm text-muted">
          {salaryUsage > 0.8
            ? 'Atenção: este mes pede escolhas mais leves.'
            : 'Voce ainda tem folego para planejar com calma.'}
        </AppText>
      </View>

      <NotebookChart values={chartValues.length ? chartValues : [0, 0, 0]} />

      <View className="my-5 rounded-paper border border-line bg-surface p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText className="font-body text-lg">Dashboard financeiro</AppText>
          <Ionicons name="stats-chart-outline" size={20} color="#2F8F6B" />
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-paper bg-paper p-3">
            <AppText className="text-xs text-muted">Receitas do ano</AppText>
            <AppText className="mt-1 font-body">{formatCurrency(annualIncome)}</AppText>
          </View>
          <View className="flex-1 rounded-paper bg-paper p-3">
            <AppText className="text-xs text-muted">Despesas do ano</AppText>
            <AppText className="mt-1 font-body">{formatCurrency(annualExpenses)}</AppText>
          </View>
        </View>
        <AppText className="mb-2 mt-4 text-sm text-muted">Evolucao mensal</AppText>
        <NotebookChart values={monthlyEvolution.map(item => item.expenses)} />
        <AppText className="mb-2 mt-4 text-sm text-muted">Evolucao anual</AppText>
        <NotebookChart values={annualEvolution.map(item => item.expenses)} />
      </View>

      {alerts.length ? (
        <View className="mb-5 rounded-paper border border-coral bg-coral/10 p-4">
          <AppText className="mb-2 font-body text-lg text-coral">Alertas</AppText>
          {alerts.slice(0, 4).map(alert => (
            <View key={alert.id} className="mb-2 rounded-paper bg-surface p-3">
              <AppText className="font-body">{alert.title}</AppText>
              <AppText className="mt-1 text-sm text-muted">{alert.message}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      {insights.length ? (
        <View className="mb-5">
          <AppText className="mb-3 font-body text-lg">O que os seus números dizem</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {insights.map(insight => (
              <View
                key={insight.id}
                className={`w-64 rounded-paper border border-line border-l-4 bg-surface p-4 ${
                  insight.severity === 'good'
                    ? 'border-l-primaryDark'
                    : insight.severity === 'warning'
                      ? 'border-l-coral'
                      : 'border-l-sun'
                }`}
              >
                <MaterialCommunityIcons
                  name={insight.icon as MaterialIconName}
                  size={22}
                  color={
                    insight.severity === 'warning'
                      ? '#E96C5F'
                      : insight.severity === 'good'
                        ? '#2F8F6B'
                        : '#F5B84B'
                  }
                />
                <AppText className="mt-3 font-body">{insight.title}</AppText>
                <AppText className="mt-2 text-sm text-muted">{insight.description}</AppText>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View className="mb-5 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Cartoes</AppText>
        {cardUsage.map(card => (
          <View key={card.id} className="mb-3 rounded-paper bg-paper p-3">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText>{card.name}</AppText>
              <AppText className="text-sm text-muted">
                {formatCurrency(card.available)} livre
              </AppText>
            </View>
            <ProgressBar
              value={card.percent}
              color={card.percent > 0.85 ? '#E96C5F' : card.color}
            />
            <AppText className="mt-2 text-xs text-muted">
              Fecha dia {card.closingDay} - vence dia {card.dueDay}
            </AppText>
          </View>
        ))}
      </View>

      <View className="mb-5 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Previsao dos proximos meses</AppText>
        {forecast.map(item => (
          <View
            key={item.month}
            className="mb-2 flex-row items-center justify-between rounded-paper bg-paper p-3"
          >
            <AppText>{item.month}</AppText>
            <AppText className={item.balance >= 0 ? 'text-primaryDark' : 'text-coral'}>
              {formatCurrency(item.balance)}
            </AppText>
          </View>
        ))}
      </View>

      {mainGoal ? (
        <View className="my-5 rounded-paper border border-line bg-surface p-4">
          <AppText className="text-xs uppercase text-muted">Sonho em andamento</AppText>
          <EditableField
            value={mainGoal.title}
            type="text"
            displayStyle="title"
            onSave={value => updateGoal(mainGoal.id, { title: String(value) })}
          />
          <ProgressBar
            value={mainGoal.savedAmount / mainGoal.targetAmount}
            color={mainGoal.color}
          />
          <EditableField
            value={mainGoal.targetAmount}
            type="currency"
            displayStyle="subtitle"
            onSave={value => updateGoal(mainGoal.id, { targetAmount: Number(value) })}
          />
          <AppText className="mt-2 text-sm text-muted">
            {formatCurrency(mainGoal.savedAmount)} guardados
          </AppText>
        </View>
      ) : null}

      <View className="mb-5">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText className="font-body text-lg">Envelopes do mes</AppText>
          <Ionicons name="albums-outline" size={20} color="#2F8F6B" />
        </View>
        {budgetStatus.slice(0, 4).map(budget => (
          <View
            key={budget.category}
            className="mb-3 rounded-paper border border-line bg-surface p-3"
          >
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="ellipse"
                  size={8}
                  color={budget.percent > 0.9 ? '#E96C5F' : '#2F8F6B'}
                />
                <AppText className="ml-2">{categoryLabels[budget.category]}</AppText>
              </View>
              <AppText className="text-sm text-muted">{formatCurrency(budget.spent)}</AppText>
            </View>
            <ProgressBar
              value={budget.percent}
              color={budget.percent > 0.9 ? '#E96C5F' : '#2F8F6B'}
            />
          </View>
        ))}
      </View>

      <View className="mb-4 flex-row items-center justify-between">
        <AppText className="font-body text-lg">Ultimos registros</AppText>
        <PrimaryButton
          label="Adicionar"
          icon="add"
          className="min-h-10 px-3"
          onPress={() => setModalVisible(true)}
        />
      </View>
      {transactions.slice(0, 4).map(transaction => (
        <Pressable
          key={transaction.id}
          className="mb-3 flex-row items-center rounded-paper border border-line bg-surface p-3"
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
            <AppText className="text-xs text-muted">{formatShortDate(transaction.date)}</AppText>
          </View>
          <AppText className={transaction.type === 'income' ? 'text-primaryDark' : 'text-coral'}>
            {formatAmount(transaction.amount, transaction.type)}
          </AppText>
        </Pressable>
      ))}

      <TransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </PaperScreen>
  );
}
