<script setup>
import { useLanguageStore } from '../stores/languageStore';
import { MapPin, Phone, Mail, Clock, Navigation, ExternalLink, CalendarDays, Compass } from 'lucide-vue-next';

const langStore = useLanguageStore();

const openMap = () => {
  window.open('https://maps.google.com/?q=BKK1+Phnom+Penh', '_blank');
};
</script>

<template>
  <main class="min-h-screen bg-slate-950 pb-16 sm:pb-20">
    <!-- Hero Section -->
    <section class="relative pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden border-b border-slate-800/80">
      <!-- Ambient glow -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="inline-flex items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 sm:mb-6 border border-emerald-500/30">
          <MapPin class="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h1 class="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tight mb-4 sm:mb-6">
          <span class="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{{ langStore.t('location.title') }}</span>
        </h1>
        <p class="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
          {{ langStore.t('location.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        <!-- Left Column: Details -->
        <div class="lg:col-span-5 space-y-6 sm:space-y-8">
          
          <!-- Contact Info Card -->
          <div class="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800/80 hover:border-emerald-500/30 transition-colors shadow-2xl">
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-2">
              <Compass class="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              {{ langStore.t('location.visitUs') }}
            </h3>
            
            <div class="space-y-5 sm:space-y-6">
              <div class="flex items-start gap-3 sm:gap-4">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                  <MapPin class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 class="text-white font-semibold mb-1 text-sm sm:text-base">{{ langStore.t('location.locationHeader') }}</h4>
                  <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {{ langStore.t('location.addressLines') }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3 sm:gap-4">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                  <Phone class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 class="text-white font-semibold mb-1 text-sm sm:text-base">{{ langStore.t('location.phoneHeader') }}</h4>
                  <p class="text-slate-400 text-xs sm:text-sm">
                    +855 (0) 23 888 999<br />
                    +855 12 888 999
                  </p>
                </div>
              </div>
              
              <div class="flex items-start gap-3 sm:gap-4">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                  <Mail class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 class="text-white font-semibold mb-1 text-sm sm:text-base">{{ langStore.t('location.emailHeader') }}</h4>
                  <p class="text-slate-400 text-xs sm:text-sm">
                    support@gzenphone.kh<br />
                    sales@gzenphone.kh
                  </p>
                </div>
              </div>
            </div>
            
            <a 
              href="https://maps.google.com/?q=BKK1+Phnom+Penh" 
              target="_blank"
              class="mt-6 sm:mt-8 w-full flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-glow text-sm sm:text-base"
            >
              <Navigation class="w-4 h-4 sm:w-5 sm:h-5" />
              {{ langStore.t('location.getDirections') }}
            </a>
          </div>

          <!-- Hours Card -->
          <div class="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800/80 hover:border-emerald-500/30 transition-colors shadow-2xl">
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-2">
              <Clock class="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              {{ langStore.t('location.hoursHeader') }}
            </h3>
            
            <ul class="space-y-4">
              <li class="flex items-center justify-between text-xs sm:text-sm">
                <span class="text-slate-300 font-medium">{{ langStore.isKhmer ? 'ចន្ទ - អាទិត្យ' : 'Monday - Sunday' }}</span>
                <span class="text-white font-semibold bg-slate-900 px-2.5 py-1 sm:px-3 rounded-lg border border-slate-800">8:00 AM - 8:30 PM</span>
              </li>
            </ul>
            
            <div class="mt-5 sm:mt-6 flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CalendarDays class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p class="text-xs text-emerald-200/80 leading-relaxed">
                {{ langStore.isKhmer ? 'សេវាជួសជុលដាក់ស្នើក្រោយម៉ោង ៧:០០ យប់ នឹងត្រូវត្រួតពិនិត្យនៅថ្ងៃបន្ទាប់' : 'Repairs submitted after 7:00 PM will be processed on the following business day.' }}
              </p>
            </div>
          </div>

        </div>

        <!-- Right Column: Visuals / Map -->
        <div class="lg:col-span-7 space-y-6 sm:space-y-8">
          <!-- Store Image -->
          <div class="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative h-[260px] sm:h-[400px] group">
            <img 
              src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80" 
              alt="G-Zen Store Interior"
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 mb-2 sm:mb-3 text-[11px] sm:text-xs font-bold text-white">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {{ langStore.t('location.openNow') }}
              </div>
              <h2 class="text-xl sm:text-3xl font-black text-white">{{ langStore.t('location.showroomTitle') }}</h2>
              <p class="text-slate-300 mt-1 sm:mt-2 text-xs sm:text-base max-w-md line-clamp-2 sm:line-clamp-none">{{ langStore.t('location.showroomDesc') }}</p>
            </div>
          </div>
          
          <!-- Stylized Map Placeholder -->
          <div class="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative h-[220px] sm:h-[320px] bg-slate-900 group cursor-pointer flex items-center justify-center" @click="openMap">
            <!-- Simulated Map Texture -->
            <div class="absolute inset-0 opacity-20" style="background-image: url('https://www.transparenttextures.com/patterns/cubes.png');"></div>
            <div class="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 to-slate-900"></div>
            
            <div class="relative z-10 text-center flex flex-col items-center p-4">
              <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-3 sm:mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:scale-110 group-hover:rotate-12 transition-all">
                <MapPin class="w-6 h-6 sm:w-8 sm:h-8 text-slate-950" />
              </div>
              <h3 class="text-lg sm:text-xl font-bold text-white">{{ langStore.t('location.viewOnGoogleMaps') }}</h3>
              <p class="text-slate-400 text-xs sm:text-sm mt-1 flex items-center justify-center gap-1 group-hover:text-emerald-400 transition-colors">
                {{ langStore.t('location.openInteractiveMap') }} <ExternalLink class="w-3 h-3" />
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  </main>
</template>
