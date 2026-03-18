# Task-O Mobile (Expo)

This folder contains the React Native mobile app for Task-O using Expo Router + Supabase.

## 1) Install

```bash
cd mobile
npm install
```

If you want the exact package install commands used to build this app from scratch:

```bash
npm install expo expo-router react react-native react-dom
npm install @expo/vector-icons expo-constants expo-dev-client expo-font expo-linear-gradient expo-linking expo-status-bar expo-web-browser expo-auth-session
npm install @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens
npm install @react-native-google-signin/google-signin @supabase/supabase-js
npm install -D typescript @types/react
```

Optional global tool for cloud builds:

```bash
npm install -g eas-cli
```

## 2) Environment Variables

Create `mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://rhenlobaptwpmbwaurky.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_publishable_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

## 3) Run Locally

### Expo Go (email/password flow)

```bash
npm run start
```

### Development Client (required for native Google Sign-In)

```bash
npx expo start --dev-client --host lan --port 8090
```

## 4) Native Google OAuth Setup (Android)

Google Sign-In in this app uses native `@react-native-google-signin/google-signin` and exchanges Google ID token with Supabase.

Required Android package name:

```text
com.tasko.mobile
```

### Where to add SHA-1 in Google Cloud

1. Open Google Cloud Console.
2. Go to APIs & Services -> Credentials.
3. Click Create Credentials -> OAuth client ID.
4. Application type = Android.
5. Fill:
	- Package name: `com.tasko.mobile`
	- SHA-1 certificate fingerprint: from EAS credentials.

You also need a Web OAuth client in the same Google Cloud project, and its client ID must be set in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

## 5) EAS Profiles and Builds

This project includes `eas.json` profiles:

- `development`: Development Client APK (internal distribution)
- `preview`: Shareable APK (internal distribution)
- `production`: AAB for store release

### One-time EAS setup

```bash
npm install -g eas-cli
eas login
npm run eas:configure
```

### Build development client APK

```bash
npm run eas:build:dev
```

### Build preview APK

```bash
npm run eas:build:apk
```

### Build production AAB

```bash
npm run eas:build:prod
```

## 6) Retrieve SHA-1 from EAS

```bash
npm run eas:credentials:android
```

Use the `SHA1 Fingerprint` value in Google Cloud Android OAuth client.

## 7) OAuth FAQ

### If Google login already works, do I still need to change anything?

If Google login succeeds in your installed dev build, your current package + SHA-1 + Web client ID mapping is already valid.
No immediate change is required.

### Why does `DEVELOPER_ERROR` happen?

Common causes:

- Android OAuth client package is not `com.tasko.mobile`.
- SHA-1 in Google Cloud does not match signing key used by installed APK.
- Web client ID in `.env` belongs to a different Google Cloud project.
- Old APK installed after credential changes (reinstall latest build).

## Notes

- Keep Google client secret only in Supabase provider settings (server-side), never in mobile env files.
- Keep service-role keys out of mobile files.
- Mobile implementation is isolated under `mobile/`.