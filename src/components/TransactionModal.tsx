import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { z } from "zod";

import { AppText, DisplayText } from "@/components/Text";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useFinanceStore } from "@/store/useFinanceStore";
import { TransactionCategory, TransactionType } from "@/types/finance";
import { categoryLabels, spendingCategories } from "@/utils/categories";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  title: z.string().min(2, "Escreva um nome curto."),
  amount: z.coerce.number().positive("Digite um valor maior que zero."),
  category: z.custom<TransactionCategory>(),
  note: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function TransactionModal({ visible, onClose }: Props) {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      title: "",
      amount: 0,
      category: "mercado",
      note: ""
    }
  });
  const type = watch("type");

  function submit(values: FormValues) {
    addTransaction({
      ...values,
      category: values.type === "income" ? "renda" : values.category,
      date: new Date().toISOString()
    });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-end bg-ink/30">
        <View className="rounded-t-3xl bg-paper px-6 pb-8 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <DisplayText className="text-3xl">Novo lancamento</DisplayText>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-line">
              <AppText className="font-body text-lg">X</AppText>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <View className="mb-4 flex-row rounded-paper bg-line p-1">
                {(["expense", "income"] as TransactionType[]).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => onChange(item)}
                    className={`flex-1 rounded-paper py-3 ${value === item ? "bg-surface" : ""}`}
                  >
                    <AppText className="text-center font-body">
                      {item === "expense" ? "Despesa" : "Receita"}
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
                value={value ? String(value) : ""}
                onChangeText={(text) => onChange(text.replace(",", "."))}
                keyboardType="decimal-pad"
                placeholder="Valor em reais"
                placeholderTextColor="#9A9085"
                className="mb-3 rounded-paper border border-line bg-surface px-4 py-3 font-body text-base text-ink"
              />
            )}
          />

          {type === "expense" ? (
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <View className="mb-5 flex-row flex-wrap gap-2">
                  {spendingCategories.map((category) => (
                    <Pressable
                      key={category}
                      onPress={() => onChange(category)}
                      className={`rounded-full border px-3 py-2 ${
                        value === category ? "border-primary bg-primary/10" : "border-line bg-surface"
                      }`}
                    >
                      <AppText className="text-sm">{categoryLabels[category]}</AppText>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          ) : null}

          <PrimaryButton label="Salvar" icon="checkmark" onPress={handleSubmit(submit)} />
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
