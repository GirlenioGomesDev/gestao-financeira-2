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
          <AppText className="mt-2 text-xs text-muted">
            Categorias: {Object.values(categoryLabels).join(', ')}
          </AppText>
        </ScrollView>
      </View>
    </Modal>
  );
}
