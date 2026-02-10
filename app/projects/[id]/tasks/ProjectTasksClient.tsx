'use client'

import { useState } from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import TaskTimeline from '@/components/projects/TaskTimeline'
import EditTaskModal from '@/components/projects/EditTaskModal'
import CreateTaskModal from '@/components/projects/CreateTaskModal'

interface ProjectTasksClientProps {
    projectId: string
    tasks: any[]
    canManage: boolean
}

export default function ProjectTasksClient({ projectId, tasks, canManage }: ProjectTasksClientProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 pb-32">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="relative group max-w-sm flex-1">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-[#6366f1] transition-colors">
                        <Search size={14} />
                    </span>
                    <input
                        type="text"
                        placeholder="Scan objectives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#6366f1]/10 focus:border-[#6366f1] outline-none transition-all text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-slate-100"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-slate-100 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 transition-all">
                        <Filter size={14} /> Sequence
                    </button>
                    {canManage && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-6 py-2.5 bg-[#6366f1] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5558e3] transition-all flex items-center gap-2 shadow-lg shadow-[#6366f1]/20 active:scale-95"
                        >
                            <Plus size={16} /> New Objective
                        </button>
                    )}
                </div>
            </div>

            {/* Interactive Timeline View */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <TaskTimeline
                    tasks={filteredTasks}
                    onTaskClick={(task) => setSelectedTask(task)}
                />
            </div>

            {/* Task Management Modals */}
            {selectedTask && (
                <EditTaskModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    onUpdate={() => {
                        // In a real app we'd refresh or use state sync
                        window.location.reload()
                    }}
                />
            )}

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                initialProjectId={projectId}
                onSuccess={() => window.location.reload()}
            />
        </div>
    )
}

