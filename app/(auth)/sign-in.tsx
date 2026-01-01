import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect } from 'react';
import { useSSO } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Alert, Platform, StyleSheet, Linking, Text, TouchableOpacity, View } from 'react-native';

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

//open term and condition 
const openConditionLink = async () => {
  const url = 'https://csmtermsandconditions.netlify.app/'
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert(`Don't know how to open url? ${url}`)
  }
}

// Handle any pending authentication sessions globally
WebBrowser.maybeCompleteAuthSession();

export default function SignInWithGoogle() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'csm',
        }),
      });

      // Successful Sign-In/Sign-Up via Google
      if (createdSessionId) {
        // Set the newly created session as the active session
        await setActive!({
          session: createdSessionId,
        });
        // Navigation is handled by the root layout listener in app/_layout.tsx
      }
      else if (signIn) {
        console.log("Sign-in requirements missing:", signIn.status);
      }
      else if (signUp) {
        console.log("Sign-up requirements missing:", signUp.status);
      }

    } catch (err) {
      console.error("Clerk SSO Error:", JSON.stringify(err, null, 2));
      Alert.alert(
        "Authentication Failed",
        "Could not complete sign-in. Please check your network or try again."
      );
    }
  }, [startSSOFlow]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to CSM</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={styles.baseText}>
          By signing in, you agree to our{' '}
          <Text style={styles.linkText} onPress={openConditionLink}>
            Terms and Conditions
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#357dc6ff',
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
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  baseText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#2e78b7',
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  },
});