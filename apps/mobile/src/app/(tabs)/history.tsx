import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Brand, FontFamily, SKILL_LABEL } from '@/constants/theme';
import { listResults, MockResult } from '@/storage/history';
import { TabScreenFade } from '@/components/TabScreenFade';

export default function History() {
  const [results, setResults] = useState<MockResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      listResults().then(setResults);
    }, []),
  );

  return (
    <TabScreenFade>
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.note}>Results are kept on this device.</Text>
      {results.length === 0 ? (
        <Text style={styles.empty}>No results yet. Finish a test to see it here.</Text>
      ) : (
        results.map((r) => (
          <Pressable
            key={r.id}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`Review ${SKILL_LABEL[r.skill]} from ${r.date}`}
            onPress={() => router.push({ pathname: '/result', params: { session: r.session ?? r.id } })}>
            <Text style={styles.cardTitle}>
              {SKILL_LABEL[r.skill]} · Section {r.section}
            </Text>
            <Text style={styles.cardDetail}>
              {r.level ? `NCLC · ${r.level}` : `${r.correct} / ${r.total} correct`} · {r.date}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
    </TabScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  // Extra bottom space so the floating tab bar never covers the last card.
  content: { padding: 20, paddingBottom: 110, gap: 12 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 28, color: Brand.ink },
  note: { fontFamily: FontFamily.sans, fontSize: 13, color: Brand.muted },
  empty: { fontFamily: FontFamily.sans, fontSize: 15, color: Brand.muted, marginTop: 16 },
  card: { backgroundColor: Brand.paper, borderRadius: 12, padding: 16 },
  cardTitle: { fontFamily: FontFamily.sansBold, fontSize: 16, color: Brand.ink },
  cardDetail: { fontFamily: FontFamily.sans, fontSize: 13, color: Brand.muted, marginTop: 4 },
});
