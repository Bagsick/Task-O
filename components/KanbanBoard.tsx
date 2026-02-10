'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { supabase } from '@/lib/supabase/client'
import { Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import Modal from './ui/Modal'
import TaskDetailDrawer from './projects/TaskDetailDrawer'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
  assigned_to?: string
  assignee?: {
    full_name?: string
    email?: string
  }
}

interface KanbanBoardProps {
  projectId?: string
  teamId?: string
  userId?: string
  tasks?: Task[]
  canManage?: boolean
}

const COLUMNS = [
  { id: 'pending', title: 'Pending' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
]

export default function KanbanBoard({ projectId, teamId, userId, tasks: initialTasks, canManage = false }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || [])
  const [loading, setLoading] = useState(!initialTasks)
  const [winReady, setWinReady] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    setWinReady(true)
    if (initialTasks) {
      setTasks(initialTasks)
      setLoading(false)
    } else {
      fetchTasks()
    }
  }, [projectId, teamId, userId, initialTasks])

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to (
            id,
            full_name,
            email
          )
        `)

      if (projectId) {
        query = query.eq('project_id', projectId)
      } else if (teamId) {
        query = query.eq('team_id', teamId)
      } else if (userId) {
        query = query.eq('assigned_to', userId)
      }

      const { data, error } = await query
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = destination.droppableId
    const task = tasks.find((t) => t.id === draggableId)
    if (!task) return

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      )
    )

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', draggableId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating task status:', error)
      fetchTasks() // Revert to server state on error
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500'
      case 'medium': return 'border-l-4 border-l-yellow-500'
      case 'low': return 'border-l-4 border-l-blue-500'
      default: return 'border-l-4 border-l-gray-300'
    }
  }

  if (!winReady) return null

  if (loading) {
    return <div className="flex justify-center py-12 text-[10px] font-black uppercase tracking-widest text-gray-400">Loading board...</div>
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id)

          return (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                  {column.title}
                </h3>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-gray-500">
                  {columnTasks.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 min-h-[500px] rounded-[32px] p-4 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : 'bg-gray-50/50 dark:bg-slate-900/40'
                      }`}
                  >
                    <div className="space-y-4">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group bg-white dark:bg-slate-950 p-6 rounded-[28px] shadow-sm ${getPriorityColor(
                                task.priority
                              )} ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 ring-2 ring-[#6366f1]/20' : ''} border border-gray-100 dark:border-slate-800 transition-all hover:border-[#6366f1]/30 cursor-pointer`}
                              onClick={() => setSelectedTask(task)}
                            >
                              <div className="flex flex-col gap-3">
                                <h4 className="text-[14px] font-black text-gray-900 dark:text-slate-100 mb-1 leading-tight group-hover:text-[#6366f1] transition-colors uppercase tracking-tightest">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500 line-clamp-2 italic leading-relaxed font-bold">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mt-2">
                                  {task.due_date && (
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${new Date(task.due_date) < new Date() && task.status !== 'completed'
                                      ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
                                      : 'bg-gray-50 text-gray-400 dark:bg-slate-800'
                                      }`}>
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(task.due_date), 'MMM dd')}
                                    </div>
                                  )}
                                  {task.assignee && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[9px] text-[#6366f1] border border-indigo-100 dark:border-indigo-500/20">
                                        {task.assignee.full_name?.[0] || 'U'}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Insight"
      >
        {selectedTask && (
          <TaskDetailDrawer
            task={selectedTask}
            projectId={projectId || ''}
            canManage={canManage}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </Modal>
    </DragDropContext>
  )
}
