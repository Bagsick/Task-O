import { Redirect } from 'expo-router'

import { useSession } from '@/src/context/SessionContext'
import LoadingScreen from '@/src/screens/LoadingScreen'

export default function IndexScreen() {
  const { session, loading } = useSession()

  if (loading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Redirect href="/landing" />
  }

  return <Redirect href="/(tabs)/dashboard" />
}
