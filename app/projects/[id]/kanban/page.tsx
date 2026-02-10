import ProjectKanbanClient from './ProjectKanbanClient'

export default async function ProjectKanbanPage({
    params,
}: {
    params: { id: string }
}) {
    return <ProjectKanbanClient projectId={params.id} />
}
