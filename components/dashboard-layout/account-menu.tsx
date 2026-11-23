"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Repeat } from "lucide-react";

import { logout } from "@/lib/actions/auth";
import type { CurrentAdmin } from "@/types/admin";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// "super_admin" → "Super Admin", for roles without a translation
function humanize(slug: string): string {
  return slug
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AccountMenu({ admin }: { admin: CurrentAdmin }) {
  const t = useTranslations("layout.header");
  const [isSigningOut, startSignOut] = useTransition();

  const role = admin.roles[0];
  const roleLabel = role
    ? t.has(`roles.${role}`)
      ? t(`roles.${role}`)
      : humanize(role)
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-secondary/40"
        aria-label={t("accountMenu")}
      >
        <span className="truncate">
          <span className="font-semibold text-foreground">{admin.name}</span>
          {roleLabel && (
            <>
              <span className="mx-1.5 text-border">/</span>
              {roleLabel}
            </>
          )}
        </span>
        <ChevronDown className="size-3.5 shrink-0" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          disabled={isSigningOut}
          className="text-xs font-semibold"
          onSelect={(event) => {
            // Keep the menu open so the spinner shows until the redirect
            event.preventDefault();
            startSignOut(() => logout());
          }}
        >
          {isSigningOut ? <Spinner /> : <Repeat className="size-3.5" />}
          {t("switchAccount")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
