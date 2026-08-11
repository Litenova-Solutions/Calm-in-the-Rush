import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * One typography treatment for hand-authored long-form content, matching the
 * Markdown mapping. Pages compose these instead of repeating class strings.
 */
export function ProseHeading({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-3 text-xl font-medium tracking-tight first:mt-0">{children}</h2>;
}

export function ProseText({ children }: { children: ReactNode }) {
  return <p className="mb-4 leading-relaxed last:mb-0">{children}</p>;
}

const linkClass =
  'rounded-md font-medium underline underline-offset-4 hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

export function ProseLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith('http')) {
    return (
      <a href={href} rel="noreferrer noopener" target="_blank" className={linkClass}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export function ProseList({ children }: { children: ReactNode }) {
  return <ul className="mb-4 flex list-disc flex-col gap-2 pl-6">{children}</ul>;
}
