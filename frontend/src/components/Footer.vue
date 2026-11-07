
<script setup>
import { useLanguageStore } from '../stores/languageStore';
import { Smartphone, MapPin, Phone, Clock, Mail, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-vue-next';

const langStore = useLanguageStore();
</script>

<template>
  <footer class="bg-slate-950 border-t border-slate-800/80 pt-10 sm:pt-16 pb-8 sm:pb-12 text-slate-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Trust Badges Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pb-8 sm:pb-12 border-b border-slate-800">
        <div class="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Truck class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div class="text-slate-100 font-semibold text-xs sm:text-sm">{{ langStore.isKhmer ? 'ដឹកជញ្ជូនរហ័ស 1 ម៉ោង' : '1-Hour PP Express' }}</div>
            <div class="text-[11px] sm:text-xs text-slate-400">{{ langStore.isKhmer ? 'ទួលគោក, BKK1, ដូនពេញ' : 'Toul Kork, BKK1, Daun Penh' }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div class="text-slate-100 font-semibold text-xs sm:text-sm">{{ langStore.isKhmer ? 'ផលិតផលសុទ្ធ 100%' : '100% Genuine Tech' }}</div>
            <div class="text-[11px] sm:text-xs text-slate-400">{{ langStore.t('common.warrantyOneYear') }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <RefreshCw class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div class="text-slate-100 font-semibold text-xs sm:text-sm">{{ langStore.isKhmer ? 'មានសេវាប្តូរទូរស័ព្ទចាស់' : 'Trade-In Available' }}</div>
            <div class="text-[11px] sm:text-xs text-slate-400">{{ langStore.isKhmer ? 'តម្លៃវាយតម្លៃខ្ពស់បំផុត' : 'Best Valuation in Cambodia' }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Send class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div class="text-slate-100 font-semibold text-xs sm:text-sm">{{ langStore.isKhmer ? 'បាគង KHQR & ABA' : 'Instant KHQR & ABA' }}</div>
            <div class="text-[11px] sm:text-xs text-slate-400">{{ langStore.isKhmer ? 'ស្កេនទូទាត់គ្រប់ធនាគារ' : 'Scan & Pay via any Khmer Bank' }}</div>
          </div>
        </div>
      </div>

      <!-- Main Footer Links & PP Location -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 py-8 sm:py-12">
        <!-- Brand Info -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center text-white shrink-0">
              <Smartphone class="w-5 h-5" />
            </div>
            <span class="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">G-ZEN PHONE STORE</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed pr-0 sm:pr-6">
            {{ langStore.t('footer.about') }}
          </p>
          <div class="flex flex-wrap items-center gap-2 pt-2">
            <span class="text-xs font-semibold text-slate-300">{{ langStore.t('footer.acceptedPayment') }}</span>
            <span class="badge-khqr text-[11px] font-bold">KHQR Bakong</span>
            <span class="badge-aba text-[11px] font-bold">ABA Bank</span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">{{ langStore.isKhmer ? 'ទូទាត់ប្រាក់ពេលទំនិញដល់' : 'Cash on Delivery' }}</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">{{ langStore.t('footer.shopCategories') }}</h4>
          <ul class="space-y-2.5 text-sm">
            <li><router-link to="/shop?category=Smartphones" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'ទូរស័ព្ទស្មាតហ្វូន (iPhone & Galaxy)' : 'Smartphones (iPhone & Galaxy)' }}</router-link></li>
            <li><router-link to="/shop?category=Tablets" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'ថេបប្លេត & iPads' : 'Tablets & iPads' }}</router-link></li>
            <li><router-link to="/shop?category=Laptops" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'កុំព្យូទ័រយួរដៃ & MacBooks' : 'Laptops & MacBooks' }}</router-link></li>
            <li><router-link to="/shop?category=Accessories" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'គ្រឿងបន្លាស់ MagSafe & កាស' : 'MagSafe & Audio Accessories' }}</router-link></li>
          </ul>
        </div>

        <!-- Services -->
        <div>
          <h4 class="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">{{ langStore.t('footer.services') }}</h4>
          <ul class="space-y-2.5 text-sm">
            <li><router-link to="/services" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'ប្តូរអេក្រង់ & ថ្មទូរស័ព្ទ' : 'Screen & Battery Replacement' }}</router-link></li>
            <li><router-link to="/services" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'ដំឡើងប្រព័ន្ធ Software & iOS' : 'Software & iOS Setup' }}</router-link></li>
            <li><router-link to="/services" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'កម្មវិធីប្តូរយកឧបករណ៍ថ្មី Trade-In' : 'Device Trade-In Program' }}</router-link></li>
            <li><router-link to="/my-orders" class="hover:text-emerald-400 transition-colors">{{ langStore.isKhmer ? 'តាមដានការបញ្ជាទិញរបស់អ្នក' : 'Track Your Order' }}</router-link></li>
          </ul>
        </div>

        <!-- Store Location & Hours -->
        <div id="location" class="space-y-3">
          <h4 class="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">{{ langStore.t('footer.phnomPenhFlagship') }}</h4>
          <div class="flex items-start gap-2.5 text-sm">
            <MapPin class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{{ langStore.t('footer.storeLocation') }}</span>
          </div>
          <div class="flex items-center gap-2.5 text-sm">
            <Phone class="w-4 h-4 text-emerald-400 shrink-0" />
            <a href="tel:+85523888999" class="hover:text-emerald-400">+855 (0) 23 888 999</a>
          </div>
          <div class="flex items-center gap-2.5 text-sm">
            <Clock class="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{{ langStore.t('footer.openingHours') }}</span>
          </div>
          <div class="flex items-center gap-2.5 text-sm">
            <Mail class="w-4 h-4 text-emerald-400 shrink-0" />
            <a href="mailto:support@gzenphone.kh" class="hover:text-emerald-400">support@gzenphone.kh</a>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="pt-6 sm:pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-500 gap-3 sm:gap-4 text-center sm:text-left">
        <div>
          © 2026 G-Zen Phone Store Co., Ltd. All rights reserved. Phnom Penh, Cambodia.
        </div>
        <div class="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1">
          <span>{{ langStore.t('footer.officialRetailer') }}</span>
          <span class="hidden sm:inline">•</span>
          <span>{{ langStore.t('footer.bakongIntegrated') }}</span>
          <span class="hidden sm:inline">•</span>
          <span>{{ langStore.t('footer.madeForCambodia') }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
