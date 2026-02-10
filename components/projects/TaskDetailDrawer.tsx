'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Calendar, CheckCircle2, Clock, Circle, AlertCircle, User, Trash2,
    Tag, Layout, MessageSquare, History, AtSign, Send, Paperclip,
    MoreHorizontal, ChevronRight, Hash, Shield, Flag, X, FileText
} from 'lucide-react'
import { updateTask, deleteTask } from '@/lib/tasks/actions'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

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
    const [mentionSearch, setMentionSearch] = useState('')
    const [showMentions, setShowMentions] = useState(false)
    const [projectMembers, setProjectMembers] = useState<any[]>([])

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchActivities()
        fetchComments()
        fetchProjectMembers()
    }, [task.id])

    const fetchActivities = async () => {
        // Mocking activities for now until task_activity table is confirmed
        // In a real app, this would be: 
        // const { data } = await supabase.from('task_activity').select('*').eq('task_id', task.id).order('created_at', { ascending: false })
        setActivities([
            { id: '1', type: 'system', message: 'Task initialized by System', created_at: task.created_at, user: { full_name: 'System' } },
            { id: '2', type: 'log', message: `Status changed to ${task.status}`, created_at: task.updated_at, user: { full_name: 'Technical Unit' } }
        ])
    }

    const fetchComments = async () => {
        const { data } = await supabase
            .from('comments')
            .select('*, user:user_id(id, full_name, avatar_url)')
            .eq('task_id', task.id)
            .order('created_at', { ascending: true })
        setComments(data || [])
    }

    const fetchProjectMembers = async () => {
        const { data } = await supabase
            .from('project_members')
            .select('users:user_id(id, full_name, email)')
            .eq('project_id', projectId)
        setProjectMembers(data?.map((m: any) => m.users) || [])
    }

    const handleUpdate = async (updates: any) => {
        if (!canManage) return
        setLoading(true)
        try {
            await updateTask(task.id, updates)
            router.refresh()
        } catch (error) {
            console.error('Failed to update task:', error)
        } finally {
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

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-50 dark:border-slate-800/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                        <Hash size={10} className="text-indigo-500" />
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{task.reference_code || task.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-500 transition-all"><MoreHorizontal size={16} /></button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-500 transition-all"><X size={16} /></button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-black text-gray-900 dark:text-slate-50 uppercase tracking-tightest leading-tight">
                        {task.title}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-gray-50 dark:bg-slate-800 text-[8px] font-black text-gray-400 uppercase tracking-widest rounded-md border border-gray-100 dark:border-slate-700">
                            {task.task_type || 'General'}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-50 dark:bg-slate-800 text-[8px] font-black text-gray-400 uppercase tracking-widest rounded-md border border-gray-100 dark:border-slate-700">
                            {task.category || 'Maintenance'}
                        </span>
                    </div>
                </div>
            </div>

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
                                "{task.description || 'No detailed mission parameters provided.'}"
                            </p>
                        </div>
                    </div>

                    {/* Operational Matrix */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value)
                                        handleUpdate({ status: e.target.value })
                                    }}
                                    className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm appearance-none focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer"
                                >
                                    <option value="pending">PENDING_QUEUE</option>
                                    <option value="in_progress">ACTIVE_DEPLOY</option>
                                    <option value="completed">MISSION_COMPLETE</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-3.5 rotate-90 text-gray-300" size={14} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Authority Level</label>
                            <div className="relative">
                                <select
                                    value={priority}
                                    onChange={(e) => {
                                        setPriority(e.target.value)
                                        handleUpdate({ priority: e.target.value })
                                    }}
                                    className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm appearance-none focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer"
                                >
                                    <option value="low">LOW_PRIORITY</option>
                                    <option value="medium">MEDIUM_PRIORITY</option>
                                    <option value="high">HIGH_PRIORITY</option>
                                </select>
                                <Flag className={`absolute right-4 top-3.5 ${priority === 'high' ? 'text-rose-500' : priority === 'medium' ? 'text-amber-500' : 'text-gray-300'}`} size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-6 px-2 py-4 border-y border-gray-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Assignee</p>
                                <p className="text-[11px] font-black text-gray-900 dark:text-slate-100">{task.assignee?.full_name || 'Unassigned'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Deadline</p>
                                <p className="text-[11px] font-black text-gray-900 dark:text-slate-100">{task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'NO_LIMIT'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800">
                            {[
                                { id: 'all', icon: History, label: 'All Log' },
                                { id: 'comments', icon: MessageSquare, label: 'Commits' },
                                { id: 'logs', icon: Shield, label: 'Audit' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-[#6366f1]' : 'text-gray-400'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <tab.icon size={12} />
                                        {tab.label}
                                    </span>
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1] rounded-full" />}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {filteredActivity.map((a, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${a.type === 'comment' ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm' : 'bg-gray-50 dark:bg-slate-800/50 border-transparent text-gray-400'}`}>
                                            {a.type === 'comment' ? (
                                                <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase">
                                                    {a.user?.avatar_url ? <img src={a.user.avatar_url} className="w-full h-full object-cover" /> : (a.user?.full_name?.[0] || 'U')}
                                                </div>
                                            ) : <Shield size={14} />}
                                        </div>
                                        <div className="flex-1 w-px bg-gray-50 dark:bg-slate-800 group-last:hidden" />
                                    </div>
                                    <div className="flex-1 pt-1 pb-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[10px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight">{a.user?.full_name}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">{format(new Date(a.created_at), 'HH:mm • dd MMM')}</p>
                                        </div>
                                        <p className={`text-[11px] leading-relaxed ${a.type === 'comment' ? 'text-gray-600 dark:text-slate-400 font-bold' : 'text-gray-400 italic'}`}>
                                            {a.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Response Interface */}
            <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                <form onSubmit={handleCommentSubmit} className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                        <AtSign size={14} />
                    </div>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl text-[11px] font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all min-h-[44px] max-h-32 shadow-sm"
                        placeholder="Commit a comment or @ mention unit..."
                    />
                    <button
                        type="submit"
                        className="absolute right-2 bottom-2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-90 transition-all"
                    >
                        <Send size={14} />
                    </button>
                    <div className="flex items-center gap-4 mt-2 px-2">
                        <button type="button" className="text-gray-400 hover:text-indigo-500 transition-all flex items-center gap-1.5"><Paperclip size={12} /> <span className="text-[8px] font-black uppercase tracking-widest">Attach Manifest</span></button>
                    </div>
                </form>
            </div>
        </div>
    )
}
