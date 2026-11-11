// Client boundary: the slider tracks the visitor's drag and focus in the browser.
'use client';

import { useId, useState } from 'react';

import { cn } from '@/lib/utils';

import { CalmFace } from './CalmFace';

/** The keys that move a range input; only these answer from the keyboard. */
const sliderKeys = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

/** The level word for a calm value: equal stretches of the slider, one per word. */
export function calmLevel(levels: readonly string[], value: number): string {
  const index = Math.min(levels.length - 1, Math.floor((value / 100) * levels.length));
  return levels[index] ?? '';
}

/**
 * A slider in the spirit of an emoji slider sticker: the brand face rides along
 * a track that fills as it moves, changes expression with the value, and lifts
 * and grows while it is held. A native range input sits invisibly on top, so
 * touch, mouse, keyboard, and screen readers all work as on any slider.
 *
 * `onChange` follows every movement; `onCommit` runs once the visitor lets go,
 * which is when the answer is saved.
 */
export function CalmSlider({
  value,
  question,
  hint,
  levels,
  note,
  onChange,
  onCommit,
}: {
  /** Null until the visitor first answers; the face then rests in the middle. */
  value: number | null;
  question: string;
  hint: string;
  levels: readonly string[];
  /** A short status, such as "Saved", shown in place of the level word for a moment. */
  note: string | null;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  const questionId = useId();
  const [holding, setHolding] = useState(false);
  const shown = value ?? 50;
  const level = calmLevel(levels, shown);
  // The face's center travels from half a face in from the left to half a face in from the right.
  const along = `calc(1.75rem + (100% - 3.5rem) * ${shown / 100})`;
  const release = () => {
    if (!holding) return;
    setHolding(false);
    onCommit(shown);
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-card px-5 pt-5 pb-4 text-center shadow-sm ring-1 ring-foreground/8">
      <p id={questionId} className="text-base leading-snug text-foreground">
        {question}
      </p>
      <div className="relative h-16 touch-pan-y select-none">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={shown}
          aria-labelledby={questionId}
          aria-valuetext={level}
          onChange={(event) => onChange(Number(event.target.value))}
          onPointerDown={() => setHolding(true)}
          onPointerUp={release}
          onPointerCancel={release}
          onKeyUp={(event) => {
            if (sliderKeys.has(event.key)) onCommit(shown);
          }}
          onBlur={() => setHolding(false)}
          className="calm-range peer absolute inset-0 z-10 size-full cursor-grab opacity-0 active:cursor-grabbing"
        />
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-foreground/8">
          {/* The fill warms from the brand yellow into orange across the whole track,
              so it grows warmer as the face moves toward calm and happy. */}
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-sun to-sun-warm"
            style={{ clipPath: `inset(0 calc(100% - ${along}) 0 0 round 999px)` }}
          />
        </div>
        <div
          className="pointer-events-none absolute top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card"
          style={{ left: along }}
        >
          <CalmFace
            value={shown}
            className={cn(
              'size-full drop-shadow-md transition-transform duration-300 ease-spring motion-reduce:transition-none',
              holding && '-translate-y-2 scale-125',
            )}
          />
        </div>
      </div>
      <p aria-hidden className="min-h-5 text-sm text-muted-foreground">
        {note ?? (value === null ? hint : level)}
      </p>
      <p aria-live="polite" className="sr-only">
        {note}
      </p>
    </div>
  );
}
