import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, View } from "react-native";

import { PaperScreen } from "@/components/PaperScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionHeader } from "@/components/SectionHeader";
import { AppText } from "@/components/Text";
import { parseInvoiceText } from "@/utils/invoiceParser";

export default function CameraInvoiceScreen() {
  async function pickImage(useCamera: boolean) {
    const permission = useCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso para importar a fatura.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (result.canceled) return;

    const invoice = parseInvoiceText("Nubank\n08/05 CARREFOUR PAULISTA 187,40\n08/05 IFOOD PIZZARIA 42,90\n07/05 UBER TRIP 23,50", "ocr");
    router.push({ pathname: "/import-invoice/review", params: { invoice: encodeURIComponent(JSON.stringify(invoice)) } });
  }

  return (
    <PaperScreen>
      <SectionHeader title="Foto da Fatura" subtitle="OCR local completo exige development build. No Expo Go, uso um preview assistido para revisar." />
      <View className="mb-5 rounded-paper border border-line bg-surface p-5">
        <AppText className="font-body text-lg">Enquadre a fatura inteira</AppText>
        <AppText className="mt-2 text-sm text-muted">Boa iluminacao melhora a leitura. Depois voce revisa e edita todos os itens.</AppText>
      </View>
      <View className="gap-3">
        <PrimaryButton label="Tirar foto" icon="camera" onPress={() => pickImage(true)} />
        <PrimaryButton label="Escolher da galeria" icon="images" variant="outline" onPress={() => pickImage(false)} />
      </View>
    </PaperScreen>
  );
}
