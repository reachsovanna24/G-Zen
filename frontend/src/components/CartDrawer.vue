<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cartStore';
import { useLanguageStore } from '../stores/languageStore';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, ShieldCheck } from 'lucide-vue-next';

const router = useRouter();
const cartStore = useCartStore();
const langStore = useLanguageStore();

const proceedToCheckout = () => {
  cartStore.closeCart();
  router.push('/checkout');
};

const getCategoryLabel = (category) => {
  if (category === 'Smartphones') return langStore.t('common.smartphones');
  if (category === 'Tablets') return langStore.t('common.tablets');
  if (category === 'Laptops') return langStore.t('common.laptops');
  if (category === 'Accessories') return langStore.t('common.accessories');
  return category || '';
};
</script>

<template>
  <div v-if="cartStore.isCartOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="cartStore.closeCart"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
      <div class="w-screen max-w-full sm:max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        <!-- Drawer Header -->
        <div class="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShoppingBag class="w-5 h-5 text-emerald-400" />
            <h2 class="text-base sm:text-lg font-bold text-slate-100">{{ langStore.t('cart.title') }}</h2>
            <span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
              {{ cartStore.cartCount }} {{ langStore.isKhmer ? 'មុខ' : 'items' }}
            </span>
          </div>
          <button 
            @click="cartStore.closeCart"
            class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Drawer Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div v-if="cartStore.items.length === 0" class="text-center py-16">
            <div class="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag class="w-8 h-8" />
            </div>
            <h3 class="text-base font-bold text-slate-200">{{ langStore.t('cart.emptyTitle') }}</h3>
            <p class="text-sm text-slate-400 mt-1">{{ langStore.t('cart.emptySubtitle') }}</p>
            <button 
              @click="cartStore.closeCart(); router.push('/shop')"
              class="mt-6 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-glow transition-all"
            >
              {{ langStore.t('cart.startShopping') }}
            </button>
          </div>

          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="flex gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 group"
          >
            <img 
              :src="item.image" 
              :alt="item.name" 
              class="w-20 h-20 object-cover rounded-lg bg-slate-800 shrink-0 border border-slate-800"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-sm font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                  {{ item.name }}
                </h4>
                <button 
                  @click="cartStore.removeFromCart(item.id)"
                  class="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">{{ getCategoryLabel(item.category) }}</div>
              <div class="text-sm font-bold text-emerald-400 mt-1">
                ${{ item.price.toLocaleString() }}
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-2 mt-2">
                <div class="flex items-center border border-slate-700 rounded-lg bg-slate-900">
                  <button 
                    @click="cartStore.updateQuantity(item.id, -1)"
                    class="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Minus class="w-3.5 h-3.5" />
                  </button>
                  <span class="w-8 text-center text-xs font-bold text-slate-200">{{ item.quantity }}</span>
                  <button 
                    @click="cartStore.updateQuantity(item.id, 1)"
                    class="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer with Phnom Penh District Selector & Subtotal -->
        <div v-if="cartStore.items.length > 0" class="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/70 space-y-4">
          <!-- Phnom Penh Delivery District Selector -->
          <div>
            <label class="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <MapPin class="w-3.5 h-3.5 text-emerald-400" />
              <span>{{ langStore.t('cart.deliveryDistrict') }}</span>
            </label>
            <select 
              v-model="cartStore.selectedDistrict"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option v-for="district in cartStore.districts" :key="district" :value="district">
                {{ district }}
              </option>
            </select>
          </div>

          <!-- Pricing summary -->
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between text-slate-400">
              <span>{{ langStore.t('cart.subtotal') }}</span>
              <span class="font-medium text-slate-200">${{ cartStore.subtotal.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>{{ langStore.t('cart.deliveryFee') }}</span>
              <span class="font-medium text-emerald-400">${{ cartStore.deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
              <span>{{ langStore.t('cart.total') }}</span>
              <span class="text-emerald-400">${{ cartStore.total.toLocaleString() }}</span>
            </div>
          </div>

          <button 
            @click="proceedToCheckout"
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{{ langStore.t('cart.proceedToCheckout') }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
