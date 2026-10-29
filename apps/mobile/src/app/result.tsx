import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Brand, FontFamily, SKILL_LABEL, Skill } from '@/constants/theme';
import { estimationLabel, type Cefr, type Half } from '@/config/scoring';
import { SPEAKING_B_STUB, WRITING_B_STUB, type FeedbackStub } from '@/content/feedbackStub';

const DISCLAIMER = 'Estimation from an AI reading of your work, not an official score.';

export default function Result() {
  const { skill } = useLocalSearchParams<{ skill: string }>();
  const label = SKILL_LABEL[skill as Skill] ?? skill;

  const stub: FeedbackStub = skill === 'speaking' ? SPEAKING_B_STUB : WRITING_B_STUB;
  const estimation = estimationLabel(stub.overall.level as Cefr, stub.overall.half);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{label} — Result</Text>
      <Text style={styles.score}>{estimation}</Text>
      <Text style={styles.note}>{DISCLAIMER}</Text>
      {skill === 'speaking' && (
        <Text style={styles.note}>Pronunciation is not assessed.</Text>
      )}
      {stub.criteria.map((c) => (
        <View key={c.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            {c.id} · {c.level}
          </Text>
          <Text style={styles.cardText}>{c.comment}</Text>
          {c.evidence.map((q) => (
            <Text key={q} style={styles.quote}>
              « {q} »
            </Text>
          ))}
        </View>
      ))}
      {stub.corrections.map((c, i) => (
        <View key={`${c.original}-${i}`} style={styles.card}>
          <Text style={styles.cardText}>
            {c.original} → {c.corrected} ({c.type})
          </Text>
          <Text style={styles.note}>{c.explanation}</Text>
        </View>
      ))}
      <Pressable style={styles.button} onPress={() => router.push({ pathname: '/analysis', params: { skill } })}>
        <Text style={styles.buttonText}>Detailed analysis</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  content: { padding: 20, gap: 12 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 24, color: Brand.ink },
  score: { fontFamily: FontFamily.sansBold, fontSize: 20, color: Brand.plum },
  note: { fontFamily: FontFamily.sans, fontSize: 13, color: Brand.muted },
  card: { backgroundColor: Brand.paper, borderRadius: 12, padding: 16, gap: 6 },
  cardTitle: { fontFamily: FontFamily.sansBold, fontSize: 16, color: Brand.ink },
  cardText: { fontFamily: FontFamily.sans, fontSize: 14, color: Brand.ink },
  quote: { fontFamily: FontFamily.serifItalic, fontSize: 14, color: Brand.muted },
  button: { backgroundColor: Brand.plum, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontFamily: FontFamily.sansBold, fontSize: 17, color: Brand.paper },
});
