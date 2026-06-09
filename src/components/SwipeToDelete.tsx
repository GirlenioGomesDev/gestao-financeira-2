import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, useState } from 'react';
import { Animated, PanResponder, View } from 'react-native';

const DELETE_WIDTH = 88;

type Props = PropsWithChildren<{
  onDelete: () => void;
}>;

export function SwipeToDelete({ children, onDelete }: Props) {
  const [translateX] = useState(() => new Animated.Value(0));

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderMove: (_, gesture) => {
      translateX.setValue(Math.max(-DELETE_WIDTH, Math.min(0, gesture.dx)));
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -80) {
        Animated.timing(translateX, {
          toValue: -DELETE_WIDTH,
          duration: 120,
          useNativeDriver: true,
        }).start(() => {
          onDelete();
          translateX.setValue(0);
        });
        return;
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderTerminate: () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });

  return (
    <View className="mb-3 overflow-hidden rounded-paper">
      <View className="absolute bottom-0 right-0 top-0 w-[88px] items-center justify-center bg-coral">
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
      </View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}
