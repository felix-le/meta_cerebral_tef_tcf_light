import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Brand, FontFamily } from '@/constants/theme';

const SPLASH_MS = 1800;

function PulseDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, opacity]);
  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/animation'), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <Pressable style={styles.root} onPress={() => router.replace('/animation')}>
      <Image source={require('../../assets/brand/bg-gradient.png')} style={styles.bg} resizeMode="stretch" />
      <Image source={require('../../assets/brand/blob-gold.png')} style={styles.goldBlob} resizeMode="stretch" />
      <Image source={require('../../assets/brand/blob-plum.png')} style={styles.plumBlob} resizeMode="stretch" />
      <View style={[styles.ring, { left: -28, top: -99 }]} />
      <View style={[styles.ring, { left: 170, top: -99 }]} />
      <View style={styles.center}>
        <Image
          source={require('../../assets/brand/prepa-logo.png')}
          style={styles.logo}
          accessibilityLabel="Prépa TEF TCF"
        />
        <Text style={styles.tagline}>Speaking and Writing practice for TEF and TCF Canada.</Text>
        <View style={styles.dots}>
          <PulseDot delay={0} />
          <PulseDot delay={200} />
          <PulseDot delay={400} />
        </View>
      </View>
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>Free · no account needed</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' },
  goldBlob: { position: 'absolute', left: -136, top: -178, width: 392, height: 418, opacity: 0.15 },
  plumBlob: { position: 'absolute', right: -38, top: 511, width: 196, height: 426, opacity: 0.15 },
  ring: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(249,189,72,.3)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  logo: { width: 236, height: 112, marginBottom: 20 },
  tagline: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 24, textAlign: 'center', color: '#374151' },
  dots: { flexDirection: 'row', gap: 6, paddingTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.plum },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 81,
    backgroundColor: 'rgba(255,255,255,.651)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: { fontSize: 12, fontWeight: '500', lineHeight: 18, letterSpacing: 0.3, color: '#9CA3AF' },
});
