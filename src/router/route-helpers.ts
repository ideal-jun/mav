import { router } from '@/router';

/** Get the resolved path of a route by name. */
export function getRoutePath(name: string) {
  try {
    const resolved = router.resolve({ name });

    return resolved.name ? resolved.path : '';
  } catch {
    return '';
  }
}
