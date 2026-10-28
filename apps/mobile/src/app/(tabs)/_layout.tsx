import { Tabs } from 'expo-router';
import { Brand, FontFamily } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.plum,
        tabBarLabelStyle: { fontFamily: FontFamily.sansMedium, fontSize: 12 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="mock" options={{ title: 'Mock Test' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
    </Tabs>
  );
}
