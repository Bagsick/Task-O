'use client'

import { useState } from 'react'
import {
    Bell, AtSign, Briefcase, UserPlus, Info,
    Search, Filter, CheckCircle2, Clock,
    ChevronRight, MoreVertical, Archive
} from 'lucide-react'
import { format } from 'date-fns'
import { respondToPlatformInvitation } from '@/lib/users/actions'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface Notification {
    id: string
    type: 'mention' | 'assignment' | 'invite' | 'alert' | 'workspace_invite' | 'task_assignment' | 'project_invite'
    message: string
    read: boolean
    created_at: string
    related_id?: string
}

interface InboxAlertsProps {
    notifications: Notification[]
}

export default function InboxAlerts({ notifications: initialNotifications }: InboxAlertsProps) {
    const [notifications, setNotifications] = useState(initialNotifications)
    const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'assignments' | 'invites' | 'alerts'>('all')
    const [processingId, setProcessingId] = useState<string | null>(null)
    const router = useRouter()

    const tabs = [
        { id: 'all', label: 'All Activity', icon: Bell },
        { id: 'mentions', label: 'Mentions', icon: AtSign },
        { id: 'assignments', label: 'Assignments', icon: Briefcase },
        { id: 'invites', label: 'Invites', icon: UserPlus },
        { id: 'alerts', label: 'System Alerts', icon: Info },
    ]

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        router.refresh()
    }

    const handleInvitation = async (notificationId: string, projectId: string | undefined, accept: boolean) => {
        if (!projectId) return
        setProcessingId(notificationId)
        try {
            await respondToPlatformInvitation(projectId, accept)
            // Remove notification from local state optimistically
            setNotifications(prev => prev.filter(n => n.id !== notificationId))
            router.refresh()
        } catch (error) {
            console.error('Failed to respond to invitation:', error)
        } finally {
            setProcessingId(null)
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true
        if (activeTab === 'mentions') return n.type === 'mention'
        if (activeTab === 'assignments') return n.type === 'assignment' || n.type === 'task_assignment'
        if (activeTab === 'invites') return n.type === 'invite' || n.type === 'workspace_invite'
        if (activeTab === 'alerts') return n.type === 'alert'
        return true
    })

    const getIcon = (type: string) => {
        switch (type) {
            case 'mention': return <AtSign size={16} className="text-blue-500" />
            case 'assignment':
            case 'task_assignment': return <Briefcase size={16} className="text-purple-500" />
            case 'invite':
            case 'workspace_invite': return <UserPlus size={16} className="text-green-500" />
            case 'alert': return <Info size={16} className="text-amber-500" />
            default: return <Bell size={16} className="text-gray-500" />
        }
    }

    return (
        <div className="flex bg-white dark:bg-slate-950 rounded-[40px] border border-gray-100 dark:border-slate-800/50 shadow-2xl shadow-indigo-100/20 dark:shadow-none overflow-hidden h-[calc(100vh-180px)] animate-in fade-in duration-700 backdrop-blur-3xl">
            {/* Nav Sidebar */}
            <div className="w-[320px] border-r border-gray-100 dark:border-slate-800/50 flex flex-col bg-white dark:bg-slate-900/30">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-slate-50 tracking-tight mb-8">Inbox</h2>

                    <div className="space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            const count = tab.id === 'all'
                                ? notifications.filter(n => !n.read).length
                                : notifications.filter(n => {
                                    if (!n.read) {
                                        if (tab.id === 'invites') return n.type === 'invite' || n.type === 'workspace_invite'
                                        if (tab.id === 'assignments') return n.type === 'assignment' || n.type === 'task_assignment'
                                        return n.type === tab.id.slice(0, -1)
                                    }
                                    return false
                                }).length

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${activeTab === tab.id
                                        ? 'bg-[#f3f4ff] dark:bg-indigo-500/10 text-[#6366f1] font-black'
                                        : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100 font-bold'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={activeTab === tab.id ? 'text-[#6366f1]' : 'text-gray-400 dark:group-hover:text-gray-600'} />
                                        <span className="text-xs uppercase tracking-widest leading-none mt-0.5">{tab.label}</span>
                                    </div>
                                    {count > 0 && (
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${activeTab === tab.id ? 'bg-[#6366f1] text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-auto p-8 border-t border-gray-100 dark:border-slate-800/20">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 font-bold hover:text-gray-900 dark:hover:text-slate-100 transition-all">
                        <Archive size={18} />
                        <span className="text-xs uppercase tracking-widest">Archived</span>
                    </button>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 flex flex-col bg-[#fcfcfd] dark:bg-slate-900/10">
                {/* Header Actions */}
                <div className="p-6 px-10 border-b border-gray-100 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6366f1] transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                className="pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold w-64 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                            />
                        </div>
                        <button className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all">
                            <Filter size={16} className="text-gray-400" />
                        </button>
                    </div>

                    <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-black text-[#6366f1] uppercase tracking-widest hover:underline px-4"
                    >
                        Mark all as read
                    </button>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto px-10 py-6 space-y-3 custom-scrollbar">
                    {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`group flex items-start gap-4 p-5 rounded-[32px] transition-all border ${notif.read
                                ? 'bg-transparent border-gray-50 dark:border-slate-800/30'
                                : 'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 shadow-sm shadow-indigo-100/20'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-50 dark:bg-slate-800' : 'bg-[#f3f4ff] dark:bg-indigo-500/10'}`}>
                                {getIcon(notif.type)}
                            </div>

                            <div className="flex-1 pt-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                        {notif.type} • {format(new Date(notif.created_at), 'MMM dd, HH:mm')}
                                    </span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-all">
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-all">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className={`text-[15px] leading-relaxed ${notif.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100 font-bold'}`}>
                                    {notif.message}
                                </p>

                                {(notif.type === 'workspace_invite' || notif.type === 'invite' || notif.type === 'project_invite') && !notif.read && (
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            disabled={!!processingId}
                                            onClick={() => handleInvitation(notif.id, notif.related_id, true)}
                                            className="px-6 py-2 bg-[#6366f1] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5558e3] transition-all shadow-lg shadow-[#6366f1]/20 active:scale-95 disabled:opacity-50"
                                        >
                                            {processingId === notif.id ? 'Processing...' : 'Accept Invitation'}
                                        </button>
                                        <button
                                            disabled={!!processingId}
                                            onClick={() => handleInvitation(notif.id, notif.related_id, false)}
                                            className="px-6 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 py-40">
                            <div className="w-20 h-20 rounded-[30px] bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                <Bell size={32} className="text-gray-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1">All clear</p>
                                <p className="text-xs font-bold text-gray-400">No new notifications in this category</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
