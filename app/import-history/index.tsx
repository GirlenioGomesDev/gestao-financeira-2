import { Alert, View } from "react-native";

import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, formatShortDate } from "@/utils/format";

export default function ImportHistoryScreen() {
  const imports = useFinanceStore((state) => state.invoiceImports);
  const undoInvoiceImport = useFinanceStore((state) => state.undoInvoiceImport);

  return (
    <PaperScreen>
      <SectionHeader title="Historico" subtitle="Veja e desfaça importacoes de faturas." />
      {imports.map((item) => (
        <View key={item.id} className="mb-4 rounded-paper border border-line bg-surface p-4">
          <AppText className="font-body text-lg">{item.bank} • {item.referenceMonth}</AppText>
          <AppText className="mt-1 text-sm text-muted">
            {item.transactionCount} transacoes • {formatCurrency(item.totalAmount)} • {formatShortDate(item.importedAt)}
          </AppText>
          <PrimaryButton
            label="Desfazer importacao"
            icon="arrow-undo"
            variant="outline"
            className="mt-3"
            onPress={() =>
              Alert.alert("Desfazer importacao?", "Todas as transacoes desta fatura serao removidas.", [
                { text: "Cancelar", style: "cancel" },
                { text: "Desfazer", style: "destructive", onPress: () => undoInvoiceImport(item.id) }
              ])
            }
          />
        </View>
      ))}
      {imports.length === 0 ? <AppText className="text-muted">Nenhuma fatura importada ainda.</AppText> : null}
    </PaperScreen>
  );
}
