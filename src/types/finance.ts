export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "moradia"
  | "mercado"
  | "transporte"
  | "contas"
  | "saude"
  | "lazer"
  | "educacao"
  | "alimentacao"
  | "compras"
  | "assinaturas"
  | "investimentos"
  | "renda"
  | "outros";

export type Transaction = {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  note?: string;
  invoiceImportId?: string;
  sourceBank?: string;
  installmentCurrent?: number | null;
  installmentTotal?: number | null;
  cardId?: string;
  accountId?: string;
  duplicateOf?: string;
};

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  dueDate?: string;
  color: string;
  emoji?: string;
  monthlyAmount?: number;
  kind?: "goal" | "dream";
};

export type Habit = {
  id: string;
  title: string;
  streak: number;
  doneToday: boolean;
  emoji: string;
};

export type DiaryEntry = {
  id: string;
  date: string;
  mood: "tranquilo" | "apertado" | "animado" | "alerta";
  text: string;
};

export type BudgetEnvelope = {
  category: TransactionCategory;
  limit: number;
};

export type Category = {
  id: TransactionCategory | string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export type InvoiceSource = "ocr" | "pdf" | "csv" | "manual";

export type InvoiceImport = {
  id: string;
  bank: string;
  referenceMonth: string;
  totalAmount: number;
  transactionCount: number;
  importedAt: string;
  source: InvoiceSource;
  transactions: string[];
  originalFileName?: string;
  ignoredCount?: number;
};

export type ParsedInvoiceTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  ignored?: boolean;
  installmentCurrent?: number | null;
  installmentTotal?: number | null;
  bank?: string;
  rawLine?: string;
  duplicateOf?: string | null;
  confidence?: number;
};

export type ParsedInvoice = {
  bank: string;
  referenceMonth: string;
  dueDate?: string;
  totalAmount: number;
  source: InvoiceSource;
  transactions: ParsedInvoiceTransaction[];
  warnings?: string[];
  rawText?: string;
};

export type AccountKind = "checking" | "savings" | "cash" | "wallet";

export type FinancialAccount = {
  id: string;
  name: string;
  kind: AccountKind;
  balance: number;
  color: string;
};

export type CreditCard = {
  id: string;
  name: string;
  bank: string;
  totalLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
};

export type RecurringEntry = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  day: number;
  active: boolean;
};

export type FinancialAlert = {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
};
