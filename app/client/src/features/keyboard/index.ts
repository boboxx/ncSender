import { registerCoreKeyboardActions } from './actions';
import { keyBindingStore } from './key-binding-store';
import { getKeyboardManager } from './keyboard-manager';
import { useMacroStore } from '../macro/store';

export function initializeKeyboardShortcuts(): void {
  keyBindingStore.bootstrap();
  registerCoreKeyboardActions();
  getKeyboardManager();
  try {
    const macroStore = useMacroStore();
    macroStore.loadMacros?.().catch(() => {
      // Macro loading is non-critical for keyboard initialization
    });
  } catch (error) {
    console.warn('Failed to pre-load macros for keyboard shortcuts:', error);
  }
}

export { keyBindingStore } from './key-binding-store';
export { normalizeCombo, comboFromEvent } from './keyboard-utils';
