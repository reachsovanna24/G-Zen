<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { useProductStore } from '../stores/productStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useLanguageStore } from '../stores/languageStore';
import { ShoppingBag, Eye, Star, ShieldCheck, Heart, Check, Zap } from 'lucide-vue-next';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();
const productStore = useProductStore();
const wishlistStore = useWishlistStore();
const langStore = useLanguageStore();

const discountPercent = computed(() => {
  if (props.product.originalPrice && props.product.originalPrice > props.product.price) {
    return Math.round(((props.product.originalPrice - props.product.price) / props.product.originalPrice) * 100);
  }
  return 0;
});

const isFavorited = computed(() => wishlistStore.isInWishlist(props.product.id));

const categoryLabel = computed(() => {
  if (props.product.category === 'Smartphones') return langStore.t('common.smartphones');
  if (props.product.category === 'Tablets') return langStore.t('common.tablets');
  if (props.product.category === 'Laptops') return langStore.t('common.laptops');
  if (props.product.category === 'Accessories') return langStore.t('common.accessories');
  return props.product.category;
});

// Add to cart animation feedback
const justAdded = ref(false);
const handleAddToCart = () => {
  if (props.product.stock <= 0) return;
  cartStore.addToCart(props.product);
  justAdded.value = true;
  setTimeout(() => { justAdded.value = false; }, 1600);
};

const toggleFav = () => {
  wishlistStore.toggleWishlist(props.product);
};
</script>

<template>
  <div class="product-card glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group relative">
    <!-- Top Badges Row -->
    <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
      <span 
        v-if="product.isFeatured"
        class="bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-glow"
      >
        {{ langStore.t('common.flagship') }}
      </span>
      <span 
        v-if="discountPercent > 0"
        class="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md"
      >
        -{{ discountPercent }}%
      </span>
    </div>

    <!-- Favorite Heart Button (Top-Right) -->
    <button 
      @click.stop="toggleFav"
      class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
      :class="isFavorited 
        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' 
        : 'bg-slate-900/70 backdrop-blur-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/90 border border-slate-700/60'"
      :title="isFavorited ? (langStore.isKhmer ? 'លុបចេញពីទំនិញពេញចិត្ត' : 'Remove from Favorites') : (langStore.isKhmer ? 'បន្ថែមទៅទំនិញពេញចិត្ត' : 'Add to Favorites')"
    >
      <Heart class="w-4 h-4" :class="isFavorited ? 'fill-white' : ''" />
    </button>

    <!-- Image Container with Quick View & Cart Actions on Hover -->
    <div class="relative pt-[75%] bg-slate-950 overflow-hidden cursor-pointer" @click="productStore.openQuickView(product)">
      <img 
        :src="product.image" 
        :alt="product.name"
        class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Hover Overlay with Actions -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 gap-2">
        <!-- Quick View Button -->
        <button 
          @click.stop="productStore.openQuickView(product)"
          class="w-full py-2 rounded-xl bg-slate-900/90 backdrop-blur-sm text-slate-100 text-xs font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-slate-700/60 cursor-pointer"
        >
          <Eye class="w-3.5 h-3.5" />
          <span>{{ langStore.t('common.quickView') }}</span>
        </button>

        <!-- Add to Cart Button (Overlay) -->
        <button 
          @click.stop="handleAddToCart"
          :disabled="product.stock <= 0"
          class="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
          :class="justAdded 
            ? 'bg-emerald-400 text-slate-950 shadow-glow' 
            : product.stock > 0 
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'"
        >
          <Check v-if="justAdded" class="w-4 h-4" />
          <ShoppingBag v-else class="w-4 h-4" />
          <span>{{ justAdded ? langStore.t('common.addedToCart') : (product.stock > 0 ? langStore.t('common.addToCart') : langStore.t('common.outOfStock')) }}</span>
        </button>
      </div>

      <!-- Stock Badge (bottom-left of image) -->
      <div class="absolute bottom-2 left-2 z-10">
        <span 
          v-if="product.stock > 5"
          class="bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-900/60 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        >
          {{ langStore.t('common.inStock') }}
        </span>
        <span 
          v-else-if="product.stock > 0"
          class="bg-amber-950/80 backdrop-blur-md text-amber-400 border border-amber-800/60 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
        >
          <Zap class="w-3 h-3" /> {{ langStore.isKhmer ? 'នៅសល់ ' + product.stock + ' គ្រឿង' : 'Only ' + product.stock + ' Left' }}
        </span>
        <span 
          v-else
          class="bg-red-950/80 backdrop-blur-md text-red-400 border border-red-800/60 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        >
          {{ langStore.t('common.outOfStock') }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span class="font-medium text-emerald-400">{{ categoryLabel }}</span>
          <div class="flex items-center gap-1 text-amber-400 font-semibold">
            <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{{ product.rating || 4.8 }}</span>
          </div>
        </div>

        <router-link :to="`/product/${product.id}`">
          <h3 class="font-bold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {{ product.name }}
          </h3>
        </router-link>

        <p class="text-xs text-slate-400 line-clamp-2 mt-1.5">
          {{ product.description }}
        </p>
      </div>

      <!-- Pricing & Bottom Actions -->
      <div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800/80">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-baseline gap-1.5 sm:gap-2">
              <span class="text-base sm:text-lg font-extrabold text-white">
                ${{ product.price.toLocaleString() }}
              </span>
              <span 
                v-if="product.originalPrice && product.originalPrice > product.price"
                class="text-[11px] sm:text-xs text-slate-500 line-through"
              >
                ${{ product.originalPrice.toLocaleString() }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5 sm:mt-1">
              <ShieldCheck class="w-3 h-3 text-emerald-500" />
              <span class="text-[10px] text-slate-500 font-medium">{{ langStore.t('common.warranty') }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5">
            <!-- Favorite -->
            <button 
              @click.stop="toggleFav"
              class="p-2 rounded-xl transition-all duration-300"
              :class="isFavorited 
                ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700'"
              :title="isFavorited ? (langStore.isKhmer ? 'លុបចេញពីទំនិញពេញចិត្ត' : 'Remove from Favorites') : (langStore.isKhmer ? 'បន្ថែមទៅទំនិញពេញចិត្ត' : 'Add to Favorites')"
            >
              <Heart class="w-4 h-4" :class="isFavorited ? 'fill-red-400' : ''" />
            </button>

            <!-- Add to Cart -->
            <button 
              @click.stop="handleAddToCart"
              :disabled="product.stock <= 0"
              class="p-2.5 rounded-xl font-bold shadow-glow transition-all duration-300 cursor-pointer"
              :class="justAdded 
                ? 'bg-emerald-400 text-slate-950 scale-110' 
                : product.stock > 0 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-105 active:scale-95' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'"
              :title="justAdded ? (langStore.isKhmer ? 'បានបន្ថែម!' : 'Added!') : product.stock > 0 ? langStore.t('common.addToCart') : langStore.t('common.outOfStock')"
            >
              <Check v-if="justAdded" class="w-5 h-5" />
              <ShoppingBag v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.08);
}
</style>
