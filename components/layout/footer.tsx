import Link from 'next/link'
import { Trophy } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">FKF League Management</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/fixtures" className="hover:text-foreground transition-colors">
              Fixtures
            </Link>
            <Link href="/standings" className="hover:text-foreground transition-colors">
              Standings
            </Link>
            <Link href="/results" className="hover:text-foreground transition-colors">
              Results
            </Link>
            <Link href="/teams" className="hover:text-foreground transition-colors">
              Teams
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Season 2025/2026
          </p>
        </div>
        
        <div className="mt-6 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Football Kenya Federation - Nyanza Regional League &amp; Women National Super League
          </p>
        </div>
      </div>
    </footer>
  )
}
