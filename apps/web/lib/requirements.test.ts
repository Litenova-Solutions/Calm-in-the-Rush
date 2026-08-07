import { describe, expect, it } from 'vitest';

import { readProductBrief } from './requirements';

describe('product brief source', () => {
  it('parses metadata and keeps the canonical markdown body', async () => {
    const brief = await readProductBrief();
    expect(brief.metadata.kind).toBe('product');
    expect(brief.markdown).toContain('find-a-calm-moment');
    expect(brief.markdown).not.toContain('<script');
  });
});
