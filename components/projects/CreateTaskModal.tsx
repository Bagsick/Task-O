import {
    ClipboardList, CheckCircle2, AlertCircle, Layout, Hash, Users, FileText,
    Layers, Tag, Calendar, Clock, Paperclip, ChevronDown, X, Bold, Italic,
    List, Link as LinkIcon, Type, Shield, Flag
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createTask } from '@/lib/tasks/actions'
import Modal from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase/client'

export default function CreateTaskModal({ isOpen, onClose, initialProjectId, initialTeamId, onSuccess }: { isOpen: boolean, onClose: () => void, initialProjectId?: string, initialTeamId?: string, onSuccess?: () => void }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState(initialProjectId || '')
    const [priority, setPriority] = useState('medium')
    const [dueDate, setDueDate] = useState('')
    const [dueTime, setDueTime] = useState('')
    const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchProjects()
        }
    }, [isOpen])

    const fetchProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('project_members')
            .select(`
                projects (
                    id,
                    name
                )
            `)
            .eq('user_id', user.id)

        const projectList = data?.map((p: any) => p.projects).filter(Boolean) || []
        setProjects(projectList)
        if (projectList.length > 0 && !projectId && !initialProjectId) {
            setProjectId(projectList[0].id)
        }
    }

    useEffect(() => {
        const fetchMembers = async () => {
            if (!projectId) {
                setMembers([])
                return
            }

            const { data } = await supabase
                .from('project_members')
                .select(`
                    users:user_id (
                        id,
                        full_name,
                        email,
                        avatar_url
                    )
                `)
                .eq('project_id', projectId)

            const memberList = data?.map((m: any) => m.users).filter(Boolean) || []
            setMembers(memberList)
        }

        fetchMembers()
    }, [projectId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!projectId) {
            setError('Selection of a Project is mandatory.')
            return
        }

        setLoading(true)
        setSuccess(false)
        setError(null)
        try {
            await createTask({
                title,
                description,
                project_id: projectId,
                team_id: initialTeamId || undefined,
                priority,
                status: 'pending',
                due_date: dueDate || undefined,
                due_time: dueTime || undefined,
                assigned_to: assignedMemberIds[0]
            })
            setSuccess(true)
            resetForm()
            setTimeout(() => {
                setSuccess(false)
                onClose()
                if (onSuccess) onSuccess()
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Mission failed. Connection error.')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setPriority('medium')
        setDueDate('')
        setDueTime('')
        setAssignedMemberIds([])
    }

    const toggleMember = (id: string) => {
        setAssignedMemberIds(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Task"
            helperText="Track work and assign ownership"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !projectId}
                        className="flex-1 py-4 text-[10px] font-black text-[#6366f1] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                </>
            }
        >
            {success ? (
                <div className="py-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-500 mb-4 border border-emerald-100">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-slate-50 uppercase tracking-tight">Task Created</h3>
                    <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Objective logged successfully
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-600 animate-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-relaxed">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title *</label>
                            <input
                                autoFocus
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-bold text-gray-900 dark:text-slate-100 placeholder:font-medium"
                                placeholder="Mission objective..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Assignee *</label>
                            <div className="relative group">
                                <select
                                    required
                                    value={assignedMemberIds[0] || ''}
                                    onChange={(e) => setAssignedMemberIds(e.target.value ? [e.target.value] : [])}
                                    className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-bold text-gray-900 dark:text-slate-100 appearance-none"
                                >
                                    <option value="">Select a member...</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
                                <div className="relative group">
                                    <select
                                        value={'pending'} // Defaulted to To Do (pending)
                                        className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-100 appearance-none"
                                    >
                                        <option value="pending">To Do</option>
                                        <option value="in_progress">Active</option>
                                        <option value="completed">Done</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                                <div className="relative group">
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-100 appearance-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Due Time</label>
                                <input
                                    type="time"
                                    value={dueTime}
                                    onChange={(e) => setDueTime(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-100"
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Project</label>
                                <div className="relative group">
                                    <select
                                        required
                                        value={projectId}
                                        onChange={(e) => setProjectId(e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-xs font-bold text-gray-900 dark:text-slate-100 appearance-none"
                                    >
                                        <option value="">Select Project...</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-[13px] font-bold text-gray-600 dark:text-slate-400 h-20 resize-none placeholder:font-medium"
                                placeholder="Details regarding the initiative..."
                            />
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    )
}
