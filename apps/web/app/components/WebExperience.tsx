// Client boundary: this surface owns the visitor's uploads, chosen photo, and feedback in browser storage.
'use client';

import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, LayoutGrid, Volume2, VolumeX } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  galleryUploadKey,
  imageFileAccept,
  isGalleryScreen,
  seedExperience,
  seedExperienceNl,
  type ExperienceConfig,
  type ExperienceMedia,
  type ExperienceScreen,
  type ExperienceTile,
  type GalleryScreen,
  type VisitorUpload,
} from '@/lib/content/experience';
import { BrowserExperienceRepository } from '@/lib/content/browser-repository';
import {
  resolveExperienceLocale,
  visitorStrings,
  type ExperienceLocale,
  type TourTarget,
} from '@/lib/content/strings';

import { tileAlt, tileMedia, type LocalUrls, type UploadsByKey } from './experience/media';
import { BarButton, LogoButton, TopBar, brandLogo } from './experience/TopBar';
import { Tour, floatingCardClass, isTourComplete, markTourComplete } from './experience/Tour';
import {
  AboutView,
  ActiveView,
  BreathingView,
  GalleryView,
  TopicsView,
  type TopicCard,
} from './experience/views';
import { InstallPrompt } from './InstallPrompt';

/**
 * Where the visitor is. The active page shows the chosen photo with its sound
 * and sentence; the gallery lists topics; a topic shows its photos or breathing
 * cue; About holds the logo, links, and the visitor's feedback.
 */
type View =
  { name: 'active' } | { name: 'topics' } | { name: 'topic'; screenId: string } | { name: 'about' };

/** How many history entries a view sits above the active page. */
const viewDepth: Record<View['name'], number> = { active: 0, topics: 1, about: 1, topic: 2 };

type TileRef = { screenId: string; tileId: string };
type TopicScreen = Exclude<ExperienceScreen, { type: 'gateway' }>;

interface ActiveChoice {
  key: string;
  screen: GalleryScreen;
  tile: ExperienceTile;
  media: ExperienceMedia;
  alt: string;
  sentence: string;
  audio: string | null;
}

interface WebExperienceProps {
  repository?: BrowserExperienceRepository;
  locale?: ExperienceLocale;
}

const historyKey = 'calmView';

function uploadMap(uploads: readonly VisitorUpload[]): UploadsByKey {
  return new Map(
    uploads.map((upload) => [galleryUploadKey(upload.screenId, upload.tileId), upload]),
  );
}

/** The first choice: the first pre-filled tile of the first gallery set to open with it. */
function defaultChoice(screens: readonly ExperienceScreen[]): TileRef | null {
  for (const screen of screens) {
    if (!isGalleryScreen(screen) || !screen.useFirstTileAsCover) continue;
    const tile = screen.tiles[0];
    if (tile?.type === 'prefilled') return { screenId: screen.id, tileId: tile.id };
  }
  const first = screens.filter(isGalleryScreen).find((screen) => screen.tiles[0]);
  return first ? { screenId: first.id, tileId: first.tiles[0]!.id } : null;
}

function isTopic(screen: ExperienceScreen): screen is TopicScreen {
  return screen.type !== 'gateway';
}

function videoAudio(media: ExperienceMedia | undefined): string | null {
  return media?.kind === 'bundled-video' ? (media.audio ?? null) : null;
}

const choiceKey = (locale: ExperienceLocale) => `calm:active-photo:${locale}`;

function readStoredChoice(locale: ExperienceLocale): TileRef | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(choiceKey(locale)) ?? 'null') as unknown;
    if (value && typeof value === 'object' && 'screenId' in value && 'tileId' in value) {
      const { screenId, tileId } = value as Record<string, unknown>;
      if (typeof screenId === 'string' && typeof tileId === 'string') return { screenId, tileId };
    }
  } catch {
    // Unreadable or blocked storage falls back to the default photo.
  }
  return null;
}

function storeChoice(locale: ExperienceLocale, choice: TileRef): void {
  try {
    window.localStorage.setItem(choiceKey(locale), JSON.stringify(choice));
  } catch {
    // Blocked storage only means the choice is not remembered next visit.
  }
}

export function WebExperience({ repository, locale }: WebExperienceProps) {
  const activeLocale = resolveExperienceLocale(locale ?? repository?.locale);
  const copy = visitorStrings[activeLocale];
  const experience: ExperienceConfig = activeLocale === 'nl' ? seedExperienceNl : seedExperience;
  const repo = useMemo(
    () => repository ?? new BrowserExperienceRepository({ locale: activeLocale }),
    [repository, activeLocale],
  );
  const [uploads, setUploads] = useState<VisitorUpload[]>([]);
  const [localUrls, setLocalUrls] = useState<LocalUrls>({});
  // Saved feedback, and the form's working copy of it.
  const [feedback, setFeedback] = useState<{ calm: number | null; comment: string }>({
    calm: null,
    comment: '',
  });
  const [calmDraft, setCalmDraft] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [view, setView] = useState<View>({ name: 'active' });
  const [choice, setChoice] = useState<TileRef | null>(null);
  const [uploadTarget, setUploadTarget] = useState<TileRef | null>(null);
  const [removalTarget, setRemovalTarget] = useState<TileRef | null>(null);
  const [message, setMessage] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  // The install prompt waits until the visitor has chosen a photo or visited the breathing cue.
  const [engaged, setEngaged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextUploads, nextFeedback] = await Promise.all([
        repo.readVisitorUploads(),
        repo.readFeedback(),
      ]);
      const urls: LocalUrls = {};
      for (const upload of nextUploads) {
        const url = await repo.getObjectUrl(upload.media);
        if (url) urls[upload.media.blobId] = url;
      }
      setUploads(nextUploads);
      setLocalUrls(urls);
      setFeedback(nextFeedback);
      setCalmDraft(nextFeedback.calm);
      setCommentDraft(nextFeedback.comment);
    } catch (error) {
      setUploads([]);
      setMessage(error instanceof Error ? error.message : copy.experienceUnreadable);
    } finally {
      setReady(true);
    }
  }, [repo, copy]);

  useEffect(() => {
    setChoice(readStoredChoice(activeLocale));
    void refresh();
    return () => {
      if (!repository) repo.dispose();
    };
  }, [refresh, repo, repository, activeLocale]);

  const currentUploads = useMemo(() => uploadMap(uploads), [uploads]);
  const fallbackRef = useMemo(() => defaultChoice(experience.screens), [experience.screens]);

  /** Resolves a tile reference to something showable, or null when the photo is gone. */
  const resolveChoice = (ref: TileRef | null): ActiveChoice | null => {
    if (!ref) return null;
    const screen = experience.screens.find((candidate) => candidate.id === ref.screenId);
    if (!screen || !isGalleryScreen(screen)) return null;
    const tile = screen.tiles.find((candidate) => candidate.id === ref.tileId);
    const media = tile ? tileMedia(screen, tile, currentUploads) : undefined;
    if (!tile || !media) return null;
    return {
      key: `${screen.id}/${tile.id}/${media.kind === 'local' ? media.blobId : media.src}`,
      screen,
      tile,
      media,
      alt: tileAlt(screen, tile, currentUploads),
      sentence: tile.sentence,
      audio: videoAudio(media),
    };
  };
  const fallbackChoice = resolveChoice(fallbackRef);
  const active = resolveChoice(choice) ?? fallbackChoice;
  // A still photo has no sound of its own; it keeps the opening ambience so sound never cuts out.
  const activeAudio = active ? (active.audio ?? fallbackChoice?.audio ?? null) : null;

  // Navigation goes through browser history, so the phone's back gesture walks back up the app.
  useEffect(() => {
    const root: View = { name: 'active' };
    window.history.replaceState({ ...window.history.state, [historyKey]: root }, '');
    const onPop = (event: PopStateEvent) => {
      const state = (event.state as Record<string, View> | null)?.[historyKey];
      setView(state ?? root);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (next: View) => {
    setMessage('');
    window.history.pushState({ [historyKey]: next }, '');
    setView(next);
  };
  const back = () => window.history.back();
  /** Returns to the active page by unwinding the history entries above it. */
  const returnToActive = (from: View = view) => {
    const depth = viewDepth[from.name];
    if (depth > 0) window.history.go(-depth);
  };

  // Each new view moves focus to its heading, unless the tour card holds focus.
  const tourStepRef = useRef<number | null>(null);
  tourStepRef.current = tourStep;
  useEffect(() => {
    if (!ready || tourStepRef.current !== null) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [ready, view]);

  useEffect(() => {
    if (ready && !isTourComplete()) setTourStep(0);
  }, [ready]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const viewScreen =
    view.name === 'topic'
      ? experience.screens.find((screen) => screen.id === view.screenId)
      : undefined;

  useEffect(() => {
    if (viewScreen?.type === 'breathing') setEngaged(true);
  }, [viewScreen?.type]);

  const audibleAudio = view.name === 'active' ? activeAudio : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (!soundOn || !audibleAudio) return;
    if (audio.getAttribute('src') !== audibleAudio) audio.setAttribute('src', audibleAudio);
    const unlock = () => {
      void audio.play().catch(() => undefined);
    };
    void audio.play().catch(() => window.addEventListener('pointerdown', unlock, { once: true }));
    return () => window.removeEventListener('pointerdown', unlock);
  }, [audibleAudio, soundOn]);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.pause();
      setSoundOn(false);
      return;
    }
    void audio
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false));
  };

  /** Makes a photo the active page and goes back to it. */
  const choose = (ref: TileRef) => {
    setChoice(ref);
    storeChoice(activeLocale, ref);
    setEngaged(true);
    returnToActive();
  };

  const chooseUpload = (screenId: string, tileId: string) => {
    setUploadTarget({ screenId, tileId });
    fileInputRef.current?.click();
  };

  const saveUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    const target = uploadTarget;
    setUploadTarget(null);
    if (files.length === 0 || !target) return;
    try {
      const saved = await repo.saveVisitorUploadBatch(target.screenId, target.tileId, files);
      await refresh();
      if (saved.length === 1) {
        setMessage(copy.photoSaved);
      } else if (saved.length === 0) {
        setMessage(copy.uploadSlotsFull);
      } else if (saved.length < files.length) {
        setMessage(copy.photosPartial(saved.length, files.length));
      } else {
        setMessage(copy.photosSaved(saved.length));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.photosFailed);
    }
  };

  const confirmRemoval = async () => {
    const target = removalTarget;
    setRemovalTarget(null);
    if (!target) return;
    try {
      await repo.clearVisitorUpload(target.screenId, target.tileId);
      await refresh();
      setMessage(copy.photoRemoved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.photoRemoveFailed);
    }
  };

  const saveFeedback = async () => {
    if (calmDraft === null) return;
    setSavingFeedback(true);
    try {
      const saved = await repo.saveFeedback({ calm: calmDraft, comment: commentDraft });
      setFeedback(saved);
      setCommentDraft(saved.comment);
      setMessage(copy.feedback.feedbackSaved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.feedback.feedbackFailed);
    } finally {
      setSavingFeedback(false);
    }
  };

  const clearFeedback = async () => {
    setSavingFeedback(true);
    try {
      await repo.clearFeedback();
      setFeedback({ calm: null, comment: '' });
      setCalmDraft(null);
      setCommentDraft('');
      setMessage(copy.feedback.feedbackCleared);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.feedback.feedbackFailed);
    } finally {
      setSavingFeedback(false);
    }
  };

  const topics: TopicCard[] = experience.screens.filter(isTopic).map((screen) => {
    if (screen.type === 'breathing') {
      return {
        id: screen.id,
        title: screen.title,
        subtitle: copy.breathingKind,
        kind: screen.type,
      };
    }
    const withMedia = screen.tiles.flatMap((tile) => {
      const media = tileMedia(screen, tile, currentUploads);
      return media ? [media] : [];
    });
    return {
      id: screen.id,
      title: screen.title,
      subtitle: withMedia.length ? copy.topicPhotoCount(withMedia.length) : copy.topicEmpty,
      kind: screen.type,
      media: withMedia[0],
    };
  });

  const gateways = experience.screens.filter(
    (screen): screen is Extract<ExperienceScreen, { type: 'gateway' }> => screen.type === 'gateway',
  );
  const aboutDescription =
    gateways.map((screen) => screen.description.trim()).find(Boolean) ?? copy.aboutDescription;
  const aboutLinks = gateways.flatMap((screen) => screen.links);

  // The tour walks into the first gallery topic that has both a picture and an upload tile.
  const galleryTopics = experience.screens.filter(isGalleryScreen);
  const hasPhoto = (screen: GalleryScreen) =>
    screen.tiles.some((tile) => tile.type === 'prefilled');
  const hasUpload = (screen: GalleryScreen) => screen.tiles.some((tile) => tile.type === 'upload');
  const tourTopic =
    galleryTopics.find((screen) => hasPhoto(screen) && hasUpload(screen)) ??
    galleryTopics.find(hasPhoto);
  const tourSteps = copy.tour.steps.filter((step) => {
    if (step.target === 'sound') return Boolean(activeAudio);
    if (step.target === 'logo' || step.target === 'gallery') return Boolean(active);
    if (step.target === 'upload') return Boolean(tourTopic && hasUpload(tourTopic));
    return Boolean(tourTopic);
  });
  /** The view that holds a tour target. */
  const tourViewFor = (target: TourTarget): View => {
    if (target === 'topic') return { name: 'topics' };
    if ((target === 'photo' || target === 'upload') && tourTopic) {
      return { name: 'topic', screenId: tourTopic.id };
    }
    return { name: 'active' };
  };
  const sameView = (a: View, b: View) =>
    a.name === b.name && (a.name !== 'topic' || (b.name === 'topic' && a.screenId === b.screenId));
  const tourCurrent = tourStep !== null ? tourSteps[tourStep] : undefined;
  const tourOpen = Boolean(tourCurrent && sameView(view, tourViewFor(tourCurrent.target)));
  const tourOpenRef = useRef(false);
  tourOpenRef.current = tourOpen;

  const endTour = useCallback(() => {
    markTourComplete();
    setTourStep(null);
  }, []);

  /** Finishing or skipping the tour lands on the active page, wherever the tour was. */
  const finishTour = () => {
    endTour();
    returnToActive();
  };

  /** Moves the tour on, opening the view the next step points into. */
  const nextTourStep = () => {
    if (tourStep === null) return;
    const following = tourSteps[tourStep + 1];
    if (!following) {
      finishTour();
      return;
    }
    const target = tourViewFor(following.target);
    if (!sameView(view, target)) go(target);
    setTourStep(tourStep + 1);
  };

  // Leaving the tour's view another way, such as the back gesture, ends the tour where it is.
  useEffect(() => {
    if (tourStepRef.current !== null && !tourOpenRef.current) endTour();
  }, [view, endTour]);

  const backButton = (
    <BarButton label={copy.back} variant="page" onClick={back}>
      <ChevronLeft aria-hidden />
    </BarButton>
  );

  const renderView = () => {
    if (!ready || !active) {
      const logo = brandLogo(activeLocale);
      return (
        <div className="grid size-full place-items-center bg-background" role="status">
          <Image
            src={logo.src}
            alt=""
            width={480}
            height={480}
            sizes="5rem"
            className="h-auto w-20 animate-pulse motion-reduce:animate-none"
            preload
          />
          <span className="sr-only">{copy.preparing}</span>
        </div>
      );
    }
    if (view.name === 'topics') {
      return (
        <TopicsView
          topics={topics}
          tourTopicId={tourTopic?.id}
          localUrls={localUrls}
          onOpen={(screenId) => go({ name: 'topic', screenId })}
          bar={
            <TopBar
              variant="page"
              title={copy.galleryTitle}
              headingRef={headingRef}
              left={backButton}
            />
          }
        />
      );
    }
    if (view.name === 'topic' && viewScreen && isTopic(viewScreen)) {
      if (viewScreen.type === 'breathing') {
        return (
          <BreathingView
            description={viewScreen.description}
            bar={
              <TopBar
                variant="overlay"
                title={viewScreen.title}
                headingRef={headingRef}
                left={
                  <BarButton label={copy.back} variant="overlay" onClick={back}>
                    <ChevronLeft aria-hidden />
                  </BarButton>
                }
              />
            }
          />
        );
      }
      return (
        <GalleryView
          screen={viewScreen}
          uploads={currentUploads}
          localUrls={localUrls}
          activeTileId={active.screen.id === viewScreen.id ? active.tile.id : undefined}
          labels={{
            grid: copy.galleryPhotos(viewScreen.title),
            show: copy.showTile,
            showing: copy.showing,
            remove: copy.removeTile,
            uploadHint: copy.uploadHint,
            noPhotos: copy.noPhotos,
          }}
          onSelect={(tileId) => choose({ screenId: viewScreen.id, tileId })}
          onAddPhoto={(tileId) => chooseUpload(viewScreen.id, tileId)}
          onRemovePhoto={(tileId) => setRemovalTarget({ screenId: viewScreen.id, tileId })}
          bar={
            <TopBar
              variant="page"
              title={viewScreen.title}
              headingRef={headingRef}
              left={backButton}
            />
          }
        />
      );
    }
    if (view.name === 'about') {
      return (
        <AboutView
          locale={activeLocale}
          description={aboutDescription}
          links={aboutLinks}
          oneLiner={experience.oneLiner}
          feedback={feedback}
          calm={calmDraft}
          comment={commentDraft}
          saving={savingFeedback}
          labels={{
            ...copy.feedback,
            save: copy.save,
            clear: copy.clear,
            showTour: copy.showTour,
            privacyNote: copy.privacyNote,
          }}
          onCalmChange={setCalmDraft}
          onCommentChange={setCommentDraft}
          onSave={() => void saveFeedback()}
          onClear={() => void clearFeedback()}
          onShowTour={() => {
            setTourStep(0);
            back();
          }}
          bar={
            <TopBar
              variant="page"
              title={copy.aboutTitle}
              titleHidden
              headingRef={headingRef}
              left={backButton}
            />
          }
        />
      );
    }
    return (
      <ActiveView
        media={active.media}
        mediaKey={active.key}
        alt={active.alt}
        sentence={active.sentence}
        localUrls={localUrls}
        bar={
          <TopBar
            variant="overlay"
            title={copy.homeTitle}
            titleHidden
            headingRef={headingRef}
            left={
              <LogoButton
                locale={activeLocale}
                label={copy.openAbout}
                onClick={() => go({ name: 'about' })}
              />
            }
            right={
              <>
                {activeAudio ? (
                  <BarButton
                    label={soundOn ? copy.muteSound : copy.unmuteSound}
                    variant="overlay"
                    pressed={soundOn}
                    tourId="sound"
                    onClick={toggleSound}
                  >
                    {soundOn ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
                  </BarButton>
                ) : null}
                <BarButton
                  label={copy.openGallery}
                  variant="overlay"
                  tourId="gallery"
                  onClick={() => go({ name: 'topics' })}
                >
                  <LayoutGrid aria-hidden />
                </BarButton>
              </>
            }
          />
        }
      />
    );
  };

  return (
    <section
      ref={sectionRef}
      aria-label={copy.experienceLabel}
      lang={activeLocale}
      className="relative size-full overflow-hidden bg-background"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={imageFileAccept}
        multiple
        tabIndex={-1}
        aria-label={copy.choosePhotos}
        className="sr-only"
        onChange={(event) => void saveUpload(event)}
      />
      <audio ref={audioRef} loop preload="none" aria-hidden />
      {renderView()}
      {tourOpen && tourCurrent && tourStep !== null ? (
        <Tour
          copy={copy.tour}
          step={tourCurrent}
          index={tourStep}
          total={tourSteps.length}
          container={sectionRef}
          onNext={nextTourStep}
          onClose={finishTour}
        />
      ) : null}
      <InstallPrompt
        copy={copy.install}
        allowed={
          ready &&
          engaged &&
          !tourOpen &&
          view.name !== 'active' &&
          !message &&
          !uploadTarget &&
          !removalTarget
        }
      />
      {message ? (
        <p role="status" className={cn(floatingCardClass, 'bottom-float z-30 text-center text-sm')}>
          {message}
        </p>
      ) : null}
      <Dialog
        open={removalTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemovalTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.removePhotoTitle}</DialogTitle>
            <DialogDescription>{copy.removePhotoDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRemovalTarget(null)}>
              {copy.keepIt}
            </Button>
            <Button type="button" variant="destructive" onClick={() => void confirmRemoval()}>
              {copy.remove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
