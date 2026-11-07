<script setup>
import { ref } from 'vue';
import { useLanguageStore } from '../stores/languageStore';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Wrench, 
  Cpu, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search, 
  Calendar, 
  AlertCircle, 
  FileText 
} from 'lucide-vue-next';

const langStore = useLanguageStore();
const activeTab = ref('book'); // 'book' or 'track'

const bookingForm = ref({
  customerName: '',
  phone: '',
  deviceModel: '',
  serviceType: 'Hardware Repair',
  issueDescription: '',
  preferredDate: new Date().toISOString().split('T')[0],
});

const isSubmitting = ref(false);
const submittedTicket = ref(null);
const errorMessage = ref('');

// Ticket tracking lookup
const searchTicketNumber = ref('');
const searchedBooking = ref(null);
const searchLoading = ref(false);
const searchError = ref('');

const submitBooking = async () => {
  errorMessage.value = '';
  if (!bookingForm.value.customerName.trim() || !bookingForm.value.phone.trim() || !bookingForm.value.deviceModel.trim() || !bookingForm.value.issueDescription.trim()) {
    errorMessage.value = langStore.isKhmer ? 'សូមបំពេញព័ត៌មានដែលត្រូវការទាំងអស់' : 'Please fill out all required fields.';
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await api.post('/repairs', bookingForm.value);
    if (res.success) {
      submittedTicket.value = res.booking;
      confetti({ particleCount: 70, spread: 60 });
    }
  } catch (err) {
    errorMessage.value = err.message || (langStore.isKhmer ? 'ការស្នើសុំជួសជុលមិនជោគជ័យទេ' : 'Failed to submit repair request.');
  } finally {
    isSubmitting.value = false;
  }
};

const lookupTicket = async () => {
  if (!searchTicketNumber.value.trim()) return;
  searchLoading.value = true;
  searchError.value = '';
  searchedBooking.value = null;

  try {
    const res = await api.get(`/repairs/track/${searchTicketNumber.value.trim()}`);
    if (res.success) {
      searchedBooking.value = res.booking;
    }
  } catch (err) {
    searchError.value = err.message || (langStore.isKhmer ? 'រកមិនឃើញសំបុត្រទេ សូមផ្ទៀងផ្ទាត់លេខសំបុត្ររបស់អ្នកម្តងទៀត' : 'Ticket not found. Please verify your ticket number.');
  } finally {
    searchLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
        <Wrench class="w-4 h-4" />
        <span>{{ langStore.isKhmer ? 'មជ្ឈមណ្ឌលសេវាកម្មស្តង់ដារ រាជធានីភ្នំពេញ' : 'Certified Phnom Penh Service Center' }}</span>
      </div>
      <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">
        {{ langStore.t('services.title') }}
      </h1>
      <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
        {{ langStore.t('services.subtitle') }}
      </p>
    </div>

    <!-- Booking Form & Tracker Toggle -->
    <div class="max-w-2xl mx-auto glass-panel p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-800">
      <div class="flex items-center justify-center gap-1.5 sm:gap-2 p-1 bg-slate-950 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 border border-slate-800">
        <button 
          @click="activeTab = 'book'"
          class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="activeTab === 'book' ? 'bg-emerald-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'"
        >
          <Calendar class="w-4 h-4" />
          <span>{{ langStore.t('services.bookTab') }}</span>
        </button>
        <button 
          @click="activeTab = 'track'"
          class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="activeTab === 'track' ? 'bg-emerald-500 text-slate-950 shadow-glow' : 'text-slate-400 hover:text-white'"
        >
          <Search class="w-4 h-4" />
          <span>{{ langStore.t('services.trackTab') }}</span>
        </button>
      </div>

      <!-- Tab 1: Booking Form -->
      <div v-if="activeTab === 'book'">
        <div v-if="submittedTicket" class="text-center py-6 space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
            <CheckCircle2 class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-white">{{ langStore.t('services.successTicket') }}</h3>
          <p class="text-xs text-slate-300 max-w-md mx-auto">
            {{ langStore.t('services.saveTicketNote') }}
          </p>
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 font-bold inline-block">
            {{ langStore.t('services.ticketNumber') }}: {{ submittedTicket.ticketNumber }}
          </div>
          <div>
            <button 
              @click="submittedTicket = null; bookingForm = { customerName: '', phone: '', deviceModel: '', serviceType: 'Hardware Repair', issueDescription: '', preferredDate: new Date().toISOString().split('T')[0] }"
              class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
            >
              {{ langStore.isKhmer ? 'កក់ការណាត់ជួបផ្សេងទៀត' : 'Book Another Service' }}
            </button>
          </div>
        </div>

        <form v-else @submit.prevent="submitBooking" class="space-y-4">
          <div v-if="errorMessage" class="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('services.customerName') }} *</label>
              <input 
                v-model="bookingForm.customerName"
                type="text" 
                :placeholder="langStore.isKhmer ? 'ឧ. ចាន់ណាក់ មាស' : 'e.g. Channak Meas'" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('services.phoneNumber') }} *</label>
              <input 
                v-model="bookingForm.phone"
                type="text" 
                :placeholder="langStore.isKhmer ? 'ឧ. 087 112 334' : 'e.g. 087 112 334'" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('services.deviceModel') }} *</label>
              <input 
                v-model="bookingForm.deviceModel"
                type="text" 
                :placeholder="langStore.isKhmer ? 'ឧ. iPhone 15 Pro Max, Galaxy S24' : 'e.g. iPhone 15 Pro Max, Galaxy S24'" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('services.serviceType') }} *</label>
              <select 
                v-model="bookingForm.serviceType"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Hardware Repair">{{ langStore.t('services.hardwareRepair') }}</option>
                <option value="Software Setup">{{ langStore.t('services.softwareSetup') }}</option>
                <option value="Trade-In">{{ langStore.t('services.tradeInValuation') }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('services.preferredDate') }} *</label>
            <input 
              v-model="bookingForm.preferredDate"
              type="date" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.t('services.issueDescription') }} *</label>
            <textarea 
              v-model="bookingForm.issueDescription"
              rows="3"
              :placeholder="langStore.isKhmer ? 'រៀបរាប់អំពីបញ្ហា (ឧ. បែកកញ្ចក់អេក្រង់, ឆាប់អស់ថ្ម, មិនដើរថាច់)...' : 'Describe the issue (e.g. cracked front glass, battery percentage drops fast, touch unresponsive)...'" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <button 
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Wrench class="w-4 h-4" />
            <span>{{ isSubmitting ? langStore.t('services.submitting') : langStore.t('services.submitBooking') }}</span>
          </button>
        </form>
      </div>

      <!-- Tab 2: Track Ticket -->
      <div v-else class="space-y-6">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">{{ langStore.isKhmer ? 'បញ្ចូលលេខសំបុត្រជួសជុល' : 'Enter Repair Ticket Number' }}</label>
          <div class="flex gap-2">
            <input 
              v-model="searchTicketNumber"
              type="text" 
              :placeholder="langStore.t('services.searchPlaceholder')" 
              class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button 
              @click="lookupTicket"
              :disabled="searchLoading"
              class="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-glow hover:bg-emerald-400 flex items-center gap-1.5 cursor-pointer"
            >
              <Search class="w-3.5 h-3.5" />
              <span>{{ langStore.t('services.searchButton') }}</span>
            </button>
          </div>
        </div>

        <div v-if="searchError" class="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ searchError }}</span>
        </div>

        <!-- Ticket Result Card -->
        <div v-if="searchedBooking" class="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span class="font-mono font-bold text-emerald-400 text-sm">{{ searchedBooking.ticketNumber }}</span>
              <div class="text-slate-400 text-[11px]">{{ searchedBooking.serviceType }}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider"
              :class="{
                'bg-amber-950 text-amber-400 border border-amber-800': searchedBooking.status === 'Received',
                'bg-blue-950 text-blue-400 border border-blue-800': searchedBooking.status === 'In Progress',
                'bg-emerald-950 text-emerald-400 border border-emerald-800': searchedBooking.status === 'Completed'
              }">
              {{ searchedBooking.status === 'Received' ? langStore.t('services.statusReceived') : (searchedBooking.status === 'In Progress' ? langStore.t('services.statusInProgress') : langStore.t('services.statusCompleted')) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="text-slate-400">{{ langStore.t('services.customerName') }}</div>
              <div class="font-bold text-white">{{ searchedBooking.customerName }}</div>
            </div>
            <div>
              <div class="text-slate-400">{{ langStore.t('services.deviceModel') }}</div>
              <div class="font-bold text-white">{{ searchedBooking.deviceModel }}</div>
            </div>
          </div>

          <div>
            <div class="text-slate-400">{{ langStore.t('services.issueDescription') }}:</div>
            <div class="text-slate-200 mt-0.5">{{ searchedBooking.issueDescription }}</div>
          </div>

          <div v-if="searchedBooking.technicianNotes" class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300">
            <span class="font-bold">{{ langStore.isKhmer ? 'កំណត់ចំណាំរបស់ជាងជំនាញ: ' : 'Technician Status: ' }}</span>
            <span>{{ searchedBooking.technicianNotes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
