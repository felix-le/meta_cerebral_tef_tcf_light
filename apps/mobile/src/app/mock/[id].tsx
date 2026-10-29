import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import { Brand, FontFamily, SkillAccent, SKILL_DEEP, SKILL_LABEL, SKILL_ORDER, type Skill } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { EXAM_NAME, MOCKS } from '@/content/mocks';
import type { IconName } from '@/components/icons';

// Session detail screen, following design/prepa-contest-final
// (MockTestDetail.dc.html) in its fresh state: dark hero with readiness
// panel, lifted sheet with the four skill cards + exam-structure card,
// sticky CTA. Contest build: everything is fresh and free, so there are
// no attempts, no progress donut sectors, no gate, no Pro badges and no
// answer-key rows (those screens are not built yet).
const SKILL_ICON: Record<Skill, IconName> = {
  listening: 'IconBulkHeadphone',
  reading: 'IconBulkBook',
  speaking: 'IconBulkMic',
  writing: 'IconBulkWrite',
};

const SKILL_FRENCH: Record<Skill, string> = {
  listening: 'Compréhension orale',
  reading: 'Compréhension écrite',
  speaking: 'Expression orale',
  writing: 'Expression écrite',
};

const SKILL_ITEMS: Record<Skill, string> = {
  listening: '40 questions · 7 groupes',
  reading: '40 questions · 5 groupes',
  writing: '2 tâches · A + B',
  speaking: '2 tâches · A + B',
};

const SKILL_MINS: Record<Skill, number> = { listening: 40, reading: 60, writing: 60, speaking: 15 };

function Donut() {
  return (
    <View style={styles.donut}>
      <Svg width={78} height={78}>
        <Circle cx={39} cy={39} r={34} stroke="rgba(255,255,255,.14)" strokeWidth={10} fill="none" />
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutValue}>0/4</Text>
        <Text style={styles.donutCaption}>SCORED</Text>
      </View>
    </View>
  );
}

export default function MockSession() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const idx = Math.max(
    0,
    MOCKS.findIndex((m) => m.id === id),
  );
  const session = MOCKS[idx];
  // Watermark/kicker number is the calendar month (April -> 04), static
  // catalogue content like the month names — no database needed.
  const MONTH_NO: Record<string, string> = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12',
  };
  const sessionNo = MONTH_NO[session.month] ?? '00';
  const [scrolled, setScrolled] = useState(false);
  const duration = `${Math.floor(session.mins / 60)}h ${session.mins % 60}m`;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 20)}>
        <View style={styles.hero}>
          <LinearGradient
            colors={['#2A2018', '#1E1226', '#100D0A']}
            locations={[0, 0.58, 1]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Image source={require('../../../assets/brand/blob-gold.png')} style={styles.heroGold} resizeMode="stretch" />
          <Image source={require('../../../assets/brand/blob-plum.png')} style={styles.heroPlum} resizeMode="stretch" />
          <Text style={styles.watermark} pointerEvents="none">
            {sessionNo}
          </Text>
          <View style={[styles.heroBody, { paddingTop: insets.top + 64 }]}>
            <Text style={styles.kicker}>
              Session {sessionNo} · {session.year}
            </Text>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>
                {session.month} {session.year}
              </Text>
              <Text style={styles.subtitle}>{EXAM_NAME} · demo session · exam conditions</Text>
            </View>
            <View style={styles.panel}>
              <View style={styles.readyRow}>
                <Donut />
                <View style={styles.readyText}>
                  <Text style={styles.readyTitle}>Nothing started yet</Text>
                  <Text style={styles.readyLine}>Take the skills in any order. Everything is free.</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{duration}</Text>
                  <Text style={styles.statLabel}>DURATION</Text>
                </View>
                <View style={styles.statDiv} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {session.items - 4} + 4
                  </Text>
                  <Text style={styles.statLabel}>Q · TÂCHES</Text>
                </View>
                <View style={styles.statDiv} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, styles.statFree]}>Free</Text>
                  <Text style={styles.statLabel}>FULL TEST</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.sheet}>
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Four skills, one session</Text>
              <Text style={styles.sectionHint}>Tap one to open</Text>
            </View>
            {SKILL_ORDER.map((skill) => (
              <Pressable key={skill} style={styles.skillCard} onPress={() => router.push(`/test/${skill}`)}>
                <View style={styles.skillRow}>
                  <LinearGradient
                    colors={[SkillAccent[skill], SKILL_DEEP[skill]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tile}>
                    <AppIcon name={SKILL_ICON[skill]} size={21} color="#fff" />
                  </LinearGradient>
                  <View style={styles.skillText}>
                    <Text style={styles.skillName}>{SKILL_LABEL[skill]}</Text>
                    <Text style={styles.skillFrench}>{SKILL_FRENCH[skill]}</Text>
                  </View>
                  <Text style={styles.freeChip}>Free</Text>
                </View>
                <Text style={styles.skillMeta}>
                  {SKILL_ITEMS[skill]} · {SKILL_MINS[skill]} min
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.structCard}>
            <View style={styles.structHead}>
              <Text style={styles.structTitle}>How the session runs</Text>
              <Text style={styles.structSub}>80 questions + 4 tâches</Text>
            </View>
            <View style={styles.structBar}>
              {SKILL_ORDER.map((skill) => (
                <LinearGradient
                  key={skill}
                  colors={[SkillAccent[skill], SKILL_DEEP[skill]]}
                  style={[styles.structSeg, { flex: SKILL_MINS[skill] }]}
                />
              ))}
            </View>
            {SKILL_ORDER.map((skill) => (
              <View key={skill} style={styles.structRow}>
                <View style={[styles.structDot, { backgroundColor: SkillAccent[skill] }]} />
                <Text style={styles.structFrench}>{SKILL_FRENCH[skill]}</Text>
                <Text style={styles.structItems}>{SKILL_ITEMS[skill].split(' · ')[0]}</Text>
                <Text style={styles.structMins}>{SKILL_MINS[skill]} min</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.chrome, { height: insets.top + 52 }]} pointerEvents="box-none">
        {scrolled && (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.chromeTint} />
          </BlurView>
        )}
        <View style={[styles.chromeBar, { marginTop: insets.top }]}>
          <Pressable
            style={styles.back}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to mock tests"
            hitSlop={8}>
            <View style={styles.backFlip}>
              <AppIcon name="IconChevronRight" size={22} color="#fff" />
            </View>
          </Pressable>
          {scrolled && (
            <Text style={styles.chromeTitle} numberOfLines={1}>
              {session.month} {session.year}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.ctaWrap, { paddingBottom: 24 }]} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,.72)', 'rgba(255,255,255,.96)', '#fff']}
          locations={[0, 0.42, 0.78, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable
          style={styles.cta}
          onPress={() => router.push(`/test/${SKILL_ORDER[0]}`)}
          accessibilityRole="button"
          accessibilityLabel="Start Listening">
          <AppIcon name="IconArrowRight" size={17} color="#fff" />
          <Text style={styles.ctaLabel}>Start Listening</Text>
        </Pressable>
        <Text style={styles.ctaNote}>Free · one skill at a time.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1E1226' },
  scroll: { flex: 1 },
  hero: { position: 'relative', overflow: 'hidden', paddingBottom: 54 },
  heroGold: { position: 'absolute', left: -90, top: -120, width: 340, height: 340, opacity: 0.3 },
  heroPlum: { position: 'absolute', right: -120, top: 120, width: 300, height: 300, opacity: 0.22 },
  watermark: {
    // Full-width row with right-aligned digits: the number always ends
    // exactly 14px past the right edge (design bleed), regardless of how
    // the engine sizes shrink-wrapped absolute text.
    position: 'absolute',
    left: 0,
    right: -14,
    top: 74,
    textAlign: 'right',
    fontSize: 190,
    fontFamily: FontFamily.sansBold,
    lineHeight: 152,
    letterSpacing: -10,
    color: 'rgba(255,255,255,.05)',
  },
  heroBody: { paddingHorizontal: 20, gap: 18 },
  kicker: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.45)',
  },
  titleBlock: { gap: 6 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 32, lineHeight: 34, letterSpacing: -1, color: '#fff' },
  subtitle: { fontFamily: FontFamily.sansMedium, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,.55)' },
  panel: {
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  readyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  readyText: { flex: 1, gap: 5 },
  readyTitle: { fontFamily: FontFamily.sansBold, fontSize: 14, lineHeight: 19, color: '#fff' },
  readyLine: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,.55)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,.1)' },
  stats: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, gap: 3, paddingLeft: 14 },
  statDiv: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,.1)' },
  statValue: { fontFamily: FontFamily.sansBold, fontSize: 14, lineHeight: 18, color: '#fff' },
  statFree: { color: '#F9BD48' },
  statLabel: { fontFamily: FontFamily.sansBold, fontSize: 9, letterSpacing: 0.7, color: 'rgba(255,255,255,.4)' },
  donut: { width: 78, height: 78, alignItems: 'center', justifyContent: 'center' },
  donutCenter: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#181310',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  donutValue: { fontFamily: FontFamily.sansBold, fontSize: 18, lineHeight: 22, letterSpacing: -0.4, color: '#fff' },
  donutCaption: { fontFamily: FontFamily.sansBold, fontSize: 8, letterSpacing: 0.7, color: 'rgba(255,255,255,.42)' },
  sheet: {
    marginTop: -22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: '#F8F3F7',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 150,
    gap: 22,
  },
  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  sectionTitle: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.3, color: '#111827' },
  sectionHint: { fontFamily: FontFamily.sans, fontSize: 11, color: '#857789' },
  skillCard: { gap: 10, padding: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFE3EC' },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  tile: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  skillText: { flex: 1, gap: 2 },
  skillName: { fontFamily: FontFamily.sansBold, fontSize: 15, lineHeight: 20, letterSpacing: -0.2, color: '#111827' },
  skillFrench: { fontFamily: FontFamily.sans, fontSize: 11, lineHeight: 15, color: '#857789' },
  freeChip: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: '#15803D',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  skillMeta: { fontFamily: FontFamily.sans, fontSize: 11, lineHeight: 16, color: '#5E4E69' },
  structCard: { gap: 14, padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFE3EC' },
  structHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  structTitle: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 14, lineHeight: 19, color: '#111827' },
  structSub: { fontFamily: FontFamily.sans, fontSize: 11, color: '#6E5F78' },
  structBar: { flexDirection: 'row', gap: 3, height: 12 },
  structSeg: { borderRadius: 100, overflow: 'hidden' },
  structRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  structDot: { width: 9, height: 9, borderRadius: 5 },
  structFrench: { flex: 1, fontFamily: FontFamily.sans, fontSize: 12, color: '#374151' },
  structItems: { fontFamily: FontFamily.sans, fontSize: 11, color: '#857789' },
  structMins: { width: 52, textAlign: 'right', fontFamily: FontFamily.sansBold, fontSize: 12, color: '#111827' },
  chrome: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 8 },
  chromeTint: { flex: 1, backgroundColor: 'rgba(30,18,38,.55)' },
  chromeBar: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 12 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backFlip: { transform: [{ rotate: '180deg' }] },
  chromeTitle: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: 15, letterSpacing: -0.1, color: 'rgba(255,255,255,.85)' },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 46, gap: 10, zIndex: 8 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 100,
    backgroundColor: Brand.plum,
  },
  ctaLabel: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#fff' },
  ctaNote: { fontFamily: FontFamily.sans, fontSize: 12, textAlign: 'center', color: '#6E5F78' },
});
