import { routing } from "@/i18n/routing";
import messages from "@/messages/en.json";

// en.json is the reference: every t() key is checked against it at build
// time. ar.json must have the same keys: lib/api/messages.ts types both as
// Messages, so a key missing from ar.json fails the build there.
// Keys that come from data (API role names, statuses) go through
// lib/dynamic-messages.ts instead
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
