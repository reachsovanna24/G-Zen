<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useLanguageStore } from '../stores/languageStore';
import api from '../services/api';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Check, 
  Star, 
  Plus, 
  Minus,
  Sparkles,
  RefreshCw,
  Cpu,
  Smartphone
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const langStore = useLanguageStore();

const product = ref(null);
const loading = ref(true);
const quantity = ref(1);
const activeImage = ref('');

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
};

onMounted(async () => {
  try {
    const id = route.params.id;
    const res = await api.get(`/products/${id}`);
    if (res.success) {
      product.value = res.product;
      activeImage.value = res.product.image;
    }
  } catch (err) {
    console.error('Failed to load product detail', err);
  } finally {
    loading.value = false;
  }
});

const addToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value, quantity.value);
  }
};

const categoryLabel = computed(() => {
  const cat = product.value?.category;
  if (cat === 'Smartphones') return langStore.t('common.smartphones');
  if (cat === 'Tablets') return langStore.t('common.tablets');
  if (cat === 'Laptops') return langStore.t('common.laptops');
  if (cat === 'Accessories') return langStore.t('common.accessories');
  return cat || '';
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
    <!-- Back Button -->
    <button 
      @click="router.back()"
      class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>{{ langStore.t('productDetail.back') }}</span>
    </button>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div class="h-96 rounded-3xl bg-slate-900 animate-pulse"></div>
      <div class="space-y-4">
        <div class="h-8 bg-slate-900 rounded-xl animate-pulse w-3/4"></div>
        <div class="h-6 bg-slate-900 rounded-xl animate-pulse w-1/3"></div>
        <div class="h-32 bg-slate-900 rounded-xl animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
      <!-- Left: Image Gallery -->
      <div class="lg:col-span-6 space-y-4">
        <div class="rounded-2xl sm:rounded-3xl glass-panel p-4 sm:p-8 flex items-center justify-center bg-slate-900/40 border border-slate-800 min-h-[320px] sm:min-h-[420px] relative overflow-hidden group">
          <img 
            :src="activeImage || product.image" 
            :alt="product.name" 
            @error="handleImageError"
            class="max-h-64 sm:max-h-96 w-auto object-contain transition-all duration-300 transform group-hover:scale-105"
          />
        </div>

        <!-- Thumbnails if multiple -->
        <div v-if="product.images && product.images.length > 1" class="flex gap-3 overflow-x-auto pb-2">
          <button 
            v-for="(img, idx) in product.images" 
            :key="idx"
            @click="activeImage = img"
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-slate-900 shrink-0 cursor-pointer"
            :class="activeImage === img ? 'border-emerald-500 scale-105 ring-2 ring-emerald-500/20' : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'"
          >
            <img :src="img" @error="handleImageError" class="w-full h-full object-cover rounded-lg" />
          </button>
        </div>
      </div>

      <!-- Right: Product Specs & Purchase Box -->
      <div class="lg:col-span-6 space-y-5 sm:space-y-6">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
              {{ categoryLabel }}
            </span>
            <span class="text-xs font-semibold text-slate-400">• {{ product.brand }}</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white leading-tight">
            {{ product.name }}
          </h1>

          <div class="flex items-center gap-4">
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-black text-emerald-400">
                ${{ product.price.toLocaleString() }}
              </span>
              <span 
                v-if="product.originalPrice" 
                class="text-sm text-slate-500 line-through"
              >
                ${{ product.originalPrice.toLocaleString() }}
              </span>
            </div>

            <div class="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
              <Star class="w-3.5 h-3.5 fill-amber-400" />
              <span>{{ product.rating || 4.9 }} {{ langStore.isKhmer ? 'ពិន្ទុ' : 'Rating' }}</span>
            </div>
          </div>

          <p class="text-sm text-slate-300 leading-relaxed pt-2">
            {{ product.description }}
          </p>
        </div>

        <!-- Specifications Breakdown -->
        <div v-if="product.specs" class="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu class="w-4 h-4 text-emerald-400" />
            <span>{{ langStore.t('productDetail.specifications') }}</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            <div 
              v-for="(val, key) in product.specs" 
              :key="key"
              class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
            >
              <div class="text-slate-400 capitalize font-medium">{{ key }}</div>
              <div class="text-slate-100 font-semibold mt-0.5">{{ val }}</div>
            </div>
          </div>
        </div>

        <!-- Guarantees -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <ShieldCheck class="w-5 h-5 text-emerald-400 shrink-0" />
            <span class="text-slate-300 text-[11px] sm:text-xs">{{ product.warranty || langStore.t('common.warrantyOneYear') }}</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <Truck class="w-5 h-5 text-emerald-400 shrink-0" />
            <span class="text-slate-300 text-[11px] sm:text-xs">{{ langStore.t('quickView.expressDelivery') }}</span>
          </div>
        </div>

        <!-- Quantity & Add to Cart -->
        <div class="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div class="flex items-center justify-between sm:justify-center border border-slate-700 rounded-xl bg-slate-950 px-3 py-1.5 sm:px-2 sm:py-1">
            <button 
              @click="quantity = Math.max(1, quantity - 1)"
              class="p-2 text-slate-400 hover:text-white"
            >
              <Minus class="w-4 h-4" />
            </button>
            <span class="w-12 text-center text-base font-bold text-white">{{ quantity }}</span>
            <button 
              @click="quantity = Math.min(product.stock, quantity + 1)"
              class="p-2 text-slate-400 hover:text-white"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <button 
            @click="addToCart"
            :disabled="product.stock <= 0"
            class="w-full sm:flex-1 py-3.5 sm:py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-105 text-center"
          >
            <ShoppingBag class="w-5 h-5" />
            <span>{{ langStore.isKhmer ? 'ដាក់ ' + quantity + ' ក្នុងកន្ត្រក • $' + (product.price * quantity).toLocaleString() : 'Add ' + quantity + ' to Cart • $' + (product.price * quantity).toLocaleString() }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
