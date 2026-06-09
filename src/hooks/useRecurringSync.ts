import { useEffect } from 'react';

import { useFinanceStore } from '@/store/useFinanceStore';

export function useRecurringSync() {
  const recurringEntries = useFinanceStore(state => state.recurringEntries);
  const transactions = useFinanceStore(state => state.transactions);
  const addTransaction = useFinanceStore(state => state.addTransaction);
  const hasHydrated = useFinanceStore(state => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    for (const entry of recurringEntries) {
      if (!entry.active) continue;

      const entryDate = new Date(currentYear, currentMonth, Math.min(entry.day, 28), 12);
      const alreadyExists = transactions.some(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.title === entry.title &&
          transaction.amount === entry.amount &&
          transaction.type === entry.type &&
          transactionDate.getFullYear() === currentYear &&
          transactionDate.getMonth() === currentMonth
        );
      });

      if (!alreadyExists) {
        addTransaction({
          type: entry.type,
          title: entry.title,
          amount: entry.amount,
          category: entry.category,
          date: entryDate.toISOString(),
          note: 'Lançamento automático',
        });
      }
    }
  }, [addTransaction, hasHydrated, recurringEntries, transactions]);
}
