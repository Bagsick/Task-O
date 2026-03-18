import { useCallback, useEffect, useState } from 'react'
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

function statusLabel(status: TaskItem['status']) {
  if (status === 'in_progress') return 'In Progress'
  if (status === 'completed') return 'Completed'
  return 'Pending'
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadTasks = useCallback(async () => {
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
      .order('created_at', { ascending: false })

    setTasks((data || []) as TaskItem[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

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
              await loadTasks()
              setRefreshing(false)
            }}
          />
        }
      >
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>View and manage all your assigned tasks.</Text>

        {tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tasks assigned yet</Text>
            <Text style={styles.emptyDesc}>Assigned tasks from your projects will appear here.</Text>
          </View>
        ) : (
          tasks.map(task => {
            const overdue = task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'completed' : false
            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskRow}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.badge, overdue ? styles.badgeDanger : styles.badgeNeutral]}>
                    <Text style={[styles.badgeText, overdue ? styles.badgeDangerText : styles.badgeNeutralText]}>
                      {statusLabel(task.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.taskDesc}>{task.description || 'No description provided.'}</Text>
                <Text style={styles.meta}>
                  Priority: {task.priority || 'n/a'} | Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'n/a'}
                </Text>
              </View>
            )
          })
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
  taskCard: {
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    gap: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  taskTitle: {
    fontSize: 17,
    color: palette.text,
    fontWeight: '700',
    flex: 1,
  },
  taskDesc: {
    color: palette.muted,
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
    color: '#4f5d75',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeNeutral: {
    backgroundColor: '#eef4fa',
  },
  badgeNeutralText: {
    color: '#24547d',
  },
  badgeDanger: {
    backgroundColor: '#fee2e2',
  },
  badgeDangerText: {
    color: '#991b1b',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
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
