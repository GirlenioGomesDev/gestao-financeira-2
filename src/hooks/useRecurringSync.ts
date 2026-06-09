import { useEffect, useRef } from 'react';

import { useFinanceStore } from '@/store/useFinanceStore';

export function useRecurringSync() {
  const hasHydrated = useFinanceStore(state => state._hasHydrated);
  const ranRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    if (ranRef.current === monthKey) return;
    ranRef.current = monthKey;

    const { recurringEntries, transactions, addTransaction } = useFinanceStore.getState();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    for (const entry of recurringEntries) {
      if (!entry.active) continue;

      const entryDate = new Date(currentYear, currentMonth, Math.min(entry.day, 28), 12);
      const alreadyExists = transactions.some(
        transaction =>
          transaction.title === entry.title &&
          transaction.amount === entry.amount &&
          transaction.type === entry.type &&
          new Date(transaction.date).getFullYear() === currentYear &&
          new Date(transaction.date).getMonth() === currentMonth,
      );

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
  }, [hasHydrated]);
}
