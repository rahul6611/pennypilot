import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('New content available, refresh app.');
      },
      onOfflineReady() {
        console.log('PennyPilot is ready for offline operation.');
      }
    });
  }
}
