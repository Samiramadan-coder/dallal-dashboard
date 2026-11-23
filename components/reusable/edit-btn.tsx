"use client";

import { Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useTranslations } from "next-intl";

export default function EditBtn(props: React.ComponentProps<typeof Button>) {
  const t = useTranslations("Common");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
          {...props}
        >
          <Pencil />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("Edit")}</TooltipContent>
    </Tooltip>
  );
}
