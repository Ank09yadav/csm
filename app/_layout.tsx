import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo'
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router' // Added useRootNavigationState
import * as SecureStore from 'expo-secure-store'
import { useEffect } from 'react'

const tokenCache = {
  // ... existing tokenCache implementation ...
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key)
    } catch (err) {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return
    }
  },
}

const publishableKey = "pk_test_Z3Jvd2luZy1saW9uZmlzaC00MS5jbGVyay5hY2NvdW50cy5kZXYk"

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  )
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const segments = useSegments() as string[]
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()

  useEffect(() => {
    if (!isLoaded) return
    if (!rootNavigationState?.key) return // Wait for navigation to be ready

    const inAuthGroup = segments[0] === '(auth)'

    if (isSignedIn) {
      // If user is signed in, redirect them to home if they are in auth group or at root
      if (inAuthGroup || segments.length === 0) {
        router.replace('/(home)')
      }
    } else {
      // If user is not signed in, redirect them to sign-in if they are not in auth group
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in')
      }
    }
  }, [isSignedIn, segments, isLoaded, rootNavigationState?.key])

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  )
}