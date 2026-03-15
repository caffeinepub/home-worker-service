import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HomeIcon, LogOut } from "lucide-react";
import type { UserProfile } from "../backend.d";

interface AppHeaderProps {
  profile: UserProfile | null;
  onLogout: () => void;
}

export function AppHeader({ profile, onLogout }: AppHeaderProps) {
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const roleLabel = profile?.role
    ? ({ admin: "Admin", customer: "Customer", worker: "Worker" }[
        profile.role
      ] ?? "")
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <HomeIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-700 text-lg text-foreground">
            HomeWorker
          </span>
          {roleLabel && (
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {roleLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden sm:block text-sm text-muted-foreground">
              {profile.name}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                data-ocid="header.button"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              data-ocid="header.dropdown_menu"
            >
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
                data-ocid="header.delete_button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
