import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Brand, FontFamily, Skill } from '@/constants/theme';
import { countWords } from '@/config/scoring';
import { saveResult } from '@/storage/history';
import {
  LISTENING_CONSIGNE,
  LISTENING_SAMPLE,
  PARTNER_DISCLAIMER,
  PARTNER_LABEL,
  READING_CONSIGNE,
  READING_PASSAGE,
  READING_SAMPLE,
  SHORTENED_NOTE,
  SPEAKING_B_CONSIGNE,
  SPEAKING_B_DOCUMENT,
  SPEAKING_MAX_TURNS,
  WRITING_B_CONSIGNE,
  WRITING_B_FLOOR,
  WRITING_B_SUBJECT,
} from '@/content/exam';

const SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking'];

export default function Test() {
  const { skill } = useLocalSearchParams<{ skill: string }>();
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [text, setText] = useState('');

  if (!SKILLS.includes(skill as Skill)) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Unknown skill</Text>
      </View>
    );
  }

  const submitChoice = async (questions: { id: string; answer: number }[], total: number) => {
    const correct = questions.filter((q) => picked[q.id] === q.answer).length;
    await saveResult({
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      skill: skill as Skill,
      section: 'B',
      correct,
      total,
    });
    router.push({ pathname: '/result', params: { skill, correct: String(correct), total: String(total) } });
  };

  const submitText = async () => {
    await saveResult({
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      skill: skill as Skill,
      section: 'B',
    });
    router.push({ pathname: '/result', params: { skill } });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {(skill === 'listening' || skill === 'reading') && (
        <>
          <Text style={styles.consigne}>{skill === 'listening' ? LISTENING_CONSIGNE : READING_CONSIGNE}</Text>
          <Text style={styles.note}>{SHORTENED_NOTE}</Text>
          {skill === 'reading' && <Text style={styles.passage}>{READING_PASSAGE}</Text>}
          {(skill === 'listening' ? LISTENING_SAMPLE : READING_SAMPLE).map((q) => (
            <View key={q.id} style={styles.card}>
              <Text style={styles.question}>{q.prompt}</Text>
              {q.options.map((opt, i) => (
                <Pressable
                  key={opt}
                  style={[styles.option, picked[q.id] === i && styles.optionPicked]}
                  onPress={() => setPicked((p) => ({ ...p, [q.id]: i }))}>
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          ))}
          <Pressable
            style={styles.button}
            onPress={() =>
              submitChoice(
                skill === 'listening' ? LISTENING_SAMPLE : READING_SAMPLE,
                2,
              )
            }>
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
        </>
      )}

      {skill === 'writing' && (
        <>
          <Text style={styles.consigne}>{WRITING_B_CONSIGNE}</Text>
          <Text style={styles.passage}>{WRITING_B_SUBJECT}</Text>
          <TextInput
            style={styles.input}
            multiline
            value={text}
            onChangeText={setText}
            placeholder="Écrivez votre texte ici…"
          />
          <Text style={styles.note}>
            {countWords(text)} / {WRITING_B_FLOOR} words minimum
            {countWords(text) < WRITING_B_FLOOR ? ' — below the floor, feedback will repeat it.' : ''}
          </Text>
          <Pressable style={styles.button} onPress={submitText}>
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
        </>
      )}

      {skill === 'speaking' && (
        <>
          <Text style={styles.consigne}>{SPEAKING_B_CONSIGNE}</Text>
          <Text style={styles.passage}>{SPEAKING_B_DOCUMENT}</Text>
          <Text style={styles.partnerLabel}>{PARTNER_LABEL}</Text>
          <Text style={styles.note}>{PARTNER_DISCLAIMER}</Text>
          <TextInput
            style={styles.input}
            multiline
            value={text}
            onChangeText={setText}
            placeholder="Your transcript appears here — you can correct it…"
          />
          <Text style={styles.note}>Demo: up to {SPEAKING_MAX_TURNS} turns, then scoring.</Text>
          <Pressable style={styles.button} onPress={submitText}>
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  content: { padding: 20, gap: 12 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 24, color: Brand.ink },
  consigne: { fontFamily: FontFamily.sansBold, fontSize: 17, color: Brand.ink },
  note: { fontFamily: FontFamily.sans, fontSize: 13, color: Brand.muted },
  passage: { fontFamily: FontFamily.sans, fontSize: 15, color: Brand.ink, backgroundColor: Brand.paper, borderRadius: 12, padding: 16 },
  card: { backgroundColor: Brand.paper, borderRadius: 12, padding: 16, gap: 8 },
  question: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: Brand.ink },
  option: { borderWidth: 1, borderColor: Brand.lilac, borderRadius: 8, padding: 10 },
  optionPicked: { borderColor: Brand.plum, backgroundColor: Brand.lilac },
  optionText: { fontFamily: FontFamily.sans, fontSize: 14, color: Brand.ink },
  input: { backgroundColor: Brand.paper, borderRadius: 12, padding: 16, minHeight: 160, fontSize: 15, textAlignVertical: 'top' },
  partnerLabel: { fontFamily: FontFamily.sansBold, fontSize: 15, color: Brand.plum },
  button: { backgroundColor: Brand.plum, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontFamily: FontFamily.sansBold, fontSize: 17, color: Brand.paper },
});
