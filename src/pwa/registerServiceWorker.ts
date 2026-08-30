import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('New PennyPilot build detected. Auto-updating app...');
        updateSW(true);
      },
      onOfflineReady() {
        console.log('PennyPilot PWA ready for offline usage.');
      }
    });
  }
}
