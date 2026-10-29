import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Brand, FontFamily, SKILL_LABEL, Skill } from '@/constants/theme';
import { SPEAKING_B_STUB, WRITING_B_STUB, type FeedbackStub } from '@/content/feedbackStub';

export default function Analysis() {
  const { skill } = useLocalSearchParams<{ skill: string }>();
  const stub: FeedbackStub = skill === 'speaking' ? SPEAKING_B_STUB : WRITING_B_STUB;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Detailed analysis</Text>
      <Text style={styles.note}>Always open and free. {SKILL_LABEL[skill as Skill] ?? skill}.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Strengths</Text>
        {stub.strengths.map((s) => (
          <Text key={s} style={styles.cardText}>
            • {s}
          </Text>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next steps</Text>
        {stub.nextSteps.map((s) => (
          <Text key={s} style={styles.cardText}>
            • {s}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  content: { padding: 20, gap: 12 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 24, color: Brand.ink },
  note: { fontFamily: FontFamily.sans, fontSize: 13, color: Brand.muted },
  card: { backgroundColor: Brand.paper, borderRadius: 12, padding: 16, gap: 6 },
  cardTitle: { fontFamily: FontFamily.sansBold, fontSize: 16, color: Brand.ink },
  cardText: { fontFamily: FontFamily.sans, fontSize: 14, color: Brand.ink },
});
