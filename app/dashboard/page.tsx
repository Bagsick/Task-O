import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  MoreHorizontal,
  Plus,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Layout,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DashboardActions, SectionDropdown, TeamActions, TaskPriorityList } from '@/components/dashboard/DashboardClient'
import { CompletedTasksIcon, AssignedTasksIcon, AllBoardsIcon, ScheduledTasksIcon } from '@/components/dashboard/LivelyIcons'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user

  if (!user) return null

  // Parallel fetching for high performance
  const [
    { data: tasks },
    { count: projectCount },
    { data: teams },
    { data: announcements }
  ] = await Promise.all([
    supabase.from('tasks').select('*, projects:project_id(id, name)').or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`).order('created_at', { ascending: false }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('team_members').select('role, teams(id, name, avatar_url, team_members(count))').eq('user_id', user.id).limit(5),
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
  ])

  // Stats calculation
  const completedCount = tasks?.filter(t => t.status === 'completed')?.length || 0
  const assignedCount = tasks?.filter(t => t.assigned_to === user.id && t.status !== 'completed')?.length || 0
  const scheduledCount = tasks?.filter(t => t.due_date && new Date(t.due_date) > new Date() && t.status !== 'completed')?.length || 0

  const formatCount = (count: number) => (count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString())

  const upcomingTasks = (tasks || [])
    .filter(t => t.status !== 'completed' && t.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-10">
      {/* Stats Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Completed Tasks', value: formatCount(completedCount), icon: CompletedTasksIcon, color: '#9dd8aa', bg: 'linear-gradient(135deg, #f5f0ff 0%, #ede9fe 100%)' },
          { label: 'Assigned Tasks', value: formatCount(assignedCount), icon: AssignedTasksIcon, color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
          { label: 'All Boards', value: formatCount(projectCount || 0), icon: AllBoardsIcon, color: '#6366f1', bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' },
          { label: 'Scheduled Tasks', value: formatCount(scheduledCount), icon: ScheduledTasksIcon, color: '#ec4899', bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-7 rounded-[32px] border border-white/50 dark:border-slate-800/50 shadow-sm flex items-center gap-6 transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden h-32"
            style={{
              background: stat.bg
            }}
          >
            <div className="hidden dark:block absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />

            <div
              className="w-14 h-14 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 relative z-10 shrink-0"
              style={{ color: stat.color }}
            >
              <stat.icon size={32} />
            </div>
            <div className="flex flex-col relative z-10">
              <h3 className="text-[32px] font-black text-slate-900 dark:text-white leading-none tracking-tighter mb-1 transition-colors duration-300">
                {stat.value}
              </h3>
              <p className="text-[10px] font-black text-slate-900/40 dark:text-white/40 uppercase tracking-[0.2em] leading-none transition-colors duration-300">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Task Priorities List */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-black text-black dark:text-white tracking-tight">Tasks Priorities</h2>
              <p className="text-xs text-black/60 dark:text-white/60 font-bold outfit">Team tasks sorted by priority</p>
            </div>
            <div className="flex items-center gap-3">
              <DashboardActions />
              <SectionDropdown />
            </div>
          </div>

          <div className="p-8 pt-4">
            <TaskPriorityList
              tasks={tasks || []}
              completedCount={completedCount}
              upcomingCount={upcomingTasks?.length || 0}
              overdueCount={tasks?.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length || 0}
            />
          </div>
        </section>

        {/* Announcements / Updates */}
        <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-black text-gray-900 dark:text-slate-50 tracking-tight">Announcements</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-bold italic">From personal and team project</p>
            </div>
            <SectionDropdown />
          </div>

          <div className="p-8 pt-6 space-y-10 relative flex-1">
            <div className="absolute left-[47px] top-10 bottom-10 w-[2px] bg-[#f3f4ff] dark:bg-slate-800/50" />
            {announcements && announcements.length > 0 ? announcements.map((ann, i) => (
              <div key={ann.id} className="relative flex gap-5 z-10">
                <div className="w-10 h-10 rounded-full bg-[#f3f4ff] dark:bg-indigo-500/10 border-4 border-white dark:border-slate-950 flex items-center justify-center text-[#6366f1] text-sm font-bold shrink-0 shadow-sm">
                  {ann.type === 'team_invitation' ? <Users size={18} /> : <Bell size={18} />}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">{ann.message}</h4>
                  <p className="mt-2 text-[12px] font-semibold text-gray-400 dark:text-gray-500">{format(new Date(ann.created_at), 'dd MMM yyyy - p')}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Bell size={40} className="text-gray-100 dark:text-slate-800 mb-4" />
                <p className="text-gray-300 dark:text-slate-600 font-medium">System updates will appear here</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* My Teams Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-[26px] font-black text-gray-900 dark:text-slate-50 tracking-tight">My Teams</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold italic lowercase">Teams with assigned tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <TeamActions />
            <SectionDropdown />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {teams && teams.length > 0 ? teams.filter((m: any) => m.teams).map((membership: any) => {
            const team = membership.teams
            return (
              <div key={team.id} className="p-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px] hover:border-[#6366f1] hover:shadow-xl hover:shadow-[#6366f1]/5 transition-all duration-500 group flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-4 right-4 text-gray-200 dark:text-slate-800 group-hover:text-gray-400 dark:group-hover:text-gray-600 transition-colors">
                  <SectionDropdown />
                </div>
                <div className="w-20 h-20 rounded-[28px] bg-gray-50 dark:bg-slate-800/50 mb-6 flex items-center justify-center text-[#6366f1] text-2xl font-black group-hover:scale-110 transition-transform duration-500 shadow-sm border border-gray-100 dark:border-slate-800">
                  {team.avatar_url ? <img src={team.avatar_url} alt={team.name} className="w-full h-full rounded-[28px] object-cover" /> : team.name[0]}
                </div>
                <h4 className="text-[17px] font-bold text-gray-900 dark:text-slate-100 truncate w-full group-hover:text-[#6366f1] transition-colors">{team.name}</h4>
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">{team.team_members?.[0]?.count || 0} Members</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366f1] bg-[#f3f4ff] dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    Active {membership.role}
                  </span>
                </div>
              </div>
            )
          }) : (
            <div className="col-span-full py-20 text-center bg-[#fcfcfd] rounded-[32px] border border-dashed border-gray-200">
              <Users size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">You aren&apos;t a member of any teams yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

