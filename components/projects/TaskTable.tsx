'use client'

import { format } from 'date-fns'
import { Calendar, Circle, CheckCircle2, Clock, AlertCircle, User, MoreHorizontal } from 'lucide-react'

interface Task {
    id: string
    title: string
    description?: string
    status: string
    priority?: string
    due_date?: string
    task_tag?: string
    team_name?: string
    assignee?: {
        full_name?: string
        email?: string
        avatar_url?: string
    }
}

interface TaskTableProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
}

export default function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={16} className="text-emerald-500" />
            case 'in_progress': return <Clock size={16} className="text-amber-500" />
            case 'pending': return <Circle size={16} className="text-gray-300" />
            default: return <AlertCircle size={16} className="text-gray-400" />
        }
    }

    const getPriorityStyle = (priority?: string) => {
        switch (priority) {
            case 'high': return 'bg-red-50 text-red-600 dark:bg-red-500/10'
            case 'medium': return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
            case 'low': return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
            default: return 'bg-gray-50 text-gray-500 dark:bg-slate-800'
        }
    }

    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-gray-50 dark:border-slate-800/50">
                        <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]">Task Execution</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]">Type</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]">Team</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]">Assignee</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]">Due</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.2em]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/30">
                    {tasks.map((task) => (
                        <tr
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer"
                        >
                            <td className="px-6 py-4 min-w-[300px]">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[13px] font-black text-gray-900 dark:text-slate-100 group-hover:text-[#6366f1] transition-colors uppercase tracking-tightest leading-none mb-1">{task.title}</span>
                                    {task.description && (
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate max-w-[280px] italic font-medium">{task.description}</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    {task.task_tag || 'Global'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-[10px] font-black text-[#6366f1] dark:text-indigo-400 uppercase tracking-widest whitespace-nowrap bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">
                                    {task.team_name || 'Core'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center text-[10px] text-[#6366f1] font-black shadow-sm shrink-0 overflow-hidden">
                                        {task.assignee?.avatar_url ? (
                                            <img src={task.assignee.avatar_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            task.assignee?.full_name?.[0] || 'U'
                                        )}
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-600 dark:text-slate-300 truncate max-w-[100px]">
                                        {task.assignee?.full_name || 'Anyone'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {task.due_date ? (
                                    <div className={`flex items-center gap-1.5 font-bold ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'}`}>
                                        <Calendar size={12} />
                                        <span className="text-[10px]">{format(new Date(task.due_date), 'MMM dd')}</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-300 dark:text-slate-700 italic">No deadline</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                                    <span className="text-[10px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-widest">{task.status.replace('_', ' ')}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-1.5 text-gray-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">
                                    <MoreHorizontal size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
