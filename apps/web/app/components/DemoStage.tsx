import DemoClient from '../demo/DemoClient';

export function DemoStage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-demo-canvas sm:p-3">
      <main className="flex min-h-0 flex-1 items-center justify-center">
        <DemoClient />
      </main>
    </div>
  );
}
