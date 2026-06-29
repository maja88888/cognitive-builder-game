import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/context/AppContext";
import StartPage from "@/pages/StartPage";
import GameHub from "@/pages/GameHub";
import TeacherDashboard from "@/pages/TeacherDashboard";
import TeacherClassPage from "@/pages/TeacherClassPage";
import OfflineBanner from "@/components/OfflineBanner";
import { useState } from "react";

const queryClient = new QueryClient();

function Footer() {
  return (
    <footer className="cb-footer">
      © 2026 Cognitive Builder&nbsp;&nbsp;|&nbsp;&nbsp;Följer GDPR&nbsp;&nbsp;|&nbsp;&nbsp;Kontakt: info@barnmatte.se
    </footer>
  );
}

type View = "start" | "game" | "teacher";

function AppRouter() {
  const { ageGroup, setAgeGroup } = useApp();
  const [view, setView] = useState<View>(() => {
    return ageGroup ? "game" : "start";
  });

  // /larare path → teacher class management page (no auth needed, no personal data)
  if (window.location.pathname === "/larare") {
    return <TeacherClassPage />;
  }

  const goToTeacher = () => setView("teacher");
  const goToStart = () => {
    setAgeGroup(null as any);
    setView("start");
  };

  if (view === "teacher") {
    return (
      <div className="cb-container">
        <TeacherDashboard onClose={goToStart} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="cb-container">
      {ageGroup && view === "game" ? (
        <GameHub onGoBack={() => { setAgeGroup(null as any); setView("start"); }} />
      ) : (
        <StartPage onTeacherClick={goToTeacher} />
      )}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppRouter />
        <OfflineBanner />
      </AppProvider>
    </QueryClientProvider>
  );
}
