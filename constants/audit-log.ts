// Every action the API records, by subject: the options of the "Target" and
// "Action" filters. Labels live in messages → AuditLog.subjects / .actions;
// a missing label is humanized, so a new action only needs adding here
export const AUDIT_ACTIONS = {
  admin: [
    "created",
    "updated",
    "deleted",
    "access_set",
    "activated",
    "deactivated",
    "two_factor_enabled",
    "two_factor_disabled",
  ],
  role: ["created", "updated", "deleted"],
  country: ["created", "updated", "deleted"],
  category: ["created", "updated", "deleted"],
  category_type: ["created", "updated", "deleted"],
  category_field: ["created", "updated", "deleted"],
  banned_word: ["created", "updated", "deleted"],
  market_rule: ["created", "updated", "deleted"],
  metal_price: ["overridden"],
} as const satisfies Record<string, readonly string[]>;

export type AuditSubject = keyof typeof AUDIT_ACTIONS;

export function isAuditSubject(value: string): value is AuditSubject {
  return Object.hasOwn(AUDIT_ACTIONS, value);
}

// The filter keys kept in the URL, in the order the API takes them
export const AUDIT_FILTER_KEYS = [
  "admin_id",
  "subject_type",
  "action",
  "country_id",
  "from",
  "to",
] as const;
