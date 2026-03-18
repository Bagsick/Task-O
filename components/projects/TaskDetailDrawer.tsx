'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
    Calendar, CheckCircle2, Clock, Circle, AlertCircle, User, Trash2,
    Tag, Layout, MessageSquare, History, AtSign, Send, Paperclip,
    MoreHorizontal, ChevronRight, Hash, Shield, Flag, X, FileText
} from 'lucide-react'
import { updateTask, deleteTask } from '@/lib/tasks/actions'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import ConfirmationModal from '../ui/ConfirmationModal'

interface TaskDetailDrawerProps {
    task: any
    projectId: string
    onClose: () => void
    canManage?: boolean
}

export default function TaskDetailDrawer({ task, projectId, onClose, canManage = false }: TaskDetailDrawerProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'logs' | 'comments'>('all')
    const [newComment, setNewComment] = useState('')
    const [activities, setActivities] = useState<any[]>([])
    const [comments, setComments] = useState<any[]>([])

    const [status, setStatus] = useState(task.status)
    const [priority, setPriority] = useState(task.priority)
    const [userRole, setUserRole] = useState<string>('viewer')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [userTeams, setUserTeams] = useState<string[]>([])
    const [mentionSearch, setMentionSearch] = useState('')
    const [showMentions, setShowMentions] = useState(false)
    const [projectMembers, setProjectMembers] = useState<any[]>([])
    const [teamInfo, setTeamInfo] = useState<any>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isExiting, setIsExiting] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchTeamInfo = useCallback(async () => {
        const { data } = await supabase
            .from('teams')
            .select('name')
            .eq('id', task.team_id)
            .single()
        setTeamInfo(data)
    }, [task.team_id])

    const fetchUserRole = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setCurrentUserId(user.id)

        const { data: member } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .single()

        setUserRole(member?.role || 'viewer')

        const { data: teams } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id)

        setUserTeams(teams?.map(t => t.team_id) || [])
    }, [projectId])

    const fetchActivities = useCallback(async () => {
        const { data } = await supabase
            .from('activities')
            .select('*, user:user_id(full_name, avatar_url)')
            .eq('task_id', task.id)
            .order('created_at', { ascending: false })
        setActivities(data || [])
    }, [task.id])

    const fetchComments = useCallback(async () => {
        const { data } = await supabase
            .from('comments')
            .select('*, user:user_id(id, full_name, avatar_url)')
            .eq('task_id', task.id)
            .order('created_at', { ascending: true })
        setComments(data || [])
    }, [task.id])

    const fetchProjectMembers = useCallback(async () => {
        const { data } = await supabase
            .from('project_members')
            .select('users:user_id(id, full_name, email)')
            .eq('project_id', projectId)
        setProjectMembers(data?.map((m: any) => m.users) || [])
    }, [projectId])

    useEffect(() => {
        fetchActivities()
        fetchComments()
        fetchProjectMembers()
        fetchUserRole()
        setIsMounted(true)
        if (task.team_id) fetchTeamInfo()
    }, [task.id, task.team_id, fetchActivities, fetchComments, fetchProjectMembers, fetchUserRole, fetchTeamInfo])

    const handleUpdate = async (updates: any) => {
        if (userRole === 'viewer') return
        setLoading(true)
        const startTime = Date.now()
        try {
            await updateTask(task.id, updates)
            router.refresh()
            const elapsed = Date.now() - startTime
            const delay = Math.max(0, 1700 - elapsed)

            setTimeout(() => {
                setIsExiting(true)
                setTimeout(() => {
                    onClose()
                }, 300)
            }, delay)
        } catch (error) {
            console.error('Failed to update task:', error)
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        const startTime = Date.now()
        try {
            await deleteTask(task.id)
            router.refresh()
            const elapsed = Date.now() - startTime
            const delay = Math.max(0, 1700 - elapsed)

            setTimeout(() => {
                setIsExiting(true)
                setTimeout(() => {
                    onClose()
                }, 300)
            }, delay)
        } catch (error: any) {
            console.error('Failed to delete task:', error)
            alert(error.message || 'Failed to delete task')
            setLoading(false)
        }
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('comments').insert({
            task_id: task.id,
            user_id: user.id,
            content: newComment
        })

        if (!error) {
            setNewComment('')
            fetchComments()
        }
    }

    const combinedActivity = [
        ...activities.map(a => ({ ...a, category: 'log' })),
        ...comments.map(c => ({
            id: c.id,
            type: 'comment',
            message: c.content,
            created_at: c.created_at,
            user: c.user,
            category: 'comment'
        }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const filteredActivity = combinedActivity.filter(a => {
        if (activeTab === 'all') return true
        return a.category === (activeTab === 'comments' ? 'comment' : 'log')
    })

    const formatLabel = (label: string) => {
        if (!label) return ''
        return label.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'To Do'
            case 'in_progress': return 'Doing'
            case 'completed': return 'Done'
            default: return formatLabel(status)
        }
    }

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out transform ${isMounted && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-6 space-y-8">
                    {/* Execution Details */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <FileText size={12} /> Execution Parameters
                        </label>
                        <div className="p-5 bg-gray-50/50 dark:bg-slate-800/30 rounded-3xl border border-gray-50 dark:border-slate-800/50 shadow-inner">
                            <p className="text-xs font-bold text-gray-600 dark:text-slate-400 leading-relaxed italic">
                                &quot;{task.description || 'No detailed mission parameters provided.'}&quot;
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Team Section */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Team</label>
                            <div className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-900 dark:text-slate-100">
                                {formatLabel(teamInfo?.name || task.team?.name || 'CENTRAL_OPS')}
                            </div>
                        </div>

                        {/* Assignee Section */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Assignee</label>
                            <div className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-slate-100">
                                <div className="w-5 h-5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-500 shrink-0">
                                    {task.assignee?.full_name?.[0] || 'U'}
                                </div>
                                <span className="truncate">{task.assignee?.full_name || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Status Section */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
                            <div className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-900 dark:text-slate-100">
                                <span className="uppercase tracking-widest">{getStatusLabel(status)}</span>
                                <div className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-emerald-500' :
                                    status === 'in_progress' ? 'bg-amber-500' :
                                        'bg-indigo-400'
                                    } shadow-[0_0_10px_-2px_rgba(0,0,0,0.1)]`} />
                            </div>
                        </div>

                        {/* Priority Section */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                            <div className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-900 dark:text-slate-100">
                                <span className="uppercase tracking-widest">{formatLabel(priority)}</span>
                                <Flag size={12} className={
                                    priority === 'high' ? 'text-rose-500' :
                                        priority === 'medium' ? 'text-amber-500' :
                                            'text-indigo-400'
                                } />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Due Date Section */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Due Date</label>
                            <div className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-slate-100">
                                <Calendar size={14} className="text-gray-400" />
                                {task.due_date ? format(new Date(task.due_date), 'MMMM dd, yyyy') : 'No Date Set'}
                            </div>
                        </div>

                        {/* Task ID / Reference */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Reference ID</label>
                            <div className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <Hash size={12} className="text-gray-400" />
                                {task.reference_code || task.id.slice(0, 8)}
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Operational Details</label>
                        <div className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-[13px] font-bold text-gray-600 dark:text-slate-400 min-h-[100px] leading-relaxed">
                            {task.description || 'No operational details logged for this objective.'}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {filteredActivity.map((a, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${a.type === 'comment' ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm' : 'bg-gray-50 dark:bg-slate-800/50 border-transparent text-gray-400'}`}>
                                        {a.type === 'comment' ? (
                                            <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase">
                                                {a.user?.avatar_url ? (
                                                    <Image
                                                        src={a.user.avatar_url}
                                                        alt={a.user.full_name || 'User avatar'}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (a.user?.full_name?.[0] || 'U')}
                                            </div>
                                        ) : <Shield size={14} />}
                                    </div>
                                    <div className="flex-1 w-px bg-gray-50 dark:bg-slate-800 group-last:hidden" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">{a.user?.full_name}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(a.created_at), 'MMM dd')}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-600 dark:text-slate-400 font-medium leading-relaxed">{a.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            {(userRole === 'admin' || userRole === 'manager' || userRole === 'tech_lead' || canManage) && (
                <div className="px-8 py-4 border-t border-gray-50 dark:border-slate-800/50 flex justify-center">
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-98 disabled:opacity-30"
                    >
                        <Trash2 size={14} />
                        Delete Task
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmLabel="Delete Task"
                type="danger"
            />

            {/* Bottom Action Bar */}
            <div className="p-6 border-t border-gray-50 dark:border-slate-800/50 flex gap-4 relative shrink-0">
                {(status === 'pending' || status === 'todo') && (
                    <>
                        <button
                            onClick={() => { setStatus('in_progress'); handleUpdate({ status: 'in_progress' }) }}
                            disabled={userRole === 'viewer' || (userRole === 'member' && task.assigned_to !== currentUserId && !canManage)}
                            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-98 disabled:opacity-50"
                        >
                            <Circle size={14} className="animate-pulse" />
                            Start Doing
                        </button>
                        <button
                            onClick={() => { setStatus('completed'); handleUpdate({ status: 'completed' }) }}
                            disabled={userRole === 'viewer' || (userRole === 'member' && task.assigned_to !== currentUserId && !canManage)}
                            className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50"
                        >
                            <CheckCircle2 size={14} />
                            Mark as Done
                        </button>
                    </>
                )}

                {status === 'in_progress' && (
                    <>
                        <button
                            onClick={() => { setStatus('pending'); handleUpdate({ status: 'pending' }) }}
                            disabled={userRole === 'viewer' || (userRole === 'member' && task.assigned_to !== currentUserId && !canManage)}
                            className="flex-1 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                        >
                            <History size={14} />
                            Revert to Todo
                        </button>
                        <button
                            onClick={() => { setStatus('completed'); handleUpdate({ status: 'completed' }) }}
                            disabled={userRole === 'viewer' || (userRole === 'member' && task.assigned_to !== currentUserId && !canManage)}
                            className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50"
                        >
                            <CheckCircle2 size={14} />
                            Mark as Done
                        </button>
                    </>
                )}

                {status === 'completed' && (
                    <button
                        onClick={() => { setStatus('in_progress'); handleUpdate({ status: 'in_progress' }) }}
                        disabled={userRole === 'viewer' || (userRole === 'member' && task.assigned_to !== currentUserId && !canManage)}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-98 disabled:opacity-50"
                    >
                        <History size={14} />
                        Reopen Task (In Progress)
                    </button>
                )}
            </div>
        </div >
    )
}
