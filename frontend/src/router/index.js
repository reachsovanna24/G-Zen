import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const routes = [
  // ==========================================
  // CUSTOMER STOREFRONT & PORTAL ROUTES (ROOT: /)
  // ==========================================
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('../views/ShopView.vue'),
  },
  {
    path: '/location',
    name: 'Location',
    component: () => import('../views/LocationView.vue'),
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/FavoritesView.vue'),
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetailView.vue'),
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/ServicesView.vue'),
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/CheckoutView.vue'),
  },
  {
    path: '/order-success/:orderNumber',
    name: 'OrderSuccess',
    component: () => import('../views/OrderSuccessView.vue'),
  },
  {
    path: '/my-orders',
    name: 'MyOrders',
    component: () => import('../views/MyOrdersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customer/orders',
    name: 'CustomerOrders',
    component: () => import('../views/MyOrdersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customer/favorites',
    name: 'CustomerFavorites',
    component: () => import('../views/FavoritesView.vue'),
  },
  {
    path: '/login',
    name: 'CustomerLogin',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'CustomerRegister',
    component: () => import('../views/RegisterView.vue'),
  },

  // ==========================================
  // SECURE ADMINISTRATOR PORTAL ROUTES (ROOT: /admin-portal)
  // ==========================================
  {
    path: '/admin-portal',
    name: 'AdminPortal',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin-portal/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLoginView.vue'),
  },

  // Aliases for compatibility & clean redirects
  {
    path: '/admin',
    redirect: '/admin-portal',
  },
  {
    path: '/admin/login',
    redirect: '/admin-portal/login',
  },

  // Catch-all 404 handler
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  },
});

// Strict Route Guards: Complete separation of Customer and Admin roots
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAdminRoot = to.path.startsWith('/admin-portal') || to.path.startsWith('/admin');
  const isAdminLogin = to.path === '/admin-portal/login' || to.path === '/admin/login';

  // 1. If accessing dedicated Admin Login:
  if (isAdminLogin) {
    if (authStore.isAuthenticated && authStore.isAdmin) {
      return next({ path: '/admin-portal' });
    }
    return next();
  }

  // 2. If accessing any Admin protected route:
  if (to.meta.requiresAdmin || (isAdminRoot && !isAdminLogin)) {
    if (!authStore.isAuthenticated) {
      // Direct unauthorized visitors strictly to dedicated Admin Login gateway
      return next({ path: '/admin-portal/login', query: { redirect: to.fullPath } });
    }
    if (!authStore.isAdmin) {
      // Logged in as regular customer -> strictly forbidden, redirect to customer home
      return next({ path: '/' });
    }
    return next();
  }

  // 3. Customer protected routes (e.g. /my-orders, /customer/orders):
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  next();
});

export default router;
