import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useWishlistStore = defineStore('wishlist', () => {
  // Load from localStorage on init
  const items = ref(JSON.parse(localStorage.getItem('gzen_wishlist') || '[]'));

  // Persist to localStorage on every change
  const persist = () => {
    localStorage.setItem('gzen_wishlist', JSON.stringify(items.value));
  };

  const count = computed(() => items.value.length);

  const isInWishlist = (productId) => {
    return items.value.some(item => item.id === productId);
  };

  const toggleWishlist = (product) => {
    const index = items.value.findIndex(item => item.id === product.id);
    if (index !== -1) {
      items.value.splice(index, 1);
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        brand: product.brand,
      });
    }
    persist();
  };

  const removeFromWishlist = (productId) => {
    items.value = items.value.filter(item => item.id !== productId);
    persist();
  };

  const clearWishlist = () => {
    items.value = [];
    persist();
  };

  return {
    items,
    count,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };
});
