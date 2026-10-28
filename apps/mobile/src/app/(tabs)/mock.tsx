import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Brand, FontFamily, SKILL_LABEL, SKILL_ORDER } from '@/constants/theme';

export default function Mock() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mock Test</Text>
      <View style={styles.freeRow}>
        <Text style={styles.freeChip}>Free</Text>
        <Text style={styles.freeText}>Shortened demo mock · all 4 skills · one sitting</Text>
      </View>
      {SKILL_ORDER.map((skill, i) => (
        <Pressable key={skill} style={styles.step} onPress={() => router.push(`/test/${skill}`)}>
          <Text style={styles.stepNum}>{i + 1}</Text>
          <View>
            <Text style={styles.stepTitle}>{SKILL_LABEL[skill]}</Text>
            <Text style={styles.stepNote}>
              {skill === 'writing' || skill === 'speaking' ? 'Section B · full, AI scored' : 'Demo · 2 questions'}
            </Text>
          </View>
        </Pressable>
      ))}
      <Text style={styles.note}>Results are published together. Your usable level is your weakest skill.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  content: { padding: 20, gap: 12 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 28, color: Brand.ink },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  freeChip: { fontFamily: FontFamily.sansBold, fontSize: 13, color: Brand.ink, backgroundColor: Brand.gold, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  freeText: { fontFamily: FontFamily.sans, fontSize: 14, color: Brand.muted, flex: 1 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Brand.paper, borderRadius: 12, padding: 16 },
  stepNum: { fontFamily: FontFamily.sansBold, fontSize: 18, color: Brand.plum },
  stepTitle: { fontFamily: FontFamily.sansBold, fontSize: 17, color: Brand.ink },
  stepNote: { fontFamily: FontFamily.sans, fontSize: 13, color: Brand.muted },
  note: { fontFamily: FontFamily.sans, fontSize: 13, color: Brand.muted, marginTop: 4 },
});
