/**
 * DoMaiN - Firebase Cloud Sync Engine (Offline-First)
 * Project: domain-520cd
 */

const firebaseConfig = {
  apiKey: "AIzaSyA785--YndFF3HngYqR4L3kJJqw7L48buM",
  authDomain: "domain-520cd.firebaseapp.com",
  projectId: "domain-520cd",
  storageBucket: "domain-520cd.firebasestorage.app",
  messagingSenderId: "970958785147",
  appId: "1:970958785147:web:5a6ea79ee0e39bbd9270de"
};

class CloudSyncManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.user = null;
    this.status = 'offline'; // 'offline' | 'syncing' | 'synced' | 'error'
    this.pendingSync = false;
    this.syncDebounceTimer = null;
  }

  init() {
    // Check if Firebase CDN is available
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not reachable, continuing in pure offline mode.');
      this.setStatus('offline');
      return;
    }

    try {
      if (!firebase.apps.length) {
        this.app = firebase.initializeApp(firebaseConfig);
      } else {
        this.app = firebase.app();
      }

      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Enable offline persistence in Firestore
      this.db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore multi-tab persistence not enabled in this context.');
        } else if (err.code === 'unimplemented') {
          console.warn('Browser does not support Firestore persistence.');
        }
      });

      // Listen for Auth state
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          this.user = user;
          this.updatePlayerIdUI(user.uid);
          // Initial cloud pull & conflict resolution
          this.pullSave();
        } else {
          // Sign in anonymously
          this.auth.signInAnonymously().catch((err) => {
            console.warn('Anonymous sign-in error:', err);
            this.setStatus('offline');
          });
        }
      });

      // Online/Offline detection
      window.addEventListener('online', () => {
        this.setStatus('syncing');
        this.pullSave();
      });

      window.addEventListener('offline', () => {
        this.setStatus('offline');
      });

    } catch (e) {
      console.warn('CloudSync initialization notice:', e);
      this.setStatus('offline');
    }
  }

  setStatus(newStatus) {
    this.status = newStatus;
    const badge = document.getElementById('cloud-status');
    if (!badge) return;

    badge.className = 'cloud-status ' + newStatus;
    if (newStatus === 'synced') {
      badge.innerHTML = '☁️ <span class="cloud-text">Synced</span>';
      badge.title = 'Game progress synced to cloud';
    } else if (newStatus === 'syncing') {
      badge.innerHTML = '🔄 <span class="cloud-text">Syncing...</span>';
      badge.title = 'Syncing with cloud...';
    } else if (newStatus === 'error') {
      badge.innerHTML = '⚠️ <span class="cloud-text">Sync Error</span>';
      badge.title = 'Unable to sync to cloud';
    } else {
      badge.innerHTML = '⚡ <span class="cloud-text">Offline</span>';
      badge.title = 'Running locally (offline mode)';
    }
  }

  updatePlayerIdUI(uid) {
    const el = document.getElementById('player-cloud-id');
    if (el) {
      el.textContent = uid;
    }
  }

  /**
   * Queue a cloud save with debouncing
   */
  pushSave(state) {
    if (!navigator.onLine || !this.user || !this.db) {
      this.pendingSync = true;
      this.setStatus('offline');
      return;
    }

    this.setStatus('syncing');

    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    this.syncDebounceTimer = setTimeout(async () => {
      try {
        const payload = {
          currentCycle: state.currentCycle,
          currentLevel: state.currentLevel,
          totalXP: state.totalXP,
          streak: state.streak,
          domainStats: state.domainStats,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await this.db.collection('saves').doc(this.user.uid).set(payload, { merge: true });
        this.setStatus('synced');
        this.pendingSync = false;
      } catch (err) {
        console.warn('Cloud save error:', err);
        this.setStatus('error');
      }
    }, 600);
  }

  /**
   * Pull save from cloud & resolve conflicts
   */
  async pullSave() {
    if (!this.user || !this.db || !navigator.onLine) return;

    this.setStatus('syncing');
    try {
      const doc = await this.db.collection('saves').doc(this.user.uid).get();

      if (doc.exists) {
        const cloudData = doc.data();
        
        // Conflict resolution: if cloud has more XP or higher cycle, adopt cloud
        const cloudProgress = (cloudData.currentCycle * 100000) + cloudData.totalXP;
        const localProgress = (gameState.currentCycle * 100000) + gameState.totalXP;

        if (cloudProgress > localProgress) {
          gameState.currentCycle = cloudData.currentCycle || gameState.currentCycle;
          gameState.currentLevel = cloudData.currentLevel || gameState.currentLevel;
          gameState.totalXP = cloudData.totalXP || gameState.totalXP;
          gameState.streak = cloudData.streak || gameState.streak;
          if (cloudData.domainStats) {
            gameState.domainStats = {
              logic: { ...gameState.domainStats.logic, ...(cloudData.domainStats.logic || {}) },
              memory: { ...gameState.domainStats.memory, ...(cloudData.domainStats.memory || {}) },
              spatial: { ...gameState.domainStats.spatial, ...(cloudData.domainStats.spatial || {}) }
            };
          }
          saveState(); // Update local storage with cloud data
          if (typeof initCurrentLevel === 'function') {
            initCurrentLevel();
          }
          setFeedback('Cloud Save Restored!', 'success');
        } else if (localProgress > cloudProgress) {
          // Local has more recent progress (e.g. offline play), push to cloud
          this.pushSave(gameState);
        }
        this.setStatus('synced');
      } else {
        // First time cloud user, save local to cloud
        this.pushSave(gameState);
      }
    } catch (err) {
      console.warn('Cloud pull error:', err);
      this.setStatus('offline');
    }
  }

  /**
   * Transfer / Restore save from a different Player ID
   */
  async restoreFromPlayerId(targetUid) {
    if (!this.db) {
      alert('Cloud service not connected. Please check your internet connection.');
      return;
    }

    if (!targetUid || targetUid.trim() === '') {
      alert('Please enter a valid Player ID.');
      return;
    }

    try {
      this.setStatus('syncing');
      const doc = await this.db.collection('saves').doc(targetUid.trim()).get();
      if (!doc.exists) {
        alert('No save profile found for this Player ID.');
        this.setStatus('synced');
        return;
      }

      const cloudData = doc.data();
      gameState.currentCycle = cloudData.currentCycle || 1;
      gameState.currentLevel = cloudData.currentLevel || 1;
      gameState.totalXP = cloudData.totalXP || 0;
      gameState.streak = cloudData.streak || 0;
      if (cloudData.domainStats) {
        gameState.domainStats = cloudData.domainStats;
      }

      saveState();
      if (typeof initCurrentLevel === 'function') {
        initCurrentLevel();
      }

      // Also copy this save to current user's UID
      if (this.user && this.user.uid !== targetUid.trim()) {
        this.pushSave(gameState);
      }

      alert('Save profile successfully restored!');
      this.setStatus('synced');
    } catch (err) {
      console.error('Save restoration error:', err);
      alert('Failed to restore save: ' + err.message);
      this.setStatus('error');
    }
  }
}

// Global cloudSync instance
const cloudSync = new CloudSyncManager();
