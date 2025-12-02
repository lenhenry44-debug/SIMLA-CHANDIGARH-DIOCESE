export const APP_NAME = "Simla-Chandigarh Diocese";

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
] as const;

export const START_DATE = new Date('2025-11-30');
export const END_DATE = new Date('2027-11-28');

// Replace this URL with the actual hosted URL of your Diocese logo
export const DIOCESE_LOGO_URL = "https://placehold.co/400x400/png?text=Diocese+Logo"; 

export const SECTIONS = {
  DASHBOARD: 'dashboard',
  READINGS: 'readings',
  SAINT: 'saint',
  REFLECTION: 'reflection',
  HYMNS: 'hymns',
  CONTACT: 'contact',
} as const;