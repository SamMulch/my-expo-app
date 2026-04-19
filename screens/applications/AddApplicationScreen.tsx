import { StyleSheet, Text, View } from 'react-native';

export default function AddApplicationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Application</Text>
      <Text>This is the add application screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
});