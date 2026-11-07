<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useLanguageStore } from '../stores/languageStore';
import { Smartphone, User, Lock, Mail, Phone, MapPin, ArrowRight, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const langStore = useLanguageStore();

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
});

const errorMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  errorMessage.value = '';
  if (!form.value.name || !form.value.email || !form.value.password) {
    errorMessage.value = langStore.isKhmer ? 'សូមបញ្ចូលឈ្មោះ អ៊ីមែល និងពាក្យសម្ងាត់' : 'Please provide name, email, and password.';
    return;
  }

  isLoading.value = true;
  try {
    await authStore.register(form.value);
    router.push('/');
  } catch (err) {
    errorMessage.value = err.message || (langStore.isKhmer ? 'ការចុះឈ្មោះមិនបានជោគជ័យទេ' : 'Registration failed.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto px-3.5 sm:px-4 py-8 sm:py-12">
    <div class="glass-panel p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 text-white flex items-center justify-center mx-auto shadow-glow">
          <Smartphone class="w-6 h-6" />
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight">{{ langStore.t('auth.registerTitle') }}</h1>
        <p class="text-xs text-slate-400">{{ langStore.t('auth.registerSubtitle') }}</p>
      </div>

      <div v-if="errorMessage" class="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.fullName') }} *</label>
          <input 
            v-model="form.name"
            type="text" 
            placeholder="e.g. Sokha Rith" 
            required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.emailLabel') }} *</label>
          <input 
            v-model="form.email"
            type="email" 
            placeholder="e.g. sokha@example.com" 
            required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.phone') }}</label>
          <input 
            v-model="form.phone"
            type="text" 
            placeholder="e.g. 098 765 432" 
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.passwordLabel') }} *</label>
          <input 
            v-model="form.password"
            type="password" 
            :placeholder="langStore.isKhmer ? 'យ៉ាងតិច ៦ តួអក្សរ' : 'Minimum 6 characters'" 
            required
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('auth.address') }}</label>
          <input 
            v-model="form.address"
            type="text" 
            :placeholder="langStore.isKhmer ? 'ឧ. ខណ្ឌទួលគោក ផ្លូវ ៣១៥' : 'e.g. Toul Kork, St. 315'" 
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <span v-if="!isLoading">{{ langStore.t('auth.registerButton') }}</span>
          <span v-else>{{ langStore.t('common.loading') }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <div class="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
        {{ langStore.t('auth.alreadyRegistered') }} 
        <router-link to="/login" class="text-emerald-400 hover:underline font-bold ml-1">
          {{ langStore.t('nav.signIn') }}
        </router-link>
      </div>
    </div>
  </div>
</template>
