import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, ExternalLink, Monitor, Calendar, MessageSquare, AlertTriangle, Shield, CheckCircle2, History } from 'lucide-react'
import { format } from 'date-fns'
import { addSupportComment, updateSupportStatus, updateSupportSeverity } from '@/lib/support/actions'
import { revalidatePath } from 'next/cache'

const statusColors: Record<string, string> = {
    'Open': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    'Reviewed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Resolved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Closed': 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
}

export default async function AdminSupportDetail({ params }: { params: { id: string } }) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('users').select('is_platform_admin').eq('id', user.id).single()
    if (!profile?.is_platform_admin) redirect('/dashboard')

    // Fetch support request
    const { data: request } = await supabase
        .from('support_requests')
        .select(`
            *,
            user:user_id (id, full_name, email, avatar_url)
        `)
        .eq('id', params.id)
        .single()

    if (!request) notFound()

    // Fetch all comments (including admin notes)
    const { data: comments } = await supabase
        .from('support_comments')
        .select(`
            *,
            user:user_id (id, full_name, avatar_url)
        `)
        .eq('request_id', params.id)
        .order('created_at', { ascending: true })

    // Fetch activity log
    const { data: activity } = await supabase
        .from('support_activity_log')
        .select(`
            *,
            user:user_id (id, full_name)
        `)
        .eq('request_id', params.id)
        .order('created_at', { ascending: true })

    async function handleStatusChange(formData: FormData) {
        'use server'
        const status = formData.get('status') as string
        await updateSupportStatus(params.id, status)
    }

    async function handleSeverityChange(formData: FormData) {
        'use server'
        const severity = formData.get('severity') as string
        await updateSupportSeverity(params.id, severity)
    }

    async function handleAdminAction(formData: FormData) {
        'use server'
        const content = formData.get('admin_note') as string
        if (!content) return
        await addSupportComment(params.id, content, true)
        revalidatePath(`/admin/support/${params.id}`)
    }

    async function handlePublicReply(formData: FormData) {
        'use server'
        const content = formData.get('reply') as string
        if (!content) return
        await addSupportComment(params.id, content, false)
        revalidatePath(`/admin/support/${params.id}`)
    }

    return (
        <div className="max-w-[1600px] mx-auto p-6 lg:p-10 pb-20">
            <Link
                href="/admin/support"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white font-bold mb-8 transition-colors group"
            >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                Back to Support Management
            </Link>

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[#0077B6] tracking-widest">{request.ticket_id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[request.status]}`}>
                            {request.status}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{request.title}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <form action={handleStatusChange}>
                        <select
                            name="status"
                            defaultValue={request.status}
                            onBlur={(e) => e.target.form?.requestSubmit()}
                            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-[#0077B6]/10"
                        >
                            {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </form>
                    <form action={handleSeverityChange}>
                        <select
                            name="severity"
                            defaultValue={request.severity}
                            onBlur={(e) => e.target.form?.requestSubmit()}
                            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-[#0077B6]/10"
                        >
                            {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </form>
                    <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 text-xs">
                        Mark Resolved
                    </button>
                    <button className="px-6 py-3 bg-gray-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 text-xs">
                        Close Request
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Request Content & Conversation */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 space-y-10 shadow-sm">
                        <div>
                            <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Description</h3>
                            <div className="text-gray-900 dark:text-white font-medium whitespace-pre-wrap leading-relaxed">
                                {request.description}
                            </div>
                        </div>

                        {request.steps_to_reproduce && (
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Steps to Reproduce</h3>
                                <div className="text-gray-900 dark:text-white font-medium whitespace-pre-wrap leading-relaxed">
                                    {request.steps_to_reproduce}
                                </div>
                            </div>
                        )}

                        {request.expected_result && (
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Expected Result</h3>
                                <div className="text-gray-900 dark:text-white font-medium whitespace-pre-wrap leading-relaxed">
                                    {request.expected_result}
                                </div>
                            </div>
                        )}

                        {request.screenshot_url && (
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Screenshot</h3>
                                <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
                                    <img src={request.screenshot_url} alt="Support" className="w-full h-auto" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Conversation & Replies */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="text-[#0077B6]" size={20} />
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Request Timeline & Chat</h2>
                        </div>

                        <div className="space-y-6">
                            {comments?.map((comment) => (
                                <div key={comment.id} className={`flex gap-4 ${comment.is_admin_note ? 'bg-amber-50/50 dark:bg-amber-900/5 p-4 rounded-3xl border border-amber-100 dark:border-amber-900/20' : ''}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${comment.is_admin_note ? 'bg-amber-500 text-white font-black' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                        {comment.is_admin_note ? 'AN' : comment.user.avatar_url ? <img src={comment.user.avatar_url} className="w-full h-full object-cover" /> : <User className="text-gray-400" size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{comment.user.full_name}</span>
                                            {comment.is_admin_note && <span className="text-[9px] font-black uppercase tracking-widest bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-md">Admin Note</span>}
                                            <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500">{format(new Date(comment.created_at), 'MMM dd, HH:mm')}</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{comment.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Forms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-100 dark:border-slate-800">
                            {/* Public Reply */}
                            <form action={handlePublicReply} className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Public Reply (User will see)</h3>
                                <textarea
                                    name="reply"
                                    rows={4}
                                    placeholder="Type your reply to the user..."
                                    className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-[#0077B6]/10 text-sm font-medium outline-none transition-all resize-none"
                                />
                                <button className="w-full py-4 bg-[#0077B6] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">
                                    Send Reply
                                </button>
                            </form>

                            {/* Admin Note */}
                            <form action={handleAdminAction} className="space-y-4">
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Internal Admin Note (Private)</h3>
                                <textarea
                                    name="admin_note"
                                    rows={4}
                                    placeholder="Internal thoughts or status updates..."
                                    className="w-full px-6 py-4 bg-amber-50/20 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-900/20 rounded-2xl focus:ring-4 focus:ring-amber-500/10 text-sm font-medium outline-none transition-all resize-none"
                                />
                                <button className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">
                                    Save Note
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Side Panel: User & System Info */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Reporter Info */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6">Reported By</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-xl font-black">
                                {request.user.full_name?.[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{request.user.full_name}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{request.user.email}</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <ExternalLink size={12} className="text-gray-400" />
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Page URL</p>
                                </div>
                                <p className="text-[11px] font-bold text-[#0077B6] truncate">{request.page_url || 'N/A'}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Monitor size={12} className="text-gray-400" />
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Browser Info</p>
                                </div>
                                <div className="text-[10px] font-medium text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                    {request.browser_info ? (
                                        <pre className="whitespace-pre-wrap">{JSON.stringify(request.browser_info, null, 2)}</pre>
                                    ) : 'No info captured'}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar size={12} className="text-gray-400" />
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Submitted Date</p>
                                </div>
                                <p className="text-xs font-bold text-gray-800 dark:text-white">{format(new Date(request.created_at), 'PPP p')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity History */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <History className="text-gray-400" size={18} />
                            <h3 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Activity Log</h3>
                        </div>
                        <div className="space-y-6">
                            {activity?.map((log, idx) => (
                                <div key={log.id} className="relative flex gap-4">
                                    {idx !== activity.length - 1 && <div className="absolute left-[11px] top-6 w-0.5 h-full bg-gray-50 dark:bg-slate-800" />}
                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 z-10 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0077B6]" />
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">
                                            {log.action}
                                            {log.to_value && <span className="text-[#0077B6]"> → {log.to_value}</span>}
                                        </p>
                                        <p className="text-[9px] font-medium text-gray-500 dark:text-slate-600 mt-1">
                                            by {log.user.full_name} • {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
