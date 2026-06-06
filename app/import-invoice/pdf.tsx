import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { Alert, View } from "react-native";

import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { decodePdfTextFromBase64, parseInvoiceText } from "@/utils/invoiceParser";

export default function PdfInvoiceScreen() {
  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "text/csv", "text/plain", "application/vnd.ms-excel"],
      copyToCacheDirectory: true
    });
    if (result.canceled) return;

    try {
      const file = result.assets[0];
      const extension = file.name?.split(".").pop()?.toLowerCase();
      const isPdf = file.mimeType === "application/pdf" || extension === "pdf";
      const rawContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: isPdf ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8
      });
      const extractedText = isPdf ? decodePdfTextFromBase64(rawContent) : rawContent;
      const invoice = parseInvoiceText(extractedText, isPdf ? "pdf" : "csv", file.name);

      if (invoice.transactions.length === 0) {
        Alert.alert(
          "Poucos dados encontrados",
          isPdf
            ? "Este PDF parece ser imagem ou protegido. Tente exportar CSV pelo banco, usar foto/OCR ou digitar manualmente."
            : "Nao encontrei linhas de lancamento neste arquivo. Confira as colunas de data, descricao e valor."
        );
        return;
      }

      router.push({ pathname: "/import-invoice/review", params: { invoice: encodeURIComponent(JSON.stringify(invoice)) } });
    } catch {
      Alert.alert("Nao foi possivel ler", "Use CSV, PDF com texto selecionavel ou digitacao manual.");
    }
  }

  return (
    <PaperScreen>
      <SectionHeader title="Importar arquivo" subtitle="PDF, CSV ou TXT. Tudo offline e sempre com revisao antes de salvar." />
      <View className="mb-5 rounded-paper border border-line bg-surface p-5">
        <AppText className="font-body text-lg">Selecione a fatura</AppText>
        <AppText className="mt-2 text-sm text-muted">CSV e TXT sao lidos diretamente. PDF funciona melhor quando o texto pode ser selecionado no arquivo.</AppText>
      </View>
      <PrimaryButton label="Escolher arquivo" icon="folder-open" onPress={pickFile} />
    </PaperScreen>
  );
}
