import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { FontFamily } from '@/constants/theme';

// Sticky bottom CTA with fading band, following the detail-screen pattern:
// one plum pill, optional secondary line under it.
export function StickyCta({
  label,
  onPress,
  disabled,
  note,
  icon,
  tone,
  bg,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  note?: string;
  icon?: ReactNode;
  /** Dark screens (consignes, complete) need the dark fade band. */
  tone?: 'light' | 'dark';
  /** Optional button background override (default plum). */
  bg?: string;
}) {
  const dark = tone === 'dark';
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <LinearGradient
        colors={
          dark
            ? ['rgba(30,18,38,0)', 'rgba(30,18,38,.72)', 'rgba(30,18,38,.96)', '#100D0A']
            : ['rgba(255,255,255,0)', 'rgba(255,255,255,.72)', 'rgba(255,255,255,.96)', '#fff']
        }
        locations={[0, 0.42, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Pressable
        style={[styles.cta, bg ? { backgroundColor: bg } : null, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {note ? <Text style={[styles.note, dark && styles.noteDark]}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 46,
    paddingBottom: 24,
    gap: 10,
    zIndex: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 100,
    backgroundColor: '#6A2A5F',
  },
  disabled: { opacity: 0.45 },
  label: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#fff' },
  note: { fontFamily: FontFamily.sans, fontSize: 12, textAlign: 'center', color: '#6E5F78' },
  noteDark: { color: 'rgba(255,255,255,.55)' },
});
