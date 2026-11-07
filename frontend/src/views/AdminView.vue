<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useProductStore } from '../stores/productStore';
import { useLanguageStore } from '../stores/languageStore';
import LanguageThemeMenu from '../components/LanguageThemeMenu.vue';
import api from '../services/api';
import { 
  ShieldCheck, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Wrench, 
  Users, 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  ExternalLink, 
  Lock, 
  TrendingUp, 
  ArrowUpRight, 
  Download, 
  LogOut, 
  Store, 
  Check, 
  Phone, 
  MapPin, 
  FileText, 
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  UploadCloud,
  FolderOpen
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const productStore = useProductStore();
const langStore = useLanguageStore();

// Active Sidebar Navigation Tab
const currentTab = ref('overview'); // 'overview', 'products', 'orders', 'repairs', 'users', 'database'

// Data states
const orders = ref([]);
const repairs = ref([]);
const users = ref([]);
const loading = ref(false);
const error = ref('');

// Product Management States
const productSearch = ref('');
const productCategory = ref('All');
const productStock = ref('all');
const isProductModalOpen = ref(false);
const isEditingProduct = ref(false);
const currentEditingProductId = ref(null);
const productModalError = ref('');
const isSavingProduct = ref(false);

const productForm = ref({
  name: '',
  category: 'Smartphones',
  price: 999,
  originalPrice: 1099,
  stock: 15,
  image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
  brand: 'Apple',
  description: 'Official flagship smartphone with 1 Year Official Warranty in Cambodia.',
  specs: {
    display: '6.9" Super Retina XDR OLED',
    processor: 'Apple A18 Pro',
    storage: '256GB',
    color: 'Titanium',
  },
  isFeatured: false,
  warranty: '1 Year Official Warranty (Cambodia)',
});

// Image Presets for rapid admin product creation
const imagePresets = [
  { label: 'iPhone 16 Pro', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80' },
  { label: 'Samsung S25', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80' },
  { label: 'iPad Pro', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80' },
  { label: 'MacBook Pro', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { label: 'AirPods Pro', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80' },
  { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
];

// Product Image Upload States (Folder & Device uploads)
const imageSourceType = ref('device'); // 'device' | 'url'
const isUploadingImage = ref(false);
const uploadedFileName = ref('');
const uploadError = ref('');
const fileInputRef = ref(null);
const isDraggingOver = ref(false);

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleImageFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    uploadError.value = langStore.isKhmer ? 'សូមជ្រើសរើសឯកសាររូបភាពត្រឹមត្រូវ (PNG, JPG, WEBP)' : 'Please select a valid image file (PNG, JPG, WEBP).';
    return;
  }

  uploadError.value = '';
  isUploadingImage.value = true;
  uploadedFileName.value = file.name;

  try {
    const base64 = await readFileAsBase64(file);
    // Instant local preview
    productForm.value.image = base64;

    // Upload to server storage
    const res = await api.post('/upload', {
      base64,
      filename: file.name,
    });

    if (res.success && res.url) {
      productForm.value.image = res.url;
    }
  } catch (err) {
    console.error('Image upload failed:', err);
    // Preserves base64 preview even if server fails
  } finally {
    isUploadingImage.value = false;
    if (event.target) event.target.value = '';
  }
};

const handleDrop = (e) => {
  isDraggingOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    handleImageFileUpload({ target: { files: [file] } });
  }
};

// Order Management States
const orderSearch = ref('');
const orderFilter = ref('All');
const selectedOrder = ref(null);

// Repair Management States
const repairSearch = ref('');
const repairFilter = ref('All');
const isRepairModalOpen = ref(false);
const selectedRepair = ref(null);
const repairForm = ref({
  status: 'Received',
  technicianNotes: '',
  estimatedPrice: 0,
});

// User Management States
const userSearch = ref('');

// Fetch All Enterprise Data
const fetchAdminData = async () => {
  if (!authStore.isAdmin) return;
  loading.value = true;
  error.value = '';

  try {
    const [ordersRes, repairsRes, usersRes] = await Promise.all([
      api.get('/orders/admin/all'),
      api.get('/repairs/admin/all'),
      api.get('/auth/admin/users'),
      productStore.fetchProducts(),
    ]);

    if (ordersRes.success) orders.value = ordersRes.orders;
    if (repairsRes.success) repairs.value = repairsRes.bookings;
    if (usersRes.success) users.value = usersRes.users;
  } catch (err) {
    console.error('Fetch admin error:', err);
    error.value = err.message || 'Failed to load enterprise data.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.isAdmin) {
    fetchAdminData();
  }
});

// Analytics Calculations
const totalRevenue = computed(() => {
  return orders.value.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
});
const totalOrdersCount = computed(() => orders.value.length);
const totalInventoryValue = computed(() => {
  return productStore.products.reduce((acc, p) => acc + (p.price * p.stock), 0);
});
const lowStockCount = computed(() => productStore.products.filter(p => p.stock <= 5).length);
const activeRepairsCount = computed(() => repairs.value.filter(r => r.status !== 'Completed').length);

// Product Filtering
const filteredProducts = computed(() => {
  return productStore.products.filter(p => {
    const matchesSearch = !productSearch.value || 
      p.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.value.toLowerCase()));
    
    const matchesCategory = productCategory.value === 'All' || p.category === productCategory.value;
    
    let matchesStock = true;
    if (productStock.value === 'low') matchesStock = p.stock > 0 && p.stock <= 5;
    else if (productStock.value === 'out') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });
});

// Order Filtering
const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const q = orderSearch.value.toLowerCase().trim();
    const matchesQuery = !q || 
      o.orderNumber.toLowerCase().includes(q) ||
      (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(q)) ||
      (o.shippingAddress?.phone && o.shippingAddress.phone.includes(q));

    const matchesStatus = orderFilter.value === 'All' || o.status === orderFilter.value;
    return matchesQuery && matchesStatus;
  });
});

// Repair Filtering
const filteredRepairs = computed(() => {
  return repairs.value.filter(r => {
    const q = repairSearch.value.toLowerCase().trim();
    const matchesQuery = !q || 
      r.ticketNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.deviceModel.toLowerCase().includes(q);

    const matchesStatus = repairFilter.value === 'All' || r.status === repairFilter.value;
    return matchesQuery && matchesStatus;
  });
});

// User Filtering
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const q = userSearch.value.toLowerCase().trim();
    return !q || 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q));
  });
});

// Actions: Products
const adjustStock = async (product, delta) => {
  const newStock = Math.max(0, product.stock + delta);
  try {
    const res = await api.put(`/products/${product.id}`, { stock: newStock });
    if (res.success) {
      product.stock = newStock;
    }
  } catch (err) {
    alert('Stock update failed: ' + err.message);
  }
};

const openAddProductModal = () => {
  isEditingProduct.value = false;
  currentEditingProductId.value = null;
  productModalError.value = '';
  imageSourceType.value = 'device';
  uploadedFileName.value = '';
  uploadError.value = '';
  productForm.value = {
    name: '',
    category: 'Smartphones',
    price: 999,
    originalPrice: 1099,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    brand: 'Apple',
    description: 'Official flagship smartphone with 1 Year Official Warranty in Cambodia.',
    specs: {
      display: '6.9" Super Retina XDR OLED',
      processor: 'Apple A18 Pro 3nm',
      storage: '256GB',
      color: 'Titanium',
    },
    isFeatured: false,
    warranty: '1 Year Official Warranty (Cambodia)',
  };
  isProductModalOpen.value = true;
};

const openEditProductModal = (product) => {
  isEditingProduct.value = true;
  currentEditingProductId.value = product.id;
  productModalError.value = '';
  if (product.image && (product.image.startsWith('/uploads/') || product.image.startsWith('data:'))) {
    imageSourceType.value = 'device';
  } else {
    imageSourceType.value = 'url';
  }
  uploadedFileName.value = '';
  uploadError.value = '';
  productForm.value = {
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice || 0,
    stock: product.stock,
    image: product.image,
    brand: product.brand || 'Tech',
    description: product.description || '',
    specs: product.specs && typeof product.specs === 'object' ? { ...product.specs } : {
      display: 'OLED Display',
      processor: 'Processor',
      storage: '256GB',
      color: 'Standard',
    },
    isFeatured: !!product.isFeatured,
    warranty: product.warranty || '1 Year Official Warranty (Cambodia)',
  };
  isProductModalOpen.value = true;
};

const saveProduct = async () => {
  productModalError.value = '';
  if (!productForm.value.name.trim() || !productForm.value.price || productForm.value.stock === undefined) {
    productModalError.value = 'Please provide product title, price, and stock count.';
    return;
  }

  isSavingProduct.value = true;
  try {
    if (isEditingProduct.value) {
      await productStore.updateProduct(currentEditingProductId.value, productForm.value);
    } else {
      await productStore.createProduct(productForm.value);
    }
    isProductModalOpen.value = false;
  } catch (err) {
    productModalError.value = err.message || 'Failed to save product.';
  } finally {
    isSavingProduct.value = false;
  }
};

const deleteProduct = async (id, name) => {
  if (confirm(`Are you sure you want to permanently delete "${name}" from store catalog?`)) {
    try {
      await productStore.deleteProduct(id);
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  }
};

// Actions: Orders
const updateOrderStatus = async (order, newStatus) => {
  try {
    const res = await api.put(`/orders/admin/${order.id}/status`, { status: newStatus });
    if (res.success) {
      order.status = newStatus;
    }
  } catch (err) {
    alert('Failed to update order status: ' + err.message);
  }
};

const updatePaymentStatus = async (order, newPaymentStatus) => {
  try {
    const res = await api.put(`/orders/admin/${order.id}/status`, { paymentStatus: newPaymentStatus });
    if (res.success) {
      order.paymentStatus = newPaymentStatus;
    }
  } catch (err) {
    alert('Failed to update payment status: ' + err.message);
  }
};

const verifyingOrderId = ref(null);

const verifyBakongSettlement = async (order) => {
  verifyingOrderId.value = order.id;
  try {
    const res = await api.get(`/orders/verify-payment/${order.id}`);
    if (res.paid) {
      order.paymentStatus = 'Paid';
      if (res.order?.transactionRef) order.transactionRef = res.order.transactionRef;
      alert(`✅ Settlement Confirmed on NBC Ledger!\nOrder #${order.orderNumber}\nAmount: $${order.totalAmount}\nRef: ${order.transactionRef || res.settlement?.hash || 'Confirmed'}`);
    } else {
      alert(`⏳ Pending Payment on NBC Ledger: ${res.message || 'Waiting for customer transfer...'}`);
    }
  } catch (err) {
    alert('Failed to check settlement: ' + err.message);
  } finally {
    verifyingOrderId.value = null;
  }
};

const deleteOrder = async (id, orderNumber) => {
  if (confirm(`Are you sure you want to cancel and delete order #${orderNumber}?`)) {
    try {
      const res = await api.delete(`/orders/admin/${id}`);
      if (res.success) {
        orders.value = orders.value.filter(o => o.id !== id);
      }
    } catch (err) {
      alert('Delete order failed: ' + err.message);
    }
  }
};

// Actions: Repairs
const openRepairModal = (repair) => {
  selectedRepair.value = repair;
  repairForm.value = {
    status: repair.status,
    technicianNotes: repair.technicianNotes || '',
    estimatedPrice: repair.estimatedPrice || 0,
  };
  isRepairModalOpen.value = true;
};

const saveRepairStatus = async () => {
  if (!selectedRepair.value) return;
  try {
    const res = await api.put(`/repairs/admin/${selectedRepair.value.id}/status`, repairForm.value);
    if (res.success) {
      selectedRepair.value.status = repairForm.value.status;
      selectedRepair.value.technicianNotes = repairForm.value.technicianNotes;
      selectedRepair.value.estimatedPrice = repairForm.value.estimatedPrice;
      isRepairModalOpen.value = false;
    }
  } catch (err) {
    alert('Failed to update repair status: ' + err.message);
  }
};

const deleteRepairTicket = async (id, ticketNumber) => {
  if (confirm(`Are you sure you want to purge repair ticket #${ticketNumber}?`)) {
    try {
      const res = await api.delete(`/repairs/admin/${id}`);
      if (res.success) {
        repairs.value = repairs.value.filter(r => r.id !== id);
      }
    } catch (err) {
      alert('Failed to delete ticket: ' + err.message);
    }
  }
};

// Actions: User Management
const toggleUserRole = async (user) => {
  const newRole = user.role === 'admin' ? 'customer' : 'admin';
  if (confirm(`Change role for ${user.email} to "${newRole}"?`)) {
    try {
      const res = await api.put(`/auth/admin/users/${user.id}/role`, { role: newRole });
      if (res.success) {
        user.role = newRole;
      }
    } catch (err) {
      alert('Role change failed: ' + err.message);
    }
  }
};

const deleteUserAccount = async (id, email) => {
  if (confirm(`Permanently remove customer account "${email}"?`)) {
    try {
      const res = await api.delete(`/auth/admin/users/${id}`);
      if (res.success) {
        users.value = users.value.filter(u => u.id !== id);
      }
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  }
};

// Actions: Data Exports
const exportProductsJSON = () => {
  const blob = new Blob([JSON.stringify(productStore.products, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gzen-products-${Date.now()}.json`;
  a.click();
};

const exportOrdersCSV = () => {
  const rows = [
    ['Order Number', 'Date', 'Customer Name', 'Phone', 'District', 'Total (USD)', 'Payment Method', 'Payment Status', 'Fulfillment Status'],
    ...orders.value.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.shippingAddress?.fullName || ''}"`,
      `"${o.shippingAddress?.phone || ''}"`,
      `"${o.shippingAddress?.district || ''}"`,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.status
    ])
  ];
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `gzen-orders-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Supabase Cloud Connection & Sync
const supabaseStatus = ref(null);
const isTestingSupabase = ref(false);

const testSupabaseConnection = async () => {
  isTestingSupabase.value = true;
  try {
    const res = await api.get('/supabase/status');
    supabaseStatus.value = res;
  } catch (err) {
    supabaseStatus.value = {
      success: false,
      message: err.message,
    };
  } finally {
    isTestingSupabase.value = false;
  }
};

const isSyncingSupabase = ref(false);
const syncSupabaseMessage = ref('');

const syncAllToSupabase = async () => {
  isSyncingSupabase.value = true;
  syncSupabaseMessage.value = '';
  try {
    const res = await api.post('/supabase/sync-all');
    syncSupabaseMessage.value = res.message || 'All records successfully synced to Supabase!';
    testSupabaseConnection();
  } catch (err) {
    syncSupabaseMessage.value = 'Sync failed: ' + err.message;
  } finally {
    isSyncingSupabase.value = false;
  }
};

const handleSignOut = () => {
  authStore.logout();
  router.push('/admin-portal/login');
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
    <!-- ACCESS DENIED STATE (IF VISITOR IS NOT ADMIN) -->
    <div v-if="!authStore.isAdmin" class="flex-1 flex items-center justify-center p-6">
      <div class="glass-panel p-10 text-center rounded-3xl border border-red-900/60 max-w-md space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-glow">
          <Lock class="w-8 h-8" />
        </div>
        <h2 class="text-xl font-bold text-white">{{ langStore.t('admin.staffClearanceRequired') }}</h2>
        <p class="text-xs text-slate-400 leading-relaxed">
          {{ langStore.t('admin.staffClearanceDesc') }}
        </p>
        <router-link 
          to="/admin-portal/login"
          class="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg"
        >
          {{ langStore.t('admin.authenticateStaff') }}
        </router-link>
      </div>
    </div>

    <!-- DEDICATED ADMIN BACK-OFFICE LAYOUT -->
    <div v-else class="flex-1 flex flex-col md:flex-row min-h-screen">
      <!-- SIDEBAR -->
      <aside class="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4 space-y-6">
        <div class="space-y-6">
          <!-- Back Office Header -->
          <div class="flex items-center gap-3 px-2 pt-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-800 flex items-center justify-center text-white shadow-md">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <div>
              <div class="font-black text-sm tracking-tight text-white">{{ langStore.t('admin.hubTitle') }}</div>
              <div class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{{ langStore.t('admin.hubSubtitle') }}</div>
            </div>
          </div>

          <!-- Staff Profile Card -->
          <div class="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <div class="text-[11px] text-slate-400 font-semibold">{{ langStore.t('admin.activeStaffMember') }}</div>
            <div class="font-bold text-xs text-white truncate">{{ authStore.userName }}</div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {{ langStore.t('admin.superAdmin') }}
              </span>
              <span class="text-[10px] text-emerald-400 font-semibold">{{ langStore.t('admin.online') }}</span>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="space-y-1 text-xs font-semibold">
            <button 
              @click="currentTab = 'overview'"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              :class="currentTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <TrendingUp class="w-4 h-4" />
              <span>{{ langStore.isKhmer ? '១. ទិដ្ឋភាពទូទៅ & ស្ថិតិ' : '1. Overview & Metrics' }}</span>
            </button>

            <button 
              @click="currentTab = 'products'"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              :class="currentTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center gap-3">
                <Package class="w-4 h-4" />
                <span>{{ langStore.isKhmer ? '២. កាតាឡុកទំនិញ' : '2. Product Catalog' }}</span>
              </div>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {{ productStore.products.length }}
              </span>
            </button>

            <button 
              @click="currentTab = 'orders'"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              :class="currentTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center gap-3">
                <ShoppingCart class="w-4 h-4" />
                <span>{{ langStore.isKhmer ? '៣. ការបញ្ជូនទំនិញ' : '3. Order Dispatch' }}</span>
              </div>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {{ orders.length }}
              </span>
            </button>

            <button 
              @click="currentTab = 'repairs'"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              :class="currentTab === 'repairs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center gap-3">
                <Wrench class="w-4 h-4" />
                <span>{{ langStore.isKhmer ? '៤. រោងជាងជួសជុល' : '4. Repair Workshop' }}</span>
              </div>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {{ repairs.length }}
              </span>
            </button>

            <button 
              @click="currentTab = 'users'"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              :class="currentTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center gap-3">
                <Users class="w-4 h-4" />
                <span>{{ langStore.isKhmer ? '៥. គណនីអតិថិជន' : '5. Customer Accounts' }}</span>
              </div>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {{ users.length }}
              </span>
            </button>

            <button 
              @click="currentTab = 'database'"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              :class="currentTab === 'database' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <Database class="w-4 h-4" />
              <span>{{ langStore.isKhmer ? '៦. ការតភ្ជាប់ & ទិន្នន័យ' : '6. Data & Exports' }}</span>
            </button>
          </nav>
        </div>

        <!-- Sidebar Footer Actions -->
        <div class="pt-4 border-t border-slate-800 space-y-2 text-xs font-semibold">
          <!-- Preferences Dropdown (Language & Theme) in Admin Sidebar -->
          <div class="p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <span class="text-[11px] text-slate-400 font-semibold">{{ langStore.isKhmer ? 'ភាសា & ស្បែកផ្ទៃ' : 'Language & Theme' }}</span>
            <LanguageThemeMenu />
          </div>

          <router-link 
            to="/" 
            target="_blank"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <div class="flex items-center gap-2">
              <Store class="w-4 h-4 text-emerald-400" />
              <span>{{ langStore.t('admin.openStorefront') }}</span>
            </div>
            <ExternalLink class="w-3.5 h-3.5 text-slate-500" />
          </router-link>

          <button 
            @click="handleSignOut"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 transition-colors text-left cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
            <span>{{ langStore.t('nav.signOut') }}</span>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT VIEW AREA -->
      <main class="flex-1 p-3.5 sm:p-6 md:p-10 overflow-y-auto space-y-6 sm:space-y-8">
        <!-- Top Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {{ currentTab === 'overview' ? langStore.t('admin.titleOverview') : '' }}
              {{ currentTab === 'products' ? langStore.t('admin.titleProducts') : '' }}
              {{ currentTab === 'orders' ? langStore.t('admin.titleOrders') : '' }}
              {{ currentTab === 'repairs' ? langStore.t('admin.titleRepairs') : '' }}
              {{ currentTab === 'users' ? langStore.t('admin.titleUsers') : '' }}
              {{ currentTab === 'database' ? langStore.t('admin.titleDatabase') : '' }}
            </h1>
            <p class="text-xs text-slate-400 mt-1">{{ langStore.t('admin.storeSubtitle') }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button 
              @click="fetchAdminData"
              class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
              <span>{{ langStore.t('admin.syncRecords') }}</span>
            </button>

            <button 
              v-if="currentTab === 'products'"
              @click="openAddProductModal"
              class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus class="w-4 h-4" />
              <span>{{ langStore.t('admin.addNewProduct') }}</span>
            </button>
          </div>
        </div>

        <!-- 1. OVERVIEW TAB -->
        <div v-if="currentTab === 'overview'" class="space-y-8">
          <!-- Stat Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{{ langStore.t('admin.grossSales') }}</span>
                <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><DollarSign class="w-4 h-4" /></div>
              </div>
              <div class="text-3xl font-black text-white">${{ totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</div>
              <div class="text-[11px] text-emerald-400 font-semibold">{{ langStore.t('admin.phnomPenhDeliveries') }}</div>
            </div>

            <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{{ langStore.t('admin.ordersFulfilled') }}</span>
                <div class="p-2 rounded-xl bg-blue-500/10 text-blue-400"><ShoppingCart class="w-4 h-4" /></div>
              </div>
              <div class="text-3xl font-black text-white">{{ totalOrdersCount }}</div>
              <div class="text-[11px] text-slate-400">KHQR, ABA & COD</div>
            </div>

            <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{{ langStore.t('admin.inventoryValuation') }}</span>
                <div class="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Package class="w-4 h-4" /></div>
              </div>
              <div class="text-3xl font-black text-white">${{ totalInventoryValue.toLocaleString() }}</div>
              <div class="text-[11px] text-purple-400 font-semibold">{{ productStore.products.length }} SKUs</div>
            </div>

            <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{{ langStore.t('admin.repairTickets') }}</span>
                <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Wrench class="w-4 h-4" /></div>
              </div>
              <div class="text-3xl font-black text-white">{{ activeRepairsCount }}</div>
              <div class="text-[11px] text-amber-400 font-semibold">{{ langStore.t('admin.inDiagnosis') }}</div>
            </div>
          </div>

          <!-- Recent Orders Preview -->
          <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">{{ langStore.t('admin.recentOrders') }}</h3>
              <button @click="currentTab = 'orders'" class="text-xs font-bold text-indigo-400 hover:underline cursor-pointer">
                {{ langStore.t('admin.viewAllOrders') }}
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left text-slate-300">
                <thead class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th class="p-3">{{ langStore.t('admin.orderCol') }}</th>
                    <th class="p-3">{{ langStore.t('admin.customerCol') }}</th>
                    <th class="p-3">{{ langStore.t('admin.districtCol') }}</th>
                    <th class="p-3">{{ langStore.t('admin.totalCol') }}</th>
                    <th class="p-3">{{ langStore.t('admin.paymentCol') }}</th>
                    <th class="p-3">{{ langStore.t('admin.statusCol') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <tr v-for="order in orders.slice(0, 5)" :key="order.id" class="hover:bg-slate-900/50">
                    <td class="p-3 font-mono font-bold text-emerald-400">{{ order.orderNumber }}</td>
                    <td class="p-3 font-semibold text-white">{{ order.shippingAddress?.fullName }}</td>
                    <td class="p-3 text-emerald-300">{{ order.shippingAddress?.district }}</td>
                    <td class="p-3 font-bold text-white">${{ order.totalAmount?.toLocaleString() }}</td>
                    <td class="p-3">{{ order.paymentMethod }}</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        :class="{
                          'bg-amber-950 text-amber-400': order.status === 'Pending',
                          'bg-purple-950 text-purple-400': order.status === 'QC Testing',
                          'bg-blue-950 text-blue-400': order.status === 'Out for Delivery',
                          'bg-emerald-950 text-emerald-400': order.status === 'Delivered',
                        }">
                        {{ langStore.isKhmer ? (order.status === 'Pending' ? langStore.t('orders.statusPending') : order.status === 'QC Testing' ? langStore.t('orders.statusQc') : order.status === 'Out for Delivery' ? langStore.t('orders.statusOut') : langStore.t('orders.statusDelivered')) : order.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 2. PRODUCT CATALOG CRUD TAB -->
        <div v-if="currentTab === 'products'" class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <!-- Filters Toolbar -->
          <div class="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div class="relative flex-1 max-w-md">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                v-model="productSearch"
                type="text" 
                :placeholder="langStore.t('admin.searchProducts')" 
                class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div class="flex items-center gap-2">
              <select v-model="productCategory" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                <option value="All">{{ langStore.t('admin.allCategories') }}</option>
                <option value="Smartphones">{{ langStore.t('common.smartphones') }}</option>
                <option value="Tablets">{{ langStore.t('common.tablets') }}</option>
                <option value="Laptops">{{ langStore.t('common.laptops') }}</option>
                <option value="Accessories">{{ langStore.t('common.accessories') }}</option>
              </select>

              <select v-model="productStock" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                <option value="all">{{ langStore.t('admin.allStock') }}</option>
                <option value="low">{{ langStore.t('admin.lowStockOption') }}</option>
                <option value="out">{{ langStore.t('admin.outStockOption') }}</option>
              </select>
            </div>
          </div>

          <!-- Product Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left text-slate-300">
              <thead class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th class="p-3.5">{{ langStore.t('admin.productTitle') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.category') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.price') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.stock') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.quickStock') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.flagship') }}</th>
                  <th class="p-3.5 text-right">{{ langStore.t('admin.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-slate-900/50">
                  <td class="p-3.5">
                    <div class="flex items-center gap-3">
                      <img :src="product.image" :alt="product.name" class="w-12 h-12 object-cover rounded-xl bg-slate-900 shrink-0 border border-slate-800" />
                      <div>
                        <div class="font-bold text-white text-sm line-clamp-1">{{ product.name }}</div>
                        <div class="text-[11px] text-slate-400">{{ product.brand }} • {{ product.warranty }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
                      {{ product.category }}
                    </span>
                  </td>
                  <td class="p-3.5">
                    <div class="font-extrabold text-emerald-400 text-sm">${{ product.price?.toLocaleString() }}</div>
                    <div v-if="product.originalPrice" class="text-[10px] text-slate-500 line-through">${{ product.originalPrice?.toLocaleString() }}</div>
                  </td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                      :class="{
                        'bg-emerald-950 text-emerald-400 border border-emerald-800': product.stock > 5,
                        'bg-amber-950 text-amber-400 border border-amber-800': product.stock > 0 && product.stock <= 5,
                        'bg-red-950 text-red-400 border border-red-800': product.stock === 0,
                      }">
                      {{ product.stock }} {{ langStore.t('admin.units') }}
                    </span>
                  </td>
                  <td class="p-3.5">
                    <div class="flex items-center gap-1">
                      <button @click="adjustStock(product, -1)" class="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-bold">-1</button>
                      <button @click="adjustStock(product, 1)" class="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-bold">+1</button>
                      <button @click="adjustStock(product, 5)" class="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-lg text-emerald-300 font-bold">+5</button>
                    </div>
                  </td>
                  <td class="p-3.5">
                    <span v-if="product.isFeatured" class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">{{ langStore.t('admin.yes') }}</span>
                    <span v-else class="text-slate-500 text-[11px]">{{ langStore.t('admin.no') }}</span>
                  </td>
                  <td class="p-3.5 text-right space-x-2">
                    <button @click="openEditProductModal(product)" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800" title="Edit Product">
                      <Edit3 class="w-3.5 h-3.5" />
                    </button>
                    <button @click="deleteProduct(product.id, product.name)" class="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/40" title="Delete Product">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. ORDER MANAGEMENT TAB -->
        <div v-if="currentTab === 'orders'" class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <!-- Order Filter Bar -->
          <div class="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div class="relative flex-1 max-w-sm">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                v-model="orderSearch" 
                type="text" 
                :placeholder="langStore.t('admin.searchOrders')" 
                class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500" 
              />
            </div>
            <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button 
                v-for="st in ['All', 'Pending', 'QC Testing', 'Out for Delivery', 'Delivered']"
                :key="st"
                @click="orderFilter = st"
                class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap"
                :class="orderFilter === st ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'"
              >
                {{ st }}
              </button>
            </div>
          </div>

          <!-- Orders Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left text-slate-300">
              <thead class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th class="p-3.5">{{ langStore.t('admin.orderId') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.customerPhone') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.districtCol') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.totalCol') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.paymentCol') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.fulfillmentStatus') }}</th>
                  <th class="p-3.5 text-right">{{ langStore.t('admin.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-slate-900/50">
                  <td class="p-3.5 font-mono font-bold text-emerald-400">{{ order.orderNumber }}</td>
                  <td class="p-3.5">
                    <div class="font-bold text-white">{{ order.shippingAddress?.fullName }}</div>
                    <div class="text-slate-400 text-[11px]">{{ order.shippingAddress?.phone }}</div>
                  </td>
                  <td class="p-3.5 font-semibold text-emerald-400">{{ order.shippingAddress?.district }}</td>
                  <td class="p-3.5 font-extrabold text-white text-sm">${{ order.totalAmount?.toLocaleString() }}</td>
                  <td class="p-3.5">
                    <div class="font-semibold text-white flex items-center gap-1.5">
                      <span>{{ order.paymentMethod }}</span>
                      <span v-if="order.paymentMethod === 'KHQR'" class="px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 text-[9px] font-black tracking-wide">
                        Bakong
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5 mt-1">
                      <select 
                        :value="order.paymentStatus"
                        @change="updatePaymentStatus(order, $event.target.value)"
                        class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-emerald-400 font-mono"
                      >
                        <option value="Pending">{{ langStore.isKhmer ? 'កំពុងរង់ចាំ' : 'Pending' }}</option>
                        <option value="Paid">{{ langStore.isKhmer ? 'បានទូទាត់' : 'Paid' }}</option>
                        <option value="Failed">{{ langStore.isKhmer ? 'បរាជ័យ' : 'Failed' }}</option>
                      </select>
                      <button 
                        v-if="order.paymentMethod === 'KHQR'"
                        @click="verifyBakongSettlement(order)"
                        :disabled="verifyingOrderId === order.id"
                        class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="Auto-verify settlement against NBC ledger"
                      >
                        <RefreshCw v-if="verifyingOrderId === order.id" class="w-3 h-3 animate-spin text-emerald-400" />
                        <ShieldCheck v-else class="w-3 h-3 text-emerald-400" />
                        <span>{{ langStore.t('admin.verifyNbc') }}</span>
                      </button>
                    </div>
                  </td>
                  <td class="p-3.5">
                    <select 
                      :value="order.status"
                      @change="updateOrderStatus(order, $event.target.value)"
                      class="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                    >
                      <option value="Pending">{{ langStore.t('orders.statusPending') }}</option>
                      <option value="QC Testing">{{ langStore.t('orders.statusQc') }}</option>
                      <option value="Out for Delivery">{{ langStore.t('orders.statusOut') }}</option>
                      <option value="Delivered">{{ langStore.t('orders.statusDelivered') }}</option>
                    </select>
                  </td>
                  <td class="p-3.5 text-right space-x-1.5">
                    <button @click="selectedOrder = order" class="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700 cursor-pointer">
                      {{ langStore.t('admin.invoice') }}
                    </button>
                    <button @click="deleteOrder(order.id, order.orderNumber)" class="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 font-bold border border-red-900 cursor-pointer">
                      {{ langStore.t('admin.delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. REPAIR WORKSHOP TAB -->
        <div v-if="currentTab === 'repairs'" class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div class="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div class="relative flex-1 max-w-sm">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input v-model="repairSearch" type="text" :placeholder="langStore.t('admin.searchRepairs')" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500" />
            </div>
            <div class="flex items-center gap-1.5">
              <button 
                v-for="st in ['All', 'Received', 'In Progress', 'Completed']"
                :key="st"
                @click="repairFilter = st"
                class="px-3 py-1.5 rounded-xl font-bold"
                :class="repairFilter === st ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'"
              >
                {{ st }}
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left text-slate-300">
              <thead class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th class="p-3.5">{{ langStore.t('admin.ticketCol') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.customerPhone') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.deviceService') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.reportedSymptoms') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.technicianDiagnosis') }}</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5 text-right">{{ langStore.t('admin.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="repair in filteredRepairs" :key="repair.id" class="hover:bg-slate-900/50">
                  <td class="p-3.5 font-mono font-bold text-emerald-400">{{ repair.ticketNumber }}</td>
                  <td class="p-3.5">
                    <div class="font-bold text-white">{{ repair.customerName }}</div>
                    <div class="text-slate-400 text-[11px]">{{ repair.phone }}</div>
                  </td>
                  <td class="p-3.5 font-semibold text-white">
                    <div>{{ repair.deviceModel }}</div>
                    <div class="text-[11px] text-slate-400">{{ repair.serviceType }}</div>
                  </td>
                  <td class="p-3.5 max-w-xs text-slate-300">{{ repair.issueDescription }}</td>
                  <td class="p-3.5 max-w-xs text-emerald-300">{{ repair.technicianNotes || (langStore.isKhmer ? 'រង់ចាំការត្រួតពិនិត្យ' : 'Pending inspection') }}</td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      :class="{
                        'bg-amber-950 text-amber-400 border border-amber-800': repair.status === 'Received',
                        'bg-blue-950 text-blue-400 border border-blue-800': repair.status === 'In Progress',
                        'bg-emerald-950 text-emerald-400 border border-emerald-800': repair.status === 'Completed',
                      }">
                      {{ langStore.isKhmer ? (repair.status === 'Received' ? langStore.t('services.statusReceived') : repair.status === 'In Progress' ? langStore.t('services.statusInProgress') : langStore.t('services.statusCompleted')) : repair.status }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right space-x-1.5">
                    <button @click="openRepairModal(repair)" class="px-2.5 py-1.5 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold border border-indigo-800 cursor-pointer">
                      {{ langStore.t('admin.diagnosisBtn') }}
                    </button>
                    <button @click="deleteRepairTicket(repair.id, repair.ticketNumber)" class="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 font-bold border border-red-900 cursor-pointer">
                      {{ langStore.t('admin.delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. CUSTOMER ACCOUNTS TAB -->
        <div v-if="currentTab === 'users'" class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-white">{{ langStore.t('admin.customerDirectory') }}</h2>
              <p class="text-xs text-slate-400">{{ langStore.t('admin.customerDirectoryDesc') }}</p>
            </div>
            <div class="relative w-64">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input v-model="userSearch" type="text" :placeholder="langStore.isKhmer ? 'ស្វែងរកតាមឈ្មោះ អ៊ីមែល...' : 'Search by name, email...'" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white" />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left text-slate-300">
              <thead class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th class="p-3.5">{{ langStore.t('admin.userName') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.emailAddress') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.phoneNumber') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.addressDistrict') }}</th>
                  <th class="p-3.5">{{ langStore.t('admin.accessRole') }}</th>
                  <th class="p-3.5 text-right">{{ langStore.t('admin.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-900/50">
                  <td class="p-3.5 font-bold text-white">{{ user.name }}</td>
                  <td class="p-3.5 text-slate-300 font-mono">{{ user.email }}</td>
                  <td class="p-3.5 text-slate-400">{{ user.phone || 'N/A' }}</td>
                  <td class="p-3.5 text-slate-400">{{ user.address || 'Phnom Penh' }}</td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      :class="user.role === 'admin' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right space-x-1.5">
                    <button 
                      @click="toggleUserRole(user)"
                      class="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700"
                      title="Promote or Demote Role"
                    >
                      {{ langStore.t('admin.toggleRole') }}
                    </button>
                    <button 
                      @click="deleteUserAccount(user.id, user.email)"
                      class="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 font-bold border border-red-900 cursor-pointer"
                      title="Delete User"
                    >
                      {{ langStore.t('admin.delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. DATABASE & EXPORTS TAB -->
        <div v-if="currentTab === 'database'" class="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h2 class="text-lg font-bold text-white">{{ langStore.t('admin.databaseTools') }}</h2>
            <p class="text-xs text-slate-400">{{ langStore.t('admin.databaseToolsDesc') }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div class="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Download class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-white text-base">{{ langStore.t('admin.exportCatalog') }}</h3>
              <p class="text-xs text-slate-400">{{ langStore.t('admin.exportCatalogDesc') }}</p>
              <button @click="exportProductsJSON" class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2">
                <Download class="w-4 h-4" />
                <span>{{ langStore.t('admin.exportCatalogBtn') }}</span>
              </button>
            </div>

            <div class="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Download class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-white text-base">{{ langStore.t('admin.exportLedger') }}</h3>
              <p class="text-xs text-slate-400">{{ langStore.t('admin.exportLedgerDesc') }}</p>
              <button @click="exportOrdersCSV" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2">
                <Download class="w-4 h-4" />
                <span>{{ langStore.t('admin.exportLedgerBtn') }}</span>
              </button>
            </div>
          </div>

          <!-- Supabase Cloud Connection Card -->
          <div class="p-6 rounded-2xl bg-slate-950 border border-emerald-900/60 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <h3 class="font-bold text-white text-base">{{ langStore.t('admin.supabaseCloud') }}</h3>
                  <p class="text-xs text-slate-400 font-mono mt-0.5">https://mlifkhiluwdlutmmzrcr.supabase.co</p>
                </div>
              </div>

              <span class="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{{ langStore.t('admin.activeViaEnv') }}</span>
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button 
                @click="testSupabaseConnection"
                :disabled="isTestingSupabase"
                class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-glow transition-all"
              >
                <RefreshCw v-if="isTestingSupabase" class="w-4 h-4 animate-spin" />
                <Sparkles v-else class="w-4 h-4" />
                <span>{{ isTestingSupabase ? langStore.t('common.loading') : langStore.t('admin.testSupabase') }}</span>
              </button>

              <button 
                @click="syncAllToSupabase"
                :disabled="isSyncingSupabase"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow transition-all"
              >
                <RefreshCw v-if="isSyncingSupabase" class="w-4 h-4 animate-spin" />
                <UploadCloud v-else class="w-4 h-4" />
                <span>{{ isSyncingSupabase ? langStore.t('common.loading') : langStore.t('admin.syncAllSupabase') }}</span>
              </button>

              <div v-if="supabaseStatus" class="text-xs font-semibold" :class="supabaseStatus.success ? 'text-emerald-400' : 'text-red-400'">
                {{ supabaseStatus.message || (supabaseStatus.success ? '✓ Supabase Connected' : 'Connection failed') }}
              </div>
              <div v-if="syncSupabaseMessage" class="text-xs font-semibold text-indigo-300">
                {{ syncSupabaseMessage }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- PRODUCT ADD / EDIT MODAL -->
    <div v-if="isProductModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="isProductModalOpen = false"></div>
      <div class="relative w-full max-w-2xl glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-700 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-white">{{ isEditingProduct ? langStore.t('admin.editProductTitle') : langStore.t('admin.addProductTitle') }}</h3>
            <p class="text-xs text-slate-400">{{ langStore.t('admin.modalConfigDesc') }}</p>
          </div>
          <button @click="isProductModalOpen = false" class="text-slate-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="productModalError" class="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ productModalError }}</span>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.productTitle') }} *</label>
            <input v-model="productForm.name" required type="text" placeholder="e.g. Apple iPhone 16 Pro Max (256GB)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Category *</label>
              <select v-model="productForm.category" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white">
                <option value="Smartphones">{{ langStore.t('common.smartphones') }}</option>
                <option value="Tablets">{{ langStore.t('common.tablets') }}</option>
                <option value="Laptops">{{ langStore.t('common.laptops') }}</option>
                <option value="Accessories">{{ langStore.t('common.accessories') }}</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Brand *</label>
              <input v-model="productForm.brand" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.storePrice') }} *</label>
              <input v-model.number="productForm.price" required type="number" step="0.01" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.comparePrice') }}</label>
              <input v-model.number="productForm.originalPrice" type="number" step="0.01" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
            <div>
              <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.currentStock') }} *</label>
              <input v-model.number="productForm.stock" required type="number" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
          </div>

          <!-- Product Image Management (Upload from Device / Folder or Web URL) -->
          <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
              <label class="block font-semibold text-slate-300">
                {{ langStore.isKhmer ? 'រូបភាពទំនិញ' : 'Product Image' }}
              </label>

              <!-- Source Mode Switcher -->
              <div class="flex items-center gap-1 p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
                <button 
                  type="button"
                  @click="imageSourceType = 'device'"
                  class="px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                  :class="imageSourceType === 'device' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
                >
                  <FolderOpen class="w-3.5 h-3.5" />
                  <span>{{ langStore.t('admin.uploadFromDevice') }}</span>
                </button>
                <button 
                  type="button"
                  @click="imageSourceType = 'url'"
                  class="px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                  :class="imageSourceType === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  <span>{{ langStore.t('admin.enterImageUrl') }}</span>
                </button>
              </div>
            </div>

            <!-- TAB 1: UPLOAD FROM DEVICE / FOLDER -->
            <div v-if="imageSourceType === 'device'" class="space-y-3">
              <!-- Hidden Native File Input -->
              <input 
                ref="fileInputRef"
                type="file" 
                accept="image/png,image/jpeg,image/webp,image/gif"
                @change="handleImageFileUpload"
                class="hidden"
              />

              <!-- Drag & Drop / Click Upload Zone -->
              <div 
                @click="triggerFileInput"
                @dragover.prevent="isDraggingOver = true"
                @dragleave.prevent="isDraggingOver = false"
                @drop.prevent="handleDrop"
                class="border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                :class="isDraggingOver 
                  ? 'border-indigo-400 bg-indigo-950/40 shadow-glow' 
                  : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500 hover:bg-slate-900'"
              >
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <UploadCloud v-if="!isUploadingImage" class="w-6 h-6 text-indigo-400" />
                  <RefreshCw v-else class="w-6 h-6 text-indigo-400 animate-spin" />
                </div>

                <div class="space-y-1">
                  <div class="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    <span v-if="!isUploadingImage">{{ langStore.t('admin.browseFiles') }}</span>
                    <span v-else>{{ langStore.t('admin.uploadingImage') }}</span>
                  </div>
                  <p class="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                    {{ langStore.t('admin.dragDropHint') }}
                  </p>
                </div>

                <div class="text-[10px] text-slate-500 font-mono pt-1">
                  {{ langStore.t('admin.supportedFormats') }}
                </div>
              </div>

              <!-- Upload Error Alert -->
              <div v-if="uploadError" class="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-[11px] flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ uploadError }}</span>
              </div>
            </div>

            <!-- TAB 2: IMAGE URL & PRESETS -->
            <div v-else class="space-y-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-400 mb-1">
                  {{ langStore.t('admin.productImageUrl') }}
                </label>
                <input 
                  v-model="productForm.image" 
                  type="text" 
                  placeholder="https://images.unsplash.com/..." 
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono" 
                />
              </div>

              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                <span class="text-[10px] text-slate-400 font-semibold mr-1">{{ langStore.t('admin.quickPresets') }}</span>
                <button 
                  v-for="preset in imagePresets" 
                  :key="preset.label"
                  type="button"
                  @click="productForm.image = preset.url"
                  class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-white text-[10px] text-slate-300 border border-slate-700 transition-all cursor-pointer"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- LIVE CATALOG IMAGE PREVIEW -->
            <div class="pt-3 border-t border-slate-800/80 flex items-center gap-3.5">
              <div class="relative group shrink-0">
                <img 
                  :src="productForm.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'" 
                  alt="Preview" 
                  class="w-16 h-16 object-cover rounded-xl bg-slate-900 border border-slate-700 shadow-md"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-white truncate">
                    {{ uploadedFileName || (productForm.image?.startsWith('/uploads/') ? 'Stored Device Image' : 'Catalog Image Preview') }}
                  </span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                    :class="productForm.image?.startsWith('/uploads/') || productForm.image?.startsWith('data:') 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'bg-blue-950 text-blue-400 border border-blue-800'"
                  >
                    {{ productForm.image?.startsWith('/uploads/') || productForm.image?.startsWith('data:') ? 'DEVICE' : 'WEB URL' }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                  {{ productForm.image }}
                </div>
                <button 
                  v-if="imageSourceType === 'device'"
                  type="button"
                  @click="triggerFileInput"
                  class="mt-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer inline-flex items-center gap-1"
                >
                  <FolderOpen class="w-3 h-3" />
                  <span>{{ langStore.t('admin.changeImage') }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Specs Builder -->
          <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div class="font-semibold text-slate-300">{{ langStore.t('admin.specSheet') }}</div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] text-slate-400">Display</label>
                <input v-model="productForm.specs.display" type="text" placeholder="e.g. 6.9 inch OLED 120Hz" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
              </div>
              <div>
                <label class="text-[11px] text-slate-400">Processor</label>
                <input v-model="productForm.specs.processor" type="text" placeholder="e.g. Apple A18 Pro" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
              </div>
              <div>
                <label class="text-[11px] text-slate-400">Storage</label>
                <input v-model="productForm.specs.storage" type="text" placeholder="e.g. 256GB" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
              </div>
              <div>
                <label class="text-[11px] text-slate-400">Color</label>
                <input v-model="productForm.specs.color" type="text" placeholder="e.g. Desert Titanium" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
              </div>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.warrantyDesc') }}</label>
            <input v-model="productForm.warranty" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white" />
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.productDesc') }}</label>
            <textarea v-model="productForm.description" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"></textarea>
          </div>

          <div class="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <input v-model="productForm.isFeatured" type="checkbox" id="feat" class="w-4 h-4 rounded text-emerald-500" />
            <label for="feat" class="text-slate-300 font-semibold">{{ langStore.t('admin.featureHomepage') }}</label>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button type="button" @click="isProductModalOpen = false" class="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold">
              {{ langStore.t('admin.cancel') }}
            </button>
            <button type="submit" :disabled="isSavingProduct" class="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-glow">
              {{ isSavingProduct ? langStore.t('admin.saving') : (isEditingProduct ? langStore.t('admin.updateProduct') : langStore.t('admin.createProduct')) }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ORDER DETAIL MODAL -->
    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="selectedOrder = null"></div>
      <div class="relative w-full max-w-lg glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-700 shadow-2xl z-10 space-y-5 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span class="font-mono font-bold text-emerald-400 text-sm">{{ selectedOrder.orderNumber }}</span>
            <div class="text-slate-400 text-[11px]">{{ new Date(selectedOrder.createdAt).toLocaleString() }}</div>
          </div>
          <button @click="selectedOrder = null" class="text-slate-400 hover:text-white"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div class="font-bold text-white">{{ selectedOrder.shippingAddress?.fullName }} ({{ selectedOrder.shippingAddress?.phone }})</div>
          <div class="text-slate-300">{{ langStore.t('admin.districtCol') }}: <strong class="text-emerald-400">{{ selectedOrder.shippingAddress?.district }}</strong></div>
          <div class="text-slate-400">{{ selectedOrder.shippingAddress?.addressNote }}</div>
          <div v-if="selectedOrder.notes" class="text-amber-300 pt-1 border-t border-slate-800">{{ langStore.isKhmer ? 'កំណត់ចំណាំ: ' : 'Note: ' }}{{ selectedOrder.notes }}</div>
        </div>

        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div v-for="(it, i) in selectedOrder.items" :key="i" class="flex justify-between items-center p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div class="font-bold text-white">{{ it.name }}</div>
              <div class="text-slate-400">{{ langStore.t('common.quantity') }}: {{ it.quantity }} × ${{ it.price?.toLocaleString() }}</div>
            </div>
            <div class="font-bold text-emerald-400">${{ (it.price * it.quantity)?.toLocaleString() }}</div>
          </div>
        </div>

        <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
          <div class="flex justify-between text-slate-400"><span>{{ langStore.t('cart.subtotal') }}</span><span class="text-white">${{ selectedOrder.subtotal?.toLocaleString() }}</span></div>
          <div class="flex justify-between text-slate-400"><span>{{ langStore.t('cart.deliveryFee') }}</span><span class="text-emerald-400">${{ selectedOrder.deliveryFee?.toFixed(2) }}</span></div>
          <div class="flex justify-between text-white font-extrabold text-sm pt-2 border-t border-slate-800">
            <span>{{ langStore.t('common.total') }}</span>
            <span class="text-emerald-400">${{ selectedOrder.totalAmount?.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>{{ langStore.t('admin.paymentCol') }}: <strong>{{ selectedOrder.paymentMethod }}</strong> ({{ selectedOrder.paymentStatus }})</span>
            <span class="text-emerald-400 font-mono">Ref: {{ selectedOrder.transactionRef || 'N/A' }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="selectedOrder = null" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer">{{ langStore.t('admin.closeInvoice') }}</button>
        </div>
      </div>
    </div>

    <!-- REPAIR WORKSHOP MODAL -->
    <div v-if="isRepairModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="isRepairModalOpen = false"></div>
      <div class="relative w-full max-w-md glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700 shadow-2xl z-10 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-sm font-bold text-white">{{ langStore.t('admin.technicianUpdate') }}</h3>
            <span class="font-mono text-emerald-400">{{ selectedRepair?.ticketNumber }}</span>
          </div>
          <button @click="isRepairModalOpen = false" class="text-slate-400 hover:text-white"><X class="w-4 h-4" /></button>
        </div>

        <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <div class="font-bold text-white">{{ selectedRepair?.customerName }} ({{ selectedRepair?.phone }})</div>
          <div class="text-slate-400 mt-0.5">{{ langStore.isKhmer ? 'ឧបករណ៍: ' : 'Device: ' }}<strong class="text-white">{{ selectedRepair?.deviceModel }}</strong></div>
          <div class="text-slate-300 mt-1">{{ langStore.isKhmer ? 'រោគសញ្ញា: ' : 'Reported: ' }}{{ selectedRepair?.issueDescription }}</div>
        </div>

        <form @submit.prevent="saveRepairStatus" class="space-y-4">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.statusWorkflow') }}</label>
            <select v-model="repairForm.status" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
              <option value="Received">{{ langStore.isKhmer ? 'បានទទួល (រង់ចាំការវិភាគ)' : 'Received (Pending Diagnostics)' }}</option>
              <option value="In Progress">{{ langStore.isKhmer ? 'កំពុងជួសជុល (បានបញ្ជាគ្រឿងបន្លាស់)' : 'In Progress (Parts Reserved / Assembling)' }}</option>
              <option value="Completed">{{ langStore.isKhmer ? 'រួចរាល់ (អាចមកទទួលយកបាន)' : 'Completed (Ready for Customer Pickup)' }}</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.estimatedCost') }}</label>
            <input v-model.number="repairForm.estimatedPrice" type="number" step="0.01" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">{{ langStore.t('admin.technicianDiagnosisNotes') }}</label>
            <textarea v-model="repairForm.technicianNotes" rows="3" :placeholder="langStore.isKhmer ? 'ឧទាហរណ៍៖ ផ្លាស់ប្តូរអេក្រង់ OLED 120Hz គុណភាពដើម' : 'e.g. Replaced cracked OLED screen with OEM 120Hz display.'" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"></textarea>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button type="button" @click="isRepairModalOpen = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer">{{ langStore.t('admin.cancel') }}</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer">{{ langStore.t('admin.updateTicket') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
