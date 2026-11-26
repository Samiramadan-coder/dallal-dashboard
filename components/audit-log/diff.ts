// Field-by-field comparison of an audit entry's before/after snapshots

type Snapshot = Record<string, unknown> | null;

export type Primitive = string | number | boolean | null;

export type FieldDiff =
  | {
      kind: "value";
      key: string;
      before: unknown;
      after: unknown;
      changed: boolean;
    }
  | {
      // A list of plain values (permissions, roles, country ids): shown as
      // the items kept, added and removed rather than two whole lists
      kind: "list";
      key: string;
      kept: Primitive[];
      added: Primitive[];
      removed: Primitive[];
      changed: boolean;
    };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Some snapshots hold a translated field as a JSON string ('{"ar":…}') and
// others as an object; parse the string so both sides compare field by field
function normalize(value: unknown): unknown {
  if (typeof value !== "string" || !value.startsWith("{")) return value;
  try {
    const parsed: unknown = JSON.parse(value);
    return isPlainObject(parsed) ? parsed : value;
  } catch {
    return value;
  }
}

function isPrimitiveList(value: unknown): value is Primitive[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item === null || typeof item !== "object")
  );
}

// { label: { ar, en } } → { "label.ar", "label.en" }, one level deep, so a
// translated name shows which language changed
function flatten(snapshot: Snapshot): Map<string, unknown> {
  const fields = new Map<string, unknown>();
  if (!snapshot) return fields;

  for (const [key, raw] of Object.entries(snapshot)) {
    const value = normalize(raw);
    if (isPlainObject(value) && Object.keys(value).length > 0) {
      for (const [inner, innerValue] of Object.entries(value)) {
        fields.set(`${key}.${inner}`, innerValue);
      }
    } else {
      fields.set(key, value);
    }
  }
  return fields;
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Every field in either snapshot, in the order the API sent them (fields
// only in `before` last). A missing snapshot (created / deleted record)
// counts every field as changed
export function diffSnapshots(before: Snapshot, after: Snapshot): FieldDiff[] {
  const old = flatten(before);
  const next = flatten(after);
  const keys = [...new Set([...next.keys(), ...old.keys()])];

  return keys.map((key): FieldDiff => {
    const a = old.get(key);
    const b = next.get(key);

    const listA = a === undefined || a === null ? [] : a;
    const listB = b === undefined || b === null ? [] : b;

    // A list on at least one side; null on both is a plain empty value
    const isList = Array.isArray(a) || Array.isArray(b);

    if (isList && isPrimitiveList(listA) && isPrimitiveList(listB)) {
      // A missing side is an empty list: everything added, or removed
      const added = listB.filter((item) => !listA.includes(item));
      const removed = listA.filter((item) => !listB.includes(item));
      return {
        kind: "list",
        key,
        kept: listB.filter((item) => listA.includes(item)),
        added,
        removed,
        changed: !before || !after || added.length + removed.length > 0,
      };
    }

    return {
      kind: "value",
      key,
      before: a,
      after: b,
      changed: !before || !after || !same(a, b),
    };
  });
}
