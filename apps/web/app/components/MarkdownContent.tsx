import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const linkClass =
  'rounded-md font-medium underline underline-offset-4 hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

/**
 * Long-form content maps to semantic HTML with one named typography treatment.
 * Tables and rules use the installed primitives so they match the rest of the UI.
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-2xl font-normal tracking-tight first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-3 text-xl font-medium tracking-tight first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-2 text-lg font-medium tracking-tight first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-4 leading-relaxed last:mb-0">{children}</p>,
  a: ({ href, children }) =>
    href?.startsWith('http') ? (
      <a href={href} rel="noreferrer noopener" target="_blank" className={linkClass}>
        {children}
      </a>
    ) : (
      <a href={href ?? '#'} className={linkClass}>
        {children}
      </a>
    ),
  ul: ({ children }) => <ul className="mb-4 flex list-disc flex-col gap-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 flex list-decimal flex-col gap-2 pl-6">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // The forked Table owns the keyboard-accessible scroll region, so the mapping
  // only supplies spacing.
  table: ({ children }) => (
    <div className="mb-6">
      <Table>{children}</Table>
    </div>
  ),
  thead: ({ children }) => <TableHeader>{children}</TableHeader>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => <TableHead>{children}</TableHead>,
  td: ({ children }) => <TableCell>{children}</TableCell>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-border pl-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
  ),
  pre: ({ children }) => (
    <pre
      tabIndex={0}
      className="mb-4 overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {children}
    </pre>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  hr: () => <Separator className="my-8" />,
};

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
