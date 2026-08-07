import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Box, Divider, Link, PaperText, Scroll } from '@calm/ui';

const components: Components = {
  h1: ({ children }) => (
    <PaperText variant="headlineMedium" accessibilityRole="header" accessibilityLevel={1}>
      {children}
    </PaperText>
  ),
  h2: ({ children }) => (
    <PaperText variant="headlineSmall" accessibilityRole="header" accessibilityLevel={2}>
      {children}
    </PaperText>
  ),
  h3: ({ children }) => (
    <PaperText variant="titleLarge" accessibilityRole="header" accessibilityLevel={3}>
      {children}
    </PaperText>
  ),
  p: ({ children }) => <PaperText variant="bodyLarge">{children}</PaperText>,
  a: ({ href, children }) => (
    <Link href={href ?? '#'} external={href?.startsWith('http')}>
      {children}
    </Link>
  ),
  ul: ({ children }) => <Box className="markdown-list">{children}</Box>,
  ol: ({ children }) => <Box className="markdown-list markdown-list-ordered">{children}</Box>,
  li: ({ children }) => (
    <Box className="markdown-list-item">
      <PaperText variant="bodyLarge">-</PaperText>
      <PaperText variant="bodyLarge">{children}</PaperText>
    </Box>
  ),
  table: ({ children }) => (
    <Scroll horizontal className="markdown-table-scroll">
      <Box className="markdown-table">{children}</Box>
    </Scroll>
  ),
  thead: ({ children }) => <Box className="markdown-table-head">{children}</Box>,
  tbody: ({ children }) => <Box>{children}</Box>,
  tr: ({ children }) => <Box className="markdown-table-row">{children}</Box>,
  th: ({ children }) => (
    <Box className="markdown-table-cell markdown-table-header">
      <PaperText variant="labelLarge">{children}</PaperText>
    </Box>
  ),
  td: ({ children }) => (
    <Box className="markdown-table-cell">
      <PaperText variant="bodyMedium">{children}</PaperText>
    </Box>
  ),
  blockquote: ({ children }) => <Box className="markdown-quote">{children}</Box>,
  code: ({ children }) => (
    <PaperText variant="bodyMedium" className="markdown-code">
      {children}
    </PaperText>
  ),
  pre: ({ children }) => <Box className="markdown-pre">{children}</Box>,
  strong: ({ children }) => <PaperText variant="bodyLarge">{children}</PaperText>,
  em: ({ children }) => <PaperText variant="bodyLarge">{children}</PaperText>,
  hr: () => <Divider />,
};

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
