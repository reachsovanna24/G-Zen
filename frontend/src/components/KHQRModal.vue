<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  QrCode,
  RefreshCw,
  Clock,
  Smartphone,
  CheckCheck,
  AlertTriangle
} from 'lucide-vue-next';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useLanguageStore } from '../stores/languageStore';

const langStore = useLanguageStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Object,
    default: null,
  },
  amount: {
    type: Number,
    default: 0,
  },
  orderNumber: {
    type: String,
    default: '',
  },
  khqrData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'payment-success']);

// 3 MINUTES COUNTDOWN WAITING TIME (180 seconds)
const TOTAL_TIMEOUT_SECONDS = 180;
const timeLeft = ref(TOTAL_TIMEOUT_SECONDS);

const isPolling = ref(false);
const isPaid = ref(false);
const isExpired = ref(false);
const isRegenerating = ref(false);
const copied = ref(false);
const copiedMd5 = ref(false);
const pollCount = ref(0);
const settlementInfo = ref(null);
const verificationMessage = ref(langStore.isKhmer ? 'កំពុងរង់ចាំការផ្ទេរប្រាក់នៅលើប្រព័ន្ធបាគង NBC...' : 'Waiting for payment transfer on NBC ledger...');

// Dynamic QR state (allows seamless 3-minute regeneration without reload)
const activeQrImage = ref(null);
const activeMd5 = ref(null);
const activeDeeplink = ref(null);

let countdownTimer = null;
let pollTimer = null;

// Audio Chime synthesizer for POS auto-confirmation sound
const playSuccessChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // First pleasant chime tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second crisp chime tone (880 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio autoplay might be blocked on some browsers, ignore
  }
};

// Resolved order values
const resolvedAmount = computed(() => {
  if (props.order?.totalAmount) return Number(props.order.totalAmount);
  if (props.khqrData?.amount) return Number(props.khqrData.amount);
  return Number(props.amount) || 0;
});

const resolvedOrderNumber = computed(() => {
  return props.order?.orderNumber || props.orderNumber || props.khqrData?.billNumber || 'GZ-ORDER';
});

const resolvedOrderId = computed(() => {
  return props.order?.id || props.order?.orderNumber || props.orderNumber;
});

const resolvedMd5 = computed(() => {
  return activeMd5.value || props.order?.khqrMd5 || props.khqrData?.md5 || '';
});

const resolvedAccountId = computed(() => {
  return props.khqrData?.accountId || props.order?.khqrAccountId || 'udom_vathna@bkrt';
});

const resolvedQrImage = computed(() => {
  if (activeQrImage.value) return activeQrImage.value;
  if (props.order?.khqrImage) return props.order.khqrImage;
  if (props.khqrData?.qrImage) return props.khqrData.qrImage;
  // Resilient fallback dynamic QR code
  const accountId = resolvedAccountId.value;
  const accSubtag = `00${accountId.length < 10 ? '0' + accountId.length : accountId.length}${accountId}`;
  const tag29 = `29${accSubtag.length < 10 ? '0' + accSubtag.length : accSubtag.length}${accSubtag}`;
  const qrData = `000201010212${tag29}5204599953038405404${resolvedAmount.value.toFixed(2)}5802KH5917G-Zen Phone Store6010Phnom Penh62160112${resolvedOrderNumber.value}6304`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData)}`;
});

const resolvedDeeplink = computed(() => {
  if (activeDeeplink.value) return activeDeeplink.value;
  if (props.order?.khqrDeeplink) return props.order.khqrDeeplink;
  if (props.khqrData?.deeplink) return props.khqrData.deeplink;
  return `bakong://qr?data=${resolvedOrderNumber.value}`;
});

const khrAmount = computed(() => {
  return Math.round(resolvedAmount.value * 4100).toLocaleString();
});

// Timer calculations
const timeProgress = computed(() => {
  return Math.max(0, Math.min(100, (timeLeft.value / TOTAL_TIMEOUT_SECONDS) * 100));
});

const timerColorClass = computed(() => {
  if (timeLeft.value > 90) return 'text-emerald-600 bg-emerald-500';
  if (timeLeft.value > 30) return 'text-amber-600 bg-amber-500';
  return 'text-red-600 bg-red-600 animate-pulse';
});

// Format countdown time MM:SS
const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const copyAccount = () => {
  navigator.clipboard.writeText(resolvedAccountId.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};

const copyHash = () => {
  if (resolvedMd5.value) {
    navigator.clipboard.writeText(resolvedMd5.value);
    copiedMd5.value = true;
    setTimeout(() => (copiedMd5.value = false), 2000);
  }
};

// AUTO-VERIFICATION ENGINE (Polls every 2 seconds for instant auto-confirmation)
const checkPaymentStatus = async () => {
  if (isPaid.value || isExpired.value || !props.isOpen) return;
  const targetId = resolvedOrderId.value || resolvedMd5.value;
  if (!targetId) return;

  try {
    isPolling.value = true;
    pollCount.value++;

    const res = await api.get(`/orders/verify-payment/${targetId}`);
    
    if (res.success && res.paid) {
      handleAutoConfirmSuccess(res.order || props.order, res.settlement);
    } else {
      verificationMessage.value = res.message || 'Waiting for customer payment transfer...';
    }
  } catch (err) {
    console.debug('[Bakong Auto-Verify] Polling retry:', err.message);
  } finally {
    isPolling.value = false;
  }
};

// Handle Auto Confirm
const handleAutoConfirmSuccess = (confirmedOrder, settlement) => {
  stopPolling();
  stopCountdown();
  
  isPaid.value = true;
  settlementInfo.value = settlement || {
    hash: `nbc_${resolvedMd5.value.slice(0, 12)}`,
    settledAt: new Date().toISOString(),
    channel: 'BAKONG_KHQR'
  };
  verificationMessage.value = langStore.isKhmer ? 'ការទូទាត់ត្រូវបានផ្ទៀងផ្ទាត់ជោគជ័យលើប្រព័ន្ធបាគង NBC' : 'Payment confirmed and verified on NBC Ledger!';

  // Play audio chime
  playSuccessChime();

  // Trigger celebration confetti
  confetti({
    particleCount: 140,
    spread: 85,
    origin: { y: 0.6 }
  });

  // Automatically emit and proceed after 1.5s visual confirmation
  setTimeout(() => {
    emit('payment-success', {
      order: confirmedOrder,
      settlement: settlementInfo.value,
      transactionRef: confirmedOrder?.transactionRef || `BAKONG-${resolvedMd5.value.slice(0, 8).toUpperCase()}`,
    });
  }, 1600);
};

const startPolling = () => {
  stopPolling();
  // Immediate check
  checkPaymentStatus();
  // Live polling every 2 seconds
  pollTimer = setInterval(checkPaymentStatus, 2000);
};

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

// Start 3-Minute Countdown
const startCountdown = () => {
  stopCountdown();
  timeLeft.value = TOTAL_TIMEOUT_SECONDS;
  isExpired.value = false;

  countdownTimer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      // 3 minutes elapsed
      stopCountdown();
      stopPolling();
      isExpired.value = true;
      verificationMessage.value = 'KHQR session expired (3 min elapsed). Please regenerate a new QR.';
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

// Regenerate a fresh 3-minute KHQR code
const regenerateFreshKhqr = async () => {
  const targetId = resolvedOrderId.value;
  if (!targetId || isRegenerating.value) return;

  isRegenerating.value = true;
  try {
    const res = await api.get(`/orders/khqr/${targetId}?refresh=true`);
    if (res.success && res.khqr) {
      activeQrImage.value = res.khqr.qrImage;
      activeMd5.value = res.khqr.md5;
      activeDeeplink.value = res.khqr.deeplink;

      // Reset state for new 3-minute cycle
      isExpired.value = false;
      isPaid.value = false;
      pollCount.value = 0;
      verificationMessage.value = 'Fresh 3-minute KHQR generated. Waiting for transfer...';
      
      startCountdown();
      startPolling();
    }
  } catch (err) {
    console.error('Failed to regenerate KHQR:', err);
    // Restart fallback timer
    startCountdown();
    startPolling();
  } finally {
    isRegenerating.value = false;
  }
};

// Watchers
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isPaid.value = false;
    isExpired.value = false;
    pollCount.value = 0;
    settlementInfo.value = null;
    verificationMessage.value = langStore.isKhmer ? 'កំពុងរង់ចាំការផ្ទេរប្រាក់នៅលើប្រព័ន្ធបាគង NBC...' : 'Waiting for payment transfer on NBC ledger...';
    startCountdown();
    startPolling();
  } else {
    stopCountdown();
    stopPolling();
  }
}, { immediate: true });

onUnmounted(() => {
  stopCountdown();
  stopPolling();
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- KHQR Container -->
    <div class="relative w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 text-slate-900 animate-in fade-in zoom-in-95 border border-slate-200 max-h-[94vh] flex flex-col">
      
      <!-- KHQR Official Red Header -->
      <div class="bg-[#D91B24] p-3 sm:p-3.5 text-white text-center relative select-none shadow-md shrink-0">
        <button 
          @click="emit('close')" 
          class="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Close payment window"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="flex items-center justify-center gap-1.5">
          <span class="text-xl sm:text-2xl font-black tracking-widest leading-none">KHQR</span>
        </div>
        <div class="text-[10px] font-bold tracking-wider uppercase opacity-95 flex items-center justify-center gap-1 mt-1">
          <ShieldCheck class="w-3.5 h-3.5 text-white" />
          <span>{{ langStore.t('khqr.officialNBC') }}</span>
        </div>
      </div>

      <!-- 3-Minute Animated Progress Bar -->
      <div class="w-full bg-slate-100 h-1.5 overflow-hidden shrink-0">
        <div 
          class="h-full transition-all duration-1000 ease-linear"
          :class="timerColorClass.split(' ')[1]"
          :style="{ width: `${timeProgress}%` }"
        ></div>
      </div>

      <!-- Merchant Info & Payment Body -->
      <div class="p-4 sm:p-5 text-center space-y-3 sm:space-y-3.5 overflow-y-auto">
        
        <!-- Store Name & Bakong Account ID -->
        <div>
          <div class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{{ langStore.t('khqr.merchantShowroom') }}</div>
          <div class="text-sm font-black text-slate-900 tracking-tight">{{ langStore.t('khqr.showroomTitle') }}</div>
          
          <div class="flex items-center justify-center gap-1.5 mt-0.5">
            <span class="text-[11px] text-slate-600 font-mono">{{ langStore.t('khqr.bakongIdLabel') }} <strong>{{ resolvedAccountId }}</strong></span>
            <button 
              @click="copyAccount" 
              class="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="Copy Bakong ID"
            >
              <Check v-if="copied" class="w-3 h-3 text-emerald-600" />
              <Copy v-else class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- Amount Due (Dual USD & KHR) -->
        <div class="py-2 sm:py-2.5 px-3 sm:px-4 bg-red-50/90 border border-red-100 rounded-2xl">
          <div class="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">{{ langStore.t('khqr.amountDue') }}</div>
          <div class="text-2xl sm:text-3xl font-black text-red-600 tracking-tight mt-0.5">
            ${{ resolvedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 mt-0.5">
            ≈ {{ khrAmount }} KHR ({{ langStore.t('khqr.rateInfo') }})
          </div>
        </div>

        <!-- Dynamic High-Contrast Bakong QR Code with 3-Min Expiry & Confirmation Overlay -->
        <div class="relative mx-auto w-44 h-44 sm:w-52 sm:h-52 p-2 bg-white rounded-2xl border-2 border-slate-300 shadow-inner flex items-center justify-center overflow-hidden">
          <img 
            :src="resolvedQrImage" 
            alt="Bakong KHQR Code"
            class="w-full h-full object-contain"
            :class="{ 'blur-sm opacity-20': isExpired }"
          />

          <!-- Official KHQR Center Badge -->
          <div v-if="!isPaid && !isExpired" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-10 h-10 rounded-lg bg-[#D91B24] border-2 border-white shadow-md flex items-center justify-center text-white font-black text-[10px] tracking-wider">
              KHQR
            </div>
          </div>

          <!-- 3-Minute Expired Overlay -->
          <div 
            v-if="isExpired && !isPaid" 
            class="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 animate-in fade-in"
          >
            <AlertTriangle class="w-10 h-10 text-amber-400 mb-1.5" />
            <div class="text-xs font-black uppercase tracking-wider text-amber-300">{{ langStore.t('khqr.qrExpired') }}</div>
            <p class="text-[10px] text-slate-300 text-center mt-1 leading-snug">
              {{ langStore.t('khqr.qrExpiredDesc') }}
            </p>
            <button 
              @click="regenerateFreshKhqr"
              :disabled="isRegenerating"
              class="mt-3 px-3 py-1.5 rounded-xl bg-[#D91B24] hover:bg-red-700 text-white font-bold text-[11px] shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRegenerating }" />
              <span>{{ langStore.t('khqr.refresh3Min') }}</span>
            </button>
          </div>

          <!-- Instant Auto-Confirm Success Overlay -->
          <div 
            v-if="isPaid" 
            class="absolute inset-0 bg-emerald-600/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 animate-in fade-in zoom-in-95"
          >
            <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 class="w-10 h-10 text-white" />
            </div>
            <div class="text-base font-black tracking-wide">{{ langStore.t('khqr.paymentConfirmedTitle') }}</div>
            <div class="text-[11px] font-semibold opacity-95 mt-0.5">{{ langStore.t('khqr.autoConfirmedNbc') }}</div>
            <div v-if="settlementInfo?.hash" class="text-[9px] font-mono opacity-85 mt-1 bg-black/20 px-2 py-0.5 rounded truncate max-w-[180px]">
              {{ settlementInfo.hash }}
            </div>
            <div class="text-[10px] opacity-90 mt-2 flex items-center gap-1 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>{{ langStore.t('khqr.finalizingReceipt') }}</span>
            </div>
          </div>
        </div>

        <!-- 3-Minute Timer & Auto-Verification Status Banner -->
        <div class="py-2.5 px-3 rounded-xl border transition-all text-xs flex items-center justify-between"
          :class="isPaid 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' 
            : isExpired
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-amber-50 border-amber-200 text-amber-900'"
        >
          <div class="flex items-center gap-2">
            <!-- Pulsing Status Radar Indicator -->
            <div v-if="!isPaid && !isExpired" class="relative flex h-3 w-3 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </div>
            <CheckCheck v-else-if="isPaid" class="w-4 h-4 text-emerald-600 shrink-0" />
            <AlertCircle v-else class="w-4 h-4 text-amber-600 shrink-0" />

            <div class="text-left">
              <div class="font-bold text-[11px] leading-tight">
                {{ isPaid ? langStore.t('khqr.settlementAutoConfirmed') : isExpired ? langStore.t('khqr.qrExpired3m') : langStore.t('khqr.waitingTransfer') }}
              </div>
              <div class="text-[10px] opacity-80 leading-tight mt-0.5">
                {{ isPaid ? langStore.t('khqr.nbcVerified') : isExpired ? langStore.t('khqr.clickRefresh') : `${langStore.t('khqr.autoVerifyingPoll')} (Poll #${pollCount})` }}
              </div>
            </div>
          </div>

          <!-- 3-Minute Countdown Display -->
          <div class="flex items-center gap-1 font-mono text-xs font-black shrink-0" :class="timerColorClass.split(' ')[0]">
            <Clock class="w-3.5 h-3.5" />
            <span>{{ formatTime(timeLeft) }}</span>
          </div>
        </div>

        <!-- Bill Number & MD5 Transaction Reference -->
        <div class="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 border border-slate-200/80 text-left space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-slate-500">{{ langStore.t('khqr.billNumberLabel') }}</span>
            <span class="font-mono font-bold text-slate-800">{{ resolvedOrderNumber }}</span>
          </div>
          <div v-if="resolvedMd5" class="flex justify-between items-center">
            <span class="text-slate-500">{{ langStore.t('khqr.md5HashLabel') }}</span>
            <div class="flex items-center gap-1">
              <span class="font-mono text-[10px] text-slate-700">{{ resolvedMd5.slice(0, 16) }}...</span>
              <button @click="copyHash" class="p-0.5 hover:text-slate-900" title="Copy MD5 hash">
                <Check v-if="copiedMd5" class="w-2.5 h-2.5 text-emerald-600" />
                <Copy v-else class="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Supported Cambodian Member Banking Apps -->
        <div class="pt-0.5">
          <div class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {{ langStore.t('khqr.supportedApps') }}
          </div>
          <div class="flex flex-wrap items-center justify-center gap-1 text-[10px] font-bold text-slate-700">
            <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">ABA Mobile</span>
            <span class="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">Bakong</span>
            <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">ACLEDA</span>
            <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">Wing Bank</span>
            <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Canadia</span>
          </div>
        </div>

        <!-- Actions / Mobile Deeplink & Payment Verification Check -->
        <div class="space-y-2 pt-1">
          <!-- Mobile 1-Tap Open in Bakong App Button -->
          <a 
            :href="resolvedDeeplink"
            target="_blank"
            class="w-full py-2.5 px-4 rounded-xl bg-[#D91B24] hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone class="w-4 h-4" />
            <span>{{ langStore.t('khqr.openBakongMobile') }}</span>
            <ExternalLink class="w-3.5 h-3.5 opacity-80" />
          </a>

          <!-- Manual Check Payment Status Button -->
          <button 
            type="button"
            @click="checkPaymentStatus"
            :disabled="isPolling || isPaid || isExpired"
            class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isPolling }" />
            <CheckCircle2 v-if="isPaid" class="w-4 h-4 text-emerald-400" />
            <span v-if="isPolling">{{ langStore.t('khqr.verifyingLedger') }}</span>
            <span v-else-if="isPaid">{{ langStore.t('khqr.paymentConfirmedTitle') }}</span>
            <span v-else>{{ langStore.t('khqr.checkPaymentStatus') }}</span>
          </button>

          <!-- Cancel / Close Modal Option -->
          <button 
            type="button"
            @click="emit('close')"
            class="w-full py-2 text-center text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            {{ langStore.isKhmer ? 'បោះបង់ ឬទូទាត់ពេលក្រោយ' : 'Cancel / Pay Later' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
