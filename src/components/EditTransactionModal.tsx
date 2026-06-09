import { Modal, Pressable, ScrollView, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { EditableField } from '@/components/EditableField';
import { AppText, DisplayText } from '@/components/Text';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction } from '@/types/finance';
import { categoryLabels, spendingCategories } from '@/utils/categories';

type Props = {
  transaction: Transaction | null;
  onClose: () => void;
};

export function EditTransactionModal({ transaction, onClose }: Props) {
  const updateTransaction = useFinanceStore(state => state.updateTransaction);
  const creditCards = useFinanceStore(state => state.creditCards);
  const accounts = useFinanceStore(state => state.accounts);

  if (!transaction) {
    return null;
  }

  return (
    <Modal visible animationType="slide" transparent>
      <View className="flex-1 justify-end bg-ink/30">
        <ScrollView
          className="max-h-[90%] rounded-t-3xl bg-paper"
          contentContainerClassName="p-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-4 flex-row items-center justify-between">
            <DisplayText className="text-3xl">Editar lancamento</DisplayText>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-line"
            >
              <AppText>X</AppText>
            </Pressable>
          </View>
          <EditableField
            value={transaction.title}
            type="text"
            label="Descricao"
            displayStyle="card"
            onSave={value => updateTransaction(transaction.id, { title: String(value) })}
          />
          <DateField
            value={transaction.date}
            label="Data do lançamento"
            onChange={date => updateTransaction(transaction.id, { date })}
          />
          <EditableField
            value={transaction.amount}
            type="currency"
            label="Valor"
            displayStyle="card"
            onSave={value => updateTransaction(transaction.id, { amount: Number(value) })}
          />
          <EditableField
            value={transaction.type === 'income' ? 'income' : 'expense'}
            type="select"
            label="Tipo"
            options={['income', 'expense']}
            displayStyle="card"
            onSave={value =>
              updateTransaction(transaction.id, { type: value === 'income' ? 'income' : 'expense' })
            }
          />
          <EditableField
            value={transaction.category}
            type="select"
            label="Categoria"
            options={spendingCategories.concat('renda').map(category => category)}
            displayStyle="card"
            onSave={value =>
              updateTransaction(transaction.id, {
                category: String(value) as Transaction['category'],
              })
            }
          />
          <EditableField
            value={transaction.responsible ?? ''}
            type="text"
            label="Responsável"
            placeholder="Ex: João, Maria, Filhos..."
            displayStyle="card"
            onSave={value =>
              updateTransaction(transaction.id, {
                responsible: String(value).trim() || undefined,
              })
            }
          />
          <EditableField
            value={transaction.purchaseLocation ?? ''}
            type="text"
            label="Onde foi"
            placeholder="Ex: Mercadão, iFood, Amazon..."
            displayStyle="card"
            onSave={value =>
              updateTransaction(transaction.id, {
                purchaseLocation: String(value).trim() || undefined,
              })
            }
          />
          {transaction.type === 'expense' ? (
            <>
              <AppText className="mt-3 text-xs uppercase text-muted">Forma de pagamento</AppText>
              <View className="mt-2">
                <AppText className="mb-1 text-sm text-muted">Cartão (opcional)</AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                >
                  <Pressable
                    onPress={() => updateTransaction(transaction.id, { cardId: undefined })}
                    className={`rounded-full border px-4 py-2 ${
                      !transaction.cardId
                        ? 'border-primaryDark bg-primaryDark'
                        : 'border-line bg-surface'
                    }`}
                  >
                    <AppText
                      className={!transaction.cardId ? 'text-sm text-white' : 'text-sm text-ink'}
                    >
                      Nenhum
                    </AppText>
                  </Pressable>
                  {creditCards.map(card => (
                    <Pressable
                      key={card.id}
                      onPress={() =>
                        updateTransaction(transaction.id, {
                          cardId: card.id,
                          accountId: undefined,
                        })
                      }
                      className={`rounded-full border px-4 py-2 ${
                        transaction.cardId === card.id
                          ? 'border-primaryDark bg-primaryDark'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <AppText
                        className={
                          transaction.cardId === card.id ? 'text-sm text-white' : 'text-sm text-ink'
                        }
                      >
                        {card.name}
                      </AppText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {accounts.length > 0 ? (
                <View className="mt-3">
                  <AppText className="mb-1 text-sm text-muted">Conta (opcional)</AppText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2"
                  >
                    <Pressable
                      onPress={() => updateTransaction(transaction.id, { accountId: undefined })}
                      className={`rounded-full border px-4 py-2 ${
                        !transaction.accountId
                          ? 'border-primaryDark bg-primaryDark'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <AppText
                        className={
                          !transaction.accountId ? 'text-sm text-white' : 'text-sm text-ink'
                        }
                      >
                        Nenhuma
                      </AppText>
                    </Pressable>
                    {accounts.map(account => (
                      <Pressable
                        key={account.id}
                        onPress={() =>
                          updateTransaction(transaction.id, {
                            accountId: account.id,
                            cardId: undefined,
                          })
                        }
                        className={`rounded-full border px-4 py-2 ${
                          transaction.accountId === account.id
                            ? 'border-primaryDark bg-primaryDark'
                            : 'border-line bg-surface'
                        }`}
                      >
                        <AppText
                          className={
                            transaction.accountId === account.id
                              ? 'text-sm text-white'
                              : 'text-sm text-ink'
                          }
                        >
                          {account.name}
                        </AppText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </>
          ) : null}
          <AppText className="mt-2 text-xs text-muted">
            Categorias: {Object.values(categoryLabels).join(', ')}
          </AppText>
        </ScrollView>
      </View>
    </Modal>
  );
}
