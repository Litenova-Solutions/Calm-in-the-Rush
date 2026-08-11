import { expect, test } from '@playwright/test';
import { getViolations, injectAxe } from 'axe-playwright';

test.beforeEach(() => {
  test.skip(
    process.env.CI !== 'true' && process.env.CALM_E2E_SERVER !== '1',
    'The local execution environment does not permit a listening web server.',
  );
});

test('landing has the calm hierarchy and does not request a video', async ({ page }) => {
  const videos: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'media') videos.push(request.url());
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'A quiet minute in the middle of everything.' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the demo' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open admin' })).toBeVisible();
  expect(videos).toHaveLength(0);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test('requirements are sourced and admin is excluded from robots', async ({ page }) => {
  await page.goto('/requirements');
  await expect(page.getByRole('heading', { name: 'Calm in the Rush product brief' })).toBeVisible();
  const robots = await page.request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /admin');
});

test('demo has no horizontal overflow and starts muted', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Take a breath.')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const viewport = page.viewportSize();
  const sceneButton = await page.getByRole('button', { name: 'Choose a scene' }).boundingBox();
  const shareButton = await page
    .getByRole('button', { name: 'Share this calm moment' })
    .boundingBox();
  expect(sceneButton ? sceneButton.y + sceneButton.height : 0).toBeLessThanOrEqual(
    (viewport?.height ?? 0) + 1,
  );
  expect(shareButton ? shareButton.y + shareButton.height : 0).toBeLessThanOrEqual(
    (viewport?.height ?? 0) + 1,
  );
  const video = page.locator('video').first();
  if (await video.count()) await expect(video).toHaveJSProperty('muted', true);
});

test('demo mounts without browser runtime errors and exposes its controls', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/demo');
  await expect(page.getByText('Take a breath.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose a scene' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share this calm moment' })).toBeVisible();
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('demo keeps the scene surface quiet and uses image-led controls', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Take a breath.')).toBeVisible();
  await expect(page.getByText('Lake McDonald', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /sound|mute|volume/i })).toHaveCount(0);

  await page.getByRole('button', { name: 'Choose a scene' }).click();
  await expect(page.getByText('Choose a place')).toBeVisible();
  await expect(page.getByText('Each scene keeps its original sound.', { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole('button', { name: /Lake McDonald/ })).toBeVisible();
  await expect(page.getByText('Lake McDonald', { exact: true })).toHaveCount(0);
});

test('scene picker opens as a centered mobile-sized surface on desktop', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Choose a scene' }).click();
  await expect(page.getByText('Choose a place')).toBeVisible();

  const surface = page.getByTestId('modal-surface');
  await expect(surface).toBeVisible();
  const box = await surface.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(box?.width ?? 0).toBeLessThanOrEqual(430);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(Math.min(320, (viewport?.width ?? 0) - 32));
  expect(box?.x ?? 0).toBeGreaterThan(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThan(viewport?.width ?? 0);
});

test('tapping the scene after idle reveals the calm controls', async ({ page }) => {
  await page.goto('/demo');
  const choose = page.getByRole('button', { name: 'Choose a scene' });
  await expect(choose).toBeVisible();
  await page.waitForTimeout(6200);
  await expect(choose).toBeHidden();
  await page.getByTestId('experience-reveal-controls').click();
  await expect(page.getByText('Take a breath.')).toBeVisible();
  await expect(choose).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share this calm moment' })).toBeVisible();
});

test('landing has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  const violations = await getViolations(page);
  expect(
    violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    ),
  ).toEqual([]);
});
