
export const APP_NAME = "Simla-Chandigarh Diocese";

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
] as const;

export const START_DATE = new Date('2025-11-30');
export const END_DATE = new Date('2027-11-28');

// Using the Diocese of Simla-Chandigarh Coat of Arms
export const DIOCESE_LOGO_URL = "https://directory.ucanews.com/assets/images/dioceses/2018/11/14/1542187652.jpg"; 

export const SECTIONS = {
  DASHBOARD: 'dashboard',
  READINGS: 'readings',
  SAINT: 'saint',
  REFLECTION: 'reflection',
  HYMNS: 'hymns',
  CONTACT: 'contact',
} as const;
