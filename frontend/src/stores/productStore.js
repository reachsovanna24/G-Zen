import { defineStore } from 'pinia';
import api from '../services/api';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'default',
    quickViewProduct: null,
  }),

  getters: {
    categories: () => ['All', 'Smartphones', 'Tablets', 'Laptops', 'Accessories'],

    filteredProducts: (state) => {
      let list = [...state.products];

      if (state.selectedCategory && state.selectedCategory !== 'All') {
        list = list.filter((p) => p.category === state.selectedCategory);
      }

      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.brand && p.brand.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
      }

      if (state.sortBy === 'price-asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (state.sortBy === 'price-desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (state.sortBy === 'rating') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      return list;
    },

    featuredProducts: (state) => state.products.filter((p) => p.isFeatured),
    
    hotDeals: (state) => state.products.filter((p) => p.originalPrice && p.originalPrice > p.price),
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/products');
        if (res.success) {
          this.products = res.products;
        }
      } catch (err) {
        this.error = err.message;
        console.error('Fetch products failed:', err);
      } finally {
        this.loading = false;
      }
    },

    openQuickView(product) {
      this.quickViewProduct = product;
    },

    closeQuickView() {
      this.quickViewProduct = null;
    },

    async createProduct(data) {
      const res = await api.post('/products', data);
      if (res.success) {
        this.products.unshift(res.product);
      }
      return res;
    },

    async updateProduct(id, data) {
      const res = await api.put(`/products/${id}`, data);
      if (res.success) {
        const idx = this.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.products[idx] = res.product;
        }
      }
      return res;
    },

    async deleteProduct(id) {
      const res = await api.delete(`/products/${id}`);
      if (res.success) {
        this.products = this.products.filter((p) => p.id !== id);
      }
      return res;
    }
  }
});
