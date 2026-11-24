"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { ActionResult } from "@/lib/api/errors";
import DeleteBtn from "@/components/reusable/delete-btn";

// The shared delete button with its confirmation, for a saved type or
// field: deletes, says how it went, then refreshes the category
export default function DeleteAction({
  remove,
  reload,
}: {
  remove: () => Promise<ActionResult<{ message?: string }>>;
  reload: () => Promise<boolean>;
}) {
  const tCommon = useTranslations("Common");
  const [loading, setLoading] = useState(false);

  return (
    <DeleteBtn
      loading={loading}
      onDelete={async () => {
        setLoading(true);
        const result = await remove();

        if (!result.ok) {
          setLoading(false);
          toast.error(result.message || tCommon("DeleteFailed"));
          return;
        }

        toast.success(result.data.message || tCommon("DeletedSuccessfully"));
        await reload();
        setLoading(false);
      }}
    />
  );
}
