'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Table2, 
  Trophy,
  Users,
  Upload,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import type { AdminRole } from '@/lib/types'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: AdminRole[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Fixtures', href: '/admin/fixtures', icon: Calendar },
  { name: 'Results', href: '/admin/results', icon: Trophy },
  { name: 'Standings', href: '/admin/standings', icon: Table2 },
  { name: 'Teams', href: '/admin/teams', icon: Shield },
  { name: 'Batch Upload', href: '/admin/batch', icon: Upload, roles: ['super_admin', 'editor'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['super_admin'] },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { session, logout } = useAuth()

  const filteredNav = navigation.filter(item => {
    if (!item.roles) return true
    return session && item.roles.includes(session.role)
  })

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Trophy className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">FKF Admin</p>
          <p className="text-xs text-sidebar-foreground/60">Season 2025/2026</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      {session && (
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 rounded-lg bg-sidebar-accent/30 p-3">
            <p className="text-sm font-medium text-sidebar-foreground">{session.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{session.email}</p>
            <span className="mt-1 inline-block rounded bg-sidebar-primary/20 px-2 py-0.5 text-xs font-medium capitalize text-sidebar-primary">
              {session.role.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/80">
                <Settings className="h-4 w-4" />
                View Site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sidebar-foreground/80"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  )
}
