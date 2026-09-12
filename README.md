# ⬢ DO-MAIN-IT — Real-Time Multiplayer Quiz Platform

> *"Own the question. Rule the room."*

DO-MAIN-IT is a competitive, real-time multiplayer quiz platform built to transcend traditional trivia apps. It introduces the flagship **Domain Battles** hex-grid territory conquest, an **AI Quiz Forge** for instantaneous question generation from any topic or notes, and a server-authoritative **Anti-Cheat Engine**.

---

## ⚡ Key Highlights

### 1. ⬢ Domain Battles (Namesake Feature)
- Hex-grid map conquest layered directly over trivia questions.
- Correct answers grant **Action Points** ($1\text{ AP}$, or $2\text{ AP}$ during **Domain Surge** every 5th round).
- **Claim** adjacent neutral sectors or **Attack** enemy territory.
- Strategic attack resolution: attacker wins if their answer streak $\ge$ defender's streak; otherwise the attack is repelled!
- Wrong answers penalize the player by stripping their weakest perimeter territory.

### 2. ⚡ AI Quiz Forge
- Synthesizes tactical quiz sessions in seconds from any topic prompt or raw study notes.
- Configurable question counts, difficulty, and instant in-app editor/reviewer before game launch.
- Supports custom OpenAI API keys or uses the built-in smart procedural engine offline.

### 3. 🛡️ Server-Authoritative Anti-Cheat
- Exact PRD scoring algorithm:
  $$\text{score} = \text{round}((\text{base} + \text{speed\_bonus}) \times \text{streak\_multiplier} \times \text{powerup\_mod})$$
- Answer keys remain strictly server-side until reveal phase.
- Per-player randomized question & option shuffle seeds.
- Focus/Tab-blur detection (`visibilitychange`) with auto-flagging on host screens.

### 4. 🎨 Neo-Arcade Domain Aesthetic
- **Domain Spectrum**: Deep Obsidian (`#0A0E1A`), Slate (`#141A2E`), Plasma Cyan (`#00E5FF`), Magma Orange (`#FF6B35`), Bio Green (`#39FF88`), Blood Red (`#FF2E63`), Steel (`#2A3350`).
- **Typography**: Space Grotesk (Headings), Inter (Body), JetBrains Mono (Numbers).
- **Audio Synth**: Procedural Web Audio API sound synthesizer with haptic vibration feedback.

---

## 🚀 Quick Start (Web)

### 1. Install & Build
```bash
npm install
npm run build
```

### 2. Start the Game Server
```bash
npm start
```
Open **`http://localhost:3001`** in your browser:
- Switch to **Host Board** to generate a 6-digit PIN and QR code.
- Open another tab or scan the QR code on mobile to join as a **Player**.
- Click **"+ Add Bot"** in the host lobby to spawn simulated AI competitors for instant multiplayer testing!

---

## 📱 Building the Android APK (Capacitor)

The codebase is built with full Capacitor APK compatibility:

```bash
# 1. Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android --save-dev

# 2. Add Android platform & sync build
npx cap add android
npm run build
npx cap sync android

# 3. Open in Android Studio & Build APK
npx cap open android
```
*(In Android Studio: Click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)** to produce `app-debug.apk`)*.
See `README-MOBILE-APK.md` for full mobile instructions.
