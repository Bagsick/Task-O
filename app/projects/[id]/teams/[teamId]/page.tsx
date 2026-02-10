import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Users, Layout, ChevronRight, TrendingUp } from 'lucide-react'
import KanbanBoard from '@/components/KanbanBoard'
import Link from 'next/link'
import TeamPersonnelClient from './TeamPersonnelClient'

export default async function TeamDashboardPage({
    params,
}: {
    params: { id: string; teamId: string }
}) {
    const { id: projectId, teamId } = params
    const supabase = await createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            id,
            role,
            user:user_id(id, full_name, avatar_url, email)
          )
        `)
        .eq('id', teamId)
        .single()

    if (teamError || !team) {
        notFound()
    }

    const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', team.project_id)
        .single()

    const { data: tasks } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:assigned_to (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

    const { data: callerMembership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single()

    const isAdmin = ['owner', 'admin'].includes(callerMembership?.role || '')

    const stats = {
        total: tasks?.length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
        progress: (tasks?.length || 0) > 0 ? (tasks?.filter(t => t.status === 'completed').length || 0) / (tasks?.length || 1) * 100 : 0
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-[#6366f1] border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            <Users size={24} />
                        </div>
                        <div>
                            <h1 className="text-[32px] font-black text-gray-900 dark:text-slate-50 tracking-tightest leading-none uppercase">{team.name}</h1>
                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">
                                {project?.name || 'Internal'} Execution Workspace
                            </p>
                        </div>
                    </div>
                    <p className="text-[15px] text-gray-600 dark:text-slate-400 leading-relaxed font-medium uppercase tracking-tight italic opacity-60">
                        {team.description || 'Dedicated to specialized delivery and core workspace objectives.'}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm backdrop-blur-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workspace Velocity</span>
                        <span className="text-[10px] font-black text-[#6366f1]">{Math.round(stats.progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden mb-6 border border-gray-100 dark:border-slate-800/50">
                        <div
                            className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-1000 ease-out shadow-lg"
                            style={{ width: `${stats.progress}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[18px] font-black text-gray-900 dark:text-slate-50 leading-none">{stats.completed}</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Resolved</p>
                        </div>
                        <div>
                            <p className="text-[18px] font-black text-gray-900 dark:text-slate-50 leading-none">{stats.total}</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Assigned</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <section className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Layout size={16} className="text-[#6366f1]" />
                            <h2 className="text-[16px] font-black text-gray-900 dark:text-slate-50 tracking-tightest uppercase">Sprint Manifest</h2>
                        </div>
                        <Link href={`/projects/${projectId}/kanban`} className="group flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#6366f1] uppercase tracking-widest transition-colors">
                            Full Board View <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="bg-white dark:bg-slate-900/40 p-1 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-sm min-h-[500px] backdrop-blur-xl">
                        <KanbanBoard tasks={tasks || []} />
                    </div>
                </section>

                <TeamPersonnelClient team={team} projectId={projectId} isAdmin={isAdmin} />
            </div>
        </div>
    )
}
