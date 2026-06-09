import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { AppText, DisplayText } from '@/components/Text';
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
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerClassName="px-5 pb-32 pt-14"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-6">
        <AppText className="text-xs uppercase text-muted">Cartões</AppText>
        <DisplayText className="text-4xl">Faturas</DisplayText>
        <AppText className="text-sm text-muted">acompanhe antes do fechamento</AppText>
      </View>

      {cardUsage.length ? (
        cardUsage.map(card => {
          const cardTransactions = transactions.filter(
            transaction => transaction.cardId === card.id,
          );
          const activeInstallments = cardTransactions.filter(
            transaction =>
              transaction.installmentTotal &&
              transaction.installmentCurrent &&
              transaction.installmentCurrent < transaction.installmentTotal,
          ).length;
          const isWarning = card.percent > 0.85;

          return (
            <View key={card.id} className="mb-6">
              <View
                className="mb-3 overflow-hidden rounded-card p-5 shadow-card"
                style={{ backgroundColor: card.color }}
              >
                <View className="mb-4 flex-row items-start justify-between">
                  <View>
                    <AppText className="text-xs text-white/60">{card.bank}</AppText>
                    <AppText className="mt-0.5 font-body text-xl text-white">{card.name}</AppText>
                    {activeInstallments > 0 ? (
                      <View className="mt-2 self-start rounded-pill bg-white/20 px-2 py-1">
                        <AppText className="text-xs text-white">
                          {activeInstallments} parcelas ativas
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={28}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
                <ProgressBar value={card.percent} color="rgba(255,255,255,0.9)" />
                <View className="mt-3 flex-row justify-between">
                  <View>
                    <AppText className="text-xs text-white/60">Gasto</AppText>
                    <AppText className="font-body text-white">{formatCurrency(card.spent)}</AppText>
                  </View>
                  <View className="items-end">
                    <AppText className="text-xs text-white/60">Disponível</AppText>
                    <AppText className="font-body text-white">
                      {formatCurrency(card.available)}
                    </AppText>
                  </View>
                </View>
                <View className="mt-3 flex-row justify-between">
                  <AppText className="text-xs text-white/60">Fecha dia {card.closingDay}</AppText>
                  <AppText className="text-xs text-white/60">Vence dia {card.dueDay}</AppText>
                  <AppText className="text-xs text-white/60">
                    Limite {formatCurrency(card.totalLimit)}
                  </AppText>
                </View>
              </View>

              {isWarning ? (
                <View className="mb-3 flex-row items-center gap-2 rounded-xl bg-negative px-3 py-2">
                  <Ionicons name="warning-outline" size={16} color="#E96C5F" />
                  <AppText className="text-xs text-coral">Limite quase atingido</AppText>
                </View>
              ) : null}

              <View className="rounded-card border border-line bg-surface p-4 shadow-card">
                <View className="mb-3 flex-row items-center justify-between">
                  <AppText className="font-body text-sm">Lançamentos</AppText>
                  <Pressable
                    onPress={() => setSelectedCardId(card.id)}
                    className="flex-row items-center gap-1 rounded-pill bg-positive px-3 py-1.5"
                  >
                    <Ionicons name="add" size={14} color="#1E7055" />
                    <AppText className="text-xs text-primaryDark">Adicionar</AppText>
                  </Pressable>
                </View>

                {cardTransactions.length ? (
                  cardTransactions.map(transaction => (
                    <View
                      key={transaction.id}
                      className="mb-2 flex-row items-center border-b border-line pb-2"
                    >
                      <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-paper">
                        <MaterialCommunityIcons
                          name={categoryIcons[transaction.category]}
                          size={16}
                          color="#1E7055"
                        />
                      </View>
                      <View className="flex-1">
                        <AppText className="text-sm">{transaction.title}</AppText>
                        <AppText className="text-xs text-muted">
                          {categoryLabels[transaction.category]} ·{' '}
                          {formatShortDate(transaction.date)}
                        </AppText>
                        {transaction.responsible || transaction.purchaseLocation ? (
                          <AppText className="text-xs text-muted">
                            {[transaction.responsible, transaction.purchaseLocation]
                              .filter(Boolean)
                              .join(' · ')}
                          </AppText>
                        ) : null}
                        {transaction.installmentTotal ? (
                          <AppText className="text-xs text-lavender">
                            {transaction.installmentCurrent}/{transaction.installmentTotal} parcelas
                          </AppText>
                        ) : null}
                      </View>
                      <AppText className="text-sm text-coral">
                        {formatAmount(transaction.amount, transaction.type)}
                      </AppText>
                    </View>
                  ))
                ) : (
                  <AppText className="text-sm text-muted">
                    Nenhum lançamento associado ainda.
                  </AppText>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <EmptyState
          emoji="R$"
          title="Nenhum cartão cadastrado."
          subtitle="Adicione um nos Ajustes."
        />
      )}

      <TransactionModal
        visible={selectedCardId !== undefined}
        initialCardId={selectedCardId}
        onClose={() => setSelectedCardId(undefined)}
      />
    </ScrollView>
  );
}
