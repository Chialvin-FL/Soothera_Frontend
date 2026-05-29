/**
 * API Configuration Switcher
 *
 * To switch between Local and Deployed API:
 * 1. Toggle `IS_LOCAL` to true/false.
 * 2. If testing ON A PHYSICAL DEVICE (not simulator),
 *    replace 'localhost' with your machine's IP (e.g., 192.168.x.x).
 */

const IS_LOCAL = false; // <--- TOGGLE THIS
const USE_WEB_PROXY = false; // <--- TOGGLE THIS for Web Proxy (Vite/Vercel)

const LOCAL_URL = 'https://localhost:7043';
const DEPLOYED_URL = 'http://fl-soothera-api.somee.com';

export const API_CONFIG = {
  IS_LOCAL,
  USE_WEB_PROXY,
  // The absolute base URL (used by Vite Proxy and Vercel)
  BASE_URL: IS_LOCAL ? LOCAL_URL : DEPLOYED_URL,
  // The full API endpoint path
  get API_URL() {
    return `${this.BASE_URL}/api`;
  },
};

export const API_ENDPOINTS = {
  PAYMENT: {
    BASE: '/Payment',
    CREATE: '/Payment/create-payment',
    LIST: '/Payment/get-payments',
    UPDATE: (id: string) => `/Payment/update-payment/${id}`,
    DELETE: (id: string) => `/Payment/delete-payment/${id}`,
  },
} as const;
