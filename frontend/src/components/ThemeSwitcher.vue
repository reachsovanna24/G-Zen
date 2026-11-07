<script setup>
import { useThemeStore } from '../stores/themeStore';
import { useLanguageStore } from '../stores/languageStore';
import { Sun, Moon } from 'lucide-vue-next';

const props = defineProps({
  variant: {
    type: String,
    default: 'segmented', // 'segmented' or 'icon'
  }
});

const themeStore = useThemeStore();
const langStore = useLanguageStore();
</script>

<template>
  <!-- Segmented Switcher for Desktop Navbar & Admin Sidebar -->
  <div 
    v-if="variant === 'segmented'"
    class="inline-flex items-center p-1 rounded-xl shadow-inner gap-0.5 border transition-colors duration-200"
    :class="themeStore.isLight 
      ? 'bg-slate-200/90 border-slate-300' 
      : 'bg-slate-900/95 border-slate-700/80'"
    role="group"
    aria-label="Theme Switcher"
  >
    <!-- Dark Theme Button -->
    <button
      type="button"
      @click="themeStore.setTheme('dark')"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-xs font-semibold"
      :class="themeStore.isDark 
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40' 
        : (themeStore.isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60')"
      :title="langStore.isKhmer ? 'ស្បែកងងឹត' : 'Dark Theme'"
    >
      <Moon class="w-3.5 h-3.5 shrink-0" :class="themeStore.isDark ? 'fill-slate-950' : ''" />
      <span class="tracking-wide">{{ langStore.isKhmer ? 'ងងឹត' : 'Dark' }}</span>
    </button>

    <!-- Bright Theme Button -->
    <button
      type="button"
      @click="themeStore.setTheme('light')"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-xs font-semibold"
      :class="themeStore.isLight 
        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
      :title="langStore.isKhmer ? 'ស្បែកពន្លឺ' : 'Bright Theme (Daylight)'"
    >
      <Sun class="w-3.5 h-3.5 shrink-0" :class="themeStore.isLight ? 'fill-amber-600 text-slate-950' : ''" />
      <span class="tracking-wide">{{ langStore.isKhmer ? 'ពន្លឺ' : 'Bright' }}</span>
    </button>
  </div>

  <!-- Compact Icon Toggle for Mobile Navbar -->
  <button
    v-else
    type="button"
    @click="themeStore.toggleTheme"
    class="p-2 rounded-xl transition-all duration-200 flex items-center justify-center border cursor-pointer"
    :class="themeStore.isLight 
      ? 'bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200' 
      : 'bg-slate-900/90 text-amber-300 border-slate-700/80 hover:bg-slate-800'"
    :title="themeStore.isDark 
      ? (langStore.isKhmer ? 'ប្តូរទៅស្បែកពន្លឺ' : 'Switch to Bright Theme') 
      : (langStore.isKhmer ? 'ប្តូរទៅស្បែកងងឹត' : 'Switch to Dark Theme')"
    :aria-label="themeStore.isDark ? 'Switch to Bright Theme' : 'Switch to Dark Theme'"
  >
    <Sun v-if="themeStore.isDark" class="w-4 h-4 text-amber-400" />
    <Moon v-else class="w-4 h-4 text-slate-800 fill-slate-800" />
  </button>
</template>

