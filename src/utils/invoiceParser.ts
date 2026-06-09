import {
  InvoiceSource,
  ParsedInvoice,
  ParsedInvoiceTransaction,
  TransactionType,
} from '@/types/finance';
import { categorizeLocal } from '@/utils/categorizer';
import { uid } from '@/utils/format';

type BankInfo = { name: string; keywords: string[] };

const BANK_PATTERNS: BankInfo[] = [
  { name: 'Nubank', keywords: ['nubank', 'nu pagamentos', 'nu pag'] },
  { name: 'Itau', keywords: ['itau', 'itaú', 'itau unibanco'] },
  { name: 'Santander', keywords: ['santander'] },
  { name: 'Bradesco', keywords: ['bradesco'] },
  { name: 'Banco do Brasil', keywords: ['banco do brasil', 'bb visa', 'bb elo'] },
  { name: 'Caixa', keywords: ['caixa economica', 'caixa econômica', 'cef'] },
  { name: 'Inter', keywords: ['banco inter', 'inter&co', 'inter co'] },
  { name: 'C6', keywords: ['c6 bank', 'c6bank'] },
];

const SUMMARY_WORDS = [
  'pagamento minimo',
  'pagamento mínimo',
  'saldo anterior',
  'limite disponivel',
  'limite disponível',
  'encargos',
  'juros',
  'iof',
  'multa',
  'subtotal',
  'melhor dia',
  'fechamento',
];

export function detectBank(text: string) {
  const lower = normalize(text);
  for (const bank of BANK_PATTERNS) {
    if (bank.keywords.some(keyword => lower.includes(normalize(keyword)))) {
      return bank.name;
    }
  }
  return 'Outro';
}

export function parseInvoiceText(
  text: string,
  source: InvoiceSource,
  fileName?: string,
): ParsedInvoice {
  const cleanText = text.split('\u0000').join(' ').replace(/\t/g, ' ');
  const bank = detectBank(`${fileName ?? ''}\n${cleanText}`);
  const csvRows = parseCsvRows(cleanText);
  const rows = csvRows.length >= 2 ? rowsFromCsv(csvRows) : rowsFromPlainText(cleanText);
  const transactions = dedupeParsedRows(
    rows.map(row => parseTransactionLine(row, bank)).filter(Boolean) as ParsedInvoiceTransaction[],
  );
  const explicitTotal = extractInvoiceTotal(cleanText);
  const referenceMonth = extractReferenceMonth(cleanText, transactions);
  const dueDate = extractDueDate(cleanText, referenceMonth);
  const totalAmount =
    explicitTotal ??
    transactions
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  const warnings: string[] = [];

  if (source === 'pdf' && transactions.length === 0) {
    warnings.push(
      'Nao encontrei transacoes neste PDF. Se ele for imagem escaneada, use foto/OCR ou CSV.',
    );
  }

  if (explicitTotal && Math.abs(explicitTotal - totalAmount) > 1 && transactions.length > 0) {
    warnings.push(
      'O total informado na fatura e diferente da soma dos itens lidos. Confira antes de importar.',
    );
  }

  return {
    bank,
    referenceMonth,
    dueDate,
    totalAmount,
    source,
    transactions,
    warnings,
    rawText: cleanText.slice(0, 12000),
  };
}

export function parseCsvText(text: string, source: InvoiceSource = 'csv', fileName?: string) {
  return parseInvoiceText(text, source, fileName);
}

function parseTransactionLine(line: string, bank: string): ParsedInvoiceTransaction | null {
  const compact = line.replace(/\s{2,}/g, ' ').trim();
  if (compact.length < 6 || isSummaryLine(compact)) return null;

  const amountInfo = extractAmount(compact);
  if (!amountInfo || amountInfo.amount <= 0) return null;

  const dateInfo = extractDate(compact);
  if (!dateInfo) return null;

  const installment = extractInstallment(compact);
  const description = compact
    .replace(amountInfo.raw, ' ')
    .replace(dateInfo.raw, ' ')
    .replace(/\b(compra|debito|d[eé]bito|credito|cr[eé]dito|lan[cç]amento)\b/gi, ' ')
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!description || description.length < 2) return null;

  return {
    id: uid('pi'),
    date: dateInfo.date,
    description,
    amount: amountInfo.amount,
    type: amountInfo.type,
    category: categorizeLocal(description),
    ignored: false,
    installmentCurrent: installment?.current ?? null,
    installmentTotal: installment?.total ?? null,
    bank,
    rawLine: line,
    duplicateOf: null,
    confidence: scoreLine(compact),
  };
}

function rowsFromPlainText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const merged: string[] = [];

  for (const line of lines) {
    if (extractDate(line) && extractAmount(line)) {
      merged.push(line);
      continue;
    }

    const previous = merged[merged.length - 1];
    if (previous && !extractAmount(previous) && extractAmount(`${previous} ${line}`)) {
      merged[merged.length - 1] = `${previous} ${line}`;
    }
  }

  return merged.length ? merged : lines;
}

function parseCsvRows(text: string) {
  const firstLines = text.split(/\r?\n/).slice(0, 8).join('\n');
  const delimiter = [',', ';', '\t'].find(
    item => firstLines.split(item).length > firstLines.split('\n').length * 1.6,
  );
  if (!delimiter) return [];

  return text
    .split(/\r?\n/)
    .map(line => splitCsvLine(line, delimiter))
    .filter(row => row.some(Boolean));
}

function rowsFromCsv(rows: string[][]) {
  const header = rows[0].map(cell => normalize(cell));
  const dataRows = header.some(cell =>
    /(data|descricao|descrição|valor|historico|histórico)/.test(cell),
  )
    ? rows.slice(1)
    : rows;
  const dateIndex = findColumn(header, ['data', 'date']);
  const descriptionIndex = findColumn(header, [
    'descricao',
    'descrição',
    'historico',
    'histórico',
    'estabelecimento',
    'memo',
    'lancamento',
  ]);
  const amountIndex = findColumn(header, [
    'valor',
    'amount',
    'debito',
    'débito',
    'credito',
    'crédito',
  ]);
  const typeIndex = findColumn(header, ['tipo', 'type', 'entrada', 'saida']);

  return dataRows.map(row => {
    if (dateIndex >= 0 || descriptionIndex >= 0 || amountIndex >= 0) {
      const parts = [
        dateIndex >= 0 ? row[dateIndex] : '',
        descriptionIndex >= 0 ? row[descriptionIndex] : row.join(' '),
        typeIndex >= 0 ? row[typeIndex] : '',
        amountIndex >= 0 ? row[amountIndex] : row[row.length - 1],
      ];
      return parts.filter(Boolean).join(' ');
    }
    return row.join(' ');
  });
}

function splitCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim().replace(/^"|"$/g, ''));
  return cells;
}

function extractDate(line: string) {
  const match = line.match(/\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/);
  if (!match) return null;

  const now = new Date();
  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = match[3];
  const year = rawYear
    ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear)
    : now.getFullYear();

  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return { raw: match[0], date: new Date(year, month - 1, day).toISOString() };
}

function extractAmount(line: string) {
  const matches = [
    ...line.matchAll(
      /(?:R\$\s*)?([+-]?\s?\d{1,3}(?:\.\d{3})*,\d{2}|[+-]?\s?\d{1,6}[.,]\d{2})(?:\s*(CR|CREDITO|CRÉDITO|DB|DEBITO|DÉBITO))?/gi,
    ),
  ];
  if (!matches.length) return null;

  const match = matches[matches.length - 1];
  const raw = match[0];
  const lower = normalize(line);
  const signed = match[1].replace(/\s/g, '');
  const amount = Math.abs(parseMoney(signed));
  const isCredit =
    signed.startsWith('+') ||
    /(credito|crédito|\bcr\b|estorno|pagamento recebido|cashback)/i.test(raw) ||
    /(credito|crédito|estorno|cashback)/.test(lower);
  const isDebit = signed.startsWith('-') || /(debito|débito|\bdb\b|compra|pagamento)/.test(lower);
  const type: TransactionType = isCredit && !isDebit ? 'income' : 'expense';

  return { raw, amount, type };
}

function extractInstallment(line: string) {
  const match = line.match(/\b(?:parc(?:ela)?\s*)?(\d{1,2})\s*\/\s*(\d{1,2})\b/i);
  if (!match) return null;
  return { current: Number(match[1]), total: Number(match[2]) };
}

function extractInvoiceTotal(text: string) {
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const lower = normalize(line);
    if (!/(total da fatura|valor total|total\s*:|valor da fatura|saldo total)/.test(lower))
      continue;
    const amount = extractAmount(line);
    if (amount) return amount.amount;
  }
  return null;
}

function extractReferenceMonth(text: string, transactions: ParsedInvoiceTransaction[]) {
  const lower = normalize(text);
  const monthMatch = lower.match(/\b(20\d{2})[-/](0?[1-9]|1[0-2])\b/);
  if (monthMatch) return `${monthMatch[1]}-${monthMatch[2].padStart(2, '0')}`;

  const baseDate = transactions[0]?.date ? new Date(transactions[0].date) : new Date();
  return `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
}

function extractDueDate(text: string, referenceMonth: string) {
  const line = text.split(/\r?\n/).find(item => /vencimento/i.test(item));
  if (!line) return undefined;
  const date = extractDate(line);
  if (date) return date.date;

  const day = line.match(/\b([0-2]?\d|3[01])\b/)?.[1];
  if (!day) return undefined;
  const [year, month] = referenceMonth.split('-').map(Number);
  return new Date(year, month - 1, Number(day)).toISOString();
}

function dedupeParsedRows(rows: ParsedInvoiceTransaction[]) {
  const seen = new Set<string>();
  return rows.filter(row => {
    const key = `${row.date.slice(0, 10)}|${normalize(row.description).slice(0, 30)}|${row.amount.toFixed(2)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findColumn(header: string[], names: string[]) {
  return header.findIndex(cell => names.some(name => cell.includes(normalize(name))));
}

function isSummaryLine(line: string) {
  const lower = normalize(line);
  return SUMMARY_WORDS.some(word => lower.includes(normalize(word)));
}

function parseMoney(value: string) {
  const clean = value.replace(/\s/g, '');
  if (clean.includes(',') && clean.includes('.'))
    return Number(clean.replace(/\./g, '').replace(',', '.'));
  if (clean.includes(',')) return Number(clean.replace(',', '.'));
  return Number(clean);
}

function scoreLine(line: string) {
  let score = 0.55;
  if (extractDate(line)) score += 0.2;
  if (extractAmount(line)) score += 0.2;
  if (extractInstallment(line)) score += 0.05;
  return Math.min(0.98, score);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
