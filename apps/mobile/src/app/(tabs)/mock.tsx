import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand, FontFamily } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { TabScreenFade } from '@/components/TabScreenFade';
import { EXAM_NAME, MOCKS, type MockSession } from '@/content/mocks';

// Mock-test catalogue tab, following design/prepa-contest-final
// (MockTest.dc.html): app bar, exam context row with Newest/Oldest sort,
// one snap rail of 168px month cards per year. Contest build: every
// session is fresh and free, so there is no resume band, no levels and
// no Pro badges — cards open the 4-skill demo hub (mock/[id]).
const CARD_W = 168;

function metaOf(m: MockSession): string {
  const h = Math.floor(m.mins / 60);
  const rest = m.mins % 60;
  return `${m.items} items · ${h}h${rest ? ` ${rest}m` : ''}`;
}

function SessionCard({ session }: { session: MockSession }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/mock/${session.id}`)}>
      <View style={styles.cardTop}>
        <Text style={styles.month}>{session.month}</Text>
        <Text style={styles.meta}>{metaOf(session)}</Text>
      </View>
      <View style={styles.progress}>
        <View style={styles.segs}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.seg} />
          ))}
        </View>
        <Text style={styles.progressLabel}>Not started</Text>
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.freeChip}>Free</Text>
        <View style={styles.footSpace} />
        <AppIcon name="IconChevronRight" size={18} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

export default function Mock() {
  const insets = useSafeAreaInsets();
  const [newest, setNewest] = useState(true);
  const ordered = newest ? MOCKS : MOCKS.slice().reverse();
  const years: { label: string; rows: MockSession[] }[] = [];
  ordered.forEach((m) => {
    const y = years.find((x) => x.label === m.year);
    if (y) y.rows.push(m);
    else years.push({ label: m.year, rows: [m] });
  });

  return (
    <TabScreenFade>
      <View style={styles.root}>
        <LinearGradient colors={['#F8F3F7', '#FFFFFF']} style={styles.bg} />
        <Image source={require('../../../assets/brand/blob-gold.png')} style={styles.goldBlob} resizeMode="stretch" />
        <Image
          source={require('../../../assets/brand/blob-plum.png')}
          style={styles.plumBlob}
          resizeMode="stretch"
        />
        <View style={[styles.titleWrap, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.appbar}>Mock tests</Text>
        </View>
        <View style={styles.contextBar}>
          <Text style={styles.examLine} numberOfLines={1}>
            {MOCKS.length} sessions for {EXAM_NAME}
          </Text>
          <Pressable
            style={styles.sort}
            onPress={() => setNewest((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={newest ? 'Sort oldest first' : 'Sort newest first'}>
            <Text style={styles.sortLabel}>{newest ? 'Newest' : 'Oldest'}</Text>
            <View style={styles.sortFlip}>
              <AppIcon name="IconChevronRight" size={14} color="#5E4E69" />
            </View>
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {years.map((y) => (
            <View key={y.label} style={styles.year}>
              <View style={styles.yearHead}>
                <Text style={styles.yearLabel}>{y.label}</Text>
                <Text style={styles.yearCount}>{y.rows.length === 1 ? '1 session' : `${y.rows.length} sessions`}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rail}
                snapToInterval={CARD_W + 12}
                snapToAlignment="start"
                decelerationRate="fast">
                {y.rows.map((m) => (
                  <SessionCard key={m.id} session={m} />
                ))}
              </ScrollView>
            </View>
          ))}
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
  // Title layer is transparent so the mist gradient and blobs show through.
  titleWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 1,
  },
  appbar: { fontFamily: FontFamily.sansBold, fontSize: 22, letterSpacing: -0.4, color: '#111827' },
  // Only the exam line carries the translucent white layer + bottom border.
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,.7)',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3EC',
    paddingHorizontal: 20,
    paddingVertical: 8,
    zIndex: 1,
  },
  examLine: { flex: 1, fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 16, color: '#5E4E69' },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DBCED9',
  },
  sortLabel: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: '#5E4E69' },
  // No chevron-down asset: rotate the chevron 90 degrees.
  sortFlip: { transform: [{ rotate: '90deg' }] },
  scroll: { flex: 1, zIndex: 0 },
  content: { paddingTop: 16, paddingBottom: 110, gap: 24 },
  year: { gap: 10 },
  yearHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingHorizontal: 20 },
  yearLabel: { fontFamily: FontFamily.sansBold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2, color: '#111827' },
  yearCount: { fontFamily: FontFamily.sans, fontSize: 11, lineHeight: 15, color: '#6E5F78' },
  rail: { gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 22 },
  card: {
    width: CARD_W,
    padding: 14,
    borderRadius: 18,
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE3EC',
  },
  cardTop: { gap: 3 },
  month: { fontFamily: FontFamily.sansBold, fontSize: 20, lineHeight: 24, letterSpacing: -0.4, color: '#111827' },
  meta: { fontFamily: FontFamily.sans, fontSize: 11, lineHeight: 15, color: '#6E5F78' },
  progress: { gap: 6, marginTop: 'auto' },
  segs: { flexDirection: 'row', gap: 3 },
  seg: { flex: 1, height: 5, borderRadius: 100, backgroundColor: '#E9E0E7' },
  progressLabel: { fontFamily: FontFamily.sansMedium, fontSize: 11, lineHeight: 15, color: '#5E4E69' },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5EEF3' },
  // Fresh-state chip from the design (green Free, never gold).
  freeChip: {
    fontFamily: FontFamily.sansBold,
    fontSize: 11,
    color: '#15803D',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  footSpace: { flex: 1 },
});
