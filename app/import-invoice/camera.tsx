import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { PaperScreen } from '@/components/PaperScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { AppText } from '@/components/Text';
import { parseInvoiceText } from '@/utils/invoiceParser';

export default function CameraInvoiceScreen() {
  const [isReading, setIsReading] = useState(false);

  async function pickImage(useCamera: boolean) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao necessaria', 'Autorize o acesso para importar a fatura.');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 1,
        });

    if (result.canceled) return;

    setIsReading(true);
    try {
      const { recognizeText } = await import('@infinitered/react-native-mlkit-text-recognition');
      const recognition = await recognizeText(result.assets[0].uri);
      const extractedText = recognition.text.trim();

      if (!extractedText) {
        Alert.alert(
          'Texto não encontrado',
          'Tente novamente com mais luz, sem reflexos e mantendo a fatura inteira visível.',
        );
        return;
      }

      const invoice = parseInvoiceText(extractedText, 'ocr');
      if (invoice.transactions.length === 0) {
        Alert.alert(
          'Não encontrei lançamentos',
          'O texto foi lido, mas não reconheci linhas com data e valor. Tente outra foto ou use a digitação manual.',
        );
        return;
      }

      router.push({
        pathname: '/import-invoice/review',
        params: { invoice: encodeURIComponent(JSON.stringify(invoice)) },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const missingNativeModule =
        message.includes('RNMLKitTextRecognition') ||
        message.includes('native module') ||
        message.includes('Cannot find native module');

      Alert.alert(
        missingNativeModule ? 'OCR precisa do app instalado' : 'Não foi possível ler a foto',
        missingNativeModule
          ? 'O Expo Go não inclui o leitor OCR. Gere e instale o aplicativo Android novamente para usar a leitura offline.'
          : 'Tente outra foto com melhor iluminação e foco.',
      );
    } finally {
      setIsReading(false);
    }
  }

  return (
    <PaperScreen>
      <SectionHeader
        title="Foto da Fatura"
        subtitle="Leitura OCR local e offline. Depois você revisa tudo antes de salvar."
      />
      <View className="mb-5 rounded-paper border border-line bg-surface p-5">
        <AppText className="font-body text-lg">Enquadre a fatura inteira</AppText>
        <AppText className="mt-2 text-sm text-muted">
          Boa iluminação, foco e ausência de reflexos melhoram a leitura.
        </AppText>
      </View>
      {isReading ? (
        <View className="items-center rounded-paper border border-line bg-surface p-6">
          <ActivityIndicator size="large" color="#2F8F6B" />
          <AppText className="mt-3 font-body">Lendo a fatura...</AppText>
          <AppText className="mt-1 text-center text-sm text-muted">
            O reconhecimento acontece somente neste aparelho.
          </AppText>
        </View>
      ) : (
        <View className="gap-3">
          <PrimaryButton label="Tirar foto" icon="camera" onPress={() => pickImage(true)} />
          <PrimaryButton
            label="Escolher da galeria"
            icon="images"
            variant="outline"
            onPress={() => pickImage(false)}
          />
        </View>
      )}
    </PaperScreen>
  );
}
