'use client';

import type { ReactNode, RefObject } from 'react';
import Image from 'next/image';

import type { ExperienceLocale } from '@/lib/content/strings';
import { cn } from '@/lib/utils';

/**
 * Every view starts with this 3.5rem bar: one control on the left, an optional
 * title in the middle, and up to two controls on the right. It floats over the
 * view: `overlay` is clear for full-bleed media, `page` is frosted so content
 * scrolls softly underneath it.
 */
export function TopBar({
  variant,
  left,
  right,
  title,
  titleHidden = false,
  headingRef,
}: {
  variant: 'overlay' | 'page';
  left?: ReactNode;
  right?: ReactNode;
  title: string;
  /** Keeps the heading for screen readers only. */
  titleHidden?: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <header
      className={cn(
        'absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between px-4',
        variant === 'page' &&
          'border-b border-foreground/6 bg-background/80 backdrop-blur-xl backdrop-saturate-150',
      )}
    >
      <div className="flex min-w-10 items-center">{left}</div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          'pointer-events-none absolute inset-x-16 truncate text-center text-[0.9375rem] font-semibold tracking-tight outline-none',
          titleHidden && 'sr-only',
        )}
      >
        {title}
      </h1>
      <div className="flex min-w-10 items-center justify-end gap-2">{right}</div>
    </header>
  );
}

function barButtonClass(variant: 'overlay' | 'page') {
  return cn(
    'flex size-10 shrink-0 items-center justify-center rounded-full outline-none transition-[background-color,transform] duration-200 focus-visible:ring-3 focus-visible:ring-ring/60 active:scale-95 [&_svg]:size-[1.125rem]',
    variant === 'overlay'
      ? 'bg-background/70 text-foreground shadow-sm ring-1 ring-foreground/10 backdrop-blur-md hover:bg-background/90'
      : 'text-foreground hover:bg-foreground/6',
  );
}

export function BarButton({
  label,
  onClick,
  variant,
  pressed,
  tourId,
  children,
}: {
  label: string;
  onClick: () => void;
  variant: 'overlay' | 'page';
  pressed?: boolean;
  /** Lets the tour find and point at this control. */
  tourId?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      data-tour={tourId}
      onClick={onClick}
      className={barButtonClass(variant)}
    >
      {children}
    </button>
  );
}

export function brandLogo(locale: ExperienceLocale): { src: string; alt: string } {
  return locale === 'nl'
    ? { src: '/brand/rir-logo-large.svg', alt: 'RUST in de Reuring' }
    : { src: '/brand/calm-logo-large.png', alt: 'CALM in the rush' };
}

/** The RiR smiley logo for the round top-left button, cropped to its circle. */
function brandMark(locale: ExperienceLocale): string {
  return locale === 'nl' ? '/brand/rust-smiley.png' : '/brand/calm-smiley.png';
}

/** The round brand mark that opens the About page. */
export function LogoButton({
  locale,
  label,
  onClick,
}: {
  locale: ExperienceLocale;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-tour="logo"
      onClick={onClick}
      className="relative size-10 shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-foreground/10 outline-none transition-transform duration-200 focus-visible:ring-3 focus-visible:ring-ring/60 active:scale-95"
    >
      <Image src={brandMark(locale)} alt="" fill sizes="40px" className="object-cover" />
    </button>
  );
}
