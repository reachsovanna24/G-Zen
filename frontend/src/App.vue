<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import { useProductStore } from './stores/productStore';
import { useThemeStore } from './stores/themeStore';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import CartDrawer from './components/CartDrawer.vue';
import QuickViewModal from './components/QuickViewModal.vue';
import TelegramButton from './components/TelegramButton.vue';

const route = useRoute();
const authStore = useAuthStore();
const productStore = useProductStore();
const themeStore = useThemeStore();

const isAdminRoute = computed(() => route.path.startsWith('/admin') || route.path.startsWith('/admin-portal'));

onMounted(async () => {
  await authStore.checkAuth();
  await productStore.fetchProducts();
});
</script>

<template>
  <!-- Dedicated Admin Layout: No customer navbar, footer, cart, or telegram -->
  <div v-if="isAdminRoute" class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
    <router-view />
  </div>

  <!-- Standard Customer Storefront Layout -->
  <div v-else class="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
    <!-- Customer Navigation Bar -->
    <Navbar />

    <!-- Main Dynamic Route View -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Customer Cart Drawer -->
    <CartDrawer />

    <!-- Global Quick View Modal -->
    <QuickViewModal />

    <!-- Floating Telegram Support Button -->
    <TelegramButton />

    <!-- Customer Footer -->
    <Footer />
  </div>
</template>
