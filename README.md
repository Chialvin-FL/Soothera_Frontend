# Soothera Frontend

Soothera is a wellness and salon booking platform built with React Native and Expo. It supports both a native mobile application for Android and iOS, and a web interface for admin management and public-facing landing content. The web build is deployed and hosted on Vercel.

---

## Overview

Soothera connects customers with certified wellness salons and therapists. The platform enables users to browse salons, book treatments, manage appointments, handle payments, and communicate with service providers through an integrated messaging system.

The admin web portal supports user verification, user management, and access to salon analytics. The mobile application is available as a downloadable APK directly from the web landing page.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native via Expo SDK 54 |
| Web Support | React Native Web, Vite |
| Language | TypeScript |
| Styling | NativeWind (Tailwind CSS for React Native) |
| State / Storage | AsyncStorage |
| HTTP Client | Axios |
| Maps | Mapbox |
| Payments | Payment integration via API |
| Web Deployment | Vercel |
| CI/CD | GitHub Actions |

---

## Project Structure

```
soothera/
├── api/                  # Axios client, endpoint definitions, and shared API types
│   └── endpoints/        # Per-domain API modules (auth, bookings, salons, staff, etc.)
├── assets/               # App icons, splash screens, and static images
├── components/           # Shared UI components
├── constants/            # App-wide constants
├── hooks/                # Custom React hooks
├── navigation/           # React Navigation setup and route stacks
├── public/               # Static web assets (includes APK download)
├── screens/
│   ├── native/           # Native mobile screens (Bookings, Home, Messaging, etc.)
│   └── web/              # Web-only screens (Landing, Login, Admin panels)
├── scripts/              # Utility and automation scripts
├── service/              # Business logic services
├── slices/               # State slices (Redux or similar)
├── utils/                # Shared utility functions
├── App.tsx               # Native app entry point
├── App.web.tsx           # Web app entry point
├── app.json              # Expo configuration
├── vercel.json           # Vercel deployment and API proxy configuration
└── vite.config.ts        # Vite configuration for web builds
```

---

## Features

### Mobile Application (Android / iOS)

- Customer registration and login
- Browse salons and view detailed service listings
- Book appointments with date and time selection
- Payment processing with success and failure flows
- Real-time messaging with therapists and salons
- Push notifications for booking updates
- Location-based salon discovery using Mapbox
- Profile management and booking history

### Web Admin Portal

- Admin login and session management
- User identity verification workflows
- User account management
- Salon analytics and reporting
- CSV data export
- Staff access log review

### Web Landing Page

- Public-facing product page
- Direct APK download for the Android application

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or an Android device for native development

### Installation

```bash
git clone https://github.com/your-org/soothera-frontend.git
cd soothera-frontend
npm install
```

### Running the App

**Mobile (Android):**
```bash
npm run android
```

**Mobile (iOS):**
```bash
npm run ios
```

**Start Expo development server:**
```bash
npm start
```

**Web development server:**
```bash
npm run web
```

### Building for Web

```bash
npm run build
```

The output will be placed in the `dist/` directory. This is what Vercel deploys.

---

## Deployment

The web application is deployed to Vercel. The `vercel.json` configuration proxies all `/api/*` requests to the backend API hosted at `fl-soothera-api.somee.com`.

Deployment is automated via the GitHub Actions workflow located at `.github/workflows/deploy.yml` and triggers on pushes to the main branch.

---

## Environment Configuration

The following values are configured in `env.ts`:

| Key | Description |
|---|---|
| `STORAGE_KEYS` | AsyncStorage key constants for user data, auth tokens, and app settings |
| `MAPBOX_TOKEN` | Mapbox public access token for map rendering |

Backend API base URL configuration is managed in `api/config.ts`.

---

## Code Quality

```bash
# Lint and check formatting
npm run lint

# Auto-fix lint and formatting issues
npm run format
```

The project uses ESLint with the Expo config and Prettier with the Tailwind CSS plugin.

---

## Backend

The Soothera backend API is a separate repository. The frontend communicates with it exclusively through the Axios client configured in `api/axiosClient.ts`. All API calls are organized by domain under `api/endpoints/`.

- Authentication: `apiAuth.ts`
- Bookings: `apiBooking.ts`
- Salons: `apiSalonEstablishment.ts`
- Services: `apiService.ts`
- Staff: `apiStaff.ts`
- Users: `apiUser.ts`
- Messaging: `apiMessage.ts`
- Payments: `apiPayment.ts`
- Identity Verification: `apiIdVerification.ts`
- Document Upload: `apiDocumentUpload.ts`

---

## License

This project is private. All rights reserved. Copyright 2026 Soothera.
