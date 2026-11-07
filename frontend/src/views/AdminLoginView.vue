<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useLanguageStore } from '../stores/languageStore';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  Server
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const langStore = useLanguageStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleAdminLogin = async () => {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = langStore.isKhmer ? 'សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់អ្នកគ្រប់គ្រង' : 'Please provide administrator email and password.';
    return;
  }

  isLoading.value = true;
  try {
    const res = await authStore.adminLogin(email.value, password.value);
    const redirectUrl = route.query.redirect;
    router.push(redirectUrl && !redirectUrl.includes('/login') ? redirectUrl : '/admin-portal');
  } catch (err) {
    errorMessage.value = err.message || (langStore.isKhmer ? 'ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ' : 'Access Denied: Invalid administrator credentials or insufficient clearance.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100">
    <!-- Ambient Security Glow Backdrop -->
    <div class="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
    <div class="absolute w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none"></div>

    <!-- Security Header Card -->
    <div class="w-full max-w-md relative z-10 space-y-6">
      
      <!-- Top Gateway Branding -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/25 border border-indigo-400/30">
          <ShieldCheck class="w-8 h-8" />
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold tracking-wider uppercase mt-2">
          <Server class="w-3 h-3 text-indigo-400" />
          <span>G-ZEN SECURITY GATEWAY</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {{ langStore.isKhmer ? 'ច្រកចូលអ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'Administrative Gateway' }}
        </h1>
        <p class="text-xs text-slate-400 max-w-xs mx-auto">
          {{ langStore.isKhmer ? 'តំបន់សុវត្ថិភាពខ្ពស់ សម្រាប់តែបុគ្គលិកដែលមានការអនុញ្ញាតប៉ុណ្ណោះ' : 'Restricted operations console. Authorized store staff & administrators only.' }}
        </p>
      </div>

      <!-- Main Login Container -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-900/50 bg-slate-900/90 shadow-2xl space-y-5">
        
        <!-- Error / Security Alert -->
        <div v-if="errorMessage" class="p-3.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
          <ShieldAlert class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleAdminLogin" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1.5">
              {{ langStore.isKhmer ? 'អ៊ីមែលអ្នកគ្រប់គ្រង' : 'Administrator Email' }}
            </label>
            <div class="relative">
              <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                v-model="email"
                type="email" 
                placeholder="admin@gzenphone.kh" 
                required
                autocomplete="email"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1.5">
              {{ langStore.isKhmer ? 'ពាក្យសម្ងាត់សុវត្ថិភាព' : 'Security Clearance Key / Password' }}
            </label>
            <div class="relative">
              <KeyRound class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                v-model="password"
                type="password" 
                placeholder="••••••••••••" 
                required
                autocomplete="current-password"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <span v-if="!isLoading">{{ langStore.isKhmer ? 'ផ្ទៀងផ្ទាត់ និងចូលប្រព័ន្ធគ្រប់គ្រង' : 'Verify Clearance & Enter Console' }}</span>
            <span v-else>{{ langStore.isKhmer ? 'កំពុងផ្ទៀងផ្ទាត់សិទ្ធិ...' : 'Authenticating Clearance...' }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        <!-- System Security Footnote -->
        <div class="pt-2 border-t border-slate-800/80 text-center space-y-3">
          <div class="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
            <Lock class="w-3 h-3 text-indigo-400" />
            <span>256-bit TLS Encrypted • Zero Customer Cross-Access</span>
          </div>

          <div>
            <router-link 
              to="/" 
              class="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>{{ langStore.isKhmer ? 'ត្រឡប់ទៅហាងអតិថិជន' : 'Return to Customer Storefront' }}</span>
            </router-link>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

