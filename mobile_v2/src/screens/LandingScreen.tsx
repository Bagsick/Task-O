import { LinearGradient } from 'expo-linear-gradient'
import { Link, Redirect } from 'expo-router'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import { useSession } from '../context/SessionContext'

export default function LandingScreen() {
  const { session } = useSession()

  if (session) {
    return <Redirect href="/(tabs)/dashboard" />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0a1a2b', '#0f3557', '#145f8d']} style={styles.bg}>
        <View style={styles.heroCard}>
          <Text style={styles.brand}>Task-O</Text>
          <Text style={styles.title}>Focus better. Ship faster.</Text>
          <Text style={styles.subtitle}>
            Plan projects, track tasks, and move your whole team from idea to done.
          </Text>
        </View>

        <View style={styles.actionWrap}>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Sign In</Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1a2b',
  },
  bg: {
    flex: 1,
    padding: 22,
    justifyContent: 'space-between',
  },
  heroCard: {
    marginTop: 52,
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  brand: {
    color: '#7ad0ff',
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    color: '#d8edff',
    fontSize: 15,
    lineHeight: 22,
  },
  actionWrap: {
    gap: 10,
    paddingBottom: 20,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  primaryText: {
    color: '#0f3557',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  secondaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
})
