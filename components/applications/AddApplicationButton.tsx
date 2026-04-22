import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddApplicationButton() {
  const router = useRouter();
  return (
    <Pressable
      style={styles.fab}
      onPress={() => router.push('/add_application')}
      accessibilityLabel="Add application"
    >
      <Text style={styles.fabText}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 32,
  },
});