import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { EditableField } from "@/components/EditableField";
import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { ParsedInvoiceTransaction } from "@/types/finance";
import { categorizeLocal } from "@/utils/categorizer";
import { formatCurrency, uid } from "@/utils/format";

export default function ManualInvoiceScreen() {
  const [bank, setBank] = useState("Nubank");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState<ParsedInvoiceTransaction[]>([]);
  const invoiceTotal = items.reduce((sum, item) => sum + item.amount, 0);

  function addItem() {
    const numericAmount = Number(amount.replace(/\./g, "").replace(",", "."));
    if (!description.trim() || !numericAmount) return;

    setItems((current) => [
      ...current,
      {
        id: uid("pi"),
        date: new Date().toISOString(),
        description,
        amount: numericAmount,
        type: "expense",
        category: categorizeLocal(description),
        bank
      }
    ]);
    setDescription("");
    setAmount("");
  }

  function review() {
    const invoice = {
      bank,
      referenceMonth: new Date().toISOString().slice(0, 7),
      totalAmount: invoiceTotal,
      source: "manual",
      transactions: items
    };
    router.push({ pathname: "/import-invoice/review", params: { invoice: encodeURIComponent(JSON.stringify(invoice)) } });
  }

  return (
    <PaperScreen>
      <SectionHeader title="Digitar Fatura" subtitle="A categoria aparece como sugestao e pode ser editada depois." />
      <EditableField value={bank} type="text" label="Banco/cartao" displayStyle="card" onSave={(value) => setBank(String(value))} />

      <View className="my-4 rounded-paper border border-primary bg-primary/10 p-4">
        <AppText className="text-xs uppercase text-primaryDark">Valor total desta fatura</AppText>
        <AppText className="mt-1 font-body text-3xl text-primaryDark">{formatCurrency(invoiceTotal)}</AppText>
        <AppText className="mt-2 text-sm text-muted">{items.length} gastos adicionados. Todos aparecem abaixo antes da revisao.</AppText>
      </View>

      <View className="my-4 rounded-paper border border-line bg-surface p-4">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descricao"
          placeholderTextColor="#9A9085"
          className="mb-3 rounded-paper border border-line bg-paper px-4 py-3 font-body text-ink"
        />
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Valor"
          keyboardType="decimal-pad"
          placeholderTextColor="#9A9085"
          className="mb-3 rounded-paper border border-line bg-paper px-4 py-3 font-body text-ink"
        />
        <AppText className="mb-3 text-sm text-muted">Sugestao: {categorizeLocal(description)}</AppText>
        <PrimaryButton label="Adicionar gasto" icon="add" onPress={addItem} />
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <AppText className="font-body text-lg">Todos os gastos digitados</AppText>
        <AppText className="text-sm text-muted">{items.length} itens</AppText>
      </View>

      {items.map((item, index) => (
        <Pressable key={item.id} className="mb-2 rounded-paper border border-line bg-surface p-3">
          <AppText className="font-body">
            #{index + 1} - {item.description}
          </AppText>
          <AppText className="text-sm text-muted">
            {item.category} - {formatCurrency(item.amount)}
          </AppText>
        </Pressable>
      ))}

      <PrimaryButton label="Revisar importacao" icon="checkmark" onPress={review} disabled={items.length === 0} />
    </PaperScreen>
  );
}
