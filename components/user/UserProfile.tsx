"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { NewsletterPanel } from "@/components/newsletter/NewsletterDropdown";

export default function UserProfile() {
  const { user, isAuth, signOut } = useAuth();
  const [showNewsletter, setShowNewsletter] = useState(false);

  if (!isAuth || !user) return null;

  const displayName = user.user_metadata?.full_name ?? user.email ?? "User";
  const avatarUrl: string | undefined = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu onOpenChange={(open) => { if (!open) setShowNewsletter(false); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={36}
              height={36}
              className="rounded-full w-9 h-9 object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={showNewsletter ? "w-80" : "w-56"}
        align="end"
        forceMount
      >
        {showNewsletter ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <button
                onClick={() => setShowNewsletter(false)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <NewsletterPanel onClose={() => setShowNewsletter(false)} />
          </>
        ) : (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = "/account"}>
              👤 My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = "/account/settings"}>
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = "/preferences"}>
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = "/history"}>
              📖 Reading History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = "/saved"}>
              🔖 Saved Articles
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); setShowNewsletter(true); }}
              className="flex items-center justify-between"
            >
              <span>📬 Newsletter</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-600 focus:text-red-600"
            >
              Sign Out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
