import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { useFinanceStore } from "@/store/useFinanceStore";
import { Transaction } from "@/types/finance";
import { formatCurrency } from "@/utils/format";

export async function exportBackup() {
  const state = useFinanceStore.getState();
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "Meu Diario Financeiro",
    version: 1,
    data: {
      salary: state.salary,
      transactions: state.transactions,
      goals: state.goals,
      habits: state.habits,
      diary: state.diary,
      budgets: state.budgets,
      categories: state.categories,
      invoiceImports: state.invoiceImports,
      accounts: state.accounts,
      creditCards: state.creditCards,
      recurringEntries: state.recurringEntries
    }
  };

  const fileUri = `${FileSystem.documentDirectory ?? ""}meu-diario-financeiro-backup.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/json",
      dialogTitle: "Backup do Meu Diario Financeiro"
    });
  }

  return fileUri;
}

export async function importBackupFromJson(jsonText: string) {
  const payload = JSON.parse(jsonText);
  const data = payload.data ?? payload;
  const state = useFinanceStore.getState();

  if (typeof data.salary === "number") state.setSalary(data.salary);
  if (Array.isArray(data.transactions)) {
    useFinanceStore.setState({ transactions: data.transactions });
  }
  if (Array.isArray(data.goals)) useFinanceStore.setState({ goals: data.goals });
  if (Array.isArray(data.habits)) useFinanceStore.setState({ habits: data.habits });
  if (Array.isArray(data.diary)) useFinanceStore.setState({ diary: data.diary });
  if (Array.isArray(data.budgets)) useFinanceStore.setState({ budgets: data.budgets });
  if (Array.isArray(data.categories)) useFinanceStore.setState({ categories: data.categories });
  if (Array.isArray(data.invoiceImports)) useFinanceStore.setState({ invoiceImports: data.invoiceImports });
  if (Array.isArray(data.accounts)) useFinanceStore.setState({ accounts: data.accounts });
  if (Array.isArray(data.creditCards)) useFinanceStore.setState({ creditCards: data.creditCards });
  if (Array.isArray(data.recurringEntries)) useFinanceStore.setState({ recurringEntries: data.recurringEntries });
}

export async function exportFinancialReport(format: "csv" | "excel" | "pdf") {
  const transactions = useFinanceStore.getState().transactions;
  const baseName = `relatorio-financeiro-${new Date().toISOString().slice(0, 10)}`;
  const fileUri = `${FileSystem.documentDirectory ?? ""}${baseName}.${format === "excel" ? "xls" : format}`;
  const content = format === "csv" ? toCsv(transactions) : format === "excel" ? toExcelHtml(transactions) : toSimplePdf(transactions);
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: format === "pdf" ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: format === "csv" ? "text/csv" : format === "excel" ? "application/vnd.ms-excel" : "application/pdf",
      dialogTitle: "Relatorio financeiro"
    });
  }

  return fileUri;
}

function toCsv(transactions: Transaction[]) {
  const header = "Data;Tipo;Descricao;Categoria;Valor;Banco;Parcela\n";
  return `${header}${transactions.map((item) => [
    item.date.slice(0, 10),
    item.type,
    escapeCsv(item.title),
    item.category,
    item.amount.toFixed(2).replace(".", ","),
    item.sourceBank ?? "",
    item.installmentTotal ? `${item.installmentCurrent}/${item.installmentTotal}` : ""
  ].join(";")).join("\n")}`;
}

function toExcelHtml(transactions: Transaction[]) {
  return `
<html><meta charset="utf-8"><body>
<table border="1">
<tr><th>Data</th><th>Tipo</th><th>Descricao</th><th>Categoria</th><th>Valor</th><th>Banco</th></tr>
${transactions.map((item) => `<tr><td>${item.date.slice(0, 10)}</td><td>${item.type}</td><td>${escapeHtml(item.title)}</td><td>${item.category}</td><td>${formatCurrency(item.amount)}</td><td>${escapeHtml(item.sourceBank ?? "")}</td></tr>`).join("")}
</table>
</body></html>`;
}

function toSimplePdf(transactions: Transaction[]) {
  const lines = [
    "Meu Diario Financeiro",
    `Relatorio gerado em ${new Date().toLocaleDateString("pt-BR")}`,
    "",
    ...transactions.slice(0, 80).map((item) => `${item.date.slice(0, 10)}  ${item.type === "income" ? "+" : "-"} ${formatCurrency(item.amount)}  ${item.title}`)
  ];
  const stream = lines.map((line, index) => `BT /F1 10 Tf 40 ${780 - index * 14} Td (${escapePdf(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];
  const pdf = `%PDF-1.4\n${objects.join("\n")}\ntrailer << /Root 1 0 R >>\n%%EOF`;
  return encodeBase64(pdf);
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapePdf(value: string) {
  return value.replace(/[()\\]/g, "\\$&").replace(/[^\x20-\x7E]/g, "");
}

function encodeBase64(value: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let index = 0; index < value.length; index += 3) {
    const a = value.charCodeAt(index);
    const hasB = index + 1 < value.length;
    const hasC = index + 2 < value.length;
    const b = hasB ? value.charCodeAt(index + 1) : 0;
    const c = hasC ? value.charCodeAt(index + 2) : 0;
    const triple = (a << 16) | (b << 8) | c;
    output += alphabet[(triple >> 18) & 63] + alphabet[(triple >> 12) & 63] + (hasB ? alphabet[(triple >> 6) & 63] : "=") + (hasC ? alphabet[triple & 63] : "=");
  }
  return output;
}
