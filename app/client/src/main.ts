import { createApp } from 'vue';
import App from './App.vue';
import '@/assets/styles/base.css';
import { loadSettings } from './lib/settings-store.js';
import { initializeKeyboardShortcuts } from './features/keyboard';
import { initializeStore, seedInitialState } from './composables/use-app-store';
import { registerWebComponents } from './web-components';

// Disable context menu globally for touch screen compatibility
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
}, { passive: false });

// Disable text selection on touch devices, except in allowed areas
document.addEventListener('selectstart', (e) => {
  const target = e.target as Node | null;
  const el = (target && target.nodeType === Node.ELEMENT_NODE)
    ? (target as Element)
    : (target as any)?.parentElement as Element | null;

  // Allow selection in inputs, textareas, contenteditable, console history, and G-code viewer
  if (el && el.closest('input, textarea, [contenteditable], .console-output, .gcode-content, .gcode-line, .line-content')) {
    return true;
  }

  e.preventDefault();
  return false;
}, { passive: false });

// Async initialization
(async () => {
  // Load settings before mounting the app
  await loadSettings();

  // Initialize centralized store and WebSocket event listeners
  initializeStore();

  // Initialize keyboard shortcuts after settings and store are ready
  initializeKeyboardShortcuts();

  // Seed initial state from server
  await seedInitialState();

  // Register web components for plugins
  registerWebComponents();

  const app = createApp(App);

  // Patch Vue's addEventListener to use passive: false for touch events
  const originalAddEventListener = Element.prototype.addEventListener;
  Element.prototype.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'touchstart' || type === 'touchmove' || type === 'wheel') {
      if (typeof options === 'boolean') {
        options = { capture: options, passive: false };
      } else if (typeof options === 'object' && options !== null) {
        options = { ...options, passive: false };
      } else {
        options = { passive: false };
      }
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  app.mount('#app');

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  }
})();
