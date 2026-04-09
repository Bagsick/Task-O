import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Link, Redirect } from 'expo-router'

import { useSession } from '../context/SessionContext'
import { devError, devLog } from '../lib/devLog'
import { signInWithGoogleInApp } from '../lib/googleAuth'
import { supabase } from '../lib/supabase'

export default function LoginScreen() {
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (session) {
    return <Redirect href="/(tabs)/dashboard" />
  }

  async function onSignIn() {
    if (!email || !password) {
      Alert.alert('Missing details', 'Please enter both email and password.')
      return
    }

    setLoading(true)
    devLog('login', 'email sign-in requested', { email })
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      devError('login', 'email sign-in failed', error)
      Alert.alert('Auth failed', error.message)
    } else {
      devLog('login', 'email sign-in succeeded')
    }

    setLoading(false)
  }

  async function onGoogle() {
    try {
      setGoogleLoading(true)
      devLog('login', 'google sign-in requested')
      await signInWithGoogleInApp()
      devLog('login', 'google sign-in completed')
    } catch (error: any) {
      devError('login', 'google sign-in failed', error)
      Alert.alert('Google auth failed', error?.message || 'Unable to authenticate with Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.brand}>Task-O</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue managing your projects.</Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9eb2c8"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#9eb2c8"
          />

          <Pressable disabled={loading} style={styles.submitBtn} onPress={onSignIn}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable disabled={googleLoading} style={styles.googleBtn} onPress={onGoogle}>
            {googleLoading ? <ActivityIndicator color="#0f3557" /> : <Text style={styles.googleText}>Continue with Google</Text>}
          </Pressable>

          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.linkText}>No account yet? Create one</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1a2b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 20,
  },
  headerCard: {
    borderRadius: 30,
    padding: 24,
    backgroundColor: '#12314f',
    borderWidth: 1,
    borderColor: '#2e5b82',
  },
  brand: {
    color: '#99dbff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    color: '#d8ecff',
    fontSize: 14,
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2e5b82',
    padding: 18,
    gap: 12,
    backgroundColor: '#0f243f',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2e5b82',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#ffffff',
    fontSize: 15,
    backgroundColor: '#153454',
  },
  submitBtn: {
    borderRadius: 12,
    backgroundColor: '#1a8ed2',
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
    fontSize: 12,
  },
  googleBtn: {
    borderRadius: 12,
    backgroundColor: '#e6f3fc',
    borderWidth: 1,
    borderColor: '#9fd0ee',
    paddingVertical: 13,
    alignItems: 'center',
  },
  googleText: {
    color: '#0f3557',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '800',
    fontSize: 12,
  },
  linkText: {
    color: '#9ddcff',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
})
