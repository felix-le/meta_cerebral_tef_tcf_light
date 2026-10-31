import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Line, Path } from 'react-native-svg';
import { Brand, FontFamily, SkillAccent, SKILL_DARK } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { listResults, MockResult } from '@/storage/history';
import { estimationFor, type Cefr, type Half } from '@/config/scoring';
import { TabScreenFade } from '@/components/TabScreenFade';

type TabKey = 'all' | 'open' | 'done';
type Skill = MockResult['skill'];

const SKILL_ORDER: Skill[] = ['listening', 'reading', 'speaking', 'writing'];
const SKILL_NAME: Record<Skill, string> = {
  listening: 'Listening',
  reading: 'Reading',
  speaking: 'Speaking',
  writing: 'Writing',
};

// A result counts as scored with a correct count (Listening/Reading) or a
// real level (Writing/Speaking). Submitted records without a level stay
// pending — never scored, never an invented number.
function isScored(r: MockResult | undefined): boolean {
  return (
    r !== undefined &&
    (r.skill === 'listening' || r.skill === 'reading' ? r.correct != null : r.level != null)
  );
}

function isPending(r: MockResult): boolean {
  return (r.skill === 'writing' || r.skill === 'speaking') && r.level == null;
}

function weakestOf(items: MockResult[]): { nclc: string; level: string } | null {
  let best: { min: number; nclc: string; level: string } | null = null;
  for (const r of items) {
    if ((r.skill === 'writing' || r.skill === 'speaking') && r.level && r.half) {
      try {
        const band = estimationFor(r.level as Cefr, r.half as Half);
        if (!best || band.min < best.min) {
          best = { min: band.min, nclc: band.nclc, level: r.level };
        }
      } catch {
        // Invalid combo counts as pending: excluded, never invented.
      }
    }
  }
  return best ? { nclc: best.nclc, level: best.level } : null;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Design date copy: "Today" for same-day rows, "Sep 9" otherwise.
// Pure formatting of the saved ISO date — no invented content.
function fmtDate(iso: string, todayIso: string): string {
  const day = dayKey(iso);
  if (day === todayIso) {
    return 'Today';
  }
  const [, m, d] = day.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

// Submission time from the saved row id (Date.now() millis at save).
// Real stored data — tells two same-day mocks apart. Unknown when the
// id is not numeric.
function fmtTime(id: string): string {
  const t = Number(id);
  if (!Number.isFinite(t) || t <= 0) {
    return '';
  }
  const d = new Date(t);
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

// Design date groups: Today, This week, Older — from the saved ISO date.
function groupOf(iso: string, todayIso: string): string {
  const dayMs = Date.parse(dayKey(iso));
  const todayMs = Date.parse(todayIso);
  if (dayMs === todayMs) {
    return 'Today';
  }
  const diffDays = Math.round((todayMs - dayMs) / 86400000);
  if (diffDays >= 1 && diffDays < 7) {
    return 'This week';
  }
  return 'Older';
}

function Badge({ kind }: { kind: 'done' | 'pending' | 'open' }) {
  const ground = kind === 'done' ? '#E7F6EC' : kind === 'pending' ? '#F6E3B4' : '#EFE7EE';
  const ink = kind === 'done' ? '#15803D' : kind === 'pending' ? '#8A5B10' : '#5E4E69';
  return (
    <View style={[styles.badge, { backgroundColor: ground }]}>
      {kind === 'done' ? (
        <Svg width={18} height={18} viewBox="0 0 16 16">
          <Line x1={4} y1={8.5} x2={7} y2={11.5} stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
          <Line x1={7} y1={11.5} x2={12.5} y2={4.5} stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      ) : kind === 'pending' ? (
        <AppIcon name="IconSparkles" size={18} color={ink} />
      ) : (
        <Svg width={18} height={18} viewBox="0 0 16 16">
          <Line x1={5.5} y1={4} x2={5.5} y2={12} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1={10.5} y1={4} x2={10.5} y2={12} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      )}
    </View>
  );
}

function PendingIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 15 15">
      <Path
        d="M12.8 7.5a5.3 5.3 0 1 1-1.6-3.8"
        fill="none"
        stroke="#8A5B10"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path d="M11.6 0.8v3h-3" fill="none" stroke="#8A5B10" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// One skill cell in the mock 2×2 grid, following the design skins exactly:
// scored = skill-tinted ground + ring with dark skill ink on name and value;
// scoring = white ground, ochre ring, ochre text; todo = gray ground/ink.
function SkillTile({ skill, value, sub, tone }: { skill: Skill; value: string; sub?: string; tone: 'skill' | 'scoring' | 'todo' }) {
  const primary = SkillAccent[skill];
  const ink = SKILL_DARK[skill];
  const ground = tone === 'skill' ? `${primary}14` : tone === 'scoring' ? '#FFFFFF' : '#EFE8EE';
  const ring = tone === 'skill' ? `${primary}2E` : tone === 'scoring' ? '#EBD5A6' : '#E0D4DE';
  const text = tone === 'skill' ? ink : tone === 'scoring' ? '#8A5B10' : '#5E4E69';
  return (
    <View style={[styles.tile, { backgroundColor: ground, borderColor: ring }]}>
      <Text style={[styles.tileName, { color: text }]}>{SKILL_NAME[skill]}</Text>
      {tone === 'scoring' ? (
        <Text style={styles.tileScoring}>Scoring</Text>
      ) : (
        <Text style={[styles.tileValue, { color: text }]}>
          {value}
          {sub ? <Text style={styles.tileSub}> {sub}</Text> : null}
        </Text>
      )}
    </View>
  );
}

interface CardGroup {
  key: string;
  items: MockResult[];
  mock: boolean;
  date: string;
}

export default function History() {
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<MockResult[]>([]);
  const [tab, setTab] = useState<TabKey>('all');

  useFocusEffect(
    useCallback(() => {
      listResults().then(setResults);
    }, []),
  );

  // Newest-first groups keyed by session; legacy rows without a session
  // fall back to their own id and render as single cards.
  const groups: CardGroup[] = [];
  for (const r of results) {
    const key = r.session ?? r.id;
    const g = groups.find((x) => x.key === key);
    if (g) {
      g.items.push(r);
    } else {
      groups.push({ key, items: [r], mock: key.startsWith('mock-'), date: r.date });
    }
  }

  const stateOf = (g: CardGroup): 'done' | 'pending' | 'open' => {
    if (!g.mock) {
      const r = g.items[0];
      if (isScored(r)) {
        return 'done';
      }
      return 'pending';
    }
    const bySkill = new Map(g.items.map((r) => [r.skill, r]));
    const hasAll = SKILL_ORDER.every((k) => bySkill.has(k));
    const pendingSkills = SKILL_ORDER.filter((k) => {
      const r = bySkill.get(k);
      return r !== undefined && isPending(r);
    });
    if (hasAll && pendingSkills.length === 0) {
      return 'done';
    }
    if (pendingSkills.length > 0) {
      return 'pending';
    }
    return 'open';
  };

  const visible = groups.filter((g) => {
    const st = stateOf(g);
    if (tab === 'done') {
      return st === 'done';
    }
    if (tab === 'open') {
      return st !== 'done';
    }
    return true;
  });

  // The summary describes the open tab: big number = cards in this tab,
  // chips = the breakdown of that same number.
  const counts = { done: 0, open: 0, pending: 0 };
  for (const g of visible) {
    counts[stateOf(g)] += 1;
  }
  const totalLabel =
    tab === 'all'
      ? visible.length === 1
        ? 'attempt logged'
        : 'attempts logged'
      : tab === 'open'
        ? visible.length === 1
          ? 'test in progress'
          : 'tests in progress'
        : visible.length === 1
          ? 'scored attempt'
          : 'scored attempts';
  // Completed tab: breakdown by usable level — only mock cards carry one
  // (a practice headline is an accuracy or a rubric score, not a band).
  const CEFR_ORDER = ['A1', 'A2', 'B1', 'B1+', 'B2', 'C1', 'C2'];
  const byLevel: Record<string, number> = {};
  if (tab === 'done') {
    for (const g of visible) {
      if (g.mock) {
        const usable = weakestOf(g.items);
        if (usable) {
          byLevel[usable.level] = (byLevel[usable.level] ?? 0) + 1;
        }
      }
    }
  }
  const levelChips = Object.keys(byLevel)
    .sort((a, b) => CEFR_ORDER.indexOf(b) - CEFR_ORDER.indexOf(a))
    .slice(0, 3);

  const todayIso = (() => {
    const d = new Date();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  })();
  const sections: { label: string; groups: CardGroup[] }[] = [];
  for (const g of visible) {
    const label = groupOf(g.date, todayIso);
    const s = sections.find((x) => x.label === label);
    if (s) {
      s.groups.push(g);
    } else {
      sections.push({ label, groups: [g] });
    }
  }

  const groundOf = (st: 'done' | 'pending' | 'open'): { backgroundColor: string; ring: string } =>
    st === 'done'
      ? { backgroundColor: '#FFFFFF', ring: '#EFE3EC' }
      : st === 'pending'
        ? { backgroundColor: '#FEFAF1', ring: '#F3E6C8' }
        : { backgroundColor: '#F6F0F5', ring: '#E2D5DF' };

  return (
    <TabScreenFade>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.appbar}>
          <Text style={styles.title}>History</Text>
        </View>
        <View style={styles.tabbar}>
          {(['all', 'open', 'done'] as const).map((k) => (
            <Pressable key={k} style={styles.tab} onPress={() => setTab(k)} accessibilityRole="button">
              <Text style={[styles.tabLabel, tab === k && styles.tabLabelOn]}>
                {k === 'all' ? 'All' : k === 'open' ? 'In progress' : 'Completed'}
              </Text>
              <View style={[styles.tabBar, tab === k && styles.tabBarOn]} />
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        {visible.length === 0 ? (
          <Text style={styles.empty}>No attempts on record</Text>
        ) : (
          <>
            <View style={styles.summary}>
              <View>
                <Text style={styles.summaryCount}>{visible.length}</Text>
                <Text style={styles.summaryLabel}>{totalLabel}</Text>
              </View>
              <View style={styles.chips}>
                {tab === 'done'
                  ? levelChips.map((lv) => (
                      <View key={lv} style={[styles.chip, { backgroundColor: '#F8F3F7', borderColor: '#EFE3EC' }]}>
                        <View style={[styles.dot, { backgroundColor: '#3E2D4A' }]} />
                        <Text style={[styles.chipText, { color: '#3E2D4A' }]}>
                          {byLevel[lv]} × {lv}
                        </Text>
                      </View>
                    ))
                  : null}
                {tab !== 'done' && counts.done > 0 && (
                  <View style={[styles.chip, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <View style={[styles.dot, { backgroundColor: '#15803D' }]} />
                    <Text style={[styles.chipText, { color: '#15803D' }]}>{counts.done} scored</Text>
                  </View>
                )}
                {tab !== 'done' && counts.open > 0 && (
                  <View style={[styles.chip, { backgroundColor: '#EFE7EE', borderColor: '#DBCED9' }]}>
                    <View style={[styles.dot, { backgroundColor: '#5E4E69' }]} />
                    <Text style={[styles.chipText, { color: '#5E4E69' }]}>
                      {counts.open} unfinished
                    </Text>
                  </View>
                )}
                {tab !== 'done' && counts.pending > 0 && (
                  <View style={[styles.chip, { backgroundColor: '#FEF9EC', borderColor: '#F6E3B4' }]}>
                    <View style={[styles.dot, { backgroundColor: '#8A5B10' }]} />
                    <Text style={[styles.chipText, { color: '#8A5B10' }]}>{counts.pending} waiting on AI</Text>
                  </View>
                )}
              </View>
            </View>
            {sections.map((s, si) => (
              <View key={s.label}>
                <View style={styles.groupHead}>
                  <View style={[styles.groupMark, { backgroundColor: si === 0 ? '#F9BD48' : '#D9CCD6' }]} />
                  <Text style={styles.groupLabel}>{s.label}</Text>
                  <Text style={styles.groupCount}>
                    {s.groups.length === 1 ? '1 attempt' : `${s.groups.length} attempts`}
                  </Text>
                </View>
                {s.groups.map((g) => {
                  const st = stateOf(g);
                  const ground = groundOf(st);
                  if (!g.mock) {
                    const r = g.items[0];
                    const big = r.level ?? (r.correct != null ? `${r.correct}/${r.total}` : '—');
                    return (
                      <Pressable
                        key={g.key}
                        style={[styles.card, { backgroundColor: ground.backgroundColor, borderColor: ground.ring }]}
                        accessibilityRole="button"
                        onPress={() => router.push({ pathname: '/result', params: { session: r.session ?? r.id } })}>
                        <View style={styles.cardTop}>
                          <Badge kind={st} />
                          <View style={styles.cardHead}>
                            <Text style={styles.cardTitle}>
                              {r.skill === 'listening' || r.skill === 'reading'
                                ? `${r.skill === 'listening' ? 'Listening' : 'Reading'} practice · Section ${r.section}`
                                : `${r.skill === 'writing' ? 'Writing' : 'Speaking'} practice · Tâche ${r.section}`}
                            </Text>
                            <Text style={styles.cardDetail}>{fmtDate(r.date, todayIso)}</Text>
                          </View>
                          <View style={styles.bigWrap}>
                            <Text style={[styles.bigValue, big.length > 3 && styles.bigValueSmall]}>{big}</Text>
                            <Text style={styles.bigCaption}>
                              {r.level ? 'AI estimate' : r.correct != null ? 'correct' : ''}
                            </Text>
                          </View>
                        </View>
                        {st === 'pending' && (
                          <View style={styles.pendingRow}>
                            <PendingIcon />
                            <Text style={styles.pendingInfo}>Correction IA</Text>
                          </View>
                        )}
                        {st === 'done' && (
                          <View style={styles.reviewRow}>
                            <Text style={styles.reviewLink}>Review answers</Text>
                            <AppIcon name="IconArrowRight" size={16} color="#6A2A5F" />
                          </View>
                        )}
                      </Pressable>
                    );
                  }
                  const bySkill = new Map(g.items.map((r) => [r.skill, r]));
                  const doneCount = SKILL_ORDER.filter((k) => isScored(bySkill.get(k))).length;
                  const pendingNames = SKILL_ORDER.filter((k) => {
                    const r = bySkill.get(k);
                    return r !== undefined && isPending(r);
                  }).map((k) => (k === 'writing' ? 'Writing' : 'Speaking'));
                  const usable = weakestOf(g.items);
                  const mockLabel = g.items.map((i) => i.mockLabel).find(Boolean);
                  const time = fmtTime(g.items[0].id);
                  return (
                    <Pressable
                      key={g.key}
                      style={[styles.card, { backgroundColor: ground.backgroundColor, borderColor: ground.ring }]}
                      accessibilityRole="button"
                      onPress={() => router.push({ pathname: '/result', params: { session: g.key } })}>
                      <View style={styles.cardTop}>
                        <Badge kind={st} />
                        <View style={styles.cardHead}>
                          <Text style={styles.cardTitle}>
                            {mockLabel ? `Mock test · ${mockLabel}` : 'Mock test'}
                          </Text>
                          <Text style={styles.cardDetail}>
                            {fmtDate(g.date, todayIso)}
                            {time !== '' ? ` · ${time}` : ''} · {doneCount} of 4 skills
                          </Text>
                        </View>
                        {st === 'done' && usable ? (
                          <View style={styles.bigWrap}>
                            <Text style={styles.bigValue}>NCLC {usable.nclc}</Text>
                            <Text style={styles.bigCaption}>usable level · Estimation</Text>
                          </View>
                        ) : st === 'pending' ? (
                          <View style={styles.pill}>
                            <Text style={styles.pillText}>{doneCount} of 4</Text>
                          </View>
                        ) : null}
                      </View>
                      {pendingNames.length > 0 && (
                        <View style={styles.pendingRow}>
                          <PendingIcon />
                          <Text style={styles.pendingInfo}>
                            {pendingNames.join(' and ')} {pendingNames.length > 1 ? 'are' : 'is'} being scored · about 5 min left
                          </Text>
                        </View>
                      )}
                      <View style={styles.gridRow}>
                        {(['listening', 'reading'] as const).map((k) => {
                          const r = bySkill.get(k);
                          return (
                            <View key={k} style={styles.tileWrap}>
                              <SkillTile
                                skill={k}
                                value={r && r.correct != null ? `${r.correct}/${r.total}` : '—'}
                                tone={r && r.correct != null ? 'skill' : 'todo'}
                              />
                            </View>
                          );
                        })}
                      </View>
                      <View style={styles.gridRow}>
                        {(['speaking', 'writing'] as const).map((k) => {
                          const r = bySkill.get(k);
                          const pending = r !== undefined && isPending(r);
                          return (
                            <View key={k} style={styles.tileWrap}>
                              <SkillTile
                                skill={k}
                                value={pending ? '' : (r?.level ?? '—')}
                                tone={pending ? 'scoring' : r?.level ? 'skill' : 'todo'}
                              />
                            </View>
                          );
                        })}
                      </View>
                      {(st === 'done' || doneCount > 0) && (
                        <View style={styles.reviewRow}>
                          <Text style={styles.reviewLink}>
                            {st === 'done' ? 'Review answers' : 'Review scored sections'}
                          </Text>
                          <AppIcon name="IconArrowRight" size={16} color="#6A2A5F" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </TabScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  header: { backgroundColor: Brand.mist },
  appbar: { height: 52, justifyContent: 'center', paddingLeft: 12 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 17, letterSpacing: -0.2, color: '#111827' },
  tabbar: {
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3EC',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 9, paddingTop: 14 },
  tabLabel: { fontFamily: FontFamily.sansMedium, fontSize: 13, color: '#9CA3AF' },
  tabLabelOn: { color: '#111827' },
  tabBar: { height: 2, alignSelf: 'stretch', borderRadius: 2, backgroundColor: 'transparent' },
  tabBarOn: { backgroundColor: '#2E1A3B' },
  // Extra bottom space so the floating tab bar never covers the last card.
  content: { padding: 20, paddingBottom: 120, gap: 18 },
  summary: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 2 },
  summaryCount: { fontFamily: FontFamily.sansBold, fontSize: 34, lineHeight: 36, letterSpacing: -1.4, color: '#111827' },
  summaryLabel: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: '#6E5F78' },
  chips: { alignItems: 'flex-end', gap: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingLeft: 8, paddingRight: 10, borderRadius: 100, borderWidth: 1 },
  dot: { width: 5, height: 5, borderRadius: 9999 },
  chipText: { fontFamily: FontFamily.sansMedium, fontSize: 11 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  groupMark: { width: 3, height: 13, borderRadius: 100 },
  groupLabel: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#2E1A3B' },
  groupCount: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: '#857789', marginLeft: 'auto' },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 10,
    shadowColor: '#3C1432',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  cardHead: { flex: 1 },
  cardTitle: { fontFamily: FontFamily.sansBold, fontSize: 15, letterSpacing: -0.2, color: '#111827' },
  cardDetail: { fontFamily: FontFamily.sans, fontSize: 12, color: '#5E4E69', marginTop: 2 },
  bigWrap: { alignItems: 'flex-end' },
  bigValue: { fontFamily: FontFamily.sansBold, fontSize: 24, lineHeight: 26, letterSpacing: -0.8, color: '#111827' },
  bigValueSmall: { fontSize: 18 },
  bigCaption: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: '#5E4E69', marginTop: 2 },
  pill: { borderWidth: 1, borderColor: '#F6E3B4', backgroundColor: '#FEF9EC', borderRadius: 100, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: '#8A5B10' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingInfo: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: '#8A5B10', flex: 1 },
  gridRow: { flexDirection: 'row', gap: 6 },
  tileWrap: { flex: 1 },
  tile: { borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 2 },
  tileName: { fontFamily: FontFamily.sansMedium, fontSize: 11 },
  tileValue: { fontFamily: FontFamily.sansBold, fontSize: 13 },
  tileScoring: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: '#8A5B10' },
  tileSub: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: '#5E4E69' },
  reviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 },
  reviewLink: { fontFamily: FontFamily.sansMedium, fontSize: 13, color: '#6A2A5F' },
  empty: { fontFamily: FontFamily.sans, fontSize: 15, color: Brand.muted, marginTop: 16 },
});
