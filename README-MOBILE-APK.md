# DO-MAIN-IT — Android APK Build Guide (Capacitor)

This guide shows you how to compile DO-MAIN-IT into a native Android `.apk` package using **Capacitor**.

---

## 🛠️ Prerequisites
- **Node.js** (v18+)
- **Android Studio** (Free from Google) with Android SDK and Command-line Tools installed.

---

## 🚀 Step-by-Step APK Generation

### 1. Build the Web Distribution
Compile the optimized client bundle into `client/dist`:
```bash
npm run build
```

### 2. Initialize / Sync Android Platform
If you haven't added the Android platform yet:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev
npx cap add android
```
Then sync the latest web assets:
```bash
npx cap sync android
```

### 3. (Optional) Enable Screenshot Blocking for Anti-Cheat
As specified in PRD Section 4.6 (*"Lockdown Mode requiring mobile app, blocks screenshots on Android via FLAG_SECURE"*):

Open `android/app/src/main/java/com/domainit/app/MainActivity.java` and add:
```java
package com.domainit.app;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Anti-Cheat Lockdown: Prevent screenshots and screen recordings
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
```

### 4. Open in Android Studio & Compile APK
```bash
npx cap open android
```
1. In Android Studio, wait for Gradle sync to complete.
2. In the top menu, go to:
   **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**
3. When the build finishes, click the blue **locate** link in the event notification.
4. Your installable `app-debug.apk` will be in `android/app/build/outputs/apk/debug/`.
5. Transfer this file to any Android device via USB, Drive, Telegram, or WhatsApp and tap to install!
