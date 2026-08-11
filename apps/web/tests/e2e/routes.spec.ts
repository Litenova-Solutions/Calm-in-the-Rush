import { expect, test } from '@playwright/test';
import { getViolations, injectAxe } from 'axe-playwright';

test.beforeEach(() => {
  test.skip(
    process.env.CALM_E2E_NO_SERVER === '1',
    'This environment cannot start a listening web server.',
  );
});

async function seriousViolations(page: import('@playwright/test').Page) {
  await injectAxe(page);
  const violations = await getViolations(page);
  return violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
}

async function hasHorizontalOverflow(page: import('@playwright/test').Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}

/**
 * The admin marks its form ready once the client has read the catalog. Interacting
 * sooner can drop a click or a file selection on the server-rendered markup and
 * produce nothing, which under parallel load looks like a missing error message.
 */
async function adminReady(page: import('@playwright/test').Page) {
  await expect(page.locator('[data-ready="true"]')).toBeVisible({ timeout: 15000 });
}

// UI-LANDING-READY
test('landing has the calm hierarchy and does not request a video', async ({ page }) => {
  const videos: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'media') videos.push(request.url());
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'A quiet minute in the middle of everything.' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open the demo' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open admin' })).toBeVisible();
  expect(videos).toHaveLength(0);
  expect(await hasHorizontalOverflow(page)).toBe(false);
});

// UI-LANDING-READY: the hero shows a phone-framed still with the demo wording and
// a reachable photograph credit, as the licence requires.
test('landing hero frames the demo still and credits the photograph', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('img', {
    name: 'The Milky Way over Oeschinensee, mirrored in still water',
  });
  await expect(hero).toBeVisible();
  const box = await hero.boundingBox();
  // The frame is portrait, like a phone.
  expect((box?.height ?? 0) / (box?.width ?? 1)).toBeGreaterThan(1.5);
  await expect(page.getByText('Take a breath.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Giles Laurent' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'CC BY-SA 4.0' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Credits' })).toBeVisible();
});

// The credits page carries the full attribution for every licensed asset.
test('credits page lists the landing photograph and the scenes', async ({ page }) => {
  await page.goto('/credits');
  await expect(page.getByRole('heading', { level: 2, name: 'Landing photograph' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Scenes' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Giles Laurent' })).toBeVisible();
});

// UI-LANDING-INITIAL: direct navigation starts at the top with body focus.
test('landing opens at the top of the document with no element focused', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await page.evaluate(() => document.activeElement?.tagName ?? 'BODY')).toBe('BODY');
});

// UI-LANDING-KEYBOARD: the header is reachable and the primary action is operable.
test('landing header is keyboard reachable in document order', async ({ page, browserName }) => {
  // WebKit follows Safari, which does not tab to links unless the user turns the
  // preference on. The behavior is verified on the engines that do.
  test.skip(browserName === 'webkit', 'WebKit does not tab to links by default.');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Calm in the Rush' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Requirements' }).first()).toBeFocused();
});

// UI-REQUIREMENTS-READY
test('requirements are sourced and admin is excluded from robots', async ({ page }) => {
  await page.goto('/requirements');
  await expect(page.getByRole('heading', { name: 'Calm in the Rush product brief' })).toBeVisible();
  const robots = await page.request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /admin');
});

// UI-DEMO-READY
test('demo has no horizontal overflow and starts muted', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Take a breath.')).toBeVisible();
  expect(await hasHorizontalOverflow(page)).toBe(false);
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
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Choose a place')).toBeVisible();
  await expect(page.getByRole('button', { name: /Lake McDonald/ })).toBeVisible();
  await expect(page.getByText('Lake McDonald', { exact: true })).toHaveCount(0);
});

// UI-DEMO-PICKER-FOCUS: the picker traps focus and returns it on close.
test('scene picker moves focus in and returns it to the opening control', async ({ page }) => {
  await page.goto('/demo');
  const choose = page.getByRole('button', { name: 'Choose a scene' });
  await choose.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Choose a place');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(choose).toBeFocused();
});

// UI-DEMO-PICKER-SELECT
test('choosing a scene closes the picker and keeps the stage visible', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Choose a scene' }).click();
  await page
    .getByRole('button', { name: /Wheat field|Forest|Brook|Lake McDonald/ })
    .last()
    .click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByTestId('experience-media-surface')).toBeVisible();
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

// UI-ADMIN-READY
test('admin renders its catalog, form, and preview regions', async ({ page }) => {
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Keep the scene shelf close.' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Scene catalog' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Add scene' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Phone preview' })).toBeVisible();
  expect(await hasHorizontalOverflow(page)).toBe(false);
});

// UI-ADMIN-LABELS: the two admin inputs have accessible names and nothing else
// is asked for.
test('admin form asks for a title and a video only', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByLabel('Title', { exact: true })).toBeVisible();
  await expect(page.getByLabel('MP4 video', { exact: true })).toBeVisible();
  for (const removed of [
    'Location',
    'Description',
    'Sound label',
    'Creator',
    'Source URL',
    'License',
    'Order',
    'Changes made',
    'Poster',
  ]) {
    await expect(page.getByLabel(removed, { exact: true })).toHaveCount(0);
  }
  await expect(page.getByTestId('scene-cover-preview')).toBeVisible();
});

// UI-ADMIN-DESTRUCTIVE: the destructive action confirms in a dialog, not a native prompt.
test('deleting a scene asks for confirmation in a dialog and can be cancelled', async ({
  page,
}) => {
  await page.goto('/admin');
  await adminReady(page);
  await page
    .getByRole('button', { name: /^Delete / })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Delete this scene?');
  await dialog.getByRole('button', { name: 'Keep the scene' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { level: 2, name: 'Scene catalog' })).toBeVisible();
});

// UI-ADMIN-VALIDATION: saving an empty form reports a recoverable error.
test('saving an incomplete scene reports a validation error', async ({ page }) => {
  await page.goto('/admin');
  await adminReady(page);
  await page.getByRole('button', { name: 'Add scene' }).click();
  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: /Title must be|required/i })
      .first(),
  ).toBeVisible();
});

// UI-ADMIN-VALIDATION: a rejected file is reported when it is chosen, before any write.
test('choosing a non-MP4 file is rejected at selection time', async ({ page }) => {
  await page.goto('/admin');
  await adminReady(page);
  await page.getByRole('button', { name: 'Add scene' }).click();
  await page.getByLabel('MP4 video', { exact: true }).setInputFiles({
    name: 'not-a-video.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a video'),
  });
  await expect(
    page.getByRole('alert').filter({ hasText: 'Video must be an MP4 file.' }),
  ).toBeVisible();
});

// UI-LANDING-AXE / UI-DEMO-AXE / UI-ADMIN-AXE
for (const route of ['/', '/requirements', '/demo', '/admin', '/credits']) {
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    expect(await seriousViolations(page)).toEqual([]);
  });
}
