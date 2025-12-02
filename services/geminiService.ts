import { GoogleGenAI, Type } from "@google/genai";
import { DailyContent, Language } from "../types";

// Helper to get formatted date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getLanguageName = (lang: Language): string => {
  switch (lang) {
    case 'hi': return 'Hindi (Devanagari script)';
    case 'pa': return 'Punjabi (Gurmukhi script)';
    default: return 'English';
  }
};

export const fetchDailyLiturgy = async (date: Date, language: Language): Promise<DailyContent> => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables (NEXT_PUBLIC_API_KEY)");
  }

  const ai = new GoogleGenAI({ apiKey });
  const dateStr = formatDate(date);
  const langStr = getLanguageName(language);

  const bibleVersionInstruction = language === 'en' 
    ? "Use the **Jerusalem Bible** or **RSV-CE** translation (Catholic Edition). Do NOT use Protestant versions like KJV or NIV." 
    : `Use the standard Catholic Bible translation in ${langStr}.`;

  const prompt = `
    You are a Catholic liturgical assistant for the Diocese of Simla-Chandigarh.
    Generate the Mass readings, Saint of the Day, and a short spiritual Reflection for: ${dateStr}.
    Language: ${langStr}.
    
    CRITICAL: ${bibleVersionInstruction}
    Ensure the readings follow the official **Catholic Lectionary** for India for this specific date.
    
    The reflection should be spiritually enriching, suitable for a general audience.
    The Saint bio should be concise but informative.
    
    If the date is a Sunday or Solemnity, include a Second Reading. Otherwise, omit it.
    
    Return the response in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            liturgicalColor: { type: Type.STRING, description: "e.g., Green, Purple, White, Red" },
            season: { type: Type.STRING, description: "e.g., Advent, Lent, Ordinary Time" },
            readings: {
              type: Type.OBJECT,
              properties: {
                firstReading: {
                  type: Type.OBJECT,
                  properties: {
                    reference: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["reference", "text"]
                },
                psalm: {
                  type: Type.OBJECT,
                  properties: {
                    reference: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["reference", "text"]
                },
                secondReading: {
                  type: Type.OBJECT,
                  properties: {
                    reference: { type: Type.STRING },
                    text: { type: Type.STRING }
                  }
                },
                gospel: {
                  type: Type.OBJECT,
                  properties: {
                    reference: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["reference", "text"]
                }
              },
              required: ["firstReading", "psalm", "gospel"]
            },
            saint: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                bio: { type: Type.STRING },
                imagePrompt: { type: Type.STRING, description: "A simple visual description for an AI image generator" }
              },
              required: ["name", "bio"]
            },
            reflection: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING },
                author: { type: Type.STRING }
              },
              required: ["title", "text"]
            }
          },
          required: ["date", "liturgicalColor", "season", "readings", "saint", "reflection"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as DailyContent;
  } catch (error) {
    console.error("Error fetching daily liturgy:", error);
    throw error;
  }
};

export const fetchHymnListByCategory = async (category: string, language: Language): Promise<{title: string, id: string}[]> => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) return [];
    
    const ai = new GoogleGenAI({ apiKey });
    const langStr = getLanguageName(language);
    
    const prompt = `List 15 classic and popular Catholic hymn titles from the 'Joyful Lips' hymn book (or standard ${langStr} hymnals) specifically for the category: '${category}'. Return a JSON array of objects with 'title' and 'id' (generate a simple slug id). Language: ${langStr}.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            id: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
}

export const fetchHymnLyrics = async (title: string, language: Language): Promise<{title: string, lyrics: string}> => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) return { title, lyrics: "Could not load lyrics." };
    
    const ai = new GoogleGenAI({ apiKey });
    const langStr = getLanguageName(language);
    
    const prompt = `Provide the full lyrics (all verses and chorus) for the Catholic hymn titled "${title}" as found in 'Joyful Lips'. Language: ${langStr}. Return JSON.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        lyrics: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || `{"title": "${title}", "lyrics": "Error loading lyrics."}`);
    } catch (e) {
        console.error(e);
        return { title, lyrics: "Error loading lyrics." };
    }
}