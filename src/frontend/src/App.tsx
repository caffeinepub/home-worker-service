import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { UserProfile } from "./backend.d";
import { AppHeader } from "./components/AppHeader";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AdminPanel } from "./pages/AdminPanel";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { WorkerDashboard } from "./pages/WorkerDashboard";

type AppView =
  | "landing"
  | "register"
  | "customer"
  | "worker"
  | "admin"
  | "loading";

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [view, setView] = useState<AppView>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const qc = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Determine view after auth/actor state resolves
  useEffect(() => {
    if (isInitializing || actorFetching || !actor) {
      setView("loading");
      return;
    }

    if (!isAuthenticated) {
      setView("landing");
      setProfile(null);
      return;
    }

    // Authenticated — check profile
    actor
      .getCallerUserProfile()
      .then((p) => {
        if (!p) {
          setView("register");
          setProfile(null);
        } else {
          setProfile(p);
          if (p.role === "admin") setView("admin");
          else if (p.role === "worker") setView("worker");
          else setView("customer");
        }
      })
      .catch(() => {
        setView("landing");
      });
  }, [isAuthenticated, actor, actorFetching, isInitializing]);

  const handleLogout = () => {
    clear();
    setProfile(null);
    setView("landing");
    qc.clear();
  };

  const handleRegistered = () => {
    // Refresh profile after registration
    if (!actor) return;
    actor
      .getCallerUserProfile()
      .then((p) => {
        if (p) {
          setProfile(p);
          if (p.role === "admin") setView("admin");
          else if (p.role === "worker") setView("worker");
          else setView("customer");
        }
      })
      .catch(() => {
        setView("landing");
      });
  };

  if (view === "loading") {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="app.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <span className="text-2xl">🏠</span>
          </div>
          <div className="space-y-2 w-48">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (view === "landing") {
    return (
      <>
        <LandingPage onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  if (view === "register") {
    return (
      <>
        <RegisterPage onSuccess={handleRegistered} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader profile={profile} onLogout={handleLogout} />
      <main className="flex-1">
        {view === "customer" && <CustomerDashboard />}
        {view === "worker" && <WorkerDashboard />}
        {view === "admin" && <AdminPanel />}
      </main>
      <footer className="border-t border-border py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
