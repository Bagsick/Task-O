'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'

interface DeleteProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    projectName: string
    loading?: boolean
}

export default function DeleteProjectModal({ isOpen, onClose, onConfirm, projectName, loading }: DeleteProjectModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Project"
            helperText="Confirm permanent deletion of this project"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                    >
                        Abort
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-4 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Yes, Delete Project'}
                    </button>
                </>
            }
        >
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-[24px] flex items-center justify-center text-rose-500 mx-auto mb-8 border border-rose-100 dark:border-rose-500/20 shadow-sm">
                    <AlertTriangle size={32} />
                </div>

                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-relaxed mb-4 italic px-4">
                    Deleting this project will permanently remove <span className="text-rose-500">{projectName.toUpperCase()}</span> and all associated data.
                </p>
                <p className="text-[11px] font-bold text-gray-900 dark:text-slate-100 uppercase tracking-widest">
                    This operation is non-reversible.
                </p>
            </div>
        </Modal>
    )
}
