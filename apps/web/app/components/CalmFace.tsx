import { cn } from '@/lib/utils';

/**
 * The brand smiley drawn for any calm value from 0 (not calm: a small frown) to
 * 100 (completely calm: the logo's wide smile with closed, content eyes). The
 * mouth blends smoothly between five key expressions, so a slider can move the
 * face continuously. Geometry follows the RiR smiley logo: a yellow disc and a
 * heavy black mouth.
 */
const keyMouths = [
  { w: 15, s: -8, y: 73 },
  { w: 14, s: -2.5, y: 70 },
  { w: 14, s: 0, y: 68 },
  { w: 21, s: 8, y: 63 },
  { w: 33.8, s: 20.7, y: 61.6 },
] as const;

/** Above this value the eyes close into content arcs. */
const closedEyesFrom = 88;

function mouthPath(value: number): string {
  const position = (Math.min(100, Math.max(0, value)) / 100) * (keyMouths.length - 1);
  const index = Math.min(keyMouths.length - 2, Math.floor(position));
  const t = position - index;
  const from = keyMouths[index]!;
  const to = keyMouths[index + 1]!;
  const w = from.w + (to.w - from.w) * t;
  const s = from.s + (to.s - from.s) * t;
  const y = from.y + (to.y - from.y) * t;
  const x1 = (50 - w).toFixed(2);
  const x2 = (50 + w).toFixed(2);
  if (Math.abs(s) < 0.25) return `M${x1} ${y.toFixed(2)}H${x2}`;
  const radius = ((w * w + s * s) / (2 * Math.abs(s))).toFixed(2);
  return `M${x1} ${y.toFixed(2)}A${radius} ${radius} 0 0 ${s > 0 ? 0 : 1} ${x2} ${y.toFixed(2)}`;
}

export function CalmFace({ value, className }: { value: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('block', className)} aria-hidden>
      <circle cx="50" cy="50" r="48" fill="var(--brand-sun)" />
      {value >= closedEyesFrom ? (
        <path
          d="M30.5 46A7 7 0 0 1 43.5 46M56.5 46A7 7 0 0 1 69.5 46"
          fill="none"
          stroke="var(--brand-ink)"
          strokeWidth="4.6"
          strokeLinecap="round"
        />
      ) : (
        <g fill="var(--brand-ink)">
          <ellipse cx="37" cy="43" rx="5" ry="6.6" />
          <ellipse cx="63" cy="43" rx="5" ry="6.6" />
        </g>
      )}
      <path
        d={mouthPath(value)}
        fill="none"
        stroke="var(--brand-ink)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
