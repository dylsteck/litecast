import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SystemColors } from '../constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn’t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: SystemColors.background },
  title: { fontSize: 20, fontWeight: '600', color: SystemColors.label },
  link: { marginTop: 16, paddingVertical: 12 },
  linkText: { fontSize: 15, color: SystemColors.secondaryLabel },
});
