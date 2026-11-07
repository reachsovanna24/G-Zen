<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useLanguageStore } from '../stores/languageStore';
import LanguageThemeMenu from './LanguageThemeMenu.vue';
import { 
  ShoppingBag, 
  X, 
  ShieldCheck, 
  Smartphone, 
  MapPin, 
  LogOut, 
  Package, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  User as UserIcon, 
  Heart,
  Home,
  Wrench,
  Send,
  Phone,
  ArrowRight
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const settingsStore = useSettingsStore();
const wishlistStore = useWishlistStore();
const langStore = useLanguageStore();

const isMobileMenuOpen = ref(false);
const isUserDropdownOpen = ref(false);

const navLinks = computed(() => [
  { name: langStore.t('nav.home'), path: '/' },
  { name: langStore.t('nav.shop'), path: '/shop' },
  { name: langStore.t('nav.services'), path: '/services' },
]);

// Rich navigation items for the modern mobile drawer
const mobileNavItems = computed(() => [
  {
    name: langStore.t('nav.home'),
    desc: langStore.isKhmer ? 'ទំព័រដើម & ផលិតផលពេញនិយម' : 'Home & Featured Devices',
    path: '/',
    icon: Home,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    name: langStore.t('nav.shop'),
    desc: langStore.isKhmer ? 'ស្មាតហ្វូន ថេបប្លេត & គ្រឿងបន្លាស់' : 'Flagship Phones, iPads & MacBooks',
    path: '/shop',
    icon: ShoppingBag,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    name: langStore.t('nav.services'),
    desc: langStore.isKhmer ? 'សេវាជួសជុល ប្តូរអេក្រង់ & ថ្ម' : 'Screen, Battery & Diagnostics',
    path: '/services',
    icon: Wrench,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    name: langStore.t('nav.location'),
    desc: langStore.isKhmer ? 'បឹងកេងកង១ រាជធានីភ្នំពេញ' : 'BKK1 Flagship Store, Phnom Penh',
    path: '/location',
    icon: MapPin,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  {
    name: langStore.t('nav.myOrders'),
    desc: langStore.isKhmer ? 'តាមដានការដឹកជញ្ជូន & វិក្កយបត្រ' : 'Track Orders & KHQR Invoices',
    path: '/my-orders',
    icon: Package,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
  },
  {
    name: langStore.t('favorites.title'),
    desc: langStore.isKhmer ? 'ទំនិញដែលបានរក្សាទុក' : 'Saved Devices Wishlist',
    path: '/favorites',
    icon: Heart,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    badge: wishlistStore.count > 0 ? wishlistStore.count : null
  }
]);

const handleLogout = () => {
  authStore.logout();
  isUserDropdownOpen.value = false;
  isMobileMenuOpen.value = false;
  router.push('/');
};

const goToLocation = () => {
  router.push('/location');
  isMobileMenuOpen.value = false;
};

// Auto-close drawer on route change
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

// Lock body scroll when mobile drawer is open to prevent page scrolling behind blur
watch(isMobileMenuOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
});

const handleKeydown = (e) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
};

onMounted(() => {
  settingsStore.fetchSettings();
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80">
    <!-- Top Announcement Bar (Live from Admin Settings) - HIDDEN ON MOBILE VIEW -->
    <div 
      v-if="settingsStore.settings.announcementActive" 
      class="hidden md:flex bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-900/40 text-xs py-1.5 px-4 text-center text-emerald-300 font-medium items-center justify-center gap-2"
    >
      <span class="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[11px] font-semibold">
        <Sparkles class="w-3 h-3" /> Phnom Penh Store
      </span>
      <span>{{ settingsStore.settings.announcementText }}</span>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Brand Logo -->
        <router-link to="/" class="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
            <Smartphone class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">G-ZEN</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div class="hidden sm:flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              <span>{{ langStore.t('nav.storePhone') }}</span>
              <span class="text-slate-600">•</span>
              <span class="text-slate-400">{{ langStore.t('nav.phnomPenh') }}</span>
            </div>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path"
            class="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="route.path === link.path ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'"
          >
            {{ link.name }}
          </router-link>

          <button 
            @click="goToLocation"
            class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            :class="route.path === '/location' ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40' : ''"
          >
            <MapPin class="w-4 h-4 text-emerald-400" />
            <span>{{ langStore.t('nav.location') }}</span>
          </button>
        </nav>

        <!-- Right Action Center -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Wishlist Button -->
          <router-link 
            to="/favorites"
            class="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            :title="langStore.t('favorites.title')"
          >
            <Heart class="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            <span 
              v-if="wishlistStore.count > 0"
              class="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center shadow-lg animate-pulse"
            >
              {{ wishlistStore.count }}
            </span>
          </router-link>

          <!-- Cart Button -->
          <button 
            @click="cartStore.toggleCart"
            class="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            :title="langStore.t('cart.title')"
          >
            <ShoppingBag class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span 
              v-if="cartStore.cartCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] sm:text-xs flex items-center justify-center shadow-glow"
            >
              {{ cartStore.cartCount }}
            </span>
          </button>

          <!-- User Account Actions & Language / Theme Menu -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <div class="relative">
              <!-- Authenticated State -->
              <template v-if="authStore.isAuthenticated">
                <button 
                  @click="isUserDropdownOpen = !isUserDropdownOpen"
                  class="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-sm font-medium text-slate-200 transition-colors"
                >
                  <div 
                    class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    :class="authStore.isAdmin ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'"
                  >
                    {{ authStore.userName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="hidden md:inline max-w-[110px] truncate">{{ authStore.userName }}</span>
                  <ChevronDown class="w-4 h-4 text-slate-400 hidden sm:inline" />
                </button>

                <!-- Dropdown Menu -->
                <div 
                  v-if="isUserDropdownOpen"
                  @click="isUserDropdownOpen = false"
                  class="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 border border-slate-800"
                >
                  <div class="px-3 py-2.5 border-b border-slate-800 mb-1">
                    <div class="font-bold text-sm text-slate-100 truncate">{{ authStore.userName }}</div>
                    <div class="text-xs text-slate-400 truncate">{{ authStore.user?.email }}</div>
                    <span 
                      v-if="authStore.isAdmin"
                      class="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800"
                    >
                      {{ langStore.isKhmer ? 'អ្នកគ្រប់គ្រងហាង' : 'Store Admin' }}
                    </span>
                  </div>

                  <!-- ONLY VISIBLE TO AUTHENTICATED ADMINS -->
                  <router-link 
                    v-if="authStore.isAdmin" 
                    to="/admin-portal" 
                    class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-indigo-950/60 transition-colors"
                  >
                    <ShieldCheck class="w-4 h-4" />
                    <span>{{ langStore.t('nav.adminDashboard') }}</span>
                  </router-link>

                  <router-link 
                    to="/my-orders" 
                    class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 transition-colors"
                  >
                    <Package class="w-4 h-4 text-emerald-400" />
                    <span>{{ langStore.t('nav.myOrders') }}</span>
                  </router-link>

                  <button 
                    @click="handleLogout"
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-950/40 text-left mt-1 transition-colors cursor-pointer"
                  >
                    <LogOut class="w-4 h-4" />
                    <span>{{ langStore.t('nav.signOut') }}</span>
                  </button>
                </div>
              </template>

              <!-- Guest State: Sign In & Register Buttons -->
              <template v-else>
                <div class="hidden sm:flex items-center gap-1.5 sm:gap-2">
                  <router-link 
                    to="/login"
                    class="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                  >
                    {{ langStore.t('nav.signIn') }}
                  </router-link>
                  <router-link 
                    to="/register"
                    class="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow transition-all duration-200"
                  >
                    {{ langStore.t('nav.register') }}
                  </router-link>
                </div>
              </template>
            </div>

            <!-- Unified Dropdown: Language & Theme Switcher (Vertical Menu) -->
            <div class="flex items-center pl-1 sm:pl-2 border-l border-slate-800/80">
              <LanguageThemeMenu />
            </div>
          </div>

          <!-- ICONIC & POLISHED ANIMATED HAMBURGER BUTTON -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            aria-label="Toggle Navigation Menu"
            class="md:hidden relative w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center gap-1.5 text-slate-200 hover:text-emerald-400 hover:border-emerald-500/50 active:scale-95 transition-all shadow-sm cursor-pointer z-50 focus:outline-none"
            :class="{ 'border-emerald-500/60 bg-emerald-950/40 text-emerald-400 ring-2 ring-emerald-500/20': isMobileMenuOpen }"
          >
            <span 
              class="w-5 h-0.5 rounded-full bg-current transition-all duration-300 transform origin-center"
              :class="{ 'rotate-45 translate-y-2': isMobileMenuOpen }"
            ></span>
            <span 
              class="w-3.5 h-0.5 rounded-full bg-current transition-all duration-200 self-end mr-2.5"
              :class="{ 'opacity-0 scale-x-0': isMobileMenuOpen }"
            ></span>
            <span 
              class="w-5 h-0.5 rounded-full bg-current transition-all duration-300 transform origin-center"
              :class="{ '-rotate-45 -translate-y-2': isMobileMenuOpen }"
            ></span>
          </button>
        </div>
      </div>
    </div>

    <!-- TELEPORTED MOBILE RIGHT-TO-LEFT SLIDE DRAWER WITH BLURRED BACKDROP -->
    <Teleport to="body">
      <!-- Backdrop with deep glass blur ("order blur") -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="isMobileMenuOpen" 
          class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 md:hidden mobile-drawer-backdrop"
          @click="isMobileMenuOpen = false"
        ></div>
      </Transition>

      <!-- Right-to-Left Slide-in Drawer Panel -->
      <Transition
        enter-active-class="transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-250 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <aside 
          v-if="isMobileMenuOpen" 
          class="fixed inset-y-0 right-0 w-[86vw] max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col md:hidden text-slate-100 mobile-drawer-panel"
        >
          <!-- Drawer Top Header -->
          <div class="p-4 sm:p-5 border-b border-slate-800/90 flex items-center justify-between shrink-0">
            <router-link to="/" @click="isMobileMenuOpen = false" class="flex items-center gap-2.5 group">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-glow">
                <Smartphone class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-lg font-black tracking-tight text-white">G-ZEN</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div class="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  {{ langStore.t('nav.phnomPenh') }}
                </div>
              </div>
            </router-link>

            <button 
              @click="isMobileMenuOpen = false"
              aria-label="Close menu"
              class="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Drawer Body: Scrollable -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <!-- Mobile Switchers: Language & Theme -->
            <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-200">{{ langStore.isKhmer ? 'ភាសា & ស្បែកផ្ទៃ' : 'Language & Theme' }}</div>
                  <div class="text-[10px] text-slate-400">{{ langStore.isKhmer ? 'ប្តូរភាសា / ពន្លឺ' : 'Bilingual & Light / Dark' }}</div>
                </div>
              </div>
              <LanguageThemeMenu :compact-on-mobile="false" />
            </div>

            <!-- Navigation Links (Rich Tile Cards) -->
            <div class="space-y-1.5">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
                {{ langStore.isKhmer ? 'ម៉ឺនុយរុករក' : 'Explore Store' }}
              </div>

              <router-link
                v-for="item in mobileNavItems"
                :key="item.path"
                :to="item.path"
                @click="isMobileMenuOpen = false"
                class="flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 group border"
                :class="route.path === item.path 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold shadow-sm' 
                  : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/60 text-slate-200'"
              >
                <div class="flex items-center gap-3">
                  <div 
                    class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                    :class="item.color"
                  >
                    <component :is="item.icon" class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-bold flex items-center gap-2">
                      <span>{{ item.name }}</span>
                      <span 
                        v-if="item.badge" 
                        class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white"
                      >
                        {{ item.badge }}
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-400">{{ item.desc }}</div>
                  </div>
                </div>
                <ChevronRight 
                  class="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all"
                  :class="{ 'text-emerald-400 translate-x-0.5': route.path === item.path }" 
                />
              </router-link>
            </div>

            <!-- Fast Contact & Telegram Direct Link -->
            <div class="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 space-y-2.5">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {{ langStore.isKhmer ? 'ជំនួយ & ទំនាក់ទំនងរហ័ស' : 'Fast Support & Hotline' }}
              </div>
              
              <a 
                href="https://t.me/Lee_min_roth" 
                target="_blank"
                class="flex items-center justify-between p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-colors"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <Send class="w-4 h-4 -rotate-45 -translate-y-0.5" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-100">Telegram @Lee_min_roth</div>
                    <div class="text-[10px] text-sky-300">{{ langStore.isKhmer ? 'ឆ្លើយតបភ្លាមៗ ២៤/៧' : 'Instant 24/7 Live Chat' }}</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-sky-400/70" />
              </a>

              <a 
                href="tel:+85523888999"
                class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-100">+855 (0) 23 888 999</div>
                    <div class="text-[10px] text-slate-400">{{ langStore.isKhmer ? 'ហាងភ្នំពេញ ៨:០០ ព្រឹក - ៨:៣០ យប់' : 'PP Store 8:00 AM - 8:30 PM' }}</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-slate-500" />
              </a>
            </div>

            <!-- User Authentication / Profile Section -->
            <div v-if="authStore.isAuthenticated" class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div 
                    class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                    :class="authStore.isAdmin ? 'bg-indigo-600' : 'bg-emerald-500 text-slate-950'"
                  >
                    {{ authStore.userName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-xs text-white truncate max-w-[170px]">{{ authStore.userName }}</div>
                    <div class="text-[10px] text-slate-400 truncate max-w-[170px]">{{ authStore.user?.email }}</div>
                  </div>
                </div>
                <span 
                  v-if="authStore.isAdmin"
                  class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800 shrink-0"
                >
                  Admin
                </span>
              </div>

              <div class="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <router-link 
                  v-if="authStore.isAdmin"
                  to="/admin-portal" 
                  @click="isMobileMenuOpen = false"
                  class="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck class="w-3.5 h-3.5" />
                  <span>Admin Hub</span>
                </router-link>

                <button 
                  @click="handleLogout"
                  class="flex-1 py-2 px-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-950/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>{{ langStore.t('nav.signOut') }}</span>
                </button>
              </div>
            </div>

            <!-- Guest Sign In / Register -->
            <div v-else class="space-y-2 pt-1">
              <div class="grid grid-cols-2 gap-2">
                <router-link
                  to="/login"
                  @click="isMobileMenuOpen = false"
                  class="py-2.5 px-3 rounded-xl text-center text-xs font-bold text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {{ langStore.t('nav.signIn') }}
                </router-link>
                <router-link
                  to="/register"
                  @click="isMobileMenuOpen = false"
                  class="py-2.5 px-3 rounded-xl text-center text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-glow transition-all"
                >
                  {{ langStore.t('nav.register') }}
                </router-link>
              </div>
            </div>

            <!-- Bottom Store Credential -->
            <div class="pt-2 text-center text-[10px] text-slate-500">
              ⚡ 1-Hour Delivery • Bakong KHQR • 1-Year Warranty
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>