import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function formatCurrency(value: number) {
  return currency.format(value);
}

export function formatShortDate(value: string) {
  return format(parseISO(value), "dd MMM", { locale: ptBR });
}

export function formatLongDate(value: string) {
  return format(parseISO(value), "dd 'de' MMMM", { locale: ptBR });
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
