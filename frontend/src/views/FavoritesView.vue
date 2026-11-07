<script setup>
import { useWishlistStore } from '../stores/wishlistStore';
import { useLanguageStore } from '../stores/languageStore';
import ProductCard from '../components/ProductCard.vue';
import { HeartCrack } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const wishlistStore = useWishlistStore();
const langStore = useLanguageStore();
const router = useRouter();
</script>

<template>
  <main class="min-h-screen py-6 sm:py-10">
    <div class="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
          <HeartCrack v-if="wishlistStore.count === 0" class="w-5 h-5 sm:w-6 sm:h-6" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart w-5 h-5 sm:w-6 sm:h-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{{ langStore.t('favorites.title') }}</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
            {{ wishlistStore.count }} {{ langStore.isKhmer ? 'មុខទំនិញដែលបានរក្សាទុក' : (wishlistStore.count === 1 ? 'item saved' : 'items saved') }}
          </p>
        </div>
      </div>

      <div v-if="wishlistStore.count === 0" class="glass-panel p-6 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-slate-800/60 mt-6 sm:mt-8">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/60 flex items-center justify-center mx-auto mb-4 border border-slate-800">
          <HeartCrack class="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-200 mb-2">{{ langStore.t('favorites.emptyTitle') }}</h2>
        <p class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 sm:mb-8">
          {{ langStore.t('favorites.emptySubtitle') }}
        </p>
        <button 
          @click="router.push('/shop')"
          class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-glow text-sm"
        >
          {{ langStore.t('favorites.browseShop') }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard 
          v-for="product in wishlistStore.items" 
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </main>
</template>
