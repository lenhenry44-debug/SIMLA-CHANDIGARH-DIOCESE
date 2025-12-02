import React from 'react';

export type Language = 'en' | 'hi' | 'pa';

export interface DailyContent {
  date: string;
  liturgicalColor: string;
  season: string;
  readings: {
    firstReading: { reference: string; text: string };
    psalm: { reference: string; text: string };
    secondReading?: { reference: string; text: string };
    gospel: { reference: string; text: string };
  };
  saint: {
    name: string;
    bio: string;
    imagePrompt?: string; 
  };
  reflection: {
    title: string;
    text: string;
    author?: string;
  };
}

export interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  category: string;
  language: Language;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}