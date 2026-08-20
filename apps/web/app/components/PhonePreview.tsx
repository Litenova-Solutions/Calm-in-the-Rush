import Image from 'next/image';

/**
 * A still preview of the demo, framed as a phone. It uses the opening cover so
 * the landing page stays aligned with the visitor flow.
 */
export function PhonePreview() {
  return (
    <div className="mx-auto w-full max-w-phone-preview">
      <div className="rounded-phone bg-device-shell p-2.5 shadow-xl ring-1 ring-foreground/20">
        <div className="relative aspect-phone overflow-hidden rounded-phone-screen bg-stage">
          <Image
            src="/media/experience/cover-meadow.webp"
            alt="Long green grass in a quiet Dutch meadow"
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
        Generated app photograph. Its prompt, output hash, and license basis are recorded in the
        media provenance record.
      </p>
    </div>
  );
}
