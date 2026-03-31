/**
 * API Configuration Switcher
 * 
 * To switch between Local and Deployed API:
 * 1. Toggle `IS_LOCAL` to true/false.
 * 2. If testing ON A PHYSICAL DEVICE (not simulator), 
 *    replace 'localhost' with your machine's IP (e.g., 192.168.x.x).
 */

const IS_LOCAL = true; // <--- TOGGLE THIS

const LOCAL_URL = 'https://localhost:7043';
const DEPLOYED_URL = 'http://fl-soothera-api.somee.com';

export const API_CONFIG = {
  IS_LOCAL,
  // The absolute base URL (used by Vite Proxy and Vercel)
  BASE_URL: IS_LOCAL ? LOCAL_URL : DEPLOYED_URL,
  // The full API endpoint path
  get API_URL() {
    return `${this.BASE_URL}/api`;
  }
};
