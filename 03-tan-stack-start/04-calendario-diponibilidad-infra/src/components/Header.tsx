import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import type { HeaderSection } from '@/pods/layout'

interface HeaderProps {
  content: HeaderSection
}

export default function Header({ content }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <Link
          to="/"
          className="flex flex-shrink-0 items-center gap-2 no-underline"
        >
          {content.logo?.url && (
            <img
              src={content.logo.url}
              alt={content.villaName}
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
          <span className="text-base font-semibold tracking-tight text-[var(--sea-ink)]">
            {content.villaName}
          </span>
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold sm:order-none sm:ml-auto sm:w-auto sm:flex-nowrap">
          {content.navigationLinks.map((link) => (
            <a key={link.id} href={link.url} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
