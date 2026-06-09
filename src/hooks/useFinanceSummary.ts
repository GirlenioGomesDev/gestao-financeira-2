import { useMemo } from 'react';

import { useFinanceStore } from '@/store/useFinanceStore';
import { FinancialAlert, TransactionCategory } from '@/types/finance';

export function useFinanceSummary() {
  const transactions = useFinanceStore(state => state.transactions);
  const salary = useFinanceStore(state => state.salary);
  const budgets = useFinanceStore(state => state.budgets);
  const accounts = useFinanceStore(state => state.accounts);
  const creditCards = useFinanceStore(state => state.creditCards);
  const recurringEntries = useFinanceStore(state => state.recurringEntries);
  const goals = useFinanceStore(state => state.goals);

  return useMemo(() => {
    const now = new Date();
    const currentMonthKey = monthKey(now);
    const currentYear = now.getFullYear();
    const monthTransactions = transactions.filter(
      item => monthKey(new Date(item.date)) === currentMonthKey,
    );
    const yearTransactions = transactions.filter(
      item => new Date(item.date).getFullYear() === currentYear,
    );
    const income = sumByType(monthTransactions, 'income');
    const expenses = sumByType(monthTransactions, 'expense');
    const annualIncome = sumByType(yearTransactions, 'income');
    const annualExpenses = sumByType(yearTransactions, 'expense');
    const accountBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const balance = income - expenses;
    const currentBalance = accountBalance + balance;
    const salaryUsage = salary > 0 ? expenses / salary : 0;
    const byCategory = monthTransactions
      .filter(item => item.type === 'expense')
      .reduce<Record<TransactionCategory, number>>(
        (acc, item) => {
          acc[item.category] = (acc[item.category] ?? 0) + item.amount;
          return acc;
        },
        {} as Record<TransactionCategory, number>,
      );

    const budgetStatus = budgets.map(budget => ({
      ...budget,
      spent: byCategory[budget.category] ?? 0,
      percent:
        budget.limit > 0 ? Math.min(1, (byCategory[budget.category] ?? 0) / budget.limit) : 0,
    }));

    const monthlyEvolution = buildMonthlyEvolution(transactions, 6);
    const annualEvolution = buildAnnualEvolution(transactions, 3);
    const cardUsage = creditCards.map(card => {
      const spent = monthTransactions
        .filter(
          item =>
            item.type === 'expense' && (item.cardId === card.id || item.sourceBank === card.bank),
        )
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        ...card,
        spent,
        available: Math.max(0, card.totalLimit - spent),
        percent: card.totalLimit > 0 ? spent / card.totalLimit : 0,
      };
    });
    const forecast = Array.from({ length: 3 }).map((_, offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
      const recurringIncome = recurringEntries
        .filter(item => item.active && item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);
      const recurringExpenses = recurringEntries
        .filter(item => item.active && item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
      const installments = transactions
        .filter(
          item =>
            item.installmentTotal &&
            item.installmentCurrent &&
            item.installmentCurrent + offset < item.installmentTotal,
        )
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        month: monthKey(date),
        income: recurringIncome,
        expenses: recurringExpenses + installments,
        balance: recurringIncome - recurringExpenses - installments,
      };
    });
    const alerts: FinancialAlert[] = [
      ...budgetStatus
        .filter(budget => budget.percent >= 0.9)
        .map(
          budget =>
            ({
              id: `budget-${budget.category}`,
              title: 'Gasto acima do planejado',
              message: `${budget.category} ja usou ${Math.round(budget.percent * 100)}% do combinado.`,
              severity: budget.percent >= 1 ? 'danger' : 'warning',
            }) as FinancialAlert,
        ),
      ...cardUsage
        .filter(card => card.percent >= 0.85)
        .map(
          card =>
            ({
              id: `card-${card.id}`,
              title: 'Limite do cartao quase atingido',
              message: `${card.name} tem ${Math.round(card.percent * 100)}% do limite usado.`,
              severity: card.percent >= 1 ? 'danger' : 'warning',
            }) as FinancialAlert,
        ),
      ...goals
        .filter(
          goal =>
            goal.monthlyAmount &&
            goal.targetAmount > 0 &&
            goal.savedAmount / goal.targetAmount < 0.35,
        )
        .slice(0, 2)
        .map(
          goal =>
            ({
              id: `goal-${goal.id}`,
              title: 'Meta precisa de atencao',
              message: `${goal.title} ainda esta no comeco. Confira o aporte mensal.`,
              severity: 'info',
            }) as FinancialAlert,
        ),
    ];

    return {
      income,
      expenses,
      balance,
      currentBalance,
      annualIncome,
      annualExpenses,
      salaryUsage,
      byCategory,
      budgetStatus,
      monthlyEvolution,
      annualEvolution,
      cardUsage,
      forecast,
      alerts,
    };
  }, [transactions, salary, budgets, accounts, creditCards, recurringEntries, goals]);
}

function sumByType(
  items: { type: 'income' | 'expense'; amount: number }[],
  type: 'income' | 'expense',
) {
  return items.filter(item => item.type === type).reduce((sum, item) => sum + item.amount, 0);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthlyEvolution(
  transactions: { date: string; type: 'income' | 'expense'; amount: number }[],
  months: number,
) {
  const now = new Date();
  return Array.from({ length: months }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    const key = monthKey(date);
    const items = transactions.filter(item => monthKey(new Date(item.date)) === key);
    return {
      month: key,
      income: sumByType(items, 'income'),
      expenses: sumByType(items, 'expense'),
    };
  });
}

function buildAnnualEvolution(
  transactions: { date: string; type: 'income' | 'expense'; amount: number }[],
  years: number,
) {
  const now = new Date();
  return Array.from({ length: years }).map((_, index) => {
    const year = now.getFullYear() - (years - index - 1);
    const items = transactions.filter(item => new Date(item.date).getFullYear() === year);
    return { year, income: sumByType(items, 'income'), expenses: sumByType(items, 'expense') };
  });
}
