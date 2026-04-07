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
import { supabase } from '../lib/supabase'

export default function RegisterScreen() {
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) {
    return <Redirect href="/(tabs)/dashboard" />
  }

  async function onRegister() {
    if (!email || !password) {
      Alert.alert('Missing details', 'Please enter both email and password.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      Alert.alert('Registration failed', error.message)
    } else {
      Alert.alert('Account created', 'Check your email if confirmation is enabled.')
    }

    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.kicker}>Create Account</Text>
        <Text style={styles.title}>Join Task-O</Text>

        <View style={styles.panel}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Work email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#577386"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Create password"
            secureTextEntry
            placeholderTextColor="#577386"
          />

          <Pressable disabled={loading} style={styles.primaryBtn} onPress={onRegister}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>Create Account</Text>}
          </Pressable>

          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
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
    backgroundColor: '#f5fbff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 4,
  },
  kicker: {
    color: '#0f3557',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 40,
    color: '#0f3557',
    fontWeight: '800',
    marginBottom: 18,
  },
  panel: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cae1ef',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cae1ef',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#0f172a',
    fontSize: 15,
  },
  primaryBtn: {
    borderRadius: 12,
    backgroundColor: '#0f3557',
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryText: {
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
    fontSize: 12,
  },
  linkText: {
    color: '#0f3557',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
})
