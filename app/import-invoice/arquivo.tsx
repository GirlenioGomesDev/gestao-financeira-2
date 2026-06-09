import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { PaperScreen } from '@/components/PaperScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { AppText } from '@/components/Text';
import { parseInvoiceText } from '@/utils/invoiceParser';

export default function FileInvoiceScreen() {
  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/plain', 'text/tab-separated-values'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    try {
      const file = result.assets[0];
      const rawContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const invoice = parseInvoiceText(rawContent, 'csv', file.name);

      if (invoice.transactions.length === 0) {
        Alert.alert(
          'Arquivo sem lançamentos',
          'Não encontrei linhas de lançamento. Confira as colunas de data, descrição e valor.',
        );
        return;
      }

      router.push({
        pathname: '/import-invoice/review',
        params: { invoice: encodeURIComponent(JSON.stringify(invoice)) },
      });
    } catch {
      Alert.alert('Não foi possível ler', 'Use um arquivo CSV ou TXT exportado pelo seu banco.');
    }
  }

  return (
    <PaperScreen>
      <SectionHeader
        title="Importar CSV"
        subtitle="Arquivo CSV ou TXT exportado do seu banco. Tudo offline e sempre com revisão antes de salvar."
      />
      <View className="mb-5 rounded-paper border border-line bg-surface p-5">
        <AppText className="font-body text-lg">Selecione o arquivo</AppText>
        <AppText className="mt-2 text-sm text-muted">
          Exporte o extrato do seu banco em CSV ou TXT e importe aqui. Para faturas de cartão
          escaneadas, use Foto da Fatura.
        </AppText>
      </View>
      <PrimaryButton label="Escolher arquivo" icon="folder-open" onPress={pickFile} />
    </PaperScreen>
  );
}
