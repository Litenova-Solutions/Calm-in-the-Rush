'use client';

import { type ReactNode, useId, useState } from 'react';
import Image from 'next/image';
import {
  Check,
  ChevronRight,
  ExternalLink,
  ImagePlus,
  Lock,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type {
  ExperienceConfig,
  ExperienceMedia,
  ExperienceScreen,
  ExperienceTile,
  GalleryScreen,
} from '@/lib/content/experience';
import type { ExperienceLocale, FeedbackCopy } from '@/lib/content/strings';
import { cn } from '@/lib/utils';

import {
  BreathingIllustration,
  MediaFill,
  RelaxedFacePlaceholder,
  fullWidthSizes,
  halfWidthSizes,
  tileAlt,
  tileMedia,
  type LocalUrls,
  type UploadsByKey,
} from './media';
import { CalmFace } from './CalmFace';
import { brandLogo } from './TopBar';

const focusRing =
  'outline-none focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-inset';

/**
 * The active page: the chosen photo or video fills the screen, with its sentence
 * low on the left. A new choice fades in over the old one.
 */
export function ActiveView({
  media,
  mediaKey,
  alt,
  sentence,
  localUrls,
  bar,
}: {
  media: ExperienceMedia;
  /** Changes when the chosen photo changes, so the new one fades in. */
  mediaKey: string;
  alt: string;
  sentence: string;
  localUrls: LocalUrls;
  bar: ReactNode;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-stage">
      <div
        key={mediaKey}
        className="absolute inset-0 duration-700 animate-in fade-in motion-reduce:animate-none"
      >
        <MediaFill media={media} localUrls={localUrls} alt={alt} sizes={fullWidthSizes} preload />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-scrim/55 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-scrim/80 via-scrim/30 to-transparent"
        aria-hidden
      />
      {bar}
      {sentence ? (
        <p
          key={`${mediaKey}-sentence`}
          className="pointer-events-none absolute right-16 bottom-0 left-4 pb-page text-xl leading-snug font-light tracking-tight text-stage-foreground text-shadow-sm delay-200 duration-1000 animate-in fade-in slide-in-from-bottom-1 fill-mode-both motion-reduce:animate-none"
        >
          <span className="block animate-sentence-drift motion-reduce:animate-none">
            {sentence}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export interface TopicCard {
  id: string;
  title: string;
  subtitle: string;
  kind: ExperienceScreen['type'];
  media?: ExperienceMedia;
}

export function TopicsView({
  topics,
  tourTopicId,
  localUrls,
  onOpen,
  bar,
}: {
  topics: readonly TopicCard[];
  /** The topic the tour points at. */
  tourTopicId?: string;
  localUrls: LocalUrls;
  onOpen: (screenId: string) => void;
  bar: ReactNode;
}) {
  return (
    <div className="absolute inset-0 bg-background">
      <div className="no-scrollbar absolute inset-0 overflow-y-auto">
        <ul className="flex min-h-full flex-col pt-14 pb-safe">
          {topics.map((topic) => {
            const onMedia = Boolean(topic.media);
            return (
              <li
                key={topic.id}
                className="flex min-h-34 flex-1"
                data-tour={topic.id === tourTopicId ? 'topic' : undefined}
              >
                <button
                  type="button"
                  onClick={() => onOpen(topic.id)}
                  className={cn(
                    'group relative flex w-full items-end overflow-hidden text-left',
                    focusRing,
                  )}
                >
                  {topic.media ? (
                    <>
                      <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
                        <MediaFill
                          media={topic.media}
                          localUrls={localUrls}
                          alt=""
                          sizes={fullWidthSizes}
                          still
                        />
                      </span>
                      <span
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-scrim/85 via-scrim/20 to-transparent"
                        aria-hidden
                      />
                    </>
                  ) : topic.kind === 'breathing' ? (
                    <span className="absolute inset-0 bg-linear-to-br from-breathing-sky-start to-breathing-sky-end">
                      <span className="absolute top-1/2 right-6 w-1/2 -translate-y-1/2 opacity-90">
                        <BreathingIllustration still bare />
                      </span>
                    </span>
                  ) : (
                    <span className="absolute inset-0 bg-linear-to-br from-secondary to-accent">
                      <ImagePlus
                        className="absolute top-5 right-5 size-6 text-foreground/35"
                        aria-hidden
                      />
                    </span>
                  )}
                  <span className="relative flex w-full items-end justify-between gap-3 p-5">
                    <span className="flex flex-col gap-1">
                      <span
                        className={cn(
                          'text-xs font-medium tracking-widest uppercase',
                          onMedia ? 'text-stage-foreground/75' : 'text-muted-foreground',
                        )}
                      >
                        {topic.subtitle}
                      </span>
                      <span
                        className={cn(
                          'text-2xl leading-tight font-medium tracking-tight',
                          onMedia ? 'text-stage-foreground' : 'text-foreground',
                        )}
                      >
                        {topic.title}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full ring-1 backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-0.5',
                        onMedia
                          ? 'bg-stage-foreground/15 text-stage-foreground ring-stage-foreground/30'
                          : 'bg-background/50 text-foreground ring-foreground/10',
                      )}
                      aria-hidden
                    >
                      <ChevronRight className="size-4" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {bar}
    </div>
  );
}

type GalleryLabels = {
  grid: string;
  show: (label: string) => string;
  showing: string;
  remove: (label: string) => string;
  uploadHint: string;
  noPhotos: string;
};

export function GalleryView({
  screen,
  uploads,
  localUrls,
  activeTileId,
  bar,
  labels,
  onSelect,
  onAddPhoto,
  onRemovePhoto,
}: {
  screen: GalleryScreen;
  uploads: UploadsByKey;
  localUrls: LocalUrls;
  /** The tile shown on the active page, when it belongs to this topic. */
  activeTileId?: string;
  bar: ReactNode;
  labels: GalleryLabels;
  onSelect: (tileId: string) => void;
  onAddPhoto: (tileId: string) => void;
  onRemovePhoto: (tileId: string) => void;
}) {
  const tiles = screen.tiles;
  // The tour points at the first photo and the first upload tile of the grid.
  const firstPhotoId = tiles.find((tile) => tileMedia(screen, tile, uploads))?.id;
  const firstUploadId = tiles.find((tile) => tile.type === 'upload')?.id;
  const tourId = (tileId: string) =>
    tileId === firstUploadId ? 'upload' : tileId === firstPhotoId ? 'photo' : undefined;
  // An odd last tile spans both columns, so the grid always ends flush.
  const spanLast = tiles.length % 2 === 1;

  return (
    <div className="absolute inset-0 bg-background">
      <div className="no-scrollbar absolute inset-0 overflow-y-auto">
        {tiles.length ? (
          <div
            className="grid min-h-full grid-cols-2 gallery-rows pt-14 pb-safe"
            aria-label={labels.grid}
          >
            {tiles.map((tile, tileIndex) => (
              <GalleryTile
                key={tile.id}
                screen={screen}
                tile={tile}
                tileIndex={tileIndex}
                uploads={uploads}
                localUrls={localUrls}
                active={tile.id === activeTileId}
                tourId={tourId(tile.id)}
                wide={spanLast && tileIndex === tiles.length - 1}
                labels={labels}
                onSelect={onSelect}
                onAddPhoto={onAddPhoto}
                onRemovePhoto={onRemovePhoto}
              />
            ))}
          </div>
        ) : (
          <p className="grid min-h-full place-items-center p-6 pt-20 text-center text-sm text-muted-foreground">
            {labels.noPhotos}
          </p>
        )}
      </div>
      {bar}
    </div>
  );
}

function GalleryTile({
  screen,
  tile,
  tileIndex,
  uploads,
  localUrls,
  active,
  tourId,
  wide,
  labels,
  onSelect,
  onAddPhoto,
  onRemovePhoto,
}: {
  screen: GalleryScreen;
  tile: ExperienceTile;
  tileIndex: number;
  uploads: UploadsByKey;
  localUrls: LocalUrls;
  active: boolean;
  tourId?: string;
  wide: boolean;
  labels: GalleryLabels;
  onSelect: (tileId: string) => void;
  onAddPhoto: (tileId: string) => void;
  onRemovePhoto: (tileId: string) => void;
}) {
  const media = tileMedia(screen, tile, uploads);
  const name = tile.type === 'upload' ? tile.label : tile.title;

  if (media) {
    return (
      <div
        className={cn('group relative overflow-hidden', wide && 'col-span-2')}
        data-tour={tourId}
      >
        <button
          type="button"
          className={cn('absolute inset-0 bg-muted', focusRing)}
          aria-label={labels.show(name)}
          aria-current={active ? 'true' : undefined}
          onClick={() => onSelect(tile.id)}
        >
          <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
            <MediaFill
              media={media}
              localUrls={localUrls}
              alt={tileAlt(screen, tile, uploads)}
              sizes={wide ? fullWidthSizes : halfWidthSizes}
            />
          </span>
        </button>
        {active ? (
          <span
            className="pointer-events-none absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm"
            title={labels.showing}
          >
            <Check className="size-4" aria-hidden />
            <span className="sr-only">{labels.showing}</span>
          </span>
        ) : null}
        {tile.type === 'upload' ? (
          <button
            type="button"
            aria-label={labels.remove(tile.label)}
            onClick={() => onRemovePhoto(tile.id)}
            className="absolute top-2.5 left-2.5 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm outline-none hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/60"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    );
  }

  if (tile.type !== 'upload') return null;
  const isFaces = screen.id === 'friendly-faces';
  return (
    <button
      type="button"
      data-tour={tourId}
      aria-label={tile.label}
      onClick={() => onAddPhoto(tile.id)}
      className={cn(
        'group flex flex-col items-center justify-center gap-4 bg-muted/45 px-5 pt-6 text-center transition-colors hover:bg-muted/80',
        focusRing,
        wide && 'col-span-2',
      )}
    >
      {isFaces ? (
        <RelaxedFacePlaceholder variant={tileIndex} />
      ) : (
        <span className="flex size-14 items-center justify-center rounded-full bg-background text-foreground shadow-xs ring-1 ring-foreground/10 transition-transform duration-300 group-hover:scale-105">
          <ImagePlus className="size-5" aria-hidden />
        </span>
      )}
      {/* A fixed-height text block keeps icons level across a row, whatever the label length. */}
      <span className="flex h-28 flex-col items-center gap-1.5">
        <span className="text-sm leading-snug font-medium text-foreground">{tile.label}</span>
        {tile.sentence ? (
          <span className="text-xs leading-snug text-muted-foreground">{tile.sentence}</span>
        ) : null}
        <span className="mt-1 text-[0.6875rem] tracking-widest text-muted-foreground/80 uppercase">
          {labels.uploadHint}
        </span>
      </span>
    </button>
  );
}

export function BreathingView({ description, bar }: { description: string; bar: ReactNode }) {
  return (
    <div className="absolute inset-0 bg-linear-to-b from-breathing-sky-start to-breathing-sky-end">
      <div className="no-scrollbar absolute inset-0 flex flex-col items-center justify-center gap-10 overflow-y-auto px-6 pt-14 pb-page">
        <div className="w-full max-w-sm">
          <BreathingIllustration bare />
        </div>
        {description ? (
          <p className="max-w-64 text-center text-base leading-relaxed font-light text-balance text-foreground/80">
            {description}
          </p>
        ) : null}
      </div>
      {bar}
    </div>
  );
}

/** The level label for a calm value: five equal stretches of the slider. */
function calmLabel(levels: readonly string[], value: number): string {
  const index = Math.min(levels.length - 1, Math.floor((value / 100) * levels.length));
  return levels[index] ?? '';
}

/**
 * A slider in the spirit of an emoji slider sticker: the brand face rides along
 * a track, changes expression as it moves, and grows while it is held. A native
 * range input sits invisibly on top, so touch, mouse, keyboard, and screen
 * readers all work as they would on any slider.
 */
function CalmSlider({
  value,
  labelledBy,
  valueText,
  onChange,
}: {
  /** Null until the visitor first moves it; the face then rests in the middle. */
  value: number | null;
  labelledBy: string;
  valueText: string;
  onChange: (value: number) => void;
}) {
  const [holding, setHolding] = useState(false);
  const shown = value ?? 50;
  // The face's center travels from half a face in from the left to half a face in from the right.
  const along = `calc(1.75rem + (100% - 3.5rem) * ${shown / 100})`;
  return (
    <div className="relative h-16 touch-pan-y select-none">
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={shown}
        aria-labelledby={labelledBy}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => {
          setHolding(false);
          // A tap that leaves the face in the middle still counts as an answer.
          if (value === null) onChange(shown);
        }}
        onPointerCancel={() => setHolding(false)}
        onBlur={() => setHolding(false)}
        className="calm-range peer absolute inset-0 z-10 size-full cursor-grab opacity-0 active:cursor-grabbing"
      />
      <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-sun/30 to-brand-sun"
          style={{ width: along }}
        />
      </div>
      <div
        className="pointer-events-none absolute top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
        style={{ left: along }}
      >
        <CalmFace
          value={shown}
          className={cn(
            'size-full drop-shadow-md transition-transform duration-200 ease-out motion-reduce:transition-none',
            holding && 'scale-125',
          )}
        />
      </div>
    </div>
  );
}

export function AboutView({
  locale,
  description,
  links,
  oneLiner,
  feedback,
  calm,
  comment,
  saving,
  bar,
  labels,
  onCalmChange,
  onCommentChange,
  onSave,
  onClear,
  onShowTour,
}: {
  locale: ExperienceLocale;
  description: string;
  links: readonly { id: string; label: string; url: string }[];
  /** Settings for the optional comment: its prompt and placeholder. */
  oneLiner: ExperienceConfig['oneLiner'];
  /** What is saved now, to tell an unchanged form from a changed one. */
  feedback: { calm: number | null; comment: string };
  calm: number | null;
  comment: string;
  saving: boolean;
  bar: ReactNode;
  labels: FeedbackCopy & {
    save: string;
    clear: string;
    showTour: string;
    privacyNote: string;
  };
  onCalmChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
  onShowTour: () => void;
}) {
  const logo = brandLogo(locale);
  const questionId = useId();
  const hasSaved = feedback.calm !== null || Boolean(feedback.comment);
  const unchanged = calm === feedback.calm && comment.trim() === feedback.comment;
  const level = calm !== null ? calmLabel(labels.levels, calm) : '';
  return (
    <div className="absolute inset-0 bg-background">
      <div className="no-scrollbar absolute inset-0 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-sm flex-col px-6 pt-20 pb-page">
          <div className="flex flex-col items-center text-center">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={480}
              height={480}
              sizes="7rem"
              className="h-auto w-28"
              preload
            />
            <p className="mt-3 max-w-72 text-base leading-relaxed text-balance text-muted-foreground">
              {description}
            </p>
            {links.length ? (
              <div className="mt-6 flex w-full flex-col gap-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                  >
                    {link.label}
                    <ExternalLink className="size-4" aria-hidden />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <form
            className="mt-12 flex flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              if (calm !== null) onSave();
            }}
          >
            <h2 id={questionId} className="text-center text-xl font-medium tracking-tight">
              {labels.question}
            </h2>
            <div className="mt-5">
              <CalmSlider
                value={calm}
                labelledBy={questionId}
                valueText={level || labels.hint}
                onChange={onCalmChange}
              />
            </div>
            <p
              aria-live="polite"
              className={cn(
                'mt-2 min-h-5 text-center text-sm',
                level ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {level || labels.hint}
            </p>
            <div className="mt-10 flex items-baseline justify-between gap-3">
              <label htmlFor="visitor-comment" className="text-sm font-medium">
                {oneLiner.prompt}
              </label>
              <span className="text-xs text-muted-foreground">{labels.optional}</span>
            </div>
            <Textarea
              id="visitor-comment"
              value={comment}
              rows={3}
              maxLength={160}
              placeholder={oneLiner.placeholder}
              className="mt-2 min-h-24 resize-none rounded-2xl border-transparent bg-foreground/5 px-4 py-3 text-base leading-relaxed shadow-none focus-visible:border-transparent"
              onChange={(event) => onCommentChange(event.target.value)}
            />
            <Button
              type="submit"
              className="mt-6 h-11 w-full rounded-full text-base"
              disabled={saving || calm === null || unchanged}
            >
              {labels.save}
            </Button>
            {hasSaved ? (
              <button
                type="button"
                disabled={saving}
                onClick={onClear}
                className="mt-3 self-center rounded-md px-2 py-1 text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/60"
              >
                {labels.clear}
              </button>
            ) : null}
          </form>
          <div className="mt-auto flex flex-col items-center gap-2 pt-14">
            <button
              type="button"
              onClick={onShowTour}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              {labels.showTour}
            </button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <Lock className="size-3" aria-hidden />
              {labels.privacyNote}
            </p>
          </div>
        </div>
      </div>
      {bar}
    </div>
  );
}
