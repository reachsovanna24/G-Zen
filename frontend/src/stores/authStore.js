import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => {
    let savedUser = null;
    try {
      savedUser = JSON.parse(localStorage.getItem('gzen_user') || 'null');
    } catch (e) {
      savedUser = null;
    }
    return {
      user: savedUser,
      token: localStorage.getItem('gzen_token') || null,
      loading: false,
      error: null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.name || 'Customer',
    userRole: (state) => state.user?.role || 'guest',
  },

  actions: {
    async register(formData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/register', formData);
        if (res.success) {
          this.token = res.token;
          this.user = res.user;
          localStorage.setItem('gzen_token', res.token);
          localStorage.setItem('gzen_user', JSON.stringify(res.user));
          return res;
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/login', { email, password });
        if (res.success) {
          this.token = res.token;
          this.user = res.user;
          localStorage.setItem('gzen_token', res.token);
          localStorage.setItem('gzen_user', JSON.stringify(res.user));
          return res;
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async adminLogin(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post('/auth/admin/login', { email, password });
        if (res.success) {
          if (res.user.role !== 'admin') {
            throw new Error('Access Denied: Administrative privileges required.');
          }
          this.token = res.token;
          this.user = res.user;
          localStorage.setItem('gzen_token', res.token);
          localStorage.setItem('gzen_user', JSON.stringify(res.user));
          return res;
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('gzen_token');
      localStorage.removeItem('gzen_user');
      localStorage.removeItem('gzen_role_view');
    },

    async checkAuth() {
      if (!this.token) return;
      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          this.user = res.user;
          localStorage.setItem('gzen_user', JSON.stringify(res.user));
        }
      } catch (err) {
        this.logout();
      }
    }
  }
});
