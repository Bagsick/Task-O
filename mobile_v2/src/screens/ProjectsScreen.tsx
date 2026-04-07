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
import { ProjectItem } from '../types'
import { palette } from '../theme'

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadProjects = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('projects')
      .select('*, project_members!inner(role)')
      .eq('project_members.user_id', user.id)
      .order('created_at', { ascending: false })

    setProjects((data || []) as ProjectItem[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

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
              await loadProjects()
              setRefreshing(false)
            }}
          />
        }
      >
        <Text style={styles.title}>Projects</Text>
        <Text style={styles.subtitle}>Manage and track all collaborative projects.</Text>

        {projects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyDesc}>Create a project on web or API and it will appear here.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {projects.map(project => (
              <View key={project.id} style={styles.projectCard}>
                <Text style={styles.projectTitle}>{project.name}</Text>
                <Text style={styles.projectDesc}>{project.description || 'No description provided.'}</Text>
                <View style={styles.footerRow}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                  <Text style={styles.dateText}>{new Date(project.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
          </View>
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
  grid: {
    gap: 10,
  },
  projectCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 16,
    gap: 9,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  projectDesc: {
    color: palette.muted,
    fontSize: 14,
  },
  footerRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: '#e8f5fc',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateText: {
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
