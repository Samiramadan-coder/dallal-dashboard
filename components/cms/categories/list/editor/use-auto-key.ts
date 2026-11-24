import { useState } from "react";
import { toKey } from "@/lib/utils";

// A key that fills itself from the English name ("Old coin" → "old_coin")
// until the admin types in the key input themselves
export function useAutoKey(setKey: (key: string) => void) {
  const [edited, setEdited] = useState(false);

  return {
    // Call from the English name input's onChange
    follow: (text: string) => {
      if (!edited) setKey(toKey(text));
    },
    // Call from the key input's onChange
    markEdited: () => setEdited(true),
    // Call after the form is cleared, so the next entry follows again
    reset: () => setEdited(false),
  };
}
