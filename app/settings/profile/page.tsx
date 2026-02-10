import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'
import { User, Shield, Zap } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-start pt-16 pb-24 px-6 gap-12 animate-in fade-in duration-1000">
            {/* Minimalist Profile Header */}
            <div className="w-full max-w-4xl flex flex-col items-center text-center gap-6">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[48px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-32 h-32 rounded-[44px] bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl font-black text-indigo-400 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user.email?.[0].toUpperCase()
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tightest bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        {userProfile?.full_name || 'Anonymous User'}
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Shield size={12} className="text-indigo-500" /> Member since {new Date(userProfile?.created_at).getFullYear()}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                            <Zap size={12} fill="currentColor" /> Pro Tier
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Content Container */}
            <div className="w-full max-w-5xl bg-slate-900/40 border border-slate-800/50 rounded-[48px] backdrop-blur-3xl shadow-2xl p-2 md:p-6 overflow-hidden">
                <div className="bg-slate-950/40 rounded-[40px] border border-slate-800/30 p-8 md:p-12">
                    <SettingsForm user={user} userProfile={userProfile} />
                </div>
            </div>

            {/* Minimalist Footer Hint */}
            <div className="text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Principal Engineer Standard &bull; Task-O Core</p>
            </div>
        </div>
    )
}
