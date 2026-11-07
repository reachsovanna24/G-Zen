<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useLanguageStore } from '../stores/languageStore';
import { X, ShoppingBag, ShieldCheck, CheckCircle2, Star, Truck, Plus, Minus, ExternalLink } from 'lucide-vue-next';

const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const langStore = useLanguageStore();

const quantity = ref(1);

const categoryLabel = computed(() => {
  const cat = productStore.quickViewProduct?.category;
  if (cat === 'Smartphones') return langStore.t('common.smartphones');
  if (cat === 'Tablets') return langStore.t('common.tablets');
  if (cat === 'Laptops') return langStore.t('common.laptops');
  if (cat === 'Accessories') return langStore.t('common.accessories');
  return cat || '';
});

const addToCartAndClose = () => {
  if (productStore.quickViewProduct) {
    cartStore.addToCart(productStore.quickViewProduct, quantity.value);
    productStore.closeQuickView();
  }
};

const viewFullDetails = () => {
  const id = productStore.quickViewProduct?.id;
  productStore.closeQuickView();
  if (id) router.push(`/product/${id}`);
};
</script>

<template>
  <div v-if="productStore.quickViewProduct" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      @click="productStore.closeQuickView"
    ></div>

    <!-- Modal Card -->
    <div class="relative w-full max-w-3xl glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
      <!-- Close Button -->
      <button 
        @click="productStore.closeQuickView"
        class="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <X class="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 max-h-[88vh] overflow-y-auto">
        <!-- Image Gallery Side -->
        <div class="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
          <img 
            :src="productStore.quickViewProduct.image" 
            :alt="productStore.quickViewProduct.name" 
            class="max-h-52 sm:max-h-72 object-contain rounded-2xl"
          />
          <div class="mt-3 sm:mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
            <ShieldCheck class="w-4 h-4" />
            <span>{{ productStore.quickViewProduct.warranty || langStore.t('common.warrantyOneYear') }}</span>
          </div>
        </div>

        <!-- Details Side -->
        <div class="p-4 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                {{ categoryLabel }}
              </span>
              <span class="text-xs text-slate-400">• {{ productStore.quickViewProduct.brand }}</span>
            </div>

            <h2 class="text-xl font-extrabold text-white leading-tight">
              {{ productStore.quickViewProduct.name }}
            </h2>

            <div class="flex items-baseline gap-3">
              <span class="text-2xl font-black text-emerald-400">
                ${{ productStore.quickViewProduct.price.toLocaleString() }}
              </span>
              <span 
                v-if="productStore.quickViewProduct.originalPrice" 
                class="text-sm text-slate-500 line-through"
              >
                ${{ productStore.quickViewProduct.originalPrice.toLocaleString() }}
              </span>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">
              {{ productStore.quickViewProduct.description }}
            </p>

            <!-- Key Specifications -->
            <div v-if="productStore.quickViewProduct.specs" class="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
              <div v-for="(val, key) in productStore.quickViewProduct.specs" :key="key" class="flex justify-between">
                <span class="text-slate-400 capitalize">{{ key }}:</span>
                <span class="text-slate-200 font-medium">{{ val }}</span>
              </div>
            </div>

            <!-- Delivery Promise -->
            <div class="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <Truck class="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{{ langStore.t('quickView.expressDelivery') }}</span>
            </div>
          </div>

          <!-- Quantity & Action -->
          <div class="pt-4 border-t border-slate-800 space-y-3">
            <div class="flex items-center gap-4">
              <span class="text-xs font-semibold text-slate-300">{{ langStore.t('common.quantity') }}:</span>
              <div class="flex items-center border border-slate-700 rounded-xl bg-slate-950">
                <button 
                  @click="quantity = Math.max(1, quantity - 1)"
                  class="p-2 text-slate-400 hover:text-white"
                >
                  <Minus class="w-3.5 h-3.5" />
                </button>
                <span class="w-10 text-center text-sm font-bold text-white">{{ quantity }}</span>
                <button 
                  @click="quantity = Math.min(productStore.quickViewProduct.stock, quantity + 1)"
                  class="p-2 text-slate-400 hover:text-white"
                >
                  <Plus class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="flex gap-2">
              <button 
                @click="addToCartAndClose"
                :disabled="productStore.quickViewProduct.stock <= 0"
                class="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag class="w-4 h-4" />
                <span>{{ langStore.isKhmer ? 'ដាក់ ' + quantity + ' ក្នុងកន្ត្រក' : 'Add ' + quantity + ' to Cart' }}</span>
              </button>
              <button 
                @click="viewFullDetails"
                class="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                :title="langStore.t('quickView.fullProductPage')"
              >
                <ExternalLink class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
