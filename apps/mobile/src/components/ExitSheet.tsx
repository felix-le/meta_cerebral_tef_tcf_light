import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, FontFamily } from '@/constants/theme';

// Destructive confirm sheet (exit a test, start over, ...). Scrim tap and
// "Keep" dismiss; "Leave" performs the destructive action.
export function ExitSheet({
  visible,
  title,
  body,
  keepLabel,
  leaveLabel,
  onKeep,
  onLeave,
  rows,
  note,
}: {
  visible: boolean;
  title: string;
  body: string;
  keepLabel: string;
  leaveLabel: string;
  onKeep: () => void;
  onLeave: () => void;
  rows?: { label: string; value: string }[];
  note?: string;
}) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={onKeep} accessibilityRole="button" accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {rows && rows.length > 0 && (
          <View style={styles.rows}>
            {rows.map((r) => (
              <View key={r.label} style={styles.row}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            ))}
          </View>
        )}
        <Pressable style={styles.keep} onPress={onKeep} accessibilityRole="button">
          <Text style={styles.keepLabel}>{keepLabel}</Text>
        </Pressable>
        <Pressable style={styles.leave} onPress={onLeave} accessibilityRole="button">
          <Text style={styles.leaveLabel}>{leaveLabel}</Text>
        </Pressable>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  scrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(30,18,38,.55)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 12,
  },
  grab: { width: 38, height: 4, borderRadius: 100, backgroundColor: '#E9E0E7', alignSelf: 'center', marginBottom: 4 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.4, color: '#2E1A3B' },
  body: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 20, color: '#5E4E69' },
  keep: { height: 52, borderRadius: 100, backgroundColor: Brand.plum, alignItems: 'center', justifyContent: 'center' },
  keepLabel: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#fff' },
  leave: { height: 46, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  leaveLabel: { fontFamily: FontFamily.sansMedium, fontSize: 14, color: '#5E4E69' },
  rows: { paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#FBF7FA', borderWidth: 1, borderColor: '#EFE3EC' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F5EEF3' },
  rowLabel: { flex: 1, fontFamily: FontFamily.sans, fontSize: 12, color: '#5E4E69' },
  rowValue: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#111827' },
  note: { fontFamily: FontFamily.sans, fontSize: 11, textAlign: 'center', color: '#857789' },
});
