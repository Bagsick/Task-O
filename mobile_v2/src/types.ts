export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high' | null

export type TaskItem = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  project_id: string | null
  assigned_to: string | null
  created_by: string
  created_at: string
}

export type ProjectItem = {
  id: string
  name: string
  description: string | null
  status: 'active' | 'on_hold' | 'completed'
  owner_id: string
  created_at: string
}

export type NotificationItem = {
  id: string
  user_id: string
  type: string
  message: string
  read: boolean
  created_at: string
}
