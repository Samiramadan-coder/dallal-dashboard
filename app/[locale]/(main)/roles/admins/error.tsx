"use client";

import ErrorState from "@/components/reusable/error-state";

export default function AdminsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorState error={error} retry={unstable_retry} />;
}
