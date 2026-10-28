import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand, FontFamily } from '@/constants/theme';

export default function Entry() {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F8F3F7', '#FFFFFF']} style={styles.bg} />
      <Image source={require('../../assets/brand/blob-gold.png')} style={styles.goldBlob} resizeMode="stretch" />
      <Image source={require('../../assets/brand/blob-plum.png')} style={styles.plumBlob} resizeMode="stretch" />
      <View style={styles.body}>
        <View style={styles.markRing}>
          <View style={styles.markInner}>
            <Image source={require('../../assets/brand/prepa-mark.png')} style={styles.mark} />
          </View>
        </View>
        <Text style={styles.title}>Practise for TEF and TCF Canada</Text>
        <Text style={styles.sub}>Speak, write and get AI feedback. Free, no account needed.</Text>
      </View>
      <View style={styles.sheet}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.96)', '#FFFFFF']}
          locations={[0, 0.42, 0.78, 1]}
          style={styles.sheetBg}
        />
        <Pressable style={styles.button} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Start practising</Text>
        </Pressable>
        <Text style={styles.caption}>Your answers stay on this device. Nothing to sign up for.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.mist },
  bg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 0 },
  goldBlob: { position: 'absolute', left: -136, top: -178, width: 392, height: 418, opacity: 0.15, zIndex: 0 },
  plumBlob: { position: 'absolute', right: -38, top: 511, width: 196, height: 426, opacity: 0.15, zIndex: 0 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 200, zIndex: 1 },
  markRing: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 8,
  },
  markInner: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.3)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: 120, height: 120 },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    textAlign: 'center',
    color: '#000000',
  },
  sub: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 24, textAlign: 'center', color: '#374151', marginTop: 12 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24, gap: 8, zIndex: 1 },
  sheetBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  button: { height: 52, borderRadius: 100, backgroundColor: Brand.plum, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  caption: { fontSize: 12.5, fontWeight: '500', lineHeight: 18, textAlign: 'center', color: '#6B7280', paddingTop: 4 },
});
