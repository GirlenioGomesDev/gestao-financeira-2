import { useMemo } from 'react';

import { useFinanceStore } from '@/store/useFinanceStore';
import { TransactionCategory } from '@/types/finance';
import { categoryLabels } from '@/utils/categories';
import { formatCurrency } from '@/utils/format';

export type InsightItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
  severity: 'good' | 'neutral' | 'warning';
};

const WEEK_DAYS = [
  'domingos',
  'segundas-feiras',
  'terças-feiras',
  'quartas-feiras',
  'quintas-feiras',
  'sextas-feiras',
  'sábados',
];

export function useSpendingInsights() {
  const transactions = useFinanceStore(state => state.transactions);
  const salary = useFinanceStore(state => state.salary);
  const goals = useFinanceStore(state => state.goals);

  return useMemo(() => {
    const now = new Date();
    const monthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
    const expenses = monthTransactions.filter(transaction => transaction.type === 'expense');
    const insights: InsightItem[] = [];

    const categoryTotals = expenses.reduce<Partial<Record<TransactionCategory, number>>>(
      (totals, transaction) => {
        totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
        return totals;
      },
      {},
    );
    const biggestCategory = (
      Object.entries(categoryTotals) as Array<[TransactionCategory, number]>
    ).sort((a, b) => b[1] - a[1])[0];
    if (biggestCategory) {
      insights.push({
        id: 'biggest-category',
        icon: 'chart-donut',
        title: 'Maior categoria',
        description: `Seu maior gasto este mês foi ${categoryLabels[biggestCategory[0]]}: ${formatCurrency(biggestCategory[1])}.`,
        severity: 'neutral',
      });
    }

    const weekdayTotals = expenses.reduce<number[]>(
      (totals, transaction) => {
        totals[new Date(transaction.date).getDay()] += transaction.amount;
        return totals;
      },
      Array(7).fill(0) as number[],
    );
    const busiestDay = weekdayTotals.indexOf(Math.max(...weekdayTotals));
    if (weekdayTotals[busiestDay] > 0) {
      insights.push({
        id: 'weekday-pattern',
        icon: 'calendar-week',
        title: 'Padrão da semana',
        description: `Você gasta mais nas ${WEEK_DAYS[busiestDay]}.`,
        severity: 'neutral',
      });
    }

    const installments = expenses
      .filter(
        transaction =>
          transaction.installmentTotal &&
          transaction.installmentCurrent &&
          transaction.installmentCurrent < transaction.installmentTotal,
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
    if (installments > 0) {
      insights.push({
        id: 'installments',
        icon: 'credit-card-clock-outline',
        title: 'Parcelas abertas',
        description: `Parcelas abertas comprometem ${formatCurrency(installments)}/mês.`,
        severity: installments > salary * 0.2 ? 'warning' : 'neutral',
      });
    }

    const mainGoal = goals.find(goal => (goal.monthlyAmount ?? 0) > 0);
    if (mainGoal?.monthlyAmount && mainGoal.savedAmount >= mainGoal.monthlyAmount) {
      insights.push({
        id: 'goal-track',
        icon: 'bullseye-arrow',
        title: 'Meta no ritmo',
        description: `Você está no ritmo certo para ${mainGoal.title}.`,
        severity: 'good',
      });
    }

    const subscriptions = categoryTotals.assinaturas ?? 0;
    if (salary > 0 && subscriptions / salary > 0.15) {
      insights.push({
        id: 'subscriptions',
        icon: 'calendar-sync',
        title: 'Assinaturas em alta',
        description: `Assinaturas representam ${Math.round((subscriptions / salary) * 100)}% da sua renda.`,
        severity: 'warning',
      });
    }

    return insights;
  }, [goals, salary, transactions]);
}
