import Image from 'next/image';

/**
 * A still preview of the demo, framed as a phone. It uses the same scrim and
 * heading treatment as the live stage so the landing page shows the real thing
 * rather than an abstract illustration.
 */
export function PhonePreview() {
  return (
    <div className="mx-auto w-full max-w-phone-preview">
      <div className="rounded-phone bg-device-shell p-2.5 shadow-xl ring-1 ring-foreground/20">
        <div className="relative aspect-phone overflow-hidden rounded-phone-screen bg-stage">
          <Image
            src="/media/landing/hero.jpg"
            alt="The Milky Way over Oeschinensee, mirrored in still water"
            fill
            priority
            sizes="18rem"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-scrim" />
          <div
            aria-hidden
            className="absolute top-2.5 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-device-shell"
          />
          <p className="absolute inset-x-5 top-11 text-lg font-normal tracking-tight text-stage-foreground">
            Take a breath.
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Oeschinensee under the Perseids by{' '}
        <a
          href="https://commons.wikimedia.org/wiki/File:036_Milky_Way_during_Perseids_seen_from_Oeschinensee_with_water_reflections_Photo_by_Giles_Laurent.jpg"
          rel="noreferrer noopener"
          target="_blank"
          className="rounded-md underline underline-offset-4 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Giles Laurent
        </a>
        ,{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          rel="noreferrer noopener license"
          target="_blank"
          className="rounded-md underline underline-offset-4 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          CC BY-SA 4.0
        </a>
        , downscaled and cropped.
      </p>
    </div>
  );
}
