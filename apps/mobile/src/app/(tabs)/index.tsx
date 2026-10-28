import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Brand, FontFamily, SKILL_LABEL, Skill, SkillAccent } from '@/constants/theme';

const TILE_STYLE: Record<Skill, { backgroundColor: string; color: string; accent: string }> = {
  speaking: { backgroundColor: Brand.plum, color: Brand.paper, accent: SkillAccent.speaking },
  writing: { backgroundColor: Brand.gold, color: Brand.ink, accent: SkillAccent.writing },
  listening: { backgroundColor: Brand.paper, color: Brand.ink, accent: SkillAccent.listening },
  reading: { backgroundColor: Brand.paper, color: Brand.ink, accent: SkillAccent.reading },
};

const CARDS: { skill: Skill; note: string }[] = [
  { skill: 'speaking', note: 'Section B · AI partner' },
  { skill: 'writing', note: 'Section B · 200 words' },
  { skill: 'listening', note: 'Demo · 2 questions' },
  { skill: 'reading', note: 'Demo · 2 questions' },
];

export default function Home() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Prépa TEF TCF</Text>
      <Text style={styles.title}>Your skills</Text>
      <View style={styles.hero}>
        <Text style={styles.heroText}>Answer your AI partner&apos;s objections and convince them.</Text>
      </View>
      {CARDS.map(({ skill, note }) => {
        const tile = TILE_STYLE[skill];
        return (
          <Pressable
            key={skill}
            style={[styles.card, { backgroundColor: tile.backgroundColor }]}
            onPress={() => router.push(`/test/${skill}`)}>
            <View style={[styles.dot, { backgroundColor: tile.accent }]} />
            <Text style={[styles.cardTitle, { color: tile.color }]}>{SKILL_LABEL[skill]}</Text>
            <Text style={[styles.cardNote, { color: tile.color }]}>{note}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  content: { padding: 20, gap: 12 },
  kicker: { fontFamily: FontFamily.sansBold, fontSize: 13, color: Brand.plum, letterSpacing: 2 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 28, color: Brand.ink },
  hero: { backgroundColor: Brand.lilac, borderRadius: 12, padding: 16 },
  heroText: { fontFamily: FontFamily.sans, fontSize: 15, color: Brand.ink },
  card: { borderRadius: 16, padding: 20 },
  dot: { width: 12, height: 12, borderRadius: 6, marginBottom: 8 },
  cardTitle: { fontFamily: FontFamily.sansBold, fontSize: 22 },
  cardNote: { fontFamily: FontFamily.sans, fontSize: 14, marginTop: 4, opacity: 0.8 },
});
