import { Share } from 'react-native';

export async function shareMoment(
  title: string,
  url: string,
): Promise<'shared' | 'copied' | 'failed'> {
  try {
    await Share.share({ title, message: `${title}\n${url}`, url });
    return 'shared';
  } catch {
    return 'failed';
  }
}
