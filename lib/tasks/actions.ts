'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(data: {
    title: string
    description?: string
    status: string
    priority?: string
    due_date?: string
    due_time?: string
    project_id: string
    team_id?: string
    assigned_to?: string
}) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            ...data,
            created_by: user.id,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) throw error

    // 2. Send Notification if assigned
    if (data.assigned_to) {
        await supabase.from('notifications').insert({
            user_id: data.assigned_to,
            type: 'task_assignment',
            message: `You've been assigned a new task: ${data.title}`,
            related_id: task.id,
            read: false
        })
    }

    revalidatePath(`/projects/${data.project_id}`)
    revalidatePath(`/projects/${data.project_id}/tasks`)
    revalidatePath('/dashboard')

    return task
}

export async function updateTask(taskId: string, data: any) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('tasks')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

    if (error) throw error

    revalidatePath('/dashboard')
}

export async function deleteTask(taskId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) throw error

    revalidatePath('/dashboard')
}
