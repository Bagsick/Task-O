import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { palette } from '../theme'

export default function LoadingScreen() {
  return (
    <View style={styles.wrap}>
      <View style={styles.mark}>
        <Text style={styles.markText}>Task-O</Text>
      </View>
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={styles.label}>Preparing your workspace...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f7fc',
    gap: 16,
  },
  mark: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#0f243f',
  },
  markText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  label: {
    color: '#37526f',
    fontWeight: '600',
  },
})
