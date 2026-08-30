export type ThemeMode = 'dark' | 'light' | 'system';

export function getStoredTheme(): ThemeMode {
  const saved = localStorage.getItem('pennypilot_theme');
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved;
  }
  return 'dark'; // Default Fintech Dark Mode
}

export function applyThemeMode(mode: ThemeMode) {
  localStorage.setItem('pennypilot_theme', mode);
  const root = document.documentElement;

  let isDark = true;
  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else if (mode === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

// System theme listener setup
export function initThemeListener(onThemeChange?: (mode: ThemeMode) => void) {
  const initialMode = getStoredTheme();
  applyThemeMode(initialMode);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemChange = () => {
    const currentMode = getStoredTheme();
    if (currentMode === 'system') {
      applyThemeMode('system');
      if (onThemeChange) onThemeChange('system');
    }
  };

  mediaQuery.addEventListener('change', handleSystemChange);
  return () => mediaQuery.removeEventListener('change', handleSystemChange);
}
