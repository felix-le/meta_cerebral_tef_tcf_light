import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Brand, FontFamily, SkillAccent, SKILL_DEEP, SKILL_DARK, SKILL_LABEL, type Skill } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { ExitSheet } from '@/components/ExitSheet';
import { StickyCta } from '@/components/StickyCta';
import { countWords, type Cefr } from '@/config/scoring';
import { saveResult } from '@/storage/history';
import { SPEAKING_B_STUB, WRITING_B_STUB } from '@/content/feedbackStub';
import { isAiConfigured, scoreWritingB } from '@/ai/client';
import {
  LISTENING_DEMO,
  LISTENING_RULES,
  type ListeningDoc,
  type ListeningQuestion,
  READING_CHART,
  READING_DOCS,
  READING_GROUP,
  READING_QUESTIONS,
  READING_RULES,
  SHORTENED_NOTE,
  SPEAKING_CRITERIA,
  SPEAKING_NOTE,
  SPEAKING_RULES,
  SPEAKING_TASKS,
  WRITING_ACCENTS,
  WRITING_CRITERIA,
  WRITING_DEMO_SECS,
  WRITING_NOTE,
  WRITING_RULES,
  WRITING_TASKS,
} from '@/content/exam';

const SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking'];
const LETTERS = ['A', 'B', 'C', 'D'];

/** Bars plot height inside the demo chart card (values + ticks sit outside). */
const CHART_BAR_H = 110;

const DOC_IMAGES: Record<string, number> = {
  station: require('../../../assets/listening/q-train-station.jpeg'),
  airport: require('../../../assets/listening/q-airport-checkin.jpg'),
  ferry: require('../../../assets/listening/q-ferry-terminal.jpg'),
  bus: require('../../../assets/listening/q-bus-stop.jpg'),
};

interface FlatItem {
  docIdx: number;
  doc: ListeningDoc;
  qIdx: number;
  q: ListeningQuestion;
}

// Flat 9-question order A-H over the 8 documents (Interviews holds 2).
const FLAT: FlatItem[] = LISTENING_DEMO.flatMap((doc, docIdx) =>
  doc.questions.map((q, qIdx) => ({ docIdx, doc, qIdx, q })),
);

function Waveform({ active, color }: { active: boolean; color: string }) {
  const [bars, setBars] = useState<number[]>(() => new Array(40).fill(0.25));
  useEffect(() => {
    if (!active) {
      return;
    }
    const t = setInterval(() => {
      const now = Date.now();
      setBars(Array.from({ length: 40 }, (_, i) => 0.2 + Math.abs(Math.sin(now / 300 + i * 0.7)) * 0.8));
    }, 180);
    return () => clearInterval(t);
  }, [active]);
  return (
    <View style={styles.waveBars}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[styles.waveBar, { height: Math.max(4, h * 32), backgroundColor: color, opacity: active ? 1 : 0.35 }]}
        />
      ))}
    </View>
  );
}

function XIcon({ color }: { color: string }) {
  return (
    <View style={styles.x}>
      <View style={[styles.xBar, { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.xBar, { backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <View style={styles.check}>
      <View style={[styles.checkBar, styles.checkShort, { backgroundColor: color }]} />
      <View style={[styles.checkBar, styles.checkLong, { backgroundColor: color }]} />
    </View>
  );
}

// Scoring ring per WritingTest.dc.html pending state: 150px orbit, a 90°
// gold arc spinning 1.6s/turn over a faint track, 120px dark core.
// (Design GOLD #D4860F; the arc token lives here, not in Brand.)
const SPIN_GOLD = '#D4860F';
const ORBIT_R = 67.5;
const ORBIT_C = 2 * Math.PI * ORBIT_R;

function ScoringRing({ done }: { done?: boolean }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (done) {
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1600, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, done]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.aiOrbit}>
      <Animated.View style={[styles.aiSpin, { transform: [{ rotate }] }]}>
        <Svg width={150} height={150}>
          <Circle cx={75} cy={75} r={ORBIT_R} stroke="rgba(255,255,255,.1)" strokeWidth={15} fill="none" />
          {done ? (
            <Circle
              key="full"
              cx={75}
              cy={75}
              r={ORBIT_R}
              stroke="#4ADE80"
              strokeWidth={15}
              fill="none"
            />
          ) : (
            <Circle
              key="arc"
              cx={75}
              cy={75}
              r={ORBIT_R}
              stroke={SPIN_GOLD}
              strokeWidth={15}
              fill="none"
              strokeDasharray={`${ORBIT_C / 4} ${(3 * ORBIT_C) / 4}`}
              transform="rotate(-90 75 75)"
            />
          )}
        </Svg>
      </Animated.View>
      <View style={styles.aiCore}>
        {done ? (
          <CheckIcon color="#4ADE80" />
        ) : (
          <AppIcon name="IconSparkles" size={30} color={SPIN_GOLD} />
        )}
      </View>
    </View>
  );
}

export default function Test() {
  const { skill, stage: stageParam, li: liParam, phase: phaseParam, picked: pickedParam, mode: modeParam, session: sessionParam } = useLocalSearchParams<{
    skill: string;
    stage?: string;
    li?: string;
    phase?: string;
    picked?: string;
    mode?: string;
    session?: string;
  }>();
  // Run mode: 'mock' chains the 4 skills into one session, anything else
  // is a single-skill attempt. Missing session → this screen mints one id
  // at start so every save below lands in exactly one attempt.
  const isMock = modeParam === 'mock';
  const sessionRef = useRef<string>(sessionParam ?? `${isMock ? 'mock' : 'single'}-${Date.now()}`);
  const fwdParams = (s: string): { skill: string; mode: string; session: string } => ({
    skill: s,
    mode: isMock ? 'mock' : 'single',
    session: sessionRef.current,
  });
  // Dev gallery deep links (no params in the real flow: defaults below).
  // stage=consignes|question|complete, li=0..8, phase=signal|consigne|doc|ask|pause,
  // picked=all-correct|mixed|all-wrong (complete only).
  const demoSet = skill === 'reading' ? READING_QUESTIONS : FLAT.map((f) => f.q);
  const demoLen = demoSet.length;
  const initPicked = (): Record<string, number> => {
    if (stageParam !== 'complete' && !(stageParam === 'break' && skill === 'reading')) {
      return {};
    }
    const out: Record<string, number> = {};
    demoSet.forEach((item, i) => {
      if (pickedParam === 'all-wrong') {
        out[item.id] = (item.answer + 1) % 4;
      } else if (pickedParam === 'mixed') {
        if (i === demoLen - 1) {
          return;
        }
        out[item.id] = i % 2 === 0 ? item.answer : (item.answer + 1) % 4;
      } else {
        out[item.id] = item.answer;
      }
    });
    return out;
  };
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<Record<string, number>>(initPicked);
  const [qIndex, setQIndex] = useState(() => {
    if (skill !== 'reading') {
      return 0;
    }
    const n = Number(liParam);
    return Number.isInteger(n) && n >= 0 && n < READING_QUESTIONS.length ? n : 0;
  });
  // Reading demo stages: consignes -> passage -> question -> break -> complete.
  const [rstage, setRstage] = useState<'consignes' | 'passage' | 'question' | 'break' | 'complete'>(() =>
    stageParam === 'passage' ||
    stageParam === 'question' ||
    stageParam === 'break' ||
    stageParam === 'complete'
      ? stageParam
      : 'consignes',
  );
  const [rsecs, setRsecs] = useState(() => (stageParam === 'complete' && skill === 'reading' ? 446 : 600));

  const [rdoc, setRdoc] = useState(0);
  const [textOpen, setTextOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Handoff countdown: 15 s on each skill-end screen, then auto-advance.
  const [handSecs, setHandSecs] = useState(15);
  const rdoneRef = useRef(false);
  const rfinishRef = useRef(() => {});
  const [exitVisible, setExitVisible] = useState(false);
  // Writing strict mock: consignes -> write -> review -> write(2) ->
  // review -> submit -> pending (the AI scores while speaking starts).
  // Per-tâche intros are skipped in mock mode, straight into the field.
  const [wstage, setWstage] = useState<'consignes' | 'write' | 'review' | 'submit' | 'pending'>(() =>
    skill === 'writing' &&
    (stageParam === 'write' || stageParam === 'review' || stageParam === 'submit' || stageParam === 'pending')
      ? stageParam
      : 'consignes',
  );
  // Task index into the visible flow (B-only while INCLUDE_SECTION_A is
  // off); deep links clamp so hidden section A can never crash the flow.
  const [wtask, setWtask] = useState(() =>
    Math.min(Number(liParam) || 0, WRITING_TASKS.length - 1),
  );
  const [drafts, setDrafts] = useState<string[]>(['', '']);
  const [wtyped, setWtyped] = useState(false);
  const [wsecs, setWsecs] = useState(WRITING_DEMO_SECS);
  // Cursor tracked in a ref, never in state: storing it in state re-renders
  // on every keystroke and breaks typing on iOS.
  const wselRef = useRef({ start: 0, end: 0 });
  const [promptOpen, setPromptOpen] = useState(false);
  const [wauto, setWauto] = useState(false);
  const wdoneRef = useRef(false);
  const wfinishRef = useRef((_auto: boolean) => {});
  // Speaking stub mock: consignes -> intro -> prep -> record -> review ->
  // intro(2) -> prep -> record -> review -> submit -> pending (session end).
  // No session clock and no real recording: prep counts down (skippable),
  // record counts up to the task limit and stops itself, durations measured.
  const [sstage, setSstage] = useState<
    'consignes' | 'intro' | 'prep' | 'record' | 'review' | 'submit' | 'pending'
  >(() =>
    skill === 'speaking' &&
    (stageParam === 'intro' ||
      stageParam === 'prep' ||
      stageParam === 'record' ||
      stageParam === 'review' ||
      stageParam === 'submit' ||
      stageParam === 'pending')
      ? stageParam
      : 'consignes',
  );
  const [stask, setStask] = useState(() =>
    Math.min(Number(liParam) || 0, SPEAKING_TASKS.length - 1),
  );
  const [prepLeft, setPrepLeft] = useState(
    () => SPEAKING_TASKS[Math.min(Number(liParam) || 0, SPEAKING_TASKS.length - 1)].prep,
  );
  const [rec, setRec] = useState(0);
  const [sdur, setSdur] = useState<number[]>([]);
  const sdoneRef = useRef(false);
  // Listening strict mock: consignes screen, then per question
  // signal -> consigne (first of document) -> document -> question -> pause.
  // No per-answer verdict in mock mode.
  const initLi = () => {
    const n = Number(liParam);
    return Number.isInteger(n) && n >= 0 && n < FLAT.length ? n : 0;
  };
  const initPhase = () => {
    const ok = ['signal', 'consigne', 'doc', 'ask', 'pause'] as const;
    return (ok as readonly string[]).includes(phaseParam ?? '') && stageParam === 'question'
      ? (phaseParam as (typeof ok)[number])
      : 'signal';
  };
  const [stage, setStage] = useState<'consignes' | 'question' | 'complete'>(
    stageParam === 'question' || stageParam === 'complete' ? stageParam : 'consignes',
  );
  const [playing, setPlaying] = useState(false);
  const [secs, setSecs] = useState(600);
  // Flat position over the 9 questions; 5-beat phase machine.
  const [li, setLi] = useState(initLi);
  const [phase, setPhase] = useState<'signal' | 'consigne' | 'doc' | 'ask' | 'pause'>(initPhase);
  const [pauseLeft, setPauseLeft] = useState(10);
  const doneRef = useRef(false);
  const finishRef = useRef(() => {});
  const advanceRef = useRef(() => {});
  const preTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      Speech.stop();
      if (preTimer.current) {
        clearTimeout(preTimer.current);
      }
    },
    [],
  );

  // Elapsed-time ticker for the panel clock (audio phases only know elapsed;
  // the 10s pause shows elapsed / total). Resets on every question.
  const [qElapsed, setQElapsed] = useState(0);
  useEffect(() => {
    if (skill !== 'listening' || stage !== 'question') {
      return;
    }
    setQElapsed(0);
    const t = setInterval(() => {
      setQElapsed((v) => v + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [skill, stage, li]);

  const beginPause = () => {
    setPauseLeft(10);
    setPhase('pause');
  };

  const openFlat = (i: number) => {
    setLi(i);
    // Every question opens with the signal beat; follow-ups skip consigne
    // and document straight to the spoken question (design beats 2-4).
    setPhase('signal');
  };

  // Strict mock beats: document, then spoken question, then the 10s pause.
  // Uses `skill` (not `s`): effects live before the early return. Any TTS
  // error falls through to the answer pause so options never stay locked.
  useEffect(() => {
    if (skill !== 'listening' || stage !== 'question') {
      return;
    }
    const item = FLAT[li];
    if (!item) {
      return;
    }
    // Signal beat: a spoken intro (lời dẫn), never a beep. First of a
    // document goes to consigne, follow-ups straight to the question.
    // A safety timer advances even if TTS callbacks never fire.
    if (phase === 'signal') {
      const first = li === 0 || FLAT[li - 1].doc.id !== item.doc.id;
      const sameDoc = FLAT.filter((it) => it.doc.id === item.doc.id).length;
      let qi = 0;
      for (let k = li - 1; k >= 0 && FLAT[k].doc.id === item.doc.id; k--) {
        qi++;
      }
      const toConsigne = first && item.doc.transcript;
      const next: 'consigne' | 'ask' = toConsigne ? 'consigne' : 'ask';
      const line = toConsigne
        ? 'Une nouvelle question commence.'
        : `Même document. Question ${qi + 1} sur ${sameDoc}.`;
      Speech.stop();
      let done = false;
      const go = () => {
        if (!done) {
          done = true;
          setPhase(next);
        }
      };
      Speech.speak(line, {
        language: 'fr-FR',
        rate: 0.95,
        onStart: () => setPlaying(true),
        onDone: () => {
          setPlaying(false);
          go();
        },
        onStopped: () => setPlaying(false),
        onError: () => {
          setPlaying(false);
          go();
        },
      });
      const t = setTimeout(go, 9000);
      return () => {
        clearTimeout(t);
        Speech.stop();
      };
    }
    if (phase === 'consigne') {
      Speech.stop();
      Speech.speak('Écoutez le document sonore et la question.', {
        language: 'fr-FR',
        rate: 0.95,
        onStart: () => setPlaying(true),
        onDone: () => {
          setPlaying(false);
          if (preTimer.current) {
            clearTimeout(preTimer.current);
          }
          // Pre-read window for the 4 options, then the document starts.
          preTimer.current = setTimeout(() => setPhase('doc'), 4000);
        },
        onStopped: () => setPlaying(false),
        onError: () => {
          setPlaying(false);
          beginPause();
        },
      });
      return () => {
        Speech.stop();
        if (preTimer.current) {
          clearTimeout(preTimer.current);
        }
      };
    }
    const speakQuestion = () => {
      Speech.stop();
      Speech.speak(item.q.spoken, {
        language: 'fr-FR',
        rate: 0.95,
        onStart: () => setPlaying(true),
        onDone: () => {
          setPlaying(false);
          beginPause();
        },
        onStopped: () => setPlaying(false),
        onError: () => {
          setPlaying(false);
          beginPause();
        },
      });
    };
    if (phase === 'doc' && item.doc.transcript) {
      Speech.stop();
      Speech.speak(item.doc.transcript, {
        language: 'fr-FR',
        rate: 0.95,
        onStart: () => setPlaying(true),
        onDone: () => {
          setPlaying(false);
          speakQuestion();
        },
        onStopped: () => setPlaying(false),
        onError: () => {
          setPlaying(false);
          beginPause();
        },
      });
    } else if (phase === 'ask') {
      speakQuestion();
    }
    return () => {
      Speech.stop();
    };
  }, [skill, stage, li, phase]);

  // The 10s answer pause: unanswered questions count as incorrect.
  // The countdown only counts; advancing lives in its own timer so no
  // side effect ever runs inside a state updater (that path stuck at 0 s).
  useEffect(() => {
    if (skill !== 'listening' || stage !== 'question' || phase !== 'pause') {
      return;
    }
    const t = setInterval(() => {
      setPauseLeft((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    const a = setTimeout(() => {
      advanceRef.current();
    }, 10000);
    return () => {
      clearInterval(t);
      clearTimeout(a);
    };
  }, [skill, stage, phase]);

  // Watchdog: one audio phase never runs past 45 s (normal beats take a
  // few seconds). If TTS callbacks never fire, force the next step instead
  // of stranding the user mid-question.
  useEffect(() => {
    if (skill !== 'listening' || stage !== 'question' || phase === 'pause') {
      return;
    }
    const t = setTimeout(() => {
      const item = FLAT[li];
      if (!item) {
        return;
      }
      if (phase === 'signal') {
        const first = li === 0 || FLAT[li - 1].doc.id !== item.doc.id;
        setPhase(first && item.doc.transcript ? 'consigne' : 'ask');
      } else if (phase === 'consigne') {
        setPhase('doc');
      } else {
        beginPause();
      }
    }, 45000);
    return () => clearTimeout(t);
  }, [skill, stage, li, phase]);

  const stopAudio = () => {
    Speech.stop();
    setPlaying(false);
  };

  const s = skill as Skill;
  const isChoice = s === 'listening' || s === 'reading';
  const accent = { color: SkillAccent[s], deep: SKILL_DEEP[s], ink: SKILL_DARK[s] };
  const questions = READING_QUESTIONS;
  const current = questions[Math.min(qIndex, questions.length - 1)];
  const answered = picked[current.id] !== undefined;
  const cur = FLAT[Math.min(li, FLAT.length - 1)];
  const images = cur.q.images ?? [];
  const fmtClock = (total: number) => `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  // Design chrome: dashes under the audio count THIS document's questions
  // (1 everywhere in the demo, 2 for Interviews), never the 5 phases.
  const firstOfDoc = li === 0 || FLAT[li - 1].doc.id !== cur.doc.id;
  let qIdxInDoc = 0;
  for (let k = li - 1; k >= 0 && FLAT[k].doc.id === cur.doc.id; k--) {
    qIdxInDoc++;
  }
  const qOfDoc = FLAT.filter((it) => it.doc.id === cur.doc.id).length;
  const answeredCur = picked[cur.q.id] !== undefined;
  const stripUrgent = phase === 'pause' && !answeredCur && pauseLeft <= 3;
  const stripText =
    phase === 'signal'
      ? firstOfDoc
        ? 'Signal sonore — nouvelle question.'
        : `Même document — question ${qIdxInDoc + 1} sur ${qOfDoc}.`
      : phase === 'consigne'
        ? 'Lisez les quatre propositions maintenant.'
        : phase === 'doc'
          ? 'Document en cours — la question arrive à la fin.'
          : phase === 'ask'
            ? 'La question est posée à l’oral.'
            : answeredCur
              ? 'Réponse enregistrée · la question passe à la fin de la pause'
              : stripUrgent
                ? `Question suivante dans ${pauseLeft} s`
                : 'Répondez maintenant — la question passe toute seule';
  const waveTime = phase === 'pause' ? `${fmtClock(10 - pauseLeft)} / 0:10` : fmtClock(qElapsed);

  // Speaking stub end: saved once, then the session result screen (the
  // dedicated session review does not exist yet; /result stands in).
  const finishSpeaking = async () => {
    if (sdoneRef.current) {
      return;
    }
    sdoneRef.current = true;
    setSstage('pending');
    try {
      const stub = SPEAKING_B_STUB;
      await saveResult({
        id: String(Date.now()),
        session: sessionRef.current,
        date: new Date().toISOString().slice(0, 10),
        skill: 'speaking',
        section: 'B',
        level: stub.overall.level as Cefr,
        half: stub.overall.half,
        durations: [...sdur],
      });
    } catch {}
  };

  const dark =
    (s === 'listening' && (stage === 'consignes' || stage === 'complete')) ||
    (s === 'reading' && (rstage === 'consignes' || rstage === 'complete')) ||
    (s === 'writing' && (wstage === 'consignes' || wstage === 'pending')) ||
    (s === 'speaking' && (sstage === 'consignes' || sstage === 'intro' || sstage === 'record' || sstage === 'pending'));
  const showTimer =
    (s === 'listening' && stage === 'question') ||
    (s === 'reading' && (rstage === 'passage' || rstage === 'question' || rstage === 'break')) ||
    (s === 'writing' && (wstage === 'write' || wstage === 'review' || wstage === 'submit'));
  const clockSecs = s === 'reading' ? rsecs : s === 'writing' ? wsecs : secs;
  const wChromeTall = s === 'writing' && wstage !== 'consignes' && wstage !== 'pending';
  const sChromeTall =
    s === 'speaking' && (sstage === 'prep' || sstage === 'review' || sstage === 'submit');
  const topPad = dark ? insets.top + 64 : insets.top + 52 + (isChoice || wChromeTall || sChromeTall ? 52 : 12) + 8;

  // Saved exactly once: doneRef also guards the 1s timer against repeats.
  // The result screen shows first; history save is best-effort after it,
  // so a storage failure can never trap the user on the last question.
  const finishListening = async () => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    const correct = FLAT.filter((item) => picked[item.q.id] === item.q.answer).length;
    stopAudio();
    setStage('complete');
    try {
      const ids = new Set(FLAT.map((item) => item.q.id));
      const picks: Record<string, number> = {};
      Object.keys(picked).forEach((k) => {
        if (ids.has(k)) {
          picks[k] = picked[k];
        }
      });
      await saveResult({
        id: String(Date.now()),
        session: sessionRef.current,
        date: new Date().toISOString().slice(0, 10),
        skill: 'listening',
        section: 'B',
        correct,
        total: FLAT.length,
        picks,
      });
    } catch {}
  };
  finishRef.current = () => {
    void finishListening();
  };
  advanceRef.current = () => {
    if (li + 1 < FLAT.length) {
      openFlat(li + 1);
    } else {
      finishRef.current();
    }
  };

  // Reading demo: 2 questions, 5 minutes, saved once. The result screen
  // shows first; history save is best-effort after it.
  const finishReading = async () => {
    if (rdoneRef.current) {
      return;
    }
    rdoneRef.current = true;
    const correct = READING_QUESTIONS.filter((q) => picked[q.id] === q.answer).length;
    setRstage('break');
    try {
      const ids = new Set(READING_QUESTIONS.map((q) => q.id));
      const picks: Record<string, number> = {};
      Object.keys(picked).forEach((k) => {
        if (ids.has(k)) {
          picks[k] = picked[k];
        }
      });
      await saveResult({
        id: String(Date.now()),
        session: sessionRef.current,
        date: new Date().toISOString().slice(0, 10),
        skill: 'reading',
        section: 'B',
        correct,
        total: READING_QUESTIONS.length,
        picks,
      });
    } catch {}
  };
  rfinishRef.current = () => {
    void finishReading();
  };

  // Writing demo: both texts go together, saved once. The pending screen
  // shows first; history save is best-effort after it, so a storage
  // failure can never trap the user on the submit screen.
  const [wSaved, setWSaved] = useState(false);
  const finishWriting = async (auto: boolean) => {
    if (wdoneRef.current) {
      return;
    }
    wdoneRef.current = true;
    setWauto(auto);
    setWstage('pending');
    try {
      // Stage-1 Writing B: score for real when the key is in; otherwise
      // keep the Stage-0 stub so the flow never depends on the network.
      const task = WRITING_TASKS[wtask] ?? WRITING_TASKS[0];
      const text = drafts[wtask] ?? drafts[0] ?? '';
      if (isAiConfigured()) {
        try {
          const feedback = await scoreWritingB(task.consigne, text);
          await saveResult({
            id: String(Date.now()),
            session: sessionRef.current,
            date: new Date().toISOString().slice(0, 10),
            skill: 'writing',
            section: 'B',
            level: feedback.overall.level as Cefr,
            half: feedback.overall.half,
            text,
            feedback,
          });
          setWSaved(true);
          return;
        } catch (e) {
          console.warn('[scorer] writing B failed, stub fallback:', e instanceof Error ? e.message : e);
        }
      }
      const stub = WRITING_B_STUB;
      await saveResult({
        id: String(Date.now()),
        session: sessionRef.current,
        date: new Date().toISOString().slice(0, 10),
        skill: 'writing',
        section: 'B',
        level: stub.overall.level as Cefr,
        half: stub.overall.half,
        text,
      });
      setWSaved(true);
    } catch {}
  };
  wfinishRef.current = (auto: boolean) => {
    void finishWriting(auto);
  };

  // Handoff auto-advance: entering either end screen restarts the 15 s
  // countdown. Mock chains to the next skill with the same session;
  // a single test opens its own TestReview instead.
  useEffect(() => {
    // Writing single waits for the save (AI scoring can outlast the
    // countdown); mock chains straight through while scoring lands behind.
    const done =
      (skill === 'listening' && stage === 'complete') ||
      (skill === 'reading' && rstage === 'complete') ||
      (skill === 'writing' && wstage === 'pending' && (isMock || wSaved));
    if (!done) {
      return;
    }
    setHandSecs(15);
    const t = setInterval(() => {
      setHandSecs((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [skill, stage, rstage, wstage, wSaved]);
  useEffect(() => {
    if (handSecs !== 0) {
      return;
    }
    if (!isMock) {
      router.replace({ pathname: '/result', params: { session: sessionRef.current } });
      return;
    }
    if (skill === 'listening' && stage === 'complete') {
      router.replace({ pathname: '/test/[skill]', params: fwdParams('reading') });
    } else if (skill === 'reading' && rstage === 'complete') {
      router.replace({ pathname: '/test/[skill]', params: fwdParams('writing') });
    } else if (skill === 'writing' && wstage === 'pending') {
      router.replace({ pathname: '/test/[skill]', params: fwdParams('speaking') });
    }
  }, [handSecs, skill, stage, rstage, wstage]);

  // Demo budget: 5 minutes, ticking once the passage opens (never from
  // consignes). The countdown only counts; finishing lives outside the
  // updater so it always fires.
  useEffect(() => {
    if (skill !== 'reading' || (rstage !== 'passage' && rstage !== 'question')) {
      return;
    }
    const t = setInterval(() => {
      setRsecs((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [skill, rstage]);
  useEffect(() => {
    if (skill === 'reading' && rsecs === 0 && (rstage === 'passage' || rstage === 'question')) {
      rfinishRef.current();
    }
  }, [skill, rsecs, rstage]);

  // Demo budget: 10 minutes, ticking once the writing field opens (never
  // from consignes). At zero both texts go as-is, like the real exam.
  useEffect(() => {
    if (skill !== 'writing' || (wstage !== 'write' && wstage !== 'review' && wstage !== 'submit')) {
      return;
    }
    const t = setInterval(() => {
      setWsecs((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [skill, wstage]);
  useEffect(() => {
    if (
      skill === 'writing' &&
      wsecs === 0 &&
      (wstage === 'write' || wstage === 'review' || wstage === 'submit')
    ) {
      wfinishRef.current(true);
    }
  }, [skill, wsecs, wstage]);

  // Speaking stub timers: prep counts down and the recording starts on its
  // own at zero; record counts up and stops itself at the task limit.
  useEffect(() => {
    if (skill !== 'speaking' || sstage !== 'prep') {
      return;
    }
    const t = setInterval(() => {
      setPrepLeft((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [skill, sstage]);
  useEffect(() => {
    if (skill === 'speaking' && sstage === 'prep' && prepLeft === 0) {
      setRec(0);
      setSstage('record');
    }
  }, [skill, sstage, prepLeft]);
  useEffect(() => {
    if (skill !== 'speaking' || sstage !== 'record') {
      return;
    }
    const t = setInterval(() => {
      setRec((v) => (v + 1 >= SPEAKING_TASKS[stask].max ? SPEAKING_TASKS[stask].max : v + 1));
    }, 1000);
    return () => clearInterval(t);
  }, [skill, sstage, stask]);

  // Speaking stub helpers: current task, live examiner cue, measured stop.
  // sMulti is false while section A is scope-hidden (same pattern as writing).
  const sMulti = SPEAKING_TASKS.length > 1;
  const staskData = SPEAKING_TASKS[stask];
  const sStopped = sstage === 'record' && rec >= staskData.max;
  const cueIdx = (() => {
    let k = 0;
    staskData.turns.forEach((tn, i) => {
      if (tn.at <= rec) {
        k = i;
      }
    });
    return k;
  })();
  const cue = staskData.turns[cueIdx];
  const nextCue = staskData.turns[cueIdx + 1];
  const stopTake = () => {
    if (rec < 3) {
      return;
    }
    setSdur((d) => {
      const next = [...d];
      next[stask] = rec;
      return next;
    });
    setSstage('review');
  };
  const sProgPct =
    sstage === 'submit'
      ? 100
      : sstage === 'review'
        ? sMulti && stask === 0
          ? 50
          : 90
        : sMulti && stask === 0
          ? 20
          : 62;

  // Writing helpers: current task, its word count, accent insertion at the
  // cursor (falls back to appending when no selection is known yet).
  // wMulti is false while section A is scope-hidden: shared copy switches
  // to the singular, the task-switch branches stay dormant but intact.
  const wMulti = WRITING_TASKS.length > 1;
  const wtaskData = WRITING_TASKS[wtask];
  const wcount = countWords(drafts[wtask] ?? '');
  const wshort = wcount < wtaskData.min;
  const insertAccent = (ch: string) => {
    const cur = drafts[wtask] ?? '';
    const sel = wselRef.current;
    // No selection known yet (accent tapped before focusing): append.
    const untouched = cur !== '' && sel.start === 0 && sel.end === 0;
    const from = untouched ? cur.length : Math.max(0, Math.min(sel.start, cur.length));
    const to = untouched ? cur.length : Math.max(0, Math.min(sel.end, cur.length));
    const next = cur.slice(0, from) + ch + cur.slice(to);
    setDrafts((d) => d.map((v, i) => (i === wtask ? next : v)));
    setWtyped(true);
    wselRef.current = { start: from + ch.length, end: from + ch.length };
  };

  const wordsOf = (paras: string[]) => paras.join(' ').split(/\s+/).filter(Boolean).length;
  // Document number (1-3) for the exit sheet: text questions show their own
  // document, standalone items show the latest document opened so far.
  const rdocNum = (qi: number) => {
    let n = 1;
    READING_QUESTIONS.forEach((q, i) => {
      if (i <= qi && q.docId) {
        n = READING_DOCS.findIndex((d) => d.id === q.docId) + 1;
      }
    });
    return n;
  };
  const curDoc = (() => {
    const q = READING_QUESTIONS[qIndex];
    const id = q?.docId;
    return READING_DOCS.find((d) => d.id === id) ?? READING_DOCS[rdoc];
  })();
  const curPassGroup =
    READING_QUESTIONS.find((q) => q.docId === READING_DOCS[rdoc].id)?.group ?? '';
  const readingWords = wordsOf(curDoc.text);
  const rAnswered = READING_QUESTIONS.filter((q) => picked[q.id] !== undefined).length;
  const rCorrect = READING_QUESTIONS.filter((q) => picked[q.id] === q.answer).length;
  const rAdvance = () => {
    if (qIndex + 1 >= READING_QUESTIONS.length) {
      return;
    }
    const next = READING_QUESTIONS[qIndex + 1];
    if (next.docId) {
      setRdoc(READING_DOCS.findIndex((d) => d.id === next.docId));
      setRstage('passage');
    } else {
      setQIndex(qIndex + 1);
    }
  };
  const rBack = () => {
    const q = READING_QUESTIONS[qIndex];
    if (q.docId) {
      setRdoc(READING_DOCS.findIndex((d) => d.id === q.docId));
      setRstage('passage');
    } else if (qIndex > 0) {
      setQIndex(qIndex - 1);
    }
  };
  // The answer stays changeable until the pause ends: the last pick wins.
  const pickListening = (qid: string, i: number) => {
    if (phase !== 'pause') {
      return;
    }
    setPicked((p) => ({ ...p, [qid]: i }));
  };

  // Demo budget: 10 minutes, ticking only once the first document opens
  // (never from consignes). The countdown only counts; finishing lives
  // outside the updater so it always fires.
  useEffect(() => {
    if (skill !== 'listening' || stage !== 'question') {
      return;
    }
    const t = setInterval(() => {
      setSecs((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [s, stage]);
  useEffect(() => {
    if (skill === 'listening' && secs === 0 && stage === 'question') {
      finishRef.current();
    }
  }, [skill, secs, stage]);

  if (!SKILLS.includes(skill as Skill)) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Unknown skill</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <LinearGradient colors={['#F8F3F7', '#FFFFFF']} style={styles.bg} />
      {dark && s === 'reading' && (
        <LinearGradient
          colors={['#1A211F', '#1E1226', '#100D0A']}
          locations={[0, 0.6, 1]}
          start={{ x: 0.35, y: 0 }}
          end={{ x: 0.65, y: 1 }}
          style={styles.bg}
          pointerEvents="none"
        />
      )}
      {dark && s === 'speaking' && (
        <LinearGradient
          colors={['#2A1A3E', '#1E1226', '#100D0A']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.bg}
          pointerEvents="none"
        />
      )}
      {dark && s !== 'reading' && s !== 'speaking' && <View style={styles.darkFill} />}
      <Image source={require('../../../assets/brand/blob-gold.png')} style={styles.goldBlob} resizeMode="stretch" />
      <Image source={require('../../../assets/brand/blob-plum.png')} style={styles.plumBlob} resizeMode="stretch" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad, paddingBottom: 150 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}>
        {s === 'reading' && rstage === 'consignes' && (
          <>
            <View style={styles.consignesHead}>
              <Text style={styles.consignesKicker}>TEF Canada · épreuve 2 sur 4</Text>
              <Text style={styles.consignesTitle}>Compréhension écrite</Text>
              <Text style={styles.consignesSub}>6 questions · 10 minutes · cinq groupes de documents</Text>
              <Text style={styles.demoNote}>{SHORTENED_NOTE}</Text>
            </View>
            <View style={styles.rulesCard}>
              <Text style={styles.rRulesKicker}>CONSIGNES</Text>
              {READING_RULES.map((r, i) => (
                <View key={i} style={styles.ruleRow}>
                  <View style={styles.ruleNum}>
                    <Text style={styles.ruleNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.ruleText}>{r}</Text>
                </View>
              ))}
            </View>
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                Aucune pause n’est autorisée une fois la session lancée : les épreuves sur ordinateur s’enchaînent.
              </Text>
            </View>
          </>
        )}

        {s === 'reading' && rstage === 'passage' && (
          <>
            <View style={styles.passTop}>
              <Text style={styles.passPill} numberOfLines={1}>
                {`${curPassGroup} · document ${rdoc + 1} sur ${READING_DOCS.length}`}
              </Text>
              <Text style={styles.passWords}>{wordsOf(READING_DOCS[rdoc].text)} mots</Text>
            </View>
            <Text style={styles.passTitle}>{READING_DOCS[rdoc].title}</Text>
            <Text style={styles.passSource}>{READING_DOCS[rdoc].source}</Text>
            <View style={styles.passDiv} />
            {READING_DOCS[rdoc].text.map((para, i) => (
              <Text key={i} style={styles.passPara}>
                {para}
              </Text>
            ))}
          </>
        )}

        {s === 'reading' && rstage === 'question' && (
          <>
            <View style={styles.qHead}>
              <Text style={[styles.qKicker, { backgroundColor: accent.color + '1F', color: accent.ink }]}>
                {current.type === 'chart'
                  ? `${current.group} · item 1 sur 1`
                  : `${current.group} · question ${qIndex + 1} sur ${questions.length}`}
              </Text>
              {current.type === 'chart' && <Text style={styles.graphTag}>Graphique</Text>}
            </View>
            <Text style={current.type === 'chart' ? styles.chartQuestion : styles.qText}>{current.prompt}</Text>
            {(current.type === 'sentence-gap' || current.type === 'text-gap') && (
              <View style={styles.gapBox}>
                <Text style={styles.gapKicker}>
                  {current.type === 'sentence-gap' ? 'PHRASE À COMPLÉTER' : 'TEXTE À COMPLÉTER'}
                </Text>
                <Text style={styles.gapSentence}>
                  {current.before}{' '}
                  <Text style={styles.gapSlot}>
                    {picked[current.id] !== undefined ? current.options[picked[current.id]] : '…'}
                  </Text>
                  {(current.after ?? '').match(/^[.,;:!?]/) ? '' : ' '}
                  {current.after}
                </Text>
              </View>
            )}
            {current.type === 'chart' && (
              <View style={styles.chartCard}>
                <Text style={styles.chartLabel}>{READING_CHART.label}</Text>
                <Text style={styles.chartTitle}>{READING_CHART.title}</Text>
                <Text style={styles.chartSource}>{READING_CHART.source}</Text>
                <View style={styles.chartVals}>
                  {READING_CHART.bars.map((b) => (
                    <Text key={b.year} style={styles.chartVal}>
                      {b.v} %
                    </Text>
                  ))}
                </View>
                <View style={styles.chartBars}>
                  <View
                    style={[
                      styles.chartRule,
                      { bottom: (READING_CHART.rule / READING_CHART.max) * CHART_BAR_H },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chartRuleLabel,
                      { bottom: (READING_CHART.rule / READING_CHART.max) * CHART_BAR_H - 5 },
                    ]}>
                    {READING_CHART.rule} %
                  </Text>
                  {READING_CHART.bars.map((b) => (
                    <LinearGradient
                      key={b.year}
                      colors={[accent.color, accent.deep]}
                      style={[styles.chartBar, { height: Math.max(4, (b.v / READING_CHART.max) * CHART_BAR_H) }]}
                    />
                  ))}
                </View>
                <View style={styles.chartTicks}>
                  {READING_CHART.bars.map((b) => (
                    <Text key={b.year} style={styles.chartTick}>
                      {b.year}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            {current.options.map((opt, i) => {
              const sel = picked[current.id] === i;
              const gap = current.type === 'sentence-gap' || current.type === 'text-gap';
              return (
                <Pressable
                  key={opt}
                  style={[
                    styles.option,
                    sel && { borderColor: '#2E1A3B', borderWidth: 2, backgroundColor: '#FBF7FA' },
                  ]}
                  onPress={() => setPicked((p) => ({ ...p, [current.id]: i }))}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: sel }}
                  accessibilityLabel={`${LETTERS[i]}: ${opt}`}>
                  <View style={[styles.badge, { backgroundColor: sel ? '#2E1A3B' : '#F3EDF2' }]}>
                    <Text style={[styles.badgeText, { color: sel ? '#fff' : '#5E4E69' }]}>{LETTERS[i]}</Text>
                  </View>
                  <Text style={[styles.optionText, styles.rOptText, gap && styles.gapOptText]}>{opt}</Text>
                </Pressable>
              );
            })}
          </>
        )}

        {s === 'reading' && rstage === 'break' && (
          <>
            <View style={styles.bCheckWrap}>
              <CheckIcon color="#0F6B65" />
            </View>
            <Text style={styles.bTitle}>
              {READING_QUESTIONS[READING_QUESTIONS.length - 1].group} terminé
            </Text>
            <Text style={styles.bBody}>
              Vous avez répondu aux {READING_QUESTIONS.length} questions de la démo. Le détail par question
              sera disponible dans la revue en fin de séance.
            </Text>
            <View style={styles.bStats}>
              <View style={styles.bStat}>
                <Text style={styles.bStatVal}>
                  {READING_QUESTIONS[READING_QUESTIONS.length - 1].answer ===
                  picked[READING_QUESTIONS[READING_QUESTIONS.length - 1].id]
                    ? '1 / 1'
                    : '0 / 1'}
                </Text>
                <Text style={styles.bStatCap}>CE GROUPE</Text>
              </View>
              <View style={styles.bStatDiv} />
              <View style={styles.bStat}>
                <Text style={styles.bStatVal}>
                  {rCorrect} / {READING_QUESTIONS.length}
                </Text>
                <Text style={styles.bStatCap}>TOTAL ÉPREUVE</Text>
              </View>
              <View style={styles.bStatDiv} />
              <View style={styles.bStat}>
                <Text style={styles.bStatVal}>{fmtClock(rsecs)}</Text>
                <Text style={styles.bStatCap}>TEMPS RESTANT</Text>
              </View>
            </View>
          </>
        )}

        {s === 'reading' && rstage === 'complete' && (
          <>
            <View style={styles.rail}>
              {SKILLS.map((k) => (
                <View
                  key={k}
                  style={[
                    styles.railDot,
                    {
                      backgroundColor:
                        k === 'listening' || k === 'reading'
                          ? '#4ADE80'
                          : k === 'writing'
                            ? '#F9BD48'
                            : 'rgba(255,255,255,.16)',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.doneKicker}>
              {isMock ? 'TEF Canada · session in progress' : 'TEF Canada · test terminé'}
            </Text>
            <Text style={styles.doneTitle}>Reading complete</Text>
            <Text style={styles.handBody}>
              {isMock
                ? 'No breaks are allowed between tests. Written expression starts on its own — stay at your screen.'
                : 'Votre résultat est prêt — il s’ouvre tout seul.'}
            </Text>
            <View style={styles.handCard}>
              <View style={styles.handText}>
                <Text style={styles.handKicker}>{isMock ? 'NEXT TEST' : 'RÉSULTAT'}</Text>
                <Text style={styles.handName}>{isMock ? 'Writing' : 'TestReview'}</Text>
                <Text style={styles.handSub}>
                  {isMock ? 'Written expression · demo' : 'Reading only'}
                </Text>
              </View>
              <Text style={styles.handCount}>{fmtClock(handSecs)}</Text>
            </View>
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                No results are shown before the end of the session — like the real exam.
              </Text>
            </View>
            <View style={styles.doneBtns}>
              <Pressable
                style={styles.nextBtn}
                onPress={() => router.replace({ pathname: '/test/[skill]', params: { skill: 'writing' } })}
                accessibilityRole="button"
                accessibilityLabel="Start now">
                <Text style={styles.nextLabel}>Start now</Text>
              </Pressable>
            </View>
          </>
        )}

        {s === 'listening' && stage === 'consignes' && (
          <>
            <View style={styles.consignesHead}>
              <Text style={styles.consignesKicker}>TEF Canada · demo</Text>
              <Text style={styles.consignesTitle}>Compréhension orale</Text>
              <Text style={styles.consignesSub}>9 questions · 10 minutes · 8 types de documents</Text>
              <Text style={styles.demoNote}>
                Démo réduite mais complète en genres — 40 questions après le lancement.
              </Text>
            </View>
            <View style={styles.rulesCard}>
              <Text style={styles.rulesKicker}>Consignes</Text>
              {LISTENING_RULES.map((r, i) => (
                <View key={i} style={styles.ruleRow}>
                  <View style={styles.ruleNum}>
                    <Text style={styles.ruleNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.ruleText}>{r}</Text>
                </View>
              ))}
            </View>
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                Aucune pause n’est autorisée une fois la session lancée : à l’examen, les épreuves sur ordinateur
                s’enchaînent.
              </Text>
            </View>
          </>
        )}

        {s === 'listening' && stage === 'question' && (
          <>
            <View style={styles.docCard}>
              <View style={styles.docTop}>
                <Text style={[styles.docKicker, { color: accent.color }]} numberOfLines={1}>
                  {cur.doc.group} · Document {cur.docIdx + 1} / 8
                </Text>
                <Text style={styles.ecoute}>{cur.doc.plays === 2 ? 'Deux écoutes' : 'Une seule écoute'}</Text>
              </View>
              <View style={styles.waveRow}>
                <Waveform active={playing} color={accent.color} />
                <Text style={styles.waveTime}>{waveTime}</Text>
              </View>
              <View style={styles.phases}>
                {Array.from({ length: qOfDoc }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.phSeg,
                      {
                        backgroundColor:
                          i < qIdxInDoc ? '#8FB2F0' : i === qIdxInDoc ? accent.color : 'rgba(74,127,229,.22)',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.docNote}>
                Ce document sert {qOfDoc} question{qOfDoc > 1 ? 's' : ''} · question {qIdxInDoc + 1}
              </Text>
            </View>
            <View style={styles.qHead}>
              <Text style={[styles.qKicker, { backgroundColor: accent.color + '1F', color: accent.ink }]}>
                {cur.doc.group} · question {qIdxInDoc + 1} sur {qOfDoc} de ce document
              </Text>
            </View>

            {cur.q.images ? (
              <View style={styles.imgGrid}>
                {cur.q.options.map((opt, i) => {
                  const locked = phase !== 'pause';
                  const sel = picked[cur.q.id] === i;
                  return (
                    <Pressable
                      key={opt}
                      style={[styles.imgCell, locked && styles.imgLocked, sel && styles.imgSel]}
                      onPress={() => pickListening(cur.q.id, i)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: sel, disabled: locked }}
                      accessibilityLabel={`${LETTERS[i]}: ${opt}`}>
                      <Image
                        source={DOC_IMAGES[images[i]]}
                        style={styles.img}
                        resizeMode="cover"
                      />
                      <View style={[styles.imgFoot, locked && styles.imgFootLocked]}>
                        <View
                          style={[
                            styles.badge,
                            locked
                              ? styles.badgeLocked
                              : sel
                                ? styles.badgeSel
                                : { backgroundColor: accent.color + '1F' },
                          ]}>
                          <Text
                            style={[
                              styles.badgeText,
                              locked
                                ? styles.badgeLockedText
                                : sel
                                  ? styles.badgeSelText
                                  : { color: accent.ink },
                            ]}>
                            {LETTERS[i]}
                          </Text>
                        </View>
                        <Text style={[styles.imgLabel, locked && styles.imgLabelLocked]}>{opt}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              cur.q.options.map((opt, i) => {
                const locked = phase !== 'pause';
                const sel = picked[cur.q.id] === i;
                return (
                  <Pressable
                    key={opt}
                    style={[styles.option, locked && styles.optLocked, sel && styles.optSel]}
                    onPress={() => pickListening(cur.q.id, i)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: sel, disabled: locked }}
                    accessibilityLabel={`${LETTERS[i]}: ${opt}`}>
                    <View
                      style={[
                        styles.badge,
                        locked
                          ? styles.badgeLocked
                          : sel
                            ? styles.badgeSel
                            : { backgroundColor: accent.color + '1F' },
                      ]}>
                      <Text
                        style={[
                          styles.badgeText,
                          locked ? styles.badgeLockedText : sel ? styles.badgeSelText : { color: accent.ink },
                        ]}>
                        {LETTERS[i]}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, locked && styles.optionLockedText]}>{opt}</Text>
                  </Pressable>
                );
              })
            )}
            <Text style={styles.note}>Démo : 9 questions · 8 documents.</Text>
          </>
        )}

        {s === 'listening' && stage === 'complete' && (
          <>
            <View style={styles.rail}>
              {SKILLS.map((k) => (
                <View
                  key={k}
                  style={[
                    styles.railDot,
                    {
                      backgroundColor:
                        k === 'listening' ? '#4ADE80' : k === 'reading' ? '#F9BD48' : 'rgba(255,255,255,.16)',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.doneKicker}>
              {isMock ? 'TEF Canada · session in progress' : 'TEF Canada · test terminé'}
            </Text>
            <Text style={styles.doneTitle}>Listening complete</Text>
            <Text style={styles.handBody}>
              {isMock
                ? 'No breaks are allowed between tests. Reading comprehension (10 minutes) starts on its own — stay at your screen.'
                : 'Votre résultat est prêt — il s’ouvre tout seul.'}
            </Text>
            <View style={styles.handCard}>
              <View style={styles.handText}>
                <Text style={styles.handKicker}>{isMock ? 'NEXT TEST' : 'RÉSULTAT'}</Text>
                <Text style={styles.handName}>{isMock ? 'Reading' : 'TestReview'}</Text>
                <Text style={styles.handSub}>
                  {isMock ? '10 minutes · Reading comprehension' : 'Listening only'}
                </Text>
              </View>
              <Text style={styles.handCount}>{fmtClock(handSecs)}</Text>
            </View>
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                No results are shown before the end of the session — like the real exam.
              </Text>
            </View>
            <View style={styles.doneBtns}>
              <Pressable
                style={styles.nextBtn}
                onPress={() => router.replace({ pathname: '/test/[skill]', params: { skill: 'reading' } })}
                accessibilityRole="button"
                accessibilityLabel="Start now">
                <Text style={styles.nextLabel}>Start now</Text>
              </Pressable>
            </View>
          </>
        )}

        {s === 'writing' && wstage === 'consignes' && (
          <>
            <View style={styles.consignesHead}>
              <Text style={styles.consignesKicker}>TEF Canada · épreuve 3 sur 4</Text>
              <Text style={styles.consignesTitle}>Expression écrite</Text>
              <Text style={styles.consignesSub}>
                {wMulti ? '2 tâches · 10 minutes · temps global' : 'Section B · 10 minutes · temps global'}
              </Text>
              <Text style={styles.demoNote}>
                {wMulti
                  ? 'Démo raccourcie : 10 minutes au lieu de 60, mais les deux tâches et leurs minimums sont les vrais.'
                  : 'Démo : 10 minutes au lieu de 35, section B uniquement.'}
              </Text>
            </View>
            <View style={styles.rulesCard}>
              <Text style={styles.rRulesKicker}>CONSIGNES</Text>
              {WRITING_RULES.map((r, i) => (
                <View key={i} style={styles.ruleRow}>
                  <View style={styles.ruleNum}>
                    <Text style={styles.ruleNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.ruleText}>{r}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.consigneNote}>{WRITING_NOTE}</Text>
          </>
        )}

        {s === 'writing' && wstage === 'write' && (
          <>
            {wsecs <= 60 && (
              <View style={styles.lowBanner}>
                <Text style={styles.lowBannerText}>
                  Une minute restante. Le brouillon est enregistré automatiquement : à 0:00, ce qui est écrit
                  est envoyé.
                </Text>
              </View>
            )}
            <View style={styles.wConsigneCard}>
              <View style={styles.wConsigneHead}>
                <Text style={styles.wConsigneKicker}>CONSIGNE · {wtaskData.kicker}</Text>
                <Pressable
                  onPress={() => setPromptOpen((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={promptOpen ? 'Masquer le document' : 'Afficher le document'}
                  hitSlop={8}>
                  <Text style={styles.wToggle}>{promptOpen ? 'Masquer' : 'Afficher'} le document</Text>
                </Pressable>
              </View>
              <Text style={styles.wConsigneText}>{wtaskData.short}</Text>
              {promptOpen && (
                <View style={styles.wDocOpen}>
                  <Text style={styles.wDocKicker}>{wtaskData.docLabel}</Text>
                  <Text style={styles.wDocText}>{wtaskData.doc}</Text>
                </View>
              )}
            </View>
            <View style={styles.wordBlock}>
              <View style={styles.wordRow}>
                <Text style={[styles.wordCount, { color: wshort ? '#B91C1C' : '#15803D' }]}>
                  {wcount} {wcount === 1 ? 'mot' : 'mots'}
                </Text>
                <Text style={styles.wordNote}>
                  {wshort
                    ? `· encore ${wtaskData.min - wcount} pour atteindre ${wtaskData.min}`
                    : `· au-dessus du minimum de ${wtaskData.min}`}
                </Text>
                <View style={styles.saveChip}>
                  <Text style={styles.saveLabel}>{wtyped ? 'Enregistré en continu' : 'Brouillon enregistré'}</Text>
                </View>
              </View>
              <View style={styles.wordTrack}>
                <LinearGradient
                  colors={wshort ? ['#F0A0A0', '#DC2626'] : [Brand.gold, accent.deep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.wordFill, { width: `${Math.min(100, (wcount / wtaskData.min) * 100)}%` }]}
                />
              </View>
            </View>
            <View style={styles.accentBox}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.accentRow}>
                {WRITING_ACCENTS.map((ch) => (
                  <Pressable
                    key={ch}
                    style={styles.accentKey}
                    onPress={() => insertAccent(ch)}
                    accessibilityRole="button"
                    accessibilityLabel={`Insérer ${ch}`}>
                    <Text style={styles.accentLabel}>{ch}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.accentCaption}>Clavier d’accents — reste visible pendant le scroll</Text>
            </View>
            <View style={styles.kbRow}>
              <Pressable
                onPress={Keyboard.dismiss}
                accessibilityRole="button"
                accessibilityLabel="Fermer le clavier"
                hitSlop={8}>
                <Text style={styles.kbLabel}>Fermer le clavier ↓</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.editor}
              multiline
              textAlignVertical="top"
              value={drafts[wtask] ?? ''}
              onChangeText={(v) => {
                setDrafts((d) => d.map((prev, i) => (i === wtask ? v : prev)));
                setWtyped(true);
              }}
              onSelectionChange={(e) => {
                wselRef.current = e.nativeEvent.selection;
              }}
              placeholder={wtaskData.placeholder}
              placeholderTextColor="#A2919F"
            />
          </>
        )}

        {s === 'writing' && wstage === 'review' && (
          <>
            <View style={styles.reviewHead}>
              <View style={styles.reviewPills}>
                <Text style={styles.kickerPill}>{wtaskData.kicker}</Text>
                <View style={styles.savedChip}>
                  <View style={styles.mcheck}>
                    <View style={[styles.mcheckBar, styles.mcheckShort]} />
                    <View style={[styles.mcheckBar, styles.mcheckLong]} />
                  </View>
                  <Text style={styles.savedLabel}>Enregistré</Text>
                </View>
              </View>
              <Text style={styles.wTitle}>
                {wMulti ? `Tâche ${wtask + 1} rédigée` : 'Section B rédigée'} · {wcount} mots
              </Text>
            </View>
            <View style={styles.reviewRows}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Longueur</Text>
                <Text style={[styles.reviewValue, { color: wshort ? '#B91C1C' : '#111827' }]}>
                  {wcount} mots
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Minimum</Text>
                <Text style={styles.reviewValue}>{wtaskData.min} mots</Text>
              </View>
              <View style={styles.reviewRowLast}>
                <Text style={styles.reviewLabel}>Section</Text>
                <Text style={styles.reviewValue}>{wtaskData.kicker.split(' · ')[1]}</Text>
              </View>
            </View>
            <View style={styles.reviewBox}>
              <Text style={styles.reviewKicker}>VOTRE TEXTE</Text>
              <Text style={styles.reviewText}>{drafts[wtask] === '' ? '—' : drafts[wtask]}</Text>
            </View>
            <Text style={styles.reviewNote}>
              {wshort
                ? 'Ce texte est en dessous de la longueur demandée. Vous pouvez le rouvrir et le compléter : rien n’est verrouillé avant l’envoi des deux tâches.'
                : 'Les deux tâches restent modifiables jusqu’à l’envoi. Ensuite les textes sont définitifs et partent tels quels vers l’IA.'}
            </Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => setWstage('write')}
              accessibilityRole="button"
              accessibilityLabel={
                wMulti ? `Modifier à nouveau la tâche ${wtask + 1}` : 'Modifier à nouveau le texte'
              }>
              <Text style={styles.editLabel}>
                {wMulti ? `Modifier à nouveau la tâche ${wtask + 1}` : 'Modifier à nouveau le texte'}
              </Text>
            </Pressable>
          </>
        )}

        {s === 'writing' && wstage === 'submit' && (
          <>
            <View style={styles.submitHead}>
              <Text style={styles.wTitle}>
                {wMulti ? 'Envoyer les deux textes à la correction' : 'Envoyer le texte à la correction'}
              </Text>
              <Text style={styles.submitSub}>
                {wMulti
                  ? 'Une fois envoyés, les textes ne peuvent plus être modifiés. L’IA les évalue sur quatre critères et rend un score pour l’épreuve.'
                  : 'Une fois envoyé, le texte ne peut plus être modifié. L’IA l’évalue sur quatre critères et rend un score pour l’épreuve.'}
              </Text>
            </View>
            {WRITING_TASKS.map((t, i) => {
              const n = countWords(drafts[i] ?? '');
              const ok = n >= t.min;
              return (
                <View key={t.kicker} style={styles.submitRow}>
                  <View style={styles.fileIcon}>
                    <AppIcon name="IconOutlineRoundedAiDocument" size={18} color="#966010" />
                  </View>
                  <View style={styles.submitInfo}>
                    <Text style={styles.submitName}>
                      {wMulti ? `Tâche ${i + 1}` : 'Section B'} · {t.title}
                    </Text>
                    <Text style={styles.submitMeta}>
                      {t.kicker.split(' · ')[1]} · {t.min} mots min.
                    </Text>
                  </View>
                  <Text style={[styles.submitWords, { color: ok ? '#15803D' : '#B91C1C' }]}>
                    {n} mots
                  </Text>
                </View>
              );
            })}
            <View style={styles.aiBox}>
              <View style={styles.aiBoxHead}>
                <AppIcon name="IconSparkles" size={16} color="#8A5B10" />
                <Text style={styles.aiBoxTitle}>La correction par l’IA prend 1 à 5 minutes</Text>
              </View>
              <Text style={styles.aiBoxBody}>
                Vous pouvez fermer l’application. La tentative apparaît dans l’historique avec le statut «
                correction IA » et une notification vous prévient dès que le score arrive.
              </Text>
              <View style={styles.critChips}>
                {WRITING_CRITERIA.map((c) => (
                  <Text key={c} style={styles.critChip}>
                    {c}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}

        {s === 'writing' && wstage === 'pending' && (
          <>
            <View style={styles.aiWrap}>
              <ScoringRing done={wSaved} />
              <Text style={styles.aiLabel}>{wSaved ? 'TERMINÉ' : 'CORRECTION'}</Text>
              <Text style={styles.aiTitle}>
                {wSaved
                  ? 'Le score vient d’arriver'
                  : wauto
                    ? wMulti
                      ? 'Temps écoulé — les deux textes ont été envoyés'
                      : 'Temps écoulé — le texte a été envoyé'
                    : wMulti
                      ? 'Les deux textes sont chez l’IA'
                      : 'Le texte est chez l’IA'}
              </Text>
              <Text style={styles.aiSub}>
                {wauto
                  ? 'Le chronomètre a atteint 0:00 : les textes sont partis à l’IA tels quels. La correction prend quelques minutes.'
                  : 'Quelques minutes. Vous n’êtes pas obligé de rester ici : la tentative apparaît dans l’historique avec le statut « correction IA ».'}
              </Text>
            </View>
            <View style={styles.pendRows}>
              <View style={styles.pendRow}>
                <Text style={styles.pendLabel}>Envoyé</Text>
                <Text style={styles.pendValue}>
                  {wMulti
                    ? wauto
                      ? '2 tâches · automatiquement'
                      : '2 tâches · manuellement'
                    : wauto
                      ? 'Envoi automatique'
                      : 'Envoi manuel'}
                </Text>
              </View>
              <View style={styles.pendRow}>
                <Text style={styles.pendLabel}>Statut dans l’historique</Text>
                <Text style={styles.pendValue}>Correction IA</Text>
              </View>
              <View style={styles.pendRowLast}>
                <Text style={styles.pendLabel}>Attente estimée</Text>
                <Text style={styles.pendValue}>1 à 5 minutes</Text>
              </View>
            </View>
          </>
        )}

        {s === 'speaking' && sstage === 'consignes' && (
          <>
            <View style={styles.consignesHead}>
              <Text style={styles.consignesKicker}>TEF Canada · épreuve 4 sur 4</Text>
              <Text style={styles.consignesTitle}>Expression orale</Text>
              <Text style={styles.consignesSub}>
                {sMulti ? '2 parties · face à un examinateur' : 'Section B · face à un examinateur'}
              </Text>
              <Text style={styles.demoNote}>
                Démo : préparation et prise en temps réel, sans coupure de session. La préparation peut être
                sautée.
              </Text>
            </View>
            <View style={styles.rulesCard}>
              <Text style={styles.rRulesKicker}>CONSIGNES</Text>
              {SPEAKING_RULES.map((r, i) => (
                <View key={i} style={styles.ruleRow}>
                  <View style={styles.ruleNum}>
                    <Text style={styles.ruleNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.ruleText}>{r}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.consigneNote}>{SPEAKING_NOTE}</Text>
          </>
        )}

        {s === 'speaking' && sstage === 'intro' && (
          <>
            <View style={styles.spHead}>
              <Text style={styles.spKicker}>{staskData.kicker}</Text>
              <Text style={styles.spTitle}>{staskData.title}</Text>
            </View>
            <View style={styles.spCard}>
              <Text style={styles.spCardKicker}>CONSIGNE</Text>
              <Text style={styles.spCardText}>{staskData.consigne}</Text>
            </View>
            <View style={styles.spCard}>
              <Text style={styles.spDocKicker}>{staskData.docLabel}</Text>
              <Text style={styles.spDocText}>{staskData.doc}</Text>
            </View>
            <View style={styles.spMeta}>
              <View style={styles.spMetaRow}>
                <Text style={styles.spMetaLabel}>Préparation · découverte du sujet</Text>
                <Text style={styles.spMetaValue}>{fmtClock(staskData.prep)}</Text>
              </View>
              <View style={styles.spMetaRow}>
                <Text style={styles.spMetaLabel}>Temps de parole</Text>
                <Text style={styles.spMetaValue}>{staskData.maxLabel} max</Text>
              </View>
              <View style={styles.spMetaRow}>
                <Text style={styles.spMetaLabel}>Format</Text>
                <Text style={styles.spMetaValue}>{staskData.format}</Text>
              </View>
              <View style={styles.spMetaRowLast}>
                <Text style={styles.spMetaLabel}>Réenregistrement</Text>
                <Text style={styles.spMetaValue}>Non autorisé</Text>
              </View>
            </View>
          </>
        )}

        {s === 'speaking' && sstage === 'prep' && (
          <>
            <View style={styles.prepCard}>
              <View style={styles.prepRing}>
                <Text style={styles.prepClock}>{fmtClock(prepLeft)}</Text>
                <Text style={styles.prepRest}>RESTANT</Text>
              </View>
              <View style={styles.prepHead}>
                <Text style={styles.prepName}>Préparation</Text>
                <Text style={styles.prepNote}>
                  {prepLeft > 0
                    ? "Lisez la consigne et préparez vos questions. L'enregistrement démarre automatiquement à 0:00."
                    : 'La préparation est terminée — le microphone s’ouvre maintenant.'}
                </Text>
              </View>
            </View>
            <Text style={styles.wTitle}>{staskData.title}</Text>
            <Text style={styles.prepConsigne}>{staskData.consigne}</Text>
            <View style={styles.passageCard}>
              <Text style={styles.passageKicker}>{staskData.docLabel}</Text>
              <Text style={styles.passage}>{staskData.doc}</Text>
            </View>
          </>
        )}

        {s === 'speaking' && sstage === 'record' && (
          <>
            <Text style={styles.spKicker}>{staskData.kicker}</Text>
            <Text style={styles.spShort}>{staskData.short}</Text>
            <View
              style={[
                styles.turnCard,
                cue.who === 'ex' ? styles.turnCardEx : styles.turnCardYou,
              ]}>
              <View style={styles.turnHead}>
                <Text style={styles.turnKicker}>{cue.who === 'ex' ? 'L’EXAMINATEUR' : 'À VOUS'}</Text>
                <Text style={styles.turnNext}>
                  {nextCue
                    ? `Prochaine réplique dans ${fmtClock(nextCue.at - rec)}`
                    : 'Dernière réplique — concluez l’échange'}
                </Text>
              </View>
              <Text style={styles.turnText}>{cue.text}</Text>
            </View>
            <View style={styles.recCard}>
              <Text style={styles.recClock}>{fmtClock(rec)}</Text>
              <Text style={styles.recState}>{sStopped ? 'ARRÊT À LA LIMITE' : 'ENREGISTREMENT'}</Text>
              <Waveform active={!sStopped} color="#8B62E0" />
              <View style={styles.wordTrack}>
                <LinearGradient
                  colors={['#8B62E0', '#2E1A3B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.wordFill, { width: `${Math.min(100, (rec / staskData.max) * 100)}%` }]}
                />
              </View>
              <View style={styles.recMeta}>
                <Text style={styles.recLeft}>
                  {sStopped ? 'Durée maximale atteinte' : `${fmtClock(staskData.max - rec)} restant`}
                </Text>
                <Text style={styles.recLeft}>max {staskData.maxLabel}</Text>
              </View>
            </View>
            <View style={styles.stopWrap}>
              <Pressable
                style={[styles.stopBtn, rec < 3 && styles.stopBtnOff]}
                onPress={stopTake}
                disabled={rec < 3}
                accessibilityRole="button"
                accessibilityLabel="Arrêter et enregistrer">
                <View style={styles.stopSquare} />
              </Pressable>
              <Text style={styles.recHint}>
                {sStopped
                  ? "L'enregistrement a été sauvegardé automatiquement à la limite. Rien n'est perdu."
                  : 'Touchez le carré pour arrêter. L’enregistrement est sauvegardé dès l’arrêt.'}
              </Text>
            </View>
            <Text style={styles.stubNote}>
              Démo : aucun son n’est enregistré — le minuteur simule la prise.
            </Text>
          </>
        )}

        {s === 'speaking' && sstage === 'review' && (
          <>
            <View style={styles.reviewHead}>
              <View style={styles.reviewPills}>
                <Text style={styles.sKickerPill}>{staskData.kicker}</Text>
                <View style={styles.savedChip}>
                  <View style={styles.mcheck}>
                    <View style={[styles.mcheckBar, styles.mcheckShort]} />
                    <View style={[styles.mcheckBar, styles.mcheckLong]} />
                  </View>
                  <Text style={styles.savedLabel}>Enregistré</Text>
                </View>
              </View>
              <Text style={styles.wTitle}>
                {sMulti ? `Tâche ${stask + 1} enregistrée` : 'Section B enregistrée'} ·{' '}
                {fmtClock(sdur[stask] ?? rec)}
              </Text>
            </View>
            <View style={styles.reviewRows}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Durée</Text>
                <Text style={styles.reviewValue}>{fmtClock(sdur[stask] ?? rec)}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Maximum</Text>
                <Text style={styles.reviewValue}>{staskData.maxLabel}</Text>
              </View>
              <View style={styles.reviewRowLast}>
                <Text style={styles.reviewLabel}>Section</Text>
                <Text style={styles.reviewValue}>{staskData.kicker.split(' · ')[1]}</Text>
              </View>
            </View>
            <Text style={styles.reviewNote}>
              Cet enregistrement est définitif. Un test blanc n’autorise qu’une prise par tâche, exactement
              comme à l’examen.
            </Text>
          </>
        )}

        {s === 'speaking' && sstage === 'submit' && (
          <>
            <View style={styles.submitHead}>
              <Text style={styles.wTitle}>
                {sMulti
                  ? 'Envoyer les deux enregistrements à la correction'
                  : "Envoyer l'enregistrement à la correction"}
              </Text>
              <Text style={styles.submitSub}>
                {sMulti
                  ? 'Une fois envoyés, les enregistrements ne peuvent plus être modifiés. L’IA les évalue sur quatre critères et vous transmet le résultat.'
                  : 'Une fois envoyé, l’enregistrement ne peut plus être modifié. L’IA l’évalue sur quatre critères et vous transmet le résultat.'}
              </Text>
            </View>
            {SPEAKING_TASKS.map((t, i) => (
              <View key={t.kicker} style={styles.submitRow}>
                <View style={styles.fileIcon}>
                  <AppIcon name="IconBulkMic" size={18} color="#966010" />
                </View>
                <View style={styles.submitInfo}>
                  <Text style={styles.submitName}>
                    {sMulti ? `Tâche ${i + 1}` : 'Section B'} · {t.title}
                  </Text>
                  <Text style={styles.submitMeta}>
                    {t.kicker.split(' · ')[1]} · limite {t.maxLabel}
                  </Text>
                </View>
                <Text style={styles.submitWords}>{fmtClock(sdur[i] ?? 0)}</Text>
              </View>
            ))}
            <View style={styles.aiBox}>
              <View style={styles.aiBoxHead}>
                <AppIcon name="IconSparkles" size={16} color="#8A5B10" />
                <Text style={styles.aiBoxTitle}>La correction par l’IA prend 1 à 5 minutes</Text>
              </View>
              <Text style={styles.aiBoxBody}>
                Vous pouvez fermer l’application. La tentative apparaît dans l’historique avec le statut «
                correction IA » et une notification vous prévient dès que le score arrive.
              </Text>
              <View style={styles.critChips}>
                {SPEAKING_CRITERIA.map((c) => (
                  <Text key={c} style={styles.critChip}>
                    {c}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}

        {s === 'speaking' && sstage === 'pending' && (
          <>
            <View style={styles.aiWrap}>
              <ScoringRing />
              <Text style={styles.aiLabel}>CORRECTION</Text>
              <Text style={styles.aiTitle}>
                {sMulti ? 'Les deux tâches sont chez l’IA' : 'La tâche est chez l’IA'}
              </Text>
              <Text style={styles.aiSub}>
                Environ 5 minutes. Vous n’êtes pas obligé de rester ici : nous vous prévenons dès que le score
                est prêt.
              </Text>
            </View>
            <View style={styles.pendRows}>
              <View style={styles.pendRow}>
                <Text style={styles.pendLabel}>Envoyé</Text>
                <Text style={styles.pendValue}>{sMulti ? '2 tâches · manuellement' : '1 tâche · manuellement'}</Text>
              </View>
              <View style={styles.pendRow}>
                <Text style={styles.pendLabel}>Statut dans l’historique</Text>
                <Text style={styles.pendValue}>Correction IA</Text>
              </View>
              <View style={styles.pendRowLast}>
                <Text style={styles.pendLabel}>Attente estimée</Text>
                <Text style={styles.pendValue}>Environ 5 minutes</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {s === 'listening' && stage === 'question' && (
        <View style={[styles.footBar, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,.72)', 'rgba(255,255,255,.96)', '#fff']}
            locations={[0, 0.42, 0.78, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View pointerEvents="none" style={styles.stripWrap}>
            <Text style={[styles.stripText, stripUrgent && styles.stripUrgent]}>{stripText}</Text>
          </View>
        </View>
      )}
      <View style={[styles.chrome, { paddingTop: insets.top }]} pointerEvents="box-none">
        <LinearGradient
          colors={
            dark
              ? ['rgba(30,18,38,.92)', 'rgba(30,18,38,0)']
              : ['rgba(248,243,247,.96)', 'rgba(248,243,247,.86)', 'rgba(248,243,247,0)']
          }
          locations={dark ? [0, 1] : [0, 0.7, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.bar}>
          <Pressable
            style={styles.close}
            onPress={() => {
              stopAudio();
              setExitVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Leave test"
            hitSlop={8}>
            <XIcon color={dark ? '#fff' : '#111827'} />
          </Pressable>
          <Text style={[styles.chromeTitle, dark && styles.chromeTitleDark]} numberOfLines={1}>
            {s === 'reading' && rstage === 'break'
              ? `${READING_QUESTIONS[READING_QUESTIONS.length - 1].group} · terminé`
              : s === 'reading' && (rstage === 'passage' || rstage === 'question')
                ? `Question ${(rstage === 'passage' ? [0, 4, 5][rdoc] : qIndex) + 1} sur 6`
                : s === 'writing' && wstage === 'submit'
                  ? wMulti
                    ? 'Envoi · 2 tâches'
                    : 'Envoi · section B'
                  : s === 'writing' && wstage === 'review'
                    ? wMulti
                      ? `Tâche ${wtask + 1} sur ${WRITING_TASKS.length}`
                      : 'Section B'
                    : s === 'writing' && (wstage === 'write' || wstage === 'pending')
                      ? ''
                      : s === 'speaking' && sstage === 'submit'
                        ? sMulti
                          ? 'Envoi · 2 tâches'
                          : 'Envoi · section B'
                        : s === 'speaking' && sstage === 'pending'
                          ? ''
                          : s === 'speaking' && sstage !== 'consignes'
                            ? sMulti
                              ? `Tâche ${stask + 1} sur ${SPEAKING_TASKS.length}`
                              : 'Section B'
                            : `${SKILL_LABEL[s]} · Demo`}
          </Text>
          {s === 'speaking' && sstage === 'record' && (
            <View style={styles.recDot}>
              <View style={styles.recDotInner} />
              <Text style={styles.recDotLabel}>REC</Text>
            </View>
          )}
          {s === 'writing' && wstage === 'write' && (
            <View style={styles.wordChip}>
              <Text style={styles.wordChipText}>
                {wcount} / {wtaskData.min}
              </Text>
            </View>
          )}
          {showTimer && s === 'reading' && (
            <View style={[styles.rTimer, clockSecs < 300 && styles.rTimerUrgent]}>
              <Text style={[styles.rTimerText, clockSecs < 300 && styles.rTimerUrgentText]}>
                {fmtClock(clockSecs)}
              </Text>
            </View>
          )}
          {showTimer && s !== 'reading' && (
            <View
              style={[
                styles.timer,
                dark ? styles.timerDark : styles.timerLight,
                clockSecs < 60 && styles.timerUrgent,
              ]}>
              <Text
                style={[
                  styles.timerText,
                  dark && styles.timerTextDark,
                  clockSecs < 60 && styles.timerUrgentText,
                ]}>
                {fmtClock(clockSecs)}
              </Text>
            </View>
          )}
        </View>
        {isChoice && !dark && (s !== 'reading' || rstage === 'question') && (
          <View style={styles.progress}>
            <View style={styles.track}>
              <LinearGradient
                colors={[accent.color, accent.deep]}
                style={[
                  styles.fill,
                  {
                    width: `${
                      (((s === 'listening' ? li : qIndex) + 1) /
                        (s === 'listening' ? FLAT.length : questions.length)) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            {s === 'reading' ? (
              <View style={styles.progressRow}>
                <Pressable
                  onPress={() => setNavOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open navigator">
                  <Text style={[styles.progressLabel, styles.progressLink]}>
                    Question {qIndex + 1} sur {questions.length}
                  </Text>
                </Pressable>
                <Text style={styles.progressGroup}>{READING_GROUP}</Text>
              </View>
            ) : (
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  Question {li + 1} sur {FLAT.length}
                </Text>
                <Text style={styles.progressGroup}>{cur.doc.group}</Text>
              </View>
            )}
          </View>
        )}
        {s === 'writing' && wstage !== 'consignes' && wstage !== 'pending' && (
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              {wstage === 'submit'
                ? wMulti
                  ? 'Deux tâches rédigées'
                  : 'Texte rédigé'
                : wMulti
                  ? `Tâche ${wtask + 1} sur ${WRITING_TASKS.length}`
                  : 'Section B'}
            </Text>
            <Text style={styles.progressGroup}>
              {wstage === 'submit'
                ? 'Prêt à envoyer'
                : wstage === 'review'
                  ? 'Enregistré'
                  : 'Expression écrite · 10 min'}
            </Text>
          </View>
        )}
        {s === 'speaking' && (sstage === 'prep' || sstage === 'review' || sstage === 'submit') && (
          <View style={styles.progress}>
            <View style={styles.track}>
              <LinearGradient
                colors={[accent.color, accent.deep]}
                style={[styles.fill, { width: `${sProgPct}%` }]}
              />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {sstage === 'submit'
                  ? sMulti
                    ? 'Deux tâches enregistrées'
                    : 'Prise enregistrée'
                  : sMulti
                    ? `Tâche ${stask + 1} sur ${SPEAKING_TASKS.length}`
                    : 'Section B'}
              </Text>
              <Text style={styles.progressGroup}>
                {sstage === 'submit' ? 'Prêt à envoyer' : sstage === 'review' ? 'Enregistré' : 'Expression orale'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {s === 'reading' && rstage === 'consignes' && (
        <StickyCta
          tone="dark"
          label="Commencer l'épreuve"
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => setRstage('passage')}
        />
      )}
      {s === 'reading' && rstage === 'passage' && (
        <StickyCta
          bg="#2E1A3B"
          label="Répondre aux questions"
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => {
            const first = READING_QUESTIONS.findIndex((q) => q.docId === READING_DOCS[rdoc].id);
            setQIndex(first >= 0 ? first : 0);
            setRstage('question');
          }}
          note="1 question sur ce texte · vous pouvez le rouvrir à tout moment"
        />
      )}
      {s === 'reading' && rstage === 'break' && (
        <StickyCta
          bg="#2E1A3B"
          label="Passer au groupe suivant"
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => setRstage('complete')}
          note={`${rAnswered} questions sur ${READING_QUESTIONS.length} répondues · ${Math.ceil(rsecs / 60)} min restantes`}
        />
      )}
      {s === 'reading' && rstage === 'question' && (
        <View style={[styles.footBar, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,.72)', 'rgba(255,255,255,.96)', '#fff']}
            locations={[0, 0.42, 0.78, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View pointerEvents="box-none" style={styles.rFootCol}>
            <Pressable
              style={styles.skipPill}
              onPress={() => {
                if (qIndex + 1 >= questions.length) {
                  setConfirmOpen(true);
                } else {
                  rAdvance();
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Je ne sais pas">
              <Text style={styles.skipLabel}>Je ne sais pas</Text>
            </Pressable>
            {current.type === 'text-mcq' && (
              <Pressable
                style={[styles.textBar, { backgroundColor: accent.color + '1F', borderColor: accent.color + '40' }]}
                onPress={() => setTextOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Revoir le document">
                <AppIcon name="IconBulkBook" size={16} color={accent.ink} />
                <Text style={[styles.textBarLabel, { color: accent.ink }]} numberOfLines={1}>
                  {curDoc.title}
                </Text>
                <Text style={styles.textBarHint}>{readingWords} mots</Text>
              </Pressable>
            )}
            <View style={styles.rCtaRow} pointerEvents="box-none">
              <Pressable
                style={styles.rBackBtn}
                onPress={() => setRstage('passage')}
                accessibilityRole="button"
                accessibilityLabel="Back">
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                  <AppIcon name="IconArrowRight" size={18} color="#111827" />
                </View>
              </Pressable>
              <Pressable
                style={[styles.rCta, !answered && styles.rCtaDisabled]}
                disabled={!answered}
                onPress={() => {
                  if (qIndex + 1 >= questions.length) {
                    setConfirmOpen(true);
                  } else {
                    rAdvance();
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={qIndex + 1 >= questions.length ? "Terminer l'épreuve" : 'Question suivante'}>
                <Text style={[styles.rCtaLabel, !answered && styles.rCtaLabelDisabled]}>
                  {qIndex + 1 >= questions.length ? "Terminer l'épreuve" : 'Question suivante'}
                </Text>
                <AppIcon name="IconArrowRight" size={17} color={answered ? '#fff' : '#9CA3AF'} />
              </Pressable>
            </View>
            <Text style={styles.rCtaNote}>
              {qIndex + 1 >= questions.length
                ? 'Une fois validé, plus aucune modification n’est possible.'
                : answered
                  ? `Question ${qIndex + 1} sur ${questions.length} · vos réponses restent modifiables jusqu'à la validation`
                  : 'Choisissez une réponse pour continuer.'}
            </Text>
          </View>
        </View>
      )}
      {s === 'listening' && stage === 'consignes' && (
        <StickyCta
          tone="dark"
          label="Commencer l'épreuve"
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => {
            openFlat(0);
            setStage('question');
          }}
        />
      )}
      {s === 'writing' && wstage === 'consignes' && (
        <StickyCta
          tone="dark"
          label="Commencer l'épreuve"
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => setWstage('write')}
          note={
            wMulti
              ? "Le chronomètre de 10 minutes (démo) couvre les deux textes — il démarre à l'écran suivant."
              : "Le chronomètre de 10 minutes (démo) couvre le texte — il démarre à l'écran suivant."
          }
        />
      )}
      {s === 'writing' && wstage === 'write' && (
        <StickyCta
          bg={wshort ? '#B4451F' : '#2E1A3B'}
          label={wshort ? `Continuer avec ${wcount} mots` : 'Enregistrer et relire le brouillon'}
          icon={
            wshort ? (
              <AppIcon name="IconArrowRight" size={17} color="#fff" />
            ) : (
              <CheckIcon color="#fff" />
            )
          }
          onPress={() => setWstage('review')}
          disabled={wcount === 0}
          note={
            wcount === 0
              ? "Écrivez quelque chose avant d'enregistrer cette tâche."
              : wshort
                ? `Un texte de moins de ${wtaskData.min} mots perd des points — encore ${wtaskData.min - wcount}.`
                : "Le brouillon est enregistré au fil de la frappe. Vous pouvez le modifier jusqu'à l'envoi."
          }
        />
      )}
      {s === 'writing' && wstage === 'review' && (
        <StickyCta
          bg="#2E1A3B"
          label={!wMulti || wtask === WRITING_TASKS.length - 1 ? 'Vérifier et envoyer' : 'Passer à la tâche 2'}
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => {
            if (!wMulti || wtask === WRITING_TASKS.length - 1) {
              setWstage('submit');
            } else {
              setWtask(wtask + 1);
              setPromptOpen(false);
              setWstage('write');
            }
          }}
          note={
            !wMulti || wtask === WRITING_TASKS.length - 1
              ? "Rien n'a encore été envoyé à l'IA."
              : 'La tâche 2 est le courrier des lecteurs : 200 mots minimum.'
          }
        />
      )}
      {s === 'writing' && wstage === 'submit' && (
        <StickyCta
          bg="#2E1A3B"
          label="Envoyer à la correction"
          icon={<AppIcon name="IconOutlineRoundedAiDocument" size={17} color="#fff" />}
          onPress={() => void finishWriting(false)}
          note="Action irréversible — les textes sont définitifs après envoi."
        />
      )}
      {s === 'writing' && wstage === 'pending' && (
        <StickyCta
          tone="dark"
          label={isMock ? 'Continuer : Expression orale' : 'Voir le résultat'}
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          disabled={!isMock && !wSaved}
          onPress={() =>
            isMock
              ? router.replace({ pathname: '/test/[skill]', params: fwdParams('speaking') })
              : router.replace({ pathname: '/result', params: { session: sessionRef.current } })
          }
          note={
            isMock
              ? `L'IA corrige cette épreuve pendant que vous continuez. Passage à l'oral dans ${fmtClock(handSecs)}.`
              : `L'IA corrige cette épreuve. Votre résultat s'ouvre dans ${fmtClock(handSecs)}.`
          }
        />
      )}
      {s === 'speaking' && sstage === 'consignes' && (
        <StickyCta
          tone="dark"
          label="Commencer l'épreuve"
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => setSstage('intro')}
          note={
            sMulti
              ? "L'examinateur est prêt — la section A commence par une minute de découverte du document."
              : "L'examinateur est prêt — la partie commence par une minute de découverte du document."
          }
        />
      )}
      {s === 'speaking' && sstage === 'intro' && (
        <StickyCta
          tone="dark"
          label="Commencer la préparation"
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => {
            setPrepLeft(staskData.prep);
            setSstage('prep');
          }}
          note={`Le chronomètre démarre à l'écran suivant. ${fmtClock(staskData.prep)} de préparation, puis l'enregistrement démarre tout seul.`}
        />
      )}
      {s === 'speaking' && sstage === 'prep' && (
        <StickyCta
          bg="#2E1A3B"
          label="Je suis prêt · enregistrer"
          icon={<AppIcon name="IconBulkMic" size={17} color="#fff" />}
          onPress={() => {
            setRec(0);
            setSstage('record');
          }}
          note="L'enregistrement démarre tout seul à la fin de la préparation."
        />
      )}
      {s === 'speaking' && sstage === 'record' && (
        <StickyCta
          tone="dark"
          label={sStopped ? 'Enregistrer et continuer' : 'Arrêter et enregistrer'}
          icon={
            sStopped ? (
              <CheckIcon color="#fff" />
            ) : (
              <View style={styles.ctaSquare} />
            )
          }
          onPress={stopTake}
          disabled={rec < 3}
          note={
            sStopped
              ? `Temps écoulé — l'enregistrement s'est arrêté à ${staskData.maxLabel}.`
              : rec < 3
                ? 'Parlez quelques secondes avant de pouvoir arrêter.'
                : "Touchez le carré pour arrêter. L'enregistrement est sauvegardé dès l'arrêt."
          }
        />
      )}
      {s === 'speaking' && sstage === 'review' && (
        <StickyCta
          bg="#2E1A3B"
          label={!sMulti || stask === SPEAKING_TASKS.length - 1 ? 'Vérifier et envoyer' : 'Passer à la tâche 2'}
          icon={<AppIcon name="IconArrowRight" size={17} color="#fff" />}
          onPress={() => {
            if (!sMulti || stask === SPEAKING_TASKS.length - 1) {
              setSstage('submit');
            } else {
              setStask(stask + 1);
              setRec(0);
              setSstage('intro');
            }
          }}
          note={
            !sMulti || stask === SPEAKING_TASKS.length - 1
              ? "Rien n'a encore été envoyé à l'IA."
              : `Tâche ${stask + 2} · ${SPEAKING_TASKS[stask + 1].maxLabel} — ${SPEAKING_TASKS[stask + 1].title.toLowerCase()}.`
          }
        />
      )}
      {s === 'speaking' && sstage === 'submit' && (
        <StickyCta
          bg="#2E1A3B"
          label="Envoyer à la correction"
          icon={<AppIcon name="IconOutlineRoundedAiDocument" size={17} color="#fff" />}
          onPress={() => void finishSpeaking()}
          note="Action irréversible — les enregistrements sont définitifs après envoi."
        />
      )}
      {s === 'speaking' && sstage === 'pending' && (
        <StickyCta
          tone="dark"
          label={isMock ? 'Voir le résultat de la session' : 'Voir le résultat'}
          icon={<AppIcon name="IconOutlineRoundedAiDocument" size={17} color="#fff" />}
          onPress={() => router.push({ pathname: '/result', params: { session: sessionRef.current } })}
          note={
            isMock
              ? 'Les quatre épreuves sont terminées — les scores sont publiés ensemble.'
              : 'Votre résultat est prêt.'
          }
        />
      )}

      {s === 'reading' && navOpen && (
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable
            style={styles.sheetBgTap}
            onPress={() => setNavOpen(false)}
            accessibilityLabel="Close navigator"
          />
          <View style={styles.sheet}>
            <View style={styles.grab} />
            <View style={styles.navHead}>
              <Text style={styles.sheetTitle}>Les 6 questions</Text>
              <Text style={styles.sheetBody}>
                {rAnswered} répondues · {READING_QUESTIONS.length - rAnswered} encore vides. Touchez un numéro
                pour y aller directement.
              </Text>
            </View>
            <View style={styles.navGrid}>
              {READING_QUESTIONS.map((q, i) => {
                const done = picked[q.id] !== undefined;
                return (
                  <Pressable
                    key={q.id}
                    style={[
                      styles.navCell,
                      i === qIndex
                        ? { backgroundColor: accent.color }
                        : done
                          ? styles.navDone
                          : styles.navTodo,
                    ]}
                    onPress={() => {
                      setQIndex(i);
                      setNavOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Question ${i + 1}`}>
                    <Text
                      style={[
                        styles.navNum,
                        { color: i === qIndex ? '#fff' : done ? '#5E4E69' : '#9C8F9A' },
                      ]}>
                      {i + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.navLegend}>
              {[
                { label: 'En cours', bg: accent.color, ring: accent.color },
                { label: 'Répondue', bg: '#F5EEF3', ring: '#EFE3EC' },
                { label: 'Vide', bg: '#fff', ring: '#E8DFE6' },
              ].map((l) => (
                <View key={l.label} style={styles.navLegendItem}>
                  <View style={[styles.navDot, { backgroundColor: l.bg, borderColor: l.ring }]} />
                  <Text style={styles.navLegendLabel}>{l.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.navBtns}>
              {(() => {
                const first = READING_QUESTIONS.findIndex((q) => picked[q.id] === undefined);
                return first >= 0 ? (
                  <Pressable
                    style={styles.sheetPrimary}
                    onPress={() => {
                      setQIndex(first);
                      setNavOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Aller à la première question vide ${first + 1}`}>
                    <Text style={styles.sheetPrimaryLabel}>
                      Aller à la première question vide · {first + 1}
                    </Text>
                  </Pressable>
                ) : null;
              })()}
              <Pressable
                style={styles.sheetClose}
                onPress={() => setNavOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Retour à l'épreuve">
                <Text style={styles.sheetCloseLabel}>Retour à l’épreuve</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {s === 'reading' && confirmOpen && (
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable
            style={styles.sheetBgTap}
            onPress={() => setConfirmOpen(false)}
            accessibilityLabel="Close confirmation"
          />
          <View style={styles.sheet}>
            <View style={styles.grab} />
            <Text style={styles.sheetTitle}>Terminer l’épreuve ?</Text>
            <Text style={styles.sheetBody}>
              {rAnswered} réponses sur {READING_QUESTIONS.length} ·{' '}
              {READING_QUESTIONS.length - rAnswered} encore vides. Une fois validé, plus aucune modification
              n’est possible.
            </Text>
            <Pressable
              style={styles.sheetPrimaryNavy}
              onPress={() => {
                setConfirmOpen(false);
                rfinishRef.current();
              }}
              accessibilityRole="button"
              accessibilityLabel="Valider">
              <Text style={styles.sheetPrimaryLabel}>Valider</Text>
            </Pressable>
            <Pressable style={styles.sheetClose} onPress={() => setConfirmOpen(false)} accessibilityRole="button">
              <Text style={styles.sheetCloseLabel}>Retour</Text>
            </Pressable>
          </View>
        </View>
      )}

      {s === 'reading' && textOpen && (
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable
            style={styles.sheetBgTap}
            onPress={() => setTextOpen(false)}
            accessibilityLabel="Close document"
          />
          <View style={styles.textSheet}>
            <View style={styles.grab} />
            <View style={styles.textHead}>
              <View style={styles.textHeadText}>
                <Text style={styles.textKicker} numberOfLines={1}>
                  {(READING_QUESTIONS.find((q) => q.docId === curDoc.id)?.group ?? '').toUpperCase()}
                </Text>
                <Text style={styles.textTitle} numberOfLines={1}>
                  {curDoc.title}
                </Text>
              </View>
              <Pressable
                style={styles.textX}
                onPress={() => setTextOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <XIcon color="#5E4E69" />
              </Pressable>
            </View>
            <ScrollView
              style={styles.textScroll}
              contentContainerStyle={styles.textBody}
              nestedScrollEnabled>
              {curDoc.text.map((para, i) => (
                <Text key={i} style={styles.sheetPara}>
                  {para}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <ExitSheet
        visible={exitVisible}
        title={
          s === 'speaking' && sstage === 'record'
            ? 'Arrêter et perdre cet enregistrement ?'
            : s === 'speaking'
              ? "Quitter avant d'enregistrer ?"
              : s === 'listening' || s === 'reading' || s === 'writing'
                ? s === 'writing' && wstage !== 'consignes' && wstage !== 'pending'
                  ? 'Quitter cette tâche ?'
                  : "Quitter l'épreuve ?"
                : 'Leave this test?'
        }
        body={
          s === 'reading'
            ? 'Votre progression est enregistrée comme tentative inachevée. Le chronomètre continue pendant votre absence.'
            : s === 'listening'
              ? 'Vos réponses à cette démo seront perdues.'
              : s === 'writing'
                ? wMulti
                  ? `La tâche ${wtask + 1} compte ${wcount} mots. Le brouillon n’est pas encore envoyé : il sera perdu si vous quittez.`
                  : `Le texte compte ${wcount} mots. Le brouillon n’est pas encore envoyé : il sera perdu si vous quittez.`
                : s === 'speaking' && sstage === 'record'
                  ? `Vous êtes à ${fmtClock(rec)} de ${sMulti ? `la tâche ${stask + 1}` : 'la section B'}. Quitter maintenant supprime cet enregistrement : aucune prise partielle n’est conservée.`
                  : s === 'speaking'
                    ? `Rien n’a encore été enregistré pour ${sMulti ? `la tâche ${stask + 1}` : 'la section B'}. La tentative est enregistrée comme inachevée et la préparation recommence à votre retour.`
                    : 'Your answers on this demo will be lost.'
        }
        keepLabel={
          s === 'speaking' && sstage === 'record'
            ? "Poursuivre l'enregistrement"
            : s === 'speaking'
              ? 'Rester et préparer'
              : s === 'writing' && wstage !== 'consignes' && wstage !== 'pending'
                ? 'Rester et continuer à rédiger'
                : s === 'listening' || s === 'reading'
                  ? "Continuer l'épreuve"
                  : 'Keep going'
        }
        leaveLabel={
          s === 'reading'
            ? 'Enregistrer et quitter'
            : s === 'listening'
              ? 'Quitter sans enregistrer'
              : s === 'writing'
                ? 'Quitter sans enregistrer'
                : s === 'speaking' && sstage === 'record'
                  ? 'Supprimer et quitter'
                  : s === 'speaking'
                    ? 'Enregistrer et quitter'
                    : 'Leave'
        }
        keepBg={s === 'reading' ? '#2E1A3B' : undefined}
        leaveInk={s === 'reading' ? '#B4451F' : undefined}
        rows={
          s === 'listening'
            ? [
                { label: 'Réponses', value: `${Object.keys(picked).length} sur ${FLAT.length}` },
                { label: 'Document', value: `${FLAT[li].docIdx + 1} sur ${LISTENING_DEMO.length}` },
                { label: 'Temps restant', value: fmtClock(secs) },
              ]
            : s === 'reading'
              ? [
                  { label: 'Réponses', value: `${rAnswered} sur ${READING_QUESTIONS.length}` },
                  { label: 'Document', value: `${rdocNum(qIndex)} sur ${READING_DOCS.length}` },
                  { label: 'Temps restant', value: fmtClock(rsecs) },
                ]
              : s === 'writing'
                ? [
                    {
                      label: 'Rédaction',
                      value: wMulti ? `Tâche ${wtask + 1} · ${wcount} mots` : `Section B · ${wcount} mots`,
                    },
                    { label: 'Temps restant', value: fmtClock(wsecs) },
                  ]
                : s === 'speaking' && sstage !== 'record'
                  ? [
                      {
                        label: 'Enregistré',
                        value: sMulti
                          ? `${sdur.length} tâche${sdur.length === 1 ? '' : 's'} sur ${SPEAKING_TASKS.length}`
                          : sdur.length > 0
                            ? '1 tâche'
                            : 'aucune',
                      },
                      {
                        label: 'Tâche en cours',
                        value: sMulti ? `Tâche ${stask + 1} · ${staskData.title}` : `Section B · ${staskData.title}`,
                      },
                    ]
                  : undefined
        }
        note={
          s === 'listening' || s === 'reading' || s === 'speaking' ? 'La reprise est gratuite.' : undefined
        }
        onKeep={() => setExitVisible(false)}
        onLeave={() => {
          Keyboard.dismiss();
          if (s === 'reading') {
            const correct = READING_QUESTIONS.filter((q) => picked[q.id] === q.answer).length;
            void saveResult({
              id: String(Date.now()),
              session: sessionRef.current,
              date: new Date().toISOString().slice(0, 10),
              skill: 'reading',
              section: 'B',
              correct,
              total: READING_QUESTIONS.length,
            }).catch(() => {});
          }
          stopAudio();
          router.back();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  bg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 0 },
  goldBlob: { position: 'absolute', left: -136, top: -178, width: 392, height: 418, opacity: 0.15, zIndex: 0 },
  plumBlob: { position: 'absolute', right: -38, top: 511, width: 196, height: 426, opacity: 0.15, zIndex: 0 },
  scroll: { flex: 1, zIndex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 150, gap: 12 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 24, color: Brand.ink },
  consigneCard: { gap: 8, padding: 16, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFE3EC' },
  consigneKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' },
  consigneText: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 21, color: Brand.ink },
  docCard: { gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 22, backgroundColor: '#F7F9FE', borderWidth: 1, borderColor: '#DCE6F8' },
  docKicker: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' },
  docNote: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#2E1A3B' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { flex: 1, height: 4, borderRadius: 100 },
  passageCard: { gap: 8, padding: 16, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFE3EC' },
  passageKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' },
  passage: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 22, color: Brand.ink },
  qHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  qKicker: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 0.4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    overflow: 'hidden',
  },
  qText: { fontFamily: FontFamily.sansBold, fontSize: 20, lineHeight: 28, letterSpacing: -0.3, color: '#111827' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE3EC',
  },
  badge: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: FontFamily.sansBold, fontSize: 12 },
  optionText: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: 14, lineHeight: 20, color: '#111827' },
  taskTitle: { fontFamily: FontFamily.sansBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3, color: '#111827' },
  input: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    lineHeight: 22,
    color: Brand.ink,
    backgroundColor: Brand.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3EC',
    padding: 16,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  partnerLabel: { fontFamily: FontFamily.sansBold, fontSize: 15, color: Brand.plum },
  note: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 18, color: Brand.muted },
  chrome: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 9 },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 12 },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  x: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  xBar: { position: 'absolute', width: 18, height: 2, borderRadius: 1 },
  chromeTitle: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: 15, letterSpacing: -0.1, color: '#111827' },
  timer: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLight: { backgroundColor: '#F5EEF3', borderColor: '#E8DFE6' },
  timerDark: { backgroundColor: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.14)' },
  timerUrgent: { backgroundColor: '#FEF2F2', borderColor: '#FBD5D5' },
  timerText: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#374151' },
  timerTextDark: { color: '#fff' },
  timerUrgentText: { color: '#B91C1C' },
  optLocked: { backgroundColor: '#F8F4F7', borderColor: '#DFD6DD', borderStyle: 'dashed' },
  badgeLocked: { backgroundColor: '#ECE5EB' },
  badgeLockedText: { color: '#857789' },
  optionLockedText: { color: '#473D45' },
  optSel: { borderColor: '#2E1A3B', borderWidth: 2, backgroundColor: '#FBF7FA' },
  badgeSel: { backgroundColor: '#2E1A3B' },
  badgeSelText: { color: '#fff' },
  warnBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(249,189,72,.1)',
    borderWidth: 1,
    borderColor: 'rgba(249,189,72,.3)',
  },
  warnText: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 18, color: '#F9BD48' },
  demoNote: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 18, color: 'rgba(255,255,255,.55)' },
  phases: { flexDirection: 'row', gap: 6 },
  phSeg: { flex: 1, height: 4, borderRadius: 100 },
  imgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imgCell: { width: '48%', backgroundColor: '#fff', borderRadius: 18, padding: 10, gap: 10, borderWidth: 1, borderColor: '#EFE3EC', overflow: 'hidden' },
  imgLocked: { borderStyle: 'dashed', borderColor: '#DFD6DD', backgroundColor: '#FAF7FA' },
  imgSel: { borderColor: '#2E1A3B', borderWidth: 2 },
  img: { width: '100%', height: 104, borderRadius: 13, backgroundColor: '#EFE8EE' },
  imgFoot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  imgFootLocked: { opacity: 0.55 },
  imgLabel: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: 12.5, lineHeight: 17, color: '#111827' },
  imgLabelLocked: { color: '#473D45' },
  rail: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  railDot: { flex: 1, height: 4, borderRadius: 100 },
  doneKicker: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.45)',
    textAlign: 'center',
  },
  handBody: { fontFamily: FontFamily.sansMedium, fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,.55)' },
  handCount: { fontFamily: FontFamily.sansBold, fontSize: 28, lineHeight: 32, color: '#F9BD48', fontVariant: ['tabular-nums'] },
  handCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  handText: { flex: 1, gap: 3 },
  handKicker: { fontFamily: FontFamily.sansBold, fontSize: 9.5, letterSpacing: 0.9, color: '#F0C98A' },
  handName: { fontFamily: FontFamily.sansBold, fontSize: 16, lineHeight: 21, color: '#fff' },
  handSub: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,.5)' },
  nextBtn: { flex: 1, height: 52, borderRadius: 100, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  nextLabel: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#1E1226' },
  doneBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },

  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  waveBars: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 36 },
  waveBar: { flex: 1, borderRadius: 2 },
  waveTime: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#2E1A3B', fontVariant: ['tabular-nums'] },
  ecoute: { fontFamily: FontFamily.sans, fontSize: 11, color: '#6E5F78' },
  footBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 46,
    paddingHorizontal: 20,
    zIndex: 7,
  },
  stripWrap: { alignItems: 'center' },
  stripText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: '#5E4E69',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,.78)',
    borderWidth: 1,
    borderColor: '#E8DFE6',
    overflow: 'hidden',
  },
  stripUrgent: { backgroundColor: '#FEF2F2', borderColor: '#FBD5D5', color: '#B91C1C' },
  progress: { paddingHorizontal: 20, paddingTop: 2, gap: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressGroup: { fontFamily: FontFamily.sansBold, fontSize: 11, color: '#2E1A3B' },
  progressLink: { borderBottomWidth: 1, borderBottomColor: '#857789', paddingBottom: 3 },
  passDiv: { height: 1, backgroundColor: '#EFE3EC' },
  textBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    overflow: 'hidden',
  },
  textBarLabel: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 13 },
  textBarHint: { fontFamily: FontFamily.sans, fontSize: 11, color: '#857789' },
  rFootCol: { gap: 10 },
  skipPill: {
    alignSelf: 'center',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DBCED9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: { fontFamily: FontFamily.sansMedium, fontSize: 12, color: '#5E4E69' },
  rCtaRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  rBackBtn: {
    width: 52,
    height: 52,
    borderRadius: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rCta: {
    flex: 1,
    height: 52,
    borderRadius: 100,
    backgroundColor: '#2E1A3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  rCtaDisabled: { backgroundColor: '#E5E7EB' },
  rCtaLabel: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#fff' },
  rCtaLabelDisabled: { color: '#9CA3AF' },
  rCtaNote: { fontFamily: FontFamily.sansMedium, fontSize: 12.5, lineHeight: 17, color: '#6E5F78', textAlign: 'center' },
  sheetWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 20, justifyContent: 'flex-end' },
  sheetBgTap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  sheet: { gap: 16, paddingVertical: 14, paddingHorizontal: 20, paddingBottom: 26, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFDFB' },
  textSheet: { height: '78%', paddingTop: 14, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFDFB' },
  textHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F5EEF3' },
  textHeadText: { flex: 1, gap: 2 },
  textKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.8, color: '#857789' },
  textTitle: { fontFamily: FontFamily.serif, fontSize: 16, lineHeight: 21, color: '#111827' },
  textX: { width: 34, height: 34, borderRadius: 100, backgroundColor: '#F5EEF3', alignItems: 'center', justifyContent: 'center' },
  textScroll: { flex: 1 },
  textBody: { gap: 16, paddingVertical: 18, paddingHorizontal: 20, paddingBottom: 28 },
  navHead: { gap: 6 },
  navLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingTop: 2 },
  navLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navDot: { width: 14, height: 14, borderRadius: 5, borderWidth: 1 },
  navLegendLabel: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: '#6E5F78' },
  navBtns: { gap: 10, paddingTop: 2 },
  grab: { width: 38, height: 4, borderRadius: 100, alignSelf: 'center', backgroundColor: '#E8DFE6' },
  sheetTitle: { fontFamily: FontFamily.sansBold, fontSize: 19, lineHeight: 25, letterSpacing: -0.4, color: '#111827' },
  sheetBody: { fontFamily: FontFamily.sans, fontSize: 12.5, lineHeight: 18, color: '#5E4E69' },
  sheetPara: { fontFamily: FontFamily.serif, fontSize: 16.5, lineHeight: 27, color: '#1F2937' },
  sheetPrimary: { height: 52, borderRadius: 100, backgroundColor: '#6A2A5F', alignItems: 'center', justifyContent: 'center' },
  sheetPrimaryLabel: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#fff' },
  sheetPrimaryNavy: { height: 52, borderRadius: 100, backgroundColor: '#2E1A3B', alignItems: 'center', justifyContent: 'center' },
  sheetClose: { height: 44, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  sheetCloseLabel: { fontFamily: FontFamily.sansMedium, fontSize: 14, color: '#5E4E69' },
  rRulesKicker: { fontFamily: FontFamily.sansBold, fontSize: 9.5, letterSpacing: 0.9, color: '#7FD6CE' },
  passTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passPill: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: '#EAF7F5',
    color: '#0F6B65',
    overflow: 'hidden',
  },
  passWords: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: '#857789' },
  passTitle: { fontFamily: FontFamily.serif, fontSize: 23, lineHeight: 30, letterSpacing: -0.2, color: '#111827' },
  passPara: { fontFamily: FontFamily.serif, fontSize: 16.5, lineHeight: 27, color: '#1F2937' },
  bCheckWrap: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: '#EAF7F5',
    borderWidth: 2,
    borderColor: '#1A9E94',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { width: 36, height: 36 },
  checkBar: { position: 'absolute', height: 5, borderRadius: 3 },
  checkShort: { width: 13, left: 5, top: 19, transform: [{ rotate: '45deg' }] },
  checkLong: { width: 25, left: 11, top: 13, transform: [{ rotate: '-45deg' }] },
  bTitle: { fontFamily: FontFamily.sansBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: '#111827', textAlign: 'center' },
  bBody: { fontFamily: FontFamily.sansMedium, fontSize: 15, lineHeight: 22, color: '#5E4E69', textAlign: 'center' },
  bStats: { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 4, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFE3EC' },
  bStat: { flex: 1, alignItems: 'center', gap: 2 },
  bStatVal: { fontFamily: FontFamily.sansBold, fontSize: 22, lineHeight: 26, color: '#111827', fontVariant: ['tabular-nums'] },
  bStatCap: { fontFamily: FontFamily.sansBold, fontSize: 9.5, letterSpacing: 0.7, color: '#857789' },
  bStatDiv: { width: 1, backgroundColor: '#F5EEF3' },
  passSource: { fontFamily: FontFamily.sansMedium, fontSize: 11.5, letterSpacing: 0.2, color: '#857789' },
  graphTag: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: '#FFFBEB',
    color: '#966010',
    borderWidth: 1,
    borderColor: '#EDD99A',
    overflow: 'hidden',
  },
  chartQuestion: { fontFamily: FontFamily.sansBold, fontSize: 19, lineHeight: 25, letterSpacing: -0.3, color: '#111827' },
  gapBox: { gap: 8, padding: 16, borderRadius: 20, backgroundColor: '#FBF7FA', borderWidth: 1, borderColor: '#EFE3EC' },
  gapKicker: { fontFamily: FontFamily.sansBold, fontSize: 9.5, letterSpacing: 0.8, color: '#857789' },
  gapSentence: { fontFamily: FontFamily.serif, fontSize: 16, lineHeight: 26, color: '#1F2937' },
  gapSlot: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '600',
    color: '#0F6B65',
    borderBottomWidth: 2,
    borderBottomColor: '#1A9E94',
  },
  gapOptText: { fontFamily: FontFamily.sansMedium, fontSize: 15, lineHeight: 20 },
  rOptText: { fontSize: 14.5 },
  chartCard: { gap: 12, paddingVertical: 16, paddingHorizontal: 15, paddingBottom: 14, borderRadius: 20, backgroundColor: '#FBF7FA', borderWidth: 1, borderColor: '#EFE3EC' },
  chartLabel: { fontFamily: FontFamily.sansBold, fontSize: 9.5, letterSpacing: 0.8, color: '#857789' },
  chartTitle: { fontFamily: FontFamily.serif, fontSize: 15.5, lineHeight: 21, color: '#111827' },
  chartSource: { fontFamily: FontFamily.sans, fontSize: 11, lineHeight: 15, color: '#857789' },
  chartVals: { flexDirection: 'row' },
  chartVal: { flex: 1, textAlign: 'center', fontFamily: FontFamily.sansMedium, fontSize: 10, color: '#0F6B65' },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: CHART_BAR_H, borderBottomWidth: 1, borderBottomColor: '#E8DFE6' },
  chartBar: { flex: 1, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  chartRule: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderTopColor: '#C4B3C1', borderStyle: 'dashed' },
  chartRuleLabel: { position: 'absolute', left: 0, fontFamily: FontFamily.sansMedium, fontSize: 9.5, color: '#9C8F9A' },
  chartTicks: { flexDirection: 'row' },
  chartTick: { flex: 1, textAlign: 'center', fontFamily: FontFamily.sansMedium, fontSize: 9.5, color: '#9C8F9A' },
  rTimer: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: '#F5EEF3',
    borderWidth: 1,
    borderColor: '#E8DFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rTimerUrgent: { backgroundColor: '#FEF2F2', borderColor: '#FBD5D5' },
  rTimerText: { fontFamily: FontFamily.sansBold, fontSize: 12.5, color: '#374151', fontVariant: ['tabular-nums'] },
  rTimerUrgentText: { color: '#B91C1C' },

  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  navCell: { flex: 1, minWidth: 44, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  navDone: { backgroundColor: '#F5EEF3', borderWidth: 1, borderColor: '#EFE3EC' },
  navTodo: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8DFE6' },
  navNum: { fontFamily: FontFamily.sansBold, fontSize: 11, fontVariant: ['tabular-nums'] },
  track: { height: 5, borderRadius: 100, backgroundColor: '#EFE3EC', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 100 },
  progressLabel: { fontFamily: FontFamily.sansMedium, fontSize: 10, letterSpacing: 0.3, color: '#857789' },
  darkFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#1E1226', zIndex: 0 },
  chromeTitleDark: { color: 'rgba(255,255,255,.85)' },
  consignesHead: { gap: 8, marginTop: 8 },
  consignesKicker: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.45)',
  },
  consignesTitle: { fontFamily: FontFamily.sansBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: '#fff' },
  consignesSub: { fontFamily: FontFamily.sansMedium, fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,.6)' },
  rulesCard: {
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  rulesKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: '#8FB2F0' },
  ruleRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  ruleNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' },
  ruleNumText: { fontFamily: FontFamily.sansBold, fontSize: 11, color: '#fff' },
  ruleText: { flex: 1, fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,.86)' },
  modeNote: { fontFamily: FontFamily.sansMedium, fontSize: 12, lineHeight: 18, color: '#F9BD48' },
  startPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 100,
    backgroundColor: Brand.plum,
  },
  startLabel: { fontFamily: FontFamily.sansMedium, fontSize: 15, color: '#fff' },
  docTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listenChip: { fontFamily: FontFamily.sansMedium, fontSize: 11, color: '#2952A3' },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  play: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderLeftColor: '#fff',
    borderTopWidth: 11,
    borderTopColor: 'transparent',
    borderBottomWidth: 11,
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  pause: { flexDirection: 'row', gap: 5 },
  pauseBar: { width: 5, height: 18, borderRadius: 2, backgroundColor: '#fff' },
  optRight: { borderColor: '#8FD3CD', borderWidth: 2, backgroundColor: '#F0FDF4' },
  optWrong: { borderColor: '#FBD5D5', borderWidth: 2, backgroundColor: '#FEF2F2' },
  badgeRight: { backgroundColor: '#DCFCE7' },
  badgeRightText: { color: '#15803D' },
  badgeWrong: { backgroundColor: '#FEE2E2' },
  badgeWrongText: { color: '#B91C1C' },
  verdict: { gap: 10, padding: 16, borderRadius: 20, borderWidth: 1 },
  verdictRight: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  verdictWrong: { backgroundColor: '#FEF2F2', borderColor: '#FBD5D5' },
  verdictTitle: { fontFamily: FontFamily.sansBold, fontSize: 13, lineHeight: 18 },
  verdictBody: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 18, color: '#374151' },
  verdictDiv: { height: 1, backgroundColor: 'rgba(0,0,0,.07)' },
  transRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  transChip: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 0.5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,.06)',
    color: '#5E4E69',
  },
  transQuote: { flex: 1, fontFamily: FontFamily.sans, fontSize: 12, fontStyle: 'italic', lineHeight: 18, color: '#5E4E69' },

  doneTitle: { fontFamily: FontFamily.sansBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: '#fff', textAlign: 'center' },

  // Writing mock (WritingTest.dc.html): field, accents, word meter, review,
  // submit recap and the dark "with the AI" pending screen.
  consigneNote: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 18, color: 'rgba(255,255,255,.62)' },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  wordChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 100,
    justifyContent: 'center',
    backgroundColor: '#F5EEF3',
    borderWidth: 1,
    borderColor: '#EFE3EC',
    flexShrink: 0,
  },
  wordChipText: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#2E1A3B', fontVariant: ['tabular-nums'] },
  lowBanner: { padding: 12, borderRadius: 14, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  lowBannerText: { fontFamily: FontFamily.sansBold, fontSize: 12, lineHeight: 18, color: '#92400E' },
  wTitle: { fontFamily: FontFamily.sansBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, color: '#111827' },
  wConsigneCard: { gap: 9, padding: 16, borderRadius: 20, backgroundColor: '#FBF7FA', borderWidth: 1, borderColor: '#EFE3EC' },
  wConsigneHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wConsigneKicker: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: '#857789' },
  wToggle: { fontFamily: FontFamily.sansBold, fontSize: 11, color: '#966010' },
  wConsigneText: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 20, color: '#2E1A3B' },
  wDocOpen: { gap: 7, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#EFE3EC' },
  wDocKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: '#857789' },
  wDocText: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 20, color: '#4B5563' },
  wordBlock: { gap: 9 },
  accentBox: {
    gap: 5,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8DFE6',
  },
  accentCaption: { fontFamily: FontFamily.sans, fontSize: 11, color: '#A2919F' },
  kbRow: { alignItems: 'flex-end', paddingTop: 8 },
  kbLabel: { fontFamily: FontFamily.sansMedium, fontSize: 13, color: '#7A4E0C' },
  editor: {
    minHeight: 180,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE3EC',
    fontFamily: FontFamily.sans,
    fontSize: 15,
    lineHeight: 23,
    color: '#111827',
  },
  accentRow: { gap: 8, paddingVertical: 4 },
  accentKey: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF7FA',
    borderWidth: 1,
    borderColor: '#EFE3EC',
  },
  accentLabel: { fontFamily: FontFamily.sansBold, fontSize: 14, color: '#5E4E69' },
  wordRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  wordCount: { fontFamily: FontFamily.sansBold, fontSize: 19, lineHeight: 24, fontVariant: ['tabular-nums'] },
  wordNote: { flex: 1, fontFamily: FontFamily.sans, fontSize: 12, color: '#5E4E69' },
  saveChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexShrink: 0,
  },
  saveLabel: { fontFamily: FontFamily.sansBold, fontSize: 11, color: '#15803D' },
  wordTrack: { height: 6, borderRadius: 100, backgroundColor: '#F3EDF2', overflow: 'hidden' },
  wordFill: { height: '100%', borderRadius: 100 },
  reviewHead: { gap: 10 },
  reviewPills: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  kickerPill: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#FDF3E3',
    color: '#7A4E0C',
    borderWidth: 1,
    borderColor: '#F0DCB4',
  },
  savedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  mcheck: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  mcheckBar: { position: 'absolute', height: 2, borderRadius: 1, backgroundColor: '#15803D' },
  mcheckShort: { width: 5, left: 1, top: 6, transform: [{ rotate: '45deg' }] },
  mcheckLong: { width: 9, left: 3, top: 4, transform: [{ rotate: '-45deg' }] },
  savedLabel: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.8, color: '#15803D' },
  reviewRows: { paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FBF7FA', borderWidth: 1, borderColor: '#EFE3EC' },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EEF3',
  },
  reviewRowLast: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 11 },
  reviewLabel: { flex: 1, fontFamily: FontFamily.sans, fontSize: 13, color: '#5E4E69' },
  reviewValue: { fontFamily: FontFamily.sansBold, fontSize: 13, fontVariant: ['tabular-nums'] },
  reviewKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: '#857789' },
  reviewBox: { gap: 10, padding: 18, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8DFE6' },
  reviewText: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 21, color: '#111827' },
  reviewNote: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 19, color: '#5E4E69' },
  editBtn: {
    paddingVertical: 13,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: '#FDF3E3',
    borderWidth: 1,
    borderColor: '#F0DCB4',
  },
  editLabel: { fontFamily: FontFamily.sansBold, fontSize: 14, color: '#7A4E0C' },
  submitHead: { gap: 8 },
  submitSub: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 20, color: '#5E4E69' },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8DFE6',
  },
  fileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF3E3',
    flexShrink: 0,
  },
  submitInfo: { flex: 1, gap: 3 },
  submitName: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#111827' },
  submitMeta: { fontFamily: FontFamily.sans, fontSize: 12, color: '#5E4E69' },
  submitWords: { fontFamily: FontFamily.sansBold, fontSize: 13, fontVariant: ['tabular-nums'], flexShrink: 0 },
  aiBox: { gap: 9, padding: 16, borderRadius: 20, backgroundColor: '#FEFAF1', borderWidth: 1, borderColor: '#F3E6C8' },
  aiBoxHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiBoxTitle: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 13, lineHeight: 17, color: '#8A5B10' },
  aiBoxBody: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 18, color: '#5E4E69' },
  critChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 2 },
  critChip: {
    fontFamily: FontFamily.sansBold,
    fontSize: 11,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#fff',
    color: '#8A5B10',
    borderWidth: 1,
    borderColor: '#F3E6C8',
  },
  aiWrap: { alignItems: 'center', gap: 10, paddingTop: 24 },
  aiOrbit: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSpin: { position: 'absolute', left: 0, top: 0 },
  aiCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1226',
  },
  aiLabel: { fontFamily: FontFamily.sansBold, fontSize: 11, letterSpacing: 1.2, color: Brand.gold },
  aiTitle: { fontFamily: FontFamily.sansBold, fontSize: 20, lineHeight: 26, color: '#fff', textAlign: 'center' },
  aiSub: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,.72)', textAlign: 'center' },
  pendRows: {
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  pendRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.08)' },
  pendRowLast: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12 },
  pendLabel: { fontFamily: FontFamily.sans, fontSize: 13, color: 'rgba(255,255,255,.6)' },
  pendValue: { fontFamily: FontFamily.sansBold, fontSize: 13, color: '#fff', textAlign: 'right', flexShrink: 1 },

  // Speaking stub mock (SpeakingTest.dc.html): dark intro/record, light
  // prep/review/submit, simulated take with live examiner cues.
  recDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 32,
    paddingLeft: 10,
    paddingRight: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.16)',
    flexShrink: 0,
  },
  recDotInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#F87171' },
  recDotLabel: { fontFamily: FontFamily.sansBold, fontSize: 12, letterSpacing: 0.4, color: '#fff' },
  ctaSquare: { width: 14, height: 14, borderRadius: 3, backgroundColor: '#fff' },
  spHead: { gap: 8 },
  spKicker: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.45)',
  },
  spTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: '#fff',
  },
  spShort: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 21, color: 'rgba(255,255,255,.8)' },
  spCard: {
    gap: 10,
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  spCardKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: '#C0A6F5' },
  spCardText: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 23, color: '#fff' },
  spDocKicker: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: 'rgba(255,255,255,.45)' },
  spDocText: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,.82)' },
  spMeta: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  spMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,.08)',
  },
  spMetaRowLast: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  spMetaLabel: { flex: 1, fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 17, color: 'rgba(255,255,255,.6)' },
  spMetaValue: { fontFamily: FontFamily.sansBold, fontSize: 13, lineHeight: 18, color: '#fff', textAlign: 'right', flexShrink: 1 },
  prepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#F3EEFC',
    borderWidth: 1,
    borderColor: '#DCCCF7',
  },
  prepRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#8B62E0',
    flexShrink: 0,
  },
  prepClock: { fontFamily: FontFamily.sansBold, fontSize: 18, lineHeight: 20, color: '#5535A8', fontVariant: ['tabular-nums'] },
  prepRest: { fontFamily: FontFamily.sansBold, fontSize: 8, letterSpacing: 0.7, color: '#8B62E0' },
  prepHead: { flex: 1, gap: 4 },
  prepName: { fontFamily: FontFamily.sansBold, fontSize: 15, lineHeight: 20, color: '#3D1F73' },
  prepNote: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 18, color: '#5E4E69' },
  prepConsigne: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 23, color: '#374151' },
  turnCard: { gap: 6, padding: 16, borderRadius: 20, borderWidth: 1 },
  turnCardYou: { backgroundColor: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)' },
  turnCardEx: { backgroundColor: 'rgba(139,98,224,.16)', borderColor: 'rgba(220,204,247,.4)' },
  turnHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  turnKicker: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 0.9, color: '#fff' },
  turnNext: { fontFamily: FontFamily.sans, fontSize: 11, color: 'rgba(255,255,255,.5)', fontVariant: ['tabular-nums'] },
  turnText: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 21, color: '#fff' },
  recCard: {
    gap: 16,
    padding: 22,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
    alignItems: 'center',
  },
  recClock: { fontFamily: FontFamily.sansBold, fontSize: 44, lineHeight: 48, color: '#fff', fontVariant: ['tabular-nums'] },
  recState: { fontFamily: FontFamily.sansBold, fontSize: 11, letterSpacing: 0.5, color: '#C0A6F5' },
  recMeta: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  recLeft: { fontFamily: FontFamily.sans, fontSize: 11, color: 'rgba(255,255,255,.45)', fontVariant: ['tabular-nums'] },
  stopWrap: { alignItems: 'center', gap: 12, paddingTop: 6 },
  stopBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stopBtnOff: { opacity: 0.4 },
  stopSquare: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#DC2626' },
  recHint: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: 'rgba(255,255,255,.55)',
    maxWidth: 270,
  },
  stubNote: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 17, textAlign: 'center', color: 'rgba(255,255,255,.4)' },
  sKickerPill: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    letterSpacing: 0.4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#F3EEFC',
    color: '#5535A8',
  },
});
