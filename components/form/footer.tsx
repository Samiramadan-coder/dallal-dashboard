import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Spinner } from "../ui/spinner";

export default function FormFooter({
  form,
  loading,
  className,
}: {
  form: React.RefObject<HTMLFormElement | null>;
  loading?: boolean;
  className?: string;
}) {
  const t = useTranslations("Common");

  return (
    <DialogFooter
      className={cn(
        "mx-0 mb-0 flex-row gap-2 rounded-b-xl border-t border-border bg-card px-5 py-3",
        className,
      )}
    >
      <DialogClose asChild>
        <Button
          type="button"
          variant="destructive"
          className="h-10 flex-1 text-xs font-normal"
        >
          {t("Cancel")}
        </Button>
      </DialogClose>
      <Button
        type="submit"
        className="h-10 flex-1 text-xs font-normal"
        onClick={() => form.current?.requestSubmit()}
        disabled={loading}
      >
        {loading ? <Spinner /> : t("Save")}
      </Button>
    </DialogFooter>
  );
}
