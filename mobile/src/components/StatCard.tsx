import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type StatCardProps = {
  label: string
  value: string
  color: string
  icon: ReactNode
}

export function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}> 
      <View style={styles.topRow}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.labelBox}>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  value: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
  },
  labelBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
})