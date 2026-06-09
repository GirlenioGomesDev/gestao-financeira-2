import { Text as RNText, TextProps } from 'react-native';

export function AppText({ className = '', ...props }: TextProps & { className?: string }) {
  return <RNText className={`font-body text-ink ${className}`} {...props} />;
}

export function DisplayText({ className = '', ...props }: TextProps & { className?: string }) {
  return <RNText className={`font-display text-ink ${className}`} {...props} />;
}
