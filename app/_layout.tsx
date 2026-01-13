import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Slot } from 'expo-router';

function InitialLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (token) {
      // If user is signed in, redirect them to home if they are in auth group or at root
      if (inAuthGroup || segments.length === 0) {
        router.replace('/(home)');
      }
    } else {
      // If user is not signed in, redirect them to sign-in if they are not in auth group
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    }
  }, [token, segments, isLoading, rootNavigationState?.key]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

import { SocketProvider } from '../context/SocketContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <InitialLayout />
      </SocketProvider>
    </AuthProvider>
  );
}