'use client'

import { useState } from 'react'
import { Shield, Mail, Calendar, Trash2, User, Key } from 'lucide-react'
import { format } from 'date-fns'
import UpdateRoleModal from './UpdateRoleModal'

interface MemberDetailDrawerProps {
    member: any
    projectId: string
    isAdmin: boolean
    currentUserId: string
    ownerId: string
    onClose: () => void
}

export default function MemberDetailDrawer({
    member,
    projectId,
    isAdmin,
    currentUserId,
    ownerId,
    onClose
}: MemberDetailDrawerProps) {
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
    const isSelf = member.user.id === currentUserId
    const isOwner = member.user.id === ownerId

    return (
        <div className="space-y-6">
            {/* Header Profile */}
            <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-gray-50 dark:border-slate-800/50">
                <div className="w-24 h-24 rounded-[32px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[#6366f1] text-3xl font-black border border-indigo-100 dark:border-indigo-500/20 overflow-hidden shadow-xl">
                    {member.user.avatar_url ? (
                        <img src={member.user.avatar_url} alt={member.user.full_name || 'Member'} className="w-full h-full object-cover" />
                    ) : (
                        member.user.full_name?.[0] || 'U'
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-slate-50 uppercase tracking-tightest leading-none mb-1">
                        {member.user.full_name || 'Anonymous User'}
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                        Workspace Participant
                    </p>
                </div>
            </div>

            {/* Account Details */}
            <div className="space-y-6">
                <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-500 truncate max-w-[180px]">{member.user.email}</span>
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Primary Email</span>
                </div>

                <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-500">
                            {member.joined_at ? format(new Date(member.joined_at), 'MMM dd, yyyy') : 'Unknown'}
                        </span>
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Joined Workspace</span>
                </div>
            </div>

            {/* Access Management */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-900 dark:text-slate-50 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} className="text-[#6366f1]" />
                    Access Configuration
                </h3>
                <div className="p-6 rounded-[32px] border border-gray-100 dark:border-slate-800/50 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">Active Role</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-gray-400 italic capitalize">{member.role}</p>
                                {isAdmin && !isOwner && !isSelf && (
                                    <button
                                        onClick={() => setIsRoleModalOpen(true)}
                                        className="text-[8px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition-all"
                                    >
                                        Modify Access
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className={`p-2 rounded-xl border ${member.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-[#6366f1] dark:bg-indigo-500/10 dark:border-indigo-500/20' : 'bg-gray-50 border-gray-100 text-gray-400 dark:bg-slate-800 dark:border-slate-700'}`}>
                            <Shield size={16} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">Status</p>
                            <p className="text-[10px] text-gray-400 italic mt-0.5 capitalize">{member.status}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${member.status === 'accepted' ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>
                            {member.status}
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            {isAdmin && !isOwner && !isSelf && (
                <div className="pt-6 border-t border-gray-50 dark:border-slate-800/50">
                    <button
                        className="w-full py-4 bg-red-50/50 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-[10px] font-black text-red-500 uppercase tracking-widest rounded-2xl transition-all border border-transparent flex items-center justify-center gap-2 group"
                    >
                        <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                        Revoke Access & Remove
                    </button>
                </div>
            )}

            <UpdateRoleModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                member={{
                    id: member.id,
                    user_id: member.user.id,
                    full_name: member.user.full_name,
                    email: member.user.email,
                    role: member.role
                }}
                projectId={projectId}
            />
        </div>
    )
}
