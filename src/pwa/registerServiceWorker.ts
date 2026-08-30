import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('New PennyPilot build detected. Auto-updating app...');
        updateSW(true);
      },
      onOfflineReady() {
        console.log('PennyPilot PWA ready for offline usage.');
      }
    });

    // Check for service worker updates periodically (every 60 seconds)
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update();
        }
      });
    }, 60 * 1000);
  }
}

// Force reload and update cache handler for UI button
export async function forceCheckAppUpdate(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.update();
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
    // Clear cache storage and reload window
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    window.location.reload();
    return true;
  }
  window.location.reload();
  return false;
}
