'use client'

import { Plus, Users, Layout, Mail, Info, X, Shield, User as UserIcon, Check, ChevronDown, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createTeam } from '@/lib/teams/actions'
import Modal from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase/client'

export default function CreateTeamButton({ initialProjectId }: { initialProjectId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState(initialProjectId || '')
    const [leadId, setLeadId] = useState('')
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
    const [invitationEmails, setInvitationEmails] = useState('')
    const [memberLoading, setMemberLoading] = useState(false)

    const [projects, setProjects] = useState<any[]>([])
    const [allMembers, setAllMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchInitialData()
        }
    }, [isOpen])

    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch Projects where user is admin or owner
        const { data: userProjects } = await supabase
            .from('project_members')
            .select('project:project_id(id, name)')
            .eq('user_id', user.id)
            .in('role', ['admin', 'manager'])

        const projectsList = userProjects?.map((p: any) => p.project).filter(Boolean) || []
        setProjects(projectsList)

        if (projectsList.length > 0 && !projectId) {
            setProjectId(projectsList[0].id)
        }
    }

    useEffect(() => {
        const fetchProjectMembers = async () => {
            if (!projectId) {
                setAllMembers([])
                return
            }

            setMemberLoading(true)
            const { data } = await supabase
                .from('project_members')
                .select(`
                    user:user_id (
                        id,
                        full_name,
                        email,
                        avatar_url
                    )
                `)
                .eq('project_id', projectId)
                .eq('status', 'accepted')

            const memberList = data?.map((m: any) => m.user).filter(Boolean) || []
            setAllMembers(memberList)
            setMemberLoading(false)
        }

        if (isOpen) {
            fetchProjectMembers()
        }
    }, [isOpen, projectId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const emailList = invitationEmails.split(/[\s,x]+/).map(e => e.trim()).filter(e => e.includes('@'))
            await createTeam(
                name,
                description,
                projectId || undefined,
                leadId || undefined,
                selectedMemberIds,
                emailList
            )
            setIsOpen(false)
            resetForm()
        } catch (error: any) {
            setError(error.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setName('')
        setDescription('')
        setProjectId(initialProjectId || '')
        setLeadId('')
        setSelectedMemberIds([])
        setInvitationEmails('')
    }

    const toggleMember = (userId: string) => {
        if (userId === leadId) return // Prevent adding lead as member
        setSelectedMemberIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    // Effect to remove lead from members if lead changes
    useEffect(() => {
        if (leadId) {
            setSelectedMemberIds(prev => prev.filter(id => id !== leadId))
        }
    }, [leadId])

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-xs uppercase tracking-widest shadow-sm shadow-indigo-100/10 active:scale-95"
            >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 mr-1">
                    <Users size={18} />
                </div>
                Create Team
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Create Team"
                helperText="Group members by function"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !name}
                            className="flex-1 py-4 text-[10px] font-black text-[#6366f1] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-600 animate-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-relaxed">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Team Name *</label>
                            <input
                                autoFocus
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-bold text-gray-900 dark:text-slate-100 placeholder:font-medium"
                                placeholder="e.g. Design Engine"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Team Lead</label>
                            <div className="relative group">
                                <select
                                    value={leadId}
                                    onChange={(e) => setLeadId(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-bold text-gray-900 dark:text-slate-100 appearance-none"
                                >
                                    <option value="">Select a member...</option>
                                    {allMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Members</label>
                            <div className="max-h-32 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                                {allMembers.filter(m => m.id !== leadId).map(member => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => toggleMember(member.id)}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${selectedMemberIds.includes(member.id)
                                            ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20'
                                            : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={14} className="text-gray-400" />
                                                )}
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">{member.full_name || member.email}</span>
                                        </div>
                                        {selectedMemberIds.includes(member.id) && (
                                            <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center text-white">
                                                <Check size={10} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mission Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-sm font-bold text-gray-600 dark:text-slate-400 h-24 resize-none"
                                placeholder="Core mission and responsibilities..."
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}
