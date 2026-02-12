import React from 'react'

export const CompletedTasksIcon = ({ size = 48 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-completed-final" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7" />
                <stop offset="1" stopColor="#7E22CE" />
            </linearGradient>
            <filter id="glow-p-final" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <path d="M16 34L26 44L48 22" stroke="url(#grad-completed-final)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-p-final)" />
        <circle cx="50" cy="18" r="3" fill="white" fillOpacity="0.4" />
    </svg>
)

export const AssignedTasksIcon = ({ size = 48 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-assigned-final" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
            <filter id="glow-b-final" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <g filter="url(#glow-b-final)">
            <path d="M14 18H50M14 32H44M14 46H34" stroke="url(#grad-assigned-final)" strokeWidth="7" strokeLinecap="round" />
        </g>
        <rect x="42" y="44" width="8" height="8" rx="2" fill="#3B82F6" fillOpacity="0.5" />
    </svg>
)

export const AllBoardsIcon = ({ size = 48 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-boards-final" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818CF8" />
                <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
        </defs>
        <rect x="12" y="12" width="16" height="16" rx="4" fill="url(#grad-boards-final)" />
        <rect x="36" y="12" width="16" height="40" rx="4" fill="url(#grad-boards-final)" fillOpacity="0.3" />
        <rect x="12" y="36" width="16" height="16" rx="4" fill="url(#grad-boards-final)" fillOpacity="0.6" />
    </svg>
)

export const ScheduledTasksIcon = ({ size = 48 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-scheduled-final" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F472B6" />
                <stop offset="1" stopColor="#DB2777" />
            </linearGradient>
            <filter id="glow-pink-final" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <g filter="url(#glow-pink-final)">
            <circle cx="32" cy="32" r="18" stroke="url(#grad-scheduled-final)" strokeWidth="7" />
            <path d="M32 20V32L40 40" stroke="url(#grad-scheduled-final)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <circle cx="50" cy="14" r="2.5" fill="#DB2777" fillOpacity="0.7" />
    </svg>
)
