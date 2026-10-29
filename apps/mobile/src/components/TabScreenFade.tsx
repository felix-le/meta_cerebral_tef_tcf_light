import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import type { ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';

// Replays a short fade + rise every time a tab gains focus, so tab
// switches feel animated. Built-in Animated only (screens stay mounted,
// so mount-based entering animations would not replay). 220ms sits in
// the 150-300ms micro-interaction range.
export function TabScreenFade({ children }: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(10)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      rise.setValue(10);
      const anim = Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(rise, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]);
      anim.start();
      return () => anim.stop();
    }, [opacity, rise]),
  );

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY: rise }] }}>{children}</Animated.View>
  );
}
