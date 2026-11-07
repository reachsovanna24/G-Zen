import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // Read saved theme from localStorage, default to 'dark'
  const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('gzen_theme')) || 'dark';
  const currentTheme = ref(savedTheme);

  const isDark = computed(() => currentTheme.value === 'dark');
  const isLight = computed(() => currentTheme.value === 'light');

  const applyThemeToDOM = (theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark', 'dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('theme-dark', 'dark');
      root.setAttribute('data-theme', 'dark');
    }
  };

  // Initialize DOM immediately
  applyThemeToDOM(currentTheme.value);

  const setTheme = (theme) => {
    currentTheme.value = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gzen_theme', theme);
    }
    applyThemeToDOM(theme);
  };

  const toggleTheme = () => {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark');
  };

  return {
    currentTheme,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
    applyThemeToDOM,
  };
});

