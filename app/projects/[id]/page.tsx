import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Activity, Zap, Users, Target, AlertCircle, Clock } from 'lucide-react'
import ProjectActions from '@/components/projects/ProjectActions'

export default async function ProjectOverviewPage({
  params
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project stats
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('status, priority, due_date')
    .eq('project_id', id)

  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .eq('project_id', id)

  const { data: members } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', id)

  // Fetch team progress
  const { data: teamsWithProgress } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      tasks:tasks(id, status)
    `)
    .eq('project_id', id)

  const teamsFormatted = teamsWithProgress?.map(team => {
    const teamTasks = team.tasks as any[]
    const teamTotal = teamTasks.length
    const teamCompleted = teamTasks.filter(t => t.status === 'completed').length
    const teamProgress = teamTotal > 0 ? Math.round((teamCompleted / teamTotal) * 100) : 0
    return { name: team.name, progress: teamProgress }
  }) || []

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
  const overdueTasks = tasks?.filter(t => {
    if (t.status === 'completed') return false
    if (!t.due_date) return false
    return new Date(t.due_date) < new Date()
  }).length || 0

  const healthScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const status = healthScore > 60 ? 'On Track' : healthScore > 30 ? 'At Risk' : 'Off Track'

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Header Summary */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em]">Overview</h2>
        <div className="h-px bg-gray-100 dark:bg-slate-800/50 w-full" />
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500">Project Status: </span>
            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">{status} ({healthScore}%)</span>
          </div>
          <div>
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500">Timeline: </span>
            <span className="text-sm font-black text-gray-900 dark:text-slate-50 uppercase tracking-widest">Jan 5 → Mar 30</span>
          </div>
        </div>
      </div>



      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl group hover:border-[#6366f1]/20 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Deliverables</p>
          <h3 className="text-[48px] font-black text-gray-900 dark:text-slate-50 tracking-tightest leading-none">{totalTasks}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl group hover:border-emerald-500/20 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Completed</p>
          <h3 className="text-[48px] font-black text-emerald-500 tracking-tightest leading-none">{completedTasks}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl group hover:border-red-500/20 transition-all">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Overdue / Risks</p>
          <h3 className="text-[48px] font-black text-red-500 tracking-tightest leading-none">{overdueTasks}</h3>
        </div>
      </div>

      {/* Team Progress & Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[50px] border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
          <h3 className="text-[14px] font-black text-gray-900 dark:text-slate-50 uppercase tracking-[0.2em] mb-10">Team Progress</h3>
          <div className="space-y-10">
            {teamsFormatted.length > 0 ? teamsFormatted.map((t: any) => (
              <div key={t.name} className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>{t.name}</span>
                  <span>{t.progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#6366f1] h-full transition-all duration-1000"
                    style={{ width: `${t.progress}%` }}
                  />
                  <div className="text-[8px] font-black text-gray-300 dark:text-slate-600 flex items-center px-4 uppercase tracking-tighter">
                    {'█'.repeat(Math.floor(t.progress / 10))}{'░'.repeat(10 - Math.floor(t.progress / 10))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                  <Users size={24} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Active Teams</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 flex flex-col justify-between">
          <div className="bg-[#6366f1] p-12 rounded-[50px] shadow-xl shadow-indigo-600/20 text-white">
            <h3 className="text-[14px] font-black text-white/60 uppercase tracking-[0.2em] mb-6">Executive Insight</h3>
            <p className="text-[18px] font-black uppercase tracking-tightest leading-tight">
              The project is maintaining a <span className="text-white/40">{healthScore}%</span> health score.
              {overdueTasks > 0 ? ` Action required on ${overdueTasks} critical delays.` : ' Execution is proceeding within established parameters.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm">
            <h3 className="text-[14px] font-black text-gray-900 dark:text-slate-50 uppercase tracking-[0.2em] mb-8 text-center">Quick Actions</h3>
            <ProjectActions
              projectId={id}
              isAdmin={project.owner_id === user.id}
            />
          </div>
        </div>
      </div>
    </div >
  )
}
