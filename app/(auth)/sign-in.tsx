import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect } from 'react';
// Assume you are using Expo Router for this to work
import { useSSO } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. Hook to warm up the browser for Android
export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Check for 'android' platform only for warmUp/coolDown
    if (Platform.OS !== 'android') return;

    // Warm up the browser on mount
    void WebBrowser.warmUpAsync();

    return () => {
      // Cleanup: cool down the browser on unmount
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions globally
WebBrowser.maybeCompleteAuthSession();

// Renamed from 'Page' to 'SignInWithGoogle' for clarity, but 'Page' is fine if you're using it in the file-based routing system.
export default function SignInWithGoogle() {
  useWarmUpBrowser();

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  // NOTE: This component MUST be wrapped inside a <ClerkProvider> for this hook to work.
  const { startSSOFlow } = useSSO();

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',

        // 🚨 BEST PRACTICE: Use a specific scheme for Native Apps
        // You MUST define a 'scheme' in your app.json (e.g., 'myapp') and use it here.
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'csm', // Matched with app.json
        }),
      });

      // 1. Successful Sign-In/Sign-Up via Google
      if (createdSessionId) {
        // Set the newly created session as the active session
        setActive!({
          session: createdSessionId,
          // Handle navigation after session is set
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Handle required tasks like MFA, verification, etc.
              console.log("Current Task Required:", session.currentTask);
              // Navigate user to a custom UI to resolve the task
              router.push('/(auth)/sign-in'); // Corrected path
              return;
            }

            // No tasks, user is fully authenticated, navigate to the main screen
            router.push('/');
          },
        });
      }

      // 2. Missing Requirements (e.g., MFA or Sign-Up)
      // If createdSessionId is null, Clerk returns the necessary objects (signIn or signUp)
      else if (signIn) {
        // Handle missing requirements for sign-in, such as requiring MFA
        console.log("Sign-in requirements missing:", signIn.status);
        // You would typically navigate to a screen to handle this, e.g., router.push('/mfa-screen');
      }

      else if (signUp) {
        // Handle sign-up flow, such as requiring a step like profile completion
        console.log("Sign-up requirements missing:", signUp.status);
        // You would typically navigate to a screen to handle this, e.g., router.push('/profile-setup-screen');
      }

    } catch (err) {
      // Log the full error for debugging and show a friendly message to the user
      console.error("Clerk SSO Error:", JSON.stringify(err, null, 2));

      // Provide user feedback
      Alert.alert(
        "Authentication Failed",
        "Could not complete sign-in. Please check your network or try again."
      );
    }
  }, [startSSOFlow]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2e78b7',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});