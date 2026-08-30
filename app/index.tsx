import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignInCard } from '../components/SignInCard';
import { SystemColors } from '../constants/Colors';
import { useSession } from '../providers/SessionProvider';

export default function LandingScreen() {
  const router = useRouter();
  const { ready, isSignedIn } = useSession();

  useEffect(() => {
    if (ready && isSignedIn) router.replace('/(tabs)');
  }, [ready, isSignedIn, router]);

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <Text style={styles.title}>Litecast</Text>
        <Text style={styles.subtitle}>A beautiful yet simple Farcaster client</Text>
      </View>
      <SignInCard />
      <Text style={styles.guest} onPress={() => router.replace('/(tabs)')}>
        Continue as guest
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SystemColors.background },
  hero: { paddingTop: '18%', paddingHorizontal: '10%', paddingBottom: 8 },
  title: { fontSize: 40, fontWeight: '400', color: SystemColors.label, letterSpacing: -1 },
  subtitle: { fontSize: 18, color: SystemColors.label, marginTop: 6 },
  guest: {
    paddingHorizontal: '10%',
    paddingBottom: 32,
    color: SystemColors.secondaryLabel,
    fontSize: 15,
  },
});
