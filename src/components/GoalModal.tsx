import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { z } from "zod";

import { PrimaryButton } from "@/components/PrimaryButton";
import { AppText, DisplayText } from "@/components/Text";
import { useFinanceStore } from "@/store/useFinanceStore";

const schema = z.object({
  title: z.string().min(3, "De um nome para esse sonho."),
  targetAmount: z.coerce.number().positive("Digite uma meta maior que zero."),
  savedAmount: z.coerce.number().min(0).default(0)
});

type FormValues = z.infer<typeof schema>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

const colors = ["#2F8F6B", "#F5B84B", "#7DB7D9", "#9A86C8", "#E96C5F"];

export function GoalModal({ visible, onClose }: Props) {
  const addGoal = useFinanceStore((state) => state.addGoal);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", targetAmount: 0, savedAmount: 0 }
  });

  function submit(values: FormValues) {
    addGoal({ ...values, color: colors[Math.floor(Math.random() * colors.length)] });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-end bg-ink/30">
        <View className="rounded-t-3xl bg-paper px-6 pb-8 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <DisplayText className="text-3xl">Novo sonho</DisplayText>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-line">
              <AppText className="font-body text-lg">X</AppText>
            </Pressable>
          </View>

          <FieldError message={errors.title?.message} />
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Ex: geladeira nova"
                placeholderTextColor="#9A9085"
                className="mb-3 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          <FieldError message={errors.targetAmount?.message} />
          <Controller
            control={control}
            name="targetAmount"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value ? String(value) : ""}
                onChangeText={(text) => onChange(text.replace(",", "."))}
                keyboardType="decimal-pad"
                placeholder="Valor da meta"
                placeholderTextColor="#9A9085"
                className="mb-3 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          <Controller
            control={control}
            name="savedAmount"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value ? String(value) : ""}
                onChangeText={(text) => onChange(text.replace(",", "."))}
                keyboardType="decimal-pad"
                placeholder="Quanto ja guardou?"
                placeholderTextColor="#9A9085"
                className="mb-5 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          <PrimaryButton label="Criar meta" icon="flag" onPress={handleSubmit(submit)} />
        </View>
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
