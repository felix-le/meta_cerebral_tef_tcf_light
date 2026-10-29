import { useCallback, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, FontFamily, SkillAccent, SKILL_DARK, SKILL_LABEL, type Skill } from '@/constants/theme';
import { estimationFor, type Cefr, type Half } from '@/config/scoring';
import { listResults, type MockResult } from '@/storage/history';
import { AppIcon } from '@/components/AppIcon';
import { ProgressRing } from '@/components/ProgressRing';
import { TabScreenFade } from '@/components/TabScreenFade';
import type { IconName } from '@/components/icons';

const SKILLS: { skill: Skill; icon: IconName }[] = [
  { skill: 'listening', icon: 'IconBulkHeadphone' },
  { skill: 'reading', icon: 'IconBulkBook' },
  { skill: 'speaking', icon: 'IconBulkMic' },
  { skill: 'writing', icon: 'IconBulkWrite' },
];

const SKILL_COLOR: Record<Skill, string> = {
  listening: SkillAccent.listening,
  reading: SkillAccent.reading,
  speaking: SkillAccent.speaking,
  writing: SkillAccent.writing,
};

function nclcOf(r: MockResult): number | null {
  if (r.correct != null && r.total) {
    return Math.round((r.correct / r.total) * 12);
  }
  if (r.level) {
    const band: Record<string, [number, number]> = { A1: [1, 3], A2: [4, 4], B1: [5, 6], B2: [7, 8], C1: [9, 10], C2: [11, 12] };
    const [lo, hi] = band[r.level] ?? [1, 1];
    return r.half === 'upper' ? hi : r.half === 'lower' ? lo : Math.round((lo + hi) / 2);
  }
  return null;
}

export default function Home() {
  const [results, setResults] = useState<MockResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      listResults().then(setResults);
    }, []),
  );

  const latestBySkill = new Map<Skill, MockResult>();
  for (const r of results) {
    if (!latestBySkill.has(r.skill)) {
      latestBySkill.set(r.skill, r);
    }
  }
  const scored = [...latestBySkill.values()].map((r) => ({ r, n: nclcOf(r) })).filter((x) => x.n != null) as { r: MockResult; n: number }[];
  const weakest = scored.length > 0 ? scored.reduce((a, b) => (a.n <= b.n ? a : b)).r.skill : null;
  const latest = results[0] ?? null;
  const insets = useSafeAreaInsets();
  // Design rail cards are 82% of the content width with snap.
  const CARD_W = Math.round((Dimensions.get('window').width - 40) * 0.82);
  const band = latest?.level ? estimationFor(latest.level as Cefr, (latest.half ?? 'none') as Half) : null;

  return (
    <TabScreenFade>
    <View style={styles.root}>
      <LinearGradient colors={['#F8F3F7', '#FFFFFF']} style={styles.bg} />
      <Image source={require('../../../assets/brand/blob-gold.png')} style={styles.goldBlob} resizeMode="stretch" />
      <Image source={require('../../../assets/brand/blob-plum.png')} style={styles.plumBlob} resizeMode="stretch" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('../../../assets/brand/prepa-mark.png')} style={styles.mark} />
          <View style={styles.headerText}>
            <Text style={styles.kicker}>Free practice · no account</Text>
            <Text style={styles.hello}>Bonjour !</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Up next</Text>

        <View style={styles.railBleed}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            snapToInterval={CARD_W + 10}
            snapToAlignment="start"
            decelerationRate="fast">
            <View style={[styles.darkCard, { width: CARD_W }]}>
              <View style={styles.darkHead}>
                <View style={styles.darkIcon}>
                  <AppIcon name="IconBulkMic" size={24} color={SkillAccent.speaking} />
                </View>
                <View style={styles.darkHeadText}>
                  <Text style={styles.darkKicker}>Speaking · Section B</Text>
                  <Text style={styles.darkTitle}>Convince a friend</Text>
                </View>
              </View>
              <Text style={styles.darkBody}>Present the offer, then answer your AI partner&apos;s objections. Feedback at the end.</Text>
              <Pressable style={styles.darkCta} onPress={() => router.push('/test/speaking')}>
                <Text style={styles.darkCtaText}>Start Speaking</Text>
                <AppIcon name="IconArrowRight" size={18} color="#111827" />
              </Pressable>
            </View>
            <View style={[styles.darkCard, { width: CARD_W }]}>
              <View style={styles.darkHead}>
                <View style={styles.darkIcon}>
                  <AppIcon name="IconBulkWrite" size={24} color={SkillAccent.writing} />
                </View>
                <View style={styles.darkHeadText}>
                  <Text style={styles.darkKicker}>Writing · Section B</Text>
                  <Text style={styles.darkTitle}>Give your point of view</Text>
                </View>
              </View>
              <Text style={styles.darkBody}>At least 200 words on a short statement. AI feedback on every criterion.</Text>
              <Pressable style={styles.darkCta} onPress={() => router.push('/test/writing')}>
                <Text style={styles.darkCtaText}>Start Writing</Text>
                <AppIcon name="IconArrowRight" size={18} color="#111827" />
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {latest && (latest.level || latest.correct != null) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Result summary</Text>
            <View style={styles.sumCard}>
              <View style={styles.sumTop}>
                <View style={styles.tile}>
                  <Text style={styles.tileLevel} numberOfLines={1} adjustsFontSizeToFit>
                    {band ? `NCLC ${band.nclc}` : `${latest.correct} / ${latest.total}`}
                  </Text>
                  <Text style={styles.tilePct}>{band ? 'Estimation' : 'Correct'}</Text>
                </View>
                <View style={styles.sumText}>
                  <Text style={styles.sumTitle}>
                    {SKILL_LABEL[latest.skill]} · Section {latest.section}
                  </Text>
                  <Text style={styles.sumMeta}>{latest.date}</Text>
                </View>
              </View>
              <Pressable style={styles.sumFoot} onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.sumFootText}>All test history</Text>
                <AppIcon name="IconChevronRight" size={20} color="#857789" />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.emptyRow} onPress={() => router.push('/(tabs)/history')}>
            <View style={styles.emptyIcon}>
              <AppIcon name="IconOutlineRoundedTransactionHistory" size={20} color={Brand.plum} />
            </View>
            <View style={styles.emptyText}>
              <Text style={styles.resultTitle}>No results yet</Text>
              <Text style={styles.resultMeta}>Take your first test. Your results are kept in History on this device.</Text>
            </View>
            <AppIcon name="IconChevronRight" size={20} color="#857789" />
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Your skills</Text>
        <View style={styles.grid}>
          {SKILLS.map(({ skill, icon }) => {
            const r = latestBySkill.get(skill);
            const n = r ? nclcOf(r) : null;
            const isWeak = weakest === skill;
            return (
              <Pressable key={skill} style={styles.skillCard} onPress={() => router.push(`/test/${skill}`)}>
                <ProgressRing pct={n == null ? 0 : n / 12} color={SKILL_COLOR[skill]} icon={icon} />
                <View style={styles.skillText}>
                  <Text style={styles.skillName}>{skill[0].toUpperCase() + skill.slice(1)}</Text>
                  {isWeak && n != null ? (
                    <Text style={styles.weakPill}>{r?.level ? `NCLC ${n} · ${r.level}` : `NCLC ${n}`}</Text>
                  ) : (
                    <Text style={[styles.skillValue, n != null && { color: SKILL_DARK[skill] }]}>
                      {r == null || n == null ? 'Not started' : r.level ? `NCLC ${n} · ${r.level}` : `NCLC ${n}`}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
    </TabScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  bg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 0 },
  goldBlob: { position: 'absolute', left: -136, top: -178, width: 392, height: 418, opacity: 0.15, zIndex: 0 },
  plumBlob: { position: 'absolute', right: -38, top: 511, width: 196, height: 426, opacity: 0.15, zIndex: 0 },
  // Top spacing comes from insets.top + 8 at the call site (design: content starts 8px below the status area).
  content: { paddingHorizontal: 20, paddingBottom: 130, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { width: 48, height: 48 },
  headerText: { flex: 1, gap: 2 },
  kicker: { fontFamily: FontFamily.sansMedium, fontSize: 13, lineHeight: 18, color: '#6B7280' },
  hello: { fontFamily: FontFamily.sansBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3, color: '#111827' },
  railBleed: { marginHorizontal: -20 },
  rail: { gap: 10, paddingHorizontal: 20, paddingRight: 20 },
  darkCard: { backgroundColor: '#111827', borderRadius: 20, padding: 18, gap: 14 },
  darkHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  darkIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' },
  darkHeadText: { flex: 1, gap: 3 },
  darkKicker: { fontFamily: FontFamily.sansMedium, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: '#9CA3AF' },
  darkTitle: { fontFamily: FontFamily.sansBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2, color: '#F9FAFB' },
  darkBody: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 19, color: '#D1D5DB' },
  darkCta: { height: 46, borderRadius: 100, backgroundColor: '#fff', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  darkCtaText: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#111827' },
  section: { gap: 10 },
  sumCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#EFE3EC' },
  sumTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  tile: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F8F3F7', borderWidth: 1, borderColor: '#EFE3EC', alignItems: 'center', justifyContent: 'center', gap: 1 },
  tileLevel: { fontFamily: FontFamily.sansBold, fontSize: 18, letterSpacing: -0.3, color: '#111827' },
  tilePct: { fontFamily: FontFamily.sansMedium, fontSize: 10, color: '#9CA3AF' },
  sumText: { flex: 1, gap: 3 },
  sumTitle: { fontFamily: FontFamily.sansMedium, fontSize: 14, lineHeight: 19, color: '#111827' },
  sumMeta: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 16, color: '#6B7280' },
  sumFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#F5EEF3' },
  sumFootText: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: 13, lineHeight: 18, color: '#111827' },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#EFE3EC' },
  emptyIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8F3F7', borderWidth: 1, borderColor: '#EFE3EC', alignItems: 'center', justifyContent: 'center' },
  emptyText: { flex: 1, gap: 2 },
  sectionTitle: { fontFamily: FontFamily.sansBold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2, color: '#111827' },
  resultTitle: { fontFamily: FontFamily.sansMedium, fontSize: 14, lineHeight: 19, color: '#2E1A3B' },
  resultMeta: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 16, color: Brand.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillCard: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFE3EC' },
  skillText: { flex: 1, gap: 3, alignItems: 'flex-start' },
  skillName: { fontFamily: FontFamily.sansMedium, fontSize: 13, lineHeight: 18, color: '#111827' },
  skillValue: { fontFamily: FontFamily.sansMedium, fontSize: 12, lineHeight: 16, color: '#6B7280' },
  weakPill: { fontFamily: FontFamily.sansMedium, fontSize: 11, lineHeight: 14, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 100, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FBD5D5', color: '#DC2626' },
});
