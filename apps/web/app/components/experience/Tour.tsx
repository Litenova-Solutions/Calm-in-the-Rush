'use client';

import { type RefObject, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { TourCopy, TourTarget } from '@/lib/content/strings';
import { cn } from '@/lib/utils';

/** Shared look for cards that float over the app: the tour, the install prompt, messages. */
export const floatingCardClass =
  'absolute inset-x-3 rounded-2xl bg-background/95 p-5 shadow-xl ring-1 ring-foreground/8 backdrop-blur-xl';

const tourKey = 'calm:tour-complete';

export function isTourComplete(): boolean {
  try {
    return window.localStorage.getItem(tourKey) === '1';
  } catch {
    return false;
  }
}

export function markTourComplete(): void {
  try {
    window.localStorage.setItem(tourKey, '1');
  } catch {
    // Storage can be blocked; the tour then shows again on the next visit.
  }
}

/** Bar controls are round, so the spotlight around them is a circle with a little air. */
const roundTargets: ReadonlySet<TourTarget> = new Set(['sound', 'logo', 'gallery']);
const roundPadding = 4;

type Spot = { left: number; top: number; width: number; height: number };

/** Finds `[data-tour=target]` inside the container and tracks its box relative to it. */
function useSpot(container: RefObject<HTMLElement | null>, target: TourTarget): Spot | null {
  const [spot, setSpot] = useState<Spot | null>(null);

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    let frame = 0;
    let attempts = 0;
    const measure = () => {
      const element = root.querySelector<HTMLElement>(`[data-tour="${target}"]`);
      if (!element) {
        // The view the step needs may still be rendering after navigation.
        if (attempts++ < 30) frame = window.requestAnimationFrame(measure);
        else setSpot(null);
        return;
      }
      const outer = root.getBoundingClientRect();
      const inner = element.getBoundingClientRect();
      const pad = roundTargets.has(target) ? roundPadding : 0;
      setSpot({
        left: inner.left - outer.left - pad,
        top: inner.top - outer.top - pad,
        width: inner.width + pad * 2,
        height: inner.height + pad * 2,
      });
    };
    root
      .querySelector<HTMLElement>(`[data-tour="${target}"]`)
      ?.scrollIntoView({ block: 'nearest' });
    measure();
    const remeasure = () => {
      attempts = 0;
      measure();
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(root);
    root.addEventListener('scroll', remeasure, true);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('scroll', remeasure, true);
    };
  }, [container, target]);

  return spot;
}

/**
 * The first-visit tour. Each step names a target; the app shows the view that
 * holds it, and the tour dims everything except that target and explains it in
 * a card. Tapping the lit target advances like Next. Other taps are held back so
 * the visitor cannot wander off mid-step.
 */
export function Tour({
  copy,
  step,
  index,
  total,
  container,
  onNext,
  onClose,
}: {
  copy: Pick<TourCopy, 'label' | 'skip' | 'next' | 'done' | 'stepOf'>;
  step: TourCopy['steps'][number];
  index: number;
  total: number;
  container: RefObject<HTMLElement | null>;
  onNext: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const spot = useSpot(container, step.target);
  const last = index === total - 1;
  const round = roundTargets.has(step.target);
  const containerHeight = container.current?.clientHeight ?? 0;
  // Keep the card clear of the target: low targets push the card to the top.
  const cardOnTop = spot !== null && spot.top + spot.height / 2 > containerHeight * 0.55;

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="absolute inset-0 z-30"
        aria-hidden
        onClick={(event) => {
          if (!spot) return;
          const box = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - box.left;
          const y = event.clientY - box.top;
          const inside =
            x >= spot.left &&
            x <= spot.left + spot.width &&
            y >= spot.top &&
            y <= spot.top + spot.height;
          if (inside) onNext();
        }}
      />
      {spot ? (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute z-30 shadow-tour-dim ring-2 ring-stage-foreground transition-[left,top,width,height] duration-300 ease-out motion-reduce:transition-none',
            round ? 'rounded-full' : 'ring-inset',
          )}
          style={{ left: spot.left, top: spot.top, width: spot.width, height: spot.height }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-tour-dim" />
      )}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-label={copy.label}
        aria-describedby={titleId}
        tabIndex={-1}
        className={cn(
          floatingCardClass,
          'z-50 flex flex-col gap-4 outline-none',
          cardOnTop ? 'top-float' : 'bottom-float',
        )}
      >
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: total }, (_, item) => (
            <span
              key={item}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                item <= index ? 'bg-primary' : 'bg-foreground/10',
              )}
            />
          ))}
        </div>
        <div id={titleId} className="flex flex-col gap-1.5">
          <p className="sr-only">{copy.stepOf(index + 1, total)}</p>
          <p className="text-lg leading-snug font-medium tracking-tight">{step.title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          {last ? null : (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {copy.skip}
            </Button>
          )}
          <Button type="button" size="sm" className="px-4" onClick={onNext}>
            {last ? copy.done : copy.next}
          </Button>
        </div>
      </div>
    </>
  );
}
