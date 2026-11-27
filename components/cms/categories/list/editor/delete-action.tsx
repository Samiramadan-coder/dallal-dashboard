"use client";

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
  remove: (reason: string) => Promise<ActionResult<{ message?: string }>>;
  reload: () => Promise<boolean>;
}) {
  const tCommon = useTranslations("Common");

  return (
    <DeleteBtn
      onDelete={async (reason) => {
        const result = await remove(reason);

        if (!result.ok) {
          toast.error(result.message || tCommon("DeleteFailed"));
          return false;
        }

        toast.success(result.data.message || tCommon("DeletedSuccessfully"));
        await reload();
      }}
    />
  );
}
