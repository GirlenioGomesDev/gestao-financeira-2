import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PaperScreen } from '@/components/PaperScreen';
import { SectionHeader } from '@/components/SectionHeader';
import { AppText } from '@/components/Text';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/format';

export default function ImportInvoiceScreen() {
  const imports = useFinanceStore(state => state.invoiceImports);

  return (
    <PaperScreen>
      <SectionHeader
        title="Importar Fatura"
        subtitle="Foto, PDF ou digitacao manual. Voce revisa tudo antes."
      />
      <View className="mb-5 flex-row gap-3">
        <ImportCard
          icon="camera"
          title="Foto"
          subtitle="Tirar ou escolher"
          onPress={() => router.push('/import-invoice/camera')}
        />
        <ImportCard
          icon="folder-open"
          title="PDF"
          subtitle="Importar arquivo"
          onPress={() => router.push('/import-invoice/pdf')}
        />
      </View>
      <Pressable
        onPress={() => router.push('/import-invoice/manual')}
        className="mb-6 flex-row items-center rounded-paper border border-line bg-surface p-4"
      >
        <Ionicons name="create-outline" size={24} color="#2F8F6B" />
        <AppText className="ml-3 font-body text-lg">Digitar manualmente</AppText>
      </Pressable>

      <View className="mb-3 flex-row items-center justify-between">
        <AppText className="font-body text-lg">Ultimas importacoes</AppText>
        <Pressable onPress={() => router.push('/import-history' as never)}>
          <AppText className="text-primaryDark">Ver tudo</AppText>
        </Pressable>
      </View>
      {imports.slice(0, 4).map(item => (
        <View key={item.id} className="mb-3 rounded-paper border border-line bg-surface p-4">
          <AppText className="font-body">
            {item.bank} • {item.referenceMonth}
          </AppText>
          <AppText className="mt-1 text-sm text-muted">
            {item.transactionCount} itens • {formatCurrency(item.totalAmount)}
          </AppText>
        </View>
      ))}
    </PaperScreen>
  );
}

function ImportCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center rounded-paper border border-line bg-surface p-5"
    >
      <Ionicons name={icon} size={30} color="#2F8F6B" />
      <AppText className="mt-3 font-body text-lg">{title}</AppText>
      <AppText className="mt-1 text-center text-xs text-muted">{subtitle}</AppText>
    </Pressable>
  );
}
