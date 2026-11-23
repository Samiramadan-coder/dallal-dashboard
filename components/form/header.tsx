import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useLocale } from "next-intl";
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export default function FormHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const locale = useLocale();

  return (
    <DialogHeader className="flex-row items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div className="space-y-1.5">
        <DialogTitle
          className={cn("text-lg font-bold tracking-wider", {
            "font-playfair": locale === "en",
          })}
        >
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-xs">{description}</DialogDescription>
        )}
      </div>
      <DialogClose asChild>
        <Button variant="ghost" className="-me-2 h-9 w-9 p-0">
          <X className="size-5 text-muted-foreground" />
        </Button>
      </DialogClose>
    </DialogHeader>
  );
}
