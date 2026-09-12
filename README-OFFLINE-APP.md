# How to Turn DoMaiNiT into a Standalone Offline App (100% Free)

This guide shows you how to turn this project into a **real, standalone offline application** (not a website/web app) for **Desktop (Windows/Mac/Linux)** and **Mobile (Android)** with **zero cost**.

---

## 🖥️ Method 1: Standalone Windows Desktop App (.exe)

This packages the entire game into a desktop program that you can run offline without any internet connection or web browser.

### Option 1A: Quick Run (Instant Desktop Window)
From your project directory:
```bash
npm install electron --save-dev
npm run app
```
This instantly launches DoMaiNiT in its own dedicated, native desktop application window.

### Option 1B: Build a Standalone Executable (.exe)
To create an installer or a portable `.exe` that you can share or run on any Windows computer without installing anything:

1. Install `electron-builder` (free & open source):
   ```bash
   npm install electron-builder --save-dev
   ```
2. Build the portable Windows executable:
   ```bash
   npx electron-builder --win portable
   ```
3. Look in the newly created `dist/` folder: you will find `DoMaiNiT 1.0.0.exe`. Double-click to run anywhere, completely offline!

---

## 📱 Method 2: Standalone Android App (.apk)

Using **Capacitor** (by Ionic, free open source), you can package this into a native `.apk` that installs directly onto your Android phone and runs 100% offline.

### Prerequisites (All Free):
- [Node.js](https://nodejs.org) (Already installed on your system)
- [Android Studio](https://developer.android.com/studio) (Free download from Google)

### Step-by-Step Instructions:

1. **Install Capacitor in the project folder**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init "DoMaiNiT" "com.domainit.app" --web-dir .
   ```

3. **Add the Android platform**:
   ```bash
   npx cap add android
   ```

4. **Sync the project files**:
   ```bash
   npx cap sync android
   ```

5. **Open in Android Studio & Build APK**:
   ```bash
   npx cap open android
   ```
   - In Android Studio, click **Build** in the top menu -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Once complete, click the **locate** popup link to get your `app-debug.apk`.
   - Transfer this `.apk` file to your phone via USB or WhatsApp/Telegram, tap to install, and play completely offline! No Google Play developer account or fees required.

---

## 🌐 Bonus: Progressive Web App (Offline on Mobile & Desktop)
If you don't want to compile anything right now:
1. Open the app in Chrome or Edge (at your URL or localhost).
2. Click the **Install App** or **Add to Home Screen** icon in the address bar.
3. The app installs as a standalone icon with its own window and cached assets, working offline via Service Worker.
