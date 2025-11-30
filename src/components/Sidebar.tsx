'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface SidebarProps {
  userEmail: string | undefined
}

const navigationLinks = [
  {
    name: 'Book Summaries',
    href: '/books',
    icon: BookOpenIcon,
  },
  {
    name: 'Sales Campaign',
    href: '/sales-campaign',
    icon: ChartBarIcon,
  },
]

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Megyk</h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationLinks.map((link) => {
          const isActive = pathname.startsWith(link.href)
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 -ml-4 pl-4'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="h-5 w-5 mr-3" />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* User info + Sign out */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex flex-col space-y-3">
          <span className="text-sm text-gray-700 truncate" title={userEmail}>
            {userEmail}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full text-left text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
