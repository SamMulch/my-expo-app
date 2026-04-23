import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { setCurrentUserId } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// login screen - checks username/password against users table
export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // look up user in db and validate password
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter both username and password');
      return;
    }

    const found = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username.trim()));

    if (found.length === 0 || found[0].password !== password) {
      Alert.alert('Login failed', 'Username or password is incorrect');
      return;
    }

    // save logged in user id and go to main app
    await setCurrentUserId(found[0].id);
    router.replace('/(tabs)/applications');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Job Tracker</Text>
        <Text style={styles.subtitle}>Log in to track your applications</Text>

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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          accessibilityLabel="Log in"
          accessibilityRole="button"
          onPress={handleLogin}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Log In</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Go to create account"
          accessibilityRole="button"
          onPress={() => router.push('/register')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
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