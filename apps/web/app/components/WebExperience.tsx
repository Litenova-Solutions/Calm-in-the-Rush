// Client boundary: this surface owns browser media playback, local storage, and sharing.
'use client';

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { ImagePlus, Images, Share2 } from 'lucide-react';
import {
  seedCatalog,
  seedSentenceBank,
  sortPublishedScenes,
  type CalmScene,
  type CalmSentence,
  type MediaRef,
  type SentenceBank,
} from '@calm/content';
import { resolveBundledMedia } from '@calm/content/media';
import { useReducedMotion } from '@calm/experience/reduced-motion';
import { shareMoment } from '@calm/experience/share';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { BrowserSceneRepository } from '../../lib/content/browser-repository';

type ExperienceStep = 'lead' | 'gallery' | 'playing';

type PersonalPhoto = {
  name: string;
  url: string;
};

interface WebExperienceProps {
  repository?: BrowserSceneRepository;
}

function sceneLabel(scene: CalmScene): string {
  return [scene.title, scene.location, scene.attribution.creator].filter(Boolean).join(', ');
}

function randomNatureSentence(bank: SentenceBank, currentId?: string): CalmSentence | undefined {
  const allNatureSentences = bank.sentences.filter((sentence) => sentence.section === 'nature');
  const choices =
    currentId && allNatureSentences.length > 1
      ? allNatureSentences.filter((sentence) => sentence.id !== currentId)
      : allNatureSentences;
  return choices[Math.floor(Math.random() * choices.length)];
}

const initialSentence =
  seedSentenceBank.sentences.find((sentence) => sentence.section === 'nature') ??
  seedSentenceBank.sentences[0]!;

export function WebExperience({ repository }: WebExperienceProps) {
  const repo = useMemo(() => repository ?? new BrowserSceneRepository(), [repository]);
  const [scenes, setScenes] = useState<CalmScene[]>(() => sortPublishedScenes(seedCatalog.scenes));
  const [sentenceBank, setSentenceBank] = useState<SentenceBank>(seedSentenceBank);
  const [sentence, setSentence] = useState<CalmSentence>(initialSentence);
  const [sentenceRevision, setSentenceRevision] = useState(0);
  const [localMedia, setLocalMedia] = useState<Record<string, string>>({});
  const [step, setStep] = useState<ExperienceStep>('lead');
  const [selectedId, setSelectedId] = useState<string>('');
  const [personalPhoto, setPersonalPhoto] = useState<PersonalPhoto | null>(null);
  const [message, setMessage] = useState<string>('');
  const [controlsVisible, setControlsVisible] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusedRef = useRef(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reducedMotion = useReducedMotion();

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!focusedRef.current) setControlsVisible(false);
    }, 6000);
  }, []);

  const rotateSentence = useCallback(() => {
    setSentence((current) => randomNatureSentence(sentenceBank, current.id) ?? current);
    setSentenceRevision((current) => current + 1);
  }, [sentenceBank]);

  useEffect(() => {
    let active = true;
    const loadContent = async () => {
      try {
        const [catalog, nextSentenceBank] = await Promise.all([
          repo.readCatalog(),
          repo.readSentenceBank(),
        ]);
        const published = sortPublishedScenes(catalog.scenes);
        const nextMedia: Record<string, string> = {};
        for (const scene of published) {
          for (const ref of [scene.poster, scene.video]) {
            if (ref.kind !== 'local') continue;
            const url = await repo.getObjectUrl(ref);
            if (url) nextMedia[ref.blobId] = url;
          }
        }
        if (!active) return;
        setScenes(published);
        setSentenceBank(nextSentenceBank);
        setSentence((current) =>
          nextSentenceBank.sentences.some((candidate) => candidate.id === current.id)
            ? current
            : (randomNatureSentence(nextSentenceBank) ?? current),
        );
        setLocalMedia(nextMedia);
      } catch {
        if (active) setMessage('Your local content could not be read. Showing the bundled places.');
      }
    };
    void loadContent();
    return () => {
      active = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (!repository) repo.dispose();
    };
  }, [repo, repository]);

  useEffect(
    () => () => {
      if (personalPhoto) URL.revokeObjectURL(personalPhoto.url);
    },
    [personalPhoto],
  );

  useEffect(() => {
    revealControls();
  }, [revealControls, selectedId, step]);

  const visibleScenes = scenes.slice(0, 4);
  const leadScene = visibleScenes[0];
  const selectedScene = visibleScenes.find((scene) => scene.id === selectedId) ?? undefined;
  const hasPersonalPhoto = step === 'playing' && personalPhoto !== null;

  const resolveMedia = (ref: MediaRef): string =>
    ref.kind === 'local' ? (localMedia[ref.blobId] ?? '') : (resolveBundledMedia(ref) ?? '');

  const selectedVideo = selectedScene ? resolveMedia(selectedScene.video) : '';
  const selectedPoster = selectedScene ? resolveMedia(selectedScene.poster) : '';
  const selectedImage = personalPhoto?.url ?? selectedPoster;

  // A layout effect runs as part of the click-driven DOM update. That keeps the
  // audio request tied to the deliberate picture selection browsers require.
  useLayoutEffect(() => {
    if (step !== 'playing' || hasPersonalPhoto || !selectedVideo) return;
    const player = reducedMotion ? audioRef.current : videoRef.current;
    if (!player) return;
    void player.play().catch(() => {
      setMessage('Sound could not start. Select the picture again.');
    });
  }, [hasPersonalPhoto, reducedMotion, selectedVideo, step]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const player = reducedMotion ? audioRef.current : videoRef.current;
      if (!player) return;
      if (document.hidden) {
        player.pause();
        return;
      }
      if (step === 'playing' && !hasPersonalPhoto && selectedVideo) {
        void player.play().catch(() => {
          setMessage('Sound could not restart. Select the picture again.');
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasPersonalPhoto, reducedMotion, selectedVideo, step]);

  const openGallery = () => {
    setMessage('');
    setStep('gallery');
    revealControls();
  };

  const playScene = (scene: CalmScene) => {
    videoRef.current?.pause();
    audioRef.current?.pause();
    setMessage('');
    setPersonalPhoto(null);
    setSelectedId(scene.id);
    setStep('playing');
    rotateSentence();
    revealControls();
  };

  const choosePersonalPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Choose an image file.');
      return;
    }
    videoRef.current?.pause();
    audioRef.current?.pause();
    setMessage('');
    setPersonalPhoto({ name: file.name || 'Your photo', url: URL.createObjectURL(file) });
    setSelectedId('');
    setStep('playing');
    rotateSentence();
    revealControls();
  };

  const returnToGallery = () => {
    videoRef.current?.pause();
    audioRef.current?.pause();
    setMessage('');
    setStep('gallery');
    revealControls();
  };

  const share = async () => {
    const title = personalPhoto ? 'Your quiet moment' : selectedScene?.title;
    if (!title) return;
    const result = await shareMoment(title, window.location.href);
    if (result === 'copied') setMessage('Link copied.');
    if (result === 'failed') setMessage('Sharing is not available here.');
  };

  if (!leadScene) {
    return (
      <div className="relative aspect-phone overflow-hidden rounded-phone-screen bg-stage p-6 text-stage-foreground">
        <p>No local scenes are available.</p>
      </div>
    );
  }

  const leadPoster = resolveMedia(leadScene.poster);
  const sectionLabel = hasPersonalPhoto ? 'Your photo' : 'Nature';

  return (
    <section
      aria-label="Calm experience"
      className="relative aspect-phone overflow-hidden rounded-phone-screen bg-stage"
      onPointerDown={revealControls}
      onPointerMove={revealControls}
      onFocusCapture={() => {
        focusedRef.current = true;
        revealControls();
      }}
      onBlurCapture={() => {
        focusedRef.current = false;
      }}
    >
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-label="Choose a photo from your device"
        className="sr-only"
        onChange={choosePersonalPhoto}
      />

      <div
        aria-hidden
        className="absolute top-2.5 left-1/2 z-30 h-4 w-16 -translate-x-1/2 rounded-full bg-stage"
      />

      {step === 'lead' ? (
        <button
          type="button"
          aria-label={`Open five picture choices. ${sceneLabel(leadScene)}`}
          onClick={openGallery}
          className="absolute inset-0 cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {leadPoster ? (
            <Image
              src={leadPoster}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 18rem"
              unoptimized
              className="object-cover"
            />
          ) : null}
          <span aria-hidden className="absolute inset-0 bg-scrim" />
        </button>
      ) : null}

      {step === 'gallery' ? (
        <div className="grid size-full grid-cols-2 gap-px bg-stage">
          {visibleScenes.map((scene) => {
            const poster = resolveMedia(scene.poster);
            return (
              <button
                key={scene.id}
                type="button"
                aria-label={`Play ${sceneLabel(scene)}`}
                onClick={() => playScene(scene)}
                className="relative overflow-hidden bg-stage focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {poster ? (
                  <Image
                    src={poster}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 9rem"
                    unoptimized
                    className="object-cover"
                  />
                ) : null}
              </button>
            );
          })}
          <button
            type="button"
            aria-label={personalPhoto ? 'Replace your photo' : 'Choose a photo from your device'}
            onClick={() => photoInputRef.current?.click()}
            className="relative col-span-2 flex min-h-22 items-center justify-center overflow-hidden bg-muted px-4 text-center text-foreground focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {personalPhoto ? (
              <Image
                src={personalPhoto.url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 18rem"
                unoptimized
                className="object-cover"
              />
            ) : null}
            {personalPhoto ? <span aria-hidden className="absolute inset-0 bg-scrim" /> : null}
            <span
              className={cn(
                'relative flex items-center gap-2 text-sm font-medium',
                personalPhoto ? 'text-stage-foreground' : 'text-foreground',
              )}
            >
              <ImagePlus className="size-5" aria-hidden />
              {personalPhoto ? 'Replace your photo' : 'Use your own photo'}
            </span>
          </button>
        </div>
      ) : null}

      {step === 'playing' && (selectedScene || personalPhoto) ? (
        <>
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={personalPhoto?.name ?? ''}
              fill
              sizes="(max-width: 1024px) 100vw, 18rem"
              unoptimized
              className="object-cover"
              onError={() => {
                if (personalPhoto) setMessage('The photo could not load. Choose another photo.');
              }}
            />
          ) : null}
          {selectedVideo && !reducedMotion ? (
            <video
              ref={videoRef}
              src={selectedVideo}
              autoPlay
              loop
              muted={false}
              playsInline
              preload="auto"
              aria-hidden
              onError={() => setMessage('The video could not load. Showing the still picture.')}
              className="absolute inset-0 size-full object-cover"
            >
              Your browser cannot play this video.
            </video>
          ) : null}
          {selectedVideo && reducedMotion ? (
            <audio
              ref={audioRef}
              src={selectedVideo}
              autoPlay
              loop
              muted={false}
              preload="auto"
              onError={() => setMessage('The sound could not load. Showing the still picture.')}
            />
          ) : null}
          <div aria-hidden className="absolute inset-0 bg-scrim" />
        </>
      ) : null}

      {step !== 'gallery' ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-5 top-11 z-20 flex flex-col gap-2 transition-opacity duration-300',
            controlsVisible ? 'opacity-100' : 'opacity-0',
          )}
        >
          {step !== 'lead' ? (
            <p className="text-xs font-medium tracking-wide text-stage-foreground uppercase">
              {sectionLabel}
            </p>
          ) : null}
          <p
            key={`${sentence.id}-${sentenceRevision}`}
            className="max-w-48 text-lg font-normal tracking-tight text-stage-foreground motion-safe:animate-sentence-arrive"
          >
            {sentence.text}
          </p>
        </div>
      ) : null}

      {message ? (
        <Alert className="absolute inset-x-4 bottom-18 z-30 w-auto">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {step === 'playing' ? (
        <div
          className={cn(
            'absolute inset-x-4 bottom-4 z-30 flex items-center justify-center gap-3 transition-opacity duration-300',
            controlsVisible ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Button
            variant="secondary"
            size="icon-lg"
            aria-label="Open picture gallery"
            onClick={returnToGallery}
          >
            <Images />
          </Button>
          <Button
            variant="secondary"
            size="icon-lg"
            aria-label="Share this calm moment"
            onClick={() => void share()}
          >
            <Share2 />
          </Button>
        </div>
      ) : null}
    </section>
  );
}
