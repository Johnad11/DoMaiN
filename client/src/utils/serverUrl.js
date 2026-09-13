/**
 * Helper to determine the target game server URL across web and native mobile APK.
 */

export const getServerUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('domainit_server_url');
    if (saved && saved.trim()) return saved.trim();

    if (import.meta.env.VITE_SERVER_URL) {
      return import.meta.env.VITE_SERVER_URL;
    }

    const origin = window.location.origin || '';
    const isCapacitor =
      origin.includes('capacitor://') ||
      origin.startsWith('file://') ||
      origin.startsWith('https://localhost') ||
      (origin.startsWith('http://localhost') && !origin.includes(':3000') && !origin.includes(':3001'));

    if (!isCapacitor && origin.startsWith('http')) {
      return origin;
    }
  }
  return 'https://www.domainit.name.ng';
};

/**
 * Returns true if the client is currently running inside the native Capacitor APK.
 */
export const isNativeApp = () => {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  const origin = window.location.origin || '';
  return (
    origin.includes('capacitor://') ||
    origin.startsWith('file://') ||
    (origin.startsWith('https://localhost') && !origin.includes(':3000') && !origin.includes(':3001'))
  );
};
