'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  BookOpen, 
  User, 
  Sparkles, 
  Music, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  Home as HomeIcon
} from 'lucide-react';
import { DailyContent, Language } from '../types';
import { fetchDailyLiturgy, fetchHymnListByCategory, fetchHymnLyrics } from '../services/geminiService';
import { APP_NAME, LANGUAGES, SECTIONS, START_DATE, END_DATE, DIOCESE_LOGO_URL } from '../constants';
import { format, addDays, subDays, isSameDay, isWithinInterval } from 'date-fns';

// --- Sub-components ---

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#fffcf5] flex flex-col items-center justify-center animate-fade-in">
      <div className="bg-white p-8 rounded-full mb-8 shadow-2xl animate-bounce-slow border-4 border-indigo-50">
        <img 
          src={DIOCESE_LOGO_URL} 
          alt="Diocese Logo" 
          className="h-40 w-40 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} 
        />
        <div className="hidden h-32 w-32 bg-indigo-100 rounded-full items-center justify-center">
             <Sparkles className="h-16 w-16 text-indigo-500" />
        </div>
      </div>
      <h1 className="text-4xl font-display font-bold text-slate-900 tracking-wide mb-3">{APP_NAME}</h1>
      <p className="text-indigo-800 font-serif italic text-lg">In Caritate Per Verbum Per Mariam</p>
    </div>
  );
};

const Navbar = ({ 
  currentSection, 
  setSection
}: { 
  currentSection: string; 
  setSection: (s: string) => void; 
}) => {
  const navItems = [
    { id: SECTIONS.DASHBOARD, label: 'Home', icon: HomeIcon },
    { id: SECTIONS.READINGS, label: 'Readings', icon: BookOpen },
    { id: SECTIONS.SAINT, label: 'Saint', icon: User },
    { id: SECTIONS.REFLECTION, label: 'Reflection', icon: Sparkles },
    { id: SECTIONS.HYMNS, label: 'Hymnal', icon: Music },
    { id: SECTIONS.CONTACT, label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center md:justify-between h-16 md:h-20">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSection(SECTIONS.DASHBOARD)}>
            <img src={DIOCESE_LOGO_URL} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
            <span className="font-display font-bold text-lg md:text-xl text-slate-900 tracking-tight">{APP_NAME}</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    currentSection === item.id
                      ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const MobileBottomNav = ({ 
  currentSection, 
  setSection 
}: { 
  currentSection: string; 
  setSection: (s: string) => void;
}) => {
  const navItems = [
    { id: SECTIONS.DASHBOARD, label: 'Home', icon: HomeIcon },
    { id: SECTIONS.READINGS, label: 'Readings', icon: BookOpen },
    { id: SECTIONS.SAINT, label: 'Saint', icon: User },
    { id: SECTIONS.HYMNS, label: 'Hymns', icon: Music },
    { id: SECTIONS.CONTACT, label: 'Contact', icon: Mail },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-safe z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center px-6 py-2">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-all duration-300 active:scale-90 ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-50 -translate-y-1' : ''}`}>
                 <item.icon 
                    className={`h-6 w-6 transition-all duration-300 ${isActive ? 'stroke-[2.5px] fill-indigo-100' : 'stroke-2'}`} 
                 />
              </div>
              <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const LanguageSelector = ({ current, setLanguage }: { current: Language; setLanguage: (l: Language) => void }) => (
  <div className="flex items-center justify-center space-x-1 bg-white rounded-full p-1 shadow-sm border border-slate-200">
    {LANGUAGES.map((lang) => (
      <button
        key={lang.code}
        onClick={() => setLanguage(lang.code)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          current === lang.code
            ? 'bg-slate-900 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50'
        }`}
      >
        {lang.native}
      </button>
    ))}
  </div>
);

const DateNavigation = ({ date, setDate }: { date: Date; setDate: (d: Date) => void }) => {
  const handlePrev = () => {
    const newDate = subDays(date, 1);
    if (newDate >= START_DATE) setDate(newDate);
  };
  const handleNext = () => {
    const newDate = addDays(date, 1);
    if (newDate <= END_DATE) setDate(newDate);
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 md:px-6 py-3 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
      <button 
        onClick={handlePrev} 
        disabled={isSameDay(date, START_DATE)}
        className="p-2 rounded-full hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 hover:text-indigo-600 active:bg-indigo-100"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      
      <div className="text-center px-4">
        <h2 className="text-lg md:text-xl font-display font-bold text-slate-800">
          {format(date, 'MMM d, yyyy')}
        </h2>
        <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-semibold mt-0.5">{format(date, 'EEEE')}</p>
      </div>
      
      <button 
        onClick={handleNext}
        disabled={isSameDay(date, END_DATE)}
        className="p-2 rounded-full hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 hover:text-indigo-600 active:bg-indigo-100"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    </div>
  );
};

// --- Hymn Section Component ---

const HYMN_CATEGORIES = [
  "Entrance", "Kyrie", "Gloria", "Offertory", "Sanctus", 
  "Communion", "Recessional", "Marian", "Holy Spirit", 
  "Lent", "Advent", "Christmas", "Easter"
];

const HymnSection = ({ language }: { language: Language }) => {
  const [activeCategory, setActiveCategory] = useState<string>("Entrance");
  const [hymnList, setHymnList] = useState<{title: string, id: string}[]>([]);
  const [selectedHymn, setSelectedHymn] = useState<{title: string, lyrics: string} | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  useEffect(() => {
    setLoadingList(true);
    setHymnList([]); 
    fetchHymnListByCategory(activeCategory, language)
      .then(setHymnList)
      .finally(() => setLoadingList(false));
  }, [activeCategory, language]);

  const handleHymnClick = async (title: string) => {
    setLoadingLyrics(true);
    setSelectedHymn(null);
    try {
      const details = await fetchHymnLyrics(title, language);
      setSelectedHymn(details);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const getFontClass = () => {
    if (language === 'hi') return 'font-hindi';
    if (language === 'pa') return 'font-punjabi';
    return 'font-serif';
  };

  if (selectedHymn) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto pb-10">
        <button 
          onClick={() => setSelectedHymn(null)}
          className="mb-6 flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </button>
        <div className="bg-white p-6 md:p-12 rounded-3xl shadow-xl shadow-indigo-100 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Music className="h-32 w-32" />
          </div>
          <h2 className={`text-2xl md:text-4xl font-display font-bold text-slate-900 mb-8 text-center leading-tight ${getFontClass()}`}>
            {selectedHymn.title}
          </h2>
          <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full mb-10"></div>
          <div className={`whitespace-pre-wrap text-lg md:text-xl text-slate-700 leading-relaxed text-center ${getFontClass()}`}>
            {selectedHymn.lyrics}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in min-h-[600px] pb-10">
      {/* Categories Sidebar */}
      <div className="md:w-1/4 flex-shrink-0">
        <h3 className="text-lg font-display font-bold text-slate-900 mb-4 px-2 hidden md:block">Categories</h3>
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-4 md:pb-0 no-scrollbar md:pr-2">
          {HYMN_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSelectedHymn(null); }}
              className={`px-5 py-3 md:px-4 rounded-full md:rounded-xl text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal flex-shrink-0 ${
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 transform scale-105' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hymn List */}
      <div className="flex-grow">
         <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-2xl font-display font-bold text-slate-900">{activeCategory}</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Joyful Lips</span>
         </div>

         {loadingList ? (
           <div className="grid gap-3">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="h-16 bg-white rounded-2xl animate-pulse"></div>
             ))}
           </div>
         ) : (
           <div className="grid gap-3">
             {hymnList.map((hymn, idx) => (
               <button
                 key={idx}
                 onClick={() => handleHymnClick(hymn.title)}
                 className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 active:scale-[0.98] transition-all text-left flex items-center justify-between"
               >
                 <span className={`text-lg font-medium text-slate-800 group-hover:text-indigo-700 ${getFontClass()}`}>{hymn.title}</span>
                 <div className="bg-slate-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                     <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
                 </div>
               </button>
             ))}
             {hymnList.length === 0 && (
               <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                 <Music className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                 <p className="text-slate-500">No hymns found for this category.</p>
               </div>
             )}
           </div>
         )}
         
         {loadingLyrics && (
           <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[60] flex items-center justify-center">
             <div className="bg-white p-6 rounded-2xl shadow-2xl flex items-center space-x-4 animate-bounce-slow">
               <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-600"></div>
               <span className="font-bold text-slate-700">Fetching Lyrics...</span>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentSection, setSection] = useState<string>(SECTIONS.DASHBOARD);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    if (isWithinInterval(today, { start: START_DATE, end: END_DATE })) {
      return today;
    }
    return START_DATE;
  });
  const [language, setLanguage] = useState<Language>('en');
  const [data, setData] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const content = await fetchDailyLiturgy(currentDate, language);
      setData(content);
    } catch (err) {
      setError("Unable to load daily content. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  }, [currentDate, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getFontClass = () => {
    if (language === 'hi') return 'font-hindi';
    if (language === 'pa') return 'font-punjabi';
    return 'font-serif';
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const renderContent = () => {
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
                <div className="h-16 w-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-indigo-200" />
                </div>
            </div>
            <p className="text-slate-400 font-bold tracking-wide text-xs uppercase animate-pulse">Loading Liturgy...</p>
        </div>
    );
    if (error) return (
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center max-w-lg mx-auto mt-10 shadow-xl shadow-red-50">
            <p className="text-red-800 font-bold mb-6 text-lg">{error}</p>
            <button 
            onClick={fetchData}
            className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 font-bold"
            >
            Retry Connection
            </button>
        </div>
    );
    if (!data) return null;

    switch (currentSection) {
      case SECTIONS.DASHBOARD:
        return (
          <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
            {/* Dashboard Header */}
            <div className="flex flex-col-reverse lg:flex-row justify-between items-stretch bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                     <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">{data.season}</span>
                     <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {data.liturgicalColor}
                     </span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold text-slate-900 mb-4 leading-tight">
                    Welcome to Your <br/> <span className="text-indigo-600">Daily Sanctuary</span>
                </h2>
                <p className="text-slate-500 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
                    Join the Diocese in prayer today. Explore the readings, reflect on the Word, and sing with Joyful Lips.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => setSection(SECTIONS.READINGS)} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                        Readings
                    </button>
                    <button onClick={() => setSection(SECTIONS.HYMNS)} className="flex-1 md:flex-none bg-white text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">
                        Hymns
                    </button>
                </div>
              </div>
              <div className="bg-slate-50 lg:w-1/3 flex items-center justify-center p-8 md:p-12 border-l border-slate-100">
                 <img 
                    src={DIOCESE_LOGO_URL} 
                    alt="Diocese Logo" 
                    className="h-32 w-32 md:h-48 md:w-48 object-contain drop-shadow-2xl" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/png?text=Logo'; }}
                 />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
               {/* Saint Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                        <div className="flex-shrink-0">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-indigo-800/50 border border-indigo-700/50 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-inner">
                                {data.saint.imagePrompt ? (
                                    <img src={`https://picsum.photos/seed/${data.saint.name.replace(/\s/g, '')}/200`} alt={data.saint.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <User className="h-10 w-10 text-indigo-300" />
                                )}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2 text-indigo-300">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Saint of the Day</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">{data.saint.name}</h3>
                            <p className="text-indigo-100 leading-relaxed mb-6 opacity-90 text-sm md:text-base line-clamp-3 md:line-clamp-none">{data.saint.bio}</p>
                            <button onClick={() => setSection(SECTIONS.SAINT)} className="text-white border-b border-white/30 pb-1 hover:border-white transition-colors text-xs md:text-sm font-bold tracking-wide">
                                READ FULL BIO
                            </button>
                        </div>
                    </div>
                </div>

                {/* Daily Gospel Snapshot */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gospel</span>
                    </div>
                    <h4 className="text-lg md:text-xl font-display font-bold text-slate-800 mb-2">{data.readings.gospel.reference}</h4>
                    <p className={`text-slate-500 line-clamp-4 leading-relaxed mb-6 flex-grow ${getFontClass()}`}>
                        {data.readings.gospel.text}
                    </p>
                    <button onClick={() => setSection(SECTIONS.READINGS)} className="w-full py-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors active:scale-95">
                        Read All Readings
                    </button>
                </div>
            </div>
            
            {/* Reflection Teaser */}
             <div className="bg-[#fffcf5] border border-amber-100 rounded-3xl p-6 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200"></div>
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-3">Daily Reflection</h3>
                    <h2 className={`text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4 md:mb-6 ${getFontClass()}`}>{data.reflection.title}</h2>
                    <p className={`text-slate-600 text-base md:text-lg leading-relaxed mb-6 md:mb-8 line-clamp-3 md:line-clamp-none ${getFontClass()}`}>
                         {data.reflection.text.substring(0, 200)}...
                    </p>
                    <button onClick={() => setSection(SECTIONS.REFLECTION)} className="inline-flex items-center text-amber-700 font-bold hover:text-amber-900 transition-colors bg-amber-50 px-5 py-2 rounded-full">
                        Continue Reflection <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
             </div>
          </div>
        );

      case SECTIONS.READINGS:
        return (
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 animate-fade-in pb-12">
             <div className="text-center py-4 md:py-8">
                <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2 block">Liturgy of the Word</span>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">Daily Readings</h2>
                <div className="flex justify-center items-center space-x-2 text-slate-500 bg-white inline-flex px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm md:text-lg font-medium">{format(currentDate, 'MMMM d, yyyy')}</span>
                </div>
             </div>

             <div className="space-y-8 md:space-y-12">
                {/* First Reading */}
                <section className="bg-white p-6 md:p-12 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-6 border-b border-slate-100 pb-4 gap-2">
                        <h3 className="text-2xl font-display font-bold text-slate-800">First Reading</h3>
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg text-sm">{data.readings.firstReading.reference}</span>
                    </div>
                    <div className={`prose prose-lg max-w-none text-slate-700 leading-loose ${getFontClass()}`}>
                        {data.readings.firstReading.text.split('\n').map((p, i) => <p key={i} className="mb-4 text-justify">{p}</p>)}
                    </div>
                </section>

                {/* Psalm */}
                <section className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200 text-center">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Responsorial Psalm</h3>
                    <p className="text-slate-900 font-bold text-lg mb-8">{data.readings.psalm.reference}</p>
                    <div className={`text-xl md:text-2xl text-slate-700 font-serif italic leading-relaxed max-w-2xl mx-auto ${getFontClass()}`}>
                        {data.readings.psalm.text.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
                    </div>
                </section>

                {/* Second Reading (Conditional) */}
                {data.readings.secondReading && (
                    <section className="bg-white p-6 md:p-12 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-6 border-b border-slate-100 pb-4 gap-2">
                            <h3 className="text-2xl font-display font-bold text-slate-800">Second Reading</h3>
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg text-sm">{data.readings.secondReading.reference}</span>
                        </div>
                        <div className={`prose prose-lg max-w-none text-slate-700 leading-loose ${getFontClass()}`}>
                            {data.readings.secondReading.text.split('\n').map((p, i) => <p key={i} className="mb-4 text-justify">{p}</p>)}
                        </div>
                    </section>
                )}

                {/* Gospel */}
                <section className="bg-white p-6 md:p-12 rounded-3xl shadow-xl shadow-red-50 border border-red-100 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                     <div className="flex flex-col items-center mb-10 text-center">
                         <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                             <BookOpen className="h-6 w-6" />
                         </div>
                        <h3 className="text-3xl font-display font-bold text-slate-900 mb-2">The Holy Gospel</h3>
                        <p className="text-red-600 font-bold text-lg">{data.readings.gospel.reference}</p>
                     </div>
                    <div className={`prose prose-xl max-w-none text-slate-800 leading-loose ${getFontClass()}`}>
                        {data.readings.gospel.text.split('\n').map((p, i) => <p key={i} className="mb-6 text-justify">{p}</p>)}
                    </div>
                    <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">The Gospel of the Lord</p>
                        <p className="text-slate-900 font-bold mt-2">Praise to you, Lord Jesus Christ</p>
                    </div>
                </section>
             </div>
          </div>
        );

      case SECTIONS.SAINT:
        return (
          <div className="max-w-4xl mx-auto animate-fade-in pb-12">
             <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <div className="h-48 md:h-64 bg-slate-900 relative">
                   <img src={`https://picsum.photos/seed/${data.saint.name.replace(/\s/g, '')}cover/800/300`} alt="Cover" className="w-full h-full object-cover opacity-60" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                   <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                       <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{data.saint.name}</h2>
                       <p className="text-indigo-300 font-bold text-lg">Saint of the Day</p>
                   </div>
                </div>
                <div className="p-6 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8">
                         <div className="w-full md:w-1/3 flex-shrink-0 -mt-16 md:-mt-24 relative z-10 mx-auto md:mx-0 max-w-[200px] md:max-w-none">
                            <div className="aspect-[3/4] rounded-2xl bg-white p-2 shadow-lg rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden">
                                     <img src={`https://picsum.photos/seed/${data.saint.name.replace(/\s/g, '')}/400/600`} alt={data.saint.name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                         </div>
                         <div className={`w-full md:w-2/3 text-slate-700 text-lg leading-loose space-y-6 ${getFontClass()}`}>
                             {data.saint.bio.split('\n').map((p, i) => (
                                 <p key={i} className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left">
                                     {p}
                                 </p>
                             ))}
                         </div>
                    </div>
                </div>
             </div>
          </div>
        );

        case SECTIONS.REFLECTION:
            return (
              <div className="max-w-3xl mx-auto animate-fade-in my-4 md:my-10 pb-12">
                 <div className="bg-[#fffcf5] border border-amber-100 p-8 md:p-16 rounded-3xl shadow-xl shadow-amber-50 relative">
                    <Sparkles className="h-20 w-20 text-amber-100 absolute top-10 left-10 opacity-50" />
                    <div className="relative z-10 text-center">
                        <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-6 block">Spiritual Reflection</span>
                        <h2 className={`text-3xl md:text-5xl font-display font-bold text-slate-900 mb-8 leading-tight ${getFontClass()}`}>
                            {data.reflection.title}
                        </h2>
                        <div className="flex justify-center mb-10">
                            <div className="h-1 w-24 bg-amber-300 rounded-full"></div>
                        </div>
                        <div className={`text-slate-700 leading-9 text-xl space-y-8 text-justify ${getFontClass()}`}>
                             {data.reflection.text.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                        {data.reflection.author && (
                            <div className="mt-12 pt-8 border-t border-amber-200/50 flex justify-end">
                                <p className="text-slate-500 font-serif italic text-lg">- {data.reflection.author}</p>
                            </div>
                        )}
                    </div>
                 </div>
              </div>
            );

        case SECTIONS.HYMNS:
            return <HymnSection language={language} />;

      case SECTIONS.CONTACT:
        return (
          <div className="max-w-2xl mx-auto animate-fade-in my-4 md:my-10 pb-12">
             <div className="bg-white p-6 md:p-12 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Contact the Diocese</h2>
                    <p className="text-slate-500">We would love to hear from you.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent! (Simulation)"); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                            <input type="text" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                            <input type="text" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input type="email" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                        <textarea rows={5} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 active:scale-[0.98]">
                        Send Message
                    </button>
                </form>
                
                <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                    <p className="font-display font-bold text-slate-900 text-lg mb-1">Diocese of Simla-Chandigarh</p>
                    <p className="text-slate-500">Bishop's House, Sector 19-A</p>
                    <p className="text-slate-500 mb-4">Chandigarh, India</p>
                    <a href="mailto:info@simlachandigarh.org" className="text-indigo-600 font-bold hover:underline">info@simlachandigarh.org</a>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-24 md:pb-0">
      <Navbar 
        currentSection={currentSection} 
        setSection={setSection} 
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Controls: Date & Language */}
        {currentSection !== SECTIONS.CONTACT && (
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 sticky top-20 md:static z-40 bg-[#f8f9fa]/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none py-2 md:py-0 transition-all">
                <div className="w-full md:w-auto flex-grow max-w-lg shadow-sm md:shadow-none rounded-2xl">
                    <DateNavigation date={currentDate} setDate={setCurrentDate} />
                </div>
                <div className="flex items-center justify-end">
                    <LanguageSelector current={language} setLanguage={setLanguage} />
                </div>
            </div>
        )}

        {renderContent()}

      </main>

      <MobileBottomNav currentSection={currentSection} setSection={setSection} />

      <footer className="bg-white border-t border-slate-200 py-12 mt-auto hidden md:block">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <img src={DIOCESE_LOGO_URL} alt="Logo" className="h-12 w-12 object-contain mb-4 grayscale opacity-50" />
            <p className="font-display font-bold text-slate-900 text-lg">{APP_NAME}</p>
            <p className="text-slate-500 text-sm mt-2">© {new Date().getFullYear()} Diocese of Simla-Chandigarh. All rights reserved.</p>
            <div className="flex space-x-6 mt-6">
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  );
}