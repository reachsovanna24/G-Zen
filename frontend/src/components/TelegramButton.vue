<script setup>
import { ref } from 'vue';
import { useLanguageStore } from '../stores/languageStore';
import { Send, MessageCircle, X, ShieldCheck } from 'lucide-vue-next';

const langStore = useLanguageStore();
const isPopupOpen = ref(false);

const openTelegram = () => {
  window.open('https://t.me/Lee_min_roth', '_blank');
};
</script>

<template>
  <div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
    <!-- Chat Tooltip Popover -->
    <div 
      v-if="isPopupOpen" 
      class="absolute bottom-16 right-0 w-[calc(100vw-32px)] sm:w-72 max-w-xs glass-panel rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3"
    >
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center">
            <Send class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-100">{{ langStore.t('support.title') }}</div>
            <div class="text-[10px] text-emerald-400 font-medium">{{ langStore.t('support.status') }}</div>
          </div>
        </div>
        <button @click="isPopupOpen = false" class="text-slate-400 hover:text-white p-1">
          <X class="w-4 h-4" />
        </button>
      </div>

      <p class="text-xs text-slate-300 my-3 leading-relaxed">
        {{ langStore.t('support.description') }}
      </p>

      <button 
        @click="openTelegram"
        class="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
      >
        <Send class="w-3.5 h-3.5" />
        <span>{{ langStore.t('support.openTelegram') }}</span>
      </button>
    </div>

    <!-- Floating Trigger Button -->
    <button 
      @click="isPopupOpen = !isPopupOpen"
      class="w-12 h-12 sm:w-13 sm:h-13 p-3 sm:p-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative group"
      aria-label="Telegram Customer Support"
    >
      <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
      <Send class="w-6 h-6 -translate-x-0.5 translate-y-0.5" />
    </button>
  </div>
</template>
