import { MaterialCommunityIcons } from '@expo/vector-icons';

import { TransactionCategory } from '@/types/finance';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const categoryLabels: Record<TransactionCategory, string> = {
  moradia: 'Moradia',
  mercado: 'Mercado',
  transporte: 'Transporte',
  contas: 'Contas',
  saude: 'Saude',
  lazer: 'Lazer',
  educacao: 'Educacao',
  alimentacao: 'Alimentacao',
  compras: 'Compras',
  assinaturas: 'Assinaturas',
  investimentos: 'Investimentos',
  renda: 'Renda',
  outros: 'Outros',
};

export const categoryIcons: Record<TransactionCategory, IconName> = {
  moradia: 'home-heart',
  mercado: 'cart-outline',
  transporte: 'bus',
  contas: 'file-document-outline',
  saude: 'heart-pulse',
  lazer: 'party-popper',
  educacao: 'school-outline',
  alimentacao: 'food-fork-drink',
  compras: 'shopping-outline',
  assinaturas: 'calendar-sync',
  investimentos: 'chart-line',
  renda: 'cash-plus',
  outros: 'dots-horizontal-circle-outline',
};

export const spendingCategories: TransactionCategory[] = [
  'moradia',
  'mercado',
  'transporte',
  'contas',
  'saude',
  'lazer',
  'educacao',
  'alimentacao',
  'compras',
  'assinaturas',
  'investimentos',
  'outros',
];
