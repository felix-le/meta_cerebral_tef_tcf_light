import { useCallback, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle } from 'react-native-svg';
import { FontFamily, SKILL_DEEP, SKILL_LABEL, SkillAccent, type Skill } from '@/constants/theme';
import { StickyCta } from '@/components/StickyCta';
import { AppIcon } from '@/components/AppIcon';
import { LISTENING_DEMO, READING_QUESTIONS } from '@/content/exam';
import { countWords } from '@/config/scoring';
import { listResults, type MockResult } from '@/storage/history';

// Session TestReview per TestReview.dc.html: hero stats, skill tabs, sync
// question review with filters, async pending cards. Only true data is
// shown — measured picks/counts/texts/durations. No scores, levels,
// explanations or AI summaries exist before Stage-1 scoring, so none are
// rendered (the design's locked-explanation box is used instead).
const LETTERS = ['A', 'B', 'C', 'D'];
const TABS: { key: Skill; label: string; icon: 'IconBulkHeadphone' | 'IconBulkBook' | 'IconBulkMic' | 'IconBulkWrite' }[] = [
  { key: 'listening', label: 'Listening', icon: 'IconBulkHeadphone' },
  { key: 'reading', label: 'Reading', icon: 'IconBulkBook' },
  { key: 'writing', label: 'Writing', icon: 'IconBulkWrite' },
  { key: 'speaking', label: 'Speaking', icon: 'IconBulkMic' },
];
const FRENCH: Record<Skill, string> = {
  listening: 'Compréhension orale',
  reading: 'Compréhension écrite',
  writing: 'Expression écrite',
  speaking: 'Expression orale',
};
type Filter = 'all' | 'correct' | 'missed';

interface Row {
  id: string;
  n: number;
  group: string;
  text: string;
  options: [string, string, string, string];
  answer: number;
}

function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function Result() {
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<MockResult[]>([]);
  const [tab, setTab] = useState<Skill>('listening');
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [scrolled, setScrolled] = useState(false);
  useFocusEffect(
    useCallback(() => {
      listResults().then(setResults);
    }, []),
  );

  const latest = useCallback(
    (skill: Skill) => results.find((r) => r.skill === skill),
    [results],
  );

  const listeningRows: Row[] = useMemo(() => {
    let n = 0;
    return LISTENING_DEMO.flatMap((d) =>
      d.questions.map((q) => {
        n += 1;
        return { id: q.id, n, group: d.group, text: q.spoken, options: q.options, answer: q.answer };
      }),
    );
  }, []);
  const readingRows: Row[] = useMemo(
    () =>
      READING_QUESTIONS.map((q, i) => ({
        id: q.id,
        n: i + 1,
        group: q.group,
        text: q.before !== undefined ? `${q.before} … ${q.after ?? ''}` : q.prompt,
        options: q.options,
        answer: q.answer,
      })),
    [],
  );

  const lRes = latest('listening');
  const rRes = latest('reading');
  const wRes = latest('writing');
  const sRes = latest('speaking');
  const lTotal = lRes?.total ?? 0;
  const rTotal = rRes?.total ?? 0;
  const lCorrect = lRes?.correct ?? 0;
  const rCorrect = rRes?.correct ?? 0;
  const heroTotal = lTotal + rTotal;
  const heroCorrect = lCorrect + rCorrect;
  const heroPct = heroTotal > 0 ? Math.round((100 * heroCorrect) / heroTotal) : 0;
  const aiCount = (wRes ? 1 : 0) + (sRes ? 1 : 0);
  const heroDate = [lRes, rRes, wRes, sRes].find((r) => r)?.date ?? new Date().toISOString().slice(0, 10);

  const statusOf = (rows: Row[], picks?: Record<string, number>, id?: string): 'correct' | 'wrong' | 'skip' => {
    const pick = id !== undefined ? picks?.[id] : undefined;
    if (pick === undefined) {
      return 'skip';
    }
    const row = rows.find((r) => r.id === id);
    return row !== undefined && pick === row.answer ? 'correct' : 'wrong';
  };

  const renderQuestions = (skill: 'listening' | 'reading', rows: Row[], picks?: Record<string, number>) => {
    const counts = {
      correct: rows.filter((q) => statusOf(rows, picks, q.id) === 'correct').length,
      wrong: rows.filter((q) => statusOf(rows, picks, q.id) === 'wrong').length,
      skip: rows.filter((q) => statusOf(rows, picks, q.id) === 'skip').length,
    };
    const groups = new Set(rows.map((q) => q.group)).size;
    const shown = rows.filter((q) => {
      const st = statusOf(rows, picks, q.id);
      return filter === 'all' || (filter === 'correct' ? st === 'correct' : st !== 'correct');
    });
    return (
      <>
        <View style={styles.scoreCard}>
          <View style={styles.scoreHead}>
            <LinearGradient
              colors={[SkillAccent[skill], SKILL_DEEP[skill]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreTile}>
              <AppIcon
                name={skill === 'listening' ? 'IconBulkHeadphone' : 'IconBulkBook'}
                size={21}
                color="#fff"
              />
            </LinearGradient>
            <View style={styles.scoreNames}>
              <Text style={styles.scoreName}>{SKILL_LABEL[skill]}</Text>
              <Text style={styles.scoreFrench}>{FRENCH[skill]}</Text>
            </View>
            <View style={styles.scoreNums}>
              <Text style={styles.scoreLevel}>
                {picks ? `${counts.correct}/${rows.length}` : '—'}
              </Text>
              <Text style={styles.scoreRaw}>{picks ? 'correct answers' : 'Not done'}</Text>
            </View>
          </View>
          <View style={styles.scoreTrack}>
            <LinearGradient
              colors={[SkillAccent[skill], SkillAccent[skill]]}
              style={[
                styles.scoreFill,
                { width: `${rows.length > 0 && picks ? Math.round((100 * counts.correct) / rows.length) : 0}%` },
              ]}
            />
          </View>
          <Text style={styles.scoreMeta}>
            {picks
              ? `${rows.length} questions · ${groups} groupes · ${counts.wrong} missed, ${counts.skip} skipped`
              : 'Not attempted yet'}
          </Text>
        </View>
        {picks && (
          <>
            <View style={styles.answersHead}>
              <Text style={styles.answersTitle}>Your answers</Text>
              <Text style={styles.answersHint}>{`${rows.length} questions`}</Text>
            </View>
            <View style={styles.filters}>
              {(['all', 'correct', 'missed'] as Filter[]).map((f) => (
                <Pressable
                  key={f}
                  style={[styles.filterChip, filter === f && styles.filterChipOn]}
                  onPress={() => setFilter(f)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${f}`}>
                  <Text style={[styles.filterLabel, filter === f && styles.filterLabelOn]}>
                    {f === 'all' ? 'All' : f === 'correct' ? 'Correct' : 'Missed'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {shown.map((q) => {
              const st = statusOf(rows, picks, q.id);
              const key = `${skill}:${q.id}`;
              const isOpen = !!open[key];
              const pick = picks[q.id];
              return (
                <View
                  key={q.id}
                  style={[
                    styles.qCard,
                    st === 'correct' ? styles.qRight : st === 'wrong' ? styles.qWrong : styles.qSkip,
                  ]}>
                  <Pressable
                    style={styles.qHead}
                    onPress={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                    accessibilityRole="button"
                    accessibilityLabel={`Question ${q.n}`}>
                    <View
                      style={[
                        styles.qMark,
                        st === 'correct'
                          ? styles.qMarkRight
                          : st === 'wrong'
                            ? styles.qMarkWrong
                            : styles.qMarkSkip,
                      ]}>
                      <Text style={styles.qMarkText}>{st === 'correct' ? '✓' : st === 'wrong' ? '✕' : '–'}</Text>
                    </View>
                    <View style={styles.qHeadText}>
                      <Text style={styles.qNum}>
                        Q{q.n} · {q.group}
                      </Text>
                      <Text style={styles.qText} numberOfLines={isOpen ? undefined : 2}>
                        {q.text}
                      </Text>
                    </View>
                    <View style={[styles.qChevron, isOpen && styles.qChevronOpen]}>
                      <AppIcon name="IconChevronRight" size={14} color="#857789" />
                    </View>
                  </Pressable>
                  {isOpen && (
                    <View style={styles.qBody}>
                      <View style={styles.qLine}>
                        <Text style={styles.qKey}>Your answer</Text>
                        <Text
                          style={[
                            styles.qVal,
                            st === 'correct' ? styles.qValRight : st === 'wrong' ? styles.qValWrong : styles.qValSkip,
                          ]}>
                          {pick !== undefined ? `${LETTERS[pick]} — ${q.options[pick]}` : 'Unanswered'}
                        </Text>
                      </View>
                      {st !== 'correct' && (
                        <View style={styles.qLine}>
                          <Text style={styles.qKey}>Correct</Text>
                          <Text style={[styles.qVal, styles.qValRight]}>
                            {`${LETTERS[q.answer]} — ${q.options[q.answer]}`}
                          </Text>
                        </View>
                      )}
                      <View style={styles.lockBox}>
                        <AppIcon name="IconSparkles" size={13} color="#857789" />
                        <Text style={styles.lockText}>Explanation comes with Detailed Analysis.</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </>
    );
  };

  const renderAsync = (
    skill: 'writing' | 'speaking',
    done: boolean,
    content: React.ReactNode,
  ) => (
    <>
      <View style={styles.scoreCard}>
        <View style={styles.scoreHead}>
          <LinearGradient
            colors={[SkillAccent[skill], SKILL_DEEP[skill]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreTile}>
            <AppIcon
              name={skill === 'writing' ? 'IconBulkWrite' : 'IconBulkMic'}
              size={21}
              color="#fff"
            />
          </LinearGradient>
          <View style={styles.scoreNames}>
            <Text style={styles.scoreName}>{SKILL_LABEL[skill]}</Text>
            <Text style={styles.scoreFrench}>{FRENCH[skill]}</Text>
          </View>
          <View style={styles.scoreNums}>
            <Text style={styles.scoreLevel}>{done ? 'En correction' : '—'}</Text>
            <Text style={styles.scoreRaw}>{done ? 'NCLC pending' : 'Not done'}</Text>
          </View>
        </View>
        <View style={styles.scoreTrack}>
          <View style={[styles.scoreFill, { width: '0%' }]} />
        </View>
        <Text style={styles.scoreMeta}>
          {done ? '1 tâche · AI estimate on the official criteria' : 'Not attempted yet'}
        </Text>
      </View>
      {done && (
        <>
          {content}
          <View style={styles.pendingCard}>
            <View style={styles.pendingRing}>
              <AppIcon name="IconSparkles" size={24} color="#966010" />
            </View>
            <Text style={styles.pendingTitle}>{`${SKILL_LABEL[skill]} is with the AI`}</Text>
            <Text style={styles.pendingLine}>
              About 5 minutes. The NCLC estimate and the four criteria appear here as soon as scoring lands.
            </Text>
          </View>
        </>
      )}
    </>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.chrome, { height: insets.top + 52 }]} pointerEvents="box-none">
        {scrolled && (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.chromeTint} />
          </BlurView>
        )}
        <View style={[styles.bar, { marginTop: insets.top }]}>
          <Pressable
            style={styles.close}
            onPress={() => router.replace('/mock')}
            accessibilityRole="button"
            accessibilityLabel="Back to mock test"
            hitSlop={8}>
            <View style={styles.backFlip}>
              <AppIcon name="IconChevronRight" size={22} color="#fff" />
            </View>
          </Pressable>
          {scrolled && (
            <Text style={styles.chromeTitle} numberOfLines={1}>
              Review
            </Text>
          )}
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 20)}
        stickyHeaderIndices={[1]}>
        <View style={styles.hero}>
          <LinearGradient
            colors={['#2A2018', '#1E1226', '#100D0A']}
            locations={[0, 0.58, 1]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Image
            source={require('../../assets/brand/blob-gold.png')}
            style={styles.heroGold}
            resizeMode="stretch"
            pointerEvents="none"
          />
          <Image
            source={require('../../assets/brand/blob-plum.png')}
            style={styles.heroPlum}
            resizeMode="stretch"
            pointerEvents="none"
          />
          <View style={[styles.heroBody, { paddingTop: insets.top + 64 }]}>
          <Text style={styles.heroKicker}>SESSION · TEF CANADA</Text>
          <View style={styles.titleBlock}>
            <Text style={styles.heroTitle}>Review</Text>
            <Text style={styles.heroSub}>Taken {heroDate}</Text>
          </View>
          <View style={styles.heroPanel}>
            <View style={styles.heroTop}>
              <View style={styles.donut}>
                <Svg width={78} height={78}>
                  <Circle cx={39} cy={39} r={34} stroke="rgba(255,255,255,.14)" strokeWidth={10} fill="none" />
                  <Circle
                    cx={39}
                    cy={39}
                    r={34}
                    stroke="#F9BD48"
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - heroPct / 100)}
                    transform="rotate(-90 39 39)"
                  />
                </Svg>
                <View style={styles.donutIn}>
                  <Text style={styles.donutValue}>{heroPct}%</Text>
                  <Text style={styles.donutCaption}>CORRECT</Text>
                </View>
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroPanelTitle}>Mock test terminé</Text>
                <Text style={styles.heroPanelLine}>
                  {lRes
                    ? `Listening ${lCorrect}/${lTotal}`
                    : 'Listening not done'}
                  {' · '}
                  {rRes ? `Reading ${rCorrect}/${rTotal}` : 'Reading not done'}
                  {' · '}
                  {aiCount > 0 ? 'Writing & Speaking with the AI' : 'Writing & Speaking not done'}
                </Text>
              </View>
            </View>
            <View style={styles.heroDiv} />
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={[styles.heroStatValue, { color: '#7BD48F' }]}>{heroCorrect}</Text>
                <Text style={styles.heroStatLabel}>CORRECT</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}>
                <Text style={[styles.heroStatValue, { color: '#F09A8A' }]}>{heroTotal - heroCorrect}</Text>
                <Text style={styles.heroStatLabel}>MISSED</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{aiCount}</Text>
                <Text style={styles.heroStatLabel}>AI TASKS</Text>
              </View>
            </View>
          </View>
          </View>
        </View>
        <View style={styles.tabsWrap}>
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const on = tab === t.key;
              const ink = on ? SkillAccent[t.key] : '#6E5F78';
              return (
                <Pressable
                  key={t.key}
                  style={styles.tab}
                  onPress={() => setTab(t.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.label} review`}>
                  <AppIcon name={t.icon} size={16} color={ink} />
                  <Text style={[styles.tabLabel, on && { color: ink }]}>{t.label}</Text>
                  {on && <View style={[styles.tabUnder, { backgroundColor: SkillAccent[t.key] }]} />}
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.body}>
          {tab === 'listening' && renderQuestions('listening', listeningRows, lRes?.picks)}
          {tab === 'reading' && renderQuestions('reading', readingRows, rRes?.picks)}
          {tab === 'writing' &&
            renderAsync(
              'writing',
              !!wRes,
              wRes?.text !== undefined && (
                <View style={styles.textCard}>
                  <Text style={styles.textKicker}>VOTRE TEXTE · {countWords(wRes.text)} MOTS</Text>
                  <Text style={styles.textBody}>{wRes.text === '' ? '—' : wRes.text}</Text>
                </View>
              ),
            )}
          {tab === 'speaking' &&
            renderAsync(
              'speaking',
              !!sRes,
              sRes?.durations !== undefined && (
                <View style={styles.textCard}>
                  <Text style={styles.textKicker}>PRISE UNIQUE</Text>
                  <Text style={styles.textBody}>
                    {`${fmtClock(sRes.durations[0] ?? 0)} · max 10:00`}
                  </Text>
                </View>
              ),
            )}
          <Text style={styles.footNote}>
            AI feedback stays available for every scored tâche. Re-recording or rewriting a tâche is not
            possible after submission.
          </Text>
        </View>
      </ScrollView>
      <StickyCta
        label="View history"
        icon={<AppIcon name="IconOutlineRoundedTransactionHistory" size={17} color="#fff" />}
        onPress={() => router.replace('/history')}
        note="Results are kept on this device."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1E1226' },
  chrome: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 8 },
  chromeTint: { flex: 1, backgroundColor: 'rgba(30,18,38,.55)' },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 12 },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backFlip: { transform: [{ rotate: '180deg' }] },
  chromeTitle: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: 15, letterSpacing: -0.1, color: 'rgba(255,255,255,.85)' },
  scroll: { flex: 1 },
  hero: { position: 'relative', overflow: 'hidden', paddingBottom: 54 },
  heroGold: { position: 'absolute', left: -90, top: -120, width: 340, height: 340, opacity: 0.3 },
  heroPlum: { position: 'absolute', right: -120, top: 120, width: 300, height: 300, opacity: 0.22 },
  heroBody: { paddingHorizontal: 20, gap: 18 },
  titleBlock: { gap: 6 },
  heroKicker: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,.45)',
  },
  heroTitle: { fontFamily: FontFamily.sansBold, fontSize: 32, lineHeight: 34, letterSpacing: -1, color: '#fff' },
  heroSub: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,.55)' },
  heroPanel: {
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donut: { width: 78, height: 78, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  donutIn: {
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
  heroText: { flex: 1, gap: 5 },
  heroPanelTitle: { fontFamily: FontFamily.sansBold, fontSize: 14, lineHeight: 19, color: '#fff' },
  heroPanelLine: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,.55)' },
  heroDiv: { height: 1, backgroundColor: 'rgba(255,255,255,.1)' },
  heroStats: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, gap: 3 },
  heroStatValue: { fontFamily: FontFamily.sansBold, fontSize: 14, lineHeight: 18, color: '#fff' },
  heroStatLabel: { fontFamily: FontFamily.sansBold, fontSize: 9, letterSpacing: 0.7, color: 'rgba(255,255,255,.4)' },
  heroStatDiv: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,.1)' },
  tabsWrap: {
    marginTop: -22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: '#F8F3F7',
    paddingTop: 6,
  },
  tabs: { flexDirection: 'row', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#EFE3EC' },
  tab: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 52,
    paddingHorizontal: 2,
  },
  tabLabel: { fontFamily: FontFamily.sansBold, fontSize: 12, color: '#6E5F78' },
  tabUnder: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    height: 2.5,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  body: { flex: 1, gap: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 150, backgroundColor: '#F8F3F7' },
  scoreCard: {
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE3EC',
  },
  scoreHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  scoreTile: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  scoreNames: { flex: 1, gap: 2 },
  scoreName: { fontFamily: FontFamily.sansBold, fontSize: 15, lineHeight: 20, letterSpacing: -0.2, color: '#111827' },
  scoreFrench: { fontFamily: FontFamily.sans, fontSize: 11, lineHeight: 15, color: '#857789' },
  scoreNums: { alignItems: 'flex-end', gap: 1 },
  scoreLevel: { fontFamily: FontFamily.sansBold, fontSize: 20, lineHeight: 22, letterSpacing: -0.4, color: '#111827' },
  scoreRaw: { fontFamily: FontFamily.sans, fontSize: 10.5, color: '#6E5F78' },
  scoreTrack: { height: 5, borderRadius: 100, backgroundColor: '#E9E0E7', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 100 },
  scoreMeta: { fontFamily: FontFamily.sans, fontSize: 11.5, lineHeight: 16, color: '#5E4E69' },
  answersHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 },
  answersTitle: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.3, color: '#111827' },
  answersHint: { fontFamily: FontFamily.sans, fontSize: 11, color: '#857789' },
  filters: { flexDirection: 'row', gap: 7 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E0E7',
  },
  filterChipOn: { backgroundColor: '#6A2A5F', borderColor: '#2E1A3B' },
  filterLabel: { fontFamily: FontFamily.sansBold, fontSize: 12, color: '#5E4E69' },
  filterLabelOn: { color: '#fff' },
  qCard: { padding: 14, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, gap: 0 },
  qRight: { borderColor: '#BBF7D0' },
  qWrong: { borderColor: '#FBD5D5' },
  qSkip: { borderColor: '#E8DFE6' },
  qHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  qMark: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  qMarkRight: { backgroundColor: '#15803D' },
  qMarkWrong: { backgroundColor: '#B91C1C' },
  qMarkSkip: { backgroundColor: '#C9BFC9' },
  qMarkText: { fontSize: 12, fontWeight: '700', color: '#fff', lineHeight: 14 },
  qHeadText: { flex: 1, gap: 3 },
  qNum: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.7, color: '#857789' },
  qText: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 20, color: '#111827' },
  qChevron: { paddingTop: 2 },
  qChevronOpen: { transform: [{ rotate: '90deg' }] },
  qBody: { gap: 9, paddingTop: 11, marginTop: 11, borderTopWidth: 1, borderTopColor: '#F5EEF3' },
  qLine: { flexDirection: 'row', gap: 10 },
  qKey: { width: 78, flexShrink: 0, fontFamily: FontFamily.sansBold, fontSize: 11, lineHeight: 17, color: '#857789' },
  qVal: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 12.5, lineHeight: 17 },
  qValRight: { color: '#157F4A' },
  qValWrong: { color: '#B91C1C' },
  qValSkip: { color: '#857789' },
  lockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F6F0F5',
    borderWidth: 1,
    borderColor: '#E9E0E7',
  },
  lockText: { flex: 1, fontFamily: FontFamily.sans, fontSize: 11.5, lineHeight: 16, color: '#6E5F78' },
  pendingCard: {
    alignItems: 'center',
    gap: 13,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#EDD99A',
  },
  pendingRing: {
    width: 54,
    height: 54,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF1CE',
  },
  pendingTitle: { fontFamily: FontFamily.sansBold, fontSize: 15, lineHeight: 20, color: '#7A4E0C', textAlign: 'center' },
  pendingLine: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 17, textAlign: 'center', color: '#966010' },
  textCard: { gap: 10, padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8DFE6' },
  textKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: '#857789' },
  textBody: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 21, color: '#111827' },
  footNote: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 18, color: '#857789' },
});
