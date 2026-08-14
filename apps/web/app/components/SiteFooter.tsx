import Link from 'next/link';

const externalRepository = 'https://github.com/Litenova-Solutions/Calm-in-the-Rush';

const linkClass =
  'rounded-md text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <p className="text-sm text-muted-foreground">Calm in the Rush</p>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
        >
          <Link href="/requirements" className={linkClass}>
            Requirements
          </Link>
          <Link href="/evidence" className={linkClass}>
            Evidence
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/credits" className={linkClass}>
            Credits
          </Link>
          <a
            href={externalRepository}
            rel="noreferrer noopener"
            target="_blank"
            className={linkClass}
          >
            GitHub
          </a>
          <Link href="/license" className={linkClass}>
            License
          </Link>
        </nav>
      </div>
    </footer>
  );
}
