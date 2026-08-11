'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, List, Share2, X } from 'lucide-react';
import { seedCatalog, sortPublishedScenes, type CalmScene } from '@calm/content';
import { resolveBundledMedia } from '@calm/content/media';
import { useCalmExperience, type PlayerProps } from '@calm/experience';
import { useReducedMotion } from '@calm/experience/reduced-motion';
import { shareMoment } from '@calm/experience/share';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { BrowserSceneRepository } from '../../lib/content/browser-repository';

const CROSSFADE_MS = 700;

/**
 * Two stacked video elements crossfade so a scene change does not cut to black.
 * Volume is driven through element refs rather than style, so no inline visual
 * style is involved.
 */
function WebPlayer({ video, poster, muted, paused, reducedMotion, onError, onReady }: PlayerProps) {
  const [element, setElement] = useState<HTMLVideoElement | null>(null);
  const activeSource = useRef({ video: String(video), poster: String(poster) });
  const activeElement = useRef<HTMLVideoElement | null>(null);
  const incomingElement = useRef<HTMLVideoElement | null>(null);
  const [incoming, setIncoming] = useState<{ video: string; poster: string } | null>(null);
  const [incomingReady, setIncomingReady] = useState(false);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = String(video);
    if (reducedMotion || next === activeSource.current.video) return;
    setIncoming({ video: next, poster: String(poster) });
    setIncomingReady(false);
  }, [poster, reducedMotion, video]);

  useEffect(() => {
    if (!incomingReady || !incoming) return;
    const current = activeElement.current;
    const next = incomingElement.current;
    const started = performance.now();
    if (current) current.volume = muted ? 0 : 1;
    if (next) {
      next.volume = 0;
      void next.play().catch(() => undefined);
    }
    fadeInterval.current = setInterval(() => {
      const progress = Math.min((performance.now() - started) / CROSSFADE_MS, 1);
      if (current) current.volume = muted ? 0 : 1 - progress;
      if (next) next.volume = muted ? 0 : progress;
      if (progress >= 1 && fadeInterval.current) {
        clearInterval(fadeInterval.current);
        fadeInterval.current = null;
      }
    }, 40);
    finishTimer.current = setTimeout(() => {
      activeSource.current = incoming;
      setIncoming(null);
      setIncomingReady(false);
    }, CROSSFADE_MS);
    return () => {
      if (fadeInterval.current) clearInterval(fadeInterval.current);
      if (finishTimer.current) clearTimeout(finishTimer.current);
      fadeInterval.current = null;
      finishTimer.current = null;
    };
  }, [incoming, incomingReady, muted]);

  useEffect(() => {
    if (activeElement.current) activeElement.current.muted = muted;
    if (incomingElement.current) incomingElement.current.muted = muted;
  }, [incoming, muted]);

  useEffect(() => {
    if (!element && !incoming) return;
    const onVisibility = () => {
      const current = activeElement.current;
      const next = incomingElement.current;
      if (document.hidden) {
        current?.pause();
        next?.pause();
      } else if (!paused) {
        void current?.play().catch(() => undefined);
        void next?.play().catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [element, incoming, paused]);

  useEffect(() => {
    const current = activeElement.current;
    const next = incomingElement.current;
    if (paused) {
      current?.pause();
      next?.pause();
    } else {
      void current?.play().catch(() => undefined);
      void next?.play().catch(() => undefined);
    }
  }, [incoming, paused]);

  useEffect(
    () => () => {
      if (fadeInterval.current) clearInterval(fadeInterval.current);
      if (finishTimer.current) clearTimeout(finishTimer.current);
    },
    [],
  );

  const videoClass = 'absolute inset-0 size-full object-cover transition-opacity duration-700';

  return (
    <>
      <video
        ref={(node) => {
          activeElement.current = node;
          setElement(node);
        }}
        key={activeSource.current.video}
        src={activeSource.current.video}
        poster={activeSource.current.poster}
        autoPlay={!paused}
        loop
        playsInline
        muted={muted}
        onLoadedData={onReady}
        onError={onError}
        className={cn(videoClass, incomingReady ? 'opacity-0' : 'opacity-100')}
      />
      {incoming ? (
        <video
          ref={(node) => {
            incomingElement.current = node;
          }}
          src={incoming.video}
          poster={incoming.poster}
          autoPlay={!paused}
          loop
          playsInline
          muted={muted}
          onLoadedData={() => setIncomingReady(true)}
          onError={() => {
            setIncoming(null);
            setIncomingReady(false);
            onError();
          }}
          className={cn(videoClass, incomingReady ? 'opacity-100' : 'opacity-0')}
        />
      ) : null}
    </>
  );
}

interface WebExperienceProps {
  repository?: BrowserSceneRepository;
  initialScenes?: CalmScene[];
  compact?: boolean;
}

export function WebExperience({ repository, initialScenes, compact = false }: WebExperienceProps) {
  const repo = useMemo(() => repository ?? new BrowserSceneRepository(), [repository]);
  const [scenes, setScenes] = useState<CalmScene[]>(
    initialScenes ?? sortPublishedScenes(seedCatalog.scenes),
  );
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const catalog = await repo.readCatalog();
      if (!active) return;
      const visible = sortPublishedScenes(catalog.scenes);
      repo.revokeObjectUrls();
      const urls: Record<string, string> = {};
      for (const scene of visible) {
        for (const ref of [scene.video, scene.poster]) {
          if (ref.kind === 'local') {
            const url = await repo.getObjectUrl(ref);
            if (url) urls[ref.blobId] = url;
          }
        }
      }
      if (active) {
        setLocalUrls(urls);
        setScenes(visible);
      }
    };
    void load();
    const unsubscribe = repo.subscribe(() => void load());
    return () => {
      active = false;
      unsubscribe();
      if (!repository) repo.dispose();
    };
  }, [repo, repository]);

  const resolveMedia = (scene: CalmScene) => {
    const video =
      scene.video.kind === 'local'
        ? (localUrls[scene.video.blobId] ?? '')
        : (resolveBundledMedia(scene.video) ?? '');
    const poster =
      scene.poster.kind === 'local'
        ? (localUrls[scene.poster.blobId] ?? '')
        : (resolveBundledMedia(scene.poster) ?? '');
    return { video, poster };
  };

  const model = useCalmExperience({
    scenes,
    resolveMedia,
    reducedMotion,
    onShare: (scene) => shareMoment(scene.title, `${window.location.origin}/demo`),
  });

  if (!model.scene || !model.media) {
    return (
      <div
        className={cn(
          'flex flex-1 items-center justify-center bg-stage px-6 text-stage-foreground',
          compact ? 'h-160 max-h-svh' : 'min-h-0',
        )}
      >
        <p>No published scenes are available.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 items-center justify-center bg-stage p-4',
        compact ? 'h-160 max-h-svh' : 'min-h-0',
      )}
      onPointerDown={model.revealControls}
      onFocus={() => {
        model.setFocused(true);
        model.revealControls();
      }}
      onBlur={() => model.setFocused(false)}
    >
      <div
        data-testid="experience-media-surface"
        className="relative h-full w-full max-w-phone overflow-hidden rounded-lg bg-stage shadow-lg"
      >
        {model.showPoster ? (
          <Image
            src={String(model.media.poster)}
            alt={`${model.scene.title} poster`}
            fill
            sizes="(max-width: 480px) 100vw, 430px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <WebPlayer
            video={model.media.video}
            poster={model.media.poster}
            muted
            paused={false}
            reducedMotion={model.reducedMotion}
            onError={model.reportPlayerError}
            onReady={model.reportPlayerReady}
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-scrim" />

        {!model.controlsVisible ? (
          <button
            type="button"
            data-testid="experience-reveal-controls"
            aria-label="Show scene controls"
            onClick={model.revealControls}
            className="absolute inset-0 z-10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        ) : null}

        {model.controlsVisible ? (
          <h2 className="absolute inset-x-6 top-8 text-xl font-normal tracking-tight text-stage-foreground">
            Take a breath.
          </h2>
        ) : null}

        {model.statusMessage ? (
          <Alert className="absolute inset-x-5 bottom-28 z-20 w-auto">
            <AlertDescription>{model.statusMessage}</AlertDescription>
          </Alert>
        ) : null}

        {model.controlsVisible ? (
          <div className="absolute inset-x-4 bottom-5 z-20 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="icon-lg"
              aria-label="Choose a scene"
              onClick={model.openPicker}
            >
              <List />
            </Button>
            <Button
              variant="secondary"
              size="icon-lg"
              aria-label={model.shareLabel}
              onClick={() => void model.share()}
            >
              <Share2 />
            </Button>
          </div>
        ) : null}
      </div>

      <Sheet
        open={model.pickerOpen}
        onOpenChange={(open) => (open ? undefined : model.closePicker())}
      >
        <SheetContent side="bottom" showCloseButton={false}>
          <SheetHeader className="flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <SheetTitle>Choose a place</SheetTitle>
              <SheetDescription>Pick a scene to open in the player.</SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close scene picker"
              onClick={model.closePicker}
            >
              <X />
            </Button>
          </SheetHeader>
          <div className="mx-auto grid max-h-svh w-full max-w-3xl grid-cols-2 gap-3 overflow-y-auto px-4 pb-4 sm:grid-cols-4">
            {model.scenes.map((candidate) => {
              const selected = model.isSelected(candidate);
              const media = resolveMedia(candidate);
              return (
                <button
                  key={candidate.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={model.sceneLabel(candidate)}
                  onClick={() => model.selectScene(candidate)}
                  className={cn(
                    'relative aspect-tile overflow-hidden rounded-md border bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                    selected ? 'border-primary' : 'border-border',
                  )}
                >
                  {media.poster ? (
                    <Image
                      src={String(media.poster)}
                      alt=""
                      fill
                      sizes="200px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                  {selected ? (
                    <span
                      aria-hidden
                      className="absolute top-2 right-2 grid size-7 place-content-center rounded-md bg-primary text-primary-foreground"
                    >
                      <Check className="size-4" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
