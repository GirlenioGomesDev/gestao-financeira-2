import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mmkvZustandStorage } from "@/lib/mmkvStorage";
import {
  CreditCard,
  BudgetEnvelope,
  Category,
  DiaryEntry,
  FinancialAccount,
  Goal,
  Habit,
  InvoiceImport,
  RecurringEntry,
  Transaction,
  TransactionCategory
} from "@/types/finance";
import { uid } from "@/utils/format";

const today = new Date().toISOString();

type FinanceState = {
  salary: number;
  transactions: Transaction[];
  goals: Goal[];
  habits: Habit[];
  diary: DiaryEntry[];
  budgets: BudgetEnvelope[];
  userName: string;
  profileGoalText: string;
  objectiveText: string;
  categories: Category[];
  motivationalQuotes: string[];
  fixedQuote: string | null;
  invoiceImports: InvoiceImport[];
  accounts: FinancialAccount[];
  creditCards: CreditCard[];
  recurringEntries: RecurringEntry[];
  setSalary: (salary: number) => void;
  setUserName: (userName: string) => void;
  setProfileGoalText: (profileGoalText: string) => void;
  setObjectiveText: (objectiveText: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  addTransactions: (transactions: Array<Omit<Transaction, "id">>) => string[];
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  reorderGoals: (newOrder: Goal[]) => void;
  contributeToGoal: (id: string, amount: number) => void;
  toggleHabit: (id: string) => void;
  addDiaryEntry: (entry: Omit<DiaryEntry, "id">) => void;
  updateDiaryEntry: (id: string, data: Partial<DiaryEntry>) => void;
  setBudget: (category: TransactionCategory, limit: number) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string, replacementId: TransactionCategory) => void;
  addMotivationalQuote: (quote: string) => void;
  updateMotivationalQuote: (index: number, quote: string) => void;
  deleteMotivationalQuote: (index: number) => void;
  setFixedQuote: (quote: string | null) => void;
  addInvoiceImport: (invoiceImport: InvoiceImport) => void;
  undoInvoiceImport: (importId: string) => void;
  addAccount: (account: Omit<FinancialAccount, "id">) => void;
  updateAccount: (id: string, data: Partial<FinancialAccount>) => void;
  addCreditCard: (card: Omit<CreditCard, "id">) => void;
  updateCreditCard: (id: string, data: Partial<CreditCard>) => void;
  addRecurringEntry: (entry: Omit<RecurringEntry, "id">) => void;
  updateRecurringEntry: (id: string, data: Partial<RecurringEntry>) => void;
  resetDemoData: () => void;
};

const demoTransactions: Transaction[] = [
  { id: "t-1", type: "income", title: "Salario", amount: 2800, category: "renda", date: today },
  { id: "t-2", type: "expense", title: "Aluguel", amount: 900, category: "moradia", date: today },
  { id: "t-3", type: "expense", title: "Compra do mes", amount: 520, category: "mercado", date: today },
  { id: "t-4", type: "expense", title: "Passagens", amount: 128, category: "transporte", date: today },
  { id: "t-5", type: "expense", title: "Conta de luz", amount: 146.8, category: "contas", date: today }
];

const demoGoals: Goal[] = [
  { id: "g-1", title: "Reserva de emergencia", targetAmount: 3000, savedAmount: 740, color: "#2F8F6B", emoji: "R$", monthlyAmount: 150, kind: "goal" },
  { id: "g-2", title: "Material escolar", targetAmount: 850, savedAmount: 260, color: "#F5B84B", emoji: "OK", monthlyAmount: 80, kind: "goal" },
  { id: "g-3", title: "Viagem para ver a familia", targetAmount: 1200, savedAmount: 310, color: "#7DB7D9", emoji: "+", monthlyAmount: 120, kind: "goal" }
];

const demoHabits: Habit[] = [
  { id: "h-1", title: "Anotar gastos do dia", streak: 4, doneToday: false, emoji: "R$" },
  { id: "h-2", title: "Conferir saldo antes de comprar", streak: 2, doneToday: true, emoji: "OK" },
  { id: "h-3", title: "Guardar um pouquinho", streak: 1, doneToday: false, emoji: "+" }
];

const demoBudgets: BudgetEnvelope[] = [
  { category: "moradia", limit: 1000 },
  { category: "mercado", limit: 700 },
  { category: "alimentacao", limit: 360 },
  { category: "transporte", limit: 220 },
  { category: "contas", limit: 360 },
  { category: "assinaturas", limit: 90 },
  { category: "lazer", limit: 160 }
];

const demoDiary: DiaryEntry[] = [
  {
    id: "d-1",
    date: today,
    mood: "tranquilo",
    text: "Comecei a semana olhando o dinheiro com calma. Uma escolha pequena por dia ja ajuda."
  }
];

const demoCategories: Category[] = [
  { id: "moradia", name: "Moradia", icon: "home-heart", color: "#2F8F6B", type: "expense" },
  { id: "mercado", name: "Mercado", icon: "cart-outline", color: "#F5B84B", type: "expense" },
  { id: "transporte", name: "Transporte", icon: "bus", color: "#7DB7D9", type: "expense" },
  { id: "contas", name: "Contas", icon: "file-document-outline", color: "#9A86C8", type: "expense" },
  { id: "saude", name: "Saude", icon: "heart-pulse", color: "#E96C5F", type: "expense" },
  { id: "lazer", name: "Lazer", icon: "party-popper", color: "#F5B84B", type: "expense" },
  { id: "educacao", name: "Educacao", icon: "school-outline", color: "#7DB7D9", type: "expense" },
  { id: "alimentacao", name: "Alimentacao", icon: "food-fork-drink", color: "#E96C5F", type: "expense" },
  { id: "compras", name: "Compras", icon: "shopping-outline", color: "#F5B84B", type: "expense" },
  { id: "assinaturas", name: "Assinaturas", icon: "calendar-sync", color: "#9A86C8", type: "expense" },
  { id: "investimentos", name: "Investimentos", icon: "chart-line", color: "#2F8F6B", type: "expense" },
  { id: "renda", name: "Renda", icon: "cash-plus", color: "#2F8F6B", type: "income" },
  { id: "outros", name: "Outros", icon: "dots-horizontal-circle-outline", color: "#7B7167", type: "expense" }
];

const demoAccounts: FinancialAccount[] = [
  { id: "acc-1", name: "Conta corrente", kind: "checking", balance: 820, color: "#2F8F6B" },
  { id: "acc-2", name: "Poupanca", kind: "savings", balance: 740, color: "#7DB7D9" },
  { id: "acc-3", name: "Dinheiro", kind: "cash", balance: 120, color: "#F5B84B" }
];

const demoCreditCards: CreditCard[] = [
  { id: "card-1", name: "Cartao principal", bank: "Nubank", totalLimit: 1800, closingDay: 20, dueDay: 28, color: "#9A86C8" }
];

const demoRecurringEntries: RecurringEntry[] = [
  { id: "rec-1", title: "Salario", amount: 2800, type: "income", category: "renda", day: 5, active: true },
  { id: "rec-2", title: "Aluguel", amount: 900, type: "expense", category: "moradia", day: 10, active: true },
  { id: "rec-3", title: "Internet", amount: 99.9, type: "expense", category: "contas", day: 12, active: true }
];

const demoQuotes = [
  "Uma escolha pequena por dia tambem muda o mes.",
  "Organizar nao e se cobrar. E se cuidar.",
  "Dinheiro com destino vira plano, nao peso."
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      salary: 2800,
      transactions: demoTransactions,
      goals: demoGoals,
      habits: demoHabits,
      diary: demoDiary,
      budgets: demoBudgets,
      userName: "Familia",
      profileGoalText: "Minha meta: fechar o mes no azul",
      objectiveText: "Meu objetivo: guardar um pouco sem perder a paz",
      categories: demoCategories,
      motivationalQuotes: demoQuotes,
      fixedQuote: null,
      invoiceImports: [],
      accounts: demoAccounts,
      creditCards: demoCreditCards,
      recurringEntries: demoRecurringEntries,
      setSalary: (salary) => set({ salary }),
      setUserName: (userName) => set({ userName }),
      setProfileGoalText: (profileGoalText) => set({ profileGoalText }),
      setObjectiveText: (objectiveText) => set({ objectiveText }),
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [{ ...transaction, id: uid("t") }, ...state.transactions] })),
      addTransactions: (transactions) => {
        const ids = transactions.map(() => uid("t"));
        set((state) => ({
          transactions: [
            ...transactions.map((transaction, index) => ({ ...transaction, id: ids[index] })),
            ...state.transactions
          ]
        }));
        return ids;
      },
      updateTransaction: (id, data) =>
        set((state) => ({
          transactions: state.transactions.map((transaction) => (transaction.id === id ? { ...transaction, ...data } : transaction))
        })),
      removeTransaction: (id) =>
        set((state) => ({ transactions: state.transactions.filter((transaction) => transaction.id !== id) })),
      addGoal: (goal) => set((state) => ({ goals: [{ ...goal, id: uid("g") }, ...state.goals] })),
      updateGoal: (id, data) =>
        set((state) => ({ goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...data } : goal)) })),
      removeGoal: (id) => set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) })),
      reorderGoals: (newOrder) => set({ goals: newOrder }),
      contributeToGoal: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, savedAmount: Math.min(goal.targetAmount, goal.savedAmount + amount) } : goal
          )
        })),
      toggleHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) {
              return habit;
            }

            return {
              ...habit,
              doneToday: !habit.doneToday,
              streak: habit.doneToday ? Math.max(0, habit.streak - 1) : habit.streak + 1
            };
          })
        })),
      addDiaryEntry: (entry) => set((state) => ({ diary: [{ ...entry, id: uid("d") }, ...state.diary] })),
      updateDiaryEntry: (id, data) =>
        set((state) => ({ diary: state.diary.map((entry) => (entry.id === id ? { ...entry, ...data } : entry)) })),
      setBudget: (category, limit) =>
        set((state) => ({
          budgets: state.budgets.some((budget) => budget.category === category)
            ? state.budgets.map((budget) => (budget.category === category ? { ...budget, limit } : budget))
            : [...state.budgets, { category, limit }]
        })),
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, data) =>
        set((state) => ({
          categories: state.categories.map((category) => (category.id === id ? { ...category, ...data } : category))
        })),
      deleteCategory: (id, replacementId) =>
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          transactions: state.transactions.map((transaction) =>
            transaction.category === id ? { ...transaction, category: replacementId } : transaction
          )
        })),
      addMotivationalQuote: (quote) => set((state) => ({ motivationalQuotes: [...state.motivationalQuotes, quote] })),
      updateMotivationalQuote: (index, quote) =>
        set((state) => ({
          motivationalQuotes: state.motivationalQuotes.map((item, itemIndex) => (itemIndex === index ? quote : item))
        })),
      deleteMotivationalQuote: (index) =>
        set((state) => ({ motivationalQuotes: state.motivationalQuotes.filter((_, itemIndex) => itemIndex !== index) })),
      setFixedQuote: (quote) => set({ fixedQuote: quote }),
      addInvoiceImport: (invoiceImport) =>
        set((state) => ({ invoiceImports: [invoiceImport, ...state.invoiceImports] })),
      undoInvoiceImport: (importId) =>
        set((state) => ({
          invoiceImports: state.invoiceImports.filter((item) => item.id !== importId),
          transactions: state.transactions.filter((transaction) => transaction.invoiceImportId !== importId)
        })),
      addAccount: (account) => set((state) => ({ accounts: [{ ...account, id: uid("acc") }, ...state.accounts] })),
      updateAccount: (id, data) =>
        set((state) => ({ accounts: state.accounts.map((account) => (account.id === id ? { ...account, ...data } : account)) })),
      addCreditCard: (card) => set((state) => ({ creditCards: [{ ...card, id: uid("card") }, ...state.creditCards] })),
      updateCreditCard: (id, data) =>
        set((state) => ({ creditCards: state.creditCards.map((card) => (card.id === id ? { ...card, ...data } : card)) })),
      addRecurringEntry: (entry) =>
        set((state) => ({ recurringEntries: [{ ...entry, id: uid("rec") }, ...state.recurringEntries] })),
      updateRecurringEntry: (id, data) =>
        set((state) => ({
          recurringEntries: state.recurringEntries.map((entry) => (entry.id === id ? { ...entry, ...data } : entry))
        })),
      resetDemoData: () =>
        set({
          salary: 2800,
          transactions: demoTransactions,
          goals: demoGoals,
          habits: demoHabits,
          diary: demoDiary,
          budgets: demoBudgets,
          userName: "Familia",
          profileGoalText: "Minha meta: fechar o mes no azul",
          objectiveText: "Meu objetivo: guardar um pouco sem perder a paz",
          categories: demoCategories,
          motivationalQuotes: demoQuotes,
          fixedQuote: null,
          invoiceImports: [],
          accounts: demoAccounts,
          creditCards: demoCreditCards,
          recurringEntries: demoRecurringEntries
        })
    }),
    {
      name: "finance-store-v1",
      storage: createJSONStorage(() => mmkvZustandStorage),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<FinanceState>),
        categories: (persisted as Partial<FinanceState>)?.categories?.length ? (persisted as Partial<FinanceState>).categories! : demoCategories,
        accounts: (persisted as Partial<FinanceState>)?.accounts?.length ? (persisted as Partial<FinanceState>).accounts! : demoAccounts,
        creditCards: (persisted as Partial<FinanceState>)?.creditCards?.length ? (persisted as Partial<FinanceState>).creditCards! : demoCreditCards,
        recurringEntries: (persisted as Partial<FinanceState>)?.recurringEntries?.length
          ? (persisted as Partial<FinanceState>).recurringEntries!
          : demoRecurringEntries
      })
    }
  )
);
