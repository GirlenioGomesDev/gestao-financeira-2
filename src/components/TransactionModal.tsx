import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { DateField } from '@/components/DateField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AppText, DisplayText } from '@/components/Text';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction, TransactionCategory, TransactionType } from '@/types/finance';
import { categoryLabels, incomeCategories, spendingCategories } from '@/utils/categories';
import { formatCurrency } from '@/utils/format';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  title: z.string().min(2, 'Escreva um nome curto.'),
  amount: z.coerce.number().positive('Digite um valor maior que zero.'),
  category: z.custom<TransactionCategory>(),
  note: z.string().optional(),
  date: z.string(),
  responsible: z.string().optional(),
  purchaseLocation: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card']).default('cash'),
  installments: z.coerce.number().int().min(1).max(48).default(1),
  cardId: z.string().optional(),
  accountId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  visible: boolean;
  onClose: () => void;
  initialCardId?: string;
};

function getDefaultValues(initialCardId?: string): FormValues {
  return {
    type: 'expense',
    title: '',
    amount: 0,
    category: 'mercado',
    note: '',
    date: new Date().toISOString(),
    responsible: '',
    purchaseLocation: '',
    paymentMethod: initialCardId ? 'card' : 'cash',
    installments: 1,
    cardId: initialCardId,
    accountId: undefined,
  };
}

function getInstallmentDate(baseDate: Date, offset: number) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + offset;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(baseDate.getDate(), lastDay), 12);
}

export function TransactionModal({ visible, onClose, initialCardId }: Props) {
  const addTransaction = useFinanceStore(state => state.addTransaction);
  const addTransactions = useFinanceStore(state => state.addTransactions);
  const accounts = useFinanceStore(state => state.accounts);
  const creditCards = useFinanceStore(state => state.creditCards);
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialCardId),
  });
  const type = watch('type');
  const paymentMethod = watch('paymentMethod');
  const installments = watch('installments');
  const currentAmount = watch('amount');

  useEffect(() => {
    if (visible) reset(getDefaultValues(initialCardId));
  }, [initialCardId, reset, visible]);

  function submit(values: FormValues) {
    const { paymentMethod: method, installments: total, cardId, accountId, ...rest } = values;
    const common = {
      type: rest.type,
      category: rest.category,
      note: rest.note || undefined,
      responsible: rest.responsible || undefined,
      purchaseLocation: rest.purchaseLocation || undefined,
      cardId: rest.type === 'expense' && method === 'card' ? cardId : undefined,
      accountId: rest.type === 'expense' && method === 'cash' ? accountId : undefined,
    };

    if (rest.type === 'expense' && total > 1) {
      const baseDate = new Date(rest.date);
      const installmentBase = Number((rest.amount / total).toFixed(2));
      const difference = Number((rest.amount - installmentBase * total).toFixed(2));
      const transactions: Array<Omit<Transaction, 'id'>> = Array.from(
        { length: total },
        (_, index) => ({
          ...common,
          title: `${rest.title} (${index + 1}/${total})`,
          amount: index === 0 ? installmentBase + difference : installmentBase,
          date: getInstallmentDate(baseDate, index).toISOString(),
          installmentCurrent: index + 1,
          installmentTotal: total,
        }),
      );
      addTransactions(transactions);
    } else {
      addTransaction({
        ...common,
        title: rest.title,
        amount: rest.amount,
        date: rest.date,
        installmentCurrent: null,
        installmentTotal: null,
      });
    }

    reset(getDefaultValues(initialCardId));
    onClose();
  }

  const categories = type === 'income' ? incomeCategories : spendingCategories;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-ink/30"
      >
        <ScrollView
          className="max-h-[92%] rounded-t-3xl bg-paper"
          contentContainerClassName="px-6 pb-8 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-4 flex-row items-center justify-between">
            <DisplayText className="text-3xl">Novo lançamento</DisplayText>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-line"
            >
              <AppText className="font-body text-lg">X</AppText>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <View className="mb-4 flex-row rounded-paper bg-line p-1">
                {(['expense', 'income'] as TransactionType[]).map(item => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      onChange(item);
                      setValue('category', item === 'income' ? 'renda' : 'mercado');
                    }}
                    className={`flex-1 rounded-paper py-3 ${value === item ? 'bg-surface' : ''}`}
                  >
                    <AppText className="text-center font-body">
                      {item === 'expense' ? 'Despesa' : 'Receita'}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            )}
          />

          <FieldError message={errors.title?.message} />
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Ex: feira, luz, freela"
                placeholderTextColor="#9A9085"
                className="mb-3 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          <FieldError message={errors.amount?.message} />
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <TextInput
                value={field.value ? String(field.value) : ''}
                onChangeText={text => field.onChange(text.replace(',', '.'))}
                keyboardType="decimal-pad"
                placeholder="Valor em reais"
                placeholderTextColor="#9A9085"
                className="mb-3 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          <AppText className="mb-2 text-sm text-muted">Categoria</AppText>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <View className="mb-4 flex-row flex-wrap gap-2">
                {categories.map(category => (
                  <Pressable
                    key={category}
                    onPress={() => field.onChange(category)}
                    className={`rounded-full border px-3 py-2 ${
                      field.value === category
                        ? 'border-primary bg-primary/10'
                        : 'border-line bg-surface'
                    }`}
                  >
                    <AppText className="text-sm">{categoryLabels[category]}</AppText>
                  </Pressable>
                ))}
              </View>
            )}
          />

          {type === 'expense' ? (
            <>
              <AppText className="mb-1 mt-3 text-sm text-muted">Forma de pagamento</AppText>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <View className="mb-3 flex-row rounded-paper bg-line p-1">
                    {(['cash', 'card'] as const).map(method => (
                      <Pressable
                        key={method}
                        onPress={() => {
                          field.onChange(method);
                          if (method === 'cash') setValue('cardId', undefined);
                          if (method === 'card') setValue('accountId', undefined);
                        }}
                        className={`flex-1 rounded-paper py-3 ${
                          field.value === method ? 'bg-surface' : ''
                        }`}
                      >
                        <AppText className="text-center font-body">
                          {method === 'cash' ? 'Dinheiro/Conta' : 'Cartão'}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                )}
              />

              {paymentMethod === 'cash' && accounts.length > 0 ? (
                <Controller
                  control={control}
                  name="accountId"
                  render={({ field }) => (
                    <View className="mb-3">
                      <AppText className="mb-1 text-sm text-muted">Conta (opcional)</AppText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="gap-2"
                      >
                        {accounts.map(account => (
                          <Pressable
                            key={account.id}
                            onPress={() =>
                              field.onChange(field.value === account.id ? undefined : account.id)
                            }
                            className={`rounded-full border px-4 py-2 ${
                              field.value === account.id
                                ? 'border-primaryDark bg-primaryDark'
                                : 'border-line bg-surface'
                            }`}
                          >
                            <AppText
                              className={
                                field.value === account.id
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
                  )}
                />
              ) : null}

              {paymentMethod === 'card' ? (
                <Controller
                  control={control}
                  name="cardId"
                  render={({ field }) => (
                    <View className="mb-3">
                      <AppText className="mb-1 text-sm text-muted">Cartão</AppText>
                      {creditCards.length === 0 ? (
                        <AppText className="text-sm text-coral">
                          Nenhum cartão cadastrado. Adicione um em Ajustes.
                        </AppText>
                      ) : (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerClassName="gap-2"
                        >
                          {creditCards.map(card => (
                            <Pressable
                              key={card.id}
                              onPress={() => field.onChange(card.id)}
                              className={`rounded-full border px-4 py-2 ${
                                field.value === card.id
                                  ? 'border-primaryDark bg-primaryDark'
                                  : 'border-line bg-surface'
                              }`}
                            >
                              <AppText
                                className={
                                  field.value === card.id
                                    ? 'text-sm text-white'
                                    : 'text-sm text-ink'
                                }
                              >
                                {card.name}
                              </AppText>
                            </Pressable>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  )}
                />
              ) : null}

              <AppText className="mb-1 mt-3 text-sm text-muted">Parcelas</AppText>
              <Controller
                control={control}
                name="installments"
                render={({ field }) => (
                  <View className="mb-3 flex-row flex-wrap gap-2">
                    {[1, 2, 3, 4, 6, 10, 12, 18, 24].map(value => (
                      <Pressable
                        key={value}
                        onPress={() => field.onChange(value)}
                        className={`rounded-full border px-4 py-2 ${
                          field.value === value
                            ? 'border-primaryDark bg-primaryDark'
                            : 'border-line bg-surface'
                        }`}
                      >
                        <AppText
                          className={
                            field.value === value ? 'text-sm text-white' : 'text-sm text-ink'
                          }
                        >
                          {value === 1 ? 'À vista' : `${value}x`}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                )}
              />

              {installments > 1 ? (
                <View className="mb-3 rounded-paper border border-line bg-surface p-3">
                  <AppText className="text-sm text-muted">
                    {installments}x de {formatCurrency((Number(currentAmount) || 0) / installments)}{' '}
                    por mês
                  </AppText>
                </View>
              ) : null}
            </>
          ) : null}

          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DateField value={field.value} onChange={field.onChange} label="Data do lançamento" />
            )}
          />

          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Observação (opcional)"
                placeholderTextColor="#9A9085"
                multiline
                className="mb-3 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          <Controller
            control={control}
            name="responsible"
            render={({ field }) => (
              <View className="mb-3">
                <AppText className="mb-1 text-sm text-muted">Responsável (opcional)</AppText>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Ex: João, Maria, Filhos..."
                  placeholderTextColor="#9A9085"
                  className="rounded-paper border border-line bg-paper px-4 py-3 font-body text-base text-ink"
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="purchaseLocation"
            render={({ field }) => (
              <View className="mb-3">
                <AppText className="mb-1 text-sm text-muted">Onde foi (opcional)</AppText>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Ex: Mercadão, iFood, Amazon..."
                  placeholderTextColor="#9A9085"
                  className="rounded-paper border border-line bg-paper px-4 py-3 font-body text-base text-ink"
                />
              </View>
            )}
          />

          <PrimaryButton label="Salvar" icon="checkmark" onPress={handleSubmit(submit)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <AppText className="mb-1 text-xs text-coral">{message}</AppText>;
}
