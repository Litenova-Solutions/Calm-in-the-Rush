'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import {
  galleryUploadKey,
  type ExperienceMedia,
  type ExperienceTile,
  type GalleryScreen,
  type VisitorUpload,
} from '@/lib/content/experience';

/** Image `sizes` for media that spans the app column. */
export const fullWidthSizes = '(max-width: 430px) 100vw, 430px';
/** Image `sizes` for one cell of a two-column grid. */
export const halfWidthSizes = '(max-width: 430px) 50vw, 215px';

export type LocalUrls = Record<string, string>;
export type UploadsByKey = Map<string, VisitorUpload>;

function mediaSource(media: ExperienceMedia, localUrls: LocalUrls): string {
  if (media.kind === 'local') return localUrls[media.blobId] ?? '';
  return media.src;
}

/** The media a tile shows: its own for a pre-filled tile, the visitor's photo for an upload tile. */
export function tileMedia(
  screen: GalleryScreen,
  tile: ExperienceTile,
  uploads: UploadsByKey,
): ExperienceMedia | undefined {
  if (tile.type === 'prefilled') return tile.media;
  return uploads.get(galleryUploadKey(screen.id, tile.id))?.media;
}

export function tileAlt(
  screen: GalleryScreen,
  tile: ExperienceTile,
  uploads: UploadsByKey,
): string {
  if (tile.type === 'prefilled') return tile.alt;
  return uploads.get(galleryUploadKey(screen.id, tile.id))?.media.fileName ?? tile.label;
}

function useReducedMotionPreference(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function ExperienceImage({
  media,
  source,
  alt,
  preload = false,
  sizes,
}: {
  media: ExperienceMedia;
  source: string;
  alt: string;
  preload?: boolean;
  sizes: string;
}) {
  if (!source) return <div className="absolute inset-0 bg-muted" aria-hidden />;
  if (media.kind === 'local') {
    return (
      <img
        src={source}
        alt={alt}
        loading={preload ? 'eager' : 'lazy'}
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <Image src={source} alt={alt} fill preload={preload} sizes={sizes} className="object-cover" />
  );
}

function ExperienceVideo({
  source,
  poster,
  alt,
  preload = false,
}: {
  source: string;
  poster: string;
  alt: string;
  preload?: boolean;
}) {
  const reducedMotion = useReducedMotionPreference();
  if (!source) return <div className="absolute inset-0 bg-muted" aria-hidden />;
  if (reducedMotion) {
    return (
      <img
        src={poster}
        alt={alt}
        loading={preload ? 'eager' : 'lazy'}
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <video
      className="absolute inset-0 size-full object-cover"
      src={source}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload={preload ? 'auto' : 'metadata'}
      role="img"
      aria-label={alt}
    />
  );
}

/** Renders any experience media to fill its positioned parent. */
export function MediaFill({
  media,
  localUrls,
  alt,
  sizes,
  preload = false,
  still = false,
}: {
  media: ExperienceMedia;
  localUrls: LocalUrls;
  alt: string;
  sizes: string;
  preload?: boolean;
  /** Shows a video's poster instead of playing it. */
  still?: boolean;
}) {
  if (media.kind === 'bundled-video') {
    if (still) {
      return (
        <ExperienceImage
          media={{ kind: 'bundled', src: media.poster }}
          source={media.poster}
          alt={alt}
          sizes={sizes}
          preload={preload}
        />
      );
    }
    return (
      <ExperienceVideo
        source={mediaSource(media, localUrls)}
        poster={media.poster}
        alt={alt}
        preload={preload}
      />
    );
  }
  return (
    <ExperienceImage
      media={media}
      source={mediaSource(media, localUrls)}
      alt={alt}
      sizes={sizes}
      preload={preload}
    />
  );
}

const breathingWavePath =
  'M 16 132 C 42 132, 48 48, 80 48 S 118 132, 160 132 S 198 48, 240 48 S 278 132, 304 132';

/** The breathing cue: an orb that follows a slow wave. Still when motion is reduced or `still` is set. */
export function BreathingIllustration({
  still = false,
  bare = false,
}: {
  still?: boolean;
  /** Leaves out the sky, for placing the cue on a surface that already has it. */
  bare?: boolean;
}) {
  const reducedMotion = useReducedMotionPreference();
  const id = useStableSvgId();
  const animate = !still && !reducedMotion;
  return (
    <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--breathing-sky-start)" />
          <stop offset="100%" stopColor="var(--breathing-sky-end)" />
        </linearGradient>
        <linearGradient id={`${id}-orb`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--breathing-orb-start)" />
          <stop offset="100%" stopColor="var(--breathing-orb-end)" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {bare ? null : <rect width="320" height="180" fill={`url(#${id}-sky)`} />}
      <path
        d={breathingWavePath}
        fill="none"
        stroke="var(--breathing-wave)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {animate ? (
        <circle r="13" fill={`url(#${id}-orb)`} filter={`url(#${id}-glow)`}>
          <animateMotion dur="12s" repeatCount="indefinite" path={breathingWavePath} />
        </circle>
      ) : (
        <circle cx="80" cy="48" r="13" fill={`url(#${id}-orb)`} filter={`url(#${id}-glow)`} />
      )}
    </svg>
  );
}

let svgIdCounter = 0;

/** SVG ids must be unique per document; React's useId output is not a valid url() fragment everywhere. */
function useStableSvgId(): string {
  const [id] = useState(() => `breathing-${++svgIdCounter}`);
  return id;
}

export function RelaxedFacePlaceholder({ variant = 0 }: { variant?: number }) {
  const faces = [0x1f600, 0x1f600, 0x1f600, 0x1f60c].map((code) => String.fromCodePoint(code));
  const face = faces[variant % faces.length] ?? faces[0]!;
  return (
    <span className="flex size-24 items-center justify-center rounded-full bg-background shadow-xs ring-1 ring-foreground/10 transition-transform duration-300 group-hover:scale-105">
      <span className="text-5xl leading-none" aria-hidden>
        {face}
      </span>
    </span>
  );
}
