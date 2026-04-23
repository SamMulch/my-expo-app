import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { setCurrentUserId } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// register screen - creates new user account and logs them in
export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // validate input, check username is unique, insert user, log in
  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter both username and password');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Password too short', 'Must be at least 4 characters');
      return;
    }

    // check username not already taken
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()));

    if (existing.length > 0) {
      Alert.alert('Username taken', 'Please choose another username');
      return;
    }

    // insert new user record
    const now = new Date().toISOString();
    await db.insert(usersTable).values({
      username: username.trim(),
      password,
      createdAt: now,
    });

    // fetch back inserted user to get generated id, then log in
    const created = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()));

    await setCurrentUserId(created[0].id);
    router.replace('/(tabs)/applications');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start tracking your applications today</Text>

        <TextInput
          accessibilityLabel="Username"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          accessibilityLabel="Password"
          placeholder="Password (min 4 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          accessibilityLabel="Register"
          accessibilityRole="button"
          onPress={handleRegister}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Register</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Back to login"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Back to Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 15,
    marginBottom: 32,
    marginTop: 6,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ddd',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});