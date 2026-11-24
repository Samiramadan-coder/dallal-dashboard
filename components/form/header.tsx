import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export default function FormHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <DialogHeader
      className={cn(
        "flex-row items-start justify-between gap-4 border-b border-border px-5 py-4",
        className,
      )}
    >
      <div className="space-y-1.5">
        <DialogTitle
          className="text-lg font-bold tracking-wider"
        >
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-xs">
            {description}
          </DialogDescription>
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
