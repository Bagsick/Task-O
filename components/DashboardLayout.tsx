'use client'

import React from 'react'
import { supabase } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import HeaderTitle from '@/components/HeaderTitle'
import HeaderActions from '@/components/HeaderActions'
import { useRouter } from 'next/navigation'
import { Search, Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)
  const [userProfile, setUserProfile] = React.useState<any>(null)
  const { isCollapsed, setIsMobileOpen } = useSidebar()

  React.useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setUserProfile(profile)
    }
    getUser()
  }, [supabase, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#09090f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  const currentUser = {
    id: user.id,
    email: user.email || '',
    full_name: userProfile?.full_name || user.user_metadata?.full_name,
    avatar_url: userProfile?.avatar_url,
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#f0f4ff] dark:bg-[#09090f]">

      {/* ── BACKGROUNDS (untouched) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

        {/* Light mode blobs */}
        <div className="absolute dark:opacity-0 transition-opacity duration-700" style={{ top: '-20%', left: '-10%', width: '75vw', height: '75vh', background: 'radial-gradient(ellipse at 38% 38%, rgba(147,197,253,0.38) 0%, rgba(165,180,252,0.18) 45%, transparent 72%)', filter: 'blur(70px)', animation: 'aurora-drift-1 20s ease-in-out infinite alternate' }} />
        <div className="absolute dark:opacity-0 transition-opacity duration-700" style={{ bottom: '-15%', right: '-10%', width: '70vw', height: '70vh', background: 'radial-gradient(ellipse at 62% 62%, rgba(186,230,253,0.40) 0%, rgba(147,197,253,0.20) 40%, transparent 70%)', filter: 'blur(65px)', animation: 'aurora-drift-2 25s ease-in-out infinite alternate' }} />
        <div className="absolute dark:opacity-0 transition-opacity duration-700" style={{ top: '25%', left: '20%', width: '60vw', height: '55vh', background: 'radial-gradient(ellipse at 50% 50%, rgba(199,210,254,0.28) 0%, rgba(147,197,253,0.10) 55%, transparent 75%)', filter: 'blur(55px)', animation: 'aurora-drift-3 22s ease-in-out infinite alternate' }} />

        {/* Light dot grid */}
        <svg className="absolute inset-0 w-full h-full dark:opacity-0 transition-opacity duration-700" style={{ opacity: 0.14 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lm-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1.2" fill="#93c5fd" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lm-dots)" />
        </svg>
        <div className="absolute inset-0 dark:opacity-0 transition-opacity duration-700" style={{ background: 'radial-gradient(ellipse at 52% 46%, rgba(255,255,255,0.60) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 dark:opacity-0 transition-opacity duration-700" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(240,244,255,0.55) 72%, rgba(240,244,255,0.90) 100%)' }} />

        {/* Dark mode aurora */}
        <div className="absolute opacity-0 dark:opacity-100 transition-opacity duration-700" style={{ top: '-20%', left: '-10%', width: '70vw', height: '70vh', background: 'radial-gradient(ellipse at 40% 40%, rgba(20,184,166,0.22) 0%, rgba(6,182,212,0.12) 35%, transparent 70%)', filter: 'blur(60px)', animation: 'aurora-drift-1 18s ease-in-out infinite alternate' }} />
        <div className="absolute opacity-0 dark:opacity-100 transition-opacity duration-700" style={{ top: '10%', right: '-15%', width: '65vw', height: '75vh', background: 'radial-gradient(ellipse at 55% 45%, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.14) 40%, transparent 70%)', filter: 'blur(72px)', animation: 'aurora-drift-2 22s ease-in-out infinite alternate' }} />
        <div className="absolute opacity-0 dark:opacity-100 transition-opacity duration-700" style={{ bottom: '-25%', left: '20%', width: '60vw', height: '60vh', background: 'radial-gradient(ellipse at 50% 60%, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.10) 40%, transparent 70%)', filter: 'blur(80px)', animation: 'aurora-drift-3 26s ease-in-out infinite alternate' }} />
        <div className="absolute opacity-0 dark:opacity-100 transition-opacity duration-700" style={{ top: '5%', left: '30%', width: '40vw', height: '30vh', background: 'radial-gradient(ellipse at 50% 30%, rgba(45,212,191,0.13) 0%, transparent 65%)', filter: 'blur(40px)', animation: 'aurora-drift-1 14s ease-in-out infinite alternate-reverse' }} />

        {/* Dark star field */}
        <svg className="absolute inset-0 w-full h-full opacity-0 dark:opacity-60 transition-opacity duration-700" xmlns="http://www.w3.org/2000/svg" style={{ mixBlendMode: 'screen' }}>
          <defs>
            <pattern id="stars-sm" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="30" r="0.8" fill="white" fillOpacity="0.5" />
              <circle cx="45" cy="8" r="0.6" fill="white" fillOpacity="0.35" />
              <circle cx="80" cy="55" r="0.9" fill="white" fillOpacity="0.55" />
              <circle cx="110" cy="20" r="0.7" fill="white" fillOpacity="0.4" />
              <circle cx="30" cy="90" r="0.8" fill="white" fillOpacity="0.45" />
              <circle cx="95" cy="100" r="0.6" fill="white" fillOpacity="0.3" />
              <circle cx="60" cy="75" r="1.0" fill="white" fillOpacity="0.5" />
              <circle cx="15" cy="110" r="0.7" fill="white" fillOpacity="0.38" />
            </pattern>
            <pattern id="stars-lg" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="80" r="1.3" fill="white" fillOpacity="0.7" />
              <circle cx="180" cy="30" r="1.5" fill="#a5f3fc" fillOpacity="0.65" />
              <circle cx="240" cy="200" r="1.2" fill="white" fillOpacity="0.6" />
              <circle cx="120" cy="260" r="1.4" fill="#c4b5fd" fillOpacity="0.65" />
              <circle cx="290" cy="130" r="1.0" fill="white" fillOpacity="0.55" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars-sm)" />
          <rect width="100%" height="100%" fill="url(#stars-lg)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full opacity-0 dark:opacity-[0.04] transition-opacity duration-700" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="scanlines" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="4" y2="4" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#scanlines)" />
        </svg>
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes aurora-drift-1 {
          0%   { transform: translate(0, 0) scale(1);        opacity: 0.8; }
          33%  { transform: translate(4%, 3%) scale(1.06);   opacity: 1; }
          66%  { transform: translate(-3%, 5%) scale(0.97);  opacity: 0.85; }
          100% { transform: translate(5%, -2%) scale(1.04);  opacity: 0.95; }
        }
        @keyframes aurora-drift-2 {
          0%   { transform: translate(0, 0) scale(1);         opacity: 0.75; }
          33%  { transform: translate(-5%, -3%) scale(1.08);  opacity: 0.95; }
          66%  { transform: translate(3%, 6%) scale(0.95);    opacity: 0.8; }
          100% { transform: translate(-4%, 2%) scale(1.05);   opacity: 1; }
        }
        @keyframes aurora-drift-3 {
          0%   { transform: translate(0, 0) scale(1);         opacity: 0.7; }
          50%  { transform: translate(6%, -4%) scale(1.1);    opacity: 0.9; }
          100% { transform: translate(-5%, 3%) scale(0.96);   opacity: 0.75; }
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <Sidebar currentUser={currentUser} />

      {/* ── MAIN CONTENT AREA ── */}
      {/*
        Responsive left padding rules:
          mobile (< lg):  no padding — sidebar is a drawer overlay
          lg collapsed:   pl-20  (80px icon-only sidebar)
          lg expanded:    pl-64  (256px full sidebar)
      */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen relative z-10
          transition-[padding] duration-300 ease-in-out
          pl-0
          ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >

        {/* ── FLOATING HEADER ── */}
        <div className="sticky top-0 z-40 px-3 sm:px-4 lg:px-8 pt-3 sm:pt-4 lg:pt-6 pb-3 sm:pb-4 lg:pb-5">
          <header className="max-w-[1400px] mx-auto w-full">
            <div
              className="
                flex items-center backdrop-blur-2xl
                bg-white/65 border border-white/80
                shadow-[0_4px_24px_rgba(147,197,253,0.15),0_1px_3px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(255,255,255,0.85)]
                dark:bg-[rgba(15,15,28,0.72)] dark:border-[rgba(139,92,246,0.18)]
                dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.4),0_0_60px_rgba(139,92,246,0.06)]
              "
              style={{
                height: '56px',        /* mobile: a bit shorter */
                borderRadius: '16px',  /* mobile: slightly tighter radius */
                padding: '0 10px',
                gap: '8px',
              }}
              /* Override height/radius at lg via inline — Tailwind can't do arbitrary height in responsive shorthand easily */
              ref={(el) => {
                if (!el) return
                const update = () => {
                  const isLg = window.innerWidth >= 1024
                  const isSm = window.innerWidth >= 640
                  el.style.height = isLg ? '68px' : isSm ? '60px' : '52px'
                  el.style.borderRadius = isLg ? '22px' : isSm ? '18px' : '14px'
                  el.style.padding = isLg ? '0 14px' : '0 10px'
                }
                update()
                window.addEventListener('resize', update)
                return () => window.removeEventListener('resize', update)
              }}
            >
              {/* ── Mobile / tablet menu button — hidden on lg ── */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="
                  lg:hidden flex-shrink-0
                  flex items-center justify-center
                  rounded-xl transition-colors
                  bg-black/[0.05] hover:bg-black/[0.09] text-gray-500
                  dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-400
                  w-9 h-9 sm:w-10 sm:h-10
                "
              >
                <Menu size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>

              {/* ── Search box ──
                  mobile:  fills available space (flex-1), no fixed width
                  sm+:     still flex-1 but capped
                  lg+:     fixed 629px max, flex-shrink-0
              */}
              <div
                className="
                  relative group
                  flex-1 lg:flex-shrink-0 lg:flex-initial
                  h-9 sm:h-10 lg:h-[43px]
                  min-w-0
                "
                style={{
                  /* On lg+, cap at 629px; on smaller screens let it be fluid */
                  maxWidth: '100%',
                }}
                ref={(el) => {
                  if (!el) return
                  const update = () => {
                    if (window.innerWidth >= 1024) {
                      el.style.width = '629px'
                      el.style.maxWidth = 'calc(100% - 180px)'
                    } else {
                      el.style.width = 'auto'
                      el.style.maxWidth = '100%'
                    }
                  }
                  update()
                  window.addEventListener('resize', update)
                  return () => window.removeEventListener('resize', update)
                }}
              >
                <span className="
                  absolute inset-y-0 left-0 pl-3 sm:pl-4
                  flex items-center pointer-events-none transition-colors
                  text-gray-400 group-focus-within:text-blue-500
                  dark:text-slate-500 dark:group-focus-within:text-teal-400
                ">
                  <Search size={14} className="sm:w-[15px] sm:h-[15px]" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="
                    block w-full h-full
                    pl-9 sm:pl-11 pr-3 sm:pr-4
                    rounded-xl sm:rounded-[12px]
                    border transition-all
                    text-xs sm:text-sm font-medium
                    focus:outline-none focus:ring-2

                    bg-blue-50/50 border-blue-100/80
                    hover:bg-blue-50/70 focus:bg-white/90
                    text-gray-700 placeholder:text-gray-400
                    focus:ring-blue-200/60 focus:border-blue-200/80

                    dark:bg-white/[0.05] dark:border-white/[0.07]
                    dark:hover:bg-white/[0.08] dark:focus:bg-white/[0.08]
                    dark:text-slate-200 dark:placeholder:text-slate-600
                    dark:focus:ring-teal-400/25 dark:focus:border-teal-400/30
                  "
                />
              </div>

              {/* ── Spacer — only meaningful on lg where search has fixed width ── */}
              <div className="hidden lg:block flex-1 min-w-[16px]" />

              {/* ── Right actions ── */}
              <div className="flex items-center flex-shrink-0 gap-1.5 sm:gap-2 pr-0.5 sm:pr-1">
                <HeaderActions currentUser={currentUser} />
              </div>
            </div>
          </header>
        </div>

        {/* ── PAGE CONTENT ── */}
        {/*
          Padding scale:
            mobile:  px-3  py-3   (tight, thumb-friendly)
            sm:      px-4  py-4
            lg:      px-8  py-8   (desktop breathing room)
        */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}