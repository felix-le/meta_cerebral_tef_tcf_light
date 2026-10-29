import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Brand, FontFamily } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import type { IconName } from '@/components/icons';

// Floating pill tab bar, copied from design/prepa-contest-final
// (MockTest.dc.html "Bottom nav"): 62px bar floating 24px above the
// bottom with 14px side margins, white pill wrapping icon + label
// of the active tab. Same style on iOS and Android by owner
// decision 2026-10-29. A custom tabBarButton is used so each item
// fills a full third of the bar and the label stays on one centered
// line (the default icon slot squeezes content and wraps the text).
const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'IconOutlineRoundedHome' },
  { name: 'mock', title: 'Mock Test', icon: 'IconOutlineRoundedAiDocument' },
  { name: 'history', title: 'History', icon: 'IconOutlineRoundedTransactionHistory' },
];

const BAR_BG = 'rgba(248,243,247,.82)';
const INACTIVE = '#776D75';
const ACTIVE_BG = 'rgba(255,255,255,.85)';

// Structural subset of the props the navigator forwards to a custom
// tabBarButton (the full type is vendored inside expo-router and cannot
// be imported). Focus arrives as `aria-selected`, NOT accessibilityState.
// The navigator's `style` is intentionally ignored: it carries label-era
// paddings, and the pill owns its own layout here.
type TabButtonProps = {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  'aria-label'?: string;
  'aria-selected'?: boolean;
  role?: string;
  testID?: string;
};

function TabButton({
  title,
  icon,
  onPress,
  onLongPress,
  'aria-selected': ariaSelected,
  'aria-label': ariaLabel,
  role,
  testID,
}: TabButtonProps & { title: string; icon: IconName }) {
  const selected = ariaSelected ?? false;
  const color = selected ? Brand.plum : INACTIVE;
  // Pill crossfade: the outgoing tab's pill fades/scales out while the
  // incoming one fades/scales in. Icon + label keep instant tint snap;
  // the pill motion carries the transition. Same 220ms as content fade.
  const pillOpacity = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const pillScale = useRef(new Animated.Value(selected ? 1 : 0.92)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(pillOpacity, { toValue: selected ? 1 : 0, duration: 220, useNativeDriver: true }),
      Animated.timing(pillScale, {
        toValue: selected ? 1 : 0.92,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [selected, pillOpacity, pillScale]);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={role === 'tab' ? 'tab' : 'button'}
      accessibilityState={{ selected }}
      accessibilityLabel={ariaLabel ?? title}
      testID={testID}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <View style={styles.item}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.pill, { opacity: pillOpacity, transform: [{ scale: pillScale }] }]}
        />
        <AppIcon name={icon} size={24} color={color} />
        <Text numberOfLines={1} style={[styles.label, selected ? styles.labelActive : styles.labelInactive, { color }]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const barShadow = Platform.select({
  ios: {
    shadowColor: '#3C1E37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  android: { elevation: 8 },
});

const pillShadow = Platform.select({
  ios: {
    shadowColor: '#3C1E37',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  android: { elevation: 2 },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Labels are rendered inside TabButton so the active pill wraps icon + label.
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View style={[styles.barBg, barShadow]}>
            <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
          </View>
        ),
        tabBarStyle: {
          // NOTE: side gaps use marginHorizontal, not left/right. The
          // navigator's base bar style sets start:0/end:0, which win over
          // left/right in Yoga, so left/right silently did nothing and the
          // bar stretched edge to edge. Margins compose with start/end.
          position: 'absolute',
          marginHorizontal: 14,
          bottom: 24,
          height: 62,
          borderRadius: 100,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          // NOTE: full longhands, never the `padding` shorthand. The
          // navigator's base bar style sets per-side paddings
          // (paddingBottom: insets.bottom, paddingHorizontal: insets),
          // and per-side beats shorthand in Yoga, so `padding: 6` left
          // the 34px home-indicator bottom inset (tabs pushed to top)
          // and ~0 side insets in place. Longhands tie and win by order.
          paddingTop: 6,
          paddingRight: 6,
          paddingBottom: 6,
          paddingLeft: 6,
        },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarButton: (props: TabButtonProps) => <TabButton title={t.title} icon={t.icon} {...props} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barBg: {
    flex: 1,
    backgroundColor: BAR_BG,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.6)',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    // 1px each side = the design's 2px gap between items.
    marginHorizontal: 1,
  },
  item: {
    height: 50,
    borderRadius: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  // Background layer only: faded in/out by pillOpacity so icon + label
  // never fade with it. Rendered under icon/label (absolute + earlier).
  pill: {
    backgroundColor: ACTIVE_BG,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.9)',
    ...pillShadow,
  },
  pressed: { opacity: 0.55 },
  label: { fontSize: 10, letterSpacing: 0.2, lineHeight: 12, textAlign: 'center' },
  labelInactive: { fontFamily: FontFamily.sansMedium },
  labelActive: { fontFamily: FontFamily.sansBold },
});
