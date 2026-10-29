import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Dev-only screen gallery: jump straight to any test screen without
// replaying the flow. Unlisted (no link in the app); open it in Expo Go via
// exp://<lan-ip>:8081/--/dev while the dev server runs. Never ships UI:
// content renders only under __DEV__.
function go(params: Record<string, string>) {
  router.push({ pathname: '/test/[skill]', params: { skill: 'listening', ...params } });
}

const ROWS: { section: string; items: { label: string; run: () => void }[] }[] = [
  {
    section: 'Listening · entry',
    items: [{ label: 'Consignes', run: () => go({}) }],
  },
  {
    section: 'Listening · Q1 Illustrations (images)',
    items: (['signal', 'consigne', 'doc', 'ask', 'pause'] as const).map((phase) => ({
      label: `Q1 · ${phase}`,
      run: () => go({ stage: 'question', li: '0', phase }),
    })),
  },
  {
    section: 'Listening · text question',
    items: [
      { label: 'Q2 Annonces · pause (unlocked)', run: () => go({ stage: 'question', li: '1', phase: 'pause' }) },
      { label: 'Q6 Interviews F1 · ask', run: () => go({ stage: 'question', li: '5', phase: 'ask' }) },
      { label: 'Q7 Interviews F2 · signal (follow-up)', run: () => go({ stage: 'question', li: '6', phase: 'signal' }) },
    ],
  },
  {
    section: 'Listening · handoff (result confirmation)',
    items: [
      { label: 'Handoff · 9/9', run: () => go({ stage: 'complete', picked: 'all-correct' }) },
      { label: 'Handoff · mixed', run: () => go({ stage: 'complete', picked: 'mixed' }) },
      { label: 'Handoff · 0/9', run: () => go({ stage: 'complete', picked: 'all-wrong' }) },
    ],
  },
  {
    section: 'Reading',
    items: [
      { label: 'Consignes', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading' } }) },
      { label: 'Passage', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'passage' } }) },
      { label: 'Q1 · text-mcq', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'question', li: '0' } }) },
      { label: 'Q2 · sentence-gap', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'question', li: '1' } }) },
      { label: 'Q3 · text-gap', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'question', li: '2' } }) },
      { label: 'Q4 · chart', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'question', li: '3' } }) },
      { label: 'Q6 · article', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'question', li: '5' } }) },
      { label: 'Break · scores', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'break', picked: 'mixed' } }) },
      { label: 'Complete · mixed', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'reading', stage: 'complete', picked: 'mixed' } }) },
    ],
  },
  {
    section: 'Writing · section B',
    items: [
      { label: 'Consignes', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'writing' } }) },
      { label: 'Write', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'writing', stage: 'write' } }) },
      { label: 'Review', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'writing', stage: 'review' } }) },
      { label: 'Submit · recap', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'writing', stage: 'submit' } }) },
      { label: 'Pending · with the AI', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'writing', stage: 'pending' } }) },
    ],
  },
  {
    section: 'Speaking · section B',
    items: [
      { label: 'Consignes', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'speaking' } }) },
      { label: 'Intro', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'speaking', stage: 'intro' } }) },
      { label: 'Prep', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'speaking', stage: 'prep' } }) },
      { label: 'Record', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'speaking', stage: 'record' } }) },
      { label: 'Review', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'speaking', stage: 'review' } }) },
      { label: 'Submit · recap', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'speaking', stage: 'submit' } }) },
      { label: 'Pending · with the AI', run: () => router.push({ pathname: '/test/[skill]', params: { skill: 'speaking', stage: 'pending' } }) },
    ],
  },
];

export default function DevGallery() {
  const insets = useSafeAreaInsets();
  if (!__DEV__) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.note}>Not available in production.</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Dev screens</Text>
      <Text style={styles.note}>Jump straight to any screen. No links here ship in the app.</Text>
      {ROWS.map((row) => (
        <View key={row.section} style={styles.section}>
          <Text style={styles.heading}>{row.section}</Text>
          {row.items.map((item) => (
            <Pressable key={item.label} style={styles.link} onPress={item.run}>
              <Text style={styles.linkLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F3F7' },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  note: { fontSize: 13, color: '#6E5F78' },
  section: { gap: 8 },
  heading: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#857789' },
  link: { paddingVertical: 13, paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFE3EC' },
  linkLabel: { fontSize: 14, fontWeight: '600', color: '#2952A3' },
});
