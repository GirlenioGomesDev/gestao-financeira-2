import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/Text';
import { formatCurrency } from '@/utils/format';

type EditableFieldProps = {
  value: string | number;
  type: 'text' | 'currency' | 'number' | 'date' | 'select' | 'multiline';
  label?: string;
  options?: string[];
  onSave: (newValue: string | number) => void;
  displayStyle?: 'inline' | 'card' | 'title' | 'subtitle';
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  validation?: (value: string | number) => string | null;
};

export function EditableField({
  value,
  type,
  label,
  options = [],
  onSave,
  displayStyle = 'inline',
  prefix,
  suffix,
  placeholder,
  validation,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [showPencil, setShowPencil] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(String(value ?? ''));
  }, [value]);

  const editStyle = {
    borderColor: savedFlash ? '#2F8F6B' : editing ? '#7DB7D9' : 'transparent',
    backgroundColor: savedFlash ? '#E8F6EF' : 'transparent',
  };

  const textClass =
    displayStyle === 'title'
      ? 'font-body text-2xl'
      : displayStyle === 'subtitle'
        ? 'text-sm text-muted'
        : displayStyle === 'card'
          ? 'font-body text-base'
          : 'text-base';

  const formatted =
    type === 'currency' && typeof value === 'number'
      ? formatCurrency(value)
      : `${prefix ?? ''}${String(value ?? '')}${suffix ?? ''}`;

  function save() {
    const nextValue =
      type === 'currency' || type === 'number' ? Number(draft.replace(',', '.')) || 0 : draft;
    const message = validation?.(nextValue);
    if (message) {
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    onSave(nextValue);
    setEditing(false);
    setShowPencil(false);
    setError(null);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 650);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  if (editing) {
    return (
      <View className="my-1 rounded-paper border p-2" style={editStyle}>
        {label ? <AppText className="mb-1 text-xs text-muted">{label}</AppText> : null}
        {type === 'select' ? (
          <View className="flex-row flex-wrap gap-2">
            {options.map(option => (
              <Pressable
                key={option}
                onPress={() => setDraft(option)}
                className={`rounded-full border px-3 py-2 ${draft === option ? 'border-primary bg-primary/10' : 'border-line bg-surface'}`}
              >
                <AppText className="text-sm">{option}</AppText>
              </Pressable>
            ))}
          </View>
        ) : (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline={type === 'multiline'}
            keyboardType={type === 'currency' || type === 'number' ? 'decimal-pad' : 'default'}
            placeholder={placeholder}
            placeholderTextColor="#9A9085"
            className="rounded-paper bg-surface px-3 py-2 font-body text-base text-ink"
          />
        )}
        {error ? <AppText className="mt-1 text-xs text-coral">{error}</AppText> : null}
        <View className="mt-2 flex-row gap-2">
          <Pressable onPress={save} className="rounded-paper bg-primary px-3 py-2">
            <AppText className="text-white">Salvar</AppText>
          </Pressable>
          <Pressable
            onPress={() => {
              setDraft(String(value ?? ''));
              setEditing(false);
              setError(null);
            }}
            className="rounded-paper border border-line px-3 py-2"
          >
            <AppText>Cancelar</AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`${displayStyle === 'card' ? 'rounded-paper border border-line bg-surface p-3' : 'rounded-paper border p-1'}`}
      style={editStyle}
    >
      {label ? <AppText className="mb-1 text-xs text-muted">{label}</AppText> : null}
      <Pressable
        onLongPress={() => {
          setShowPencil(true);
          Haptics.selectionAsync();
        }}
        delayLongPress={400}
        onPress={() => setEditing(true)}
        className="flex-row items-center"
      >
        <AppText className={`${textClass} flex-1`}>{formatted}</AppText>
        {showPencil || displayStyle === 'card' ? (
          <Pressable
            onPress={() => setEditing(true)}
            className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-paper"
          >
            <Ionicons name="pencil" size={15} color="#2F8F6B" />
          </Pressable>
        ) : null}
      </Pressable>
    </View>
  );
}
