import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { AppText, DisplayText } from '@/components/Text';
import { useFinanceStore } from '@/store/useFinanceStore';
import { DiaryEntry } from '@/types/finance';

type FormValues = {
  mood: DiaryEntry['mood'];
  text: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const moods: Array<{ value: DiaryEntry['mood']; label: string }> = [
  { value: 'tranquilo', label: 'Tranquilo' },
  { value: 'apertado', label: 'Apertado' },
  { value: 'animado', label: 'Animado' },
  { value: 'alerta', label: 'Alerta' },
];

export function DiaryModal({ visible, onClose }: Props) {
  const addDiaryEntry = useFinanceStore(state => state.addDiaryEntry);
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { mood: 'tranquilo', text: '' },
  });

  function submit(values: FormValues) {
    addDiaryEntry({ ...values, date: new Date().toISOString() });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-ink/30"
      >
        <View className="rounded-t-3xl bg-paper px-6 pb-8 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <DisplayText className="text-3xl">Nota do dia</DisplayText>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-line"
            >
              <AppText className="font-body text-lg">X</AppText>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="mood"
            render={({ field: { value, onChange } }) => (
              <View className="mb-4 flex-row flex-wrap gap-2">
                {moods.map(mood => (
                  <Pressable
                    key={mood.value}
                    onPress={() => onChange(mood.value)}
                    className={`rounded-full border px-3 py-2 ${
                      value === mood.value
                        ? 'border-primary bg-primary/10'
                        : 'border-line bg-surface'
                    }`}
                  >
                    <AppText className="text-sm">{mood.label}</AppText>
                  </Pressable>
                ))}
              </View>
            )}
          />

          <Controller
            control={control}
            name="text"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                multiline
                placeholder="O que voce percebeu sobre seu dinheiro hoje?"
                placeholderTextColor="#9A9085"
                className="mb-5 min-h-28 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
                textAlignVertical="top"
              />
            )}
          />

          <PrimaryButton label="Guardar nota" icon="journal" onPress={handleSubmit(submit)} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
