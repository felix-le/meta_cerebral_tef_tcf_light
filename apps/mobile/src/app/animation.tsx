import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Brand } from '@/constants/theme';

const EXIT_MS = 2000;

function Ripple({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 700, delay, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [delay, v]);
  return (
    <Animated.View
      style={[
        styles.ring,
        {
          opacity: v.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.25, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
        },
      ]}
    />
  );
}

export default function Animation() {
  const exited = useRef(false);
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const goEntry = () => {
    if (exited.current) {
      return;
    }
    exited.current = true;
    router.replace('/entry');
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, delay: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 600, delay: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
    Animated.timing(screenOpacity, { toValue: 0, duration: 300, delay: 1700, easing: Easing.linear, useNativeDriver: true }).start();
    const t = setTimeout(goEntry, EXIT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.fill, { opacity: screenOpacity }]}>
        <Pressable style={styles.fill} onPress={goEntry}>
          <Image source={require('../../assets/brand/bg-gradient.png')} style={styles.bg} resizeMode="stretch" />
          <Image source={require('../../assets/brand/blob-gold.png')} style={styles.goldBlob} resizeMode="stretch" />
          <Image source={require('../../assets/brand/blob-plum.png')} style={styles.plumBlob} resizeMode="stretch" />
          <View style={styles.center}>
            <View style={styles.logoWrap}>
              <Ripple delay={650} />
              <Ripple delay={800} />
              <Ripple delay={950} />
              <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
                <Image source={require('../../assets/brand/prepa-logo.png')} style={styles.logo} accessibilityLabel="Prépa TEF TCF" />
              </Animated.View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  fill: { flex: 1 },
  bg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%', zIndex: 0 },
  goldBlob: { position: 'absolute', left: -136, top: -178, width: 392, height: 418, opacity: 0.15, zIndex: 0 },
  plumBlob: { position: 'absolute', right: -38, top: 511, width: 196, height: 426, opacity: 0.15, zIndex: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  logoWrap: { width: 280, height: 200, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 236, height: 112 },
  ring: { position: 'absolute', left: 20, top: -20, width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: Brand.plum },
});
