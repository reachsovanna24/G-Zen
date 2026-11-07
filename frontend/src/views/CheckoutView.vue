<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useLanguageStore } from '../stores/languageStore';
import api from '../services/api';
import KHQRModal from '../components/KHQRModal.vue';
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  AlertTriangle,
  QrCode,
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  DollarSign
} from 'lucide-vue-next';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const langStore = useLanguageStore();

// Guest checkout auth tabs: 'register' | 'login'
const authMode = ref('register');

// Registration / Guest Auth form
const authForm = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  district: cartStore.selectedDistrict || 'Toul Kork',
  addressNote: '',
});

// Existing user login inside checkout
const loginForm = ref({
  email: '',
  password: '',
});

// Shipping Address for logged-in user
const shippingData = ref({
  fullName: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  district: cartStore.selectedDistrict || 'Toul Kork',
  addressNote: authStore.user?.address || '',
  notes: '',
  abaTransactionRef: '',
});

// Synchronize if user changes
watch(() => authStore.user, (u) => {
  if (u) {
    shippingData.value.fullName = u.name || '';
    shippingData.value.phone = u.phone || '';
    shippingData.value.addressNote = u.address || '';
  }
}, { immediate: true });

const isSubmitting = ref(false);
const isAuthProcessing = ref(false);
const errorMessage = ref('');
const isKHQROpen = ref(false);

const paymentNotice = ref(null);

const setPayment = (method) => {
  cartStore.setPaymentMethod(method);
  paymentNotice.value = null;
};

const handleDistrictChange = () => {
  cartStore.setDistrict(shippingData.value.district);
};

const handleGuestDistrictChange = () => {
  cartStore.setDistrict(authForm.value.district);
};

// Handle inline Registration during checkout
const handleCheckoutRegister = async () => {
  errorMessage.value = '';
  if (!authForm.value.name.trim() || !authForm.value.email.trim() || !authForm.value.password.trim() || !authForm.value.phone.trim() || !authForm.value.addressNote.trim()) {
    errorMessage.value = 'Please fill out all registration and delivery fields.';
    return;
  }

  isAuthProcessing.value = true;
  try {
    await authStore.register({
      name: authForm.value.name,
      email: authForm.value.email,
      password: authForm.value.password,
      phone: authForm.value.phone,
      address: `${authForm.value.district}, ${authForm.value.addressNote}`,
    });

    shippingData.value.fullName = authForm.value.name;
    shippingData.value.phone = authForm.value.phone;
    shippingData.value.district = authForm.value.district;
    shippingData.value.addressNote = authForm.value.addressNote;
  } catch (err) {
    errorMessage.value = err.message || 'Registration failed. Please check your information.';
  } finally {
    isAuthProcessing.value = false;
  }
};

// Handle inline Login during checkout
const handleCheckoutLogin = async () => {
  errorMessage.value = '';
  if (!loginForm.value.email.trim() || !loginForm.value.password.trim()) {
    errorMessage.value = 'Please provide your email and password.';
    return;
  }

  isAuthProcessing.value = true;
  try {
    const res = await authStore.login(loginForm.value.email, loginForm.value.password);
    shippingData.value.fullName = res.user.name;
    shippingData.value.phone = res.user.phone || '';
    shippingData.value.addressNote = res.user.address || '';
  } catch (err) {
    errorMessage.value = err.message || 'Login failed. Please check credentials.';
  } finally {
    isAuthProcessing.value = false;
  }
};

const activeOrder = ref(null);
const activeKhqr = ref(null);

const handleCheckoutSubmit = async () => {
  errorMessage.value = '';

  if (!authStore.isAuthenticated) {
    errorMessage.value = 'Please create an account or sign in to complete your checkout.';
    return;
  }

  if (!shippingData.value.fullName.trim()) {
    errorMessage.value = 'Recipient full name is required.';
    return;
  }
  if (!shippingData.value.phone.trim()) {
    errorMessage.value = 'Recipient phone number is required.';
    return;
  }
  if (!shippingData.value.addressNote.trim()) {
    errorMessage.value = 'Please enter your street / house delivery details in Phnom Penh.';
    return;
  }

  if (cartStore.items.length === 0) {
    errorMessage.value = 'Your cart is empty.';
    return;
  }

  await processOrder();
};

const onKHQRPaymentSuccess = async (paymentResult) => {
  isKHQROpen.value = false;
  paymentNotice.value = null;
  cartStore.clearCart();
  const orderNum = activeOrder.value?.orderNumber || paymentResult?.order?.orderNumber;
  if (orderNum) {
    router.push(`/order-success/${orderNum}`);
  }
};

const handleModalClose = () => {
  isKHQROpen.value = false;
  // If payment was not completed, stay on Checkout, DO NOT clear cart, and DO NOT route to confirmation
  if (activeOrder.value) {
    paymentNotice.value = {
      orderNumber: activeOrder.value.orderNumber,
      amount: activeOrder.value.totalAmount,
    };
  }
};

const resumeKHQRPayment = () => {
  if (activeOrder.value) {
    isKHQROpen.value = true;
  } else {
    handleCheckoutSubmit();
  }
};

const dismissPaymentNotice = () => {
  paymentNotice.value = null;
  activeOrder.value = null;
  activeKhqr.value = null;
};

const processOrder = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  // If customer is resuming KHQR on the active order
  if (cartStore.paymentMethod === 'KHQR' && activeOrder.value && activeOrder.value.totalAmount === cartStore.total) {
    isKHQROpen.value = true;
    isSubmitting.value = false;
    return;
  }

  try {
    const payload = {
      items: cartStore.items.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      shippingAddress: {
        fullName: shippingData.value.fullName,
        phone: shippingData.value.phone,
        district: shippingData.value.district,
        addressNote: shippingData.value.addressNote,
      },
      paymentMethod: cartStore.paymentMethod,
      transactionRef: shippingData.value.abaTransactionRef || null,
      notes: shippingData.value.notes,
    };

    const res = await api.post('/orders', payload);

    if (res.success) {
      if (cartStore.paymentMethod === 'KHQR') {
        activeOrder.value = res.order;
        activeKhqr.value = res.khqr || res.order;
        paymentNotice.value = null;
        isKHQROpen.value = true;
      } else {
        paymentNotice.value = null;
        cartStore.clearCart();
        router.push(`/order-success/${res.order.orderNumber}`);
      }
    }
  } catch (err) {
    console.error('Order checkout error:', err);
    errorMessage.value = err.message || 'Failed to place order. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ langStore.t('checkout.title') }}</h1>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">{{ langStore.t('checkout.subtitle') }}</p>
    </div>

    <!-- Empty Cart Warning -->
    <div v-if="cartStore.items.length === 0" class="glass-panel p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-slate-800 max-w-md mx-auto">
      <ShoppingBag class="w-16 h-16 text-slate-500 mx-auto mb-4" />
      <h2 class="text-lg font-bold text-white">{{ langStore.t('cart.emptyTitle') }}</h2>
      <p class="text-xs text-slate-400 mt-1 mb-6">{{ langStore.t('cart.emptySubtitle') }}</p>
      <router-link to="/shop" class="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-glow">
        {{ langStore.t('cart.startShopping') }}
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
      <!-- Left Column -->
      <div class="lg:col-span-7 space-y-6 sm:space-y-8">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3.5 sm:p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Payment Incomplete Alert: Shown when KHQR window is closed before payment -->
        <div v-if="paymentNotice" class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border border-amber-500/50 text-amber-200 text-xs space-y-3.5 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div class="flex items-start gap-3">
            <div class="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
              <AlertTriangle class="w-5 h-5 animate-pulse" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-white text-sm sm:text-base flex flex-wrap items-center gap-2">
                <span>{{ langStore.t('checkout.paymentCancelledTitle') }}</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  {{ paymentNotice.orderNumber }}
                </span>
              </div>
              <p class="text-slate-300 text-xs mt-1.5 leading-relaxed">
                {{ langStore.t('checkout.paymentCancelledDesc') }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 pt-1.5 border-t border-amber-900/40">
            <button 
              type="button"
              @click="resumeKHQRPayment"
              class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            >
              <QrCode class="w-4 h-4" />
              <span>{{ langStore.t('checkout.resumeKhqr') }}</span>
            </button>
            <button 
              type="button"
              @click="dismissPaymentNotice"
              class="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
            >
              {{ langStore.t('checkout.changeMethod') }}
            </button>
          </div>
        </div>

        <!-- 1. AUTHENTICATION GATE: IF GUEST / NEW USER, REGISTER ACCOUNT BEFORE ORDERING -->
        <div v-if="!authStore.isAuthenticated" class="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-5 sm:space-y-6">
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h2 class="text-base font-bold text-white">{{ langStore.t('checkout.accountRequired') }}</h2>
              <p class="text-xs text-slate-400">{{ langStore.t('checkout.accountRequiredDesc') }}</p>
            </div>
          </div>

          <!-- Auth Mode Toggle -->
          <div class="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button 
              type="button"
              @click="authMode = 'register'"
              class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              :class="authMode === 'register' ? 'bg-emerald-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'"
            >
              {{ langStore.t('checkout.newCustomerTab') }}
            </button>
            <button 
              type="button"
              @click="authMode = 'login'"
              class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
              :class="authMode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'"
            >
              {{ langStore.t('checkout.returningCustomerTab') }}
            </button>
          </div>

          <!-- TAB: CREATE NEW ACCOUNT & FILL SHIPPING DETAILS -->
          <form v-if="authMode === 'register'" @submit.prevent="handleCheckoutRegister" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.fullName') }} *</label>
                <input 
                  v-model="authForm.name"
                  type="text" 
                  placeholder="e.g. Sokha Rith" 
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('checkout.phoneCambodia') }} *</label>
                <input 
                  v-model="authForm.phone"
                  type="text" 
                  placeholder="e.g. 098 765 432" 
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.emailLabel') }} *</label>
                <input 
                  v-model="authForm.email"
                  type="email" 
                  placeholder="e.g. sokha@example.com" 
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.passwordLabel') }} *</label>
                <input 
                  v-model="authForm.password"
                  type="password" 
                  placeholder="Minimum 6 characters" 
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('cart.deliveryDistrict') }} *</label>
                <select 
                  v-model="authForm.district"
                  @change="handleGuestDistrictChange"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option v-for="district in cartStore.districts" :key="district" :value="district">
                    {{ district }} (${{ (cartStore.deliveryFee).toFixed(2) }} {{ langStore.isKhmer ? 'ថ្លៃដឹក' : 'delivery' }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('checkout.streetHouse') }} *</label>
                <input 
                  v-model="authForm.addressNote"
                  type="text" 
                  placeholder="e.g. House #42, St. 315" 
                  required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              :disabled="isAuthProcessing"
              class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <User class="w-4 h-4" />
              <span>{{ isAuthProcessing ? langStore.t('checkout.creatingAccount') : langStore.t('checkout.registerAndContinue') }}</span>
            </button>
          </form>

          <!-- TAB: EXISTING USER LOGIN -->
          <form v-else @submit.prevent="handleCheckoutLogin" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.emailLabel') }}</label>
              <input 
                v-model="loginForm.email"
                type="email" 
                placeholder="customer@example.com" 
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.passwordLabel') }}</label>
              <input 
                v-model="loginForm.password"
                type="password" 
                placeholder="••••••••" 
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button 
              type="submit"
              :disabled="isAuthProcessing"
              class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Lock class="w-4 h-4" />
              <span>{{ isAuthProcessing ? langStore.t('checkout.authenticating') : langStore.t('checkout.signInAndContinue') }}</span>
            </button>
          </form>
        </div>

        <!-- 2. LOGGED-IN CUSTOMER DELIVERY DETAILS -->
        <div v-else class="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 class="text-base font-bold text-white">{{ langStore.t('checkout.deliveryAddress') }}</h2>
                <div class="text-xs text-emerald-400">{{ langStore.t('checkout.signedInAs') }} {{ authStore.userName }} ({{ authStore.user?.email }})</div>
              </div>
            </div>
            <button 
              @click="authStore.logout()"
              class="text-xs text-slate-400 hover:text-red-400 underline font-semibold cursor-pointer"
            >
              {{ langStore.t('checkout.switchAccount') }}
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('checkout.recipientName') }} *</label>
              <input 
                v-model="shippingData.fullName"
                type="text" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('checkout.phoneCambodia') }} *</label>
              <input 
                v-model="shippingData.phone"
                type="text" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('checkout.districtPhnomPenh') }} *</label>
            <select 
              v-model="shippingData.district"
              @change="handleDistrictChange"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option v-for="district in cartStore.districts" :key="district" :value="district">
                {{ district }} (${{ (cartStore.deliveryFee).toFixed(2) }} {{ langStore.isKhmer ? 'ថ្លៃដឹក' : 'delivery' }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('checkout.streetHouse') }} *</label>
            <input 
              v-model="shippingData.addressNote"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('checkout.deliveryInstructions') }}</label>
            <input 
              v-model="shippingData.notes"
              type="text" 
              :placeholder="langStore.t('checkout.deliveryInstructionsPlaceholder')" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <!-- 3. PAYMENT METHOD (ENABLED FOR LOGGED-IN USERS) -->
        <div class="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-5" :class="{ 'opacity-60 pointer-events-none': !authStore.isAuthenticated }">
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 class="text-base font-bold text-white">{{ langStore.t('checkout.paymentMethod') }}</h2>
              <p class="text-xs text-slate-400">{{ langStore.t('checkout.paymentMethodSelect') }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Option 1: KHQR Instant Payment -->
            <div 
              @click="setPayment('KHQR')"
              class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between"
              :class="cartStore.paymentMethod === 'KHQR' 
                ? 'bg-red-950/30 border-red-500 shadow-glow' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="badge-khqr font-black">KHQR</span>
                <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                  :class="cartStore.paymentMethod === 'KHQR' ? 'border-red-500 bg-red-500' : 'border-slate-700'">
                  <div v-if="cartStore.paymentMethod === 'KHQR'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              <div>
                <div class="text-xs font-bold text-white">{{ langStore.t('checkout.khqrInstant') }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ langStore.t('checkout.khqrApps') }}</div>
              </div>
            </div>

            <!-- Option 2: ABA Bank Transfer -->
            <div 
              @click="setPayment('ABA Bank')"
              class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between"
              :class="cartStore.paymentMethod === 'ABA Bank' 
                ? 'bg-blue-950/30 border-blue-500 shadow-glow' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="badge-aba font-black">ABA</span>
                <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                  :class="cartStore.paymentMethod === 'ABA Bank' ? 'border-blue-500 bg-blue-500' : 'border-slate-700'">
                  <div v-if="cartStore.paymentMethod === 'ABA Bank'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              <div>
                <div class="text-xs font-bold text-white">{{ langStore.t('checkout.abaTransfer') }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ langStore.t('checkout.accountTransfer') }}</div>
              </div>
            </div>

            <!-- Option 3: Cash on Delivery -->
            <div 
              @click="setPayment('Cash on Delivery')"
              class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between"
              :class="cartStore.paymentMethod === 'Cash on Delivery' 
                ? 'bg-emerald-950/30 border-emerald-500 shadow-glow' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'"
            >
              <div class="flex items-center justify-between mb-3">
                <DollarSign class="w-5 h-5 text-emerald-400" />
                <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                  :class="cartStore.paymentMethod === 'Cash on Delivery' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-700'">
                  <div v-if="cartStore.paymentMethod === 'Cash on Delivery'" class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
                </div>
              </div>
              <div>
                <div class="text-xs font-bold text-white">{{ langStore.t('checkout.cashOnDelivery') }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">{{ langStore.t('checkout.payUponDelivery') }}</div>
              </div>
            </div>
          </div>

          <!-- ABA Instructions -->
          <div v-if="cartStore.paymentMethod === 'ABA Bank'" class="p-4 rounded-2xl bg-slate-950/80 border border-blue-900/60 text-xs space-y-2">
            <div class="font-bold text-blue-300">{{ langStore.t('checkout.abaInstructions') }}</div>
            <div class="text-slate-300">{{ langStore.t('checkout.accountName') }} <strong>G-ZEN PHONE STORE CO., LTD</strong></div>
            <div class="text-slate-300">{{ langStore.t('checkout.accountNumber') }} <strong class="text-white font-mono">001 888 999</strong> (USD)</div>
            <div>
              <label class="block text-slate-400 mt-2 mb-1">{{ langStore.t('checkout.transactionRefLabel') }}</label>
              <input 
                v-model="shippingData.abaTransactionRef"
                type="text" 
                placeholder="e.g. ABA-TRX-123456" 
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="lg:col-span-5">
        <div class="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 lg:sticky lg:top-28 space-y-5 sm:space-y-6">
          <h2 class="text-lg font-bold text-white pb-3 border-b border-slate-800">{{ langStore.t('checkout.orderSummary') }}</h2>

          <!-- Items list -->
          <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
            <div 
              v-for="item in cartStore.items" 
              :key="item.id"
              class="flex items-center gap-3 text-xs"
            >
              <img :src="item.image" :alt="item.name" class="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-white truncate">{{ item.name }}</div>
                <div class="text-slate-400">{{ langStore.t('common.quantity') }}: {{ item.quantity }} × ${{ item.price.toLocaleString() }}</div>
              </div>
              <div class="font-bold text-emerald-400">
                ${{ (item.price * item.quantity).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Price breakdown -->
          <div class="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>{{ langStore.t('common.subtotal') }}</span>
              <span class="text-white font-medium">${{ cartStore.subtotal.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>{{ langStore.t('cart.deliveryFee') }} ({{ cartStore.selectedDistrict }})</span>
              <span class="text-emerald-400 font-semibold">${{ cartStore.deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>{{ langStore.t('common.total') }}</span>
              <span class="text-emerald-400">${{ cartStore.total.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Checkout Action CTA -->
          <div v-if="!authStore.isAuthenticated" class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
            {{ langStore.isKhmer ? 'សូមបង្កើតគណនី ឬចូលគណនីក្នុងជំហានទី ១ ដើម្បីបន្តការបញ្ជាទិញ' : 'Please register or sign in in Step 1 to place your order.' }}
          </div>

          <button 
            v-else
            @click="handleCheckoutSubmit"
            :disabled="isSubmitting"
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span v-if="!isSubmitting">
              {{ cartStore.paymentMethod === 'KHQR' ? (langStore.isKhmer ? 'ស្កេនបាគង KHQR & បញ្ជាទិញ' : 'Scan KHQR & Place Order') : (langStore.isKhmer ? 'បញ្ជាក់ការបញ្ជាទិញ ($' + cartStore.total.toLocaleString() + ')' : 'Confirm Order ($' + cartStore.total.toLocaleString() + ')') }}
            </span>
            <span v-else>{{ langStore.t('checkout.processing') }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>

          <div class="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
            <span>{{ langStore.t('common.warrantyOneYear') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- KHQR Modal Component with Real-Time Auto-Verification -->
    <KHQRModal 
      :is-open="isKHQROpen"
      :order="activeOrder"
      :khqr-data="activeKhqr"
      :amount="activeOrder?.totalAmount || cartStore.total"
      :order-number="activeOrder?.orderNumber"
      @close="handleModalClose"
      @payment-success="onKHQRPaymentSuccess"
    />
  </div>
</template>
