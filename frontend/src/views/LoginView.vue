<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useLanguageStore } from '../stores/languageStore';
import { Smartphone, Lock, User, ArrowRight, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const langStore = useLanguageStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = langStore.isKhmer ? 'សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នក' : 'Please enter your email and password.';
    return;
  }

  isLoading.value = true;
  try {
    const res = await authStore.login(email.value, password.value);
    
    // Check redirect
    const redirectUrl = route.query.redirect;
    if (res.user.role === 'admin') {
      router.push(redirectUrl && !redirectUrl.includes('/login') ? redirectUrl : '/admin-portal');
    } else {
      router.push(redirectUrl && !redirectUrl.includes('/admin') ? redirectUrl : '/my-orders');
    }
  } catch (err) {
    errorMessage.value = err.message || (langStore.isKhmer ? 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ' : 'Invalid email or password.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto px-3.5 sm:px-4 py-8 sm:py-16">
    <div class="glass-panel p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-glow bg-gradient-to-br from-emerald-400 to-teal-700 text-white">
          <Smartphone class="w-6 h-6" />
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight">
          {{ langStore.t('auth.signInTitle') }}
        </h1>
        <p class="text-xs text-slate-400">
          {{ langStore.t('auth.signInSubtitle') }}
        </p>
      </div>

      <div v-if="errorMessage" class="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.emailLabel') }}</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              v-model="email"
              type="email" 
              placeholder="name@domain.com" 
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.passwordLabel') }}</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              v-model="password"
              type="password" 
              placeholder="••••••••" 
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-3.5 rounded-xl font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950"
        >
          <span v-if="!isLoading">{{ langStore.t('auth.signInButton') }}</span>
          <span v-else>{{ langStore.t('common.loading') }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <!-- Customer Registration Link -->
      <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>{{ langStore.t('auth.newCustomer') }}</span>
        <router-link to="/register" class="text-emerald-400 hover:underline font-bold">
          {{ langStore.t('auth.createAccount') }}
        </router-link>
      </div>
    </div>
  </div>
</template>
