import { defineStore } from 'pinia';

const DISTRICT_FEES = {
  'Toul Kork': 1.5,
  'BKK1 (Boeung Keng Kang)': 1.5,
  'Daun Penh': 1.5,
  'Chamkar Mon': 1.5,
  'Prampir Makara': 1.5,
  'Sen Sok': 2.0,
  'Chroy Changvar': 2.5,
  'Meanchey': 2.0,
  'Russey Keo': 2.5,
  'Dangkao': 3.0,
  'Other / Express': 3.0,
};

export const useCartStore = defineStore('cart', {
  state: () => {
    let savedItems = [];
    try {
      savedItems = JSON.parse(localStorage.getItem('gzen_cart') || '[]');
    } catch (e) {
      savedItems = [];
    }
    return {
      items: savedItems,
      isCartOpen: false,
      selectedDistrict: 'Toul Kork',
      paymentMethod: 'KHQR', // default preferred in Cambodia
    };
  },

  getters: {
    cartCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => {
      const sum = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return parseFloat(sum.toFixed(2));
    },
    deliveryFee: (state) => {
      if (state.items.length === 0) return 0;
      return DISTRICT_FEES[state.selectedDistrict] || 2.0;
    },
    total: (state) => {
      if (state.items.length === 0) return 0;
      const fee = DISTRICT_FEES[state.selectedDistrict] || 2.0;
      const sum = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return parseFloat((sum + fee).toFixed(2));
    },
    districts: () => Object.keys(DISTRICT_FEES),
  },

  actions: {
    persist() {
      localStorage.setItem('gzen_cart', JSON.stringify(this.items));
    },

    addToCart(product, quantity = 1) {
      const existing = this.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          brand: product.brand,
          stock: product.stock,
          quantity: quantity,
        });
      }
      this.persist();
      this.isCartOpen = true;
    },

    updateQuantity(productId, delta) {
      const item = this.items.find((i) => i.id === productId);
      if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
          this.removeFromCart(productId);
        } else {
          this.persist();
        }
      }
    },

    removeFromCart(productId) {
      this.items = this.items.filter((i) => i.id !== productId);
      this.persist();
    },

    clearCart() {
      this.items = [];
      this.persist();
    },

    openCart() {
      this.isCartOpen = true;
    },

    closeCart() {
      this.isCartOpen = false;
    },

    setDistrict(district) {
      this.selectedDistrict = district;
    },

    setPaymentMethod(method) {
      this.paymentMethod = method;
    }
  }
});
