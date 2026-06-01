import type { FooterSection } from '@/pods/layout'

interface FooterProps {
  content: FooterSection
}

export default function Footer({ content }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">{content.copyRight}</p>
        {content.privacyPolicy && (
          <a href={content.privacyPolicy.url} className="nav-link text-sm">
            {content.privacyPolicy.label}
          </a>
        )}
      </div>
    </footer>
  )
}
