import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { EditableField } from "@/components/EditableField";
import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { useFinanceStore } from "@/store/useFinanceStore";
import { ParsedInvoice, ParsedInvoiceTransaction } from "@/types/finance";
import { categoryLabels, spendingCategories } from "@/utils/categories";
import { formatCurrency, formatShortDate, uid } from "@/utils/format";

export default function InvoiceReviewScreen() {
  const params = useLocalSearchParams<{ invoice?: string }>();
  const parsed = useMemo<ParsedInvoice>(() => {
    if (!params.invoice) {
      return {
        bank: "outro",
        referenceMonth: new Date().toISOString().slice(0, 7),
        totalAmount: 0,
        source: "manual",
        transactions: []
      };
    }

    return JSON.parse(decodeURIComponent(params.invoice));
  }, [params.invoice]);
  const [items, setItems] = useState(parsed.transactions);
  const addTransactions = useFinanceStore((state) => state.addTransactions);
  const addInvoiceImport = useFinanceStore((state) => state.addInvoiceImport);
  const existing = useFinanceStore((state) => state.transactions);

  const activeItems = items.filter((item) => !item.ignored);
  const listedTotal = activeItems.reduce((sum, item) => sum + item.amount, 0);
  const invoiceTotal = parsed.totalAmount || listedTotal;
  const byCategory = activeItems.reduce<Record<string, number>>((acc, item) => {
    if (item.type === "income") return acc;
    acc[item.category] = (acc[item.category] ?? 0) + item.amount;
    return acc;
  }, {});
  const maxCategory = Math.max(...Object.values(byCategory), 1);

  function updateItem(id: string, data: Partial<ParsedInvoiceTransaction>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...data } : item)));
  }

  function findDuplicate(item: ParsedInvoiceTransaction) {
    return existing.find((transaction) => {
      const sameDate = transaction.date.slice(0, 10) === item.date.slice(0, 10);
      const sameAmount = Math.abs(transaction.amount - item.amount) <= 0.01;
      const left = normalize(transaction.title).slice(0, 14);
      const right = normalize(item.description).slice(0, 14);
      const similarDescription = left.length >= 6 && right.length >= 6 && (left.includes(right.slice(0, 8)) || right.includes(left.slice(0, 8)));
      return sameDate && sameAmount && similarDescription;
    });
  }

  function confirmImport() {
    const duplicates = activeItems.filter((item) => findDuplicate(item));

    const finish = () => {
      const importId = uid("import");
      const ids = addTransactions(
        activeItems.map((item) => ({
          type: item.type,
          title: item.description,
          amount: item.amount,
          category: item.category,
          date: item.date,
          invoiceImportId: importId,
          sourceBank: item.bank ?? parsed.bank,
          installmentCurrent: item.installmentCurrent,
          installmentTotal: item.installmentTotal,
          duplicateOf: findDuplicate(item)?.id
        }))
      );

      addInvoiceImport({
        id: importId,
        bank: parsed.bank,
        referenceMonth: parsed.referenceMonth,
        totalAmount: invoiceTotal,
        transactionCount: activeItems.length,
        importedAt: new Date().toISOString(),
        source: parsed.source,
        transactions: ids,
        ignoredCount: items.length - activeItems.length
      });

      Alert.alert("Importacao concluida", `${activeItems.length} transacoes importadas.`, [
        { text: "Ver gastos", onPress: () => router.replace("/(tabs)/gastos") }
      ]);
    };

    Alert.alert(
      duplicates.length ? "Possiveis duplicatas" : "Importar fatura?",
      `${activeItems.length} transacoes - ${formatCurrency(invoiceTotal)}${
        duplicates.length ? `\n${duplicates.length} possiveis duplicatas encontradas por data, valor e descricao.` : ""
      }`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: finish }
      ]
    );
  }

  return (
    <PaperScreen>
      <SectionHeader title="Fatura Lida" subtitle={`${parsed.bank} - ${parsed.referenceMonth} - ${activeItems.length} transacoes`} />

      <View className="mb-4 rounded-paper border border-primary bg-primary/10 p-4">
        <AppText className="text-xs uppercase text-primaryDark">Valor total desta fatura</AppText>
        <AppText className="mt-1 font-body text-3xl text-primaryDark">{formatCurrency(invoiceTotal)}</AppText>
        <AppText className="mt-2 text-sm text-muted">
          {items.length} gastos encontrados - {activeItems.length} ativos - {items.length - activeItems.length} ignorados
        </AppText>
        <AppText className="mt-1 text-sm text-muted">Soma dos gastos listados: {formatCurrency(listedTotal)}</AppText>
        {parsed.warnings?.map((warning) => (
          <AppText key={warning} className="mt-1 text-sm text-coral">{warning}</AppText>
        ))}
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="font-body text-lg">Resumo por categoria</AppText>
        {Object.entries(byCategory).map(([category, value]) => (
          <View key={category} className="mt-3">
            <View className="mb-1 flex-row justify-between">
              <AppText>{categoryLabels[category as keyof typeof categoryLabels] ?? category}</AppText>
              <AppText className="text-muted">{formatCurrency(value)}</AppText>
            </View>
            <ProgressBar value={value / maxCategory} />
          </View>
        ))}
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <AppText className="font-body text-lg">Todos os gastos encontrados</AppText>
        <AppText className="text-sm text-muted">{items.length} itens</AppText>
      </View>

      {items.map((item, index) => (
        <View key={item.id} className={`mb-3 rounded-paper border border-line p-4 ${item.ignored ? "bg-line opacity-60" : "bg-surface"}`}>
          <View className="mb-2 flex-row justify-between">
            <AppText className="font-body">
              #{index + 1} - {formatShortDate(item.date)}
            </AppText>
            <Pressable onPress={() => updateItem(item.id, { ignored: !item.ignored })}>
              <AppText className={item.ignored ? "text-primaryDark" : "text-coral"}>{item.ignored ? "Desfazer" : "Ignorar"}</AppText>
            </Pressable>
          </View>
          <EditableField value={item.description} type="text" displayStyle="card" onSave={(value) => updateItem(item.id, { description: String(value) })} />
          <EditableField value={item.amount} type="currency" displayStyle="card" onSave={(value) => updateItem(item.id, { amount: Number(value) })} />
          <EditableField
            value={item.type}
            type="select"
            options={["expense", "income"]}
            displayStyle="card"
            onSave={(value) => updateItem(item.id, { type: value === "income" ? "income" : "expense" })}
          />
          <EditableField
            value={item.category}
            type="select"
            options={spendingCategories}
            displayStyle="card"
            onSave={(value) => updateItem(item.id, { category: String(value) as ParsedInvoiceTransaction["category"] })}
          />
          <EditableField value={item.date.slice(0, 10)} type="date" displayStyle="card" onSave={(value) => updateItem(item.id, { date: new Date(String(value)).toISOString() })} />
          {findDuplicate(item) ? <AppText className="mt-2 text-xs text-coral">Possivel duplicata ja registrada.</AppText> : null}
          {item.installmentTotal ? (
            <AppText className="mt-2 text-xs text-muted">Parcela {item.installmentCurrent}/{item.installmentTotal}</AppText>
          ) : null}
        </View>
      ))}

      <View className="rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-1 font-body text-lg">Total da fatura: {formatCurrency(invoiceTotal)}</AppText>
        <AppText className="mb-3 text-sm text-muted">
          Importando {activeItems.length} de {items.length} gastos encontrados.
        </AppText>
        <PrimaryButton label="Importar tudo" icon="checkmark-circle" onPress={confirmImport} disabled={activeItems.length === 0} />
      </View>
    </PaperScreen>
  );
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
