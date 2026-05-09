import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 and auto-refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  googleLogin: (token: string) => api.post('/auth/google', { token }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  getMe: () => api.get('/auth/me'),
};

// ─── Loyalty ─────────────────────────────────────────────────────────────────
export const loyaltyApi = {
  getWallet: () => api.get('/loyalty/wallet'),
  getTransactions: (page = 1, limit = 10) =>
    api.get(`/loyalty/transactions?page=${page}&limit=${limit}`),
  redeemReward: (rewardId: string) => api.post('/loyalty/redeem', { rewardId }),
  earnPoints: (data: any) => api.post('/loyalty/earn', data),
  getTiers: () => api.get('/loyalty/tiers'),
};

// ─── Rewards ─────────────────────────────────────────────────────────────────
export const rewardsApi = {
  getAll: (merchantId?: string) =>
    api.get(`/rewards${merchantId ? `?merchantId=${merchantId}` : ''}`),
  getOne: (id: string) => api.get(`/rewards/${id}`),
  create: (data: any) => api.post('/rewards', data),
  update: (id: string, data: any) => api.put(`/rewards/${id}`, data),
  delete: (id: string) => api.delete(`/rewards/${id}`),
};

// ─── Promotions ──────────────────────────────────────────────────────────────
export const promotionsApi = {
  getAll: () => api.get('/promotions'),
  getPersonalized: () => api.get('/promotions/my'),
  getMerchant: () => api.get('/promotions/merchant'),
  create: (data: any) => api.post('/promotions', data),
  update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
  delete: (id: string) => api.delete(`/promotions/${id}`),
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const couponsApi = {
  getMyCoupons: () => api.get('/coupons/my'),
  generate: (data: any) => api.post('/coupons/generate', data),
  verify: (code: string) => api.post('/coupons/verify', { code }),
  redeem: (code: string) => api.post(`/coupons/${code}/redeem`),
  getQR: (code: string) => api.get(`/coupons/${code}/qr`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  getMerchantDashboard: () => api.get('/analytics/merchant/dashboard'),
  getSalesReport: (period = 30) => api.get(`/analytics/merchant/sales?period=${period}`),
  getPlatformStats: () => api.get('/analytics/admin/platform'),
  getMerchantsStats: () => api.get('/analytics/admin/merchants'),
};

// ─── Merchants ────────────────────────────────────────────────────────────────
export const merchantsApi = {
  getProfile: () => api.get('/merchants/profile'),
  updateProfile: (data: any) => api.put('/merchants/profile', data),
  getCustomers: (page = 1, search?: string) =>
    api.get(`/merchants/customers?page=${page}${search ? `&search=${search}` : ''}`),
  getAll: (page = 1) => api.get(`/merchants?page=${page}`),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getReferral: () => api.get('/users/referral'),
  getAll: (page = 1) => api.get(`/users?page=${page}`),
};

export default api;
