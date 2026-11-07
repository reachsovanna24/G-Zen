<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useLanguageStore } from '../stores/languageStore';
import { ChevronDown, Check } from 'lucide-vue-next';

const props = defineProps({
  variant: {
    type: String,
    default: 'segmented', // 'segmented', 'dropdown', or 'compact'
  }
});

const langStore = useLanguageStore();
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

const languages = [
  {
    code: 'en',
    name: 'English',
    shortName: 'EN',
    nativeName: 'English',
    flagTitle: 'United Kingdom / English Flag',
  },
  {
    code: 'km',
    name: 'Khmer',
    shortName: 'KH',
    nativeName: 'ភាសាខ្មែរ',
    flagTitle: 'Cambodia / Khmer Flag',
  }
];

const selectLang = (code) => {
  langStore.setLanguage(code);
  isDropdownOpen.value = false;
};
</script>

<template>
  <div class="relative inline-flex items-center text-xs font-semibold select-none" ref="dropdownRef">
    <!-- VARIANT A: SEGMENTED SWITCH BUTTON (Default near Register button) -->
    <div 
      v-if="variant === 'segmented'"
      class="inline-flex items-center p-1 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-inner gap-0.5"
      role="group"
      aria-label="Language Switcher"
    >
      <!-- English Option with Flag -->
      <button
        type="button"
        @click="selectLang('en')"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
        :class="langStore.isEnglish 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
        title="Switch to English"
      >
        <!-- UK Flag SVG -->
        <svg class="w-4 h-3 rounded-[2px] shadow-sm shrink-0 overflow-hidden" viewBox="0 0 60 40" aria-hidden="true">
          <clipPath id="uk-flag-clip">
            <rect width="60" height="40" rx="2" />
          </clipPath>
          <g clip-path="url(#uk-flag-clip)">
            <!-- Blue base -->
            <rect width="60" height="40" fill="#012169" />
            <!-- White Diagonals -->
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" stroke-width="8" stroke-linecap="square" />
            <!-- Red Diagonals -->
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="4.5" stroke-linecap="square" />
            <!-- White Center Cross -->
            <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" stroke-width="12" />
            <!-- Red Center Cross -->
            <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" stroke-width="7" />
          </g>
        </svg>
        <span class="tracking-wide">English</span>
      </button>

      <!-- Khmer Option with Flag -->
      <button
        type="button"
        @click="selectLang('km')"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
        :class="langStore.isKhmer 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
        title="ប្តូរទៅជាភាសាខ្មែរ"
      >
        <!-- Cambodia Flag SVG with Angkor Wat -->
        <svg class="w-4 h-3 rounded-[2px] shadow-sm shrink-0 overflow-hidden" viewBox="0 0 60 40" aria-hidden="true">
          <clipPath id="kh-flag-clip">
            <rect width="60" height="40" rx="2" />
          </clipPath>
          <g clip-path="url(#kh-flag-clip)">
            <!-- Top Blue Stripe -->
            <rect x="0" y="0" width="60" height="10" fill="#032EA6" />
            <!-- Middle Red Stripe -->
            <rect x="0" y="10" width="60" height="20" fill="#E00025" />
            <!-- Bottom Blue Stripe -->
            <rect x="0" y="30" width="60" height="10" fill="#032EA6" />
            <!-- Angkor Wat White Temple Silhouette -->
            <g fill="#ffffff">
              <!-- Plinth / Base -->
              <rect x="19" y="24" width="22" height="3.5" rx="0.5" />
              <rect x="21" y="21.5" width="18" height="2.5" />
              <!-- Center Main Tower -->
              <path d="M30 13 L32 21.5 H28 Z" />
              <circle cx="30" cy="13" r="0.75" />
              <!-- Left Tower -->
              <path d="M24.5 15.5 L26.5 21.5 H22.5 Z" />
              <circle cx="24.5" cy="15.5" r="0.6" />
              <!-- Right Tower -->
              <path d="M35.5 15.5 L37.5 21.5 H33.5 Z" />
              <circle cx="35.5" cy="15.5" r="0.6" />
              <!-- Gate / Arch highlight -->
              <rect x="28.5" y="24.5" width="3" height="3" fill="#E00025" rx="0.5" />
            </g>
          </g>
        </svg>
        <span class="tracking-wide">ភាសាខ្មែរ</span>
      </button>
    </div>

    <!-- VARIANT B: DROPDOWN OR COMPACT TRIGGER -->
    <div v-else class="relative">
      <button
        type="button"
        @click.stop="isDropdownOpen = !isDropdownOpen"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors"
        aria-haspopup="true"
        :aria-expanded="isDropdownOpen"
      >
        <!-- Active Flag Display -->
        <span v-if="langStore.isEnglish" class="flex items-center gap-1.5">
          <svg class="w-4 h-3 rounded-[2px] shadow-sm shrink-0" viewBox="0 0 60 40">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" stroke-width="8" />
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="4.5" />
            <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" stroke-width="12" />
            <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" stroke-width="7" />
          </svg>
          <span class="font-medium text-xs">English</span>
        </span>

        <span v-else class="flex items-center gap-1.5">
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
            </g>
          </svg>
          <span class="font-medium text-xs">ភាសាខ្មែរ</span>
        </span>

        <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="isDropdownOpen ? 'rotate-180' : ''" />
      </button>

      <!-- Dropdown Popup -->
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 mt-2 w-44 rounded-xl glass-panel p-1.5 shadow-2xl z-50 border border-slate-800 space-y-1 animate-in fade-in slide-in-from-top-2"
      >
        <!-- English -->
        <button
          type="button"
          @click="selectLang('en')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors"
          :class="langStore.isEnglish ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800/80'"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-3 rounded-[2px]" viewBox="0 0 60 40">
              <rect width="60" height="40" fill="#012169" />
              <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" stroke-width="8" />
              <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="4.5" />
              <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" stroke-width="12" />
              <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" stroke-width="7" />
            </svg>
            <span>English</span>
          </div>
          <Check v-if="langStore.isEnglish" class="w-3.5 h-3.5 text-emerald-400" />
        </button>

        <!-- Khmer -->
        <button
          type="button"
          @click="selectLang('km')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors"
          :class="langStore.isKhmer ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800/80'"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-3 rounded-[2px]" viewBox="0 0 60 40">
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
              </g>
            </svg>
            <span>ភាសាខ្មែរ</span>
          </div>
          <Check v-if="langStore.isKhmer" class="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>
    </div>
  </div>
</template>

