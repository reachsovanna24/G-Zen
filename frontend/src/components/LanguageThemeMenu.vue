<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useLanguageStore } from '../stores/languageStore';
import { useThemeStore } from '../stores/themeStore';
import { ChevronDown, Check, Sun, Moon } from 'lucide-vue-next';

const props = defineProps({
  compactOnMobile: {
    type: Boolean,
    default: true,
  },
});

const langStore = useLanguageStore();
const themeStore = useThemeStore();

const isOpen = ref(false);
const menuRef = ref(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    closeMenu();
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

const selectLanguage = (code) => {
  langStore.setLanguage(code);
};

const selectTheme = (theme) => {
  themeStore.setTheme(theme);
};
</script>

<template>
  <div class="relative inline-flex items-center text-xs font-semibold select-none" ref="menuRef">
    <!-- Trigger Button: Clean, Compact Single Button in Navbar -->
    <button
      type="button"
      @click.stop="toggleMenu"
      class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-200 border cursor-pointer shadow-sm hover:scale-105 active:scale-95"
      :class="themeStore.isLight 
        ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50' 
        : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800/90'"
      :title="langStore.isKhmer ? 'ជ្រើសរើសភាសា & ស្បែកផ្ទៃ' : 'Language & Theme Preferences'"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <!-- Current Language Display (Flag + Name) -->
      <div class="flex items-center gap-1.5">
        <!-- UK Flag SVG -->
        <svg v-if="langStore.isEnglish" class="w-4 h-3 rounded-[2px] shadow-sm shrink-0 overflow-hidden" viewBox="0 0 60 40" aria-hidden="true">
          <clipPath id="menu-uk-flag-clip">
            <rect width="60" height="40" rx="2" />
          </clipPath>
          <g clip-path="url(#menu-uk-flag-clip)">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" stroke-width="8" stroke-linecap="square" />
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="4.5" stroke-linecap="square" />
            <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" stroke-width="12" />
            <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" stroke-width="7" />
          </g>
        </svg>

        <!-- Cambodia Flag SVG -->
        <svg v-else class="w-4 h-3 rounded-[2px] shadow-sm shrink-0 overflow-hidden" viewBox="0 0 60 40" aria-hidden="true">
          <clipPath id="menu-kh-flag-clip">
            <rect width="60" height="40" rx="2" />
          </clipPath>
          <g clip-path="url(#menu-kh-flag-clip)">
            <rect x="0" y="0" width="60" height="10" fill="#032EA6" />
            <rect x="0" y="10" width="60" height="20" fill="#E00025" />
            <rect x="0" y="30" width="60" height="10" fill="#032EA6" />
            <g fill="#ffffff">
              <rect x="19" y="24" width="22" height="3.5" rx="0.5" />
              <rect x="21" y="21.5" width="18" height="2.5" />
              <path d="M30 13 L32 21.5 H28 Z" />
              <circle cx="30" cy="13" r="0.75" />
              <path d="M24.5 15.5 L26.5 21.5 H22.5 Z" />
              <circle cx="24.5" cy="15.5" r="0.6" />
              <path d="M35.5 15.5 L37.5 21.5 H33.5 Z" />
              <circle cx="35.5" cy="15.5" r="0.6" />
              <rect x="28.5" y="24.5" width="3" height="3" fill="#E00025" rx="0.5" />
            </g>
          </g>
        </svg>

        <span class="text-xs font-semibold" :class="props.compactOnMobile ? 'hidden sm:inline' : 'inline'">
          {{ langStore.isEnglish ? 'English' : 'ភាសាខ្មែរ' }}
        </span>
      </div>

      <!-- Subtle Dot Divider -->
      <span class="text-slate-400 font-bold">•</span>

      <!-- Current Theme Icon & Text (Matches Selected Theme) -->
      <div class="flex items-center gap-1.5">
        <Sun v-if="themeStore.isLight" class="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        <Moon v-else class="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
        <span class="text-xs font-semibold" :class="props.compactOnMobile ? 'hidden sm:inline' : 'inline'">
          {{ themeStore.isLight ? (langStore.isKhmer ? 'ស្បែកពន្លឺ' : 'Light') : (langStore.isKhmer ? 'ស្បែកងងឹត' : 'Dark') }}
        </span>
      </div>

      <!-- Dropdown Chevron Icon -->
      <ChevronDown 
        class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-0.5" 
        :class="isOpen ? 'rotate-180 text-emerald-400' : ''" 
      />
    </button>

    <!-- Up and Down Dropdown Menu Card -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-24px)] rounded-2xl glass-panel p-2 shadow-2xl z-50 border space-y-2 animate-in fade-in slide-in-from-top-2"
      :class="themeStore.isLight ? 'bg-white border-slate-200' : 'border-slate-800'"
      role="menu"
    >
      <!-- Section 1: Language Choices -->
      <div>
        <div class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {{ langStore.isKhmer ? 'ជ្រើសរើសភាសា' : 'Choose Language' }}
        </div>
        
        <div class="space-y-1 mt-1">
          <!-- English Option -->
          <button
            type="button"
            @click="selectLanguage('en')"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            :class="langStore.isEnglish 
              ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' 
              : (themeStore.isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white')"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-3 rounded-[2px] shadow-sm shrink-0" viewBox="0 0 60 40">
                <rect width="60" height="40" fill="#012169" />
                <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" stroke-width="8" stroke-linecap="square" />
                <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="4.5" stroke-linecap="square" />
                <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" stroke-width="12" />
                <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" stroke-width="7" />
              </svg>
              <span>English</span>
            </div>
            <Check v-if="langStore.isEnglish" class="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          </button>

          <!-- Khmer Option -->
          <button
            type="button"
            @click="selectLanguage('km')"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            :class="langStore.isKhmer 
              ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' 
              : (themeStore.isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white')"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-3 rounded-[2px] shadow-sm shrink-0" viewBox="0 0 60 40">
                <rect x="0" y="0" width="60" height="10" fill="#032EA6" />
                <rect x="0" y="10" width="60" height="20" fill="#E00025" />
                <rect x="0" y="30" width="60" height="10" fill="#032EA6" />
                <g fill="#ffffff">
                  <rect x="19" y="24" width="22" height="3.5" rx="0.5" />
                  <rect x="21" y="21.5" width="18" height="2.5" />
                  <path d="M30 13 L32 21.5 H28 Z" />
                  <circle cx="30" cy="13" r="0.75" />
                  <path d="M24.5 15.5 L26.5 21.5 H22.5 Z" />
                  <circle cx="24.5" cy="15.5" r="0.6" />
                  <path d="M35.5 15.5 L37.5 21.5 H33.5 Z" />
                  <circle cx="35.5" cy="15.5" r="0.6" />
                  <rect x="28.5" y="24.5" width="3" height="3" fill="#E00025" rx="0.5" />
                </g>
              </svg>
              <span>ភាសាខ្មែរ</span>
            </div>
            <Check v-if="langStore.isKhmer" class="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          </button>
        </div>
      </div>

      <!-- Section Divider -->
      <div class="border-t" :class="themeStore.isLight ? 'border-slate-200' : 'border-slate-800'"></div>

      <!-- Section 2: Theme Choices -->
      <div>
        <div class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {{ langStore.isKhmer ? 'ជ្រើសរើសស្បែកផ្ទៃ' : 'Choose Theme' }}
        </div>

        <div class="space-y-1 mt-1">
          <!-- Dark Theme Option -->
          <button
            type="button"
            @click="selectTheme('dark')"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            :class="themeStore.isDark 
              ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' 
              : (themeStore.isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white')"
          >
            <div class="flex items-center gap-2.5">
              <Moon class="w-4 h-4" :class="themeStore.isDark ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-400'" />
              <span>{{ langStore.isKhmer ? 'ស្បែកងងឹត' : 'Dark Theme' }}</span>
            </div>
            <Check v-if="themeStore.isDark" class="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          </button>

          <!-- Bright Theme Option -->
          <button
            type="button"
            @click="selectTheme('light')"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            :class="themeStore.isLight 
              ? 'bg-amber-400/20 text-amber-600 font-bold border border-amber-400/30' 
              : (themeStore.isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white')"
          >
            <div class="flex items-center gap-2.5">
              <Sun class="w-4 h-4" :class="themeStore.isLight ? 'text-amber-500 fill-amber-400' : 'text-slate-400'" />
              <span>{{ langStore.isKhmer ? 'ស្បែកពន្លឺ' : 'Bright Theme' }}</span>
            </div>
            <Check v-if="themeStore.isLight" class="w-4 h-4 text-amber-500 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

