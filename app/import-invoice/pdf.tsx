import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { PaperScreen } from '@/components/PaperScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { AppText } from '@/components/Text';
import { decodePdfTextFromBase64, parseInvoiceText } from '@/utils/invoiceParser';

export default function PdfInvoiceScreen() {
  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/csv', 'text/plain', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    try {
      const file = result.assets[0];
      const extension = file.name?.split('.').pop()?.toLowerCase();
      const isPdf = file.mimeType === 'application/pdf' || extension === 'pdf';
      const rawContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: isPdf ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8,
      });
      const extractedText = isPdf ? decodePdfTextFromBase64(rawContent) : rawContent;
      const invoice = parseInvoiceText(extractedText, isPdf ? 'pdf' : 'csv', file.name);

      if (invoice.transactions.length === 0) {
        Alert.alert(
          'PDF sem texto legível',
          isPdf
            ? 'Este PDF parece escaneado ou protegido. Faça uma captura da página e use Foto da Fatura para aplicar o OCR offline.'
            : 'Não encontrei linhas de lançamento neste arquivo. Confira as colunas de data, descrição e valor.',
          isPdf
            ? [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Abrir Foto da Fatura',
                  onPress: () => router.push('/import-invoice/camera'),
                },
              ]
            : undefined,
        );
        return;
      }

      router.push({
        pathname: '/import-invoice/review',
        params: { invoice: encodeURIComponent(JSON.stringify(invoice)) },
      });
    } catch {
      Alert.alert(
        'Não foi possível ler',
        'Use CSV, PDF com texto selecionável ou uma imagem no leitor OCR.',
      );
    }
  }

  return (
    <PaperScreen>
      <SectionHeader
        title="Importar arquivo"
        subtitle="PDF, CSV ou TXT. Tudo offline e sempre com revisao antes de salvar."
      />
      <View className="mb-5 rounded-paper border border-line bg-surface p-5">
        <AppText className="font-body text-lg">Selecione a fatura</AppText>
        <AppText className="mt-2 text-sm text-muted">
          CSV e TXT são lidos diretamente. Para PDF escaneado, use uma captura da página em Foto da
          Fatura.
        </AppText>
      </View>
      <PrimaryButton label="Escolher arquivo" icon="folder-open" onPress={pickFile} />
    </PaperScreen>
  );
}
