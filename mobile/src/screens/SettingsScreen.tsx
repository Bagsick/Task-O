import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Redirect } from 'expo-router'

import { useSession } from '../context/SessionContext'
import { supabase } from '../lib/supabase'
import { palette } from '../theme'

type Profile = {
  full_name: string | null
  email: string | null
}

export default function SettingsScreen() {
  const { session } = useSession()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const userId = session?.user?.id
      if (!userId) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('users')
        .select('full_name,email')
        .eq('id', userId)
        .single()

      setProfile((data as Profile) || null)
      setLoading(false)
    }

    loadProfile()
  }, [session?.user?.id])

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage profile and account access.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{profile?.full_name || 'Not set'}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email || session.user.email || 'Not set'}</Text>
        </View>

        <Pressable
          style={styles.signOutBtn}
          onPress={async () => {
            const { error } = await supabase.auth.signOut()
            if (error) {
              Alert.alert('Unable to sign out', error.message)
            }
          }}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
    gap: 12,
  },
  title: {
    color: palette.text,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 16,
    gap: 7,
  },
  label: {
    color: '#335172',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  value: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
  signOutBtn: {
    borderRadius: 12,
    backgroundColor: '#bf1e2e',
    paddingVertical: 13,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ffffff',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
  },
})
