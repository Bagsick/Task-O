import { createServerSupabaseClient } from '@/lib/supabase/server'
import LandingPageClient from '@/components/LandingPageClient'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = createServerSupabaseClient()

  // Fetch stats in parallel
  const [
    { count: usersCount },
    { count: tasksDoneCount },
    { count: pendingTasksCount },
    { count: teamsCount }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('teams').select('*', { count: 'exact', head: true })
  ])

  const stats = [
    { value: usersCount || 0, label: 'Active Users' },
    { value: pendingTasksCount || 0, label: 'Pending Tasks' },
    { value: tasksDoneCount || 0, label: 'Tasks Done' },
    { value: teamsCount || 0, label: 'Teams' },
  ]

  return <LandingPageClient stats={stats} />
}
