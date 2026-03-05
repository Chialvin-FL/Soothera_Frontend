// AsyncStorage Keys
export const STORAGE_KEYS = {
  SOOTHERA_FOLDER_URI: 'soothera_folder_uri',
  INVOICE_REGISTRY: 'soothera_invoice_registry',
  USER_DATA: 'soothera_user_data',
} as const;

export interface UserData {
  email: string;
  name: string;
  role: UserRole;
}

// Mapbox Access Token
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWppd25sIiwiYSI6ImNtMzhsaHFzNTB0dmsyaXE1enV5aXNrbjcifQ.MKG4wR3aMbdde0oisZLH7g';

// Dummy Accounts for Testing
export const DUMMY_ACCOUNTS = [
  {
    email: 'customer@soothera.com',
    password: 'password123',
    role: 'customer',
    name: 'John Customer',
  },
  {
    email: 'admin@soothera.com',
    password: 'admin123',
    role: 'admin',
    name: 'Soothera Admin',
  },
  {
    email: 'therapist@soothera.com',
    password: 'therapist123',
    role: 'therapist',
    name: 'Jane Therapist',
  },
] as const;

export type UserRole = (typeof DUMMY_ACCOUNTS)[number]['role'];
