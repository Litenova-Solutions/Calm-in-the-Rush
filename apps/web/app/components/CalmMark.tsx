import { Waves } from 'lucide-react';

/** The brand mark. The wordmark beside it stays plain text so it scales with the type. */
export function CalmMark({ className }: { className?: string }) {
  return <Waves aria-hidden className={className} />;
}
