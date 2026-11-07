<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useLanguageStore } from '../stores/languageStore';
import api from '../services/api';
import { Package, Truck, Clock, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, QrCode } from 'lucide-vue-next';
import KHQRModal from '../components/KHQRModal.vue';

const authStore = useAuthStore();
const langStore = useLanguageStore();
const orders = ref([]);
const loading = ref(false);
const error = ref('');
const activePayOrder = ref(null);
const isKHQROpen = ref(false);

const openKhqrPayment = (order) => {
  activePayOrder.value = order;
  isKHQROpen.value = true;
};

const onPaymentSuccess = (res) => {
  if (activePayOrder.value) {
    activePayOrder.value.paymentStatus = 'Paid';
    if (res.transactionRef) activePayOrder.value.transactionRef = res.transactionRef;
  }
  isKHQROpen.value = false;
  fetchOrders();
};

const fetchOrders = async () => {
  if (!authStore.isAuthenticated) return;
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/orders/my-orders');
    if (res.success) {
      orders.value = res.orders;
    }
  } catch (err) {
    error.value = err.message || 'Failed to load your orders.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ langStore.t('orders.title') }}</h1>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">{{ langStore.t('orders.subtitle') }}</p>
    </div>

    <!-- Login Required Prompt if not logged in -->
    <div v-if="!authStore.isAuthenticated" class="glass-panel p-6 sm:p-8 text-center rounded-2xl sm:rounded-3xl border border-slate-800 max-w-md mx-auto space-y-4">
      <Package class="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 mx-auto" />
      <h2 class="text-base sm:text-lg font-bold text-white">{{ langStore.t('orders.signInPrompt') }}</h2>
      <p class="text-xs text-slate-400 leading-relaxed">
        {{ langStore.t('orders.signInSubtitle') }}
      </p>
      <div class="space-y-2 pt-2">
        <router-link 
          to="/login?redirect=/my-orders"
          class="block w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow transition-all"
        >
          {{ langStore.t('nav.signIn') }}
        </router-link>
        <router-link 
          to="/register"
          class="block w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800"
        >
          {{ langStore.t('auth.registerButton') }}
        </router-link>
      </div>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-4">
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-40 rounded-2xl bg-slate-900 animate-pulse"></div>
      </div>

      <div v-else-if="orders.length === 0" class="glass-panel p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-slate-800">
        <ShoppingBag class="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 class="text-base font-bold text-white">{{ langStore.t('orders.noOrders') }}</h3>
        <p class="text-xs text-slate-400 mt-1 mb-4">{{ langStore.t('orders.noOrdersDesc') }}</p>
        <router-link to="/shop" class="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-glow">
          {{ langStore.t('favorites.browseShop') }}
        </router-link>
      </div>

      <div 
        v-for="order in orders" 
        :key="order.id"
        class="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3.5 sm:space-y-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-slate-800 text-xs">
          <div class="flex items-center gap-2.5 sm:gap-3">
            <span class="font-mono font-bold text-emerald-400 text-sm">{{ order.orderNumber }}</span>
            <span class="text-slate-400 text-[11px] sm:text-xs">• {{ new Date(order.createdAt).toLocaleDateString() }}</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider"
              :class="{
                'bg-amber-950 text-amber-400 border border-amber-800': order.status === 'Pending',
                'bg-purple-950 text-purple-400 border border-purple-800': order.status === 'QC Testing',
                'bg-blue-950 text-blue-400 border border-blue-800': order.status === 'Out for Delivery',
                'bg-emerald-950 text-emerald-400 border border-emerald-800': order.status === 'Delivered',
              }">
              {{ langStore.isKhmer ? (order.status === 'Pending' ? langStore.t('orders.statusPending') : order.status === 'QC Testing' ? langStore.t('orders.statusQc') : order.status === 'Out for Delivery' ? langStore.t('orders.statusOut') : langStore.t('orders.statusDelivered')) : order.status }}
            </span>
          </div>
        </div>

        <!-- Ordered Items -->
        <div class="space-y-2">
          <div 
            v-for="(item, idx) in order.items" 
            :key="idx"
            class="flex items-center gap-3 text-xs"
          >
            <img :src="item.image" :alt="item.name" class="w-10 h-10 object-cover rounded-lg bg-slate-900 shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-white truncate">{{ item.name }}</div>
              <div class="text-slate-400 text-[11px] sm:text-xs">{{ langStore.t('common.quantity') }}: {{ item.quantity }} × ${{ item.price.toLocaleString() }}</div>
            </div>
            <div class="font-bold text-white text-xs sm:text-sm">${{ (item.price * item.quantity).toLocaleString() }}</div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2.5 sm:gap-3">
          <div>
            <span>{{ langStore.t('orders.shippingTo') }} </span>
            <strong class="text-white">{{ order.shippingAddress.district }}</strong> 
            <span class="text-slate-400"> ({{ order.shippingAddress.addressNote }})</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span>{{ langStore.t('orders.payment') }}: <strong class="text-white">{{ order.paymentMethod }}</strong></span>
            
            <!-- Bakong Status Badges / Actions -->
            <span v-if="order.paymentMethod === 'KHQR' && order.paymentStatus === 'Paid'" class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              {{ langStore.t('orders.nbcLedgerVerified') }}
            </span>
            <button 
              v-else-if="order.paymentMethod === 'KHQR' && order.paymentStatus === 'Pending'"
              @click="openKhqrPayment(order)"
              class="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <QrCode class="w-3 h-3" />
              <span>{{ langStore.t('orders.payNow') }}</span>
            </button>
            <span v-else class="text-slate-400">({{ order.paymentStatus }})</span>

            <span class="hidden sm:inline">•</span>
            <span class="text-sm font-extrabold text-emerald-400 w-full sm:w-auto mt-1 sm:mt-0">{{ langStore.t('common.total') }}: ${{ order.totalAmount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- KHQR Modal Component -->
    <KHQRModal 
      v-if="activePayOrder"
      :is-open="isKHQROpen"
      :order="activePayOrder"
      :amount="activePayOrder.totalAmount"
      :order-number="activePayOrder.orderNumber"
      @close="isKHQROpen = false"
      @payment-success="onPaymentSuccess"
    />
  </div>
</template>
