import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, PressableProps } from 'react-native';

import { AppText } from '@/components/Text';

type Props = PressableProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'filled' | 'outline';
};

export function PrimaryButton({
  label,
  icon,
  variant = 'filled',
  onPress,
  className = '',
  ...props
}: Props & { className?: string }) {
  const filled = variant === 'filled';

  return (
    <Pressable
      className={`min-h-12 flex-row items-center justify-center rounded-paper px-4 ${
        filled ? 'bg-primary' : 'border border-primary bg-transparent'
      } ${className}`}
      onPress={event => {
        Haptics.selectionAsync();
        onPress?.(event);
      }}
      {...props}
    >
      {icon ? <Ionicons name={icon} size={18} color={filled ? '#FFFFFF' : '#2F8F6B'} /> : null}
      <AppText className={`ml-2 font-body text-base ${filled ? 'text-white' : 'text-primaryDark'}`}>
        {label}
      </AppText>
    </Pressable>
  );
}
