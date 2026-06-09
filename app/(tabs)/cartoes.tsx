import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PaperScreen } from '@/components/PaperScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { AppText } from '@/components/Text';
import { TransactionModal } from '@/components/TransactionModal';
import { useFinanceSummary } from '@/hooks/useFinanceSummary';
import { useFinanceStore } from '@/store/useFinanceStore';
import { categoryIcons, categoryLabels } from '@/utils/categories';
import { formatAmount, formatCurrency, formatShortDate } from '@/utils/format';

export default function CardsScreen() {
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>();
  const transactions = useFinanceStore(state => state.transactions);
  const { cardUsage } = useFinanceSummary();

  return (
    <PaperScreen>
      <SectionHeader title="Cartões" subtitle="Acompanhe cada fatura antes do fechamento." />

      {cardUsage.length ? (
        cardUsage.map(card => {
          const cardTransactions = transactions.filter(
            transaction => transaction.cardId === card.id,
          );

          return (
            <View key={card.id} className="mb-5 rounded-paper border border-line bg-surface p-4">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1">
                  <AppText className="font-body text-lg">{card.name}</AppText>
                  <AppText className="text-sm text-muted">{card.bank}</AppText>
                </View>
                <MaterialCommunityIcons name="credit-card-outline" size={26} color={card.color} />
              </View>

              <ProgressBar
                value={card.percent}
                color={card.percent > 0.85 ? '#E96C5F' : card.color}
              />
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1 rounded-paper bg-paper p-3">
                  <AppText className="text-xs text-muted">Gasto no mês</AppText>
                  <AppText className="mt-1 font-body text-coral">
                    {formatCurrency(card.spent)}
                  </AppText>
                </View>
                <View className="flex-1 rounded-paper bg-paper p-3">
                  <AppText className="text-xs text-muted">Disponível</AppText>
                  <AppText className="mt-1 font-body text-primaryDark">
                    {formatCurrency(card.available)}
                  </AppText>
                </View>
              </View>
              <AppText className="mt-3 text-xs text-muted">
                Limite {formatCurrency(card.totalLimit)} · fecha dia {card.closingDay} · vence dia{' '}
                {card.dueDay}
              </AppText>

              <AppText className="mb-2 mt-5 font-body">Lançamentos do cartão</AppText>
              {cardTransactions.length ? (
                cardTransactions.map(transaction => (
                  <View
                    key={transaction.id}
                    className="mb-2 flex-row items-center rounded-paper bg-paper p-3"
                  >
                    <MaterialCommunityIcons
                      name={categoryIcons[transaction.category]}
                      size={20}
                      color="#2F8F6B"
                    />
                    <View className="ml-3 flex-1">
                      <AppText className="font-body">{transaction.title}</AppText>
                      <AppText className="text-xs text-muted">
                        {categoryLabels[transaction.category]} · {formatShortDate(transaction.date)}
                      </AppText>
                    </View>
                    <AppText className="text-coral">
                      {formatAmount(transaction.amount, transaction.type)}
                    </AppText>
                  </View>
                ))
              ) : (
                <AppText className="mb-3 text-sm text-muted">
                  Nenhum lançamento associado a este cartão.
                </AppText>
              )}

              <PrimaryButton
                label="Adicionar gasto no cartão"
                icon="add-circle-outline"
                variant="outline"
                className="mt-2"
                onPress={() => setSelectedCardId(card.id)}
              />
            </View>
          );
        })
      ) : (
        <EmptyState
          emoji="💳"
          title="Nenhum cartão cadastrado."
          subtitle="Adicione um cartão nos Ajustes para acompanhar a fatura."
        />
      )}

      <TransactionModal
        visible={selectedCardId !== undefined}
        initialCardId={selectedCardId}
        onClose={() => setSelectedCardId(undefined)}
      />
    </PaperScreen>
  );
}
