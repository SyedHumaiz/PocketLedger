import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PocketLedger</Text>
      <Text style={styles.subtitle}>Your offline-first finance workspace.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#172033',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: '#526075',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
