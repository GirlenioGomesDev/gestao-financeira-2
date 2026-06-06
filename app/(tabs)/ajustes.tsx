import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";

import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { EditableField } from "@/components/EditableField";
import { useFinanceStore } from "@/store/useFinanceStore";
import { exportBackup, exportFinancialReport, importBackupFromJson } from "@/utils/backup";
import { formatCurrency } from "@/utils/format";
import { scheduleDailyReminder } from "@/utils/notifications";

export default function SettingsScreen() {
  const salary = useFinanceStore((state) => state.salary);
  const setSalary = useFinanceStore((state) => state.setSalary);
  const resetDemoData = useFinanceStore((state) => state.resetDemoData);
  const userName = useFinanceStore((state) => state.userName);
  const setUserName = useFinanceStore((state) => state.setUserName);
  const profileGoalText = useFinanceStore((state) => state.profileGoalText);
  const setProfileGoalText = useFinanceStore((state) => state.setProfileGoalText);
  const objectiveText = useFinanceStore((state) => state.objectiveText);
  const setObjectiveText = useFinanceStore((state) => state.setObjectiveText);
  const categories = useFinanceStore((state) => state.categories);
  const updateCategory = useFinanceStore((state) => state.updateCategory);
  const motivationalQuotes = useFinanceStore((state) => state.motivationalQuotes);
  const updateMotivationalQuote = useFinanceStore((state) => state.updateMotivationalQuote);
  const addMotivationalQuote = useFinanceStore((state) => state.addMotivationalQuote);
  const deleteMotivationalQuote = useFinanceStore((state) => state.deleteMotivationalQuote);
  const accounts = useFinanceStore((state) => state.accounts);
  const updateAccount = useFinanceStore((state) => state.updateAccount);
  const addAccount = useFinanceStore((state) => state.addAccount);
  const creditCards = useFinanceStore((state) => state.creditCards);
  const updateCreditCard = useFinanceStore((state) => state.updateCreditCard);
  const addCreditCard = useFinanceStore((state) => state.addCreditCard);
  const recurringEntries = useFinanceStore((state) => state.recurringEntries);
  const updateRecurringEntry = useFinanceStore((state) => state.updateRecurringEntry);
  const addRecurringEntry = useFinanceStore((state) => state.addRecurringEntry);
  const [salaryDraft, setSalaryDraft] = useState(String(salary));
  const [reminderEnabled, setReminderEnabled] = useState(false);

  function saveSalary() {
    const value = Number(salaryDraft.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert("Valor invalido", "Digite o salario em reais, por exemplo 2800.");
      return;
    }

    setSalary(value);
    Alert.alert("Salario salvo", `Seu planejamento agora usa ${formatCurrency(value)}.`);
  }

  async function enableReminder() {
    const ok = await scheduleDailyReminder();
    setReminderEnabled(ok);
    Alert.alert(ok ? "Lembrete ativado" : "Permissao pendente", ok ? "Vou lembrar voce todos os dias as 20h." : "Ative notificacoes para usar lembretes.");
  }

  async function shareBackup() {
    try {
      const fileUri = await exportBackup();
      Alert.alert("Backup criado", `Arquivo preparado em: ${fileUri}`);
    } catch {
      Alert.alert("Nao foi possivel exportar", "Tente novamente em instantes.");
    }
  }

  async function restoreBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
      if (result.canceled) return;
      const json = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      await importBackupFromJson(json);
      Alert.alert("Backup restaurado", "Seus dados locais foram atualizados.");
    } catch {
      Alert.alert("Backup invalido", "Nao consegui restaurar este arquivo JSON.");
    }
  }

  async function shareReport(format: "csv" | "excel" | "pdf") {
    try {
      const fileUri = await exportFinancialReport(format);
      Alert.alert("Relatorio criado", `Arquivo preparado em: ${fileUri}`);
    } catch {
      Alert.alert("Nao foi possivel exportar", "Tente novamente.");
    }
  }

  return (
    <PaperScreen>
      <SectionHeader title="Ajustes" subtitle="Deixe o diario combinando com sua rotina." />

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Perfil</AppText>
        <EditableField value={userName} type="text" label="Nome completo" displayStyle="card" onSave={(value) => setUserName(String(value))} />
        <EditableField value={profileGoalText} type="multiline" label="Texto da meta" displayStyle="card" onSave={(value) => setProfileGoalText(String(value))} />
        <EditableField value={objectiveText} type="multiline" label="Texto do objetivo" displayStyle="card" onSave={(value) => setObjectiveText(String(value))} />
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="font-body text-lg">Salario fixo</AppText>
        <AppText className="mt-1 text-sm text-muted">Usado para calcular quanto do mes ja foi comprometido.</AppText>
        <TextInput
          value={salaryDraft}
          onChangeText={setSalaryDraft}
          keyboardType="decimal-pad"
          className="my-4 rounded-paper border border-line bg-paper px-4 py-3 font-body text-base text-ink"
        />
        <PrimaryButton label="Salvar salario" icon="save" onPress={saveSalary} />
      </View>

      <Pressable onPress={enableReminder} className="mb-4 flex-row items-center rounded-paper border border-line bg-surface p-4">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-paper">
          <Ionicons name={reminderEnabled ? "notifications" : "notifications-outline"} size={22} color="#2F8F6B" />
        </View>
        <View className="flex-1">
          <AppText className="font-body">Lembrete diario</AppText>
          <AppText className="mt-1 text-sm text-muted">{reminderEnabled ? "Ativado para 20h" : "Toque para ativar"}</AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9A9085" />
      </Pressable>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="font-body text-lg">Backup local</AppText>
        <AppText className="mb-4 mt-1 text-sm text-muted">Exporte ou restaure um JSON completo com dados locais.</AppText>
        <PrimaryButton label="Exportar backup" icon="share-outline" variant="outline" onPress={shareBackup} />
        <PrimaryButton label="Restaurar backup" icon="cloud-upload-outline" variant="outline" className="mt-3" onPress={restoreBackup} />
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="font-body text-lg">Relatorios</AppText>
        <AppText className="mb-4 mt-1 text-sm text-muted">Exporte receitas e despesas sem internet.</AppText>
        <View className="gap-3">
          <PrimaryButton label="Exportar CSV" icon="document-text-outline" variant="outline" onPress={() => shareReport("csv")} />
          <PrimaryButton label="Exportar Excel" icon="grid-outline" variant="outline" onPress={() => shareReport("excel")} />
          <PrimaryButton label="Exportar PDF" icon="reader-outline" variant="outline" onPress={() => shareReport("pdf")} />
        </View>
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Contas</AppText>
        {accounts.map((account) => (
          <View key={account.id} className="mb-3 rounded-paper border border-line bg-paper p-3">
            <EditableField value={account.name} type="text" label="Nome" displayStyle="inline" onSave={(value) => updateAccount(account.id, { name: String(value) })} />
            <EditableField value={account.balance} type="currency" label="Saldo" displayStyle="inline" onSave={(value) => updateAccount(account.id, { balance: Number(value) })} />
            <EditableField value={account.kind} type="select" label="Tipo" options={["checking", "savings", "cash", "wallet"]} displayStyle="inline" onSave={(value) => updateAccount(account.id, { kind: String(value) as typeof account.kind })} />
          </View>
        ))}
        <PrimaryButton label="Adicionar conta" icon="add" variant="outline" onPress={() => addAccount({ name: "Nova conta", kind: "checking", balance: 0, color: "#2F8F6B" })} />
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Cartoes</AppText>
        {creditCards.map((card) => (
          <View key={card.id} className="mb-3 rounded-paper border border-line bg-paper p-3">
            <EditableField value={card.name} type="text" label="Nome" displayStyle="inline" onSave={(value) => updateCreditCard(card.id, { name: String(value) })} />
            <EditableField value={card.bank} type="text" label="Banco" displayStyle="inline" onSave={(value) => updateCreditCard(card.id, { bank: String(value) })} />
            <EditableField value={card.totalLimit} type="currency" label="Limite total" displayStyle="inline" onSave={(value) => updateCreditCard(card.id, { totalLimit: Number(value) })} />
            <EditableField value={card.closingDay} type="number" label="Fechamento" displayStyle="inline" onSave={(value) => updateCreditCard(card.id, { closingDay: Number(value) })} />
            <EditableField value={card.dueDay} type="number" label="Vencimento" displayStyle="inline" onSave={(value) => updateCreditCard(card.id, { dueDay: Number(value) })} />
          </View>
        ))}
        <PrimaryButton label="Adicionar cartao" icon="add" variant="outline" onPress={() => addCreditCard({ name: "Novo cartao", bank: "Outro", totalLimit: 0, closingDay: 20, dueDay: 28, color: "#9A86C8" })} />
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Lancamentos recorrentes</AppText>
        {recurringEntries.map((entry) => (
          <View key={entry.id} className="mb-3 rounded-paper border border-line bg-paper p-3">
            <EditableField value={entry.title} type="text" label="Nome" displayStyle="inline" onSave={(value) => updateRecurringEntry(entry.id, { title: String(value) })} />
            <EditableField value={entry.amount} type="currency" label="Valor" displayStyle="inline" onSave={(value) => updateRecurringEntry(entry.id, { amount: Number(value) })} />
            <EditableField value={entry.day} type="number" label="Dia" displayStyle="inline" onSave={(value) => updateRecurringEntry(entry.id, { day: Number(value) })} />
            <EditableField value={entry.type} type="select" label="Tipo" options={["income", "expense"]} displayStyle="inline" onSave={(value) => updateRecurringEntry(entry.id, { type: value === "income" ? "income" : "expense" })} />
          </View>
        ))}
        <PrimaryButton label="Adicionar recorrente" icon="add" variant="outline" onPress={() => addRecurringEntry({ title: "Nova conta", amount: 0, type: "expense", category: "contas", day: 10, active: true })} />
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Minhas Categorias</AppText>
        {categories.map((category) => (
          <View key={category.id} className="mb-3 rounded-paper border border-line bg-paper p-3">
            <EditableField value={category.name} type="text" label="Nome" displayStyle="inline" onSave={(value) => updateCategory(String(category.id), { name: String(value) })} />
            <EditableField value={category.icon} type="text" label="Icone MaterialCommunityIcons" displayStyle="inline" onSave={(value) => updateCategory(String(category.id), { icon: String(value) })} />
          </View>
        ))}
      </View>

      <View className="mb-4 rounded-paper border border-line bg-surface p-4">
        <AppText className="mb-3 font-body text-lg">Frases & Versiculos</AppText>
        {motivationalQuotes.map((quote, index) => (
          <View key={`${quote}-${index}`} className="mb-3 rounded-paper border border-line bg-paper p-3">
            <EditableField value={quote} type="multiline" displayStyle="inline" onSave={(value) => updateMotivationalQuote(index, String(value))} />
            <Pressable onPress={() => deleteMotivationalQuote(index)} className="mt-2 self-start rounded-paper border border-coral px-3 py-2">
              <AppText className="text-coral">Excluir</AppText>
            </Pressable>
          </View>
        ))}
        <PrimaryButton label="Adicionar frase" icon="add" variant="outline" onPress={() => addMotivationalQuote("Nova frase motivacional")} />
      </View>

      <View className="rounded-paper border border-line bg-surface p-4">
        <AppText className="font-body text-lg">Dados de exemplo</AppText>
        <AppText className="mb-4 mt-1 text-sm text-muted">Restaura o caderno inicial para testar o app novamente.</AppText>
        <PrimaryButton
          label="Restaurar exemplo"
          icon="refresh"
          variant="outline"
          onPress={() => {
            resetDemoData();
            setSalaryDraft("2800");
          }}
        />
      </View>
    </PaperScreen>
  );
}
