import { Tabs } from 'expo-router';
import LiquidGlassTabBar from '../../components/LiquidGlassTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="user" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
