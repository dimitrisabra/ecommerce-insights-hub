import { useSyncExternalStore, useCallback } from 'react';
import { subscribe } from '@/lib/store';

// Forces re-render when the shared store changes
export function useStoreSync() {
  const getSnapshot = useCallback(() => Date.now(), []);
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
