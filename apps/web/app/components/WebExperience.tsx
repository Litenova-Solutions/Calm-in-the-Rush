'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalmExperience } from '@calm/experience';
import { shareMoment } from '@calm/experience/share';
import { resolveBundledMedia } from '@calm/content/media';
import { seedCatalog, sortPublishedScenes, type CalmScene } from '@calm/content';

import { BrowserSceneRepository } from '../../lib/content/browser-repository';

function WebPlayer({
  video,
  poster,
  muted,
  paused,
  reducedMotion,
  onError,
  onReady,
}: {
  video: string | number;
  poster: string | number;
  muted: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onError: () => void;
  onReady: () => void;
}) {
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
    const started = Date.now();
    if (current) current.volume = muted ? 0 : 1;
    if (next) {
      next.volume = 0;
      void next.play().catch(() => undefined);
    }
    fadeInterval.current = setInterval(() => {
      const progress = Math.min((Date.now() - started) / 700, 1);
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
    }, 700);
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
        className={`experience-video ${incomingReady ? 'experience-video-hidden' : 'experience-video-visible'}`}
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
          className={`experience-video ${incomingReady ? 'experience-video-visible' : 'experience-video-hidden'}`}
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

  return (
    <CalmExperience
      scenes={scenes}
      resolveMedia={resolveMedia}
      renderPlayer={(props) => <WebPlayer {...props} />}
      compact={compact}
      onShare={(scene) => shareMoment(scene.title, `${window.location.origin}/demo`)}
    />
  );
}
