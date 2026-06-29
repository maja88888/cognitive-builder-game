import { createContext, useContext, useState, ReactNode } from "react";
import { THEMES, getTheme, type Theme } from "@/lib/themes";

export type AgeGroup = "35" | "67" | "89";
export type Lang = "sv" | "en";

export interface StudentSession {
  id: number;
  studentName: string;
  classCode: string;
  ageGroup: string;
}

interface AppContextType {
  theme: Theme;
  themeId: string;
  setThemeId: (id: string) => void;
  ageGroup: AgeGroup | null;
  setAgeGroup: (ag: AgeGroup | null) => void;
  score: number;
  addScore: (pts: number) => void;
  stickers: number;
  addSticker: () => void;
  personalBest: number | null;
  updatePersonalBest: (secs: number) => void;
  studentSession: StudentSession | null;
  setStudentSession: (s: StudentSession | null) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const AppCtx = createContext<AppContextType>({} as AppContextType);

const THEME_KEY    = "lekis_theme";
const AGE_KEY      = "lekis_age";
const STICKERS_KEY = "lekis_stickers";
const BEST_KEY     = "lekis_best";
const STUDENT_KEY  = "studentSession";
const LANG_KEY     = "cb_lang";

export function AppProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(
    () => localStorage.getItem(THEME_KEY) ?? THEMES[0].id,
  );
  const [ageGroup, setAgeGroupState] = useState<AgeGroup | null>(
    () => (localStorage.getItem(AGE_KEY) as AgeGroup) ?? null,
  );
  const [score, setScore] = useState(0);
  const [stickers, setStickers] = useState<number>(() => {
    const v = localStorage.getItem(STICKERS_KEY);
    return v ? parseInt(v, 10) : 0;
  });
  const [personalBest, setPersonalBest] = useState<number | null>(() => {
    const v = localStorage.getItem(BEST_KEY);
    return v ? parseInt(v, 10) : null;
  });
  const [studentSession, setStudentSessionState] = useState<StudentSession | null>(() => {
    try {
      const raw = localStorage.getItem(STUDENT_KEY);
      return raw ? (JSON.parse(raw) as StudentSession) : null;
    } catch {
      return null;
    }
  });
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(LANG_KEY) as Lang) ?? "sv",
  );

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    localStorage.setItem(THEME_KEY, id);
  };

  const setAgeGroup = (ag: AgeGroup | null) => {
    setAgeGroupState(ag);
    if (ag) localStorage.setItem(AGE_KEY, ag);
    else localStorage.removeItem(AGE_KEY);
    setScore(0);
  };

  const addScore = (pts: number) => setScore((s) => s + pts);

  const addSticker = () => {
    setStickers((n) => {
      const next = n + 1;
      localStorage.setItem(STICKERS_KEY, String(next));
      return next;
    });
  };

  const updatePersonalBest = (secs: number) => {
    setPersonalBest((prev) => {
      const best = prev === null || secs < prev ? secs : prev;
      localStorage.setItem(BEST_KEY, String(best));
      return best;
    });
  };

  const setStudentSession = (s: StudentSession | null) => {
    setStudentSessionState(s);
    if (s) localStorage.setItem(STUDENT_KEY, JSON.stringify(s));
    else localStorage.removeItem(STUDENT_KEY);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  };

  return (
    <AppCtx.Provider
      value={{
        theme: getTheme(themeId),
        themeId,
        setThemeId,
        ageGroup,
        setAgeGroup,
        score,
        addScore,
        stickers,
        addSticker,
        personalBest,
        updatePersonalBest,
        studentSession,
        setStudentSession,
        lang,
        setLang,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}
