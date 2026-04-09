import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { supabase } from '../lib/supabase'
import { TaskItem } from '../types'
import { palette } from '../theme'

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadCalendarItems = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })

    setTasks((data || []) as TaskItem[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCalendarItems()
  }, [loadCalendarItems])

  const grouped = useMemo(() => {
    return tasks.reduce<Record<string, TaskItem[]>>((acc, task) => {
      const key = task.due_date ? new Date(task.due_date).toDateString() : 'No due date'
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(task)
      return acc
    }, {})
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
              await loadCalendarItems()
              setRefreshing(false)
            }}
          />
        }
      >
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Upcoming due dates from your tasks.</Text>

        {Object.keys(grouped).length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No scheduled tasks</Text>
            <Text style={styles.emptyDesc}>Tasks with due dates will show in this timeline.</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([day, dayTasks]) => (
            <View key={day} style={styles.dayCard}>
              <Text style={styles.dayTitle}>{day}</Text>
              {dayTasks.map(task => (
                <View key={task.id} style={styles.timelineItem}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskMeta}>{task.status.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          ))
        )}
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
    gap: 12,
    paddingBottom: 110,
  },
  title: {
    color: palette.text,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    marginBottom: 6,
    fontSize: 13,
  },
  dayCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 15,
    gap: 9,
  },
  dayTitle: {
    color: palette.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.7,
  },
  timelineItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf5',
    padding: 11,
  },
  taskTitle: {
    color: palette.text,
    fontWeight: '700',
  },
  taskMeta: {
    marginTop: 2,
    color: palette.muted,
    fontSize: 12,
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.border,
    backgroundColor: '#f8fbff',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 16,
  },
  emptyDesc: {
    marginTop: 4,
    color: palette.muted,
    textAlign: 'center',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
  },
})
