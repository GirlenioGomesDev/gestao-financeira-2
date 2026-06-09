import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { DiaryModal } from '@/components/DiaryModal';
import { EditableField } from '@/components/EditableField';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AppText, DisplayText } from '@/components/Text';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatLongDate } from '@/utils/format';

const moodColors = {
  tranquilo: '#2F8F6B',
  apertado: '#E96C5F',
  animado: '#F5B84B',
  alerta: '#9A86C8',
};

export default function DiaryScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [addingHabit, setAddingHabit] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const habits = useFinanceStore(state => state.habits);
  const diary = useFinanceStore(state => state.diary);
  const toggleHabit = useFinanceStore(state => state.toggleHabit);
  const addHabit = useFinanceStore(state => state.addHabit);
  const removeHabit = useFinanceStore(state => state.removeHabit);
  const updateDiaryEntry = useFinanceStore(state => state.updateDiaryEntry);

  function saveHabit() {
    const title = habitTitle.trim();
    if (!title) return;
    addHabit({ title, streak: 0, doneToday: false, emoji: '✓' });
    setHabitTitle('');
    setAddingHabit(false);
  }

  return (
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerClassName="px-5 pb-32 pt-14"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-6">
        <AppText className="text-xs uppercase text-muted">Diário</AppText>
        <DisplayText className="text-4xl">Registros</DisplayText>
        <AppText className="text-sm text-muted">hábitos pequenos também contam história</AppText>
      </View>
      <View className="mb-5 flex-row gap-2">
        <Pressable
          onPress={() => setModalVisible(true)}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-pill bg-primaryDark py-3"
        >
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          <AppText className="text-sm text-white">Nova nota</AppText>
        </Pressable>
        <Pressable
          onPress={() => setAddingHabit(value => !value)}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-pill border border-line bg-surface py-3"
        >
          <Ionicons name={addingHabit ? 'close' : 'add'} size={16} color="#1E7055" />
          <AppText className="text-sm text-primaryDark">Hábito</AppText>
        </Pressable>
      </View>

      <View className="my-5">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText className="font-body text-lg">Hábitos financeiros</AppText>
          <Pressable
            onPress={() => setAddingHabit(value => !value)}
            className="h-9 w-9 items-center justify-center rounded-full border border-primary"
          >
            <Ionicons name={addingHabit ? 'close' : 'add'} size={20} color="#2F8F6B" />
          </Pressable>
        </View>
        {addingHabit ? (
          <View className="mb-3 rounded-card border border-line bg-surface p-3">
            <TextInput
              value={habitTitle}
              onChangeText={setHabitTitle}
              placeholder="Ex: Conferir o saldo antes de comprar"
              placeholderTextColor="#9A9085"
              className="rounded-card border border-line bg-paper px-4 py-3 font-body text-base text-ink"
            />
            <PrimaryButton
              label="Adicionar hábito"
              icon="checkmark"
              className="mt-3"
              onPress={saveHabit}
            />
          </View>
        ) : null}
        {habits.map(habit => (
          <View
            key={habit.id}
            className={`mb-3 flex-row items-center rounded-card border p-4 ${
              habit.doneToday ? 'border-primaryDark bg-primary/10' : 'border-line bg-surface'
            }`}
          >
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-paper">
              <AppText className="font-body">{habit.emoji}</AppText>
            </View>
            <View className="flex-1">
              <AppText className="font-body">{habit.title}</AppText>
              <AppText className="mt-1 text-xs text-muted">{habit.streak} dias seguidos</AppText>
            </View>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                toggleHabit(habit.id);
              }}
              className="h-10 w-10 items-center justify-center"
            >
              <Ionicons
                name={habit.doneToday ? 'checkmark-circle' : 'ellipse-outline'}
                size={26}
                color="#2F8F6B"
              />
            </Pressable>
            <Pressable
              onPress={() =>
                Alert.alert('Excluir hábito?', 'O histórico de sequência será removido.', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => removeHabit(habit.id),
                  },
                ])
              }
              className="h-10 w-10 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#E96C5F" />
            </Pressable>
          </View>
        ))}
      </View>

      <AppText className="mb-3 font-body text-lg">Notas recentes</AppText>
      {diary.length ? (
        diary.map(entry => (
          <View key={entry.id} className="mb-3 rounded-card border border-line bg-surface p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText className="text-sm text-muted">{formatLongDate(entry.date)}</AppText>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${moodColors[entry.mood]}22` }}
              >
                <AppText className="text-xs" style={{ color: moodColors[entry.mood] }}>
                  {entry.mood}
                </AppText>
              </View>
            </View>
            <EditableField
              value={entry.text || 'Sem texto, só o registro do sentimento.'}
              type="multiline"
              displayStyle="inline"
              onSave={value => updateDiaryEntry(entry.id, { text: String(value) })}
            />
          </View>
        ))
      ) : (
        <EmptyState
          emoji="✍️"
          title="Seu diário está em branco."
          subtitle="Como foi seu dia financeiro hoje?"
        />
      )}

      <DiaryModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </ScrollView>
  );
}
