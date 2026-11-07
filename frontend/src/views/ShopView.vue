<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useLanguageStore } from '../stores/languageStore';
import ProductCard from '../components/ProductCard.vue';
import QuickViewModal from '../components/QuickViewModal.vue';
import { Search, SlidersHorizontal, Package, RefreshCw } from 'lucide-vue-next';

const route = useRoute();
const productStore = useProductStore();
const langStore = useLanguageStore();

const getCategoryLabel = (cat) => {
  if (cat === 'All') return langStore.t('common.all');
  if (cat === 'Smartphones') return langStore.t('common.smartphones');
  if (cat === 'Tablets') return langStore.t('common.tablets');
  if (cat === 'Laptops') return langStore.t('common.laptops');
  if (cat === 'Accessories') return langStore.t('common.accessories');
  return cat;
};

onMounted(async () => {
  if (route.query.category) {
    productStore.selectedCategory = route.query.category;
  }
  if (productStore.products.length === 0) {
    await productStore.fetchProducts();
  }
});

watch(() => route.query.category, (newCat) => {
  if (newCat) {
    productStore.selectedCategory = newCat;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
    <!-- Header & Breadcrumb -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
        {{ langStore.isKhmer ? 'កាតាឡុកទំនិញបច្ចេកវិទ្យា' : 'Tech Catalog' }}
      </h1>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        {{ langStore.isKhmer ? 'ស្មាតហ្វូន ថេបប្លេត កុំព្យូទ័រយួរដៃ និងគ្រឿងបន្លាស់ផ្លូវការ ជាមួយការដឹកជញ្ជូនរហ័សនៅរាជធានីភ្នំពេញ' : 'Official Smartphones, Tablets, Laptops, and Accessories with Phnom Penh local delivery and warranty.' }}
      </p>
    </div>

    <!-- Filtering & Search Bar Bar -->
    <div class="glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border border-slate-800">
      <!-- Category Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none touch-pan-x">
        <button 
          v-for="cat in productStore.categories" 
          :key="cat"
          @click="productStore.selectedCategory = cat"
          class="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0"
          :class="productStore.selectedCategory === cat 
            ? 'bg-emerald-500 text-slate-950 shadow-glow' 
            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          {{ getCategoryLabel(cat) }}
        </button>
      </div>

      <!-- Search & Sort Controls -->
      <div class="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full md:w-auto">
        <!-- Search Input -->
        <div class="relative w-full md:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            v-model="productStore.searchQuery"
            type="text" 
            :placeholder="langStore.t('common.searchPlaceholder')" 
            class="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <!-- Sort Selector -->
        <select 
          v-model="productStore.sortBy"
          class="w-full sm:w-auto bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="default">{{ langStore.t('shop.sortDefault') }}</option>
          <option value="price-asc">{{ langStore.t('shop.sortPriceAsc') }}</option>
          <option value="price-desc">{{ langStore.t('shop.sortPriceDesc') }}</option>
          <option value="rating">{{ langStore.t('shop.sortRating') }}</option>
        </select>
      </div>
    </div>

    <!-- Active Filters & Results Count -->
    <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
      <div>
        {{ langStore.t('common.showing') }} <span class="font-bold text-white">{{ productStore.filteredProducts.length }}</span> {{ langStore.t('common.items') }}
        <span v-if="productStore.selectedCategory !== 'All'"> {{ langStore.t('common.inCategory') }} <strong class="text-emerald-400">{{ getCategoryLabel(productStore.selectedCategory) }}</strong></span>
        <span v-if="productStore.searchQuery"> {{ langStore.t('common.matchingQuery') }} "<strong class="text-emerald-400">{{ productStore.searchQuery }}</strong>"</span>
      </div>

      <button 
        v-if="productStore.selectedCategory !== 'All' || productStore.searchQuery || productStore.sortBy !== 'default'"
        @click="productStore.selectedCategory = 'All'; productStore.searchQuery = ''; productStore.sortBy = 'default'"
        class="text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
      >
        <RefreshCw class="w-3 h-3" />
        <span>{{ langStore.t('common.resetFilters') }}</span>
      </button>
    </div>

    <!-- Product Grid -->
    <div v-if="productStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div v-for="i in 8" :key="i" class="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
    </div>

    <div v-else-if="productStore.filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <ProductCard 
        v-for="product in productStore.filteredProducts" 
        :key="product.id" 
        :product="product" 
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 glass-panel rounded-3xl border border-slate-800 p-8 max-w-md mx-auto">
      <div class="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Package class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-white">{{ langStore.t('common.noProductsFound') }}</h3>
      <p class="text-xs text-slate-400 mt-1">{{ langStore.t('common.adjustSearch') }}</p>
      <button 
        @click="productStore.selectedCategory = 'All'; productStore.searchQuery = ''"
        class="mt-5 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-glow hover:bg-emerald-400 transition-all cursor-pointer"
      >
        {{ langStore.t('common.clearFilters') }}
      </button>
    </div>

    <!-- Quick View Modal -->
    <QuickViewModal />
  </div>
</template>
