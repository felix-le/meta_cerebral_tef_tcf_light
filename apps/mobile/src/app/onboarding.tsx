import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Brand, FontFamily } from '@/constants/theme';

export default function Onboarding() {
  return (
    <View style={styles.root}>
      <Text style={styles.logo}>Prépa</Text>
      <Text style={styles.sub}>TEF · TCF</Text>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.body}>Practise TEF Canada speaking and writing with AI feedback.</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>Start practising</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.plum, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { fontFamily: FontFamily.serifItalic, fontSize: 56, color: Brand.paper },
  sub: { fontFamily: FontFamily.sansBold, fontSize: 16, color: Brand.gold, letterSpacing: 4, marginTop: 4 },
  title: { fontFamily: FontFamily.sansBold, fontSize: 28, color: Brand.paper, marginTop: 48 },
  body: { fontFamily: FontFamily.sans, fontSize: 16, color: Brand.paper, textAlign: 'center', marginTop: 12 },
  button: { backgroundColor: Brand.gold, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 32 },
  buttonText: { fontFamily: FontFamily.sansBold, fontSize: 17, color: Brand.ink },
});
