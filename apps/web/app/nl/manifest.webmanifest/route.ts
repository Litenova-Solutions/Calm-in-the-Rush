import { manifestResponse } from '@/lib/pwa/manifest';

export const dynamic = 'force-static';

export function GET() {
  return manifestResponse('nl');
}
