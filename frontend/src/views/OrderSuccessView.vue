<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLanguageStore } from '../stores/languageStore';
import api from '../services/api';
import confetti from 'canvas-confetti';
import KHQRModal from '../components/KHQRModal.vue';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Sparkles
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const langStore = useLanguageStore();

const orderNumber = route.params.orderNumber;
const order = ref(null);
const loading = ref(true);
const isPayModalOpen = ref(false);

const isPaidOrCOD = computed(() => {
  if (!order.value) return false;
  return order.value.paymentStatus === 'Paid' || order.value.paymentMethod === 'Cash on Delivery';
});

const statusSteps = ['Pending', 'QC Testing', 'Out for Delivery', 'Delivered'];

const getStepIndex = (status) => {
  return statusSteps.indexOf(status);
};

const onPaymentSuccess = (res) => {
  if (order.value) {
    order.value.paymentStatus = 'Paid';
    if (res.transactionRef) order.value.transactionRef = res.transactionRef;
    if (res.settlement) order.value.settlementData = res.settlement;
  }
  isPayModalOpen.value = false;
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 }
  });
};

onMounted(async () => {
  try {
    const res = await api.get(`/orders/track/${orderNumber}`);
    if (res.success) {
      order.value = res.order;
      if (order.value.paymentStatus === 'Paid' || order.value.paymentMethod === 'Cash on Delivery') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  } catch (err) {
    console.error('Fetch order detail failed', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-3xl mx-auto px-3.5 sm:px-6 py-8 sm:py-16">
    <div class="glass-panel p-5 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-800 text-center space-y-6 sm:space-y-8">
      <!-- Success Icon vs Awaiting Payment Icon -->
      <div v-if="isPaidOrCOD" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
        <CheckCircle2 class="w-8 h-8 sm:w-10 sm:h-10" />
      </div>
      <div v-else class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-glow">
        <Clock class="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {{ isPaidOrCOD ? langStore.t('orderSuccess.title') : langStore.t('orderSuccess.pendingTitle') }}
        </h1>
        <p class="text-xs sm:text-sm text-slate-300">
          {{ isPaidOrCOD ? langStore.t('orderSuccess.thankYou') : langStore.t('orderSuccess.pendingSubtitle') }}
        </p>
        <div 
          class="inline-block mt-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-900 border text-xs font-mono font-bold"
          :class="isPaidOrCOD ? 'border-slate-700 text-emerald-400' : 'border-amber-600/40 text-amber-400'"
        >
          {{ langStore.t('orderSuccess.orderNumber') }}: {{ orderNumber }}
        </div>
      </div>

      <!-- Action Required Banner if KHQR Payment is Unpaid / Pending -->
      <div v-if="!isPaidOrCOD && order" class="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-left space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>{{ langStore.t('orderSuccess.unpaid') }}</span>
          </div>
          <span class="text-base font-black text-white">${{ order.totalAmount?.toLocaleString() }}</span>
        </div>
        <p class="text-slate-300 text-xs leading-relaxed">
          {{ langStore.t('orderSuccess.unpaidWarning') }}
        </p>
        <button 
          @click="isPayModalOpen = true"
          class="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
        >
          <QrCode class="w-4 h-4" />
          <span>{{ langStore.t('orderSuccess.scanToConfirm') }} (${{ order.totalAmount?.toLocaleString() }})</span>
        </button>
      </div>

      <!-- Live Status Timeline Tracker -->
      <div v-if="order" class="py-5 sm:py-6 border-y border-slate-800/80">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 sm:mb-6 text-left sm:text-center">
          {{ langStore.t('orderSuccess.fulfillmentProgress') }}
        </div>

        <div class="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 max-w-xl mx-auto">
          <div 
            v-for="(step, idx) in statusSteps" 
            :key="step"
            class="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10"
          >
            <div 
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0"
              :class="getStepIndex(order.status) >= idx 
                ? 'bg-emerald-500 text-slate-950 shadow-glow' 
                : 'bg-slate-800 text-slate-500 border border-slate-700'"
            >
              <CheckCircle2 v-if="getStepIndex(order.status) > idx" class="w-4 h-4 sm:w-5 sm:h-5" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="text-left sm:text-center">
              <div 
                class="text-xs font-bold"
                :class="getStepIndex(order.status) >= idx ? 'text-white' : 'text-slate-500'"
              >
                {{ langStore.isKhmer ? (step === 'Pending' ? langStore.t('orders.statusPending') : step === 'QC Testing' ? langStore.t('orders.statusQc') : step === 'Out for Delivery' ? langStore.t('orders.statusOut') : langStore.t('orders.statusDelivered')) : step }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Details Summary -->
      <div v-if="order" class="bg-slate-950/70 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-800 text-left space-y-3.5 sm:space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-slate-400">{{ langStore.t('orderSuccess.recipient') }}</div>
            <div class="font-bold text-white mt-0.5">{{ order.shippingAddress.fullName }} ({{ order.shippingAddress.phone }})</div>
          </div>
          <div>
            <div class="text-slate-400">{{ langStore.t('orderSuccess.deliveryDistrict') }}</div>
            <div class="font-bold text-emerald-400 mt-0.5">{{ order.shippingAddress.district }}</div>
            <div class="text-slate-400 text-[11px]">{{ order.shippingAddress.addressNote }}</div>
          </div>
          <div>
            <div class="text-slate-400">{{ langStore.t('orderSuccess.paymentMethod') }}</div>
            <div class="font-bold text-white mt-0.5">{{ order.paymentMethod }} ({{ order.paymentStatus }})</div>
            <div v-if="order.transactionRef" class="text-slate-400 font-mono text-[10px]">Ref: {{ order.transactionRef }}</div>
            
            <!-- Bakong Verified Badge -->
            <div v-if="order.paymentMethod === 'KHQR' && order.paymentStatus === 'Paid'" class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] font-bold">
              <CheckCircle2 class="w-3 h-3 text-emerald-400" />
              <span>{{ langStore.t('orderSuccess.nbcVerifiedBadge') }}</span>
            </div>

            <!-- Complete Bakong Payment Button if Pending -->
            <div v-else-if="order.paymentMethod === 'KHQR' && order.paymentStatus === 'Pending'" class="mt-2">
              <button 
                @click="isPayModalOpen = true"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shadow-md transition-all cursor-pointer"
              >
                <QrCode class="w-3.5 h-3.5" />
                <span>{{ langStore.t('orders.payNow') }}</span>
              </button>
            </div>
          </div>
          <div>
            <div class="text-slate-400">{{ langStore.t('orderSuccess.totalAmount') }}</div>
            <div class="font-black text-emerald-400 text-base mt-0.5">${{ order.totalAmount.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <router-link 
          to="/my-orders"
          class="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all"
        >
          <Package class="w-4 h-4" />
          <span>{{ langStore.t('orderSuccess.viewMyOrders') }}</span>
        </router-link>

        <router-link 
          to="/shop"
          class="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
        >
          {{ langStore.t('orderSuccess.continueShopping') }}
        </router-link>
      </div>
    </div>

    <!-- KHQR Modal for Pending Order Payment -->
    <KHQRModal 
      v-if="order"
      :is-open="isPayModalOpen"
      :order="order"
      :amount="order.totalAmount"
      :order-number="order.orderNumber"
      @close="isPayModalOpen = false"
      @payment-success="onPaymentSuccess"
    />
  </div>
</template>
