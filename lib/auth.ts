import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'currentUserId';

// save logged in user id to device storage
export async function setCurrentUserId(id: number | null) {
  if (id === null) {
    await AsyncStorage.removeItem(KEY);
  } else {
    await AsyncStorage.setItem(KEY, String(id));
  }
}

// read logged in user id from device storage
export async function getCurrentUserId(): Promise<number | null> {
  const stored = await AsyncStorage.getItem(KEY);
  return stored ? Number(stored) : null;
}