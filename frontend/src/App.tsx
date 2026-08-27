import { AppShell } from "@/components/shell/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  const view = useAuthStore((s) => s.view);

  if (view === "terminal") return <AppShell />;
  if (view === "login") return <LoginPage />;
  return <LandingPage />;
}
