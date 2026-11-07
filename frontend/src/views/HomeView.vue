<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useLanguageStore } from '../stores/languageStore';
import ProductCard from '../components/ProductCard.vue';
import QuickViewModal from '../components/QuickViewModal.vue';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  CreditCard, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Flame,
  Smartphone,
  Tablet,
  Laptop,
  Headphones
} from 'lucide-vue-next';

const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const langStore = useLanguageStore();

onMounted(async () => {
  if (productStore.products.length === 0) {
    await productStore.fetchProducts();
  }
});

const categories = computed(() => [
  { name: 'Smartphones', displayName: langStore.t('common.smartphones'), icon: Smartphone, desc: langStore.t('categories.smartphonesDesc') },
  { name: 'Tablets', displayName: langStore.t('common.tablets'), icon: Tablet, desc: langStore.t('categories.tabletsDesc') },
  { name: 'Laptops', displayName: langStore.t('common.laptops'), icon: Laptop, desc: langStore.t('categories.laptopsDesc') },
  { name: 'Accessories', displayName: langStore.t('common.accessories'), icon: Headphones, desc: langStore.t('categories.accessoriesDesc') },
]);

const goToCategory = (categoryName) => {
  productStore.selectedCategory = categoryName;
  router.push('/shop');
};
</script>

<template>
  <div class="space-y-12 sm:space-y-20 pb-16 sm:pb-20">
    <!-- Hero Banner: Flagship Showcase -->
    <section class="relative overflow-hidden pt-6 sm:pt-10 pb-12 sm:pb-16 lg:py-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
      <!-- Glow background circles -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <!-- Left Text Content -->
          <div class="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles class="w-3.5 h-3.5" />
              <span>{{ langStore.t('hero.badge') }}</span>
            </div>

            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              {{ langStore.t('hero.titlePrefix') }} <br />
              <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {{ langStore.t('hero.titleHighlight') }}
              </span>
            </h1>

            <p class="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {{ langStore.t('hero.description') }}
            </p>

            <!-- Action CTAs -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <router-link 
                to="/shop" 
                class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-center"
              >
                <span>{{ langStore.t('hero.exploreCatalog') }}</span>
                <ArrowRight class="w-4 h-4" />
              </router-link>

              <router-link 
                to="/services" 
                class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 hover:border-slate-600 transition-all text-center"
              >
                <Wrench class="w-4 h-4 text-emerald-400" />
                <span>{{ langStore.t('hero.bookRepair') }}</span>
              </router-link>
            </div>

            <!-- Highlights checklist -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-300 text-left">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{{ langStore.t('hero.oneHourDelivery') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{{ langStore.t('hero.khqrPayment') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{{ langStore.t('hero.officialWarranty') }}</span>
              </div>
            </div>
          </div>

          <!-- Right Showcase Card -->
          <div class="lg:col-span-5 relative">
            <div class="relative mx-auto max-w-sm rounded-3xl p-1 bg-gradient-to-b from-emerald-500/40 via-slate-800 to-slate-900 shadow-2xl">
              <div class="rounded-[22px] bg-slate-950 p-5 sm:p-6 overflow-hidden relative">
                <div class="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {{ langStore.t('common.hotArrival') }}
                </div>
                
                <img 
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80" 
                  alt="iPhone 16 Pro Max"
                  class="w-full h-56 sm:h-64 object-contain my-2 transform hover:scale-105 transition-transform duration-500"
                />

                <div class="mt-4">
                  <div class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{{ langStore.t('common.flagship') }}</div>
                  <h3 class="text-xl font-bold text-white mt-1">Apple iPhone 16 Pro Max</h3>
                  <p class="text-xs text-slate-400 mt-1">{{ langStore.t('hero.showcaseSpecs') }}</p>
                  
                  <div class="mt-4 flex items-center justify-between">
                    <div>
                      <span class="text-2xl font-black text-white">$1,299</span>
                      <span class="text-xs text-slate-500 line-through ml-2">$1,399</span>
                    </div>
                    <button 
                      @click="router.push('/shop')"
                      class="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-glow hover:bg-emerald-400 transition-colors"
                    >
                      {{ langStore.t('hero.viewSeries') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Shortcuts -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{{ langStore.t('categories.title') }}</h2>
          <p class="text-xs text-slate-400 mt-1">{{ langStore.t('categories.subtitle') }}</p>
        </div>
        <router-link to="/shop" class="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <span>{{ langStore.t('common.all') }}</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div 
          v-for="cat in categories" 
          :key="cat.name"
          @click="goToCategory(cat.name)"
          class="glass-card glass-card-hover p-4 sm:p-6 rounded-2xl cursor-pointer group flex flex-col justify-between"
        >
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors duration-300 mb-3 sm:mb-4">
            <component :is="cat.icon" class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 class="font-bold text-white text-sm sm:text-base group-hover:text-emerald-400 transition-colors">
              {{ cat.displayName || cat.name }}
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2">{{ cat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Flagships / Hot Deals -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6 sm:mb-8">
        <div class="flex items-center gap-2.5 sm:gap-3">
          <div class="p-2 rounded-xl bg-red-500/20 text-red-400">
            <Flame class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{{ langStore.t('deals.title') }}</h2>
            <p class="text-xs text-slate-400 mt-0.5">{{ langStore.t('deals.subtitle') }}</p>
          </div>
        </div>

        <router-link to="/shop" class="hidden sm:flex text-xs font-bold text-emerald-400 hover:text-emerald-300 items-center gap-1">
          <span>{{ langStore.t('hero.exploreCatalog') }}</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <!-- Loading skeleton -->
      <div v-if="productStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="i in 4" :key="i" class="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard 
          v-for="product in productStore.featuredProducts.slice(0, 4)" 
          :key="product.id" 
          :product="product" 
        />
      </div>
    </section>

    <!-- Phnom Penh Store Highlights & Map Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl sm:rounded-3xl glass-panel p-5 sm:p-12 border border-slate-800 relative overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-7 space-y-5 sm:space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              <MapPin class="w-4 h-4" />
              <span>{{ langStore.t('storeSpotlight.spotlightBadge') }}</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {{ langStore.t('storeSpotlight.title') }}
            </h2>

            <p class="text-sm text-slate-300 leading-relaxed">
              {{ langStore.t('storeSpotlight.description') }}
            </p>

            <div class="space-y-2.5 sm:space-y-3 text-sm text-slate-300">
              <div class="flex items-center gap-3">
                <MapPin class="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{{ langStore.t('storeSpotlight.address') }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Clock class="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{{ langStore.t('storeSpotlight.hours') }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Phone class="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{{ langStore.t('storeSpotlight.phone') }}</span>
              </div>
            </div>

            <div class="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a 
                href="https://maps.google.com/?q=BKK1+Phnom+Penh" 
                target="_blank" 
                class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
              >
                <MapPin class="w-4 h-4" />
                <span>{{ langStore.t('storeSpotlight.getDirections') }}</span>
              </a>
              <router-link 
                to="/services" 
                class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center text-center"
              >
                {{ langStore.t('storeSpotlight.repairConsultation') }}
              </router-link>
            </div>
          </div>

          <!-- Visual Store Illustration -->
          <div class="lg:col-span-5">
            <div class="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80" 
                alt="G-Zen Store Interior"
                class="w-full h-64 sm:h-80 object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-5 sm:p-6">
                <div>
                  <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">{{ langStore.t('storeSpotlight.hubLabel') }}</div>
                  <div class="text-base font-bold text-white mt-0.5">{{ langStore.t('storeSpotlight.hubSubtitle') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick View Modal Component -->
    <QuickViewModal />
  </div>
</template>
