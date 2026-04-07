import { Ionicons } from '@expo/vector-icons'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { StatCard } from '../components/StatCard'
import { supabase } from '../lib/supabase'
import { NotificationItem, TaskItem } from '../types'
import { palette } from '../theme'

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [fullName, setFullName] = useState<string>('')

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setTasks([])
      setNotifications([])
      setFullName('')
      setLoading(false)
      return
    }

    const [{ data: taskRows }, { data: notificationRows }] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    setTasks((taskRows || []) as TaskItem[])
    setNotifications((notificationRows || []) as NotificationItem[])
    setFullName(profile?.full_name || user.email?.split('@')[0] || 'Team member')
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length
    const assigned = tasks.filter(t => t.status !== 'completed' && t.assigned_to).length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const scheduled = tasks.filter(t => t.due_date && t.status !== 'completed').length
    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
    return { completed, assigned, inProgress, scheduled, overdue }
  }, [tasks])

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true)
              await load()
              setRefreshing(false)
            }}
          />
        }
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.heroLabel}>Workspace</Text>
            <Text style={styles.heroTitle}>Hello, {fullName}</Text>
            <Text style={styles.heroSub}>Here is your latest progress snapshot.</Text>
          </View>
          <View style={styles.scoreWrap}>
            <Text style={styles.scoreNumber}>{Math.max(0, 100 - stats.overdue * 5)}%</Text>
            <Text style={styles.scoreLabel}>Health</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <StatCard
            label="Completed Tasks"
            value={String(stats.completed)}
            color={palette.blueA}
            icon={<Ionicons name="checkmark-done-outline" size={24} color={palette.blueA} />}
          />
          <StatCard
            label="Assigned Tasks"
            value={String(stats.assigned)}
            color={palette.blueB}
            icon={<Ionicons name="person-outline" size={24} color={palette.blueB} />}
          />
          <StatCard
            label="In Progress"
            value={String(stats.inProgress)}
            color={palette.blueC}
            icon={<Ionicons name="albums-outline" size={24} color={palette.blueC} />}
          />
          <StatCard
            label="Scheduled"
            value={String(stats.scheduled)}
            color={palette.blueD}
            icon={<Ionicons name="calendar-outline" size={24} color={palette.blueD} />}
          />
        </View>

        <View style={styles.quickRow}>
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>Overdue</Text>
            <Text style={styles.quickValueDanger}>{stats.overdue}</Text>
          </View>
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>Total Active</Text>
            <Text style={styles.quickValue}>{stats.assigned + stats.inProgress}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Latest Announcements</Text>
          {notifications.length === 0 ? (
            <Text style={styles.muted}>No notifications yet.</Text>
          ) : (
            notifications.map(item => (
              <View key={item.id} style={styles.listItem}>
                <Text style={styles.itemTitle}>{item.message}</Text>
                <Text style={styles.itemMeta}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>
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
    paddingBottom: 114,
    gap: 14,
  },
  hero: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#0f3557',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2f648e',
  },
  heroLabel: {
    color: '#9fd6ff',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 11,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 3,
  },
  heroSub: {
    color: '#d8ecff',
    marginTop: 4,
    fontSize: 13,
  },
  scoreWrap: {
    width: 74,
    height: 74,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontWeight: '800',
    color: '#0f3557',
    fontSize: 18,
  },
  scoreLabel: {
    color: '#5a7b95',
    fontSize: 10,
    fontWeight: '700',
  },
  grid: {
    gap: 10,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7e5f0',
  },
  quickTitle: {
    color: '#4e6881',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickValue: {
    marginTop: 6,
    color: '#0f3557',
    fontSize: 28,
    fontWeight: '800',
  },
  quickValueDanger: {
    marginTop: 6,
    color: '#b91c1c',
    fontSize: 28,
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: palette.text,
  },
  listItem: {
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7ecf4',
  },
  itemTitle: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 14,
  },
  itemMeta: {
    marginTop: 3,
    color: palette.muted,
    fontSize: 12,
  },
  muted: {
    color: palette.muted,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
  },
})
