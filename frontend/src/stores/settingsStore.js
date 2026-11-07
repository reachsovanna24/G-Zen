import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    announcementActive: true,
    announcementText: '⚡ Express 1-hour delivery across Toul Kork, BKK1, & Daun Penh | Scan & Pay via KHQR / ABA Bank',
    announcementType: 'emerald',
    storeName: 'G-Zen Phone Store',
    storePhone: '+855 23 999 888 / 012 345 678',
    storeAddress: '#188 Preah Monivong Blvd, Sangkat Boeung Keng Kang 1, Khan Chamkar Mon, Phnom Penh',
    storeHours: 'Mon - Sun: 8:00 AM - 8:30 PM',
    telegramSupport: '@Lee_min_roth',
    freeShippingThreshold: 200,
    bannerNotice: 'Official Apple & Samsung Flagship Retailer in Phnom Penh',
  });

  const loading = ref(false);

  const fetchSettings = async () => {
    try {
      loading.value = true;
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        settings.value = { ...settings.value, ...res.settings };
      }
    } catch (err) {
      console.error('Fetch settings failed:', err);
    } finally {
      loading.value = false;
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      loading.value = true;
      const res = await api.put('/settings', newSettings);
      if (res.success && res.settings) {
        settings.value = { ...settings.value, ...res.settings };
      }
      return res;
    } catch (err) {
      console.error('Update settings failed:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings,
  };
});
