import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
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
import { AppText, DisplayText } from '@/components/Text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useFinanceStore } from '@/store/useFinanceStore';
import { TransactionCategory, TransactionType } from '@/types/finance';
import { categoryLabels, spendingCategories } from '@/utils/categories';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  title: z.string().min(2, 'Escreva um nome curto.'),
  amount: z.coerce.number().positive('Digite um valor maior que zero.'),
  category: z.custom<TransactionCategory>(),
  note: z.string().optional(),
  date: z.string(),
  cardId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  visible: boolean;
  onClose: () => void;
  initialCardId?: string;
};

export function TransactionModal({ visible, onClose, initialCardId }: Props) {
  const addTransaction = useFinanceStore(state => state.addTransaction);
  const creditCards = useFinanceStore(state => state.creditCards);
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      title: '',
      amount: 0,
      category: 'mercado',
      note: '',
      date: new Date().toISOString(),
      cardId: initialCardId,
    },
  });
  const type = watch('type');

  useEffect(() => {
    if (!visible) return;
    reset({
      type: 'expense',
      title: '',
      amount: 0,
      category: 'mercado',
      note: '',
      date: new Date().toISOString(),
      cardId: initialCardId,
    });
  }, [initialCardId, reset, visible]);

  function submit(values: FormValues) {
    addTransaction({
      ...values,
      category: values.type === 'income' ? 'renda' : values.category,
      cardId: values.type === 'income' ? undefined : values.cardId,
    });
    reset();
    onClose();
  }

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
            <DisplayText className="text-3xl">Novo lancamento</DisplayText>
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
                    onPress={() => onChange(item)}
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
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
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
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value ? String(value) : ''}
                onChangeText={text => onChange(text.replace(',', '.'))}
                keyboardType="decimal-pad"
                placeholder="Valor em reais"
                placeholderTextColor="#9A9085"
                className="mb-3 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          {type === 'expense' ? (
            <>
              <Controller
                control={control}
                name="category"
                render={({ field: { value, onChange } }) => (
                  <View className="mb-4 flex-row flex-wrap gap-2">
                    {spendingCategories.map(category => (
                      <Pressable
                        key={category}
                        onPress={() => onChange(category)}
                        className={`rounded-full border px-3 py-2 ${
                          value === category
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
              {creditCards.length ? (
                <Controller
                  control={control}
                  name="cardId"
                  render={({ field: { value, onChange } }) => (
                    <View className="mb-4">
                      <AppText className="mb-2 text-sm text-muted">Cartão</AppText>
                      <View className="flex-row flex-wrap gap-2">
                        <Pressable
                          onPress={() => onChange(undefined)}
                          className={`rounded-full border px-3 py-2 ${
                            !value ? 'border-primary bg-primary/10' : 'border-line bg-surface'
                          }`}
                        >
                          <AppText className="text-sm">Sem cartão</AppText>
                        </Pressable>
                        {creditCards.map(card => (
                          <Pressable
                            key={card.id}
                            onPress={() => onChange(card.id)}
                            className={`rounded-full border px-3 py-2 ${
                              value === card.id
                                ? 'border-primary bg-primary/10'
                                : 'border-line bg-surface'
                            }`}
                          >
                            <AppText className="text-sm">{card.name}</AppText>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                />
              ) : null}
            </>
          ) : null}

          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <DateField value={value} onChange={onChange} label="Data do lançamento" />
            )}
          />

          <PrimaryButton label="Salvar" icon="checkmark" onPress={handleSubmit(submit)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <AppText className="mb-1 text-xs text-coral">{message}</AppText>;
}
