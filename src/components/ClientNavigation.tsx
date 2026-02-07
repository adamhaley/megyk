'use client'

import dynamic from 'next/dynamic'

// Client-only imports to avoid hydration mismatches with MUI
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false })
const MobileNav = dynamic(() => import('@/components/MobileNav'), { ssr: false })

export { Sidebar, MobileNav }
