import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { z } from 'zod';

import { AppText } from '@/components/Text';

type Props = {
  value: string;
  onChange: (iso: string) => void;
  label: string;
};

const datePartsSchema = z.object({
  day: z.number().int().min(1).max(31),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
});

function dateParts(value: string) {
  const date = new Date(value);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return {
    day: String(safeDate.getDate()).padStart(2, '0'),
    month: String(safeDate.getMonth() + 1).padStart(2, '0'),
    year: String(safeDate.getFullYear()),
  };
}

export function DateField({ value, onChange, label }: Props) {
  const initial = dateParts(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  useEffect(() => {
    const next = dateParts(value);
    setDay(next.day);
    setMonth(next.month);
    setYear(next.year);
  }, [value]);

  function updateDate(nextDay: string, nextMonth: string, nextYear: string) {
    const numericDay = Number(nextDay);
    const numericMonth = Number(nextMonth);
    const numericYear = Number(nextYear);
    const currentYear = new Date().getFullYear();

    const parsed = datePartsSchema.safeParse({
      day: numericDay,
      month: numericMonth,
      year: numericYear,
    });
    if (!parsed.success || numericYear < currentYear - 2 || numericYear > currentYear + 2) {
      return;
    }

    const nextDate = new Date(numericYear, numericMonth - 1, numericDay, 12);
    if (
      nextDate.getDate() !== numericDay ||
      nextDate.getMonth() !== numericMonth - 1 ||
      nextDate.getFullYear() !== numericYear
    ) {
      return;
    }

    onChange(nextDate.toISOString());
  }

  function updateDay(text: string) {
    const next = text.replace(/\D/g, '').slice(0, 2);
    setDay(next);
    updateDate(next, month, year);
  }

  function updateMonth(text: string) {
    const next = text.replace(/\D/g, '').slice(0, 2);
    setMonth(next);
    updateDate(day, next, year);
  }

  function updateYear(text: string) {
    const next = text.replace(/\D/g, '').slice(0, 4);
    setYear(next);
    updateDate(day, month, next);
  }

  const parsedDate = new Date(value);
  const formattedDate = Number.isNaN(parsedDate.getTime())
    ? ''
    : format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <View className="mb-4">
      <AppText className="mb-2 text-sm text-muted">{label}</AppText>
      <View className="flex-row gap-2">
        <TextInput
          value={day}
          onChangeText={updateDay}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="Dia"
          placeholderTextColor="#9A9085"
          className="flex-1 rounded-paper border border-line bg-surface px-3 py-3 text-center font-body text-base text-ink"
        />
        <TextInput
          value={month}
          onChangeText={updateMonth}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="Mês"
          placeholderTextColor="#9A9085"
          className="flex-1 rounded-paper border border-line bg-surface px-3 py-3 text-center font-body text-base text-ink"
        />
        <TextInput
          value={year}
          onChangeText={updateYear}
          keyboardType="number-pad"
          maxLength={4}
          placeholder="Ano"
          placeholderTextColor="#9A9085"
          className="flex-[1.4] rounded-paper border border-line bg-surface px-3 py-3 text-center font-body text-base text-ink"
        />
      </View>
      <AppText className="mt-2 text-sm text-muted">{formattedDate}</AppText>
    </View>
  );
}
